const fs = require('fs');
const path = require('path');
const db = require('./index');

function seedDatabase(force = false) {
  console.log('Checking if Pokémon database needs seeding...');
  
  const jsonPath = path.join(__dirname, '..', '..', '..', 'data', 'pokemon-data.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`Error: Data file not found at ${jsonPath}. Run compile-pogo-data.js first!`);
    return;
  }

  const pokemonList = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const countRow = db.prepare('SELECT COUNT(*) as count FROM pokemon').get();
  const shadowCountRow = db.prepare('SELECT COUNT(*) as count FROM pokemon WHERE has_shadow = 1').get();
  const shadowShinyCountRow = db.prepare('SELECT COUNT(*) as count FROM pokemon WHERE has_shadow_shiny = 1').get();
  const expectedShadowCount = pokemonList.filter(p => p.hasShadow).length;
  const expectedShadowShinyCount = pokemonList.filter(p => p.hasShadowShiny).length;
  if (!force && countRow && countRow.count === pokemonList.length && shadowCountRow && shadowCountRow.count >= expectedShadowCount && shadowShinyCountRow && shadowShinyCountRow.count >= expectedShadowShinyCount) {
    console.log(`Database already up-to-date with ${countRow.count} Pokémon, ${shadowCountRow.count} Shadow/Crypto records, and ${shadowShinyCountRow.count} Shadow Shiny records.`);
    return;
  }

  console.log(`Seeding/updating ${pokemonList.length} Pokémon records in SQLite...`);

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
  try {
    const toSql = (val) => (val === undefined || val === null ? null : val);
    for (const p of pokemonList) {
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
    console.log(`Seeding/updating completed successfully: ${pokemonList.length} records processed.`);
  } catch (err) {
    db.exec('ROLLBACK;');
    console.error('Failed to seed database:', err);
    throw err;
  }

  // Seed default custom collections if none exist
  const collCount = db.prepare('SELECT COUNT(*) as count FROM custom_collections').get();
  if (!collCount || collCount.count === 0) {
    console.log('Seeding default custom collections...');
    const insertColl = db.prepare(`
      INSERT INTO custom_collections (id, name, description, color, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    insertColl.run('coll_lucky_wishlist', 'Lucky Trade Wishlist', 'Pokémon targeted for lucky mirror or special trades', '#f59e0b', now);
    insertColl.run('coll_pvp_great_league', 'PvP Great League Targets', 'Meta relevant Pokémon for Great League (1500 CP cap)', '#3b82f6', now);
    insertColl.run('coll_shadow_hundo', 'Shadow 100% Targets', 'Top tier shadow attackers to hunt or purify', '#8b5cf6', now);
    console.log('Default collections created.');
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
