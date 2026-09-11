import React from 'react';
import { TrackingMode, CustomCollection } from '../types';
import { Sparkles, Zap, Layers, Bookmark, Settings, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  mode: TrackingMode;
  onSelectMode: (mode: TrackingMode) => void;
  collections: CustomCollection[];
  activeCollectionId: string | null;
  onSelectCollection: (id: string) => void;
  onOpenCollectionsModal: () => void;
  onOpenCollectionEditor?: () => void;
  onOpenSettingsModal: () => void;
  isBackendConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onSelectMode,
  collections,
  activeCollectionId,
  onSelectCollection,
  onOpenCollectionsModal,
  onOpenCollectionEditor,
  onOpenSettingsModal,
  isBackendConnected
}) => {
  const modes = [
    { id: 'standard' as TrackingMode, label: 'Standard Dex', icon: CheckCircle2 },
    { id: 'shiny' as TrackingMode, label: 'Shiny Dex', icon: Sparkles, color: 'text-amber-400' },
    { id: 'mega' as TrackingMode, label: 'Mega Dex', icon: Zap, color: 'text-rose-400' },
    { id: 'form' as TrackingMode, label: 'All Forms', icon: Layers, color: 'text-indigo-400' },
    { id: 'costume' as TrackingMode, label: 'Costumes', icon: Sparkles, color: 'text-pink-400' },
    { id: 'custom' as TrackingMode, label: 'Custom Lists', icon: Bookmark, color: 'text-blue-400' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Top bar: Brand & Actions */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            {/* Pokéball Logo */}
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-b from-rose-500 to-rose-600 p-0.5 shadow-md shadow-rose-500/20 ring-2 ring-slate-800 flex items-center justify-center shrink-0">
              <div className="w-full h-1/2 bg-rose-500 rounded-t-full" />
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-slate-950 flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-950 shadow" />
              </div>
              <div className="w-full h-1/2 bg-white rounded-b-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  GO Dex Tracker
                </h1>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isBackendConnected
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                }`}>
                  {isBackendConnected ? 'SQLite WAL' : 'GitHub Pages'}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Pokémon GO Collection & Living Dex Checklist
              </p>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettingsModal}
              title="Settings & Backup"
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl shadow-sm transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tracking Category Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {modes.map((m) => {
            const Icon = m.icon;
            const isActive = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMode(m.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/50'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : m.color || 'text-slate-400'}`} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Subheader when in Custom Collections mode */}
        {mode === 'custom' && (
          <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-3 overflow-x-auto">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
              {collections.map((coll) => (
                <button
                  key={coll.id}
                  onClick={() => onSelectCollection(coll.id)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeCollectionId === coll.id
                      ? 'bg-slate-800 text-white border border-blue-500/60 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: coll.color || '#3b82f6' }}
                  />
                  <span>{coll.name}</span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950/60 px-1.5 py-0.2 rounded">
                    {coll.caughtItems}/{coll.totalItems}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onOpenCollectionEditor && activeCollectionId && (
                <button
                  onClick={onOpenCollectionEditor}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Choose Pokémon</span>
                </button>
              )}
              <button
                onClick={onOpenCollectionsModal}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                + Manage Lists
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
