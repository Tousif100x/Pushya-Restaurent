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
import { ArrowLeft, Phone, MessageCircle, AlertCircle, Loader2, MapPin, Check, Plus } from "lucide-react";
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

  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">("new");
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
    distanceKm: number;
    isValid: boolean;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const savedAddresses = (user as any)?.addresses || [];

  useEffect(() => {
    setIsMounted(true);
    checkAuth();

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

      // Pre-select default saved address if available
      const defaultAddr = savedAddresses.find((a: any) => a.isDefault) || savedAddresses[0];
      if (defaultAddr) {
        selectSavedAddress(defaultAddr);
      }
    }
  }, [isAuthenticated, user]);

  const selectSavedAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setFormData((prev) => ({
      ...prev,
      houseNumber: addr.houseNumber || "",
      flat: addr.flat || "",
      floor: addr.floor || "",
      apartment: addr.apartment || "",
      landmark: addr.landmark || "",
      instructions: addr.instructions || "",
    }));

    // Calculate distance from restaurant coordinates
    const restLat = restaurantSettings?.latitude || 22.6378;
    const restLng = restaurantSettings?.longitude || 75.8073;
    const dist = calculateDistanceKm(restLat, restLng, addr.latitude, addr.longitude);
    const maxRadius = restaurantSettings?.deliveryRadiusKm || 4;

    setLocation({
      lat: addr.latitude,
      lng: addr.longitude,
      address: addr.formattedAddress,
      distanceKm: dist,
      isValid: dist <= maxRadius,
    });
  };

  function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  }

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
        // Optionally save new address for logged in user
        if (isAuthenticated && selectedAddressId === "new" && location) {
          fetch("/api/user/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              label: "Home",
              formattedAddress: location.address,
              houseNumber: formData.houseNumber,
              flat: formData.flat,
              floor: formData.floor,
              apartment: formData.apartment,
              landmark: formData.landmark,
              instructions: formData.instructions,
              latitude: location.lat,
              longitude: location.lng,
              isDefault: savedAddresses.length === 0,
            }),
          }).catch(console.error);
        }

        // Generate WhatsApp message for restaurant owner
        const orderNum = data.orderId.slice(-6).toUpperCase();
        const mapsLink = location
          ? `https://maps.google.com/?q=${location.lat},${location.lng}`
          : "Not provided";

        const itemLines = items
          .map((item) => `  • ${item.name} × ${item.quantity} = ₹${item.price * item.quantity}`)
          .join("\n");

        const fullAddrLine = [
          formData.houseNumber,
          formData.flat,
          formData.floor && `Floor ${formData.floor}`,
          formData.apartment,
          formData.landmark && `Near ${formData.landmark}`,
          location?.address,
        ]
          .filter(Boolean)
          .join(", ");

        const waMessage = [
          `🛒 *NEW ORDER #${orderNum}*`,
          ``,
          `👤 *Customer:* ${formData.name}`,
          `📞 *Phone:* ${formData.phone}`,
          ``,
          `📦 *Items:*`,
          itemLines,
          ``,
          `💰 *Subtotal:* ₹${subtotal}`,
          `🚴 *Delivery Fee:* ₹${deliveryFee}`,
          `🏷 *TOTAL: ₹${total}*`,
          ``,
          `📍 *Delivery Address:*`,
          fullAddrLine,
          ``,
          `🗺 *Google Maps:* ${mapsLink}`,
          formData.instructions ? `📝 *Instructions:* ${formData.instructions}` : "",
          ``,
          `🔗 *Order Link:* ${window.location.origin}/order/${data.orderId}`,
          ``,
          `_Reply ACCEPT / MODIFY / CANCEL to this order_`,
        ]
          .filter((l) => l !== undefined)
          .join("\n");

        const ownerPhone = restaurantSettings?.contactWhatsapp || "9098382993";
        const waUrl = `https://wa.me/91${ownerPhone}?text=${encodeURIComponent(waMessage)}`;

        clearCart();

        // Open WhatsApp in same window (or new tab on desktop) then navigate to order page
        window.open(waUrl, "_blank", "noopener,noreferrer");

        // Navigate to order tracking after small delay
        setTimeout(() => {
          router.push(`/order/${data.orderId}`);
        }, 800);
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
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-[400px] bg-muted rounded-xl animate-pulse" />
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
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center bg-background px-4">
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
    <div className="bg-background min-h-screen pt-20 pb-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-6">
          <Button variant="ghost" asChild className="mb-2 pl-0 hover:bg-transparent hover:text-gold">
            <Link href="/menu">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Menu
            </Link>
          </Button>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-forest">Checkout</h1>
        </FadeIn>

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
          {/* Main Form Column */}
          <div className="lg:w-2/3 space-y-6">
            <SlideUp>
              <form id="checkout-form" onSubmit={handleSubmit}>
                <Card className="border-border overflow-hidden shadow-sm">
                  <div className="bg-forest px-6 py-4">
                    <CardTitle className="text-background font-serif text-xl sm:text-2xl">
                      Delivery Details
                    </CardTitle>
                  </div>
                  <CardContent className="p-4 sm:p-6 space-y-6">
                    {/* Customer Info */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-forest">Full Name *</Label>
                        <Input
                          id="name"
                          required
                          placeholder="Your Name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-forest">Phone Number *</Label>
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

                    {/* Saved Addresses Option */}
                    {savedAddresses.length > 0 && (
                      <div className="space-y-3 pt-2 border-t border-border">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-forest block">
                          Select Saved Address
                        </Label>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {savedAddresses.map((addr: any) => (
                            <button
                              key={addr.id}
                              type="button"
                              onClick={() => selectSavedAddress(addr)}
                              className={`p-3 rounded-lg border text-left transition-all relative text-xs ${
                                selectedAddressId === addr.id
                                  ? "border-forest bg-forest/5 ring-1 ring-forest"
                                  : "border-border hover:border-gold/50"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-forest uppercase">{addr.label || "Home"}</span>
                                {selectedAddressId === addr.id && (
                                  <Check className="w-4 h-4 text-forest" />
                                )}
                              </div>
                              <p className="line-clamp-2 text-muted-foreground">{addr.formattedAddress}</p>
                              {addr.houseNumber && (
                                <p className="font-medium mt-1">Flat/House: {addr.houseNumber}</p>
                              )}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAddressId("new");
                              setLocation(null);
                            }}
                            className={`p-3 rounded-lg border text-center transition-all flex items-center justify-center gap-2 text-xs font-medium ${
                              selectedAddressId === "new"
                                ? "border-forest bg-forest/5 ring-1 ring-forest text-forest"
                                : "border-dashed border-border hover:border-gold/50 text-muted-foreground"
                            }`}
                          >
                            <Plus className="w-4 h-4" /> Pick New Location on Map
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Location Picker Map */}
                    {(selectedAddressId === "new" || savedAddresses.length === 0) && (
                      <div className="space-y-2 pt-2 border-t border-border">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-forest block">
                          Delivery Location — Pin on Map *
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Tap or drag the marker to your exact building. Address will be auto-filled.
                        </p>
                        <LocationPicker
                          onLocationSelect={(loc) => setLocation(loc)}
                          settings={restaurantSettings ?? undefined}
                        />
                      </div>
                    )}

                    {/* Address Detail Inputs (only missing info) */}
                    <div className="border-t border-border pt-4 space-y-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-forest">
                        Building & Floor Details
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="houseNumber">House / Flat No *</Label>
                          <Input
                            id="houseNumber"
                            required
                            placeholder="e.g. Flat 302, Block A"
                            value={formData.houseNumber}
                            onChange={(e) =>
                              setFormData({ ...formData, houseNumber: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="apartment">Apartment / Society Name</Label>
                          <Input
                            id="apartment"
                            placeholder="e.g. Royal Palms Residency"
                            value={formData.apartment}
                            onChange={(e) =>
                              setFormData({ ...formData, apartment: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="landmark">Landmark (Optional)</Label>
                          <Input
                            id="landmark"
                            placeholder="e.g. Near Water Tank"
                            value={formData.landmark}
                            onChange={(e) =>
                              setFormData({ ...formData, landmark: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="instructions">Delivery Instructions</Label>
                          <Input
                            id="instructions"
                            placeholder="e.g. Leave with security / Ring bell"
                            value={formData.instructions}
                            onChange={(e) =>
                              setFormData({ ...formData, instructions: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </form>
            </SlideUp>
          </div>

          {/* Summary Column */}
          <div className="lg:w-1/3">
            <div className="sticky top-24 space-y-6">
              <Card className="border-border shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-serif text-xl font-bold text-forest">Order Summary</h3>
                  <div className="divide-y divide-border">
                    {items.map((item) => (
                      <div key={item.id} className="py-2.5 flex justify-between text-sm">
                        <div>
                          <span className="font-medium text-forest">{item.name}</span>
                          <span className="text-muted-foreground ml-2 text-xs">x{item.quantity}</span>
                        </div>
                        <span className="font-semibold">₹{item.price * item.quantity}</span>
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
                      <span className="text-muted-foreground">Delivery Charge</span>
                      <span>
                        {!location ? (
                          <span className="text-xs text-muted-foreground italic">Select location</span>
                        ) : !location.isValid ? (
                          <span className="text-xs text-red-500 font-bold">Outside area</span>
                        ) : deliveryFee === 0 ? (
                          <span className="text-green-600 font-bold">FREE</span>
                        ) : (
                          <span className="font-medium">₹{deliveryFee}</span>
                        )}
                      </span>
                    </div>

                    {location?.isValid && (
                      <p className="text-[11px] text-muted-foreground">
                        Distance: {location.distanceKm} km from Pushya Planet
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between font-serif text-xl font-bold text-forest pt-1">
                    <span>Total Payable</span>
                    <span className="text-gold">₹{total}</span>
                  </div>

                  <Button
                    type="submit"
                    form="checkout-form"
                    disabled={isSubmitting || !restaurantStatus.isOpen || (location !== null && !location.isValid)}
                    className="w-full h-12 text-base font-semibold bg-forest hover:bg-forest/90 text-white rounded-xl shadow-md mt-4"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Sending Order...
                      </span>
                    ) : (
                      `📲 Send Order via WhatsApp`
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Your order is sent to the restaurant. Payment happens only after owner accepts.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
