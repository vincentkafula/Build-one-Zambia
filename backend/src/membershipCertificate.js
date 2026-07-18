/**
 * membershipCertificate.js
 *
 * Generates the official Build One Zambia membership certificate PDF
 * (your uploaded design) and stores it in the same JSON/kv store the rest
 * of the backend already uses (see db.js) — no filesystem writes, so this
 * survives Railway's ephemeral disk.
 *
 * Install: npm install pdf-lib qrcode
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { kv } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = path.join(__dirname, '../assets/certificate-template.png');

// Template PNG was rendered at 200 DPI from the source design — same DPI
// here maps the field boxes 1:1 onto the PDF page.
const PX_W = 4123, PX_H = 2945, DPI = 200;
const PAGE_W = (PX_W / DPI) * 72;
const PAGE_H = (PX_H / DPI) * 72;

// Field positions as fractions of the certificate image (0,0 = top-left).
// Verified against the uploaded template by rendering a real certificate.
// If you swap in different artwork, regenerate one and nudge these.
const FIELDS = {
  name:         { x0: 0.145, x1: 0.56,  yTop: 0.373, yBot: 0.425, align: 'left',   size: 34 },
  date:         { x0: 0.50,  x1: 0.615, yTop: 0.755, yBot: 0.79,  align: 'center', size: 17 },
  membershipId: { x0: 0.755, x1: 0.895, yTop: 0.748, yBot: 0.785, align: 'center', size: 16 },
};
const QR_BOX = { cx: 0.84, cy: 0.858, size: 100 };

function fieldToPoints(field) {
  return {
    x0: field.x0 * PAGE_W,
    x1: field.x1 * PAGE_W,
    y0: PAGE_H - field.yBot * PAGE_H,
    y1: PAGE_H - field.yTop * PAGE_H,
  };
}

/**
 * BOZ-YYYY-XXXXXX — mirrors the existing adoptionCertNumber convention
 * (`BOZ-ADOPT-${year}-${id.slice(-6).toUpperCase()}` in index.js) so both
 * certificate numbers read consistently. Derived from the member's own
 * unique id, so no counter/collision bookkeeping is needed.
 */
export function generateMembershipNumber(memberId, year = new Date().getFullYear()) {
  return `BOZ-${year}-${memberId.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`;
}

/** HMAC so a certificate can't be forged by guessing/editing a membership number. */
export function buildVerificationHash(membershipNumber, memberId, secret) {
  return crypto.createHmac('sha256', secret).update(`${membershipNumber}:${memberId}`).digest('hex').slice(0, 16);
}

export function verifyHash(membershipNumber, memberId, secret, hash) {
  return buildVerificationHash(membershipNumber, memberId, secret) === hash;
}

async function renderCertificatePdf({ name, membershipNumber, issueDate, verifyBaseUrl }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const bgBytes = fs.readFileSync(TEMPLATE_PATH);
  const bgImage = await pdfDoc.embedPng(bgBytes);
  page.drawImage(bgImage, { x: 0, y: 0, width: PAGE_W, height: PAGE_H });

  function drawField(key, text) {
    const box = fieldToPoints(FIELDS[key]);
    page.drawRectangle({ x: box.x0, y: box.y0, width: box.x1 - box.x0, height: box.y1 - box.y0, color: rgb(1, 1, 1) });
    const size = FIELDS[key].size;
    const textWidth = boldFont.widthOfTextAtSize(text, size);
    const x = FIELDS[key].align === 'center' ? box.x0 + ((box.x1 - box.x0) - textWidth) / 2 : box.x0;
    const y = box.y0 + (box.y1 - box.y0 - size) / 2 + size * 0.15;
    page.drawText(text, { x, y, size, font: boldFont, color: rgb(0.06, 0.06, 0.06) });
  }

  drawField('name', name);
  drawField('date', issueDate);
  drawField('membershipId', membershipNumber);

  const verifyUrl = `${verifyBaseUrl.replace(/\/$/, '')}/${encodeURIComponent(membershipNumber)}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 0, width: 400 });
  const qrImage = await pdfDoc.embedPng(Buffer.from(qrDataUrl.split(',')[1], 'base64'));

  const qrSize = QR_BOX.size, qrCx = QR_BOX.cx * PAGE_W, qrCy = PAGE_H - QR_BOX.cy * PAGE_H, pad = 8;
  page.drawRectangle({ x: qrCx - qrSize / 2 - pad, y: qrCy - qrSize / 2 - pad, width: qrSize + pad * 2, height: qrSize + pad * 2, color: rgb(1, 1, 1) });
  page.drawImage(qrImage, { x: qrCx - qrSize / 2, y: qrCy - qrSize / 2, width: qrSize, height: qrSize });
  page.drawText('Scan to verify', {
    x: qrCx - regularFont.widthOfTextAtSize('Scan to verify', 9) / 2,
    y: qrCy - qrSize / 2 - pad - 12,
    size: 9, font: regularFont, color: rgb(1, 1, 1),
  });

  return Buffer.from(await pdfDoc.save());
}

/**
 * Returns a `data:application/pdf;base64,...` URL for this member's
 * certificate, generating it once and caching it in the kv store
 * thereafter (same storage pattern as press.js's statement files).
 */
export async function getOrCreateCertificatePdf(member, verifyBaseUrl) {
  const cacheKey = `boz:membership:cert-pdf:${member.id}`;
  const cached = kv.get(cacheKey);
  if (cached && cached.membershipNumber === member.membershipNumber) return cached.dataUrl;

  const pdfBytes = await renderCertificatePdf({
    name: `${member.firstName || ''} ${member.lastName || ''}`.trim(),
    membershipNumber: member.membershipNumber,
    issueDate: (member.joinDate || member.createdAt || new Date().toISOString()).slice(0, 10),
    verifyBaseUrl,
  });
  const dataUrl = `data:application/pdf;base64,${pdfBytes.toString('base64')}`;
  kv.set(cacheKey, { membershipNumber: member.membershipNumber, dataUrl });
  return dataUrl;
}
