const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

async function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = res.headers['content-type']?.includes('application/json')
            ? JSON.parse(data)
            : data;
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function main() {
  console.log('--- Starting Full-Stack End-to-End Test ---');

  const serverProc = spawn('node', ['src/server.js'], {
    cwd: path.join(__dirname, '..', 'server'),
    env: { ...process.env, PORT: '3456' },
    stdio: 'inherit'
  });

  // Wait 1.5s for server to start
  await new Promise(r => setTimeout(r, 1500));

  try {
    // 1. Static HTML Frontend Test
    const htmlRes = await request('http://localhost:3456/');
    console.log(`[TEST 1] Static Frontend Serving: HTTP ${htmlRes.status}`);
    if (!String(htmlRes.data).includes('Pokémon GO Dex Tracker')) {
      throw new Error('Frontend HTML does not contain title');
    }
    console.log('✓ Frontend serves index.html properly');

    // 2. Health Endpoint Test
    const healthRes = await request('http://localhost:3456/api/health');
    console.log(`[TEST 2] Health Endpoint: HTTP ${healthRes.status}, count: ${healthRes.data.pokemonCount}, WAL: ${healthRes.data.walMode}`);
    if (healthRes.data.pokemonCount < 1000 || !healthRes.data.walMode) {
      throw new Error('Health check failed or WAL not enabled');
    }
    console.log('✓ Health check passed');

    // 3. Pokémon Query Test
    const pokeRes = await request('http://localhost:3456/api/pokemon?category=standard&limit=3');
    console.log(`[TEST 3] Pokémon API: HTTP ${pokeRes.status}, count: ${pokeRes.data.length}`);
    console.log('First Pokémon:', pokeRes.data[0].name, '(#', pokeRes.data[0].dexNr, ') Caught:', pokeRes.data[0].caught);
    console.log('✓ Pokémon API query passed');

    // 4. Progress Toggle Test
    const toggleRes = await request('http://localhost:3456/api/progress/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { pokemonId: 'poke_1_base', type: 'caught' }
    });
    console.log(`[TEST 4] Toggle Caught: HTTP ${toggleRes.status}, new value: ${toggleRes.data.value}`);
    if (!toggleRes.data.value) throw new Error('Toggle failed to mark caught');
    console.log('✓ Toggle caught passed');

    // 5. Custom Collections Test
    const collsRes = await request('http://localhost:3456/api/collections');
    console.log(`[TEST 5] Collections: HTTP ${collsRes.status}, collections count: ${collsRes.data.length}`);
    console.log('Collections:', collsRes.data.map(c => c.name).join(', '));
    console.log('✓ Collections query passed');

    // 6. Export Test
    const exportRes = await request('http://localhost:3456/api/export');
    console.log(`[TEST 6] Export: HTTP ${exportRes.status}, progress count: ${exportRes.data.data.progress.length}`);
    if (!exportRes.data.app || exportRes.data.data.progress.length === 0) {
      throw new Error('Export returned empty or invalid data');
    }
    console.log('✓ Backup export passed');

    // 7. Import Test
    const importRes = await request('http://localhost:3456/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: exportRes.data
    });
    console.log(`[TEST 7] Import: HTTP ${importRes.status}, result:`, importRes.data);
    if (!importRes.data.success) throw new Error('Import failed');
    console.log('✓ Backup import passed');

    console.log('\n=========================================');
    console.log('🎉 ALL 7 FULL-STACK TESTS PASSED 100%! 🎉');
    console.log('=========================================\n');
  } finally {
    serverProc.kill();
  }
}

main().catch(err => {
  console.error('Test failure:', err);
  process.exit(1);
});
