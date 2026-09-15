export interface RegionOption {
  id: number | 'all';
  name: string;
  shortLabel: string;
  icon: string;
  description: string;
}

export const REGION_OPTIONS: RegionOption[] = [
  { id: 'all', name: 'Alle Regionen', shortLabel: 'Alle', icon: '🌐', description: 'Gesamter Pokédex' },
  { id: 1, name: 'Kanto', shortLabel: 'Kanto', icon: '🏛️', description: 'Gen 1 · 151 Spezies' },
  { id: 2, name: 'Johto', shortLabel: 'Johto', icon: '🌲', description: 'Gen 2 · 100 Spezies' },
  { id: 3, name: 'Hoenn', shortLabel: 'Hoenn', icon: '🌋', description: 'Gen 3 · 135 Spezies' },
  { id: 4, name: 'Sinnoh', shortLabel: 'Sinnoh', icon: '❄️', description: 'Gen 4 · 107 Spezies' },
  { id: 5, name: 'Einall (Unova)', shortLabel: 'Einall', icon: '🏙️', description: 'Gen 5 · 156 Spezies' },
  { id: 6, name: 'Kalos', shortLabel: 'Kalos', icon: '🥖', description: 'Gen 6 · 72 Spezies' },
  { id: 7, name: 'Alola', shortLabel: 'Alola', icon: '🌺', description: 'Gen 7 & Alola-Formen' },
  { id: 8, name: 'Galar', shortLabel: 'Galar', icon: '⚔️', description: 'Gen 8 & Galar-Formen' },
  { id: 85, name: 'Hisui', shortLabel: 'Hisui', icon: '🏔️', description: 'Legenden: Arceus' },
  { id: 9, name: 'Paldea', shortLabel: 'Paldea', icon: '🍇', description: 'Gen 9 & Paldea-Formen' },
  { id: 0, name: 'Meltan / Unbekannt', shortLabel: 'Meltan', icon: '⚙️', description: 'Metall-Spezies' }
];

export function isGalarian(p: { formName?: string; formId?: string; id?: string; name?: string; spriteUrl?: string }): boolean {
  const fn = (p.formName || '').toLowerCase();
  const fid = (p.formId || '').toLowerCase();
  const id = (p.id || '').toLowerCase();
  const name = (p.name || '').toLowerCase();
  const sprite = ((p as any).spriteUrl || '').toLowerCase();
  return (
    fn.includes('galar') ||
    fid.includes('galar') ||
    id.includes('galar') ||
    name.includes('galar') ||
    sprite.includes('fgalarian') ||
    id === 'poke_77_costume_gofest_2021_noevolve' ||
    id === 'poke_222_costume_sunglasses' ||
    id === 'poke_263_costume_gofest_2021_noevolve'
  );
}

export function isAlolan(p: { formName?: string; formId?: string; id?: string; name?: string; spriteUrl?: string }): boolean {
  const fn = (p.formName || '').toLowerCase();
  const fid = (p.formId || '').toLowerCase();
  const id = (p.id || '').toLowerCase();
  const name = (p.name || '').toLowerCase();
  const sprite = ((p as any).spriteUrl || '').toLowerCase();
  return (
    fn.includes('alola') ||
    fid.includes('alola') ||
    id.includes('alola') ||
    name.includes('alola') ||
    sprite.includes('falola')
  );
}

export function isHisuian(p: { formName?: string; formId?: string; id?: string; name?: string; spriteUrl?: string }): boolean {
  const fn = (p.formName || '').toLowerCase();
  const fid = (p.formId || '').toLowerCase();
  const id = (p.id || '').toLowerCase();
  const name = (p.name || '').toLowerCase();
  const sprite = ((p as any).spriteUrl || '').toLowerCase();
  return (
    fn.includes('hisui') ||
    fid.includes('hisui') ||
    id.includes('hisui') ||
    name.includes('hisui') ||
    sprite.includes('fhisui')
  );
}

export function isPaldean(p: { formName?: string; formId?: string; id?: string; name?: string; spriteUrl?: string }): boolean {
  const fn = (p.formName || '').toLowerCase();
  const fid = (p.formId || '').toLowerCase();
  const id = (p.id || '').toLowerCase();
  const name = (p.name || '').toLowerCase();
  const sprite = ((p as any).spriteUrl || '').toLowerCase();
  return (
    fn.includes('paldea') ||
    fid.includes('paldea') ||
    id.includes('paldea') ||
    name.includes('paldea') ||
    sprite.includes('fpaldea')
  );
}

/**
 * Resolves the true regional affiliation of a Pokémon entry, correctly mapping
 * regional forms (Alolan, Galarian, Hisuian, Paldean) to their respective region.
 */
export function getPokemonRegion(p: { generation: number; formName?: string; formId?: string; id?: string }): number {
  if (isGalarian(p)) return 8;
  if (isAlolan(p)) return 7;
  if (isHisuian(p)) return 85;
  if (isPaldean(p)) return 9;
  return p.generation;
}

/**
 * Checks if a Pokémon belongs to a given region ID, respecting regional forms.
 */
export function isPokemonInRegion(
  p: { generation: number; formName?: string; formId?: string; id?: string },
  regionId: number | 'all'
): boolean {
  if (regionId === 'all') return true;
  return getPokemonRegion(p) === regionId;
}
