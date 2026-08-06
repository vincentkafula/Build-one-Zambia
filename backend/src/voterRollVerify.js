/**
 * Voter roll verification — pure matching logic, separated from the route
 * handler in index.js so it can be unit tested without Express or kv.
 *
 * SECURITY: requires an exact match on name, NRC, AND voter number. The
 * previous implementation matched on NRC alone OR a case-insensitive
 * substring match on name alone, and returned the full matched record
 * (including NRC) to an unauthenticated caller — effectively a voter-roll
 * lookup tool. This only confirms a match for someone who already knows
 * all three of their own details, and callers should never be given back
 * more than a boolean + message (see index.js route handler).
 */

function normalize(value) {
  return String(value || '').replace(/[\s\-/]/g, '').toLowerCase();
}

/**
 * @param {Array<object>} roll - voter roll records (fullName/name, nrcId/nrc, voterNumber)
 * @param {{ name?: string, nrcId?: string, voterNumber?: string }} query
 * @returns {object|null} the matching record, or null if no exact match
 */
export function findExactVoterMatch(roll, { name, nrcId, voterNumber } = {}) {
  if (!Array.isArray(roll) || !name || !nrcId || !voterNumber) return null;
  return roll.find(v =>
    normalize(v.nrcId ?? v.nrc) === normalize(nrcId) &&
    normalize(v.voterNumber) === normalize(voterNumber) &&
    String(v.fullName ?? v.name ?? '').toLowerCase().trim() === String(name).toLowerCase().trim()
  ) || null;
}
