import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { isAcknowledged: true }
    });
    
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Error acknowledging order:", error);
    return NextResponse.json({ success: false, error: "Failed to acknowledge order" }, { status: 500 });
  }
}
