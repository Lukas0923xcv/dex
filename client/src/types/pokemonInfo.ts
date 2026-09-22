export type ObtainMethodType =
  | 'wild'
  | 'egg'
  | 'raid'
  | 'research'
  | 'rocket'
  | 'evolution'
  | 'special'
  | 'trade';

export interface ObtainMethodDetail {
  type: ObtainMethodType;
  label: string;
  badgeColor: string;
  description: string;
  available: boolean;
}

export interface RegionalInfo {
  isRegional: boolean;
  regionName?: string;
  countries?: string;
  hemisphere?: string;
  notes?: string;
}

export interface DexAlternativeMethod {
  type: 'form' | 'mega_raid' | 'baby_egg' | 'evolution' | 'remote_raid' | 'event' | 'special';
  title: string;
  description: string;
  relatedPokemonId?: string;
  badgeLabel?: string;
}

export interface EvolutionRequirement {
  evolvesFrom?: {
    dexNr: number;
    name: string;
    candyCost: number;
    item?: string;
    lure?: string;
    requirement?: string;
  };
  evolvesInto?: Array<{
    dexNr: number;
    name: string;
    candyCost: number;
    item?: string;
    lure?: string;
    requirement?: string;
  }>;
}

export interface PokemonDetailInfo {
  dexNr: number;
  name: string;
  germanName: string;
  generation: number;
  types: string[];
  regional: RegionalInfo;
  obtainMethods: ObtainMethodDetail[];
  alternativeDexMethods: DexAlternativeMethod[];
  evolution?: EvolutionRequirement;
  specialNotes?: string;
}
