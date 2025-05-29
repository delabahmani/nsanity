import { NextRequest, NextResponse } from "next/server";
import { sendTestEmail } from "@/lib/utils/send-test-email";

export async function POST(req: NextRequest) {
  const { to, firstName } = await req.json();

  if (!to || !firstName) {
    return NextResponse.json(
      { error: "Missing recipient email or firstName" },
      { status: 400 }
    );
  }

  try {
    const result = await sendTestEmail(to, firstName);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
