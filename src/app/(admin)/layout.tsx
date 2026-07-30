"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, UtensilsCrossed, Settings, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("pushya_app_role");
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Menu", href: "/admin/menu", icon: UtensilsCrossed },
    { label: "Settings", href: "/admin/settings", icon: Settings },
    { label: "Profile", href: "/admin/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Admin Top Bar */}
      <header className="bg-[#10261B] text-white h-14 flex items-center px-4 justify-between shadow-md sticky top-0 z-50">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <Image
            src="/images/brand_logo.png"
            alt="Pushya Planet"
            width={32}
            height={32}
            className="rounded-full border border-white/20"
          />
          <div>
            <span className="font-serif font-bold text-sm text-white">Pushya</span>
            <span className="font-serif font-bold text-sm text-[#D9A441] ml-1">Admin</span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  active
                    ? "bg-[#D9A441] text-[#10261B]"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-white/80 hover:text-white hover:bg-red-500/20 h-8 w-8"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
