import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { printfulService } from "@/lib/printful-service";
import prisma from "@/lib/prismadb";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json(
        { error: "You are not authorized to perform this action." },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const productId = resolvedParams.productId;

    // Get the product from database
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      console.log("Product not found in database!");
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!product.printfulSyncProductId) {
      console.log("Product has no Printful sync ID!");
      return NextResponse.json(
        { error: "Not a Printful product" },
        { status: 404 }
      );
    }

    // Fetch mockups from Printful with polling (waits up to 60 seconds)
    const mockups = await printfulService.generateProductMockups(
      product.printfulSyncProductId
    );

    if (mockups.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Mockups not ready yet. Please try again in a moment.",
        },
        { status: 202 }
      );
    }

    // Update product in database with new mockup images
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        images: mockups,
      },
    });

    // Update Stripe product with new mockup images
    if (product.stripeProductId) {
      await stripe.products.update(product.stripeProductId, {
        images: mockups.slice(0, 8), // Stripe allows max 8 images
      });
    }

    return NextResponse.json({
      success: true,
      mockups,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error fetching mockups:", error);
    return NextResponse.json(
      { error: "Failed to fetch mockups" },
      { status: 500 }
    );
  }
}
