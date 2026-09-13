import { Pokemon, CustomCollection, BackupData, DashboardTabConfig } from '../types';
import localPokemonData from '../data/pokemon-data.json';

const STORAGE_KEYS = {
  PROGRESS: 'pogo_dex_progress_v1',
  COLLECTIONS: 'pogo_dex_collections_v1',
  COLLECTION_ITEMS: 'pogo_dex_collection_items_v1',
  REMOTE_API_URL: 'pogo_dex_remote_api_url_v1',
  FORCE_LOCAL: 'pogo_dex_force_local_v1',
  DASHBOARD_TABS: 'pogo_dashboard_tabs_v1'
};

export interface StorageStatus {
  isBackendConnected: boolean;
  backendUrl: string;
  isGitHubPages: boolean;
  walMode: boolean;
}

class StorageAdapter {
  private isConnectedToBackend = false;
  private backendUrl = '';
  private isInitialized = false;
  private collectionItemsCache: Map<string, Set<string>> = new Map();
  private collectionsCache: CustomCollection[] = [];

  constructor() {
    this.detectEnvironment();
  }

  private detectEnvironment() {
    const customUrl = localStorage.getItem(STORAGE_KEYS.REMOTE_API_URL);
    if (customUrl) {
      this.backendUrl = customUrl.replace(/\/+$/, '');
    } else {
      // Default to origin in local/docker dev, or empty if on github.io
      const isGitHubPages = window.location.hostname.includes('github.io');
      this.backendUrl = isGitHubPages ? '' : window.location.origin;
    }
  }

  public async init(): Promise<StorageStatus> {
    if (this.isInitialized) {
      return this.getStatus();
    }

    const forceLocal = localStorage.getItem(STORAGE_KEYS.FORCE_LOCAL) === 'true';
    if (!forceLocal && this.backendUrl) {
      try {
        const res = await fetch(`${this.backendUrl}/api/health`, { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'ok') {
            this.isConnectedToBackend = true;
            this.isInitialized = true;
            return this.getStatus();
          }
        }
      } catch {
        // Backend not available, fallback to client-side localStorage
      }
    }

    this.isConnectedToBackend = false;
    this.isInitialized = true;
    this.ensureDefaultLocalCollections();
    return this.getStatus();
  }

  public getStatus(): StorageStatus {
    return {
      isBackendConnected: this.isConnectedToBackend,
      backendUrl: this.backendUrl,
      isGitHubPages: window.location.hostname.includes('github.io'),
      walMode: this.isConnectedToBackend
    };
  }

  public setCustomBackendUrl(url: string) {
    if (url && url.trim()) {
      localStorage.setItem(STORAGE_KEYS.REMOTE_API_URL, url.trim());
      localStorage.removeItem(STORAGE_KEYS.FORCE_LOCAL);
    } else {
      localStorage.removeItem(STORAGE_KEYS.REMOTE_API_URL);
    }
    this.isInitialized = false;
    this.detectEnvironment();
  }

  public setForceLocal(force: boolean) {
    if (force) {
      localStorage.setItem(STORAGE_KEYS.FORCE_LOCAL, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.FORCE_LOCAL);
    }
    this.isInitialized = false;
  }

  // --- Pokémon & Progress Retrieval ---
  public async getPokemonList(): Promise<Pokemon[]> {
    if (this.isConnectedToBackend) {
      try {
        const res = await fetch(`${this.backendUrl}/api/pokemon?limit=2500`);
        if (res.ok) {
          const backendList: Pokemon[] = await res.json();
          const localMap = new Map((localPokemonData as Pokemon[]).map(p => [p.id, p]));
          return backendList.map(p => {
            const local = localMap.get(p.id);
            return {
              ...p,
              hasShadow: Boolean(p.hasShadow || local?.hasShadow),
              hasShiny: p.hasShiny !== undefined ? Boolean(p.hasShiny) : Boolean(local?.hasShiny)
            };
          });
        }
      } catch (err) {
        console.warn('Backend fetch failed, falling back to local dataset:', err);
      }
    }

    // Local / GitHub Pages mode: use bundled dataset and join with localStorage progress
    const baseList = localPokemonData as Pokemon[];
    const progressMap = this.getLocalProgress();
    const collectionItems = this.getLocalCollectionItems();

    return baseList.map(p => {
      const prog = progressMap[p.id] || {};
      const inAnyColl = collectionItems.some(ci => ci.pokemon_id === p.id);
      return {
        ...p,
        caught: Boolean(prog.caught),
        shinyCaught: Boolean(prog.shinyCaught),
        luckyCaught: Boolean(prog.luckyCaught),
        hundoCaught: Boolean(prog.hundoCaught),
        shadowCaught: Boolean(prog.shadowCaught),
        purifiedCaught: Boolean(prog.purifiedCaught),
        genderMCaught: Boolean(prog.genderMCaught),
        genderFCaught: Boolean(prog.genderFCaught),
        xxlCaught: Boolean(prog.xxlCaught),
        xxsCaught: Boolean(prog.xxsCaught),
        notes: prog.notes || '',
        inCollection: inAnyColl
      };
    });
  }

  // --- Toggle Progress (Caught, Shiny, Lucky, Shadow, Purified, Gender, Size) ---
  public async toggleProgress(
    pokemonId: string,
    type: 'caught' | 'shiny' | 'lucky' | 'hundo' | 'shadow' | 'purified' | 'gender_m' | 'gender_f' | 'xxl' | 'xxs'
  ): Promise<boolean> {
    if (this.isConnectedToBackend) {
      try {
        const res = await fetch(`${this.backendUrl}/api/progress/toggle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pokemonId, type })
        });
        if (res.ok) {
          const data = await res.json();
          return data.value;
        }
      } catch (err) {
        console.warn('Backend toggle failed, persisting locally:', err);
      }
    }

    // Local Mode
    const progress = this.getLocalProgress();
    const current = progress[pokemonId] || {};
    const fieldMap: Record<string, string> = {
      caught: 'caught',
      shiny: 'shinyCaught',
      lucky: 'luckyCaught',
      hundo: 'hundoCaught',
      shadow: 'shadowCaught',
      purified: 'purifiedCaught',
      gender_m: 'genderMCaught',
      gender_f: 'genderFCaught',
      xxl: 'xxlCaught',
      xxs: 'xxsCaught'
    };
    const field = fieldMap[type] || 'caught';
    const newVal = !current[field];
    current[field] = newVal;
    current.updatedAt = new Date().toISOString();
    progress[pokemonId] = current;
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    return newVal;
  }

  // --- Batch Update Progress (e.g., mark entire Region as caught/uncaught) ---
  public async batchUpdateProgress(
    pokemonIds: string[],
    values: { caught?: boolean; shinyCaught?: boolean; shadowCaught?: boolean }
  ): Promise<boolean> {
    if (this.isConnectedToBackend) {
      try {
        await fetch(`${this.backendUrl}/api/progress/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pokemonIds,
            caught: values.caught,
            shinyCaught: values.shinyCaught,
            shadowCaught: values.shadowCaught
          })
        });
      } catch (err) {
        console.warn('Backend batch progress update failed, persisting locally:', err);
      }
    }

    // Local Mode & Mirror
    const progress = this.getLocalProgress();
    const now = new Date().toISOString();
    for (const id of pokemonIds) {
      const current = progress[id] || {};
      if (values.caught !== undefined) current.caught = values.caught;
      if (values.shinyCaught !== undefined) current.shinyCaught = values.shinyCaught;
      if (values.shadowCaught !== undefined) current.shadowCaught = values.shadowCaught;
      current.updatedAt = now;
      progress[id] = current;
    }
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    return true;
  }

  // --- Custom Collections ---
  public async getCollections(): Promise<CustomCollection[]> {
    if (this.isConnectedToBackend) {
      try {
        const [collsRes, itemsRes] = await Promise.all([
          fetch(`${this.backendUrl}/api/collections`),
          fetch(`${this.backendUrl}/api/collection-items`)
        ]);
        if (collsRes.ok) {
          const collections: CustomCollection[] = await collsRes.json();
          if (itemsRes.ok) {
            const itemsMap: Record<string, string[]> = await itemsRes.json();
            this.collectionItemsCache.clear();
            for (const [cId, pIds] of Object.entries(itemsMap)) {
              this.collectionItemsCache.set(cId, new Set(pIds));
            }
          }
          const baseList = localPokemonData as Pokemon[];
          const shadowCount = baseList.filter(p => Boolean(p.hasShadow)).length;
          const healed = collections.map(c => {
            const isShadowColl = c.categoryType === 'shadow' || c.categoryType === 'purified' || (c.name && (c.name.toLowerCase().includes('crypto') || c.name.toLowerCase().includes('shadow') || c.name.toLowerCase().includes('schatten')));
            if (isShadowColl && c.categoryType !== 'shadow') {
              c.categoryType = 'shadow';
            }
            if (isShadowColl && (c.totalItems === 0 || !c.totalItems)) {
              return {
                ...c,
                totalItems: shadowCount
              };
            }
            return c;
          });
          this.collectionsCache = healed;
          return healed;
        }
      } catch (err) {
        console.warn('Backend getCollections failed, falling back to local:', err);
      }
    }

    // Local Mode
    const collections = this.getLocalCollections();
    const items = this.getLocalCollectionItems();
    const progress = this.getLocalProgress();
    const baseList = localPokemonData as Pokemon[];

    const localResult = collections.map(c => {
      const isShadowColl = c.categoryType === 'shadow' || c.categoryType === 'purified' || c.name.toLowerCase().includes('crypto') || c.name.toLowerCase().includes('shadow') || c.name.toLowerCase().includes('schatten');
      if (isShadowColl && c.categoryType !== 'shadow') {
        c.categoryType = 'shadow';
      }

      const cItems = items.filter(i => i.collection_id === c.id);
      let totalCount = cItems.length;
      let caughtCount = 0;

      if (isShadowColl && cItems.length === 0) {
        const shadowIds = baseList.filter(p => Boolean(p.hasShadow)).map(p => p.id);
        const newItems = shadowIds.map(pid => ({
          collection_id: c.id,
          pokemon_id: pid,
          added_at: new Date().toISOString()
        }));
        const existingOtherItems = items.filter(i => i.collection_id !== c.id);
        const allNewItems = [...existingOtherItems, ...newItems];
        try {
          localStorage.setItem(STORAGE_KEYS.COLLECTION_ITEMS, JSON.stringify(allNewItems));
        } catch (e) {}
        this.collectionItemsCache.set(c.id, new Set(shadowIds));
        totalCount = shadowIds.length;
        caughtCount = shadowIds.filter(pid => Boolean(progress[pid]?.shadowCaught)).length;
      } else if (totalCount > 0) {
        caughtCount = cItems.filter(i => {
          const prog = progress[i.pokemon_id];
          if (!prog) return false;
          if (c.categoryType === 'lucky') return Boolean(prog.luckyCaught);
          if (c.categoryType === 'shadow' || isShadowColl) return Boolean(prog.shadowCaught);
          if (c.categoryType === 'purified') return Boolean(prog.purifiedCaught);
          if (c.trackShiny) return Boolean(prog.shinyCaught);
          return Boolean(prog.caught);
        }).length;
      } else {
        // Fallback for rule-based collections with no explicit items
        let matching = baseList;
        if (c.categoryType === 'mega') {
          matching = matching.filter(p => p.category === 'mega' || p.isMega);
        } else if (c.categoryType === 'event') {
          matching = matching.filter(p => p.category === 'costume' || p.isCostume);
        } else if (c.categoryType === 'shadow' || c.categoryType === 'purified' || isShadowColl) {
          matching = matching.filter(p => Boolean(p.hasShadow));
        } else if (c.variantMode === 'single') {
          matching = matching.filter(p => p.category === 'standard');
        } else {
          matching = matching.filter(p => {
            if (p.category === 'standard') return true;
            if (p.category === 'form' || p.isForm) {
              if (p.isGenderDifference && c.includeGenderForms === false) return false;
              return true;
            }
            return false;
          });
        }
        if (c.trackShiny) {
          matching = matching.filter(p => p.hasShiny);
        }
        totalCount = matching.length;
        caughtCount = matching.filter(p => {
          const prog = progress[p.id];
          if (!prog) return false;
          if (c.categoryType === 'lucky') return Boolean(prog.luckyCaught);
          if (c.categoryType === 'shadow') return Boolean(prog.shadowCaught);
          if (c.categoryType === 'purified') return Boolean(prog.purifiedCaught);
          if (c.trackShiny) return Boolean(prog.shinyCaught);
          return Boolean(prog.caught);
        }).length;
      }

      return {
        ...c,
        categoryType: c.categoryType || 'normal',
        variantMode: c.variantMode || 'multi',
        totalItems: totalCount,
        caughtItems: caughtCount
      };
    });
    this.collectionsCache = localResult;
    return localResult;
  }

  public async createCollection(
    name: string,
    description = '',
    color = '#3b82f6',
    options?: {
      categoryType?: any;
      variantMode?: any;
      trackShiny?: boolean;
      trackHundo?: boolean;
      trackGender?: boolean;
      trackBackground?: boolean;
      trackSize?: boolean;
      includeGenderForms?: boolean;
      pokemonIds?: string[];
    }
  ): Promise<CustomCollection> {
    const payload = {
      name: name.trim(),
      description: description.trim(),
      color,
      categoryType: options?.categoryType || 'normal',
      variantMode: options?.variantMode || 'multi',
      trackShiny: Boolean(options?.trackShiny),
      trackHundo: Boolean(options?.trackHundo),
      trackGender: Boolean(options?.trackGender),
      trackBackground: Boolean(options?.trackBackground),
      trackSize: Boolean(options?.trackSize),
      includeGenderForms: options?.includeGenderForms !== undefined ? Boolean(options.includeGenderForms) : true,
      pokemonIds: options?.pokemonIds || []
    };

    if (this.isConnectedToBackend) {
      try {
        const res = await fetch(`${this.backendUrl}/api/collections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const created: CustomCollection = await res.json();
          if (payload.pokemonIds.length > 0) {
            this.collectionItemsCache.set(created.id, new Set(payload.pokemonIds));
          }
          return created;
        }
      } catch (err) {
        console.warn('Backend createCollection failed, using local:', err);
      }
    }

    // Local Mode
    const collections = this.getLocalCollections();
    const newColl: CustomCollection = {
      id: `coll_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: payload.name,
      description: payload.description,
      color: payload.color,
      categoryType: payload.categoryType,
      variantMode: payload.variantMode,
      trackShiny: payload.trackShiny,
      trackHundo: payload.trackHundo,
      trackGender: payload.trackGender,
      trackBackground: payload.trackBackground,
      trackSize: payload.trackSize,
      includeGenderForms: payload.includeGenderForms,
      createdAt: new Date().toISOString(),
      totalItems: payload.pokemonIds.length,
      caughtItems: 0
    };
    collections.push(newColl);
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));

    if (payload.pokemonIds.length > 0) {
      this.collectionItemsCache.set(newColl.id, new Set(payload.pokemonIds));
      const items = this.getLocalCollectionItems();
      const now = new Date().toISOString();
      for (const pid of payload.pokemonIds) {
        items.push({
          collection_id: newColl.id,
          pokemon_id: pid,
          added_at: now
        });
      }
      localStorage.setItem(STORAGE_KEYS.COLLECTION_ITEMS, JSON.stringify(items));
    }

    return newColl;
  }

  public async deleteCollection(collectionId: string): Promise<boolean> {
    this.collectionItemsCache.delete(collectionId);
    this.collectionsCache = this.collectionsCache.filter(c => c.id !== collectionId);

    if (this.isConnectedToBackend) {
      try {
        await fetch(`${this.backendUrl}/api/collections/${collectionId}`, { method: 'DELETE' });
      } catch {
        // Continue to local cleanup
      }
    }

    const collections = this.getLocalCollections().filter(c => c.id !== collectionId);
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));

    const items = this.getLocalCollectionItems().filter(i => i.collection_id !== collectionId);
    localStorage.setItem(STORAGE_KEYS.COLLECTION_ITEMS, JSON.stringify(items));

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DASHBOARD_TABS);
      if (stored) {
        const tabs: DashboardTabConfig[] = JSON.parse(stored);
        const updated = tabs.filter(t => t.collectionId !== collectionId);
        localStorage.setItem(STORAGE_KEYS.DASHBOARD_TABS, JSON.stringify(updated));
      }
    } catch {
      // ignore
    }

    return true;
  }

  public async deleteAllCollections(): Promise<boolean> {
    this.collectionItemsCache.clear();
    this.collectionsCache = [];

    if (this.isConnectedToBackend) {
      try {
        await fetch(`${this.backendUrl}/api/collections`, { method: 'DELETE' });
      } catch {
        // Continue to local cleanup
      }
    }

    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.COLLECTION_ITEMS, JSON.stringify([]));

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DASHBOARD_TABS);
      if (stored) {
        const tabs: DashboardTabConfig[] = JSON.parse(stored);
        const updated = tabs.filter(t => t.type !== 'custom');
        localStorage.setItem(STORAGE_KEYS.DASHBOARD_TABS, JSON.stringify(updated));
      }
    } catch {
      // ignore
    }

    return true;
  }

  public async addItemToCollection(collectionId: string, pokemonId: string): Promise<boolean> {
    let set = this.collectionItemsCache.get(collectionId);
    if (!set) {
      set = new Set();
      this.collectionItemsCache.set(collectionId, set);
    }
    set.add(pokemonId);

    if (this.isConnectedToBackend) {
      try {
        await fetch(`${this.backendUrl}/api/collections/${collectionId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pokemonId })
        });
      } catch {
        // Fallback
      }
    }

    const items = this.getLocalCollectionItems();
    if (!items.some(i => i.collection_id === collectionId && i.pokemon_id === pokemonId)) {
      items.push({
        collection_id: collectionId,
        pokemon_id: pokemonId,
        added_at: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEYS.COLLECTION_ITEMS, JSON.stringify(items));
    }
    return true;
  }

  public async removeItemFromCollection(collectionId: string, pokemonId: string): Promise<boolean> {
    const set = this.collectionItemsCache.get(collectionId);
    if (set) {
      set.delete(pokemonId);
    }

    if (this.isConnectedToBackend) {
      try {
        await fetch(`${this.backendUrl}/api/collections/${collectionId}/items/${pokemonId}`, {
          method: 'DELETE'
        });
      } catch {
        // Fallback
      }
    }

    const items = this.getLocalCollectionItems().filter(
      i => !(i.collection_id === collectionId && i.pokemon_id === pokemonId)
    );
    localStorage.setItem(STORAGE_KEYS.COLLECTION_ITEMS, JSON.stringify(items));
    return true;
  }

  public async setCollectionItems(collectionId: string, pokemonIds: string[]): Promise<boolean> {
    this.collectionItemsCache.set(collectionId, new Set(pokemonIds));

    if (this.isConnectedToBackend) {
      try {
        await fetch(`${this.backendUrl}/api/collections/${collectionId}/items/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pokemonIds, mode: 'replace' })
        });
      } catch (err) {
        console.warn('Backend batch setCollectionItems failed, using local storage:', err);
      }
    }

    // Local Storage update
    const items = this.getLocalCollectionItems().filter(i => i.collection_id !== collectionId);
    const now = new Date().toISOString();
    for (const pid of pokemonIds) {
      items.push({
        collection_id: collectionId,
        pokemon_id: pid,
        added_at: now
      });
    }
    localStorage.setItem(STORAGE_KEYS.COLLECTION_ITEMS, JSON.stringify(items));
    return true;
  }

  public getCollectionItemIds(collectionId: string): Set<string> {
    if (this.collectionItemsCache.has(collectionId)) {
      const cached = this.collectionItemsCache.get(collectionId)!;
      if (cached.size > 0) return cached;
    }
    const items = this.getLocalCollectionItems();
    const ids = new Set(items.filter(i => i.collection_id === collectionId).map(i => i.pokemon_id));
    if (ids.size > 0) {
      this.collectionItemsCache.set(collectionId, ids);
      return ids;
    }

    // Auto-populate / repair if this is a shadow collection
    const allColls = this.collectionsCache.length > 0 ? this.collectionsCache : this.getLocalCollections();
    const coll = allColls.find(c => c.id === collectionId);
    if (coll && (coll.categoryType === 'shadow' || coll.categoryType === 'purified' || (coll.name && (coll.name.toLowerCase().includes('crypto') || coll.name.toLowerCase().includes('shadow') || coll.name.toLowerCase().includes('schatten'))))) {
      const baseList = localPokemonData as Pokemon[];
      const shadowIds = new Set(baseList.filter(p => Boolean(p.hasShadow)).map(p => p.id));
      this.collectionItemsCache.set(collectionId, shadowIds);
      return shadowIds;
    }

    return ids;
  }

  // --- JSON Export & Import ---
  public async exportBackup(): Promise<BackupData> {
    if (this.isConnectedToBackend) {
      try {
        const res = await fetch(`${this.backendUrl}/api/export`);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('Backend export failed, exporting local storage:', err);
      }
    }

    const progressObj = this.getLocalProgress();
    const progress = Object.entries(progressObj).map(([id, val]) => ({
      pokemon_id: id,
      caught: val.caught ? 1 : 0,
      shiny_caught: val.shinyCaught ? 1 : 0,
      lucky_caught: val.luckyCaught ? 1 : 0,
      notes: val.notes,
      updated_at: val.updatedAt
    }));

    return {
      app: 'PokemonGoDexTracker',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        progress,
        collections: this.getLocalCollections(),
        collectionItems: this.getLocalCollectionItems()
      }
    };
  }

  public async importBackup(backup: BackupData): Promise<boolean> {
    if (!backup || !backup.data) {
      throw new Error('Invalid backup file format');
    }

    if (this.isConnectedToBackend) {
      try {
        const res = await fetch(`${this.backendUrl}/api/import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backup)
        });
        if (res.ok) {
          return true;
        }
      } catch (err) {
        console.warn('Backend import failed, importing locally:', err);
      }
    }

    // Local Storage Import
    const progressMap: Record<string, any> = {};
    for (const p of backup.data.progress || []) {
      progressMap[p.pokemon_id] = {
        caught: Boolean(p.caught),
        shinyCaught: Boolean(p.shiny_caught),
        luckyCaught: Boolean(p.lucky_caught),
        notes: p.notes,
        updatedAt: p.updated_at
      };
    }
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progressMap));

    if (backup.data.collections) {
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(backup.data.collections));
    }
    if (backup.data.collectionItems) {
      localStorage.setItem(STORAGE_KEYS.COLLECTION_ITEMS, JSON.stringify(backup.data.collectionItems));
    }

    return true;
  }

  public resetAllProgress(): void {
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.COLLECTIONS);
    localStorage.removeItem(STORAGE_KEYS.COLLECTION_ITEMS);
    this.ensureDefaultLocalCollections();
  }

  // --- Private LocalStorage Helpers ---
  private getLocalProgress(): Record<string, any> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private getLocalCollections(): CustomCollection[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private getLocalCollectionItems(): Array<{ collection_id: string; pokemon_id: string; added_at?: string }> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COLLECTION_ITEMS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private ensureDefaultLocalCollections() {
    const existing = this.getLocalCollections();
    if (existing.length === 0) {
      const defaults: CustomCollection[] = [
        {
          id: 'coll_lucky_wishlist',
          name: 'Lucky Trade Wishlist',
          description: 'Pokémon targeted for lucky mirror or special trades',
          color: '#f59e0b',
          createdAt: new Date().toISOString(),
          totalItems: 0,
          caughtItems: 0
        },
        {
          id: 'coll_pvp_great_league',
          name: 'PvP Great League Targets',
          description: 'Meta relevant Pokémon for Great League (1500 CP cap)',
          color: '#3b82f6',
          createdAt: new Date().toISOString(),
          totalItems: 0,
          caughtItems: 0
        },
        {
          id: 'coll_shadow_hundo',
          name: 'Shadow 100% Targets',
          description: 'Top tier shadow attackers to hunt or purify',
          color: '#8b5cf6',
          createdAt: new Date().toISOString(),
          totalItems: 0,
          caughtItems: 0
        }
      ];
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(defaults));
    }
  }

  // --- Dashboard Customization Tabs ---
  public getDashboardTabs(collections: CustomCollection[] = []): DashboardTabConfig[] {
    const defaultTabs: DashboardTabConfig[] = [
      { id: 'standard', label: 'Standard Dex', type: 'preset', visible: true },
      { id: 'shiny', label: 'Shiny Dex', type: 'preset', visible: true, color: '#f59e0b' },
      { id: 'shadow', label: 'Crypto Dex', type: 'preset', visible: true, color: '#a855f7' },
      { id: 'mega', label: 'Mega Dex', type: 'preset', visible: true, color: '#f43f5e' },
      { id: 'form', label: 'Alle Formen', type: 'preset', visible: true, color: '#6366f1' },
      { id: 'costume', label: 'Kostüme', type: 'preset', visible: true, color: '#ec4899' },
    ];

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DASHBOARD_TABS);
      if (stored) {
        const parsed: DashboardTabConfig[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingCollIds = new Set(collections.map(c => c.id));
          const filtered = parsed.filter(t => t.id !== 'custom' && (t.type === 'preset' || (t.collectionId && existingCollIds.has(t.collectionId))));

          const storedCollIds = new Set(filtered.filter(t => t.type === 'custom' && t.collectionId).map(t => t.collectionId));
          for (const coll of collections) {
            if (!storedCollIds.has(coll.id)) {
              filtered.push({
                id: `custom:${coll.id}`,
                label: coll.name,
                type: 'custom',
                collectionId: coll.id,
                visible: true,
                color: coll.color || '#3b82f6'
              });
            }
          }
          return filtered;
        }
      }
    } catch (e) {
      console.warn('Failed to parse dashboard tabs:', e);
    }

    const result = [...defaultTabs];
    for (const coll of collections) {
      result.push({
        id: `custom:${coll.id}`,
        label: coll.name,
        type: 'custom',
        collectionId: coll.id,
        visible: true,
        color: coll.color || '#3b82f6'
      });
    }
    return result;
  }

  public saveDashboardTabs(tabs: DashboardTabConfig[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DASHBOARD_TABS, JSON.stringify(tabs));
    } catch (e) {
      console.warn('Failed to save dashboard tabs:', e);
    }
  }
}

export const storage = new StorageAdapter();
