import React, { useState } from 'react';
import { Pokemon, TrackingMode } from '../types';
import { getTypeBadgeColor, formatDexNumber, getEffectiveSprite } from '../utils/typeColors';
import { Check, Sparkles, Plus, Bookmark } from 'lucide-react';

interface PokemonCardProps {
  pokemon: Pokemon;
  mode: TrackingMode;
  onToggleCaught: (id: string) => void;
  onToggleShiny: (id: string) => void;
  onOpenAddModal: (pokemon: Pokemon) => void;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  mode,
  onToggleCaught,
  onToggleShiny,
  onOpenAddModal
}) => {
  const isShinyMode = mode === 'shiny';
  const isCaught = isShinyMode ? Boolean(pokemon.shinyCaught) : Boolean(pokemon.caught);
  const [spriteErrorIndex, setSpriteErrorIndex] = useState(0);

  // Cascade fallback: pogo icon -> home 3d -> official artwork
  const spriteCandidates = [
    getEffectiveSprite(pokemon, isShinyMode),
    isShinyMode ? pokemon.fallbackShinyUrl : pokemon.fallbackSpriteUrl,
    pokemon.officialArtworkUrl
  ].filter(Boolean) as string[];

  const currentSprite = spriteCandidates[spriteErrorIndex] || spriteCandidates[0] || '';

  const handleImageError = () => {
    if (spriteErrorIndex < spriteCandidates.length - 1) {
      setSpriteErrorIndex(prev => prev + 1);
    }
  };

  return (
    <div
      onClick={() => onToggleCaught(pokemon.id)}
      className={`pokemon-card group relative flex flex-col justify-between p-3 rounded-2xl border transition-all duration-200 cursor-pointer select-none overflow-hidden ${
        isCaught
          ? isShinyMode
            ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
            : 'bg-gradient-to-b from-emerald-950/30 via-slate-900 to-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
          : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
      }`}
    >
      {/* Top Bar: Dex #, Badges & Action Icons */}
      <div className="flex items-center justify-between gap-1 mb-1 z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono font-semibold text-slate-400">
            {formatDexNumber(pokemon.dexNr)}
          </span>
          {pokemon.formName && pokemon.formName !== 'Standard' && (
            <span className="text-[10px] font-medium tracking-tight bg-slate-800/90 text-slate-300 border border-slate-700/80 px-1.5 py-0.5 rounded-md truncate max-w-[80px]">
              {pokemon.formName}
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          {/* Add to collection button */}
          <button
            type="button"
            title="Add to Custom Collection"
            onClick={(e) => {
              e.stopPropagation();
              onOpenAddModal(pokemon);
            }}
            className={`p-1 rounded-md transition-colors ${
              pokemon.inCollection
                ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                : 'text-slate-500 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            {pokemon.inCollection ? <Bookmark className="w-3.5 h-3.5 fill-current" /> : <Plus className="w-3.5 h-3.5" />}
          </button>

          {/* Shiny toggle button (if not in shiny mode) */}
          {!isShinyMode && pokemon.hasShiny && (
            <button
              type="button"
              title={pokemon.shinyCaught ? 'Shiny caught!' : 'Mark shiny caught'}
              onClick={(e) => {
                e.stopPropagation();
                onToggleShiny(pokemon.id);
              }}
              className={`p-1 rounded-md transition-colors ${
                pokemon.shinyCaught
                  ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                  : 'text-slate-500 hover:text-amber-300 hover:bg-slate-700/50'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${pokemon.shinyCaught ? 'fill-current' : ''}`} />
            </button>
          )}

          {/* Caught Checkmark Badge */}
          {isCaught && (
            <div className={`p-0.5 rounded-full ${isShinyMode ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'}`}>
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          )}
        </div>
      </div>

      {/* Pokémon Sprite */}
      <div className="relative flex items-center justify-center my-2 h-28">
        {/* Glow backdrop when caught */}
        {isCaught && (
          <div
            className={`absolute inset-4 rounded-full blur-xl opacity-30 ${
              isShinyMode ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
          />
        )}

        <img
          src={currentSprite}
          alt={pokemon.name}
          loading="lazy"
          decoding="async"
          onError={handleImageError}
          className={`pokemon-sprite object-contain h-24 w-24 max-h-full max-w-full z-10 transition-all duration-300 ${
            !isCaught ? 'grayscale contrast-75 brightness-75 opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:contrast-100 group-hover:brightness-100' : ''
          }`}
        />
      </div>

      {/* Bottom Info: Name and Type Pills */}
      <div className="mt-1 pt-1 border-t border-slate-800/80">
        <h3 className={`text-sm font-semibold truncate leading-snug mb-1.5 transition-colors ${
          isCaught ? 'text-white' : 'text-slate-300 group-hover:text-white'
        }`}>
          {pokemon.name}
        </h3>

        <div className="flex items-center gap-1 flex-wrap">
          {/* Primary Type */}
          {pokemon.type1 && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm border ${
                getTypeBadgeColor(pokemon.type1).bg
              } ${getTypeBadgeColor(pokemon.type1).text} ${getTypeBadgeColor(pokemon.type1).border}`}
            >
              {pokemon.type1}
            </span>
          )}

          {/* Secondary Type */}
          {pokemon.type2 && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm border ${
                getTypeBadgeColor(pokemon.type2).bg
              } ${getTypeBadgeColor(pokemon.type2).text} ${getTypeBadgeColor(pokemon.type2).border}`}
            >
              {pokemon.type2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
