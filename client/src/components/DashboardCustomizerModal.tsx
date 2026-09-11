import React, { useState } from 'react';
import { CustomCollection, DashboardTabConfig } from '../types';
import { X, CheckCircle2, Sparkles, Zap, Layers, Bookmark, ArrowUp, ArrowDown, RotateCcw, Pin, Eye, EyeOff } from 'lucide-react';

interface DashboardCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: CustomCollection[];
  currentTabs: DashboardTabConfig[];
  onSaveTabs: (tabs: DashboardTabConfig[]) => void;
}

export const DashboardCustomizerModal: React.FC<DashboardCustomizerModalProps> = ({
  isOpen,
  onClose,
  collections,
  currentTabs,
  onSaveTabs
}) => {
  const [tabs, setTabs] = useState<DashboardTabConfig[]>(() => {
    const list = [...currentTabs];
    const existingCollIds = new Set(
      list.filter(t => t.type === 'custom' && t.collectionId).map(t => t.collectionId)
    );

    for (const coll of collections) {
      if (!existingCollIds.has(coll.id)) {
        list.push({
          id: `custom:${coll.id}`,
          label: coll.name,
          type: 'custom',
          collectionId: coll.id,
          visible: false,
          color: coll.color || '#3b82f6'
        });
      }
    }
    return list;
  });

  React.useEffect(() => {
    if (isOpen) {
      const list = [...currentTabs];
      const existingCollIds = new Set(
        list.filter(t => t.type === 'custom' && t.collectionId).map(t => t.collectionId)
      );

      for (const coll of collections) {
        if (!existingCollIds.has(coll.id)) {
          list.push({
            id: `custom:${coll.id}`,
            label: coll.name,
            type: 'custom',
            collectionId: coll.id,
            visible: false,
            color: coll.color || '#3b82f6'
          });
        }
      }
      setTabs(list);
    }
  }, [isOpen, currentTabs, collections]);

  if (!isOpen) return null;

  const toggleTabVisibility = (id: string) => {
    setTabs(prev =>
      prev.map(t => (t.id === id ? { ...t, visible: !t.visible } : t))
    );
  };

  const moveTabUp = (index: number) => {
    if (index === 0) return;
    setTabs(prev => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const moveTabDown = (index: number) => {
    if (index >= tabs.length - 1) return;
    setTabs(prev => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleReset = () => {
    const defaults: DashboardTabConfig[] = [
      { id: 'standard', label: 'Standard Dex', type: 'preset', visible: true },
      { id: 'shiny', label: 'Shiny Dex', type: 'preset', visible: true, color: '#f59e0b' },
      { id: 'mega', label: 'Mega Dex', type: 'preset', visible: true, color: '#f43f5e' },
      { id: 'form', label: 'Alle Formen', type: 'preset', visible: true, color: '#6366f1' },
      { id: 'costume', label: 'Kostüme', type: 'preset', visible: true, color: '#ec4899' },
      { id: 'custom', label: 'Eigene Listen', type: 'preset', visible: true, color: '#3b82f6' },
    ];
    for (const coll of collections) {
      defaults.push({
        id: `custom:${coll.id}`,
        label: coll.name,
        type: 'custom',
        collectionId: coll.id,
        visible: false,
        color: coll.color || '#3b82f6'
      });
    }
    setTabs(defaults);
  };

  const handleSave = () => {
    onSaveTabs(tabs);
    onClose();
  };

  const visibleTabs = tabs.filter(t => t.visible);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 dark:bg-slate-950/85 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Pin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Dashboard anpassen
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Wähle aus, welche Presets und eigenen Listen direkt als Tabs in der Hauptleiste erscheinen
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
            Vorschau der Haupt-Navigation:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {visibleTabs.map((t, idx) => (
              <div
                key={t.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border ${
                  idx === 0
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                }`}
              >
                {t.type === 'custom' && (
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: t.color || '#3b82f6' }}
                  />
                )}
                <span>{t.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-700">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Eigene Listen</span>
            </div>
          </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* Presets Section */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Standard-Kategorien (Presets)
            </h3>
            <div className="space-y-1.5">
              {tabs
                .filter(t => t.type === 'preset')
                .map((tab) => {
                  return (
                    <div
                      key={tab.id}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        tab.visible
                          ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/80 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {tab.id === 'standard' && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                          {tab.id === 'shiny' && <Sparkles className="w-4 h-4 text-amber-500" />}
                          {tab.id === 'mega' && <Zap className="w-4 h-4 text-rose-500" />}
                          {tab.id === 'form' && <Layers className="w-4 h-4 text-indigo-500" />}
                          {tab.id === 'costume' && <Sparkles className="w-4 h-4 text-pink-500" />}
                          {tab.id === 'custom' && <Bookmark className="w-4 h-4 text-blue-500" />}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">
                            {tab.label}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {tab.id === 'standard' && 'Offizielle 1.025 Basis-Spezies'}
                            {tab.id === 'shiny' && 'Nur freigeschaltete Schillernde Varianten'}
                            {tab.id === 'mega' && 'Mega- & Protomorphose-Entwicklungen'}
                            {tab.id === 'form' && 'Regionale & alternative Formen'}
                            {tab.id === 'costume' && 'Event- & Kostüm-Pokémon'}
                            {tab.id === 'custom' && 'Eigene Listen & Checklisten'}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleTabVisibility(tab.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          tab.visible
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {tab.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{tab.visible ? 'Sichtbar' : 'Versteckt'}</span>
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Custom Collections Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Eigene Sammlungen anheften ({collections.length})
              </h3>
              <span className="text-[11px] text-slate-400">
                Erscheinen direkt als Tabs auf deinem Dashboard
              </span>
            </div>

            {collections.length === 0 ? (
              <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-xs text-slate-400">
                Noch keine eigenen Sammlungen erstellt. Erstelle zuerst eine unter „Eigene Listen“.
              </div>
            ) : (
              <div className="space-y-2">
                {tabs
                  .filter(t => t.type === 'custom')
                  .map((tab) => {
                    const coll = collections.find(c => c.id === tab.collectionId);
                    return (
                      <div
                        key={tab.id}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                          tab.visible
                            ? 'bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-600/60 shadow-xs ring-1 ring-blue-500/20'
                            : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: tab.color || coll?.color || '#3b82f6' }}
                          />
                          <div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{tab.label}</span>
                              {coll?.categoryType && (
                                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                  {coll.categoryType}
                                </span>
                              )}
                            </div>
                            {coll && (
                              <div className="text-[11px] text-slate-400">
                                {coll.caughtItems} / {coll.totalItems} gefangen
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Up / Down Reorder */}
                          {tab.visible && (
                            <div className="flex items-center gap-1 mr-2">
                              <button
                                type="button"
                                onClick={() => moveTabUp(tabs.indexOf(tab))}
                                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                                title="Nach links / vorne verschieben"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveTabDown(tabs.indexOf(tab))}
                                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                                title="Nach rechts / hinten verschieben"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => toggleTabVisibility(tab.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                              tab.visible
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <Pin className="w-3.5 h-3.5" />
                            <span>{tab.visible ? 'Angeheftet' : 'Anheften'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Zurücksetzen</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              Änderungen speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
