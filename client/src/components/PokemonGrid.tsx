import React from 'react';
import { Pokemon, TrackingMode } from '../types';
import { PokemonCard } from './PokemonCard';
import { HelpCircle } from 'lucide-react';

interface PokemonGridProps {
  pokemonList: Pokemon[];
  mode: TrackingMode;
  onToggleCaught: (id: string) => void;
  onToggleShiny: (id: string) => void;
  onOpenAddModal: (pokemon: Pokemon) => void;
  onResetFilters?: () => void;
}

export const PokemonGrid: React.FC<PokemonGridProps> = ({
  pokemonList,
  mode,
  onToggleCaught,
  onToggleShiny,
  onOpenAddModal,
  onResetFilters
}) => {
  if (pokemonList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-900/40 border border-slate-800 rounded-3xl">
        <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mb-4 text-slate-500">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">No Pokémon Found</h3>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          No entries matched your current search filters or collection criteria.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-md transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
      {pokemonList.map((pokemon) => (
        <PokemonCard
          key={pokemon.id}
          pokemon={pokemon}
          mode={mode}
          onToggleCaught={onToggleCaught}
          onToggleShiny={onToggleShiny}
          onOpenAddModal={onOpenAddModal}
        />
      ))}
    </div>
  );
};
