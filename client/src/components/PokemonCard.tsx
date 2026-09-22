import React, { useState, useEffect } from 'react';
import { Pokemon, TrackingMode, CustomCollection } from '../types';
import { getTypeBadgeColor, formatDexNumber, getEffectiveSprite } from '../utils/typeColors';
import { Check, Sparkles, Plus, Bookmark, Flame, Zap, Info } from 'lucide-react';

interface PokemonCardProps {
  pokemon: Pokemon;
  mode: TrackingMode;
  collection?: CustomCollection | null;
  showGenderTracking?: boolean;
  shinyOnly?: boolean;
  onToggleCaught: (id: string) => void;
  onToggleShiny: (id: string) => void;
  onToggleFeature?: (
    id: string,
    type: 'caught' | 'shiny' | 'lucky' | 'hundo' | 'shadow' | 'purified' | 'gender_m' | 'gender_f' | 'xxl' | 'xxs'
  ) => void;
  onOpenAddModal: (pokemon: Pokemon) => void;
  onOpenDetailModal?: (pokemon: Pokemon) => void;
}

export const PokemonCard: React.FC<PokemonCardProps> = React.memo(({
  pokemon,
  mode,
  collection,
  showGenderTracking,
  shinyOnly,
  onToggleCaught,
  onToggleShiny,
  onToggleFeature,
  onOpenAddModal,
  onOpenDetailModal
}) => {
  const isCustomMode = mode === 'custom';
  const isShadowCollection = Boolean(collection?.categoryType === 'shadow' || collection?.name.toLowerCase().includes('crypto') || collection?.name.toLowerCase().includes('shadow'));
  const categoryType = isCustomMode ? (isShadowCollection ? 'shadow' : (collection?.categoryType || 'normal')) : (mode === 'shadow' ? 'shadow' : 'normal');
  const isShinyMode = mode === 'shiny' || Boolean(isCustomMode && collection?.trackShiny) || Boolean(shinyOnly);

  // Determine caught state based on active context
  let isCaught = false;
  if (isShinyMode) {
    isCaught = Boolean(pokemon.shinyCaught);
  } else if (mode === 'shadow' || categoryType === 'shadow' || (isCustomMode && isShadowCollection)) {
    isCaught = Boolean(pokemon.shadowCaught);
  } else if (isCustomMode && categoryType === 'purified') {
    isCaught = Boolean(pokemon.purifiedCaught);
  } else if (isCustomMode && categoryType === 'lucky') {
    isCaught = Boolean(pokemon.luckyCaught);
  } else {
    isCaught = Boolean(pokemon.caught);
  }

  const [spriteErrorIndex, setSpriteErrorIndex] = useState(0);

  useEffect(() => {
    setSpriteErrorIndex(0);
  }, [pokemon.id, isShinyMode]);

  // Cascade fallback: pogo icon -> home 3d -> official artwork
  const spriteCandidates = [
    getEffectiveSprite(pokemon, Boolean(isShinyMode)),
    isShinyMode ? pokemon.fallbackShinyUrl : pokemon.fallbackSpriteUrl,
    pokemon.officialArtworkUrl
  ].filter(Boolean) as string[];

  const currentSprite = spriteCandidates[spriteErrorIndex] || spriteCandidates[0] || '';

  const handleImageError = () => {
    if (spriteErrorIndex < spriteCandidates.length - 1) {
      setSpriteErrorIndex(prev => prev + 1);
    }
  };

  // Card theme styling
  const getCardStyle = () => {
    if (!isCaught) {
      return 'bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm dark:shadow-none opacity-85 hover:opacity-100';
    }

    if (categoryType === 'shadow') {
      return 'bg-gradient-to-b from-purple-100/60 via-white to-white dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-900 border-purple-500/60 shadow-md shadow-purple-500/10 ring-1 ring-purple-500/30';
    }
    if (categoryType === 'purified') {
      return 'bg-gradient-to-b from-cyan-100/60 via-white to-white dark:from-cyan-950/40 dark:via-slate-900 dark:to-slate-900 border-cyan-500/60 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/30';
    }
    if (categoryType === 'lucky') {
      return 'bg-gradient-to-b from-amber-100/60 via-white to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 border-amber-500/60 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30';
    }
    if (isShinyMode) {
      return 'bg-gradient-to-b from-amber-100/60 via-white to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 border-amber-500/60 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30';
    }

    return 'bg-gradient-to-b from-emerald-100/60 via-white to-white dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 border-emerald-500/50 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30';
  };

  const getGlowColor = () => {
    if (categoryType === 'shadow') return 'bg-purple-600';
    if (categoryType === 'purified') return 'bg-cyan-400';
    if (categoryType === 'lucky' || isShinyMode) return 'bg-amber-400';
    return 'bg-emerald-400';
  };

  const getBadgeStyle = () => {
    if (categoryType === 'shadow') return 'bg-purple-600 text-white';
    if (categoryType === 'purified') return 'bg-cyan-500 text-slate-950';
    if (categoryType === 'lucky' || isShinyMode) return 'bg-amber-500 text-slate-950';
    return 'bg-emerald-500 text-slate-950';
  };

  const showGender = Boolean(showGenderTracking || (isCustomMode && collection?.trackGender));
  const showFeatureStrip = Boolean(
    showGender || (isCustomMode && (collection?.trackHundo || collection?.trackSize))
  );

  const isShadowContext = mode === 'shadow' || categoryType === 'shadow' || (isCustomMode && isShadowCollection);
  const canBeShiny = isShadowContext ? Boolean(pokemon.hasShadowShiny) : Boolean(pokemon.hasShiny);

  return (
    <div
      onClick={() => onToggleCaught(pokemon.id)}
      className={`pokemon-card group relative flex flex-col justify-between p-3 rounded-2xl border transition-all duration-200 cursor-pointer select-none overflow-hidden ${getCardStyle()}`}
    >
      {/* Top Bar: Dex #, Badges & Action Icons */}
      <div className="flex items-center justify-between gap-1 mb-1 z-10">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
            {formatDexNumber(pokemon.dexNr)}
          </span>
          {pokemon.formName && pokemon.formName !== 'Standard' && (
            <span
              title={pokemon.formName}
              className="text-[10px] font-medium tracking-tight bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 px-1.5 py-0.5 rounded-md truncate max-w-[120px]"
            >
              {pokemon.formName}
            </span>
          )}
          {(mode === 'shadow' || categoryType === 'shadow') && (
            <span className="text-[10px] font-bold tracking-tight bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700/80 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs">
              <Flame className="w-2.5 h-2.5 fill-current text-purple-600 dark:text-purple-400" />
              Shadow
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          {/* Info button */}
          {onOpenDetailModal && (
            <button
              type="button"
              title="Pokémon Info & Availability"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetailModal(pokemon);
              }}
              className="p-1 rounded-md transition-colors text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700/50"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Add to custom collection button */}
          <button
            type="button"
            title="Add to Custom Collection"
            onClick={(e) => {
              e.stopPropagation();
              onOpenAddModal(pokemon);
            }}
            className={`p-1 rounded-md transition-colors ${
              pokemon.inCollection
                ? 'text-amber-500 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            {pokemon.inCollection ? <Bookmark className="w-3.5 h-3.5 fill-current" /> : <Plus className="w-3.5 h-3.5" />}
          </button>

          {/* Shiny toggle button (only if shiny is possible in current context) */}
          {!isShinyMode && canBeShiny && (
            <button
              type="button"
              title={
                pokemon.shinyCaught
                  ? (isShadowContext ? 'Shadow Shiny caught!' : 'Shiny caught!')
                  : (isShadowContext ? 'Mark Shadow Shiny caught' : 'Mark shiny caught')
              }
              onClick={(e) => {
                e.stopPropagation();
                onToggleShiny(pokemon.id);
              }}
              className={`p-1 rounded-md transition-colors ${
                pokemon.shinyCaught
                  ? 'text-amber-500 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                  : 'text-slate-400 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${pokemon.shinyCaught ? 'fill-current' : ''}`} />
            </button>
          )}

          {/* Shadow toggle button (if not in shadow mode, but pokemon has shadow) */}
          {mode !== 'shadow' && categoryType !== 'shadow' && pokemon.hasShadow && (
            <button
              type="button"
              title={pokemon.shadowCaught ? 'Shadow caught!' : 'Mark as Shadow'}
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleFeature) {
                  onToggleFeature(pokemon.id, 'shadow');
                }
              }}
              className={`p-1 rounded-md transition-colors ${
                pokemon.shadowCaught
                  ? 'text-purple-500 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20'
                  : 'text-slate-400 dark:text-slate-500 hover:text-purple-500 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${pokemon.shadowCaught ? 'fill-current' : ''}`} />
            </button>
          )}

          {/* Caught Checkmark Badge */}
          {isCaught && (
            <div className={`p-0.5 rounded-full ${getBadgeStyle()}`}>
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          )}
        </div>
      </div>

      {/* Feature Toggles Strip (Hundo, Gender, Size) */}
      {showFeatureStrip && (
        <div className="flex items-center gap-1 mb-1 z-10 flex-wrap" onClick={(e) => e.stopPropagation()}>
          {/* Hundo Badge */}
          {isCustomMode && collection?.trackHundo && (
            <button
              type="button"
              title={pokemon.hundoCaught ? '100% IV caught!' : 'Mark as 100% IV'}
              onClick={() => onToggleFeature && onToggleFeature(pokemon.id, 'hundo')}
              className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-tight border transition-colors ${
                pokemon.hundoCaught
                  ? 'bg-rose-500/25 text-rose-600 dark:text-rose-300 border-rose-500/70 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700/60 hover:text-rose-600 dark:hover:text-rose-300'
              }`}
            >
              100%
            </button>
          )}

          {/* Gender Badges */}
          {showGender && (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                title={pokemon.genderMCaught ? '♂ Male caught!' : 'Mark as ♂ Male'}
                onClick={() => onToggleFeature && onToggleFeature(pokemon.id, 'gender_m')}
                className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold border transition-colors ${
                  pokemon.genderMCaught
                    ? 'bg-blue-100 text-blue-700 border-blue-400 dark:bg-blue-500/30 dark:text-blue-300 dark:border-blue-400 shadow-sm font-black'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700/60 hover:text-blue-600 dark:hover:text-blue-300'
                }`}
              >
                ♂
              </button>
              <button
                type="button"
                title={pokemon.genderFCaught ? '♀ Female caught!' : 'Mark as ♀ Female'}
                onClick={() => onToggleFeature && onToggleFeature(pokemon.id, 'gender_f')}
                className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold border transition-colors ${
                  pokemon.genderFCaught
                    ? 'bg-pink-100 text-pink-700 border-pink-400 dark:bg-pink-500/30 dark:text-pink-300 dark:border-pink-400 shadow-sm font-black'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700/60 hover:text-pink-600 dark:hover:text-pink-300'
                }`}
              >
                ♀
              </button>
            </div>
          )}

          {/* Size Badges */}
          {isCustomMode && collection?.trackSize && (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                title={pokemon.xxsCaught ? 'XXS caught!' : 'Mark as XXS'}
                onClick={() => onToggleFeature && onToggleFeature(pokemon.id, 'xxs')}
                className={`px-1 py-0.2 rounded text-[8px] font-bold border transition-colors ${
                  pokemon.xxsCaught
                    ? 'bg-amber-100 text-amber-700 border-amber-400 dark:bg-amber-500/30 dark:text-amber-300 dark:border-amber-400 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700/60 hover:text-amber-600 dark:hover:text-amber-300'
                }`}
              >
                XXS
              </button>
              <button
                type="button"
                title={pokemon.xxlCaught ? 'XXL caught!' : 'Mark as XXL'}
                onClick={() => onToggleFeature && onToggleFeature(pokemon.id, 'xxl')}
                className={`px-1 py-0.2 rounded text-[8px] font-bold border transition-colors ${
                  pokemon.xxlCaught
                    ? 'bg-amber-100 text-amber-700 border-amber-400 dark:bg-amber-500/30 dark:text-amber-300 dark:border-amber-400 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700/60 hover:text-amber-600 dark:hover:text-amber-300'
                }`}
              >
                XXL
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pokémon Sprite */}
      <div className="relative flex items-center justify-center my-2 h-28">
        {/* Glow backdrop when caught */}
        {isCaught && (
          <div
            className={`absolute inset-4 rounded-full blur-xl opacity-30 ${getGlowColor()}`}
          />
        )}

        <img
          src={currentSprite}
          alt={pokemon.name}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={handleImageError}
          className={`pokemon-sprite object-contain h-24 w-24 max-h-full max-w-full z-10 transition-all duration-300 ${
            !isCaught
              ? 'grayscale contrast-75 brightness-75 opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:contrast-100 group-hover:brightness-100'
              : ''
          }`}
        />
      </div>

      {/* Bottom Info: Name and Type Pills */}
      <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-800/80">
        <h3
          title={pokemon.name}
          className={`text-sm font-semibold truncate leading-snug mb-1.5 transition-colors ${
            isCaught
              ? 'text-slate-900 dark:text-white font-bold'
              : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
          }`}
        >
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
});
