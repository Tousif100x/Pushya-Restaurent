import { NotificationProvider, PushNotificationPayload } from "./types";

export class TelegramNotificationProvider implements NotificationProvider {
  initBackend() {
    // No complex initialization required for Telegram Bot API!
  }

  async sendToTokens(_tokens: string[], payload: PushNotificationPayload): Promise<boolean> {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn("[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured in .env");
      return false;
    }

    try {
      const messageText = `🚨 *${payload.title}*\n\n${payload.body}\n\n🔗 [Open Dashboard](${payload.url || "https://pushya-restaurent.vercel.app/admin/dashboard"})`;

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: "Markdown",
          disable_notification: false, // Forces loud sound alert
        }),
      });

      const data = await response.json();
      if (data.ok) {
        console.log("[Telegram] Push alert delivered to owner chat!");
        return true;
      } else {
        console.error("[Telegram] Error from Telegram API:", data.description);
        return false;
      }
    } catch (error) {
      console.error("[Telegram] Failed to send Telegram alert:", error);
      return false;
    }
  }

  async sendOrderAlert(orderData: {
    orderNum: string;
    customerName: string;
    customerPhone: string;
    totalAmount: number;
    itemsCount: number;
    address: string;
    items: { name: string; quantity: number; price: number }[];
    trackingUrl: string;
  }): Promise<boolean> {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return false;
    }

    try {
      const itemList = orderData.items
        .map((i) => `  • ${i.quantity}x ${i.name} (₹${i.price * i.quantity})`)
        .join("\n");

      const text = `🚨 *NEW ORDER RECEIVED #${orderData.orderNum}*\n\n` +
        `👤 *Customer:* ${orderData.customerName} (${orderData.customerPhone})\n` +
        `📍 *Address:* ${orderData.address}\n\n` +
        `🛒 *Items (${orderData.itemsCount}):*\n${itemList}\n\n` +
        `💰 *Total Amount:* ₹${orderData.totalAmount}\n\n` +
        `📲 [Open Admin Dashboard](https://pushya-restaurent.vercel.app/admin/dashboard)\n` +
        `🔍 [Track Order](${orderData.trackingUrl})`;

      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: "Markdown",
          disable_notification: false,
        }),
      });

      const data = await res.json();
      return data.ok === true;
    } catch (e) {
      console.error("[Telegram] Order alert error:", e);
      return false;
    }
  }
}
