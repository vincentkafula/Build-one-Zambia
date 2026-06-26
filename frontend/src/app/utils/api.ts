/**
 * API Client for Zambian Election Results Backend
 * Provides type-safe methods to interact with the backend API
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8fca9621`;

// ============================================================================
// TYPES
// ============================================================================

export interface User {
  username: string;
  role: 'admin' | 'agent' | 'intern' | 'viewer';
  name: string;
  email?: string;
  provinceId?: string;
  districtId?: string;
  constituencyId?: string;
  wardId?: string;
  pollingStationId?: string;
  chamberId?: string;
}

export interface CandidateResult {
  candidateId: string;
  votes: number;
}

export interface PollingStationResult {
  pollingStationId: string;
  wardId: string;
  constituencyId: string;
  districtId: string;
  provinceId: string;
  registeredVoters: number;
  totalVotes: number;
  totalRejected: number;
  candidateResults: CandidateResult[];
  submittedBy: string;
  submittedAt: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  category: 'presidential' | 'parliamentary' | 'mayoral' | 'councillor';
}

export interface AggregatedResults {
  level: 'national' | 'provincial' | 'district' | 'constituency' | 'ward';
  id: string;
  name: string;
  totalRegisteredVoters: number;
  totalVotes: number;
  totalRejected: number;
  turnoutPercentage: number;
  candidateResults: Array<{
    candidateId: string;
    candidateName: string;
    party: string;
    votes: number;
    percentage: number;
  }>;
  stationsReported: number;
  totalStations: number;
  reportingPercentage: number;
  lastUpdated: string;
}

export interface Chamber {
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
}

export interface InternshipProgram {
  id: string;
  chamberId: string;
  title: string;
  description: string;
  duration: string;
  positions: number;
  requirements: string[];
  benefits: string[];
  applicationDeadline?: string;
  status: 'open' | 'closed' | 'upcoming';
  sector: string;
  stipend?: number;
  currency?: string;
}

export interface InternshipApplication {
  id: string;
  programId: string;
  chamberId: string;
  applicantUsername: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  resume?: string;
  coverLetter: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'withdrawn';
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface PartnershipRequest {
  id: string;
  zambianChamberId: string;
  usChamberId: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'declined' | 'active';
  purpose: string;
  expectedOutcomes: string[];
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

class APIClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Try to load token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // Use token if available, otherwise use public anon key
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    } else {
      headers['Authorization'] = `Bearer ${publicAnonKey}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || error.details || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const response = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
    this.setToken(null);
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  async registerUser(userData: {
    username: string;
    password: string;
    name: string;
    email?: string;
    role: string;
    provinceId?: string;
    districtId?: string;
    constituencyId?: string;
    wardId?: string;
    pollingStationId?: string;
    chamberId?: string;
  }): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async listUsers(): Promise<{ users: User[] }> {
    return this.request<{ users: User[] }>('/auth/users');
  }

  // ============================================================================
  // ELECTION RESULTS
  // ============================================================================

  async submitResults(result: Omit<PollingStationResult, 'submittedBy' | 'submittedAt' | 'verified'>): Promise<{ result: PollingStationResult }> {
    return this.request<{ result: PollingStationResult }>('/results/submit', {
      method: 'POST',
      body: JSON.stringify(result),
    });
  }

  async submitBatchResults(results: Array<Omit<PollingStationResult, 'submittedBy' | 'submittedAt' | 'verified'>>): Promise<{
    successful: number;
    failed: Array<{ index: number; error: string }>;
  }> {
    return this.request<{ successful: number; failed: Array<{ index: number; error: string }> }>('/results/batch-submit', {
      method: 'POST',
      body: JSON.stringify({ results }),
    });
  }

  async getStationResults(stationId: string, category: string): Promise<{ result: PollingStationResult }> {
    return this.request<{ result: PollingStationResult }>(`/results/station/${stationId}/${category}`);
  }

  async verifyResults(stationId: string, category: string): Promise<{ result: PollingStationResult }> {
    return this.request<{ result: PollingStationResult }>(`/results/verify/${stationId}/${category}`, {
      method: 'POST',
    });
  }

  async getAggregatedResults(
    category: string,
    level: 'national' | 'provincial' | 'district' | 'constituency' | 'ward',
    id?: string
  ): Promise<{ result: AggregatedResults }> {
    const endpoint = id 
      ? `/results/aggregated/${category}/${level}/${id}`
      : `/results/aggregated/${category}/${level}`;
    return this.request<{ result: AggregatedResults }>(endpoint);
  }

  async getResultsSummary(category: string): Promise<{
    summary: {
      totalSubmitted: number;
      totalVerified: number;
      totalPending: number;
      byProvince: Record<string, { submitted: number; verified: number }>;
    }
  }> {
    return this.request<{
      summary: {
        totalSubmitted: number;
        totalVerified: number;
        totalPending: number;
        byProvince: Record<string, { submitted: number; verified: number }>;
      }
    }>(`/results/summary/${category}`);
  }

  async searchResults(criteria: {
    category: string;
    provinceId?: string;
    districtId?: string;
    constituencyId?: string;
    wardId?: string;
    verified?: boolean;
    submittedBy?: string;
  }): Promise<{ results: PollingStationResult[]; count: number }> {
    return this.request<{ results: PollingStationResult[]; count: number }>('/results/search', {
      method: 'POST',
      body: JSON.stringify(criteria),
    });
  }

  // ============================================================================
  // CHAMBERS OF COMMERCE
  // ============================================================================

  async createChamber(chamber: Omit<Chamber, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ chamber: Chamber }> {
    return this.request<{ chamber: Chamber }>('/chambers', {
      method: 'POST',
      body: JSON.stringify(chamber),
    });
  }

  async getChamber(chamberId: string): Promise<{ chamber: Chamber }> {
    return this.request<{ chamber: Chamber }>(`/chambers/${chamberId}`);
  }

  async listChambers(filters?: {
    type?: string;
    provinceId?: string;
    districtId?: string;
    wardId?: string;
    sector?: string;
  }): Promise<{ chambers: Chamber[]; count: number }> {
    const params = new URLSearchParams(filters as Record<string, string>);
    return this.request<{ chambers: Chamber[]; count: number }>(`/chambers?${params}`);
  }

  async updateChamber(chamberId: string, updates: Partial<Chamber>): Promise<{ chamber: Chamber }> {
    return this.request<{ chamber: Chamber }>(`/chambers/${chamberId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // ============================================================================
  // INTERNSHIP PROGRAMS
  // ============================================================================

  async createInternshipProgram(program: Omit<InternshipProgram, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ program: InternshipProgram }> {
    return this.request<{ program: InternshipProgram }>('/internships', {
      method: 'POST',
      body: JSON.stringify(program),
    });
  }

  async getInternshipProgram(programId: string): Promise<{ program: InternshipProgram }> {
    return this.request<{ program: InternshipProgram }>(`/internships/${programId}`);
  }

  async listInternshipPrograms(filters?: {
    chamberId?: string;
    status?: string;
    sector?: string;
  }): Promise<{ programs: InternshipProgram[]; count: number }> {
    const params = new URLSearchParams(filters as Record<string, string>);
    return this.request<{ programs: InternshipProgram[]; count: number }>(`/internships?${params}`);
  }

  async updateInternshipProgram(programId: string, updates: Partial<InternshipProgram>): Promise<{ program: InternshipProgram }> {
    return this.request<{ program: InternshipProgram }>(`/internships/${programId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async applyToInternship(application: Omit<InternshipApplication, 'id' | 'appliedAt' | 'status' | 'applicantUsername'>): Promise<{ application: InternshipApplication }> {
    return this.request<{ application: InternshipApplication }>('/internships/apply', {
      method: 'POST',
      body: JSON.stringify(application),
    });
  }

  async listApplications(filters?: {
    programId?: string;
    chamberId?: string;
    status?: string;
  }): Promise<{ applications: InternshipApplication[]; count: number }> {
    const params = new URLSearchParams(filters as Record<string, string>);
    return this.request<{ applications: InternshipApplication[]; count: number }>(`/applications?${params}`);
  }

  async updateApplicationStatus(
    applicationId: string,
    status: InternshipApplication['status'],
    notes?: string
  ): Promise<{ application: InternshipApplication }> {
    return this.request<{ application: InternshipApplication }>(`/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  // ============================================================================
  // US CHAMBERS & PARTNERSHIPS
  // ============================================================================

  async listUSChambers(filters?: {
    state?: string;
    sector?: string;
  }): Promise<{ chambers: any[]; count: number }> {
    const params = new URLSearchParams(filters as Record<string, string>);
    return this.request<{ chambers: any[]; count: number }>(`/us-chambers?${params}`);
  }

  async createPartnershipRequest(request: {
    zambianChamberId: string;
    usChamberId: string;
    purpose: string;
    expectedOutcomes: string[];
  }): Promise<{ partnership: PartnershipRequest }> {
    return this.request<{ partnership: PartnershipRequest }>('/partnerships', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async listPartnershipRequests(filters?: {
    zambianChamberId?: string;
    usChamberId?: string;
    status?: string;
  }): Promise<{ partnerships: PartnershipRequest[]; count: number }> {
    const params = new URLSearchParams(filters as Record<string, string>);
    return this.request<{ partnerships: PartnershipRequest[]; count: number }>(`/partnerships?${params}`);
  }

  async updatePartnershipStatus(
    partnershipId: string,
    status: PartnershipRequest['status'],
    notes?: string
  ): Promise<{ partnership: PartnershipRequest }> {
    return this.request<{ partnership: PartnershipRequest }>(`/partnerships/${partnershipId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  // ============================================================================
  // SYSTEM STATISTICS
  // ============================================================================

  async getSystemStats(): Promise<{
    stats: {
      users: { total: number; byRole: Record<string, number> };
      chambers: { total: number; byType: Record<string, number> };
      internships: { total: number; byStatus: Record<string, number> };
      applications: { total: number; byStatus: Record<string, number> };
      results: any;
    };
    timestamp: string;
  }> {
    return this.request<{
      stats: {
        users: { total: number; byRole: Record<string, number> };
        chambers: { total: number; byType: Record<string, number> };
        internships: { total: number; byStatus: Record<string, number> };
        applications: { total: number; byStatus: Record<string, number> };
        results: any;
      };
      timestamp: string;
    }>('/data/stats');
  }

  // ============================================================================
  // OTP (ONE-TIME PIN)
  // ============================================================================

  async sendOTP(
    recipient: string,
    type: 'sms' | 'email',
    purpose: 'login' | 'registration' | 'verification' | 'password-reset' | 'transaction',
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; message: string; otpId?: string; expiresAt?: number }> {
    return this.request<{ success: boolean; message: string; otpId?: string; expiresAt?: number }>('/otp/send', {
      method: 'POST',
      body: JSON.stringify({ recipient, type, purpose, metadata }),
    });
  }

  async verifyOTP(
    recipient: string,
    code: string,
    purpose: 'login' | 'registration' | 'verification' | 'password-reset' | 'transaction'
  ): Promise<{ success: boolean; message: string; verified: boolean }> {
    return this.request<{ success: boolean; message: string; verified: boolean }>('/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ recipient, code, purpose }),
    });
  }

  async resendOTP(
    recipient: string,
    purpose: 'login' | 'registration' | 'verification' | 'password-reset' | 'transaction'
  ): Promise<{ success: boolean; message: string; expiresAt?: number }> {
    return this.request<{ success: boolean; message: string; expiresAt?: number }>('/otp/resend', {
      method: 'POST',
      body: JSON.stringify({ recipient, purpose }),
    });
  }

  async cancelOTP(
    recipient: string,
    purpose: 'login' | 'registration' | 'verification' | 'password-reset' | 'transaction'
  ): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/otp/cancel', {
      method: 'POST',
      body: JSON.stringify({ recipient, purpose }),
    });
  }

  async getOTPStatus(otpId: string): Promise<{ otp: any }> {
    return this.request<{ otp: any }>(`/otp/status/${otpId}`);
  }

  async cleanupExpiredOTPs(): Promise<{ success: boolean; message: string; cleaned: number }> {
    return this.request<{ success: boolean; message: string; cleaned: number }>('/otp/cleanup', {
      method: 'POST',
    });
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const api = new APIClient(API_BASE_URL);

// Export for use in components
export default api;