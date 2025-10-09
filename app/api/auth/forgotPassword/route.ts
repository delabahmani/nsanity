import prisma from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "crypto";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://www.nsanity.shop"
    : "http://localhost:3000";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: "No user found with that email." },
      { status: 404 }
    );
  }

  // Generate reset token
  const token = crypto.randomBytes(32).toString("hex");
  const tokenExpiry = new Date(Date.now() + 1000 * 60 * 30); // 30 mins

  // Save token to user
  await prisma.user.update({
    where: { email },
    data: {
      resetToken: token,
      resetTokenExpiry: tokenExpiry,
    },
  });

  // Send email with reset link
  const resetUrl = `${BASE_URL}/resetPassword?token=${token}`;
  await resend.emails.send({
    from: "no-reply@nsanity.shop",
    to: email,
    subject: "Reset your nsanity.shop password",
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link will expire in 30 minutes.</p>`,
  });

  return NextResponse.json({ success: true, message: "Reset link sent!" });
}
