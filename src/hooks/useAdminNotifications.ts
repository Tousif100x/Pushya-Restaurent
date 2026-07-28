import { useState, useEffect, useRef } from 'react';
import { requestNotificationPermission, onMessageListener } from '@/lib/notifications/firebase-client';
import { toast } from 'sonner';

export function useAdminNotifications() {
  const [unacknowledgedOrders, setUnacknowledgedOrders] = useState<string[]>([]);
  const alarmRef = useRef<HTMLAudioElement | null>(null);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);

  // Initialize alarm
  useEffect(() => {
    if (typeof window !== 'undefined' && !alarmRef.current) {
      const audio = new Audio('/alarm.mp3');
      audio.loop = true;
      alarmRef.current = audio;
    }
  }, []);

  // Handle Alarm State
  useEffect(() => {
    if (!alarmRef.current) return;

    if (unacknowledgedOrders.length > 0 && !isAlarmPlaying) {
      // Need user interaction to play audio in some browsers, but often admin panels have it.
      alarmRef.current.play().catch(e => console.error("Audio play failed:", e));
      setIsAlarmPlaying(true);
      
      // Vibrate on Android
      if ('vibrate' in navigator) {
        navigator.vibrate([1000, 500, 1000, 500, 1000, 500, 1000]);
      }
      
      // Flash title
      let isAltTitle = false;
      const originalTitle = document.title;
      const flashInterval = setInterval(() => {
        document.title = isAltTitle ? "🚨 NEW ORDER! 🚨" : originalTitle;
        isAltTitle = !isAltTitle;
      }, 1000);

      // Add badge
      if ('setAppBadge' in navigator) {
        (navigator as any).setAppBadge(unacknowledgedOrders.length).catch(console.error);
      }

      return () => {
        clearInterval(flashInterval);
        document.title = originalTitle;
        if ('clearAppBadge' in navigator) {
          (navigator as any).clearAppBadge().catch(console.error);
        }
      };
    } else if (unacknowledgedOrders.length === 0 && isAlarmPlaying) {
      alarmRef.current.pause();
      alarmRef.current.currentTime = 0;
      setIsAlarmPlaying(false);
    }
  }, [unacknowledgedOrders, isAlarmPlaying]);

  // Request Push Permission and Save Token
  useEffect(() => {
    const registerDevice = async () => {
      const token = await requestNotificationPermission();
      if (token) {
        // Send token to server
        try {
          await fetch('/api/admin/device', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          });
        } catch (error) {
          console.error("Failed to save FCM token", error);
        }
      }
    };
    
    // In a real app we'd verify admin is logged in before registering
    registerDevice();
  }, []);

  // Listen for Foreground Messages
  useEffect(() => {
    const listen = async () => {
      const payload: any = await onMessageListener();
      if (payload) {
        toast.success(`New Order Received!`, {
          description: payload.notification?.body,
          duration: 10000,
        });
        
        // Add to unacknowledged queue (extract order ID from payload data if available)
        const orderId = payload.data?.orderId || `order-${Date.now()}`;
        setUnacknowledgedOrders(prev => {
          if (!prev.includes(orderId)) return [...prev, orderId];
          return prev;
        });
        
        // Listen again
        listen();
      }
    };
    listen();
  }, []);

  const acknowledgeOrder = (orderId: string) => {
    setUnacknowledgedOrders(prev => prev.filter(id => id !== orderId));
  };

  const manualTriggerAlarmForTesting = () => {
    setUnacknowledgedOrders(prev => [...prev, `test-${Date.now()}`]);
  };

  return {
    unacknowledgedOrders,
    acknowledgeOrder,
    isAlarmPlaying,
    manualTriggerAlarmForTesting
  };
}
