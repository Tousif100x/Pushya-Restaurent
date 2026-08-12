"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { menuCategories as fallbackCategories, signatureItems } from "@/data/menu";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn, SlideUp } from "@/components/animations/Motion";
import Image from "next/image";
import { Search, Plus, Minus, Info, Ban } from "lucide-react";
import { Input } from "@/components/ui/input";

function MenuPageContent() {
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "signature" | "offers">("all");
  const didScrollRef = useRef(false);

  const searchParams = useSearchParams();
  const { items: cartItems, addItem, updateQuantity, removeItem } = useCartStore();

  useEffect(() => {
    setIsMounted(true);
    const cat = searchParams.get("category");
    const filter = searchParams.get("filter");

    if (filter === "signature") {
      setActiveFilter("signature");
    } else if (filter === "offers") {
      setActiveFilter("offers");
    } else if (cat) {
      setActiveCategory(cat);
    }

    // Fetch live menu from DB
    fetch("/api/admin/menu")
      .then((r) => r.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          setDbProducts(data.products);
          setDbCategories(data.categories || []);
          setIsDbLoaded(true);
        }
      })
      .catch(console.error);
  }, [searchParams]);

  // Auto-scroll to category after data loads
  useEffect(() => {
    if (!isDbLoaded || !activeCategory || didScrollRef.current) return;
    const scrollToCategory = () => {
      const el = document.getElementById(activeCategory);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 140;
        window.scrollTo({ top: y, behavior: "smooth" });
        didScrollRef.current = true;
      }
    };
    // Small delay to let the DOM render
    const timeout = setTimeout(scrollToCategory, 300);
    return () => clearTimeout(timeout);
  }, [isDbLoaded, activeCategory]);

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

  // Build active menu category list (DB-driven or fallback)
  const categoriesToRender = isDbLoaded
    ? dbCategories.map((c) => ({
        id: c.slug || c.id,
        name: c.name,
        description: c.description || "",
        image: c.image || "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000",
        items: dbProducts.filter((p) => p.categoryId === c.id),
      }))
    : fallbackCategories;

  if (!isMounted) {
    return (
      <div className="bg-background min-h-screen pt-24 pb-20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 w-48 bg-muted animate-pulse rounded-lg mb-12" />
          <div className="h-14 w-full bg-muted animate-pulse rounded-full mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 w-full bg-muted animate-pulse rounded-xl" />
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 sm:mb-12 gap-4">
          <FadeIn>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-forest">Our Menu</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Discover our handcrafted culinary delights.
            </p>
          </FadeIn>

          <FadeIn delay={0.1} className="w-full md:w-72">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search dishes..."
                className="pl-10 bg-background border-border focus-visible:ring-gold rounded-full h-11 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </FadeIn>
        </div>

        {/* Sticky Categories Nav */}
        <div className="sticky top-16 sm:top-20 z-40 bg-background/90 backdrop-blur-md py-3 mb-8 -mx-4 px-4 overflow-x-auto border-b border-border">
          <div className="flex gap-2">
            <Button
              variant={activeFilter === "all" ? "default" : "outline"}
              className={`rounded-full whitespace-nowrap text-xs font-semibold ${
                activeFilter === "all"
                  ? "bg-forest hover:bg-forest/90 text-white"
                  : "bg-background hover:bg-forest hover:text-background border-border"
              }`}
              onClick={() => setActiveFilter("all")}
            >
              All Menu
            </Button>

            <Button
              variant={activeFilter === "signature" ? "default" : "outline"}
              className={`rounded-full whitespace-nowrap text-xs font-semibold ${
                activeFilter === "signature"
                  ? "bg-gold hover:bg-gold/90 text-forest font-bold shadow-xs"
                  : "bg-background hover:bg-gold hover:text-forest border-gold/40 text-forest"
              }`}
              onClick={() => setActiveFilter("signature")}
            >
              ⭐ Signature Dishes
            </Button>

            <Button
              variant={activeFilter === "offers" ? "default" : "outline"}
              className={`rounded-full whitespace-nowrap text-xs font-semibold ${
                activeFilter === "offers"
                  ? "bg-forest-soft text-gold font-bold shadow-xs"
                  : "bg-background hover:bg-forest-soft hover:text-gold border-forest/30"
              }`}
              onClick={() => setActiveFilter("offers")}
            >
              🎁 Offers & Combos
            </Button>

            {categoriesToRender.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                className="rounded-full whitespace-nowrap bg-background hover:bg-forest hover:text-background border-border transition-colors text-xs font-semibold"
                onClick={() => {
                  setActiveFilter("all");
                  const el = document.getElementById(category.id);
                  const y = el ? el.getBoundingClientRect().top + window.scrollY - 140 : 0;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }}
              >
                {category.name.replace(" Menu", "")}
              </Button>
            ))}
          </div>
        </div>

        {/* Menu Sections */}
        <div className="space-y-16 sm:space-y-24">
          {categoriesToRender.map((category) => {
            const filteredItems = category.items.filter((item: any) => {
              const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
              if (!matchesSearch) return false;

              if (activeFilter === "signature") {
                return item.isSignature || signatureItems.includes(item.id);
              }
              if (activeFilter === "offers") {
                return (
                  category.id.toLowerCase().includes("combo") ||
                  category.id.toLowerCase().includes("offer") ||
                  category.name.toLowerCase().includes("combo") ||
                  category.name.toLowerCase().includes("special")
                );
              }
              return true;
            });

            if (filteredItems.length === 0) return null;

            return (
              <section key={category.id} id={category.id} className="scroll-mt-36">
                <SlideUp>
                  <div className="relative h-44 sm:h-56 rounded-2xl overflow-hidden mb-6 bg-forest-soft">
                    {category.image && (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover brightness-50"
                      />
                    )}
                    <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12">
                      <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-1">
                        {category.name}
                      </h2>
                      {category.description && (
                        <p className="text-white/80 max-w-lg text-sm sm:text-base">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                </SlideUp>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredItems.map((item: any, idx: number) => {
                    const quantity = getCartQuantity(item.id);
                    const isSignature = item.isSignature || signatureItems.includes(item.id);
                    const isAvailable = item.isActive ?? true;

                    return (
                      <SlideUp key={item.id} delay={idx * 0.05}>
                        <Card
                          className={`h-full border transition-all overflow-hidden ${
                            !isAvailable
                              ? "opacity-60 bg-gray-50 border-gray-200"
                              : "border-border hover:shadow-md bg-white"
                          }`}
                        >
                          <CardContent className="p-0 flex flex-col h-full">
                            <div className="flex p-4 sm:p-5 gap-3 h-full">
                              <div className="flex-1 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-start justify-between">
                                    <h3 className="font-bold text-base text-forest leading-tight mb-1">
                                      {item.name}
                                    </h3>
                                    {item.isVeg !== false && (
                                      <div className="h-4 w-4 border border-green-600 p-0.5 rounded-xs flex items-center justify-center shrink-0 ml-1.5 mt-0.5" title="Vegetarian">
                                        <div className="h-2 w-2 rounded-full bg-green-600" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-1.5 mb-1.5 flex-wrap">
                                    {isSignature && (
                                      <Badge className="bg-gold text-forest text-[10px] py-0 font-bold">
                                        Signature
                                      </Badge>
                                    )}
                                    {!isAvailable && (
                                      <Badge className="bg-red-500 text-white text-[10px] py-0 font-bold">
                                        Out of Stock
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="font-bold text-forest text-base">₹{item.price}</p>
                                </div>

                                <div className="mt-4">
                                  {!isAvailable ? (
                                    <Button
                                      disabled
                                      variant="outline"
                                      className="text-gray-400 border-gray-300 w-28 h-9 text-xs"
                                    >
                                      <Ban className="w-3.5 h-3.5 mr-1" /> Unavailable
                                    </Button>
                                  ) : quantity === 0 ? (
                                    <Button
                                      variant="outline"
                                      className="text-gold border-gold hover:bg-gold hover:text-forest w-28 h-9 text-xs font-bold"
                                      onClick={() => handleUpdateCart(item, 1)}
                                    >
                                      ADD
                                    </Button>
                                  ) : (
                                    <div className="flex items-center justify-between w-28 bg-forest rounded-lg overflow-hidden text-white h-9">
                                      <button
                                        className="w-8 h-full flex items-center justify-center hover:bg-forest-soft"
                                        onClick={() => handleUpdateCart(item, -1)}
                                      >
                                        <Minus className="h-3.5 w-3.5" />
                                      </button>
                                      <span className="font-bold text-xs">{quantity}</span>
                                      <button
                                        className="w-8 h-full flex items-center justify-center hover:bg-forest-soft"
                                        onClick={() => handleUpdateCart(item, 1)}
                                      >
                                        <Plus className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {item.image ? (
                                <div className="relative w-28 h-28 rounded-xl overflow-hidden shrink-0 bg-muted">
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="relative w-28 h-28 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                  <span className="text-muted-foreground text-[10px] text-center p-2">
                                    Fresh Prepared
                                  </span>
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
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background min-h-screen pt-24 pb-20">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 w-48 bg-muted animate-pulse rounded-lg mb-12" />
          </div>
        </div>
      }
    >
      <MenuPageContent />
    </Suspense>
  );
}
