import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, setSession } from "@/lib/services/authService";

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password)
      return NextResponse.json({ error: "Phone and password are required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user)
      return NextResponse.json({ error: "No account found with this phone number. Please register first." }, { status: 404 });

    const valid = await verifyPassword(password, user.password);
    if (!valid)
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });

    await setSession({ id: user.id, phone: user.phone, name: user.name, role: user.role });
    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, phone: user.phone, role: user.role } });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
