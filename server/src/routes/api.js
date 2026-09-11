const express = require('express');
const router = express.Router();
const db = require('../db/index');
const crypto = require('crypto');

// Health Check
router.get('/health', (req, res) => {
  try {
    const row = db.prepare('SELECT COUNT(*) as count FROM pokemon').get();
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      pokemonCount: row ? row.count : 0,
      walMode: true
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// GET /api/pokemon
router.get('/pokemon', (req, res) => {
  try {
    const {
      category,
      generation,
      search,
      type,
      status, // 'all', 'caught', 'uncaught'
      collectionId,
      limit = 2000,
      offset = 0
    } = req.query;

    let sql = `
      SELECT 
        p.id,
        p.dex_nr as dexNr,
        p.name,
        p.form_id as formId,
        p.form_name as formName,
        p.category,
        p.generation,
        p.type1,
        p.type2,
        p.sprite_url as spriteUrl,
        p.shiny_sprite_url as shinySpriteUrl,
        p.fallback_sprite_url as fallbackSpriteUrl,
        p.fallback_shiny_url as fallbackShinyUrl,
        p.official_artwork_url as officialArtworkUrl,
        p.has_shiny as hasShiny,
        p.is_mega as isMega,
        p.is_form as isForm,
        p.released_in_go as releasedInGo,
        COALESCE(up.caught, 0) as caught,
        COALESCE(up.shiny_caught, 0) as shinyCaught,
        COALESCE(up.lucky_caught, 0) as luckyCaught,
        COALESCE(up.hundo_caught, 0) as hundoCaught,
        up.notes,
        up.updated_at as updatedAt,
        CASE WHEN cci.pokemon_id IS NOT NULL THEN 1 ELSE 0 END as inCollection
      FROM pokemon p
      LEFT JOIN user_progress up ON p.id = up.pokemon_id
      LEFT JOIN custom_collection_items cci ON p.id = cci.pokemon_id ${collectionId ? 'AND cci.collection_id = ?' : 'AND 1=0'}
      WHERE 1=1
    `;

    const params = [];
    if (collectionId) {
      params.push(collectionId);
    }

    if (collectionId) {
      sql += ` AND cci.pokemon_id IS NOT NULL`;
    }

    if (category && category !== 'all') {
      if (category === 'shiny') {
        sql += ` AND p.has_shiny = 1`;
      } else {
        sql += ` AND p.category = ?`;
        params.push(category);
      }
    }

    if (generation && generation !== 'all') {
      sql += ` AND p.generation = ?`;
      params.push(parseInt(generation, 10));
    }

    if (type && type !== 'all') {
      sql += ` AND (p.type1 = ? OR p.type2 = ?)`;
      params.push(type, type);
    }

    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      const num = parseInt(search.trim(), 10);
      if (!isNaN(num)) {
        sql += ` AND (p.dex_nr = ? OR LOWER(p.name) LIKE ?)`;
        params.push(num, term);
      } else {
        sql += ` AND (LOWER(p.name) LIKE ? OR LOWER(COALESCE(p.form_name, '')) LIKE ?)`;
        params.push(term, term);
      }
    }

    if (status === 'caught') {
      if (category === 'shiny') {
        sql += ` AND up.shiny_caught = 1`;
      } else {
        sql += ` AND up.caught = 1`;
      }
    } else if (status === 'uncaught') {
      if (category === 'shiny') {
        sql += ` AND (up.shiny_caught IS NULL OR up.shiny_caught = 0)`;
      } else {
        sql += ` AND (up.caught IS NULL OR up.caught = 0)`;
      }
    }

    // Sort order
    sql += ` ORDER BY p.dex_nr ASC, p.category ASC, p.id ASC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const rows = db.prepare(sql).all(...params);

    // Convert integer booleans
    const result = rows.map(r => ({
      ...r,
      hasShiny: Boolean(r.hasShiny),
      isMega: Boolean(r.isMega),
      isForm: Boolean(r.isForm),
      releasedInGo: Boolean(r.releasedInGo),
      caught: Boolean(r.caught),
      shinyCaught: Boolean(r.shinyCaught),
      luckyCaught: Boolean(r.luckyCaught),
      hundoCaught: Boolean(r.hundoCaught),
      inCollection: Boolean(r.inCollection)
    }));

    res.json(result);
  } catch (err) {
    console.error('Error fetching pokemon:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/progress/toggle
router.post('/progress/toggle', (req, res) => {
  try {
    const { pokemonId, type = 'caught' } = req.body;
    if (!pokemonId) {
      return res.status(400).json({ error: 'pokemonId is required' });
    }

    const field = type === 'shiny' ? 'shiny_caught' : type === 'lucky' ? 'lucky_caught' : 'caught';
    const now = new Date().toISOString();

    const existing = db.prepare('SELECT * FROM user_progress WHERE pokemon_id = ?').get(pokemonId);

    let newVal = 1;
    if (existing) {
      newVal = existing[field] ? 0 : 1;
      db.prepare(`
        UPDATE user_progress
        SET ${field} = ?, updated_at = ?
        WHERE pokemon_id = ?
      `).run(newVal, now, pokemonId);
    } else {
      db.prepare(`
        INSERT INTO user_progress (pokemon_id, ${field}, updated_at)
        VALUES (?, ?, ?)
      `).run(pokemonId, 1, now);
      newVal = 1;
    }

    res.json({
      pokemonId,
      type,
      value: Boolean(newVal),
      updatedAt: now
    });
  } catch (err) {
    console.error('Error toggling progress:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/progress/batch
router.post('/progress/batch', (req, res) => {
  try {
    const { pokemonIds, caught, shinyCaught } = req.body;
    if (!Array.isArray(pokemonIds) || pokemonIds.length === 0) {
      return res.status(400).json({ error: 'pokemonIds array required' });
    }

    const now = new Date().toISOString();
    const upsertStmt = db.prepare(`
      INSERT INTO user_progress (pokemon_id, caught, shiny_caught, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(pokemon_id) DO UPDATE SET
        caught = COALESCE(?, caught),
        shiny_caught = COALESCE(?, shiny_caught),
        updated_at = ?
    `);

    db.exec('BEGIN TRANSACTION;');
    for (const id of pokemonIds) {
      const cVal = caught !== undefined ? (caught ? 1 : 0) : null;
      const sVal = shinyCaught !== undefined ? (shinyCaught ? 1 : 0) : null;
      upsertStmt.run(id, cVal || 0, sVal || 0, now, cVal, sVal, now);
    }
    db.exec('COMMIT;');

    res.json({ success: true, count: pokemonIds.length });
  } catch (err) {
    db.exec('ROLLBACK;');
    console.error('Error batch updating progress:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/collections
router.get('/collections', (req, res) => {
  try {
    const collections = db.prepare(`
      SELECT 
        c.id,
        c.name,
        c.description,
        c.color,
        c.created_at as createdAt,
        COUNT(cci.pokemon_id) as totalItems,
        SUM(CASE WHEN up.caught = 1 THEN 1 ELSE 0 END) as caughtItems
      FROM custom_collections c
      LEFT JOIN custom_collection_items cci ON c.id = cci.collection_id
      LEFT JOIN user_progress up ON cci.pokemon_id = up.pokemon_id
      GROUP BY c.id
      ORDER BY c.created_at ASC
    `).all();

    res.json(collections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/collections
router.post('/collections', (req, res) => {
  try {
    const { name, description = '', color = '#3b82f6' } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Collection name is required' });
    }

    const id = `coll_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO custom_collections (id, name, description, color, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name.trim(), description.trim(), color, now);

    res.status(201).json({
      id,
      name: name.trim(),
      description: description.trim(),
      color,
      createdAt: now,
      totalItems: 0,
      caughtItems: 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/collections/:id
router.delete('/collections/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM custom_collections WHERE id = ?').run(id);
    res.json({ success: true, deletedId: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/collections/:id/items
router.post('/collections/:id/items', (req, res) => {
  try {
    const { id: collectionId } = req.params;
    const { pokemonId } = req.body;
    if (!pokemonId) {
      return res.status(400).json({ error: 'pokemonId is required' });
    }

    const now = new Date().toISOString();
    db.prepare(`
      INSERT OR IGNORE INTO custom_collection_items (collection_id, pokemon_id, added_at)
      VALUES (?, ?, ?)
    `).run(collectionId, pokemonId, now);

    res.json({ success: true, collectionId, pokemonId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/collections/:id/items/:pokemonId
router.delete('/collections/:id/items/:pokemonId', (req, res) => {
  try {
    const { id: collectionId, pokemonId } = req.params;
    db.prepare(`
      DELETE FROM custom_collection_items 
      WHERE collection_id = ? AND pokemon_id = ?
    `).run(collectionId, pokemonId);

    res.json({ success: true, collectionId, pokemonId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats
router.get('/stats', (req, res) => {
  try {
    // Overall category stats
    const statsQuery = db.prepare(`
      SELECT 
        p.category,
        COUNT(p.id) as total,
        SUM(CASE WHEN up.caught = 1 THEN 1 ELSE 0 END) as caught,
        SUM(CASE WHEN p.has_shiny = 1 THEN 1 ELSE 0 END) as shinyTotal,
        SUM(CASE WHEN up.shiny_caught = 1 THEN 1 ELSE 0 END) as shinyCaught
      FROM pokemon p
      LEFT JOIN user_progress up ON p.id = up.pokemon_id
      GROUP BY p.category
    `).all();

    // Generation stats
    const genQuery = db.prepare(`
      SELECT 
        p.generation,
        COUNT(p.id) as total,
        SUM(CASE WHEN up.caught = 1 THEN 1 ELSE 0 END) as caught
      FROM pokemon p
      LEFT JOIN user_progress up ON p.id = up.pokemon_id
      WHERE p.category = 'standard'
      GROUP BY p.generation
      ORDER BY p.generation ASC
    `).all();

    res.json({
      categories: statsQuery,
      generations: genQuery
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/export
router.get('/export', (req, res) => {
  try {
    const progress = db.prepare('SELECT * FROM user_progress').all();
    const collections = db.prepare('SELECT * FROM custom_collections').all();
    const collectionItems = db.prepare('SELECT * FROM custom_collection_items').all();

    res.json({
      app: 'PokemonGoDexTracker',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        progress,
        collections,
        collectionItems
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/import
router.post('/import', (req, res) => {
  try {
    const backup = req.body;
    if (!backup || !backup.data) {
      return res.status(400).json({ error: 'Invalid backup file format' });
    }

    const { progress = [], collections = [], collectionItems = [] } = backup.data;

    db.exec('BEGIN TRANSACTION;');
    try {
      // Restore Progress
      const progressStmt = db.prepare(`
        INSERT INTO user_progress (pokemon_id, caught, shiny_caught, lucky_caught, hundo_caught, notes, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(pokemon_id) DO UPDATE SET
          caught = excluded.caught,
          shiny_caught = excluded.shiny_caught,
          lucky_caught = excluded.lucky_caught,
          hundo_caught = excluded.hundo_caught,
          notes = excluded.notes,
          updated_at = excluded.updated_at
      `);

      for (const p of progress) {
        progressStmt.run(
          p.pokemon_id,
          p.caught || 0,
          p.shiny_caught || 0,
          p.lucky_caught || 0,
          p.hundo_caught || 0,
          p.notes || null,
          p.updated_at || new Date().toISOString()
        );
      }

      // Restore Collections
      const collStmt = db.prepare(`
        INSERT INTO custom_collections (id, name, description, color, created_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          description = excluded.description,
          color = excluded.color
      `);

      for (const c of collections) {
        collStmt.run(c.id, c.name, c.description || '', c.color || '#3b82f6', c.created_at || new Date().toISOString());
      }

      // Restore Collection Items
      const itemStmt = db.prepare(`
        INSERT OR IGNORE INTO custom_collection_items (collection_id, pokemon_id, added_at)
        VALUES (?, ?, ?)
      `);

      for (const ci of collectionItems) {
        itemStmt.run(ci.collection_id, ci.pokemon_id, ci.added_at || new Date().toISOString());
      }

      db.exec('COMMIT;');
      res.json({
        success: true,
        imported: {
          progressCount: progress.length,
          collectionsCount: collections.length,
          itemsCount: collectionItems.length
        }
      });
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  } catch (err) {
    console.error('Error importing backup:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
