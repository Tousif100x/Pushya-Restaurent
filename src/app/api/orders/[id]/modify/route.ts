import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { notificationProvider } from "@/lib/notifications";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { modifications } = await req.json();

    // modifications is an array of { itemId: string, status: string, replacedWith: string | null }

    // Use a transaction to update the order status and all item statuses
    const order = await prisma.$transaction(async (tx) => {
      // Update the main order status to MODIFICATION_REQUESTED
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: "MODIFICATION_REQUESTED" },
        include: { user: { select: { fcmTokens: true } } },
      });

      // Update each modified item
      for (const mod of modifications) {
        await tx.orderItem.update({
          where: { id: mod.itemId },
          data: {
            status: mod.status,
            replacedWith: mod.replacedWith,
          },
        });
      }

      return updatedOrder;
    });

    // Send push notification to customer
    try {
      const customerTokens = (order.user as any)?.fcmTokens || [];
      if (customerTokens.length > 0) {
        notificationProvider.initBackend();
        await notificationProvider.sendToTokens(customerTokens, {
          title: "⚠️ Action Needed on Your Order",
          body: "The restaurant has a modification to suggest for your order. Tap to review.",
          url: `/order/${id}`,
          data: { orderId: id, url: `/order/${id}` },
        });
      }
    } catch (notifErr) {
      console.error("Customer modification push failed:", notifErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Order modification error:", error);
    return NextResponse.json({ success: false, error: "Failed to modify order" }, { status: 500 });
  }
}
