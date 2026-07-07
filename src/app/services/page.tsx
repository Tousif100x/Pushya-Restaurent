"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SlideUp, StaggerContainer, StaggerItem } from "@/components/animations/Motion";
import { CheckCircle2, Gift, Utensils, PartyPopper, Truck, Package, PhoneCall } from "lucide-react";

export default function ServicesPage() {
  const partyOrders = [
    "Birthday Party",
    "Kitty Party",
    "Farewell Party",
    "Grih Pravesh Party",
    "All Types of Party Orders Accepted"
  ];

  const otherServices = [
    { icon: <Truck className="h-5 w-5 text-forest" />, title: "Home Delivery", desc: "Delivery Around Rau Circle Area" },
    { icon: <Package className="h-5 w-5 text-forest" />, title: "Parcel Facility", desc: "Available for all items" },
    { icon: <Utensils className="h-5 w-5 text-forest" />, title: "Freshly Prepared Food", desc: "Made fresh to order" },
    { icon: <Gift className="h-5 w-5 text-forest" />, title: "Special Orders", desc: "Available on request" }
  ];

  return (
    <div className="flex flex-col min-h-screen pt-24 bg-background">
      <main className="flex-1">
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <SlideUp>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h1 className="text-4xl md:text-5xl font-bold font-serif text-forest mb-4">Our Services & Offers</h1>
              <p className="text-lg text-muted-foreground mb-6">
                Beyond our regular menu, we offer catering, tiffin services, and special combo deals.
              </p>
              <div className="inline-flex flex-col items-center justify-center p-6 bg-forest/5 rounded-2xl border border-gold/30 shadow-sm">
                <h3 className="font-serif text-xl font-bold text-forest mb-2">For Any Inquiries & Bookings</h3>
                <p className="text-sm text-muted-foreground mb-4">Please call us directly to discuss your requirements.</p>
                <a href="tel:7724045340" className="bg-gold text-forest font-bold px-8 py-3 rounded-full hover:bg-gold/90 transition shadow-md flex items-center gap-2">
                  <PhoneCall className="w-5 h-5" /> Call Now: +91 7724045340
                </a>
              </div>
            </div>
          </SlideUp>

          <StaggerContainer className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            {/* Party Orders Card */}
            <StaggerItem>
              <Card className="h-full flex flex-col border border-forest/10 shadow-sm hover:shadow-xl hover:border-gold/30 transition-all duration-300 bg-white">
                <CardHeader className="p-8 pb-4">
                  <div className="w-14 h-14 bg-forest-soft rounded-full flex items-center justify-center mb-4">
                    <PartyPopper className="h-7 w-7 text-gold" />
                  </div>
                  <CardTitle className="text-3xl font-serif text-forest mb-2">Party Orders</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Premium catering to make your celebrations memorable and hassle-free.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 flex-1 flex flex-col">
                  <div className="mb-6 pb-6 border-b border-forest/10">
                    <div className="text-3xl font-bold text-forest">Custom Price</div>
                    <div className="text-sm text-muted-foreground mt-1">Based on menu & guest count</div>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                    {partyOrders.map((party, idx) => (
                      <li key={idx} className="flex items-start text-forest/90 font-medium">
                        <CheckCircle2 className="h-5 w-5 text-gold mr-3 shrink-0 mt-0.5" />
                        <span>{party}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="tel:7724045340" className="w-full flex items-center justify-center min-h-[48px] bg-gold text-forest font-bold rounded-lg hover:bg-gold/90 transition shadow-sm">
                    Contact to Book
                  </a>
                </CardContent>
              </Card>
            </StaggerItem>

            {/* Daily Tiffin Facility Card */}
            <StaggerItem>
              <Card className="h-full flex flex-col border border-forest/10 shadow-sm hover:shadow-xl hover:border-gold/30 transition-all duration-300 bg-[#F9FAEC]">
                <CardHeader className="p-8 pb-4">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <Utensils className="h-7 w-7 text-forest" />
                  </div>
                  <CardTitle className="text-3xl font-serif text-forest mb-2">Daily Tiffin Facility</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Wholesome, home-style meals delivered fresh to your door every day.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 flex-1 flex flex-col">
                  <div className="mb-6 pb-6 border-b border-forest/10">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-forest">₹100</span>
                      <span className="text-muted-foreground font-medium">/ meal</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-forest mb-4 uppercase tracking-wider text-xs">Included Items</h4>
                    <ul className="space-y-4 mb-8 grid grid-cols-2 gap-x-2 gap-y-0">
                      <li className="flex items-center text-forest/90 font-medium"><CheckCircle2 className="h-4 w-4 text-forest mr-2 shrink-0" /> 2 Sabzi</li>
                      <li className="flex items-center text-forest/90 font-medium"><CheckCircle2 className="h-4 w-4 text-forest mr-2 shrink-0" /> Dal & Chawal</li>
                      <li className="flex items-center text-forest/90 font-medium"><CheckCircle2 className="h-4 w-4 text-forest mr-2 shrink-0" /> 6 Roti <span className="text-[10px] text-muted-foreground ml-1">(₹10 extra)</span></li>
                      <li className="flex items-center text-forest/90 font-medium"><CheckCircle2 className="h-4 w-4 text-forest mr-2 shrink-0" /> Salad & Achar</li>
                    </ul>
                  </div>
                  <a href="tel:7724045340" className="w-full flex items-center justify-center min-h-[48px] bg-forest text-white font-bold rounded-lg hover:bg-forest/90 transition shadow-sm mt-auto">
                    Subscribe Now
                  </a>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>

          <SlideUp>
            <div className="max-w-5xl mx-auto mb-16">
              <h2 className="text-3xl font-bold font-serif text-forest mb-6 text-center">Other Services</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {otherServices.map((service, idx) => (
                  <Card key={idx} className="text-center hover:border-forest/50 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="mx-auto bg-forest-soft p-3 rounded-full w-fit mb-2">
                        {service.icon}
                      </div>
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{service.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </SlideUp>

          <SlideUp>
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold font-serif text-forest mb-6 text-center">Special Offers</h2>
              <div className="grid md:grid-cols-3 gap-6">
                
                <Card className="relative overflow-hidden border-yellow-500/30 shadow-lg">
                  <div className="absolute top-0 right-0 bg-yellow-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                    SUNDAY ONLY
                  </div>
                  <CardHeader>
                    <Badge variant="outline" className="w-fit mb-2 border-yellow-500 text-yellow-600">Combo Deal</Badge>
                    <CardTitle className="text-2xl font-serif">Sunday Special</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">₹199</span>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" /> Pizza</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" /> Sandwich</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" /> French Fries</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" /> Veg Fried Momos</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" /> Cold Drink (Free)</li>
                    </ul>
                    <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                      Parcel Charge: ₹20 Extra
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-red-500/30 shadow-lg">
                  <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                    WEEKEND ONLY
                  </div>
                  <CardHeader>
                    <Badge variant="outline" className="w-fit mb-2 border-red-500 text-red-600">Combo Deal</Badge>
                    <CardTitle className="text-2xl font-serif">Chinese Combo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">₹149</span>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" /> Noodles</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" /> Manchurian</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" /> Momos</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" /> Chutney</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" /> Free Idli</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" /> Cold Drink (Free)</li>
                    </ul>
                    <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                      Parcel Charge: ₹10 Extra
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-forest/30 shadow-lg bg-forest text-white">
                  <CardHeader>
                    <Badge variant="outline" className="w-fit mb-2 border-white/30 text-white bg-white/10">Value Meal</Badge>
                    <CardTitle className="text-2xl font-serif">Unlimited Bhojan Thali</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">₹70</span>
                    </div>
                    <ul className="space-y-2 text-sm text-white/80 mb-4">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-white mr-2" /> Unlimited Home Style Meal</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-white mr-2" /> Delivered at shop for ₹120</li>
                    </ul>
                  </CardContent>
                </Card>

              </div>
            </div>
          </SlideUp>
        </section>
      </main>
    </div>
  );
}
