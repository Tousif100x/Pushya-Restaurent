"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, MapPin, Package, User as UserIcon, Plus, Check } from "lucide-react";
import { FadeIn, SlideUp } from "@/components/animations/Motion";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout, checkAuth } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [editModal, setEditModal] = useState<{ isOpen: boolean; name: string }>({
    isOpen: false,
    name: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }

    if (isAuthenticated && user) {
      fetch(`/api/orders?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => setOrders(Array.isArray(data) ? data : []))
        .catch(console.error);
    }
  }, [isAuthenticated, isLoading, router, user]);

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editModal.name }),
      });
      if (res.ok) {
        await checkAuth();
        setEditModal({ isOpen: false, name: "" });
        toast.success("Profile updated!");
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="md:col-span-2">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const addresses = (user as any).addresses || [];
  const defaultAddress = addresses.find((a: any) => a.isDefault) || addresses[0];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-forest">My Account</h1>
            <p className="text-muted-foreground text-sm mt-0.5">+91 {user.phone}</p>
          </div>
          <Button
            variant="outline"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </FadeIn>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Profile & Addresses */}
        <div className="md:col-span-1 space-y-6">
          <SlideUp delay={0.1}>
            <Card className="border-gold/20 shadow-sm">
              <CardHeader className="bg-forest/5 pb-3 px-4">
                <CardTitle className="text-forest flex items-center gap-2 text-base font-serif">
                  <UserIcon className="w-4 h-4 text-gold" /> Personal Info
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 px-4 space-y-3 text-sm">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider block">Full Name</label>
                  <p className="font-medium text-forest">{user.name || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider block">Mobile Number</label>
                  <p className="font-medium text-forest">+91 {user.phone}</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full text-xs h-8 mt-2 border-forest/20 text-forest"
                  onClick={() => setEditModal({ isOpen: true, name: user.name || "" })}
                >
                  Edit Name
                </Button>
              </CardContent>
            </Card>
          </SlideUp>

          <SlideUp delay={0.2}>
            <Card className="border-gold/20 shadow-sm">
              <CardHeader className="bg-forest/5 pb-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-forest flex items-center gap-2 text-base font-serif">
                  <MapPin className="w-4 h-4 text-gold" /> Saved Addresses
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 px-4 space-y-3">
                {addresses.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No saved addresses yet. Save an address during checkout.</p>
                ) : (
                  addresses.map((addr: any) => (
                    <div
                      key={addr.id}
                      className="border rounded-lg p-3 text-xs space-y-1 bg-muted/20 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-forest uppercase tracking-wider text-[10px] bg-forest/10 px-2 py-0.5 rounded">
                          {addr.label || "Address"}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Default
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-foreground leading-tight pt-1">
                        {[addr.houseNumber, addr.flat, addr.apartment].filter(Boolean).join(", ")}
                      </p>
                      <p className="text-muted-foreground line-clamp-2">{addr.formattedAddress}</p>
                      {addr.landmark && (
                        <p className="text-muted-foreground italic">Landmark: {addr.landmark}</p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </SlideUp>

          {/* Switch Experience Option */}
          <SlideUp delay={0.3}>
            <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 text-center">
              <p className="text-xs text-forest font-medium">Want to manage restaurant operations?</p>
              <button
                onClick={() => {
                  localStorage.removeItem("pushya_app_role");
                  router.push("/");
                }}
                className="text-xs font-bold text-forest hover:text-gold transition-colors mt-1 underline"
              >
                Switch Experience / Admin Login
              </button>
            </div>
          </SlideUp>
        </div>

        {/* Right Column: Order History */}
        <div className="md:col-span-2">
          <SlideUp delay={0.3}>
            <Card className="border-gold/20 shadow-sm h-full">
              <CardHeader className="bg-forest/5 pb-4">
                <CardTitle className="text-forest flex items-center gap-2 text-lg font-serif">
                  <Package className="w-5 h-5 text-gold" /> Order History
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {orders.length === 0 ? (
                  <EmptyState
                    icon={<Package className="w-6 h-6" />}
                    title="No Orders Yet"
                    description="You haven't placed any orders with us. Let's fix that!"
                    action={
                      <Button className="bg-forest text-white hover:bg-forest/90" onClick={() => router.push("/menu")}>
                        Order Now
                      </Button>
                    }
                  />
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-gold/50 transition-colors bg-white shadow-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">Order #{order.id.slice(0, 8)}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                order.status === "DELIVERED"
                                  ? "bg-green-100 text-green-700"
                                  : order.status === "CANCELLED"
                                  ? "bg-red-100 text-red-700"
                                  : order.status === "MODIFICATION_REQUESTED"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                          <p className="text-sm font-medium mt-1">
                            {order.items?.length || 0} items • ₹{order.totalAmount}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-forest text-white hover:bg-forest/90"
                            onClick={() => router.push(`/order/${order.id}`)}
                          >
                            Track Order
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </SlideUp>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl space-y-4">
            <h3 className="text-lg font-bold font-serif text-forest">Edit Full Name</h3>
            <div>
              <label className="text-xs font-medium text-forest mb-1 block">Full Name</label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-forest focus:border-forest"
                value={editModal.name}
                onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setEditModal({ isOpen: false, name: "" })}>
                Cancel
              </Button>
              <Button size="sm" className="bg-forest text-white" onClick={saveProfile} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
