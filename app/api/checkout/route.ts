import Stripe from "stripe";
import prisma from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST(req: NextRequest) {
  // Authenticate User
  const session = await getServerSession(authOptions);
  if (!session?.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 400 });
  }

  /// Parse cart from req
  const { cart } = await req.json();
  if (!Array.isArray(cart) || cart.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Get user from DB
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Fetch product info & build order items
  let totalAmount = 0;
  const orderItems = await Promise.all(
    cart.map(async (item: any) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) throw new Error("Product not found");
      totalAmount += product.price * item.quantity;
      return {
        name: item.name,
        productId: product.id,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        price: product.price,
        stripePriceId: product.stripePriceId,
        image: product.images?.[0] || null,
      };
    })
  );

  // Create Order and OrderItems in DB (status: pending)
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      totalAmount,
      status: "pending",
      orderItems: {
        create: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          price: item.price,
        })),
      },
    },
    include: { orderItems: true },
  });

  // Build Stripe line items
  const line_items = orderItems.map((item) => ({
    price_data: {
      currency: "cad",
      product_data: {
        name: item.name,
        description:
          [
            item.color ? `Color: ${item.color}` : null,
            item.size ? `Size: ${item.size}` : null,
          ]
            .filter(Boolean)
            .join(" | ") || undefined,
        images: item.image ? [item.image] : [],
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  // Create Stripe checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items,
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
    metadata: {
      userId: user.id,
      orderId: order.id,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
