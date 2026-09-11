import { useState, useEffect, useMemo, useCallback } from 'react';
import { Pokemon, CustomCollection, TrackingMode, FilterState, BackupData } from '../types';
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
  includeBaseInForms: false
};

export function useDex() {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [collections, setCollections] = useState<CustomCollection[]>([]);
  const [mode, setMode] = useState<TrackingMode>('standard');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('pogo_dex_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

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

      const [pokes, colls] = await Promise.all([
        storage.getPokemonList(),
        storage.getCollections()
      ]);

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
  }, [filters.activeCollectionId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

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
    await storage.toggleProgress(pokemonId, type);
  }, []);

  // One-click caught toggle adapts to current mode or active collection type
  const toggleCaught = useCallback(async (pokemonId: string) => {
    const activeColl = collections.find(c => c.id === filters.activeCollectionId);
    let targetType: 'caught' | 'shiny' | 'lucky' | 'shadow' | 'purified' = 'caught';

    if (mode === 'shiny') {
      targetType = 'shiny';
    } else if (mode === 'custom' && activeColl?.categoryType === 'shadow') {
      targetType = 'shadow';
    } else if (mode === 'custom' && activeColl?.categoryType === 'purified') {
      targetType = 'purified';
    } else if (mode === 'custom' && activeColl?.categoryType === 'lucky') {
      targetType = 'lucky';
    } else if (mode === 'custom' && activeColl?.trackShiny && activeColl.categoryType === 'normal') {
      targetType = 'shiny';
    }

    await toggleFeature(pokemonId, targetType);

    // Refresh collection counts
    const colls = await storage.getCollections();
    setCollections(colls);
  }, [mode, collections, filters.activeCollectionId, toggleFeature]);

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
      pokemonIds?: string[];
    }
  ) => {
    const newColl = await storage.createCollection(name, description, color, options);
    setCollections(prev => [...prev, newColl]);
    setFilters(f => ({ ...f, activeCollectionId: newColl.id }));
    return newColl;
  }, []);

  const deleteCollection = useCallback(async (id: string) => {
    await storage.deleteCollection(id);
    setCollections(prev => {
      const remaining = prev.filter(c => c.id !== id);
      if (filters.activeCollectionId === id) {
        setFilters(f => ({ ...f, activeCollectionId: remaining.length > 0 ? remaining[0].id : null }));
      }
      return remaining;
    });
  }, [filters.activeCollectionId]);

  const toggleCollectionItem = useCallback(async (collectionId: string, pokemonId: string) => {
    const itemIds = storage.getCollectionItemIds(collectionId);
    if (itemIds.has(pokemonId)) {
      await storage.removeItemFromCollection(collectionId, pokemonId);
    } else {
      await storage.addItemToCollection(collectionId, pokemonId);
    }

    // Refresh collection counts
    const updatedColls = await storage.getCollections();
    setCollections(updatedColls);
    setPokemonList(prev => [...prev]);
  }, []);

  const setCollectionItems = useCallback(async (collectionId: string, pokemonIds: string[]) => {
    await storage.setCollectionItems(collectionId, pokemonIds);
    const updatedColls = await storage.getCollections();
    setCollections(updatedColls);
    setPokemonList(prev => [...prev]);
  }, []);

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
    } else if (mode === 'mega') {
      result = result.filter(p => p.category === 'mega' || p.isMega);
    } else if (mode === 'form') {
      if (filters.includeBaseInForms) {
        const formDexNrs = new Set(pokemonList.filter(p => p.category === 'form' || p.isForm).map(p => p.dexNr));
        result = result.filter(p => (p.category === 'form' || p.isForm) || (p.category === 'standard' && formDexNrs.has(p.dexNr)));
      } else {
        result = result.filter(p => p.category === 'form' || p.isForm);
      }
    } else if (mode === 'costume') {
      result = result.filter(p => p.category === 'costume' || p.isCostume);
    } else if (mode === 'custom' && filters.activeCollectionId) {
      const activeColl = collections.find(c => c.id === filters.activeCollectionId);
      const itemIds = storage.getCollectionItemIds(filters.activeCollectionId);
      if (itemIds.size > 0) {
        result = result.filter(p => itemIds.has(p.id));
      } else if (activeColl) {
        if (activeColl.categoryType === 'mega') {
          result = result.filter(p => p.category === 'mega' || p.isMega);
        } else if (activeColl.categoryType === 'event') {
          result = result.filter(p => p.category === 'costume' || p.isCostume);
        } else if (activeColl.variantMode === 'single') {
          result = result.filter(p => p.category === 'standard');
        } else {
          result = result.filter(p => p.category === 'standard' || p.category === 'form');
        }
      }
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
    const activeColl = collections.find(c => c.id === filters.activeCollectionId);
    const getPokemonCaughtStatus = (p: Pokemon) => {
      if (mode === 'shiny') return Boolean(p.shinyCaught);
      if (mode === 'custom' && activeColl?.categoryType === 'shadow') return Boolean(p.shadowCaught);
      if (mode === 'custom' && activeColl?.categoryType === 'purified') return Boolean(p.purifiedCaught);
      if (mode === 'custom' && activeColl?.categoryType === 'lucky') return Boolean(p.luckyCaught);
      if (mode === 'custom' && activeColl?.trackShiny && activeColl.categoryType === 'normal') return Boolean(p.shinyCaught);
      return Boolean(p.caught);
    };

    if (filters.status === 'caught') {
      result = result.filter(p => getPokemonCaughtStatus(p));
    } else if (filters.status === 'uncaught') {
      result = result.filter(p => !getPokemonCaughtStatus(p));
    }

    // 5. Search Filter (Name, Dex Number, Form Name)
    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      const nr = parseInt(q, 10);
      result = result.filter(p => {
        if (!isNaN(nr) && p.dexNr === nr) return true;
        if (p.name.toLowerCase().includes(q)) return true;
        if (p.formName && p.formName.toLowerCase().includes(q)) return true;
        if (p.type1.toLowerCase().includes(q)) return true;
        if (p.type2 && p.type2.toLowerCase().includes(q)) return true;
        return false;
      });
    }

    // 6. Sort Order
    if (filters.sortBy === 'dexDesc') {
      result.sort((a, b) => b.dexNr - a.dexNr || b.name.localeCompare(a.name));
    } else if (filters.sortBy === 'nameAsc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => a.dexNr - b.dexNr || a.name.localeCompare(b.name));
    }

    return result;
  }, [pokemonList, mode, filters, collections]);

  // Stats calculation for current view
  const currentViewStats = useMemo(() => {
    let pool = [...pokemonList];

    if (filters.releasedOnly) {
      pool = pool.filter(p => p.releasedInGo);
    }

    const activeColl = collections.find(c => c.id === filters.activeCollectionId);

    if (mode === 'standard') {
      pool = pool.filter(p => p.category === 'standard');
    } else if (mode === 'shiny') {
      pool = pool.filter(p => p.hasShiny);
    } else if (mode === 'mega') {
      pool = pool.filter(p => p.category === 'mega' || p.isMega);
    } else if (mode === 'form') {
      if (filters.includeBaseInForms) {
        const formDexNrs = new Set(pokemonList.filter(p => p.category === 'form' || p.isForm).map(p => p.dexNr));
        pool = pool.filter(p => (p.category === 'form' || p.isForm) || (p.category === 'standard' && formDexNrs.has(p.dexNr)));
      } else {
        pool = pool.filter(p => p.category === 'form' || p.isForm);
      }
    } else if (mode === 'costume') {
      pool = pool.filter(p => p.category === 'costume' || p.isCostume);
    } else if (mode === 'custom' && filters.activeCollectionId) {
      const itemIds = storage.getCollectionItemIds(filters.activeCollectionId);
      if (itemIds.size > 0) {
        pool = pool.filter(p => itemIds.has(p.id));
      } else if (activeColl) {
        if (activeColl.categoryType === 'mega') {
          pool = pool.filter(p => p.category === 'mega' || p.isMega);
        } else if (activeColl.categoryType === 'event') {
          pool = pool.filter(p => p.category === 'costume' || p.isCostume);
        } else if (activeColl.variantMode === 'single') {
          pool = pool.filter(p => p.category === 'standard');
        } else {
          pool = pool.filter(p => p.category === 'standard' || p.category === 'form');
        }
      }
    }

    if (filters.generation !== 'all') {
      pool = pool.filter(p => p.generation === filters.generation);
    }

    const total = pool.length;
    const caught = pool.filter(p => {
      if (mode === 'shiny') return Boolean(p.shinyCaught);
      if (mode === 'custom' && activeColl?.categoryType === 'shadow') return Boolean(p.shadowCaught);
      if (mode === 'custom' && activeColl?.categoryType === 'purified') return Boolean(p.purifiedCaught);
      if (mode === 'custom' && activeColl?.categoryType === 'lucky') return Boolean(p.luckyCaught);
      if (mode === 'custom' && activeColl?.trackShiny && activeColl.categoryType === 'normal') return Boolean(p.shinyCaught);
      return Boolean(p.caught);
    }).length;

    const percentage = total > 0 ? Math.round((caught / total) * 100) : 0;

    return { total, caught, percentage };
  }, [pokemonList, mode, filters.generation, filters.activeCollectionId, filters.releasedOnly, filters.includeBaseInForms, collections]);

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

  const resetAllProgress = useCallback(() => {
    storage.resetAllProgress();
    refreshData();
  }, [refreshData]);

  return {
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
    createCollection,
    deleteCollection,
    toggleCollectionItem,
    setCollectionItems,
    exportBackup,
    importBackup,
    resetAllProgress,
    refreshData
  };
}
