"use client";

import { FadeIn, SlideUp } from "@/components/animations/Motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { restaurantDetails } from "@/data/menu";
import { CheckCircle2, Copy, MapPin, Phone, ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-background min-h-screen pt-24 pb-20 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-2xl">
        <SlideUp>
          <div className="text-center mb-8">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 mb-6">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="font-serif text-4xl font-bold text-forest mb-2">Order Placed Successfully!</h1>
            <p className="text-muted-foreground text-lg">Thank you for ordering with Pushya Planet.</p>
          </div>
        </SlideUp>

        <SlideUp delay={0.1}>
          <Card className="border-border overflow-hidden mb-8 shadow-md">
            <CardContent className="p-0">
              <div className="bg-forest-soft p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <p className="text-sm text-forest font-medium">Order ID</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-2xl font-bold text-forest">{orderId}</span>
                    <button 
                      onClick={handleCopy} 
                      className="text-muted-foreground hover:text-forest transition-colors p-1"
                      title="Copy Order ID"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    {copied && <span className="text-xs text-green-600 font-medium">Copied!</span>}
                  </div>
                </div>
                <div className="md:text-right">
                  <p className="text-sm text-forest font-medium">Estimated Delivery</p>
                  <p className="text-xl font-bold text-gold mt-1">30 - 45 Mins</p>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Delivery Address</h4>
                    <p className="text-sm text-muted-foreground mt-1">To your pinned location (Saved Address)</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Order Details</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Items</span>
                      <span className="text-foreground">View details in tracker</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 text-base text-foreground">
                      <span>Amount to Pay at Delivery</span>
                      <span>₹---</span> {/* Would be fetched from actual order data */}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideUp>

        <FadeIn delay={0.2} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-gold text-forest hover:bg-gold/90 rounded-full h-12 px-8">
            <Link href={`/order/${orderId}/track`}>Track Order <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button asChild variant="outline" className="border-forest text-forest hover:bg-forest-soft rounded-full h-12 px-8">
            <Link href="/menu">Continue Shopping</Link>
          </Button>
        </FadeIn>

        <FadeIn delay={0.3} className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">Have a question about your order?</p>
          <div className="flex justify-center gap-4">
            <Button asChild variant="ghost" className="text-forest hover:text-gold hover:bg-transparent">
              <a href={`tel:+91${restaurantDetails.phone}`}>
                <Phone className="mr-2 h-4 w-4" /> Call Restaurant
              </a>
            </Button>
            <Button asChild variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-transparent">
              <a href={`https://wa.me/91${restaurantDetails.phone}`} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp Us
              </a>
            </Button>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
