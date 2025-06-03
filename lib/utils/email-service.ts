import { Resend } from "resend";
import { generateOrderConfirmationEmail } from "../email-templates/order-confirmation";
import { generateAdminOrderNotificationEmail } from "../email-templates/admin-notification";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(data: {
  customerEmail: string;
  customerName: string;
  orderId: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
    color: string;
    size: string;
  }>;
  total: number;
  shippingAddress?: string;
}) {
  const template = generateOrderConfirmationEmail(data);

  return await resend.emails.send({
    from: "orders@nsanity.shop",
    to: data.customerEmail,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendAdminOrderNotification(data: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
    color: string;
    size: string;
  }>;
}) {
  const template = generateAdminOrderNotificationEmail(data);

  return await resend.emails.send({
    from: "system@nsanity.shop",
    to: "info.nsanity@gmail.com",
    subject: template.subject,
    html: template.html,
  });
}
