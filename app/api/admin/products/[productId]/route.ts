import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prismadb";
import { deleteUploadThingFiles } from "@/lib/utils/uploadthing-deletion";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil", // Use your Stripe API version
});

// GET, PATCH, DELETE for admin operations
export async function GET(
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
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
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
      return NextResponse.json(
        { error: "You are not authorized to perform this action." },
        { status: 403 }
      );
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

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        price,
        description,
        colors,
        categories,
        sizes,
        inStock,
        isFeatured,
        images,
        stripePriceId,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error: unknown) {
    console.error("Error updating product:", error);

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
      return NextResponse.json(
        { error: "You are not authorized to perform this action." },
        { status: 403 }
      );
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

    if (product.stripeProductId) {
      try {
        await stripe.products.update(product.stripeProductId, {
          active: false,
        });
      } catch (stripeError) {
        console.error("Error archiving product in Stripe:", stripeError);
      }
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    if (product.images && product.images.length > 0) {
      deleteUploadThingFiles(product.images)
        .then((results) => {
          console.log(
            `Deleted ${results.filter(Boolean).length} of ${
              results.length
            } images for product ${productId}`
          );
        })
        .catch((err) => {
          console.error("Error deleting product images:", err);
        });
    }

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
