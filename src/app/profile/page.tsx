"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, MapPin, Package, User as UserIcon } from "lucide-react";
import { FadeIn, SlideUp } from "@/components/animations/Motion";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout, checkAuth } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [editModal, setEditModal] = useState<{ isOpen: boolean, type: 'profile' | 'address', data: any }>({ isOpen: false, type: 'profile', data: {} });
  const [isSaving, setIsSaving] = useState(false);

  const openEdit = (type: 'profile' | 'address') => {
    setEditModal({
      isOpen: true,
      type,
      data: {
        name: user?.name || '',
        defaultAddress: user?.defaultAddress || '',
        landmark: user?.landmark || '',
      }
    });
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editModal.data)
      });
      if (res.ok) {
        await checkAuth(); // Refresh user state from server
        setEditModal({ ...editModal, isOpen: false });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
    
    if (isAuthenticated && user) {
      // Fetch user's orders
      fetch(`/api/orders?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setOrders(Array.isArray(data) ? data : []))
        .catch(console.error);
    }
  }, [isAuthenticated, isLoading, router, user]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-24 max-w-4xl">
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl font-bold text-forest">My Account</h1>
          <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </FadeIn>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <SlideUp delay={0.1}>
            <Card className="border-gold/20 shadow-sm">
              <CardHeader className="bg-forest/5 pb-4">
                <CardTitle className="text-forest flex items-center gap-2 text-lg">
                  <UserIcon className="w-5 h-5 text-gold" /> Profile Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Phone Number</label>
                  <p className="font-medium">+91 {user.phone}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Name</label>
                  <p className="font-medium">{user.name || "Not provided"}</p>
                </div>
                <Button variant="outline" className="w-full text-xs h-8" onClick={() => openEdit('profile')}>Edit Profile</Button>
              </CardContent>
            </Card>
          </SlideUp>

          <SlideUp delay={0.2}>
            <Card className="border-gold/20 shadow-sm">
              <CardHeader className="bg-forest/5 pb-4">
                <CardTitle className="text-forest flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5 text-gold" /> Saved Address
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <p className="text-sm">
                    {user.defaultAddress || "No saved address."}
                  </p>
                  {user.landmark && (
                    <p className="text-xs text-muted-foreground mt-1">Landmark: {user.landmark}</p>
                  )}
                </div>
                <Button variant="outline" className="w-full text-xs h-8" onClick={() => openEdit('address')}>Update Address</Button>
              </CardContent>
            </Card>
          </SlideUp>
        </div>

        <div className="md:col-span-2">
          <SlideUp delay={0.3}>
            <Card className="border-gold/20 shadow-sm h-full">
              <CardHeader className="bg-forest/5 pb-4">
                <CardTitle className="text-forest flex items-center gap-2 text-lg">
                  <Package className="w-5 h-5 text-gold" /> Order History
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto opacity-20 mb-3" />
                    <p>You haven't placed any orders yet.</p>
                    <Button className="mt-4 bg-gold text-forest hover:bg-gold/90" onClick={() => router.push("/menu")}>
                      Order Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-gold/50 transition-colors">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">Order #{order.id.slice(0,6)}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                              order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                              order.status === 'MODIFICATION_REQUESTED' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                          <p className="text-sm font-medium mt-2">{order.items.length} items • ₹{order.totalAmount}</p>
                        </div>
                        <div className="flex gap-2">
                          {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                            <Button size="sm" variant="default" className="bg-forest" onClick={() => router.push(`/order/${order.id}`)}>
                              Track
                            </Button>
                          )}
                          <Button size="sm" variant="outline">Reorder</Button>
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

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold font-serif text-forest mb-4">
              {editModal.type === 'profile' ? 'Edit Profile Details' : 'Update Saved Address'}
            </h3>
            
            <div className="space-y-4 mb-6">
              {editModal.type === 'profile' && (
                <div>
                  <label className="text-sm font-medium text-forest mb-1 block">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full border rounded-md p-2 focus:ring-forest focus:border-forest"
                    value={editModal.data.name}
                    onChange={(e) => setEditModal({...editModal, data: {...editModal.data, name: e.target.value}})}
                  />
                </div>
              )}
              
              {editModal.type === 'address' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-forest mb-1 block">Full Address</label>
                    <textarea 
                      className="w-full border rounded-md p-2 focus:ring-forest focus:border-forest min-h-[80px]"
                      value={editModal.data.defaultAddress}
                      onChange={(e) => setEditModal({...editModal, data: {...editModal.data, defaultAddress: e.target.value}})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-forest mb-1 block">Landmark (Optional)</label>
                    <input 
                      type="text" 
                      className="w-full border rounded-md p-2 focus:ring-forest focus:border-forest"
                      value={editModal.data.landmark}
                      onChange={(e) => setEditModal({...editModal, data: {...editModal.data, landmark: e.target.value}})}
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditModal({...editModal, isOpen: false})}>Cancel</Button>
              <Button className="bg-forest text-white" onClick={saveProfile} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
