import { NextResponse } from "next/server";
import { notificationProvider } from "@/lib/notifications";
import { FirebaseNotificationProvider } from "@/lib/notifications/firebase-provider";
import prisma from "@/lib/prisma";

/**
 * GET /api/admin/firebase-status
 * Diagnostic endpoint — verifies Firebase Admin init and DB token storage.
 * Remove or protect this in production after testing.
 */
export async function GET() {
  const results: Record<string, any> = {};

  // 1. Check env vars
  results.env = {
    FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
    NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_VAPID_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
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
    const admin = await prisma.admin.findFirst({
      select: { id: true, email: true, name: true, fcmTokens: true },
    });
    results.admin = admin
      ? {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          tokenCount: admin.fcmTokens.length,
          // Show only first 20 chars of each token for security
          tokenPreviews: admin.fcmTokens.map((t) => `${t.substring(0, 20)}...`),
        }
      : "No admin found in database";
  } catch (error: any) {
    results.admin = `DB error: ${error.message}`;
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

    const admin = await prisma.admin.findFirst();
    if (!admin || !admin.fcmTokens.length) {
      return NextResponse.json({
        success: false,
        error: "No admin FCM tokens found. Open admin dashboard first to register the device.",
      });
    }

    const sent = await notificationProvider.sendToTokens(admin.fcmTokens, {
      title: "🧪 Test Notification",
      body: "Firebase push is working! This is a test from Pushya Planet.",
      url: "/admin/dashboard",
      data: { orderId: "test-123", url: "/admin/dashboard" },
    });

    return NextResponse.json({
      success: sent,
      tokenCount: admin.fcmTokens.length,
      message: sent
        ? "Test notification sent successfully!"
        : "Failed to send — check server logs for details.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
