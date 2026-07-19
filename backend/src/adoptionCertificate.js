/**
 * adoptionCertificate.js
 *
 * Generates the official Build One Zambia "Certificate of Adoption" PDF
 * (candidate adoption design) — issued when a superadmin grants adoption
 * to a member via POST /membership/members/:id/grant-adoption.
 *
 * Same storage pattern as membershipCertificate.js: no filesystem writes,
 * cached as a base64 data URL in the existing kv store.
 *
 * Install: npm install pdf-lib qrcode  (already added for the membership certificate)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { kv } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = path.join(__dirname, '../assets/adoption-certificate-template.png');

const PX_W = 4123, PX_H = 2945, DPI = 200;
const PAGE_W = (PX_W / DPI) * 72;
const PAGE_H = (PX_H / DPI) * 72;

const BLACK = rgb(0.06, 0.06, 0.06);
const ORANGE = rgb(0.91, 0.35, 0.05);
const SIDEBAR_ORANGE = rgb(249 / 255, 102 / 255, 26 / 255);
const WHITE = rgb(1, 1, 1);

// Field positions as fractions of the certificate image, measured against
// the uploaded template. Tune here if the artwork ever changes.
const FIELDS = {
  name:         { x0: 0.108, x1: 0.60,  yTop: 0.300, yBot: 0.395, size: 32 },
  position:     { x0: 0.105, x1: 0.60,  yTop: 0.515, yBot: 0.550, size: 22 },
  issued:       { x0: 0.105, x1: 0.62,  yTop: 0.682, yBot: 0.714, size: 16 },
  sideCertNo:   { x0: 0.735, x1: 0.925, yTop: 0.667, yBot: 0.690, size: 15 },
  sidePosition: { x0: 0.735, x1: 0.925, yTop: 0.732, yBot: 0.756, size: 14 },
  sideConst:    { x0: 0.735, x1: 0.925, yTop: 0.799, yBot: 0.821, size: 13 },
  sideDate:     { x0: 0.735, x1: 0.925, yTop: 0.868, yBot: 0.890, size: 14 },
};
const CONST_LINE = { x0: 0.105, x1: 0.62, yTop: 0.558, yBot: 0.596, size: 16 };
const QR_BOX = { cx: 0.83, cy: 0.925, size: 65 };

function toPts(f) {
  return { x0: f.x0 * PAGE_W, x1: f.x1 * PAGE_W, y0: PAGE_H - f.yBot * PAGE_H, y1: PAGE_H - f.yTop * PAGE_H };
}

/** Shrinks font size (down to a floor) so text fits the box width — protects against long names/positions. */
function fitSize(font, text, maxWidth, startSize, minSize = 9) {
  let size = startSize;
  while (size > minSize && font.widthOfTextAtSize(text, size) > maxWidth) size -= 1;
  return size;
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** "18th day of July, 2026" — matches the certificate's printed sentence. */
export function formatIssuedSentence(dateIso) {
  const d = new Date(dateIso);
  const day = ordinal(d.getDate());
  const month = d.toLocaleString('en-US', { month: 'long' });
  return `${day} day of ${month}, ${d.getFullYear()}`;
}

function formatShortDate(dateIso) {
  const d = new Date(dateIso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function renderAdoptionCertificatePdf({ name, position, constituency, certNumber, grantedAtIso, verifyBaseUrl }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const bg = await pdfDoc.embedPng(fs.readFileSync(TEMPLATE_PATH));
  page.drawImage(bg, { x: 0, y: 0, width: PAGE_W, height: PAGE_H });

  function whiteout(f, color = WHITE) {
    const b = toPts(f);
    page.drawRectangle({ x: b.x0, y: b.y0, width: b.x1 - b.x0, height: b.y1 - b.y0, color });
    return b;
  }
  function centeredY(b, size) {
    return b.y0 + (b.y1 - b.y0 - size) / 2 + size * 0.15;
  }

  // NAME
  {
    const f = FIELDS.name, b = whiteout(f);
    const size = fitSize(bold, name, b.x1 - b.x0, f.size);
    page.drawText(name, { x: b.x0, y: centeredY(b, size), size, font: bold, color: BLACK });
  }
  // POSITION (orange bold heading line)
  {
    const f = FIELDS.position, b = whiteout(f);
    const text = position.toUpperCase();
    const size = fitSize(bold, text, b.x1 - b.x0, f.size);
    page.drawText(text, { x: b.x0, y: centeredY(b, size), size, font: bold, color: ORANGE });
  }
  // "in the {CONSTITUENCY} Constituency" — only rendered if a constituency applies (not for presidential adoptions)
  if (constituency) {
    const f = CONST_LINE, b = toPts(f);
    page.drawRectangle({ x: b.x0, y: b.y0, width: b.x1 - b.x0, height: b.y1 - b.y0, color: WHITE });
    const y = centeredY(b, f.size);
    let x = b.x0;
    page.drawText('in the ', { x, y, size: f.size, font: regular, color: BLACK });
    x += regular.widthOfTextAtSize('in the ', f.size);
    page.drawText(constituency, { x, y, size: f.size, font: bold, color: ORANGE });
    x += bold.widthOfTextAtSize(constituency, f.size);
    page.drawText(' Constituency', { x, y, size: f.size, font: regular, color: BLACK });
  }
  // "Issued this {day} day of {month}, {year}."
  {
    const f = FIELDS.issued, b = whiteout(f);
    const text = `Issued this ${formatIssuedSentence(grantedAtIso)}.`;
    const size = fitSize(regular, text, b.x1 - b.x0, f.size);
    page.drawText(text, { x: b.x0, y: centeredY(b, size), size, font: regular, color: BLACK });
  }
  // Sidebar values (white text on the orange panel)
  function sideField(key, text) {
    const f = FIELDS[key], b = whiteout(f, SIDEBAR_ORANGE);
    const size = fitSize(bold, text, b.x1 - b.x0, f.size);
    const tw = bold.widthOfTextAtSize(text, size);
    const x = b.x0 + ((b.x1 - b.x0) - tw) / 2;
    page.drawText(text, { x, y: centeredY(b, size), size, font: bold, color: WHITE });
  }
  sideField('sideCertNo', certNumber);
  sideField('sidePosition', position.toUpperCase());
  sideField('sideConst', constituency || '—');
  sideField('sideDate', formatShortDate(grantedAtIso));

  // QR code -> public verification page
  const verifyUrl = `${verifyBaseUrl.replace(/\/$/, '')}/${encodeURIComponent(certNumber)}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 0, width: 400 });
  const qrImage = await pdfDoc.embedPng(Buffer.from(qrDataUrl.split(',')[1], 'base64'));
  const qrSize = QR_BOX.size, qrCx = QR_BOX.cx * PAGE_W, qrCy = PAGE_H - QR_BOX.cy * PAGE_H, pad = 5;
  page.drawRectangle({ x: qrCx - qrSize / 2 - pad, y: qrCy - qrSize / 2 - pad, width: qrSize + pad * 2, height: qrSize + pad * 2, color: WHITE });
  page.drawImage(qrImage, { x: qrCx - qrSize / 2, y: qrCy - qrSize / 2, width: qrSize, height: qrSize });

  return Buffer.from(await pdfDoc.save());
}

/**
 * Returns a `data:application/pdf;base64,...` URL for this member's
 * adoption certificate, generating it once and caching thereafter.
 */
export async function getOrCreateAdoptionCertificatePdf(member, verifyBaseUrl) {
  const cacheKey = `boz:membership:adopt-cert-pdf:${member.id}`;
  const cached = kv.get(cacheKey);
  if (cached && cached.certNumber === member.adoptionCertNumber) return cached.dataUrl;

  const pdfBytes = await renderAdoptionCertificatePdf({
    name: `${member.firstName || ''} ${member.lastName || ''}`.trim(),
    position: member.electionPosition || 'Candidate',
    constituency: member.adoptionConstituency || member.adoptionWard || '',
    certNumber: member.adoptionCertNumber,
    grantedAtIso: member.adoptionGrantedAt || new Date().toISOString(),
    verifyBaseUrl,
  });
  const dataUrl = `data:application/pdf;base64,${pdfBytes.toString('base64')}`;
  kv.set(cacheKey, { certNumber: member.adoptionCertNumber, dataUrl });
  return dataUrl;
}
