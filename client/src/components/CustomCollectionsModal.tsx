import React, { useState, useEffect } from 'react';
import { CustomCollection, CollectionCategoryType, CollectionVariantMode, Pokemon } from '../types';
import { X, Plus, Trash2, Bookmark } from 'lucide-react';

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
      pokemonIds?: string[];
    }
  ) => Promise<any>;
  onDeleteCollection: (id: string) => Promise<void>;
  onOpenEditor: (collection: CustomCollection) => void;
}

// Custom SVG Icons accurately styled after Pokémon GO
const NormalBallIcon: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 36 36" className={className} fill="none">
    <circle cx="18" cy="18" r="16" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
    <path d="M2 18 A16 16 0 0 1 34 18 Z" fill="#ef4444" />
    <line x1="2" y1="18" x2="34" y2="18" stroke="#1e293b" strokeWidth="2.5" />
    <circle cx="18" cy="18" r="5" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
    <circle cx="18" cy="18" r="2.5" fill="#ffffff" />
  </svg>
);

const EventHatIcon: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 36 36" className={className} fill="none">
    {/* Pokéball */}
    <circle cx="18" cy="20" r="13" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.2" />
    <path d="M5 20 A13 13 0 0 1 31 20 Z" fill="#ef4444" />
    <line x1="5" y1="20" x2="31" y2="20" stroke="#1e293b" strokeWidth="2.2" />
    <circle cx="18" cy="20" r="4" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.2" />
    <circle cx="18" cy="20" r="1.8" fill="#ffffff" />
    {/* Festive Party Hat */}
    <path d="M12 11 L18 1 L24 11 Z" fill="#10b981" stroke="#065f46" strokeWidth="1.2" />
    <path d="M14 8 L22 8" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M16 5 L20 5" stroke="#f43f5e" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="18" cy="1" r="2" fill="#fbbf24" />
  </svg>
);

const LuckyStarIcon: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 36 36" className={className} fill="none">
    {/* Sparkling starburst ring */}
    <circle cx="18" cy="18" r="16" fill="#fef9c3" fillOpacity="0.35" />
    <circle cx="18" cy="18" r="14" stroke="#eab308" strokeWidth="1.5" strokeDasharray="3 2" />
    {/* Golden Pokéball */}
    <circle cx="18" cy="18" r="11" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
    <path d="M7 18 A11 11 0 0 1 29 18 Z" fill="#eab308" />
    <line x1="7" y1="18" x2="29" y2="18" stroke="#ca8a04" strokeWidth="2" />
    <circle cx="18" cy="18" r="3.5" fill="#fef9c3" stroke="#ca8a04" strokeWidth="2" />
    {/* Sparkles */}
    <path d="M6 8 L8 6 L10 8 L8 10 Z" fill="#f59e0b" />
    <path d="M26 8 L28 6 L30 8 L28 10 Z" fill="#f59e0b" />
    <path d="M27 26 L29 24 L31 26 L29 28 Z" fill="#f59e0b" />
    <path d="M5 26 L7 24 L9 26 L7 28 Z" fill="#f59e0b" />
  </svg>
);

const MegaSwirlIcon: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 36 36" className={className} fill="none">
    <circle cx="18" cy="18" r="15" fill="#fdf2f8" stroke="#db2777" strokeWidth="2" />
    <path d="M3 18 A15 15 0 0 1 33 18 Z" fill="#f43f5e" />
    <line x1="3" y1="18" x2="33" y2="18" stroke="#db2777" strokeWidth="2" />
    <circle cx="18" cy="18" r="4.5" fill="#ffffff" stroke="#db2777" strokeWidth="2" />
    {/* DNA swirl in center */}
    <path d="M14 13 C16 11, 20 11, 22 13 C23 15, 21 17, 18 18 C15 19, 13 21, 14 23 C16 25, 20 25, 22 23" stroke="#ec4899" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const CryptoFlameIcon: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 36 36" className={className} fill="none">
    {/* Purple Shadow Flame */}
    <path d="M18 1 C19 5, 25 9, 23 14 C27 12, 28 16, 26 19 C23 23, 13 23, 10 19 C8 16, 9 12, 13 14 C11 9, 17 5, 18 1 Z" fill="#a855f7" fillOpacity="0.8" />
    <path d="M18 5 C19 8, 22 10, 21 13 C20 15, 16 15, 15 13 C14 11, 17 8, 18 5 Z" fill="#e9d5ff" />
    {/* Dark Shadow Ball */}
    <circle cx="18" cy="22" r="11" fill="#3b0764" stroke="#7e22ce" strokeWidth="2" />
    <path d="M7 22 A11 11 0 0 1 29 22 Z" fill="#6b21a8" />
    <line x1="7" y1="22" x2="29" y2="22" stroke="#4c1d95" strokeWidth="2" />
    <circle cx="18" cy="22" r="3.5" fill="#c084fc" stroke="#581c87" strokeWidth="1.5" />
    <circle cx="18" cy="22" r="1.5" fill="#ffffff" />
  </svg>
);

const PurifiedSunIcon: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 36 36" className={className} fill="none">
    {/* Radiant sunburst rays */}
    <circle cx="18" cy="18" r="16" fill="#ecfeff" fillOpacity="0.4" />
    <g stroke="#06b6d4" strokeWidth="1.8" strokeLinecap="round">
      <line x1="18" y1="2" x2="18" y2="5" />
      <line x1="18" y1="31" x2="18" y2="34" />
      <line x1="2" y1="18" x2="5" y2="18" />
      <line x1="31" y1="18" x2="34" y2="18" />
      <line x1="6.7" y1="6.7" x2="8.8" y2="8.8" />
      <line x1="27.2" y1="27.2" x2="29.3" y2="29.3" />
      <line x1="6.7" y1="29.3" x2="8.8" y2="27.2" />
      <line x1="27.2" y1="8.8" x2="29.3" y2="6.7" />
    </g>
    {/* Purified Pokéball */}
    <circle cx="18" cy="18" r="11" fill="#f0fdfa" stroke="#0891b2" strokeWidth="2" />
    <path d="M7 18 A11 11 0 0 1 29 18 Z" fill="#22d3ee" />
    <line x1="7" y1="18" x2="29" y2="18" stroke="#0891b2" strokeWidth="2" />
    <circle cx="18" cy="18" r="3.5" fill="#f0fdfa" stroke="#0891b2" strokeWidth="1.8" />
  </svg>
);

const DynamaxBallIcon: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 36 36" className={className} fill="none">
    <circle cx="18" cy="18" r="15" fill="#fdf2f8" stroke="#be185d" strokeWidth="2" />
    <path d="M3 18 A15 15 0 0 1 33 18 Z" fill="#db2777" />
    {/* Dynamax grid lines */}
    <path d="M7 11 Q18 16 29 11" stroke="#fbcfe8" strokeWidth="1.3" />
    <path d="M7 25 Q18 20 29 25" stroke="#fbcfe8" strokeWidth="1.3" />
    <line x1="3" y1="18" x2="33" y2="18" stroke="#be185d" strokeWidth="2" />
    <circle cx="18" cy="18" r="4.5" fill="#ffffff" stroke="#be185d" strokeWidth="2" />
    <circle cx="18" cy="18" r="2" fill="#db2777" />
  </svg>
);

const GigadynamaxBallIcon: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 36 36" className={className} fill="none">
    {/* Red energetic dynamax clouds */}
    <path d="M12 7 C10 7, 8 9, 9 11 C7 11, 5 13, 6 15 C8 15, 28 15, 30 15 C31 13, 29 11, 27 11 C28 9, 26 7, 24 7 C22 5, 14 5, 12 7 Z" fill="#e11d48" fillOpacity="0.4" />
    <circle cx="18" cy="20" r="13" fill="#fdf2f8" stroke="#9f1239" strokeWidth="2" />
    <path d="M5 20 A13 13 0 0 1 31 20 Z" fill="#e11d48" />
    <line x1="5" y1="20" x2="31" y2="20" stroke="#9f1239" strokeWidth="2" />
    <circle cx="18" cy="20" r="4" fill="#ffffff" stroke="#9f1239" strokeWidth="2" />
    {/* Gigantamax X pattern */}
    <path d="M16 18 L20 22 M20 18 L16 22" stroke="#e11d48" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Unown Glyph Icons for Multivariante vs Nicht-Variante
const UnownMultiIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 48 24" className={className} fill="currentColor">
    {/* Unown 1 */}
    <circle cx="8" cy="12" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="8" cy="12" r="2" />
    <line x1="8" y1="2" x2="8" y2="7" stroke="currentColor" strokeWidth="2" />
    <line x1="8" y1="17" x2="8" y2="22" stroke="currentColor" strokeWidth="2" />
    {/* Unown 2 (B) */}
    <circle cx="24" cy="9" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="24" cy="9" r="1.5" />
    <circle cx="24" cy="16" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="24" cy="16" r="1.5" />
    {/* Unown 3 (C) */}
    <circle cx="40" cy="12" r="5" stroke="currentColor" strokeWidth="2" strokeDasharray="26 6" fill="none" />
    <circle cx="40" cy="12" r="2" />
  </svg>
);

const UnownSingleIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2.2" fill="none" />
    <circle cx="12" cy="12" r="2.2" />
    <line x1="12" y1="2" x2="12" y2="7" stroke="currentColor" strokeWidth="2.2" />
    <line x1="12" y1="17" x2="12" y2="22" stroke="currentColor" strokeWidth="2.2" />
  </svg>
);

export const CustomCollectionsModal: React.FC<CustomCollectionsModalProps> = ({
  isOpen,
  onClose,
  collections,
  activeCollectionId,
  allPokemon = [],
  onSelectCollection,
  onCreateCollection,
  onDeleteCollection,
  onOpenEditor
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');

  // Form states matching screenshot
  const [categoryType, setCategoryType] = useState<CollectionCategoryType>('normal');
  const [variantMode, setVariantMode] = useState<CollectionVariantMode>('multi');
  const [trackShiny, setTrackShiny] = useState<boolean>(false);
  const [trackHundo, setTrackHundo] = useState<boolean>(false);
  const [trackGender, setTrackGender] = useState<boolean>(false);
  const [trackBackground, setTrackBackground] = useState<boolean>(false);
  const [trackSize, setTrackSize] = useState<boolean>(false);

  const [name, setName] = useState<string>('');
  const [isNameManuallyEdited, setIsNameManuallyEdited] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 8 Category Card Definitions
  const categoryCards: Array<{
    id: CollectionCategoryType;
    label: string;
    icon: React.FC<{ className?: string }>;
    color: string;
  }> = [
    { id: 'normal', label: 'Normal', icon: NormalBallIcon, color: '#10b981' },
    { id: 'event', label: 'Event', icon: EventHatIcon, color: '#ec4899' },
    { id: 'lucky', label: 'Glücks', icon: LuckyStarIcon, color: '#eab308' },
    { id: 'mega', label: 'Mega', icon: MegaSwirlIcon, color: '#f43f5e' },
    { id: 'shadow', label: 'Crypto', icon: CryptoFlameIcon, color: '#a855f7' },
    { id: 'purified', label: 'Erlöst', icon: PurifiedSunIcon, color: '#06b6d4' },
    { id: 'dynamax', label: 'Dynamax', icon: DynamaxBallIcon, color: '#db2777' },
    { id: 'gigantamax', label: 'Gigadynamax', icon: GigadynamaxBallIcon, color: '#e11d48' }
  ];

  // Auto-generate name based on choices if user hasn't typed custom name
  useEffect(() => {
    if (isNameManuallyEdited) return;

    const parts: string[] = [];
    if (trackShiny) parts.push('Schillernde');

    const catLabels: Record<CollectionCategoryType, string> = {
      normal: variantMode === 'multi' ? 'Multivarianten' : 'Standard',
      event: 'Event',
      lucky: 'Glücks',
      mega: 'Mega & Primal',
      shadow: 'Crypto',
      purified: 'Erlöste',
      dynamax: 'Dynamax',
      gigantamax: 'Gigadynamax'
    };
    parts.push(catLabels[categoryType]);

    if (trackHundo) parts.push('100%');
    parts.push('Sammlung');

    setName(parts.join(' '));
  }, [categoryType, variantMode, trackShiny, trackHundo, isNameManuallyEdited]);

  if (!isOpen) return null;

  // Gather matching Pokémon IDs based on category and variant mode
  const getMatchingPokemonIds = (): string[] => {
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
    } else {
      // Normal, Lucky, Shadow, Purified
      if (variantMode === 'single') {
        list = list.filter(p => p.category === 'standard');
      } else {
        list = list.filter(p => p.category === 'standard' || p.category === 'form');
      }
    }

    if (trackShiny && categoryType === 'normal') {
      list = list.filter(p => p.hasShiny);
    }

    return list.map(p => p.id);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const matchingIds = getMatchingPokemonIds();
      const currentCard = categoryCards.find(c => c.id === categoryType);

      const newColl = await onCreateCollection(
        name.trim(),
        `${categoryType.toUpperCase()} - ${variantMode === 'multi' ? 'Multivariante' : 'Nicht-Variante'}`,
        currentCard?.color || '#3b82f6',
        {
          categoryType,
          variantMode,
          trackShiny,
          trackHundo,
          trackGender,
          trackBackground,
          trackSize,
          pokemonIds: matchingIds
        }
      );

      onSelectCollection(newColl.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl shadow-black/90 overflow-hidden">
        {/* Header with Navigation Tabs */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'create'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm ring-1 ring-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              + Sammlung erstellen
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'list'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm ring-1 ring-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Meine Sammlungen ({collections.length})
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-slate-100 scrollbar-thin">
          {activeTab === 'create' ? (
            <form onSubmit={handleCreate} className="space-y-5">
              {/* Section 1: 8 Collection Type Cards (Grid matching screenshot) */}
              <div>
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  {categoryCards.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = categoryType === cat.id;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryType(cat.id)}
                        className={`flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-950/50 border-2 border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-200 shadow-lg shadow-emerald-950/50 scale-[1.02]'
                            : 'bg-slate-950/70 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        <Icon className="w-8 h-8 sm:w-9 sm:h-9 mb-1.5" />
                        <span className={`text-xs sm:text-sm tracking-tight ${isSelected ? 'font-bold text-emerald-200' : 'font-semibold'}`}>
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Pokédex-Modus */}
              <div className="space-y-2.5">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Pokédex-Modus
                </h3>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  {/* Multivariante */}
                  <button
                    type="button"
                    onClick={() => setVariantMode('multi')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      variantMode === 'multi'
                        ? 'bg-slate-800/90 border-2 border-emerald-500 text-white font-bold ring-2 ring-emerald-500/20 shadow-md'
                        : 'bg-slate-950/70 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <UnownMultiIcon className="w-9 h-7 mb-1 text-current" />
                    <span className="text-xs sm:text-sm font-semibold">Multivariante</span>
                  </button>

                  {/* Nicht-Variante */}
                  <button
                    type="button"
                    onClick={() => setVariantMode('single')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      variantMode === 'single'
                        ? 'bg-slate-800/90 border-2 border-emerald-500 text-white font-bold ring-2 ring-emerald-500/20 shadow-md'
                        : 'bg-slate-950/70 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <UnownSingleIcon className="w-7 h-7 mb-1 text-current" />
                    <span className="text-xs sm:text-sm font-semibold">Nicht-Variante</span>
                  </button>
                </div>

                {/* Explanatory callout box matching screenshot */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 text-xs text-slate-300 leading-relaxed">
                  {variantMode === 'multi'
                    ? 'Pokémon mit verschiedenen Formen wie Icognito, Formeo usw. erscheinen in all ihren Varianten. Die Sammlungszähler stimmen nicht mit dem Zähler im Spiel überein.'
                    : 'Nur die Basis-Variante jedes Pokémon wird angezeigt. Stimmt genau mit dem Pokédex-Zähler im Spiel überein.'}
                </div>
              </div>

              {/* Section 3: Weitere Merkmale (5 Toggle Rows) */}
              <div className="space-y-2.5">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Weitere Merkmale
                </h3>

                <div className="space-y-2">
                  {/* Row 1: Schillernd */}
                  <div className="flex items-center justify-between px-4 py-3.5 bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 rounded-2xl transition-all">
                    <span className="text-sm font-semibold text-slate-100">
                      Schillernd
                    </span>
                    <button
                      type="button"
                      onClick={() => setTrackShiny(!trackShiny)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        trackShiny ? 'bg-emerald-500 shadow-md shadow-emerald-500/30' : 'bg-slate-800 border border-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          trackShiny ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Row 2: Hundo (100%) */}
                  <div className="flex items-center justify-between px-4 py-3.5 bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 rounded-2xl transition-all">
                    <span className="text-sm font-semibold text-slate-100">
                      Hundo (100%)
                    </span>
                    <button
                      type="button"
                      onClick={() => setTrackHundo(!trackHundo)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        trackHundo ? 'bg-emerald-500 shadow-md shadow-emerald-500/30' : 'bg-slate-800 border border-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          trackHundo ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Row 3: Geschlecht */}
                  <div className="flex items-center justify-between px-4 py-3.5 bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 rounded-2xl transition-all">
                    <span className="text-sm font-semibold text-slate-100">
                      Geschlecht
                    </span>
                    <button
                      type="button"
                      onClick={() => setTrackGender(!trackGender)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        trackGender ? 'bg-emerald-500 shadow-md shadow-emerald-500/30' : 'bg-slate-800 border border-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          trackGender ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Row 4: Hintergrund (PRO) */}
                  <div className="flex items-center justify-between px-4 py-3.5 bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 rounded-2xl transition-all">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-100">
                        Hintergrund
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-wider uppercase">
                        ★ PRO
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTrackBackground(!trackBackground)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        trackBackground ? 'bg-emerald-500 shadow-md shadow-emerald-500/30' : 'bg-slate-800 border border-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          trackBackground ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Row 5: Größe (PRO) */}
                  <div className="flex items-center justify-between px-4 py-3.5 bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 rounded-2xl transition-all">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-100">
                        Größe
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-wider uppercase">
                        ★ PRO
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTrackSize(!trackSize)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        trackSize ? 'bg-emerald-500 shadow-md shadow-emerald-500/30' : 'bg-slate-800 border border-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          trackSize ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 4: Sammlungsname */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Sammlungsname
                </h3>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setIsNameManuallyEdited(true);
                  }}
                  required
                  placeholder="z.B. Meine Schillernde Glücks-Sammlung"
                  className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!name.trim() || isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:via-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{isSubmitting ? 'Wird erstellt...' : 'Sammlung erstellen'}</span>
              </button>
            </form>
          ) : (
            /* Tab 2: Existing Collections Management */
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Gespeicherte Sammlungen ({collections.length})
              </h3>

              {collections.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-6 text-center">
                  Noch keine benutzerdefinierten Sammlungen angelegt.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {collections.map((c) => {
                    const isActive = activeCollectionId === c.id;

                    return (
                      <div
                        key={c.id}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                          isActive
                            ? 'bg-slate-800/90 border-2 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/30'
                            : 'bg-slate-950/70 hover:bg-slate-800/70 border-slate-800'
                        }`}
                      >
                        <div
                          onClick={() => {
                            onSelectCollection(c.id);
                            onClose();
                          }}
                          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                        >
                          <div
                            className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: c.color || '#10b981' }}
                          />
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white truncate">
                              {c.name}
                            </h4>
                            <p className="text-xs text-slate-400 truncate">
                              {c.categoryType?.toUpperCase()} · {c.variantMode === 'single' ? 'Single Variant' : 'Multivariante'}
                            </p>
                            <p className="text-xs font-mono text-emerald-400 font-semibold mt-0.5">
                              {c.caughtItems} / {c.totalItems} gefangen
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-3">
                          <button
                            type="button"
                            onClick={() => {
                              onOpenEditor(c);
                              onClose();
                            }}
                            className="px-3 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="Pokémon manuell auswählen"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>Auswählen</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Sammlung "${c.name}" löschen?`)) {
                                onDeleteCollection(c.id);
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                            title="Löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
