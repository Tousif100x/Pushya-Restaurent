import { FirebaseNotificationProvider } from './firebase-provider';
import { NotificationProvider } from './types';

// Export an instance of the provider. This makes it easy to swap later.
// To change to another provider (e.g. OneSignal), implement NotificationProvider and swap it here.
export const notificationProvider: NotificationProvider = new FirebaseNotificationProvider();
