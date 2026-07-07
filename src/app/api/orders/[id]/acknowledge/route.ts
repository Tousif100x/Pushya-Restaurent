import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const order = await prisma.order.update({
      where: { id: resolvedParams.id },
      data: { isAcknowledged: true }
    });
    
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Error acknowledging order:", error);
    return NextResponse.json({ success: false, error: "Failed to acknowledge order" }, { status: 500 });
  }
}
