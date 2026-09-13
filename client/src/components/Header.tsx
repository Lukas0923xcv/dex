import React from 'react';
import { TrackingMode, CustomCollection, Theme, DashboardTabConfig } from '../types';
import { Sparkles, Zap, Layers, Bookmark, Settings, CheckCircle2, Sun, Moon, SlidersHorizontal, Flame, Plus } from 'lucide-react';

interface HeaderProps {
  mode: TrackingMode;
  onSelectMode: (mode: TrackingMode) => void;
  collections: CustomCollection[];
  activeCollectionId: string | null;
  onSelectCollection: (id: string) => void;
  onOpenCollectionsModal: () => void;
  onOpenCollectionEditor?: () => void;
  onOpenDashboardCustomizer?: () => void;
  onOpenSettingsModal: () => void;
  isBackendConnected: boolean;
  theme: Theme;
  onToggleTheme: () => void;
  dashboardTabs?: DashboardTabConfig[];
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onSelectMode,
  collections,
  activeCollectionId,
  onSelectCollection,
  onOpenCollectionsModal,
  onOpenCollectionEditor,
  onOpenDashboardCustomizer,
  onOpenSettingsModal,
  isBackendConnected,
  theme,
  onToggleTheme,
  dashboardTabs = []
}) => {
  const modes = [
    { id: 'standard' as TrackingMode, label: 'Standard Dex', icon: CheckCircle2 },
    { id: 'shiny' as TrackingMode, label: 'Shiny Dex', icon: Sparkles, color: 'text-amber-500 dark:text-amber-400' },
    { id: 'shadow' as TrackingMode, label: 'Crypto Dex', icon: Flame, color: 'text-purple-500 dark:text-purple-400' },
    { id: 'mega' as TrackingMode, label: 'Mega Dex', icon: Zap, color: 'text-rose-500 dark:text-rose-400' },
    { id: 'form' as TrackingMode, label: 'Alle Formen', icon: Layers, color: 'text-indigo-500 dark:text-indigo-400' },
    { id: 'costume' as TrackingMode, label: 'Kostüme', icon: Sparkles, color: 'text-pink-500 dark:text-pink-400' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 mb-6 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Top bar: Brand & Actions */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            {/* Pokéball Logo */}
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-b from-rose-500 to-rose-600 p-0.5 shadow-md shadow-rose-500/20 ring-2 ring-slate-200 dark:ring-slate-800 flex items-center justify-center shrink-0">
              <div className="w-full h-1/2 bg-rose-500 rounded-t-full" />
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-slate-900 dark:bg-slate-950 flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-900 dark:border-slate-950 shadow" />
              </div>
              <div className="w-full h-1/2 bg-white rounded-b-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  GO Dex Tracker
                </h1>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isBackendConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'
                    : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30'
                }`}>
                  {isBackendConnected ? '● SQLite Online' : '○ Offline Cache'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Fortschrittstracker für Pokémon GO · Sammlungen & Checklisten
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenCollectionsModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              title="Neue eigene Liste / Sammlung erstellen"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Neue Liste</span>
            </button>

            {onOpenDashboardCustomizer && (
              <button
                type="button"
                onClick={onOpenDashboardCustomizer}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 dark:border-purple-800 dark:text-purple-300 font-bold text-xs transition-all shadow-xs cursor-pointer"
                title="Dashboard anpassen: Tabs anordnen und eigene Listen anheften"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span className="hidden sm:inline">Dashboard anpassen</span>
              </button>
            )}

            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 dark:bg-slate-900/80 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-300 transition-colors shadow-xs cursor-pointer"
              title={theme === 'dark' ? 'Zu Standard Light Mode wechseln' : 'Zu Dark Mode wechseln'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            <button
              type="button"
              onClick={onOpenSettingsModal}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 dark:bg-slate-900/80 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors shadow-xs cursor-pointer"
              title="Datenbank & Backup Einstellungen"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tracking Category Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {(() => {
            const tabsToDisplay = (dashboardTabs && dashboardTabs.length > 0
              ? dashboardTabs
              : modes.map(m => ({ id: m.id, label: m.label, type: 'preset' as const, visible: true }))
            ).filter(t => t.visible && t.id !== 'custom');

            return tabsToDisplay.map((tab) => {
              if (tab.type === 'custom') {
                const coll = collections.find(c => c.id === tab.collectionId);
                const isActive = mode === 'custom' && activeCollectionId === tab.collectionId;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onSelectMode('custom');
                      if (tab.collectionId) {
                        onSelectCollection(tab.collectionId);
                      }
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/50'
                        : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 shadow-xs'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: coll?.color || tab.color || '#3b82f6' }}
                    />
                    <span>{coll ? coll.name : tab.label}</span>
                    {coll && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                          isActive
                            ? 'bg-blue-700/70 text-blue-100'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {coll.caughtItems}/{coll.totalItems}
                      </span>
                    )}
                  </button>
                );
              }

              // Preset tab
              const preset = modes.find(m => m.id === tab.id);
              const Icon = preset?.icon || CheckCircle2;
              const isActive = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectMode(tab.id as TrackingMode)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/50'
                      : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 shadow-xs'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : preset?.color || 'text-slate-400'}`} />
                  <span>{tab.label || preset?.label}</span>
                </button>
              );
            });
          })()}

          {/* Add New List Button directly on the main dashboard */}
          <button
            type="button"
            onClick={onOpenCollectionsModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:text-blue-300 border border-dashed border-blue-300 dark:border-blue-700/80 transition-all cursor-pointer whitespace-nowrap shadow-xs shrink-0"
            title="Neue eigene Liste / Sammlung erstellen"
          >
            <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>+ Neue Liste</span>
          </button>

          {onOpenDashboardCustomizer && (
            <button
              type="button"
              onClick={onOpenDashboardCustomizer}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100/70 dark:bg-slate-900/40 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700/80 transition-all cursor-pointer shrink-0 ml-auto"
              title="Dashboard anpassen: Tabs anordnen und eigene Listen anheften"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">Tabs anpassen</span>
            </button>
          )}
        </div>

        {/* Subheader when in Custom Collections mode */}
        {mode === 'custom' && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between gap-3 overflow-x-auto">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
              {collections.map((coll) => (
                <button
                  key={coll.id}
                  onClick={() => onSelectCollection(coll.id)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeCollectionId === coll.id
                      ? 'bg-blue-50 dark:bg-slate-800 text-blue-900 dark:text-white border border-blue-400 dark:border-blue-500/60 shadow-xs font-bold'
                      : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: coll.color || '#3b82f6' }}
                  />
                  <span>{coll.name}</span>
                  <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950/60 px-1.5 py-0.2 rounded">
                    {coll.caughtItems}/{coll.totalItems}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onOpenCollectionEditor && activeCollectionId && (
                <button
                  type="button"
                  onClick={onOpenCollectionEditor}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="Wähle genau aus, welche Pokémon in dieser Liste enthalten sein sollen"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Pokémon auswählen</span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenCollectionsModal}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                + Listen verwalten
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
