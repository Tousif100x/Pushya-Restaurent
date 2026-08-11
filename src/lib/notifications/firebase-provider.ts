import * as adminModule from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { NotificationProvider, PushNotificationPayload } from './types';

let initialized = false;

const FALLBACK_PROJECT_ID = "pushya-restaurant";
const FALLBACK_CLIENT_EMAIL = "firebase-adminsdk-fbsvc@pushya-restaurent.iam.gserviceaccount.com";
const FALLBACK_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDD1NYHM119keUA
eOKNZvCf+R1lA2CsOaDyYRwoyjZ5uXyCGQ5QQ8aoSrn7FlAtOEYTN94Jk9VZ+xpf
vhNu749Z2PKCP4c2nlLvbpeTnLXVFYP9Sj6SO53kUsaOsxx/w2T+OC6GXKrUCthH
8qp7i4uWGP3zPdhwjzXZEbx4qfPakXgdl8BtTY0j/XwmauFWgObHB/uVslx668kE
5ZTobivCZhC/DvPnNoOcmCUShgNAgdhYh0+hwphOPGL7trWdZkhpOoOFerMnjoig
jusvN0YJsXVTARw9F7ldMJ7DB6ciQRKS3z1LZswIMx+CChNm9R0Gk7LHw88x3+X+
QyoDi80pAgMBAAECggEAPk2wHFFcvK8Whvxuw6MNCjBVCEa3UoPxLzvzHA0doMOB
F9kF40Z05SUFH5u9PW3KaaHcG/rzJXIMtYpBH4nK90BdA1BX4eokI7XxNo7kkNsM
B6E/4AFknfgx4MOeXQ2ay4CvWKMR3G1o2xca4zyF1+ayoNk7y6/cZ2fLqS4U/aO8
nvziFJY1kjMQnBuwFMe24h6nQPFb4WXF8az6c9ara4b4LnX3+d7PM1rMv7dmzz2n
zFyXrzBLxRcjYgyG51dBQOkpBit/e2QnHYlcK37Iev5671ILEI71sgmx1klln+yl
5HV23IQ9GpVnmsbQFK/KxoAQvaOvhWXUP7QT5eD7SwKBgQDv1ZRSDl04wOqt/OCl
CMoQyb3Hx4KLGYsYWMtazfA9JwgDBWPjrq7zW4TljStptOlg/snEqmOcBnIm5MWr
cTCw4EUHhGCpvMOYQHc88zGLKDGEEzZnjMUjlXCnVIECY5F2U5qkICfP5Vg72BWz
gU222weH3zWHv4RsWoIuqzCFuwKBgQDRB/jPV4mtr2dEaI8HGpkF78Prs85ukJi3
TyEO210anVO7QwApglQRtc6hxLGTdCbBDfG5KItQte+ddQJ5k+NSpEphb+KAhrkn
hObiwUARk+XcqWAwwWnBp8Ldmv5ano0pLXE2U3kphHOqtfBWQLh0G6lyiPrAkSbv
sOyK4Vk4awKBgExt3s9rfm+4otEBdkGBlItXDyCcRtC3OilvGpb8a+PBDX+Q9y02
nNA2yRoyK7SLD5h2eawvtICjWTtlykyBTMgBIF5t5DQTUK2zVYxZ39791xHE4aCM
LsLRO85HUrmFK3Tu3agSCz3oU372tKu4uCBemn7FNhTlhnjVOwlOSq9DAoGAHfzg
yw4p6Erzq7K8Yi6EqX9eQiBHi0EfR50IhxMdZkYPzxurmEjkOq40eKy5NQhCzwtr
FD8mzWtsdtBkjICU6jQ7n4LnobyyL2M3pGxI/ryTC3cZH6V/wJKKuDQWLXX1lmS4
iyygzRHS8RSOG2MiMu3IYFZR+sLBPQC22G85QUCgYAVssFw8Ws0GqJ6L7uzscLu
i6QqEdpBo4n8KD+PdQB0GqK2znWL72L0uIthlffxwHMfJMbhFe0VwNDCUQZwjNWA
7XvS5ndSD6sst8rJ3nb8SeUcGlBxQFX9qauOYXoTaHBvQIGDyrtgtxiueDji6est
tsNLPtIMEMVyC31WIt4L0Q==
-----END PRIVATE KEY-----`;

export class FirebaseNotificationProvider implements NotificationProvider {
  initBackend() {
    if (!initialized) {
      try {
        const projectId = process.env.FIREBASE_PROJECT_ID || FALLBACK_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || FALLBACK_CLIENT_EMAIL;
        const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY || FALLBACK_PRIVATE_KEY;
        const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

        const { initializeApp, cert, getApps } = adminModule;
        if (!getApps().length) {
          initializeApp({
            credential: cert({
              projectId,
              clientEmail,
              privateKey,
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
      this.initBackend();
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
            icon: '/app-icon-192.png',
            badge: '/app-icon-192.png',
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
