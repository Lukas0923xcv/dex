import React from 'react';
import { FilterState, StatusFilter, TrackingMode, CustomCollection } from '../types';
import { Search, X, Filter, ArrowUpDown, Check, RotateCcw } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  mode?: TrackingMode;
  collection?: CustomCollection | null;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  onMarkRegionCaught?: (generation: number | 'all', caught: boolean) => Promise<void>;
}

const GENERATIONS = [
  { id: 'all', label: 'All Gens' },
  { id: 1, label: 'Gen 1 · Kanto' },
  { id: 2, label: 'Gen 2 · Johto' },
  { id: 3, label: 'Gen 3 · Hoenn' },
  { id: 4, label: 'Gen 4 · Sinnoh' },
  { id: 5, label: 'Gen 5 · Unova' },
  { id: 6, label: 'Gen 6 · Kalos' },
  { id: 7, label: 'Gen 7 · Alola' },
  { id: 8, label: 'Gen 8 · Galar' },
  { id: 9, label: 'Gen 9 · Paldea' },
  { id: 0, label: 'Unbekannt · Meltan' },
];

const TYPES = [
  'All Types',
  'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice',
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
  'Rock', 'Ghost', 'Dragon', 'Steel', 'Dark', 'Fairy'
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  mode,
  collection,
  onFilterChange,
  onClearFilters,
  onMarkRegionCaught
}) => {
  const showFormsControls =
    mode === 'form' ||
    (mode === 'custom' &&
      Boolean(
        collection?.variantMode === 'multi' ||
        collection?.includeGenderForms
      ));

  const hasActiveFilters =
    filters.search !== '' ||
    filters.generation !== 'all' ||
    filters.type !== 'all' ||
    filters.status !== 'all' ||
    (showFormsControls && Boolean(filters.showGenderTracking)) ||
    (showFormsControls && Boolean(filters.includeBaseInForms));

  return (
    <div className="bg-white dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm dark:shadow-xl mb-6 space-y-4 transition-colors">
      {/* Top Search & Dropdown Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search by name, #dex, form, or type..."
            className="w-full pl-10 pr-9 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 focus:border-blue-500 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Released in Pokémon GO Availability Toggle */}
        <button
          type="button"
          onClick={() => onFilterChange({ releasedOnly: !filters.releasedOnly })}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all shrink-0 select-none ${
            filters.releasedOnly
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/80 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="Toggle to show only Pokémon currently released in Pokémon GO vs all 1025 National Pokédex species"
        >
          <span className={`w-2 h-2 rounded-full ${filters.releasedOnly ? 'bg-emerald-500 dark:bg-emerald-400 shadow-sm' : 'bg-slate-400 dark:bg-slate-500'}`} />
          <span>{filters.releasedOnly ? 'Released in GO' : 'All 1,025 Dex'}</span>
        </button>

        {/* Forms Mode: Gender Difference Forms & Include Base Form Toggles */}
        {showFormsControls && (
          <>
            <button
              type="button"
              onClick={() => onFilterChange({ showGenderTracking: !filters.showGenderTracking })}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all shrink-0 select-none cursor-pointer ${
                filters.showGenderTracking
                  ? 'bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-400/60 shadow-sm font-bold'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/80 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Weibliche Formen (♀) für Pokémon mit Geschlechtsunterschieden anzeigen"
            >
              <span className="font-bold text-sm leading-none">⚧</span>
              <span>Geschlechts-Formen</span>
            </button>

            <button
              type="button"
              onClick={() => onFilterChange({ includeBaseInForms: !filters.includeBaseInForms })}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all shrink-0 select-none cursor-pointer ${
                filters.includeBaseInForms
                  ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-400/60 shadow-sm font-bold'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/80 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Basis-Formen neben den regionalen/alternativen Formen anzeigen"
            >
              <span>👁️</span>
              <span>Basis-Formen</span>
            </button>
          </>
        )}

        {/* Status Quick Filter Chips */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 shrink-0">
          {(['all', 'caught', 'uncaught'] as StatusFilter[]).map((st) => (
            <button
              key={st}
              onClick={() => onFilterChange({ status: st })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filters.status === st
                  ? st === 'caught'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : st === 'uncaught'
                    ? 'bg-rose-600/90 text-white shadow-sm'
                    : 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Type Dropdown */}
        <div className="relative shrink-0">
          <select
            value={filters.type}
            onChange={(e) => onFilterChange({ type: e.target.value === 'All Types' ? 'all' : e.target.value })}
            className="w-full sm:w-auto appearance-none bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-sm text-slate-800 dark:text-slate-200 font-medium py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {TYPES.map((t) => (
              <option key={t} value={t === 'All Types' ? 'all' : t} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                {t}
              </option>
            ))}
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Sort Selector */}
        <div className="relative shrink-0">
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            className="w-full sm:w-auto appearance-none bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-sm text-slate-800 dark:text-slate-200 font-medium py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="dexAsc" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"># Number (Low to High)</option>
            <option value="dexDesc" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"># Number (High to Low)</option>
            <option value="nameAsc" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Name (A to Z)</option>
          </select>
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Clear Filters button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Generation Horizontal Pills & Bulk Region Completion Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin flex-1">
          {GENERATIONS.map((gen) => (
            <button
              key={gen.id}
              onClick={() => onFilterChange({ generation: gen.id as any })}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                filters.generation === gen.id
                  ? 'bg-blue-600 text-white font-semibold shadow-sm ring-1 ring-blue-400/50'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/40'
              }`}
            >
              {gen.label}
            </button>
          ))}
        </div>

        {/* Quick Bulk Region Completion Action */}
        {onMarkRegionCaught && (
          <div className="flex items-center gap-1.5 shrink-0 pl-1">
            <button
              type="button"
              onClick={() => {
                const regionName = filters.generation === 'all'
                  ? 'alle aktuell angezeigten Pokémon'
                  : `${GENERATIONS.find(g => g.id === filters.generation)?.label || 'Region'}`;
                if (window.confirm(`Möchtest du wirklich ${regionName} als GEFANGEN / ERLEDIGT markieren?`)) {
                  onMarkRegionCaught(filters.generation, true);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/80 text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer whitespace-nowrap"
              title={`Alle Pokémon dieser Region/Auswahl als gefangen markieren`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>
                {filters.generation === 'all'
                  ? 'Alle als erledigt'
                  : `${GENERATIONS.find(g => g.id === filters.generation)?.label?.split('·')[1]?.trim() || 'Region'} erledigt`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                const regionName = filters.generation === 'all'
                  ? 'alle aktuell angezeigten Pokémon'
                  : `${GENERATIONS.find(g => g.id === filters.generation)?.label || 'Region'}`;
                if (window.confirm(`Möchtest du ${regionName} als UNGEFANGEN zurücksetzen?`)) {
                  onMarkRegionCaught(filters.generation, false);
                }
              }}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 text-xs rounded-lg transition-all cursor-pointer shadow-xs"
              title="Region zurücksetzen / als ungefangen markieren"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
