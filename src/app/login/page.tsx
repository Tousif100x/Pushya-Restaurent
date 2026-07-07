"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/Motion";
import Image from "next/image";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) {
        setStep("otp");
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch (err) {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 4) {
      setError("Please enter the 4-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      if (res.ok) {
        // Force hard reload to update root layout auth state, or just push
        window.location.href = "/";
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <FadeIn className="w-full max-w-md">
        <Card className="border-gold/20 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-b from-forest/5 to-transparent flex flex-col items-center pt-8 pb-4">
            <Image 
              src="/images/brand_logo.png" 
              alt="Pushya Planet Logo" 
              width={80} 
              height={80} 
              className="rounded-full shadow-lg border-2 border-gold mb-4"
            />
            <h2 className="font-serif text-2xl font-bold text-forest">Welcome Back</h2>
            <p className="text-sm text-red-500 italic mt-1 font-medium">Taste Jo Dil Ko Bhaye</p>
          </div>
          
          <CardContent className="pt-6">
            {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">{error}</div>}
            
            {step === "phone" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-forest mb-1">Mobile Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-forest/20 bg-forest/5 text-forest/70 font-medium">
                      +91
                    </span>
                    <input 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10 digit number"
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-forest/20 focus:border-gold focus:ring-1 focus:ring-gold sm:text-sm"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-forest hover:bg-forest/90 text-white" disabled={loading}>
                  {loading ? "Sending..." : "Get OTP"}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-4">
                  (For testing, check the server terminal for the OTP, or use 1234)
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-forest mb-1">Enter OTP sent to +91 {phone}</label>
                  <input 
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="4-digit OTP"
                    className="block w-full px-3 py-2 rounded-md border border-forest/20 focus:border-gold focus:ring-1 focus:ring-gold sm:text-sm text-center tracking-widest text-lg font-bold"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gold hover:bg-gold/90 text-forest" disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Login"}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setStep("phone")}>
                  Change Number
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
