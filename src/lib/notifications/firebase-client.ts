import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, MessagePayload } from "firebase/messaging";

const FALLBACK_VAPID_KEY = "BJGRbgixjv-ycj_9Ti92D5cddq72v0XRpsiHOxDQHq_2t9in15dy6oiI393fxsdFQPTlgwSXCr1VtIoQMq5aWec";

export const initializeFirebaseClient = () => {
  if (typeof window === "undefined") return null;

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBcEXNEVL_H1u5jeb72hw9hL_n00J24pC0",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "pushya-restaurant.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "pushya-restaurant",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "pushya-restaurant.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "212682055583",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:212682055583:web:27a63e16cd8157880ae7aa",
  };

  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
};

/**
 * Detailed FCM token acquisition with 3-tiered fallback & explicit error reporting.
 */
export const requestNotificationPermissionDetailed = async (): Promise<{ token?: string; error?: string }> => {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return { error: "Notifications not supported in this browser" };
    }

    if (!("serviceWorker" in navigator)) {
      return { error: "Service Workers not supported in this browser" };
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { error: `Permission status: ${permission}` };
    }

    const app = initializeFirebaseClient();
    if (!app) return { error: "Failed to initialize Firebase Client" };

    const messaging = getMessaging(app);
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || FALLBACK_VAPID_KEY;

    let token: string | null = null;
    let lastError = "";

    // Method 1: Try with active PWA ready registration
    try {
      const readyRegistration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<undefined>((res) => setTimeout(res, 1500)),
      ]);
      if (readyRegistration) {
        token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: readyRegistration });
      }
    } catch (e: any) {
      lastError = e?.message || String(e);
      console.warn("[Firebase] Method 1 failed:", lastError);
    }

    // Method 2: Try registering /firebase-messaging-sw.js explicitly
    if (!token) {
      try {
        const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: swReg });
      } catch (e: any) {
        lastError = e?.message || String(e);
        console.warn("[Firebase] Method 2 failed:", lastError);
      }
    }

    // Method 3: Try standard getToken without explicit SW registration parameter
    if (!token) {
      try {
        token = await getToken(messaging, { vapidKey });
      } catch (e: any) {
        lastError = e?.message || String(e);
        console.warn("[Firebase] Method 3 failed:", lastError);
      }
    }

    if (token) {
      console.log("[Firebase] Token obtained successfully:", token.substring(0, 20) + "...");
      return { token };
    }

    return { error: lastError || "No FCM token returned from Firebase" };
  } catch (error: any) {
    return { error: error?.message || "Unknown error requesting notification permission" };
  }
};

/**
 * Backwards compatible helper
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  const res = await requestNotificationPermissionDetailed();
  return res.token || null;
};

/**
 * Listens for foreground messages (app is open/focused).
 */
export const onMessageListener = (): Promise<MessagePayload> => {
  return new Promise((resolve) => {
    const app = initializeFirebaseClient();
    if (!app) return;
    const messaging = getMessaging(app);
    const unsubscribe = onMessage(messaging, (payload) => {
      unsubscribe();
      resolve(payload);
    });
  });
};
