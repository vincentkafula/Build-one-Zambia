const fs = require('fs');

// Simple PDF text extraction
const pdfPath = './src/imports/rptPDListing20260508-1.pdf';
const pdfBuffer = fs.readFileSync(pdfPath);
const pdfText = pdfBuffer.toString('binary');

// Extract readable text (very basic approach)
const textContent = pdfText
  .split(/\d+ \d+ obj/)
  .filter(section => section.includes('stream'))
  .join('\n');

// Try to find readable patterns
const lines = textContent.match(/[A-Za-z][A-Za-z\s,\-\.0-9]{3,}/g) || [];
const uniqueLines = [...new Set(lines)].filter(line => 
  line.length > 5 && 
  line.length < 100 &&
  /[A-Z]/.test(line)
);

console.log('Found readable text patterns:');
uniqueLines.slice(0, 100).forEach(line => console.log(line));
