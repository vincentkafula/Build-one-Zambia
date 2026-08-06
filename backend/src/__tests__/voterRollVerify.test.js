import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findExactVoterMatch } from '../voterRollVerify.js';

const roll = [
  { fullName: 'Jane Mwansa', nrcId: '123456/78/1', voterNumber: 'VN-001', pollingStation: 'Lusaka Central' },
  { fullName: 'John Banda', nrcId: '111222/33/1', voterNumber: 'VN-002', pollingStation: 'Kabwata' },
];

test('returns the record when name, NRC, and voter number all match exactly', () => {
  const match = findExactVoterMatch(roll, { name: 'Jane Mwansa', nrcId: '123456/78/1', voterNumber: 'VN-001' });
  assert.ok(match);
  assert.equal(match.pollingStation, 'Lusaka Central');
});

test('matches are case-, whitespace-, and separator-insensitive on NRC and voter number', () => {
  // NRC is stored as '123456/78/1' but a caller might type it with spaces
  // or hyphens instead of slashes — these should still be treated as the
  // same NRC, not as a mismatch.
  const match = findExactVoterMatch(roll, { name: 'Jane Mwansa', nrcId: '123456 78 1', voterNumber: 'vn-001' });
  assert.ok(match);
  const match2 = findExactVoterMatch(roll, { name: 'Jane Mwansa', nrcId: '123456-78-1', voterNumber: 'VN001' });
  assert.ok(match2);
});

test('does NOT match on NRC alone if the name is wrong', () => {
  // Regression test: the old implementation matched on `nrc === body.nrc`
  // with no name check at all, which let anyone who knew (or guessed) a
  // valid NRC retrieve that voter's full record.
  const match = findExactVoterMatch(roll, { name: 'Someone Else', nrcId: '123456/78/1', voterNumber: 'VN-001' });
  assert.equal(match, null);
});

test('does NOT match on a name substring alone', () => {
  // Regression test: the old implementation used
  // `v.name.includes(body.name)`, so a short/partial name plus no NRC
  // could still return a hit. Every field must now match exactly.
  const match = findExactVoterMatch(roll, { name: 'Jane', nrcId: 'wrong', voterNumber: 'wrong' });
  assert.equal(match, null);
});

test('returns null when any required field is missing', () => {
  assert.equal(findExactVoterMatch(roll, { name: 'Jane Mwansa', nrcId: '123456/78/1' }), null);
  assert.equal(findExactVoterMatch(roll, {}), null);
});

test('returns null for a non-array roll instead of throwing', () => {
  assert.equal(findExactVoterMatch(null, { name: 'a', nrcId: 'b', voterNumber: 'c' }), null);
  assert.equal(findExactVoterMatch(undefined, { name: 'a', nrcId: 'b', voterNumber: 'c' }), null);
});
