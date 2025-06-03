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
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });

  if (session.payment_status === "unpaid") return;

  const orderId = session.metadata?.orderId;
  if (!orderId) {
    console.error("Missing orderId in Stripe session metadata");
    return;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: { include: { product: true } },
      user: true,
    },
  });

  if (!order) {
    console.error("Order not found during fulfillment");
    return;
  }

  if (order.status === "fulfilled") {
    return;
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "fulfilled" },
  });

  // Send emails
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
      });

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
    } catch (emailError) {
      console.error("Order fulfillment email delivery failed");
    }
  }
}
