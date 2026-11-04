/**
 * HustleHub+ Automated Platform Verification Suite
 * Checks health, OpenAPI docs, and authentication responsiveness
 */

const baseUrl = process.env.API_BASE_URL || 'https://hustlehub-api-production.up.railway.app';

async function runHealthCheck() {
  console.log('='.repeat(60));
  console.log(`HustleHub+ Platform Health Verification: ${baseUrl}`);
  console.log('='.repeat(60));

  const results = [];

  // Test 1: /health endpoint
  try {
    const t0 = Date.now();
    const res = await fetch(`${baseUrl}/health`);
    const data = await res.json();
    const duration = Date.now() - t0;
    const ok = res.status === 200 && data.status === 'OK';
    results.push({ test: 'Health Check (/health)', ok, duration, detail: JSON.stringify(data) });
  } catch (err) {
    results.push({ test: 'Health Check (/health)', ok: false, duration: 0, detail: err.message });
  }

  // Test 2: Swagger OpenAPI endpoint
  try {
    const t0 = Date.now();
    const res = await fetch(`${baseUrl}/api-docs/`);
    const duration = Date.now() - t0;
    const ok = res.status === 200;
    results.push({ test: 'Swagger OpenAPI 3.0 (/api-docs/)', ok, duration, detail: `HTTP ${res.status}` });
  } catch (err) {
    results.push({ test: 'Swagger OpenAPI 3.0 (/api-docs/)', ok: false, duration: 0, detail: err.message });
  }

  // Test 3: Gigs Public Catalog
  try {
    const t0 = Date.now();
    const res = await fetch(`${baseUrl}/api/gigs`);
    const data = await res.json();
    const duration = Date.now() - t0;
    const ok = res.status === 200 && Array.isArray(data.data);
    results.push({ test: 'Public Gigs Catalog (/api/gigs)', ok, duration, detail: `${data.data?.length || 0} gigs found` });
  } catch (err) {
    results.push({ test: 'Public Gigs Catalog (/api/gigs)', ok: false, duration: 0, detail: err.message });
  }

  // Test 4: Auth Endpoint Validation (/api/auth/login)
  try {
    const t0 = Date.now();
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'WrongPassword123!' })
    });
    const duration = Date.now() - t0;
    const ok = res.status === 401;
    results.push({ test: 'Auth Security Validation (/api/auth/login)', ok, duration, detail: `HTTP ${res.status} correctly rejected` });
  } catch (err) {
    results.push({ test: 'Auth Security Validation (/api/auth/login)', ok: false, duration: 0, detail: err.message });
  }

  console.log('\nVerification Results:');
  for (const r of results) {
    const icon = r.ok ? 'PASS' : 'FAIL';
    console.log(`[${icon}] ${r.test.padEnd(45)} | ${r.duration}ms | ${r.detail}`);
  }

  const allPassed = results.every(r => r.ok);
  console.log('='.repeat(60));
  console.log(`Overall Health Status: ${allPassed ? 'ALL SYSTEMS OPERATIONAL' : 'DEGRADED'}`);
  console.log('='.repeat(60));
}

runHealthCheck();
