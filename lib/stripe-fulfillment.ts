import Stripe from "stripe";
import prisma from "./prismadb";
import {
  sendAdminOrderNotification,
  sendOrderConfirmationEmail,
} from "./utils/email-service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function fulfillCheckout(sessionId: string) {
  console.log("Fulfilling checkout session");

  // Retrieve the checkout session with line_items expanded
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });

  // Only fulfill if payment is NOT unpaid
  if (session.payment_status === "unpaid") return;

  const orderId = session.metadata?.orderId;
  console.log("Stripe session metadata");
  if (!orderId) return;

  // Only fulfill if not already fulfilled
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: { product: true },
      },
      user: true,
    },
  });
  if (!order) {
    console.log("Order not found for id");
    return;
  }
  if (order.status === "fulfilled") {
    console.log("Order already fulfilled");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "fulfilled" },
  });

  // Send order confirmation email
  if (order.user?.email && order.user?.name) {
    try {
      await sendOrderConfirmationEmail({
        customerEmail: order.user.email,
        customerName: order.user.name,
        orderId: order.id,
        orderItems: order.orderItems.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          color: item.color,
          size: item.size,
        })),
        total: order.totalAmount,
        // shippingAddress: order.shippingAddress
      });

      // Send admin notification
      await sendAdminOrderNotification({
        orderId: order.id,
        customerName: order.user.name,
        customerEmail: order.user.email,
        total: order.totalAmount,
        orderItems: order.orderItems.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          color: item.color,
          size: item.size,
        })),
      });

      console.log("Order fulfilled and emails sent!");
    } catch (emailError) {
      console.error("Error sending emails:", emailError);
    }
  }
}
