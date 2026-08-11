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
 * Requests notification permission and returns the FCM token.
 * Registers /firebase-messaging-sw.js and gets the FCM token.
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.warn("[Firebase] Notifications not supported in this browser.");
      return null;
    }

    if (!("serviceWorker" in navigator)) {
      console.warn("[Firebase] Service Workers not supported.");
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("[Firebase] Notification permission not granted. Status:", permission);
      return null;
    }

    const app = initializeFirebaseClient();
    if (!app) return null;

    const messaging = getMessaging(app);

    let swRegistration: ServiceWorkerRegistration | undefined;
    try {
      swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    } catch (e) {
      console.warn("[Firebase] Direct /firebase-messaging-sw.js registration failed:", e);
      swRegistration = await navigator.serviceWorker.ready.catch(() => undefined);
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || FALLBACK_VAPID_KEY;

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swRegistration,
    });

    if (token) {
      console.log("[Firebase] FCM token obtained successfully:", token.substring(0, 20) + "...");
    } else {
      console.warn("[Firebase] No FCM token returned by Firebase.");
    }

    return token || null;
  } catch (error: any) {
    console.error("[Firebase] Error in requestNotificationPermission:", error);
    return null;
  }
};

/**
 * Listens for foreground messages (app is open/focused).
 * Returns a promise that resolves with the next message payload.
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
