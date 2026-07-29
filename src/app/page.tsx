"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const ROLE_KEY = "pushya_app_role";

export default function EntryScreen() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selecting, setSelecting] = useState<"customer" | "admin" | null>(null);

  useEffect(() => {
    setMounted(true);
    // If role already chosen, skip entry screen
    const savedRole = localStorage.getItem(ROLE_KEY);
    if (savedRole === "customer") {
      router.replace("/home");
    } else if (savedRole === "admin") {
      router.replace("/admin/login");
    }
  }, [router]);

  const handleSelect = (role: "customer" | "admin") => {
    setSelecting(role);
    localStorage.setItem(ROLE_KEY, role);
    if (role === "customer") {
      router.push("/home");
    } else {
      router.push("/admin/login");
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#10261B] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#D9A441]/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#D9A441]/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-3xl" />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center mb-12">
        <div className="relative mb-5">
          <div className="absolute inset-0 rounded-full bg-[#D9A441]/30 blur-xl scale-125" />
          <Image
            src="/images/brand_logo.png"
            alt="Pushya Planet"
            width={88}
            height={88}
            className="relative rounded-full border-2 border-[#D9A441]/50 shadow-2xl"
            priority
          />
        </div>
        <h1 className="font-serif text-4xl font-bold text-white tracking-tight">
          Pushya <span className="text-[#D9A441]">Planet</span>
        </h1>
        <p className="text-white/50 text-sm italic mt-2 font-medium">
          Taste Jo Dil Ko Bhaye
        </p>
      </div>

      {/* Welcome text */}
      <div className="relative z-10 text-center mb-10">
        <h2 className="text-white/80 text-lg font-medium">Welcome! How would you like to continue?</h2>
      </div>

      {/* Role cards */}
      <div className="relative z-10 w-full max-w-sm space-y-4">

        {/* Customer Card */}
        <button
          onClick={() => handleSelect("customer")}
          disabled={selecting !== null}
          className={`
            group w-full rounded-2xl p-5 text-left transition-all duration-300
            bg-white/10 border border-white/15 backdrop-blur-sm
            hover:bg-white/15 hover:border-[#D9A441]/40 hover:shadow-2xl hover:scale-[1.02]
            active:scale-[0.99]
            ${selecting === "customer" ? "scale-[0.99] opacity-80" : ""}
          `}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D9A441] to-[#e8b84d] flex items-center justify-center text-3xl shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              🍕
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-white leading-tight">Order Food</h3>
              <p className="text-white/55 text-sm mt-0.5 leading-snug">
                Browse the menu, place orders & track your food
              </p>
            </div>
            <div className="text-white/30 group-hover:text-[#D9A441] transition-colors duration-300 flex-shrink-0">
              {selecting === "customer" ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          </div>
        </button>

        {/* Admin Card */}
        <button
          onClick={() => handleSelect("admin")}
          disabled={selecting !== null}
          className={`
            group w-full rounded-2xl p-5 text-left transition-all duration-300
            bg-white/5 border border-white/10 backdrop-blur-sm
            hover:bg-white/10 hover:border-[#D9A441]/30 hover:shadow-xl hover:scale-[1.02]
            active:scale-[0.99]
            ${selecting === "admin" ? "scale-[0.99] opacity-80" : ""}
          `}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-3xl shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              🏪
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-white/80 leading-tight">Restaurant Login</h3>
              <p className="text-white/40 text-sm mt-0.5 leading-snug">
                Manage orders, menu & restaurant operations
              </p>
            </div>
            <div className="text-white/25 group-hover:text-white/60 transition-colors duration-300 flex-shrink-0">
              {selecting === "admin" ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          </div>
        </button>
      </div>

      {/* Footer note */}
      <p className="relative z-10 text-white/25 text-xs text-center mt-10">
        You can switch between experiences from Settings
      </p>
    </div>
  );
}
