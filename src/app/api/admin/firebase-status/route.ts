import { NextResponse } from "next/server";
import { notificationProvider } from "@/lib/notifications";
import { FirebaseNotificationProvider } from "@/lib/notifications/firebase-provider";
import prisma from "@/lib/prisma";

/**
 * GET /api/admin/firebase-status
 * Diagnostic endpoint — verifies Firebase Admin init and DB token storage.
 */
export async function GET() {
  const results: Record<string, any> = {};

  // 1. Check env vars (or built-in fallbacks)
  results.env = {
    FIREBASE_PROJECT_ID: !!(process.env.FIREBASE_PROJECT_ID || "pushya-restaurant"),
    FIREBASE_CLIENT_EMAIL: !!(process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@pushya-restaurent.iam.gserviceaccount.com"),
    FIREBASE_PRIVATE_KEY: !!(process.env.FIREBASE_PRIVATE_KEY || "fallback_key"),
    NEXT_PUBLIC_FIREBASE_API_KEY: !!(process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBcEXNEVL_H1u5jeb72hw9hL_n00J24pC0"),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: !!(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "212682055583"),
    NEXT_PUBLIC_FIREBASE_VAPID_KEY: !!(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "BJGRbgixjv-ycj_9Ti92D5cddq72v0XRpsiHOxDQHq_2t9in15dy6oiI393fxsdFQPTlgwSXCr1VtIoQMq5aWec"),
  };

  // 2. Try to initialize Firebase Admin
  try {
    (notificationProvider as FirebaseNotificationProvider).initBackend();
    results.firebaseAdminInit = "success";
  } catch (error: any) {
    results.firebaseAdminInit = `error: ${error.message}`;
  }

  // 3. Check admin tokens in DB
  try {
    const admins = await prisma.admin.findMany({
      select: { id: true, email: true, name: true, fcmTokens: true },
    });
    results.admins = admins.map((admin) => ({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      tokenCount: admin.fcmTokens.length,
      tokenPreviews: admin.fcmTokens.map((t) => `${t.substring(0, 20)}...`),
    }));
  } catch (error: any) {
    results.admins = `DB error: ${error.message}`;
  }

  return NextResponse.json(results, { status: 200 });
}

/**
 * POST /api/admin/firebase-status
 * Send a test push notification to all registered admin devices.
 */
export async function POST() {
  try {
    (notificationProvider as FirebaseNotificationProvider).initBackend();

    const admins = await prisma.admin.findMany({
      select: { fcmTokens: true },
    });

    const allTokens = Array.from(new Set(admins.flatMap((a) => a.fcmTokens).filter(Boolean)));

    if (!allTokens.length) {
      return NextResponse.json({
        success: false,
        error: "No admin FCM tokens found in DB. Open admin dashboard on your device to register.",
      });
    }

    const sent = await notificationProvider.sendToTokens(allTokens, {
      title: "🧪 Test Push Notification",
      body: "Firebase push is working 100%! This is a test from Pushya Planet.",
      url: "/admin/dashboard",
      data: { orderId: "test-123", url: "/admin/dashboard" },
    });

    return NextResponse.json({
      success: sent,
      tokenCount: allTokens.length,
      message: sent
        ? "Test notification sent successfully!"
        : "Failed to send — check server logs for details.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
