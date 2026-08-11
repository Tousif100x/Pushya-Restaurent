import { NotificationProvider, PushNotificationPayload } from "./types";

class NoOpNotificationProvider implements NotificationProvider {
  initBackend() {}
  async sendToTokens(): Promise<boolean> {
    return true;
  }
}

export const notificationProvider: NotificationProvider = new NoOpNotificationProvider();
