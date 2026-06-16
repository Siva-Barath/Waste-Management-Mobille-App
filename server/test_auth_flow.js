const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const base = 'http://localhost:5000/api';

async function run() {
  try {
    console.log('\n1) Registering a new resident user...');
    const phone = '711' + String(Math.floor(Math.random()*9000000)+1000000).slice(0,7);
    const regRes = await fetch(`${base}/auth/register`, {
      method: 'POST',
      headers: {'content-type':'application/json'},
      body: JSON.stringify({
        name: 'Test Resident',
        phone,
        password: 'testpass',
        address: 'Test Address',
        numResidents: 2,
        ward: 'Ward 1'
      })
    });
    const regJson = await regRes.json();
    console.log('status', regRes.status);
    console.log(regJson);

    if (regRes.status !== 201) {
      console.log('Register failed - aborting further checks.');
      return;
    }

    const token = regJson.token;

    console.log('\n2) Accessing profile with token...');
    const profileRes = await fetch(`${base}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('profile status', profileRes.status);
    console.log(await profileRes.json());

    console.log('\n3) Logging in with same credentials...');
    const loginRes = await fetch(`${base}/auth/login`, {
      method: 'POST', headers: {'content-type':'application/json'},
      body: JSON.stringify({ phone, password: 'testpass' })
    });
    console.log('login status', loginRes.status);
    console.log(await loginRes.json());

    console.log('\n4) Testing admin-only endpoint with resident token (should be 403)');
    const adminResResident = await fetch(`${base}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('resident->admin/stats status', adminResResident.status);
    console.log(await adminResResident.text());

    console.log('\n5) Logging in as seeded admin (9999999999)...');
    const adminLogin = await fetch(`${base}/auth/login`, { method: 'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ phone: '9999999999', password: 'admin123' }) });
    const adminJson = await adminLogin.json();
    console.log('admin login status', adminLogin.status);
    console.log(adminJson);
    const adminToken = adminJson.token;

    console.log('\n6) Accessing admin stats with admin token (should be 200)');
    const adminStats = await fetch(`${base}/admin/stats`, { headers: { Authorization: `Bearer ${adminToken}` } });
    console.log('admin/stats status', adminStats.status);
    console.log(await adminStats.json());

    console.log('\n7) Invalid token check (should be 401)');
    const bad = await fetch(`${base}/auth/profile`, { headers: { Authorization: 'Bearer invalid.token.here' } });
    console.log('invalid token profile status', bad.status);
    console.log(await bad.json());

    console.log('\nAuth flow tests complete.');
  } catch (e) {
    console.error('Test script error:', e?.message || e);
  }
}

run();
