import { NextResponse } from "next/server";
import { getSession } from "@/lib/services/authService";
import prisma from "@/lib/prisma";

/**
 * POST /api/auth/fcm-token
 * Register or refresh an FCM token for a logged-in customer.
 * This allows sending push notifications to the customer when
 * their order status changes.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.id) {
      // Allow anonymous token registration with a phone number
      const body = await req.json();
      const { token, phone } = body;

      if (!token) {
        return NextResponse.json({ error: "FCM token required" }, { status: 400 });
      }

      // If phone provided, try to find the user and save token
      if (phone) {
        const user = await prisma.user.findUnique({ where: { phone } });
        if (user) {
          const tokens = Array.from(new Set([...user.fcmTokens, token])).slice(-5);
          await prisma.user.update({
            where: { id: user.id },
            data: { fcmTokens: tokens },
          });
          return NextResponse.json({ success: true, message: "Token registered" });
        }
      }

      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "FCM token required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id as string },
      select: { fcmTokens: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Add token, deduplicate, keep last 5 (one per device)
    const tokens = Array.from(new Set([...user.fcmTokens, token])).slice(-5);

    await prisma.user.update({
      where: { id: session.id as string },
      data: { fcmTokens: tokens },
    });

    return NextResponse.json({ success: true, message: "FCM token registered" });
  } catch (error) {
    console.error("FCM token registration error:", error);
    return NextResponse.json({ error: "Failed to register FCM token" }, { status: 500 });
  }
}

/**
 * DELETE /api/auth/fcm-token
 * Remove an FCM token (e.g., on logout)
 */
export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { token } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.id as string },
      select: { fcmTokens: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedTokens = token
      ? user.fcmTokens.filter((t) => t !== token)
      : [];

    await prisma.user.update({
      where: { id: session.id as string },
      data: { fcmTokens: updatedTokens },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("FCM token removal error:", error);
    return NextResponse.json({ error: "Failed to remove FCM token" }, { status: 500 });
  }
}
