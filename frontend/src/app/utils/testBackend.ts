import { API_BASE } from '@/app/lib/apiBase';
/**
 * Backend Deployment Test & Verification Script
 * Run this to verify the backend is deployed and working correctly
 */

import api from './api';

export interface TestResult {
  endpoint: string;
  status: 'success' | 'failed';
  message: string;
  responseTime?: number;
  data?: any;
}

export async function testBackendDeployment(): Promise<{
  success: boolean;
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
}> {
  const results: TestResult[] = [];

  console.log('🚀 Starting Backend Deployment Tests...\n');

  // Test 1: Health Check
  console.log('Test 1: Health Check...');
  const healthStart = Date.now();
  try {
    const response = await fetch(
      `${API_BASE}/health`
    );
    const data = await response.json();
    const responseTime = Date.now() - healthStart;

    if (response.ok && data.status === 'ok') {
      results.push({
        endpoint: 'GET /health',
        status: 'success',
        message: '✅ Health check passed',
        responseTime,
        data,
      });
      console.log(`✅ Health check passed (${responseTime}ms)`);
      console.log(`   Service: ${data.service}`);
      console.log(`   Version: ${data.version}\n`);
    } else {
      throw new Error('Health check failed');
    }
  } catch (error) {
    results.push({
      endpoint: 'GET /health',
      status: 'failed',
      message: `❌ Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    console.log('❌ Health check failed\n');
  }

  // Test 2: Login (Admin)
  console.log('Test 2: Admin Login...');
  const loginStart = Date.now();
  try {
    const { token, user } = await api.login('Bozplans', 'Wakuca55');
    const responseTime = Date.now() - loginStart;

    if (token && user.username === 'Bozplans') {
      results.push({
        endpoint: 'POST /auth/login',
        status: 'success',
        message: '✅ Admin login successful',
        responseTime,
        data: { user },
      });
      console.log(`✅ Admin login successful (${responseTime}ms)`);
      console.log(`   User: ${user.name}`);
      console.log(`   Role: ${user.role}\n`);
    } else {
      throw new Error('Login failed');
    }
  } catch (error) {
    results.push({
      endpoint: 'POST /auth/login',
      status: 'failed',
      message: `❌ Admin login failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    console.log('❌ Admin login failed\n');
  }

  // Test 3: Get Current User
  console.log('Test 3: Get Current User...');
  const userStart = Date.now();
  try {
    const { user } = await api.getCurrentUser();
    const responseTime = Date.now() - userStart;

    if (user && user.username) {
      results.push({
        endpoint: 'GET /auth/me',
        status: 'success',
        message: '✅ Get current user successful',
        responseTime,
        data: { user },
      });
      console.log(`✅ Get current user successful (${responseTime}ms)`);
      console.log(`   Username: ${user.username}\n`);
    } else {
      throw new Error('Failed to get user');
    }
  } catch (error) {
    results.push({
      endpoint: 'GET /auth/me',
      status: 'failed',
      message: `❌ Get current user failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    console.log('❌ Get current user failed\n');
  }

  // Test 4: List Chambers (should be empty initially)
  console.log('Test 4: List Chambers...');
  const chambersStart = Date.now();
  try {
    const { chambers, count } = await api.listChambers();
    const responseTime = Date.now() - chambersStart;

    results.push({
      endpoint: 'GET /chambers',
      status: 'success',
      message: '✅ List chambers successful',
      responseTime,
      data: { count },
    });
    console.log(`✅ List chambers successful (${responseTime}ms)`);
    console.log(`   Chambers found: ${count}\n`);
  } catch (error) {
    results.push({
      endpoint: 'GET /chambers',
      status: 'failed',
      message: `❌ List chambers failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    console.log('❌ List chambers failed\n');
  }

  // Test 5: List Internship Programs
  console.log('Test 5: List Internship Programs...');
  const programsStart = Date.now();
  try {
    const { programs, count } = await api.listInternshipPrograms();
    const responseTime = Date.now() - programsStart;

    results.push({
      endpoint: 'GET /internships',
      status: 'success',
      message: '✅ List internships successful',
      responseTime,
      data: { count },
    });
    console.log(`✅ List internships successful (${responseTime}ms)`);
    console.log(`   Programs found: ${count}\n`);
  } catch (error) {
    results.push({
      endpoint: 'GET /internships',
      status: 'failed',
      message: `❌ List internships failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    console.log('❌ List internships failed\n');
  }

  // Test 6: Get Results Summary (Presidential)
  console.log('Test 6: Get Results Summary...');
  const summaryStart = Date.now();
  try {
    const { summary } = await api.getResultsSummary('presidential');
    const responseTime = Date.now() - summaryStart;

    results.push({
      endpoint: 'GET /results/summary/presidential',
      status: 'success',
      message: '✅ Get results summary successful',
      responseTime,
      data: summary,
    });
    console.log(`✅ Get results summary successful (${responseTime}ms)`);
    console.log(`   Total submitted: ${summary.totalSubmitted}`);
    console.log(`   Total verified: ${summary.totalVerified}\n`);
  } catch (error) {
    results.push({
      endpoint: 'GET /results/summary/presidential',
      status: 'failed',
      message: `❌ Get results summary failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    console.log('❌ Get results summary failed\n');
  }

  // Calculate summary
  const passed = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const success = failed === 0;

  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (success) {
    console.log('🎉 ALL TESTS PASSED! Backend is deployed and working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the logs above.');
  }

  return {
    success,
    results,
    summary: {
      total: results.length,
      passed,
      failed,
    },
  };
}

/**
 * Quick API connectivity test
 */
export async function quickHealthCheck(): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_BASE}/health`
    );
    const data = await response.json();
    return response.ok && data.status === 'ok';
  } catch {
    return false;
  }
}

/**
 * Test with sample data
 */
export async function testWithSampleData(): Promise<void> {
  console.log('🧪 Testing with Sample Data...\n');

  try {
    // Login
    console.log('1. Logging in as admin...');
    await api.login('Bozplans', 'Wakuca55');
    console.log('   ✅ Logged in\n');

    // Create a test chamber
    console.log('2. Creating test chamber...');
    const chamber = await api.createChamber({
      name: 'Test Chamber - Lusaka Central',
      location: 'Lusaka Central Ward',
      wardId: 'test-ward-001',
      districtId: 'lusaka',
      provinceId: 'lusaka',
      type: 'ward',
      sectors: ['Technology', 'Agriculture'],
      memberBusinesses: 25,
      contactEmail: 'test@chamber.org.zm',
      description: 'Test chamber for deployment verification',
    });
    console.log(`   ✅ Chamber created: ${chamber.chamber.id}\n`);

    // Create a test internship
    console.log('3. Creating test internship program...');
    const program = await api.createInternshipProgram({
      chamberId: chamber.chamber.id,
      title: 'Test Internship - Software Development',
      description: 'Learn modern software development practices',
      duration: '3 months',
      positions: 5,
      requirements: ['Basic programming knowledge', 'Good communication skills'],
      benefits: ['Hands-on experience', 'Mentorship', 'Certificate'],
      status: 'open',
      sector: 'Technology',
      stipend: 1500,
      currency: 'ZMW',
    });
    console.log(`   ✅ Internship created: ${program.program.id}\n`);

    // Submit test results
    console.log('4. Submitting test election results...');
    const result = await api.submitResults({
      pollingStationId: 'test-station-001',
      wardId: 'test-ward-001',
      constituencyId: 'test-constituency',
      districtId: 'lusaka',
      provinceId: 'lusaka',
      registeredVoters: 1000,
      totalVotes: 850,
      totalRejected: 10,
      candidateResults: [
        { candidateId: 'hh', votes: 450 },
        { candidateId: 'fm', votes: 390 },
      ],
      category: 'presidential',
    });
    console.log(`   ✅ Results submitted for station: ${result.result.pollingStationId}\n`);

    console.log('🎉 Sample data test completed successfully!');
    console.log('\nYou can now:');
    console.log('- View chambers in the dashboard');
    console.log('- See internship programs');
    console.log('- Check election results');
    console.log('- Apply to internships (as intern user)');

  } catch (error) {
    console.error('❌ Sample data test failed:', error);
    throw error;
  }
}
