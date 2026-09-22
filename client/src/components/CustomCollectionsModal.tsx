import React, { useState, useEffect, useMemo } from 'react';
import { CustomCollection, CollectionCategoryType, CollectionVariantMode, Pokemon, PRESET_COLLECTION_OPTIONS } from '../types';
import { REGION_OPTIONS, isPokemonInRegion, isGalarian, isAlolan, isHisuian, isPaldean } from '../utils/regions';
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
  FolderKanban,
  Globe,
  Download,
  Upload
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
  onExportCollection?: (collectionId: string) => Promise<any>;
  onImportBackup?: (backup: any, specificCollectionId?: string) => Promise<any>;
}

// Preset Accent Themes
const COLOR_THEMES = [
  { id: 'emerald', hex: '#10b981', label: 'Emerald' },
  { id: 'sky', hex: '#0284c7', label: 'Sky Blue' },
  { id: 'amber', hex: '#f59e0b', label: 'Amber' },
  { id: 'purple', hex: '#9333ea', label: 'Amethyst' },
  { id: 'rose', hex: '#f43f5e', label: 'Ruby' },
  { id: 'teal', hex: '#0d9488', label: 'Teal' },
  { id: 'indigo', hex: '#6366f1', label: 'Indigo' },
  { id: 'crimson', hex: '#dc2626', label: 'Crimson' },
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
  onOpenEditor,
  onExportCollection,
  onImportBackup
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');

  const handleExportSingleCollection = async (coll: CustomCollection) => {
    try {
      if (!onExportCollection) return;
      const data = await onExportCollection(coll.id);
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      const safeName = coll.name.toLowerCase().replace(/[^a-z0-9]/gi, '_');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `pogo-collection-${safeName}-${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const handleExportPresetCollection = async (presetId: string) => {
    try {
      if (!onExportCollection) return;
      const data = await onExportCollection(presetId);
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      const safeKey = presetId.replace(/^preset:/, '');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `pogo-preset-${safeKey}-${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const handleImportCollectionFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.app || !json.data) {
          throw new Error('Invalid backup file format.');
        }
        if (onImportBackup) {
          const res = await onImportBackup(json);
          alert(`Collection "${res?.collectionName || 'Collection'}" imported successfully!`);
        }
      } catch (err: any) {
        alert(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Form states
  const [selectedRegion, setSelectedRegion] = useState<number | 'all'>('all');
  const [categoryType, setCategoryType] = useState<CollectionCategoryType>('normal');
  const [variantMode, setVariantMode] = useState<CollectionVariantMode>('multi');
  const [includeForms, setIncludeForms] = useState<boolean>(true);
  const [includeCostumes, setIncludeCostumes] = useState<boolean>(true);
  const [includeGenderForms, setIncludeGenderForms] = useState<boolean>(true);
  const [filterOnlyShiny, setFilterOnlyShiny] = useState<boolean>(false);
  const [trackShiny, setTrackShiny] = useState<boolean>(true);
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
      subtitle: 'Regular Species',
      icon: Layers,
      accentHex: '#10b981'
    },
    {
      id: 'event',
      label: 'Event Costumes',
      subtitle: 'Hats & Specials',
      icon: Gift,
      accentHex: '#ec4899'
    },
    {
      id: 'lucky',
      label: 'Lucky Goals',
      subtitle: 'Lucky Pokémon',
      icon: Sparkles,
      accentHex: '#eab308'
    },
    {
      id: 'mega',
      label: 'Mega & Primal',
      subtitle: 'Mega Evolutions',
      icon: Zap,
      accentHex: '#f97316'
    },
    {
      id: 'shadow',
      label: 'Shadow',
      subtitle: 'Shadow Pokémon',
      icon: Flame,
      accentHex: '#a855f7'
    },
    {
      id: 'purified',
      label: 'Purified',
      subtitle: 'Purified Aura',
      icon: Sun,
      accentHex: '#06b6d4'
    },
    {
      id: 'dynamax',
      label: 'Dynamax',
      subtitle: 'Power Spot Catches',
      icon: Maximize2,
      accentHex: '#d946ef'
    },
    {
      id: 'gigantamax',
      label: 'Gigantamax',
      subtitle: 'Gigantamax Special Forms',
      icon: CloudLightning,
      accentHex: '#ef4444'
    }
  ];

  // Auto-generate name based on choices if user hasn't typed custom name
  useEffect(() => {
    if (isNameManuallyEdited) return;

    const regObj = REGION_OPTIONS.find(r => r.id === selectedRegion);
    const regLabel = regObj && regObj.id !== 'all' ? regObj.shortLabel : '';

    const parts: string[] = [];
    if (regLabel) parts.push(regLabel);

    if (filterOnlyShiny) {
      parts.push('Shiny');
    } else if (trackShiny) {
      parts.push('Shiny');
    }

    const catLabels: Record<CollectionCategoryType, string> = {
      normal: variantMode === 'multi' ? (includeForms ? 'Forms' : 'Base') : 'Standard',
      event: 'Costumes',
      lucky: 'Lucky',
      mega: 'Mega & Primal',
      shadow: 'Shadow',
      purified: 'Purified',
      dynamax: 'Dynamax',
      gigantamax: 'Gigantamax'
    };
    parts.push(catLabels[categoryType]);

    if (includeCostumes && categoryType !== 'event' && variantMode === 'multi') {
      parts.push('& Costumes');
    }

    if (trackHundo) parts.push('100% IV');
    parts.push('Collection');

    setName(parts.join(' '));
  }, [categoryType, selectedRegion, variantMode, includeForms, includeCostumes, filterOnlyShiny, trackShiny, trackHundo, isNameManuallyEdited]);

  // Gather matching Pokémon IDs based on category, region, and variant mode
  const matchingPokemonIds = useMemo(() => {
    let list = [...allPokemon];

    if (selectedRegion !== 'all') {
      list = list.filter(p => isPokemonInRegion(p, selectedRegion));
    }

    const isRegionalForm = (p: Pokemon) => isGalarian(p) || isAlolan(p) || isHisuian(p) || isPaldean(p);

    if (categoryType === 'mega') {
      list = list.filter(p => p.category === 'mega' || p.isMega);
    } else if (categoryType === 'event') {
      list = list.filter(p => p.category === 'costume' || p.isCostume);
    } else if (categoryType === 'dynamax' || categoryType === 'gigantamax') {
      if (variantMode === 'single' || !includeForms) {
        list = list.filter(p => p.category === 'standard' || (selectedRegion !== 'all' && isRegionalForm(p)));
      } else {
        list = list.filter(p => p.category === 'standard' || p.category === 'form');
      }
    } else if (categoryType === 'shadow' || categoryType === 'purified') {
      list = list.filter(p => p.hasShadow);
      if (variantMode === 'single' || !includeForms) {
        list = list.filter(p => p.category === 'standard' || (selectedRegion !== 'all' && isRegionalForm(p)));
      } else {
        list = list.filter(p => p.category === 'standard' || p.category === 'form');
      }
    } else {
      // Normal, Lucky
      if (variantMode === 'single') {
        list = list.filter(p => p.category === 'standard' || (selectedRegion !== 'all' && isRegionalForm(p)));
        // For single variant mode, ensure 1 unique entry per species/dexNr
        const seen = new Set<number>();
        list = list.filter(p => {
          if (seen.has(p.dexNr)) return false;
          seen.add(p.dexNr);
          return true;
        });
      } else {
        list = list.filter(p => {
          if (p.category === 'standard') return true;
          if (p.category === 'form') return includeForms;
          if (p.category === 'costume' || p.isCostume) return includeCostumes;
          return false;
        });
      }
    }

    if (variantMode === 'multi' && !includeGenderForms) {
      list = list.filter(p => !p.isGenderDifference);
    }

    if (filterOnlyShiny) {
      list = list.filter(p => p.hasShiny);
    }

    return list.map(p => p.id);
  }, [allPokemon, categoryType, selectedRegion, variantMode, includeForms, includeCostumes, includeGenderForms, filterOnlyShiny]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const subLabel = variantMode === 'multi' ? 'Multi-variants' : 'Base Species';
      const regLabel = selectedRegion !== 'all' ? ` · ${REGION_OPTIONS.find(r => r.id === selectedRegion)?.shortLabel}` : '';
      const initialPokemonIds = populateMode === 'all' ? matchingPokemonIds : [];
      const newColl = await onCreateCollection(
        name.trim(),
        `${categoryType.toUpperCase()}${regLabel} · ${subLabel}`,
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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900/95 border border-slate-800/90 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl shadow-black/95 overflow-hidden ring-1 ring-white/10"
      >
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
                Collection Studio
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Custom Dex
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Create custom Pokédex trackers or manage your custom lists
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Close"
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
              <span>Configure Collection</span>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span>Saved Collections</span>
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
              {/* Section 1: Region & Herkunft (1-Klick Auswahl) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40 inline-flex items-center justify-center text-xs font-mono">
                      1
                    </span>
                    Select Region & Origin (1-Click Selection)
                  </label>
                  <span className="text-xs text-slate-400">
                    {selectedRegion === 'all'
                      ? 'Entire Pokédex'
                      : `${REGION_OPTIONS.find(r => r.id === selectedRegion)?.name}`}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {REGION_OPTIONS.map((reg) => {
                    const isSelected = selectedRegion === reg.id;
                    return (
                      <button
                        key={String(reg.id)}
                        type="button"
                        onClick={() => setSelectedRegion(reg.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/20 border-2 border-blue-500 text-white shadow-md ring-1 ring-blue-500/30'
                            : 'bg-slate-950/60 hover:bg-slate-800/50 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-base">{reg.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {reg.shortLabel}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {reg.id === 'all' ? 'All' : reg.id === 8 ? 'incl. Forms' : reg.id === 85 ? 'Hisui' : `Gen ${reg.id}`}
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>

                {selectedRegion !== 'all' && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-between text-xs text-blue-200">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">
                        {REGION_OPTIONS.find(r => r.id === selectedRegion)?.icon}
                      </span>
                      <div>
                        <div className="font-bold text-white">
                          {REGION_OPTIONS.find(r => r.id === selectedRegion)?.name} selected
                        </div>
                        <div className="text-blue-300/80 text-[11px]">
                          {selectedRegion === 8
                            ? 'Includes Galar species (#810-#898), Galarian regional forms (Galarian Ponyta, Galarian Zigzagoon, etc.), and Galar costumes.'
                            : `Filters collection entries to Pokémon from ${REGION_OPTIONS.find(r => r.id === selectedRegion)?.shortLabel}.`}
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 font-mono font-bold text-xs shrink-0">
                      {matchingPokemonIds.length} Pokémon
                    </span>
                  </div>
                )}
              </div>

              {/* Section 2: Category Focus */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 inline-flex items-center justify-center text-xs font-mono">
                      2
                    </span>
                    Choose Category Focus
                  </label>
                  <span className="text-xs text-slate-400">
                    What kind of Pokémon do you want to track?
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

              {/* Section 3: Forms, Events & Variants */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 inline-flex items-center justify-center text-xs font-mono">
                      3
                    </span>
                    Forms & Event Costumes
                  </label>
                  <span className="text-xs text-slate-400">
                    Control forms, costumes, and gender differences
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Multi-variant */}
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
                          All Forms & Variants
                        </span>
                        {variantMode === 'multi' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Tracks Alola, Galar, Hisui, Paldea, Vivillon, Unown, etc. as individual collection entries.
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
                          Base Species Only
                        </span>
                        {variantMode === 'single' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Exactly 1 entry per Pokédex number. Exactly matches the in-game count.
                      </p>
                    </div>
                  </button>
                </div>

                {/* Granular Toggles when in Multi Variant Mode */}
                {variantMode === 'multi' && (
                  <div className="space-y-2 pt-1">
                    {/* Forms Toggle */}
                    <div
                      onClick={() => setIncludeForms(!includeForms)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        includeForms
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                          : 'bg-slate-950/60 hover:bg-slate-800/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl text-base ${includeForms ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-900 text-slate-500'}`}>
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-semibold text-white">
                            Include All Forms & Regional Variants
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {selectedRegion === 8
                              ? 'Regional forms (Galarian Ponyta, Galarian Zigzagoon, Galarian Corsola, etc.) and alternate forms'
                              : 'Track regional forms (Alola, Galar, Hisui, Paldea) and special forms'}
                          </div>
                        </div>
                      </div>
                      <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${includeForms ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${includeForms ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                    </div>

                    {/* Event Costumes Toggle */}
                    <div
                      onClick={() => setIncludeCostumes(!includeCostumes)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        includeCostumes
                          ? 'bg-purple-500/10 border-purple-500/40 text-white'
                          : 'bg-slate-950/60 hover:bg-slate-800/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl text-base ${includeCostumes ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-900 text-slate-500'}`}>
                          <Gift className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-semibold text-white">
                            Include Event Costumes & Hats
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {selectedRegion === 8
                              ? '6 Galar costumes (Meloetta Hat Ponyta, Sunglasses Corsola, Holiday Wooloo, etc.)'
                              : 'Add event and holiday costumes to this collection'}
                          </div>
                        </div>
                      </div>
                      <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${includeCostumes ? 'bg-purple-500' : 'bg-slate-800'}`}>
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${includeCostumes ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                    </div>

                    {/* Gender Difference Forms Toggle */}
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
                            Include Gender Forms (♀ differences)
                          </div>
                          <div className="text-[11px] text-slate-400">
                            98 visual gender differences (Pikachu ♀, Wobbuffet ♀, Indeedee ♀, etc.) as separate collection entries
                          </div>
                        </div>
                      </div>
                      <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${includeGenderForms ? 'bg-pink-500' : 'bg-slate-800'}`}>
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${includeGenderForms ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 4: Shiny Filter & Tracking Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 inline-flex items-center justify-center text-xs font-mono">
                      4
                    </span>
                    Shiny Filter & Tracking Options
                  </label>
                  <span className="text-xs text-slate-400">
                    Availability & Card Criteria
                  </span>
                </div>

                {/* Shiny Availability Filter Toggle */}
                <div
                  onClick={() => {
                    const next = !filterOnlyShiny;
                    setFilterOnlyShiny(next);
                    if (next) setTrackShiny(true);
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    filterOnlyShiny
                      ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-md'
                      : 'bg-slate-950/60 hover:bg-slate-800/40 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl text-base ${filterOnlyShiny ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-900 text-slate-400'}`}>
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                          <span>Include only shiny-available Pokémon (Shiny Checklist)</span>
                          {filterOnlyShiny && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {filterOnlyShiny
                            ? `✨ Active: Excludes unreleased shinies. Adds only the ${matchingPokemonIds.length} shinies catchable in GO.`
                            : `🌐 Inactive: Adds all ${matchingPokemonIds.length} Pokémon from selection (both shiny and regular).`}
                        </div>
                      </div>
                    </div>
                    <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${filterOnlyShiny ? 'bg-amber-500' : 'bg-slate-800'}`}>
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${filterOnlyShiny ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>
                </div>

                {/* Card Tracking Dimensions */}
                <div className="text-xs font-semibold text-slate-400 pt-2 flex items-center justify-between">
                  <span>Enable Card Tracking (Fields on Pokédex cards):</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Check criteria separately
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Shiny */}
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
                        <div className="text-sm font-semibold text-white">Shiny</div>
                        <div className="text-[11px] text-slate-400">Track glittering shinies separately</div>
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
                        <div className="text-[11px] text-slate-400">Perfect 15/15/15 appraisal</div>
                      </div>
                    </div>
                    <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${trackHundo ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${trackHundo ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {/* Gender */}
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
                        <div className="text-sm font-semibold text-white">Gender (♂ / ♀)</div>
                        <div className="text-[11px] text-slate-400">Male and Female separately</div>
                      </div>
                    </div>
                    <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${trackGender ? 'bg-blue-500' : 'bg-slate-800'}`}>
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${trackGender ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {/* Size Records */}
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
                        <div className="text-sm font-semibold text-white">Size Records (XXS & XXL)</div>
                        <div className="text-[11px] text-slate-400">Track tiny XXS and giant XXL records in Pokédex</div>
                      </div>
                    </div>
                    <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${trackSize ? 'bg-rose-500' : 'bg-slate-800'}`}>
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${trackSize ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Pokémon Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 inline-flex items-center justify-center text-xs font-mono">
                      5
                    </span>
                    Pokémon Selection
                  </label>
                  <span className="text-xs text-slate-400">
                    Which Pokémon should be included initially?
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
                          All Matching Pokémon
                        </span>
                        {populateMode === 'all' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {selectedRegion !== 'all'
                          ? `Adds all ${matchingPokemonIds.length} Pokémon of the ${REGION_OPTIONS.find(r => r.id === selectedRegion)?.name} region (${filterOnlyShiny ? 'only shiny available' : 'both shiny and regular'}${includeForms ? ', incl. forms' : ''}${includeCostumes ? ' & costumes' : ''}) directly to the list.`
                          : `Adds all ${matchingPokemonIds.length} Pokémon from this selection (${filterOnlyShiny ? 'only shiny available' : 'all variants'}) directly to the list.`}
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
                          Choose Manually
                        </span>
                        {populateMode === 'custom' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Start with checklist: Select exactly which Pokémon to include.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Section 6: Design & Naming */}
              <div className="space-y-3.5 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-slate-400" />
                    6 · Design & Collection Name
                  </label>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    {populateMode === 'all' ? `${matchingPokemonIds.length} Pokémon assigned` : 'Manual Selection'}
                  </span>
                </div>

                {/* Color Theme Selector */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-400 mr-1">Color:</span>
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
                    placeholder="e.g. My Shiny Lucky Collection"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  {isNameManuallyEdited && (
                    <button
                      type="button"
                      onClick={() => setIsNameManuallyEdited(false)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-emerald-400 font-semibold transition-colors"
                      title="Restore automatic name"
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
                  {isSubmitting ? 'Saving...' : `Create collection "${name || 'New'}"`}
                </span>
              </button>
            </form>
          ) : (
            /* Tab 2: Existing Collections Management */
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Your saved lists ({collections.length})
                </h3>
                <div className="flex items-center gap-2">
                  {onImportBackup && (
                    <label
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all cursor-pointer"
                      title="Import collection from a JSON file"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Import</span>
                      <input
                        type="file"
                        accept=".json,application/json"
                        onChange={handleImportCollectionFile}
                        className="hidden"
                      />
                    </label>
                  )}
                  {onDeleteAllCollections && collections.length > 0 && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (
                          window.confirm(
                            `Are you sure you want to delete ALL ${collections.length} custom lists?\n\nYour catch progress (caught Pokémon/forms) will be completely preserved!`
                          )
                        ) {
                          await onDeleteAllCollections();
                        }
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer"
                      title="Delete all custom collections"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Delete all</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveTab('create')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add new</span>
                  </button>
                </div>
              </div>

              {/* Preset Dexes Quick Export */}
              {onExportCollection && (
                <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Export Preset Dexes
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Backup default categories as JSON
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRESET_COLLECTION_OPTIONS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleExportPresetCollection(preset.id)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer group shadow-xs"
                        title={`Export "${preset.name}" as JSON`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: preset.color }}
                          />
                          <span className="truncate">{preset.name}</span>
                        </div>
                        <Download className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {collections.length === 0 ? (
                <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40">
                  <FolderKanban className="w-10 h-10 text-slate-600 mx-auto mb-2.5 opacity-60" />
                  <p className="text-sm font-semibold text-slate-300">
                    No custom lists created yet
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Click "Configure Collection" to create your first customized Pokédex checklist!
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
                                    Active Filter
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {c.description || (c.categoryType ? `${c.categoryType.toUpperCase()} · ${c.variantMode === 'single' ? 'Base Species' : 'Multi-variants'}` : 'Custom Collection')}
                              </p>

                              {/* Progress bar */}
                              <div className="mt-2.5">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="font-mono text-slate-300 font-medium">
                                    {c.caughtItems} / {c.totalItems} caught
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
                            {onExportCollection && (
                              <button
                                type="button"
                                onClick={() => handleExportSingleCollection(c)}
                                className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
                                title="Export this collection as JSON"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                onOpenEditor(c);
                                onClose();
                              }}
                              className="px-3 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                              title="Customize individual Pokémon"
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Select Pokémon</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete collection "${c.name}"?`)) {
                                  onDeleteCollection(c.id);
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
                              title="Delete"
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
