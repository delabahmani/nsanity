import { Resend } from "resend";
import EmailTemplate from "@/components/Emails/EmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTestEmail(to: string, firstName: string) {
  return resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to,
    subject: "Test email from nsanity",
    react: EmailTemplate({ firstName }),
  });
}
