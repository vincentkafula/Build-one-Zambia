/**
 * Results Engine — aggregates station submissions into live results.
 * Implements all routes the frontend resultsApi calls.
 */

import { kv } from './db.js';

const ELECTION_TYPES = ['presidential', 'parliament', 'mayoral', 'councillor'];

// The five-step chain of custody every polling-station submission must pass
// through, in order, before it counts as "official". Provisional results show
// every submission regardless of where it sits in this chain (i.e. whatever
// agents have entered so far); official results only show submissions that
// have been approved at every single level.
const VERIFICATION_LEVELS = ['ward', 'constituency', 'district', 'province', 'national'];

function isOfficial(submission) {
  const chain = submission.verificationChain;
  if (!chain) return false;
  return VERIFICATION_LEVELS.every(level => chain[level]?.status === 'approved');
}

function getAllSubmissions(electionType, stage, round) {
  const all = kv.getByPrefix('boz:results:');
  let filtered = all.filter(s => !electionType || s.electionType === electionType);
  if (stage === 'official') {
    filtered = filtered.filter(s => s.isOfficial === true || isOfficial(s));
  }
  // Submissions predate the runoff feature and have no electionRound field —
  // treat those (and anything explicitly tagged 'round1') as first-round.
  if (round) {
    filtered = filtered.filter(s => (s.electionRound || 'round1') === round);
  }
  // Debug log — remove after confirming
  if (all.length > 0 || filtered.length > 0) {
    console.log(`[results] getAllSubmissions(${electionType}, ${stage || 'provisional'}, ${round || 'any round'}): ${all.length} total, ${filtered.length} matching`);
    if (all.length > 0) console.log(`[results] Sample fields:`, JSON.stringify({ rejectedBallots: all[0]?.rejectedBallots, totalRejected: all[0]?.totalRejected, electionType: all[0]?.electionType }));
  }
  return filtered;
}

function buildResult(electionType, levelType, levelId, submissions) {
  const now = new Date().toISOString();
  if (!submissions.length) {
    return { electionType, levelType, levelId, stationsReporting: 0, registeredVoters: 0, totalVotesCast: 0, validVotes: 0, rejectedBallots: 0, turnoutPercent: 0, candidates: [], leadingCandidateId: null, margin: 0, marginPercent: 0, submissionBreakdown: { total: 0, verified: 0, pending: 0, queried: 0, rejected: 0 }, computedAt: now };
  }

  let registeredVoters = 0, candidateVotesTotal = 0, rejectedBallots = 0;
  const candidateVotes = {};
  const breakdown = { total: submissions.length, verified: 0, pending: 0, queried: 0, rejected: 0 };

  for (const s of submissions) {
    registeredVoters  += Number(s.registeredVoters || 0);
    // Collect rejected ballots from all possible field names
    rejectedBallots   += Number(s.rejectedBallots || s.totalRejected || s.totalRejectedBallots || 0);
    // Sum candidate votes
    const cvList = s.candidateVotes || s.candidateResults || s.candidates || [];
    for (const cv of cvList) {
      if (!cv.candidateId) continue;
      candidateVotes[cv.candidateId] = (candidateVotes[cv.candidateId] || 0) + (Number(cv.votes) || 0);
      candidateVotesTotal += Number(cv.votes) || 0;
    }
    const st = s.status || 'pending';
    if (st === 'verified' || st === 'approved') breakdown.verified++;
    else if (st === 'queried') breakdown.queried++;
    else if (st === 'rejected') breakdown.rejected++;
    else breakdown.pending++;
  }

  // totalVotesCast = candidate votes + rejected ballots (correct ECZ formula)
  const totalVotesCast = candidateVotesTotal + rejectedBallots;
  // validVotes = only candidate votes (excludes rejected)
  const validVotes = candidateVotesTotal;
  // Turnout based on total votes cast (including rejected) over registered voters
  const turnoutPercent = registeredVoters > 0 ? Math.round((totalVotesCast / registeredVoters) * 1000) / 10 : 0;
  const sorted = Object.entries(candidateVotes).sort(([, a], [, b]) => b - a);
  // Candidate percentage = votes / validVotes (share of valid votes only)
  const candidates = sorted.map(([candidateId, votes], i) => ({ candidateId, votes, percentage: validVotes > 0 ? Math.round((votes / validVotes) * 1000) / 10 : 0, rank: i + 1 }));
  const leadingCandidateId = candidates[0]?.candidateId ?? null;
  const margin = candidates.length >= 2 ? candidates[0].votes - candidates[1].votes : (candidates[0]?.votes ?? 0);
  const marginPercent = validVotes > 0 ? Math.round((margin / validVotes) * 1000) / 10 : 0;

  return { electionType, levelType, levelId, stationsReporting: submissions.length, registeredVoters, totalVotesCast, validVotes, rejectedBallots, turnoutPercent, candidates, leadingCandidateId, margin, marginPercent, submissionBreakdown: breakdown, computedAt: now };
}

export function getNational(electionType, stage, round) {
  return buildResult(electionType, 'national', 'national', getAllSubmissions(electionType, stage, round));
}

export function getLevel(electionType, levelType, levelId, stage, round) {
  const fieldMap = { province: 'provinceId', district: 'districtId', constituency: 'constituencyId', ward: 'wardId', station: 'pollingStationId' };
  const field = fieldMap[levelType];
  const filtered = getAllSubmissions(electionType, stage, round).filter(s => !field || s[field] === levelId);
  return buildResult(electionType, levelType, levelId, filtered);
}

// Every constituency nationwide with at least one submission of any kind —
// a real polling-station result or a direct-entry constituency figure
// (synthetic 'station' entries created by the direct ECZ constituency
// entry feature; getAllSubmissions doesn't distinguish between the two,
// since both live in the same boz:results: dataset by design). Used for
// the "Declared Constituencies" list on the public results pages, so a
// constituency shows up there the moment ANY result exists for it,
// regardless of how it was entered.
export function getDeclaredConstituencies(electionType) {
  const all = getAllSubmissions(electionType);
  const groups = {};
  for (const s of all) {
    const id = s.constituencyId;
    if (!id) continue;
    if (!groups[id]) groups[id] = { name: s.constituencyName || id, districtId: s.districtId, districtName: s.districtName, provinceId: s.provinceId, provinceName: s.provinceName, subs: [] };
    groups[id].subs.push(s);
    // Prefer a real (non-synthetic) submission's name/parent fields if one
    // exists in the group, since a direct-entry figure's own name field is
    // just whatever the manager typed and may be less complete.
    if (!s.isDirectEczEntry && s.constituencyName) groups[id].name = s.constituencyName;
  }
  return Object.entries(groups).map(([id, g]) => {
    const result = buildResult(electionType, 'constituency', id, g.subs);
    return {
      ...result,
      levelName: g.name,
      districtId: g.districtId, districtName: g.districtName,
      provinceId: g.provinceId, provinceName: g.provinceName,
      isDirectEntry: g.subs.every(s => s.isDirectEczEntry),
    };
  }).sort((a, b) => a.levelName.localeCompare(b.levelName));
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

// Raw per-polling-station rows for exports (PDF/Excel downloads). Unlike
// buildResult() (which only returns aggregated totals), this returns one
// row per station with its full province/district/constituency/ward names
// attached, so a report can be built showing every station individually
// underneath whatever level is currently selected.
export function getStationBreakdown(electionType, levelType, levelId, stage, round) {
  const fieldMap = { province: 'provinceId', district: 'districtId', constituency: 'constituencyId', ward: 'wardId', station: 'pollingStationId' };
  const field = fieldMap[levelType];
  const all = getAllSubmissions(electionType, stage, round);
  const filtered = (!field || levelType === 'national' || !levelId) ? all : all.filter(s => s[field] === levelId);

  return filtered
    .map(s => ({
      provinceId: s.provinceId || '', provinceName: s.provinceName || '',
      districtId: s.districtId || '', districtName: s.districtName || '',
      constituencyId: s.constituencyId || '', constituencyName: s.constituencyName || '',
      wardId: s.wardId || '', wardName: s.wardName || '',
      pollingStationId: s.pollingStationId || '', pollingStationName: s.pollingStationName || '',
      registeredVoters: Number(s.registeredVoters || 0),
      rejectedBallots: Number(s.rejectedBallots || s.totalRejected || s.totalRejectedBallots || 0),
      candidateVotes: (s.candidateVotes || s.candidateResults || s.candidates || [])
        .filter(cv => cv.candidateId)
        .map(cv => ({ candidateId: cv.candidateId, votes: Number(cv.votes || 0) })),
      status: s.status || 'pending',
    }))
    .sort((a, b) =>
      a.provinceName.localeCompare(b.provinceName) ||
      a.districtName.localeCompare(b.districtName) ||
      a.constituencyName.localeCompare(b.constituencyName) ||
      a.wardName.localeCompare(b.wardName) ||
      a.pollingStationName.localeCompare(b.pollingStationName)
    );
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

export function getTrend(electionType, levelType, levelId) {
  const fieldMap = { province: 'provinceId', district: 'districtId', constituency: 'constituencyId', ward: 'wardId', station: 'pollingStationId' };
  const field = levelType && fieldMap[levelType];
  let subs = getAllSubmissions(electionType);
  if (field && levelId) subs = subs.filter(s => s[field] === levelId);
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
