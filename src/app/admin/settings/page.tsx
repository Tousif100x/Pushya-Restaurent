"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save, Store, Clock, Truck, Phone } from "lucide-react";
import Link from "next/link";

interface Settings {
  openingTime: string;
  closingTime: string;
  isAcceptingOrders: boolean;
  holidayMode: boolean;
  deliveryRadiusKm: number;
  baseDeliveryCharge: number;
  estimatedPrepTime: string;
  contactPhone: string;
  contactWhatsapp: string;
  address: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({
    openingTime: "10:00 AM",
    closingTime: "10:00 PM",
    isAcceptingOrders: true,
    holidayMode: false,
    deliveryRadiusKm: 4,
    baseDeliveryCharge: 20,
    estimatedPrepTime: "25-30 mins",
    contactPhone: "9098382993",
    contactWhatsapp: "9098382993",
    address: "Shri Krishna Paradise, Near, Rau Cir, Rau, Indore",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("adminAuth") !== "true") {
      router.push("/admin/login");
      return;
    }
    fetchSettings();
  }, [router]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/restaurant/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      toast.error("Could not load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/restaurant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success("Settings saved successfully!");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (e) {
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof Settings, value: any) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-forest" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-forest">
            <Link href="/admin/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" /> Dashboard
            </Link>
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold font-serif text-forest">Restaurant Settings</h1>
          <p className="text-muted-foreground mt-1">
            Changes take effect immediately for all customers.
          </p>
        </div>

        {/* Status Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-forest" /> Restaurant Status
            </CardTitle>
            <CardDescription>
              Control whether the restaurant is open for orders right now.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-semibold">Accept Orders</p>
                <p className="text-sm text-muted-foreground">
                  Customers can place new orders when this is ON.
                </p>
              </div>
              <Switch
                checked={settings.isAcceptingOrders}
                onCheckedChange={(v: boolean) => update("isAcceptingOrders", v)}
                className="data-[state=checked]:bg-forest"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4 bg-red-50 border-red-200">
              <div>
                <p className="font-semibold text-red-700">Holiday / Closed Mode</p>
                <p className="text-sm text-red-600">
                  Disables all orders and shows "Closed" to customers.
                </p>
              </div>
              <Switch
                checked={settings.holidayMode}
                onCheckedChange={(v: boolean) => update("holidayMode", v)}
                className="data-[state=checked]:bg-red-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* Timings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-forest" /> Operating Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openingTime">Opening Time</Label>
              <Input
                id="openingTime"
                value={settings.openingTime}
                onChange={(e) => update("openingTime", e.target.value)}
                placeholder="e.g. 10:00 AM"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closingTime">Closing Time</Label>
              <Input
                id="closingTime"
                value={settings.closingTime}
                onChange={(e) => update("closingTime", e.target.value)}
                placeholder="e.g. 10:00 PM"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prepTime">Estimated Prep Time</Label>
              <Input
                id="prepTime"
                value={settings.estimatedPrepTime}
                onChange={(e) => update("estimatedPrepTime", e.target.value)}
                placeholder="e.g. 25-30 mins"
              />
            </div>
          </CardContent>
        </Card>

        {/* Delivery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-forest" /> Delivery Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryRadius">Delivery Radius (km)</Label>
              <Input
                id="deliveryRadius"
                type="number"
                min={1}
                max={20}
                step={0.5}
                value={settings.deliveryRadiusKm}
                onChange={(e) => update("deliveryRadiusKm", parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseCharge">Base Delivery Charge (₹)</Label>
              <Input
                id="baseCharge"
                type="number"
                min={0}
                value={settings.baseDeliveryCharge}
                onChange={(e) => update("baseDeliveryCharge", parseFloat(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-forest" /> Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone Number</Label>
              <Input
                id="contactPhone"
                value={settings.contactPhone}
                onChange={(e) => update("contactPhone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                value={settings.contactWhatsapp}
                onChange={(e) => update("contactWhatsapp", e.target.value)}
              />
            </div>
            <div className="space-y-2 col-span-full">
              <Label htmlFor="address">Restaurant Address</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pb-8">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-forest hover:bg-forest/90 text-white px-8 h-12 text-base rounded-full"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save All Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
