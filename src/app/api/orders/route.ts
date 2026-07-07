import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, customerName, customerPhone, customerAddress, latitude, longitude, distanceKm, totalAmount, deliveryFee, items } = body;

    const order = await prisma.order.create({
      data: {
        userId,
        customerName,
        customerPhone,
        customerAddress,
        latitude,
        longitude,
        distanceKm,
        totalAmount,
        deliveryFee,
        status: "PENDING",
        items: {
          create: items.map((item: any) => ({
            itemId: item.id,
            itemName: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const orders = await prisma.order.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
