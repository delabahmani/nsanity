/* eslint-disable @typescript-eslint/no-unused-vars */
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from "@/lib/prismadb";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      phone: true,
      addresses: true,
      createdAt: true,
      isAdmin: true,
      wishlist: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...user,
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, phone, address } = await req.json();

    // Validate input
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters long" },
        { status: 400 }
      );
    }

    // Get user to check existing addresses
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { addresses: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user profile
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name.trim(),
        phone: phone || null,
      },
    });

    // Handle address update/creation if provided
    if (
      address &&
      address.address1 &&
      address.city &&
      address.postalCode &&
      address.country
    ) {
      const existingAddress = await prisma.address.findFirst({
        where: {
          userId: user.id,
          address1: address.address1,
          city: address.city,
          postalCode: address.postalCode,
        },
      });

      if (!existingAddress) {
        await prisma.address.create({
          data: {
            userId: user.id,
            address1: address.address1,
            address2: address.address2 || null,
            city: address.city,
            state: address.state || null,
            postalCode: address.postalCode,
            country: address.country,
            isDefault: user.addresses.length === 0,
          },
        });
      } else if (address.setAsDefault) {
        await prisma.address.updateMany({
          where: { userId: user.id },
          data: { isDefault: false },
        });

        // Set this one as default
        await prisma.address.update({
          where: { id: existingAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
