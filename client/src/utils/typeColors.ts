import { Pokemon } from '../types';

export const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Normal: { bg: 'bg-stone-500', text: 'text-white', border: 'border-stone-400' },
  Fire: { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-400' },
  Water: { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-400' },
  Grass: { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-400' },
  Electric: { bg: 'bg-amber-400', text: 'text-stone-900', border: 'border-amber-300' },
  Ice: { bg: 'bg-cyan-400', text: 'text-stone-900', border: 'border-cyan-300' },
  Fighting: { bg: 'bg-rose-700', text: 'text-white', border: 'border-rose-600' },
  Poison: { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-400' },
  Ground: { bg: 'bg-amber-600', text: 'text-white', border: 'border-amber-500' },
  Flying: { bg: 'bg-indigo-400', text: 'text-white', border: 'border-indigo-300' },
  Psychic: { bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-400' },
  Bug: { bg: 'bg-lime-600', text: 'text-white', border: 'border-lime-400' },
  Rock: { bg: 'bg-yellow-700', text: 'text-white', border: 'border-yellow-600' },
  Ghost: { bg: 'bg-violet-800', text: 'text-white', border: 'border-violet-600' },
  Dragon: { bg: 'bg-indigo-700', text: 'text-white', border: 'border-indigo-500' },
  Steel: { bg: 'bg-slate-400', text: 'text-stone-900', border: 'border-slate-300' },
  Dark: { bg: 'bg-stone-800', text: 'text-white', border: 'border-stone-600' },
  Fairy: { bg: 'bg-rose-400', text: 'text-stone-900', border: 'border-rose-300' },
};

export function getTypeBadgeColor(type: string) {
  const clean = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  return TYPE_COLORS[clean] || { bg: 'bg-slate-600', text: 'text-white', border: 'border-slate-500' };
}

export function formatDexNumber(nr: number): string {
  return '#' + String(nr).padStart(3, '0');
}

export function getEffectiveSprite(pokemon: Pokemon, isShiny: boolean): string {
  if (isShiny) {
    return pokemon.shinySpriteUrl || pokemon.fallbackShinyUrl || pokemon.spriteUrl;
  }
  return pokemon.spriteUrl || pokemon.fallbackSpriteUrl || pokemon.officialArtworkUrl || '';
}
