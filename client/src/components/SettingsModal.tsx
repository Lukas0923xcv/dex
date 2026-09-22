import React, { useState, useEffect } from 'react';
import { StorageStatus, storage } from '../services/storage';
import { BackupData } from '../types';
import { X, Download, Upload, RefreshCw, Server, AlertTriangle, CheckCircle2, ShieldCheck, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  storageStatus: StorageStatus;
  onExport: () => Promise<BackupData>;
  onImport: (backup: BackupData) => Promise<void>;
  onReset: () => void;
  onResetScope?: () => void;
  onDeleteAllCollections?: () => Promise<void>;
  activeAccountName?: string;
  activeScopeName?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  storageStatus,
  onExport,
  onImport,
  onReset,
  onResetScope,
  onDeleteAllCollections,
  activeAccountName = 'Haupt-Account',
  activeScopeName = 'Standard Dex'
}) => {
  const [remoteUrl, setRemoteUrl] = useState(storageStatus.backendUrl || '');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

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
      const data = await onExport();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `pogo-dex-backup-${dateStr}.json`);
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
        await onImport(json);
        setImportStatus('Backup successfully restored!');
        setTimeout(() => setImportStatus(null), 3000);
      } catch (err: any) {
        alert(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
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
                ? 'Your progress is persistently synced with your high-performance SQLite database on your server volume.'
                : 'Running client-side on GitHub Pages. Data is stored safely in your browser and can be exported anytime.'}
            </p>

            {/* Custom Server Configuration for GitHub Pages */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/40">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Custom Remote Backend URL (Optional):
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
                  className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Backup & Restore (JSON) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Backup & Restore (JSON)
            </h3>

            {importStatus && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                {importStatus}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {/* Export Button */}
              <button
                type="button"
                onClick={handleExport}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white transition-all group shadow-sm"
              >
                <Download className="w-6 h-6 text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Export Backup JSON</span>
              </button>

              {/* Import Button */}
              <label className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white transition-all group shadow-sm cursor-pointer">
                <Upload className="w-6 h-6 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Import Backup JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset Danger Zone */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400 mb-0.5">
                Danger Zone · {activeAccountName}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Fortschritte separat für die aktuelle Ansicht oder den gesamten Account zurücksetzen.
              </p>
            </div>

            {isResetConfirmOpen ? (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                  Möchtest du alle Fänge dieses Accounts wirklich zurücksetzen?
                </div>
                <p className="text-[11px] text-rose-800/80 dark:text-rose-200/80">
                  Alle markierten Pokémon (Standard, Shiny, Crypto, Formen, Megas, Kostüme) für "{activeAccountName}" werden zurückgesetzt.
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
                    Ja, alles für diesen Account löschen
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsResetConfirmOpen(false)}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {onResetScope && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Möchtest du wirklich nur den Fortschritt für "${activeScopeName}" in Account "${activeAccountName}" zurücksetzen?\n\nAlle anderen Dex-Modi (z.B. Formen, Standard, Shiny) bleiben unberührt!`)) {
                        onResetScope();
                        onClose();
                      }
                    }}
                    className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Nur "{activeScopeName}" zurücksetzen</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Alle Dex-Fortschritte für "{activeAccountName}" zurücksetzen</span>
                </button>

                {onDeleteAllCollections && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (
                        window.confirm(
                          'Möchtest du wirklich alle benutzerdefinierten Listen löschen?\n\nDein Fang-Fortschritt (alle markierten Pokémon & Varianten) bleibt dabei vollständig erhalten!'
                        )
                      ) {
                        await onDeleteAllCollections();
                        onClose();
                      }
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800/80 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 text-slate-700 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    title="Löscht alle erstellten Sammlungen, behält alle gefangenen Pokémon"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Alle eigenen Listen löschen (Fänge behalten)</span>
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
