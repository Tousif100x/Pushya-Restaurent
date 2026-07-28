import { NextResponse } from "next/server";

/**
 * Public endpoint that returns Firebase CLIENT config (safe to expose).
 * The Service Worker fetches this on install so it never needs config in URL params.
 */
export async function GET() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // If not configured, return an empty object so SW handles it gracefully
  if (!config.apiKey) {
    return NextResponse.json({}, { status: 200 });
  }

  return NextResponse.json(config, {
    headers: {
      // Cache for 5 minutes - the SW will re-fetch on each install
      "Cache-Control": "public, max-age=300",
    },
  });
}
