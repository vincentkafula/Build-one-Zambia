import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { resultsApi, type StationBreakdownRow, type ElectionCategory, type LevelType } from '../lib/api';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => jsPDF;
  }
}

interface RosterCandidate {
  id: string;
  name: string;
  party: string;
}

interface GroupLevel {
  key: keyof StationBreakdownRow;
  label: string;
}

// Grouping levels above Polling Station, narrowing as the selected level
// gets more specific — mirrors the Electoral Commission's own "Registered
// Voters per Polling Station" report structure (Province -> District ->
// Constituency -> Ward -> Polling Station, with a "Totals for X" row
// closing out each group).
const GROUP_LEVELS: Record<string, GroupLevel[]> = {
  national: [
    { key: 'provinceName', label: 'Province' },
    { key: 'districtName', label: 'District' },
    { key: 'constituencyName', label: 'Constituency' },
    { key: 'wardName', label: 'Ward' },
  ],
  province: [
    { key: 'districtName', label: 'District' },
    { key: 'constituencyName', label: 'Constituency' },
    { key: 'wardName', label: 'Ward' },
  ],
  district: [
    { key: 'constituencyName', label: 'Constituency' },
    { key: 'wardName', label: 'Ward' },
  ],
  constituency: [
    { key: 'wardName', label: 'Ward' },
  ],
  ward: [],
  station: [],
};

function formatNum(n: number) {
  return n.toLocaleString('en-US');
}

function rowStats(row: StationBreakdownRow) {
  const validVotes = row.candidateVotes.reduce((s, c) => s + c.votes, 0);
  const totalCast = validVotes + row.rejectedBallots;
  const turnout = row.registeredVoters > 0 ? (totalCast / row.registeredVoters) * 100 : 0;
  return { validVotes, totalCast, turnout };
}

function aggregateStats(rows: StationBreakdownRow[], roster: RosterCandidate[]) {
  const registeredVoters = rows.reduce((s, r) => s + r.registeredVoters, 0);
  const rejectedBallots = rows.reduce((s, r) => s + r.rejectedBallots, 0);
  const validVotes = rows.reduce((s, r) => s + rowStats(r).validVotes, 0);
  const totalCast = validVotes + rejectedBallots;
  const turnout = registeredVoters > 0 ? (totalCast / registeredVoters) * 100 : 0;
  const perCandidate = roster.map(c =>
    rows.reduce((s, r) => s + (r.candidateVotes.find(cv => cv.candidateId === c.id)?.votes ?? 0), 0)
  );
  return { registeredVoters, rejectedBallots, validVotes, turnout, perCandidate };
}

type Block =
  | { kind: 'header'; label: string; depth: number }
  | { kind: 'row'; row: StationBreakdownRow }
  | { kind: 'subtotal'; label: string; depth: number; rows: StationBreakdownRow[] };

// Rows arrive pre-sorted (province -> district -> constituency -> ward ->
// station name) from the backend, so a single pass can detect every group
// boundary: whenever a grouping value changes, close every open subtotal
// from the deepest level up to the change point, then open fresh headers
// back down to the deepest level again.
function buildBlocks(rows: StationBreakdownRow[], groupLevels: GroupLevel[]): Block[] {
  if (groupLevels.length === 0) return rows.map(row => ({ kind: 'row', row } as Block));

  const blocks: Block[] = [];
  const current: (string | null)[] = groupLevels.map(() => null);
  const buffers: StationBreakdownRow[][] = groupLevels.map(() => []);

  const closeLevel = (i: number) => {
    if (current[i] !== null) {
      blocks.push({ kind: 'subtotal', label: `Total for ${groupLevels[i].label}: ${current[i]}`, depth: i, rows: buffers[i] });
    }
    buffers[i] = [];
  };

  for (const row of rows) {
    const values = groupLevels.map(g => String(row[g.key] ?? ''));
    let changeIdx = groupLevels.length;
    for (let i = 0; i < groupLevels.length; i++) {
      if (current[i] !== values[i]) { changeIdx = i; break; }
    }
    if (changeIdx < groupLevels.length) {
      for (let i = groupLevels.length - 1; i >= changeIdx; i--) closeLevel(i);
      for (let i = changeIdx; i < groupLevels.length; i++) {
        current[i] = values[i];
        blocks.push({ kind: 'header', label: `${groupLevels[i].label}: ${values[i]}`, depth: i });
      }
    }
    for (let i = 0; i < groupLevels.length; i++) buffers[i].push(row);
    blocks.push({ kind: 'row', row });
  }
  for (let i = groupLevels.length - 1; i >= 0; i--) closeLevel(i);

  return blocks;
}

function tableColumns(roster: RosterCandidate[]) {
  return [
    'Code', 'Polling Station',
    ...roster.map(c => `${c.name} (${c.party})`),
    'Registered Voters', 'Total Valid Votes', 'Rejected Votes', 'Voter Turnout',
  ];
}

function dataRowCells(row: StationBreakdownRow, roster: RosterCandidate[]): string[] {
  const { validVotes, turnout } = rowStats(row);
  const voteMap = new Map(row.candidateVotes.map(c => [c.candidateId, c.votes]));
  return [
    row.pollingStationId, row.pollingStationName,
    ...roster.map(c => formatNum(voteMap.get(c.id) ?? 0)),
    formatNum(row.registeredVoters), formatNum(validVotes), formatNum(row.rejectedBallots), `${turnout.toFixed(1)}%`,
  ];
}

function subtotalRowCells(label: string, rows: StationBreakdownRow[], roster: RosterCandidate[]): string[] {
  const s = aggregateStats(rows, roster);
  return [
    label, '',
    ...s.perCandidate.map(formatNum),
    formatNum(s.registeredVoters), formatNum(s.validVotes), formatNum(s.rejectedBallots), `${s.turnout.toFixed(1)}%`,
  ];
}

function downloadExcel(rows: StationBreakdownRow[], roster: RosterCandidate[], groupLevels: GroupLevel[], title: string, location: string) {
  const wb = XLSX.utils.book_new();
  const grand = aggregateStats(rows, roster);

  const summaryRows = [
    ['BOZ Election Results', ''],
    ['Report Title', title],
    ['Selected Level', location],
    ['Polling Stations Included', rows.length],
    ['Generated', new Date().toLocaleString()],
    ['', ''],
    ['Registered Voters', grand.registeredVoters],
    ['Total Valid Votes', grand.validVotes],
    ['Rejected Votes', grand.rejectedBallots],
    ['Voter Turnout', `${grand.turnout.toFixed(1)}%`],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 24 }, { wch: 34 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  const headers = tableColumns(roster);
  const blocks = buildBlocks(rows, groupLevels);
  const body: (string | number)[][] = [headers];
  for (const b of blocks) {
    if (b.kind === 'header') body.push([`▸ ${b.label}`]);
    else if (b.kind === 'row') body.push(dataRowCells(b.row, roster));
    else body.push(subtotalRowCells(`  ${b.label}`, b.rows, roster));
  }
  body.push(subtotalRowCells('GRAND TOTAL', rows, roster));

  const wsResults = XLSX.utils.aoa_to_sheet(body);
  wsResults['!cols'] = [
    { wch: 16 }, { wch: 26 },
    ...roster.map(() => ({ wch: 16 })),
    { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, wsResults, 'Results by Polling Station');

  XLSX.writeFile(wb, `presidential-results-${location.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}.xlsx`);
}

function downloadPDF(rows: StationBreakdownRow[], roster: RosterCandidate[], groupLevels: GroupLevel[], title: string, location: string) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 15;

  doc.setFillColor(25, 135, 84);
  doc.rect(0, 0, pageW, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('BOZ — Build One Zambia', pageW / 2, 9, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Official Election Results Report', pageW / 2, 15, { align: 'center' });

  y = 27;
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageW / 2, y, { align: 'center' });
  y += 5;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`${location}  ·  ${rows.length.toLocaleString()} polling station${rows.length === 1 ? '' : 's'}  ·  Generated ${new Date().toLocaleString()}`, pageW / 2, y, { align: 'center' });
  y += 6;

  const headers = tableColumns(roster);
  const blocks = buildBlocks(rows, groupLevels);

  // Build body rows in parallel with a style map, since autoTable has no
  // native concept of grouped/nested rows — header and subtotal rows get
  // distinct bold/coloured styling applied per-row via didParseCell below.
  const body: string[][] = [];
  const rowKind: ('header' | 'subtotal' | 'data' | 'grandtotal')[] = [];
  const rowDepth: number[] = [];

  for (const b of blocks) {
    if (b.kind === 'header') {
      body.push([b.label, ...Array(headers.length - 1).fill('')]);
      rowKind.push('header');
      rowDepth.push(b.depth);
    } else if (b.kind === 'row') {
      body.push(dataRowCells(b.row, roster));
      rowKind.push('data');
      rowDepth.push(groupLevels.length);
    } else {
      body.push(subtotalRowCells(b.label, b.rows, roster));
      rowKind.push('subtotal');
      rowDepth.push(b.depth);
    }
  }
  const grandTotalRow = subtotalRowCells('GRAND TOTAL', rows, roster);
  body.push(grandTotalRow);
  rowKind.push('grandtotal');
  rowDepth.push(-1);

  const depthColors: [number, number, number][] = [
    [214, 234, 222], [225, 240, 231], [235, 246, 239], [245, 250, 247],
  ];

  doc.autoTable({
    startY: y,
    head: [headers],
    body,
    theme: 'striped',
    styles: { fontSize: 6.3, cellPadding: 1.2 },
    headStyles: { fillColor: [25, 135, 84], textColor: 255, fontStyle: 'bold', fontSize: 6.5 },
    margin: { left: 8, right: 8 },
    didParseCell: (data: any) => {
      if (data.section !== 'body') return;
      const kind = rowKind[data.row.index];
      const depth = rowDepth[data.row.index];
      if (kind === 'header') {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = depthColors[Math.min(depth, depthColors.length - 1)];
        data.cell.styles.textColor = [20, 60, 40];
      } else if (kind === 'subtotal') {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [255, 243, 205];
        data.cell.styles.textColor = [110, 80, 10];
      } else if (kind === 'grandtotal') {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [220, 38, 38];
        data.cell.styles.textColor = [255, 255, 255];
      }
    },
  });

  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('BOZ — Build One Zambia · Confidential Election Results', 8, doc.internal.pageSize.getHeight() - 6);
    doc.text(`Page ${i} of ${totalPages}`, pageW - 8, doc.internal.pageSize.getHeight() - 6, { align: 'right' });
  }

  doc.save(`presidential-results-${location.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}.pdf`);
}

interface DownloadButtonProps {
  label?: string;
  format: 'pdf' | 'excel';
  electionType: ElectionCategory;
  levelType: 'national' | LevelType;
  levelId?: string;
  locationLabel: string;
  candidateRoster: RosterCandidate[];
  title?: string;
  stage?: 'provisional' | 'official';
  round?: 'round1' | 'runoff';
}

export function DownloadButton({
  label, format, electionType, levelType, levelId, locationLabel, candidateRoster,
  title = 'Presidential Election Results', stage, round,
}: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setLoading(true);
    setError('');
    try {
      const { rows } = await resultsApi.exportBreakdown(electionType, levelType, levelId, stage, round);
      if (rows.length === 0) {
        setError('No polling station results available yet for this selection.');
        return;
      }
      const groupLevels = GROUP_LEVELS[levelType] ?? GROUP_LEVELS.national;
      if (format === 'excel') {
        downloadExcel(rows, candidateRoster, groupLevels, title, locationLabel);
      } else {
        downloadPDF(rows, candidateRoster, groupLevels, title, locationLabel);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg transition-colors text-sm disabled:opacity-60"
      >
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Download className="w-4 h-4" />}
        {label || `Download ${format.toUpperCase()}`}
      </button>
      {error && <p className="text-xs text-red-600 max-w-xs text-center">{error}</p>}
    </div>
  );
}
