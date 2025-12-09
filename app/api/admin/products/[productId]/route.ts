/* eslint-disable @typescript-eslint/no-unused-vars */
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { canonicalizeCategory } from "@/lib/printful-features";
import { printfulService } from "@/lib/printful-service";
import prisma from "@/lib/prismadb";
import { deleteUploadThingFiles } from "@/lib/utils/uploadthing-deletion";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

// GET, PATCH, DELETE for admin operations
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { productId } = await params;

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PATCH to update a product (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { productId } = await params;
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
      syncWithPrintful,
    } = await req.json();

    if (price !== undefined && price <= 0) {
      return NextResponse.json(
        { error: "Price must be greater than 0." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await stripe.products.update(product.stripeProductId, {
      name,
      description,
      images: images && images.length > 0 ? images : undefined,
      metadata: {
        categories: categories ? categories.join(",") : "",
        colors: colors ? colors.join(",") : "",
        sizes: sizes ? sizes.join(",") : "",
      },
    });

    let stripePriceId = product.stripePriceId;

    if (price !== undefined && price !== product.price) {
      await stripe.prices.update(stripePriceId, {
        active: false,
      });

      const newPrice = await stripe.prices.create({
        product: product.stripeProductId,
        unit_amount: Math.round(price * 100),
        currency: "cad",
      });
      stripePriceId = newPrice.id;
    }

    // Update Printful if Product exists
    if (syncWithPrintful && product.printfulSyncProductId) {
      try {
        await printfulService.updateSyncProduct(product.printfulSyncProductId, {
          sync_product: { name, thumbnail: images[0] },
          sync_variants: sizes.flatMap((size: string) =>
            colors.map((color: string) => ({
              retail_price: price.toFixed(2),
              variant_id: 1,
              color,
              size,
            }))
          ),
        });
      } catch (printfulError) {}
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        price,
        description,
        colors,
        categories: categories.map(canonicalizeCategory),
        sizes,
        inStock,
        isFeatured,
        images,
        stripePriceId,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error)
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE to delete a product (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { productId } = await params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    // Archive in Stripe first
    if (product.stripeProductId) {
      try {
        await stripe.products.update(product.stripeProductId, {
          active: false,
        });
      } catch {
        return NextResponse.json(
          { error: "Failed to archive product in payment system" },
          { status: 500 }
        );
      }
    }

    // Delete from Printful
    if (product.printfulSyncProductId) {
      try {
        await printfulService.deleteSyncProduct(product.printfulSyncProductId);
      } catch (printfulError) {}
    }

    // Delete files from uploadthing before database
    if (product.images && product.images.length > 0) {
      try {
        await deleteUploadThingFiles(product.images);
      } catch (uploadError) {
        return NextResponse.json(
          { error: "Failed to delete product files" },
          { status: 500 }
        );
      }
    }

    // Clean up wishlist references BEFORE deleting the product
    try {
      const usersWithProduct = await prisma.user.findMany({
        where: {
          wishlist: {
            has: productId,
          },
        },
        select: { id: true, wishlist: true },
      });

      if (usersWithProduct.length > 0) {
        // Update all affected users' wishlists
        const updatePromises = usersWithProduct.map((user) =>
          prisma.user.update({
            where: { id: user.id },
            data: {
              wishlist: {
                set: user.wishlist.filter((id) => id !== productId),
              },
            },
          })
        );

        await Promise.all(updatePromises);
      }
    } catch (wishlistError) {}

    // Finally delete the product from database
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
