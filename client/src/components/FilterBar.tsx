import React from 'react';
import { FilterState, StatusFilter } from '../types';
import { Search, X, Filter, ArrowUpDown } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
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
  onFilterChange,
  onClearFilters
}) => {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.generation !== 'all' ||
    filters.type !== 'all' ||
    filters.status !== 'all';

  return (
    <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-4 shadow-xl mb-6 space-y-4">
      {/* Top Search & Dropdown Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search by name, #dex, form, or type..."
            className="w-full pl-10 pr-9 py-2 bg-slate-800/80 border border-slate-700/80 focus:border-blue-500 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
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
              ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 shadow-sm'
              : 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:text-slate-200'
          }`}
          title="Toggle to show only Pokémon currently released in Pokémon GO vs all 1025 National Pokédex species"
        >
          <span className={`w-2 h-2 rounded-full ${filters.releasedOnly ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-500'}`} />
          <span>{filters.releasedOnly ? 'Released in GO' : 'All 1,025 Dex'}</span>
        </button>

        {/* Status Quick Filter Chips */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 shrink-0">
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
                  : 'text-slate-400 hover:text-slate-200'
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
            className="w-full sm:w-auto appearance-none bg-slate-800/80 border border-slate-700/80 text-sm text-slate-200 font-medium py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {TYPES.map((t) => (
              <option key={t} value={t === 'All Types' ? 'all' : t} className="bg-slate-900 text-slate-200">
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
            className="w-full sm:w-auto appearance-none bg-slate-800/80 border border-slate-700/80 text-sm text-slate-200 font-medium py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="dexAsc" className="bg-slate-900 text-slate-200"># Number (Low to High)</option>
            <option value="dexDesc" className="bg-slate-900 text-slate-200"># Number (High to Low)</option>
            <option value="nameAsc" className="bg-slate-900 text-slate-200">Name (A to Z)</option>
          </select>
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Clear Filters button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/60 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Generation Horizontal Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {GENERATIONS.map((gen) => (
          <button
            key={gen.id}
            onClick={() => onFilterChange({ generation: gen.id as any })}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filters.generation === gen.id
                ? 'bg-blue-600/90 text-white font-semibold shadow-sm ring-1 ring-blue-400/50'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/40'
            }`}
          >
            {gen.label}
          </button>
        ))}
      </div>
    </div>
  );
};
