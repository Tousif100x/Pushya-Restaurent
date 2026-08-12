"use client";

import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/animations/Motion";
import { menuCategories, offers, services, signatureItems, restaurantDetails } from "@/data/menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Star, Download, ShieldCheck, Banknote, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { InstallModal } from "@/components/layout/InstallModal";
import dynamic from "next/dynamic";

const OffersSection = dynamic(() => import("@/components/home/OffersSection"), { ssr: true });
const TestimonialsSection = dynamic(() => import("@/components/home/TestimonialsSection"), { ssr: true });

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2000&auto=format&fit=crop",
    title: "Delicious Food & Wonderful Eating Experience",
    subtitle: "We serve food, harmony, & laughter.",
    badge: "Signature Pizza"
  },
  {
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=2000&auto=format&fit=crop",
    title: "Perfectly Grilled Sandwiches",
    subtitle: "Loaded with fresh veggies and premium cheese.",
    badge: "Fresh Ingredients"
  },
  {
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2000&auto=format&fit=crop",
    title: "Premium Party Catering",
    subtitle: "Make your celebrations memorable with our special party orders.",
    badge: "Party Orders"
  }
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  const {
    isInstalled,
    installState,
    browserContext,
    isInstallPromptSupported,
    promptInstall
  } = useInstallPrompt();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const allItems = menuCategories.flatMap(c => c.items as any[]);
  const featuredSignatures = allItems.filter(item => item.isSignature).slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full h-[85vh] min-h-[500px] overflow-hidden bg-forest-soft">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              {index === currentSlide && (
                <StaggerContainer className="max-w-4xl">
                  <StaggerItem y={20}>
                    <Badge className="mb-4 bg-gold/90 text-forest font-semibold px-4 py-1 rounded-full text-sm">
                      {slide.badge}
                    </Badge>
                  </StaggerItem>
                  <StaggerItem y={30}>
                    <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl font-bold text-white leading-tight mb-4 drop-shadow-xl">
                      {slide.title}
                    </h1>
                  </StaggerItem>
                  <StaggerItem y={20}>
                    <p className="text-base sm:text-lg md:text-xl text-white/85 mb-8 max-w-2xl mx-auto drop-shadow-md">
                      {slide.subtitle}
                    </p>
                  </StaggerItem>
                  <StaggerItem y={20}>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button asChild size="lg" className="bg-gold text-forest hover:bg-gold/90 font-bold rounded-full px-8 text-base">
                        <Link href="/menu">Order Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                      {!isInstalled && (
                        <Button
                          size="lg"
                          className="bg-white/20 hover:bg-white/30 text-white border border-white/50 backdrop-blur-md rounded-full px-8 text-base font-bold shadow-lg transition-all"
                          onClick={() => (isInstallPromptSupported ? promptInstall() : setIsInstallModalOpen(true))}
                        >
                          <Download className="mr-2 h-5 w-5 text-gold" />
                          Install App
                        </Button>
                      )}
                    </div>
                  </StaggerItem>
                  <StaggerItem y={30} className="pt-8">
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm md:text-base text-white/90 max-w-2xl mx-auto">
                      <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-gold fill-gold" /><span>Rated 4.8/5</span></div>
                      <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gold" /><span>30 Min Delivery</span></div>
                      <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-gold" /><span>Fresh Ingredients</span></div>
                      <div className="flex items-center gap-1.5"><Banknote className="w-4 h-4 text-gold" /><span>Cash & UPI</span></div>
                    </div>
                  </StaggerItem>
                </StaggerContainer>
              )}
            </div>
          </div>
        ))}

        {/* Slider Dots */}
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? "w-10 bg-gold" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Signature Items */}
      {featuredSignatures.length > 0 && (
        <section className="py-16 md:py-24 bg-background">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SlideUp>
              <div className="text-center mb-12 md:mb-16">
                <h4 className="text-gold font-medium tracking-widest uppercase mb-3">Serve Quality Food</h4>
                <h2 className="font-serif text-3xl md:text-5xl font-bold text-forest">Signature Dishes</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
                  Crafted with tradition, fresh ingredients, and passion.
                </p>
              </div>
            </SlideUp>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {featuredSignatures.map((item, index) => (
                <SlideUp key={item.id} delay={index * 0.1}>
                  <Link href="/menu?filter=signature" className="group block">
                    <div className="relative h-[240px] md:h-[300px] rounded-2xl overflow-hidden mb-4 bg-forest-soft">
                      {item.image && (
                        <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                        ₹{item.price}
                      </div>
                    </div>
                    <h3 className="font-serif text-xl md:text-2xl font-bold mb-2 group-hover:text-gold transition-colors">{item.name}</h3>
                    <div className="flex items-center text-muted-foreground text-sm gap-4">
                      <span className="flex items-center"><Star className="h-4 w-4 text-gold mr-1 fill-gold" /> Signature</span>
                      <span className="flex items-center"><Clock className="h-4 w-4 mr-1" /> 15-20 Min</span>
                    </div>
                  </Link>
                </SlideUp>
              ))}
            </div>
            <div className="text-center mt-10">
              <Button asChild variant="outline" className="border-forest text-forest hover:bg-forest hover:text-background font-bold rounded-full px-8">
                <Link href="/menu?filter=signature">View Signature Dishes</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Offers */}
      <OffersSection />

      {/* Categories */}
      <section className="py-16 md:py-24 bg-background">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SlideUp>
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-forest">Explore by Category</h2>
            </div>
          </SlideUp>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {menuCategories.map((category, index) => (
              <SlideUp key={category.id} delay={index * 0.05}>
                <Link href={`/menu?category=${category.id}`} className="group block text-center">
                  <div className="relative w-full aspect-square rounded-full overflow-hidden mb-3 mx-auto max-w-[140px] border-4 border-transparent group-hover:border-gold transition-all duration-300">
                    <Image src={category.image} alt={category.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <h3 className="font-serif text-base md:text-lg font-medium group-hover:text-gold transition-colors">{category.name.replace(' Menu', '')}</h3>
                </Link>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-16 md:py-24 bg-forest-soft text-background">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <SlideUp>
              <h4 className="text-gold font-medium tracking-widest uppercase mb-3">Special Services</h4>
              <h2 className="font-serif text-3xl md:text-5xl font-bold">Make Every Moment Special</h2>
            </SlideUp>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {services.map((service, index) => (
              <SlideUp key={service.id} delay={index * 0.1}>
                <Card className="bg-forest border-forest-soft/50 text-background h-full hover:border-gold/50 transition-colors">
                  <CardContent className="p-6 md:p-8 text-center space-y-4 flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full bg-forest-soft flex items-center justify-center text-gold mb-2">
                      <Star className="h-8 w-8" />
                    </div>
                    <h3 className="font-serif text-xl md:text-2xl font-bold">{service.title}</h3>
                    <p className="text-background/70 text-sm md:text-base">{service.description}</p>
                    <div className="pt-4 mt-auto">
                      <Button asChild variant="link" className="text-gold hover:text-gold/80 p-0">
                        <a href={`https://wa.me/91${restaurantDetails.whatsapp}`} target="_blank" rel="noreferrer">
                          Enquire Now <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {isInstallModalOpen && (
        <InstallModal isOpen={isInstallModalOpen} onClose={() => setIsInstallModalOpen(false)} browserContext={browserContext} />
      )}
    </div>
  );
}
