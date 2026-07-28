/**
 * API client for the BOZ Portal mobile app.
 *
 * Talks to the exact same backend the website uses — no separate mobile
 * API, no duplicated business logic. Every endpoint here already exists
 * and is already used by the web app; this is just a native client for it.
 *
 * IMPORTANT: confirm this is your backend's real public URL before
 * building for release. It's the same Railway backend domain the
 * website's frontend proxies to via /make-server-8fca9621.
 */
import * as SecureStore from 'expo-secure-store';

const API_BASE = 'https://build-one-zambia-production.up.railway.app/make-server-8fca9621';

const TOKEN_KEY = 'boz_mobile_token';
const USER_KEY = 'boz_mobile_user';

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setSession(token: string, user: Record<string, unknown>): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function getStoredUser(): Promise<Record<string, unknown> | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

async function request<T>(method: string, path: string, body?: unknown, auth = false): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }
  return data as T;
}

// ─── Auth ────────────────────────────────────────────────────────────────
// Mirrors the website's unified login exactly — one endpoint, the backend's
// response tells the app which role/dashboard the person has, same as
// DashboardLogin.tsx's routeForRole() on the web.
export interface LoginResult {
  token: string;
  user: {
    username: string;
    name?: string;
    role: string;
    active?: boolean;
    scopeId?: string;
    scopeName?: string;
    pollingStationId?: string;
    pollingStationName?: string;
    email?: string;
  };
}

export const authApi = {
  login: (username: string, password: string) =>
    request<LoginResult>('POST', '/auth/login', { username, password }),
};

// ─── Election Results (login required, per the app's design) ──────────────
export type LevelType = 'national' | 'province' | 'district' | 'constituency' | 'ward' | 'station';
export type ElectionCategory = 'presidential' | 'parliament' | 'mayoral' | 'councillor';

export interface CandidateResult {
  candidateId: string;
  votes: number;
  percentage: number;
  rank: number;
}
export interface LevelResult {
  candidates: CandidateResult[];
  totalVotesCast: number;
  registeredVoters: number;
  turnoutPercent: number;
  stationsReporting: number;
}

export const resultsApi = {
  level: (electionType: ElectionCategory, levelType: LevelType, levelId: string) =>
    request<{ result: LevelResult }>('GET', `/results/level/${electionType}/${levelType}/${encodeURIComponent(levelId)}`, undefined, true),
  national: (electionType: ElectionCategory) =>
    request<{ result: LevelResult }>('GET', `/results/national/${electionType}`, undefined, true),
};

export const candidatesApi = {
  list: (electionType: ElectionCategory, scopeId?: string) =>
    request<{ candidates: { id: string; name: string; party?: string; partyColor?: string }[] }>(
      'GET', `/candidates?electionType=${electionType}${scopeId ? `&scopeId=${scopeId}` : ''}`
    ),
};

// ─── Shop ───────────────────────────────────────────────────────────────
// The shop's product catalogue lives as static data in the website's
// ShopPage.tsx, not a backend endpoint — see src/data/products.ts for the
// mirrored list used here. Orders and payment go through the same
// backend routes the website's checkout uses.
export interface OrderItem {
  productId: number;
  name: string;
  qty: number;
  priceNum: number;
  colour?: string;
}

export const shopApi = {
  createOrder: (order: {
    items: OrderItem[];
    total: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    paymentMethod?: string;
  }) => request<{ success: boolean; order: { id: string } }>('POST', '/orders', order),

  initiatePayment: (input: { orderId: string; method: string; amount: number; phone?: string }) =>
    request<{ success: boolean; payment: { id: string; status: string } }>('POST', '/shop/payments/initiate', input),
};

export interface DashboardMe {
  username: string;
  name?: string;
  role: string;
  email?: string;
  phone?: string;
  scopeName?: string;
  active?: boolean;
}

export const accountApi = {
  me: () => request<{ user: DashboardMe }>('GET', '/auth/me', undefined, true),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ success: boolean }>('POST', '/auth/change-password', { currentPassword, newPassword }, true),
};

// ─── Voter Validation (polling agents) ─────────────────────────────────
export interface VoterSearchResult {
  found: boolean;
  mode: string;
  registeredHere?: boolean;
  voter?: {
    voterId?: string;
    nrc?: string;
    fullName?: string;
    firstName?: string;
    surname?: string;
    pollingStationId?: string;
    pollingStationName?: string;
  };
}

export const voterRollApi = {
  search: (params: { voterId?: string; nrc?: string; name?: string; pollingStationId?: string }) => {
    const qs = new URLSearchParams();
    if (params.voterId) qs.set('voterId', params.voterId);
    if (params.nrc) qs.set('nrc', params.nrc);
    if (params.name) qs.set('name', params.name);
    if (params.pollingStationId) qs.set('pollingStationId', params.pollingStationId);
    return request<VoterSearchResult>('GET', `/voter-roll/search?${qs.toString()}`, undefined, true);
  },
};

// ─── Member self-service ───────────────────────────────────────────────
export interface MemberProfile {
  id: string;
  firstName: string;
  lastName: string;
  membershipNumber?: string;
  tier?: string;
  createdAt: string;
  email?: string;
  phone?: string;
  ward?: string;
  constituency?: string;
}

export const membershipApi = {
  myProfile: () => request<{ member: MemberProfile }>('GET', '/membership/my-profile', undefined, true),
};

// ─── Self-service registration lookup (Cooperative, Chamber, Internship) ──
// Mirrors GET /registrations/:type/my on the backend — an approved
// applicant looking up their OWN application via their own auth token.
export interface RegistrationRecord {
  id: string;
  status: string;
  createdAt: string;
  [key: string]: unknown;
}

export const registrationApi = {
  my: (type: 'cooperative' | 'chamber' | 'internship' | 'intlparty') =>
    request<{ registration: RegistrationRecord }>('GET', `/registrations/${type}/my`, undefined, true),
  updateMy: (type: 'cooperative' | 'chamber' | 'internship' | 'intlparty', patch: Record<string, unknown>) =>
    request<{ success: boolean; registration: RegistrationRecord }>('PATCH', `/registrations/${type}/my`, patch, true),
};

export interface CoopCertificateMember {
  position: number;
  membershipNumber: string;
  fullName: string | null;
}
export interface CoopCertificate {
  isSample?: boolean;
  certificateNo: string;
  registrationNumber: string;
  dateOfIssue: string;
  cooperativeName: string;
  legalStatus: string;
  typeOfCooperative: string;
  registeredOffice: string;
  contactPerson: string;
  contactPhone: string;
  memberCount: number;
  members: CoopCertificateMember[];
}

export const coopApi = {
  certificate: () => request<{ certificate: CoopCertificate }>('GET', '/coop/certificate', undefined, true),
};

// ─── ECZ Official Figures (Managers) ────────────────────────────────────
export interface EczFigure {
  levelType: string;
  levelId: string;
  levelName: string;
  electionType: string;
  figures: { candidateId: string; votes: number }[];
  totalVotesCast: number;
  registeredVoters: number;
  rejectedBallots: number;
  status: string;
  savedAt: string;
}

export const eczApi = {
  get: (levelType: string, levelId: string, electionType: ElectionCategory, levelName?: string) =>
    request<{ exists: boolean; figure: EczFigure | null }>(
      'GET', `/data-entry/ecz-figures/${levelType}/${encodeURIComponent(levelId)}/${electionType}${levelName ? `?levelName=${encodeURIComponent(levelName)}` : ''}`, undefined, true
    ),
  save: (input: {
    levelType: string; levelId: string; levelName: string; electionType: ElectionCategory;
    figures: { candidateId: string; votes: number }[];
    totalVotesCast: number; registeredVoters: number; rejectedBallots: number;
    constituencyId?: string; districtId?: string; provinceId?: string;
  }) => request<{ success: boolean; figure: EczFigure }>('POST', '/data-entry/ecz-figures', input, true),
};

// ─── Level-by-level verification chain (Managers) ──────────────────────
export type VerificationLevel = 'ward' | 'constituency' | 'district' | 'province' | 'national';
export type VerificationDecision = 'approved' | 'rejected' | 'queried';

export interface VerificationStep { status: string; by: string | null; at: string | null; notes: string | null }
export interface Submission {
  id: string;
  pollingStationId: string;
  pollingStationName?: string;
  wardId?: string; constituencyId?: string; districtId?: string; provinceId?: string;
  electionType: string;
  candidateResults: { candidateId: string; votes: number }[];
  totalVotesCast: number;
  status: string;
  isOfficial: boolean;
  submittedAt: string;
  verificationChain: Record<VerificationLevel, VerificationStep>;
}

export const verificationApi = {
  listSubmissions: (filters: Record<string, string>) => {
    const qs = new URLSearchParams(filters);
    return request<{ submissions: Submission[]; count: number }>('GET', `/data-entry/submissions?${qs.toString()}`, undefined, true);
  },
  verifyLevel: (submissionId: string, level: VerificationLevel, decision: VerificationDecision, notes?: string) =>
    request<{ success: boolean; submission: Submission }>('PATCH', `/data-entry/submissions/${submissionId}/verify-level`, { level, decision, notes }, true),
};

export interface CandidateVoteInput {
  candidateId: string;
  votes: number;
}

export const dataEntryApi = {
  checkSubmission: (pollingStationId: string, electionType: ElectionCategory, round?: 'round1' | 'runoff') =>
    request<{ submitted: boolean; submittedAt?: string; status?: string; id?: string; locked?: boolean }>(
      'GET', `/data-entry/result/${encodeURIComponent(pollingStationId)}/${electionType}${round ? `?round=${round}` : ''}`, undefined, true
    ),
  submitResult: (input: {
    pollingStationId: string;
    pollingStationName?: string;
    electionType: ElectionCategory;
    candidates: CandidateVoteInput[];
    registeredVoters: number;
    rejectedBallots?: number;
    notes?: string;
  }) => request<{ success: boolean; submission: { id: string; submittedAt: string; status: string } }>('POST', '/data-entry/result', input, true),
};
