// GET all products with admin data, POST to create
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from "@/lib/prismadb";
import Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { printfulService } from "@/lib/printful-service";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

async function convertBlobToUploadThingUrl(
  base64Data: string
): Promise<string> {
  try {
    // Convert base64 to buffer
    const base64String = base64Data.split(",")[1]; // Remove data:image/png;base64, prefix
    const buffer = Buffer.from(base64String, "base64");

    // Create File object from buffer
    const file = new File([buffer], `design_${Date.now()}.png`, {
      type: "image/png",
    });

    const uploadResult = await utapi.uploadFiles([file]);
    if (uploadResult && uploadResult.length > 0 && uploadResult[0].data) {
      const publicUrl = uploadResult[0].data.ufsUrl || uploadResult[0].data.url;
      return publicUrl;
    } else {
      throw new Error("Failed to upload file to UploadThing");
    }
  } catch (error) {
    console.error("❌ Error converting base64:", error);
    throw error;
  }
}

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

    const filter: Prisma.ProductWhereInput = {};

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
      printfulTemplateId,
      designData,
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

    // Create in Printful
    let printfulSyncProductId = null;
    if (printfulTemplateId && designData) {
      try {

        // Map sizes and colors to proper format for Printful
        const mappedVariants = sizes.flatMap((size: string) =>
          colors.map((color: string) => ({
            size: size.toLowerCase(), // Ensure lowercase
            color: color.toLowerCase(), // Ensure lowercase
            price,
          }))
        );

        const printfulProduct = await printfulService.createSyncProduct({
          name,
          images,
          templateId: printfulTemplateId,
          variants: mappedVariants,
          designData: {
            designFile: await convertBlobToUploadThingUrl(
              designData.designFile
            ),
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
      } catch (error) {
        console.error("❌ Printful sync failed:", error);
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
      } catch (error) {
        console.error("Printful sync failed: ", error);
      }
    }

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
        printfulSyncProductId,
        printfulTemplateId,
        designPositionData: designData ? JSON.stringify(designData) : null,
        isPrintOnDemand: !!printfulTemplateId,
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
