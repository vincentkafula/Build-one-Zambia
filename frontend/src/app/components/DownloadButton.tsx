import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => jsPDF;
  }
}

interface CandidateResult {
  candidate: {
    id: string;
    name: string;
    party: string;
    partyColor?: string;
  };
  votes: number;
}

interface DownloadButtonProps {
  label?: string;
  format: 'pdf' | 'excel';
  data?: CandidateResult[];
  title?: string;
  totals?: {
    registered?: number;
    cast?: number;
    valid?: number;
    rejected?: number;
    turnout?: number;
  };
  locationLabel?: string;
}

function formatNum(n: number) {
  return n.toLocaleString('en-US');
}

function downloadExcel(data: CandidateResult[], title: string, totals: DownloadButtonProps['totals'], location: string) {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryRows = [
    ['BOZ Election Results', ''],
    ['Report Title', title],
    ['Location', location],
    ['Generated', new Date().toLocaleString()],
    ['', ''],
    ['Registered Voters', totals?.registered ?? ''],
    ['Votes Cast', totals?.cast ?? ''],
    ['Valid Votes', totals?.valid ?? ''],
    ['Rejected Ballots', totals?.rejected ?? ''],
    ['Voter Turnout', totals?.turnout != null ? `${totals.turnout.toFixed(1)}%` : ''],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 22 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Results sheet
  const totalValid = data.reduce((s, r) => s + r.votes, 0);
  const resultRows = [
    ['Rank', 'Candidate', 'Party', 'Votes', 'Vote Share (%)'],
    ...data.map((r, i) => [
      i + 1,
      r.candidate.name,
      r.candidate.party,
      r.votes,
      totalValid > 0 ? ((r.votes / totalValid) * 100).toFixed(2) : '0.00',
    ]),
    ['', '', 'TOTAL', totalValid, '100.00'],
  ];
  const wsResults = XLSX.utils.aoa_to_sheet(resultRows);
  wsResults['!cols'] = [{ wch: 6 }, { wch: 28 }, { wch: 20 }, { wch: 14 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsResults, 'Results');

  XLSX.writeFile(wb, `election-results-${Date.now()}.xlsx`);
}

function downloadPDF(data: CandidateResult[], title: string, totals: DownloadButtonProps['totals'], location: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 15;

  // Header bar
  doc.setFillColor(25, 135, 84);
  doc.rect(0, 0, pageW, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BOZ — Build One Zambia', pageW / 2, 10, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Official Election Results Report', pageW / 2, 17, { align: 'center' });

  y = 32;
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageW / 2, y, { align: 'center' });

  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Location: ${location}`, pageW / 2, y, { align: 'center' });
  y += 5;
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageW / 2, y, { align: 'center' });

  // Divider
  y += 6;
  doc.setDrawColor(200, 200, 200);
  doc.line(14, y, pageW - 14, y);
  y += 6;

  // Summary box
  if (totals) {
    const summaryItems = [
      ['Registered Voters', formatNum(totals.registered ?? 0)],
      ['Votes Cast', formatNum(totals.cast ?? 0)],
      ['Valid Votes', formatNum(totals.valid ?? 0)],
      ['Rejected Ballots', formatNum(totals.rejected ?? 0)],
      ['Voter Turnout', totals.turnout != null ? `${totals.turnout.toFixed(1)}%` : 'N/A'],
    ];

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('Election Statistics', 14, y);
    y += 5;

    doc.autoTable({
      startY: y,
      head: [['Metric', 'Value']],
      body: summaryItems,
      theme: 'striped',
      headStyles: { fillColor: [25, 135, 84], textColor: 255, fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 40, halign: 'right' } },
      margin: { left: 14, right: 14 },
      tableWidth: 100,
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Results table
  const totalValid = data.reduce((s, r) => s + r.votes, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Candidate Results', 14, y);
  y += 5;

  doc.autoTable({
    startY: y,
    head: [['Rank', 'Candidate', 'Party', 'Votes', 'Vote Share']],
    body: data.map((r, i) => [
      i + 1,
      r.candidate.name,
      r.candidate.party,
      formatNum(r.votes),
      totalValid > 0 ? `${((r.votes / totalValid) * 100).toFixed(2)}%` : '0.00%',
    ]),
    foot: [['', '', 'TOTAL', formatNum(totalValid), '100.00%']],
    theme: 'striped',
    headStyles: { fillColor: [25, 135, 84], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('BOZ — Build One Zambia · Confidential Election Results', 14, doc.internal.pageSize.getHeight() - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageW - 14, doc.internal.pageSize.getHeight() - 8, { align: 'right' });
  }

  doc.save(`election-results-${Date.now()}.pdf`);
}

export function DownloadButton({ label, format, data = [], title = 'Presidential Election Results', totals, locationLabel = 'National' }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      if (format === 'excel') {
        downloadExcel(data, title, totals, locationLabel);
      } else {
        downloadPDF(data, title, totals, locationLabel);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}
