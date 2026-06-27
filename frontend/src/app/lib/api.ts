/**
 * BOZ Backend API Client
 * Points to the Node.js / Express backend.
 * All requests go through the Express proxy in server.js → BACKEND_URL.
 */

import { API_BASE } from '@/app/lib/apiBase';

const BASE = API_BASE;

const SESSION_KEY = 'boz_session_token';

export function getToken(): string | null {
  return sessionStorage.getItem(SESSION_KEY);
}

export function setToken(token: string): void {
  sessionStorage.setItem(SESSION_KEY, token);
}

export function clearToken(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

async function request<T>(method: string, path: string, body?: unknown, auth = false): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Safely parse response — backend may return plain text on rate limit or gateway errors
  let data: Record<string, unknown>;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    if (res.status === 429) {
      throw new Error('Rate limit exceeded — too many requests. Please wait a moment and try again.');
    }
    throw new Error(text || `HTTP ${res.status}`);
  }

  if (!res.ok) throw new Error((data.error as string) || (data.details as string) || `HTTP ${res.status}`);
  return data as T;
}

// ─── Candidates ───────────────────────────────────────────────────────────────

export type CandidateElectionType = 'presidential' | 'mp' | 'mayoral' | 'councillor';

export interface BackendCandidate {
  id: string;
  electionType: CandidateElectionType;
  scopeId: string;
  scopeName: string;
  name: string;
  title?: string;
  party: string;
  partyFullName?: string;
  partyColor: string;
  photoDataUrl?: string;
  ballotNumber?: number;
  gender?: 'male' | 'female' | 'other';
  bio?: string;
  age?: number;
  education?: string;
  occupation?: string;
  homeDistrict?: string;
  addedBy: string;
  addedAt: string;
  updatedAt: string;
  active: boolean;
}

export interface CandidateCreatePayload {
  electionType: CandidateElectionType;
  scopeId: string;
  scopeName: string;
  name: string;
  title?: string;
  party: string;
  partyFullName?: string;
  partyColor: string;
  photoDataUrl?: string;
  ballotNumber?: number;
  gender?: 'male' | 'female' | 'other';
  bio?: string;
  age?: number;
  education?: string;
  occupation?: string;
  homeDistrict?: string;
}

export interface CandidateStats {
  total: number;
  active: number;
  inactive: number;
  byElectionType: Record<string, number>;
  byParty: Record<string, number>;
  recentlyAdded: number;
}

export const candidatesApi = {
  /** List candidates. Pass photos=true to include base64 photos (expensive). */
  list: (filters?: {
    electionType?: CandidateElectionType;
    scopeId?: string;
    party?: string;
    active?: boolean;
    q?: string;
    photos?: boolean;
  }) => {
    const qs = new URLSearchParams();
    if (filters?.electionType) qs.set('electionType', filters.electionType);
    if (filters?.scopeId)      qs.set('scopeId', filters.scopeId);
    if (filters?.party)        qs.set('party', filters.party);
    if (filters?.active !== undefined) qs.set('active', String(filters.active));
    if (filters?.q)            qs.set('q', filters.q);
    if (filters?.photos)       qs.set('photos', 'true');
    const q = qs.toString();
    return request<{ candidates: BackendCandidate[]; count: number }>('GET', `/candidates${q ? `?${q}` : ''}`);
  },

  /** Active candidates for a specific scope, with photos */
  byScope: (electionType: CandidateElectionType, scopeId: string) =>
    request<{ candidates: BackendCandidate[]; count: number }>('GET', `/candidates/scope/${electionType}/${encodeURIComponent(scopeId)}`),

  get: (id: string) =>
    request<{ candidate: BackendCandidate }>('GET', `/candidates/${id}`),

  stats: () =>
    request<{ stats: CandidateStats }>('GET', '/candidates/stats', undefined, true),

  auditLog: (limit?: number) =>
    request<{ log: unknown[]; count: number }>('GET', `/candidates/audit${limit ? `?limit=${limit}` : ''}`, undefined, true),

  create: (payload: CandidateCreatePayload) =>
    request<{ candidate: BackendCandidate }>('POST', '/candidates', payload as unknown as Record<string, unknown>, true),

  update: (id: string, payload: Partial<CandidateCreatePayload> & { active?: boolean }) =>
    request<{ candidate: BackendCandidate }>('PATCH', `/candidates/${id}`, payload as unknown as Record<string, unknown>, true),

  updatePhoto: (id: string, photoDataUrl: string | null) =>
    request<{ candidate: BackendCandidate }>('PATCH', `/candidates/${id}/photo`, { photoDataUrl }, true),

  delete: (id: string, hard = false) =>
    request<{ success: boolean; message: string }>('DELETE', `/candidates/${id}${hard ? '?hard=true' : ''}`, undefined, true),

  restore: (id: string) =>
    request<{ candidate: BackendCandidate }>('POST', `/candidates/${id}/restore`, undefined, true),

  /** Seed the backend with candidates from mockData (one-time operation) */
  seed: (candidateList: unknown[]) =>
    request<{ success: boolean; created: number; skipped: number }>('POST', '/candidates/seed', { candidates: candidateList }, true),

  /** Direct URL to serve a candidate's photo as a binary image */
  photoUrl: (id: string) => `${BASE}/candidates/${id}/photo`,
};

// ─── ECZ Comparison Suite ─────────────────────────────────────────────────────

export interface ECZCandidateDiscrepancy {
  candidateId: string;
  eczVotes: number;
  agentVotes: number;
  diff: number;
  diffPct: number;
}

export interface ECZComparison {
  id: string;
  electionType: string;
  levelType: string;
  levelId: string;
  levelName: string;
  eczTotalVotesCast: number;
  eczRejectedBallots: number;
  agentTotalVotesCast: number;
  agentRejectedBallots: number;
  agentStationsReporting: number;
  totalVotesDiff: number;
  rejectedDiff: number;
  hasDiscrepancy: boolean;
  isFlagged: boolean;
  candidateDiscrepancies: ECZCandidateDiscrepancy[];
  enteredBy: string;
  savedAt: string;
  updatedAt: string;
}

export interface ECZComparisonsMeta {
  total: number;
  withDiscrepancy: number;
  flagged: number;
  fullyMatching: number;
}

export const eczComparisonApi = {
  summary: () =>
    request<{ summary: { total: number; byElectionType: Record<string, number>; byLevelType: Record<string, number>; latestUpdated: string | null }; count: number }>('GET', '/ecz/summary', undefined, true),

  comparisons: (filters?: { electionType?: string; levelType?: string; flaggedOnly?: boolean }) => {
    const qs = new URLSearchParams();
    if (filters?.electionType) qs.set('electionType', filters.electionType);
    if (filters?.levelType) qs.set('levelType', filters.levelType);
    if (filters?.flaggedOnly) qs.set('flaggedOnly', 'true');
    const q = qs.toString();
    return request<{ comparisons: ECZComparison[]; meta: ECZComparisonsMeta }>('GET', `/ecz/comparisons${q ? `?${q}` : ''}`, undefined, true);
  },

  singleComparison: (electionType: string, levelType: string, levelId: string) =>
    request<{ comparison: unknown }>('GET', `/ecz/comparison/${electionType}/${levelType}/${encodeURIComponent(levelId)}`, undefined, true),

  bulkSave: (figures: unknown[]) =>
    request<{ success: boolean; saved: number; failed: number; errors: string[] }>('POST', '/ecz/bulk-save', { figures }, true),

  discrepancyAnalysis: (electionType: string, levelType: string, levelId: string) =>
    request<DiscrepancyAnalysis>('GET', `/ecz/discrepancy-analysis/${electionType}/${levelType}/${encodeURIComponent(levelId)}`, undefined, true),
};

// ─── Discrepancy Analysis types ───────────────────────────────────────────────

export interface DiscrepancyCandidateAnalysis {
  candidateId: string;
  eczVotes: number;
  agentVotes: number;
  diff: number;
  diffPct: number;
  outcome: 'benefited' | 'disadvantaged' | 'neutral';
  outcomeDetail: string;
  isFlagged: boolean;
}

export interface DiscrepancyStation {
  submissionId: string;
  pollingStationId: string;
  pollingStationName: string;
  wardId: string;
  constituencyId: string;
  districtId: string;
  provinceId: string;
  status: string;
  enteredBy: string;
  submittedAt: string;
  registeredVoters: number;
  totalVotesCast: number;
  rejectedBallots: number;
  candidateVotes: { candidateId: string; votes: number }[];
  expectedTotalFromECZShare: number;
  deviation: number;
}

export interface DiscrepancyAnalysis {
  success: boolean;
  scope: { electionType: string; levelType: string; levelId: string; levelName: string };
  eczFigure: { totalVotesCast: number; rejectedBallots: number; enteredBy: string; savedAt: string };
  agentSummary: { totalVotesCast: number; rejectedBallots: number; stationsReporting: number };
  overallDiff: number;
  candidateAnalysis: DiscrepancyCandidateAnalysis[];
  benefited: string[];
  disadvantaged: string[];
  stationBreakdown: DiscrepancyStation[];
  flaggedStations: string[];
  summary: {
    totalCandidates: number;
    benefitedCount: number;
    disadvantagedCount: number;
    neutralCount: number;
    flaggedCandidates: number;
    flaggedStationsCount: number;
    totalStations: number;
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (username: string, password: string) =>
    request<{ success: boolean; token: string; user: { username: string; name: string; role: string; email?: string } }>(
      'POST', '/auth/login', { username, password }
    ),
  logout: () => request('POST', '/auth/logout', undefined, true),
  me: () => request<{ user: unknown }>('GET', '/auth/me', undefined, true),
};

// ─── Voter Verification ────────────────────────────────────────────────────────

export const voterApi = {
  verify: (fullName: string, nrcId: string, voterNumber: string) =>
    request<{ valid: boolean; message: string }>('POST', '/voter-roll/verify', { fullName, nrcId, voterNumber }),

  upload: (records: unknown[], fileName?: string) =>
    request<{ success: boolean; count: number }>('POST', '/voter-roll/upload', { records, fileName }, true),

  list: (q?: string) =>
    request<{ records: unknown[]; count: number; meta: unknown }>('GET', `/voter-roll${q ? `?q=${encodeURIComponent(q)}` : ''}`, undefined, true),

  clear: () =>
    request<{ success: boolean }>('DELETE', '/voter-roll', undefined, true),
};

// ─── Member Registration ──────────────────────────────────────────────────────

export const memberApi = {
  submit: (data: Record<string, unknown>) =>
    request<{ success: boolean; message: string; registration: unknown }>('POST', '/registrations/member', data),

  list: (filters?: Record<string, string>) => {
    const qs = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request<{ registrations: unknown[]; count: number }>('GET', `/registrations/member${qs}`, undefined, true);
  },

  updateStatus: (id: string, status: string, notes?: string) =>
    request<{ success: boolean; registration: unknown }>('PATCH', `/registrations/member/${id}/status`, { status, notes }, true),
};

// ─── Cooperative Registration ─────────────────────────────────────────────────

export const cooperativeApi = {
  submit: (data: Record<string, unknown>) =>
    request<{ success: boolean; message: string; registration: unknown }>('POST', '/registrations/cooperative', data),

  list: (filters?: Record<string, string>) => {
    const qs = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request<{ registrations: unknown[]; count: number }>('GET', `/registrations/cooperative${qs}`, undefined, true);
  },

  updateStatus: (id: string, status: string, notes?: string) =>
    request<{ success: boolean }>('PATCH', `/registrations/cooperative/${id}/status`, { status, notes }, true),
};

// ─── Polling Agent Application ────────────────────────────────────────────────

export const agentApi = {
  submit: (data: Record<string, unknown>) =>
    request<{ success: boolean; message: string; application: unknown }>('POST', '/registrations/agent', data),

  list: (filters?: Record<string, string>) => {
    const qs = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request<{ applications: unknown[]; count: number }>('GET', `/registrations/agent${qs}`, undefined, true);
  },

  updateStatus: (id: string, status: string, notes?: string) =>
    request<{ success: boolean }>('PATCH', `/registrations/agent/${id}/status`, { status, notes }, true),
};

// ─── Internship Application ───────────────────────────────────────────────────

export const internshipApi = {
  submit: (data: Record<string, unknown>) =>
    request<{ success: boolean; message: string; application: unknown }>('POST', '/registrations/internship', data),

  list: (filters?: Record<string, string>) => {
    const qs = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request<{ applications: unknown[]; count: number }>('GET', `/registrations/internship${qs}`, undefined, true);
  },

  updateStatus: (id: string, status: string, notes?: string) =>
    request<{ success: boolean }>('PATCH', `/registrations/internship/${id}/status`, { status, notes }, true),
};

// ─── Payment Gateway ─────────────────────────────────────────────────────────

export interface GatewayConfig {
  publicKey: string;
  currency: string;
  country: string;
  redirectUrl: string;
}

export interface GatewayVerifyResult {
  verified: boolean;
  status: 'successful' | 'failed' | 'pending' | 'error';
  amount?: number;
  currency?: string;
  txRef?: string;
  transactionId?: number;
  flwRef?: string;
  paymentType?: string;
  error?: string;
}

export const gatewayApi = {
  config: () =>
    request<GatewayConfig>('GET', '/gateway/config'),

  initiateMobileMoney: (data: {
    orderId: string;
    amount: number;
    phone: string;
    network: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  }) =>
    request<{ success: boolean; txRef: string; status: string; message: string; error?: string }>(
      'POST', '/gateway/mobile-money', data
    ),

  verifyByTxRef: (txRef: string) =>
    request<{ result: GatewayVerifyResult }>('GET', `/gateway/verify/${encodeURIComponent(txRef)}`),

  verifyCard: (data: { transactionId: number; txRef: string; orderId: string }) =>
    request<{ success: boolean; verified: boolean; result: GatewayVerifyResult }>(
      'POST', '/gateway/verify-card', data
    ),
};

// ─── Email ────────────────────────────────────────────────────────────────────

export const emailApi = {
  test: (to: string) =>
    request<{ success: boolean; id?: string; error?: string }>('POST', '/email/test', { to }, true),

  resendOrder: (orderId: string) =>
    request<{ success: boolean; id?: string; error?: string }>('POST', `/email/resend/order/${orderId}`, undefined, true),

  resendPayment: (paymentRef: string) =>
    request<{ success: boolean; id?: string; error?: string }>('POST', `/email/resend/payment/${paymentRef}`, undefined, true),
};

// ─── Shop ─────────────────────────────────────────────────────────────────────

export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  priceNum: number;
  category: string;
  imageUrl?: string;
  hasCustomImage: boolean;
  inStock: boolean;
  stockQty: number | null;
  tags: string[];
  active: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShopPayment {
  id: string;
  orderId: string;
  method: 'card' | 'airtel' | 'zamtel' | 'mtn';
  amount: number;
  phone?: string;
  cardLast4?: string;
  paymentRef: string;
  status: 'pending' | 'confirmed' | 'failed' | 'expired';
  initiatedAt: string;
  confirmedAt?: string;
  failedAt?: string;
  gatewayRef?: string;
}

export interface ShopStats {
  totalRevenue: number;
  orderCount: number;
  ordersByStatus: Record<string, number>;
  paymentsByMethod: Record<string, number>;
  topProducts: { name: string; qty: number; revenue: number }[];
  recentOrders: number;
  pendingPayments: number;
  productCount: number;
  activeProducts: number;
}

export interface ShopOrder {
  id: string;
  items: { id: string; name: string; price: string; priceNum: number; qty: number }[];
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress?: string;
  paymentMethod: 'card' | 'airtel' | 'zamtel' | 'mtn';
  paymentRef?: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  submittedAt: string;
  updatedAt: string;
}

export const shopApi = {
  // Products
  listProducts: (params?: { category?: string; search?: string; featured?: boolean; includeInactive?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.search) qs.set('search', params.search);
    if (params?.featured) qs.set('featured', 'true');
    if (params?.includeInactive) qs.set('includeInactive', 'true');
    const q = qs.toString();
    return request<{ products: ShopProduct[]; count: number }>('GET', `/shop/products${q ? '?' + q : ''}`, undefined, false);
  },

  getProduct: (id: string) =>
    request<{ product: ShopProduct }>('GET', `/shop/products/${id}`),

  productImageUrl: (id: string) => `${BASE}/shop/products/${id}/image`,

  createProduct: (data: Partial<ShopProduct> & { imageDataUrl?: string }) =>
    request<{ success: boolean; product: ShopProduct }>('POST', '/shop/products', data, true),

  updateProduct: (id: string, patch: Partial<ShopProduct> & { imageDataUrl?: string }) =>
    request<{ success: boolean; product: ShopProduct }>('PATCH', `/shop/products/${id}`, patch, true),

  uploadProductImage: (id: string, imageDataUrl: string) =>
    request<{ success: boolean }>('PATCH', `/shop/products/${id}/image`, { imageDataUrl }, true),

  deleteProduct: (id: string) =>
    request<{ success: boolean }>('DELETE', `/shop/products/${id}`, undefined, true),

  restoreProduct: (id: string) =>
    request<{ success: boolean; product: ShopProduct }>('POST', `/shop/products/${id}/restore`, undefined, true),

  seedProducts: () =>
    request<{ success: boolean; seeded: number; skipped: number }>('POST', '/shop/products/seed', undefined, true),

  // Payments
  initiatePayment: (data: { orderId: string; method: string; amount: number; phone?: string; cardLast4?: string }) =>
    request<{ success: boolean; payment: ShopPayment }>('POST', '/shop/payments/initiate', data),

  getPayment: (ref: string) =>
    request<{ payment: ShopPayment }>('GET', `/shop/payments/${ref}`),

  confirmPayment: (ref: string, gatewayRef?: string) =>
    request<{ success: boolean; payment: ShopPayment }>('POST', `/shop/payments/${ref}/confirm`, { gatewayRef }),

  failPayment: (ref: string, reason?: string) =>
    request<{ success: boolean; payment: ShopPayment }>('POST', `/shop/payments/${ref}/fail`, { reason }, true),

  listPayments: (filters?: { status?: string; method?: string }) => {
    const qs = new URLSearchParams();
    if (filters?.status) qs.set('status', filters.status);
    if (filters?.method) qs.set('method', filters.method);
    const q = qs.toString();
    return request<{ payments: ShopPayment[]; count: number }>('GET', `/shop/payments${q ? '?' + q : ''}`, undefined, true);
  },

  // Stats
  getStats: () =>
    request<{ stats: ShopStats }>('GET', '/shop/stats', undefined, true),
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export const ordersApi = {
  create: (data: Record<string, unknown>) =>
    request<{ success: boolean; message: string; order: unknown }>('POST', '/orders', data),

  list: (filters?: Record<string, string>) => {
    const qs = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request<{ orders: unknown[]; count: number }>('GET', `/orders${qs}`, undefined, true);
  },

  updateStatus: (id: string, status: string, paymentRef?: string) =>
    request<{ success: boolean }>('PATCH', `/orders/${id}/status`, { status, paymentRef }, true),
};

// ─── Donations ────────────────────────────────────────────────────────────────

export const donationApi = {
  submit: (data: Record<string, unknown>) =>
    request<{ success: boolean; message: string; donation: unknown }>('POST', '/donations', data),

  list: () =>
    request<{ donations: unknown[]; count: number; stats: { total: number; count: number; byMethod: Record<string, number> } }>('GET', '/donations', undefined, true),
};

// ─── Contact ──────────────────────────────────────────────────────────────────

export const contactApi = {
  send: (data: Record<string, unknown>) =>
    request<{ success: boolean; message: string }>('POST', '/contact', data),

  list: () =>
    request<{ messages: unknown[]; count: number; unread: number }>('GET', '/contact', undefined, true),

  markRead: (id: string) =>
    request<{ success: boolean }>('PATCH', `/contact/${id}/read`, undefined, true),
};

// ─── Document Library ─────────────────────────────────────────────────────────

export interface DocumentMeta {
  id: string;
  title: string;
  description?: string;
  category: string;
  format: string;
  mimeType: string;
  originalName: string;
  sizeBytes: number;
  pages?: number;
  version?: string;
  tags?: string[];
  featured: boolean;
  downloadCount: number;
  uploadedBy: string;
  uploadedAt: string;
  updatedAt: string;
  hasContent: boolean;
  externalUrl?: string;
}

export const documentsApi = {
  list: (filters?: Record<string, string>) => {
    const qs = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request<{ documents: DocumentMeta[]; count: number }>('GET', `/documents${qs}`);
  },

  getMeta: (id: string) =>
    request<{ document: DocumentMeta }>('GET', `/documents/${id}/meta`),

  upload: (data: {
    title: string;
    description?: string;
    category: string;
    mimeType: string;
    originalName: string;
    sizeBytes: number;
    pages?: number;
    version?: string;
    featured: boolean;
    tags?: string[];
    dataUrl?: string;
    externalUrl?: string;
  }) => request<{ success: boolean; document: DocumentMeta }>('POST', '/documents', data as unknown as Record<string, unknown>, true),

  update: (id: string, data: Record<string, unknown>) =>
    request<{ success: boolean; document: DocumentMeta }>('PATCH', `/documents/${id}`, data, true),

  delete: (id: string) =>
    request<{ success: boolean }>('DELETE', `/documents/${id}`, undefined, true),

  stats: () =>
    request<{ stats: { total: number; totalDownloads: number; byFormat: Record<string, number>; byCategory: Record<string, number> } }>('GET', '/documents/stats', undefined, true),

  /** Returns the direct URL for downloading/viewing a document */
  downloadUrl: (id: string) => `${BASE}/documents/${id}/download`,
  viewUrl: (id: string) => `${BASE}/documents/${id}/view`,
};

// ─── Data Entry ───────────────────────────────────────────────────────────────

export interface DocumentPayload {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  base64: string;
  uploadedAt: string;
}

export interface CandidateVotePayload {
  candidateId: string;
  votes: number;
}

export const dataEntryApi = {
  submitResult: (data: {
    electionType: string;
    provinceId: string;
    districtId: string;
    constituencyId: string;
    wardId: string;
    pollingStationId: string;
    pollingStationName?: string;
    registeredVoters: number;
    // totalVotesCast is auto-computed by the backend: sum(candidateVotes) + rejectedBallots
    rejectedBallots: number;
    candidateVotes: CandidateVotePayload[];
    documents: DocumentPayload[];
    enteredBy: string;
  }) => request<{ success: boolean; message: string; submission: { id: string; submittedAt: string; status: string } }>('POST', '/data-entry/result', data as unknown as Record<string, unknown>),

  getVoterTurnout: (electionType?: string) => {
    const qs = electionType ? `?electionType=${electionType}` : '';
    return request<{ stats: unknown }>('GET', `/data-entry/turnout${qs}`);
  },

  checkSubmission: (pollingStationId: string, electionType: string) =>
    request<{ submitted: boolean; submittedAt?: string; status?: string; id?: string }>('GET', `/data-entry/result/${encodeURIComponent(pollingStationId)}/${electionType}`),

  listSubmissions: (filters?: Record<string, string>) => {
    const qs = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request<{ submissions: unknown[]; count: number }>('GET', `/data-entry/submissions${qs}`, undefined, true);
  },

  getSubmission: (id: string) =>
    request<{ submission: unknown }>('GET', `/data-entry/submissions/${id}`, undefined, true),

  updateSubmissionStatus: (id: string, status: string, notes?: string) =>
    request<{ success: boolean; submission: unknown }>('PATCH', `/data-entry/submissions/${id}/status`, { status, notes }, true),

  getStats: () =>
    request<{ stats: unknown }>('GET', '/data-entry/stats', undefined, true),

  saveECZFigure: (data: {
    levelType: string;
    levelId: string;
    levelName: string;
    electionType: string;
    totalVotesCast: number;
    rejectedBallots: number;
    figures: CandidateVotePayload[];
    enteredBy: string;
  }) => request<{ success: boolean; figure: unknown }>('POST', '/data-entry/ecz-figures', data as unknown as Record<string, unknown>, true),

  getECZFigure: (levelType: string, levelId: string, electionType: string) =>
    request<{ exists: boolean; figure: unknown }>('GET', `/data-entry/ecz-figures/${levelType}/${encodeURIComponent(levelId)}/${electionType}`, undefined, true),

  listECZFigures: (filters?: Record<string, string>) => {
    const qs = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request<{ figures: unknown[]; count: number }>('GET', `/data-entry/ecz-figures${qs}`, undefined, true);
  },

  deleteECZFigure: (levelType: string, levelId: string, electionType: string) =>
    request<{ success: boolean }>('DELETE', `/data-entry/ecz-figures/${levelType}/${encodeURIComponent(levelId)}/${electionType}`, undefined, true),

  getAuditLog: (limit = 200) =>
    request<{ entries: unknown[]; count: number }>('GET', `/data-entry/audit-log?limit=${limit}`, undefined, true),
};

// ─── Live Streaming ───────────────────────────────────────────────────────────

export const streamApi = {
  list: (filters?: Record<string, string>) => {
    const qs = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request<{ streams: unknown[]; count: number }>('GET', `/streams${qs}`);
  },

  get: (id: string) =>
    request<{ stream: unknown }>('GET', `/streams/${id}`),

  create: (data: Record<string, unknown>) =>
    request<{ success: boolean; stream: unknown }>('POST', '/streams', data, true),

  update: (id: string, data: Record<string, unknown>) =>
    request<{ success: boolean; stream: unknown }>('PATCH', `/streams/${id}`, data, true),

  setStatus: (id: string, status: string) =>
    request<{ success: boolean; stream: unknown }>('PATCH', `/streams/${id}/status`, { status }, true),

  delete: (id: string) =>
    request<{ success: boolean }>('DELETE', `/streams/${id}`, undefined, true),

  stats: () =>
    request<{ stats: unknown }>('GET', '/streams/stats', undefined, true),

  recordView: (id: string) =>
    request<{ success: boolean }>('POST', `/streams/${id}/view`),

  getComments: (id: string) =>
    request<{ comments: unknown[]; count: number }>('GET', `/streams/${id}/comments`),

  postComment: (id: string, name: string, message: string) =>
    request<{ success: boolean; comment: unknown }>('POST', `/streams/${id}/comments`, { name, message }),

  deleteComment: (streamId: string, commentId: string) =>
    request<{ success: boolean }>('DELETE', `/streams/${streamId}/comments/${commentId}`, undefined, true),
};

// ─── Results Engine ───────────────────────────────────────────────────────────

export type ElectionCategory = 'presidential' | 'parliament' | 'mayoral' | 'councillor';
export type LevelType = 'national' | 'province' | 'district' | 'constituency' | 'ward' | 'station';

export interface CandidateTally {
  candidateId: string;
  votes: number;
  percentage: number;
  rank: number;
  swing?: number;
}

export interface LevelResult {
  electionType: ElectionCategory;
  levelType: LevelType;
  levelId: string;
  stationsReporting: number;
  registeredVoters: number;
  totalVotesCast: number;
  validVotes: number;
  rejectedBallots: number;
  turnoutPercent: number;
  candidates: CandidateTally[];
  leadingCandidateId: string | null;
  margin: number;
  marginPercent: number;
  submissionBreakdown: { total: number; verified: number; pending: number; queried: number; rejected: number };
  computedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  candidateId: string;
  totalVotes: number;
  percentage: number;
  stationsWon: number;
  provinceLeads: string[];
  swing: number | null;
}

export interface NationalLeaderboard {
  electionType: ElectionCategory;
  candidates: LeaderboardEntry[];
  totalStationsReporting: number;
  totalVotes: number;
  computedAt: string;
}

export interface CoverageStats {
  electionType: string;
  total: number;
  verified: number;
  pending: number;
  queried: number;
  rejected: number;
  verifiedPercent: number;
  byProvince: Record<string, { submitted: number; verified: number; pending: number; totalVotesCast: number }>;
  byDistrict: Record<string, { submitted: number; verified: number; pending: number; totalVotesCast: number }>;
  trend: { hour: string; submitted: number; verified: number; cumulative: number }[];
}

export interface Discrepancy {
  candidateId: string;
  bozVotes: number;
  eczVotes: number;
  diff: number;
  diffPercent: number;
}

export interface ComparisonResult {
  electionType: string;
  levelType: string;
  levelId: string;
  boz: LevelResult | null;
  ecz: unknown;
  discrepancies: Discrepancy[];
  totalVotesDiff: number;
  totalVotesDiffPercent: number;
  agreementPercent: number;
  flagged: boolean;
}

export interface LiveFeedEntry {
  submissionId: string;
  pollingStationId: string;
  pollingStationName: string;
  electionType: ElectionCategory;
  provinceId: string;
  districtId: string;
  totalVotesCast: number;
  status: string;
  enteredBy: string;
  submittedAt: string;
  candidateCount: number;
  topCandidateId: string | null;
}

export interface HeatMapPoint {
  levelId: string;
  leadingCandidateId: string | null;
  votes: number;
  turnoutPercent: number;
  stationsReporting: number;
  totalVotesCast: number;
}

export interface VoteTrendPoint {
  hour: string;
  cumulativeVotes: Record<string, number>;
  cumulativeTotal: number;
}

export interface DashboardSummary {
  lastUpdated: string;
  elections: { presidential: LevelResult; parliament: LevelResult; mayoral: LevelResult; councillor: LevelResult };
  coverage: CoverageStats;
  recentActivity: LiveFeedEntry[];
}

export const resultsApi = {
  dashboard: () =>
    request<{ summary: DashboardSummary }>('GET', '/results/dashboard'),

  national: (electionType: ElectionCategory, statuses?: string) =>
    request<{ result: LevelResult }>('GET', `/results/national/${electionType}${statuses ? `?statuses=${statuses}` : ''}`),

  level: (electionType: ElectionCategory, levelType: LevelType, levelId: string, statuses?: string) =>
    request<{ result: LevelResult }>('GET', `/results/level/${electionType}/${levelType}/${encodeURIComponent(levelId)}${statuses ? `?statuses=${statuses}` : ''}`),

  breakdownProvince: (electionType: ElectionCategory) =>
    request<{ breakdown: Record<string, LevelResult> }>('GET', `/results/breakdown/${electionType}/province`),

  breakdownDistrict: (electionType: ElectionCategory, provinceId: string) =>
    request<{ breakdown: Record<string, LevelResult> }>('GET', `/results/breakdown/${electionType}/district/${encodeURIComponent(provinceId)}`),

  breakdownConstituency: (electionType: ElectionCategory, districtId: string) =>
    request<{ breakdown: Record<string, LevelResult> }>('GET', `/results/breakdown/${electionType}/constituency/${encodeURIComponent(districtId)}`),

  breakdownWard: (electionType: ElectionCategory, constituencyId: string) =>
    request<{ breakdown: Record<string, LevelResult> }>('GET', `/results/breakdown/${electionType}/ward/${encodeURIComponent(constituencyId)}`),

  leaderboard: (electionType: ElectionCategory) =>
    request<{ leaderboard: NationalLeaderboard }>('GET', `/results/leaderboard/${electionType}`),

  coverage: (electionType?: ElectionCategory) =>
    request<{ stats: CoverageStats }>('GET', `/results/coverage${electionType ? `?electionType=${electionType}` : ''}`),

  compare: (electionType: ElectionCategory, levelType: LevelType, levelId: string) =>
    request<{ comparison: ComparisonResult }>('GET', `/results/compare/${electionType}/${levelType}/${encodeURIComponent(levelId)}`, undefined, true),

  heatmap: (electionType: ElectionCategory) =>
    request<{ heatmap: HeatMapPoint[] }>('GET', `/results/heatmap/${electionType}`),

  trend: (electionType: ElectionCategory) =>
    request<{ trend: VoteTrendPoint[] }>('GET', `/results/trend/${electionType}`),

  liveFeed: (limit?: number, electionType?: ElectionCategory) => {
    const qs = new URLSearchParams();
    if (limit) qs.set('limit', String(limit));
    if (electionType) qs.set('electionType', electionType);
    const q = qs.toString();
    return request<{ feed: LiveFeedEntry[] }>('GET', `/results/live-feed${q ? `?${q}` : ''}`);
  },

  invalidateCache: (pattern?: string) =>
    request<{ success: boolean }>('POST', '/results/cache/invalidate', { pattern }, true),
};

// ─── News & Posts ─────────────────────────────────────────────────────────────

export type PostCategory = 'NEWS' | 'ANNOUNCEMENT' | 'PRESS_RELEASE' | 'CAMPAIGN_UPDATE' | 'MEDIA';
export type PostStatus = 'draft' | 'published' | 'archived';

export interface Post {
  id: string;
  title: string;
  slug: string;
  category: PostCategory;
  status: PostStatus;
  summary: string;
  body: string;
  coverImageUrl?: string;
  hasCustomImage: boolean;
  tags: string[];
  featured: boolean;
  author: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
}

export interface PostListItem extends Omit<Post, 'body'> {}

export interface NewsStats {
  total: number;
  published: number;
  drafts: number;
  archived: number;
  featured: number;
  byCategory: Record<string, number>;
}

export const newsApi = {
  postImageUrl: (id: string) => `${BASE}/news/posts/${id}/image`,

  listPosts: (params?: { category?: PostCategory; status?: PostStatus | 'all'; featured?: boolean; search?: string; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.status)   qs.set('status', params.status);
    if (params?.featured !== undefined) qs.set('featured', String(params.featured));
    if (params?.search)   qs.set('search', params.search);
    if (params?.limit)    qs.set('limit', String(params.limit));
    if (params?.offset)   qs.set('offset', String(params.offset));
    const q = qs.toString();
    return request<{ posts: PostListItem[]; total: number }>('GET', `/news/posts${q ? '?' + q : ''}`, undefined, false);
  },

  getPost: (id: string) =>
    request<{ post: Post }>('GET', `/news/posts/${id}`),

  getStats: () =>
    request<NewsStats>('GET', '/news/posts/stats', undefined, true),

  createPost: (data: Partial<Post> & { imageDataUrl?: string }) =>
    request<{ success: boolean; post: Post }>('POST', '/news/posts', data, true),

  updatePost: (id: string, patch: Partial<Post> & { imageDataUrl?: string }) =>
    request<{ success: boolean; post: Post }>('PATCH', `/news/posts/${id}`, patch, true),

  uploadImage: (id: string, imageDataUrl: string) =>
    request<{ success: boolean }>('PATCH', `/news/posts/${id}/image`, { imageDataUrl }, true),

  publish: (id: string) =>
    request<{ success: boolean; post: Post }>('PATCH', `/news/posts/${id}/publish`, {}, true),

  unpublish: (id: string) =>
    request<{ success: boolean; post: Post }>('PATCH', `/news/posts/${id}/unpublish`, {}, true),

  archivePost: (id: string) =>
    request<{ success: boolean }>('DELETE', `/news/posts/${id}`, undefined, true),

  hardDeletePost: (id: string) =>
    request<{ success: boolean }>('DELETE', `/news/posts/${id}/hard`, undefined, true),
};

// ─── Membership ───────────────────────────────────────────────────────────────

export type MemberStatus = 'active' | 'suspended' | 'expired' | 'pending';
export type MemberTier   = 'basic' | 'standard' | 'gold' | 'platinum';

export interface Member {
  id: string;
  membershipNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationalId?: string;
  dob?: string;
  gender?: string;
  province: string;
  district: string;
  constituency: string;
  ward: string;
  pollingStation?: string;
  address?: string;
  status: MemberStatus;
  tier: MemberTier;
  joinDate: string;
  subscriptionExpiry?: string;
  adoptionGranted: boolean;
  adoptionGrantedAt?: string;
  adoptionGrantedBy?: string;
  adoptionGrantedByTitle?: string;
  adoptionReason?: string;
  adoptionCertNumber?: string;
  electionPosition?: 'presidential' | 'mp' | 'mayoral' | 'councillor';
  electionYear?: number;
  adoptionProvince?: string;
  adoptionDistrict?: string;
  adoptionConstituency?: string;
  adoptionWard?: string;
  shopOrderIds: string[];
  memberDiscountPct: number;
  createdAt: string;
  updatedAt: string;
}

export interface MemberStats {
  total: number;
  active: number;
  adoptionGranted: number;
  byTier: Record<MemberTier, number>;
  byProvince: Record<string, number>;
}

export interface MembershipCert {
  certificateType: 'membership';
  membershipNumber: string;
  fullName: string;
  tier: string;
  province: string;
  district: string;
  constituency: string;
  ward: string;
  joinDate: string;
  status: string;
  issuedAt: string;
}

export interface AdoptionCert {
  eligible: boolean;
  reason?: string;
  certificateType?: 'adoption';
  membershipNumber?: string;
  adoptionCertNumber?: string;
  fullName?: string;
  tier?: string;
  province?: string;
  district?: string;
  constituency?: string;
  ward?: string;
  joinDate?: string;
  electionPosition?: 'presidential' | 'mp' | 'mayoral' | 'councillor';
  electionYear?: number;
  adoptionProvince?: string;
  adoptionDistrict?: string;
  adoptionConstituency?: string;
  adoptionWard?: string;
  adoptionGrantedAt?: string;
  adoptionGrantedBy?: string;
  adoptionGrantedByTitle?: string;
  adoptionReason?: string;
  issuedAt?: string;
}

export const membershipApi = {
  register: (data: Partial<Member>) =>
    request<{ success: boolean; member: Member }>('POST', '/membership/register', data),

  getMe: (emailOrNumber: string, byNumber = false) => {
    const qs = byNumber ? `number=${encodeURIComponent(emailOrNumber)}` : `email=${encodeURIComponent(emailOrNumber)}`;
    return request<{ member: Member; eligibility: { membership: { eligible: boolean; reason?: string }; adoption: { eligible: boolean; reason?: string } } }>('GET', `/membership/me?${qs}`);
  },

  listMembers: (params?: { status?: MemberStatus; tier?: MemberTier; province?: string; search?: string; adopted?: boolean; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status)   qs.set('status', params.status);
    if (params?.tier)     qs.set('tier', params.tier);
    if (params?.province) qs.set('province', params.province);
    if (params?.search)   qs.set('search', params.search);
    if (params?.adopted !== undefined) qs.set('adopted', String(params.adopted));
    if (params?.limit)    qs.set('limit', String(params.limit));
    if (params?.offset)   qs.set('offset', String(params.offset));
    const q = qs.toString();
    return request<{ members: Member[]; total: number }>('GET', `/membership/members${q ? '?' + q : ''}`, undefined, true);
  },

  getMember: (id: string) =>
    request<{ member: Member }>('GET', `/membership/members/${id}`, undefined, true),

  updateMember: (id: string, patch: Partial<Member>) =>
    request<{ success: boolean; member: Member }>('PATCH', `/membership/members/${id}`, patch, true),

  grantAdoption: (id: string, data: {
    grantedBy: string;
    grantedByTitle?: string;
    electionPosition: 'presidential' | 'mp' | 'mayoral' | 'councillor';
    electionYear: number;
    adoptionProvince?: string;
    adoptionDistrict?: string;
    adoptionConstituency?: string;
    adoptionWard?: string;
    reason?: string;
  }) =>
    request<{ success: boolean; member: Member }>('POST', `/membership/members/${id}/grant-adoption`, data, true),

  revokeAdoption: (id: string) =>
    request<{ success: boolean; member: Member }>('POST', `/membership/members/${id}/revoke-adoption`, {}, true),

  linkOrder: (id: string, orderId: string) =>
    request<{ success: boolean }>('POST', `/membership/members/${id}/link-order`, { orderId }, true),

  getStats: () =>
    request<MemberStats>('GET', '/membership/stats', undefined, true),

  getMembershipCert: (emailOrNumber: string, byNumber = false) => {
    const qs = byNumber ? `number=${encodeURIComponent(emailOrNumber)}` : `email=${encodeURIComponent(emailOrNumber)}`;
    return request<MembershipCert>('GET', `/membership/certificate/membership?${qs}`);
  },

  getAdoptionCert: (emailOrNumber: string, byNumber = false) => {
    const qs = byNumber ? `number=${encodeURIComponent(emailOrNumber)}` : `email=${encodeURIComponent(emailOrNumber)}`;
    return request<AdoptionCert>('GET', `/membership/certificate/adoption?${qs}`);
  },
};

// ─── Leadership ───────────────────────────────────────────────────────────────

export type LeaderTier = 'national' | 'provincial' | 'district' | 'youth' | 'women';

export interface Leader {
  id: string;
  tier: LeaderTier;
  name: string;
  position: string;
  description: string;
  province?: string;
  district?: string;
  order: number;
  hasCustomImage: boolean;
  imageUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const leadershipApi = {
  imageUrl: (id: string) => `${BASE}/leadership/${id}/image`,

  list: (params?: { tier?: LeaderTier; province?: string; includeInactive?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.tier)    qs.set('tier', params.tier);
    if (params?.province) qs.set('province', params.province);
    if (params?.includeInactive) qs.set('includeInactive', 'true');
    const q = qs.toString();
    return request<{ leaders: Leader[] }>('GET', `/leadership${q ? '?' + q : ''}`);
  },

  get: (id: string) =>
    request<{ leader: Leader }>('GET', `/leadership/${id}`),

  create: (data: Partial<Leader> & { imageDataUrl?: string }) =>
    request<{ success: boolean; leader: Leader }>('POST', '/leadership', data, true),

  update: (id: string, patch: Partial<Leader> & { imageDataUrl?: string }) =>
    request<{ success: boolean; leader: Leader }>('PATCH', `/leadership/${id}`, patch, true),

  uploadImage: (id: string, imageDataUrl: string) =>
    request<{ success: boolean }>('PATCH', `/leadership/${id}/image`, { imageDataUrl }, true),

  reorder: (orderedIds: string[]) =>
    request<{ success: boolean }>('POST', '/leadership/reorder', { orderedIds }, true),

  deactivate: (id: string) =>
    request<{ success: boolean }>('DELETE', `/leadership/${id}`, undefined, true),

  hardDelete: (id: string) =>
    request<{ success: boolean }>('DELETE', `/leadership/${id}/hard`, undefined, true),

  seed: () =>
    request<{ success: boolean; seeded: number; skipped: number }>('POST', '/leadership/seed', {}, true),
};

// ─── OTP ──────────────────────────────────────────────────────────────────────

export const otpApi = {
  send: (recipient: string, type: 'sms' | 'email', purpose: string) =>
    request<{ success: boolean; otpId: string; expiresAt: string }>('POST', '/otp/send', { recipient, type, purpose }),

  verify: (recipient: string, code: string, purpose: string) =>
    request<{ success: boolean; verified: boolean }>('POST', '/otp/verify', { recipient, code, purpose }),
};

// ─── Chambers ────────────────────────────────────────────────────────────────

export type AmendmentStatus = 'pending' | 'approved' | 'rejected';
export type AmendmentField =
  | 'name' | 'location' | 'description' | 'contactEmail' | 'contactPhone'
  | 'website' | 'sectors' | 'memberBusinesses' | 'wardId' | 'districtId' | 'provinceId';

export interface ChamberInfo {
  id: string;
  name: string;
  location: string;
  wardId?: string;
  districtId?: string;
  provinceId?: string;
  type: 'ward' | 'district' | 'provincial' | 'national';
  established?: string;
  memberBusinesses?: number;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  description?: string;
  sectors: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChamberAmendment {
  id: string;
  chamberId: string;
  chamberName: string;
  submittedBy: string;
  submittedAt: string;
  status: AmendmentStatus;
  field: AmendmentField;
  fieldLabel: string;
  currentValue: string;
  proposedValue: string;
  reason: string;
  reviewedBy?: string;
  reviewedAt?: string;
  adminNote?: string;
}

export interface ChamberStats {
  total: number;
  byType: Record<string, number>;
  pendingAmendments: number;
}

export const chambersApi = {
  list: (params?: { type?: string; wardId?: string; districtId?: string; provinceId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.type)       qs.set('type', params.type);
    if (params?.wardId)     qs.set('wardId', params.wardId);
    if (params?.districtId) qs.set('districtId', params.districtId);
    if (params?.provinceId) qs.set('provinceId', params.provinceId);
    const q = qs.toString();
    return request<{ chambers: ChamberInfo[] }>('GET', `/chambers${q ? '?' + q : ''}`, undefined, true);
  },

  get: (id: string) =>
    request<{ chamber: ChamberInfo }>('GET', `/chambers/${id}`, undefined, true),

  getByWard: (wardId: string) =>
    request<{ success: boolean; chamber: ChamberInfo | null }>('GET', `/chambers/ward/${wardId}`, undefined, true),

  create: (data: Partial<ChamberInfo>) =>
    request<{ success: boolean; chamber: ChamberInfo }>('POST', '/chambers', data, true),

  update: (id: string, data: Partial<ChamberInfo>) =>
    request<{ success: boolean; chamber: ChamberInfo }>('PATCH', `/chambers/${id}`, data, true),

  getStats: () =>
    request<{ success: boolean; stats: ChamberStats }>('GET', '/chambers/stats', undefined, true),

  // Amendments
  submitAmendment: (data: {
    chamberId: string;
    chamberName: string;
    field: AmendmentField;
    fieldLabel: string;
    currentValue: string;
    proposedValue: string;
    reason: string;
  }) => request<{ success: boolean; amendment: ChamberAmendment }>('POST', '/chambers/amendments', data, true),

  listAmendments: (params?: { chamberId?: string; status?: AmendmentStatus }) => {
    const qs = new URLSearchParams();
    if (params?.chamberId) qs.set('chamberId', params.chamberId);
    if (params?.status)    qs.set('status', params.status);
    const q = qs.toString();
    return request<{ amendments: ChamberAmendment[]; total: number }>('GET', `/chambers/amendments${q ? '?' + q : ''}`, undefined, true);
  },

  reviewAmendment: (id: string, decision: 'approved' | 'rejected', adminNote?: string) =>
    request<{ success: boolean; amendment: ChamberAmendment }>('PATCH', `/chambers/amendments/${id}/review`, { decision, adminNote }, true),
};

// ─── Registration Approval ────────────────────────────────────────────────────

export type RegStatus = 'pending' | 'approved' | 'rejected';
export type RegType   = 'member' | 'cooperative' | 'internship' | 'agent';

export interface MemberReg {
  id: string;
  fullName: string;
  nrcId: string;
  phone: string;
  email?: string;
  province: string;
  district: string;
  constituency: string;
  ward: string;
  address: string;
  membershipType: string;
  status: RegStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface CoopReg {
  id: string;
  cooperativeName: string;
  representativeName: string;
  phone: string;
  email?: string;
  province: string;
  district: string;
  ward: string;
  sector: string;
  memberCount: number;
  status: RegStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface InternshipReg {
  id: string;
  fullName: string;
  membershipNumber: string;
  university: string;
  course: string;
  yearOfStudy: string;
  phone: string;
  email?: string;
  status: RegStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface AgentReg {
  id: string;
  fullName: string;
  nrcId: string;
  phone: string;
  email?: string;
  province: string;
  district: string;
  pollingStation: string;
  status: RegStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface GeneratedCredentials {
  username: string;
  password: string;
  role: string;
  generatedAt: string;
}

export interface RegStats {
  member:      { pending: number; approved: number; rejected: number; total: number };
  cooperative: { pending: number; approved: number; rejected: number; total: number };
  internship:  { pending: number; approved: number; rejected: number; total: number };
  agent:       { pending: number; approved: number; rejected: number; total: number };
}

export const registrationApi = {
  getStats: () =>
    request<{ success: boolean; stats: RegStats }>('GET', '/registrations/stats', undefined, true),

  // Member
  listMembers: (status?: RegStatus) => {
    const q = status ? `?status=${status}` : '';
    return request<{ registrations: MemberReg[]; count: number }>('GET', `/registrations/member${q}`, undefined, true);
  },
  approveMember: (id: string, status: RegStatus, notes?: string) =>
    request<{ success: boolean; registration: MemberReg; credentials: GeneratedCredentials | null }>('PATCH', `/registrations/member/${id}/status`, { status, notes }, true),
  getMemberCredentials: (id: string) =>
    request<{ success: boolean; credentials: GeneratedCredentials; fullName: string }>('GET', `/registrations/member/${id}/credentials`),

  // Cooperative
  listCoops: (status?: RegStatus) => {
    const q = status ? `?status=${status}` : '';
    return request<{ registrations: CoopReg[]; count: number }>('GET', `/registrations/cooperative${q}`, undefined, true);
  },
  approveCoop: (id: string, status: RegStatus, notes?: string) =>
    request<{ success: boolean; registration: CoopReg; credentials: GeneratedCredentials | null }>('PATCH', `/registrations/cooperative/${id}/status`, { status, notes }, true),
  getCoopCredentials: (id: string) =>
    request<{ success: boolean; credentials: GeneratedCredentials; fullName: string }>('GET', `/registrations/cooperative/${id}/credentials`),

  // Internship
  listInterns: (status?: RegStatus) => {
    const q = status ? `?status=${status}` : '';
    return request<{ applications: InternshipReg[]; count: number }>('GET', `/registrations/internship${q}`, undefined, true);
  },
  approveIntern: (id: string, status: RegStatus, notes?: string) =>
    request<{ success: boolean; application: InternshipReg; credentials: GeneratedCredentials | null }>('PATCH', `/registrations/internship/${id}/status`, { status, notes }, true),
  getInternCredentials: (id: string) =>
    request<{ success: boolean; credentials: GeneratedCredentials; fullName: string }>('GET', `/registrations/internship/${id}/credentials`),

  // Agent
  listAgents: (status?: RegStatus) => {
    const q = status ? `?status=${status}` : '';
    return request<{ applications: AgentReg[]; count: number }>('GET', `/registrations/agent${q}`, undefined, true);
  },
  approveAgent: (id: string, status: RegStatus, notes?: string) =>
    request<{ success: boolean; application: AgentReg; credentials: GeneratedCredentials | null }>('PATCH', `/registrations/agent/${id}/status`, { status, notes }, true),
  getAgentCredentials: (id: string) =>
    request<{ success: boolean; credentials: GeneratedCredentials; fullName: string }>('GET', `/registrations/agent/${id}/credentials`),

  // Selfie retrieval (admin only)
  getMemberSelfie: (id: string) =>
    request<{ success: boolean; dataUrl: string; storedAt: string }>('GET', `/registrations/member/${id}/selfie`, undefined, true),
  getCoopSelfie: (id: string) =>
    request<{ success: boolean; dataUrl: string; storedAt: string }>('GET', `/registrations/cooperative/${id}/selfie`, undefined, true),
  getInternSelfie: (id: string) =>
    request<{ success: boolean; dataUrl: string; storedAt: string }>('GET', `/registrations/internship/${id}/selfie`, undefined, true),
  getAgentSelfie: (id: string) =>
    request<{ success: boolean; dataUrl: string; storedAt: string }>('GET', `/registrations/agent/${id}/selfie`, undefined, true),

  submitCooperative: (data: Record<string, unknown>) =>
    request<{ success: boolean; registration: CoopReg }>('POST', '/registrations/cooperative', data),
  submitInternship: (data: Record<string, unknown>) =>
    request<{ success: boolean; application: InternshipReg }>('POST', '/registrations/internship', data),

  // Membership validation (public — called before form submission)
  validateMembership: (number: string) =>
    request<{ valid: boolean; fullName?: string; membershipNumber?: string; status?: string; error?: string }>(
      'GET', `/registrations/validate-membership?number=${encodeURIComponent(number)}`
    ),
  validateMemberships: (numbers: string[]) =>
    request<{ results: Record<string, { valid: boolean; fullName?: string; error?: string }>; invalidCount: number; invalidNumbers: string[] }>(
      'POST', '/registrations/validate-memberships', { numbers }
    ),
};

// ─── Security API ─────────────────────────────────────────────────────────────

export type AuditSeverity = 'info' | 'warn' | 'critical';

export interface AuditEvent {
  id: string;
  type: string;
  timestamp: string;
  actor?: string;
  ip?: string;
  userAgent?: string;
  target?: string;
  detail?: string;
  severity: AuditSeverity;
  metadata?: Record<string, unknown>;
}

export interface BlockedIP {
  ip: string;
  reason: string;
  blockedAt: string;
  expiresAt?: string;
  blockedBy?: string;
}

export interface ActiveSession {
  username: string;
  token: string;
  role: string;
  createdAt: string;
  expiresAt: number;
  ip?: string;
  userAgent?: string;
  valid: boolean;
}

export interface SecurityStats {
  lockedAccounts: number;
  blockedIPs: number;
  auditEntries: number;
  activeSessions: number;
  recentFailedLogins: number;
}

export const securityApi = {
  getStats: () =>
    request<{ success: boolean; stats: SecurityStats }>('GET', '/security/stats', undefined, true),

  getAuditLog: (params?: { type?: string; actor?: string; ip?: string; severity?: string; limit?: number; offset?: number }) => {
    const q = params ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString() : '';
    return request<{ success: boolean; events: AuditEvent[]; total: number }>('GET', `/security/audit-log${q}`, undefined, true);
  },

  getBlockedIPs: () =>
    request<{ success: boolean; blockedIPs: BlockedIP[]; count: number }>('GET', '/security/blocked-ips', undefined, true),

  blockIP: (ip: string, reason: string, durationHours?: number) =>
    request<{ success: boolean; message: string }>('POST', '/security/block-ip', { ip, reason, durationHours }, true),

  unblockIP: (ip: string) =>
    request<{ success: boolean; message: string }>('DELETE', `/security/block-ip/${encodeURIComponent(ip)}`, undefined, true),

  getSessions: () =>
    request<{ success: boolean; sessions: ActiveSession[]; count: number }>('GET', '/security/sessions', undefined, true),

  revokeAllSessions: () =>
    request<{ success: boolean; message: string }>('DELETE', '/security/sessions/all', undefined, true),

  unlockAccount: (username: string) =>
    request<{ success: boolean; message: string }>('POST', '/security/unlock-account', { username }, true),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ success: boolean; message: string }>('POST', '/security/change-password', { currentPassword, newPassword }, true),

  deactivateUser: (username: string) =>
    request<{ success: boolean; message: string }>('POST', '/security/deactivate-user', { username }, true),
};

// ─── Press Statements ─────────────────────────────────────────────────────────

export type PressType = 'press-release' | 'letter' | 'media-statement' | 'communique';

export interface PressStatement {
  id: string;
  type: PressType;
  title: string;
  summary: string;
  date: string;
  year: number;
  author?: string;
  tags?: string[];
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: string;
  uploadedAt: string;
  updatedAt: string;
  downloadCount: number;
  published: boolean;
}

export interface PressUploadPayload {
  type: PressType;
  title: string;
  summary: string;
  date: string;
  author?: string;
  tags?: string[];
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  published?: boolean;
  pdfDataUrl: string;
}

export const pressApi = {
  /** Public: list published statements */
  list: (filters?: { type?: PressType; year?: number }) => {
    const qs = new URLSearchParams();
    if (filters?.type) qs.set('type', filters.type);
    if (filters?.year) qs.set('year', String(filters.year));
    const q = qs.toString();
    return request<{ success: boolean; statements: PressStatement[]; count: number }>('GET', `/press${q ? `?${q}` : ''}`);
  },

  /** Public: available years */
  years: () =>
    request<{ success: boolean; years: number[] }>('GET', '/press/years'),

  /** Admin: list all (including unpublished) */
  adminList: (filters?: { type?: PressType; year?: number }) => {
    const qs = new URLSearchParams();
    if (filters?.type) qs.set('type', filters.type);
    if (filters?.year) qs.set('year', String(filters.year));
    const q = qs.toString();
    return request<{ success: boolean; statements: PressStatement[]; count: number }>('GET', `/press/admin${q ? `?${q}` : ''}`, undefined, true);
  },

  /** Admin: upload new statement */
  upload: (payload: PressUploadPayload) =>
    request<{ success: boolean; statement: PressStatement }>('POST', '/press', payload as unknown as Record<string, unknown>, true),

  /** Admin: update metadata or PDF */
  update: (id: string, updates: Partial<PressUploadPayload>) =>
    request<{ success: boolean; statement: PressStatement }>('PATCH', `/press/${id}`, updates as unknown as Record<string, unknown>, true),

  /** Admin: delete */
  delete: (id: string) =>
    request<{ success: boolean; message: string }>('DELETE', `/press/${id}`, undefined, true),

  /** Public: download PDF (returns dataUrl) */
  download: (id: string) =>
    request<{ success: boolean; dataUrl: string; fileName: string; mimeType: string }>('GET', `/press/${id}/download`),
};
