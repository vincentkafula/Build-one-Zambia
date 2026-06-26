# PDF Data Extraction Instructions

Since the PDF tools aren't available in this environment, here are alternative ways to extract the polling station data:

## Option 1: Manual Copy-Paste
1. Open the PDF file in a PDF reader
2. Select all content (Ctrl+A / Cmd+A)
3. Copy the text (Ctrl+C / Cmd+C)
4. Paste it into a text file and share it

## Option 2: Online PDF to Text Converter
1. Visit https://www.ilovepdf.com/pdf_to_text or https://smallpdf.com/pdf-to-text
2. Upload the PDF file
3. Download the converted text file
4. Share the text file content

## Option 3: Use a Local Tool
If you have access to command-line tools:

```bash
# On Mac/Linux with poppler-utils installed:
pdftotext rptPDListing20260508-1.pdf output.txt

# Or with Python and PyPDF2:
python3 -c "
import PyPDF2
with open('rptPDListing20260508-1.pdf', 'rb') as f:
    reader = PyPDF2.PdfReader(f)
    text = ''
    for page in reader.pages:
        text += page.extract_text()
    with open('output.txt', 'w') as out:
        out.write(text)
"
```

## Data Format Expected
The data should follow this hierarchy:
- Province Name
  - District Name
    - Constituency Name
      - Ward Name
        - Polling Station Code - Polling Station Name

Please share the extracted text in any format, and I'll parse it to update the location data.
