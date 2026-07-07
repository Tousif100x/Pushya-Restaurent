"use client";

import Link from "next/link";
import { ShoppingBag, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { useRouter } from "next/navigation";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Download, Phone, MessageCircle, MapPin as MapPinIcon, Truck, CheckCircle2, Circle } from "lucide-react";
import { getRestaurantStatus } from "@/lib/restaurantStatus";
import { restaurantDetails } from "@/data/menu";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();
  const { isInstalled, isInstallPromptSupported, promptInstall } = useInstallPrompt();
  const rStatus = getRestaurantStatus();

  useEffect(() => {
    setIsMounted(true);
    checkAuth();
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 bg-background/85 backdrop-blur-xl shadow-sm border-b border-gold/10 pt-[env(safe-area-inset-top)] ${
        isScrolled ? "h-16 md:h-20" : "h-16 md:h-20"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image 
            src="/images/brand_logo.png" 
            alt="Pushya Pizza & Sandwich Planet Logo" 
            width={40} 
            height={40} 
            className="rounded-full md:w-[48px] md:h-[48px]"
          />
          <div className="flex flex-col">
            <div className="font-serif text-lg md:text-xl font-bold tracking-tight text-forest">
              Pushya <span className="text-gold">Planet</span>
            </div>
            <div className="text-[9px] md:text-[10px] font-medium italic text-red-600">
              Taste Jo Dil Ko Bhaye
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-medium">
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          <Link href="/menu" className="hover:text-gold transition-colors">Menu</Link>
          <Link href="/services" className="hover:text-gold transition-colors">Services</Link>
          <Link href="/track" className="hover:text-gold transition-colors">Track Order</Link>
          <Link href="/#offers" className="hover:text-gold transition-colors">Offers</Link>
          <Link href="/#contact" className="hover:text-gold transition-colors">Contact</Link>
          
          {isMounted && isInstallPromptSupported && !isInstalled && (
            <button onClick={promptInstall} className="flex items-center gap-1 text-gold hover:text-gold/80 font-bold transition-colors">
              <Download className="h-4 w-4" /> Install App
            </button>
          )}
          
        </nav>

        <div className="flex items-center gap-4">
          {isMounted && (
            isAuthenticated ? (
              <Button asChild variant="outline" className="hidden md:flex border-gold/50 text-forest hover:bg-gold/10">
                <Link href="/profile">My Account</Link>
              </Button>
            ) : (
              <Button asChild variant="default" className="hidden md:flex bg-forest text-white hover:bg-forest/90">
                <Link href="/login">Login</Link>
              </Button>
            )
          )}
          
          <Sheet>
            <SheetTrigger render={
              <Button variant="ghost" size="icon" className="relative group">
                <ShoppingBag className={`h-6 w-6 transition-colors ${isScrolled ? "text-forest" : "text-background"}`} />
                {isMounted && totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gold text-forest text-xs">{totalItems}</Badge>
                )}
              </Button>
            } />
            <SheetContent className="w-full sm:max-w-md flex flex-col">
              <SheetHeader>
                <SheetTitle className="font-serif text-2xl">Your Order</SheetTitle>
                <SheetDescription>Review your items before checkout.</SheetDescription>
              </SheetHeader>
              
              <div className="flex-1 overflow-hidden mt-6 flex flex-col">
                {items.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
                    <ShoppingBag className="h-16 w-16 opacity-20" />
                    <p>Your bag is empty.</p>
                    <Button asChild onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}))}>
                      <Link href="/menu">Explore Menu</Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="flex-1 pr-4 -mr-4">
                      <div className="space-y-6">
                        {items.map((item) => (
                          <div key={item.id} className="flex gap-4">
                            {item.image ? (
                              <div className="h-20 w-20 rounded-md overflow-hidden relative flex-shrink-0 bg-muted">
                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                              </div>
                            ) : (
                              <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                <span className="text-muted-foreground text-xs text-center p-1">{item.name}</span>
                              </div>
                            )}
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="font-medium line-clamp-1">{item.name}</h4>
                                <div className="text-sm font-semibold text-primary">₹{item.price}</div>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center border rounded-md">
                                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-muted-foreground hover:bg-muted transition-colors">-</button>
                                  <span className="px-2 text-sm font-medium w-8 text-center">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-muted-foreground hover:bg-muted transition-colors">+</button>
                                </div>
                                <button onClick={() => removeItem(item.id)} className="text-xs text-destructive hover:underline">Remove</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="pt-6 mt-auto">
                      <Separator className="mb-4" />
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-medium">₹{getSubtotal()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Taxes & Delivery</span>
                          <span className="text-muted-foreground italic">Calculated at checkout</span>
                        </div>
                        <div className="flex justify-between font-serif text-lg font-bold pt-2">
                          <span>Estimated Total</span>
                          <span className="text-primary">₹{getSubtotal()}</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full h-12 text-lg bg-primary hover:bg-primary/90 text-primary-foreground" 
                        onClick={() => {
                          document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'})); // close sheet
                          router.push('/checkout');
                        }}
                      >
                        Proceed to Checkout
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger render={
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            } />
            <SheetContent side="left" className="w-[300px] p-6">
              <SheetHeader className="text-left mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Image 
                    src="/images/brand_logo.png" 
                    alt="Logo" 
                    width={40} 
                    height={40} 
                    className="rounded-full"
                  />
                  <div>
                    <SheetTitle className="font-serif text-xl">Pushya <span className="text-gold italic">Planet</span></SheetTitle>
                    <p className="text-[10px] italic text-red-600">Taste Jo Dil Ko Bhaye</p>
                  </div>
                </div>
                
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${rStatus.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  <Circle className={`w-3 h-3 fill-current ${rStatus.isOpen ? 'text-green-500' : 'text-red-500'}`} />
                  {rStatus.text}
                </div>
                <p className="text-xs text-muted-foreground mt-1 px-1">{rStatus.subtext}</p>
              </SheetHeader>

              <ScrollArea className="h-[calc(100vh-160px)] pr-4">
                <div className="flex flex-col gap-6 text-base">
                  <div className="space-y-4">
                    <Link href="/" className="block hover:text-gold transition-colors font-medium border-b border-border/50 pb-2">Home</Link>
                    <Link href="/menu" className="block hover:text-gold transition-colors font-medium border-b border-border/50 pb-2">Full Menu</Link>
                    <Link href="/services" className="block hover:text-gold transition-colors font-medium border-b border-border/50 pb-2">Services & Offers</Link>
                    <Link href="/track" className="block hover:text-gold transition-colors font-medium border-b border-border/50 pb-2">Track Order</Link>
                  </div>

                  <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Quick Contact</h4>
                    <a href={`tel:+91${restaurantDetails.phone}`} className="flex items-center gap-3 text-sm hover:text-gold transition-colors">
                      <Phone className="w-4 h-4 text-forest" /> Call Restaurant
                    </a>
                    <a href={`https://wa.me/91${restaurantDetails.phone}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm hover:text-gold transition-colors">
                      <MessageCircle className="w-4 h-4 text-green-600" /> WhatsApp
                    </a>
                    <a href={restaurantDetails.mapLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm hover:text-gold transition-colors">
                      <MapPinIcon className="w-4 h-4 text-red-500" /> View on Map
                    </a>
                  </div>

                  <div className="bg-forest-soft rounded-xl p-4 flex items-center gap-3 border border-forest/10">
                    <Truck className="w-5 h-5 text-forest shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-forest">Delivering in Rau</p>
                      <p className="text-xs text-forest/70">Fast & fresh to your door</p>
                    </div>
                  </div>
                  
                  {isMounted && !isInstalled && (
                    <button 
                      onClick={async () => {
                        if (isInstallPromptSupported) await promptInstall();
                        // Optional fallback here if needed, but handled globally by Hero Modal now
                      }} 
                      className="flex items-center justify-center gap-2 bg-gold/10 text-gold font-bold p-3 rounded-lg border border-gold/20 hover:bg-gold/20 transition-colors"
                    >
                      <Download className="h-5 w-5" /> Install App
                    </button>
                  )}
                  {isMounted && isInstalled && (
                    <div className="flex items-center justify-center gap-2 bg-forest/5 text-forest font-bold p-3 rounded-lg border border-forest/10">
                      <CheckCircle2 className="h-5 w-5" /> App Installed
                    </div>
                  )}
                  
                  <Link href="/admin/login" className="text-muted-foreground hover:text-forest transition-colors text-xs text-center pt-2">Admin Login</Link>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
