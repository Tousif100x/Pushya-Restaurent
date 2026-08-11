import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Save token to all Admin accounts so notifications reach any logged-in admin device
    const admins = await prisma.admin.findMany();

    if (admins.length > 0) {
      for (const admin of admins) {
        if (!admin.fcmTokens.includes(token)) {
          // Add token, deduplicate, keep last 5
          const updatedTokens = Array.from(new Set([...admin.fcmTokens, token])).slice(-5);
          await prisma.admin.update({
            where: { id: admin.id },
            data: { fcmTokens: updatedTokens },
          });
        }
      }
      return NextResponse.json({ success: true, message: "Token registered to admin accounts" });
    } else {
      return NextResponse.json({ error: "No admin accounts found" }, { status: 404 });
    }
  } catch (error: any) {
    console.error("Error saving admin device token:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
