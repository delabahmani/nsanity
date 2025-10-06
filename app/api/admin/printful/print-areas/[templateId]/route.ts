import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

interface Template {
  template_id: number;
  image_url: string;
  background_color: string;
  printfile_id: number;
  template_width: number;
  template_height: number;
  print_area_width: number;
  print_area_height: number;
  print_area_top: number;
  print_area_left: number;
  is_template_on_front: boolean;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json(
        { error: "You are not authorized to perform this action" },
        { status: 403 }
      );
    }

    const { templateId } = await params;

    // Get mockup templates from Printful
    const mockupUrl = `https://api.printful.com/mockup-generator/templates/${templateId}`;

    const mockupRes = await fetch(mockupUrl, {
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const mockupData = await mockupRes.json();
    const templates: Template[] = mockupData.result?.templates || [];

    // Get the FRONT template (the main one for design placement)
    const frontTemplate = templates.find(
      (t) =>
        t.printfile_id === 1 &&
        t.is_template_on_front &&
        t.background_color === "#ffffff" // Use white background
    );

    // Also get product info
    const productRes = await fetch(
      `https://api.printful.com/products/${templateId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const productData = await productRes.json();
    const product = productData.result?.product;

    // Convert template data to our expected format
    const printAreas = frontTemplate
      ? [
          {
            id: frontTemplate.template_id,
            title: "Front",
            template_url: frontTemplate.image_url,
            width: frontTemplate.print_area_width,
            height: frontTemplate.print_area_height,
            left: frontTemplate.print_area_left,
            top: frontTemplate.print_area_top,
            templateWidth: frontTemplate.template_width,
            templateHeight: frontTemplate.template_height,
          },
        ]
      : [
          {
            id: 1,
            title: "Front",
            template_url: product?.image || "",
            width: 1200,
            height: 1600,
            left: 900,
            top: 800,
            templateWidth: 3000,
            templateHeight: 3000,
          },
        ];

    return NextResponse.json({
      success: true,
      printAreas,
      variants: productData.result?.variants || [],
      product: {
        id: product?.id,
        title: product?.title,
        brand: product?.brand,
        model: product?.model,
        image: frontTemplate?.image_url || product?.image,
        templateUrl: frontTemplate?.image_url,
      },
    });
  } catch (error) {
    console.error("💥 Error fetching template:", error);
    return NextResponse.json(
      { error: "Failed to fetch template", details: error },
      { status: 500 }
    );
  }
}
