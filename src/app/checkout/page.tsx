"use client";

import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FadeIn, SlideUp } from "@/components/animations/Motion";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Phone, MessageCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { restaurantDetails } from "@/data/menu";
import { calculateDistance } from "@/lib/utils";

// Dynamically import Leaflet map component to prevent SSR window issues
const LocationPicker = dynamic(() => import("@/components/map/LocationPicker"), { ssr: false });

export default function CheckoutPage() {
  const { items, getSubtotal, getTotalItems, clearCart } = useCartStore();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    landmark: "",
    instructions: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        address: user.defaultAddress || prev.address,
        landmark: user.landmark || prev.landmark,
        instructions: user.instructions || prev.instructions,
      }));
    }
  }, [isAuthenticated, user]);
  
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = getSubtotal();
  const baseDeliveryFee = 30; 
  // Add ₹10 if distance is strictly greater than 2km
  const deliveryFee = distanceKm && distanceKm > 2 ? baseDeliveryFee + 10 : baseDeliveryFee; 
  const total = subtotal + deliveryFee;

  // Restaurant Coordinates (approx for Rau Circle, Indore)
  const RESTAURANT_LAT = 22.6288;
  const RESTAURANT_LNG = 75.8197;

  useEffect(() => {
    if (location) {
      const dist = calculateDistance(RESTAURANT_LAT, RESTAURANT_LNG, location.lat, location.lng);
      setDistanceKm(dist);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      alert("Please select your delivery location on the map.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || null,
          customerName: formData.name,
          customerPhone: formData.phone,
          customerAddress: `${formData.address}${formData.landmark ? `, Near ${formData.landmark}` : ""}${formData.instructions ? ` (Note: ${formData.instructions})` : ""}`,
          latitude: location.lat,
          longitude: location.lng,
          distanceKm: distanceKm,
          totalAmount: total,
          deliveryFee: deliveryFee,
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        })
      });

      const data = await response.json();
      if (data.success) {
        clearCart();
        router.push(`/order/${data.orderId}`);
      } else {
        alert("Failed to place order. Please try again.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center bg-background">
        <h2 className="font-serif text-3xl font-bold text-forest mb-4">Your Cart is Empty</h2>
        <p className="text-muted-foreground mb-8 text-center max-w-md">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild className="bg-gold text-forest hover:bg-gold/90 rounded-full px-8">
          <Link href="/menu">Explore Menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-24 pb-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <FadeIn className="mb-8">
          <Button variant="ghost" asChild className="mb-4 pl-0 hover:bg-transparent hover:text-gold">
            <Link href="/menu"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Menu</Link>
          </Button>
          <h1 className="font-serif text-4xl font-bold text-forest">Checkout</h1>
        </FadeIn>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Form Section */}
          <div className="lg:w-2/3 space-y-6">
            <SlideUp>
              <form id="checkout-form" onSubmit={handleSubmit}>
                <Card className="border-border overflow-hidden">
                  <div className="bg-forest px-6 py-4">
                    <CardTitle className="text-background font-serif text-2xl">Delivery Details</CardTitle>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          required 
                          placeholder="John Doe" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          required 
                          type="tel" 
                          placeholder="10-digit mobile number" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border mt-6">
                      <Label className="text-base font-semibold">Delivery Location (Pin on Map)</Label>
                      <LocationPicker onLocationSelect={(loc) => setLocation(loc)} />
                      {location && distanceKm !== null && (
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> 
                          Location captured. Distance: {distanceKm.toFixed(1)} km 
                          {distanceKm > 2 && " (₹10 extra charge applies)"}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Complete Address</Label>
                      <Input 
                        id="address" 
                        required 
                        placeholder="House/Flat No, Building Name, Street" 
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="landmark">Landmark (Optional)</Label>
                      <Input 
                        id="landmark" 
                        placeholder="Near..." 
                        value={formData.landmark}
                        onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
                      <Input 
                        id="instructions" 
                        placeholder="e.g. Leave at door, Don't ring bell" 
                        value={formData.instructions}
                        onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                      />
                    </div>
                  </CardContent>
                </Card>
              </form>
            </SlideUp>

            <SlideUp delay={0.1}>
              <Card className="border-border">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-forest text-lg">Need Help?</h3>
                    <p className="text-sm text-muted-foreground">Having trouble placing your order?</p>
                  </div>
                  <div className="flex gap-3">
                    <Button asChild variant="outline" size="sm" className="border-forest text-forest hover:bg-forest-soft">
                      <a href={`tel:+91${restaurantDetails.phone}`}>
                        <Phone className="mr-2 h-4 w-4" /> Call Us
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="border-green-600 text-green-600 hover:bg-green-50">
                      <a href={`https://wa.me/91${restaurantDetails.phone}`} target="_blank" rel="noreferrer">
                        <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </SlideUp>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <SlideUp delay={0.2} className="sticky top-24">
              <Card className="border-border overflow-hidden">
                <div className="bg-forest px-6 py-4">
                  <CardTitle className="text-background font-serif text-xl">Order Summary</CardTitle>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="text-sm font-medium mb-2">Items ({getTotalItems()})</div>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div className="flex gap-2">
                          <span className="text-muted-foreground">{item.quantity}x</span>
                          <span className="line-clamp-1">{item.name}</span>
                        </div>
                        <span className="font-medium whitespace-nowrap">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span className="font-medium">₹{deliveryFee}</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between items-end mb-6">
                    <span className="font-serif text-xl font-bold">Grand Total</span>
                    <span className="font-serif text-2xl font-bold text-forest">₹{total}</span>
                  </div>

                  <div className="bg-forest-soft/30 p-3 rounded-md text-sm text-center text-forest mb-6 border border-forest-soft">
                    Payment will be collected by the delivery partner (Cash or Scan & Pay).
                  </div>

                  <Button 
                    type="submit" 
                    form="checkout-form"
                    className="w-full bg-gold text-forest hover:bg-gold/90 h-12 text-lg rounded-full shadow-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Placing Order..." : "Place Order"}
                  </Button>
                </CardContent>
              </Card>
            </SlideUp>
          </div>

        </div>
      </div>
    </div>
  );
}
