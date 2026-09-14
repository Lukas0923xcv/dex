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

// --- Accounts Management ---
// GET /api/accounts
router.get('/accounts', (req, res) => {
  try {
    const accounts = db.prepare('SELECT id, name, created_at as createdAt FROM user_accounts ORDER BY created_at ASC').all();
    if (accounts.length === 0) {
      const now = new Date().toISOString();
      db.prepare("INSERT INTO user_accounts (id, name, created_at) VALUES ('default', 'Haupt-Account', ?)").run(now);
      return res.json([{ id: 'default', name: 'Haupt-Account', createdAt: now }]);
    }
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/accounts
router.post('/accounts', (req, res) => {
  try {
    const { name } = req.body;
    const cleanName = (name && name.trim()) ? name.trim() : 'Neuer Account';
    const id = `acc_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();
    db.prepare('INSERT INTO user_accounts (id, name, created_at) VALUES (?, ?, ?)').run(id, cleanName, now);
    res.status(201).json({ id, name: cleanName, createdAt: now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/accounts/:id
router.put('/accounts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name ist erforderlich' });
    }
    db.prepare('UPDATE user_accounts SET name = ? WHERE id = ?').run(name.trim(), id);
    res.json({ id, name: name.trim() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/accounts/:id
router.delete('/accounts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const total = db.prepare('SELECT COUNT(*) as count FROM user_accounts').get().count;
    if (total <= 1) {
      return res.status(400).json({ error: 'Mindestens ein Account muss bestehen bleiben.' });
    }
    db.exec('BEGIN TRANSACTION;');
    try {
      db.prepare('DELETE FROM user_progress_v2 WHERE account_id = ?').run(id);
      db.prepare('DELETE FROM user_accounts WHERE id = ?').run(id);
      db.exec('COMMIT;');
      res.json({ success: true, deletedId: id });
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
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
      releasedOnly,
      shadowOnly,
      shinyOnly,
      limit = 2500,
      offset = 0,
      accountId = 'default',
      dexScope
    } = req.query;

    const effectiveAccountId = accountId || 'default';
    const effectiveScope = dexScope || (collectionId ? `custom:${collectionId}` : (category && category !== 'all' ? category : 'standard'));

    let sql = `
      SELECT 
        p.id,
        p.dex_nr as dexNr,
        p.name,
        p.names_json as namesJson,
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
        p.has_shadow as hasShadow,
        p.is_mega as isMega,
        p.is_form as isForm,
        p.is_costume as isCostume,
        p.is_gender_difference as isGenderDifference,
        p.released_in_go as releasedInGo,
        COALESCE(up.caught, 0) as caught,
        COALESCE(up.shiny_caught, 0) as shinyCaught,
        COALESCE(up.lucky_caught, 0) as luckyCaught,
        COALESCE(up.hundo_caught, 0) as hundoCaught,
        COALESCE(up.shadow_caught, 0) as shadowCaught,
        COALESCE(up.purified_caught, 0) as purifiedCaught,
        COALESCE(up.gender_m_caught, 0) as genderMCaught,
        COALESCE(up.gender_f_caught, 0) as genderFCaught,
        COALESCE(up.xxl_caught, 0) as xxlCaught,
        COALESCE(up.xxs_caught, 0) as xxsCaught,
        up.notes,
        up.updated_at as updatedAt,
        CASE WHEN cci.pokemon_id IS NOT NULL THEN 1 ELSE 0 END as inCollection
      FROM pokemon p
      LEFT JOIN user_progress_v2 up ON (p.id = up.pokemon_id AND up.account_id = ? AND up.dex_scope = ?)
      LEFT JOIN custom_collection_items cci ON p.id = cci.pokemon_id ${collectionId ? 'AND cci.collection_id = ?' : 'AND 1=0'}
      WHERE 1=1
    `;

    const params = [effectiveAccountId, effectiveScope];
    if (collectionId) {
      params.push(collectionId);
    }

    if (collectionId) {
      sql += ` AND cci.pokemon_id IS NOT NULL`;
    }

    if (category && category !== 'all') {
      if (category === 'shiny') {
        sql += ` AND p.has_shiny = 1`;
      } else if (category === 'shadow' || category === 'crypto') {
        sql += ` AND p.has_shadow = 1`;
      } else {
        sql += ` AND p.category = ?`;
        params.push(category);
      }
    }

    if (shadowOnly === 'true' || shadowOnly === '1') {
      sql += ` AND p.has_shadow = 1`;
    }

    if (shinyOnly === 'true' || shinyOnly === '1') {
      sql += ` AND p.has_shiny = 1`;
    }

    if (generation && generation !== 'all') {
      sql += ` AND p.generation = ?`;
      params.push(parseInt(generation, 10));
    }

    if (type && type !== 'all') {
      sql += ` AND (LOWER(p.type1) = LOWER(?) OR LOWER(p.type2) = LOWER(?))`;
      params.push(type, type);
    }

    if (search && search.trim()) {
      const rawQuery = search.trim().toLowerCase();
      let q = rawQuery;
      let requireShadow = false;
      let requireShiny = false;
      let requireMega = false;

      if (q === 'crypto' || q === 'shadow' || q === 'schatten') {
        requireShadow = true;
        q = '';
      } else if (q.startsWith('crypto ') || q.startsWith('shadow ') || q.startsWith('schatten ')) {
        requireShadow = true;
        q = q.replace(/^(crypto|shadow|schatten)\s+/, '');
      }

      if (q === 'shiny' || q === 'schillernd' || q === 'schillernde') {
        requireShiny = true;
        q = '';
      } else if (q.startsWith('shiny ') || q.startsWith('schillernd ')) {
        requireShiny = true;
        q = q.replace(/^(shiny|schillernd)\s+/, '');
      }

      if (q === 'mega') {
        requireMega = true;
        q = '';
      } else if (q.startsWith('mega ')) {
        requireMega = true;
        q = q.replace(/^mega\s+/, '');
      }

      if (requireShadow) {
        sql += ` AND p.has_shadow = 1`;
      }
      if (requireShiny) {
        sql += ` AND p.has_shiny = 1`;
      }
      if (requireMega) {
        sql += ` AND (p.category = 'mega' OR p.is_mega = 1)`;
      }

      if (q) {
        const num = parseInt(q, 10);
        const term = `%${q}%`;
        if (!isNaN(num)) {
          sql += ` AND (p.dex_nr = ? OR LOWER(p.name) LIKE ?)`;
          params.push(num, term);
        } else {
          sql += ` AND (LOWER(p.name) LIKE ? OR LOWER(COALESCE(p.form_name, '')) LIKE ? OR LOWER(COALESCE(p.names_json, '')) LIKE ?)`;
          params.push(term, term, term);
        }
      }
    }

    if (status === 'caught') {
      if (category === 'shiny') {
        sql += ` AND up.shiny_caught = 1`;
      } else if (category === 'shadow' || category === 'crypto') {
        sql += ` AND up.shadow_caught = 1`;
      } else {
        sql += ` AND up.caught = 1`;
      }
    } else if (status === 'uncaught') {
      if (category === 'shiny') {
        sql += ` AND (up.shiny_caught IS NULL OR up.shiny_caught = 0)`;
      } else if (category === 'shadow' || category === 'crypto') {
        sql += ` AND (up.shadow_caught IS NULL OR up.shadow_caught = 0)`;
      } else {
        sql += ` AND (up.caught IS NULL OR up.caught = 0)`;
      }
    }

    if (releasedOnly !== 'false' && releasedOnly !== '0') {
      sql += ` AND p.released_in_go = 1`;
    }

    // Sort order
    sql += ` ORDER BY p.dex_nr ASC, p.category ASC, p.id ASC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const rows = db.prepare(sql).all(...params);

    // Convert integer booleans
    const result = rows.map(r => ({
      ...r,
      names: r.namesJson ? JSON.parse(r.namesJson) : undefined,
      hasShiny: Boolean(r.hasShiny),
      hasShadow: Boolean(r.hasShadow),
      isMega: Boolean(r.isMega),
      isForm: Boolean(r.isForm),
      isCostume: Boolean(r.isCostume),
      isGenderDifference: Boolean(r.isGenderDifference),
      releasedInGo: Boolean(r.releasedInGo),
      caught: Boolean(r.caught),
      shinyCaught: Boolean(r.shinyCaught),
      luckyCaught: Boolean(r.luckyCaught),
      hundoCaught: Boolean(r.hundoCaught),
      shadowCaught: Boolean(r.shadowCaught),
      purifiedCaught: Boolean(r.purifiedCaught),
      genderMCaught: Boolean(r.genderMCaught),
      genderFCaught: Boolean(r.genderFCaught),
      xxlCaught: Boolean(r.xxlCaught),
      xxsCaught: Boolean(r.xxsCaught),
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
    const { pokemonId, type = 'caught', accountId = 'default', dexScope = 'standard' } = req.body;
    if (!pokemonId) {
      return res.status(400).json({ error: 'pokemonId is required' });
    }

    const fieldMap = {
      caught: 'caught',
      shiny: 'shiny_caught',
      lucky: 'lucky_caught',
      hundo: 'hundo_caught',
      shadow: 'shadow_caught',
      purified: 'purified_caught',
      gender_m: 'gender_m_caught',
      gender_f: 'gender_f_caught',
      xxl: 'xxl_caught',
      xxs: 'xxs_caught'
    };
    const field = fieldMap[type] || 'caught';
    const now = new Date().toISOString();

    const existing = db.prepare('SELECT * FROM user_progress_v2 WHERE account_id = ? AND dex_scope = ? AND pokemon_id = ?').get(accountId, dexScope, pokemonId);

    let newVal = 1;
    if (existing) {
      newVal = existing[field] ? 0 : 1;
      db.prepare(`
        UPDATE user_progress_v2
        SET ${field} = ?, updated_at = ?
        WHERE account_id = ? AND dex_scope = ? AND pokemon_id = ?
      `).run(newVal, now, accountId, dexScope, pokemonId);
    } else {
      db.prepare(`
        INSERT INTO user_progress_v2 (account_id, dex_scope, pokemon_id, ${field}, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(accountId, dexScope, pokemonId, 1, now);
      newVal = 1;
    }

    res.json({
      pokemonId,
      type,
      accountId,
      dexScope,
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
    const { pokemonIds, caught, shinyCaught, shadowCaught, accountId = 'default', dexScope = 'standard' } = req.body;
    if (!Array.isArray(pokemonIds) || pokemonIds.length === 0) {
      return res.status(400).json({ error: 'pokemonIds array required' });
    }

    const now = new Date().toISOString();
    const upsertStmt = db.prepare(`
      INSERT INTO user_progress_v2 (account_id, dex_scope, pokemon_id, caught, shiny_caught, shadow_caught, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(account_id, dex_scope, pokemon_id) DO UPDATE SET
        caught = COALESCE(?, caught),
        shiny_caught = COALESCE(?, shiny_caught),
        shadow_caught = COALESCE(?, shadow_caught),
        updated_at = ?
    `);

    db.exec('BEGIN TRANSACTION;');
    for (const id of pokemonIds) {
      const cVal = caught !== undefined ? (caught ? 1 : 0) : null;
      const sVal = shinyCaught !== undefined ? (shinyCaught ? 1 : 0) : null;
      const shVal = shadowCaught !== undefined ? (shadowCaught ? 1 : 0) : null;
      upsertStmt.run(accountId, dexScope, id, cVal || 0, sVal || 0, shVal || 0, now, cVal, sVal, shVal, now);
    }
    db.exec('COMMIT;');

    res.json({ success: true, count: pokemonIds.length, accountId, dexScope });
  } catch (err) {
    db.exec('ROLLBACK;');
    console.error('Error batch updating progress:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/progress/reset
router.post('/progress/reset', (req, res) => {
  try {
    const { accountId = 'default', dexScope } = req.body;
    if (dexScope) {
      db.prepare('DELETE FROM user_progress_v2 WHERE account_id = ? AND dex_scope = ?').run(accountId, dexScope);
    } else {
      db.prepare('DELETE FROM user_progress_v2 WHERE account_id = ?').run(accountId);
    }
    res.json({ success: true, accountId, dexScope });
  } catch (err) {
    console.error('Error resetting progress:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/collections
router.get('/collections', (req, res) => {
  try {
    const accountId = req.query.accountId || 'default';
    const rawCollections = db.prepare(`
      SELECT 
        c.id,
        c.name,
        c.description,
        c.color,
        c.category_type as categoryType,
        c.variant_mode as variantMode,
        c.track_shiny as trackShiny,
        c.track_hundo as trackHundo,
        c.track_gender as trackGender,
        c.track_background as trackBackground,
        c.track_size as trackSize,
        c.created_at as createdAt,
        COUNT(cci.pokemon_id) as totalItems,
        SUM(CASE 
          WHEN c.category_type = 'lucky' THEN (CASE WHEN up.lucky_caught = 1 THEN 1 ELSE 0 END)
          WHEN c.category_type = 'shadow' THEN (CASE WHEN up.shadow_caught = 1 THEN 1 ELSE 0 END)
          WHEN c.category_type = 'purified' THEN (CASE WHEN up.purified_caught = 1 THEN 1 ELSE 0 END)
          WHEN c.track_shiny = 1 THEN (CASE WHEN up.shiny_caught = 1 THEN 1 ELSE 0 END)
          ELSE (CASE WHEN up.caught = 1 THEN 1 ELSE 0 END)
        END) as caughtItems
      FROM custom_collections c
      LEFT JOIN custom_collection_items cci ON c.id = cci.collection_id
      LEFT JOIN user_progress_v2 up ON (cci.pokemon_id = up.pokemon_id AND up.account_id = ? AND up.dex_scope = ('custom:' || c.id))
      GROUP BY c.id
      ORDER BY c.created_at ASC
    `).all(accountId);

    const collections = rawCollections.map(c => {
      let total = c.totalItems || 0;
      let caught = c.caughtItems || 0;

      // If collection has no explicit items (e.g. preset/rule-based), calculate dynamic pool count
      if (total === 0) {
        const isShadowColl = c.categoryType === 'shadow' || c.categoryType === 'purified' || (c.name && (c.name.toLowerCase().includes('crypto') || c.name.toLowerCase().includes('shadow') || c.name.toLowerCase().includes('schatten')));
        let condition = '';
        if (c.categoryType === 'mega') {
          condition = "(p.category = 'mega' OR p.is_mega = 1)";
        } else if (c.categoryType === 'event') {
          condition = "(p.category = 'costume' OR p.is_costume = 1)";
        } else if (isShadowColl) {
          condition = "p.has_shadow = 1";
        } else if (c.variantMode === 'single') {
          condition = "p.category = 'standard'";
        } else {
          condition = "(p.category = 'standard' OR p.category = 'form')";
        }

        if (c.trackShiny) {
          condition += ' AND p.has_shiny = 1';
        }

        let caughtCol = 'up.caught';
        if (c.categoryType === 'lucky') caughtCol = 'up.lucky_caught';
        else if (isShadowColl) caughtCol = 'up.shadow_caught';
        else if (c.categoryType === 'purified') caughtCol = 'up.purified_caught';
        else if (c.trackShiny) caughtCol = 'up.shiny_caught';

        const fallbackRow = db.prepare(`
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN ${caughtCol} = 1 THEN 1 ELSE 0 END) as caught
          FROM pokemon p
          LEFT JOIN user_progress_v2 up ON (p.id = up.pokemon_id AND up.account_id = ? AND up.dex_scope = ?)
          WHERE ${condition}
        `).get(accountId, `custom:${c.id}`);

        if (fallbackRow) {
          total = fallbackRow.total || 0;
          caught = fallbackRow.caught || 0;
        }
      }

      return {
        ...c,
        categoryType: c.categoryType || 'normal',
        variantMode: c.variantMode || 'multi',
        trackShiny: Boolean(c.trackShiny),
        trackHundo: Boolean(c.trackHundo),
        trackGender: Boolean(c.trackGender),
        trackBackground: Boolean(c.trackBackground),
        trackSize: Boolean(c.trackSize),
        totalItems: total,
        caughtItems: caught
      };
    });

    res.json(collections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/collection-items
router.get('/collection-items', (req, res) => {
  try {
    const rows = db.prepare('SELECT collection_id, pokemon_id FROM custom_collection_items').all();
    const map = {};
    for (const r of rows) {
      if (!map[r.collection_id]) map[r.collection_id] = [];
      map[r.collection_id].push(r.pokemon_id);
    }
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/collections/:id/items
router.get('/collections/:id/items', (req, res) => {
  try {
    const { id } = req.params;
    const rows = db.prepare('SELECT pokemon_id FROM custom_collection_items WHERE collection_id = ?').all(id);
    res.json({ pokemonIds: rows.map(r => r.pokemon_id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/collections
router.post('/collections', (req, res) => {
  try {
    const {
      name,
      description = '',
      color = '#3b82f6',
      categoryType = 'normal',
      variantMode = 'multi',
      trackShiny = false,
      trackHundo = false,
      trackGender = false,
      trackBackground = false,
      trackSize = false,
      pokemonIds = []
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Collection name is required' });
    }

    const id = `coll_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO custom_collections (
        id, name, description, color, category_type, variant_mode,
        track_shiny, track_hundo, track_gender, track_background, track_size, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name.trim(),
      description.trim(),
      color,
      categoryType,
      variantMode,
      trackShiny ? 1 : 0,
      trackHundo ? 1 : 0,
      trackGender ? 1 : 0,
      trackBackground ? 1 : 0,
      trackSize ? 1 : 0,
      now
    );

    if (Array.isArray(pokemonIds) && pokemonIds.length > 0) {
      const insertItem = db.prepare(`
        INSERT OR IGNORE INTO custom_collection_items (collection_id, pokemon_id, added_at)
        VALUES (?, ?, ?)
      `);
      db.exec('BEGIN TRANSACTION;');
      for (const pid of pokemonIds) {
        insertItem.run(id, pid, now);
      }
      db.exec('COMMIT;');
    }

    res.status(201).json({
      id,
      name: name.trim(),
      description: description.trim(),
      color,
      categoryType,
      variantMode,
      trackShiny: Boolean(trackShiny),
      trackHundo: Boolean(trackHundo),
      trackGender: Boolean(trackGender),
      trackBackground: Boolean(trackBackground),
      trackSize: Boolean(trackSize),
      createdAt: now,
      totalItems: Array.isArray(pokemonIds) ? pokemonIds.length : 0,
      caughtItems: 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/collections (delete all custom collections)
router.delete('/collections', (req, res) => {
  try {
    const deleteItems = db.prepare('DELETE FROM custom_collection_items');
    const deleteCollections = db.prepare('DELETE FROM custom_collections');
    db.transaction(() => {
      deleteItems.run();
      deleteCollections.run();
    })();
    res.json({ success: true, message: 'All custom collections deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/collections/:id
router.delete('/collections/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.transaction(() => {
      db.prepare('DELETE FROM custom_collection_items WHERE collection_id = ?').run(id);
      db.prepare('DELETE FROM custom_collections WHERE id = ?').run(id);
    })();
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

// POST /api/collections/:id/items/batch
router.post('/collections/:id/items/batch', (req, res) => {
  try {
    const { id: collectionId } = req.params;
    const { pokemonIds = [], mode = 'replace' } = req.body;

    const now = new Date().toISOString();
    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO custom_collection_items (collection_id, pokemon_id, added_at)
      VALUES (?, ?, ?)
    `);

    db.exec('BEGIN TRANSACTION;');
    try {
      if (mode === 'replace') {
        db.prepare('DELETE FROM custom_collection_items WHERE collection_id = ?').run(collectionId);
      }
      for (const pid of pokemonIds) {
        insertStmt.run(collectionId, pid, now);
      }
      db.exec('COMMIT;');
      res.json({ success: true, collectionId, count: pokemonIds.length });
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats
router.get('/stats', (req, res) => {
  try {
    const accountId = req.query.accountId || 'default';
    const dexScope = req.query.dexScope || 'standard';

    // Overall category stats
    const statsQuery = db.prepare(`
      SELECT 
        p.category,
        COUNT(p.id) as total,
        SUM(CASE WHEN up.caught = 1 THEN 1 ELSE 0 END) as caught,
        SUM(CASE WHEN p.has_shiny = 1 THEN 1 ELSE 0 END) as shinyTotal,
        SUM(CASE WHEN up.shiny_caught = 1 THEN 1 ELSE 0 END) as shinyCaught
      FROM pokemon p
      LEFT JOIN user_progress_v2 up ON (p.id = up.pokemon_id AND up.account_id = ? AND up.dex_scope = ?)
      GROUP BY p.category
    `).all(accountId, dexScope);

    // Generation stats
    const genQuery = db.prepare(`
      SELECT 
        p.generation,
        COUNT(p.id) as total,
        SUM(CASE WHEN up.caught = 1 THEN 1 ELSE 0 END) as caught
      FROM pokemon p
      LEFT JOIN user_progress_v2 up ON (p.id = up.pokemon_id AND up.account_id = ? AND up.dex_scope = ?)
      WHERE p.category = 'standard'
      GROUP BY p.generation
      ORDER BY p.generation ASC
    `).all(accountId, dexScope);

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
    const progressV2 = db.prepare('SELECT * FROM user_progress_v2').all();
    const accounts = db.prepare('SELECT * FROM user_accounts').all();
    const collections = db.prepare('SELECT * FROM custom_collections').all();
    const collectionItems = db.prepare('SELECT * FROM custom_collection_items').all();

    res.json({
      app: 'PokemonGoDexTracker',
      version: 2,
      exportedAt: new Date().toISOString(),
      data: {
        progress,
        progressV2,
        accounts,
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

    const {
      progress = [],
      progressV2 = [],
      accounts = [],
      collections = [],
      collectionItems = []
    } = backup.data;

    db.exec('BEGIN TRANSACTION;');
    try {
      // Restore Accounts if present
      if (Array.isArray(accounts) && accounts.length > 0) {
        const accStmt = db.prepare(`
          INSERT INTO user_accounts (id, name, created_at)
          VALUES (?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET name = excluded.name
        `);
        for (const a of accounts) {
          accStmt.run(a.id, a.name, a.created_at || a.createdAt || new Date().toISOString());
        }
      }

      // Restore Progress V2
      const progressV2Stmt = db.prepare(`
        INSERT INTO user_progress_v2 (
          account_id, dex_scope, pokemon_id, caught, shiny_caught, lucky_caught, hundo_caught,
          shadow_caught, purified_caught, gender_m_caught, gender_f_caught,
          xxl_caught, xxs_caught, notes, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(account_id, dex_scope, pokemon_id) DO UPDATE SET
          caught = excluded.caught,
          shiny_caught = excluded.shiny_caught,
          lucky_caught = excluded.lucky_caught,
          hundo_caught = excluded.hundo_caught,
          shadow_caught = excluded.shadow_caught,
          purified_caught = excluded.purified_caught,
          gender_m_caught = excluded.gender_m_caught,
          gender_f_caught = excluded.gender_f_caught,
          xxl_caught = excluded.xxl_caught,
          xxs_caught = excluded.xxs_caught,
          notes = excluded.notes,
          updated_at = excluded.updated_at
      `);

      if (Array.isArray(progressV2) && progressV2.length > 0) {
        for (const p of progressV2) {
          progressV2Stmt.run(
            p.account_id || p.accountId || 'default',
            p.dex_scope || p.dexScope || 'standard',
            p.pokemon_id || p.pokemonId,
            p.caught ? 1 : 0,
            p.shiny_caught || p.shinyCaught ? 1 : 0,
            p.lucky_caught || p.luckyCaught ? 1 : 0,
            p.hundo_caught || p.hundoCaught ? 1 : 0,
            p.shadow_caught || p.shadowCaught ? 1 : 0,
            p.purified_caught || p.purifiedCaught ? 1 : 0,
            p.gender_m_caught || p.genderMCaught ? 1 : 0,
            p.gender_f_caught || p.genderFCaught ? 1 : 0,
            p.xxl_caught || p.xxlCaught ? 1 : 0,
            p.xxs_caught || p.xxsCaught ? 1 : 0,
            p.notes || null,
            p.updated_at || p.updatedAt || new Date().toISOString()
          );
        }
      } else if (Array.isArray(progress) && progress.length > 0) {
        // Fallback for legacy v1 backups
        for (const p of progress) {
          progressV2Stmt.run(
            'default',
            'standard',
            p.pokemon_id,
            p.caught ? 1 : 0,
            p.shiny_caught ? 1 : 0,
            p.lucky_caught ? 1 : 0,
            p.hundo_caught ? 1 : 0,
            p.shadow_caught ? 1 : 0,
            p.purified_caught ? 1 : 0,
            p.gender_m_caught ? 1 : 0,
            p.gender_f_caught ? 1 : 0,
            p.xxl_caught ? 1 : 0,
            p.xxs_caught ? 1 : 0,
            p.notes || null,
            p.updated_at || new Date().toISOString()
          );
        }
      }

      // Restore Collections
      const collStmt = db.prepare(`
        INSERT INTO custom_collections (
          id, name, description, color, category_type, variant_mode,
          track_shiny, track_hundo, track_gender, track_background, track_size, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          description = excluded.description,
          color = excluded.color,
          category_type = excluded.category_type,
          variant_mode = excluded.variant_mode,
          track_shiny = excluded.track_shiny,
          track_hundo = excluded.track_hundo,
          track_gender = excluded.track_gender,
          track_background = excluded.track_background,
          track_size = excluded.track_size
      `);

      for (const c of collections) {
        collStmt.run(
          c.id,
          c.name,
          c.description || '',
          c.color || '#3b82f6',
          c.category_type || c.categoryType || 'normal',
          c.variant_mode || c.variantMode || 'multi',
          c.track_shiny ? 1 : 0,
          c.track_hundo ? 1 : 0,
          c.track_gender ? 1 : 0,
          c.track_background ? 1 : 0,
          c.track_size ? 1 : 0,
          c.created_at || c.createdAt || new Date().toISOString()
        );
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
          accountsCount: accounts.length,
          progressCount: progressV2.length || progress.length,
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

// GET /api/proxy-image?url=...
const https = require('https');
const http = require('http');

router.get('/proxy-image', (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl || (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
    return res.status(400).send('Invalid image URL');
  }
  const client = imageUrl.startsWith('https') ? https : http;
  const proxyReq = client.get(imageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, remoteRes => {
    if (remoteRes.statusCode >= 300 && remoteRes.statusCode < 400 && remoteRes.headers.location) {
      const redirectClient = remoteRes.headers.location.startsWith('https') ? https : http;
      return redirectClient.get(remoteRes.headers.location, { headers: { 'User-Agent': 'Mozilla/5.0' } }, redirectRes => {
        res.set('Content-Type', redirectRes.headers['content-type'] || 'image/png');
        res.set('Cache-Control', 'public, max-age=86400');
        redirectRes.pipe(res);
      });
    }
    res.set('Content-Type', remoteRes.headers['content-type'] || 'image/png');
    res.set('Cache-Control', 'public, max-age=86400');
    remoteRes.pipe(res);
  });
  proxyReq.on('error', err => {
    res.status(502).send(err.message);
  });
});

module.exports = router;

