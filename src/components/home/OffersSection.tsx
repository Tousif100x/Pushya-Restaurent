"use client";

import { SlideUp } from "@/components/animations/Motion";
import { offers } from "@/data/menu";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function OffersSection() {
  return (
    <section id="offers" className="py-24 bg-forest text-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
          <SlideUp>
            <div className="space-y-6">
              <h4 className="text-gold font-medium tracking-widest uppercase">Special Deals</h4>
              <h2 className="font-serif text-4xl md:text-5xl font-bold">Weekly Offers & Combos</h2>
              <p className="text-background/80 text-lg leading-relaxed max-w-lg">
                Enjoy our hand-picked combinations tailored for the perfect meal experience. Whether it's a weekend craving or a daily necessity, we have something special for you.
              </p>
              <div className="pt-4">
                 <Button asChild className="bg-gold text-forest hover:bg-gold/90 rounded-full">
                    <Link href="/menu">Order Now</Link>
                  </Button>
              </div>
            </div>
          </SlideUp>
          
          <div className="space-y-6">
            {offers.map((offer, index) => (
              <SlideUp key={offer.id} delay={index * 0.1}>
                <Card className="bg-forest-soft border-none text-background overflow-hidden hover:bg-forest-soft/80 transition-colors">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-1/3 h-40 sm:h-auto">
                      <Image 
                        src={offer.image} 
                        alt={offer.title} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="p-6 sm:w-2/3">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-serif text-xl font-bold">{offer.title}</h3>
                        <span className="text-gold font-bold text-xl">₹{offer.price}</span>
                      </div>
                      <p className="text-sm text-background/70 mb-3">{offer.description}</p>
                      <Badge variant="secondary" className="bg-forest text-gold border-gold/20">{offer.note}</Badge>
                    </div>
                  </div>
                </Card>
              </SlideUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
