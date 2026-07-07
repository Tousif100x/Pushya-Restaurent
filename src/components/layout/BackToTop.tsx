"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  if (!isVisible) return null;

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed bottom-6 left-6 z-50 rounded-full w-12 h-12 bg-background/80 backdrop-blur border-gold/50 text-gold hover:bg-gold hover:text-forest shadow-lg transition-all duration-300 animate-in fade-in"
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-6 h-6" />
    </Button>
  );
}
