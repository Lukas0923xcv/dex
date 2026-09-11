export interface Pokemon {
  id: string;
  dexNr: number;
  name: string;
  names?: Record<string, string>;
  formId?: string;
  formName?: string;
  category: 'standard' | 'mega' | 'form';
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
  releasedInGo: boolean;
  // User Progress fields
  caught?: boolean;
  shinyCaught?: boolean;
  luckyCaught?: boolean;
  hundoCaught?: boolean;
  notes?: string;
  inCollection?: boolean;
}

export interface CustomCollection {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  totalItems: number;
  caughtItems: number;
}

export type TrackingMode = 'standard' | 'shiny' | 'mega' | 'form' | 'custom';

export type StatusFilter = 'all' | 'caught' | 'uncaught';

export interface FilterState {
  search: string;
  generation: number | 'all';
  type: string | 'all';
  status: StatusFilter;
  activeCollectionId: string | null;
  sortBy: 'dexAsc' | 'dexDesc' | 'nameAsc';
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
