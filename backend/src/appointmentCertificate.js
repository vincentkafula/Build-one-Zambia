/**
 * appointmentCertificate.js
 *
 * Generates the official Build One Zambia "Certificate of Appointment" PDF
 * — issued when a superadmin appoints a member to a party office (e.g.
 * District Chairperson) via POST /membership/members/:id/grant-appointment.
 *
 * Same storage pattern as membershipCertificate.js / adoptionCertificate.js:
 * no filesystem writes, cached as a base64 data URL in the kv store.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { kv } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = path.join(__dirname, '../assets/appointment-certificate-template.png');

const PX_W = 4123, PX_H = 2945, DPI = 200;
const PAGE_W = (PX_W / DPI) * 72;
const PAGE_H = (PX_H / DPI) * 72;

const GREEN = rgb(0.04, 0.34, 0.14);
const ORANGE = rgb(0.91, 0.35, 0.05);
const BLACK = rgb(0.06, 0.06, 0.06);
const WHITE = rgb(1, 1, 1);
const SIDEBAR_ORANGE = rgb(249 / 255, 102 / 255, 26 / 255);

// Field positions as fractions of the certificate image, measured against
// the uploaded template. Tune here if the artwork ever changes.
const FIELDS = {
  name:         { x0: 0.10, x1: 0.62, yTop: 0.298, yBot: 0.412, size: 40 },
  position:     { x0: 0.10, x1: 0.62, yTop: 0.458, yBot: 0.502, size: 26 },
  sideApptNo:   { x0: 0.735, x1: 0.925, yTop: 0.653, yBot: 0.668, size: 14 },
  sidePosition: { x0: 0.735, x1: 0.925, yTop: 0.718, yBot: 0.734, size: 13 },
  sideDistrict: { x0: 0.735, x1: 0.925, yTop: 0.781, yBot: 0.797, size: 13 },
  sideDate:     { x0: 0.735, x1: 0.925, yTop: 0.848, yBot: 0.864, size: 13 },
};
const EFFTERM_LINE = { x0: 0.10, x1: 0.62, yTop: 0.690, yBot: 0.710, size: 15 };
const QR_BOX = { cx: 0.83, cy: 0.891, size: 40 };

function toPts(f) {
  return { x0: f.x0 * PAGE_W, x1: f.x1 * PAGE_W, y0: PAGE_H - f.yBot * PAGE_H, y1: PAGE_H - f.yTop * PAGE_H };
}
function centeredY(b, size) { return b.y0 + (b.y1 - b.y0 - size) / 2 + size * 0.15; }
function fitSize(font, text, maxWidth, startSize, minSize = 9) {
  let size = startSize;
  while (size > minSize && font.widthOfTextAtSize(text, size) > maxWidth) size -= 1;
  return size;
}

function formatShortDate(dateIso) {
  const d = new Date(dateIso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
}

async function renderAppointmentCertificatePdf({ name, position, district, apptNumber, effectiveDateIso, termYears, verifyBaseUrl }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  const bg = await pdfDoc.embedPng(fs.readFileSync(TEMPLATE_PATH));
  page.drawImage(bg, { x: 0, y: 0, width: PAGE_W, height: PAGE_H });

  function whiteout(f, color = WHITE) {
    const b = toPts(f);
    page.drawRectangle({ x: b.x0, y: b.y0, width: b.x1 - b.x0, height: b.y1 - b.y0, color });
    return b;
  }
  function centeredText(b, text, font, size, color) {
    const tw = font.widthOfTextAtSize(text, size);
    const x = b.x0 + ((b.x1 - b.x0) - tw) / 2;
    page.drawText(text, { x, y: centeredY(b, size), size, font, color });
  }

  const effectiveDate = formatShortDate(effectiveDateIso);

  // NAME (centered, green italic — approximates the template's script font)
  {
    const f = FIELDS.name, b = whiteout(f);
    const size = fitSize(italic, name, b.x1 - b.x0, f.size);
    centeredText(b, name, italic, size, GREEN);
  }
  // POSITION (centered, orange bold)
  {
    const f = FIELDS.position, b = whiteout(f);
    const text = position.toUpperCase();
    const size = fitSize(bold, text, b.x1 - b.x0, f.size);
    centeredText(b, text, bold, size, ORANGE);
  }
  // "EFFECTIVE FROM: {date}   |   TERM: {term} YEARS"
  {
    const f = EFFTERM_LINE, b = toPts(f);
    page.drawRectangle({ x: b.x0, y: b.y0, width: b.x1 - b.x0, height: b.y1 - b.y0, color: WHITE });
    const size = f.size;
    const parts = [
      { t: 'EFFECTIVE FROM: ', font: bold, color: BLACK },
      { t: effectiveDate, font: bold, color: ORANGE },
      { t: '   |   TERM: ', font: bold, color: BLACK },
      { t: `${termYears} YEAR${termYears == 1 ? '' : 'S'}`, font: bold, color: GREEN },
    ];
    const totalWidth = parts.reduce((sum, p) => sum + p.font.widthOfTextAtSize(p.t, size), 0);
    let x = b.x0 + ((b.x1 - b.x0) - totalWidth) / 2;
    const y = centeredY(b, size);
    for (const p of parts) {
      page.drawText(p.t, { x, y, size, font: p.font, color: p.color });
      x += p.font.widthOfTextAtSize(p.t, size);
    }
  }
  // Sidebar values (white text on the orange panel)
  function sideField(key, text) {
    const f = FIELDS[key], b = whiteout(f, SIDEBAR_ORANGE);
    const size = fitSize(bold, text, b.x1 - b.x0, f.size);
    centeredText(b, text, bold, size, WHITE);
  }
  sideField('sideApptNo', apptNumber);
  sideField('sidePosition', position.toUpperCase());
  sideField('sideDistrict', (district || '—').toUpperCase());
  sideField('sideDate', effectiveDate);

  // QR code -> public verification page
  const verifyUrl = `${verifyBaseUrl.replace(/\/$/, '')}/${encodeURIComponent(apptNumber)}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 0, width: 300 });
  const qrImage = await pdfDoc.embedPng(Buffer.from(qrDataUrl.split(',')[1], 'base64'));
  const qrSize = QR_BOX.size, qrCx = QR_BOX.cx * PAGE_W, qrCy = PAGE_H - QR_BOX.cy * PAGE_H, pad = 3;
  page.drawRectangle({ x: qrCx - qrSize / 2 - pad, y: qrCy - qrSize / 2 - pad, width: qrSize + pad * 2, height: qrSize + pad * 2, color: WHITE });
  page.drawImage(qrImage, { x: qrCx - qrSize / 2, y: qrCy - qrSize / 2, width: qrSize, height: qrSize });

  return Buffer.from(await pdfDoc.save());
}

/**
 * Returns a `data:application/pdf;base64,...` URL for this member's
 * appointment certificate, generating it once and caching thereafter.
 */
export async function getOrCreateAppointmentCertificatePdf(member, verifyBaseUrl) {
  const cacheKey = `boz:membership:appt-cert-pdf:${member.id}`;
  const cached = kv.get(cacheKey);
  if (cached && cached.apptNumber === member.appointmentNumber) return cached.dataUrl;

  const pdfBytes = await renderAppointmentCertificatePdf({
    name: `${member.firstName || ''} ${member.lastName || ''}`.trim(),
    position: member.appointmentPosition || 'Party Officer',
    district: member.appointmentDistrict || member.appointmentConstituency || member.appointmentWard || member.appointmentProvince || '',
    apptNumber: member.appointmentNumber,
    effectiveDateIso: member.appointmentEffectiveDate || member.appointmentGrantedAt || new Date().toISOString(),
    termYears: member.appointmentTermYears || 3,
    verifyBaseUrl,
  });
  const dataUrl = `data:application/pdf;base64,${pdfBytes.toString('base64')}`;
  kv.set(cacheKey, { apptNumber: member.appointmentNumber, dataUrl });
  return dataUrl;
}
