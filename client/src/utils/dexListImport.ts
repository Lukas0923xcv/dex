import type { CollectionCategoryType, Pokemon } from '../types';

/**
 * Dex-list collection import.
 *
 * Lets a custom collection be defined by nothing more than a name and a
 * comma-separated list of National Dex numbers, so an AI (or a human) can
 * generate collections without knowing the app's internal Pokémon IDs.
 *
 * Accepted JSON shapes:
 *   { "name": "Kanto Dragons", "dex": "147, 148, 149" }
 *   { "name": "Starters", "dex": [1, 4, 7] }
 *   { "name": "Gen 1", "dex": "1-151" }                       (ranges allowed)
 *   [ { "name": "...", "dex": "..." }, { ... } ]              (several at once)
 *   { "collections": [ { "name": "...", "dex": "..." } ] }    (several at once)
 *
 * Optional fields per collection: description, color (#hex), shiny (bool),
 * type ("normal" | "lucky" | "shadow" | "purified" | ...), forms, megas,
 * costumes (bool: also add those variants of each listed species).
 */

export interface DexListCollectionSpec {
  name: string;
  description?: string;
  color?: string;
  dexNumbers: number[];
  invalidTokens: string[];
  trackShiny: boolean;
  categoryType: CollectionCategoryType;
  includeForms: boolean;
  includeMegas: boolean;
  includeCostumes: boolean;
}

export interface ResolvedDexListCollection {
  spec: DexListCollectionSpec;
  pokemonIds: string[];
  /** Dex numbers with no entry in the app's data at all */
  unknownNumbers: number[];
  /** Dex numbers that exist but are not yet released in Pokémon GO (hidden until released) */
  unreleasedNumbers: number[];
}

const DEX_KEYS = ['dex', 'dexNumbers', 'dexNrs', 'dexNr', 'numbers', 'pokemon', 'pokedex', 'list'];
const VALID_CATEGORY_TYPES: CollectionCategoryType[] = [
  'normal', 'event', 'lucky', 'mega', 'shadow', 'purified', 'dynamax', 'gigantamax'
];
const MAX_DEX_NR = 2000;
const MAX_RANGE_SIZE = 1100;

export const AI_PROMPT_TEMPLATE = `Create Pokémon GO collections for my dex tracker.
Reply with ONLY valid JSON (no markdown, no comments) in exactly this shape:

[
  {
    "name": "Short collection name",
    "description": "One line describing the collection",
    "dex": "1, 4, 7, 25"
  }
]

Rules:
- "dex" is a single string of National Pokédex numbers separated by commas. Ranges like "1-151" are allowed.
- One object per collection; you may return several.
- Optional per collection: "color" (hex like "#f59e0b"), "shiny": true (track shinies),
  "forms": true / "megas": true / "costumes": true (also add those variants of each listed species).

Collections I want: `;

function toBool(v: unknown): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') return ['true', 'yes', '1', 'y'].includes(v.trim().toLowerCase());
  return false;
}

/** Parse "1, 4, 7, 10-12" (or an array of numbers/strings) into unique dex numbers, keeping order. */
export function parseDexNumbers(input: unknown): { numbers: number[]; invalid: string[] } {
  const tokens: string[] = [];
  if (Array.isArray(input)) {
    for (const item of input) tokens.push(...String(item).split(/[,;\n]+/));
  } else if (typeof input === 'number') {
    tokens.push(String(input));
  } else if (typeof input === 'string') {
    tokens.push(...input.split(/[,;\n]+/));
  }

  const seen = new Set<number>();
  const numbers: number[] = [];
  const invalid: string[] = [];
  const push = (n: number) => {
    if (!seen.has(n)) {
      seen.add(n);
      numbers.push(n);
    }
  };

  for (const raw of tokens) {
    const token = raw.trim().replace(/^#/, '');
    if (!token) continue;
    const range = token.match(/^#?(\d{1,4})\s*[-–]\s*#?(\d{1,4})$/);
    if (range) {
      const a = Number(range[1]);
      const b = Number(range[2]);
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      if (lo < 1 || hi > MAX_DEX_NR || hi - lo + 1 > MAX_RANGE_SIZE) {
        invalid.push(raw.trim());
        continue;
      }
      for (let n = lo; n <= hi; n++) push(n);
      continue;
    }
    if (/^\d{1,4}$/.test(token)) {
      const n = Number(token);
      if (n >= 1 && n <= MAX_DEX_NR) {
        push(n);
        continue;
      }
    }
    invalid.push(raw.trim());
  }

  return { numbers, invalid };
}

function specFromObject(obj: any, index: number): DexListCollectionSpec | null {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
  const dexKey = DEX_KEYS.find(k => obj[k] !== undefined && obj[k] !== null);
  if (!dexKey) return null;

  const { numbers, invalid } = parseDexNumbers(obj[dexKey]);
  const rawType = String(obj.type ?? obj.categoryType ?? 'normal').toLowerCase() as CollectionCategoryType;
  const color = typeof obj.color === 'string' && /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(obj.color.trim())
    ? obj.color.trim()
    : undefined;
  const name = String(obj.name ?? obj.title ?? '').trim() || `Imported Collection ${index + 1}`;

  return {
    name: name.slice(0, 80),
    description: obj.description ? String(obj.description).trim().slice(0, 200) : undefined,
    color,
    dexNumbers: numbers,
    invalidTokens: invalid,
    trackShiny: toBool(obj.shiny ?? obj.trackShiny),
    categoryType: VALID_CATEGORY_TYPES.includes(rawType) ? rawType : 'normal',
    includeForms: toBool(obj.forms ?? obj.includeForms),
    includeMegas: toBool(obj.megas ?? obj.includeMegas),
    includeCostumes: toBool(obj.costumes ?? obj.includeCostumes)
  };
}

/**
 * Detects and parses the dex-list format. Returns null when the JSON is not in
 * that format (e.g. it is a regular app backup), so callers can fall back.
 */
export function parseDexListJson(json: unknown): DexListCollectionSpec[] | null {
  let entries: unknown[];
  if (Array.isArray(json)) {
    entries = json;
  } else if (json && typeof json === 'object' && Array.isArray((json as any).collections) && !(json as any).app) {
    entries = (json as any).collections;
  } else if (json && typeof json === 'object') {
    entries = [json];
  } else {
    return null;
  }

  const specs = entries
    .map((e, i) => specFromObject(e, i))
    .filter((s): s is DexListCollectionSpec => s !== null);
  return specs.length > 0 ? specs : null;
}

/** Parse pasted text: JSON in any accepted shape, or a bare "1, 4, 7" list. */
export function parseDexListText(text: string, fallbackName = 'Imported Collection'): DexListCollectionSpec[] {
  const trimmed = text.trim();
  if (!trimmed) throw new Error('Nothing to import — paste JSON or a list of dex numbers.');

  // Tolerate AI answers wrapped in ```json fences
  const unfenced = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');

  if (/^[[{]/.test(unfenced)) {
    let json: unknown;
    try {
      json = JSON.parse(unfenced);
    } catch (e: any) {
      throw new Error(`Invalid JSON: ${e.message}`);
    }
    const specs = parseDexListJson(json);
    if (!specs) {
      throw new Error('No collection found. Each collection needs a "name" and a "dex" field, e.g. {"name": "Starters", "dex": "1, 4, 7"}.');
    }
    return specs;
  }

  const { numbers, invalid } = parseDexNumbers(unfenced);
  if (numbers.length === 0) throw new Error('No valid dex numbers found.');
  return [{
    name: fallbackName,
    dexNumbers: numbers,
    invalidTokens: invalid,
    trackShiny: false,
    categoryType: 'normal',
    includeForms: false,
    includeMegas: false,
    includeCostumes: false
  }];
}

/** Map a spec's dex numbers to the app's Pokémon entry IDs. */
export function resolveDexListCollection(spec: DexListCollectionSpec, allPokemon: Pokemon[]): ResolvedDexListCollection {
  const byDex = new Map<number, Pokemon[]>();
  for (const p of allPokemon) {
    const list = byDex.get(p.dexNr);
    if (list) list.push(p);
    else byDex.set(p.dexNr, [p]);
  }

  const ids: string[] = [];
  const seen = new Set<string>();
  const unknownNumbers: number[] = [];
  const unreleasedNumbers: number[] = [];
  const add = (p: Pokemon) => {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      ids.push(p.id);
    }
  };

  for (const nr of spec.dexNumbers) {
    const entries = byDex.get(nr);
    const base = entries?.find(p => p.category === 'standard');
    if (!entries || !base) {
      unknownNumbers.push(nr);
      continue;
    }
    if (!base.releasedInGo) unreleasedNumbers.push(nr);
    add(base);
    for (const p of entries) {
      if (p.category === 'form' && spec.includeForms) add(p);
      else if (p.category === 'mega' && spec.includeMegas) add(p);
      else if (p.category === 'costume' && spec.includeCostumes) add(p);
    }
  }

  return { spec, pokemonIds: ids, unknownNumbers, unreleasedNumbers };
}
