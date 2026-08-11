import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { notificationProvider } from "@/lib/notifications";
import { FirebaseNotificationProvider } from "@/lib/notifications/firebase-provider";

/**
 * POST /api/admin/notify-pending
 * Called by OrderAlarmSystem every 90 seconds when there are unacknowledged
 * pending orders. Sends a FCM push notification to all admin devices so the
 * owner is reminded even when the phone is locked or the app is closed.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({ count: 1 }));
    const count = body.count ?? 1;

    // Fetch all admin FCM tokens
    const admins = await prisma.admin.findMany({
      select: { fcmTokens: true },
    });

    const allTokens = admins.flatMap((a) => a.fcmTokens).filter(Boolean);

    if (!allTokens.length) {
      return NextResponse.json({
        success: false,
        message: "No admin FCM tokens registered. Open the admin dashboard once to register your device.",
      });
    }

    // Initialize Firebase Admin and send push
    (notificationProvider as FirebaseNotificationProvider).initBackend();

    const title = count > 1
      ? `🚨 ${count} Orders Waiting!`
      : "🚨 New Order Waiting!";

    const bodyText = count > 1
      ? `${count} orders are still pending your response. Tap to open the dashboard.`
      : "You have a pending order waiting for your response. Tap to accept or reject.";

    const sent = await notificationProvider.sendToTokens(allTokens, {
      title,
      body: bodyText,
      url: "/admin/dashboard",
      data: {
        url: "/admin/dashboard",
        type: "pending_reminder",
      },
    });

    return NextResponse.json({ success: sent, tokenCount: allTokens.length });
  } catch (error: any) {
    console.error("[notify-pending] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
