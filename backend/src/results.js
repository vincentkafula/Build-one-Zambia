/**
 * Results Engine — aggregates station submissions into live results.
 * Implements all routes the frontend resultsApi calls.
 */

import { kv } from './db.js';

const ELECTION_TYPES = ['presidential', 'parliament', 'mayoral', 'councillor'];

function getAllSubmissions(electionType) {
  const all = kv.getByPrefix('boz:results:');
  return all.filter(s => !electionType || s.electionType === electionType);
}

function buildResult(electionType, levelType, levelId, submissions) {
  const now = new Date().toISOString();
  if (!submissions.length) {
    return { electionType, levelType, levelId, stationsReporting: 0, registeredVoters: 0, totalVotesCast: 0, validVotes: 0, rejectedBallots: 0, turnoutPercent: 0, candidates: [], leadingCandidateId: null, margin: 0, marginPercent: 0, submissionBreakdown: { total: 0, verified: 0, pending: 0, queried: 0, rejected: 0 }, computedAt: now };
  }

  let registeredVoters = 0, totalVotesCast = 0, rejectedBallots = 0;
  const candidateVotes = {};
  const breakdown = { total: submissions.length, verified: 0, pending: 0, queried: 0, rejected: 0 };

  for (const s of submissions) {
    registeredVoters += s.registeredVoters || 0;
    rejectedBallots  += s.rejectedBallots || s.totalRejected || 0;
    const cvList = s.candidateVotes || s.candidateResults || [];
    for (const cv of cvList) {
      candidateVotes[cv.candidateId] = (candidateVotes[cv.candidateId] || 0) + (cv.votes || 0);
      totalVotesCast += cv.votes || 0;
    }
    totalVotesCast += s.rejectedBallots || s.totalRejected || 0;
    const st = s.status || 'pending';
    if (st === 'verified' || st === 'approved') breakdown.verified++;
    else if (st === 'queried') breakdown.queried++;
    else if (st === 'rejected') breakdown.rejected++;
    else breakdown.pending++;
  }

  const validVotes = totalVotesCast - rejectedBallots;
  const turnoutPercent = registeredVoters > 0 ? Math.round((totalVotesCast / registeredVoters) * 1000) / 10 : 0;
  const sorted = Object.entries(candidateVotes).sort(([, a], [, b]) => b - a);
  const candidates = sorted.map(([candidateId, votes], i) => ({ candidateId, votes, percentage: validVotes > 0 ? Math.round((votes / validVotes) * 1000) / 10 : 0, rank: i + 1 }));
  const leadingCandidateId = candidates[0]?.candidateId ?? null;
  const margin = candidates.length >= 2 ? candidates[0].votes - candidates[1].votes : (candidates[0]?.votes ?? 0);
  const marginPercent = validVotes > 0 ? Math.round((margin / validVotes) * 1000) / 10 : 0;

  return { electionType, levelType, levelId, stationsReporting: submissions.length, registeredVoters, totalVotesCast, validVotes, rejectedBallots, turnoutPercent, candidates, leadingCandidateId, margin, marginPercent, submissionBreakdown: breakdown, computedAt: now };
}

export function getNational(electionType) {
  return buildResult(electionType, 'national', 'national', getAllSubmissions(electionType));
}

export function getLevel(electionType, levelType, levelId) {
  const fieldMap = { province: 'provinceId', district: 'districtId', constituency: 'constituencyId', ward: 'wardId', station: 'pollingStationId' };
  const field = fieldMap[levelType];
  const filtered = getAllSubmissions(electionType).filter(s => !field || s[field] === levelId);
  return buildResult(electionType, levelType, levelId, filtered);
}

export function getBreakdown(electionType, groupField, parentField, parentId) {
  const all = getAllSubmissions(electionType);
  const filtered = parentField && parentId ? all.filter(s => s[parentField] === parentId) : all;
  const groups = {};
  for (const s of filtered) {
    const key = s[groupField]; if (!key) continue;
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  }
  const result = {};
  for (const [id, subs] of Object.entries(groups)) {
    result[id] = buildResult(electionType, groupField.replace('Id', ''), id, subs);
  }
  return result;
}

export function getLeaderboard(electionType) {
  const result = getNational(electionType);
  return { electionType, candidates: result.candidates.map((c, i) => ({ rank: i + 1, candidateId: c.candidateId, totalVotes: c.votes, percentage: c.percentage, provinceLeads: [] })), totalStationsReporting: result.stationsReporting, totalVotes: result.totalVotesCast, computedAt: new Date().toISOString() };
}

export function getCoverage(electionType) {
  const types = electionType ? [electionType] : ELECTION_TYPES;
  const subs = types.flatMap(t => getAllSubmissions(t));
  const total = subs.length;
  const verified = subs.filter(s => s.status === 'verified' || s.status === 'approved').length;
  return { electionType: electionType || 'all', total, verified, pending: subs.filter(s => s.status === 'pending').length, queried: subs.filter(s => s.status === 'queried').length, rejected: subs.filter(s => s.status === 'rejected').length, verifiedPercent: total > 0 ? Math.round((verified / total) * 1000) / 10 : 0, byProvince: {}, byDistrict: {}, trend: [] };
}

export function getHeatmap(electionType) {
  const breakdown = getBreakdown(electionType, 'districtId', null, null);
  return Object.entries(breakdown).map(([levelId, r]) => ({ levelId, leadingCandidateId: r.leadingCandidateId, turnoutPercent: r.turnoutPercent, stationsReporting: r.stationsReporting, totalVotesCast: r.totalVotesCast }));
}

export function getTrend(electionType) {
  const subs = getAllSubmissions(electionType);
  const hourBuckets = {};
  for (const s of subs) {
    const hour = (s.submittedAt || s.createdAt || new Date().toISOString()).slice(0, 13);
    if (!hourBuckets[hour]) hourBuckets[hour] = {};
    for (const cv of (s.candidateVotes || s.candidateResults || [])) {
      hourBuckets[hour][cv.candidateId] = (hourBuckets[hour][cv.candidateId] || 0) + (cv.votes || 0);
    }
  }
  const cumulative = {};
  return Object.entries(hourBuckets).sort(([a], [b]) => a.localeCompare(b)).map(([hour, votes]) => {
    for (const [cid, v] of Object.entries(votes)) cumulative[cid] = (cumulative[cid] || 0) + v;
    return { hour: `${hour}:00`, cumulativeVotes: { ...cumulative }, cumulativeTotal: Object.values(cumulative).reduce((s, v) => s + v, 0) };
  });
}

export function getLiveFeed(limit = 20, electionType) {
  const types = electionType ? [electionType] : ELECTION_TYPES;
  const all = types.flatMap(t => getAllSubmissions(t).map(s => ({ ...s, _et: t })));
  return all.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0)).slice(0, limit).map(s => {
    const cvList = s.candidateVotes || s.candidateResults || [];
    return { submissionId: s.id, pollingStationId: s.pollingStationId || s.id, pollingStationName: s.pollingStationName || 'Polling Station', electionType: s.electionType || s._et, provinceId: s.provinceId || '', districtId: s.districtId || '', totalVotesCast: cvList.reduce((sum, cv) => sum + (cv.votes || 0), 0) + (s.rejectedBallots || 0), status: s.status || 'pending', submittedAt: s.submittedAt || s.createdAt || new Date().toISOString(), topCandidateId: cvList.sort((a, b) => (b.votes || 0) - (a.votes || 0))[0]?.candidateId || null };
  });
}

export function getDashboard() {
  return { lastUpdated: new Date().toISOString(), elections: { presidential: getNational('presidential'), parliament: getNational('parliament'), mayoral: getNational('mayoral'), councillor: getNational('councillor') }, coverage: getCoverage(), recentActivity: getLiveFeed(10) };
}
