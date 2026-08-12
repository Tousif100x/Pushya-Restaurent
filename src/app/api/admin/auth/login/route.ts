import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, setSession } from "@/lib/services/authService";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password)
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    // HARDCODED UNCHANGEABLE ADMIN ACCOUNTS
    const HARDCODED_ADMINS: Record<string, { name: string; passwords: string[] }> = {
      "tousif@gmail.com": { name: "Tousif Admin", passwords: ["admin369"] },
      "pushya@admin.com": { name: "Pushya Admin", passwords: ["admin369", "pushya369"] },
    };

    const hardcoded = HARDCODED_ADMINS[cleanEmail];
    if (hardcoded) {
      if (!hardcoded.passwords.includes(cleanPassword)) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      await setSession({ id: cleanEmail, phone: cleanEmail, name: hardcoded.name, role: "ADMIN" });

      return NextResponse.json({
        success: true,
        admin: { id: cleanEmail, email: cleanEmail, name: hardcoded.name, role: "ADMIN" },
      });
    }

    // Fallback DB check for any other admin account
    const admin = await prisma.admin.findUnique({ where: { email: cleanEmail } });
    if (!admin)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const valid = await verifyPassword(cleanPassword, admin.password);
    if (!valid)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    await setSession({ id: admin.id, phone: admin.email, name: admin.name, role: "ADMIN" });

    return NextResponse.json({
      success: true,
      admin: { id: admin.id, email: admin.email, name: admin.name, role: "ADMIN" },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
