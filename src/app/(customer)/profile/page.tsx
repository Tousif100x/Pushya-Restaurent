"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, MapPin, Package, User as UserIcon, Check, Lock, Shield, Info, RefreshCw, Bell, BellOff } from "lucide-react";
import { requestNotificationPermission } from "@/lib/notifications/firebase-client";
import { FadeIn, SlideUp } from "@/components/animations/Motion";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const { addItem, clearCart } = useCartStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);

  // Password modal
  const [passModal, setPassModal] = useState({ isOpen: false, currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingPass, setSavingPass] = useState(false);

  // Edit Name modal
  const [editModal, setEditModal] = useState<{ isOpen: boolean; name: string }>({ isOpen: false, name: "" });
  const [isSaving, setIsSaving] = useState(false);

  // Info modal
  const [infoModal, setInfoModal] = useState<{ isOpen: boolean; title: string; content: string }>({
    isOpen: false,
    title: "",
    content: "",
  });

  // Notification permission state
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported" | "unknown">("unknown");
  const [registeringNotif, setRegisteringNotif] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    } else {
      setNotifPermission("unsupported");
    }
  }, []);

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

  const handleLogout = async () => {
    localStorage.removeItem("pushya_app_role");
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out successfully");
    router.push("/");
  };

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passModal.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passModal.newPassword !== passModal.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSavingPass(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passModal.currentPassword,
          newPassword: passModal.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password changed successfully!");
        setPassModal({ isOpen: false, currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(data.error || "Failed to change password");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSavingPass(false);
    }
  };

  const handleReorder = (order: any) => {
    clearCart();
    order.items?.forEach((item: any) => {
      addItem({
        id: item.itemId || item.id,
        name: item.itemName || item.name,
        price: item.price,
        quantity: item.quantity,
        image: "",
      });
    });
    toast.success("Items loaded into cart! Directing to checkout...");
    router.push("/checkout");
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

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-forest">My Account</h1>
            <p className="text-muted-foreground text-sm mt-0.5">+91 {user.phone}</p>
          </div>
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </FadeIn>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Profile, Addresses & Account Actions */}
        <div className="md:col-span-1 space-y-6">
          <SlideUp delay={0.1}>
            <Card className="border-gold/20 shadow-xs">
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
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    variant="outline"
                    className="w-full text-xs h-9 px-2 border-forest/20 text-forest truncate"
                    onClick={() => setEditModal({ isOpen: true, name: user.name || "" })}
                  >
                    Edit Name
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-xs h-9 px-2 border-gold/40 text-forest hover:bg-gold/10 truncate flex items-center justify-center gap-1"
                    onClick={() => setPassModal({ isOpen: true, currentPassword: "", newPassword: "", confirmPassword: "" })}
                  >
                    <Lock className="w-3 h-3 shrink-0 text-gold" />
                    <span>Password</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </SlideUp>

          {/* Notifications Card */}
          <SlideUp delay={0.15}>
            <Card className="border-gold/20 shadow-xs">
              <CardHeader className="bg-forest/5 pb-3 px-4">
                <CardTitle className="text-forest flex items-center gap-2 text-base font-serif">
                  <Bell className="w-4 h-4 text-gold" /> Order Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 px-4 pb-4 space-y-3 text-sm">
                {notifPermission === "granted" && (
                  <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
                    <Bell className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-green-700">Notifications Enabled ✅</p>
                      <p className="text-xs text-green-600 mt-0.5">You'll receive alerts when your order is accepted, prepared, or delivered.</p>
                    </div>
                  </div>
                )}

                {notifPermission === "default" && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Enable notifications to get order updates even when the app is closed.</p>
                    <Button
                      className="w-full bg-forest hover:bg-forest/90 text-white h-9 text-xs gap-2"
                      disabled={registeringNotif}
                      onClick={async () => {
                        setRegisteringNotif(true);
                        try {
                          const token = await requestNotificationPermission();
                          setNotifPermission(Notification.permission);
                          if (token) {
                            await fetch("/api/auth/fcm-token", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ token }),
                            });
                            toast.success("Notifications enabled! You'll now get order updates.");
                          } else {
                            toast.error("Could not enable — please allow in browser settings.");
                          }
                        } finally {
                          setRegisteringNotif(false);
                        }
                      }}
                    >
                      <Bell className="w-3.5 h-3.5" />
                      {registeringNotif ? "Enabling..." : "Enable Order Notifications"}
                    </Button>
                  </div>
                )}

                {notifPermission === "denied" && (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                      <BellOff className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-red-700">Notifications Blocked</p>
                        <p className="text-xs text-red-600 mt-0.5">You blocked notifications. To re-enable:</p>
                        <p className="text-xs text-red-600 mt-1">📱 <strong>Android:</strong> Chrome menu → Site settings → Notifications → Allow</p>
                        <p className="text-xs text-red-600">🍎 <strong>iPhone:</strong> Settings → Safari → This site → Allow Notifications</p>
                        <p className="text-xs text-red-500 font-semibold mt-1">Then reload the app.</p>
                      </div>
                    </div>
                  </div>
                )}

                {notifPermission === "unsupported" && (
                  <p className="text-xs text-muted-foreground">Push notifications are not supported on this browser.</p>
                )}
              </CardContent>
            </Card>
          </SlideUp>

          {/* Saved Addresses */}
          <SlideUp delay={0.2}>
            <Card className="border-gold/20 shadow-xs">
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
                    <div key={addr.id} className="border rounded-lg p-3 text-xs space-y-1 bg-muted/20">
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
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </SlideUp>

          {/* Legal & About */}
          <SlideUp delay={0.3}>
            <Card className="border-border shadow-xs text-xs space-y-1">
              <CardContent className="p-4 space-y-2">
                <button
                  onClick={() =>
                    setInfoModal({
                      isOpen: true,
                      title: "Privacy Policy & Terms",
                      content:
                        "Pushya Pizza & Sandwich Planet respects your privacy. We store your contact information and delivery address strictly to fulfill your food orders. Your data is encrypted and never shared with third parties.",
                    })
                  }
                  className="w-full text-left font-semibold text-forest hover:text-gold flex items-center gap-2 py-1"
                >
                  <Shield className="w-4 h-4 text-gold" /> Privacy Policy & Terms
                </button>
                <button
                  onClick={() =>
                    setInfoModal({
                      isOpen: true,
                      title: "About Pushya Planet",
                      content:
                        "Located at Shri Krishna Paradise, Rau Circle, Indore, Pushya Planet serves handcrafted pizzas, grilled sandwiches, and multi-cuisine delicacies. Open 08:00 AM - 10:00 PM daily. Contact: 9098382993.",
                    })
                  }
                  className="w-full text-left font-semibold text-forest hover:text-gold flex items-center gap-2 py-1"
                >
                  <Info className="w-4 h-4 text-gold" /> About Pushya Planet
                </button>
              </CardContent>
            </Card>
          </SlideUp>

          {/* Mode Switcher */}
          <SlideUp delay={0.4}>
            <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 text-center">
              <p className="text-xs text-forest font-medium">Manage restaurant operations?</p>
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-forest hover:text-gold transition-colors mt-1 underline"
              >
                Switch to Restaurant Login
              </button>
            </div>
          </SlideUp>
        </div>

        {/* Right Column: Order History & Reorder */}
        <div className="md:col-span-2">
          <SlideUp delay={0.3}>
            <Card className="border-gold/20 shadow-xs h-full">
              <CardHeader className="bg-forest/5 pb-4">
                <CardTitle className="text-forest flex items-center gap-2 text-lg font-serif">
                  <Package className="w-5 h-5 text-gold" /> Order History
                </CardTitle>
                <CardDescription>View past orders and repeat your favorite meals in 1 click.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {orders.length === 0 ? (
                  <EmptyState
                    icon={<Package className="w-6 h-6" />}
                    title="No Orders Yet"
                    description="You haven't placed any orders with us yet."
                    action={
                      <Button className="bg-forest text-white hover:bg-forest/90" onClick={() => router.push("/menu")}>
                        Explore Menu
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
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-forest">Order #{order.id.slice(0, 8)}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                order.status === "DELIVERED"
                                  ? "bg-green-100 text-green-700"
                                  : order.status === "CANCELLED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                          <p className="text-xs font-semibold text-forest">
                            {order.items?.map((i: any) => `${i.itemName || i.name} (x${i.quantity})`).join(", ")}
                          </p>
                          <p className="text-sm font-bold text-gold">₹{order.totalAmount}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 shrink-0">
                          {order.status === "OUT_FOR_DELIVERY" && (
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1"
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/orders/${order.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ status: "DELIVERED", isCustomerConfirmation: true }),
                                  });
                                  if (res.ok) {
                                    setOrders((prev) =>
                                      prev.map((o) => (o.id === order.id ? { ...o, status: "DELIVERED" } : o))
                                    );
                                    toast.success("Order marked as Delivered!");
                                  }
                                } catch {
                                  toast.error("Failed to mark delivered.");
                                }
                              }}
                            >
                              <Check className="w-3.5 h-3.5" /> Confirm Delivered
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gold text-forest hover:bg-gold/10 text-xs"
                            onClick={() => handleReorder(order)}
                          >
                            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reorder
                          </Button>
                          <Button
                            size="sm"
                            className="bg-forest text-white hover:bg-forest/90 text-xs"
                            onClick={() => router.push(`/order/${order.id}`)}
                          >
                            Track
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

      {/* Password Modal */}
      {passModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl space-y-4">
            <h3 className="text-lg font-bold font-serif text-forest">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Current Password</Label>
                <Input
                  type="password"
                  required
                  value={passModal.currentPassword}
                  onChange={(e) => setPassModal({ ...passModal, currentPassword: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">New Password (min 6 chars)</Label>
                <Input
                  type="password"
                  required
                  value={passModal.newPassword}
                  onChange={(e) => setPassModal({ ...passModal, newPassword: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Confirm New Password</Label>
                <Input
                  type="password"
                  required
                  value={passModal.confirmPassword}
                  onChange={(e) => setPassModal({ ...passModal, confirmPassword: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setPassModal({ ...passModal, isOpen: false })}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-forest text-white" disabled={savingPass}>
                  {savingPass ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {infoModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h3 className="text-lg font-bold font-serif text-forest">{infoModal.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{infoModal.content}</p>
            <div className="flex justify-end">
              <Button size="sm" className="bg-forest text-white" onClick={() => setInfoModal({ ...infoModal, isOpen: false })}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Name Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl space-y-4">
            <h3 className="text-lg font-bold font-serif text-forest">Edit Full Name</h3>
            <div>
              <Label className="text-xs mb-1 block">Full Name</Label>
              <Input
                type="text"
                value={editModal.name}
                onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
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
