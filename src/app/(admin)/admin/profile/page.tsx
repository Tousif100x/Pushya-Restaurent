"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Lock, LogOut, ArrowLeft, Shield, Store, Bell, Check } from "lucide-react";
import Link from "next/link";

export default function AdminProfilePage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [notificationStatus, setNotificationStatus] = useState<string>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationStatus(Notification.permission);
    }
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Admin password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Failed to change password");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("pushya_app_role");
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out successfully");
    router.push("/");
  };

  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setNotificationStatus(perm);
    if (perm === "granted") {
      toast.success("Push notifications enabled!");
    } else {
      toast.error("Notification permission denied");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#10261B]">
            Restaurant Profile & Account
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Admin account security and preferences
          </p>
        </div>
        <Button
          variant="outline"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>

      {/* Account Info */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-serif flex items-center gap-2 text-[#10261B]">
            <Shield className="w-5 h-5 text-[#D9A441]" /> Account Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <Label className="text-xs text-muted-foreground uppercase">Login Email</Label>
            <p className="font-semibold text-base text-[#10261B]">admin@pushya.com</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase">Role Access</Label>
            <p className="font-semibold text-sm text-green-700 flex items-center gap-1.5 mt-0.5">
              <Check className="w-4 h-4 text-green-600" /> Restaurant Administrator (Full Access)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Form */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-serif flex items-center gap-2 text-[#10261B]">
            <Lock className="w-5 h-5 text-[#D9A441]" /> Change Admin Password
          </CardTitle>
          <CardDescription>Update your password to keep the admin panel secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPass">Current Password</Label>
              <Input
                id="currentPass"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="newPass">New Password (min 6 chars)</Label>
                <Input
                  id="newPass"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPass">Confirm New Password</Label>
                <Input
                  id="confirmPass"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={savingPassword}
              className="bg-[#10261B] text-white hover:bg-[#10261B]/90 mt-2"
            >
              {savingPassword ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-serif flex items-center gap-2 text-[#10261B]">
            <Bell className="w-5 h-5 text-[#D9A441]" /> Notification Preferences
          </CardTitle>
          <CardDescription>Configure order alert notifications for this device.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">Browser Push Notifications</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Status: <span className="font-bold capitalize">{notificationStatus}</span>
            </p>
          </div>
          <Button
            variant="outline"
            className="border-[#10261B]/20 text-[#10261B]"
            onClick={requestNotificationPermission}
          >
            {notificationStatus === "granted" ? "Permission Granted ✓" : "Enable Push Notifications"}
          </Button>
        </CardContent>
      </Card>

      {/* Experience Switcher */}
      <Card className="border-[#D9A441]/30 bg-[#D9A441]/5">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-sm text-[#10261B]">Switch Experience Mode</p>
            <p className="text-xs text-muted-foreground">Return to Welcome Entry Screen</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem("pushya_app_role");
              router.push("/");
            }}
          >
            Switch Mode
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
