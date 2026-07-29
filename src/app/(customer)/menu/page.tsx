"use client";

import { useState } from "react";
import { menuCategories, signatureItems } from "@/data/menu";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn, SlideUp } from "@/components/animations/Motion";
import Image from "next/image";
import { Search, Plus, Minus, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

export default function MenuPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { items: cartItems, addItem, updateQuantity, removeItem } = useCartStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getCartQuantity = (itemId: string) => {
    return cartItems.find((i) => i.id === itemId)?.quantity || 0;
  };

  const handleUpdateCart = (item: any, change: number) => {
    const currentQ = getCartQuantity(item.id);
    if (currentQ + change > 0) {
      if (currentQ === 0) {
        addItem({ ...item, quantity: 1 });
      } else {
        updateQuantity(item.id, currentQ + change);
      }
    } else {
      removeItem(item.id);
    }
  };

  if (!isMounted) {
    return (
      <div className="bg-background min-h-screen pt-24 pb-20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 w-48 bg-muted animate-pulse rounded-lg mb-12"></div>
          <div className="h-14 w-full bg-muted animate-pulse rounded-full mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-48 w-full bg-muted animate-pulse rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-24 pb-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-12 gap-6">
          <FadeIn>
            <h1 className="font-serif text-5xl font-bold text-forest">Our Menu</h1>
            <p className="text-muted-foreground mt-2">Discover our handcrafted culinary delights.</p>
          </FadeIn>
          
          <FadeIn delay={0.1} className="w-full md:w-72">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search dishes..." 
                className="pl-10 bg-background border-border focus-visible:ring-gold rounded-full h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </FadeIn>
        </div>

        {/* Categories Sticky Nav */}
        <div className="sticky top-20 z-40 bg-background/80 backdrop-blur-md py-4 mb-8 -mx-4 px-4 overflow-x-auto no-scrollbar border-b border-border">
          <div className="flex gap-2">
            {menuCategories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                className="rounded-full whitespace-nowrap bg-background hover:bg-forest hover:text-background border-border transition-colors"
                onClick={() => {
                  const el = document.getElementById(category.id);
                  const y = el ? el.getBoundingClientRect().top + window.scrollY - 150 : 0;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }}
              >
                {category.name.replace(' Menu', '')}
              </Button>
            ))}
          </div>
        </div>

        {/* Menu Sections */}
        <div className="space-y-24">
          {menuCategories.map((category) => {
            const filteredItems = category.items.filter(item => 
              item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (filteredItems.length === 0) return null;

            return (
              <section key={category.id} id={category.id} className="scroll-mt-40">
                <SlideUp>
                  <div className="relative h-64 rounded-2xl overflow-hidden mb-8">
                    <Image 
                      src={category.image} 
                      alt={category.name} 
                      fill 
                      className="object-cover brightness-50" 
                    />
                    <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12">
                      <h2 className="font-serif text-4xl font-bold text-background mb-2">{category.name}</h2>
                      <p className="text-background/80 max-w-lg text-lg">{category.description}</p>
                    </div>
                  </div>
                </SlideUp>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredItems.map((item, idx) => {
                    const quantity = getCartQuantity(item.id);
                    const isSignature = signatureItems.includes(item.id);
                    
                    return (
                      <SlideUp key={item.id} delay={idx * 0.05}>
                        <Card className="h-full border-border hover:shadow-lg transition-shadow overflow-hidden group">
                          <CardContent className="p-0 flex flex-col h-full">
                            <div className="flex p-5 gap-4 h-full">
                              <div className="flex-1 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-start justify-between">
                                    <h3 className="font-semibold text-lg leading-tight mb-1">{item.name}</h3>
                                    {item.isVeg && (
                                      <div className="h-4 w-4 border border-green-600 p-0.5 rounded-sm flex items-center justify-center shrink-0 ml-2 mt-1">
                                        <div className="h-2 w-2 rounded-full bg-green-600" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2 mb-2 flex-wrap">
                                    {isSignature && <Badge className="bg-gold text-forest text-xs py-0">Signature</Badge>}
                                  </div>
                                  <p className="font-bold text-primary text-lg">₹{item.price}</p>
                                </div>
                                
                                <div className="mt-4">
                                  {quantity === 0 ? (
                                    <Button 
                                      variant="outline" 
                                      className="text-gold border-gold hover:bg-gold hover:text-forest w-32"
                                      onClick={() => handleUpdateCart(item, 1)}
                                    >
                                      ADD
                                    </Button>
                                  ) : (
                                    <div className="flex items-center justify-between w-32 bg-forest rounded-md overflow-hidden text-background">
                                      <button 
                                        className="w-10 h-10 flex items-center justify-center hover:bg-forest-soft transition-colors"
                                        onClick={() => handleUpdateCart(item, -1)}
                                      >
                                        <Minus className="h-4 w-4" />
                                      </button>
                                      <span className="font-medium">{quantity}</span>
                                      <button 
                                        className="w-10 h-10 flex items-center justify-center hover:bg-forest-soft transition-colors"
                                        onClick={() => handleUpdateCart(item, 1)}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {item.image ? (
                                <div className="relative w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                                  <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                              ) : (
                                <div className="relative w-32 h-32 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                                  <span className="text-muted-foreground text-xs text-center p-2">Freshly Prepared</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </SlideUp>
                    );
                  })}
                </div>
              </section>
            );
          })}
          
          {menuCategories.every(c => c.items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0) && (
             <div className="text-center py-20">
               <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
               <h3 className="text-2xl font-serif text-forest mb-2">No dishes found</h3>
               <p className="text-muted-foreground">Try adjusting your search query.</p>
               <Button variant="outline" className="mt-6" onClick={() => setSearchQuery("")}>Clear Search</Button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
