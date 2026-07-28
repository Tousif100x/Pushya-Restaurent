import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.restaurantSettings.findFirst({
      where: { id: "default" },
    });

    if (!settings) {
      // Return defaults if not seeded yet
      return NextResponse.json({
        openingTime: "10:00 AM",
        closingTime: "10:00 PM",
        isAcceptingOrders: true,
        holidayMode: false,
        deliveryRadiusKm: 4,
        baseDeliveryCharge: 20,
        distanceSlabs: [{ maxKm: 2, charge: 20 }, { maxKm: 4, charge: 40 }],
        estimatedPrepTime: "25-30 mins",
        contactPhone: "9098382993",
        contactWhatsapp: "9098382993",
        address: "Shri Krishna Paradise, Near, Rau Cir, Rau, Indore",
        latitude: 22.6378,
        longitude: 75.8073,
        mapLink: "https://maps.google.com/?q=Pushya+Pizza+and+Sandwich+Planet+Rau",
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const settings = await prisma.restaurantSettings.upsert({
      where: { id: "default" },
      update: body,
      create: { id: "default", ...body },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
