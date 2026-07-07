import { NextResponse } from "next/server";
import { getSession, clearSession } from "@/lib/services/authService";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) {
      await clearSession();
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, user });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { name, defaultAddress, landmark, alternateLandmark } = data;

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: {
        name: name !== undefined ? name : undefined,
        defaultAddress: defaultAddress !== undefined ? defaultAddress : undefined,
        landmark: landmark !== undefined ? landmark : undefined,
        alternateLandmark: alternateLandmark !== undefined ? alternateLandmark : undefined,
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
