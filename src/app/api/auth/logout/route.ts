import { NextResponse } from "next/server";
import { clearSession } from "@/lib/services/authService";

export async function POST() {
  await clearSession();
  return NextResponse.json({ success: true });
}
