(async () => {
  const tests = [
    { name: 'register-lan', url: 'http://172.17.5.91:5000/api/auth/register', body: { name: 'Automated Test', phone: '9998887776', password: 'secret123', address: 'Test Addr', latitude: 0, longitude: 0, numResidents: 1, ward: 'Ward 1', language: 'en', role: 'resident' } },
    { name: 'login-lan', url: 'http://172.17.5.91:5000/api/auth/login', body: { phone: '9998887776', password: 'secret123' } },
    { name: 'register-local', url: 'http://127.0.0.1:5000/api/auth/register', body: { name: 'Automated Test', phone: '9998887775', password: 'secret123', address: 'Test Addr', latitude: 0, longitude: 0, numResidents: 1, ward: 'Ward 1', language: 'en', role: 'resident' } },
    { name: 'login-local', url: 'http://127.0.0.1:5000/api/auth/login', body: { phone: '9998887775', password: 'secret123' } },
  ];

  for (const t of tests) {
    console.log('\n===', t.name, t.url, '===');
    try {
      const res = await fetch(t.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t.body), timeout: 10000 });
      const text = await res.text();
      console.log('status:', res.status);
      try {
        console.log('body:', JSON.parse(text));
      } catch (e) {
        console.log('bodyText:', text);
      }
    } catch (err) {
      console.error('request error:', err && err.message ? err.message : err);
    }
  }
})();
