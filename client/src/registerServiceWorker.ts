/**
 * Service Worker Registration and PWA Utilities
 */

let deferredInstallPrompt: any = null;
const promptListeners = new Set<(canInstall: boolean) => void>();

export function registerServiceWorker(): void {
  // Listen for beforeinstallprompt event globally
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the default mini-infobar or browser prompt
    e.preventDefault();
    deferredInstallPrompt = e;
    promptListeners.forEach(listener => listener(true));
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    promptListeners.forEach(listener => listener(false));
    console.log('[PWA] Pokémon GO Dex Tracker was successfully installed!');
  });

  if ('serviceWorker' in navigator && (window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => {
      // Use relative path './sw.js' so it works on GitHub Pages (/dex/) and standalone root (/)
      const swUrl = './sw.js';
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('[PWA] Service Worker registered successfully, scope:', registration.scope);

          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New version available! Content will update on next visit.');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn('[PWA] Service Worker registration failed:', error);
        });
    });
  }
}

/**
 * Checks whether the app is currently launched in standalone display mode (installed PWA)
 */
export function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Checks whether the user is on an iOS device (iPhone, iPad, iPod)
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/**
 * Check if the browser can trigger a native installation prompt
 */
export function canPromptNativeInstall(): boolean {
  return deferredInstallPrompt !== null;
}

/**
 * Subscribe to changes in native installability
 */
export function subscribeToInstallPrompt(callback: (canInstall: boolean) => void): () => void {
  promptListeners.add(callback);
  callback(canPromptNativeInstall());
  return () => {
    promptListeners.delete(callback);
  };
}

/**
 * Trigger the native installation prompt (Android / Chrome / Edge)
 */
export async function triggerNativeInstall(): Promise<'accepted' | 'dismissed' | 'unsupported'> {
  if (!deferredInstallPrompt) {
    return 'unsupported';
  }

  try {
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    promptListeners.forEach(listener => listener(false));
    return outcome;
  } catch (err) {
    console.error('[PWA] Error displaying install prompt:', err);
    return 'unsupported';
  }
}

/**
 * Checks if the current origin is a secure context (HTTPS or localhost)
 */
export function isSecureConnection(): boolean {
  if (typeof window === 'undefined') return true;
  return Boolean(
    window.isSecureContext ||
    window.location.protocol === 'https:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
}
