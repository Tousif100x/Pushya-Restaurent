"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/Motion";
import Image from "next/image";
import Link from "next/link";
import { Phone, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

function LoginPageContent() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/home";
  const { checkAuth } = useAuthStore();

  // Reset password states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPhone, setResetPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPhone.length < 10) {
      setResetError("Enter a valid 10-digit mobile number");
      return;
    }
    if (newPassword.length < 6) {
      setResetError("Password must be at least 6 characters");
      return;
    }

    setResetLoading(true);
    setResetError("");
    setResetSuccess("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: resetPhone, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetSuccess(data.message || "Password updated successfully!");
        setResetPhone("");
        setNewPassword("");
      } else {
        setResetError(data.error || "Failed to reset password.");
      }
    } catch {
      setResetError("Network error. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

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
        router.push(redirectTarget);
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
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-forest">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowResetModal(true)}
                    className="text-xs text-gold hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
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

        {/* Customer Reset Password Modal */}
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <Card className="w-full max-w-sm border-gold/30 shadow-2xl">
              <CardContent className="pt-6 pb-6 px-6 space-y-4">
                <h3 className="text-lg font-bold text-forest text-center">Reset Password</h3>
                {resetSuccess ? (
                  <div className="space-y-3 text-center">
                    <p className="text-green-600 text-sm font-semibold">✅ {resetSuccess}</p>
                    <Button
                      onClick={() => {
                        setShowResetModal(false);
                        setResetSuccess("");
                      }}
                      className="w-full bg-forest hover:bg-forest/90 text-white font-bold h-10"
                    >
                      Sign In Now
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleResetSubmit} className="space-y-3">
                    {resetError && (
                      <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded p-2 text-center">
                        {resetError}
                      </p>
                    )}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-forest">Mobile Number</label>
                      <input
                        type="tel"
                        value={resetPhone}
                        onChange={(e) => setResetPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="10-digit mobile number"
                        className="w-full px-3 py-2 rounded-md border border-forest/20 text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-forest">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full px-3 py-2 rounded-md border border-forest/20 text-xs"
                        required
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowResetModal(false)}
                        className="w-1/2 border-gray-300 text-gray-700 h-9 text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={resetLoading}
                        className="w-1/2 bg-forest hover:bg-forest/90 text-white font-bold h-9 text-xs"
                      >
                        {resetLoading ? "Updating..." : "Reset Password"}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </FadeIn>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-forest">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
