"use client";

import { useEffect, useState } from "react";
import { WifiOff, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type Status = 'online' | 'poor' | 'offline';

export function NetworkStatus() {
  const [status, setStatus] = useState<Status>('online');

  useEffect(() => {
    // Initial check
    if (!navigator.onLine) {
      setStatus('offline');
    }

    const handleOnline = () => {
      setStatus('online');
      toast.success("Back Online", { description: "Your connection has been restored." });
    };

    const handleOffline = () => {
      setStatus('offline');
      toast.error("You are offline", { 
        description: "Browsing cached menu. Orders cannot be placed.",
        duration: Infinity
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Optional: Detect poor connection via navigator.connection if supported
    const connection = (navigator as any).connection;
    if (connection) {
      const handleConnectionChange = () => {
        if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
          setStatus('poor');
          toast.warning("Poor Connection", { description: "Syncing may take longer than usual." });
        } else if (navigator.onLine) {
          setStatus('online');
        }
      };
      connection.addEventListener('change', handleConnectionChange);
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        connection.removeEventListener('change', handleConnectionChange);
      };
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (status === 'online') return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-center p-2 text-sm font-medium transition-colors ${
      status === 'offline' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
    }`}>
      {status === 'offline' ? (
        <><WifiOff className="w-4 h-4 mr-2" /> ⚠ You're offline - Browsing cached menu</>
      ) : (
        <><AlertTriangle className="w-4 h-4 mr-2" /> Poor connection - Syncing may be slow</>
      )}
    </div>
  );
}
