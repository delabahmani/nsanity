"use client";
import { ShoppingBasket, ShoppingCart, X } from "lucide-react";
import { useCart } from "./CartContext";
import QuantitySelector from "./Products/QuantitySelector";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ProfileBtn from "./ProfileBtn";
import { Session } from "next-auth";
import Button from "./ui/Button";

export default function Navbar({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const [pop, setPop] = useState(false);

  const [cartOpen, setCartOpen] = useState(false);

  const { cart, removeFromCart, updateQuantity } = useCart();
  const cartRef = useRef<HTMLDivElement>(null);
  const path = usePathname();
  const prevCount = useRef(0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    if (cartCount !== prevCount.current) {
      setPop(true);
      prevCount.current = cartCount;
      const timeout = setTimeout(() => setPop(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [cartCount]);

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setCartOpen(false);
      }
    }
    if (cartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [cartOpen]);

  const navigation = [
    { name: "home", href: "/", current: path === "/" },
    { name: "shop", href: "/products", current: path === "/products" },
    { name: "contact", href: "/contact", current: path === "/contact" },
  ];

  const hideNavbar =
    pathname?.startsWith("/auth") || pathname === "/resetPassword";

  if (hideNavbar) return null;

  return (
    <header className="bg-nsanity-cream/90 fixed w-full z-50 backdrop-blur-md drop-shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        <div className="flex lg:flex-1">
          <Link href={"/"} className="flex items-center">
            <Image
              src={"/images/logo.webp"}
              alt="Logo"
              width={200}
              height={200}
              quality={100}
              priority
              className="m-4 max-lg:w-24 lg:w-36 h-auto object-contain object-left"
            />
          </Link>
        </div>

        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-base font-semibold ${
                path === item.href
                  ? "text-nsanity-orange"
                  : "text-nsanity-black"
              } link-hover `}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center">
          <div className="lg:flex lg:gap-x-6 hidden lg:items-center">
            {session ? (
              <ProfileBtn session={session} />
            ) : (
              <Link
                href={"/auth/sign-in"}
                className="text-sm font-semibold text-nsanity-black link-hover"
              >
                sign in
              </Link>
            )}

            {/* Mini Cart */}
            <div className="relative">
              <Button
                className="text-sm font-semibold leading-6 text-nsanity-black relative"
                onClick={(e) => {
                  e.preventDefault();
                  setCartOpen((open) => !open);
                }}
                aria-label="Open cart"
                variant="ghost"
              >
                <ShoppingBasket className="link-hover" size={28} />
                {cart.length > 0 && (
                  <span
                    className={`absolute -top-2 -right-2 bg-nsanity-orange text-nsanity-black text-sm rounded-full h-6 w-6 font-bold flex items-center justify-center transition-transform ${
                      pop ? "animate-pop" : ""
                    }`}
                  >
                    {cartCount}
                  </span>
                )}
              </Button>

              {cartOpen && (
                <div
                  ref={cartRef}
                  className="absolute right-0 mt-3 w-[420px] max-w-[90vw] z-50"
                >
                  {/* Pointer */}
                  <div className="absolute right-[22px] -top-2 h-4 w-4 rotate-45 bg-white border border-nsanity-gray/40 shadow-sm" />

                  <div className="relative rounded-2xl border border-nsanity-gray/40 bg-white shadow-xl ring-1 ring-black/5 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-nsanity-gray/30 bg-nsanity-cream/60">
                      <div className="flex items-center gap-2">
                        <ShoppingCart
                          size={18}
                          className="text-nsanity-black/80"
                        />
                        <span className="font-semibold">Your cart</span>
                        <span className="ml-2 text-xs bg-nsanity-cream text-nsanity-black/70 px-2 py-0.5 rounded-full">
                          {cartCount} {cartCount === 1 ? "item" : "items"}
                        </span>
                      </div>
                      <button
                        aria-label="Close cart"
                        onClick={() => setCartOpen(false)}
                        className="p-1.5 rounded-md hover:bg-nsanity-cream transition"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Items */}
                    {cart.length === 0 ? (
                      <div className="px-6 py-10 text-center flex flex-col items-center justify-center">
                        <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-nsanity-cream flex items-center justify-center">
                          <ShoppingCart
                            size={18}
                            className="text-nsanity-black/70"
                          />
                        </div>
                        <p className="font-semibold">Your cart is empty</p>
                        <p className="text-sm text-nsanity-black/70 mt-1">
                          Start adding products to see them here.
                        </p>
                        <Link
                          href="/products"
                          onClick={() => setCartOpen(false)}
                        >
                          <Button variant="primary" size="sm" className="mt-4">
                            Browse products
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="max-h-80 overflow-y-auto px-4 py-3 divide-y divide-gray-100">
                          {cart.map((item) => (
                            <div
                              key={
                                item.productId +
                                (item.size ?? "") +
                                (item.color ?? "")
                              }
                              className="py-3 first:pt-0 last:pb-0"
                            >
                              <div className="grid grid-cols-[64px_1fr_auto] gap-3 items-start">
                                <div className="h-16 w-16 rounded-lg overflow-hidden border bg-nsanity-cream">
                                  <Image
                                    src={
                                      item.image || "/images/placeholder.webp"
                                    }
                                    alt={item.name}
                                    width={64}
                                    height={64}
                                    quality={100}
                                    className="h-full w-full object-cover"
                                  />
                                </div>

                                <div className="min-w-0">
                                  <p className="font-semibold truncate">
                                    {item.name}
                                  </p>
                                  <p className="text-sm text-nsanity-black/70">
                                    Size: {item.size || "-"} • Color:{" "}
                                    {item.color || "-"}
                                  </p>

                                  <div className="mt-2 flex items-center gap-2">
                                    <QuantitySelector
                                      initialValue={item.quantity}
                                      min={1}
                                      max={10}
                                      size="sm"
                                      onChange={(q) =>
                                        updateQuantity(
                                          item.productId,
                                          q,
                                          item.size,
                                          item.color
                                        )
                                      }
                                    />
                                    <button
                                      className="p-2 rounded-md hover:bg-nsanity-cream transition"
                                      onClick={() =>
                                        removeFromCart(
                                          item.productId,
                                          item.size,
                                          item.color
                                        )
                                      }
                                      aria-label="Remove item"
                                      title="Remove"
                                    >
                                      <Trash2
                                        size={18}
                                        className="text-nsanity-black/65 hover:text-nsanity-red"
                                      />
                                    </button>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <div className="font-semibold">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Footer / Summary */}
                        <div className="px-4 py-4 border-t border-nsanity-gray/30 bg-white sticky bottom-0">
                          <div className="flex items-center justify-between text-sm mb-3">
                            <span className="text-nsanity-black/70">
                              Subtotal
                            </span>
                            <span className="font-semibold">
                              ${subtotal.toFixed(2)}
                            </span>
                          </div>
                          <Link
                            href={"/cart"}
                            onClick={() => setCartOpen(false)}
                          >
                            <Button variant="primary" className="w-full">
                              Proceed to checkout
                            </Button>
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
