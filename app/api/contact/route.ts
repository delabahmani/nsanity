import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message, category } = await req.json();

    // Validate req fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Send email to gmail
    await resend.emails.send({
      from: "contact@nsanity.shop",
      to: ["info.nsanity@gmail.com"],
      subject: `[${category.toUpperCase()}] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: "#ff6b35;">New Contact Form Submission</h2>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>SubjecT:</strong> ${subject}</p>
          </div>

          <div style="background: white; padding: 20px; border-left: 4px solid #ff6b35; margin: 20px 0;">
            <h3>Message:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
          <p>This message was sent from nsanity contact form</p>
          <p>Reply directly to this email to respond to ${name} at ${email}</p>
          </div>
        </div>
      `,
      replyTo: email,
    });

    // Confirmation email to user
    await resend.emails.send({
      from: "noreply@nsanity.shop",
      to: [email],
      subject: "We received your message - nsanity support",
      html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ff6b35;">Thanks for contacting nsanity support!</h2>
              <p>Hi ${name},</p>

              <p>We've received your message and will get back to you within 24 hours. Here's a copy of what you sent:</p>

              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Category:</strong> ${category}</p>
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap;">${message}</p>
             </div>
          
            <p>If you have any urgent questions, feel free to reply to this email.</p>
          
            <p>Best regards,<br>The nsanity Team</p>
            </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Contact form submission failed", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
