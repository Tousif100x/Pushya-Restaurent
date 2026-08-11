import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, MessagePayload } from "firebase/messaging";

export const initializeFirebaseClient = () => {
  if (typeof window === "undefined") return null;

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    console.warn("[Firebase] NEXT_PUBLIC_FIREBASE_API_KEY not set. Push notifications disabled.");
    return null;
  }

  const firebaseConfig = {
    apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
};

/**
 * Requests notification permission and returns the FCM token.
 * Uses navigator.serviceWorker.ready or registers /firebase-messaging-sw.js.
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

    let swRegistration: ServiceWorkerRegistration | null = null;
    try {
      // First try active service worker from next-pwa
      const readyRegistration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<undefined>((res) => setTimeout(res, 2000)),
      ]);
      if (readyRegistration) {
        swRegistration = readyRegistration;
      }
    } catch (swErr) {
      console.warn("[Firebase] navigator.serviceWorker.ready timed out or failed:", swErr);
    }

    if (!swRegistration) {
      try {
        console.log("[Firebase] Registering fallback /firebase-messaging-sw.js...");
        swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      } catch (regErr) {
        console.error("[Firebase] Service worker registration failed:", regErr);
      }
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn("[Firebase] NEXT_PUBLIC_FIREBASE_VAPID_KEY missing.");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swRegistration || undefined,
    });

    if (token) {
      console.log("[Firebase] FCM token obtained successfully:", token.substring(0, 20) + "...");
    } else {
      console.warn("[Firebase] No FCM token returned by Firebase.");
    }

    return token || null;
  } catch (error) {
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
