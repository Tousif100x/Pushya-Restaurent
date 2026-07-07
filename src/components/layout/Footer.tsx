import Link from "next/link";
import { Globe, Camera, MapPin, Phone, MessageCircle } from "lucide-react";
import { restaurantDetails } from "@/data/menu";
import { Button } from "../ui/button";

export function Footer() {
  return (
    <footer className="bg-forest text-primary-foreground pt-20 pb-10 border-t border-forest-soft">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-16">
          <div className="space-y-6">
            <div className="font-serif text-3xl font-bold tracking-tight text-background">
              Pushya <span className="text-gold italic">Planet</span>
            </div>
            <p className="text-muted-foreground max-w-sm">
              Experience the finest taste of authentic pizzas, sandwiches, and multi-cuisine delights in a premium ambiance.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="h-10 w-10 rounded-full bg-forest-soft flex items-center justify-center hover:bg-gold hover:text-forest transition-colors">
                <Globe className="h-5 w-5" />
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full bg-forest-soft flex items-center justify-center hover:bg-gold hover:text-forest transition-colors">
                <Camera className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-xl mb-6 text-gold">Quick Links</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li><Link href="/" className="hover:text-background transition-colors">Home</Link></li>
              <li><Link href="/menu" className="hover:text-background transition-colors">Full Menu</Link></li>
              <li><Link href="/#offers" className="hover:text-background transition-colors">Special Offers</Link></li>
              <li><Link href="/#services" className="hover:text-background transition-colors">Party Orders</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-xl mb-6 text-gold">Contact Us</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <span>{restaurantDetails.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gold shrink-0" />
                <div className="flex flex-col">
                  <span>+91 {restaurantDetails.phone}</span>
                  {restaurantDetails.secondaryPhone && (
                    <span className="text-xs text-muted-foreground">Alt: +91 {restaurantDetails.secondaryPhone}</span>
                  )}
                </div>
              </li>
            </ul>
            <div className="mt-6 flex flex-col gap-3">
              <Button asChild className="bg-gold text-forest hover:bg-gold/90 w-full justify-start">
                <a href={`tel:+91${restaurantDetails.phone}`}>
                  <Phone className="mr-2 h-4 w-4" /> Call: {restaurantDetails.phone}
                </a>
              </Button>
              {restaurantDetails.secondaryPhone && (
                <Button asChild variant="outline" className="border-gold/50 text-foreground hover:bg-gold/10 w-full justify-start">
                  <a href={`tel:+91${restaurantDetails.secondaryPhone}`}>
                    <Phone className="mr-2 h-4 w-4 text-gold" /> Alt: {restaurantDetails.secondaryPhone}
                  </a>
                </Button>
              )}
              <Button asChild variant="outline" className="border-forest-soft text-foreground hover:bg-forest-soft w-full justify-start">
                <a href={`https://wa.me/91${restaurantDetails.whatsapp}`} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4 text-green-500" /> WhatsApp Us
                </a>
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-xl mb-6 text-gold">Opening Hours</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex justify-between">
                <span>Monday - Sunday</span>
                <span className="text-background font-medium">11:00 AM - 11:00 PM</span>
              </li>
              <li className="pt-4 border-t border-forest-soft mt-4">
                <p className="text-xs text-muted-foreground">
                  We provide home delivery up to {restaurantDetails.deliveryRadiusKm}km.
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-forest-soft text-center text-muted-foreground text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p><Link href="/admin/dashboard" className="hover:text-background transition-colors outline-none">©</Link> {new Date().getFullYear()} {restaurantDetails.name}. All rights reserved.</p>
          <div className="flex gap-4">
            {/* Secret admin login is on the copyright symbol */}
          </div>
        </div>
      </div>
    </footer>
  );
}
