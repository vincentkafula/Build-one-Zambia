/**
 * Results Engine
 * Implements all routes that the frontend resultsApi expects:
 *   GET /results/dashboard
 *   GET /results/national/:electionType
 *   GET /results/level/:electionType/:levelType/:levelId
 *   GET /results/breakdown/:electionType/province
 *   GET /results/breakdown/:electionType/district/:provinceId
 *   GET /results/breakdown/:electionType/constituency/:districtId
 *   GET /results/breakdown/:electionType/ward/:constituencyId
 *   GET /results/leaderboard/:electionType
 *   GET /results/coverage
 *   GET /results/heatmap/:electionType
 *   GET /results/trend/:electionType
 *   GET /results/live-feed
 *   GET /results/compare/:electionType/:levelType/:levelId
 *   POST /results/cache/invalidate
 */

import { kv } from './db.js';

const ELECTION_TYPES = ['presidential', 'parliament', 'mayoral', 'councillor'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAllSubmissions(electionType) {
  // Support both old key format (from elections.js) and new data-entry format
  const oldPrefix = `boz:results:${electionType}:station:`;
  const newPrefix = `boz:data-entry:result:`;

  const old = kv.getByPrefix(oldPrefix);
  const newEntries = kv.getByPrefix(newPrefix).filter(s =>
    s.electionType === electionType && ['pending', 'verified', 'approved'].includes(s.status)
  );

  return [...old, ...newEntries];
}

function buildLevelResult(electionType, levelType, levelId, submissions) {
  const now = new Date().toISOString();

  if (!submissions.length) {
    return {
      electionType,
      levelType,
      levelId,
      stationsReporting: 0,
      registeredVoters: 0,
      totalVotesCast: 0,
      validVotes: 0,
      rejectedBallots: 0,
      turnoutPercent: 0,
      candidates: [],
      leadingCandidateId: null,
      margin: 0,
      marginPercent: 0,
      submissionBreakdown: { total: 0, verified: 0, pending: 0, queried: 0, rejected: 0 },
      computedAt: now,
    };
  }

  let registeredVoters = 0;
  let totalVotesCast   = 0;
  let rejectedBallots  = 0;
  const candidateVotes = {};
  const breakdown = { total: submissions.length, verified: 0, pending: 0, queried: 0, rejected: 0 };

  for (const s of submissions) {
    registeredVoters += s.registeredVoters || 0;
    rejectedBallots  += s.rejectedBallots || s.totalRejected || 0;

    // Handle both candidateVotes array (new) and candidateResults (old)
    const cvList = s.candidateVotes || s.candidateResults || [];
    for (const cv of cvList) {
      const cid = cv.candidateId;
      const votes = cv.votes || 0;
      candidateVotes[cid] = (candidateVotes[cid] || 0) + votes;
      totalVotesCast += votes;
    }
    totalVotesCast += s.rejectedBallots || s.totalRejected || 0;

    const st = s.status || 'pending';
    if (st === 'verified' || st === 'approved') breakdown.verified++;
    else if (st === 'queried') breakdown.queried++;
    else if (st === 'rejected') breakdown.rejected++;
    else breakdown.pending++;
  }

  const validVotes = totalVotesCast - rejectedBallots;
  const turnoutPercent = registeredVoters > 0
    ? Math.round((totalVotesCast / registeredVoters) * 1000) / 10
    : 0;

  // Build sorted candidate list
  const sorted = Object.entries(candidateVotes)
    .sort(([, a], [, b]) => b - a);

  const candidates = sorted.map(([candidateId, votes], i) => ({
    candidateId,
    votes,
    percentage: validVotes > 0 ? Math.round((votes / validVotes) * 1000) / 10 : 0,
    rank: i + 1,
    swing: null,
  }));

  const leadingCandidateId = candidates[0]?.candidateId ?? null;
  const margin = candidates.length >= 2 ? (candidates[0].votes - candidates[1].votes) : (candidates[0]?.votes ?? 0);
  const marginPercent = validVotes > 0 ? Math.round((margin / validVotes) * 1000) / 10 : 0;

  return {
    electionType,
    levelType,
    levelId,
    stationsReporting: submissions.length,
    registeredVoters,
    totalVotesCast,
    validVotes,
    rejectedBallots,
    turnoutPercent,
    candidates,
    leadingCandidateId,
    margin,
    marginPercent,
    submissionBreakdown: breakdown,
    computedAt: now,
  };
}

// ─── National ─────────────────────────────────────────────────────────────────

export function getNational(electionType) {
  const subs = getAllSubmissions(electionType);
  return buildLevelResult(electionType, 'national', 'national', subs);
}

// ─── Level ────────────────────────────────────────────────────────────────────

export function getLevel(electionType, levelType, levelId) {
  const fieldMap = {
    province: 'provinceId',
    district: 'districtId',
    constituency: 'constituencyId',
    ward: 'wardId',
    station: 'pollingStationId',
  };
  const field = fieldMap[levelType];
  const all = getAllSubmissions(electionType);
  const filtered = field ? all.filter(s => s[field] === levelId) : all;
  return buildLevelResult(electionType, levelType, levelId, filtered);
}

// ─── Breakdown ────────────────────────────────────────────────────────────────

export function getBreakdown(electionType, groupBy, parentField, parentId) {
  const all = getAllSubmissions(electionType);
  const filtered = parentField && parentId
    ? all.filter(s => s[parentField] === parentId)
    : all;

  // Group submissions by the target level
  const groups = {};
  for (const s of filtered) {
    const key = s[groupBy];
    if (!key) continue;
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  }

  const breakdown = {};
  for (const [id, subs] of Object.entries(groups)) {
    breakdown[id] = buildLevelResult(electionType, groupBy.replace('Id', ''), id, subs);
  }
  return breakdown;
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export function getLeaderboard(electionType) {
  const result = getNational(electionType);
  const candidates = result.candidates.map((c, i) => ({
    rank: i + 1,
    candidateId: c.candidateId,
    totalVotes: c.votes,
    percentage: c.percentage,
    stationsWon: 0,
    provinceLeads: [],
    swing: null,
  }));

  // Count province leads
  const provBreakdown = getBreakdown(electionType, 'provinceId', null, null);
  for (const provResult of Object.values(provBreakdown)) {
    if (provResult.leadingCandidateId) {
      const entry = candidates.find(c => c.candidateId === provResult.leadingCandidateId);
      if (entry) entry.provinceLeads.push(provResult.levelId);
    }
  }

  return {
    electionType,
    candidates,
    totalStationsReporting: result.stationsReporting,
    totalVotes: result.totalVotesCast,
    computedAt: new Date().toISOString(),
  };
}

// ─── Coverage ─────────────────────────────────────────────────────────────────

export function getCoverage(electionType) {
  const types = electionType ? [electionType] : ELECTION_TYPES;
  const subs = types.flatMap(t => getAllSubmissions(t));

  const verified   = subs.filter(s => s.status === 'verified' || s.status === 'approved').length;
  const pending    = subs.filter(s => s.status === 'pending').length;
  const queried    = subs.filter(s => s.status === 'queried').length;
  const rejected   = subs.filter(s => s.status === 'rejected').length;
  const total      = subs.length;

  const byProvince = {};
  const byDistrict = {};
  for (const s of subs) {
    const pId = s.provinceId || 'unknown';
    const dId = s.districtId || 'unknown';
    if (!byProvince[pId]) byProvince[pId] = { submitted: 0, verified: 0, pending: 0, totalVotesCast: 0 };
    if (!byDistrict[dId]) byDistrict[dId] = { submitted: 0, verified: 0, pending: 0, totalVotesCast: 0 };
    byProvince[pId].submitted++;
    byDistrict[dId].submitted++;
    const isVerified = s.status === 'verified' || s.status === 'approved';
    if (isVerified) { byProvince[pId].verified++; byDistrict[dId].verified++; }
    else            { byProvince[pId].pending++;  byDistrict[dId].pending++;  }
    const votes = (s.candidateVotes || s.candidateResults || []).reduce((sum, cv) => sum + (cv.votes || 0), 0);
    byProvince[pId].totalVotesCast += votes;
    byDistrict[dId].totalVotesCast += votes;
  }

  // Hourly trend (last 24 hours)
  const hourBuckets = {};
  for (const s of subs) {
    const hour = (s.submittedAt || s.createdAt || new Date().toISOString()).slice(0, 13);
    if (!hourBuckets[hour]) hourBuckets[hour] = { submitted: 0, verified: 0 };
    hourBuckets[hour].submitted++;
    if (s.status === 'verified' || s.status === 'approved') hourBuckets[hour].verified++;
  }
  let cumulative = 0;
  const trend = Object.entries(hourBuckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hour, v]) => {
      cumulative += v.submitted;
      return { hour: `${hour}:00`, submitted: v.submitted, verified: v.verified, cumulative };
    });

  return {
    electionType: electionType || 'all',
    total,
    verified,
    pending,
    queried,
    rejected,
    verifiedPercent: total > 0 ? Math.round((verified / total) * 1000) / 10 : 0,
    byProvince,
    byDistrict,
    trend,
  };
}

// ─── Heatmap ──────────────────────────────────────────────────────────────────

export function getHeatmap(electionType) {
  const breakdown = getBreakdown(electionType, 'districtId', null, null);
  return Object.entries(breakdown).map(([levelId, r]) => ({
    levelId,
    leadingCandidateId: r.leadingCandidateId,
    votes: r.totalVotesCast,
    turnoutPercent: r.turnoutPercent,
    stationsReporting: r.stationsReporting,
    totalVotesCast: r.totalVotesCast,
  }));
}

// ─── Trend ────────────────────────────────────────────────────────────────────

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
  return Object.entries(hourBuckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hour, votes]) => {
      for (const [cid, v] of Object.entries(votes)) {
        cumulative[cid] = (cumulative[cid] || 0) + v;
      }
      return {
        hour: `${hour}:00`,
        cumulativeVotes: { ...cumulative },
        cumulativeTotal: Object.values(cumulative).reduce((s, v) => s + v, 0),
      };
    });
}

// ─── Live Feed ────────────────────────────────────────────────────────────────

export function getLiveFeed(limit = 20, electionType) {
  const types = electionType ? [electionType] : ELECTION_TYPES;
  const all = types.flatMap(t =>
    getAllSubmissions(t).map(s => ({ ...s, _electionType: t }))
  );

  return all
    .sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0))
    .slice(0, limit)
    .map(s => {
      const cvList = s.candidateVotes || s.candidateResults || [];
      const top = cvList.sort((a, b) => (b.votes || 0) - (a.votes || 0))[0];
      return {
        submissionId: s.id,
        pollingStationId: s.pollingStationId || s.id,
        pollingStationName: s.pollingStationName || 'Polling Station',
        electionType: s.electionType || s._electionType,
        provinceId: s.provinceId || '',
        districtId: s.districtId || '',
        totalVotesCast: (cvList.reduce((sum, cv) => sum + (cv.votes || 0), 0)) + (s.rejectedBallots || s.totalRejected || 0),
        status: s.status || 'pending',
        enteredBy: s.submittedBy || s.enteredBy || 'agent',
        submittedAt: s.submittedAt || s.createdAt || new Date().toISOString(),
        candidateCount: cvList.length,
        topCandidateId: top?.candidateId || null,
      };
    });
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function getDashboard() {
  const presidential = getNational('presidential');
  const parliament   = getNational('parliament');
  const mayoral      = getNational('mayoral');
  const councillor   = getNational('councillor');
  const coverage     = getCoverage();
  const recentActivity = getLiveFeed(10);

  return {
    lastUpdated: new Date().toISOString(),
    elections: { presidential, parliament, mayoral, councillor },
    coverage,
    recentActivity,
  };
}
