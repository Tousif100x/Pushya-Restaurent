"use client";

import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/animations/Motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { restaurantDetails } from "@/data/menu";
import { Check, ChefHat, MapPin, Package, Phone, MessageCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const STEPS = [
  { id: "received", title: "Order Received", description: "We have received your order.", icon: Package },
  { id: "preparing", title: "Preparing", description: "Our chef is preparing your food.", icon: ChefHat },
  { id: "delivery", title: "Out For Delivery", description: "Your order is on the way.", icon: MapPin },
  { id: "delivered", title: "Delivered", description: "Enjoy your meal!", icon: Check },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id as string;
  
  // Simulate order progress
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 3000);
    const timer2 = setTimeout(() => setCurrentStep(2), 8000);
    // won't set to delivered automatically for demo purposes so user can see out for delivery state
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="bg-background min-h-screen pt-24 pb-20">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <FadeIn>
          <h1 className="font-serif text-4xl font-bold text-forest mb-2">Track Order</h1>
          <p className="text-muted-foreground mb-8">Order ID: <span className="font-mono font-medium text-foreground">{orderId}</span></p>
        </FadeIn>

        <SlideUp>
          <Card className="border-border shadow-sm mb-8">
            <CardContent className="p-6 md:p-10">
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border md:left-auto md:right-auto md:top-6 md:bottom-auto md:w-full md:h-0.5 md:bg-border z-0" />
                
                {/* Active Timeline Line */}
                <div 
                  className="absolute left-6 top-0 w-0.5 bg-gold transition-all duration-1000 md:left-0 md:top-6 md:w-auto md:h-0.5 z-0"
                  style={{ 
                    height: typeof window !== 'undefined' && window.innerWidth < 768 ? `${(currentStep / (STEPS.length - 1)) * 100}%` : '0.5px',
                    width: typeof window !== 'undefined' && window.innerWidth >= 768 ? `${(currentStep / (STEPS.length - 1)) * 100}%` : '2px',
                  }}
                />

                <StaggerContainer className="relative z-10 flex flex-col md:flex-row justify-between gap-8 md:gap-4">
                  {STEPS.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index <= currentStep;
                    const isCurrent = index === currentStep;

                    return (
                      <StaggerItem key={step.id} className="flex md:flex-col items-start md:items-center gap-4 md:w-1/4">
                        <div 
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-500 bg-background
                            ${isActive ? "border-gold text-gold" : "border-border text-muted-foreground"}
                            ${isCurrent ? "ring-4 ring-gold/20 shadow-lg" : ""}
                          `}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="pt-2 md:pt-0 md:text-center">
                          <h4 className={`font-semibold ${isActive ? "text-forest" : "text-muted-foreground"}`}>{step.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1 max-w-[200px]">{step.description}</p>
                        </div>
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>
              </div>
            </CardContent>
          </Card>
        </SlideUp>

        <div className="grid md:grid-cols-2 gap-8">
          <SlideUp delay={0.1}>
            <Card className="border-border h-full">
              <CardContent className="p-6">
                <h3 className="font-serif text-xl font-bold mb-4">ETA & Note</h3>
                <div className="text-5xl font-bold text-gold mb-6">30<span className="text-2xl text-muted-foreground font-normal ml-2">mins</span></div>
                <div className="bg-forest-soft/30 p-4 rounded-lg border border-forest-soft">
                  <p className="text-sm font-medium text-forest italic">
                    "Your order is being prepared with fresh ingredients. Thank you for your patience!"
                  </p>
                </div>
              </CardContent>
            </Card>
          </SlideUp>

          <SlideUp delay={0.2}>
            <Card className="border-border h-full">
              <CardContent className="p-6 h-full flex flex-col justify-center">
                <h3 className="font-serif text-xl font-bold mb-4">Need Help?</h3>
                <p className="text-muted-foreground mb-6">Reach out to the restaurant directly for any modifications or queries regarding your order.</p>
                
                <div className="space-y-4">
                  <Button asChild className="w-full bg-forest text-gold hover:bg-forest/90 h-12">
                    <a href={`tel:+91${restaurantDetails.phone}`}>
                      <Phone className="mr-2 h-4 w-4" /> Call Restaurant
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50 h-12">
                    <a href={`https://wa.me/91${restaurantDetails.phone}`} target="_blank" rel="noreferrer">
                      <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp Support
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </SlideUp>
        </div>

      </div>
    </div>
  );
}
