import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Pokemon, CustomCollection, TrackingMode, FilterState, BackupData, SingleCollectionBackup, UserAccount, DexScope } from '../types';
import { storage, StorageStatus } from '../services/storage';
import { isPokemonInRegion } from '../utils/regions';
import { getPrimaryAvailabilityTag, getAvailabilitySortRank } from '../data/pokemonObtainData';
import { compareFormsWithinSpecies } from '../utils/formSorting';
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
  includeBaseInForms: true,
  shinyOnly: false,
  shadowOnly: false
};

export const isRegionalForm = (p: Pokemon) => {
  const fid = (p.formId || '').toUpperCase();
  const fname = (p.formName || '').toUpperCase();
  const name = (p.name || '').toUpperCase();
  return (
    fid.includes('ALOLA') || fid.includes('GALAR') || fid.includes('HISUI') || fid.includes('PALDEA') ||
    fname.includes('ALOLA') || fname.includes('GALAR') || fname.includes('HISUI') || fname.includes('PALDEA') ||
    name.includes('ALOLAN') || name.includes('GALARIAN') || name.includes('HISUIAN') || name.includes('PALDEAN')
  );
};

const GERMAN_BASE_FORM_LABELS: Record<number, string> = {
  201: 'A',
  327: 'Muster 1',
  351: 'Normalform',
  386: 'Normalform',
  412: 'Pflanzenumhang',
  413: 'Pflanzenumhang',
  421: 'Wolkenform',
  422: 'Westliches Meer',
  423: 'Westliches Meer',
  479: 'Normalform',
  483: 'Standardform',
  484: 'Standardform',
  487: 'Wandelform',
  492: 'Landform',
  550: 'Rotlinig',
  555: 'Normalform',
  585: 'Frühlingsform',
  586: 'Frühlingsform',
  641: 'Inkarnationsform',
  642: 'Inkarnationsform',
  645: 'Inkarnationsform',
  646: 'Kyurem',
  647: 'Normalform',
  648: 'Arie',
  649: 'Normalmodul',
  666: 'Wiesenmuster',
  669: 'Rotblütler',
  670: 'Rotblütler',
  671: 'Rotblütler',
  676: 'Zottelform',
  678: 'Männlich',
  681: 'Schildform',
  710: 'Normalgroß',
  711: 'Normalgroß',
  718: '50%-Form',
  720: 'Gebannt',
  741: 'Flamenco',
  745: 'Tagform',
  746: 'Einzelform',
  774: 'Meteorform',
  778: 'Verkleidungsform',
  800: 'Standardform',
  845: 'Schlingform',
  849: 'Hoch-Form',
  854: 'Fälschungsform',
  855: 'Fälschungsform',
  875: 'Kopfüber-Form',
  876: 'Männlich',
  877: 'Morpeko',
  888: 'Kämpferheld',
  889: 'Held des Krieges',
  892: 'Fokussierter Stil',
  905: 'Inkarnationsform',
  916: 'Männlich',
  925: 'Viererfamilie',
  931: 'Grünes Gefieder',
  978: 'Gekrümmte Form',
  982: 'Zweistufige Form',
  999: 'Wanderform',
  1012: 'Nachahmungsform',
  1013: 'Unscheinbare Form'
};



export function useDex() {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string>(() => storage.getActiveAccountId());
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [collections, setCollections] = useState<CustomCollection[]>([]);
  const [mode, setMode] = useState<TrackingMode>(() => storage.getSavedMode());
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...INITIAL_FILTERS,
    status: storage.getSavedStatusFilter()
  }));

  useEffect(() => {
    storage.setSavedMode(mode);
  }, [mode]);

  useEffect(() => {
    storage.setSavedStatusFilter(filters.status);
  }, [filters.status]);
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
      setPokemonList(pokes.filter(p => p.releasedInGo));
      setCollections(colls);
      setFilters(f => {
        if (colls.length > 0 && !f.activeCollectionId) {
          return { ...f, activeCollectionId: colls[0].id };
        }
        return f;
      });
    } catch (err) {
      console.error('Failed to initialize dex tracker:', err);
    } finally {
      setLoading(false);
    }
  }, [activeAccountId, activeScope]);

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

    const inAnyColl = storage.isPokemonInAnyCollection(pokemonId);
    setPokemonList(prev => prev.map(p => p.id === pokemonId ? { ...p, inCollection: inAnyColl } : p));
    const updatedColls = await storage.getCollections(activeAccountId);
    setCollections(updatedColls);
  }, [activeAccountId]);

  const setCollectionItems = useCallback(async (collectionId: string, pokemonIds: string[]) => {
    await storage.setCollectionItems(collectionId, pokemonIds);
    const updatedColls = await storage.getCollections(activeAccountId);
    setCollections(updatedColls);
    setPokemonList(prev => prev.map(p => ({ ...p, inCollection: storage.isPokemonInAnyCollection(p.id) })));
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

    // 0. Filter by Released in GO (specifically a Pokémon GO dex)
    result = result.filter(p => p.releasedInGo);

    const activeColl = collections.find(c => c.id === filters.activeCollectionId) || collections[0];

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
        if (p.isGenderDifference && !includeGender) {
          return false;
        }
        return true;
      };

      const qualifyingForms = pokemonList.filter(isQualifyingForm);
      const regionalDexNrs = new Set(
        qualifyingForms.filter(isRegionalForm).map(p => p.dexNr)
      );
      const nonRegionalFormDexNrs = new Set(
        qualifyingForms.filter(p => !isRegionalForm(p)).map(p => p.dexNr)
      );

      result = result.filter(p => {
        if (isQualifyingForm(p)) return true;
        if (p.category === 'standard') {
          // Regional forms show base versions (when includeBaseInForms is true, default true)
          if (Boolean(filters.includeBaseInForms) && regionalDexNrs.has(p.dexNr)) {
            return true;
          }
          // Non-regional multi-form species show all versions
          if (nonRegionalFormDexNrs.has(p.dexNr)) {
            return true;
          }
        }
        return false;
      }).map(p => {
        // Format non-regional base forms so they display with their form name rather than an unformed "base" version
        if (p.category === 'standard' && nonRegionalFormDexNrs.has(p.dexNr) && p.formName && p.formName !== 'Standard') {
          if (p.isForm && p.name.includes(`(${p.formName})`)) {
            return p;
          }
          const deLabel = GERMAN_BASE_FORM_LABELS[p.dexNr] || p.formName;
          return {
            ...p,
            isForm: true,
            name: !p.name.includes('(') ? `${p.name} (${p.formName})` : p.name,
            names: p.names ? {
              ...p.names,
              English: !p.name.includes('(') ? `${p.name} (${p.formName})` : (p.names.English || p.name),
              German: (p.names.German && !p.names.German.includes('(')) ? `${p.names.German} (${deLabel})` : (p.names.German || p.name)
            } : p.names
          };
        }
        return p;
      });
    } else if (mode === 'costume') {
      result = result.filter(p => p.category === 'costume' || p.isCostume);
    } else if (mode === 'custom') {
      if (activeColl) {
        const itemIds = storage.getCollectionItemIds(activeColl.id);
        const includeGender = Boolean(filters.showGenderTracking);
        const isExcludedGenderForm = (p: Pokemon) =>
          Boolean(p.isGenderDifference) && !includeGender;

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
          if (activeColl.categoryType === 'shadow') {
            result = result.filter(p => Boolean(p.hasShadowShiny));
          } else {
            result = result.filter(p => p.hasShiny);
          }
        }
      }
    }

    // 1b. Filter by Shiny Only (either toggle is on, or in custom mode with trackShiny)
    if (filters.shinyOnly) {
      if (mode === 'shadow' || (mode === 'custom' && activeColl?.categoryType === 'shadow')) {
        result = result.filter(p => Boolean(p.hasShadowShiny));
      } else {
        result = result.filter(p => p.hasShiny);
      }
    }

    // 1c. Filter by Shadow Only (toggle is on)
    if (filters.shadowOnly) {
      result = result.filter(p => Boolean(p.hasShadow));
    }

    // 2. Filter by Generation / Region
    if (filters.generation !== 'all') {
      result = result.filter(p => isPokemonInRegion(p, filters.generation));
    }

    // 3. Filter by Type
    if (filters.type !== 'all') {
      result = result.filter(
        p => p.type1.toLowerCase() === filters.type.toLowerCase() ||
             (p.type2 && p.type2.toLowerCase() === filters.type.toLowerCase())
      );
    }

    // 4. Filter by Caught Status
    const getPokemonCaughtStatus = (p: Pokemon) => {
      if (filters.shinyOnly || mode === 'shiny') return Boolean(p.shinyCaught);
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

        // Availability Tag search (egg, event, biome, paid, evolution, regional, incense, etc.)
        const availTag = getPrimaryAvailabilityTag(p);
        if (availTag) {
          if (availTag.label.toLowerCase().includes(q)) return true;
          if (availTag.shortLabel && availTag.shortLabel.toLowerCase().includes(q)) return true;
          if (availTag.type.toLowerCase().includes(q)) return true;
        }
        if ((q === 'egg' || q === 'eggs') && availTag?.type === 'egg_exclusive') return true;
        if (q === 'event' && (availTag?.type === 'event_exclusive' || p.category === 'costume' || p.isCostume)) return true;
        if (q === 'biome' && availTag?.type === 'biome') return true;
        if ((q === 'paid' || q === 'ticket') && availTag?.type === 'paid_research') return true;
        if ((q === 'evolution' || q === 'evo') && availTag?.type === 'evolution_only') return true;
        if (q === 'regional' && (availTag?.shortLabel === 'Regional' || isRegionalForm(p))) return true;
        if ((q === 'incense' || q === 'daily') && availTag?.label.toLowerCase().includes('incense')) return true;

        return false;
      });
    }

    // 6. Sort Order: Guarantee Base Form ALWAYS precedes Alternate & Gender Forms!
    result.sort((a, b) => {
      if (a.dexNr === b.dexNr) {
        return compareFormsWithinSpecies(a, b);
      }

      if (filters.sortBy === 'dexDesc') {
        return b.dexNr - a.dexNr;
      } else if (filters.sortBy === 'nameAsc') {
        return a.name.localeCompare(b.name);
      } else if (filters.sortBy === 'availability') {
        const rankDiff = getAvailabilitySortRank(a) - getAvailabilitySortRank(b);
        if (rankDiff !== 0) return rankDiff;
        return a.dexNr - b.dexNr;
      } else {
        return a.dexNr - b.dexNr;
      }
    });

    return result;
  }, [pokemonList, mode, filters, collections]);

  const markRegionCaught = useCallback(async (generation: number | 'all', caught: boolean) => {
    const targetIds = filteredPokemon
      .filter(p => generation === 'all' || isPokemonInRegion(p, generation))
      .map(p => p.id);
    await markBatchCaught(targetIds, caught);
  }, [filteredPokemon, markBatchCaught]);

  // Stats calculation for current view
  const currentViewStats = useMemo(() => {
    let pool = [...pokemonList];

    // Filter by Released in GO (specifically a Pokémon GO dex)
    pool = pool.filter(p => p.releasedInGo);

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
        if (p.isGenderDifference && !includeGender) {
          return false;
        }
        return true;
      };

      const qualifyingForms = pokemonList.filter(isQualifyingForm);
      const regionalDexNrs = new Set(
        qualifyingForms.filter(isRegionalForm).map(p => p.dexNr)
      );
      const nonRegionalFormDexNrs = new Set(
        qualifyingForms.filter(p => !isRegionalForm(p)).map(p => p.dexNr)
      );

      pool = pool.filter(p => {
        if (isQualifyingForm(p)) return true;
        if (p.category === 'standard') {
          if (Boolean(filters.includeBaseInForms) && regionalDexNrs.has(p.dexNr)) {
            return true;
          }
          if (nonRegionalFormDexNrs.has(p.dexNr)) {
            return true;
          }
        }
        return false;
      });
    } else if (mode === 'costume') {
      pool = pool.filter(p => p.category === 'costume' || p.isCostume);
    } else if (mode === 'custom') {
      if (activeColl) {
        const itemIds = storage.getCollectionItemIds(activeColl.id);
        const includeGender = Boolean(filters.showGenderTracking);
        const isExcludedGenderForm = (p: Pokemon) =>
          Boolean(p.isGenderDifference) && !includeGender;

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
          if (activeColl.categoryType === 'shadow') {
            pool = pool.filter(p => Boolean(p.hasShadowShiny));
          } else {
            pool = pool.filter(p => p.hasShiny);
          }
        }
      }
    }

    if (filters.shinyOnly) {
      if (mode === 'shadow' || (mode === 'custom' && activeColl?.categoryType === 'shadow')) {
        pool = pool.filter(p => Boolean(p.hasShadowShiny));
      } else {
        pool = pool.filter(p => p.hasShiny);
      }
    }

    if (filters.shadowOnly) {
      pool = pool.filter(p => Boolean(p.hasShadow));
    }

    if (filters.generation !== 'all') {
      pool = pool.filter(p => isPokemonInRegion(p, filters.generation));
    }

    const total = pool.length;
    const caught = pool.filter(p => {
      if (filters.shinyOnly || mode === 'shiny') return Boolean(p.shinyCaught);
      if (mode === 'shadow') return Boolean(p.shadowCaught);
      if (mode === 'custom' && (activeColl?.categoryType === 'shadow' || activeColl?.name.toLowerCase().includes('crypto') || activeColl?.name.toLowerCase().includes('shadow'))) return Boolean(p.shadowCaught);
      if (mode === 'custom' && activeColl?.categoryType === 'purified') return Boolean(p.purifiedCaught);
      if (mode === 'custom' && activeColl?.categoryType === 'lucky') return Boolean(p.luckyCaught);
      if (mode === 'custom' && activeColl?.trackShiny) return Boolean(p.shinyCaught);
      return Boolean(p.caught);
    }).length;

    const percentage = total > 0 ? Math.round((caught / total) * 100) : 0;

    return { total, caught, percentage };
  }, [pokemonList, mode, filters.generation, filters.activeCollectionId, filters.includeBaseInForms, filters.showGenderTracking, filters.shinyOnly, filters.shadowOnly, collections]);

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
  const exportBackup = useCallback(async (collectionId?: string): Promise<BackupData | SingleCollectionBackup> => {
    return await storage.exportBackup(collectionId);
  }, []);

  const importBackup = useCallback(async (backup: any, specificCollectionId?: string) => {
    const result = await storage.importBackup(backup, specificCollectionId);
    await refreshData();
    return result;
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
