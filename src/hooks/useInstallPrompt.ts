"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner"; // We will add sonner soon

export type BrowserContextType = 'ios-safari' | 'android-chrome' | 'android-other' | 'desktop-chrome' | 'desktop-other' | 'unknown';
export type InstallState = 'idle' | 'preparing' | 'installing' | 'installed' | 'error';

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallPromptSupported, setIsInstallPromptSupported] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installState, setInstallState] = useState<InstallState>('idle');
  const [browserContext, setBrowserContext] = useState<BrowserContextType>('unknown');
  
  // Diagnostic state
  const [diagnostics, setDiagnostics] = useState({
    swRegistered: false,
    hasManifest: false,
    isHttps: false,
    eventCaptured: false,
    platform: '',
  });

  // Track Analytics
  const trackInstallEvent = (event: string) => {
    const key = `analytics_${event}`;
    const current = parseInt(localStorage.getItem(key) || "0", 10);
    localStorage.setItem(key, (current + 1).toString());
    console.log(`[Analytics] ${event}:`, current + 1);
  };

  useEffect(() => {
    // 1. Detect if already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
      console.log('[PWA Diagnostics] Display Mode Standalone?', isStandalone);
      setIsInstalled(isStandalone);
      if (isStandalone) setInstallState('installed');
    };
    
    checkInstalled();
    
    // Listen for changes (e.g. user installs via browser menu directly)
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
      if (e.matches) {
        setIsInstalled(true);
        setInstallState('installed');
        trackInstallEvent('install_success');
      }
    });
    
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallState('installed');
      trackInstallEvent('install_success');
    });

    // 2. Detect Browser Context
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /ipad|iphone|ipod/.test(ua) && !(window as any).MSStream;
    const isSafari = /safari/.test(ua) && !/chrome/.test(ua);
    const isAndroid = /android/.test(ua);
    const isChrome = /chrome/.test(ua);
    const isMobile = /mobile/.test(ua);
    
    if (isIOS && isSafari) {
      setBrowserContext('ios-safari');
    } else if (isAndroid && isChrome && isMobile) {
      setBrowserContext('android-chrome');
    } else if (isAndroid && !isChrome) {
      setBrowserContext('android-other');
    } else if (!isMobile && isChrome) {
      setBrowserContext('desktop-chrome');
    } else if (!isMobile && !isChrome) {
      setBrowserContext('desktop-other');
    }

    // 3. Handle prompt dismissal
    const dismissed = localStorage.getItem("pwa_install_dismissed");
    if (dismissed === "true") setIsDismissed(true);

    // Run basic diagnostics
    const isHttps = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    console.log('[PWA Diagnostics] Is HTTPS or Localhost?', isHttps);
    
    const checkSW = async () => {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        console.log('[PWA Diagnostics] Service Workers Registered:', regs.length);
        setDiagnostics(prev => ({ ...prev, swRegistered: regs.length > 0, isHttps, platform: navigator.platform }));
      }
    };
    
    const checkManifest = () => {
      const manifest = document.querySelector('link[rel="manifest"]');
      console.log('[PWA Diagnostics] Manifest found in DOM?', !!manifest);
      setDiagnostics(prev => ({ ...prev, hasManifest: !!manifest }));
    };

    checkSW();
    checkManifest();

    // 4. Handle beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[PWA Diagnostics] beforeinstallprompt event fired inside hook!');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallPromptSupported(true);
      setDiagnostics(prev => ({ ...prev, eventCaptured: true }));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const promptInstall = async () => {
    trackInstallEvent('install_clicked');
    console.log('[PWA Diagnostics] Install prompt triggered by user');
    
    if (!isInstallPromptSupported || !deferredPrompt) {
      console.log('[PWA Diagnostics] Install prompt unsupported or missing. Falling back to modal.');
      // If not supported natively, return false so the UI can show the manual fallback modal
      return false;
    }

    setInstallState('preparing');
    trackInstallEvent('install_prompt_shown');
    
    // Slight delay for smooth UX
    await new Promise(r => setTimeout(r, 600));
    setInstallState('installing');
    
    try {
      console.log('[PWA Diagnostics] Calling deferredPrompt.prompt()');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA Diagnostics] User choice outcome:', outcome);
      
      if (outcome === "accepted") {
        trackInstallEvent('install_accepted');
        setDeferredPrompt(null);
        setIsInstallPromptSupported(false);
        // Actual install success is caught by the 'appinstalled' event listener above
      } else {
        trackInstallEvent('install_dismissed');
        setInstallState('idle');
        toast("Installation cancelled", { description: "You can install it later from the menu." });
      }
    } catch (error) {
      console.error('[PWA Diagnostics] Error during prompt/userChoice:', error);
      setInstallState('error');
    }
    
    return true; // Handled natively
  };

  const dismissPrompt = () => {
    localStorage.setItem("pwa_install_dismissed", "true");
    setIsDismissed(true);
  };

  return { 
    isInstalled,
    installState,
    browserContext,
    isInstallPromptSupported,
    isDismissed, 
    diagnostics,
    promptInstall, 
    dismissPrompt 
  };
}
