import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, setSession } from "@/lib/services/authService";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password)
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const valid = await verifyPassword(password, admin.password);
    if (!valid)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    // Set admin session with ADMIN role
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
