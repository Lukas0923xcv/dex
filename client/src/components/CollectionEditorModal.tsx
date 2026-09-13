import React, { useState, useMemo, useEffect } from 'react';
import { Pokemon, CustomCollection } from '../types';
import { storage } from '../services/storage';
import { formatDexNumber } from '../utils/typeColors';
import { X, Search, Check, Filter, Sparkles, Layers, Zap, Bookmark } from 'lucide-react';

interface CollectionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: CustomCollection | null;
  allPokemon: Pokemon[];
  onSaveItems: (collectionId: string, selectedIds: string[]) => Promise<void>;
}

export const CollectionEditorModal: React.FC<CollectionEditorModalProps> = ({
  isOpen,
  onClose,
  collection,
  allPokemon,
  onSaveItems
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'standard' | 'mega' | 'form' | 'costume' | 'shadow'>('all');
  const [genFilter, setGenFilter] = useState<number | 'all'>('all');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize selected IDs from current collection items
  useEffect(() => {
    if (collection && isOpen) {
      const ids = storage.getCollectionItemIds(collection.id);
      if (ids.size > 0) {
        setSelectedIds(new Set(ids));
      } else {
        let matching = [...allPokemon];
        if (collection.categoryType === 'mega') {
          matching = matching.filter(p => p.category === 'mega' || p.isMega);
        } else if (collection.categoryType === 'event') {
          matching = matching.filter(p => p.category === 'costume' || p.isCostume);
        } else if (
          collection.categoryType === 'shadow' ||
          collection.categoryType === 'purified' ||
          collection.name.toLowerCase().includes('crypto') ||
          collection.name.toLowerCase().includes('shadow') ||
          collection.name.toLowerCase().includes('schatten')
        ) {
          matching = matching.filter(p => p.hasShadow);
          if (collection.variantMode === 'single') {
            matching = matching.filter(p => p.category === 'standard');
          } else {
            matching = matching.filter(p => p.category === 'standard' || p.category === 'form');
          }
        } else if (collection.variantMode === 'single') {
          matching = matching.filter(p => p.category === 'standard');
        } else {
          matching = matching.filter(p => {
            if (p.category === 'standard') return true;
            if (p.category === 'form' || p.isForm) {
              if (p.isGenderDifference && collection.includeGenderForms === false) return false;
              return true;
            }
            return false;
          });
        }
        if (collection.trackShiny) {
          matching = matching.filter(p => p.hasShiny);
        }
        setSelectedIds(new Set(matching.map(p => p.id)));
      }

      if (collection.categoryType === 'event') setCategoryFilter('costume');
      else if (collection.categoryType === 'mega') setCategoryFilter('mega');
      else if (collection.categoryType === 'shadow' || collection.categoryType === 'purified') setCategoryFilter('shadow');
    }
  }, [collection?.id, isOpen]);

  // Filtered Pokémon inside the picker
  const filteredList = useMemo(() => {
    let result = [...allPokemon];

    if (categoryFilter !== 'all') {
      if (categoryFilter === 'shadow') {
        result = result.filter(p => Boolean(p.hasShadow));
      } else if (categoryFilter === 'mega') {
        result = result.filter(p => p.category === 'mega' || p.isMega);
      } else if (categoryFilter === 'form') {
        result = result.filter(p => p.category === 'form' || p.isForm);
      } else if (categoryFilter === 'costume') {
        result = result.filter(p => p.category === 'costume' || p.isCostume);
      } else {
        result = result.filter(p => p.category === categoryFilter);
      }
    }

    if (genFilter !== 'all') {
      result = result.filter(p => p.generation === genFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const num = parseInt(q, 10);
      result = result.filter(p => {
        if (!isNaN(num) && p.dexNr === num) return true;
        if (p.name.toLowerCase().includes(q)) return true;
        if (p.formName && p.formName.toLowerCase().includes(q)) return true;
        return false;
      });
    }

    return result;
  }, [allPokemon, categoryFilter, genFilter, search]);

  if (!isOpen || !collection) return null;

  // Toggle individual card
  const toggleItem = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Bulk Actions
  const selectAllFiltered = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      filteredList.forEach(p => next.add(p.id));
      return next;
    });
  };

  const deselectAllFiltered = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      filteredList.forEach(p => next.delete(p.id));
      return next;
    });
  };

  const clearAll = () => {
    setSelectedIds(new Set());
  };

  // --- Quick Preset Handlers ---
  const applyPreset = (filterFn: (p: Pokemon) => boolean) => {
    const matchingIds = allPokemon.filter(filterFn).map(p => p.id);
    setSelectedIds(prev => {
      const next = new Set(prev);
      matchingIds.forEach(id => next.add(id));
      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveItems(collection.id, Array.from(selectedIds));
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 dark:bg-slate-950/85 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full shadow-sm"
              style={{ backgroundColor: collection.color || '#3b82f6' }}
            />
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Checkliste anpassen: <span className="text-blue-600 dark:text-blue-400">{collection.name}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Wähle genau aus, welche Pokémon und Kostümformen in dieser Liste vorhanden sein sollen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Templates Toolbar */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800/80 shrink-0 overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              Schnell-Vorlagen:
            </span>

            {/* Region Presets */}
            <button
              type="button"
              onClick={() => applyPreset(p => p.generation === 1)}
              className="px-2.5 py-1 bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-800 dark:text-red-300 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1"
            >
              🏛️ Kanto (151)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(p => p.generation === 2)}
              className="px-2.5 py-1 bg-amber-600/15 hover:bg-amber-600/25 border border-amber-600/40 text-amber-800 dark:text-amber-300 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1"
            >
              🌲 Johto (100)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(p => p.generation === 3)}
              className="px-2.5 py-1 bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-600/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1"
            >
              🌋 Hoenn (135)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(p => p.generation === 4)}
              className="px-2.5 py-1 bg-sky-600/15 hover:bg-sky-600/25 border border-sky-600/40 text-sky-800 dark:text-sky-300 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1"
            >
              ❄️ Sinnoh (107)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(p => p.generation === 5)}
              className="px-2.5 py-1 bg-slate-600/15 hover:bg-slate-600/25 border border-slate-600/40 text-slate-800 dark:text-slate-300 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1"
            >
              🏙️ Einall (156)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(p => p.generation === 6)}
              className="px-2.5 py-1 bg-violet-600/15 hover:bg-violet-600/25 border border-violet-600/40 text-violet-800 dark:text-violet-300 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1"
            >
              🥖 Kalos (72)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(p => p.generation === 7)}
              className="px-2.5 py-1 bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/40 text-orange-800 dark:text-orange-300 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1"
            >
              🌺 Alola (88)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(p => p.generation === 8)}
              className="px-2.5 py-1 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-600/40 text-blue-800 dark:text-blue-300 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1"
            >
              ⚔️ Galar (89)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(p => p.generation === 85)}
              className="px-2.5 py-1 bg-teal-600/15 hover:bg-teal-600/25 border border-teal-600/40 text-teal-800 dark:text-teal-300 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1"
            >
              🏔️ Hisui (6)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(p => p.generation === 9)}
              className="px-2.5 py-1 bg-purple-600/15 hover:bg-purple-600/25 border border-purple-600/40 text-purple-800 dark:text-purple-300 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1"
            >
              🍇 Paldea (120)
            </button>

            {/* Gender Difference Forms Preset */}
            <button
              type="button"
              onClick={() => applyPreset(p => Boolean(p.isGenderDifference))}
              className="px-2.5 py-1 bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/40 text-pink-800 dark:text-pink-300 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1"
            >
              ⚧ Geschlechts-Formen (101)
            </button>

            {/* Costumes Preset */}
            <button
              type="button"
              onClick={() => applyPreset(p => p.category === 'costume' || Boolean(p.isCostume))}
              className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1.5"
            >
              🎭 Alle Kostüme (295)
            </button>

            {/* Megas & Primals Preset */}
            <button
              type="button"
              onClick={() => applyPreset(p => p.category === 'mega' || p.isMega)}
              className="px-2.5 py-1 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1.5"
            >
              💥 Alle Megas (62)
            </button>

            {/* Vivillon Patterns Preset */}
            <button
              type="button"
              onClick={() => applyPreset(p => p.dexNr === 666)}
              className="px-2.5 py-1 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-800 dark:text-purple-300 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1.5"
            >
              🦋 Vivillon-Muster (20)
            </button>

            {/* Unown Forms Preset */}
            <button
              type="button"
              onClick={() => applyPreset(p => p.dexNr === 201)}
              className="px-2.5 py-1 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/40 text-indigo-800 dark:text-indigo-300 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1.5"
            >
              🔤 Icognito-Formen (28)
            </button>

            {/* Furfrou Trims Preset */}
            <button
              type="button"
              onClick={() => applyPreset(p => p.dexNr === 676)}
              className="px-2.5 py-1 bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/40 text-pink-800 dark:text-pink-300 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1.5"
            >
              🐩 Coiffwaff-Schnitte (10)
            </button>

            {/* Regional Forms Preset */}
            <button
              type="button"
              onClick={() => applyPreset(p => p.category === 'form' && (p.formName?.includes('Alolan') || p.formName?.includes('Galarian') || p.formName?.includes('Hisuian') || p.formName?.includes('Paldean')))}
              className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1.5"
            >
              🌴 Regionalformen
            </button>

            {/* Castform Preset */}
            <button
              type="button"
              onClick={() => applyPreset(p => p.dexNr === 351)}
              className="px-2.5 py-1 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-800 dark:text-cyan-300 text-xs font-semibold rounded-lg shrink-0 transition-all"
            >
              ☁️ Formeo-Formen (4)
            </button>

            {/* Deoxys Preset */}
            <button
              type="button"
              onClick={() => applyPreset(p => p.dexNr === 386)}
              className="px-2.5 py-1 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-teal-800 dark:text-teal-300 text-xs font-semibold rounded-lg shrink-0 transition-all"
            >
              👽 Deoxys-Formen (4)
            </button>
            {/* Crypto Preset */}
            <button
              type="button"
              onClick={() => applyPreset(p => Boolean(p.hasShadow))}
              className="px-2.5 py-1 bg-purple-600/15 hover:bg-purple-600/25 border border-purple-600/40 text-purple-800 dark:text-purple-300 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1.5"
            >
              💀 Alle Crypto ({allPokemon.filter(p => p.hasShadow).length || 458})
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Nach Name, #Dex oder Form filtern..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 py-1.5 px-3 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Alle Kategorien</option>
              <option value="standard">Standard Dex</option>
              <option value="mega">Megas & Primals</option>
              <option value="form">Formen & Varianten</option>
              <option value="costume">Kostüm-Pokémon</option>
              <option value="shadow">Crypto (Schatten)</option>
            </select>

            {/* Region / Generation Filter */}
            <select
              value={genFilter}
              onChange={(e) => setGenFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 py-1.5 px-3 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Alle Regionen</option>
              <option value={1}>Gen 1 · Kanto</option>
              <option value={2}>Gen 2 · Johto</option>
              <option value={3}>Gen 3 · Hoenn</option>
              <option value={4}>Gen 4 · Sinnoh</option>
              <option value={5}>Gen 5 · Einall</option>
              <option value={6}>Gen 6 · Kalos</option>
              <option value={7}>Gen 7 · Alola</option>
              <option value={8}>Gen 8 · Galar</option>
              <option value={85}>Hisui</option>
              <option value={9}>Gen 9 · Paldea</option>
              <option value={0}>Meltan</option>
            </select>
          </div>

          {/* Bulk Selection Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAllFiltered}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Gefilterte auswählen ({filteredList.length})
            </button>
            <button
              type="button"
              onClick={deselectAllFiltered}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Gefilterte abwählen
            </button>
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="px-2.5 py-1 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 text-xs font-semibold transition-colors"
              >
                Auswahl leeren
              </button>
            )}
          </div>
        </div>

        {/* Pokémon Selection Grid */}
        <div className="flex-1 p-6 overflow-y-auto min-h-0 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredList.map((pokemon) => {
              const isSelected = selectedIds.has(pokemon.id);
              return (
                <div
                  key={pokemon.id}
                  onClick={() => toggleItem(pokemon.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-2xl border cursor-pointer select-none transition-all ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 dark:border-blue-500/80 shadow-md ring-1 ring-blue-500/40'
                      : 'bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 shadow-sm dark:shadow-none'
                  }`}
                >
                  <img
                    src={collection.trackShiny ? (pokemon.shinySpriteUrl || pokemon.fallbackShinyUrl || pokemon.spriteUrl) : (pokemon.spriteUrl || pokemon.fallbackSpriteUrl || '')}
                    alt={pokemon.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 object-contain shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 block">
                      {formatDexNumber(pokemon.dexNr)}
                    </span>
                    <h4 className={`text-xs font-semibold truncate leading-tight ${isSelected ? 'text-blue-900 dark:text-white' : 'text-slate-800 dark:text-slate-300'}`}>
                      {pokemon.name}
                    </h4>
                    {pokemon.formName && pokemon.formName !== 'Standard' && (
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate block">
                        {pokemon.formName}
                      </span>
                    )}
                  </div>
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-transparent'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
              {selectedIds.size} <span className="text-slate-500 dark:text-slate-400 font-normal text-xs">Pokémon ausgewählt</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {isSaving ? 'Wird gespeichert...' : 'Auswahl speichern'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
