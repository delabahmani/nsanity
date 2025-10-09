"use client";
import { CartItem, useCart } from "@/components/CartContext";
import QuantitySelector from "@/components/Products/QuantitySelector";
import Button from "@/components/ui/Button";
import {
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

const FREE_SHIPPING_THRESHOLD = 0;

function CartItemComponent({
  item,
  updateQuantity,
  removeFromCart,
}: {
  item: CartItem;
  updateQuantity: (
    productId: string,
    quantity: number,
    size: string,
    color: string
  ) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
}) {
  return (
    <div className="bg-white border border-nsanity-gray rounded-xl p-4 md:p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 md:gap-6">
        <div className="w-24 h-24 md:w-28 md:h-28 flex items-center justify-center rounded-lg overflow-hidden bg-nsanity-cream border border-dashed border-black/50">
          <Image
            src={item.image || "/images/placeholder.webp"}
            alt={item.name}
            width={128}
            height={128}
            className="object-cover"
            priority
          />
        </div>

        <div>
          <div className="text-lg md:text-xl font-semibold text-black">
            {item.name}
          </div>
          <div className="text-black/65 text-sm md:text-base mt-1">
            Size: {item.size} • Color: {item.color}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <QuantitySelector
              size="sm"
              initialValue={item.quantity}
              min={1}
              max={10}
              onChange={(q) =>
                updateQuantity(item.productId, q, item.size, item.color)
              }
            />
            <button
              className="p-2 text-black/60 hover:text-nsanity-red"
              onClick={() =>
                removeFromCart(item.productId, item.size, item.color)
              }
              aria-label="Remove item"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-xl md:text-2xl font-bold">
          ${(item.price * item.quantity).toFixed(2)}
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <div className="nav-pad mx-auto bg-nsanity-cream/20">
        <div className="md:py-16 text-center justify-center items-center flex flex-col space-y-2">
          <ShoppingBag size={70} className="text-nsanity-black/80" />
          <h1 className="text-2xl font-semibold py-2">Your cart is empty</h1>
          <p className="pb-4 text-nsanity-black/70">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Link href="/products">
            <Button variant="primary">Browse products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="nav-pad bg-nsanity-cream">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="flex items-start justify-between py-5 md:py-10">
          <div>
            <h1 className="text-4xl font-bold">Your Cart</h1>
            <p className="text-black/60 mt-1">
              {cart.length} {cart.length === 1 ? "item" : "items"} in your cart
            </p>
          </div>
          <Link href="/products" className="inline-flex">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft size={16} /> Continue Shopping
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={clearCart}
                className="text-nsanity-red"
              >
                Clear Cart
              </Button>
            </div>

            {cart.map((item) => (
              <CartItemComponent
                key={item.productId + item.size + item.color}
                item={item}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
              />
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-nsanity-gray rounded-xl p-5">
              <div className="flex items-center gap-2 font-semibold mb-3">
                <Tag size={18} /> Promo Code
              </div>
              <div className="flex">
                <input
                  type="text"
                  className="flex-1 border border-nsanity-gray rounded-l-md px-3 py-2 bg-orange-50"
                  placeholder="Enter code"
                  disabled
                />
                <Button variant="primary" className="rounded-l-none" disabled>
                  Apply
                </Button>
              </div>
            </div>

            <div className="bg-white border border-nsanity-gray rounded-xl p-5">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
              </div>

              {subtotal > FREE_SHIPPING_THRESHOLD && (
                <div className="mt-3 text-green-700 text-sm">
                  🎉 You qualify for free shipping!
                </div>
              )}

              <hr className="my-4" />

              <div className="flex justify-between items-center text-lg font-bold mb-4">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={async () => {
                  const res = await fetch("/api/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cart }),
                  });
                  const data = await res.json();
                  if (data.url) {
                    window.location.href = data.url;
                  } else {
                    toast.error(data.error || "Checkout failed");
                  }
                }}
              >
                Proceed to Checkout
              </Button>

              <p className="mt-2 text-center text-xs text-black/60">
                Secure checkout powered by Stripe
              </p>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs text-black/70">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck size={14} /> Secure Payment
              </span>
              <span className="inline-flex items-center gap-1">
                <RotateCcw size={14} /> Free Returns
              </span>
              <span className="inline-flex items-center gap-1">
                <Truck size={14} /> Fast Shipping
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
