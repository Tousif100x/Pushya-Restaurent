"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save, Store, Clock, Truck, Phone, User, Calendar, ShieldAlert } from "lucide-react";

interface Settings {
  openingTime: string;
  closingTime: string;
  isAcceptingOrders: boolean;
  statusMode: string;
  holidayMode: boolean;
  weeklyHolidays: string;
  deliveryRadiusKm: number;
  baseDeliveryCharge: number;
  minOrderValue: number;
  estimatedPrepTime: string;
  contactPhone: string;
  contactWhatsapp: string;
  ownerName: string;
  address: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({
    openingTime: "08:00 AM",
    closingTime: "10:00 PM",
    isAcceptingOrders: true,
    statusMode: "ACCEPTING",
    holidayMode: false,
    weeklyHolidays: "",
    deliveryRadiusKm: 4,
    baseDeliveryCharge: 20,
    minOrderValue: 0,
    estimatedPrepTime: "25-30 mins",
    contactPhone: "9098382993",
    contactWhatsapp: "9098382993",
    ownerName: "Pushya Admin",
    address: "Shri Krishna Paradise, Near, Rau Cir, Rau, Indore",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/restaurant/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch {
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
        toast.success("Settings saved successfully! Controls take effect immediately.");
      } else {
        toast.error("Failed to save settings");
      }
    } catch {
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof Settings, value: any) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#10261B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#10261B]">
          Restaurant Operations & Settings
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Centralized business controls — changes apply live to all customers instantly
        </p>
      </div>

      {/* Quick Operations Mode */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-serif flex items-center gap-2 text-[#10261B]">
            <Store className="w-5 h-5 text-[#D9A441]" /> Store Operational Status
          </CardTitle>
          <CardDescription>
            Select current restaurant operating mode.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: "ACCEPTING", label: "🟢 Accepting Orders", desc: "Open & receiving orders" },
              { id: "BUSY", label: "🟡 Busy Mode", desc: "High demand, +15m prep" },
              { id: "PAUSED", label: "🟠 Paused", desc: "Temp paused for orders" },
              { id: "CLOSED", label: "🔴 Closed Mode", desc: "Closed for business" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  update("statusMode", m.id);
                  update("isAcceptingOrders", m.id === "ACCEPTING" || m.id === "BUSY");
                  update("holidayMode", m.id === "CLOSED");
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  settings.statusMode === m.id
                    ? "border-[#10261B] bg-[#10261B]/5 ring-1 ring-[#10261B]"
                    : "border-gray-200 hover:border-[#D9A441]/50 bg-white"
                }`}
              >
                <p className="font-bold text-xs sm:text-sm">{m.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{m.desc}</p>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4 bg-gray-50 mt-4">
            <div>
              <p className="font-semibold text-sm">Accepting New Orders Toggle</p>
              <p className="text-xs text-muted-foreground">
                Customers can place orders when ON. When OFF, menu is browse-only.
              </p>
            </div>
            <Switch
              checked={settings.isAcceptingOrders}
              onCheckedChange={(v: boolean) => update("isAcceptingOrders", v)}
              className="data-[state=checked]:bg-[#10261B]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Operating Hours & Off-Days */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-serif flex items-center gap-2 text-[#10261B]">
            <Clock className="w-5 h-5 text-[#D9A441]" /> Operating Hours & Prep Time
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="openingTime" className="text-xs font-semibold">Opening Time</Label>
            <Input
              id="openingTime"
              value={settings.openingTime}
              onChange={(e) => update("openingTime", e.target.value)}
              placeholder="e.g. 08:00 AM"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="closingTime" className="text-xs font-semibold">Closing Time</Label>
            <Input
              id="closingTime"
              value={settings.closingTime}
              onChange={(e) => update("closingTime", e.target.value)}
              placeholder="e.g. 11:00 PM or 12:00 AM"
            />
            <p className="text-[10px] text-muted-foreground">
              Tip: 12:00 PM = Noon. Use <strong>11:00 PM</strong>, <strong>11:59 PM</strong>, or <strong>12:00 AM</strong> for night closing.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prepTime" className="text-xs font-semibold">Est. Prep Time</Label>
            <Input
              id="prepTime"
              value={settings.estimatedPrepTime}
              onChange={(e) => update("estimatedPrepTime", e.target.value)}
              placeholder="e.g. 25-30 mins"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-3">
            <Label htmlFor="weeklyHolidays" className="text-xs font-semibold">Weekly Off-Days / Holidays (Optional)</Label>
            <Input
              id="weeklyHolidays"
              value={settings.weeklyHolidays || ""}
              onChange={(e) => update("weeklyHolidays", e.target.value)}
              placeholder="e.g. Tuesday (or leave empty if open 7 days)"
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery & Order Thresholds */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-serif flex items-center gap-2 text-[#10261B]">
            <Truck className="w-5 h-5 text-[#D9A441]" /> Delivery Radius & Charges
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="deliveryRadius" className="text-xs font-semibold">Delivery Radius (km)</Label>
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

          <div className="space-y-1.5">
            <Label htmlFor="baseCharge" className="text-xs font-semibold">Base Delivery Charge (₹)</Label>
            <Input
              id="baseCharge"
              type="number"
              min={0}
              value={settings.baseDeliveryCharge}
              onChange={(e) => update("baseDeliveryCharge", parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="minOrderValue" className="text-xs font-semibold">Min. Order Value (₹)</Label>
            <Input
              id="minOrderValue"
              type="number"
              min={0}
              value={settings.minOrderValue}
              onChange={(e) => update("minOrderValue", parseFloat(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact & Business Info */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-serif flex items-center gap-2 text-[#10261B]">
            <User className="w-5 h-5 text-[#D9A441]" /> Restaurant Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="ownerName" className="text-xs font-semibold">Owner / Manager Name</Label>
            <Input
              id="ownerName"
              value={settings.ownerName || ""}
              onChange={(e) => update("ownerName", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contactPhone" className="text-xs font-semibold">Phone Number</Label>
            <Input
              id="contactPhone"
              value={settings.contactPhone}
              onChange={(e) => update("contactPhone", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="whatsapp" className="text-xs font-semibold">WhatsApp Business Number</Label>
            <Input
              id="whatsapp"
              value={settings.contactWhatsapp}
              onChange={(e) => update("contactWhatsapp", e.target.value)}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address" className="text-xs font-semibold">Restaurant Full Address</Label>
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
          className="bg-[#10261B] hover:bg-[#10261B]/90 text-white px-8 h-12 text-base rounded-xl font-semibold shadow-md"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" /> Save All Business Settings
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
