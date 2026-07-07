"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/Motion";
import { Search, MapPin } from "lucide-react";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const router = useRouter();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      router.push(`/order/${orderId.trim()}`);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 pt-24 bg-background">
      <FadeIn className="w-full max-w-md">
        <Card className="border-gold/20 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-b from-forest/5 to-transparent flex flex-col items-center pt-8 pb-4">
            <div className="p-4 bg-forest/10 rounded-full mb-4 text-forest">
              <MapPin className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-forest">Track Your Order</h2>
            <p className="text-sm text-muted-foreground mt-1">Enter your Order ID to check live status</p>
          </div>
          
          <CardContent className="pt-6">
            <form onSubmit={handleTrack} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-forest mb-1">Order ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input 
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. clx123abc000..."
                    className="block w-full pl-10 pr-3 py-3 rounded-md border border-forest/20 focus:border-gold focus:ring-1 focus:ring-gold sm:text-sm font-medium"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-forest hover:bg-forest/90 text-white h-11 text-base">
                Track Order
              </Button>
            </form>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
