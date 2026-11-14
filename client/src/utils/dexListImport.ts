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
 * type ("normal" | "lucky" | "shadow" | "purified" | "mega" | "dynamax" | "gigantamax"),
 * forms, megas, costumes, dynamax, gigantamax (bool: also add those variants of each listed species).
 * With type "mega", "dynamax" or "gigantamax" the collection holds only that variant of each species.
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
  includeDynamax: boolean;
  includeGigantamax: boolean;
}

export interface ResolvedDexListCollection {
  spec: DexListCollectionSpec;
  pokemonIds: string[];
  /** Dex numbers with no entry in the app's data at all */
  unknownNumbers: number[];
  /** Dex numbers that exist but are not yet released in Pokémon GO (hidden until released) */
  unreleasedNumbers: number[];
  /** Dex numbers that have no Mega / Dynamax / Gigantamax entry (only for those collection types) */
  missingVariantNumbers: number[];
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
- Optional per collection: "description", "color" (hex like "#f59e0b"), "shiny": true (track shinies),
  "type": "lucky" | "shadow" | "purified" | "mega" | "dynamax" | "gigantamax" (what the list tracks),
  "forms" / "megas" / "costumes" / "dynamax" / "gigantamax": true (also add those variants of each species).

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
    includeCostumes: toBool(obj.costumes ?? obj.includeCostumes),
    includeDynamax: toBool(obj.dynamax ?? obj.includeDynamax),
    includeGigantamax: toBool(obj.gigantamax ?? obj.includeGigantamax)
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
/**
 * Repairs the JSON mistakes AI answers and copy/paste typically introduce:
 * curly quotes, comments, unquoted keys, single-quoted strings and trailing commas.
 */
export function repairJsonText(text: string): string {
  let t = text
    .replace(/^\uFEFF/, '')
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u00AB\u00BB]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B\u2032]/g, "'")
    .replace(/\u00A0/g, ' ');

  // Remove // and /* */ comments outside of strings
  let out = '';
  let inString: string | null = null;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (inString) {
      out += c;
      if (c === '\\') { out += t[++i] ?? ''; continue; }
      if (c === inString) inString = null;
      continue;
    }
    if (c === '"' || c === "'") { inString = c; out += c; continue; }
    if (c === '/' && t[i + 1] === '/') { while (i < t.length && t[i] !== '\n') i++; out += '\n'; continue; }
    if (c === '/' && t[i + 1] === '*') { i += 2; while (i < t.length && !(t[i] === '*' && t[i + 1] === '/')) i++; i++; continue; }
    out += c;
  }
  t = out;

  // 'single quoted' strings -> "double quoted"
  t = t.replace(/'((?:[^'\\\n]|\\.)*)'/g, (_m, inner: string) => JSON.stringify(inner.replace(/\\'/g, "'")));
  // unquoted keys: { name: ... } -> { "name": ... }
  t = t.replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '$1"$2":');
  // trailing commas
  t = t.replace(/,\s*([}\]])/g, '$1');
  return t;
}

/** JSON.parse that falls back to repairJsonText for sloppy (AI / copy-pasted) JSON. */
export function parseLenientJson(text: string): unknown {
  const unfenced = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try {
    return JSON.parse(unfenced);
  } catch (e: any) {
    try {
      return JSON.parse(repairJsonText(unfenced));
    } catch {
      throw new Error(`Invalid JSON: ${e.message}`);
    }
  }
}

export function parseDexListText(text: string, fallbackName = 'Imported Collection'): DexListCollectionSpec[] {
  const trimmed = text.trim();
  if (!trimmed) throw new Error('Nothing to import — paste JSON or a list of dex numbers.');

  // Tolerate AI answers wrapped in ```json fences
  const unfenced = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');

  if (/^[[{]/.test(unfenced)) {
    const json = parseLenientJson(unfenced);
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
    includeCostumes: false,
    includeDynamax: false,
    includeGigantamax: false
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
  const missingVariantNumbers: number[] = [];
  // For Mega / Dynamax / Gigantamax collections the variant itself is the entry, not the base species
  const variantCategory = (['mega', 'dynamax', 'gigantamax'] as string[]).includes(spec.categoryType)
    ? spec.categoryType
    : null;
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
    if (variantCategory) {
      const variants = entries.filter(p => p.category === variantCategory);
      if (variants.length === 0) {
        missingVariantNumbers.push(nr);
        continue;
      }
      if (variants.every(p => !p.releasedInGo)) unreleasedNumbers.push(nr);
      variants.forEach(add);
    } else {
      if (!base.releasedInGo) unreleasedNumbers.push(nr);
      add(base);
    }
    for (const p of entries) {
      if (p.category === 'form' && spec.includeForms) add(p);
      else if (p.category === 'mega' && spec.includeMegas) add(p);
      else if (p.category === 'costume' && spec.includeCostumes) add(p);
      else if (p.category === 'dynamax' && spec.includeDynamax) add(p);
      else if (p.category === 'gigantamax' && spec.includeGigantamax) add(p);
    }
  }

  return { spec, pokemonIds: ids, unknownNumbers, unreleasedNumbers, missingVariantNumbers };
}
