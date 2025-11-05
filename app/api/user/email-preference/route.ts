/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prismadb";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        emailOrderUpdates: true,
        emailPromotions: true,
        emailNewsletter: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      orderUpdates: user.emailOrderUpdates ?? true,
      promotions: user.emailPromotions ?? false,
      newsletter: user.emailNewsletter ?? false,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderUpdates, promotions, newsletter } = await req.json();

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        emailOrderUpdates: orderUpdates,
        emailPromotions: promotions,
        emailNewsletter: newsletter,
      },
    });

    return NextResponse.json({
      message: "Email preferences updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
