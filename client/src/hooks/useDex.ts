import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Pokemon, CustomCollection, TrackingMode, FilterState, BackupData, UserAccount, DexScope } from '../types';
import { storage, StorageStatus } from '../services/storage';
import { isPokemonInRegion } from '../utils/regions';
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
  const inFlightRef = useRef<Set<string>>(new Set());
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
    const lockKey = `feat_${pokemonId}_${type}`;
    if (inFlightRef.current.has(lockKey)) return;
    inFlightRef.current.add(lockKey);

    try {
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
    } finally {
      inFlightRef.current.delete(lockKey);
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
    const lockKey = `coll_${collectionId}_${pokemonId}`;
    if (inFlightRef.current.has(lockKey)) return;
    inFlightRef.current.add(lockKey);

    try {
      const itemIds = storage.getCollectionItemIds(collectionId);
      if (itemIds.has(pokemonId)) {
        await storage.removeItemFromCollection(collectionId, pokemonId);
      } else {
        await storage.addItemToCollection(collectionId, pokemonId);
      }

      const updatedColls = await storage.getCollections(activeAccountId);
      setCollections(updatedColls);
      const inAnyColl = storage.isPokemonInAnyCollection(pokemonId);
      setPokemonList(prev => prev.map(p => p.id === pokemonId ? { ...p, inCollection: inAnyColl } : p));
    } finally {
      inFlightRef.current.delete(lockKey);
    }
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
        return false;
      });
    }

    // 6. Sort Order: Guarantee Base Form ALWAYS precedes Alternate & Gender Forms!
    const isBaseForm = (p: Pokemon) =>
      p.category === 'standard' || (!p.isForm && !p.isMega && !p.isCostume && !p.isGenderDifference);

    const getSizeRank = (p: Pokemon): number => {
      const s = `${p.id} ${p.formName || ''} ${p.name || ''}`.toLowerCase();
      if (s.includes('small') || s.includes('klein')) return 1;
      if (s.includes('average') || s.includes('fall_2022') || s.includes('fall 2022') || s.includes('normalgroß') || s.includes('mittel')) return 2;
      if (s.includes('large') || s.includes('groß') || s.includes('grosse')) return 3;
      if (s.includes('super') || s.includes('xl') || s.includes('übergröße')) return 4;
      return 99;
    };

    const getInGameFormRank = (p: Pokemon): number => {
      const dex = p.dexNr;
      const fid = (p.formId || '').toUpperCase();
      const fname = (p.formName || '').toUpperCase();
      const name = (p.name || '').toUpperCase();

      // 1. Genesect (#649): Normal -> Shock -> Burn -> Chill -> Douse
      if (dex === 649) {
        if (fid === 'NORMAL' || (!fid && p.category === 'standard') || fname.includes('NORMAL')) return 1;
        if (fid.includes('SHOCK') || fname.includes('SHOCK') || fname.includes('BLITZ')) return 2;
        if (fid.includes('BURN') || fname.includes('BURN') || fname.includes('FLAMMEN')) return 3;
        if (fid.includes('CHILL') || fname.includes('CHILL') || fname.includes('GEFRIER')) return 4;
        if (fid.includes('DOUSE') || fname.includes('DOUSE') || fname.includes('AQUA')) return 5;
        return 99;
      }

      // 2. Castform (#351): Normal -> Sunny -> Rainy -> Snowy
      if (dex === 351) {
        if (fid === 'NORMAL' || fname.includes('NORMAL') || (!fid && p.category === 'standard')) return 1;
        if (fid.includes('SUNNY') || fname.includes('SUNNY') || fname.includes('SONNE')) return 2;
        if (fid.includes('RAINY') || fname.includes('RAINY') || fname.includes('REGEN')) return 3;
        if (fid.includes('SNOWY') || fname.includes('SNOWY') || fname.includes('SCHNEE')) return 4;
        return 99;
      }

      // 3. Deoxys (#386): Normal -> Attack -> Defense -> Speed
      if (dex === 386) {
        if (fid === 'NORMAL' || fname.includes('NORMAL') || (!fid && p.category === 'standard')) return 1;
        if (fid.includes('ATTACK') || fname.includes('ATTACK') || fname.includes('ANGRIFF')) return 2;
        if (fid.includes('DEFENSE') || fname.includes('DEFENSE') || fname.includes('VERTEIDIGUNG')) return 3;
        if (fid.includes('SPEED') || fname.includes('SPEED') || fname.includes('INITIATIVE')) return 4;
        return 99;
      }

      // 4. Rotom (#479): Normal -> Heat -> Wash -> Frost -> Fan -> Mow
      if (dex === 479) {
        if (fid === 'NORMAL' || fname.includes('NORMAL') || (!fid && p.category === 'standard')) return 1;
        if (fid.includes('HEAT') || fname.includes('HEAT') || fname.includes('HITZE')) return 2;
        if (fid.includes('WASH') || fname.includes('WASH') || fname.includes('WASCH')) return 3;
        if (fid.includes('FROST') || fname.includes('FROST')) return 4;
        if (fid.includes('FAN') || fname.includes('FAN') || fname.includes('WIRBEL')) return 5;
        if (fid.includes('MOW') || fname.includes('MOW') || fname.includes('SCHNEID')) return 6;
        return 99;
      }

      // 5. Deerling (#585) & Sawsbuck (#586): Spring -> Summer -> Autumn -> Winter
      if (dex === 585 || dex === 586) {
        if (fid.includes('SPRING') || fname.includes('SPRING') || fname.includes('FRÜHLING') || (!fid && p.category === 'standard')) return 1;
        if (fid.includes('SUMMER') || fname.includes('SUMMER') || fname.includes('SOMMER')) return 2;
        if (fid.includes('AUTUMN') || fname.includes('AUTUMN') || fname.includes('HERBST')) return 3;
        if (fid.includes('WINTER') || fname.includes('WINTER')) return 4;
        return 99;
      }

      // 6. Vivillon (#666)
      if (dex === 666) {
        const vivillonOrder = [
          'ARCHIPELAGO', 'CONTINENTAL', 'ELEGANT', 'GARDEN', 'HIGH_PLAINS', 'HIGH PLAINS',
          'ICY_SNOW', 'ICY SNOW', 'JUNGLE', 'MARINE', 'MEADOW', 'MODERN', 'MONSOON',
          'OCEAN', 'POLAR', 'RIVER', 'SANDSTORM', 'SAVANNA', 'SUN', 'TUNDRA'
        ];
        for (let i = 0; i < vivillonOrder.length; i++) {
          const pattern = vivillonOrder[i];
          if (fid.includes(pattern) || fname.includes(pattern)) return i + 1;
        }
        return 99;
      }

      // 7. Flabébé (#669), Floette (#670), Florges (#671): Red -> Yellow -> Orange -> Blue -> White
      if (dex === 669 || dex === 670 || dex === 671) {
        if (fid.includes('RED') || fname.includes('RED') || fname.includes('ROT') || (!fid && p.category === 'standard')) return 1;
        if (fid.includes('YELLOW') || fname.includes('YELLOW') || fname.includes('GELB')) return 2;
        if (fid.includes('ORANGE') || fname.includes('ORANGE')) return 3;
        if (fid.includes('BLUE') || fname.includes('BLUE') || fname.includes('BLAU')) return 4;
        if (fid.includes('WHITE') || fname.includes('WHITE') || fname.includes('WEISS') || fname.includes('WEIß')) return 5;
        return 99;
      }

      // 8. Furfrou (#676): Natural -> Matron -> Dandy -> Debutante -> Diamond -> Star -> La Reine -> Kabuki -> Pharaoh -> Heart
      if (dex === 676) {
        if (fid.includes('NATURAL') || fname.includes('NATURAL') || (!fid && p.category === 'standard')) return 1;
        if (fid.includes('MATRON') || fname.includes('MATRON') || fname.includes('DAMEN')) return 2;
        if (fid.includes('DANDY') || fname.includes('DANDY') || fname.includes('KAVALIER')) return 3;
        if (fid.includes('DEBUTANTE') || fname.includes('DEBUTANTE') || fname.includes('FRÄULEIN')) return 4;
        if (fid.includes('DIAMOND') || fname.includes('DIAMOND') || fname.includes('DIAMANT')) return 5;
        if (fid.includes('STAR') || fname.includes('STAR') || fname.includes('STERN')) return 6;
        if (fid.includes('LA_REINE') || fname.includes('LA REINE') || fname.includes('KÖNIGIN')) return 7;
        if (fid.includes('KABUKI') || fname.includes('KABUKI')) return 8;
        if (fid.includes('PHARAOH') || fname.includes('PHARAOH') || fname.includes('PHARAO')) return 9;
        if (fid.includes('HEART') || fname.includes('HEART') || fname.includes('HERZ')) return 10;
        return 99;
      }

      // 9. Zygarde (#718): 10% -> 50% -> Complete
      if (dex === 718) {
        if (fid.includes('10') || fname.includes('10')) return 1;
        if (fid.includes('50') || fname.includes('50') || (!fid && p.category === 'standard')) return 2;
        if (fid.includes('COMPLETE') || fname.includes('COMPLETE') || fname.includes('100')) return 3;
        return 99;
      }

      // 10. Oricorio (#741): Baile -> Pom-Pom -> Pa'u -> Sensu
      if (dex === 741) {
        if (fid.includes('BAILE') || fname.includes('BAILE') || fname.includes('FLAMENCO') || (!fid && p.category === 'standard')) return 1;
        if (fid.includes('POM_POM') || fid.includes('POM-POM') || fname.includes('POM-POM') || fname.includes('CHEERLEADING')) return 2;
        if (fid.includes('PA_U') || fid.includes("PA'U") || fname.includes("PA'U") || fname.includes('HULA')) return 3;
        if (fid.includes('SENSU') || fname.includes('SENSU') || fname.includes('TANZTEETRACHT')) return 4;
        return 99;
      }

      // 11. Lycanroc (#745): Midday -> Midnight -> Dusk
      if (dex === 745) {
        if (fid.includes('MIDDAY') || fname.includes('MIDDAY') || fname.includes('TAGFORM') || (!fid && p.category === 'standard')) return 1;
        if (fid.includes('MIDNIGHT') || fname.includes('MIDNIGHT') || fname.includes('NACHTFORM')) return 2;
        if (fid.includes('DUSK') || fname.includes('DUSK') || fname.includes('ZWIELICHT')) return 3;
        return 99;
      }

      // 12. Necrozma (#800): Standard -> Dusk Mane -> Dawn Wings
      if (dex === 800) {
        if (fid === 'NORMAL' || (!fid && p.category === 'standard')) return 1;
        if (fid.includes('DUSK_MANE') || fname.includes('DUSK MANE') || fname.includes('ABENDMÄHNE')) return 2;
        if (fid.includes('DAWN_WINGS') || fname.includes('DAWN WINGS') || fname.includes('MORGENSCHWINGEN')) return 3;
        return 99;
      }

      // 13. Squawkabilly (#931): Green -> Blue -> Yellow -> White
      if (dex === 931) {
        if (fid.includes('GREEN') || fname.includes('GREEN') || fname.includes('GRÜN') || (!fid && p.category === 'standard')) return 1;
        if (fid.includes('BLUE') || fname.includes('BLUE') || fname.includes('BLAU')) return 2;
        if (fid.includes('YELLOW') || fname.includes('YELLOW') || fname.includes('GELB')) return 3;
        if (fid.includes('WHITE') || fname.includes('WHITE') || fname.includes('WEISS') || fname.includes('WEIß')) return 4;
        return 99;
      }

      // 14. Tatsugiri (#978): Curly -> Droopy -> Stretchy
      if (dex === 978) {
        if (fid.includes('CURLY') || fname.includes('CURLY') || fname.includes('GEKRÜMMT') || (!fid && p.category === 'standard')) return 1;
        if (fid.includes('DROOPY') || fname.includes('DROOPY') || fname.includes('HÄNGEND')) return 2;
        if (fid.includes('STRETCHY') || fname.includes('STRETCHY') || fname.includes('GESTRECKT')) return 3;
        return 99;
      }

      // 15. Tauros (#128): Standard (Kanto) -> Combat -> Blaze -> Aqua
      if (dex === 128) {
        if (!fid.includes('PALDEA') && !fname.includes('PALDEA')) return 1;
        if (fid.includes('COMBAT') || fname.includes('COMBAT') || fname.includes('GEFECHT')) return 2;
        if (fid.includes('BLAZE') || fname.includes('BLAZE') || fname.includes('FLAMMEN')) return 3;
        if (fid.includes('AQUA') || fname.includes('AQUA') || fname.includes('FLUTEN')) return 4;
        return 99;
      }

      // 16. Unown (#201): A through Z, then '!', then '?'
      if (dex === 201) {
        const rawFname = p.formName || '';
        if (rawFname === '!') return 27;
        if (rawFname === '?') return 28;
        if (rawFname.length === 1 && rawFname >= 'A' && rawFname <= 'Z') {
          return rawFname.charCodeAt(0) - 64;
        }
        return 99;
      }

      // 17. Kyurem (#646): Standard -> Black -> White
      if (dex === 646) {
        if (fid === 'NORMAL' || (!fid && p.category === 'standard')) return 1;
        if (fid.includes('BLACK') || fname.includes('BLACK') || fname.includes('SCHWARZ')) return 2;
        if (fid.includes('WHITE') || fname.includes('WHITE') || fname.includes('WEISS') || fname.includes('WEIß')) return 3;
        return 99;
      }

      // 18. Basculin (#550): Red -> Blue -> White
      if (dex === 550) {
        if (fid.includes('RED') || fname.includes('RED') || fname.includes('ROT') || (!fid && p.category === 'standard')) return 1;
        if (fid.includes('BLUE') || fname.includes('BLUE') || fname.includes('BLAU')) return 2;
        if (fid.includes('WHITE') || fname.includes('WHITE') || fname.includes('WEISS') || fname.includes('WEIß')) return 3;
        return 99;
      }

      // 19. Burmy (#412) & Wormadam (#413): Plant -> Sandy -> Trash
      if (dex === 412 || dex === 413) {
        if (fid.includes('PLANT') || fname.includes('PLANT') || fname.includes('PFLANZEN') || (!fid && p.category === 'standard')) return 1;
        if (fid.includes('SANDY') || fname.includes('SANDY') || fname.includes('SAND')) return 2;
        if (fid.includes('TRASH') || fname.includes('TRASH') || fname.includes('LUMPEN')) return 3;
        return 99;
      }

      // 20. Shellos (#422) & Gastrodon (#423): West Sea -> East Sea
      if (dex === 422 || dex === 423) {
        if (fid.includes('WEST') || fname.includes('WEST') || (!fid && p.category === 'standard')) return 1;
        if (fid.includes('EAST') || fname.includes('EAST') || fname.includes('OST')) return 2;
        return 99;
      }

      // 21. Cherrim (#421): Overcast -> Sunshine
      if (dex === 421) {
        if (fid.includes('OVERCAST') || fname.includes('OVERCAST') || fname.includes('WOLKEN') || (!fid && p.category === 'standard')) return 1;
        if (fid.includes('SUNNY') || fid.includes('SUNSHINE') || fname.includes('SONNEN')) return 2;
        return 99;
      }

      // 22. Spinda (#327): Pattern 1 to 9
      if (dex === 327) {
        const match = `${fid} ${fname}`.match(/\b(?:PATTERN|MUSTER)\s*(\d+)/i);
        if (match) return parseInt(match[1], 10);
        if (fname.includes('HEART') || fname.includes('HERZ')) return 9;
        return 99;
      }

      // 23. Toxtricity (#849): Amped -> Low Key
      if (dex === 849) {
        if (fid.includes('AMPED') || fname.includes('AMPED') || fname.includes('HOCH') || (!fid && p.category === 'standard')) return 1;
        if (fid.includes('LOW_KEY') || fid.includes('LOW KEY') || fname.includes('TIEF')) return 2;
        return 99;
      }

      // 24. Urshifu (#892): Single Strike -> Rapid Strike
      if (dex === 892) {
        if (fid.includes('SINGLE') || fname.includes('SINGLE') || fname.includes('FOKUSSIERT') || (!fid && p.category === 'standard')) return 1;
        if (fid.includes('RAPID') || fname.includes('RAPID') || fname.includes('FLIESSEND') || fname.includes('FLIEßEND')) return 2;
        return 99;
      }

      // 25. Dialga (#483) & Palkia (#484) & Giratina (#487): Standard/Altered -> Origin
      if (dex === 483 || dex === 484 || dex === 487) {
        if (fid.includes('ORIGIN') || fname.includes('ORIGIN') || fname.includes('URFORM')) return 2;
        return 1;
      }

      // 26. Shaymin (#492): Land -> Sky
      if (dex === 492) {
        if (fid.includes('SKY') || fname.includes('SKY') || fname.includes('ZENIT')) return 2;
        return 1;
      }

      // 27. Keldeo (#647): Ordinary -> Resolute
      if (dex === 647) {
        if (fid.includes('RESOLUTE') || fname.includes('RESOLUTE') || fname.includes('ENTSCHLOSSEN')) return 2;
        return 1;
      }

      // 28. Hoopa (#720): Confined -> Unbound
      if (dex === 720) {
        if (fid.includes('UNBOUND') || fname.includes('UNBOUND') || fname.includes('ENTFESSELT')) return 2;
        return 1;
      }

      // 29. Zacian (#888) & Zamazenta (#889): Hero -> Crowned
      if (dex === 888 || dex === 889) {
        if (fid.includes('CROWNED') || fname.includes('CROWNED') || fname.includes('KÖNIG')) return 2;
        return 1;
      }

      // 30. Maushold (#925): Family of 4 -> Family of 3
      if (dex === 925) {
        if (fid.includes('FOUR') || fname.includes('4') || fname.includes('VIERER')) return 1;
        if (fid.includes('THREE') || fname.includes('3') || fname.includes('DREIER')) return 2;
        return 99;
      }

      // 31. Dudunsparce (#982): Two-Segment -> Three-Segment
      if (dex === 982) {
        if (fid.includes('TWO') || fname.includes('2') || fname.includes('ZWEISTUFIG')) return 1;
        if (fid.includes('THREE') || fname.includes('3') || fname.includes('DREISTUFIG')) return 2;
        return 99;
      }

      // 32. Sinistea / Polteageist (#854, #855): Phony -> Antique
      if (dex === 854 || dex === 855) {
        if (fid.includes('PHONY') || fname.includes('PHONY') || fname.includes('FÄLSCHUNG')) return 1;
        if (fid.includes('ANTIQUE') || fname.includes('ANTIQUE') || fname.includes('ORIGINAL')) return 2;
        return 99;
      }

      // 33. Poltchageist / Sinistcha (#1012, #1013): Counterfeit/Unremarkable -> Masterpiece
      if (dex === 1012 || dex === 1013) {
        if (fid.includes('MASTERPIECE') || fname.includes('MASTERPIECE') || fname.includes('KOSTBAR')) return 2;
        return 1;
      }

      // 34. Regional forms general rule: Original (0) -> Alola (10) -> Galar (20) -> Hisui (30) -> Paldea (40)
      const isAlola = fid.includes('ALOLA') || fname.includes('ALOLA') || name.includes('ALOLAN');
      const isGalar = fid.includes('GALAR') || fname.includes('GALAR') || name.includes('GALARIAN');
      const isHisui = fid.includes('HISUI') || fname.includes('HISUI') || name.includes('HISUIAN');
      const isPaldea = fid.includes('PALDEA') || fname.includes('PALDEA') || name.includes('PALDEAN');

      if (isAlola) return 10;
      if (isGalar) return 20;
      if (isHisui) return 30;
      if (isPaldea) return 40;

      if (p.category === 'standard') return 0;
      return 50;
    };

    result.sort((a, b) => {
      // Within the same species: Base form is always first, followed by forms, then gender differences
      if (a.dexNr === b.dexNr) {
        // Size forms (Pumpkaboo #710, Gourgeist #711) sort from Small to Big: Small -> Average -> Large -> Super
        if (a.dexNr === 710 || a.dexNr === 711) {
          const aCostume = Boolean(a.isCostume || a.category === 'costume');
          const bCostume = Boolean(b.isCostume || b.category === 'costume');
          if (aCostume !== bCostume) {
            return aCostume ? 1 : -1;
          }
          const aRank = getSizeRank(a);
          const bRank = getSizeRank(b);
          if (aRank !== bRank) {
            return aRank - bRank;
          }
        }

        // Check in-game Pokédex form rank
        const aFormRank = getInGameFormRank(a);
        const bFormRank = getInGameFormRank(b);
        if (aFormRank !== bFormRank) {
          return aFormRank - bFormRank;
        }

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
