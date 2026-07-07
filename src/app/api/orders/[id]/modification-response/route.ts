import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { action } = await req.json(); // 'accept' | 'continue_without' | 'cancel'

    const order = await prisma.order.findUnique({
      where: { id: id },
      include: { items: true }
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      if (action === 'cancel') {
        await tx.order.update({
          where: { id: params.id },
          data: { status: 'CANCELLED' }
        });
        return;
      }

      // Both 'accept' and 'continue_without' result in order approval, but we need to adjust total price
      let newTotal = order.totalAmount;
      let newItemsData = [...order.items];

      if (action === 'continue_without') {
        // Remove unavailable items and subtract their price
        const availableItems = order.items.filter(i => i.status !== 'UNAVAILABLE');
        const removedItems = order.items.filter(i => i.status === 'UNAVAILABLE');
        
        const amountToSubtract = removedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        newTotal = Math.max(0, order.totalAmount - amountToSubtract);
        
        // Remove them from DB
        for (const item of removedItems) {
          await tx.orderItem.delete({ where: { id: item.id } });
        }
      } else if (action === 'accept') {
        // Here we just mark the order as APPROVED.
        // We assume the replacement price is the same as the original item price to keep it simple.
        // In a complex app, we'd adjust the price based on the replacement item.
        for (const item of order.items.filter(i => i.status === 'UNAVAILABLE')) {
          await tx.orderItem.update({
            where: { id: item.id },
            data: { itemName: `[Replaced] ${item.replacedWith || item.itemName}` } // Just so it shows up correctly
          });
        }
      }

      await tx.order.update({
        where: { id: params.id },
        data: { 
          status: 'APPROVED',
          totalAmount: newTotal
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Modification response error:", error);
    return NextResponse.json({ success: false, error: "Failed to respond" }, { status: 500 });
  }
}
