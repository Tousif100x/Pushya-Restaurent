"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StaggerContainer, StaggerItem } from "@/components/animations/Motion";
import { Activity, DollarSign, Package, ShoppingCart, Clock, RefreshCw, Bell, BellOff, Send, CheckCircle2, ShieldAlert } from "lucide-react";
import { AdminOrderCard } from "./OrderCard";
import { OrderAlarmSystem } from "@/components/admin/OrderAlarmSystem";
import { requestNotificationPermission, requestNotificationPermissionDetailed } from "@/lib/notifications/firebase-client";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingOrderIds, setPendingOrderIds] = useState<string[]>([]);
  const [prevOrderIds, setPrevOrderIds] = useState<Set<string>>(new Set());

  // Notification Permission State
  const [notifState, setNotifState] = useState<NotificationPermission | "unsupported" | "unknown">("unknown");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isTestingPush, setIsTestingPush] = useState(false);

  const checkAndRegisterPush = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotifState("unsupported");
      return;
    }
    const perm = Notification.permission;
    setNotifState(perm);

    if (perm === "granted") {
      try {
        const res = await requestNotificationPermissionDetailed();
        if (res.token) {
          await fetch("/api/admin/device", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: res.token }),
          });
        }
      } catch (err) {
        console.error("Admin FCM token registration failed:", err);
      }
    }
  }, []);

  useEffect(() => {
    checkAndRegisterPush();
  }, [checkAndRegisterPush]);

  const handleEnablePush = async () => {
    setIsRegistering(true);
    try {
      const res = await requestNotificationPermissionDetailed();
      setNotifState(Notification.permission);
      if (res.token) {
        await fetch("/api/admin/device", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: res.token }),
        });
        toast.success("Background notifications enabled for Admin device!");
      } else {
        toast.error(`Notification Error: ${res.error || "Permission not granted"}`);
      }
    } catch (e: any) {
      toast.error(`Failed to enable push: ${e?.message || e}`);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleTestPush = async () => {
    setIsTestingPush(true);
    try {
      // 1. Force obtain and register device FCM token first with 3-tier fallback
      const resToken = await requestNotificationPermissionDetailed();
      if (resToken.token) {
        await fetch("/api/admin/device", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: resToken.token }),
        });
      } else {
        toast.error(`FCM Token Error: ${resToken.error || "Token generation failed"}`);
        setIsTestingPush(false);
        return;
      }

      // 2. Send test push notification
      const res = await fetch("/api/admin/firebase-status", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("🧪 Test push notification sent! Check your notification bar or lock screen now.");
      } else {
        toast.error(`Push failed: ${data.error || data.message || "Unknown error"}`);
      }
    } catch (e: any) {
      toast.error(`Network error sending test push: ${e?.message || e}`);
    } finally {
      setIsTestingPush(false);
    }
  };

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);

        const currentPending = data
          .filter((o: any) => o.status === "PENDING")
          .map((o: any) => o.id);

        setPendingOrderIds((prev) => {
          const newIds = currentPending.filter((id: string) => !prevOrderIds.has(id));
          return Array.from(new Set([...prev, ...newIds]));
        });

        setPrevOrderIds((prev) => {
          const next = new Set(prev);
          data.forEach((o: any) => next.add(o.id));
          return next;
        });
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }, [prevOrderIds]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
        setPendingOrderIds((prev) => prev.filter((pid) => pid !== id));
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleModifyOrder = async (id: string, modifications: any[]) => {
    try {
      const res = await fetch(`/api/orders/${id}/modify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modifications }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: "MODIFICATION_REQUESTED" } : o))
        );
        setPendingOrderIds((prev) => prev.filter((pid) => pid !== id));
      }
    } catch (error) {
      console.error("Failed to send modification request", error);
    }
  };

  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.status !== "CANCELLED" ? order.totalAmount : 0),
    0
  );
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const activeDeliveries = orders.filter((o) => o.status === "OUT_FOR_DELIVERY").length;

  return (
    <>
      <OrderAlarmSystem pendingOrderIds={pendingOrderIds} />
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 bg-gray-50 min-h-screen">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif text-forest">Dashboard</h2>
            <p className="text-muted-foreground text-sm mt-0.5">Live Order Management</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchOrders}
            title="Refresh"
            className="border-forest/30 text-forest hover:bg-forest/5 h-9 w-9"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* ── Admin Push Notification Control Banner ── */}
        {notifState === "granted" ? (
          <div className="flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Background Order Alerts Active
                </p>
                <p className="text-[11px] text-emerald-700 truncate">
                  Push notifications enabled for this device — alerts arrive even when app is closed.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleTestPush}
              disabled={isTestingPush}
              className="border-emerald-400 text-emerald-800 hover:bg-emerald-100 text-xs shrink-0 h-8 gap-1"
            >
              <Send className="w-3 h-3 text-emerald-600" />
              {isTestingPush ? "Sending..." : "Test Push"}
            </Button>
          </div>
        ) : notifState === "denied" ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 space-y-1 text-xs text-red-700">
            <p className="font-bold flex items-center gap-1.5 text-red-800">
              <BellOff className="w-4 h-4 text-red-500" /> Order Alerts Blocked on this Device
            </p>
            <p>You will not receive background notifications for new orders because permissions are blocked.</p>
            <p className="font-medium mt-1">📱 <strong>Android Chrome:</strong> Tap ⋮ menu → Site settings → Notifications → Allow → Reload page.</p>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-300 rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <Bell className="w-4 h-4 text-amber-600 shrink-0 animate-bounce" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-amber-900">Enable Order Push Notifications</p>
                <p className="text-[11px] text-amber-700 truncate">
                  Get instant loud push alerts on your phone screen when new orders arrive!
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleEnablePush}
              disabled={isRegistering}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs shrink-0 h-8 gap-1 font-semibold"
            >
              <Bell className="w-3 h-3" />
              {isRegistering ? "Enabling..." : "Enable Now"}
            </Button>
          </div>
        )}

        {/* Stats Grid */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StaggerItem>
            <Card className="border-forest/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">Revenue</CardTitle>
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl font-bold text-forest">₹{totalRevenue.toFixed(0)}</div>
                <p className="text-xs text-muted-foreground mt-0.5">Lifetime</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="border-forest/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">Orders</CardTitle>
                <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl font-bold">{orders.length}</div>
                <p className="text-xs text-muted-foreground mt-0.5">Total</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className={`border-forest/10 ${pendingCount > 0 ? "border-orange-300 bg-orange-50" : ""}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">Pending</CardTitle>
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className={`text-xl font-bold ${pendingCount > 0 ? "text-orange-600" : ""}`}>
                  {pendingCount}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Needs action</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="border-forest/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">On Route</CardTitle>
                <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl font-bold">{activeDeliveries}</div>
                <p className="text-xs text-muted-foreground mt-0.5">Deliveries</p>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        {/* Orders List */}
        <Card className="border-forest/10">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="font-serif text-xl flex items-center gap-2">
              <Package className="h-5 w-5 text-forest" /> Live Orders
              {pendingCount > 0 && (
                <Badge className="ml-1 bg-orange-500 text-white animate-pulse text-xs">
                  {pendingCount} Pending
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium">No orders yet</p>
                <p className="text-sm mt-1">New orders will appear here instantly</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <AdminOrderCard
                    key={order.id}
                    order={order}
                    onUpdateStatus={updateStatus}
                    onModifyOrder={handleModifyOrder}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
