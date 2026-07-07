import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      userId, customerName, customerPhone, customerAddress, 
      formattedAddress, houseNumber, landmark, deliveryInstructions,
      latitude, longitude, distanceKm, deliveryDistance, totalAmount, 
      deliveryFee, deliveryCharge, items 
    } = body;

    const order = await prisma.order.create({
      data: {
        userId,
        customerName,
        customerPhone,
        customerAddress,
        formattedAddress,
        houseNumber,
        landmark,
        deliveryInstructions,
        latitude,
        longitude,
        distanceKm,
        deliveryDistance,
        totalAmount,
        deliveryFee,
        deliveryCharge,
        status: "PENDING",
        isAcknowledged: false,
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
    const status = searchParams.get('status');
    const isAcknowledgedParam = searchParams.get('isAcknowledged');

    const whereClause: any = {};
    if (userId) whereClause.userId = userId;
    if (status) whereClause.status = status;
    if (isAcknowledgedParam !== null) {
      whereClause.isAcknowledged = isAcknowledgedParam === 'true';
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
