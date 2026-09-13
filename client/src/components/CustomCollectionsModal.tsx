import React, { useState, useEffect, useMemo } from 'react';
import { CustomCollection, CollectionCategoryType, CollectionVariantMode, Pokemon } from '../types';
import {
  X,
  Plus,
  Trash2,
  Bookmark,
  Layers,
  Gift,
  Sparkles,
  Zap,
  Flame,
  Sun,
  Maximize2,
  CloudLightning,
  Boxes,
  Compass,
  Check,
  ShieldCheck,
  Dna,
  Ruler,
  Palette,
  FolderKanban
} from 'lucide-react';

interface CustomCollectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: CustomCollection[];
  activeCollectionId: string | null;
  allPokemon?: Pokemon[];
  onSelectCollection: (id: string) => void;
  onCreateCollection: (
    name: string,
    description?: string,
    color?: string,
    options?: {
      categoryType?: CollectionCategoryType;
      variantMode?: CollectionVariantMode;
      trackShiny?: boolean;
      trackHundo?: boolean;
      trackGender?: boolean;
      trackBackground?: boolean;
      trackSize?: boolean;
      includeGenderForms?: boolean;
      pokemonIds?: string[];
    }
  ) => Promise<any>;
  onDeleteCollection: (id: string) => Promise<void>;
  onDeleteAllCollections?: () => Promise<void>;
  onOpenEditor: (collection: CustomCollection) => void;
}

// Preset Accent Themes
const COLOR_THEMES = [
  { id: 'emerald', hex: '#10b981', label: 'Smaragd' },
  { id: 'sky', hex: '#0284c7', label: 'Himmelblau' },
  { id: 'amber', hex: '#f59e0b', label: 'Bernstein' },
  { id: 'purple', hex: '#9333ea', label: 'Amethyst' },
  { id: 'rose', hex: '#f43f5e', label: 'Rubinrot' },
  { id: 'teal', hex: '#0d9488', label: 'Türkis' },
  { id: 'indigo', hex: '#6366f1', label: 'Indigo' },
  { id: 'crimson', hex: '#dc2626', label: 'Karmin' },
];

export const CustomCollectionsModal: React.FC<CustomCollectionsModalProps> = ({
  isOpen,
  onClose,
  collections,
  activeCollectionId,
  allPokemon = [],
  onSelectCollection,
  onCreateCollection,
  onDeleteCollection,
  onDeleteAllCollections,
  onOpenEditor
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');

  // Form states
  const [categoryType, setCategoryType] = useState<CollectionCategoryType>('normal');
  const [variantMode, setVariantMode] = useState<CollectionVariantMode>('multi');
  const [includeGenderForms, setIncludeGenderForms] = useState<boolean>(true);
  const [trackShiny, setTrackShiny] = useState<boolean>(false);
  const [trackHundo, setTrackHundo] = useState<boolean>(false);
  const [trackGender, setTrackGender] = useState<boolean>(false);
  const [trackSize, setTrackSize] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>(COLOR_THEMES[0].hex);

  const [name, setName] = useState<string>('');
  const [isNameManuallyEdited, setIsNameManuallyEdited] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [populateMode, setPopulateMode] = useState<'all' | 'custom'>('all');

  useEffect(() => {
    if (isOpen) {
      setActiveTab('create');
    }
  }, [isOpen]);

  // 8 Category definitions with modern Lucide icons and soft gradient accents
  const categoryCards: Array<{
    id: CollectionCategoryType;
    label: string;
    subtitle: string;
    icon: React.FC<{ className?: string }>;
    accentHex: string;
  }> = [
    {
      id: 'normal',
      label: 'Standard Dex',
      subtitle: 'Reguläre Spezies',
      icon: Layers,
      accentHex: '#10b981'
    },
    {
      id: 'event',
      label: 'Event-Kostüme',
      subtitle: 'Hüte & Specials',
      icon: Gift,
      accentHex: '#ec4899'
    },
    {
      id: 'lucky',
      label: 'Glücks-Ziele',
      subtitle: 'Lucky Pokémon',
      icon: Sparkles,
      accentHex: '#eab308'
    },
    {
      id: 'mega',
      label: 'Mega & Primal',
      subtitle: 'Mega-Entwicklungen',
      icon: Zap,
      accentHex: '#f97316'
    },
    {
      id: 'shadow',
      label: 'Crypto',
      subtitle: 'Schatten-Pokémon',
      icon: Flame,
      accentHex: '#a855f7'
    },
    {
      id: 'purified',
      label: 'Erlöst',
      subtitle: 'Geläuterte Aura',
      icon: Sun,
      accentHex: '#06b6d4'
    },
    {
      id: 'dynamax',
      label: 'Dynamax',
      subtitle: 'Kraftquellen-Fänge',
      icon: Maximize2,
      accentHex: '#d946ef'
    },
    {
      id: 'gigantamax',
      label: 'Gigadynamax',
      subtitle: 'Giga-Spezialformen',
      icon: CloudLightning,
      accentHex: '#ef4444'
    }
  ];

  // Auto-generate name based on choices if user hasn't typed custom name
  useEffect(() => {
    if (isNameManuallyEdited) return;

    const parts: string[] = [];
    if (trackShiny) parts.push('Schillernde');

    const catLabels: Record<CollectionCategoryType, string> = {
      normal: variantMode === 'multi' ? 'Multivarianten' : 'Standard',
      event: 'Event-Kostüme',
      lucky: 'Glücks',
      mega: 'Mega & Primal',
      shadow: 'Crypto',
      purified: 'Erlöste',
      dynamax: 'Dynamax',
      gigantamax: 'Gigadynamax'
    };
    parts.push(catLabels[categoryType]);

    if (trackHundo) parts.push('100% IV');
    parts.push('Sammlung');

    setName(parts.join(' '));
  }, [categoryType, variantMode, trackShiny, trackHundo, isNameManuallyEdited]);

  // Gather matching Pokémon IDs based on category and variant mode
  const matchingPokemonIds = useMemo(() => {
    let list = [...allPokemon];

    if (categoryType === 'mega') {
      list = list.filter(p => p.category === 'mega' || p.isMega);
    } else if (categoryType === 'event') {
      list = list.filter(p => p.category === 'costume' || p.isCostume);
    } else if (categoryType === 'dynamax' || categoryType === 'gigantamax') {
      if (variantMode === 'single') {
        list = list.filter(p => p.category === 'standard');
      } else {
        list = list.filter(p => p.category === 'standard' || p.category === 'form');
      }
    } else if (categoryType === 'shadow' || categoryType === 'purified') {
      list = list.filter(p => p.hasShadow);
      if (variantMode === 'single') {
        list = list.filter(p => p.category === 'standard');
      } else {
        list = list.filter(p => p.category === 'standard' || p.category === 'form');
      }
    } else {
      // Normal, Lucky
      if (variantMode === 'single') {
        list = list.filter(p => p.category === 'standard');
      } else {
        list = list.filter(p => p.category === 'standard' || p.category === 'form');
      }
    }

    if (variantMode === 'multi' && !includeGenderForms) {
      list = list.filter(p => !p.isGenderDifference);
    }

    if (trackShiny) {
      list = list.filter(p => p.hasShiny);
    }

    return list.map(p => p.id);
  }, [allPokemon, categoryType, variantMode, includeGenderForms, trackShiny]);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const subLabel = variantMode === 'multi' ? 'Multivarianten' : 'Basis-Spezies';
      const initialPokemonIds = populateMode === 'all' ? matchingPokemonIds : [];
      const newColl = await onCreateCollection(
        name.trim(),
        `${categoryType.toUpperCase()} · ${subLabel}`,
        selectedColor,
        {
          categoryType,
          variantMode,
          trackShiny,
          trackHundo,
          trackGender,
          trackSize,
          includeGenderForms: variantMode === 'multi' ? includeGenderForms : false,
          pokemonIds: initialPokemonIds
        }
      );

      if (newColl && newColl.id) {
        onSelectCollection(newColl.id);
        if (populateMode === 'custom') {
          onOpenEditor(newColl);
        }
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900/95 border border-slate-800/90 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl shadow-black/95 overflow-hidden ring-1 ring-white/10">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-colors"
              style={{ backgroundColor: `${selectedColor}25`, color: selectedColor }}
            >
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Sammlungs-Studio
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Custom Dex
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Erstelle maßgeschneiderte Pokédex-Tracker oder verwalte eigene Listen
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 sm:px-6 pt-3 pb-1 border-b border-slate-800/60 bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Sammlung konfigurieren</span>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span>Gespeicherte Sammlungen</span>
              <span className="px-1.5 py-0.5 rounded-full text-[11px] bg-slate-700 text-slate-200 font-mono">
                {collections.length}
              </span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-100 scrollbar-thin">
          {activeTab === 'create' ? (
            <form onSubmit={handleCreate} className="space-y-6">
              {/* Section 1: Kategorie-Fokus */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 inline-flex items-center justify-center text-xs font-mono">
                      1
                    </span>
                    Kategorie-Fokus wählen
                  </label>
                  <span className="text-xs text-slate-400">
                    Welche Art von Pokémon möchtest du erfassen?
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {categoryCards.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = categoryType === cat.id;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setCategoryType(cat.id);
                          setSelectedColor(cat.accentHex);
                        }}
                        className={`group relative flex flex-col items-start p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800/90 border-2 shadow-lg scale-[1.01]'
                            : 'bg-slate-950/60 hover:bg-slate-800/50 border-slate-800 hover:border-slate-700'
                        }`}
                        style={{
                          borderColor: isSelected ? cat.accentHex : undefined,
                          boxShadow: isSelected ? `0 0 20px ${cat.accentHex}25` : undefined
                        }}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                            style={{
                              backgroundColor: `${cat.accentHex}20`,
                              color: cat.accentHex
                            }}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          {isSelected && (
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-slate-950"
                              style={{ backgroundColor: cat.accentHex }}
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <span className={`text-xs sm:text-sm font-bold block ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                          {cat.label}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5 truncate w-full">
                          {cat.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Pokédex-Granularität */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 inline-flex items-center justify-center text-xs font-mono">
                    2
                  </span>
                  Form-Granularität
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Multivariante */}
                  <button
                    type="button"
                    onClick={() => setVariantMode('multi')}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      variantMode === 'multi'
                        ? 'bg-slate-800/90 border-2 border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                        : 'bg-slate-950/60 hover:bg-slate-800/50 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        variantMode === 'multi'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      <Boxes className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${variantMode === 'multi' ? 'text-white' : 'text-slate-300'}`}>
                          Alle Formen & Varianten
                        </span>
                        {variantMode === 'multi' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                            Aktiv
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Erfasst Alola, Galar, Hisui, Paldea, Vivillon, Icognito etc. als individuelle Sammler-Einträge.
                      </p>
                    </div>
                  </button>

                  {/* Single Variant */}
                  <button
                    type="button"
                    onClick={() => setVariantMode('single')}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      variantMode === 'single'
                        ? 'bg-slate-800/90 border-2 border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                        : 'bg-slate-950/60 hover:bg-slate-800/50 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        variantMode === 'single'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${variantMode === 'single' ? 'text-white' : 'text-slate-300'}`}>
                          Nur Basis-Spezies
                        </span>
                        {variantMode === 'single' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                            Aktiv
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Exakt 1 Eintrag pro Pokédex-Nummer. Stimmt exakt mit dem Zähler im offiziellen Spiel überein.
                      </p>
                    </div>
                  </button>
                </div>

                {/* Gender Difference Forms Toggle for Multi Variant Mode */}
                {variantMode === 'multi' && (
                  <div
                    onClick={() => setIncludeGenderForms(!includeGenderForms)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      includeGenderForms
                        ? 'bg-pink-500/10 border-pink-500/40 text-white'
                        : 'bg-slate-950/60 hover:bg-slate-800/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl text-base ${includeGenderForms ? 'bg-pink-500/20 text-pink-300' : 'bg-slate-900 text-slate-500'}`}>
                        ⚧
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-white">
                          Geschlechts-Formen einbeziehen (♀ Unterschiede)
                        </div>
                        <div className="text-[11px] text-slate-400">
                          98 optische Geschlechtsunterschiede (Pikachu ♀, Woingenau ♀, Smettbo ♀ usw.) als eigene Sammler-Einträge
                        </div>
                      </div>
                    </div>
                    <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${includeGenderForms ? 'bg-pink-500' : 'bg-slate-800'}`}>
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${includeGenderForms ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Zusätzliche Tracking-Dimensionen */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 inline-flex items-center justify-center text-xs font-mono">
                      3
                    </span>
                    Tracking-Dimensionen
                  </label>
                  <span className="text-xs text-slate-400">
                    Aktivierte Kriterien können für jedes Pokémon separat angehakt werden
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Schillernd (Shiny) */}
                  <div
                    onClick={() => setTrackShiny(!trackShiny)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      trackShiny
                        ? 'bg-amber-500/10 border-amber-500/50 text-white'
                        : 'bg-slate-950/60 hover:bg-slate-800/40 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${trackShiny ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-900 text-slate-400'}`}>
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">Schillernd (Shiny)</div>
                        <div className="text-[11px] text-slate-400">Glitzernde Shinies separat erfassen</div>
                      </div>
                    </div>
                    <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${trackShiny ? 'bg-amber-500' : 'bg-slate-800'}`}>
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${trackShiny ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {/* 100% IV (Hundo) */}
                  <div
                    onClick={() => setTrackHundo(!trackHundo)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      trackHundo
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                        : 'bg-slate-950/60 hover:bg-slate-800/40 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${trackHundo ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-900 text-slate-400'}`}>
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">100% IV (Hundo)</div>
                        <div className="text-[11px] text-slate-400">Perfekte 15/15/15 Bewertung</div>
                      </div>
                    </div>
                    <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${trackHundo ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${trackHundo ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {/* Geschlechter */}
                  <div
                    onClick={() => setTrackGender(!trackGender)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      trackGender
                        ? 'bg-blue-500/10 border-blue-500/50 text-white'
                        : 'bg-slate-950/60 hover:bg-slate-800/40 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${trackGender ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-900 text-slate-400'}`}>
                        <Dna className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">Geschlecht (♂ / ♀)</div>
                        <div className="text-[11px] text-slate-400">Männlich und Weiblich getrennt</div>
                      </div>
                    </div>
                    <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${trackGender ? 'bg-blue-500' : 'bg-slate-800'}`}>
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${trackGender ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {/* Spezielle Hintergründe */}
                  {/* Größenrekorde */}
                  <div
                    onClick={() => setTrackSize(!trackSize)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      trackSize
                        ? 'bg-rose-500/10 border-rose-500/50 text-white'
                        : 'bg-slate-950/60 hover:bg-slate-800/40 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${trackSize ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-900 text-slate-400'}`}>
                        <Ruler className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">Größen-Rekorde (XXS & XXL)</div>
                        <div className="text-[11px] text-slate-400">Pummelige Riesen und winzige Zwerg-Rekorde im Pokédex führen</div>
                      </div>
                    </div>
                    <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${trackSize ? 'bg-rose-500' : 'bg-slate-800'}`}>
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${trackSize ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Pokémon-Auswahl */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 inline-flex items-center justify-center text-xs font-mono">
                      4
                    </span>
                    Pokémon-Auswahl
                  </label>
                  <span className="text-xs text-slate-400">
                    Welche Pokémon sollen anfangs enthalten sein?
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPopulateMode('all')}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      populateMode === 'all'
                        ? 'bg-slate-800/90 border-2 border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                        : 'bg-slate-950/60 hover:bg-slate-800/50 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        populateMode === 'all'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${populateMode === 'all' ? 'text-white' : 'text-slate-300'}`}>
                          Alle passenden Pokémon
                        </span>
                        {populateMode === 'all' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                            Aktiv
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Fügt direkt alle {matchingPokemonIds.length} Pokémon dieser Kategorie zur Liste hinzu.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPopulateMode('custom')}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      populateMode === 'custom'
                        ? 'bg-slate-800/90 border-2 border-blue-500 shadow-md ring-1 ring-blue-500/20'
                        : 'bg-slate-950/60 hover:bg-slate-800/50 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        populateMode === 'custom'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      <Bookmark className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${populateMode === 'custom' ? 'text-white' : 'text-slate-300'}`}>
                          Selbst auswählen
                        </span>
                        {populateMode === 'custom' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                            Aktiv
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Startet mit Checkliste: Du entscheidest per Klick genau, welche Pokémon drin sind.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Section 5: Sammlungs-Design & Benennung */}
              <div className="space-y-3.5 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-slate-400" />
                    5 · Design & Sammlungsname
                  </label>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    {populateMode === 'all' ? `${matchingPokemonIds.length} Pokémon zugeordnet` : 'Manuelle Auswahl'}
                  </span>
                </div>

                {/* Color Theme Selector */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-400 mr-1">Farbe:</span>
                  {COLOR_THEMES.map((c) => {
                    const isSelected = selectedColor === c.hex;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedColor(c.hex)}
                        className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                          isSelected ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-950' : 'hover:scale-110 opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.label}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>

                {/* Name Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setIsNameManuallyEdited(true);
                    }}
                    required
                    placeholder="z.B. Meine Schillernde Glücks-Sammlung"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  {isNameManuallyEdited && (
                    <button
                      type="button"
                      onClick={() => setIsNameManuallyEdited(false)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-emerald-400 font-semibold transition-colors"
                      title="Automatischen Namen wiederherstellen"
                    >
                      Auto
                    </button>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!name.trim() || isSubmitting}
                className="w-full py-3.5 font-bold text-sm text-white rounded-2xl shadow-lg disabled:opacity-50 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  backgroundColor: selectedColor,
                  boxShadow: `0 8px 25px ${selectedColor}40`
                }}
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>
                  {isSubmitting ? 'Wird gespeichert...' : `Sammlung "${name || 'Neu'}" anlegen`}
                </span>
              </button>
            </form>
          ) : (
            /* Tab 2: Existing Collections Management */
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Deine gespeicherten Listen ({collections.length})
                </h3>
                <div className="flex items-center gap-2">
                  {onDeleteAllCollections && collections.length > 0 && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (
                          window.confirm(
                            `Möchtest du wirklich ALLE ${collections.length} benutzerdefinierten Listen unwiderruflich löschen?\n\nDein Fang-Fortschritt (gefangene Pokémon/Formen) bleibt vollständig erhalten!`
                          )
                        ) {
                          await onDeleteAllCollections();
                        }
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer"
                      title="Alle eigenen Sammlungen löschen"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Alle löschen</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveTab('create')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Neue hinzufügen</span>
                  </button>
                </div>
              </div>

              {collections.length === 0 ? (
                <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40">
                  <FolderKanban className="w-10 h-10 text-slate-600 mx-auto mb-2.5 opacity-60" />
                  <p className="text-sm font-semibold text-slate-300">
                    Noch keine benutzerdefinierten Listen vorhanden
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Klicke auf "Sammlung konfigurieren", um deine erste maßgeschneiderte Pokédex-Liste anzulegen!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {collections.map((c) => {
                    const isActive = activeCollectionId === c.id;
                    const percent = c.totalItems > 0 ? Math.round((c.caughtItems / c.totalItems) * 100) : 0;

                    return (
                      <div
                        key={c.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isActive
                            ? 'bg-slate-800/90 border-2 shadow-lg ring-1 ring-white/10'
                            : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800'
                        }`}
                        style={{
                          borderColor: isActive ? c.color || '#10b981' : undefined
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div
                            onClick={() => {
                              onSelectCollection(c.id);
                              onClose();
                            }}
                            className="flex items-start gap-3 cursor-pointer flex-1 min-w-0"
                          >
                            <div
                              className="w-3.5 h-3.5 rounded-full shrink-0 mt-1 shadow-sm"
                              style={{ backgroundColor: c.color || '#10b981' }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-white truncate">
                                  {c.name}
                                </h4>
                                {isActive && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    Aktiver Filter
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {c.description || (c.categoryType ? `${c.categoryType.toUpperCase()} · ${c.variantMode === 'single' ? 'Basis-Spezies' : 'Multivarianten'}` : 'Custom Collection')}
                              </p>

                              {/* Progress bar */}
                              <div className="mt-2.5">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="font-mono text-slate-300 font-medium">
                                    {c.caughtItems} / {c.totalItems} gefangen
                                  </span>
                                  <span className="font-mono font-bold" style={{ color: c.color || '#10b981' }}>
                                    {percent}%
                                  </span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${percent}%`,
                                      backgroundColor: c.color || '#10b981'
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 ml-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                onOpenEditor(c);
                                onClose();
                              }}
                              className="px-3 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                              title="Einzelne Pokémon anpassen"
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Pokémon wählen</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Sammlung "${c.name}" wirklich löschen?`)) {
                                  onDeleteCollection(c.id);
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
                              title="Löschen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
