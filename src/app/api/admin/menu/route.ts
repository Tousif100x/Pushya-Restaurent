import { NextResponse } from "next/server";
import { getSession } from "@/lib/services/authService";
import prisma from "@/lib/prisma";

// Helper slug generator
function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// GET all menu items for Admin (includes inactive & category details)
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ products, categories });
  } catch (error) {
    console.error("Admin Menu GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 });
  }
}

// POST create new menu product
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, categoryId, price, description, image, isVeg, isSignature, isActive } = body;

    if (!name || !categoryId || price === undefined) {
      return NextResponse.json({ error: "Name, category, and price are required" }, { status: 400 });
    }

    let slug = generateSlug(name);
    // Ensure unique slug
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        categoryId,
        price: parseFloat(price),
        description: description || null,
        image: image || null,
        isVeg: isVeg ?? true,
        isSignature: isSignature ?? false,
        isActive: isActive ?? true,
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Admin Menu POST Error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
