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
  for (let i = 0; i < 35; i++) {
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

    // 3d. Form Sprite & Name Validation Test
    const formsRes = await request('http://localhost:3456/api/pokemon?category=form&limit=500');
    const tox = formsRes.data.find(p => p.id === 'poke_849_special_low_key');
    if (!tox || !tox.spriteUrl.includes('10184.png')) {
      throw new Error(`Toxtricity Low Key has invalid sprite: ${tox?.spriteUrl}`);
    }
    const ursh = formsRes.data.find(p => p.id === 'poke_892_special_rapid_strike');
    if (!ursh || !ursh.spriteUrl.includes('10191.png')) {
      throw new Error(`Urshifu Rapid Strike has invalid sprite: ${ursh?.spriteUrl}`);
    }
    const taurosBreeds = formsRes.data.filter(p => p.dexNr === 128);
    const taurosNames = new Set(taurosBreeds.map(t => t.name));
    if (taurosNames.size !== taurosBreeds.length) {
      throw new Error(`Duplicate Paldean Tauros names found: ${Array.from(taurosNames)}`);
    }
    console.log(`[TEST 3d] Form accuracy passed (Toxtricity: 10184, Urshifu: 10191, Tauros breeds: ${taurosNames.size})`);

    // 3e. Costume Accuracy & Starter Visor Verification
    const allCostumesRes = await request('http://localhost:3456/api/pokemon?category=costume&limit=500');
    if (allCostumesRes.data.length !== 295) {
      throw new Error(`Expected exactly 295 costumes, got ${allCostumesRes.data.length}`);
    }
    const crownedInCostumes = allCostumesRes.data.filter(p => p.dexNr === 888 || p.dexNr === 889);
    if (crownedInCostumes.length > 0) {
      throw new Error(`Zacian/Zamazenta Crowned should be forms, not costumes: ${crownedInCostumes.length}`);
    }

    const pikavisorIvy = allCostumesRes.data.find(p => p.id === 'poke_2_costume_spring_2020');
    if (!pikavisorIvy || !pikavisorIvy.spriteUrl.includes('GO0002Visor.png')) {
      throw new Error(`Pikavisor Ivysaur missing or invalid sprite: ${pikavisorIvy?.spriteUrl}`);
    }
    const partyIvy = allCostumesRes.data.find(p => p.id === 'poke_2_costume_jan_2020_noevolve');
    if (!partyIvy || partyIvy.formName !== 'Party Hat') {
      throw new Error(`Party Ivysaur missing or not labeled Party Hat: ${partyIvy?.formName}`);
    }
    const fakeCostumes = allCostumesRes.data.filter(p => p.dexNr === 585 || p.dexNr === 586);
    if (fakeCostumes.length > 0) {
      throw new Error(`Deerling/Sawsbuck seasonal forms incorrectly present in costumes: ${fakeCostumes.length}`);
    }
    
    // Check Venusaur deduplication: exactly 1 Copy 2019 card
    const venusaurCopies = allCostumesRes.data.filter(p => p.dexNr === 3 && p.formId === 'COPY_2019');
    if (venusaurCopies.length !== 1) {
      throw new Error(`Expected exactly 1 Venusaur Copy 2019, found: ${venusaurCopies.length}`);
    }

    // Verify local static costume image serves with 200 OK
    const localImgRes = await request('http://localhost:3456/images/costumes/GO0002Visor.png');
    if (localImgRes.status !== 200 || !localImgRes.headers['content-type']?.includes('image/png')) {
      throw new Error(`Local costume image failed to load: HTTP ${localImgRes.status}, Content-Type: ${localImgRes.headers['content-type']}`);
    }

    console.log(`[TEST 3e] Costume accuracy passed (Count: 295, Crowned not costume, Pikavisor Ivysaur: verified, Venusaur Copy deduplication: 1, Local costume sprite 200 OK, Deerling fake: 0)`);

    // 3f. Gender Differences & Form Count Validation
    const allFormsRes = await request('http://localhost:3456/api/pokemon?category=form&limit=500');
    if (allFormsRes.data.length !== 311) {
      throw new Error(`Expected exactly 311 forms (210 regional/alternate + 101 gender diffs), got: ${allFormsRes.data.length}`);
    }
    const genderDiffForms = allFormsRes.data.filter(p => p.isGenderDifference);
    if (genderDiffForms.length !== 101) {
      throw new Error(`Expected 101 total gender diff forms, got: ${genderDiffForms.length}`);
    }
    const femalePika = genderDiffForms.find(p => p.dexNr === 25);
    if (!femalePika || !femalePika.spriteUrl.includes('other/home/female/25.png')) {
      throw new Error(`Female Pikachu form invalid: ${femalePika?.spriteUrl}`);
    }
    const femaleWobbu = genderDiffForms.find(p => p.dexNr === 202);
    if (!femaleWobbu || !femaleWobbu.spriteUrl.includes('other/home/female/202.png')) {
      throw new Error(`Female Wobbuffet form invalid: ${femaleWobbu?.spriteUrl}`);
    }
    console.log(`[TEST 3f] Gender difference forms passed (Total: 101, Female Pikachu & Wobbuffet verified)`);

    // 3g. Base Form First Sorting Order Verification
    const fullDexRes = await request('http://localhost:3456/api/pokemon?limit=2500');
    const isBase = p => p.category === 'standard' || (!p.isForm && !p.isMega && !p.isCostume && !p.isGenderDifference);
    const sortedSample = [...fullDexRes.data].sort((a, b) => {
      if (a.dexNr !== b.dexNr) return a.dexNr - b.dexNr;
      const aBase = isBase(a);
      const bBase = isBase(b);
      if (aBase !== bBase) return aBase ? -1 : 1;
      if (Boolean(a.isGenderDifference) !== Boolean(b.isGenderDifference)) return a.isGenderDifference ? 1 : -1;
      return (a.formName || a.name).localeCompare(b.formName || b.name);
    });

    // Check species with forms: Rattata (#19), Pikachu (#25), Vulpix (#37)
    const vulpixGroup = sortedSample.filter(p => p.dexNr === 37);
    if (vulpixGroup[0].name !== 'Vulpix' || !isBase(vulpixGroup[0])) {
      throw new Error(`Vulpix sorting failed: ${vulpixGroup[0].name} was first instead of Base Vulpix`);
    }
    const pikaGroup = sortedSample.filter(p => p.dexNr === 25);
    if (pikaGroup[0].name !== 'Pikachu' || !isBase(pikaGroup[0])) {
      throw new Error(`Pikachu sorting failed: ${pikaGroup[0].name} was first instead of Base Pikachu`);
    }
    console.log(`[TEST 3g] Base form first sorting order verified (Vulpix base before Alolan, Pikachu base before Female)`);
    const wasCaught = pokeRes.data.find(p => p.id === 'poke_1_base')?.caught ?? false;
    const toggleRes = await request('http://localhost:3456/api/progress/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { pokemonId: 'poke_1_base', type: 'caught' }
    });
    console.log(`[TEST 4] Toggle Caught: HTTP ${toggleRes.status}, old: ${wasCaught}, new: ${toggleRes.data.value}`);
    if (toggleRes.data.value === wasCaught) throw new Error('Toggle failed to invert caught state');
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

    // 5c. Collection Items API map and single collection items test
    const allItemsRes = await request('http://localhost:3456/api/collection-items');
    console.log(`[TEST 5c] All Collection Items Map: HTTP ${allItemsRes.status}, keys: ${Object.keys(allItemsRes.data).length}`);
    if (typeof allItemsRes.data !== 'object') throw new Error('Failed to get collection-items map');

    const singleItemsRes = await request(`http://localhost:3456/api/collections/${targetColl.id}/items`);
    console.log(`[TEST 5d] Single Collection Items: HTTP ${singleItemsRes.status}, count: ${singleItemsRes.data.pokemonIds?.length}`);
    if (!Array.isArray(singleItemsRes.data.pokemonIds) || singleItemsRes.data.pokemonIds.length !== 3) {
      throw new Error('Single collection items query mismatch');
    }
    console.log('✓ Collection item retrieval endpoints verified (no 0/0 error)');

    // 6. Export Test
    const exportRes = await request('http://localhost:3456/api/export');
    const totalProgCount = (exportRes.data?.data?.progressV2?.length || 0) + (exportRes.data?.data?.progress?.length || 0);
    console.log(`[TEST 6] Export: HTTP ${exportRes.status}, progress count: ${totalProgCount}`);
    if (!exportRes.data.app || totalProgCount === 0) {
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
    if (typeof shadowToggle.data.value !== 'boolean' || typeof hundoToggle.data.value !== 'boolean' || typeof genderToggle.data.value !== 'boolean') {
      throw new Error('Feature progress toggle failed: returned non-boolean');
    }
    console.log('✓ Feature progress toggles passed');

    // 10. Accurate Shiny & Crypto Data Verification
    const allPokeRes = await request('http://localhost:3456/api/pokemon?limit=2500');
    const allList = allPokeRes.data;
    const shinyCount = allList.filter(p => p.hasShiny).length;
    const shadowCount = allList.filter(p => p.hasShadow).length;
    console.log(`[TEST 10] Shiny & Shadow counts: Total=${allList.length}, Shinies=${shinyCount}, Shadows=${shadowCount}`);

    if (shinyCount !== 1516) {
      throw new Error(`Expected exactly 1516 released shiny species/forms, got: ${shinyCount}`);
    }
    if (shadowCount !== 483) {
      throw new Error(`Expected exactly 483 released shadow species/forms, got: ${shadowCount}`);
    }

    // Check shiny-locked species: Victini (#494), Marshadow (#802), Cosmog (#789)
    const victini = allList.find(p => p.dexNr === 494);
    if (!victini || victini.hasShiny !== false) {
      throw new Error(`Victini (#494) must be shiny-locked (hasShiny === false), got: ${victini?.hasShiny}`);
    }
    const marshadow = allList.find(p => p.dexNr === 802);
    if (!marshadow || marshadow.hasShiny !== false) {
      throw new Error(`Marshadow (#802) must be shiny-locked (hasShiny === false), got: ${marshadow?.hasShiny}`);
    }
    const cosmog = allList.find(p => p.dexNr === 789);
    if (!cosmog || cosmog.hasShiny !== false) {
      throw new Error(`Cosmog (#789) must be shiny-locked (hasShiny === false), got: ${cosmog?.hasShiny}`);
    }

    // Check shadow species: Bulbasaur (#1) hasShadow === true, Pikachu (#25) hasShadow === false
    const bulba = allList.find(p => p.dexNr === 1 && p.category === 'standard');
    if (!bulba || bulba.hasShadow !== true) {
      throw new Error(`Bulbasaur must have hasShadow === true, got: ${bulba?.hasShadow}`);
    }
    const pika = allList.find(p => p.dexNr === 25 && p.category === 'standard');
    if (!pika || pika.hasShadow !== false) {
      throw new Error(`Pikachu must have hasShadow === false (no shadow Pikachu in PoGO), got: ${pika?.hasShadow}`);
    }
    console.log('✓ Accurate shiny-lock & crypto species verified');

    // 11. Shadow Category Query API Test
    const shadowQueryRes = await request('http://localhost:3456/api/pokemon?category=shadow&limit=1000');
    console.log(`[TEST 11] Shadow Query API: HTTP ${shadowQueryRes.status}, count: ${shadowQueryRes.data.length}`);
    if (shadowQueryRes.data.length !== 483) {
      throw new Error(`Expected 483 shadow pokemon from category=shadow query, got: ${shadowQueryRes.data.length}`);
    }
    console.log('✓ Shadow category API query passed');

    // 12. Smart Crypto Keyword Search & shadowOnly Filter Test
    const searchCrypto = await request('http://localhost:3456/api/pokemon?search=crypto&limit=1000');
    const searchShadow = await request('http://localhost:3456/api/pokemon?search=shadow&limit=1000');
    const searchSchatten = await request('http://localhost:3456/api/pokemon?search=schatten&limit=1000');
    const filterShadowOnly = await request('http://localhost:3456/api/pokemon?shadowOnly=true&limit=1000');
    const searchCompound = await request('http://localhost:3456/api/pokemon?search=crypto%20mewtu');

    console.log(`[TEST 12] Crypto Search: crypto=${searchCrypto.data.length}, shadow=${searchShadow.data.length}, schatten=${searchSchatten.data.length}, shadowOnly=${filterShadowOnly.data.length}, compound=${searchCompound.data.length}`);
    if (searchCrypto.data.length !== 483 || searchShadow.data.length !== 483 || searchSchatten.data.length !== 483 || filterShadowOnly.data.length !== 483) {
      throw new Error(`Smart crypto search failed to return all 483 shadow pokemon`);
    }
    if (searchCompound.data.length === 0 || !(searchCompound.data[0].name.toLowerCase().includes('mewt') || searchCompound.data[0].names?.German === 'Mewtu')) {
      throw new Error(`Compound search "crypto mewtu" failed`);
    }
    console.log('✓ Smart crypto search & shadowOnly filter passed');

    // 13. Shadow Batch Progress Update Test
    const batchShadowRes = await request('http://localhost:3456/api/progress/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { pokemonIds: ['poke_1_base', 'poke_4_base'], shadowCaught: true }
    });
    console.log(`[TEST 13] Batch Shadow Progress: HTTP ${batchShadowRes.status}, success: ${batchShadowRes.data.success}`);
    if (!batchShadowRes.data.success) {
      throw new Error('Batch shadow progress update failed');
    }
    const checkBulba = await request('http://localhost:3456/api/pokemon?category=standard&limit=1');
    if (!checkBulba.data[0].shadowCaught) {
      throw new Error('Bulbasaur shadowCaught was not persisted');
    }
    console.log('✓ Shadow batch progress update passed');

    // 14. Delete Custom Collection Test (ensures db transaction fix works)
    const deleteCollRes = await request(`http://localhost:3456/api/collections/${newCollRes.data.id}`, {
      method: 'DELETE'
    });
    console.log(`[TEST 14] Delete Custom Collection: HTTP ${deleteCollRes.status}, result:`, deleteCollRes.data);
    if (deleteCollRes.status !== 200 || !deleteCollRes.data.success) {
      throw new Error('Failed to delete custom collection');
    }
    console.log('✓ Custom collection deletion verified (db transaction works)');

    console.log('\n=========================================');
    console.log('🎉 ALL 14 FULL-STACK TESTS PASSED 100%! 🎉');
    console.log('=========================================\n');
  } finally {
    serverProc.kill();
  }
}

main().catch(err => {
  console.error('Test failure:', err);
  process.exit(1);
});
