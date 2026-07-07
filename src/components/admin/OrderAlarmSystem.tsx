"use client";

import { useEffect, useState, useRef } from "react";
import { notificationService } from "@/lib/NotificationService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BellRing, CheckCircle2, XCircle, Edit, MapPin } from "lucide-react";

export function OrderAlarmSystem() {
  const [unacknowledgedOrders, setUnacknowledgedOrders] = useState<any[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const titleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // We assume the user has placed an alarm.mp3 in public/sounds/
    // We create the audio element dynamically so it can loop
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio('/sounds/mixkit-digital-clock-digital-alarm-buzzer-992.wav');
      audioRef.current.loop = true;
    }

    notificationService.start(5000); // Poll every 5 seconds

    const unsubscribe = notificationService.subscribe((orders) => {
      setUnacknowledgedOrders(orders);
    });

    return () => {
      unsubscribe();
      notificationService.stop();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (titleIntervalRef.current) {
        clearInterval(titleIntervalRef.current);
        document.title = "Pushya Admin Dashboard";
      }
    };
  }, []);

  useEffect(() => {
    if (unacknowledgedOrders.length > 0) {
      // Start Alarm if not playing
      if (audioRef.current && audioRef.current.paused) {
        // Browsers require interaction to play audio, but since this is an admin dashboard, 
        // they likely interacted with it. We catch any errors if autoplay is blocked.
        audioRef.current.play().catch(e => console.warn("Autoplay blocked:", e));
      }

      // Start Tab Flashing
      if (!titleIntervalRef.current) {
        let isFlash = false;
        titleIntervalRef.current = setInterval(() => {
          document.title = isFlash ? `🔴 (${unacknowledgedOrders.length}) NEW ORDER - Pushya` : "Pushya Admin Dashboard";
          isFlash = !isFlash;
        }, 1000);
      }
    } else {
      // Stop Alarm and Flashing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (titleIntervalRef.current) {
        clearInterval(titleIntervalRef.current);
        titleIntervalRef.current = null;
        document.title = "Pushya Admin Dashboard";
      }
    }
  }, [unacknowledgedOrders]);

  const handleAcknowledge = async (orderId: string, action: 'accept' | 'reject' | 'modify' | 'dismiss') => {
    try {
      // Acknowledge the order to stop the alarm for this specific order
      await fetch(`/api/orders/${orderId}/acknowledge`, { method: "POST" });
      
      // Optimistically remove it from the list
      setUnacknowledgedOrders(prev => prev.filter(o => o.id !== orderId));
      
      // If action is accept/reject, we would also hit the actual modify endpoint
      if (action === 'accept') {
        await fetch(`/api/orders/${orderId}/modify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "approve" })
        });
      } else if (action === 'reject') {
        await fetch(`/api/orders/${orderId}/modify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "cancel", message: "Rejected by admin" })
        });
      }
      
      // Refresh the page or trigger SWR revalidation to update the main dashboard
      // (The main dashboard uses polling anyway, so it will update shortly)
      window.dispatchEvent(new Event('order-acknowledged'));
      
    } catch (error) {
      console.error("Failed to acknowledge order", error);
    }
  };

  if (unacknowledgedOrders.length === 0) {
    return null; // Hidden when no orders
  }

  // Pick the oldest unacknowledged order to show first
  const currentOrder = unacknowledgedOrders[unacknowledgedOrders.length - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg bg-white border-2 border-red-500 shadow-2xl animate-in zoom-in duration-300">
        <div className="absolute -top-4 -right-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white animate-bounce shadow-lg">
          <BellRing className="h-6 w-6" />
        </div>
        
        <CardHeader className="bg-red-50 border-b border-red-100 rounded-t-xl pb-4">
          <CardTitle className="text-2xl font-black text-red-700 flex flex-col items-center text-center">
            <span className="text-sm font-bold uppercase tracking-wider mb-1 text-red-500">Critical Alert</span>
            NEW ORDER RECEIVED
          </CardTitle>
          <div className="text-center text-sm font-medium text-red-600 mt-2">
            Order #{currentOrder.id.slice(-6).toUpperCase()}
          </div>
          {unacknowledgedOrders.length > 1 && (
            <div className="mt-2 text-center bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full w-max mx-auto">
              +{unacknowledgedOrders.length - 1} MORE ORDERS WAITING
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground font-medium">Customer</p>
              <p className="font-bold text-lg">{currentOrder.customerName}</p>
              <p className="text-muted-foreground">{currentOrder.customerPhone}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground font-medium">Total Amount</p>
              <p className="font-bold text-2xl text-forest">₹{currentOrder.totalAmount}</p>
              <p className="text-xs text-muted-foreground">{new Date(currentOrder.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>
          
          <div className="bg-muted p-3 rounded-lg border border-border">
            <p className="text-xs font-bold uppercase text-muted-foreground mb-1 flex items-center">
              <MapPin className="w-3 h-3 mr-1" /> Delivery Location
            </p>
            <p className="text-sm font-medium">{currentOrder.formattedAddress || currentOrder.customerAddress}</p>
            {currentOrder.distanceKm && (
              <p className="text-xs text-muted-foreground mt-1">Distance: {currentOrder.distanceKm.toFixed(1)} km</p>
            )}
          </div>
          
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Order Items</p>
            <ul className="space-y-1">
              {currentOrder.items?.map((item: any) => (
                <li key={item.id} className="text-sm flex justify-between font-medium">
                  <span>{item.quantity}x {item.itemName}</span>
                  <span>₹{item.price * item.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        
        <CardFooter className="bg-gray-50 border-t p-4 grid grid-cols-2 gap-3 rounded-b-xl">
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg font-bold"
            onClick={() => handleAcknowledge(currentOrder.id, 'accept')}
          >
            <CheckCircle2 className="mr-2 h-5 w-5" /> Accept
          </Button>
          
          <Button 
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50 h-12 font-bold"
            onClick={() => handleAcknowledge(currentOrder.id, 'reject')}
          >
            <XCircle className="mr-2 h-5 w-5" /> Reject
          </Button>

          <Button 
            variant="outline"
            className="w-full border-gray-300 h-12"
            onClick={() => handleAcknowledge(currentOrder.id, 'modify')}
          >
            <Edit className="mr-2 h-4 w-4" /> Modify
          </Button>

          <Button 
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground h-12"
            onClick={() => handleAcknowledge(currentOrder.id, 'dismiss')}
          >
            Dismiss Alarm
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
