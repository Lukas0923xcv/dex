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

  // Wait for server to become ready
  let ready = false;
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const res = await request('http://127.0.0.1:3456/api/health');
      if (res.status === 200) {
        ready = true;
        break;
      }
    } catch {}
  }
  if (!ready) {
    throw new Error('Server failed to start within timeout');
  }

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

    // 3b. Costume and Released in GO Filter Test
    const costumeRes = await request('http://localhost:3456/api/pokemon?category=costume&limit=3');
    console.log(`[TEST 3b] Costumes API: HTTP ${costumeRes.status}, count: ${costumeRes.data.length}, sample: ${costumeRes.data[0]?.name}`);
    if (costumeRes.data.length === 0 || !costumeRes.data[0].isCostume) throw new Error('Costumes query failed');
    console.log('✓ Costumes API passed');

    const releasedRes = await request('http://localhost:3456/api/pokemon?releasedOnly=true&limit=10');
    console.log(`[TEST 3c] Released Only: HTTP ${releasedRes.status}, count: ${releasedRes.data.length}`);
    if (releasedRes.data.some(p => !p.releasedInGo)) throw new Error('Unreleased pokemon returned when releasedOnly=true');
    console.log('✓ Released in GO filter passed');

    // 4. Progress Toggle Test
    const toggleRes = await request('http://localhost:3456/api/progress/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { pokemonId: 'poke_1_base', type: 'caught' }
    });
    console.log(`[TEST 4] Toggle Caught: HTTP ${toggleRes.status}, new value: ${toggleRes.data.value}`);
    if (!toggleRes.data.value) throw new Error('Toggle failed to mark caught');
    console.log('✓ Toggle caught passed');

    // 5. Custom Collections & Batch Test
    const collsRes = await request('http://localhost:3456/api/collections');
    console.log(`[TEST 5] Collections: HTTP ${collsRes.status}, collections count: ${collsRes.data.length}`);
    console.log('Collections:', collsRes.data.map(c => c.name).join(', '));
    const targetColl = collsRes.data[0];

    // Batch item set test (like Vivillon preset)
    const batchRes = await request(`http://localhost:3456/api/collections/${targetColl.id}/items/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { pokemonIds: ['poke_1_base', 'poke_2_base', 'poke_3_base'], mode: 'replace' }
    });
    console.log(`[TEST 5b] Batch Items Set: HTTP ${batchRes.status}, count: ${batchRes.data.count}`);
    if (!batchRes.data.success) throw new Error('Batch set failed');
    console.log('✓ Batch collection items passed');

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

    // 8. Advanced Custom Collection Test (Screenshot Builder Features)
    const newCollRes = await request('http://localhost:3456/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        name: 'Crypto 100% Sammlung',
        description: 'SHADOW - Multivariante',
        color: '#a855f7',
        categoryType: 'shadow',
        variantMode: 'multi',
        trackShiny: true,
        trackHundo: true,
        trackGender: true,
        trackSize: true,
        pokemonIds: ['poke_1_base', 'poke_4_base', 'poke_7_base']
      }
    });
    console.log(`[TEST 8] Create Custom Collection: HTTP ${newCollRes.status}, id: ${newCollRes.data.id}, type: ${newCollRes.data.categoryType}`);
    if (newCollRes.data.categoryType !== 'shadow' || !newCollRes.data.trackHundo) {
      throw new Error('Custom collection attributes not saved properly');
    }
    console.log('✓ Advanced custom collection created successfully');

    // 9. Multi-Feature Progress Toggle Test (Shadow, Hundo, Gender, Size)
    const shadowToggle = await request('http://localhost:3456/api/progress/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { pokemonId: 'poke_1_base', type: 'shadow' }
    });
    const hundoToggle = await request('http://localhost:3456/api/progress/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { pokemonId: 'poke_1_base', type: 'hundo' }
    });
    const genderToggle = await request('http://localhost:3456/api/progress/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { pokemonId: 'poke_1_base', type: 'gender_m' }
    });
    console.log(`[TEST 9] Feature Toggles: shadow=${shadowToggle.data.value}, hundo=${hundoToggle.data.value}, gender_m=${genderToggle.data.value}`);
    if (!shadowToggle.data.value || !hundoToggle.data.value || !genderToggle.data.value) {
      throw new Error('Feature progress toggle failed');
    }
    console.log('✓ Feature progress toggles passed');

    console.log('\n=========================================');
    console.log('🎉 ALL 9 FULL-STACK TESTS PASSED 100%! 🎉');
    console.log('=========================================\n');
  } finally {
    serverProc.kill();
  }
}

main().catch(err => {
  console.error('Test failure:', err);
  process.exit(1);
});
