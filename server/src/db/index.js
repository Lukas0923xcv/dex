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
    is_mega INTEGER DEFAULT 0,
    is_form INTEGER DEFAULT 0,
    is_costume INTEGER DEFAULT 0,
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

db.exec(`

  CREATE TABLE IF NOT EXISTS user_progress (
    pokemon_id TEXT PRIMARY KEY,
    caught INTEGER DEFAULT 0,
    shiny_caught INTEGER DEFAULT 0,
    lucky_caught INTEGER DEFAULT 0,
    hundo_caught INTEGER DEFAULT 0,
    notes TEXT,
    updated_at TEXT,
    FOREIGN KEY(pokemon_id) REFERENCES pokemon(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS custom_collections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3b82f6',
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

console.log('Database tables verified and WAL mode enabled.');

module.exports = db;
