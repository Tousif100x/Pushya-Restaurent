"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface AlarmQueueSystemProps {
  pendingOrderIds: string[];
  onOrderAcknowledged?: (orderId: string) => void;
}

const REMINDER_INTERVAL_MS = 90_000; // 90 seconds between reminders

export function OrderAlarmSystem({ pendingOrderIds }: AlarmQueueSystemProps) {
  const alarmRef = useRef<HTMLAudioElement | null>(null);
  const titleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reminderIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const originalTitleRef = useRef<string>("");
  const [isAlertActive, setIsAlertActive] = useState(false);

  // Initialize Audio — single short beep, NOT looping
  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio("/alarm.mp3");
    audio.loop = false; // single beep, not continuous
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
          } catch (e) {
            console.error("Failed to save FCM token:", e);
          }
        }
      });
    });
  }, []);

  // Play a single short beep
  const playBeep = useCallback(() => {
    if (!alarmRef.current) return;
    alarmRef.current.currentTime = 0;
    alarmRef.current.play().catch(() => {
      // Autoplay blocked until user interacts — expected on first load
    });
    if ("vibrate" in navigator) {
      navigator.vibrate([400, 150, 400]);
    }
  }, []);

  // Send a FCM push reminder to admin devices (works on locked phone / closed app)
  const sendPushReminder = useCallback(async (count: number) => {
    try {
      await fetch("/api/admin/notify-pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
      });
    } catch {
      // Non-critical
    }
  }, []);

  // Start / stop alert system based on pending orders
  useEffect(() => {
    const hasPending = pendingOrderIds.length > 0;

    if (hasPending && !isAlertActive) {
      setIsAlertActive(true);

      // Immediate: single beep + FCM push
      playBeep();
      sendPushReminder(pendingOrderIds.length);

      // Flash browser tab title
      titleIntervalRef.current = setInterval(() => {
        document.title =
          document.title === "🚨 NEW ORDER! 🚨"
            ? originalTitleRef.current
            : "🚨 NEW ORDER! 🚨";
      }, 800);

      // App badge (shows number on PWA icon)
      if ("setAppBadge" in navigator) {
        (navigator as any).setAppBadge(pendingOrderIds.length).catch(() => {});
      }

      // Every 90 seconds: single beep + FCM push reminder
      reminderIntervalRef.current = setInterval(() => {
        playBeep();
        sendPushReminder(pendingOrderIds.length);
      }, REMINDER_INTERVAL_MS);

    } else if (!hasPending && isAlertActive) {
      // All orders handled — stop everything
      setIsAlertActive(false);
      stopAlerts();
    }

    // Keep badge count updated
    if (hasPending && "setAppBadge" in navigator) {
      (navigator as any).setAppBadge(pendingOrderIds.length).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingOrderIds, isAlertActive]);

  const stopAlerts = () => {
    if (titleIntervalRef.current) {
      clearInterval(titleIntervalRef.current);
      titleIntervalRef.current = null;
      document.title = originalTitleRef.current;
    }
    if (reminderIntervalRef.current) {
      clearInterval(reminderIntervalRef.current);
      reminderIntervalRef.current = null;
    }
    if ("clearAppBadge" in navigator) {
      (navigator as any).clearAppBadge().catch(() => {});
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAlerts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Snooze: silence tab flash for 5 min, FCM push reminders keep going
  const handleSnooze = useCallback(() => {
    if (titleIntervalRef.current) {
      clearInterval(titleIntervalRef.current);
      titleIntervalRef.current = null;
      document.title = originalTitleRef.current;
    }
    if ("clearAppBadge" in navigator) {
      (navigator as any).clearAppBadge().catch(() => {});
    }
    // Re-enable tab flash after 5 minutes if still pending
    setTimeout(() => {
      if (pendingOrderIds.length > 0 && !titleIntervalRef.current) {
        titleIntervalRef.current = setInterval(() => {
          document.title =
            document.title === "🚨 NEW ORDER! 🚨"
              ? originalTitleRef.current
              : "🚨 NEW ORDER! 🚨";
        }, 800);
      }
    }, 5 * 60 * 1000);
  }, [pendingOrderIds.length]);

  if (!isAlertActive) return null;

  return (
    <div className="fixed top-20 right-4 z-[9999] bg-red-600 text-white rounded-xl shadow-2xl px-5 py-4 flex items-center gap-4 animate-pulse">
      <span className="text-2xl">🚨</span>
      <div>
        <p className="font-bold text-sm leading-none">
          {pendingOrderIds.length} New Order{pendingOrderIds.length > 1 ? "s" : ""}!
        </p>
        <p className="text-xs opacity-80 mt-1">Reminding you every 90 seconds</p>
      </div>
      <button
        onClick={handleSnooze}
        className="ml-2 text-xs bg-white/20 hover:bg-white/40 rounded-md px-3 py-1 transition-colors"
        title="Snooze tab alerts for 5 minutes (push reminders continue)"
      >
        Snooze 5m
      </button>
    </div>
  );
}
