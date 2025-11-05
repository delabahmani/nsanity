/* eslint-disable @typescript-eslint/no-unused-vars */
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from "@/lib/prismadb";

// Get favorite products for verified user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { wishlist: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const wishlistIds = user.wishlist || [];

    const products = await prisma.product.findMany({
      where: { id: { in: wishlistIds } },
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        colors: true,
        sizes: true,
        inStock: true,
        isFeatured: true,
        categories: true,
      },
    });

    // Check if any products were deleted and clean up the wishlist
    const foundProductIds = products.map((product) => product.id);
    const deletedProductIds = wishlistIds.filter(
      (id) => !foundProductIds.includes(id)
    );

    // If there are deleted products, update the user's wishlist
    if (deletedProductIds.length > 0) {
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          wishlist: { set: foundProductIds },
        },
      });
    }

    return NextResponse.json({
      products,
      message: deletedProductIds.length > 0 ? "Wishlist updated" : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

// Add product to user's wishlist
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "Missing ProductId" }, { status: 400 });
    }

    // Check if product exists before adding to wishlist
    const productExists = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!productExists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Get current wishlist
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { wishlist: true },
    });

    const currentWishlist = currentUser?.wishlist || [];

    // Add productId to wishlist if not already present
    const updatedWishlist = Array.from(
      new Set([...currentWishlist, productId])
    );

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        wishlist: { set: updatedWishlist },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Added to favorites",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add to favorites" },
      { status: 500 }
    );
  }
}

// Remove product from user's wishlist
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    const userRecord = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { wishlist: true },
    });

    const newWishlist = (userRecord?.wishlist || []).filter(
      (id) => id !== productId
    );

    await prisma.user.update({
      where: { email: session.user.email },
      data: { wishlist: { set: newWishlist } },
    });

    return NextResponse.json({
      success: true,
      message: "Removed from favorites",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to remove from favorites" },
      { status: 500 }
    );
  }
}
