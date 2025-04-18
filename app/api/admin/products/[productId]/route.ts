import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// GET, PATCH, DELETE for admin operations
export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json(
        { error: "You are not authorized to perform this action." },
        { status: 403 }
      );
    }

    const productId = params.productId;

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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH to update a product (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json(
        { error: "You are not authorized to perform this action." },
        { status: 403 }
      );
    }

    const productId = params.productId;
    const { formData } = await req.json();
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
    } = formData;

    if (formData.price !== undefined && formData.price <= 0) {
      return NextResponse.json(
        { error: "Price must be greater than 0." },
        { status: 400 }
      );
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
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error("Error updating product:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
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
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json(
        { error: "You are not authorized to perform this action." },
        { status: 403 }
      );
    }

    const productId = params.productId;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    await prisma.product.delete({
      where: { id: productId },
    });

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
