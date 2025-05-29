import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from "@/lib/prismadb";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { wishlist: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: user.wishlist } },
  });

  return NextResponse.json(products);
}
