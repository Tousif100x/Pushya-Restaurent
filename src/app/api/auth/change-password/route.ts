import { NextResponse } from "next/server";
import { getSession, hashPassword, verifyPassword } from "@/lib/services/authService";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new password are required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
    }

    if (session.role === "ADMIN") {
      const admin = await prisma.admin.findUnique({ where: { id: session.id as string } });
      if (!admin) return NextResponse.json({ error: "Admin account not found" }, { status: 404 });

      const isValid = await verifyPassword(currentPassword, admin.password);
      if (!isValid) return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });

      const hashed = await hashPassword(newPassword);
      await prisma.admin.update({
        where: { id: admin.id },
        data: { password: hashed },
      });

      return NextResponse.json({ success: true, message: "Admin password updated successfully" });
    } else {
      const user = await prisma.user.findUnique({ where: { id: session.id as string } });
      if (!user) return NextResponse.json({ error: "User account not found" }, { status: 404 });

      const isValid = await verifyPassword(currentPassword, user.password);
      if (!isValid) return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });

      const hashed = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed },
      });

      return NextResponse.json({ success: true, message: "Password updated successfully" });
    }
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
