"use client";

import Link from "next/link";
import { ShoppingBag, Menu, User as UserIcon, LogOut, Download, Phone, MessageCircle, MapPin as MapPinIcon, Truck, CheckCircle2, Circle } from "lucide-react";
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
import { getRestaurantStatus } from "@/lib/restaurantStatus";
import { siteConfig as restaurantDetails } from "@/lib/siteConfig";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const { user, isAuthenticated, checkAuth, logout } = useAuthStore();
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
      className={`fixed top-0 w-full z-50 transition-all duration-300 bg-background/90 backdrop-blur-xl shadow-xs border-b border-gold/10 pt-[env(safe-area-inset-top)] h-16 md:h-20 flex items-center`}
    >
      <div className="container mx-auto px-4 lg:px-8 h-full flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/home" className="flex items-center gap-3">
          <Image
            src="/images/brand_logo.png"
            alt="Pushya Planet Logo"
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

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7 font-medium text-sm">
          <Link href="/home" className="hover:text-gold transition-colors">Home</Link>
          <Link href="/menu" className="hover:text-gold transition-colors">Menu</Link>
          <Link href="/services" className="hover:text-gold transition-colors">Services</Link>
          <Link href="/track" className="hover:text-gold transition-colors">Track Order</Link>
          
          {isMounted && isInstallPromptSupported && !isInstalled && (
            <button onClick={promptInstall} className="flex items-center gap-1 text-gold hover:text-gold/80 font-bold transition-colors">
              <Download className="h-4 w-4" /> Install App
            </button>
          )}
        </nav>

        {/* Action Icons */}
        <div className="flex items-center gap-3">

          {/* Profile & Logout Action Buttons (Desktop Only — Mobile uses Drawer) */}
          {isMounted && (
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="border-gold/40 text-forest hover:bg-gold/10 font-bold text-xs h-9 px-3 flex items-center gap-1.5"
                  >
                    <Link href="/profile">
                      <UserIcon className="h-4 w-4 text-gold fill-gold" />
                      <span>My Account</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={async () => {
                      localStorage.removeItem("pushya_app_role");
                      await logout();
                      router.push("/");
                    }}
                    className="border-red-200 text-red-600 hover:bg-red-50 h-9 w-9"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  asChild
                  className="bg-forest text-white hover:bg-forest/90 font-semibold text-xs h-9 px-4 flex items-center gap-1.5 shadow-xs"
                >
                  <Link href="/login">
                    <UserIcon className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                </Button>
              )}
            </div>
          )}

          {/* Cart Bag Drawer */}
          <Sheet>
            <SheetTrigger render={
              <Button variant="ghost" size="icon" className="relative group h-9 w-9">
                <ShoppingBag className="h-5 w-5 text-forest" />
                {isMounted && totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gold text-forest text-xs font-bold">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            } />
            <SheetContent className="w-full sm:max-w-md flex flex-col">
              <SheetHeader>
                <SheetTitle className="font-serif text-2xl">Your Cart</SheetTitle>
                <SheetDescription>Review items before checkout.</SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-hidden mt-6 flex flex-col">
                {items.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
                    <ShoppingBag className="h-16 w-16 opacity-20" />
                    <p>Your cart is empty.</p>
                    <Button asChild onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))}>
                      <Link href="/menu">Explore Menu</Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="flex-1 pr-4 -mr-4">
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div key={item.id} className="flex gap-3 items-center border-b pb-3">
                            {item.image ? (
                              <div className="h-16 w-16 rounded-md overflow-hidden relative shrink-0 bg-muted">
                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                              </div>
                            ) : (
                              <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center shrink-0">
                                <span className="text-muted-foreground text-[10px] text-center p-1">{item.name}</span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{item.name}</h4>
                              <div className="text-xs font-bold text-forest mt-0.5">₹{item.price * item.quantity}</div>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center border rounded-md h-7">
                                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 text-muted-foreground hover:bg-muted text-xs">-</button>
                                  <span className="px-2 text-xs font-medium w-6 text-center">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 text-muted-foreground hover:bg-muted text-xs">+</button>
                                </div>
                                <button onClick={() => removeItem(item.id)} className="text-[11px] text-red-500 hover:underline">Remove</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="pt-4 mt-auto border-t space-y-3">
                      <div className="flex justify-between font-serif text-lg font-bold">
                        <span>Total Amount</span>
                        <span className="text-forest">₹{getSubtotal()}</span>
                      </div>
                      <Button
                        className="w-full h-12 text-base font-semibold bg-forest hover:bg-forest/90 text-white rounded-xl"
                        onClick={() => {
                          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
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

          {/* Mobile Drawer Toggle */}
          <Sheet>
            <SheetTrigger render={
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                <Menu className="h-6 w-6 text-forest" />
              </Button>
            } />
            <SheetContent side="left" className="w-[300px] p-6 flex flex-col">
              <SheetHeader className="text-left mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <Image src="/images/brand_logo.png" alt="Logo" width={40} height={40} className="rounded-full" />
                  <div>
                    <SheetTitle className="font-serif text-xl">Pushya <span className="text-gold italic">Planet</span></SheetTitle>
                    <p className="text-[10px] italic text-red-600">Taste Jo Dil Ko Bhaye</p>
                  </div>
                </div>

                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${rStatus.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  <Circle className={`w-2.5 h-2.5 fill-current ${rStatus.isOpen ? 'text-green-500' : 'text-red-500'}`} />
                  {rStatus.text}
                </div>
              </SheetHeader>

              <ScrollArea className="flex-1 pr-2">
                <div className="flex flex-col gap-5 text-sm">
                  {/* Account / Login prominent card */}
                  {isMounted && (
                    isAuthenticated ? (
                      <Link
                        href="/profile"
                        className="flex items-center justify-between bg-gold/15 border border-gold/40 text-forest font-bold p-3 rounded-xl hover:bg-gold/25 transition-colors"
                        onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))}
                      >
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gold fill-gold" />
                          <div>
                            <p className="text-xs text-muted-foreground uppercase leading-none">Logged In</p>
                            <p className="text-sm font-bold text-forest leading-tight mt-0.5">{user?.name || `+91 ${user?.phone}`}</p>
                          </div>
                        </div>
                        <span className="text-xs text-forest underline">Profile →</span>
                      </Link>
                    ) : (
                      <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 bg-forest text-white font-bold p-3 rounded-xl hover:bg-forest/90 transition-colors shadow-xs"
                        onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))}
                      >
                        <UserIcon className="w-4 h-4" /> Login / Create Account
                      </Link>
                    )
                  )}

                  <div className="space-y-3 font-medium border-t border-border pt-3">
                    <Link href="/home" className="block hover:text-gold transition-colors pb-1 border-b border-border/40">Home</Link>
                    <Link href="/menu" className="block hover:text-gold transition-colors pb-1 border-b border-border/40">Full Menu</Link>
                    <Link href="/services" className="block hover:text-gold transition-colors pb-1 border-b border-border/40">Services & Offers</Link>
                    <Link href="/track" className="block hover:text-gold transition-colors pb-1 border-b border-border/40">Track Order</Link>
                    {isAuthenticated && (
                      <Link href="/profile" className="block text-gold hover:text-gold/80 font-bold pb-1 border-b border-border/40">My Account & Addresses</Link>
                    )}
                  </div>

                  <div className="bg-muted/50 rounded-xl p-3 space-y-2 text-xs">
                    <h4 className="font-bold uppercase text-muted-foreground text-[10px]">Contact Restaurant</h4>
                    <a href={`tel:+91${restaurantDetails.phone}`} className="flex items-center gap-2 text-forest font-medium">
                      <Phone className="w-3.5 h-3.5" /> Call: {restaurantDetails.phone}
                    </a>
                    <a href={`https://wa.me/91${restaurantDetails.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-green-600 font-medium">
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                    <a href={restaurantDetails.mapLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-red-500 font-medium">
                      <MapPinIcon className="w-3.5 h-3.5" /> View Location
                    </a>
                  </div>

                  {/* Switch Experience Mode Button */}
                  <button
                    onClick={() => {
                      localStorage.removeItem("pushya_app_role");
                      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                      router.push("/");
                    }}
                    className="text-xs text-muted-foreground hover:text-forest transition-colors text-center pt-2 pb-4 underline"
                  >
                    Switch Experience / Admin Login
                  </button>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
