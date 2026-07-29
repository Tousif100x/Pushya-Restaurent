import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, setSession } from "@/lib/services/authService";

export async function POST(req: Request) {
  try {
    const { name, phone, password } = await req.json();

    if (!phone || phone.length < 10)
      return NextResponse.json({ error: "Valid 10-digit phone number required" }, { status: 400 });
    if (!password || password.length < 6)
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    if (!name || name.trim().length < 2)
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing)
      return NextResponse.json({ error: "An account with this phone number already exists" }, { status: 409 });

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { phone, name: name.trim(), password: hashed, role: "USER" },
    });

    await setSession({ id: user.id, phone: user.phone, name: user.name, role: user.role });
    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, phone: user.phone, role: user.role } });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
