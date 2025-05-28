import prisma from "@/lib/prismadb";
import { notFound } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export default async function SuccessPage(props: {
  searchParams: { session_id?: string };
}) {
  const searchParams = await props.searchParams;
  const sessionId = searchParams.session_id;
  if (!sessionId) return notFound();

  // Fetch Stripe session
  let session: Stripe.Checkout.Session | null = null;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });
  } catch (error) {
    return notFound();
  }

  // Get orderId from Stripe metadata
  const orderId = session.metadata?.orderId;
  if (!orderId) return notFound();

  // Fetch order from DB
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true },
  });
  if (!order) return notFound();

  return (
    <div className="nav-pad flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold py-3">thank you for your order!</h1>
      <div className="flex flex-col gap-3">
        <p className="">
          <span className="font-semibold">{order.id}</span>
        </p>
        <p className="">
          <span className="font-semibold">{order.status}</span>
        </p>
        <p className="">
          <span className="font-semibold">{order.totalAmount.toFixed(2)}</span>
        </p>
      </div>

      <div className="">
        <h2>Items:</h2>
        <ul>
          {order.orderItems.map((item) => (
            <li key={item.id} className="py-1">
              {item.quantity} x {item.productId}{" "}
              {item.color && `| Color: ${item.color}`}{" "}
              {item.size && `| Size: ${item.size}`}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-nsanity-teal font-semibold">
        a confirmation email has been sent to you.
      </p>
    </div>
  );
}
