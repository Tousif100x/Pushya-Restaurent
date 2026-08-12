import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { notificationProvider } from "@/lib/notifications";

// Human-readable status messages to send to customers
const CUSTOMER_STATUS_MESSAGES: Record<string, { title: string; body: string }> = {
  APPROVED: {
    title: "✅ Order Accepted!",
    body: "Great news! Pushya Planet has accepted your order and is preparing it now.",
  },
  MODIFICATION_REQUESTED: {
    title: "⚠️ Action Needed on Your Order",
    body: "The restaurant has a modification to suggest for your order. Please check the app.",
  },
  PREPARING: {
    title: "👨‍🍳 Cooking in Progress!",
    body: "Your food is being prepared. Won't be long now!",
  },
  READY_FOR_DELIVERY: {
    title: "📦 Order Ready!",
    body: "Your order is packed and ready. Our delivery partner is picking it up.",
  },
  OUT_FOR_DELIVERY: {
    title: "🛵 On the Way!",
    body: "Your order is out for delivery. Get ready to enjoy!",
  },
  DELIVERED: {
    title: "🎉 Order Delivered!",
    body: "Your order has been delivered. Enjoy your meal! Rate us on Google Maps.",
  },
  CANCELLED_BY_RESTAURANT: {
    title: "❌ Order Cancelled",
    body: "Unfortunately, the restaurant had to cancel your order. Please call us for details.",
  },
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Fetch order error:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, modificationNote, paymentStatus, paidAmount, paidAt, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    // --- SECURITY RESTRICTION: Only customer can mark order as DELIVERED ---
    if (status === "DELIVERED") {
      const cookieStore = await cookies();
      const adminAuthCookie = cookieStore.get("adminAuth")?.value;
      const roleHeader = req.headers.get("x-user-role");

      if (adminAuthCookie === "true" || roleHeader === "admin" || roleHeader === "ADMIN") {
        return NextResponse.json(
          { error: "Only the customer can mark an order as DELIVERED." },
          { status: 403 }
        );
      }
    }

    // Build the update payload
    const updateData: any = {};
    if (status !== undefined)             updateData.status = status;
    if (modificationNote !== undefined)   updateData.modificationNote = modificationNote;
    if (paymentStatus !== undefined)      updateData.paymentStatus = paymentStatus;
    if (paidAmount !== undefined)         updateData.paidAmount = paidAmount;
    if (paidAt !== undefined)             updateData.paidAt = new Date(paidAt);
    if (razorpayOrderId !== undefined)    updateData.razorpayOrderId = razorpayOrderId;
    if (razorpayPaymentId !== undefined)  updateData.razorpayPaymentId = razorpayPaymentId;
    if (razorpaySignature !== undefined)  updateData.razorpaySignature = razorpaySignature;

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { user: { select: { fcmTokens: true } } },
    });

    // Send push notification to customer if status changed and customer is registered
    if (status && CUSTOMER_STATUS_MESSAGES[status]) {
      try {
        const customerTokens = (order.user as any)?.fcmTokens || [];
        if (customerTokens.length > 0) {
          notificationProvider.initBackend();
          const msg = CUSTOMER_STATUS_MESSAGES[status];
          await notificationProvider.sendToTokens(customerTokens, {
            title: msg.title,
            body: msg.body,
            url: `/order/${id}`,
            data: { orderId: id, url: `/order/${id}` },
          });
        }
      } catch (notifErr) {
        // Non-critical
        console.error("Customer push notification failed:", notifErr);
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
