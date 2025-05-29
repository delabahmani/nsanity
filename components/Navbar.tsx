"use client";
import { ShoppingBasket } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pop, setPop] = useState(false);

  const [cartOpen, setCartOpen] = useState(false);

  const { cart, removeFromCart, updateQuantity } = useCart();
  const cartRef = useRef<HTMLDivElement>(null);
  const path = usePathname();
  const prevCount = useRef(0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
    { name: "about", href: "/about", current: path === "/about" },
    { name: "contact", href: "/contact", current: path === "/contact" },
  ];

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

            <div className="relative">
              <Button
                className="text-sm font-semibold leading-6 text-nsanity-black relative"
                onClick={(e) => {
                  e.preventDefault();
                  setCartOpen((open) => !open);
                }}
                aria-label="Open Cart"
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
                  className="lg:min-w-[400px] max-w-[300px] min-w-80 bg-nsanity-cream absolute right-0 mt-2 max-h-[500px] shadow-md rounded-lg z-50 border-2 border-nsanity-darkorange"
                >
                  <div className="p-3 border-b-2 border-b-nsanity-darkorange font-semibold text-lg flex justify-between items-center">
                    cart
                    <span className="text-sm text-black/80">
                      {cart.length} item{cart.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {cart.length === 0 ? (
                    <div className="p-3  font-semibold text-center text-black ">
                      your cart is empty!
                    </div>
                  ) : (
                    <div className="p-2">
                      {cart.map((item) => (
                        <div
                          key={
                            item.productId +
                            (item.size ?? "") +
                            (item.color ?? "")
                          }
                          className=""
                        >
                          <div className="flex items-center gap-3">
                            <Image
                              src={item.image || "/images/placeholder.webp"}
                              alt={item.name}
                              width={100}
                              height={100}
                              quality={100}
                              className="rounded border lg:w-20 lg:h-20 object-cover"
                            />

                            <div>
                              <p className="font-semibold">{item.name}</p>
                              <p>
                                size: {item.size || "-"} | color:{" "}
                                {item.color || "-"}
                              </p>

                              <div className="flex items-center gap-2">
                                <QuantitySelector
                                  initialValue={item.quantity}
                                  min={1}
                                  max={10}
                                  size="sm"
                                  onChange={(newQuantity) =>
                                    updateQuantity(
                                      item.productId,
                                      newQuantity,
                                      item.size,
                                      item.color
                                    )
                                  }
                                />
                                <Button
                                  className="ml-2 flex items-center justify-center"
                                  onClick={() =>
                                    removeFromCart(
                                      item.productId,
                                      item.size,
                                      item.color
                                    )
                                  }
                                  aria-label="Remove Item"
                                  variant="ghost"
                                >
                                  <Trash2
                                    size={25}
                                    className="text-nsanity-black/65 hover:text-nsanity-red"
                                  />
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="">
                            <p>${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}

                      <div className="p-3 flex justify-between items-center font-semibold border-t-2 border-t-nsanity-darkorange ">
                        <h2 className="">subtotal</h2>
                        <span>
                          ${" "}
                          {cart
                            .reduce(
                              (sum, item) => sum + item.price * item.quantity,
                              0
                            )
                            .toFixed(2)}
                        </span>
                      </div>

                      <div>
                        <Link href={"/cart"}>
                          <Button
                            variant="primary"
                            className="w-full hover:scale-[101%]"
                            size="sm"
                          >
                            Checkout
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
