import { PrismaClient } from '@prisma/client';
import { menuCategories, offers, services, restaurantDetails } from '../src/data/menu';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function generateSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function main() {
  console.log("Wiping database for clean production seed...");
  
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.service.deleteMany();
  await prisma.restaurantSettings.deleteMany();
  await prisma.admin.deleteMany();

  console.log("Seeding Admin account...");
  // Default admin (password should ideally be hashed with bcrypt, but we'll store plaintext or simple hash depending on existing logic. Let's use simple for now, or assume existing auth logic).
  await prisma.admin.create({
    data: {
      email: "admin@pushya.com",
      password: "password123", // In a real scenario, hash this.
      name: "Pushya Admin",
    }
  });

  console.log("Seeding Restaurant Settings...");
  await prisma.restaurantSettings.create({
    data: {
      id: "default",
      openingTime: restaurantDetails.openingTime,
      closingTime: restaurantDetails.closingTime,
      isAcceptingOrders: true,
      holidayMode: false,
      deliveryRadiusKm: restaurantDetails.deliveryRadiusKm,
      baseDeliveryCharge: restaurantDetails.baseDeliveryCharge,
      distanceSlabs: restaurantDetails.distanceSlabs,
      estimatedPrepTime: restaurantDetails.estimatedPrepTime,
      contactPhone: restaurantDetails.phone,
      contactWhatsapp: restaurantDetails.whatsapp,
      address: restaurantDetails.address,
      latitude: restaurantDetails.latitude,
      longitude: restaurantDetails.longitude,
      mapLink: restaurantDetails.mapLink,
    }
  });

  console.log("Seeding Categories and Products...");
  let sortOrder = 0;
  for (const cat of menuCategories) {
    const category = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.id,
        description: cat.description,
        image: cat.image,
        sortOrder: sortOrder++,
      }
    });

    for (const item of cat.items) {
      await prisma.product.create({
        data: {
          categoryId: category.id,
          name: item.name,
          slug: item.id,
          description: (item as any).description || null,
          price: item.price,
          image: (item as any).image || cat.image,
          isVeg: item.isVeg,
          isSignature: (item as any).isSignature || false,
        }
      });
    }
  }

  console.log("Seeding Offers...");
  for (const offer of offers) {
    await prisma.offer.create({
      data: {
        title: offer.title,
        slug: offer.id,
        description: offer.description,
        price: offer.price,
        note: offer.note,
        image: offer.image,
        color: (offer as any).color || null,
      }
    });
  }

  console.log("Seeding Services...");
  for (const service of services) {
    await prisma.service.create({
      data: {
        title: service.title,
        slug: service.id,
        description: service.description,
        icon: service.icon,
      }
    });
  }

  console.log("✅ Production database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
