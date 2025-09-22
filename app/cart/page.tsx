"use client";
import { CartItem, useCart } from "@/components/CartContext";
import QuantitySelector from "@/components/Products/QuantitySelector";
import Button from "@/components/ui/Button";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

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
    <div className="flex items-center justify-between bg-nsanity-cream">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 flex items-center justify-center ">
          <Image
            src={item.image || "/images/placeholder.webp"}
            alt={item.name}
            width={100}
            height={100}
            quality={100}
            className="object-cover group-hover:scale-105 transition-transform duration-300  border-dashed border-2 border-black rounded"
            priority
          />
        </div>
        <div>
          <div className="font-semibold text-black text-2xl">{item.name}</div>
          <div className="text-black/65 font-medium text-lg">
            Size: {item.size}
          </div>
          <div className="text-black/65 font-medium text-lg">
            Colors: {item.color}
          </div>

          <div className="flex justify-center items-center">
            <QuantitySelector
              initialValue={item.quantity}
              min={1}
              max={10}
              onChange={(newQuantity) =>
                updateQuantity(
                  item.productId,
                  newQuantity,
                  item.size,
                  item.color
                )
              }
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className="font-bold text-2xl">
          ${(item.price * item.quantity).toFixed(2)}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 mt-2 text-gray-500"
          onClick={() => removeFromCart(item.productId, item.size, item.color)}
        >
          <Trash2 size={16} /> Remove
        </Button>
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
      <div className="nav-pad mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Link href="/products">
          <Button variant="primary">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="nav-pad flex flex-col lg:flex-row gap-8 bg-nsanity-cream">
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <Button
          variant="ghost"
          onClick={clearCart}
          className="text-nsanity-red"
        >
          Clear Cart
        </Button>
        {cart.map((item) => (
          <CartItemComponent
            key={item.productId + item.size + item.color}
            item={item}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
          />
        ))}
        <Link
          href="/products"
          className="flex items-center gap-2 mt-4 text-gray-600 hover:underline"
        >
          &larr; Continue Shopping
        </Link>
      </div>
      <div className="w-full max-w-sm border-dashed border-2 rounded-lg p-6 bg-white/80">
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
        <div className="flex justify-between mb-2">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <hr className="my-4" />
        <div className="flex justify-between text-lg font-bold mb-4">
          <span>Total</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-1">Promo Code</label>
          <div className="flex">
            <input
              type="text"
              className="flex-1 border rounded-l px-2 py-1 bg-orange-50"
              placeholder="Enter code"
              disabled
            />
            <Button variant="primary" className="rounded-l-none" disabled>
              Apply
            </Button>
          </div>
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
          Checkout
        </Button>
      </div>
    </div>
  );
}
