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
  sortBy: 'dexAsc'
};

export function useDex() {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [collections, setCollections] = useState<CustomCollection[]>([]);
  const [mode, setMode] = useState<TrackingMode>('standard');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
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

  // One-click caught toggle
  const toggleCaught = useCallback(async (pokemonId: string) => {
    // Optimistic UI update
    setPokemonList(prev =>
      prev.map(p => {
        if (p.id === pokemonId) {
          const isShinyMode = mode === 'shiny';
          const field = isShinyMode ? 'shinyCaught' : 'caught';
          const nextVal = !p[field];
          return { ...p, [field]: nextVal };
        }
        return p;
      })
    );

    // Call storage adapter
    const type = mode === 'shiny' ? 'shiny' : 'caught';
    await storage.toggleProgress(pokemonId, type);

    // Re-sync collection item count
    setCollections(prev =>
      prev.map(c => {
        const itemIds = storage.getCollectionItemIds(c.id);
        if (itemIds.has(pokemonId)) {
          return {
            ...c,
            caughtItems: pokemonList.filter(p => itemIds.has(p.id) && (p.id === pokemonId ? !p.caught : p.caught)).length
          };
        }
        return c;
      })
    );
  }, [mode, pokemonList]);

  // Toggle shiny status specifically
  const toggleShiny = useCallback(async (pokemonId: string) => {
    setPokemonList(prev =>
      prev.map(p => (p.id === pokemonId ? { ...p, shinyCaught: !p.shinyCaught } : p))
    );
    await storage.toggleProgress(pokemonId, 'shiny');
  }, []);

  // Custom Collections Management
  const createCollection = useCallback(async (name: string, description = '', color = '#3b82f6') => {
    const newColl = await storage.createCollection(name, description, color);
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
      result = result.filter(p => p.category === 'form' || p.isForm);
    } else if (mode === 'costume') {
      result = result.filter(p => p.category === 'costume' || p.isCostume);
    } else if (mode === 'custom' && filters.activeCollectionId) {
      const itemIds = storage.getCollectionItemIds(filters.activeCollectionId);
      result = result.filter(p => itemIds.has(p.id));
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
    if (filters.status === 'caught') {
      if (mode === 'shiny') {
        result = result.filter(p => p.shinyCaught);
      } else {
        result = result.filter(p => p.caught);
      }
    } else if (filters.status === 'uncaught') {
      if (mode === 'shiny') {
        result = result.filter(p => !p.shinyCaught);
      } else {
        result = result.filter(p => !p.caught);
      }
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
  }, [pokemonList, mode, filters]);

  // Stats calculation for current view
  const currentViewStats = useMemo(() => {
    let pool = [...pokemonList];

    if (filters.releasedOnly) {
      pool = pool.filter(p => p.releasedInGo);
    }

    if (mode === 'standard') {
      pool = pool.filter(p => p.category === 'standard');
    } else if (mode === 'shiny') {
      pool = pool.filter(p => p.hasShiny);
    } else if (mode === 'mega') {
      pool = pool.filter(p => p.category === 'mega' || p.isMega);
    } else if (mode === 'form') {
      pool = pool.filter(p => p.category === 'form' || p.isForm);
    } else if (mode === 'costume') {
      pool = pool.filter(p => p.category === 'costume' || p.isCostume);
    } else if (mode === 'custom' && filters.activeCollectionId) {
      const itemIds = storage.getCollectionItemIds(filters.activeCollectionId);
      pool = pool.filter(p => itemIds.has(p.id));
    }

    if (filters.generation !== 'all') {
      pool = pool.filter(p => p.generation === filters.generation);
    }

    const total = pool.length;
    const caught = pool.filter(p => (mode === 'shiny' ? p.shinyCaught : p.caught)).length;
    const percentage = total > 0 ? Math.round((caught / total) * 100) : 0;

    return { total, caught, percentage };
  }, [pokemonList, mode, filters.generation, filters.activeCollectionId, filters.releasedOnly]);

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
    setMode,
    setFilters,
    toggleCaught,
    toggleShiny,
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
