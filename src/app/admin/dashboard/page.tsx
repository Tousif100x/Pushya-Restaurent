"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SlideUp, StaggerContainer, StaggerItem } from "@/components/animations/Motion";
import { 
  Activity, 
  CreditCard, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users,
  UtensilsCrossed,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AdminOrderCard } from "./OrderCard";
import { OrderAlarmSystem } from "@/components/admin/OrderAlarmSystem";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Basic auth check (if not logged in, localStorage won't have admin=true)
    if (typeof window !== 'undefined' && localStorage.getItem('adminAuth') !== 'true') {
      router.push('/admin/login');
      return;
    }

    // Request notification permission on mount
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Poll every 10s

    return () => clearInterval(interval);
  }, [orders.length, router]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
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
        setOrders(orders.map(o => o.id === id ? { ...o, status: "MODIFICATION_REQUESTED" } : o));
      }
    } catch (error) {
      console.error("Failed to send modification request", error);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminAuth');
    router.push('/');
  }

  const totalRevenue = orders.reduce((sum, order) => sum + (order.status !== 'CANCELLED' ? order.totalAmount : 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;

  return (
    <>
      <OrderAlarmSystem />
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 space-y-8 bg-muted/30 min-h-screen">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-serif text-forest">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="border-forest text-forest hover:bg-forest-soft">Download Report</Button>
          <Button variant="destructive" onClick={logout}>Logout</Button>
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
              <div className="text-2xl font-bold">₹{totalRevenue}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1 text-green-600">
                Lifetime Revenue
              </p>
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{pendingOrders}</div>
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
              <div className="text-2xl font-bold">{orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length}</div>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-7">
          <CardHeader>
            <CardTitle className="font-serif text-xl flex items-center">
              <Package className="mr-2 h-5 w-5" /> Recent Orders (Live)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No orders yet.</p>
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
      
      {/* In-app Notification */}
      {newOrderAlert && (
        <div className="fixed bottom-4 right-4 bg-forest text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 z-50">
          <UtensilsCrossed className="h-6 w-6 text-gold" />
          <div>
            <h4 className="font-bold font-serif text-lg leading-none mb-1">New Order Received!</h4>
            <p className="text-sm text-gray-200">A new order has just been placed. Please review it.</p>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 ml-2" onClick={() => setNewOrderAlert(false)}>
            <ArrowDownRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
    </>
  );
}
