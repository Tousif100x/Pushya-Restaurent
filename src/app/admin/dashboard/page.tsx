"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SlideUp, StaggerContainer, StaggerItem } from "@/components/animations/Motion";
import { 
  Activity, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Clock,
  Settings,
  LogOut,
  RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AdminOrderCard } from "./OrderCard";
import { OrderAlarmSystem } from "@/components/admin/OrderAlarmSystem";
import Link from "next/link";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingOrderIds, setPendingOrderIds] = useState<string[]>([]);
  const [prevOrderIds, setPrevOrderIds] = useState<Set<string>>(new Set());
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);

        // Detect NEW pending orders (not previously seen)
        const currentPending = data
          .filter((o: any) => o.status === "PENDING")
          .map((o: any) => o.id);

        setPendingOrderIds((prev) => {
          const newIds = currentPending.filter((id: string) => !prevOrderIds.has(id));
          const combined = Array.from(new Set([...prev, ...newIds]));
          return combined;
        });

        // Keep track of all seen order IDs so we don't re-alarm on re-polls
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
    if (typeof window !== "undefined" && localStorage.getItem("adminAuth") !== "true") {
      router.push("/admin/login");
      return;
    }

    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
        // Remove from alarm queue when acknowledged
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

  const logout = () => {
    localStorage.removeItem("adminAuth");
    router.push("/admin/login");
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
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 space-y-8 bg-muted/30 min-h-screen">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-serif text-forest">Dashboard</h2>
            <p className="text-muted-foreground text-sm mt-1">Live Order Management</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchOrders}
              title="Refresh Orders"
              className="border-forest/30 text-forest hover:bg-forest-soft"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              asChild
              className="border-forest text-forest hover:bg-forest-soft"
            >
              <Link href="/admin/settings">
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Link>
            </Button>
            <Button variant="destructive" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>

        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalRevenue.toFixed(0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Lifetime</p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className={pendingCount > 0 ? "border-orange-400 bg-orange-50" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${pendingCount > 0 ? "text-orange-600" : ""}`}>
                  {pendingCount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Requires Approval</p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeDeliveries}</div>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl flex items-center">
                <Package className="mr-2 h-5 w-5" /> Live Orders
                {pendingCount > 0 && (
                  <Badge className="ml-2 bg-orange-500 text-white animate-pulse">
                    {pendingCount} Pending
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No orders yet. Waiting for customers...</p>
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
      </div>
    </>
  );
}
