# Election Results Export Formatter

Takes the raw `.xlsx` the results website exports (a plain `Summary` +
`Results` sheet, no styling) and produces:

1. **A professionally formatted Excel workbook** — branded header, a
   "Projected Winner" panel, an election-statistics panel, a "Top
   Candidates" table (all driven by live formulas against the `Results`
   sheet), plus a fully styled results table (zebra striping, winner
   highlight, vote-share data bars, bold TOTAL row, frozen header,
   autofilter, print-ready page setup).
2. **A matching one-page PDF report**, generated straight from the
   formatted workbook, suitable as the site's downloadable PDF results
   template.

## Why this exists

The raw export from the site currently ships with 15 leftover
`candidates` / `resuilt` placeholder rows in the `Summary` sheet that
never got filled in — this was a bug in the export template. The
`build_xlsx.py` script here removes that block entirely and replaces it
with the panels described above, all wired to formulas so the numbers
stay correct if the underlying data changes.

## Usage

```bash
pip install -r requirements.txt

# 1. Build the formatted Excel workbook from a raw export
python build_xlsx.py <raw-export.xlsx> [output.xlsx]

# 2. Recalculate formulas (requires LibreOffice on PATH) and check for errors
soffice --headless --convert-to xlsx --calc-recalc <output.xlsx>
# or use Anthropic's recalc helper if available in your environment

# 3. Build the matching PDF from the formatted workbook
python build_pdf.py <output.xlsx> [output.pdf]
```

`sample-raw-export.xlsx` is a real example of the raw export shape (with
placeholder "Candidate xx" test data) — use it to try the pipeline:

```bash
python build_xlsx.py sample-raw-export.xlsx formatted.xlsx
python build_pdf.py formatted.xlsx results.pdf
```

## Input format expected

- **`Summary` sheet**: key/value rows including `Report Title`,
  `Location`, `Generated`, `Registered Voters`, `Rejected Ballots`.
- **`Results` sheet**: header row `Rank | Candidate | Party | Votes |
  Vote Share (%)`, one row per candidate (already sorted by rank), and
  a final `TOTAL` row.

## Integrating into the live export flow

These are standalone Python scripts today. To wire this into the site's
own export flow, either:

- Call them as a subprocess step right after the existing raw `.xlsx` is
  generated, before it's handed to the user, or
- Port the styling logic to the site's own stack (e.g. `exceljs` if the
  export currently happens in Node) using this as the spec/reference.
