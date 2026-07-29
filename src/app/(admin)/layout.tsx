"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("adminSession");
    // Clear session cookie via API
    fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      router.push("/admin/login");
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Admin Top Bar */}
      <header className="bg-[#10261B] text-white h-14 flex items-center px-4 gap-3 shadow-md sticky top-0 z-50">
        <Link href="/admin/dashboard" className="flex items-center gap-2 flex-1">
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

        <Link href="/admin/settings">
          <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10 h-9 w-9">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-white/80 hover:text-white hover:bg-red-500/20 h-9 w-9"
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
