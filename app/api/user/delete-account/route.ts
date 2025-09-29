import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prismadb";

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user's related data in order
    // 1. Delete order items first
    await prisma.orderItem.deleteMany({
      where: {
        order: {
          userId: user.id,
        },
      },
    });

    // 2. Delete orders
    await prisma.order.deleteMany({
      where: { userId: user.id },
    });

    // 3. Delete accounts (OAuth accounts)
    await prisma.account.deleteMany({
      where: { userId: user.id },
    });

    // 4. Delete sessions
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // 5. Finally delete the user
    await prisma.user.delete({
      where: { id: user.id },
    });

    console.log("User account deleted successfully");
    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Account deletion failed",  error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
