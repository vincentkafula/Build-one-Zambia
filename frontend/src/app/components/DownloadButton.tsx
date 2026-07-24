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

// Which geography columns to show, narrowing as the selected level gets
// more specific — matches how far "up" from Polling Station the current
// selection sits. A column for the level currently selected (and anything
// above it) is redundant since it's fixed for every row, so it's dropped.
const GEO_COLUMNS: Record<string, { key: keyof StationBreakdownRow; label: string }[]> = {
  national: [
    { key: 'provinceName', label: 'Province' },
    { key: 'districtName', label: 'District' },
    { key: 'constituencyName', label: 'Constituency' },
    { key: 'wardName', label: 'Ward' },
    { key: 'pollingStationName', label: 'Polling Station' },
  ],
  province: [
    { key: 'districtName', label: 'District' },
    { key: 'constituencyName', label: 'Constituency' },
    { key: 'wardName', label: 'Ward' },
    { key: 'pollingStationName', label: 'Polling Station' },
  ],
  district: [
    { key: 'constituencyName', label: 'Constituency' },
    { key: 'wardName', label: 'Ward' },
    { key: 'pollingStationName', label: 'Polling Station' },
  ],
  constituency: [
    { key: 'wardName', label: 'Ward' },
    { key: 'pollingStationName', label: 'Polling Station' },
  ],
  ward: [
    { key: 'pollingStationName', label: 'Polling Station' },
  ],
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

function buildTableData(rows: StationBreakdownRow[], roster: RosterCandidate[], geoCols: { key: keyof StationBreakdownRow; label: string }[]) {
  const headers = [
    ...geoCols.map(c => c.label),
    ...roster.map(c => `${c.name} (${c.party})`),
    'Registered Voters',
    'Total Valid Votes',
    'Rejected Votes',
    'Voter Turnout',
  ];

  const body = rows.map(row => {
    const { validVotes, turnout } = rowStats(row);
    const voteMap = new Map(row.candidateVotes.map(c => [c.candidateId, c.votes]));
    return [
      ...geoCols.map(c => String(row[c.key] ?? '')),
      ...roster.map(c => formatNum(voteMap.get(c.id) ?? 0)),
      formatNum(row.registeredVoters),
      formatNum(validVotes),
      formatNum(row.rejectedBallots),
      `${turnout.toFixed(1)}%`,
    ];
  });

  // Grand-total footer row
  const totalRegistered = rows.reduce((s, r) => s + r.registeredVoters, 0);
  const totalRejected = rows.reduce((s, r) => s + r.rejectedBallots, 0);
  const totalValid = rows.reduce((s, r) => s + rowStats(r).validVotes, 0);
  const totalCast = totalValid + totalRejected;
  const totalTurnout = totalRegistered > 0 ? (totalCast / totalRegistered) * 100 : 0;
  const perCandidateTotals = roster.map(c =>
    rows.reduce((s, r) => s + (r.candidateVotes.find(cv => cv.candidateId === c.id)?.votes ?? 0), 0)
  );
  const footer = [
    ...geoCols.map((_, i) => (i === 0 ? 'TOTAL' : '')),
    ...perCandidateTotals.map(formatNum),
    formatNum(totalRegistered),
    formatNum(totalValid),
    formatNum(totalRejected),
    `${totalTurnout.toFixed(1)}%`,
  ];

  return { headers, body, footer };
}

function downloadExcel(rows: StationBreakdownRow[], roster: RosterCandidate[], geoCols: { key: keyof StationBreakdownRow; label: string }[], title: string, location: string) {
  const wb = XLSX.utils.book_new();
  const { headers, body, footer } = buildTableData(rows, roster, geoCols);

  const summaryRows = [
    ['BOZ Election Results', ''],
    ['Report Title', title],
    ['Selected Level', location],
    ['Polling Stations Included', rows.length],
    ['Generated', new Date().toLocaleString()],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 24 }, { wch: 34 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  const wsResults = XLSX.utils.aoa_to_sheet([headers, ...body, footer]);
  wsResults['!cols'] = [
    ...geoCols.map(() => ({ wch: 20 })),
    ...roster.map(() => ({ wch: 16 })),
    { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, wsResults, 'Results by Polling Station');

  XLSX.writeFile(wb, `presidential-results-${location.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}.xlsx`);
}

function downloadPDF(rows: StationBreakdownRow[], roster: RosterCandidate[], geoCols: { key: keyof StationBreakdownRow; label: string }[], title: string, location: string) {
  // Landscape — this table can have many columns once every candidate and
  // every geography level is included.
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

  const { headers, body, footer } = buildTableData(rows, roster, geoCols);

  doc.autoTable({
    startY: y,
    head: [headers],
    body,
    foot: [footer],
    theme: 'striped',
    styles: { fontSize: 6.5, cellPadding: 1.3 },
    headStyles: { fillColor: [25, 135, 84], textColor: 255, fontStyle: 'bold', fontSize: 6.5 },
    footStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold', fontSize: 6.5 },
    margin: { left: 8, right: 8 },
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
      const geoCols = GEO_COLUMNS[levelType] ?? GEO_COLUMNS.national;
      if (format === 'excel') {
        downloadExcel(rows, candidateRoster, geoCols, title, locationLabel);
      } else {
        downloadPDF(rows, candidateRoster, geoCols, title, locationLabel);
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
