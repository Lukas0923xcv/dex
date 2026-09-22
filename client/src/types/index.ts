export interface Pokemon {
  id: string;
  dexNr: number;
  name: string;
  names?: Record<string, string>;
  formId?: string;
  formName?: string;
  category: 'standard' | 'mega' | 'form' | 'costume';
  generation: number;
  type1: string;
  type2?: string | null;
  spriteUrl: string;
  shinySpriteUrl: string;
  fallbackSpriteUrl?: string;
  fallbackShinyUrl?: string;
  officialArtworkUrl?: string;
  hasShiny: boolean;
  hasShadow?: boolean;
  hasShadowShiny?: boolean;
  isMega: boolean;
  isForm: boolean;
  isCostume?: boolean;
  isGenderDifference?: boolean;
  releasedInGo: boolean;
  // User Progress fields
  caught?: boolean;
  shinyCaught?: boolean;
  luckyCaught?: boolean;
  hundoCaught?: boolean;
  shadowCaught?: boolean;
  purifiedCaught?: boolean;
  genderMCaught?: boolean;
  genderFCaught?: boolean;
  xxlCaught?: boolean;
  xxsCaught?: boolean;
  notes?: string;
  inCollection?: boolean;
}

export type CollectionCategoryType = 
  | 'normal' 
  | 'event' 
  | 'lucky' 
  | 'mega' 
  | 'shadow' 
  | 'purified' 
  | 'dynamax' 
  | 'gigantamax';

export type CollectionVariantMode = 'multi' | 'single';

export interface CustomCollection {
  id: string;
  name: string;
  description?: string;
  color: string;
  categoryType?: CollectionCategoryType;
  variantMode?: CollectionVariantMode;
  trackShiny?: boolean;
  trackHundo?: boolean;
  trackGender?: boolean;
  trackBackground?: boolean;
  trackSize?: boolean;
  includeGenderForms?: boolean;
  createdAt: string;
  totalItems: number;
  caughtItems: number;
}

export type TrackingMode = 'standard' | 'shiny' | 'shadow' | 'mega' | 'form' | 'costume' | 'custom';

export type StatusFilter = 'all' | 'caught' | 'uncaught';

export type Theme = 'dark' | 'light';

export interface FilterState {
  search: string;
  generation: number | 'all';
  type: string | 'all';
  status: StatusFilter;
  releasedOnly: boolean;
  activeCollectionId: string | null;
  sortBy: 'dexAsc' | 'dexDesc' | 'nameAsc';
  showGenderTracking?: boolean;
  includeBaseInForms?: boolean;
  shinyOnly?: boolean;
  shadowOnly?: boolean;
}

export interface DashboardTabConfig {
  id: string; // 'standard' | 'shiny' | 'mega' | 'form' | 'costume' | `custom:${string}`
  label: string;
  type: 'preset' | 'custom';
  collectionId?: string;
  visible: boolean;
  color?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  createdAt: string;
}

export type DexScope = 'standard' | 'shiny' | 'shadow' | 'mega' | 'form' | 'costume' | string;

export interface SingleCollectionBackup {
  app: string;
  version: number;
  type: 'collection';
  isPreset?: boolean;
  presetKey?: string;
  exportedAt: string;
  data: {
    collection: CustomCollection;
    collections?: CustomCollection[];
    collectionItems: Array<{
      collection_id: string;
      pokemon_id: string;
      added_at?: string;
    }>;
    progress?: Array<{
      account_id?: string;
      dex_scope?: string;
      pokemon_id: string;
      caught?: number | boolean;
      shiny_caught?: number | boolean;
      lucky_caught?: number | boolean;
      hundo_caught?: number | boolean;
      shadow_caught?: number | boolean;
      purified_caught?: number | boolean;
      gender_m_caught?: number | boolean;
      gender_f_caught?: number | boolean;
      xxl_caught?: number | boolean;
      xxs_caught?: number | boolean;
      notes?: string;
      updated_at?: string;
    }>;
    progressV2?: Array<{
      account_id?: string;
      dex_scope?: string;
      pokemon_id: string;
      caught?: number | boolean;
      shiny_caught?: number | boolean;
      lucky_caught?: number | boolean;
      hundo_caught?: number | boolean;
      shadow_caught?: number | boolean;
      purified_caught?: number | boolean;
      gender_m_caught?: number | boolean;
      gender_f_caught?: number | boolean;
      xxl_caught?: number | boolean;
      xxs_caught?: number | boolean;
      notes?: string;
      updated_at?: string;
    }>;
  };
}

export interface PresetCollectionOption {
  id: string;
  scope: string;
  name: string;
  description: string;
  color: string;
  categoryType: CollectionCategoryType;
}

export const PRESET_COLLECTION_OPTIONS: PresetCollectionOption[] = [
  {
    id: 'preset:standard',
    scope: 'standard',
    name: 'Standard Dex',
    description: 'Offizielle reguläre Spezies',
    color: '#3b82f6',
    categoryType: 'normal'
  },
  {
    id: 'preset:shiny',
    scope: 'shiny',
    name: 'Shiny Dex',
    description: 'Freigeschaltete Schillernde Pokémon',
    color: '#f59e0b',
    categoryType: 'normal'
  },
  {
    id: 'preset:shadow',
    scope: 'shadow',
    name: 'Crypto Dex',
    description: 'Offiziell erschienene Crypto-Pokémon',
    color: '#a855f7',
    categoryType: 'shadow'
  },
  {
    id: 'preset:mega',
    scope: 'mega',
    name: 'Mega Dex',
    description: 'Mega- und Primal-Entwicklungen',
    color: '#f43f5e',
    categoryType: 'mega'
  },
  {
    id: 'preset:form',
    scope: 'form',
    name: 'Formen Dex',
    description: 'Regionale & alternative Formen',
    color: '#6366f1',
    categoryType: 'normal'
  },
  {
    id: 'preset:costume',
    scope: 'costume',
    name: 'Kostüme Dex',
    description: 'Event-Pokémon mit Kostümen & Specials',
    color: '#ec4899',
    categoryType: 'event'
  }
];

export interface BackupData {
  app: string;
  version: number;
  type?: 'full' | 'collection';
  exportedAt: string;
  data: {
    progress?: Array<{
      pokemon_id: string;
      caught?: number | boolean;
      shiny_caught?: number | boolean;
      lucky_caught?: number | boolean;
      hundo_caught?: number | boolean;
      shadow_caught?: number | boolean;
      purified_caught?: number | boolean;
      notes?: string;
      updated_at?: string;
    }>;
    progressV2?: Array<{
      account_id: string;
      dex_scope: string;
      pokemon_id: string;
      caught?: number | boolean;
      shiny_caught?: number | boolean;
      lucky_caught?: number | boolean;
      hundo_caught?: number | boolean;
      shadow_caught?: number | boolean;
      purified_caught?: number | boolean;
      gender_m_caught?: number | boolean;
      gender_f_caught?: number | boolean;
      xxl_caught?: number | boolean;
      xxs_caught?: number | boolean;
      notes?: string;
      updated_at?: string;
    }>;
    accounts?: Array<UserAccount>;
    collections: Array<CustomCollection | {
      id: string;
      name: string;
      description?: string;
      color?: string;
      created_at?: string;
      createdAt?: string;
    }>;
    collectionItems: Array<{
      collection_id: string;
      pokemon_id: string;
      added_at?: string;
    }>;
    collection?: CustomCollection;
  };
}

