// GET all products with admin data, POST to create
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from "@/lib/prismadb";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json(
        { error: "You are not authorized to perform this action." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const featured = searchParams.get("featured");

    const filter: any = {};

    if (featured === "true") {
      filter.isFeatured = true;
    } else if (featured === "false") {
      filter.isFeatured = false;
    }

    const products = await prisma.product.findMany({
      where: filter,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST to create a new product (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json(
        { error: "You are not authorized to perform this action." },
        { status: 403 }
      );
    }

    const {
      name,
      price,
      description,
      colors,
      categories,
      sizes,
      inStock,
      isFeatured,
      images,
    } = await req.json();

    const stripeProduct = await stripe.products.create({
      name,
      description,
      images: images && images.length > 0 ? images : undefined,
      metadata: {
        categories: categories ? categories.join(",") : "",
        colors: colors ? colors.join(",") : "",
        sizes: sizes ? sizes.join(",") : "",
      },
    });

    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(price * 100),
      currency: "cad",
    });

    const product = await prisma.product.create({
      data: {
        name,
        price,
        description,
        colors,
        categories,
        inStock,
        isFeatured,
        sizes,
        images,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);

    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
