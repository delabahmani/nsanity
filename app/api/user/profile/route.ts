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
      address: true,
      createdAt: true,
      isAdmin: true,
      wishlist: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Parse address
  let parsedAddress = null;
  if (user.address) {
    try {
      parsedAddress =
        typeof user.address === "string"
          ? JSON.parse(user.address)
          : user.address;
    } catch (e) {
      console.error("Error parsing address:", e);
    }
  }

  return NextResponse.json({
    ...user,
    address: parsedAddress,
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

    // Update user profile
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name.trim(),
        phone: phone || null,
        address: address ? JSON.stringify(address) : null,
      },
    });

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
