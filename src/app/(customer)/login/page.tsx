"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/Motion";
import Image from "next/image";
import Link from "next/link";
import { Phone, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { checkAuth } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();

      if (res.ok) {
        await checkAuth();
        toast.success(`Welcome back!`);
        router.push("/home");
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <FadeIn className="w-full max-w-md">
        <Card className="border-gold/20 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-b from-forest/5 to-transparent flex flex-col items-center pt-8 pb-4">
            <Image
              src="/images/brand_logo.png"
              alt="Pushya Planet Logo"
              width={72}
              height={72}
              className="rounded-full shadow-lg border-2 border-gold mb-4"
            />
            <h1 className="font-serif text-2xl font-bold text-forest">Welcome Back</h1>
            <p className="text-sm text-red-500 italic mt-1 font-medium">Taste Jo Dil Ko Bhaye</p>
          </div>

          <CardContent className="pt-6 pb-8 px-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-forest">Mobile Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-forest/20 bg-forest/5 text-forest/70 font-medium text-sm">
                    +91
                  </span>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest/40" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="Enter 10-digit number"
                      className="pl-9 w-full px-3 py-2.5 rounded-none rounded-r-md border border-forest/20 focus:border-gold focus:ring-1 focus:ring-gold text-sm"
                      inputMode="numeric"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-forest">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-9 pr-10 w-full px-3 py-2.5 rounded-md border border-forest/20 focus:border-gold focus:ring-1 focus:ring-gold text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-forest/40 hover:text-forest/70"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-forest hover:bg-forest/90 text-white font-semibold"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Login"}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                New here?{" "}
                <Link href="/register" className="text-forest font-semibold hover:text-gold transition-colors">
                  Create Account
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
