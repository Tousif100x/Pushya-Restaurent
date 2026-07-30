import * as adminModule from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { NotificationProvider, PushNotificationPayload } from './types';

let initialized = false;

export class FirebaseNotificationProvider implements NotificationProvider {
  initBackend() {
    if (!initialized) {
      try {
        if (
          !process.env.FIREBASE_PROJECT_ID ||
          !process.env.FIREBASE_CLIENT_EMAIL ||
          !process.env.FIREBASE_PRIVATE_KEY
        ) {
          console.warn('Firebase Admin credentials missing. Push notifications disabled.');
          return;
        }

        const { initializeApp, cert, getApps } = adminModule;
        if (!getApps().length) {
          initializeApp({
            credential: cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
          });
        }

        initialized = true;
        console.log('Firebase Admin initialized successfully.');
      } catch (error) {
        console.error('Firebase Admin initialization error:', error);
      }
    }
  }

  async sendToTokens(tokens: string[], payload: PushNotificationPayload): Promise<boolean> {
    if (!initialized) {
      console.warn('Cannot send push notification: Firebase Admin not initialized.');
      return false;
    }
    if (!tokens?.length) return false;

    try {
      const messaging = getMessaging();
      const response = await messaging.sendEachForMulticast({
        tokens,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: {
          ...(payload.data ?? {}),
          title: payload.title,
          body: payload.body,
          url: payload.url || '/admin/dashboard',
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            priority: 'high',
            channelId: 'admin_orders',
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
        webpush: {
          headers: {
            Urgency: 'high',
            TTL: '86400',
          },
          notification: {
            title: payload.title,
            body: payload.body,
            icon: '/icon512_maskable.png',
            badge: '/icon512_maskable.png',
            requireInteraction: true,
            tag: payload.data?.orderId || 'new-order',
          },
          fcmOptions: {
            link: payload.url || '/admin/dashboard',
          },
        },
      });

      console.log(
        `Push: ${response.successCount} delivered, ${response.failureCount} failed.`
      );
      return response.successCount > 0;
    } catch (error) {
      console.error('Push notification error:', error);
      return false;
    }
  }
}
