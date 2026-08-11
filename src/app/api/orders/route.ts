import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { notificationProvider } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      userId, customerName, customerPhone, customerAddress, 
      formattedAddress, houseNumber, flat, floor, apartment,
      landmark, deliveryInstructions,
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
        flat,
        floor,
        apartment,
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

    // --- Trigger Instant Telegram Alert to Restaurant Owner Phone ---
    try {
      const orderNum = order.id.slice(-6).toUpperCase();
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pushya-restaurent.vercel.app";
      const trackingUrl = `${baseUrl}/order/${order.id}`;

      await (notificationProvider as any).sendOrderAlert({
        orderNum,
        customerName,
        customerPhone,
        totalAmount,
        itemsCount: items.length,
        address: formattedAddress || customerAddress,
        items: items.map((i: any) => ({ name: i.name, quantity: i.quantity, price: i.price })),
        trackingUrl,
      });

      // Also trigger push via notificationProvider sendToTokens if configured
      await notificationProvider.sendToTokens([], {
        title: `🚨 New Order #${orderNum}!`,
        body: `${customerName} ordered ${items.length} items (₹${totalAmount})`,
        url: `/admin/dashboard`,
      });
    } catch (notifError) {
      console.error("Telegram notification alert error (non-critical):", notifError);
    }

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
