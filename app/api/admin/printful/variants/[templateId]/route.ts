/* eslint-disable @typescript-eslint/no-unused-vars */
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

    const resolvedParams = await params;
    const templateId = parseInt(resolvedParams.templateId);

    if (!templateId) {
      return NextResponse.json(
        { error: "Invalid template ID" },
        { status: 400 }
      );
    }

    const productData = await printfulService.getTemplateVariants(templateId);

    if (!productData) {
      return NextResponse.json(
        { error: "No data returned from Printful" },
        { status: 404 }
      );
    }

    const variants = productData.variants ?? [];
    const variantFiles = productData.variant_files ?? [];

    // Group files by variant_id
    const filesByVariantId = variantFiles.reduce(
      (acc: Record<number, any[]>, file: any) => {
        if (!file.variant_id) return acc;
        if (!acc[file.variant_id]) acc[file.variant_id] = [];
        acc[file.variant_id].push({
          type: file.type ?? null,
          position: file.position ?? null,
          preview_url: file.preview_url ?? null,
          thumbnail_url: file.thumbnail_url ?? null,
        });
        return acc;
      },
      {}
    );

    // Merge files into variants
    const formattedVariants = variants.map((variant: any) => ({
      id: variant.id,
      name: variant.name,
      size: variant.size,
      color: variant.color,
      price: variant.price,
      image: variant.image,
      files: filesByVariantId[variant.id] ?? [],
    }));

    const uniqueSizes = [
      ...new Set(formattedVariants.map((v: any) => v.size).filter(Boolean)),
    ];
    const uniqueColors = [
      ...new Set(formattedVariants.map((v: any) => v.color).filter(Boolean)),
    ];

    const variantsBySize = formattedVariants.reduce(
      (acc: Record<string, string[]>, variant: any) => {
        if (!variant.size || !variant.color) return acc;
        if (!acc[variant.size]) acc[variant.size] = [];
        if (!acc[variant.size].includes(variant.color)) {
          acc[variant.size].push(variant.color);
        }
        return acc;
      },
      {}
    );

    return NextResponse.json({
      success: true,
      product: productData.product ?? null,
      variants: formattedVariants,
      uniqueSizes,
      uniqueColors,
      variantsBySize,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch template variants" },
      { status: 500 }
    );
  }
}
