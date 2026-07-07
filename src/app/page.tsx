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

export default function Home() {
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

  // Get all items to find signature ones
  const allItems = menuCategories.flatMap(c => c.items as any[]);
  const featuredSignatures = allItems.filter(item => signatureItems.includes(item.id)).slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      <InstallModal 
        isOpen={isInstallModalOpen} 
        onClose={() => setIsInstallModalOpen(false)} 
        browserContext={browserContext} 
      />

      {/* Hero Section */}
      <section className="relative h-[80vh] md:h-screen w-full overflow-hidden bg-forest">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              sizes="100vw"
              className="object-cover opacity-60"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/50 to-transparent" />
            
            <div className="absolute inset-0 flex items-center justify-center pt-[calc(4rem+env(safe-area-inset-top))] md:pt-[calc(5rem+env(safe-area-inset-top))]">
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-background">
                {index === currentSlide && (
                  <StaggerContainer className="max-w-3xl mx-auto space-y-6">
                    <StaggerItem y={30}>
                      <Badge className="bg-gold text-forest hover:bg-gold/90 text-sm px-4 py-1 mb-4">
                        {slide.badge}
                      </Badge>
                    </StaggerItem>
                    <StaggerItem y={30}>
                      <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                        {slide.title}
                      </h1>
                    </StaggerItem>
                    <StaggerItem y={30}>
                      <p className="text-xl md:text-2xl text-background/80 font-light">
                        {slide.subtitle}
                      </p>
                    </StaggerItem>
                    <StaggerItem y={30} className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Button asChild size="lg" className="w-full sm:w-auto bg-gold text-forest hover:bg-gold/90 text-lg h-14 px-8 rounded-full">
                        <Link href="/menu">Explore Menu <ArrowRight className="ml-2 h-5 w-5" /></Link>
                      </Button>
                      
                      {isInstalled ? (
                        <Button size="lg" variant="outline" disabled className="w-full sm:w-auto border-gold/50 text-gold bg-forest/20 text-lg h-14 px-8 rounded-full">
                          <CheckCircle2 className="mr-2 h-5 w-5" /> App Installed
                        </Button>
                      ) : (
                        <Button 
                          size="lg" 
                          variant="outline" 
                          className="w-full sm:w-auto border-gold text-gold hover:bg-gold/10 hover:text-gold text-lg h-14 px-8 rounded-full"
                          disabled={installState === 'preparing' || installState === 'installing'}
                          onClick={async () => {
                            if (isInstallPromptSupported) {
                              const handled = await promptInstall();
                              if (!handled) setIsInstallModalOpen(true);
                            } else {
                              setIsInstallModalOpen(true);
                            }
                          }}
                        >
                          {installState === 'preparing' || installState === 'installing' ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Installing...</>
                          ) : (
                            <><Download className="mr-2 h-5 w-5" /> Download App</>
                          )}
                        </Button>
                      )}
                    </StaggerItem>
                    
                    <StaggerItem y={30} className="pt-8">
                      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm md:text-base text-background/90 max-w-2xl mx-auto">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-gold fill-gold" />
                          <span>Rated 4.8/5</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-gold" />
                          <span>30 Min Delivery</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-gold" />
                          <span>Fresh Ingredients</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Banknote className="w-4 h-4 text-gold" />
                          <span>Cash & UPI</span>
                        </div>
                      </div>
                    </StaggerItem>
                  </StaggerContainer>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Slider Indicators */}
        <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center gap-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? "w-10 bg-gold" : "w-2 bg-background/50 hover:bg-background/80"
              }`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Featured Signatures */}
      <section className="py-24 bg-background">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SlideUp>
            <div className="text-center mb-16">
              <h4 className="text-gold font-medium tracking-widest uppercase mb-3">Serve Quality Food</h4>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-forest">Immerse yourself in a<br/>premium experience.</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mt-6">
                Savor perfection—crafted with tradition, fresh ingredients, and a passion for detail.
              </p>
            </div>
          </SlideUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredSignatures.map((item, index) => (
              <SlideUp key={item.id} delay={index * 0.1}>
                <Link href="/menu" className="group block">
                  <div className="relative h-[300px] rounded-2xl overflow-hidden mb-6 bg-forest-soft">
                    {item.image && (
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                    <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold shadow-sm text-foreground">
                      ₹{item.price}
                    </div>
                  </div>
                  <h3 className="font-serif text-2xl font-bold mb-2 group-hover:text-gold transition-colors text-foreground">{item.name}</h3>
                  <div className="flex items-center text-muted-foreground text-sm gap-4">
                    <span className="flex items-center"><Star className="h-4 w-4 text-gold mr-1 fill-gold" /> Signature</span>
                    <span className="flex items-center"><Clock className="h-4 w-4 mr-1" /> 15-20 Min</span>
                  </div>
                </Link>
              </SlideUp>
            ))}
          </div>
          
          <div className="text-center mt-12">
             <Button asChild variant="outline" className="border-forest text-forest hover:bg-forest hover:text-background rounded-full px-8">
                <Link href="/menu">View Full Menu</Link>
              </Button>
          </div>
        </div>
      </section>

      {/* Alternating Section: Weekly Offers */}
      <OffersSection />

      {/* Categories */}
      <section className="py-24 bg-background">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SlideUp>
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl font-bold text-forest">Explore by Category</h2>
            </div>
          </SlideUp>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {menuCategories.map((category, index) => (
              <SlideUp key={category.id} delay={index * 0.05}>
                <Link href={`/menu#${category.id}`} className="group block text-center">
                  <div className="relative w-full aspect-square rounded-full overflow-hidden mb-4 mx-auto max-w-[160px] border-4 border-transparent group-hover:border-gold transition-all duration-300">
                    <Image 
                      src={category.image} 
                      alt={category.name} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                  </div>
                  <h3 className="font-serif text-lg font-medium group-hover:text-gold transition-colors text-foreground">{category.name.replace(' Menu', '')}</h3>
                </Link>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 bg-forest-soft text-background">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <SlideUp>
              <h4 className="text-gold font-medium tracking-widest uppercase mb-3">Special Services</h4>
              <h2 className="font-serif text-4xl md:text-5xl font-bold">Make Every Moment Special</h2>
            </SlideUp>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <SlideUp key={service.id} delay={index * 0.1}>
                <Card className="bg-forest border-forest-soft/50 text-background h-full hover:border-gold/50 transition-colors">
                  <CardContent className="p-8 text-center space-y-4 flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full bg-forest-soft flex items-center justify-center text-gold mb-2">
                      <Star className="h-8 w-8" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold">{service.title}</h3>
                    <p className="text-background/70">{service.description}</p>
                    <div className="pt-4 mt-auto">
                      <Button asChild variant="link" className="text-gold hover:text-gold/80 p-0">
                         <a href={`https://wa.me/91${restaurantDetails.phone}`} target="_blank" rel="noreferrer">Enquire Now <ArrowRight className="ml-2 h-4 w-4" /></a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials / Review System Placeholder */}
      <TestimonialsSection />

    </div>
  );
}
