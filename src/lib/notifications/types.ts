export interface PushNotificationPayload {
  title: string;
  body: string;
  url?: string;
  data?: Record<string, string>;
}

export interface NotificationProvider {
  /**
   * Initializes the provider on the backend
   */
  initBackend(): void;
  
  /**
   * Sends a push notification to specific tokens
   */
  sendToTokens(tokens: string[], payload: PushNotificationPayload): Promise<boolean>;
}
