# Backend Deployment & Quick Start Guide

## 🚀 Deployment Status

Your backend is **AUTOMATICALLY DEPLOYED** on Supabase Edge Functions!

**Backend URL**: `https://jpysoquanfnphgvwdzbf.supabase.co/functions/v1/make-server-8fca9621`

---

## ✅ Deployment Verification

### Method 1: Quick Health Check

Open your browser and navigate to:
```
https://jpysoquanfnphgvwdzbf.supabase.co/functions/v1/make-server-8fca9621/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-06-07T...",
  "service": "Zambia Election Results Backend API",
  "version": "1.0.0"
}
```

### Method 2: Run Automated Tests

Add this to any component to run tests:

```typescript
import { testBackendDeployment } from './utils/testBackend';

// Run in browser console or component
const runTests = async () => {
  const results = await testBackendDeployment();
  console.log('Tests completed:', results);
};

runTests();
```

### Method 3: Browser Console Test

Open your browser's developer console and run:

```javascript
// Quick health check
fetch('https://jpysoquanfnphgvwdzbf.supabase.co/functions/v1/make-server-8fca9621/health')
  .then(r => r.json())
  .then(data => console.log('✅ Backend is live!', data))
  .catch(err => console.error('❌ Backend error:', err));
```

---

## 🎯 Quick Start Guide

### 1. Login to the System

```typescript
import api from './utils/api';

// Admin login
const login = async () => {
  try {
    const { token, user } = await api.login('Bozplans', 'Wakuca55');
    console.log('Logged in as:', user.name);
    console.log('Role:', user.role);
    console.log('Token:', token);
  } catch (error) {
    console.error('Login failed:', error);
  }
};

login();
```

### 2. Submit Election Results

```typescript
// Submit polling station results
const submitResults = async () => {
  try {
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
    
    console.log('✅ Results submitted:', result);
  } catch (error) {
    console.error('❌ Submission failed:', error);
  }
};
```

### 3. Get Election Results

```typescript
// Get aggregated national results
const getNationalResults = async () => {
  try {
    const { result } = await api.getAggregatedResults(
      'presidential',
      'national'
    );
    
    console.log('National Results:');
    console.log('Total Votes:', result.totalVotes);
    console.log('Turnout:', result.turnoutPercentage + '%');
    console.log('Reporting:', result.reportingPercentage + '%');
    console.log('Candidates:', result.candidateResults);
  } catch (error) {
    console.error('Failed to get results:', error);
  }
};

// Get constituency results
const getConstituencyResults = async () => {
  const { result } = await api.getAggregatedResults(
    'presidential',
    'constituency',
    'kabwata'
  );
  console.log('Kabwata Results:', result);
};
```

### 4. Manage Chambers

```typescript
// Create a chamber
const createChamber = async () => {
  const chamber = await api.createChamber({
    name: 'Lusaka Central Ward Chamber of Commerce',
    location: 'Lusaka Central',
    wardId: 'ward-001',
    districtId: 'lusaka',
    provinceId: 'lusaka',
    type: 'ward',
    sectors: ['Technology', 'Agriculture', 'Tourism'],
    memberBusinesses: 45,
    contactEmail: 'info@lusakachamber.org.zm',
    contactPhone: '+260-211-123456',
    description: 'Supporting local businesses in Lusaka Central'
  });
  
  console.log('✅ Chamber created:', chamber);
};

// List all chambers
const listChambers = async () => {
  const { chambers, count } = await api.listChambers();
  console.log(`Found ${count} chambers:`, chambers);
};

// Filter chambers by province
const getLusakaChambers = async () => {
  const { chambers } = await api.listChambers({ 
    provinceId: 'lusaka' 
  });
  console.log('Lusaka chambers:', chambers);
};
```

### 5. Manage Internship Programs

```typescript
// Create internship program
const createInternship = async () => {
  const program = await api.createInternshipProgram({
    chamberId: 'chamber-123',
    title: 'Agricultural Business Development Internship',
    description: 'Learn modern agricultural business practices',
    duration: '6 months',
    positions: 10,
    requirements: [
      'Bachelor\'s degree in Agriculture or Business',
      'Strong communication skills',
      'Interest in sustainable farming'
    ],
    benefits: [
      'Monthly stipend of K2,500',
      'Professional mentorship',
      'Certificate upon completion',
      'Networking opportunities'
    ],
    applicationDeadline: '2026-08-31',
    status: 'open',
    sector: 'Agriculture',
    stipend: 2500,
    currency: 'ZMW'
  });
  
  console.log('✅ Internship created:', program);
};

// List open internships
const getOpenInternships = async () => {
  const { programs } = await api.listInternshipPrograms({ 
    status: 'open' 
  });
  console.log('Open internships:', programs);
};
```

### 6. Apply to Internship (as logged-in user)

```typescript
// Apply to an internship
const applyToInternship = async () => {
  const application = await api.applyToInternship({
    programId: 'internship-456',
    chamberId: 'chamber-123',
    applicantName: 'John Banda',
    applicantEmail: 'john.banda@email.com',
    applicantPhone: '+260-977-123456',
    coverLetter: `
      I am very interested in this Agricultural Business Development 
      internship. I have a degree in Agriculture from UNZA and am 
      passionate about sustainable farming practices. I believe this 
      internship will help me develop the skills needed to contribute 
      to Zambia's agricultural sector.
    `
  });
  
  console.log('✅ Application submitted:', application);
};

// Check my applications
const getMyApplications = async () => {
  const { applications } = await api.listApplications();
  console.log('My applications:', applications);
};
```

### 7. US Chamber Partnerships

```typescript
// List US chambers
const getUSChambers = async () => {
  const { chambers } = await api.listUSChambers({ 
    state: 'Arkansas' 
  });
  console.log('Arkansas chambers:', chambers);
};

// Create partnership request
const requestPartnership = async () => {
  const partnership = await api.createPartnershipRequest({
    zambianChamberId: 'chamber-123',
    usChamberId: 'us-chamber-001',
    purpose: 'To establish trade relationships in agricultural products',
    expectedOutcomes: [
      'Export opportunities for Zambian farmers',
      'Technology transfer programs',
      'Training and capacity building',
      'Investment opportunities'
    ]
  });
  
  console.log('✅ Partnership requested:', partnership);
};
```

### 8. Get System Statistics (Admin Only)

```typescript
const getStats = async () => {
  const { stats } = await api.getSystemStats();
  
  console.log('System Statistics:');
  console.log('Total Users:', stats.users.total);
  console.log('Users by Role:', stats.users.byRole);
  console.log('Total Chambers:', stats.chambers.total);
  console.log('Total Internships:', stats.internships.total);
  console.log('Total Applications:', stats.applications.total);
  console.log('Presidential Results:', stats.results.presidential);
};
```

---

## 🧪 Testing with Sample Data

Run this to populate your database with test data:

```typescript
import { testWithSampleData } from './utils/testBackend';

// This will create:
// - A test chamber
// - A test internship program
// - Sample election results
testWithSampleData();
```

---

## 📝 Common API Usage Patterns

### Pattern 1: Complete Result Submission Flow

```typescript
// 1. Login
await api.login('Bozplans', 'Wakuca55');

// 2. Submit results for multiple stations
const stations = [
  { id: 'station-001', hh: 600, fm: 590 },
  { id: 'station-002', hh: 550, fm: 640 },
  { id: 'station-003', hh: 700, fm: 480 }
];

for (const station of stations) {
  await api.submitResults({
    pollingStationId: station.id,
    wardId: 'ward-001',
    constituencyId: 'kabwata',
    districtId: 'lusaka',
    provinceId: 'lusaka',
    registeredVoters: 1500,
    totalVotes: station.hh + station.fm,
    totalRejected: 10,
    candidateResults: [
      { candidateId: 'hh', votes: station.hh },
      { candidateId: 'fm', votes: station.fm }
    ],
    category: 'presidential'
  });
}

// 3. Verify results
await api.verifyResults('station-001', 'presidential');

// 4. Get aggregated results
const { result } = await api.getAggregatedResults(
  'presidential',
  'ward',
  'ward-001'
);
```

### Pattern 2: Chamber & Internship Workflow

```typescript
// 1. Create chamber
const { chamber } = await api.createChamber({
  name: 'Ndola Technology Chamber',
  location: 'Ndola',
  type: 'district',
  sectors: ['Technology', 'Manufacturing'],
  // ... other details
});

// 2. Create internship programs
const programs = [
  {
    title: 'Software Development Internship',
    sector: 'Technology',
    positions: 5,
    // ... details
  },
  {
    title: 'Manufacturing Engineering Internship',
    sector: 'Manufacturing',
    positions: 3,
    // ... details
  }
];

for (const prog of programs) {
  await api.createInternshipProgram({
    chamberId: chamber.id,
    ...prog,
    duration: '6 months',
    status: 'open'
  });
}

// 3. Interns apply
// (As intern user)
const { programs: openPrograms } = await api.listInternshipPrograms({
  status: 'open',
  chamberId: chamber.id
});

await api.applyToInternship({
  programId: openPrograms[0].id,
  chamberId: chamber.id,
  applicantName: 'Jane Mwape',
  applicantEmail: 'jane@email.com',
  applicantPhone: '+260-966-123456',
  coverLetter: '...'
});

// 4. Admin reviews applications
const { applications } = await api.listApplications({
  chamberId: chamber.id,
  status: 'pending'
});

for (const app of applications) {
  await api.updateApplicationStatus(
    app.id,
    'accepted',
    'Excellent qualifications'
  );
}
```

### Pattern 3: Real-Time Results Dashboard

```typescript
// Poll for updates every 30 seconds
const updateDashboard = async () => {
  // Get summary
  const { summary } = await api.getResultsSummary('presidential');
  
  // Get national results
  const { result: national } = await api.getAggregatedResults(
    'presidential',
    'national'
  );
  
  // Get provincial breakdown
  const provinces = ['lusaka', 'copperbelt', 'southern', /* ... */];
  const provincialResults = await Promise.all(
    provinces.map(id => 
      api.getAggregatedResults('presidential', 'provincial', id)
    )
  );
  
  // Update UI
  console.log({
    summary,
    national,
    provinces: provincialResults
  });
};

// Run every 30 seconds
setInterval(updateDashboard, 30000);
```

---

## 🔐 User Roles & Permissions

### Admin (`Bozplans` / `Wakuca55`)
- ✅ Create users
- ✅ Create/edit chambers
- ✅ Create/edit internships
- ✅ Submit/verify election results
- ✅ Review applications
- ✅ Approve partnerships
- ✅ View all system data
- ✅ Access system statistics

### Agent
- ✅ Submit election results
- ✅ Verify results (if assigned)
- ❌ Create users
- ❌ Create chambers

### Intern
- ✅ View chambers
- ✅ View internships
- ✅ Apply to internships
- ✅ View own applications
- ❌ Submit election results
- ❌ Create chambers

### Viewer
- ✅ View public results
- ✅ View chambers
- ✅ View internships
- ❌ Submit data
- ❌ Apply to internships

---

## 🐛 Troubleshooting

### Issue: "Unauthorized" error

**Solution**: Make sure you're logged in first
```typescript
await api.login('Bozplans', 'Wakuca55');
```

### Issue: "Forbidden" error

**Solution**: Check your user role. Some endpoints require admin access.

### Issue: "Vote count mismatch" error

**Solution**: Ensure `candidateVotes + rejectedVotes = totalVotes`
```typescript
// ❌ Wrong
totalVotes: 1000,
totalRejected: 10,
candidateResults: [
  { candidateId: 'hh', votes: 600 },
  { candidateId: 'fm', votes: 500 }  // 600 + 500 + 10 = 1110 ≠ 1000
]

// ✅ Correct
totalVotes: 1000,
totalRejected: 10,
candidateResults: [
  { candidateId: 'hh', votes: 600 },
  { candidateId: 'fm', votes: 390 }  // 600 + 390 + 10 = 1000 ✓
]
```

### Issue: Token expired

**Solution**: Login again to get a new token (24-hour expiration)

### Issue: CORS errors

**Solution**: The backend has CORS enabled for all origins. Make sure you're using HTTPS.

---

## 📊 Monitoring & Logs

### Check Server Logs

Server logs are automatically captured. Check the Supabase dashboard:
1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Click on `make-server-8fca9621`
4. View logs tab

### Monitor Health

```typescript
import { quickHealthCheck } from './utils/testBackend';

const checkHealth = async () => {
  const isHealthy = await quickHealthCheck();
  console.log('Backend status:', isHealthy ? '✅ Healthy' : '❌ Down');
};

// Check every minute
setInterval(checkHealth, 60000);
```

---

## 🚀 Next Steps

1. **Test the deployment** using the verification methods above
2. **Populate sample data** using `testWithSampleData()`
3. **Integrate with your frontend** components
4. **Create additional users** for agents and interns
5. **Start submitting real election results**
6. **Set up chambers** for all 226 constituencies
7. **Create internship programs** across sectors

---

## 📚 Additional Resources

- **API Documentation**: See `/API_DOCUMENTATION.md`
- **Architecture Details**: See `/BACKEND_ARCHITECTURE.md`
- **Frontend API Client**: `/src/app/utils/api.ts`
- **Test Suite**: `/src/app/utils/testBackend.ts`

---

## 🎉 You're All Set!

Your backend is **LIVE** and **PRODUCTION-READY**!

**Quick Links**:
- Health Check: https://jpysoquanfnphgvwdzbf.supabase.co/functions/v1/make-server-8fca9621/health
- API Base: https://jpysoquanfnphgvwdzbf.supabase.co/functions/v1/make-server-8fca9621

Happy coding! 🇿🇲
