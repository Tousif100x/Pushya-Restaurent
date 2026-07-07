type OrderListener = (orders: any[]) => void;

/**
 * NotificationService
 * Abstracted layer for receiving real-time order updates.
 * Currently uses polling, but designed to be swapped with SSE, WebSockets, or FCM in the future.
 */
class NotificationService {
  private listeners: OrderListener[] = [];
  private pollingInterval: NodeJS.Timeout | null = null;
  private isPolling = false;
  private currentUnacknowledgedIds: Set<string> = new Set();

  // Start listening for new unacknowledged orders
  public start(intervalMs: number = 5000) {
    if (this.isPolling) return;
    this.isPolling = true;

    // Immediately fetch once
    this.fetchUnacknowledgedOrders();

    // Start polling
    this.pollingInterval = setInterval(() => {
      this.fetchUnacknowledgedOrders();
    }, intervalMs);
  }

  // Stop listening
  public stop() {
    this.isPolling = false;
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Subscribe to updates
  public subscribe(listener: OrderListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Fetch unacknowledged orders from the server
  private async fetchUnacknowledgedOrders() {
    try {
      const response = await fetch('/api/orders?status=PENDING&isAcknowledged=false');
      if (!response.ok) return;

      const data = await response.json();
      
      // Notify listeners if there's any unacknowledged order
      this.listeners.forEach((listener) => listener(Array.isArray(data) ? data : []));
    } catch (error) {
      console.error("Error fetching unacknowledged orders:", error);
    }
  }
}

// Export a singleton instance
export const notificationService = new NotificationService();
