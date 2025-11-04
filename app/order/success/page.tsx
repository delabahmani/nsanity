import PrintButton from "@/components/PrintBtn";
import prisma from "@/lib/prismadb";
import Image from "next/image";
import { notFound } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export default async function SuccessPage(props: {
  searchParams: Promise<{ session_id?: string }>;
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
    console.error("Failed to fetch Stripe session:", error);
    return notFound();
  }

  // Get orderId from Stripe metadata
  const orderId = session.metadata?.orderId;
  if (!orderId) return notFound();

  // Fetch order from DB
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: { include: { product: true } } },
  });
  if (!order) return notFound();

  return (
    <div className="nav-pad flex flex-col justify-center items-center bg-nsanity-cream/60 ">
      <div className="flex flex-col items-center py-6">
        <div className="bg-nsanity-teal rounded-full p-2 mb-2">
          <svg width={32} height={32} fill="none" viewBox="0 0 24 24">
            <path stroke="#fff" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex flex-col items-center py-2">
          <h1 className="text-4xl font-bold">order confirmed</h1>
          <p className="text-black/75 py-2">
            thank you for your purchase! <span>&#9786;</span>
          </p>
        </div>
      </div>

      <div className="bg-nsanity-white rounded-lg shadow p-8 w-full max-w-2xl border border-dashed">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold">Order #{order.orderCode}</p>
            <p className="text-xs text-black/75">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <PrintButton />
        </div>

        <hr className="my-4" />

        <div>
          <h2 className="font-semibold mb-2">Items Ordered</h2>
          <ul>
            {order.orderItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 py-2 border-b last:border-b-0"
              >
                <Image
                  src={item.product.images[0] || "/images/placeholder.webp"}
                  alt={item.product?.name}
                  width={56}
                  height={56}
                  quality={100}
                  className="w-14 h-14 rounded border object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-xs text-black/75">
                    <span className="font-semibold">Size:</span>{" "}
                    {item.size}{" "}
                  </p>
                  <p className="text-xs text-black/75">
                    <span className="font-semibold">Color:</span> {item.color}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${item.price.toFixed(2)}</p>
                  <p className="text-xs text-black/75">
                    <span className="font-semibold">Qty:</span> {item.quantity}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <hr className="my-4" />

        <div className="grid grid-cols-2 gap-6 py-2">
          <div>
            <h3 className="font-semibold mb-1">Shipping Information</h3>
            <p className="text-sm text-black/60">
              Shipping details will appear here once available.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Payment Method</h3>
            {/* You can show Stripe card info here if available */}
            <p className="text-sm text-black/60">
              Payment details will appear here.
            </p>
          </div>
        </div>

        <hr className="my-4" />

        <div className="space-y-1 p-2 bg-nsanity-gray/20 rounded-sm">
          <h4 className="font-semibold mb-2">Order Summary</h4>
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>Free for now</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>Empty for now</span>
          </div>

          <hr className="my-4" />

          <div className="flex justify-between text-lg font-bold py-1">
            <span>Total</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
