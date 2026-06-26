/**
 * Leadership Module — manages national and provincial party leadership.
 * Seeded on first run with the eight founding national leaders.
 */

import { kv } from './db.js';
import { randomUUID } from 'crypto';

function uid() {
  return `ldr_${Date.now().toString(36)}_${randomUUID().slice(0, 6)}`;
}

function getIndex() { return kv.get('boz:leadership:index') || []; }
function setIndex(ids) { kv.set('boz:leadership:index', ids); }

// ─── CRUD ───────────────────────────────────────────────────────────────────

export function listLeaders(filters = {}) {
  const index = getIndex();
  let leaders = index
    .map(id => kv.get(`boz:leadership:member:${id}`))
    .filter(Boolean)
    .filter(l => l.active !== false);

  if (filters.tier) leaders = leaders.filter(l => l.tier === filters.tier);
  if (filters.province) leaders = leaders.filter(l => l.province === filters.province);

  return leaders.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export function getLeader(id) {
  return kv.get(`boz:leadership:member:${id}`);
}

export function getLeaderImage(id) {
  return kv.get(`boz:leadership:image:${id}`);
}

export function createLeader(input) {
  const id = uid();
  const now = new Date().toISOString();
  const leader = {
    id,
    tier: input.tier || 'national',
    name: (input.name || '').trim(),
    position: (input.position || '').trim(),
    description: (input.description || '').trim(),
    province: input.province,
    district: input.district,
    order: input.order ?? 99,
    hasCustomImage: false,
    imageUrl: input.imageUrl || '',
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  kv.set(`boz:leadership:member:${id}`, leader);

  if (input.imageDataUrl) {
    kv.set(`boz:leadership:image:${id}`, input.imageDataUrl);
    leader.hasCustomImage = true;
    kv.set(`boz:leadership:member:${id}`, leader);
  }

  setIndex([...getIndex(), id]);
  return leader;
}

export function updateLeader(id, input) {
  const leader = getLeader(id);
  if (!leader) return null;

  const updated = {
    ...leader,
    ...Object.fromEntries(
      Object.entries(input).filter(([, v]) => v !== undefined)
    ),
    updatedAt: new Date().toISOString(),
  };
  kv.set(`boz:leadership:member:${id}`, updated);
  return updated;
}

export function updateLeaderImage(id, dataUrl) {
  const leader = getLeader(id);
  if (!leader) return null;
  kv.set(`boz:leadership:image:${id}`, dataUrl);
  const updated = { ...leader, hasCustomImage: true, updatedAt: new Date().toISOString() };
  kv.set(`boz:leadership:member:${id}`, updated);
  return updated;
}

export function deleteLeader(id) {
  const leader = getLeader(id);
  if (!leader) return false;
  kv.set(`boz:leadership:member:${id}`, { ...leader, active: false, updatedAt: new Date().toISOString() });
  return true;
}

export function hardDeleteLeader(id) {
  kv.del(`boz:leadership:member:${id}`);
  kv.del(`boz:leadership:image:${id}`);
  setIndex(getIndex().filter(i => i !== id));
}

export function reorderLeaders(orderings) {
  // orderings: [{id, order}]
  for (const { id, order } of orderings) {
    const l = getLeader(id);
    if (l) kv.set(`boz:leadership:member:${id}`, { ...l, order });
  }
}

// ─── Seed ───────────────────────────────────────────────────────────────────

/**
 * Seed the eight founding national leaders with their actual images served
 * as static files from /uploads/leaders/  (the public/ images are copied there).
 */
export function seedLeaders(baseUrl) {
  if (getIndex().length > 0) return; // already seeded

  const leaders = [
    {
      name: 'Vincent Kafula',
      position: 'Presidential Candidate',
      description: 'Founder and Presidential Candidate of Build One Zambia. Vincent leads the movement with a vision of infrastructure-led development and inclusive growth for every Zambian.',
      imageUrl: `${baseUrl}/uploads/leaders/vincent-kafula.png`,
      order: 1,
    },
    {
      name: 'Mukubesa Mundia',
      position: 'Deputy President',
      description: 'Assist the President in executing the strategic mandate of the party and coordinating national leadership activities.',
      imageUrl: `${baseUrl}/uploads/leaders/mukubesa-mundia.png`,
      order: 2,
    },
    {
      name: 'Mulaza Kaira',
      position: 'Secretary General',
      description: 'Manage the day-to-day administrative operations of the party and ensure the effective implementation of all party decisions.',
      imageUrl: `${baseUrl}/uploads/leaders/mulaza-kaira.png`,
      order: 3,
    },
    {
      name: 'Scart Chansa Kantanta',
      position: 'Deputy Secretary General',
      description: 'Assist the Secretary General in managing party administration and coordinate inter-provincial communication.',
      imageUrl: `${baseUrl}/uploads/leaders/scart-chansa-kantanta.png`,
      order: 4,
    },
    {
      name: 'Gary Nkombo',
      position: 'Chairperson',
      description: 'Preside over all NEC and General Council meetings and provide strategic oversight of party governance.',
      imageUrl: `${baseUrl}/uploads/leaders/gary-nkombo.png`,
      order: 5,
    },
    {
      name: 'Willah Mudolo',
      position: 'Deputy Chairperson',
      description: 'Act as Chairperson in his absence and assist in coordinating party meetings and governance activities.',
      imageUrl: `${baseUrl}/uploads/leaders/willah-mudolo.png`,
      order: 6,
    },
    {
      name: "Christopher Kang'ombe",
      position: 'Treasurer General',
      description: 'Oversee financial management of all national party funds and ensure fiscal accountability and transparency.',
      imageUrl: `${baseUrl}/uploads/leaders/christopher-kangombe.png`,
      order: 7,
    },
    {
      name: 'Joseph Kalimbwe',
      position: 'Deputy Treasurer General',
      description: 'Assist the Treasurer General in managing national finances and ensure proper record-keeping across all provinces.',
      imageUrl: `${baseUrl}/uploads/leaders/joseph-kalimbwe.png`,
      order: 8,
    },
  ];

  for (const l of leaders) {
    createLeader({ ...l, tier: 'national' });
  }
}
