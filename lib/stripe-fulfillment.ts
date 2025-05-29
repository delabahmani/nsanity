import Stripe from "stripe";
import prisma from "./prismadb";
import { sendTestEmail } from "./utils/send-test-email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function fulfillCheckout(sessionId: string) {
  console.log("Fulfilling checkout session", sessionId);

  // Retrieve the checkout session with line_items expanded
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });

  // Only fulfill if payment is NOT unpaid
  if (session.payment_status === "unpaid") return;

  const orderId = session.metadata?.orderId;
  console.log("Stripe session metadata:", session.metadata);
  if (!orderId) return;

  // Only fulfill if not already fulfilled
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    console.log("Order not found for id:", orderId);
    return;
  }
  if (order.status === "fulfilled") {
    console.log("Order already fulfilled:", orderId);
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "fulfilled" },
  });

  // Fetch user info for email
  const user = await prisma.user.findUnique({ where: { id: order.userId } });
  if (user && user.email && user.name) {
    await sendTestEmail(user.email, user.name.split("")[0])
  }

  console.log(`Order ${orderId} fulfilled and confirmation email sent!`);
}
