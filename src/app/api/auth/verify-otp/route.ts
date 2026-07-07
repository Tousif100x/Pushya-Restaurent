import { NextResponse } from "next/server";
import { verifyOTP, setSession } from "@/lib/services/authService";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP required" }, { status: 400 });
    }

    const isValid = await verifyOTP(phone, otp);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    }

    // Upsert User in DB
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({ data: { phone } });
    }

    // Create session (sets cookie)
    await setSession(user);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
