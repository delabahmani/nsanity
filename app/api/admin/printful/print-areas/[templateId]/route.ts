import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

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

    // Fetch print areas from Printful
    const res = await fetch(`https://api.printful.com/products/${templateId}`, {
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        {
          error: `Failed to fetch print areas: ${res.status}`,
          details: errorText,
        },
        { status: res.status }
      );
    }

    const data = await res.json();

    return NextResponse.json({
      success: true,
      printAreas: data.result.print_files || [],
      variants: data.result.variants || [],
      product: {
        id: data.result.id,
        title: data.result.title,
        brand: data.result.brand,
        model: data.result.model,
        image: data.result.image,
      },
    });
  } catch (error: any) {
    console.error("Error fetching print areas:", error);
    return NextResponse.json(
      { error: "Failed to fetch print areas", details: error.message },
      { status: 500 }
    );
  }
}
