import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.printful.com/products", {
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Printful API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      success: true,
      products: data.result,
      count: data.result?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch Printful products", details: error.message },
      { status: 500 }
    );
  }
}
