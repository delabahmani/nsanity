import Stripe from "stripe";
import prisma from "./prismadb";
import {
  sendAdminOrderNotification,
  sendOrderConfirmationEmail,
} from "./utils/email-service";
import { printfulService } from "./printful-service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function fulfillCheckout(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items", "customer_details"],
  });

  if (session.payment_status === "unpaid") return;

  const orderId = session.metadata?.orderId;
  const userId = session.metadata?.userId;

  if (!orderId || !userId) {
    console.error("Missing orderId or userId in Stripe session metadata");
    return;
  }

  const shippingAddress = session.customer_details?.address;
  const customerName = session.customer_details?.name;
  const customerPhone = session.customer_details?.phone;

  // Save shipping address
  if (shippingAddress) {
    // Check if this exact address already exists
    const existingAddress = await prisma.address.findFirst({
      where: {
        userId,
        address1: shippingAddress.line1 || "",
        city: shippingAddress.city || "",
        postalCode: shippingAddress.postal_code || "",
      },
    });

    if (!existingAddress) {
      // Create new address, set as default if user has no addresses
      const userAddressCount = await prisma.address.count({
        where: { userId },
      });

      await prisma.address.create({
        data: {
          userId,
          address1: shippingAddress.line1 || "",
          address2: shippingAddress.line2 || null,
          city: shippingAddress.city || "",
          state: shippingAddress.state || null,
          postalCode: shippingAddress.postal_code || "",
          country: shippingAddress.country || "",
          isDefault: userAddressCount === 0,
        },
      });
    }

    // Update phone if provided
    if (customerPhone) {
      await prisma.user.update({
        where: { id: userId },
        data: { phone: customerPhone },
      });
    }
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: { include: { product: true } },
      user: {
        include: {
          addresses: {
            where: { isDefault: true },
            take: 1,
          },
        },
      },
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

  // Clear cart after successful order
  await prisma.user.update({
    where: { id: userId },
    data: { cart: [] },
  });

  // Create Printful draft order for print-on-demand items
  const printfulItems = order.orderItems.filter(
    (item) => item.product.isPrintOnDemand && item.product.printfulSyncProductId
  );

  if (printfulItems.length > 0) {
    try {
      const printfulOrderItems = printfulItems.map((item) => {
        // Get the variant mapping from the product
        const variantMappings = item.product.printfulSyncVariants as Record<
          string,
          number
        > | null;

        // Build the lookup key: "size-color" (lowercase)
        const lookupKey = `${item.size.toLowerCase()}-${item.color.toLowerCase()}`;

        // Get the specific variant ID for this size/color combination
        const syncVariantId = variantMappings?.[lookupKey];

        if (!syncVariantId) {
          console.error(
            `No variant mapping found for ${item.product.name} - ${item.size}/${item.color}`
          );
          console.error(`Available mappings:`, variantMappings);
          throw new Error(`Variant mapping missing for ${lookupKey}`);
        }

        return {
          sync_variant_id: syncVariantId,
          quantity: item.quantity,
          retail_price: item.price.toFixed(2),
          name: item.product.name,
        };
      });

      // Use shipping details from Stripe if available, otherwise use default address
      let recipient;

      if (shippingAddress) {
        recipient = {
          name: customerName || order.user.name || "Customer",
          address1: shippingAddress.line1 || "Address required",
          address2: shippingAddress.line2 || undefined,
          city: shippingAddress.city || "City required",
          state_code: shippingAddress.state || undefined,
          country_code: shippingAddress.country || "US" || "Canada",
          zip: shippingAddress.postal_code || "00000" || "000000",
          email: order.user.email || "",
          phone: customerPhone || order.user.phone || "",
        };
      } else if (order.user.addresses && order.user.addresses.length > 0) {
        const defaultAddr = order.user.addresses[0];
        recipient = {
          name: order.user.name || "Customer",
          address1: defaultAddr.address1,
          address2: defaultAddr.address2 || undefined,
          city: defaultAddr.city,
          state_code: defaultAddr.state || undefined,
          country_code: defaultAddr.country,
          zip: defaultAddr.postalCode,
          email: order.user.email || "",
          phone: order.user.phone || "",
        };
      } else {
        console.error("No shipping address available for Printful order");
        return;
      }

      const result = await printfulService.createDraftOrder({
        externalId: order.orderCode || order.id,
        recipient,
        items: printfulOrderItems,
      });

      if (result.success) {
        console.log(
          `Printful draft order created: ${result.printfulOrderId} for order ${order.id}`
        );

        // Notify admins of draft orders
        await sendAdminOrderNotification({
          orderId: order.id,
          customerName: order.user.name || "Customer",
          customerEmail: order.user.email || "unknown@email.com",
          total: order.totalAmount,
          orderItems: order.orderItems.map((item) => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.price,
            color: item.color,
            size: item.size,
          })),
        });
      } else {
        console.error(
          `Failed to create Printful draft order for ${order.id}: ${result.message}`
        );
      }
    } catch (error) {
      console.error("Error creating Printful draft order:", error);
    }
  }

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
      console.error("Failed to send emails:", emailError);
    }
  }
}
