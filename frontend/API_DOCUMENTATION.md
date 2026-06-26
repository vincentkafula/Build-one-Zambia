# Zambian Election Results Backend API Documentation

## Overview

This is a comprehensive backend system for the Zambian Election Results website, built with enterprise-grade architecture and best practices.

**Base URL**: `https://{projectId}.supabase.co/functions/v1/make-server-8fca9621`

**Architecture**: Three-tier architecture (Frontend → Server → Database)
- **Frontend**: React application
- **Server**: Deno + Hono web server running on Supabase Edge Functions
- **Database**: Key-Value store with optimized indexing

## Authentication

Most endpoints require authentication. After logging in, you'll receive a token that must be included in subsequent requests.

### Authorization Header Format
```
Authorization: Bearer {your-token}
```

### Admin Credentials
- Username: `Bozplans`
- Password: `Wakuca55`

## API Endpoints

### 1. Authentication

#### POST `/auth/login`
Authenticate user and receive session token.

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response**:
```json
{
  "success": true,
  "token": "session-token-here",
  "user": {
    "username": "Bozplans",
    "name": "System Administrator",
    "role": "admin",
    "email": "admin@buildonezambia.org"
  }
}
```

**Status Codes**:
- 200: Success
- 400: Missing credentials
- 401: Invalid credentials

---

#### POST `/auth/logout`
Logout user and invalidate session.

**Headers**: Requires authentication

**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### GET `/auth/me`
Get current authenticated user information.

**Headers**: Requires authentication

**Response**:
```json
{
  "user": {
    "username": "Bozplans",
    "name": "System Administrator",
    "role": "admin",
    "email": "admin@buildonezambia.org"
  }
}
```

---

#### POST `/auth/register`
Register a new user (admin only).

**Headers**: Requires authentication (admin role)

**Request Body**:
```json
{
  "username": "string",
  "password": "string",
  "name": "string",
  "email": "string (optional)",
  "role": "admin | agent | intern | viewer",
  "provinceId": "string (optional)",
  "districtId": "string (optional)",
  "constituencyId": "string (optional)",
  "wardId": "string (optional)",
  "pollingStationId": "string (optional)",
  "chamberId": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "username": "newuser",
    "name": "New User",
    "role": "agent",
    "email": "user@example.com"
  }
}
```

---

#### GET `/auth/users`
List all registered users (admin only).

**Headers**: Requires authentication (admin role)

**Response**:
```json
{
  "users": [
    {
      "username": "string",
      "name": "string",
      "role": "string",
      "email": "string",
      "createdAt": "ISO date string",
      "lastLogin": "ISO date string"
    }
  ]
}
```

---

### 2. Election Results

#### POST `/results/submit`
Submit polling station results (requires admin or agent role).

**Headers**: Requires authentication (admin or agent role)

**Request Body**:
```json
{
  "pollingStationId": "string",
  "wardId": "string",
  "constituencyId": "string",
  "districtId": "string",
  "provinceId": "string",
  "registeredVoters": 1500,
  "totalVotes": 1200,
  "totalRejected": 10,
  "candidateResults": [
    {
      "candidateId": "hh",
      "votes": 600
    },
    {
      "candidateId": "fm",
      "votes": 590
    }
  ],
  "category": "presidential | parliamentary | mayoral | councillor"
}
```

**Validation Rules**:
- `totalVotes` cannot exceed `registeredVoters`
- Sum of `candidateResults[].votes` + `totalRejected` must equal `totalVotes`

**Response**:
```json
{
  "success": true,
  "message": "Results submitted successfully",
  "result": {
    "pollingStationId": "string",
    "submittedBy": "username",
    "submittedAt": "ISO date string",
    "verified": false,
    ...
  }
}
```

---

#### POST `/results/batch-submit`
Submit multiple polling station results at once (requires admin or agent role).

**Headers**: Requires authentication (admin or agent role)

**Request Body**:
```json
{
  "results": [
    {
      "pollingStationId": "station-001",
      "wardId": "ward-001",
      ...
    },
    {
      "pollingStationId": "station-002",
      "wardId": "ward-001",
      ...
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Batch submission completed",
  "successful": 45,
  "failed": [
    {
      "index": 3,
      "error": "Vote count mismatch"
    }
  ]
}
```

---

#### GET `/results/station/:stationId/:category`
Get results for a specific polling station.

**Parameters**:
- `stationId`: Polling station ID
- `category`: presidential | parliamentary | mayoral | councillor

**Response**:
```json
{
  "result": {
    "pollingStationId": "string",
    "totalVotes": 1200,
    "candidateResults": [...],
    "verified": true,
    "verifiedBy": "username",
    "verifiedAt": "ISO date string"
  }
}
```

---

#### POST `/results/verify/:stationId/:category`
Verify polling station results (requires admin or agent role).

**Headers**: Requires authentication (admin or agent role)

**Parameters**:
- `stationId`: Polling station ID
- `category`: presidential | parliamentary | mayoral | councillor

**Response**:
```json
{
  "success": true,
  "message": "Results verified successfully",
  "result": {
    "verified": true,
    "verifiedBy": "username",
    "verifiedAt": "ISO date string",
    ...
  }
}
```

---

#### GET `/results/aggregated/:category/:level/:id?`
Get aggregated results for any geographic level.

**Parameters**:
- `category`: presidential | parliamentary | mayoral | councillor
- `level`: national | provincial | district | constituency | ward
- `id`: Optional ID for specific area (omit for national level)

**Examples**:
- `/results/aggregated/presidential/national` - National presidential results
- `/results/aggregated/presidential/provincial/lusaka` - Lusaka province results
- `/results/aggregated/parliamentary/constituency/kabwata` - Kabwata constituency results

**Response**:
```json
{
  "result": {
    "level": "constituency",
    "id": "kabwata",
    "name": "Kabwata Constituency",
    "totalRegisteredVoters": 45000,
    "totalVotes": 38000,
    "totalRejected": 150,
    "turnoutPercentage": 84.4,
    "candidateResults": [
      {
        "candidateId": "hh",
        "candidateName": "Mr Hakainde Hichilema",
        "party": "UPND",
        "votes": 20000,
        "percentage": 52.8
      },
      {
        "candidateId": "fm",
        "candidateName": "Dr Fred M'membe",
        "party": "SP",
        "votes": 18000,
        "percentage": 47.2
      }
    ],
    "stationsReported": 42,
    "totalStations": 45,
    "reportingPercentage": 93.3,
    "lastUpdated": "ISO date string"
  }
}
```

---

#### GET `/results/summary/:category`
Get results submission summary with counts.

**Parameters**:
- `category`: presidential | parliamentary | mayoral | councillor

**Response**:
```json
{
  "summary": {
    "totalSubmitted": 13529,
    "totalVerified": 12800,
    "totalPending": 729,
    "byProvince": {
      "lusaka": {
        "submitted": 1500,
        "verified": 1450
      },
      "copperbelt": {
        "submitted": 2100,
        "verified": 2000
      }
    }
  }
}
```

---

#### POST `/results/search`
Search results by criteria.

**Request Body**:
```json
{
  "category": "presidential",
  "provinceId": "lusaka (optional)",
  "districtId": "lusaka (optional)",
  "constituencyId": "kabwata (optional)",
  "wardId": "ward-001 (optional)",
  "verified": true,
  "submittedBy": "username (optional)"
}
```

**Response**:
```json
{
  "results": [...],
  "count": 150
}
```

---

### 3. Chambers of Commerce

#### POST `/chambers`
Create a new chamber (admin only).

**Headers**: Requires authentication (admin role)

**Request Body**:
```json
{
  "name": "Lusaka Central Ward Chamber of Commerce",
  "location": "Lusaka Central",
  "wardId": "ward-001",
  "districtId": "lusaka",
  "provinceId": "lusaka",
  "type": "ward | district | provincial | national",
  "established": "2020",
  "memberBusinesses": 45,
  "contactEmail": "info@chamber.org.zm",
  "contactPhone": "+260-211-123456",
  "website": "https://chamber.org.zm",
  "description": "Supporting local businesses...",
  "sectors": ["Agriculture", "Technology", "Tourism"]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Chamber created successfully",
  "chamber": {
    "id": "chamber-123",
    "name": "Lusaka Central Ward Chamber of Commerce",
    "createdAt": "ISO date string",
    ...
  }
}
```

---

#### GET `/chambers`
List all chambers with optional filters.

**Query Parameters** (all optional):
- `type`: ward | district | provincial | national
- `provinceId`: Filter by province
- `districtId`: Filter by district
- `wardId`: Filter by ward
- `sector`: Filter by sector

**Example**: `/chambers?type=ward&provinceId=lusaka&sector=Technology`

**Response**:
```json
{
  "chambers": [...],
  "count": 42
}
```

---

#### GET `/chambers/:id`
Get a specific chamber by ID.

**Response**:
```json
{
  "chamber": {
    "id": "chamber-123",
    "name": "Lusaka Central Ward Chamber of Commerce",
    "sectors": ["Agriculture", "Technology"],
    ...
  }
}
```

---

#### PATCH `/chambers/:id`
Update a chamber (admin only).

**Headers**: Requires authentication (admin role)

**Request Body** (all fields optional):
```json
{
  "memberBusinesses": 50,
  "contactEmail": "newemail@chamber.org.zm",
  "description": "Updated description"
}
```

---

### 4. Internship Programs

#### POST `/internships`
Create internship program (admin only).

**Headers**: Requires authentication (admin role)

**Request Body**:
```json
{
  "chamberId": "chamber-123",
  "title": "Agricultural Business Development Internship",
  "description": "Learn modern agricultural business practices...",
  "duration": "6 months",
  "positions": 10,
  "requirements": [
    "Bachelor's degree in Agriculture or Business",
    "Strong communication skills"
  ],
  "benefits": [
    "Monthly stipend of K2,500",
    "Professional mentorship",
    "Certificate upon completion"
  ],
  "applicationDeadline": "2026-08-31",
  "status": "open | closed | upcoming",
  "sector": "Agriculture",
  "stipend": 2500,
  "currency": "ZMW"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Internship program created successfully",
  "program": {
    "id": "internship-456",
    ...
  }
}
```

---

#### GET `/internships`
List internship programs with filters.

**Query Parameters** (all optional):
- `chamberId`: Filter by chamber
- `status`: open | closed | upcoming
- `sector`: Filter by sector

**Response**:
```json
{
  "programs": [...],
  "count": 25
}
```

---

#### POST `/internships/apply`
Submit internship application (requires authentication).

**Headers**: Requires authentication

**Request Body**:
```json
{
  "programId": "internship-456",
  "chamberId": "chamber-123",
  "applicantName": "John Banda",
  "applicantEmail": "john@example.com",
  "applicantPhone": "+260-977-123456",
  "resume": "Base64 encoded resume (optional)",
  "coverLetter": "I am interested in this position because..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "application": {
    "id": "application-789",
    "status": "pending",
    "appliedAt": "ISO date string",
    ...
  }
}
```

---

#### GET `/applications`
List applications with filters.

**Headers**: Requires authentication (non-admins can only see their own applications)

**Query Parameters** (all optional):
- `programId`: Filter by program
- `chamberId`: Filter by chamber
- `status`: pending | reviewed | accepted | rejected | withdrawn

**Response**:
```json
{
  "applications": [...],
  "count": 15
}
```

---

#### PATCH `/applications/:id/status`
Update application status (admin only).

**Headers**: Requires authentication (admin role)

**Request Body**:
```json
{
  "status": "accepted | rejected | reviewed",
  "notes": "Candidate has excellent qualifications (optional)"
}
```

---

### 5. US Chambers & Partnerships

#### GET `/us-chambers`
List US chambers with filters.

**Query Parameters** (all optional):
- `state`: Arkansas | Georgia | Iowa | Washington DC
- `sector`: Filter by sector

**Response**:
```json
{
  "chambers": [
    {
      "id": "us-chamber-001",
      "name": "Arkansas State Chamber of Commerce",
      "state": "Arkansas",
      "city": "Little Rock",
      "sectors": ["Agriculture", "Manufacturing"],
      "partnershipInterests": ["Trade", "Investment"]
    }
  ],
  "count": 50
}
```

---

#### POST `/partnerships`
Create partnership request (requires authentication).

**Headers**: Requires authentication

**Request Body**:
```json
{
  "zambianChamberId": "chamber-123",
  "usChamberId": "us-chamber-001",
  "purpose": "To establish trade relationships in agricultural products",
  "expectedOutcomes": [
    "Export opportunities for Zambian farmers",
    "Technology transfer",
    "Training programs"
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Partnership request created successfully",
  "partnership": {
    "id": "partnership-999",
    "status": "pending",
    "requestedAt": "ISO date string",
    ...
  }
}
```

---

#### GET `/partnerships`
List partnership requests with filters.

**Headers**: Requires authentication

**Query Parameters** (all optional):
- `zambianChamberId`: Filter by Zambian chamber
- `usChamberId`: Filter by US chamber
- `status`: pending | approved | declined | active

**Response**:
```json
{
  "partnerships": [...],
  "count": 12
}
```

---

#### PATCH `/partnerships/:id/status`
Update partnership status (admin only).

**Headers**: Requires authentication (admin role)

**Request Body**:
```json
{
  "status": "approved | declined | active",
  "notes": "Partnership approved for 2-year term (optional)"
}
```

---

### 6. System Statistics

#### GET `/data/stats`
Get overall system statistics (admin only).

**Headers**: Requires authentication (admin role)

**Response**:
```json
{
  "stats": {
    "users": {
      "total": 250,
      "byRole": {
        "admin": 5,
        "agent": 200,
        "intern": 40,
        "viewer": 5
      }
    },
    "chambers": {
      "total": 800,
      "byType": {
        "ward": 600,
        "district": 150,
        "provincial": 10,
        "national": 1
      }
    },
    "internships": {
      "total": 120,
      "byStatus": {
        "open": 45,
        "closed": 60,
        "upcoming": 15
      }
    },
    "applications": {
      "total": 1500,
      "byStatus": {
        "pending": 300,
        "reviewed": 500,
        "accepted": 400,
        "rejected": 250,
        "withdrawn": 50
      }
    },
    "results": {
      "presidential": {
        "totalSubmitted": 13529,
        "totalVerified": 13000
      },
      "parliamentary": {
        "totalSubmitted": 12000,
        "totalVerified": 11500
      }
    }
  },
  "timestamp": "ISO date string"
}
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

### Common Status Codes

- **200**: Success
- **400**: Bad Request (validation error, missing fields)
- **401**: Unauthorized (invalid or missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented, but it's recommended for production deployment.

---

## Security Best Practices

1. **Always use HTTPS** in production
2. **Store tokens securely** (localStorage or secure cookie)
3. **Implement token rotation** for long-lived sessions
4. **Validate all input** on both client and server
5. **Use prepared statements** for database queries
6. **Log security events** (failed login attempts, permission violations)

---

## Frontend Integration Example

```typescript
import api from './utils/api';

// Login
const { token, user } = await api.login('Bozplans', 'Wakuca55');
console.log('Logged in as:', user.name);

// Submit results
const result = await api.submitResults({
  pollingStationId: 'station-001',
  wardId: 'ward-001',
  constituencyId: 'kabwata',
  districtId: 'lusaka',
  provinceId: 'lusaka',
  registeredVoters: 1500,
  totalVotes: 1200,
  totalRejected: 10,
  candidateResults: [
    { candidateId: 'hh', votes: 600 },
    { candidateId: 'fm', votes: 590 }
  ],
  category: 'presidential'
});

// Get aggregated results
const { result: aggregated } = await api.getAggregatedResults(
  'presidential',
  'constituency',
  'kabwata'
);
```

---

## Database Schema

The system uses a key-value store with the following key patterns:

### Users & Authentication
- `user:{username}` - User profile
- `password:{username}` - Hashed password
- `session:{token}` - Active session
- `user-session:{username}` - User's active session token

### Election Results
- `result:{category}:{stationId}` - Polling station results
- `aggregated:{category}:{level}:{id}` - Aggregated results
- `aggregation-pending:{category}:{level}:{id}` - Pending aggregation flag

### Chambers
- `chamber:{id}` - Chamber data
- `chamber-ward:{wardId}` - Ward's chamber ID
- `chamber-district-list:{districtId}` - District's chambers list

### Internships
- `internship:{id}` - Internship program
- `chamber-programs:{chamberId}` - Chamber's programs list
- `application:{id}` - Internship application
- `user-applications:{username}` - User's applications list
- `program-applications:{programId}` - Program's applications list

### Partnerships
- `partnership:{id}` - Partnership request
- `chamber-partnerships:{chamberId}` - Chamber's partnerships list
- `us-chamber:{id}` - US chamber data

---

## Support & Contact

For technical support or questions about the API:
- **Email**: tech@buildonezambia.org
- **Documentation**: This file
- **Issues**: Report bugs through the admin dashboard

---

**Version**: 1.0.0  
**Last Updated**: June 7, 2026  
**API Stability**: Production Ready
