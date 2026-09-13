import { useState, useEffect, useMemo, useCallback } from 'react';
import { Pokemon, CustomCollection, TrackingMode, FilterState, BackupData, UserAccount, DexScope } from '../types';
import { storage, StorageStatus } from '../services/storage';
import confetti from 'canvas-confetti';

const INITIAL_FILTERS: FilterState = {
  search: '',
  generation: 'all',
  type: 'all',
  status: 'all',
  releasedOnly: true, // Default to showing only Pokémon currently available in Pokémon GO
  activeCollectionId: null,
  sortBy: 'dexAsc',
  showGenderTracking: false,
  includeBaseInForms: false,
  shinyOnly: false,
  shadowOnly: false
};

export function useDex() {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string>(() => storage.getActiveAccountId());
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [collections, setCollections] = useState<CustomCollection[]>([]);
  const [mode, setMode] = useState<TrackingMode>('standard');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('pogo_dex_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  const activeScope = useMemo<DexScope>(() => {
    if (mode === 'custom') {
      return `custom:${filters.activeCollectionId || 'default'}`;
    }
    return mode;
  }, [mode, filters.activeCollectionId]);

  useEffect(() => {
    localStorage.setItem('pogo_dex_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const [storageStatus, setStorageStatus] = useState<StorageStatus>({
    isBackendConnected: false,
    backendUrl: '',
    isGitHubPages: false,
    walMode: false
  });

  // Load initial data
  const refreshData = useCallback(async () => {
    try {
      const status = await storage.init();
      setStorageStatus(status);

      const [accs, pokes, colls] = await Promise.all([
        storage.getAccounts(),
        storage.getPokemonList(activeAccountId, activeScope),
        storage.getCollections(activeAccountId)
      ]);

      setAccounts(accs);
      setPokemonList(pokes);
      setCollections(colls);
      if (colls.length > 0 && !filters.activeCollectionId) {
        setFilters(f => ({ ...f, activeCollectionId: colls[0].id }));
      }
    } catch (err) {
      console.error('Failed to initialize dex tracker:', err);
    } finally {
      setLoading(false);
    }
  }, [activeAccountId, activeScope, filters.activeCollectionId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Account Management Handlers
  const switchAccount = useCallback(async (accountId: string) => {
    storage.setActiveAccountId(accountId);
    setActiveAccountId(accountId);
  }, []);

  const createAccount = useCallback(async (name: string) => {
    const acc = await storage.createAccount(name);
    const updated = await storage.getAccounts();
    setAccounts(updated);
    storage.setActiveAccountId(acc.id);
    setActiveAccountId(acc.id);
    return acc;
  }, []);

  const renameAccount = useCallback(async (id: string, name: string) => {
    const updated = await storage.renameAccount(id, name);
    const updatedList = await storage.getAccounts();
    setAccounts(updatedList);
    return updated;
  }, []);

  const deleteAccount = useCallback(async (id: string) => {
    await storage.deleteAccount(id);
    const updated = await storage.getAccounts();
    setAccounts(updated);
    const currentActive = storage.getActiveAccountId();
    setActiveAccountId(currentActive);
  }, []);

  // Dynamic feature toggle (caught, shiny, lucky, hundo, shadow, purified, gender, size)
  const toggleFeature = useCallback(async (
    pokemonId: string,
    type: 'caught' | 'shiny' | 'lucky' | 'hundo' | 'shadow' | 'purified' | 'gender_m' | 'gender_f' | 'xxl' | 'xxs'
  ) => {
    const keyMap: Record<string, keyof Pokemon> = {
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
    const key = keyMap[type] || 'caught';

    setPokemonList(prev =>
      prev.map(p => (p.id === pokemonId ? { ...p, [key]: !p[key] } : p))
    );
    await storage.toggleProgress(pokemonId, type, activeAccountId, activeScope);

    if (mode === 'custom') {
      const updatedColls = await storage.getCollections(activeAccountId);
      setCollections(updatedColls);
    }
  }, [activeAccountId, activeScope, mode]);

  // One-click caught toggle adapts to current mode or active collection type
  const toggleCaught = useCallback(async (pokemonId: string) => {
    const activeColl = collections.find(c => c.id === filters.activeCollectionId);
    let targetType: 'caught' | 'shiny' | 'lucky' | 'shadow' | 'purified' = 'caught';

    if (mode === 'shiny') {
      targetType = 'shiny';
    } else if (mode === 'shadow') {
      targetType = 'shadow';
    } else if (mode === 'custom' && (activeColl?.categoryType === 'shadow' || activeColl?.name.toLowerCase().includes('crypto') || activeColl?.name.toLowerCase().includes('shadow'))) {
      targetType = 'shadow';
    } else if (mode === 'custom' && activeColl?.categoryType === 'purified') {
      targetType = 'purified';
    } else if (mode === 'custom' && activeColl?.categoryType === 'lucky') {
      targetType = 'lucky';
    } else if (mode === 'custom' && activeColl?.trackShiny) {
      targetType = 'shiny';
    }

    await toggleFeature(pokemonId, targetType);

    const colls = await storage.getCollections(activeAccountId);
    setCollections(colls);
  }, [mode, collections, filters.activeCollectionId, toggleFeature, activeAccountId]);

  // Toggle shiny status specifically
  const toggleShiny = useCallback(async (pokemonId: string) => {
    await toggleFeature(pokemonId, 'shiny');
  }, [toggleFeature]);

  // Custom Collections Management
  const createCollection = useCallback(async (
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
  ) => {
    const newColl = await storage.createCollection(name, description, color, options);
    setCollections(prev => [...prev, newColl]);
    setFilters(f => ({ ...f, activeCollectionId: newColl.id }));
    setMode('custom');
    return newColl;
  }, []);

  const deleteCollection = useCallback(async (id: string) => {
    await storage.deleteCollection(id);
    setCollections(prev => {
      const remaining = prev.filter(c => c.id !== id);
      if (filters.activeCollectionId === id) {
        if (remaining.length > 0) {
          setFilters(f => ({ ...f, activeCollectionId: remaining[0].id }));
        } else {
          setFilters(f => ({ ...f, activeCollectionId: null }));
          setMode(m => (m === 'custom' ? 'standard' : m));
        }
      }
      return remaining;
    });
  }, [filters.activeCollectionId]);

  const deleteAllCollections = useCallback(async () => {
    await storage.deleteAllCollections();
    setCollections([]);
    setFilters(f => ({ ...f, activeCollectionId: null }));
    setMode(m => (m === 'custom' ? 'standard' : m));
  }, []);

  const toggleCollectionItem = useCallback(async (collectionId: string, pokemonId: string) => {
    const itemIds = storage.getCollectionItemIds(collectionId);
    if (itemIds.has(pokemonId)) {
      await storage.removeItemFromCollection(collectionId, pokemonId);
    } else {
      await storage.addItemToCollection(collectionId, pokemonId);
    }

    const updatedColls = await storage.getCollections(activeAccountId);
    setCollections(updatedColls);
    setPokemonList(prev => [...prev]);
  }, [activeAccountId]);

  const setCollectionItems = useCallback(async (collectionId: string, pokemonIds: string[]) => {
    await storage.setCollectionItems(collectionId, pokemonIds);
    const updatedColls = await storage.getCollections(activeAccountId);
    setCollections(updatedColls);
    setPokemonList(prev => [...prev]);
  }, [activeAccountId]);

  // Bulk mark caught/uncaught (for regions, whole lists, etc.)
  const markBatchCaught = useCallback(async (pokemonIds: string[], caught: boolean) => {
    if (pokemonIds.length === 0) return;
    const activeColl = collections.find(c => c.id === filters.activeCollectionId);
    const isShiny = mode === 'shiny' || Boolean(mode === 'custom' && activeColl?.trackShiny);
    const isShadow = mode === 'shadow' || Boolean(mode === 'custom' && activeColl?.categoryType === 'shadow');
    await storage.batchUpdateProgress(
      pokemonIds,
      {
        caught: (isShiny || isShadow) ? undefined : caught,
        shinyCaught: isShiny ? caught : undefined,
        shadowCaught: isShadow ? caught : undefined
      },
      activeAccountId,
      activeScope
    );

    setPokemonList(prev =>
      prev.map(p => {
        if (!pokemonIds.includes(p.id)) return p;
        return {
          ...p,
          caught: (isShiny || isShadow) ? p.caught : caught,
          shinyCaught: isShiny ? caught : p.shinyCaught,
          shadowCaught: isShadow ? caught : p.shadowCaught
        };
      })
    );

    const updatedColls = await storage.getCollections(activeAccountId);
    setCollections(updatedColls);
  }, [mode, collections, filters.activeCollectionId, activeAccountId, activeScope]);

  // Filtered Pokémon list
  const filteredPokemon = useMemo(() => {
    let result = [...pokemonList];

    // 0. Filter by Released in GO (if enabled)
    if (filters.releasedOnly) {
      result = result.filter(p => p.releasedInGo);
    }

    // 1. Filter by Mode
    if (mode === 'standard') {
      result = result.filter(p => p.category === 'standard');
    } else if (mode === 'shiny') {
      // In Shiny mode, show all standard, megas, forms, and costumes that have shiny variations
      result = result.filter(p => p.hasShiny);
    } else if (mode === 'shadow') {
      result = result.filter(p => Boolean(p.hasShadow));
    } else if (mode === 'mega') {
      result = result.filter(p => p.category === 'mega' || p.isMega);
    } else if (mode === 'form') {
      const includeGender = Boolean(filters.showGenderTracking);
      const isQualifyingForm = (p: Pokemon) => {
        if (p.category !== 'form' && !p.isForm) return false;
        if (p.isGenderDifference && !includeGender && !['poke_678_special_female', 'poke_876_special_female', 'poke_916_special_female'].includes(p.id)) {
          return false;
        }
        return true;
      };

      if (filters.includeBaseInForms) {
        const formDexNrs = new Set(pokemonList.filter(isQualifyingForm).map(p => p.dexNr));
        result = result.filter(p => isQualifyingForm(p) || (p.category === 'standard' && formDexNrs.has(p.dexNr)));
      } else {
        result = result.filter(isQualifyingForm);
      }
    } else if (mode === 'costume') {
      result = result.filter(p => p.category === 'costume' || p.isCostume);
    } else if (mode === 'custom') {
      const activeColl = collections.find(c => c.id === filters.activeCollectionId) || collections[0];
      if (activeColl) {
        const itemIds = storage.getCollectionItemIds(activeColl.id);
        const includeGender = Boolean(filters.showGenderTracking);
        const isExcludedGenderForm = (p: Pokemon) =>
          Boolean(p.isGenderDifference) && !includeGender && !['poke_678_special_female', 'poke_876_special_female', 'poke_916_special_female'].includes(p.id);

        if (itemIds.size > 0) {
          result = result.filter(p => itemIds.has(p.id) && !isExcludedGenderForm(p));
        } else if (activeColl.categoryType === 'mega') {
          result = result.filter(p => p.category === 'mega' || p.isMega);
        } else if (activeColl.categoryType === 'event') {
          result = result.filter(p => p.category === 'costume' || p.isCostume);
        } else if (activeColl.categoryType === 'shadow' || activeColl.categoryType === 'purified' || activeColl.name.toLowerCase().includes('crypto') || activeColl.name.toLowerCase().includes('shadow') || activeColl.name.toLowerCase().includes('schatten')) {
          result = result.filter(p => Boolean(p.hasShadow));
          if (activeColl.variantMode === 'single') {
            result = result.filter(p => p.category === 'standard');
          } else {
            result = result.filter(p => {
              if (p.category === 'standard') return true;
              if (p.category === 'form' || p.isForm) {
                return !isExcludedGenderForm(p);
              }
              return false;
            });
          }
        } else if (activeColl.variantMode === 'single') {
          result = result.filter(p => p.category === 'standard');
        } else {
          result = result.filter(p => {
            if (p.category === 'standard') return true;
            if (p.category === 'form' || p.isForm) {
              return !isExcludedGenderForm(p);
            }
            return false;
          });
        }

        if (activeColl.trackShiny) {
          result = result.filter(p => p.hasShiny);
        }
      }
    }

    // 1b. Filter by Shiny Only (either toggle is on, or in custom mode with trackShiny)
    if (filters.shinyOnly) {
      result = result.filter(p => p.hasShiny);
    }

    // 1c. Filter by Shadow Only (toggle is on)
    if (filters.shadowOnly) {
      result = result.filter(p => Boolean(p.hasShadow));
    }

    // 2. Filter by Generation
    if (filters.generation !== 'all') {
      result = result.filter(p => p.generation === filters.generation);
    }

    // 3. Filter by Type
    if (filters.type !== 'all') {
      result = result.filter(
        p => p.type1.toLowerCase() === filters.type.toLowerCase() ||
             (p.type2 && p.type2.toLowerCase() === filters.type.toLowerCase())
      );
    }

    // 4. Filter by Caught Status
    const activeColl = collections.find(c => c.id === filters.activeCollectionId) || collections[0];
    const getPokemonCaughtStatus = (p: Pokemon) => {
      if (mode === 'shiny') return Boolean(p.shinyCaught);
      if (mode === 'shadow') return Boolean(p.shadowCaught);
      if (mode === 'custom' && (activeColl?.categoryType === 'shadow' || activeColl?.name.toLowerCase().includes('crypto') || activeColl?.name.toLowerCase().includes('shadow'))) return Boolean(p.shadowCaught);
      if (mode === 'custom' && activeColl?.categoryType === 'purified') return Boolean(p.purifiedCaught);
      if (mode === 'custom' && activeColl?.categoryType === 'lucky') return Boolean(p.luckyCaught);
      if (mode === 'custom' && activeColl?.trackShiny) return Boolean(p.shinyCaught);
      return Boolean(p.caught);
    };

    if (filters.status === 'caught') {
      result = result.filter(p => getPokemonCaughtStatus(p));
    } else if (filters.status === 'uncaught') {
      result = result.filter(p => !getPokemonCaughtStatus(p));
    }

    // 5. Search Filter (Name, Dex Number, Form Name, Smart Keywords: crypto/shadow, shiny, mega)
    if (filters.search.trim()) {
      const rawQuery = filters.search.trim().toLowerCase();
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

      const nr = parseInt(q, 10);
      result = result.filter(p => {
        if (requireShadow && !p.hasShadow) return false;
        if (requireShiny && !p.hasShiny) return false;
        if (requireMega && !(p.category === 'mega' || p.isMega)) return false;

        if (!q) return true;
        if (!isNaN(nr) && p.dexNr === nr) return true;
        if (p.name.toLowerCase().includes(q)) return true;
        if (p.formName && p.formName.toLowerCase().includes(q)) return true;
        if (p.names && Object.values(p.names).some(n => n.toLowerCase().includes(q))) return true;
        if (p.type1.toLowerCase().includes(q)) return true;
        if (p.type2 && p.type2.toLowerCase().includes(q)) return true;
        return false;
      });
    }

    // 6. Sort Order: Guarantee Base Form ALWAYS precedes Alternate & Gender Forms!
    const isBaseForm = (p: Pokemon) =>
      p.category === 'standard' || (!p.isForm && !p.isMega && !p.isCostume && !p.isGenderDifference);

    result.sort((a, b) => {
      // Within the same species: Base form is always first, followed by forms, then gender differences
      if (a.dexNr === b.dexNr) {
        const aBase = isBaseForm(a);
        const bBase = isBaseForm(b);
        if (aBase !== bBase) {
          return aBase ? -1 : 1;
        }
        if (Boolean(a.isGenderDifference) !== Boolean(b.isGenderDifference)) {
          return a.isGenderDifference ? 1 : -1;
        }
        return (a.formName || a.name).localeCompare(b.formName || b.name);
      }

      if (filters.sortBy === 'dexDesc') {
        return b.dexNr - a.dexNr;
      } else if (filters.sortBy === 'nameAsc') {
        return a.name.localeCompare(b.name);
      } else {
        return a.dexNr - b.dexNr;
      }
    });

    return result;
  }, [pokemonList, mode, filters, collections]);

  const markRegionCaught = useCallback(async (generation: number | 'all', caught: boolean) => {
    const targetIds = filteredPokemon
      .filter(p => generation === 'all' || p.generation === generation)
      .map(p => p.id);
    await markBatchCaught(targetIds, caught);
  }, [filteredPokemon, markBatchCaught]);

  // Stats calculation for current view
  const currentViewStats = useMemo(() => {
    let pool = [...pokemonList];

    if (filters.releasedOnly) {
      pool = pool.filter(p => p.releasedInGo);
    }

    const activeColl = collections.find(c => c.id === filters.activeCollectionId) || collections[0];

    if (mode === 'standard') {
      pool = pool.filter(p => p.category === 'standard');
    } else if (mode === 'shiny') {
      pool = pool.filter(p => p.hasShiny);
    } else if (mode === 'shadow') {
      pool = pool.filter(p => Boolean(p.hasShadow));
    } else if (mode === 'mega') {
      pool = pool.filter(p => p.category === 'mega' || p.isMega);
    } else if (mode === 'form') {
      const includeGender = Boolean(filters.showGenderTracking);
      const isQualifyingForm = (p: Pokemon) => {
        if (p.category !== 'form' && !p.isForm) return false;
        if (p.isGenderDifference && !includeGender && !['poke_678_special_female', 'poke_876_special_female', 'poke_916_special_female'].includes(p.id)) {
          return false;
        }
        return true;
      };

      if (filters.includeBaseInForms) {
        const formDexNrs = new Set(pokemonList.filter(isQualifyingForm).map(p => p.dexNr));
        pool = pool.filter(p => isQualifyingForm(p) || (p.category === 'standard' && formDexNrs.has(p.dexNr)));
      } else {
        pool = pool.filter(isQualifyingForm);
      }
    } else if (mode === 'costume') {
      pool = pool.filter(p => p.category === 'costume' || p.isCostume);
    } else if (mode === 'custom') {
      if (activeColl) {
        const itemIds = storage.getCollectionItemIds(activeColl.id);
        const includeGender = Boolean(filters.showGenderTracking);
        const isExcludedGenderForm = (p: Pokemon) =>
          Boolean(p.isGenderDifference) && !includeGender && !['poke_678_special_female', 'poke_876_special_female', 'poke_916_special_female'].includes(p.id);

        if (itemIds.size > 0) {
          pool = pool.filter(p => itemIds.has(p.id) && !isExcludedGenderForm(p));
        } else if (activeColl.categoryType === 'mega') {
          pool = pool.filter(p => p.category === 'mega' || p.isMega);
        } else if (activeColl.categoryType === 'event') {
          pool = pool.filter(p => p.category === 'costume' || p.isCostume);
        } else if (activeColl.categoryType === 'shadow' || activeColl.categoryType === 'purified' || activeColl.name.toLowerCase().includes('crypto') || activeColl.name.toLowerCase().includes('shadow') || activeColl.name.toLowerCase().includes('schatten')) {
          pool = pool.filter(p => Boolean(p.hasShadow));
          if (activeColl.variantMode === 'single') {
            pool = pool.filter(p => p.category === 'standard');
          } else {
            pool = pool.filter(p => {
              if (p.category === 'standard') return true;
              if (p.category === 'form' || p.isForm) {
                return !isExcludedGenderForm(p);
              }
              return false;
            });
          }
        } else if (activeColl.variantMode === 'single') {
          pool = pool.filter(p => p.category === 'standard');
        } else {
          pool = pool.filter(p => {
            if (p.category === 'standard') return true;
            if (p.category === 'form' || p.isForm) {
              return !isExcludedGenderForm(p);
            }
            return false;
          });
        }

        if (activeColl.trackShiny) {
          pool = pool.filter(p => p.hasShiny);
        }
      }
    }

    if (filters.shinyOnly) {
      pool = pool.filter(p => p.hasShiny);
    }

    if (filters.shadowOnly) {
      pool = pool.filter(p => Boolean(p.hasShadow));
    }

    if (filters.generation !== 'all') {
      pool = pool.filter(p => p.generation === filters.generation);
    }

    const total = pool.length;
    const caught = pool.filter(p => {
      if (mode === 'shiny') return Boolean(p.shinyCaught);
      if (mode === 'shadow') return Boolean(p.shadowCaught);
      if (mode === 'custom' && (activeColl?.categoryType === 'shadow' || activeColl?.name.toLowerCase().includes('crypto') || activeColl?.name.toLowerCase().includes('shadow'))) return Boolean(p.shadowCaught);
      if (mode === 'custom' && activeColl?.categoryType === 'purified') return Boolean(p.purifiedCaught);
      if (mode === 'custom' && activeColl?.categoryType === 'lucky') return Boolean(p.luckyCaught);
      if (mode === 'custom' && activeColl?.trackShiny) return Boolean(p.shinyCaught);
      return Boolean(p.caught);
    }).length;

    const percentage = total > 0 ? Math.round((caught / total) * 100) : 0;

    return { total, caught, percentage };
  }, [pokemonList, mode, filters.generation, filters.activeCollectionId, filters.releasedOnly, filters.includeBaseInForms, filters.showGenderTracking, filters.shinyOnly, filters.shadowOnly, collections]);

  // Trigger celebration on 100%
  useEffect(() => {
    if (currentViewStats.total > 0 && currentViewStats.caught === currentViewStats.total) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [currentViewStats.caught, currentViewStats.total]);

  // Export / Import
  const exportBackup = useCallback(async () => {
    return await storage.exportBackup();
  }, []);

  const importBackup = useCallback(async (backup: BackupData) => {
    await storage.importBackup(backup);
    await refreshData();
  }, [refreshData]);

  const resetScopeProgress = useCallback(async () => {
    await storage.resetProgress(activeAccountId, activeScope);
    await refreshData();
  }, [activeAccountId, activeScope, refreshData]);

  const resetAllProgress = useCallback(async () => {
    await storage.resetProgress(activeAccountId);
    await refreshData();
  }, [activeAccountId, refreshData]);

  return {
    accounts,
    activeAccountId,
    activeScope,
    switchAccount,
    createAccount,
    renameAccount,
    deleteAccount,
    pokemonList,
    filteredPokemon,
    collections,
    mode,
    filters,
    loading,
    storageStatus,
    currentViewStats,
    theme,
    setTheme,
    toggleTheme,
    setMode,
    setFilters,
    toggleCaught,
    toggleShiny,
    toggleFeature,
    markBatchCaught,
    markRegionCaught,
    createCollection,
    deleteCollection,
    deleteAllCollections,
    toggleCollectionItem,
    setCollectionItems,
    exportBackup,
    importBackup,
    resetScopeProgress,
    resetAllProgress,
    refreshData
  };
}
