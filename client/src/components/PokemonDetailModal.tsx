import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Pokemon, TrackingMode, CustomCollection } from '../types';
import { PokemonDetailInfo, ObtainMethodDetail, DexAlternativeMethod } from '../types/pokemonInfo';
import { getPokemonDetailInfo } from '../data/pokemonObtainData';
import { getTypeBadgeColor, getEffectiveSprite } from '../utils/typeColors';
import { compareFormsWithinSpecies } from '../utils/formSorting';
import {
  X, ChevronLeft, ChevronRight, Sparkles, Check, Flame, MapPin,
  Globe, Swords, Egg, Binoculars, Star, Shuffle, AlertCircle, Info,
  Navigation, ExternalLink, Compass, Ticket
} from 'lucide-react';

interface PokemonDetailModalProps {
  pokemon: Pokemon | null;
  allPokemon: Pokemon[];
  mode: TrackingMode;
  collection?: CustomCollection | null;
  onClose: () => void;
  onNavigate: (pokemon: Pokemon) => void;
  onToggleCaught: (id: string) => void;
  onToggleShiny: (id: string) => void;
  onToggleFeature?: (id: string, type: 'caught' | 'shiny' | 'lucky' | 'hundo' | 'shadow' | 'purified' | 'gender_m' | 'gender_f' | 'xxl' | 'xxs') => void;
}

function formatDexNumber(n: number): string {
  return `#${String(n).padStart(4, '0')}`;
}

const OBTAIN_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  wild:            { icon: <Binoculars className="w-3.5 h-3.5" />, color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/50', border: 'border-emerald-300 dark:border-emerald-700' },
  egg:             { icon: <Egg className="w-3.5 h-3.5" />, color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/50', border: 'border-amber-300 dark:border-amber-700' },
  egg_exclusive:   { icon: <Egg className="w-3.5 h-3.5" />, color: 'text-amber-800 dark:text-amber-300', bg: 'bg-amber-100/70 dark:bg-amber-950/60', border: 'border-amber-400 dark:border-amber-600' },
  raid:            { icon: <Swords className="w-3.5 h-3.5" />, color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/50', border: 'border-rose-300 dark:border-rose-700' },
  research:        { icon: <Star className="w-3.5 h-3.5" />, color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-950/50', border: 'border-blue-300 dark:border-blue-700' },
  paid_research:   { icon: <Ticket className="w-3.5 h-3.5" />, color: 'text-amber-800 dark:text-amber-200', bg: 'bg-amber-100 dark:bg-amber-950/80', border: 'border-amber-400 dark:border-amber-600' },
  rocket:          { icon: <Flame className="w-3.5 h-3.5" />, color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-50 dark:bg-purple-950/50', border: 'border-purple-300 dark:border-purple-700' },
  evolution:       { icon: <Shuffle className="w-3.5 h-3.5" />, color: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-50 dark:bg-indigo-950/50', border: 'border-indigo-300 dark:border-indigo-700' },
  evolution_only:  { icon: <Shuffle className="w-3.5 h-3.5" />, color: 'text-indigo-800 dark:text-indigo-200', bg: 'bg-indigo-100/70 dark:bg-indigo-950/60', border: 'border-indigo-400 dark:border-indigo-600' },
  event:           { icon: <Sparkles className="w-3.5 h-3.5" />, color: 'text-pink-700 dark:text-pink-300', bg: 'bg-pink-50 dark:bg-pink-950/50', border: 'border-pink-300 dark:border-pink-700' },
  event_exclusive: { icon: <Sparkles className="w-3.5 h-3.5" />, color: 'text-fuchsia-800 dark:text-fuchsia-200', bg: 'bg-fuchsia-100/70 dark:bg-fuchsia-950/60', border: 'border-fuchsia-400 dark:border-fuchsia-600' },
  biome:           { icon: <Compass className="w-3.5 h-3.5" />, color: 'text-teal-800 dark:text-teal-200', bg: 'bg-teal-100/70 dark:bg-teal-950/60', border: 'border-teal-400 dark:border-teal-600' },
  special:         { icon: <Star className="w-3.5 h-3.5" />, color: 'text-pink-700 dark:text-pink-300', bg: 'bg-pink-50 dark:bg-pink-950/50', border: 'border-pink-300 dark:border-pink-700' },
  trade:           { icon: <Shuffle className="w-3.5 h-3.5" />, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-50 dark:bg-slate-950/50', border: 'border-slate-300 dark:border-slate-700' },
};

const ALT_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  form:        { icon: <Shuffle className="w-3.5 h-3.5" />, color: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-50 dark:bg-indigo-950/60' },
  mega_raid:   { icon: <Swords className="w-3.5 h-3.5" />, color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/60' },
  baby_egg:    { icon: <Egg className="w-3.5 h-3.5" />, color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/60' },
  evolution:   { icon: <Shuffle className="w-3.5 h-3.5" />, color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-950/60' },
  remote_raid: { icon: <Navigation className="w-3.5 h-3.5" />, color: 'text-teal-700 dark:text-teal-300', bg: 'bg-teal-50 dark:bg-teal-950/60' },
  event:       { icon: <Star className="w-3.5 h-3.5" />, color: 'text-pink-700 dark:text-pink-300', bg: 'bg-pink-50 dark:bg-pink-950/60' },
  special:     { icon: <AlertCircle className="w-3.5 h-3.5" />, color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-50 dark:bg-orange-950/60' },
};

export const PokemonDetailModal: React.FC<PokemonDetailModalProps> = ({
  pokemon,
  allPokemon,
  mode,
  collection,
  onClose,
  onNavigate,
  onToggleCaught,
  onToggleShiny,
  onToggleFeature,
}) => {
  const [showShiny, setShowShiny] = useState(false);
  const [spriteError, setSpriteError] = useState(false);
  const [showAllCostumes, setShowAllCostumes] = useState(false);

  useEffect(() => {
    if (!pokemon) return;
    setShowShiny(false);
    setSpriteError(false);
    setShowAllCostumes(false);
  }, [pokemon?.id]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!pokemon) return;
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      // Navigate within same base dex (same dexNr group) first, then prev/next number
      const baseDex = allPokemon.filter(p => p.category === 'standard');
      const idx = baseDex.findIndex(p => p.id === pokemon.id);
      if (idx === -1) return;
      const nextIdx = e.key === 'ArrowRight' ? idx + 1 : idx - 1;
      if (nextIdx >= 0 && nextIdx < baseDex.length) {
        onNavigate(baseDex[nextIdx]);
      }
    }
  }, [pokemon, allPokemon, onClose, onNavigate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Related forms of this species, sorted by canonical in-game Pokédex order
  const relatedForms = useMemo(() => {
    if (!pokemon) return [];
    return (allPokemon || [])
      .filter(p => p.dexNr === pokemon.dexNr && p.id !== pokemon.id)
      .sort(compareFormsWithinSpecies);
  }, [allPokemon, pokemon?.dexNr, pokemon?.id]);

  const regularForms = useMemo(
    () => relatedForms.filter(p => p.category !== 'costume' && !p.isCostume),
    [relatedForms]
  );
  const costumeForms = useMemo(
    () => relatedForms.filter(p => p.category === 'costume' || p.isCostume),
    [relatedForms]
  );

  if (!pokemon) return null;

  const detailInfo: PokemonDetailInfo | null = getPokemonDetailInfo(pokemon, allPokemon);

  const isShinyMode = mode === 'shiny';
  const isCaught = isShinyMode ? Boolean(pokemon.shinyCaught) : Boolean(pokemon.caught);
  const isShadow = Boolean(pokemon.shadowCaught);

  const spriteUrl = showShiny
    ? (pokemon.shinySpriteUrl || pokemon.fallbackShinyUrl || pokemon.officialArtworkUrl)
    : (!spriteError ? getEffectiveSprite(pokemon, false) : (pokemon.fallbackSpriteUrl || pokemon.officialArtworkUrl));

  // Navigation
  const baseDex = (allPokemon || []).filter(p => p.category === 'standard');
  const currentIdx = baseDex.findIndex(p => p.id === pokemon.id);
  const prevPoke = currentIdx > 0 ? baseDex[currentIdx - 1] : null;
  const nextPoke = (currentIdx >= 0 && currentIdx < baseDex.length - 1) ? baseDex[currentIdx + 1] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-900/70 dark:bg-slate-950/85 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[94vh] sm:max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===== Header ===== */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2.5 sm:px-5 sm:pt-5 sm:pb-3 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
              {formatDexNumber(pokemon.dexNr)}
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {pokemon.name}
              </h2>
              {pokemon.formName && pokemon.formName !== 'Standard' && (
                <span className="text-xs text-slate-500 dark:text-slate-400">{pokemon.formName}</span>
              )}
            </div>
            <span className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              Gen {pokemon.generation}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ===== Scrollable Body ===== */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 sm:px-5 sm:pb-5 space-y-3.5 sm:space-y-4">
          {/* Form base dex registration notice */}
          {pokemon.isForm && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800/50 text-xs text-blue-700 dark:text-blue-300">
              <Info className="w-3.5 h-3.5 shrink-0 text-blue-500" />
              <span>
                Catching this {pokemon.formName ? `${pokemon.formName} ` : ''}form also registers the base Pokédex entry <strong>{formatDexNumber(pokemon.dexNr)}</strong> in your Pokédex.
              </span>
            </div>
          )}

          {/* Sprite + Quick Actions Row */}
          <div className="flex gap-3 sm:gap-4 items-start">
            {/* Sprite Box */}
            <div className="relative flex flex-col items-center gap-1.5 sm:gap-2 shrink-0">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner overflow-hidden">
                {isCaught && (
                  <div className="absolute inset-2 rounded-full blur-xl opacity-30 bg-emerald-400" />
                )}
                <img
                  src={spriteUrl || ''}
                  alt={pokemon.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-contain z-10"
                  onError={() => setSpriteError(true)}
                />
              </div>
              {/* Shiny toggle */}
              {pokemon.hasShiny && (
                <button
                  type="button"
                  onClick={() => setShowShiny(s => !s)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer active:scale-95 ${
                    showShiny
                      ? 'bg-amber-400 text-slate-900 border-amber-400 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:text-amber-500'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  Shiny
                </button>
              )}
            </div>

            {/* Quick toggles + Types */}
            <div className="flex-1 space-y-3 pt-1">
              {/* Type badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[pokemon.type1, pokemon.type2].filter(Boolean).map(type => (
                  <span
                    key={type}
                    className={`text-xs font-bold px-2.5 py-1 rounded-xl shadow-sm border ${getTypeBadgeColor(type!).bg} ${getTypeBadgeColor(type!).text} ${getTypeBadgeColor(type!).border}`}
                  >
                    {type}
                  </span>
                ))}
              </div>

              {/* Caught / Shiny / Shadow toggles */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => onToggleCaught(pokemon.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border font-semibold text-sm transition-all cursor-pointer ${
                    isCaught
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-600'
                  }`}
                >
                  <Check className={`w-4 h-4 ${isCaught ? 'text-emerald-500' : 'text-slate-300'}`} />
                  {isCaught ? 'Caught ✓' : 'Not Caught'}
                </button>

                {pokemon.hasShiny && (
                  <button
                    type="button"
                    onClick={() => onToggleShiny(pokemon.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                      pokemon.shinyCaught
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-700 dark:text-amber-300'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-amber-400 hover:text-amber-500'
                    }`}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${pokemon.shinyCaught ? 'fill-current text-amber-400' : ''}`} />
                    {pokemon.shinyCaught ? 'Shiny Caught ✓' : 'Mark as Shiny'}
                  </button>
                )}

                {pokemon.hasShadow && mode !== 'shadow' && (
                  <button
                    type="button"
                    onClick={() => onToggleFeature && onToggleFeature(pokemon.id, 'shadow')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                      isShadow
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 text-purple-700 dark:text-purple-300'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-purple-400 hover:text-purple-500'
                    }`}
                  >
                    <Flame className={`w-3.5 h-3.5 ${isShadow ? 'fill-current text-purple-500' : ''}`} />
                    {isShadow ? 'Shadow Caught ✓' : 'Mark as Shadow'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ===== Obtain Methods ===== */}
          {detailInfo && detailInfo.obtainMethods.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-1.5">
                <Binoculars className="w-3.5 h-3.5" />
                How to Obtain / Availability
              </h3>
              <div className="flex flex-wrap gap-2">
                {detailInfo.obtainMethods.map((m, i) => {
                  const cfg = OBTAIN_TYPE_CONFIG[m.type] || OBTAIN_TYPE_CONFIG.special;
                  return (
                    <div
                      key={i}
                      title={m.description}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold ${cfg.bg} ${cfg.color} ${cfg.border}`}
                    >
                      {cfg.icon}
                      {m.label}
                    </div>
                  );
                })}
              </div>
              {detailInfo.obtainMethods.some(m => m.description) && (
                <div className="mt-2 space-y-1">
                  {detailInfo.obtainMethods.filter(m => m.description).map((m, i) => (
                    <p key={i} className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{m.label}:</span> {m.description}
                    </p>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ===== Regional Status ===== */}
          {detailInfo && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Regional Status
              </h3>
              {detailInfo.regional.isRegional ? (
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60">
                  <MapPin className="w-5 h-5 text-orange-500 dark:text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-orange-800 dark:text-orange-200">
                      Regional Exclusive{detailInfo.regional.regionName ? `: ${detailInfo.regional.regionName}` : ''}
                    </p>
                    {detailInfo.regional.countries && (
                      <p className="text-xs text-orange-600 dark:text-orange-300 mt-1 leading-relaxed">
                        📍 {detailInfo.regional.countries}
                      </p>
                    )}
                    {detailInfo.regional.hemisphere && (
                      <p className="text-xs text-orange-600 dark:text-orange-300 mt-0.5">
                        🌍 {detailInfo.regional.hemisphere}
                      </p>
                    )}
                    {detailInfo.regional.notes && (
                      <p className="text-xs text-orange-500 dark:text-orange-400 mt-1 italic">
                        {detailInfo.regional.notes}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                  <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Available Worldwide — No Regional Restrictions
                  </p>
                </div>
              )}
            </section>
          )}

          {/* ===== Alternative Dex Methods ===== */}
          {detailInfo && detailInfo.alternativeDexMethods.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Alternative Ways to Register Dex Entry
              </h3>
              <div className="space-y-2">
                {detailInfo.alternativeDexMethods.map((m, i) => {
                  const cfg = ALT_TYPE_CONFIG[m.type] || ALT_TYPE_CONFIG.special;
                  return (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-2xl ${cfg.bg} border border-slate-200/60 dark:border-slate-700/40`}>
                      <span className={cfg.color + ' mt-0.5 shrink-0'}>{cfg.icon}</span>
                      <div>
                        {m.badgeLabel && (
                          <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mb-1 ${cfg.color} bg-white/50 dark:bg-black/20`}>
                            {m.badgeLabel}
                          </span>
                        )}
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{m.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{m.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ===== Related Forms & Variants ===== */}
          {regularForms.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-1.5">
                <Shuffle className="w-3.5 h-3.5" />
                Related Forms & Variants
              </h3>
              <div className="flex flex-wrap gap-2">
                {regularForms.map(form => (
                  <button
                    key={form.id}
                    type="button"
                    onClick={() => onNavigate(form)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all cursor-pointer"
                  >
                    <img
                      src={getEffectiveSprite(form, false) || ''}
                      alt={form.name}
                      className="w-7 h-7 object-contain"
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {form.formName || form.name}
                    </span>
                    {Boolean(form.caught) && (
                      <Check className="w-3 h-3 text-emerald-500" />
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* ===== Event Costumes ===== */}
          {costumeForms.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  Event Costumes ({costumeForms.length})
                </h3>
                {costumeForms.length > 12 && (
                  <button
                    type="button"
                    onClick={() => setShowAllCostumes(prev => !prev)}
                    className="text-xs font-medium text-pink-600 dark:text-pink-400 hover:underline cursor-pointer"
                  >
                    {showAllCostumes ? 'Show less' : `Show all (${costumeForms.length})`}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {(showAllCostumes ? costumeForms : costumeForms.slice(0, 12)).map(form => (
                  <button
                    key={form.id}
                    type="button"
                    onClick={() => onNavigate(form)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/40 transition-all cursor-pointer"
                  >
                    <img
                      src={getEffectiveSprite(form, false) || ''}
                      alt={form.name}
                      className="w-7 h-7 object-contain"
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {form.formName || form.name}
                    </span>
                    {Boolean(form.caught) && (
                      <Check className="w-3 h-3 text-emerald-500" />
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Special Notes */}
          {detailInfo?.specialNotes && (
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60">
              <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">{detailInfo.specialNotes}</p>
            </div>
          )}
        </div>

        {/* ===== Footer Navigation ===== */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 shrink-0">
          <button
            type="button"
            onClick={() => prevPoke && onNavigate(prevPoke)}
            disabled={!prevPoke}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            {prevPoke ? formatDexNumber(prevPoke.dexNr) : '—'}
          </button>

          <p className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
            ← → Arrow keys to navigate · ESC to close
          </p>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 sm:hidden">
            {formatDexNumber(pokemon.dexNr)}
          </p>

          <button
            type="button"
            onClick={() => nextPoke && onNavigate(nextPoke)}
            disabled={!nextPoke}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {nextPoke ? formatDexNumber(nextPoke.dexNr) : '—'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
