import { PollingStationResult } from '../results/resultsService';
import { VerificationRecord } from '../verification/verificationService';
import { AuditEntry } from '../audit/auditService';

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function toCsv(headers: string[], rows: (string | number)[][]): string {
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  return [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n');
}

class ExportService {
  exportResultsCsv(results: PollingStationResult[], filename = 'election_results.csv'): void {
    const headers = [
      'Province', 'District', 'Constituency', 'Ward', 'Polling Station',
      'Election Type', 'Registered Voters', 'Total Votes Cast', 'Valid Votes',
      'Rejected Ballots', 'Turnout %', 'Status', 'Agent Name', 'Submitted At',
    ];

    const rows = results.map((r) => [
      r.provinceName, r.districtName, r.constituencyName, r.wardName, r.pollingStationName,
      r.electionType, r.registeredVoters, r.totalVotesCast, r.validVotes,
      r.rejectedBallots,
      r.registeredVoters > 0 ? ((r.totalVotesCast / r.registeredVoters) * 100).toFixed(1) : '0',
      r.status, r.agentName, r.submittedAt,
    ]);

    downloadFile(toCsv(headers, rows), filename, 'text/csv;charset=utf-8;');
  }

  exportCandidateResultsCsv(results: PollingStationResult[], filename = 'candidate_results.csv'): void {
    const headers = [
      'Polling Station', 'Ward', 'Constituency', 'District', 'Province',
      'Election Type', 'Candidate', 'Party', 'Votes', 'Share %',
    ];

    const rows: (string | number)[][] = [];
    for (const r of results) {
      const total = r.validVotes || 1;
      for (const c of r.candidates) {
        rows.push([
          r.pollingStationName, r.wardName, r.constituencyName, r.districtName, r.provinceName,
          r.electionType, c.candidateName, `${c.partyName} (${c.partyAbbr})`,
          c.votes, ((c.votes / total) * 100).toFixed(1),
        ]);
      }
    }

    downloadFile(toCsv(headers, rows), filename, 'text/csv;charset=utf-8;');
  }

  exportVerificationsCsv(records: VerificationRecord[], filename = 'verifications.csv'): void {
    const headers = [
      'ID', 'Level', 'Level Name', 'Election Type', 'Status',
      'Officer', 'ECZ ID', 'Agent Votes', 'Official Votes', 'Discrepancy',
      'Discrepancy %', 'Auto Match', 'Signed At', 'Notes',
    ];

    const rows = records.map((v) => [
      v.id, v.levelType, v.levelName, v.electionType, v.status,
      v.officer.name, v.officer.eczId,
      v.agentTotalVotes, v.officialTotalVotes, v.discrepancy,
      v.discrepancyPercent, v.autoCalculationMatch ? 'Yes' : 'No',
      v.signedAt ?? '', v.notes ?? '',
    ]);

    downloadFile(toCsv(headers, rows), filename, 'text/csv;charset=utf-8;');
  }

  exportAuditLogCsv(entries: AuditEntry[], filename = 'audit_log.csv'): void {
    const headers = ['Timestamp', 'Action', 'Entity', 'Entity ID', 'User ID', 'Metadata'];
    const rows = entries.map((e) => [
      e.timestamp, e.action, e.entity, e.entityId, e.userId ?? '', JSON.stringify(e.metadata),
    ]);
    downloadFile(toCsv(headers, rows), filename, 'text/csv;charset=utf-8;');
  }

  exportSummaryJson(data: object, filename = 'election_summary.json'): void {
    downloadFile(JSON.stringify(data, null, 2), filename, 'application/json');
  }

  // Generate a simple plain-text tally report
  generateTallyReport(
    results: PollingStationResult[],
    electionType: string,
    level: string
  ): string {
    const totalVotes = results.reduce((s, r) => s + r.validVotes, 0);
    const totalCast = results.reduce((s, r) => s + r.totalVotesCast, 0);
    const totalRegistered = results.reduce((s, r) => s + r.registeredVoters, 0);

    // Aggregate candidates
    const candidateTotals = new Map<string, { name: string; party: string; votes: number }>();
    for (const r of results) {
      for (const c of r.candidates) {
        if (!candidateTotals.has(c.candidateId)) {
          candidateTotals.set(c.candidateId, { name: c.candidateName, party: c.partyAbbr, votes: 0 });
        }
        candidateTotals.get(c.candidateId)!.votes += c.votes;
      }
    }

    const sorted = Array.from(candidateTotals.values()).sort((a, b) => b.votes - a.votes);

    const lines = [
      '====================================================',
      'BUILD ONE ZAMBIA — ELECTION RESULTS PORTAL',
      `TALLY REPORT: ${electionType.toUpperCase()} — ${level}`,
      `Generated: ${new Date().toLocaleString()}`,
      '====================================================',
      '',
      `Stations Reporting:  ${results.length}`,
      `Registered Voters:   ${totalRegistered.toLocaleString()}`,
      `Total Votes Cast:    ${totalCast.toLocaleString()}`,
      `Valid Votes:         ${totalVotes.toLocaleString()}`,
      `Rejected Ballots:    ${(totalCast - totalVotes).toLocaleString()}`,
      `Voter Turnout:       ${totalRegistered > 0 ? ((totalCast / totalRegistered) * 100).toFixed(1) : 0}%`,
      '',
      'CANDIDATE RESULTS:',
      '----------------------------------------------------',
      ...sorted.map((c, i) => {
        const pct = totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(1) : '0.0';
        return `${String(i + 1).padStart(2)}. ${c.name.padEnd(30)} ${c.party.padEnd(8)} ${String(c.votes).padStart(8)}  ${pct}%`;
      }),
      '====================================================',
    ];

    return lines.join('\n');
  }

  downloadTallyReport(content: string, filename = 'tally_report.txt'): void {
    downloadFile(content, filename, 'text/plain;charset=utf-8;');
  }
}

export const exportService = new ExportService();
