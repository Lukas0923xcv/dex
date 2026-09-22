import { Pokemon, CustomCollection, BackupData, SingleCollectionBackup, DashboardTabConfig, UserAccount, DexScope, StatusFilter, TrackingMode } from '../types';
import localPokemonData from '../data/pokemon-data.json';

const STORAGE_KEYS = {
  LEGACY_PROGRESS: 'pogo_dex_progress_v1',
  PROGRESS_PREFIX: 'pogo_progress_v2_',
  ACCOUNTS: 'pogo_accounts_v1',
  ACTIVE_ACCOUNT: 'pogo_active_account_v1',
  COLLECTIONS: 'pogo_dex_collections_v1',
  COLLECTION_ITEMS: 'pogo_dex_collection_items_v1',
  REMOTE_API_URL: 'pogo_dex_remote_api_url_v1',
  FORCE_LOCAL: 'pogo_dex_force_local_v1',
  DASHBOARD_TABS: 'pogo_dashboard_tabs_v1',
  STATUS_FILTER: 'pogo_dex_status_filter_v1',
  ACTIVE_MODE: 'pogo_dex_active_mode_v1'
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
  private progressCache: Map<string, Record<string, any>> = new Map();
  private pendingProgressSaves: Map<string, any> = new Map();
  private collectionItemsListCache: Array<{ collection_id: string; pokemon_id: string; added_at?: string }> | null = null;
  private pendingCollectionItemsSave: any = null;

  constructor() {
    this.detectEnvironment();
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flushPendingSaves();
      });
    }
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 4000): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal
      });
    } finally {
      clearTimeout(timer);
    }
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

    this.migrateLegacyProgressIfAny();

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

  // --- Accounts Management ---
  public getActiveAccountId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_ACCOUNT) || 'default';
  }

  public setActiveAccountId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ACCOUNT, id);
  }

  // --- Filter Preferences ---
  public getSavedStatusFilter(): StatusFilter {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STATUS_FILTER);
      if (saved === 'all' || saved === 'caught' || saved === 'uncaught') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'all';
  }

  public setSavedStatusFilter(status: StatusFilter): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STATUS_FILTER, status);
    } catch {
      // ignore
    }
  }

  public getSavedMode(): TrackingMode {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_MODE) as TrackingMode;
      const validModes: TrackingMode[] = ['standard', 'shiny', 'shadow', 'mega', 'form', 'costume', 'custom'];
      if (validModes.includes(saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'standard';
  }

  public setSavedMode(mode: TrackingMode): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_MODE, mode);
    } catch {
      // ignore
    }
  }

  public async getAccounts(): Promise<UserAccount[]> {
    if (this.isConnectedToBackend) {
      try {
        const res = await fetch(`${this.backendUrl}/api/accounts`);
        if (res.ok) {
          const accounts: UserAccount[] = await res.json();
          localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
          return accounts;
        }
      } catch (err) {
        console.warn('Backend getAccounts failed, fallback to local:', err);
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}

    const defaultAcc: UserAccount = {
      id: 'default',
      name: 'Haupt-Account',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify([defaultAcc]));
    return [defaultAcc];
  }

  public async createAccount(name: string): Promise<UserAccount> {
    const cleanName = (name && name.trim()) ? name.trim() : 'Neuer Account';
    if (this.isConnectedToBackend) {
      try {
        const res = await fetch(`${this.backendUrl}/api/accounts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: cleanName })
        });
        if (res.ok) {
          const acc: UserAccount = await res.json();
          const accounts = await this.getAccounts();
          if (!accounts.some(a => a.id === acc.id)) {
            accounts.push(acc);
            localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
          }
          return acc;
        }
      } catch (err) {
        console.warn('Backend createAccount failed, falling back to local:', err);
      }
    }

    const newAcc: UserAccount = {
      id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      createdAt: new Date().toISOString()
    };
    const accounts = await this.getAccounts();
    accounts.push(newAcc);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    return newAcc;
  }

  public async renameAccount(id: string, name: string): Promise<UserAccount> {
    const cleanName = name.trim();
    if (this.isConnectedToBackend) {
      try {
        const res = await fetch(`${this.backendUrl}/api/accounts/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: cleanName })
        });
        if (res.ok) {
          const accounts = await this.getAccounts();
          const target = accounts.find(a => a.id === id);
          if (target) {
            target.name = cleanName;
            localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
          }
          return { id, name: cleanName, createdAt: target?.createdAt || new Date().toISOString() };
        }
      } catch (err) {
        console.warn('Backend renameAccount failed, falling back to local:', err);
      }
    }

    const accounts = await this.getAccounts();
    const target = accounts.find(a => a.id === id);
    if (target) {
      target.name = cleanName;
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    }
    return target || { id, name: cleanName, createdAt: new Date().toISOString() };
  }

  public async deleteAccount(id: string): Promise<boolean> {
    if (this.isConnectedToBackend) {
      try {
        await fetch(`${this.backendUrl}/api/accounts/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Backend deleteAccount failed:', err);
      }
    }

    let accounts = await this.getAccounts();
    accounts = accounts.filter(a => a.id !== id);
    if (accounts.length === 0) {
      accounts = [{ id: 'default', name: 'Haupt-Account', createdAt: new Date().toISOString() }];
    }
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));

    const prefix = `${STORAGE_KEYS.PROGRESS_PREFIX}${id}_`;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    for (const k of keysToRemove) {
      localStorage.removeItem(k);
    }

    if (this.getActiveAccountId() === id) {
      this.setActiveAccountId(accounts[0].id);
    }
    return true;
  }

  // --- Pokémon & Progress Retrieval (Scoped by Account and Dex Scope) ---
  public async getPokemonList(accountId: string = 'default', scope: DexScope = 'standard'): Promise<Pokemon[]> {
    if (this.isConnectedToBackend) {
      try {
        const res = await fetch(`${this.backendUrl}/api/pokemon?limit=2500&releasedOnly=true&accountId=${encodeURIComponent(accountId)}&dexScope=${encodeURIComponent(scope)}`);
        if (res.ok) {
          const backendList: Pokemon[] = await res.json();
          const localMap = new Map((localPokemonData as Pokemon[]).map(p => [p.id, p]));
          return backendList.filter(p => p.releasedInGo).map(p => {
            const local = localMap.get(p.id);
            return {
              ...p,
              hasShadow: Boolean(p.hasShadow || local?.hasShadow),
              hasShadowShiny: p.hasShadowShiny !== undefined ? Boolean(p.hasShadowShiny) : Boolean(local?.hasShadowShiny),
              hasShiny: p.hasShiny !== undefined ? Boolean(p.hasShiny) : Boolean(local?.hasShiny)
            };
          });
        }
      } catch (err) {
        console.warn('Backend fetch failed, falling back to local dataset:', err);
      }
    }

    // Local / GitHub Pages mode: use bundled dataset and join with scoped localStorage progress
    const baseList = (localPokemonData as Pokemon[]).filter(p => p.releasedInGo);
    const progressMap = this.getLocalProgress(accountId, scope);
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
    type: 'caught' | 'shiny' | 'lucky' | 'hundo' | 'shadow' | 'purified' | 'gender_m' | 'gender_f' | 'xxl' | 'xxs',
    accountId: string = 'default',
    scope: DexScope = 'standard'
  ): Promise<boolean> {
    // 1. Immediately update in-memory cache and debounce localStorage save (zero UI latency)
    const progress = this.getLocalProgress(accountId, scope);
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
    this.saveLocalProgress(accountId, scope, progress);

    // 2. Asynchronously sync to backend in background with timeout (never blocks UI)
    if (this.isConnectedToBackend) {
      this.fetchWithTimeout(`${this.backendUrl}/api/progress/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pokemonId, type, accountId, dexScope: scope })
      }).catch(err => {
        console.warn('Backend progress toggle sync failed:', err);
      });
    }

    return newVal;
  }

  // --- Batch Update Progress (e.g., mark entire Region as caught/uncaught) ---
  public async batchUpdateProgress(
    pokemonIds: string[],
    values: { caught?: boolean; shinyCaught?: boolean; shadowCaught?: boolean },
    accountId: string = 'default',
    scope: DexScope = 'standard'
  ): Promise<boolean> {
    // Local Mode & Mirror
    const progress = this.getLocalProgress(accountId, scope);
    const now = new Date().toISOString();
    for (const id of pokemonIds) {
      const current = progress[id] || {};
      if (values.caught !== undefined) current.caught = values.caught;
      if (values.shinyCaught !== undefined) current.shinyCaught = values.shinyCaught;
      if (values.shadowCaught !== undefined) current.shadowCaught = values.shadowCaught;
      current.updatedAt = now;
      progress[id] = current;
    }
    this.saveLocalProgress(accountId, scope, progress);

    if (this.isConnectedToBackend) {
      this.fetchWithTimeout(`${this.backendUrl}/api/progress/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pokemonIds,
          caught: values.caught,
          shinyCaught: values.shinyCaught,
          shadowCaught: values.shadowCaught,
          accountId,
          dexScope: scope
        })
      }).catch(err => {
        console.warn('Backend batch progress update failed:', err);
      });
    }

    return true;
  }

  // --- Custom Collections ---
  public async getCollections(accountId: string = 'default'): Promise<CustomCollection[]> {
    if (this.isConnectedToBackend) {
      try {
        const [collsRes, itemsRes] = await Promise.all([
          this.fetchWithTimeout(`${this.backendUrl}/api/collections?accountId=${encodeURIComponent(accountId)}`),
          this.fetchWithTimeout(`${this.backendUrl}/api/collection-items`)
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
    const baseList = localPokemonData as Pokemon[];

    const localResult = collections.map(c => {
      const progress = this.getLocalProgress(accountId, `custom:${c.id}`);
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
      const items = [...this.getLocalCollectionItems()];
      const now = new Date().toISOString();
      for (const pid of payload.pokemonIds) {
        items.push({
          collection_id: newColl.id,
          pokemon_id: pid,
          added_at: now
        });
      }
      this.saveLocalCollectionItems(items);
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
    this.saveLocalCollectionItems(items);

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
    this.saveLocalCollectionItems([]);

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

    const items = [...this.getLocalCollectionItems()];
    if (!items.some(i => i.collection_id === collectionId && i.pokemon_id === pokemonId)) {
      items.push({
        collection_id: collectionId,
        pokemon_id: pokemonId,
        added_at: new Date().toISOString()
      });
      this.saveLocalCollectionItems(items);
    }

    if (this.isConnectedToBackend) {
      this.fetchWithTimeout(`${this.backendUrl}/api/collections/${collectionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pokemonId })
      }).catch(err => {
        console.warn('Backend addItemToCollection background sync failed:', err);
      });
    }

    return true;
  }

  public async removeItemFromCollection(collectionId: string, pokemonId: string): Promise<boolean> {
    const set = this.collectionItemsCache.get(collectionId);
    if (set) {
      set.delete(pokemonId);
    }

    const items = this.getLocalCollectionItems().filter(
      i => !(i.collection_id === collectionId && i.pokemon_id === pokemonId)
    );
    this.saveLocalCollectionItems(items);

    if (this.isConnectedToBackend) {
      this.fetchWithTimeout(`${this.backendUrl}/api/collections/${collectionId}/items/${pokemonId}`, {
        method: 'DELETE'
      }).catch(err => {
        console.warn('Backend removeItemFromCollection background sync failed:', err);
      });
    }

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
    this.saveLocalCollectionItems(items);
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

  public isPokemonInAnyCollection(pokemonId: string): boolean {
    for (const ids of this.collectionItemsCache.values()) {
      if (ids.has(pokemonId)) return true;
    }
    const items = this.getLocalCollectionItems();
    return items.some(i => i.pokemon_id === pokemonId);
  }

  // --- JSON Export & Import ---
  public async exportBackup(collectionId?: string): Promise<BackupData | SingleCollectionBackup> {
    if (collectionId) {
      if (this.isConnectedToBackend) {
        try {
          const res = await this.fetchWithTimeout(`${this.backendUrl}/api/export?collectionId=${encodeURIComponent(collectionId)}`);
          if (res.ok) {
            return await res.json();
          }
        } catch (err) {
          console.warn('Backend collection export failed, falling back to local storage:', err);
        }
      }

      // Check if exporting a preset collection (standard, shiny, shadow, mega, form, costume)
      const isPreset = collectionId.startsWith('preset:') ||
        ['standard', 'shiny', 'shadow', 'mega', 'form', 'costume'].includes(collectionId);

      if (isPreset) {
        const presetKey = collectionId.replace(/^preset:/, '');
        const presetDefs: Record<string, {
          name: string;
          description: string;
          color: string;
          categoryType: any;
          trackShiny?: boolean;
          filter: (p: Pokemon) => boolean;
        }> = {
          standard: {
            name: 'Standard Dex',
            description: 'Official regular species',
            color: '#3b82f6',
            categoryType: 'normal',
            filter: (p) => p.category === 'standard' && Boolean(p.releasedInGo)
          },
          shiny: {
            name: 'Shiny Dex',
            description: 'Released shiny Pokémon variants',
            color: '#f59e0b',
            categoryType: 'normal',
            trackShiny: true,
            filter: (p) => Boolean(p.hasShiny) && Boolean(p.releasedInGo)
          },
          shadow: {
            name: 'Shadow Dex',
            description: 'Officially released shadow Pokémon',
            color: '#a855f7',
            categoryType: 'shadow',
            filter: (p) => Boolean(p.hasShadow) && Boolean(p.releasedInGo)
          },
          mega: {
            name: 'Mega Dex',
            description: 'Mega and Primal evolutions',
            color: '#f43f5e',
            categoryType: 'mega',
            filter: (p) => (p.category === 'mega' || Boolean(p.isMega)) && Boolean(p.releasedInGo)
          },
          form: {
            name: 'Forms Dex',
            description: 'Regional forms & alternative variants',
            color: '#6366f1',
            categoryType: 'normal',
            filter: (p) => (p.category === 'form' || Boolean(p.isForm) || p.category === 'standard') && Boolean(p.releasedInGo)
          },
          costume: {
            name: 'Costumes Dex',
            description: 'Event Pokémon with costumes & specials',
            color: '#ec4899',
            categoryType: 'event',
            filter: (p) => (p.category === 'costume' || Boolean(p.isCostume)) && Boolean(p.releasedInGo)
          }
        };

        const def = presetDefs[presetKey];
        if (!def) {
          throw new Error(`Preset Dex "${collectionId}" not found.`);
        }

        const baseList = localPokemonData as Pokemon[];
        const matching = baseList.filter(def.filter);
        const collId = `preset_${presetKey}`;
        const now = new Date().toISOString();
        const collectionItems = matching.map(p => ({
          collection_id: collId,
          pokemon_id: p.id,
          added_at: now
        }));

        const progressV2: any[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(STORAGE_KEYS.PROGRESS_PREFIX)) {
            const rest = key.substring(STORAGE_KEYS.PROGRESS_PREFIX.length);
            const underscoreIdx = rest.indexOf('_');
            if (underscoreIdx > 0) {
              const accId = rest.substring(0, underscoreIdx);
              const scope = rest.substring(underscoreIdx + 1);
              if (scope === presetKey) {
                try {
                  const data = JSON.parse(localStorage.getItem(key) || '{}');
                  for (const [pid, val] of Object.entries<any>(data)) {
                    progressV2.push({
                      account_id: accId,
                      dex_scope: `custom:${collId}`,
                      original_scope: presetKey,
                      pokemon_id: pid,
                      caught: val.caught ? 1 : 0,
                      shiny_caught: val.shinyCaught ? 1 : 0,
                      lucky_caught: val.luckyCaught ? 1 : 0,
                      hundo_caught: val.hundoCaught ? 1 : 0,
                      shadow_caught: val.shadowCaught ? 1 : 0,
                      purified_caught: val.purifiedCaught ? 1 : 0,
                      gender_m_caught: val.genderMCaught ? 1 : 0,
                      gender_f_caught: val.genderFCaught ? 1 : 0,
                      xxl_caught: val.xxlCaught ? 1 : 0,
                      xxs_caught: val.xxsCaught ? 1 : 0,
                      notes: val.notes,
                      updated_at: val.updatedAt
                    });
                  }
                } catch {}
              }
            }
          }
        }

        const formattedColl: CustomCollection = {
          id: collId,
          name: def.name,
          description: def.description,
          color: def.color,
          categoryType: def.categoryType,
          variantMode: 'multi',
          trackShiny: Boolean(def.trackShiny),
          createdAt: now,
          totalItems: collectionItems.length,
          caughtItems: progressV2.filter(p => p.caught).length
        };

        return {
          app: 'PokemonGoDexTracker',
          version: 2,
          type: 'collection',
          isPreset: true,
          presetKey,
          exportedAt: now,
          data: {
            collection: formattedColl,
            collections: [formattedColl],
            collectionItems,
            progressV2
          }
        };
      }

      // Local export for custom collection
      const collections = this.collectionsCache.length > 0 ? this.collectionsCache : this.getLocalCollections();
      const coll = collections.find(c => c.id === collectionId);
      if (!coll) {
        throw new Error(`Collection with ID "${collectionId}" was not found.`);
      }

      const collectionItems = this.getLocalCollectionItems().filter(i => i.collection_id === collectionId);
      const progressV2: any[] = [];
      const scopeKey = `custom:${collectionId}`;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEYS.PROGRESS_PREFIX)) {
          const rest = key.substring(STORAGE_KEYS.PROGRESS_PREFIX.length);
          const underscoreIdx = rest.indexOf('_');
          if (underscoreIdx > 0) {
            const accId = rest.substring(0, underscoreIdx);
            const scope = rest.substring(underscoreIdx + 1);
            if (scope === scopeKey) {
              try {
                const data = JSON.parse(localStorage.getItem(key) || '{}');
                for (const [pid, val] of Object.entries<any>(data)) {
                  progressV2.push({
                    account_id: accId,
                    dex_scope: scope,
                    pokemon_id: pid,
                    caught: val.caught ? 1 : 0,
                    shiny_caught: val.shinyCaught ? 1 : 0,
                    lucky_caught: val.luckyCaught ? 1 : 0,
                    hundo_caught: val.hundoCaught ? 1 : 0,
                    shadow_caught: val.shadowCaught ? 1 : 0,
                    purified_caught: val.purifiedCaught ? 1 : 0,
                    gender_m_caught: val.genderMCaught ? 1 : 0,
                    gender_f_caught: val.genderFCaught ? 1 : 0,
                    xxl_caught: val.xxlCaught ? 1 : 0,
                    xxs_caught: val.xxsCaught ? 1 : 0,
                    notes: val.notes,
                    updated_at: val.updatedAt
                  });
                }
              } catch {}
            }
          }
        }
      }

      return {
        app: 'PokemonGoDexTracker',
        version: 2,
        type: 'collection',
        exportedAt: new Date().toISOString(),
        data: {
          collection: coll,
          collections: [coll],
          collectionItems,
          progressV2
        }
      } as any;
    }

    // Full export
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

    const progressV2: any[] = [];
    const accounts = await this.getAccounts();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.PROGRESS_PREFIX)) {
        const rest = key.substring(STORAGE_KEYS.PROGRESS_PREFIX.length);
        const underscoreIdx = rest.indexOf('_');
        if (underscoreIdx > 0) {
          const accId = rest.substring(0, underscoreIdx);
          const scope = rest.substring(underscoreIdx + 1);
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            for (const [pid, val] of Object.entries<any>(data)) {
              progressV2.push({
                account_id: accId,
                dex_scope: scope,
                pokemon_id: pid,
                caught: val.caught ? 1 : 0,
                shiny_caught: val.shinyCaught ? 1 : 0,
                lucky_caught: val.luckyCaught ? 1 : 0,
                hundo_caught: val.hundoCaught ? 1 : 0,
                shadow_caught: val.shadowCaught ? 1 : 0,
                purified_caught: val.purifiedCaught ? 1 : 0,
                gender_m_caught: val.genderMCaught ? 1 : 0,
                gender_f_caught: val.genderFCaught ? 1 : 0,
                xxl_caught: val.xxlCaught ? 1 : 0,
                xxs_caught: val.xxsCaught ? 1 : 0,
                notes: val.notes,
                updated_at: val.updatedAt
              });
            }
          } catch {}
        }
      }
    }

    return {
      app: 'PokemonGoDexTracker',
      version: 2,
      type: 'full',
      exportedAt: new Date().toISOString(),
      data: {
        progressV2,
        accounts,
        collections: this.getLocalCollections(),
        collectionItems: this.getLocalCollectionItems()
      }
    };
  }

  public async importBackup(backup: any, specificCollectionId?: string): Promise<{ success: boolean; mode?: 'full' | 'collection'; collectionName?: string }> {
    if (!backup || !backup.data) {
      throw new Error('Invalid backup file format.');
    }

    const isSingle = backup.type === 'collection' || Boolean(backup.data.collection) || Boolean(specificCollectionId);

    if (this.isConnectedToBackend) {
      try {
        const url = specificCollectionId
          ? `${this.backendUrl}/api/import?collectionId=${encodeURIComponent(specificCollectionId)}`
          : `${this.backendUrl}/api/import`;
        const res = await this.fetchWithTimeout(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backup)
        });
        if (res.ok) {
          const result = await res.json();
          // Clear memory caches so fresh data is loaded
          this.collectionsCache = [];
          this.collectionItemsCache.clear();
          this.collectionItemsListCache = null;
          this.progressCache.clear();
          return result;
        }
      } catch (err) {
        console.warn('Backend import failed, importing locally:', err);
      }
    }

    // Local Storage Import
    if (isSingle) {
      const coll = backup.data.collection || (specificCollectionId
        ? backup.data.collections?.find((c: any) => c.id === specificCollectionId)
        : backup.data.collections?.[0]);

      if (!coll) {
        throw new Error('Selected collection not found in backup file.');
      }

      const collId = coll.id;
      // 1. Update collection in collections list
      const existingColls = this.getLocalCollections();
      const filteredColls = existingColls.filter(c => c.id !== collId);
      const formattedColl: CustomCollection = {
        id: collId,
        name: coll.name,
        description: coll.description || '',
        color: coll.color || '#3b82f6',
        categoryType: coll.categoryType || coll.category_type || 'normal',
        variantMode: coll.variantMode || coll.variant_mode || 'multi',
        trackShiny: Boolean(coll.trackShiny ?? coll.track_shiny),
        trackHundo: Boolean(coll.trackHundo ?? coll.track_hundo),
        trackGender: Boolean(coll.trackGender ?? coll.track_gender),
        trackBackground: Boolean(coll.trackBackground ?? coll.track_background),
        trackSize: Boolean(coll.trackSize ?? coll.track_size),
        includeGenderForms: Boolean(coll.includeGenderForms ?? coll.include_gender_forms),
        createdAt: coll.createdAt || coll.created_at || new Date().toISOString(),
        totalItems: coll.totalItems || coll.total_items || 0,
        caughtItems: 0
      };
      filteredColls.push(formattedColl);
      this.collectionsCache = filteredColls;
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(filteredColls));

      // 2. Update collection items
      const existingItems = this.getLocalCollectionItems().filter(i => i.collection_id !== collId);
      const incomingItems = (backup.data.collectionItems || []).filter(
        (i: any) => i.collection_id === collId || !i.collection_id
      );
      const newItems = incomingItems.map((i: any) => ({
        collection_id: collId,
        pokemon_id: i.pokemon_id || i.pokemonId,
        added_at: i.added_at || i.addedAt || new Date().toISOString()
      }));
      formattedColl.totalItems = newItems.length;
      const combinedItems = [...existingItems, ...newItems];
      this.collectionItemsCache.delete(collId);
      this.saveLocalCollectionItems(combinedItems);

      // 3. Update progress for this custom scope
      const progressEntries = backup.data.progressV2 || backup.data.progress || [];
      const relevantProgress = progressEntries.filter(
        (p: any) => (p.dex_scope === `custom:${collId}` || p.dexScope === `custom:${collId}`)
      );
      for (const p of relevantProgress) {
        const accId = p.account_id || p.accountId || 'default';
        const scope = `custom:${collId}`;
        const curr = this.getLocalProgress(accId, scope);
        curr[p.pokemon_id || p.pokemonId] = {
          caught: Boolean(p.caught),
          shinyCaught: Boolean(p.shiny_caught ?? p.shinyCaught),
          luckyCaught: Boolean(p.lucky_caught ?? p.luckyCaught),
          hundoCaught: Boolean(p.hundo_caught ?? p.hundoCaught),
          shadowCaught: Boolean(p.shadow_caught ?? p.shadowCaught),
          purifiedCaught: Boolean(p.purified_caught ?? p.purifiedCaught),
          genderMCaught: Boolean(p.gender_m_caught ?? p.genderMCaught),
          genderFCaught: Boolean(p.gender_f_caught ?? p.genderFCaught),
          xxlCaught: Boolean(p.xxl_caught ?? p.xxlCaught),
          xxsCaught: Boolean(p.xxs_caught ?? p.xxsCaught),
          notes: p.notes,
          updatedAt: p.updated_at || p.updatedAt || new Date().toISOString()
        };
        this.saveLocalProgress(accId, scope, curr);
      }

      return {
        success: true,
        mode: 'collection',
        collectionName: formattedColl.name
      };
    }

    // Full Restore Mode
    if (Array.isArray(backup.data.accounts) && backup.data.accounts.length > 0) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(backup.data.accounts));
    }

    if (Array.isArray(backup.data.progressV2) && backup.data.progressV2.length > 0) {
      const groups = new Map<string, Record<string, any>>();
      for (const p of backup.data.progressV2) {
        const accId = p.account_id || 'default';
        const scope = p.dex_scope || 'standard';
        const key = this.getProgressKey(accId, scope);
        if (!groups.has(key)) groups.set(key, {});
        const map = groups.get(key)!;
        map[p.pokemon_id] = {
          caught: Boolean(p.caught),
          shinyCaught: Boolean(p.shiny_caught),
          luckyCaught: Boolean(p.lucky_caught),
          hundoCaught: Boolean(p.hundo_caught),
          shadowCaught: Boolean(p.shadow_caught),
          purifiedCaught: Boolean(p.purified_caught),
          genderMCaught: Boolean(p.gender_m_caught),
          genderFCaught: Boolean(p.gender_f_caught),
          xxlCaught: Boolean(p.xxl_caught),
          xxsCaught: Boolean(p.xxs_caught),
          notes: p.notes,
          updatedAt: p.updated_at
        };
      }
      for (const [k, obj] of groups.entries()) {
        localStorage.setItem(k, JSON.stringify(obj));
      }
      this.progressCache.clear();
    } else if (Array.isArray(backup.data.progress) && backup.data.progress.length > 0) {
      // Legacy import
      const progressMap: Record<string, any> = {};
      for (const p of backup.data.progress) {
        progressMap[p.pokemon_id] = {
          caught: Boolean(p.caught),
          shinyCaught: Boolean(p.shiny_caught),
          luckyCaught: Boolean(p.lucky_caught),
          hundoCaught: Boolean(p.hundo_caught),
          shadowCaught: Boolean(p.shadow_caught),
          purifiedCaught: Boolean(p.purified_caught),
          notes: p.notes,
          updatedAt: p.updated_at
        };
      }
      this.saveLocalProgress('default', 'standard', progressMap);
      this.progressCache.clear();
    }

    if (backup.data.collections) {
      this.collectionsCache = (backup.data.collections as unknown as CustomCollection[]);
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(backup.data.collections));
    }
    if (backup.data.collectionItems) {
      this.collectionItemsListCache = backup.data.collectionItems;
      this.collectionItemsCache.clear();
      localStorage.setItem(STORAGE_KEYS.COLLECTION_ITEMS, JSON.stringify(backup.data.collectionItems));
    }

    return { success: true, mode: 'full' };
  }

  public async resetProgress(accountId: string = 'default', scope?: string): Promise<void> {
    if (this.isConnectedToBackend) {
      try {
        await fetch(`${this.backendUrl}/api/progress/reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountId, dexScope: scope })
        });
      } catch (err) {
        console.warn('Backend resetProgress failed:', err);
      }
    }

    if (scope) {
      this.progressCache.delete(this.getProgressKey(accountId, scope));
      localStorage.removeItem(this.getProgressKey(accountId, scope));
    } else {
      this.progressCache.clear();
      const prefix = `${STORAGE_KEYS.PROGRESS_PREFIX}${accountId}_`;
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) toRemove.push(k);
      }
      for (const k of toRemove) localStorage.removeItem(k);
      if (accountId === 'default') {
        localStorage.removeItem(STORAGE_KEYS.LEGACY_PROGRESS);
      }
    }
  }

  public resetAllProgress(): void {
    const accId = this.getActiveAccountId();
    this.resetProgress(accId);
    this.progressCache.clear();
    this.collectionItemsCache.clear();
    this.collectionItemsListCache = null;
    this.collectionsCache = [];
    localStorage.removeItem(STORAGE_KEYS.COLLECTIONS);
    localStorage.removeItem(STORAGE_KEYS.COLLECTION_ITEMS);
    this.ensureDefaultLocalCollections();
  }

  // --- Private LocalStorage Helpers ---
  private migrateLegacyProgressIfAny() {
    try {
      const defaultKey = this.getProgressKey('default', 'standard');
      if (!localStorage.getItem(defaultKey)) {
        const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_PROGRESS);
        if (legacy) {
          localStorage.setItem(defaultKey, legacy);
        }
      }
      const accountsJson = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (!accountsJson) {
        const defaultAcc: UserAccount = {
          id: 'default',
          name: 'Haupt-Account',
          createdAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify([defaultAcc]));
      }

      // Migrate any duplicate Spinda heart pattern entries to Pattern 9
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEYS.PROGRESS_PREFIX)) {
          const raw = localStorage.getItem(key);
          if (raw && raw.includes('poke_327_special_pattern_heart')) {
            try {
              const data = JSON.parse(raw);
              if (data['poke_327_special_pattern_heart']) {
                if (!data['poke_327_special_pattern_09']) {
                  data['poke_327_special_pattern_09'] = data['poke_327_special_pattern_heart'];
                }
                delete data['poke_327_special_pattern_heart'];
                localStorage.setItem(key, JSON.stringify(data));
              }
            } catch {
              // ignore
            }
          }
        }
      }
    } catch (e) {
      console.warn('Legacy progress migration note:', e);
    }
  }

  private getProgressKey(accountId: string = 'default', scope: string = 'standard'): string {
    return `${STORAGE_KEYS.PROGRESS_PREFIX}${accountId}_${scope}`;
  }

  private getLocalProgress(accountId: string = 'default', scope: string = 'standard'): Record<string, any> {
    const key = this.getProgressKey(accountId, scope);
    if (this.progressCache.has(key)) {
      return this.progressCache.get(key)!;
    }
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        this.progressCache.set(key, parsed);
        return parsed;
      }
      if (scope === 'form') {
        const standardData = localStorage.getItem(this.getProgressKey(accountId, 'standard'));
        if (standardData) {
          localStorage.setItem(this.getProgressKey(accountId, 'form'), standardData);
          const parsed = JSON.parse(standardData);
          this.progressCache.set(key, parsed);
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    const empty: Record<string, any> = {};
    this.progressCache.set(key, empty);
    return empty;
  }

  private saveLocalProgress(accountId: string = 'default', scope: string = 'standard', progress: Record<string, any>): void {
    const key = this.getProgressKey(accountId, scope);
    this.progressCache.set(key, progress);

    if (this.pendingProgressSaves.has(key)) {
      clearTimeout(this.pendingProgressSaves.get(key));
    }
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(progress));
      } catch (e) {
        console.warn('Failed to save local progress:', e);
      }
      this.pendingProgressSaves.delete(key);
    }, 150);
    this.pendingProgressSaves.set(key, timer);
  }

  public flushPendingSaves(): void {
    for (const [key, timer] of this.pendingProgressSaves.entries()) {
      clearTimeout(timer);
      const data = this.progressCache.get(key);
      if (data) {
        try {
          localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
          console.warn('Failed to flush progress save:', e);
        }
      }
    }
    this.pendingProgressSaves.clear();

    if (this.pendingCollectionItemsSave) {
      clearTimeout(this.pendingCollectionItemsSave);
      this.pendingCollectionItemsSave = null;
      if (this.collectionItemsListCache) {
        try {
          localStorage.setItem(STORAGE_KEYS.COLLECTION_ITEMS, JSON.stringify(this.collectionItemsListCache));
        } catch (e) {
          console.warn('Failed to flush collection items save:', e);
        }
      }
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
    if (this.collectionItemsListCache) {
      return this.collectionItemsListCache;
    }
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COLLECTION_ITEMS);
      const parsed = data ? JSON.parse(data) : [];
      this.collectionItemsListCache = parsed;
      return parsed;
    } catch {
      return [];
    }
  }

  private saveLocalCollectionItems(items: Array<{ collection_id: string; pokemon_id: string; added_at?: string }>): void {
    this.collectionItemsListCache = items;
    if (this.pendingCollectionItemsSave) {
      clearTimeout(this.pendingCollectionItemsSave);
    }
    this.pendingCollectionItemsSave = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEYS.COLLECTION_ITEMS, JSON.stringify(items));
      } catch (e) {
        console.warn('Failed to save collection items:', e);
      }
      this.pendingCollectionItemsSave = null;
    }, 150);
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
      { id: 'shadow', label: 'Shadow Dex', type: 'preset', visible: true, color: '#a855f7' },
      { id: 'mega', label: 'Mega Dex', type: 'preset', visible: true, color: '#f43f5e' },
      { id: 'form', label: 'All Forms', type: 'preset', visible: true, color: '#6366f1' },
      { id: 'costume', label: 'Costumes', type: 'preset', visible: true, color: '#ec4899' },
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
