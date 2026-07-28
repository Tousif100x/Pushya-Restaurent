"use client";

import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FadeIn, SlideUp } from "@/components/animations/Motion";
import Link from "next/link";
import { ArrowLeft, Phone, MessageCircle, AlertCircle, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { calculateDeliveryCharge } from "@/lib/locationUtils";
import { checkRestaurantOpen } from "@/lib/restaurantHours";

const LocationPicker = dynamic(
  () => import("@/components/map/LocationPicker").then((mod) => mod.LocationPicker),
  { ssr: false }
);

interface RestaurantSettings {
  openingTime: string;
  closingTime: string;
  isAcceptingOrders: boolean;
  holidayMode: boolean;
  deliveryRadiusKm: number;
  baseDeliveryCharge: number;
  distanceSlabs: { maxKm: number; charge: number }[];
  contactPhone: string;
  contactWhatsapp: string;
  latitude?: number;
  longitude?: number;
}

export default function CheckoutPage() {
  const { items, getSubtotal, getTotalItems, clearCart } = useCartStore();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    houseNumber: "",
    flat: "",
    floor: "",
    apartment: "",
    landmark: "",
    instructions: "",
  });

  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
    distanceKm: number;
    isValid: boolean;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    checkAuth();

    // Fetch live restaurant settings
    fetch("/api/restaurant/settings")
      .then((r) => r.json())
      .then(setRestaurantSettings)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
      }));
    }
  }, [isAuthenticated, user]);

  const subtotal = getSubtotal();
  const deliveryFee =
    location?.isValid && restaurantSettings
      ? calculateDeliveryCharge(
          location.distanceKm,
          restaurantSettings.deliveryRadiusKm,
          restaurantSettings.distanceSlabs,
          restaurantSettings.baseDeliveryCharge
        )
      : 0;
  const total = subtotal + (deliveryFee > 0 ? deliveryFee : 0);

  const restaurantStatus = restaurantSettings
    ? checkRestaurantOpen(restaurantSettings)
    : { isOpen: true, reason: "" };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!restaurantStatus.isOpen) {
      alert(`Sorry, we are currently closed. ${restaurantStatus.reason}`);
      return;
    }
    if (!location) {
      alert("Please select your delivery location on the map.");
      return;
    }
    if (!location.isValid) {
      alert(
        `Sorry, this location is outside our delivery area (max ${restaurantSettings?.deliveryRadiusKm ?? 4}km).`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const fullAddress = [
        formData.houseNumber,
        formData.flat,
        formData.floor && `Floor ${formData.floor}`,
        formData.apartment,
      ]
        .filter(Boolean)
        .join(", ");

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || null,
          customerName: formData.name,
          customerPhone: formData.phone,
          customerAddress: `${fullAddress}, ${location.address}`,
          formattedAddress: location.address,
          houseNumber: formData.houseNumber,
          flat: formData.flat,
          floor: formData.floor,
          apartment: formData.apartment,
          landmark: formData.landmark,
          deliveryInstructions: formData.instructions,
          latitude: location.lat,
          longitude: location.lng,
          distanceKm: location.distanceKm,
          deliveryDistance: location.distanceKm,
          totalAmount: total,
          deliveryFee: deliveryFee,
          deliveryCharge: deliveryFee,
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
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

  if (!isMounted || isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-[400px] bg-muted rounded-xl animate-pulse" />
            <div className="h-[200px] bg-muted rounded-xl animate-pulse" />
          </div>
          <div className="lg:col-span-1">
            <div className="h-[300px] bg-muted rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center bg-background">
        <h2 className="font-serif text-3xl font-bold text-forest mb-4">Your Cart is Empty</h2>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Add some items from our menu to get started.
        </p>
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
            <Link href="/menu">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Menu
            </Link>
          </Button>
          <h1 className="font-serif text-4xl font-bold text-forest">Checkout</h1>
        </FadeIn>

        {/* Restaurant Closed Banner */}
        {restaurantSettings && !restaurantStatus.isOpen && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-300 rounded-lg p-4 text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Restaurant Currently Closed</p>
              <p className="text-sm">{restaurantStatus.reason}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form */}
          <div className="lg:w-2/3 space-y-6">
            <SlideUp>
              <form id="checkout-form" onSubmit={handleSubmit}>
                <Card className="border-border overflow-hidden">
                  <div className="bg-forest px-6 py-4">
                    <CardTitle className="text-background font-serif text-2xl">
                      Delivery Details
                    </CardTitle>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          required
                          placeholder="Your Name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          required
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border">
                      <Label className="text-base font-semibold">
                        Delivery Location — Pin on Map *
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Tap on the map or drag the pin to your exact location.
                      </p>
                      <LocationPicker
                        onLocationSelect={(loc) => setLocation(loc)}
                        settings={restaurantSettings ?? undefined}
                      />
                    </div>

                    <div className="border-t border-border pt-4">
                      <p className="text-sm font-semibold mb-3 text-forest">
                        Address Details (Helps the rider find you faster)
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="houseNumber">House / Flat No *</Label>
                          <Input
                            id="houseNumber"
                            required
                            placeholder="e.g. 42B"
                            value={formData.houseNumber}
                            onChange={(e) =>
                              setFormData({ ...formData, houseNumber: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="apartment">Apartment / Society</Label>
                          <Input
                            id="apartment"
                            placeholder="e.g. Shri Krishna Paradise"
                            value={formData.apartment}
                            onChange={(e) =>
                              setFormData({ ...formData, apartment: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="floor">Floor</Label>
                          <Input
                            id="floor"
                            placeholder="e.g. 3rd Floor"
                            value={formData.floor}
                            onChange={(e) =>
                              setFormData({ ...formData, floor: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="landmark">Landmark</Label>
                          <Input
                            id="landmark"
                            placeholder="e.g. Near main gate"
                            value={formData.landmark}
                            onChange={(e) =>
                              setFormData({ ...formData, landmark: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2 mt-4">
                        <Label htmlFor="instructions">Delivery Instructions</Label>
                        <Input
                          id="instructions"
                          placeholder="e.g. Leave at door, Don't ring bell"
                          value={formData.instructions}
                          onChange={(e) =>
                            setFormData({ ...formData, instructions: e.target.value })
                          }
                        />
                      </div>
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
                    <p className="text-sm text-muted-foreground">
                      Trouble placing your order?
                    </p>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-forest text-forest hover:bg-forest-soft"
                    >
                      <a href={`tel:+91${restaurantSettings?.contactPhone ?? "9098382993"}`}>
                        <Phone className="mr-2 h-4 w-4" /> Call Us
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-green-600 text-green-600 hover:bg-green-50"
                    >
                      <a
                        href={`https://wa.me/91${restaurantSettings?.contactWhatsapp ?? "9098382993"}`}
                        target="_blank"
                        rel="noreferrer"
                      >
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
                  <CardTitle className="text-background font-serif text-xl">
                    Order Summary
                  </CardTitle>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="text-sm font-medium mb-2">Items ({getTotalItems()})</div>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div className="flex gap-2">
                          <span className="text-muted-foreground">{item.quantity}x</span>
                          <span className="line-clamp-1">{item.name}</span>
                        </div>
                        <span className="font-medium whitespace-nowrap">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span className="font-medium">
                        {location ? (deliveryFee > 0 ? `₹${deliveryFee}` : "Free") : "—"}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-end mb-6">
                    <span className="font-serif text-xl font-bold">Grand Total</span>
                    <span className="font-serif text-2xl font-bold text-forest">₹{total}</span>
                  </div>

                  <div className="bg-forest-soft/30 p-3 rounded-md text-sm text-center text-forest mb-6 border border-forest-soft">
                    Cash or Scan &amp; Pay on delivery.
                  </div>

                  <Button
                    type="submit"
                    form="checkout-form"
                    className="w-full bg-gold text-forest hover:bg-gold/90 h-12 text-lg rounded-full shadow-lg"
                    disabled={isSubmitting || !restaurantStatus.isOpen}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing Order...
                      </>
                    ) : !restaurantStatus.isOpen ? (
                      "Restaurant Closed"
                    ) : (
                      "Place Order"
                    )}
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
