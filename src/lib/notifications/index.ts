import { TelegramNotificationProvider } from './telegram-provider';
import { NotificationProvider } from './types';

export const notificationProvider = new TelegramNotificationProvider();
export { TelegramNotificationProvider };
