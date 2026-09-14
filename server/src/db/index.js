const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

// Determine data directory (default to project data/ or env DATA_DIR)
const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'dex.db');
console.log(`Connecting to SQLite database at: ${dbPath}`);

const db = new DatabaseSync(dbPath);

// Enable WAL (Write-Ahead Logging) mode and performance pragmas
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA cache_size = -64000;'); // 64MB cache

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS pokemon (
    id TEXT PRIMARY KEY,
    dex_nr INTEGER NOT NULL,
    name TEXT NOT NULL,
    form_id TEXT,
    form_name TEXT,
    category TEXT NOT NULL, -- 'standard', 'mega', 'form'
    generation INTEGER NOT NULL,
    type1 TEXT NOT NULL,
    type2 TEXT,
    sprite_url TEXT NOT NULL,
    shiny_sprite_url TEXT NOT NULL,
    fallback_sprite_url TEXT,
    fallback_shiny_url TEXT,
    official_artwork_url TEXT,
    has_shiny INTEGER DEFAULT 1,
    has_shadow INTEGER DEFAULT 0,
    has_shadow_shiny INTEGER DEFAULT 0,
    is_mega INTEGER DEFAULT 0,
    is_form INTEGER DEFAULT 0,
    is_costume INTEGER DEFAULT 0,
    is_gender_difference INTEGER DEFAULT 0,
    released_in_go INTEGER DEFAULT 1
  );

  CREATE INDEX IF NOT EXISTS idx_pokemon_dex_nr ON pokemon(dex_nr);
  CREATE INDEX IF NOT EXISTS idx_pokemon_category ON pokemon(category);
  CREATE INDEX IF NOT EXISTS idx_pokemon_gen ON pokemon(generation);
  CREATE INDEX IF NOT EXISTS idx_pokemon_type ON pokemon(type1, type2);
  CREATE INDEX IF NOT EXISTS idx_pokemon_released ON pokemon(released_in_go);
`);

try {
  db.exec('ALTER TABLE pokemon ADD COLUMN is_costume INTEGER DEFAULT 0;');
} catch (e) {
  // Column already exists
}
try {
  db.exec('ALTER TABLE pokemon ADD COLUMN is_gender_difference INTEGER DEFAULT 0;');
} catch (e) {
  // Column already exists
}
try {
  db.exec('ALTER TABLE pokemon ADD COLUMN names_json TEXT;');
} catch (e) {
  // Column already exists
}

db.exec(`

  CREATE TABLE IF NOT EXISTS user_progress (
    pokemon_id TEXT PRIMARY KEY,
    caught INTEGER DEFAULT 0,
    shiny_caught INTEGER DEFAULT 0,
    lucky_caught INTEGER DEFAULT 0,
    hundo_caught INTEGER DEFAULT 0,
    shadow_caught INTEGER DEFAULT 0,
    purified_caught INTEGER DEFAULT 0,
    gender_m_caught INTEGER DEFAULT 0,
    gender_f_caught INTEGER DEFAULT 0,
    xxl_caught INTEGER DEFAULT 0,
    xxs_caught INTEGER DEFAULT 0,
    notes TEXT,
    updated_at TEXT,
    FOREIGN KEY(pokemon_id) REFERENCES pokemon(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_progress_v2 (
    account_id TEXT NOT NULL DEFAULT 'default',
    dex_scope TEXT NOT NULL DEFAULT 'standard',
    pokemon_id TEXT NOT NULL,
    caught INTEGER DEFAULT 0,
    shiny_caught INTEGER DEFAULT 0,
    lucky_caught INTEGER DEFAULT 0,
    hundo_caught INTEGER DEFAULT 0,
    shadow_caught INTEGER DEFAULT 0,
    purified_caught INTEGER DEFAULT 0,
    gender_m_caught INTEGER DEFAULT 0,
    gender_f_caught INTEGER DEFAULT 0,
    xxl_caught INTEGER DEFAULT 0,
    xxs_caught INTEGER DEFAULT 0,
    notes TEXT,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (account_id, dex_scope, pokemon_id),
    FOREIGN KEY(pokemon_id) REFERENCES pokemon(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_up2_lookup ON user_progress_v2(account_id, dex_scope, pokemon_id);

  CREATE TABLE IF NOT EXISTS custom_collections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3b82f6',
    category_type TEXT DEFAULT 'normal',
    variant_mode TEXT DEFAULT 'multi',
    track_shiny INTEGER DEFAULT 0,
    track_hundo INTEGER DEFAULT 0,
    track_gender INTEGER DEFAULT 0,
    track_background INTEGER DEFAULT 0,
    track_size INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS custom_collection_items (
    collection_id TEXT NOT NULL,
    pokemon_id TEXT NOT NULL,
    added_at TEXT NOT NULL,
    PRIMARY KEY (collection_id, pokemon_id),
    FOREIGN KEY(collection_id) REFERENCES custom_collections(id) ON DELETE CASCADE,
    FOREIGN KEY(pokemon_id) REFERENCES pokemon(id) ON DELETE CASCADE
  );
`);

// Migrations for existing tables
const migrations = [
  'ALTER TABLE user_progress ADD COLUMN shadow_caught INTEGER DEFAULT 0;',
  'ALTER TABLE user_progress ADD COLUMN purified_caught INTEGER DEFAULT 0;',
  'ALTER TABLE user_progress ADD COLUMN gender_m_caught INTEGER DEFAULT 0;',
  'ALTER TABLE user_progress ADD COLUMN gender_f_caught INTEGER DEFAULT 0;',
  'ALTER TABLE user_progress ADD COLUMN xxl_caught INTEGER DEFAULT 0;',
  'ALTER TABLE user_progress ADD COLUMN xxs_caught INTEGER DEFAULT 0;',
  "ALTER TABLE custom_collections ADD COLUMN category_type TEXT DEFAULT 'normal';",
  "ALTER TABLE custom_collections ADD COLUMN variant_mode TEXT DEFAULT 'multi';",
  'ALTER TABLE custom_collections ADD COLUMN track_shiny INTEGER DEFAULT 0;',
  'ALTER TABLE custom_collections ADD COLUMN track_hundo INTEGER DEFAULT 0;',
  'ALTER TABLE custom_collections ADD COLUMN track_gender INTEGER DEFAULT 0;',
  'ALTER TABLE custom_collections ADD COLUMN track_background INTEGER DEFAULT 0;',
  'ALTER TABLE custom_collections ADD COLUMN track_size INTEGER DEFAULT 0;',
  'ALTER TABLE pokemon ADD COLUMN has_shadow INTEGER DEFAULT 0;',
  'ALTER TABLE pokemon ADD COLUMN has_shadow_shiny INTEGER DEFAULT 0;'
];

for (const sql of migrations) {
  try {
    db.exec(sql);
  } catch {}
}

// Auto-heal / populate has_shadow in SQLite if missing or zero
try {
  const jsonPath = path.join(__dirname, '..', '..', '..', 'data', 'pokemon-data.json');
  if (fs.existsSync(jsonPath)) {
    const pData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const expectedShadowCount = pData.filter(p => p.hasShadow).length;
    const shadowCheck = db.prepare('SELECT COUNT(*) as count FROM pokemon WHERE has_shadow = 1').get();
    if (!shadowCheck || shadowCheck.count < expectedShadowCount) {
      console.log(`Auto-healing SQLite shadow/crypto records (current: ${shadowCheck ? shadowCheck.count : 0}, expected: ${expectedShadowCount})...`);
      const updateStmt = db.prepare('UPDATE pokemon SET has_shadow = ? WHERE id = ?');
      db.exec('BEGIN TRANSACTION;');
      for (const p of pData) {
        updateStmt.run(p.hasShadow ? 1 : 0, p.id);
      }
      db.exec('COMMIT;');
      const updatedCheck = db.prepare('SELECT COUNT(*) as count FROM pokemon WHERE has_shadow = 1').get();
      console.log(`Successfully auto-healed has_shadow in SQLite database. Total shadow records: ${updatedCheck?.count}`);
    }

    // Auto-heal / populate has_shadow_shiny in SQLite if missing or zero
    const expectedShadowShinyCount = pData.filter(p => p.hasShadowShiny).length;
    const shadowShinyCheck = db.prepare('SELECT COUNT(*) as count FROM pokemon WHERE has_shadow_shiny = 1').get();
    if (!shadowShinyCheck || shadowShinyCheck.count < expectedShadowShinyCount) {
      console.log(`Auto-healing SQLite shadow shiny records (current: ${shadowShinyCheck ? shadowShinyCheck.count : 0}, expected: ${expectedShadowShinyCount})...`);
      const updateStmt = db.prepare('UPDATE pokemon SET has_shadow_shiny = ? WHERE id = ?');
      db.exec('BEGIN TRANSACTION;');
      for (const p of pData) {
        updateStmt.run(p.hasShadowShiny ? 1 : 0, p.id);
      }
      db.exec('COMMIT;');
      const updatedCheck = db.prepare('SELECT COUNT(*) as count FROM pokemon WHERE has_shadow_shiny = 1').get();
      console.log(`Successfully auto-healed has_shadow_shiny in SQLite database. Total shadow shiny records: ${updatedCheck?.count}`);
    }
  }
} catch (e) {
  console.warn('Shadow auto-heal note:', e.message);
}

// Auto-heal Hisui generation in SQLite if any Hisui Pokemon is still gen 9 or other gen
try {
  const hisuiGenCheck = db.prepare("SELECT COUNT(*) as count FROM pokemon WHERE id = 'poke_899_base' AND generation = 85").get();
  if (!hisuiGenCheck || hisuiGenCheck.count === 0) {
    console.log('Migrating Hisui Pokémon to generation 85 in SQLite database...');
    const jsonPath = path.join(__dirname, '..', '..', '..', 'data', 'pokemon-data.json');
    if (fs.existsSync(jsonPath)) {
      const pData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const updateGenStmt = db.prepare('UPDATE pokemon SET generation = ? WHERE id = ?');
      db.exec('BEGIN TRANSACTION;');
      for (const p of pData) {
        if (p.generation === 85) {
          updateGenStmt.run(85, p.id);
        }
      }
      db.exec('COMMIT;');
      console.log('Successfully updated Hisui Pokémon to generation 85 in SQLite database.');
    }
  }
} catch (e) {
  console.warn('Hisui auto-heal note:', e.message);
}

// Auto-heal missing Pokémon records (forms, new releases, etc.) into SQLite
try {
  const jsonPath = path.join(__dirname, '..', '..', '..', 'data', 'pokemon-data.json');
  if (fs.existsSync(jsonPath)) {
    const pData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const countRow = db.prepare('SELECT COUNT(*) as count FROM pokemon').get();
    const idSet = new Set(pData.map(p => p.id));
    const allDbRows = db.prepare('SELECT id FROM pokemon').all();
    const staleRows = allDbRows.filter(r => !idSet.has(r.id));

    if (staleRows.length > 0) {
      console.log(`Pruning ${staleRows.length} redundant Pokémon records from SQLite database...`);
      const deleteStmt = db.prepare('DELETE FROM pokemon WHERE id = ?');
      const deleteProgStmt = db.prepare('DELETE FROM user_progress WHERE pokemon_id = ?');
      const deleteProgV2Stmt = db.prepare('DELETE FROM user_progress_v2 WHERE pokemon_id = ?');
      const deleteCollStmt = db.prepare('DELETE FROM custom_collection_items WHERE pokemon_id = ?');
      db.exec('BEGIN TRANSACTION;');
      for (const r of staleRows) {
        deleteCollStmt.run(r.id);
        deleteProgStmt.run(r.id);
        deleteProgV2Stmt.run(r.id);
        deleteStmt.run(r.id);
      }
      db.exec('COMMIT;');
      console.log('Successfully pruned redundant Pokémon records from SQLite.');
    }

    if (!countRow || countRow.count !== pData.length || staleRows.length > 0) {
      console.log(`Auto-healing SQLite pokemon records (current: ${countRow ? countRow.count : 0}, expected: ${pData.length})...`);
      const upsertStmt = db.prepare(`
        INSERT INTO pokemon (
          id, dex_nr, name, form_id, form_name, category, generation,
          type1, type2, sprite_url, shiny_sprite_url, fallback_sprite_url,
          fallback_shiny_url, official_artwork_url, has_shiny, has_shadow, has_shadow_shiny, is_mega, is_form, is_costume, is_gender_difference, released_in_go, names_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          dex_nr = excluded.dex_nr,
          name = excluded.name,
          form_id = excluded.form_id,
          form_name = excluded.form_name,
          category = excluded.category,
          generation = excluded.generation,
          type1 = excluded.type1,
          type2 = excluded.type2,
          sprite_url = excluded.sprite_url,
          shiny_sprite_url = excluded.shiny_sprite_url,
          fallback_sprite_url = excluded.fallback_sprite_url,
          fallback_shiny_url = excluded.fallback_shiny_url,
          official_artwork_url = excluded.official_artwork_url,
          has_shiny = excluded.has_shiny,
          has_shadow = excluded.has_shadow,
          has_shadow_shiny = excluded.has_shadow_shiny,
          is_mega = excluded.is_mega,
          is_form = excluded.is_form,
          is_costume = excluded.is_costume,
          is_gender_difference = excluded.is_gender_difference,
          released_in_go = excluded.released_in_go,
          names_json = excluded.names_json
      `);
      db.exec('BEGIN TRANSACTION;');
      const toSql = (val) => (val === undefined || val === null ? null : val);
      for (const p of pData) {
        upsertStmt.run(
          toSql(p.id),
          toSql(p.dexNr),
          toSql(p.name),
          toSql(p.formId),
          toSql(p.formName),
          toSql(p.category),
          toSql(p.generation),
          toSql(p.type1),
          toSql(p.type2),
          toSql(p.spriteUrl),
          toSql(p.shinySpriteUrl),
          toSql(p.fallbackSpriteUrl),
          toSql(p.fallbackShinyUrl),
          toSql(p.officialArtworkUrl),
          p.hasShiny ? 1 : 0,
          p.hasShadow ? 1 : 0,
          p.hasShadowShiny ? 1 : 0,
          p.isMega ? 1 : 0,
          p.isForm ? 1 : 0,
          p.isCostume ? 1 : 0,
          p.isGenderDifference ? 1 : 0,
          p.releasedInGo ? 1 : 0,
          p.names ? JSON.stringify(p.names) : null
        );
      }
      db.exec('COMMIT;');
      const updatedRow = db.prepare('SELECT COUNT(*) as count FROM pokemon').get();
      console.log(`Successfully auto-healed SQLite pokemon table. Total records: ${updatedRow?.count}`);
    } else {
      // Sync form names, updated sprite URLs, and releasedInGo status on existing records
      const updateSpriteStmt = db.prepare(`
        UPDATE pokemon SET 
          form_name = ?,
          sprite_url = ?,
          shiny_sprite_url = ?,
          fallback_sprite_url = ?,
          fallback_shiny_url = ?,
          released_in_go = ?
        WHERE id = ? AND (
          form_name IS NOT ? OR
          sprite_url IS NOT ? OR
          shiny_sprite_url IS NOT ? OR
          fallback_sprite_url IS NOT ? OR
          fallback_shiny_url IS NOT ? OR
          released_in_go IS NOT ?
        )
      `);
      db.exec('BEGIN TRANSACTION;');
      for (const p of pData) {
        updateSpriteStmt.run(
          p.formName || null,
          p.spriteUrl || null,
          p.shinySpriteUrl || null,
          p.fallbackSpriteUrl || null,
          p.fallbackShinyUrl || null,
          p.releasedInGo ? 1 : 0,
          p.id,
          p.formName || null,
          p.spriteUrl || null,
          p.shinySpriteUrl || null,
          p.fallbackSpriteUrl || null,
          p.fallbackShinyUrl || null,
          p.releasedInGo ? 1 : 0
        );
      }
      db.exec('COMMIT;');
    }
  }
} catch (e) {
  console.warn('Pokemon table auto-heal note:', e.message);
}

// Initialize default account if none exists
try {
  db.prepare(`
    INSERT OR IGNORE INTO user_accounts (id, name, created_at)
    VALUES ('default', 'Haupt-Account', datetime('now'))
  `).run();
} catch (e) {
  console.warn('Accounts init note:', e.message);
}

// Auto-migrate legacy user_progress into user_progress_v2 (account: 'default', scope: 'standard')
try {
  const v2Count = db.prepare('SELECT COUNT(*) as count FROM user_progress_v2').get();
  if (!v2Count || v2Count.count === 0) {
    const legacyCount = db.prepare('SELECT COUNT(*) as count FROM user_progress').get();
    if (legacyCount && legacyCount.count > 0) {
      console.log(`Migrating ${legacyCount.count} legacy progress records to user_progress_v2...`);
      db.exec(`
        INSERT OR IGNORE INTO user_progress_v2 (
          account_id, dex_scope, pokemon_id, caught, shiny_caught, lucky_caught,
          hundo_caught, shadow_caught, purified_caught, gender_m_caught,
          gender_f_caught, xxl_caught, xxs_caught, notes, updated_at
        )
        SELECT 
          'default', 'standard', pokemon_id, caught, shiny_caught, lucky_caught,
          hundo_caught, shadow_caught, purified_caught, gender_m_caught,
          gender_f_caught, xxl_caught, xxs_caught, notes, COALESCE(updated_at, datetime('now'))
        FROM user_progress;
      `);
      console.log('Legacy user progress successfully migrated into user_progress_v2.');
    }
  }
} catch (e) {
  console.warn('Progress v2 migration note:', e.message);
}

// Auto-seed 'form' scope in user_progress_v2 if 'form' scope is empty
try {
  const formCount = db.prepare("SELECT COUNT(*) as count FROM user_progress_v2 WHERE dex_scope = 'form'").get();
  if (!formCount || formCount.count === 0) {
    const standardCount = db.prepare("SELECT COUNT(*) as count FROM user_progress_v2 WHERE dex_scope = 'standard'").get();
    if (standardCount && standardCount.count > 0) {
      console.log('Seeding form dex_scope from standard progress...');
      db.exec(`
        INSERT OR IGNORE INTO user_progress_v2 (
          account_id, dex_scope, pokemon_id, caught, shiny_caught, lucky_caught,
          hundo_caught, shadow_caught, purified_caught, gender_m_caught,
          gender_f_caught, xxl_caught, xxs_caught, notes, updated_at
        )
        SELECT 
          account_id, 'form', pokemon_id, caught, shiny_caught, lucky_caught,
          hundo_caught, shadow_caught, purified_caught, gender_m_caught,
          gender_f_caught, xxl_caught, xxs_caught, notes, updated_at
        FROM user_progress_v2
        WHERE dex_scope = 'standard';
      `);
    }
  }
} catch (e) {
  console.warn('Form scope migration note:', e.message);
}

console.log('Database tables verified and WAL mode enabled.');

module.exports = db;
