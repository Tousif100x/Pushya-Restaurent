"use client";

import { SlideUp } from "@/components/animations/Motion";

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <SlideUp>
          <h2 className="font-serif text-4xl font-bold text-forest mb-12">What Our Customers Say</h2>
          <div className="max-w-2xl mx-auto py-12 px-6 bg-muted rounded-2xl border border-border border-dashed">
            <p className="text-muted-foreground italic text-lg">"No customer reviews yet. Be the first to leave a review after your order!"</p>
          </div>
        </SlideUp>
      </div>
    </section>
  );
}
