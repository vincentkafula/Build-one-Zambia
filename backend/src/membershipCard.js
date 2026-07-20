/**
 * membershipCard.js
 *
 * Generates the Build One Zambia membership card PDF (the uploaded card
 * design — front + back on one page) with the member's name, membership
 * ID, join date, membership type, and photo composited into the front
 * face. Same storage pattern as membershipCertificate.js: rendered once
 * and cached in the kv store, no filesystem writes (survives Railway's
 * ephemeral disk).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, rgb } from 'pdf-lib';
import { kv } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = path.join(__dirname, '../assets/membership-card-template.png');

// Template PNG is the card design at its native resolution (front + back
// stacked on one page). DPI chosen just to give the PDF page a sensible
// physical size — see membershipCertificate.js for the same convention.
const PX_W = 1536, PX_H = 1024, DPI = 150;
const PAGE_W = (PX_W / DPI) * 72;
const PAGE_H = (PX_H / DPI) * 72;

// Field positions as fractions of the card image (0,0 = top-left),
// measured directly against the uploaded template. If different artwork
// is swapped in, regenerate a card and nudge these.
const FIELDS = {
  name:           { x0: 0.264, x1: 0.50,  yTop: 0.244, yBot: 0.278, size: 26 },
  membershipId:   { x0: 0.264, x1: 0.42,  yTop: 0.332, yBot: 0.357, size: 15 },
  memberSince:    { x0: 0.265, x1: 0.345, yTop: 0.388, yBot: 0.405, size: 11 },
  membershipType: { x0: 0.456, x1: 0.60,  yTop: 0.388, yBot: 0.405, size: 11 },
};
const PHOTO_BOX = { x0: 0.098, x1: 0.260, yTop: 0.220, yBot: 0.459 };

function fieldToPoints(field) {
  return {
    x0: field.x0 * PAGE_W,
    x1: field.x1 * PAGE_W,
    y0: PAGE_H - field.yBot * PAGE_H,
    y1: PAGE_H - field.yTop * PAGE_H,
  };
}

async function embedPhoto(pdfDoc, dataUrl) {
  const [, meta, b64] = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/) || [];
  if (!b64) return null;
  const bytes = Buffer.from(b64, 'base64');
  try {
    return meta === 'image/png' ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
  } catch {
    return null;
  }
}

function drawPlaceholderSilhouette(page, box) {
  const cx = (box.x0 + box.x1) / 2;
  const w = box.x1 - box.x0, h = box.y1 - box.y0;
  page.drawRectangle({ x: box.x0, y: box.y0, width: w, height: h, color: rgb(0.93, 0.93, 0.93) });
  // simple head + shoulders silhouette, no photo available yet
  page.drawCircle({ x: cx, y: box.y0 + h * 0.62, size: w * 0.16, color: rgb(0.78, 0.78, 0.78) });
  page.drawEllipse({ x: cx, y: box.y0 + h * 0.22, xScale: w * 0.30, yScale: h * 0.22, color: rgb(0.78, 0.78, 0.78) });
}

async function drawPhoto(pdfDoc, page, photoDataUrl) {
  const box = fieldToPoints(PHOTO_BOX);
  page.drawRectangle({ x: box.x0, y: box.y0, width: box.x1 - box.x0, height: box.y1 - box.y0, color: rgb(1, 1, 1) });
  const img = photoDataUrl ? await embedPhoto(pdfDoc, photoDataUrl) : null;
  if (!img) { drawPlaceholderSilhouette(page, box); return; }

  // "contain" fit: scale to fit fully within the box, preserving aspect
  // ratio, centered — avoids needing a clip path for a simple headshot.
  const boxW = box.x1 - box.x0, boxH = box.y1 - box.y0;
  const scale = Math.min(boxW / img.width, boxH / img.height);
  const w = img.width * scale, h = img.height * scale;
  const x = box.x0 + (boxW - w) / 2, y = box.y0 + (boxH - h) / 2;
  page.drawImage(img, { x, y, width: w, height: h });
}

async function renderCardPdf({ name, membershipNumber, memberSince, membershipType, photoDataUrl }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  const { StandardFonts } = await import('pdf-lib');
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const bgBytes = fs.readFileSync(TEMPLATE_PATH);
  const bgImage = await pdfDoc.embedPng(bgBytes);
  page.drawImage(bgImage, { x: 0, y: 0, width: PAGE_W, height: PAGE_H });

  function drawField(key, text) {
    const box = fieldToPoints(FIELDS[key]);
    page.drawRectangle({ x: box.x0, y: box.y0, width: box.x1 - box.x0, height: box.y1 - box.y0, color: rgb(1, 1, 1) });
    const size = FIELDS[key].size;
    const y = box.y0 + (box.y1 - box.y0 - size) / 2 + size * 0.15;
    page.drawText(text, { x: box.x0, y, size, font: boldFont, color: rgb(0.02, 0.35, 0.15) });
  }

  drawField('name', name.toUpperCase());
  drawField('membershipId', membershipNumber);
  drawField('memberSince', memberSince);
  drawField('membershipType', membershipType.toUpperCase());
  await drawPhoto(pdfDoc, page, photoDataUrl);

  return Buffer.from(await pdfDoc.save());
}

/**
 * Returns a `data:application/pdf;base64,...` URL for this member's card,
 * generating it once and caching thereafter. Cache key includes every
 * field that appears on the card (not just membershipNumber, unlike the
 * certificate) since tier/join-date/photo can all change independently.
 */
export async function getOrCreateCardPdf(member) {
  const name = `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.fullName || 'Member';
  const membershipNumber = member.membershipNumber;
  const memberSince = (member.joinDate || member.createdAt || new Date().toISOString()).slice(0, 10);
  const membershipType = member.tier || 'standard';
  const photoDataUrl = member.selfieDataUrl || null;

  const fingerprint = JSON.stringify([name, membershipNumber, memberSince, membershipType, photoDataUrl?.length]);
  const cacheKey = `boz:membership:card-pdf:${member.id}`;
  const cached = kv.get(cacheKey);
  if (cached && cached.fingerprint === fingerprint) return cached.dataUrl;

  const pdfBytes = await renderCardPdf({ name, membershipNumber, memberSince, membershipType, photoDataUrl });
  const dataUrl = `data:application/pdf;base64,${pdfBytes.toString('base64')}`;
  kv.set(cacheKey, { fingerprint, dataUrl });
  return dataUrl;
}
