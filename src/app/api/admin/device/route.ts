import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Since we only have a default admin for now, we'll find the first admin and add the token.
    // In a real scenario, this would check session/JWT for the specific admin ID.
    const admin = await prisma.admin.findFirst();
    
    if (admin) {
      // Check if token already exists to avoid duplicates
      if (!admin.fcmTokens.includes(token)) {
        await prisma.admin.update({
          where: { id: admin.id },
          data: {
            fcmTokens: {
              push: token
            }
          }
        });
      }
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

  } catch (error) {
    console.error('Error saving device token:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
