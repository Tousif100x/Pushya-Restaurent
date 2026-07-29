import { NextResponse } from "next/server";
import { getSession } from "@/lib/services/authService";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const addresses = await prisma.address.findMany({
      where: { userId: session.id as string },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Fetch addresses error:", error);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      label,
      formattedAddress,
      houseNumber,
      flat,
      floor,
      apartment,
      landmark,
      instructions,
      latitude,
      longitude,
      isDefault,
    } = body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.id as string, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: session.id as string,
        label: label || "Home",
        formattedAddress,
        houseNumber,
        flat,
        floor,
        apartment,
        landmark,
        instructions,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        isDefault: isDefault ?? true,
      },
    });

    return NextResponse.json({ success: true, address });
  } catch (error) {
    console.error("Create address error:", error);
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
  }
}
