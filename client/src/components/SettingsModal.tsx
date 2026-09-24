import React, { useState, useEffect } from 'react';
import { StorageStatus, storage } from '../services/storage';
import { BackupData, SingleCollectionBackup, CustomCollection, PRESET_COLLECTION_OPTIONS } from '../types';
import { X, Download, Upload, RefreshCw, Server, AlertTriangle, CheckCircle2, ShieldCheck, Trash2, Smartphone, Sparkles } from 'lucide-react';
import { isRunningStandalone } from '../registerServiceWorker';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  storageStatus: StorageStatus;
  collections?: CustomCollection[];
  onExport: (collectionId?: string) => Promise<BackupData | SingleCollectionBackup>;
  onImport: (backup: any, specificCollectionId?: string) => Promise<any>;
  onReset: () => void;
  onResetScope?: () => void;
  onDeleteAllCollections?: () => Promise<void>;
  onOpenInstallModal?: () => void;
  activeAccountName?: string;
  activeScopeName?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  storageStatus,
  collections = [],
  onExport,
  onImport,
  onReset,
  onResetScope,
  onDeleteAllCollections,
  onOpenInstallModal,
  activeAccountName = 'Haupt-Account',
  activeScopeName = 'Standard Dex'
}) => {
  const [remoteUrl, setRemoteUrl] = useState(storageStatus.backendUrl || '');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Export State
  const [exportScope, setExportScope] = useState<'all' | 'collection'>('all');
  const [selectedExportCollId, setSelectedExportCollId] = useState<string>('preset:standard');

  // Import State
  const [pendingImport, setPendingImport] = useState<{
    backup: any;
    isSingle: boolean;
    collectionsList: Array<{ id: string; name: string }>;
    selectedCollId: string;
    mode: 'all' | 'collection';
  } | null>(null);

  useEffect(() => {
    if (!selectedExportCollId) {
      setSelectedExportCollId('preset:standard');
    }
  }, [selectedExportCollId]);

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

  // Handle file download
  const handleExport = async () => {
    try {
      const isSingle = exportScope === 'collection' && selectedExportCollId;
      const data = await onExport(isSingle ? selectedExportCollId : undefined);
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);

      let filename = `pogo-dex-backup-${dateStr}.json`;
      if (isSingle) {
        if (selectedExportCollId.startsWith('preset:')) {
          const presetKey = selectedExportCollId.replace(/^preset:/, '');
          const preset = PRESET_COLLECTION_OPTIONS.find(p => p.id === selectedExportCollId);
          filename = `pogo-preset-${preset?.scope || presetKey}-${dateStr}.json`;
        } else {
          const coll = collections.find(c => c.id === selectedExportCollId);
          const safeName = coll ? coll.name.toLowerCase().replace(/[^a-z0-9]/gi, '_') : 'collection';
          filename = `pogo-collection-${safeName}-${dateStr}.json`;
        }
      }

      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  // Handle file import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.app || !json.data) {
          throw new Error('Invalid backup file format.');
        }

        const isSingle = json.type === 'collection' || Boolean(json.data.collection);
        const collList: Array<{ id: string; name: string }> = [];
        if (json.data.collection) {
          collList.push({ id: json.data.collection.id, name: json.data.collection.name });
        }
        if (Array.isArray(json.data.collections)) {
          for (const c of json.data.collections) {
            if (!collList.some(existing => existing.id === c.id)) {
              collList.push({ id: c.id, name: c.name });
            }
          }
        }

        setPendingImport({
          backup: json,
          isSingle,
          collectionsList: collList,
          selectedCollId: collList[0]?.id || '',
          mode: isSingle ? 'collection' : 'all'
        });
      } catch (err: any) {
        alert(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmImport = async () => {
    if (!pendingImport) return;
    try {
      const specificId = pendingImport.mode === 'collection' ? pendingImport.selectedCollId : undefined;
      const res = await onImport(pendingImport.backup, specificId);
      const msg = res?.mode === 'collection' || pendingImport.mode === 'collection'
        ? `Collection "${res?.collectionName || 'Collection'}" imported successfully!`
        : 'Entire backup restored successfully!';
      setImportStatus(msg);
      setPendingImport(null);
      setTimeout(() => setImportStatus(null), 4000);
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    }
  };

  const handleSaveRemoteUrl = () => {
    storage.setCustomBackendUrl(remoteUrl);
    window.location.reload();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Settings & Data Backup
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Storage Architecture Status */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Storage Engine
              </span>
              {storageStatus.isBackendConnected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  SQLite WAL (Self-Hosted)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/40">
                  <Server className="w-3.5 h-3.5" />
                  GitHub Pages / Local
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {storageStatus.isBackendConnected
                ? 'Your progress is continuously synced with your SQLite database on the server.'
                : 'Runs locally in browser (GitHub Pages). Your data is safely stored in browser storage and can be exported at any time.'}
            </p>

            {/* Custom Server Configuration for GitHub Pages */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/40">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Custom Server Backend URL (Optional):
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://your-server-domain:3000"
                  value={remoteUrl}
                  onChange={(e) => setRemoteUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleSaveRemoteUrl}
                  className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Backup & Restore (JSON) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Backup & Restore (JSON)
            </h3>

            {importStatus && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-semibold animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{importStatus}</span>
              </div>
            )}

            {/* Interactive Import Review/Confirmation Dialog */}
            {pendingImport ? (
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Import Preview
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 font-semibold">
                    {pendingImport.isSingle ? 'Single Collection' : 'Full Backup'}
                  </span>
                </div>

                {pendingImport.isSingle ? (
                  <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <p>
                      Found Collection:{' '}
                      <strong className="text-blue-600 dark:text-blue-400">
                        {pendingImport.collectionsList[0]?.name || 'Untitled'}
                      </strong>
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      This collection and its catch status will be added or updated. All existing data will be preserved.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      How would you like to import the backup?
                    </p>
                    <div className="space-y-2">
                      <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          checked={pendingImport.mode === 'all'}
                          onChange={() => setPendingImport({ ...pendingImport, mode: 'all' })}
                          className="mt-0.5"
                        />
                        <div className="text-xs">
                          <span className="font-bold block text-slate-900 dark:text-white">
                            Restore entire backup
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Restores all accounts, collections, and catches (overwrites existing data).
                          </span>
                        </div>
                      </label>

                      {pendingImport.collectionsList.length > 0 && (
                        <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 cursor-pointer">
                          <input
                            type="radio"
                            name="importMode"
                            checked={pendingImport.mode === 'collection'}
                            onChange={() => setPendingImport({ ...pendingImport, mode: 'collection' })}
                            className="mt-0.5"
                          />
                          <div className="text-xs flex-1">
                            <span className="font-bold block text-slate-900 dark:text-white">
                              Import only a specific collection
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-2">
                              Adds only the selected collection. The rest of your data remains unchanged.
                            </span>
                            {pendingImport.mode === 'collection' && (
                              <select
                                value={pendingImport.selectedCollId}
                                onChange={(e) =>
                                  setPendingImport({ ...pendingImport, selectedCollId: e.target.value })
                                }
                                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-medium focus:outline-none"
                              >
                                {pendingImport.collectionsList.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Import Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingImport(null)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Export Options Box */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Export:
                    </span>
                    <div className="flex bg-slate-200 dark:bg-slate-700/60 p-0.5 rounded-xl text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setExportScope('all')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          exportScope === 'all'
                            ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => setExportScope('collection')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          exportScope === 'collection'
                            ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Single Dex / Collection
                      </button>
                    </div>
                  </div>

                  {exportScope === 'collection' && (
                    <div className="space-y-1.5 animate-in fade-in duration-150">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Select Dex / collection to export:
                      </label>
                      <select
                        value={selectedExportCollId}
                        onChange={(e) => setSelectedExportCollId(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                      >
                        <optgroup label="Preset Dexes (Default)">
                          {PRESET_COLLECTION_OPTIONS.map((p) => (
                            <option key={p.id} value={p.id}>
                              ⭐ {p.name} ({p.description})
                            </option>
                          ))}
                        </optgroup>
                        {collections.length > 0 && (
                          <optgroup label="Custom Collections">
                            {collections.map((c) => (
                              <option key={c.id} value={c.id}>
                                📁 {c.name} ({c.totalItems} Pokémon)
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {/* Export Button */}
                    <button
                      type="button"
                      onClick={handleExport}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span className="truncate">
                        {exportScope === 'all'
                          ? 'Export All'
                          : selectedExportCollId.startsWith('preset:')
                          ? `Export ${PRESET_COLLECTION_OPTIONS.find(p => p.id === selectedExportCollId)?.name || 'Preset'}`
                          : 'Export Collection'}
                      </span>
                    </button>

                    {/* Import Button */}
                    <label className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span>Import JSON</span>
                      <input
                        type="file"
                        accept=".json,application/json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progressive Web App / App Installation */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-0.5 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                Progressive Web App (PWA)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Nutze den Pokémon GO Dex Tracker wie eine eigenständige App auf deinem Smartphone, Tablet oder PC.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 p-1 flex items-center justify-center shrink-0">
                  <img src="icons/icon-192x192.png" alt="PoGo Dex App Icon" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {isRunningStandalone() ? 'App ist aktiv' : 'Als App verfügbar'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isRunningStandalone()
                      ? 'Läuft im Vollbild-Modus mit Offline-Cache'
                      : 'Schneller Start, Vollbild & Offline-Support'}
                  </div>
                </div>
              </div>

              {onOpenInstallModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenInstallModal();
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  {isRunningStandalone() ? 'App-Info' : 'Installieren'}
                </button>
              )}
            </div>
          </div>

          {/* Reset Danger Zone */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400 mb-0.5">
                Danger Zone · {activeAccountName}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Reset progress separately for the current view or the entire account.
              </p>
            </div>

            {isResetConfirmOpen ? (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                  Are you sure you want to reset all catches for this account?
                </div>
                <p className="text-[11px] text-rose-800/80 dark:text-rose-200/80">
                  All marked Pokémon (Standard, Shiny, Shadow, Forms, Megas, Costumes) for "{activeAccountName}" will be reset.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onReset();
                      setIsResetConfirmOpen(false);
                      onClose();
                    }}
                    className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Yes, delete everything for this account
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsResetConfirmOpen(false)}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {onResetScope && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to reset only progress for "${activeScopeName}" in account "${activeAccountName}"?\n\nAll other Dex modes (e.g. Forms, Standard, Shiny) will remain untouched!`)) {
                        onResetScope();
                        onClose();
                      }
                    }}
                    className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset only "{activeScopeName}"</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset all Dex progress for "{activeAccountName}"</span>
                </button>

                {onDeleteAllCollections && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (
                        window.confirm(
                          'Are you sure you want to delete all custom lists?\n\nYour catch progress (all marked Pokémon & variants) will be completely preserved!'
                        )
                      ) {
                        await onDeleteAllCollections();
                        onClose();
                      }
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800/80 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 text-slate-700 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    title="Delete all created collections, keep all caught Pokémon"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Delete all custom lists (keep catches)</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
