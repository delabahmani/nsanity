/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { printfulService } from "@/lib/printful-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json(
        { error: "You are not authorized to perform this action." },
        { status: 403 }
      );
    }

    // FIX: Await params before accessing properties
    const resolvedParams = await params;
    const templateId = parseInt(resolvedParams.templateId);

    if (!templateId) {
      return NextResponse.json(
        { error: "Invalid template ID" },
        { status: 400 }
      );
    }

    const variants = await printfulService.getTemplateVariants(templateId);

    // Process variants to get unique sizes and colors
    const uniqueSizes = [
      ...new Set(variants.map((v: any) => v.size).filter(Boolean)),
    ];
    const uniqueColors = [
      ...new Set(variants.map((v: any) => v.color).filter(Boolean)),
    ];

    // Group variants by size for size-specific color options
    const variantsBySize = variants.reduce((acc: any, variant: any) => {
      if (!variant.size) return acc;

      if (!acc[variant.size]) {
        acc[variant.size] = [];
      }
      if (variant.color && !acc[variant.size].includes(variant.color)) {
        acc[variant.size].push(variant.color);
      }
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      variants,
      uniqueSizes,
      uniqueColors,
      variantsBySize,
    });
  } catch (error) {
    console.error("❌ Error fetching template variants", error);
    return NextResponse.json(
      { error: "Failed to fetch template variants" },
      { status: 500 }
    );
  }
}
