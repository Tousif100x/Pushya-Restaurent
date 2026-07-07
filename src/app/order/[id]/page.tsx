"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/Motion";
import { CheckCircle2, Clock, MapPin, PhoneCall, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { restaurantDetails } from "@/data/menu";

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [modificationTimeout, setModificationTimeout] = useState<number | null>(null);
  
  const ORDER_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${unwrappedParams.id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
          
          // Check if order has been pending for more than 2 minutes
          if (data.status === "PENDING") {
            const orderTime = new Date(data.createdAt).getTime();
            if (Date.now() - orderTime > ORDER_TIMEOUT_MS) {
              setTimeoutReached(true);
            }
          } else {
            setTimeoutReached(false);
          }

          // Check if modification requested and calculate 5 min timer
          if (data.status === "MODIFICATION_REQUESTED") {
            const modTime = new Date(data.updatedAt).getTime();
            const timePassed = Date.now() - modTime;
            const MOD_TIMEOUT = 5 * 60 * 1000;
            if (timePassed < MOD_TIMEOUT) {
              setModificationTimeout(Math.floor((MOD_TIMEOUT - timePassed) / 1000));
            } else {
              setModificationTimeout(0);
              // We could automatically trigger cancellation here
            }
          } else {
            setModificationTimeout(null);
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    fetchOrder();
    intervalId = setInterval(fetchOrder, 5000); // poll every 5s

    return () => clearInterval(intervalId);
  }, [unwrappedParams.id]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (modificationTimeout !== null && modificationTimeout > 0 && order?.status === 'MODIFICATION_REQUESTED') {
      timer = setInterval(() => setModificationTimeout(prev => prev ? prev - 1 : 0), 1000);
    }
    return () => clearInterval(timer);
  }, [modificationTimeout, order?.status]);

  const respondToModification = async (action: 'accept' | 'continue_without' | 'cancel') => {
    try {
      await fetch(`/api/orders/${unwrappedParams.id}/modification-response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      // Will be refreshed by the interval
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-32 flex justify-center text-forest">Loading order details...</div>;
  }

  if (!order) {
    return <div className="min-h-screen pt-32 flex justify-center text-red-500">Order not found.</div>;
  }

  return (
    <div className="bg-background min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <FadeIn>
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold text-forest mb-2">Order Status</h1>
            <p className="text-muted-foreground">Order ID: #{order.id.substring(0, 8).toUpperCase()}</p>
          </div>

          <Card className="border-border shadow-lg overflow-hidden mb-6">
            <div className={`p-6 text-center ${timeoutReached ? 'bg-red-50' : 'bg-forest text-background'}`}>
              
              {timeoutReached && order.status === "PENDING" ? (
                <div className="space-y-4">
                  <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
                  <h2 className="text-2xl font-bold font-serif text-red-700">Action Required</h2>
                  <p className="text-red-600 font-medium max-w-sm mx-auto">
                    The restaurant is currently busy and hasn't accepted your order yet. Please call us directly to confirm your order!
                  </p>
                  <Button asChild className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 mt-2 h-12 text-lg">
                    <a href="tel:7724045340">
                      <PhoneCall className="mr-2 h-5 w-5" /> Call Now: 7724045340
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {order.status === "PENDING" && (
                    <>
                      <Clock className="h-16 w-16 mx-auto animate-pulse text-gold" />
                      <h2 className="text-2xl font-bold font-serif text-gold">Waiting for Confirmation</h2>
                      <p className="text-background/80">The restaurant is reviewing your order...</p>
                    </>
                  )}
                  {order.status === "APPROVED" && (
                    <>
                      <CheckCircle2 className="h-16 w-16 mx-auto text-green-400" />
                      <h2 className="text-2xl font-bold font-serif text-green-400">Order Approved!</h2>
                      <p className="text-background/80">Your food is being prepared.</p>
                    </>
                  )}
                  {order.status === "MODIFICATION_REQUESTED" && (
                    <div className="text-left bg-white p-6 rounded-lg border-2 border-yellow-400 text-foreground">
                      <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-2" />
                      <h2 className="text-xl font-bold text-center text-yellow-700 mb-4">Action Required</h2>
                      <p className="mb-4 text-sm font-medium">Hello! Unfortunately, the following item(s) are currently unavailable:</p>
                      
                      <div className="bg-muted p-3 rounded-md mb-4 space-y-2">
                        {order.items.filter((i:any) => i.status === 'UNAVAILABLE').map((item:any) => (
                          <div key={item.id} className="text-sm border-b pb-2 last:border-0 last:pb-0">
                            <span className="font-semibold text-red-600 block line-through">{item.quantity}x {item.itemName}</span>
                            {item.replacedWith && (
                              <span className="text-blue-600 mt-1 block">
                                → Restaurant suggests: <span className="font-bold">{item.replacedWith}</span>
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="text-center font-mono text-xl font-bold text-red-500 mb-4">
                        Time Remaining: {Math.floor((modificationTimeout || 0) / 60)}:{(modificationTimeout || 0) % 60 < 10 ? '0' : ''}{(modificationTimeout || 0) % 60}
                      </div>

                      <p className="text-sm text-center mb-4 text-muted-foreground">Would you like to:</p>
                      
                      <div className="space-y-3">
                        {order.items.some((i:any) => i.replacedWith) && (
                          <Button onClick={() => respondToModification('accept')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-12">
                            Accept Replacement
                          </Button>
                        )}
                        <Button onClick={() => respondToModification('continue_without')} variant="outline" className="w-full font-medium h-12 border-forest text-forest">
                          Continue Without Item(s)
                        </Button>
                        <Button onClick={() => respondToModification('cancel')} variant="destructive" className="w-full font-medium h-12">
                          Cancel Entire Order
                        </Button>
                      </div>
                    </div>
                  )}
                  {order.status === "OUT_FOR_DELIVERY" && (
                    <>
                      <MapPin className="h-16 w-16 mx-auto text-blue-400 animate-bounce" />
                      <h2 className="text-2xl font-bold font-serif text-blue-400">Out for Delivery!</h2>
                      <p className="text-background/80">Your order is on the way.</p>
                    </>
                  )}
                </div>
              )}
            </div>

            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-lg border-b pb-2 mb-3">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground mb-1 font-semibold">
                    <span>Item</span>
                    <span>Total</span>
                  </div>
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between">
                      <div className="flex gap-2">
                        <span className="text-muted-foreground">{item.quantity}x</span>
                        <span>{item.itemName}</span>
                      </div>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  
                  <div className="border-t pt-2 mt-4 space-y-1">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery Fee</span>
                      <span>₹{order.deliveryFee}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-2">
                      <span>Total Paid/Payable</span>
                      <span className="text-forest">₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg border-b pb-2 mb-3">Delivery Information</h3>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p><strong className="text-foreground">Name:</strong> {order.customerName}</p>
                  <p><strong className="text-foreground">Phone:</strong> {order.customerPhone}</p>
                  <p><strong className="text-foreground">Address:</strong> {order.customerAddress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button variant="ghost" asChild className="hover:text-forest hover:bg-forest-soft">
              <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
            </Button>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
