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

const POKEMINERS_BASE_OVERRIDES: Record<number, string> = {
  201: '201_11', // Unown A
  327: '327_11', // Spinda Pattern 1
  351: '351_11', // Castform Normal
  386: '386_11', // Deoxys Normal
  412: '412_11', // Burmy Plant
  413: '413_11', // Wormadam Plant
  421: '421_11', // Cherrim Overcast
  422: '422_11', // Shellos West Sea
  423: '423_11', // Gastrodon West Sea
  487: '487_11', // Giratina Altered
  492: '492_11', // Shaymin Land
  585: '585_11', // Deerling Spring
  586: '586_11', // Sawsbuck Spring
  649: '649_11', // Genesect Normal
};

const HOME_FORM_SPECIES = new Set([
  // Visual Gender Differences (Home 3D)
  3, 12, 19, 20, 25, 26, 41, 42, 44, 45, 64, 65, 84, 85, 97, 111, 112, 118, 119, 123,
  129, 130, 133, 154, 165, 166, 178, 185, 186, 190, 194, 195, 198, 202, 203, 207, 208,
  212, 214, 215, 217, 221, 224, 229, 232, 255, 256, 257, 267, 269, 272, 274, 275, 307,
  308, 315, 316, 317, 322, 323, 332, 350, 369, 396, 397, 398, 399, 400, 401, 402, 403,
  404, 405, 407, 415, 417, 418, 419, 424, 443, 444, 445, 449, 450, 453, 454, 456, 457,
  459, 460, 461, 464, 465, 473, 521, 592, 593, 668, 902,
  // Alternate forms using Home 3D renders
  479, 483, 484, 641, 642, 645, 646, 647, 648, 669, 670, 671, 676, 678,
  705, 706, 718, 720, 741, 745, 800, 849, 876, 888, 889, 892, 905,
  916, 931, 978, 982, 1012
]);

export function getEffectiveSprite(pokemon: Pokemon, isShiny: boolean): string {
  // 1. If species uses PokeMiners for alternate forms and this is the base form, use the matching PokeMiners icon
  const pokeMinersId = POKEMINERS_BASE_OVERRIDES[pokemon.dexNr];
  if (pokeMinersId && (pokemon.category === 'standard' || !pokemon.isForm)) {
    if (isShiny) {
      return `https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_${pokeMinersId}_shiny.png`;
    }
    return `https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_${pokeMinersId}.png`;
  }

  // 2. Gimmighoul base form is Roaming Form in Pokemon GO (uses Home 10263 to match Chest Form 999)
  if (pokemon.dexNr === 999 && (pokemon.category === 'standard' || !pokemon.isForm)) {
    return isShiny
      ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10263.png'
      : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10263.png';
  }

  // 3. If species uses PokeAPI Home 3D for alternate forms or gender differences, ensure base form uses matching Home 3D sprite
  if ((HOME_FORM_SPECIES.has(pokemon.dexNr) || pokemon.isGenderDifference) && (pokemon.category === 'standard' || !pokemon.isForm)) {
    if (isShiny) {
      return pokemon.fallbackShinyUrl || pokemon.shinySpriteUrl || pokemon.spriteUrl;
    }
    return pokemon.fallbackSpriteUrl || pokemon.spriteUrl;
  }

  if (isShiny) {
    return pokemon.shinySpriteUrl || pokemon.fallbackShinyUrl || pokemon.spriteUrl;
  }
  return pokemon.spriteUrl || pokemon.fallbackSpriteUrl || pokemon.officialArtworkUrl || '';
}
