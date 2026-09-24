import React, { useState, useEffect } from 'react';
import { X, Smartphone, Download, Share2, PlusSquare, CheckCircle2, Zap, WifiOff, Sparkles } from 'lucide-react';
import {
  isRunningStandalone,
  isIOS,
  canPromptNativeInstall,
  subscribeToInstallPrompt,
  triggerNativeInstall,
  isSecureConnection
} from '../registerServiceWorker';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [canInstallNative, setCanInstallNative] = useState(canPromptNativeInstall());
  const [isStandalone, setIsStandalone] = useState(isRunningStandalone());
  const [isInstalledJustNow, setIsInstalledJustNow] = useState(false);
  const iosDevice = isIOS();

  useEffect(() => {
    setIsStandalone(isRunningStandalone());
    const unsubscribe = subscribeToInstallPrompt((canInstall) => {
      setCanInstallNative(canInstall);
    });
    return unsubscribe;
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    const outcome = await triggerNativeInstall();
    if (outcome === 'accepted') {
      setIsInstalledJustNow(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header decoration banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950/40 border border-white/20 p-1.5 flex items-center justify-center shadow-lg backdrop-blur-xs shrink-0">
              <img
                src="icons/icon-192x192.png"
                alt="PoGo Dex App Icon"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-100 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Progressive Web App
              </div>
              <h2 className="text-xl font-black tracking-tight text-white">
                Als App installieren
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Key Advantages */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Vollbild-App</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Keine Browser-Leisten</div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1.5">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Sofort startklar</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Direkt vom Homescreen</div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5">
                <WifiOff className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Offline-fähig</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Unterwegs einsatzbereit</div>
            </div>
          </div>

          {/* Already installed state */}
          {isStandalone ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div className="text-xs">
                <p className="font-bold text-sm">Bereits als App installiert!</p>
                <p className="text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Du nutzt den Pokémon GO Dex Tracker bereits im eigenständigen Vollbild-App-Modus.
                </p>
              </div>
            </div>
          ) : isInstalledJustNow ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div className="text-xs">
                <p className="font-bold text-sm">Erfolgreich installiert!</p>
                <p className="text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Du findest die App nun auf deinem Startbildschirm.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Native Prompt Option (Chromium, Android, Edge) */}
              {canInstallNative && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl">
                  <div className="text-xs text-blue-900 dark:text-blue-200 mb-3">
                    Dein Browser unterstützt die direkte 1-Klick-Installation:
                  </div>
                  <button
                    type="button"
                    onClick={handleNativeInstall}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer transform active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    <span>App jetzt installieren</span>
                  </button>
                </div>
              )}

              {/* iOS Safari Guide */}
              {iosDevice ? (
                <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-blue-500" />
                    <span>Installation auf dem iPhone &amp; iPad (Safari):</span>
                  </div>
                  <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5 list-none pl-0">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Tippe in der Safari-Symbolleiste unten auf den <strong>Teilen-Button</strong> (
                        <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-500" />
                        Viereck mit Pfeil nach oben).
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Scrolle im Menü etwas nach unten und wähle <strong>„Zum Home-Bildschirm“</strong> (
                        <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-blue-500" />
                        ).
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        Tippe oben rechts auf <strong>„Hinzufügen“</strong>. Die App erscheint sofort auf deinem Homescreen!
                      </span>
                    </li>
                  </ol>
                </div>
              ) : !canInstallNative ? (
                /* Desktop / other browsers guide */
                <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl space-y-2.5">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-blue-500" />
                    <span>Installation über deinen Browser:</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Klicke in der Adressleiste deines Browsers rechts auf das <strong>Installieren-Symbol</strong> (oder öffne das Browsermenü <strong>⋮</strong> &gt; <em>„Pokémon GO Dex Tracker installieren“</em>).
                  </p>
                </div>
              ) : null}

              {!isSecureConnection() && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-700 dark:text-amber-300">
                  <strong>Hinweis:</strong> Google Chrome und Safari schalten die PWA-Installation im Vollbild nur bei einer gesicherten Verbindung frei (HTTPS mit SSL-Zertifikat oder über <code>localhost</code>).
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
