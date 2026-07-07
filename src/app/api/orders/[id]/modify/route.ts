import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { modifications } = await req.json();

    // modifications is an array of { itemId: string, status: string, replacedWith: string | null }

    // Use a transaction to update the order status and all item statuses
    await prisma.$transaction(async (tx) => {
      // Update the main order status to MODIFICATION_REQUESTED
      await tx.order.update({
        where: { id: params.id },
        data: { status: "MODIFICATION_REQUESTED" }
      });

      // Update each modified item
      for (const mod of modifications) {
        await tx.orderItem.update({
          where: { id: mod.itemId },
          data: {
            status: mod.status,
            replacedWith: mod.replacedWith
          }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Order modification error:", error);
    return NextResponse.json({ success: false, error: "Failed to modify order" }, { status: 500 });
  }
}
