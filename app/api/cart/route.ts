/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prismadb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ cart: [] });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { cart: true, email: true },
    });

    if (!user || !user.cart || user.cart.length === 0) {
      return NextResponse.json({ cart: [] });
    }

    // Parse cart items from database
    const cartItems = [];
    for (const cartItemStr of user.cart) {
      try {
        const cartItem = JSON.parse(cartItemStr);
        cartItems.push(cartItem);
      } catch (error) {
      }
    }

    return NextResponse.json({ cart: cartItems });
  } catch (error) {
    return NextResponse.json({ cart: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cart } = await req.json();

    // Convert cart items to strings for storage
    const cartStrings = cart.map((item: Record<string, unknown>) =>
      JSON.stringify(item)
    );

    await prisma.user.update({
      where: { email: session.user.email },
      data: { cart: cartStrings },
      select: { email: true, cart: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save cart" }, { status: 500 });
  }
}
