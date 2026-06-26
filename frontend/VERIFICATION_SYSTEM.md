# ECZ Verification System - Data Model Documentation

## Overview

This document describes the multi-level verification and signature system implemented for the Zambian Elections 2026 application. The system ensures that ECZ (Electoral Commission of Zambia) returning officers can verify and sign results at each hierarchical level.

## Verification Levels

The verification system operates at 6 hierarchical levels:

1. **Polling Station Level** - Verifies: Presidential, MP, Mayoral, Ward Councillor
2. **Ward Level** - Verifies: Presidential, MP, Mayoral, Ward Councillor
3. **Constituency Level** - Verifies: Presidential, MP, Mayoral
4. **District Level** - Verifies: Presidential, Mayoral
5. **Province Level** - Verifies: Presidential
6. **National Level** - Verifies: Presidential

## Data Structure

### ResultVerification Interface

```typescript
interface ResultVerification {
  verified: boolean;
  returningOfficer?: {
    name: string;
    ecztId: string;
    role: string;
  };
  signature?: string; // Base64 image or signature ID
  officialDocumentUrl?: string; // URL to uploaded official ECZ form
  timestamp?: string;
  autoCalculationMatch: boolean; // Whether system calculation matches official document
  notes?: string;
}
```

### Updated Interfaces

Each hierarchical level now includes an optional `verification` field:

#### PollingStation

```typescript
verification?: {
  presidential?: ResultVerification;
  mp?: ResultVerification;
  mayoral?: ResultVerification;
  councillor?: ResultVerification;
}
```

#### Ward

```typescript
verification?: {
  presidential?: ResultVerification;
  mp?: ResultVerification;
  mayoral?: ResultVerification;
  councillor?: ResultVerification;
}
councillorCandidates?: Candidate[]; // Added for ward councillor elections
```

#### Constituency

```typescript
verification?: {
  presidential?: ResultVerification;
  mp?: ResultVerification;
  mayoral?: ResultVerification;
}
```

#### District

```typescript
verification?: {
  presidential?: ResultVerification;
  mayoral?: ResultVerification;
}
```

#### Province

```typescript
verification?: {
  presidential?: ResultVerification;
}
```

#### National (New Interface)

```typescript
interface NationalResults {
  provinces: Province[];
  verification?: {
    presidential?: ResultVerification;
  };
}
```

## Helper Functions

### Verification Creation

- `createVerification()` - Creates a verification object with optional officer details

### Candidate Generators

- `generateCouncillorCandidates()` - Generates ward councillor candidates

### Verification Checks

- `areAllStationsVerified()` - Check if all polling stations in a ward are verified
- `areAllWardsVerified()` - Check if all wards in a constituency are verified
- `getWardVerificationSummary()` - Get verification summary for a ward
- `getConstituencyVerificationSummary()` - Get verification summary for a constituency
- `getStationsWithCalculationMismatches()` - Find stations where system calculations don't match official documents
- `getOverallVerificationProgress()` - Get verification progress across all levels

## Example Usage

### Example Verified Polling Station

```typescript
export const exampleVerifiedPollingStation: PollingStation = {
  id: "lusaka-kabwata-olympia-001",
  name: "Olympia Primary School-01",
  // ... other fields ...
  verification: {
    presidential: createVerification(
      true,
      "John Mwanza",
      "ECZ-PS-12345",
      "Polling Station Returning Officer",
    ),
    mp: createVerification(
      true,
      "John Mwanza",
      "ECZ-PS-12345",
      "Polling Station Returning Officer",
    ),
    mayoral: createVerification(
      true,
      "John Mwanza",
      "ECZ-PS-12345",
      "Polling Station Returning Officer",
    ),
    councillor: createVerification(
      true,
      "John Mwanza",
      "ECZ-PS-12345",
      "Polling Station Returning Officer",
    ),
  },
};
```

## Workflow

### 1. Polling Station Level

- Agent captures results from physical ECZ forms
- Agent uploads official ECZ document
- System auto-calculates totals from entered data
- Polling Station Returning Officer reviews:
  - Presidential results
  - MP results
  - Mayoral results
  - Ward Councillor results
- Officer signs each result type
- System marks verification status and timestamp

### 2. Ward Level

- System aggregates all polling station results in the ward
- Ward Returning Officer reviews aggregated results
- Officer verifies system calculations match ward totals
- Officer signs for: Presidential, MP, Mayoral, Ward Councillor
- System marks ward-level verification

### 3. Constituency Level

- System aggregates all ward results in the constituency
- Constituency Returning Officer reviews
- Officer signs for: Presidential, MP, Mayoral
- System marks constituency-level verification

### 4. District Level

- System aggregates all constituency results in the district
- District Returning Officer reviews
- Officer signs for: Presidential, Mayoral
- System marks district-level verification

### 5. Province Level

- System aggregates all district results in the province
- Provincial Returning Officer reviews
- Officer signs for: Presidential only
- System marks province-level verification

### 6. National Level

- System aggregates all provincial results
- National Returning Officer reviews final presidential results
- Officer signs final presidential results
- System marks national-level verification complete

## Key Features

### Auto-Calculation Matching

- `autoCalculationMatch` field tracks whether system calculations align with official ECZ documents
- Mismatches trigger alerts for manual review
- Helps identify data entry errors or discrepancies

### Document Management

- `officialDocumentUrl` stores links to uploaded ECZ forms
- Provides audit trail and evidence
- Allows verification of original source documents

### Audit Trail

- `timestamp` records when verification occurred
- `returningOfficer` captures who performed verification
- `signature` provides non-repudiation

## Next Steps

To complete the verification system implementation, you'll need to:

1. **UI Components**
   - Create signature capture components
   - Build document upload interfaces
   - Design verification status dashboards
   - Create verification approval screens for returning officers

2. **Authentication & Authorization**
   - Implement user roles (Polling Station RO, Ward RO, Constituency RO, District RO, Provincial RO, National RO)
   - Add permission checks for verification actions
   - Implement digital signature mechanisms

3. **Backend Integration**
   - API endpoints for verification submission
   - Document storage and retrieval
   - Real-time verification status updates
   - Notification system for verification requests

4. **Reporting & Dashboards**
   - Verification progress tracking
   - Mismatch alerts and reports
   - Verification audit logs
   - Real-time verification status by region

5. **Security Considerations**
   - Digital signature validation
   - Document integrity checks
   - Access control and permissions
   - Audit logging for all verification actions

## File Modified

- `src/app/data/mockData.ts` - Added verification interfaces, helper functions, and examples