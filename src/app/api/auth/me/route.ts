import { NextResponse } from "next/server";
import { getSession, clearSession } from "@/lib/services/authService";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id as string },
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        addresses: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        },
        createdAt: true,
      },
    });

    if (!user) {
      await clearSession();
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, user });
  } catch (error) {
    console.error("me API error:", error);
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
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { name } = data;

    const updatedUser = await prisma.user.update({
      where: { id: session.id as string },
      data: {
        name: name !== undefined ? name : undefined,
      },
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        addresses: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
