import Stripe from "stripe";
import prisma from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { CartItem } from "@/components/CartContext";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://www.nsanity.shop"
    : "http://localhost:3000";

export async function POST(req: NextRequest) {
  function generateOrderCode() {
    // Example: NS-20240528-123456
    const date = new Date();
    const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(100000 + Math.random() * 900000);
    return `NS-${yyyymmdd}-${random}`;
  }

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
    cart.map(async (item: CartItem) => {
      if (
        !item.color ||
        !item.size ||
        item.color.trim() === "" ||
        item.size.trim() === ""
      ) {
        throw new Error("Each cart item must have a color and size");
      }

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

  const orderCode = generateOrderCode();

  // Create Order and OrderItems in DB (status: pending)
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      totalAmount,
      status: "pending",
      orderCode,
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

  // Stripe Customer Logic
  let stripeCustomerId = user.stripeCustomerId;
  if (!stripeCustomerId) {
    // Create Stripe customer if nonexistent
    const customer = await stripe.customers.create({
      email: user.email!,
      name: user.name || undefined,
      metadata: { userId: user.id },
    });
    stripeCustomerId = customer.id;

    //Save to DB
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId },
    });
  }

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
    customer: stripeCustomerId,
    line_items,
    mode: "payment",
    success_url: `${BASE_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_URL}/cart`,
    metadata: {
      userId: user.id,
      orderId: order.id,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
