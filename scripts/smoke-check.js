require('dotenv').config();
const prisma = require('../prismaClient');

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://localhost:3000';

async function checkHttp(label, path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  return {
    label,
    status: response.status,
    ok: response.ok,
    exists: response.status !== 404
  };
}

async function run() {
  const results = [];

  try {
    results.push(await checkHttp('UI root', '/'));
    results.push(await checkHttp('Stores API', '/stores'));
    results.push(await checkHttp('Products API', '/products'));
    results.push(await checkHttp('Terminals API', '/terminals'));

    results.push(await checkHttp('Employee login route', '/employees/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    }));

    results.push(await checkHttp('Store language route', '/stores/1/language', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ defaultLanguage: 'en' })
    }));
  } catch (error) {
    console.error('HTTP smoke checks failed:', error.message);
    process.exit(1);
  }

  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (error) {
    console.error('DB connectivity check failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }

  console.log('--- Quantum POS Smoke Check ---');
  for (const result of results) {
    const mark = result.exists ? 'PASS' : 'FAIL';
    console.log(`${mark} | ${result.label} | HTTP ${result.status}`);
  }
  console.log(`${dbOk ? 'PASS' : 'FAIL'} | Database query | SELECT 1`);

  const hardFail = results.some((r) => !r.exists) || !dbOk;
  if (hardFail) {
    console.error('Smoke check failed. See lines above.');
    process.exit(1);
  }

  console.log('Smoke check passed.');
}

run().catch(async (error) => {
  console.error('Unexpected smoke check error:', error.message);
  try {
    await prisma.$disconnect();
  } catch {
    // ignore disconnect failures
  }
  process.exit(1);
});
