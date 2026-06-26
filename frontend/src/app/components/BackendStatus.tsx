import { useState, useEffect } from 'react';
import { testBackendDeployment, quickHealthCheck, type TestResult } from '../utils/testBackend';
import api from '../utils/api';

export function BackendStatus() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showTests, setShowTests] = useState(false);
  const [runningTests, setRunningTests] = useState(false);
  const [loginStatus, setLoginStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setIsLoading(true);
    const healthy = await quickHealthCheck();
    setIsHealthy(healthy);
    setIsLoading(false);
  };

  const runFullTests = async () => {
    setRunningTests(true);
    setShowTests(true);
    const results = await testBackendDeployment();
    setTestResults(results.results);
    setRunningTests(false);
  };

  const testLogin = async () => {
    try {
      await api.login('Bozplans', 'Wakuca55');
      setLoginStatus('success');
      setTimeout(() => setLoginStatus('idle'), 3000);
    } catch (error) {
      setLoginStatus('error');
      setTimeout(() => setLoginStatus('idle'), 3000);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        minWidth: '300px',
        zIndex: 9999,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: '#e5e7eb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#f59e0b',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }} />
          <span style={{ fontWeight: 600, color: '#374151' }}>Checking Backend...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
      minWidth: '300px',
      maxWidth: showTests ? '600px' : '300px',
      zIndex: 9999,
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: isHealthy ? '#10b981' : '#ef4444',
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: isHealthy ? '#10b981' : '#ef4444',
            animation: isHealthy ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
          }} />
          <span style={{ fontWeight: 600, color: '#111827' }}>
            Backend {isHealthy ? 'Connected' : 'Offline'}
          </span>
        </div>
        <button
          onClick={checkHealth}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            borderRadius: '6px',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#d1d5db',
            backgroundColor: '#f9fafb',
            cursor: 'pointer',
            color: '#6b7280'
          }}
        >
          Refresh
        </button>
      </div>

      {/* Status Message */}
      <div style={{ 
        marginBottom: '12px', 
        padding: '8px', 
        backgroundColor: isHealthy ? '#f0fdf4' : '#fef2f2',
        borderRadius: '6px',
        fontSize: '13px',
        color: isHealthy ? '#166534' : '#991b1b'
      }}>
        {isHealthy ? (
          <>
            ✅ Backend API is live and responding
            <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>
              Endpoint: /make-server-8fca9621/health
            </div>
          </>
        ) : (
          <>
            ❌ Cannot connect to backend
            <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>
              Check server logs or try refreshing
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      {isHealthy && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: showTests ? '16px' : '0' }}>
          <button
            onClick={runFullTests}
            disabled={runningTests}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: 500,
              borderRadius: '6px',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: '#2563eb',
              backgroundColor: '#2563eb',
              color: '#fff',
              cursor: runningTests ? 'not-allowed' : 'pointer',
              opacity: runningTests ? 0.6 : 1
            }}
          >
            {runningTests ? '🧪 Running Tests...' : '🧪 Run Tests'}
          </button>
          <button
            onClick={testLogin}
            disabled={loginStatus !== 'idle'}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: 500,
              borderRadius: '6px',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: loginStatus === 'success' ? '#10b981' : loginStatus === 'error' ? '#ef4444' : '#059669',
              backgroundColor: loginStatus === 'success' ? '#10b981' : loginStatus === 'error' ? '#ef4444' : '#059669',
              color: '#fff',
              cursor: loginStatus !== 'idle' ? 'not-allowed' : 'pointer',
              opacity: loginStatus !== 'idle' ? 0.6 : 1
            }}
          >
            {loginStatus === 'success' ? '✅ Logged In' : loginStatus === 'error' ? '❌ Login Failed' : '🔐 Test Login'}
          </button>
        </div>
      )}

      {/* Test Results */}
      {showTests && testResults.length > 0 && (
        <div style={{
          marginTop: '16px',
          borderTopWidth: '1px',
          borderTopStyle: 'solid',
          borderTopColor: '#e5e7eb',
          paddingTop: '16px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827' }}>
              Test Results
            </h4>
            <button
              onClick={() => setShowTests(false)}
              style={{
                padding: '2px 6px',
                fontSize: '11px',
                borderRadius: '4px',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: '#d1d5db',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              Hide
            </button>
          </div>
          <div style={{ 
            maxHeight: '300px', 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {testResults.map((result, index) => (
              <div
                key={index}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  backgroundColor: result.status === 'success' ? '#f0fdf4' : '#fef2f2',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: result.status === 'success' ? '#86efac' : '#fca5a5'
                }}
              >
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: 500,
                  color: result.status === 'success' ? '#166534' : '#991b1b',
                  marginBottom: '4px'
                }}>
                  {result.endpoint}
                </div>
                <div style={{ 
                  fontSize: '11px',
                  color: result.status === 'success' ? '#15803d' : '#b91c1c'
                }}>
                  {result.message}
                  {result.responseTime && (
                    <span style={{ marginLeft: '8px', opacity: 0.7 }}>
                      ({result.responseTime}ms)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: '12px',
            padding: '8px',
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#374151'
          }}>
            <strong>Summary:</strong> {testResults.filter(r => r.status === 'success').length} / {testResults.length} tests passed
          </div>
        </div>
      )}

      {/* Backend Info */}
      <div style={{
        marginTop: '12px',
        fontSize: '11px',
        color: '#6b7280',
        borderTopWidth: '1px',
        borderTopStyle: 'solid',
        borderTopColor: '#e5e7eb',
        paddingTop: '8px'
      }}>
        <div><strong>Service:</strong> Zambia Election Results API</div>
        <div><strong>Version:</strong> 1.0.0</div>
        <div style={{ marginTop: '4px', wordBreak: 'break-all' }}>
          <strong>URL:</strong> /make-server-8fca9621
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
