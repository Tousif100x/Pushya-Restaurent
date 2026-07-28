"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface AlarmQueueSystemProps {
  pendingOrderIds: string[];
  onOrderAcknowledged?: (orderId: string) => void;
}

export function OrderAlarmSystem({ pendingOrderIds, onOrderAcknowledged }: AlarmQueueSystemProps) {
  const alarmRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const titleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const originalTitleRef = useRef<string>("");

  // Initialize Audio
  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio("/alarm.mp3");
    audio.loop = true;
    audio.volume = 1.0;
    alarmRef.current = audio;
    originalTitleRef.current = document.title;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Register admin device for FCM when component mounts
  useEffect(() => {
    if (typeof window === "undefined") return;

    import("@/lib/notifications/firebase-client").then(({ requestNotificationPermission }) => {
      requestNotificationPermission().then(async (token) => {
        if (token) {
          try {
            await fetch("/api/admin/device", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token }),
            });
            console.log("Admin device registered for push notifications.");
          } catch (e) {
            console.error("Failed to save FCM token:", e);
          }
        }
      });
    });
  }, []);

  // Alarm control based on pending order queue
  useEffect(() => {
    if (!alarmRef.current) return;
    const hasPending = pendingOrderIds.length > 0;

    if (hasPending && !isPlaying) {
      // Start alarm
      alarmRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.warn("Autoplay blocked. User must interact first.", e);
        });

      // Vibrate Android
      if ("vibrate" in navigator) {
        navigator.vibrate([800, 300, 800, 300, 800]);
      }

      // Flash browser title
      const originalTitle = document.title;
      titleIntervalRef.current = setInterval(() => {
        document.title =
          document.title === "🚨 NEW ORDER! 🚨" ? originalTitle : "🚨 NEW ORDER! 🚨";
      }, 800);

      // App badge
      if ("setAppBadge" in navigator) {
        (navigator as any).setAppBadge(pendingOrderIds.length).catch(() => {});
      }
    } else if (!hasPending && isPlaying) {
      // Stop alarm
      alarmRef.current.pause();
      alarmRef.current.currentTime = 0;
      setIsPlaying(false);

      if (titleIntervalRef.current) {
        clearInterval(titleIntervalRef.current);
        titleIntervalRef.current = null;
        document.title = originalTitleRef.current;
      }

      if ("clearAppBadge" in navigator) {
        (navigator as any).clearAppBadge().catch(() => {});
      }
    }
  }, [pendingOrderIds, isPlaying]);

  // Manual stop for UX (e.g., "Dismiss" button visible when alarm is playing)
  const handleManualDismiss = useCallback(() => {
    if (alarmRef.current) {
      alarmRef.current.pause();
      alarmRef.current.currentTime = 0;
      setIsPlaying(false);
    }
    if (titleIntervalRef.current) {
      clearInterval(titleIntervalRef.current);
      titleIntervalRef.current = null;
      document.title = originalTitleRef.current;
    }
  }, []);

  if (!isPlaying) return null;

  return (
    <div className="fixed top-20 right-4 z-[9999] bg-red-600 text-white rounded-xl shadow-2xl px-5 py-4 flex items-center gap-4 animate-pulse">
      <span className="text-2xl">🚨</span>
      <div>
        <p className="font-bold text-sm leading-none">
          {pendingOrderIds.length} New Order{pendingOrderIds.length > 1 ? "s" : ""}!
        </p>
        <p className="text-xs opacity-80 mt-1">Scroll down to review</p>
      </div>
      <button
        onClick={handleManualDismiss}
        className="ml-2 text-xs bg-white/20 hover:bg-white/40 rounded-md px-3 py-1 transition-colors"
        title="Snooze alarm"
      >
        Snooze
      </button>
    </div>
  );
}
