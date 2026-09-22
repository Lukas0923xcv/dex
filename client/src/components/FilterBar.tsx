import React from 'react';
import { FilterState, StatusFilter, TrackingMode, CustomCollection } from '../types';
import { Search, X, Check, RotateCcw, Sparkles, Flame, ArrowUpDown, Compass } from 'lucide-react';

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
  { id: 85, label: 'Hisui' },
  { id: 9, label: 'Gen 9 · Paldea' },
  { id: 0, label: 'Unknown · Meltan' },
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
    filters.status !== 'all' ||
    (Boolean(filters.availability) && filters.availability !== 'all') ||
    filters.sortBy !== 'dexAsc' ||
    Boolean(filters.shinyOnly) ||
    Boolean(filters.shadowOnly) ||
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

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-2xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <label htmlFor="dex-sort-by" className="sr-only">Sort By</label>
          <select
            id="dex-sort-by"
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer pr-1"
          >
            <option value="dexAsc" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"># Number (Asc)</option>
            <option value="dexDesc" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"># Number (Desc)</option>
            <option value="nameAsc" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Name (A–Z)</option>
          </select>
        </div>

        {/* Availability Filter Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-2xs">
          <Compass className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <label htmlFor="dex-availability-filter" className="sr-only">Filter by Availability</label>
          <select
            id="dex-availability-filter"
            value={filters.availability || 'all'}
            onChange={(e) => onFilterChange({ availability: e.target.value as any })}
            className={`bg-transparent text-xs font-semibold focus:outline-none cursor-pointer pr-1 ${
              filters.availability && filters.availability !== 'all'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <option value="all" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">All Availability</option>
            <option value="wild" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Standard Wild</option>
            <option value="biome" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Biome Exclusive</option>
            <option value="regional" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Regional Exclusive</option>
            <option value="raid" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Raid Exclusive</option>
            <option value="egg" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Egg Exclusive</option>
            <option value="evolution" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Evolution Only</option>
            <option value="research" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Special Research</option>
            <option value="event" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Event Exclusive</option>
            <option value="costume" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Event Costume</option>
            <option value="special" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Special Mechanics</option>
          </select>
        </div>


        {/* Shiny Only Toggle (in shiny mode it's already full shiny) */}
        {mode !== 'shiny' && (
          <button
            type="button"
            onClick={() => onFilterChange({ shinyOnly: !filters.shinyOnly })}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all shrink-0 select-none cursor-pointer ${
              filters.shinyOnly
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400/60 shadow-sm font-bold'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/80 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Show only Pokémon whose shiny form is released in Pokémon GO"
          >
            <Sparkles className={`w-3.5 h-3.5 ${filters.shinyOnly ? 'text-amber-500' : 'text-slate-400'}`} />
            <span>Shiny Only</span>
          </button>
        )}

        {/* Shadow Only Toggle */}
        {mode !== 'shadow' && (
          <button
            type="button"
            onClick={() => onFilterChange({ shadowOnly: !filters.shadowOnly })}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all shrink-0 select-none cursor-pointer ${
              filters.shadowOnly
                ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-400/60 shadow-sm font-bold'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/80 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Show only Pokémon that have a shadow version in Pokémon GO (483 species)"
          >
            <Flame className={`w-3.5 h-3.5 ${filters.shadowOnly ? 'text-purple-500' : 'text-slate-400'}`} />
            <span>Shadow Only</span>
          </button>
        )}

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
              title="Show female forms (♀) for Pokémon with gender differences"
            >
              <span className="font-bold text-sm leading-none">⚧</span>
              <span>Gender Differences</span>
            </button>

            <button
              type="button"
              onClick={() => onFilterChange({ includeBaseInForms: !filters.includeBaseInForms })}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all shrink-0 select-none cursor-pointer ${
                filters.includeBaseInForms
                  ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-400/60 shadow-sm font-bold'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/80 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Show base forms for regional variants"
            >
              <span>👁️</span>
              <span>Base Forms</span>
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
                  ? 'all currently displayed Pokémon'
                  : `${GENERATIONS.find(g => g.id === filters.generation)?.label || 'Region'}`;
                if (window.confirm(`Are you sure you want to mark ${regionName} as CAUGHT?`)) {
                  onMarkRegionCaught(filters.generation, true);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/80 text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer whitespace-nowrap"
              title={`Mark all Pokémon in this region/selection as caught`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>
                {filters.generation === 'all'
                  ? 'Mark all caught'
                  : `${(() => {
                      const genLabel = GENERATIONS.find(g => g.id === filters.generation)?.label;
                      if (!genLabel) return 'Region';
                      return genLabel.includes('·') ? genLabel.split('·')[1].trim() : genLabel;
                    })()} caught`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                const regionName = filters.generation === 'all'
                  ? 'all currently displayed Pokémon'
                  : `${GENERATIONS.find(g => g.id === filters.generation)?.label || 'Region'}`;
                if (window.confirm(`Are you sure you want to reset ${regionName} to UNCAUGHT?`)) {
                  onMarkRegionCaught(filters.generation, false);
                }
              }}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 text-xs rounded-lg transition-all cursor-pointer shadow-xs"
              title="Reset region / mark as uncaught"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
