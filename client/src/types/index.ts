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
  createdAt: string;
  totalItems: number;
  caughtItems: number;
}

export type TrackingMode = 'standard' | 'shiny' | 'mega' | 'form' | 'costume' | 'custom';

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
}

export interface BackupData {
  app: string;
  version: number;
  exportedAt: string;
  data: {
    progress: Array<{
      pokemon_id: string;
      caught?: number | boolean;
      shiny_caught?: number | boolean;
      lucky_caught?: number | boolean;
      hundo_caught?: number | boolean;
      notes?: string;
      updated_at?: string;
    }>;
    collections: Array<{
      id: string;
      name: string;
      description?: string;
      color?: string;
      created_at?: string;
    }>;
    collectionItems: Array<{
      collection_id: string;
      pokemon_id: string;
      added_at?: string;
    }>;
  };
}
