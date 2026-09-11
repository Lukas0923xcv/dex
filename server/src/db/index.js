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
  'ALTER TABLE pokemon ADD COLUMN has_shadow INTEGER DEFAULT 0;'
];

for (const sql of migrations) {
  try {
    db.exec(sql);
  } catch {}
}

console.log('Database tables verified and WAL mode enabled.');

module.exports = db;
