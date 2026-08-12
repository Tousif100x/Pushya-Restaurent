"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Mail, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user?.role === "ADMIN") {
          router.replace("/admin/dashboard");
        }
      })
      .catch(() => {});
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("adminAuth", "true");
        localStorage.setItem("pushya_app_role", "admin");
        window.location.href = "/admin/dashboard";
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d1f15] p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#D9A441]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[#D9A441]/5 blur-3xl" />
      </div>

      {/* Back to entry */}
      <Link
        href="/"
        className="absolute top-4 left-4 text-white/40 hover:text-white/70 flex items-center gap-1.5 text-sm transition-colors"
        onClick={() => localStorage.removeItem("pushya_app_role")}
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/images/brand_logo.png"
            alt="Pushya Planet"
            width={64}
            height={64}
            className="rounded-full border-2 border-[#D9A441]/40 shadow-xl mb-4"
          />
          <h1 className="font-serif text-2xl font-bold text-white">Restaurant Login</h1>
          <p className="text-white/40 text-sm mt-1">Authorized personnel only</p>
        </div>

        <Card className="bg-white/8 border-white/10 backdrop-blur-md shadow-2xl">
          <CardContent className="pt-6 pb-6 px-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/70">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tousif@gmail.com"
                    className="pl-10 bg-white/8 border-white/15 text-white placeholder:text-white/25 focus:border-[#D9A441]/50 focus:ring-[#D9A441]/20 h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/70">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 bg-white/8 border-white/15 text-white placeholder:text-white/25 focus:border-[#D9A441]/50 focus:ring-[#D9A441]/20 h-11"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#10261B] hover:bg-[#10261B]/90 text-white font-semibold mt-2 border border-white/10"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
