"use client";

import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
import { useEffect, useState } from "react";

export function InstallPrompt() {
  const { isInstallPromptSupported, isDismissed, promptInstall, dismissPrompt } = useInstallPrompt();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isInstallPromptSupported || isDismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 bg-white dark:bg-forest rounded-2xl shadow-2xl border border-gold/20 p-5 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-500">
      <button 
        onClick={dismissPrompt}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground p-1"
        aria-label="Dismiss install prompt"
      >
        <X className="h-5 w-5" />
      </button>
      
      <div className="mb-4">
        <h3 className="font-serif text-xl font-bold text-forest mb-1">Install Pushya Planet</h3>
        <p className="text-sm text-muted-foreground">Get the full app experience.</p>
      </div>
      
      <ul className="space-y-2 mb-5">
        <li className="flex items-center text-sm">
          <Check className="h-4 w-4 text-green-600 mr-2" /> <span>Works Offline</span>
        </li>
        <li className="flex items-center text-sm">
          <Check className="h-4 w-4 text-green-600 mr-2" /> <span>Faster Ordering</span>
        </li>
        <li className="flex items-center text-sm">
          <Check className="h-4 w-4 text-green-600 mr-2" /> <span>Home Screen Shortcut</span>
        </li>
      </ul>
      
      <div className="flex gap-3">
        <Button onClick={promptInstall} className="flex-1 bg-gold text-forest hover:bg-gold/90">
          Install App
        </Button>
        <Button onClick={dismissPrompt} variant="outline" className="flex-1 border-border">
          Maybe Later
        </Button>
      </div>
    </div>
  );
}
