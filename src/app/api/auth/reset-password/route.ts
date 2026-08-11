import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { phone, newPassword } = await req.json();

    if (!phone || !newPassword) {
      return NextResponse.json(
        { error: "Phone number and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, "");

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ phone: cleanPhone }, { phone: `+91${cleanPhone}` }],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this phone number" },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully! Please sign in.",
    });
  } catch (error: any) {
    console.error("Customer password reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
