import fs from 'fs';

const pdfPath = './src/imports/rptPDListing20260508-1.pdf';
const pdfBuffer = fs.readFileSync(pdfPath);

// Convert to string and look for text patterns
let text = '';
for (let i = 0; i < pdfBuffer.length - 1; i++) {
  const byte = pdfBuffer[i];
  // Only printable ASCII
  if (byte >= 32 && byte <= 126) {
    text += String.fromCharCode(byte);
  } else if (byte === 10 || byte === 13) {
    text += '\n';
  }
}

// Look for patterns that might be location data
const lines = text.split('\n').filter(line => {
  const trimmed = line.trim();
  return trimmed.length > 5 && 
         trimmed.length < 100 &&
         /[A-Z]/.test(trimmed) &&
         (trimmed.includes('Province') || 
          trimmed.includes('District') ||
          trimmed.includes('Ward') ||
          trimmed.includes('PS') ||
          trimmed.includes('Constituency'));
});

// Get unique and filter
const unique = [...new Set(lines)];
console.log('=== EXTRACTED LOCATION DATA ===');
console.log('Total unique lines found:', unique.length);
console.log('\n=== FIRST 200 LINES ===\n');
unique.slice(0, 200).forEach((line, i) => console.log(`${i+1}. ${line}`));
