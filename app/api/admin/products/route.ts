/* eslint-disable @typescript-eslint/no-unused-vars */
// GET all products with admin data, POST to create
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from "@/lib/prismadb";
import Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { printfulService } from "@/lib/printful-service";
import { canonicalizeCategory } from "@/lib/printful-features";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const filter: Prisma.ProductWhereInput = {};

    if (featured === "true") {
      filter.isFeatured = true;
    } else if (featured === "false") {
      filter.isFeatured = false;
    }

    const skip = (page - 1) * limit;

    const products = await prisma.product.findMany({
      where: filter,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: skip,
    });

    const total = await prisma.product.count({ where: filter });

    return NextResponse.json({ products, total, page, limit });
  } catch (error) {
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
      printfulTemplateId,
      designData,
    } = await req.json();

    if (printfulTemplateId && (!images || images.length === 0)) {
      return NextResponse.json(
        { error: "Product image is required for Printful products" },
        { status: 400 }
      );
    }

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

    // Create in Printful
    let printfulSyncProductId = null;
    let printfulSyncVariants = null; // Declare at the top level

    if (printfulTemplateId && designData) {
      try {
        // Map sizes and colors to proper format for Printful
        const mappedVariants = sizes.flatMap((size: string) =>
          colors.map((color: string) => ({
            size: size.toLowerCase(),
            color: color.toLowerCase(),
            price,
          }))
        );

        const printfulProduct = await printfulService.createSyncProduct({
          name,
          images,
          templateId: printfulTemplateId,
          variants: mappedVariants,
          designData: {
            designFile: designData.designFile,
            position: {
              x: designData.x,
              y: designData.y,
              width: designData.width,
              height: designData.height,
            },
            printArea: designData.printArea,
            templateInfo: designData.templateInfo,
          },
        });

        printfulSyncProductId = printfulProduct.id;
        printfulSyncVariants = printfulProduct.variantMappings; // Assign here
      } catch (error) {
        return NextResponse.json(
          { error: `Failed to create Printful product` },
          { status: 500 }
        );
      }
    } else if (printfulTemplateId) {
      // Regular Printful product without custom design
      try {
        const mappedVariants = sizes.flatMap((size: string) =>
          colors.map((color: string) => ({
            size: size.toLowerCase(),
            color: color.toLowerCase(),
            price,
          }))
        );

        const printfulProduct = await printfulService.createSyncProduct({
          name,
          images,
          templateId: printfulTemplateId,
          variants: mappedVariants,
        });

        printfulSyncProductId = printfulProduct.id;
        printfulSyncVariants = printfulProduct.variantMappings; // Assign here
      } catch (error) {
        return NextResponse.json(
          { error: `Failed to create Printful product` },
          { status: 500 }
        );
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        price,
        description,
        colors,
        categories: categories.map(canonicalizeCategory),
        inStock,
        isFeatured,
        sizes,
        images,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
        printfulSyncProductId,
        printfulSyncVariants, // Now it's in scope
        printfulTemplateId,
        designPositionData: designData ? JSON.stringify(designData) : null,
        isPrintOnDemand: !!printfulTemplateId,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
