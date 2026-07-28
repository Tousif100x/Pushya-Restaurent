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
 * Registers the firebase-messaging-sw.js service worker (clean URL, no params).
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
      console.warn("[Firebase] Notification permission denied.");
      return null;
    }

    const app = initializeFirebaseClient();
    if (!app) return null;

    const messaging = getMessaging(app);

    // Register the SW cleanly — no config in the URL
    // The SW fetches its config from /api/firebase-config on install
    let swRegistration = await navigator.serviceWorker.getRegistration(
      "/firebase-messaging-sw.js"
    );

    if (!swRegistration) {
      console.log("[Firebase] Registering service worker...");
      swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
        scope: "/",
      });
      // Wait for it to be active
      await new Promise<void>((resolve) => {
        if (swRegistration!.active) {
          resolve();
          return;
        }
        const onStateChange = () => {
          if (swRegistration!.installing?.state === "activated" || swRegistration!.active) {
            resolve();
          }
        };
        swRegistration!.addEventListener("updatefound", onStateChange);
        swRegistration!.installing?.addEventListener("statechange", onStateChange);
        // Fallback after 3s
        setTimeout(resolve, 3000);
      });
    }

    console.log("[Firebase] Service worker registered:", swRegistration.scope);

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn("[Firebase] NEXT_PUBLIC_FIREBASE_VAPID_KEY not set. Cannot get FCM token.");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swRegistration,
    });

    if (token) {
      console.log("[Firebase] FCM token obtained successfully:", token.substring(0, 20) + "...");
    } else {
      console.warn("[Firebase] No FCM token returned. Check VAPID key and browser support.");
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
      unsubscribe(); // Unsubscribe after first message so we can re-listen
      resolve(payload);
    });
  });
};
