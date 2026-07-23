# ECZ 2026 Parliamentary Nomination Data

Source: Electoral Commission of Zambia, *"Notice of Validly Nominated Candidates
for the 2026 Parliamentary Elections"* (Public Notice dated 22 July 2026).

- **941 candidates** across **216 constituencies** were validly nominated for
  the National Assembly election to be held **Thursday, 13 August 2026**.
- This folder holds the raw reference transcription of that ECZ notice
  (`ECZ_2026_Nominated_Candidates.md`, `candidates_2026_flat.csv`) for
  auditability.
- The data actually used by the running app is
  `backend/seed/parliamentary_candidates_2026.json`, which is auto-seeded into
  the `candidates` store on server start (see `autoSeedParliamentaryCandidates()`
  in `backend/src/index.js`) with `electionType: "parliament"` and
  `scopeId` set to the 3-digit ECZ constituency number.

## Known data-quality caveats

- A small number of candidate names in **Lusaka → Kabwata (constituency 078,
  Kanyama ward)** and **Lusaka → Munali (constituency 082)** were partially
  obscured by a watermark/stamp in the scanned source PDF and could not be
  fully read. These rows are marked in the CSV/Markdown source and were
  seeded with placeholder text — they should be corrected against the
  official ECZ list before being relied on publicly.
- A few party-symbol descriptions were truncated at the page edge in the
  scanned source (e.g. "A graduation cap, cabbage and two ca...").
- This is a **reference list of all validly nominated candidates from every
  party**, not a list of Build One Zambia's own candidates — please keep it
  clearly labelled as such wherever it's surfaced in the UI, so visitors
  don't mistake other parties' candidates for BOZ's own.
