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
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'standard' | 'mega' | 'form' | 'costume'>('all');
  const [genFilter, setGenFilter] = useState<number | 'all'>('all');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize selected IDs from current collection items
  useEffect(() => {
    if (collection && isOpen) {
      let ids = storage.getCollectionItemIds(collection.id);
      if (ids.size === 0) {
        let matching = [...allPokemon];
        if (collection.categoryType === 'mega') {
          matching = matching.filter(p => p.category === 'mega' || p.isMega);
        } else if (collection.categoryType === 'event') {
          matching = matching.filter(p => p.category === 'costume' || p.isCostume);
        } else if (collection.variantMode === 'single') {
          matching = matching.filter(p => p.category === 'standard');
        } else {
          matching = matching.filter(p => p.category === 'standard' || p.category === 'form');
        }
        if (collection.trackShiny && collection.categoryType === 'normal') {
          matching = matching.filter(p => p.hasShiny);
        }
        ids = new Set(matching.map(p => p.id));
      }
      setSelectedIds(new Set(ids));

      if (collection.categoryType === 'event') setCategoryFilter('costume');
      else if (collection.categoryType === 'mega') setCategoryFilter('mega');
    }
  }, [collection, isOpen, allPokemon]);

  // Filtered Pokémon inside the picker
  const filteredList = useMemo(() => {
    let result = [...allPokemon];

    if (categoryFilter !== 'all') {
      if (categoryFilter === 'mega') {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full shadow-sm"
              style={{ backgroundColor: collection.color || '#3b82f6' }}
            />
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Checkliste anpassen: <span className="text-blue-400">{collection.name}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Wähle genau aus, welche Pokémon und Kostümformen in dieser Liste vorhanden sein sollen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Templates Toolbar */}
        <div className="px-6 py-3 bg-slate-900/90 border-b border-slate-800/80 shrink-0 overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Schnell-Vorlagen:
            </span>

            {/* Costumes Preset */}
            <button
              type="button"
              onClick={() => applyPreset(p => p.category === 'costume' || Boolean(p.isCostume))}
              className="px-2.5 py-1 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 hover:border-amber-400 text-amber-300 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1.5"
            >
              🎭 Alle Kostüme (297)
            </button>

            {/* Megas & Primals Preset */}
            <button
              type="button"
              onClick={() => applyPreset(p => p.category === 'mega' || p.isMega)}
              className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 hover:border-rose-400 text-rose-300 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1.5"
            >
              💥 Alle Megas (62)
            </button>

            {/* Vivillon Patterns Preset */}
            <button
              type="button"
              onClick={() => applyPreset(p => p.dexNr === 666)}
              className="px-2.5 py-1 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 hover:border-purple-400 text-purple-300 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1.5"
            >
              🦋 Vivillon-Muster (20)
            </button>

            {/* Unown Forms Preset */}
            <button
              type="button"
              onClick={() => applyPreset(p => p.dexNr === 201)}
              className="px-2.5 py-1 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/40 hover:border-indigo-400 text-indigo-300 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1.5"
            >
              🔤 Icognito-Formen (28)
            </button>

            {/* Furfrou Trims Preset */}
            <button
              type="button"
              onClick={() => applyPreset(p => p.dexNr === 676)}
              className="px-2.5 py-1 bg-pink-950/40 hover:bg-pink-900/60 border border-pink-500/40 hover:border-pink-400 text-pink-300 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1.5"
            >
              🐩 Coiffwaff-Schnitte (10)
            </button>

            {/* Regional Forms Preset */}
            <button
              type="button"
              onClick={() => applyPreset(p => p.category === 'form' && (p.formName?.includes('Alolan') || p.formName?.includes('Galarian') || p.formName?.includes('Hisuian') || p.formName?.includes('Paldean')))}
              className="px-2.5 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 text-xs font-semibold rounded-lg shrink-0 transition-all flex items-center gap-1.5"
            >
              🌴 Regionalformen
            </button>

            {/* Castform Preset */}
            <button
              type="button"
              onClick={() => applyPreset(p => p.dexNr === 351)}
              className="px-2.5 py-1 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-semibold rounded-lg shrink-0 transition-all"
            >
              ☁️ Formeo-Formen (4)
            </button>

            {/* Deoxys Preset */}
            <button
              type="button"
              onClick={() => applyPreset(p => p.dexNr === 386)}
              className="px-2.5 py-1 bg-teal-950/40 hover:bg-teal-900/60 border border-teal-500/40 hover:border-teal-400 text-teal-300 text-xs font-semibold rounded-lg shrink-0 transition-all"
            >
              👽 Deoxys-Formen (4)
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Nach Name, #Dex oder Form filtern..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 py-1.5 px-3 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Alle Kategorien</option>
              <option value="standard">Standard Dex</option>
              <option value="mega">Megas & Primals</option>
              <option value="form">Formen & Varianten</option>
              <option value="costume">Kostüm-Pokémon</option>
            </select>
          </div>

          {/* Bulk Selection Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAllFiltered}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              Gefilterte auswählen ({filteredList.length})
            </button>
            <button
              type="button"
              onClick={deselectAllFiltered}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              Gefilterte abwählen
            </button>
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="px-2.5 py-1 text-rose-400 hover:text-rose-300 text-xs font-semibold transition-colors"
              >
                Auswahl leeren
              </button>
            )}
          </div>
        </div>

        {/* Pokémon Selection Grid */}
        <div className="flex-1 p-6 overflow-y-auto min-h-0 bg-slate-950/40">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredList.map((pokemon) => {
              const isSelected = selectedIds.has(pokemon.id);
              return (
                <div
                  key={pokemon.id}
                  onClick={() => toggleItem(pokemon.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-2xl border cursor-pointer select-none transition-all ${
                    isSelected
                      ? 'bg-blue-950/50 border-blue-500/80 shadow-md ring-1 ring-blue-500/40'
                      : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <img
                    src={pokemon.spriteUrl}
                    alt={pokemon.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 object-contain shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-slate-400 block">
                      {formatDexNumber(pokemon.dexNr)}
                    </span>
                    <h4 className={`text-xs font-semibold truncate leading-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {pokemon.name}
                    </h4>
                    {pokemon.formName && pokemon.formName !== 'Standard' && (
                      <span className="text-[9px] text-slate-400 truncate block">
                        {pokemon.formName}
                      </span>
                    )}
                  </div>
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'border-slate-700 bg-slate-800 text-transparent'
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
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-white tabular-nums">
              {selectedIds.size} <span className="text-slate-400 font-normal text-xs">Pokémon ausgewählt</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition-colors"
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
