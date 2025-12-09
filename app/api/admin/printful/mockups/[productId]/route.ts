/* eslint-disable @typescript-eslint/no-unused-vars */
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { printfulService } from "@/lib/printful-service";
import prisma from "@/lib/prismadb";
import Stripe from "stripe";
import { UTApi } from "uploadthing/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

const utapi = new UTApi();

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
    const printfulMockups = await printfulService.generateProductMockups(
      product.printfulSyncProductId
    );

    if (printfulMockups.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Mockups not ready yet. Please try again in a moment.",
        },
        { status: 202 }
      );
    }

    // Download each mockup and re-upload to UploadThing
    const permanentUrls: string[] = [];

    for (let i = 0; i < printfulMockups.length; i++) {
      const mockupUrl = printfulMockups[i];

      try {
        // Download image from Printful's temp URL
        const response = await fetch(mockupUrl);

        if (!response.ok) {
          continue;
        }

        const blob = await response.blob();
        const file = new File([blob], `product-${productId}-mockup-${i}.jpg`, {
          type: "image/jpeg",
        });

        // Upload to UploadThing
        const uploadResult = await utapi.uploadFiles([file]);

        if (uploadResult[0]?.data?.ufsUrl) {
          permanentUrls.push(uploadResult[0].data.ufsUrl);
        }
      } catch (error) {}
    }

    if (permanentUrls.length === 0) {
      return NextResponse.json(
        { error: "Failed to upload mockups to UploadThing" },
        { status: 500 }
      );
    }

    // Update product in database with permanent UploadThing URLs
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        images: permanentUrls,
      },
    });

    // Update Stripe product with new mockup images
    if (product.stripeProductId) {
      await stripe.products.update(product.stripeProductId, {
        images: permanentUrls.slice(0, 8), // Stripe allows max 8 images
      });
    }

    return NextResponse.json({
      success: true,
      mockups: permanentUrls,
      product: updatedProduct,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch mockups" },
      { status: 500 }
    );
  }
}
