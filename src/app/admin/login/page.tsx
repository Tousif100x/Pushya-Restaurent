"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      localStorage.setItem("adminAuth", "true");
      router.push("/admin/dashboard");
    } else {
      setError("Invalid password");
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-forest-soft p-3 rounded-full w-fit mb-4">
            <Lock className="h-6 w-6 text-forest" />
          </div>
          <CardTitle className="font-serif text-2xl text-forest">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
              />
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            </div>
            <Button type="submit" className="w-full bg-forest hover:bg-forest-soft h-12 text-lg">
              Login
            </Button>
            <p className="text-xs text-center text-muted-foreground pt-4">
              Authorized personnel only. (Hint: admin123)
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
