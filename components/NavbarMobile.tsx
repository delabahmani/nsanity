"use client";

import {
  ShoppingBasket,
  User,
  Settings,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useCart } from "./CartContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "./ui/Button";
import { signOut, useSession } from "next-auth/react";
import Logo from "./ui/Logo";


export default function NavbarMobile() {
  const {data: session} = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const { cart, clearCart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navigation = [
    { name: "home", href: "/" },
    { name: "shop", href: "/products" },
    { name: "contact", href: "/contact" },
  ];

  const hideNavbar =
    pathname?.startsWith("/auth") || pathname === "/resetPassword";

  useEffect(() => {
    if (showMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMenu]);

  const closeMenu = () => setShowMenu(false);

  if (hideNavbar) return null;

  return (
    <header
      className="fixed z-50 flex w-full flex-col bg-nsanity-cream/90 backdrop-blur-md drop-shadow-sm lg:hidden transition-all duration-300"
      style={{
        height: showMenu ? "100dvh" : "var(--header-height)",
        overflowY: showMenu ? "auto" : "hidden",
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between py-6 px-4 border-b border-nsanity-gray/30">
        <Logo variant="navbar" />

        {/* Hamburger */}
        <button
          className="flex flex-col items-center justify-center gap-1 p-2"
          onClick={() => setShowMenu(!showMenu)}
          aria-label="Toggle menu"
        >
          <div
            className="h-0.5 w-6 rounded-xl bg-nsanity-black transition-all duration-300"
            style={{
              rotate: showMenu ? "45deg" : "0deg",
              position: "relative",
              top: showMenu ? "6px" : "0px",
            }}
          />
          <div
            className="h-0.5 w-6 rounded-xl bg-nsanity-black transition-opacity"
            style={{
              opacity: showMenu ? 0 : 1,
            }}
          />
          <div
            className="h-0.5 w-6 rounded-xl bg-nsanity-black transition-all duration-300"
            style={{
              rotate: showMenu ? "-45deg" : "0deg",
              position: "relative",
              bottom: showMenu ? "6px" : "0px",
            }}
          />
        </button>
      </div>

      {/* Menu content */}
      <div
        className="flex flex-col items-center justify-start gap-6 p-6 pt-8"
        style={{
          opacity: showMenu ? 1 : 0,
          transition: "opacity 0.25s ease-in-out",
          pointerEvents: showMenu ? "auto" : "none",
        }}
      >
        {/* Nav links */}
        <nav className="flex flex-col items-center gap-4 w-full">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={closeMenu}
              className={`text-lg font-semibold w-full text-center py-2 rounded-md transition ${
                pathname === item.href
                  ? "text-nsanity-orange bg-nsanity-cream"
                  : "text-nsanity-black hover:bg-nsanity-cream/50"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="w-full h-px bg-nsanity-gray/30 my-2" />

        {/* Cart link */}
        <Link
          href="/cart"
          onClick={closeMenu}
          className="flex items-center justify-center w-full px-4 py-3 rounded-md bg-nsanity-cream hover:bg-nsanity-cream/70 transition"
        >
          <div className="flex items-center gap-2">
            <ShoppingBasket size={24} className="text-nsanity-black" />
            <span className="font-semibold text-lg">cart</span>
          </div>
          {cartCount > 0 && (
            <span className="bg-nsanity-orange text-nsanity-black text-sm rounded-full h-6 w-6 font-bold flex items-center justify-center ml-3">
              {cartCount}
            </span>
          )}
        </Link>

        <div className="w-full h-px bg-nsanity-gray/30 my-2" />

        {/* User section */}
        {session ? (
          <div className="w-full flex flex-col gap-3">
            {/* User info */}
            <div className="flex items-center gap-3 px-4 py-3 bg-nsanity-cream rounded-md">
              <div className="h-12 w-12 rounded-full bg-nsanity-orange flex items-center justify-center text-white font-bold text-lg">
                {session.user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-semibold truncate">
                  {session.user.name}
                </span>
                <span className="text-sm text-nsanity-black/60 truncate">
                  {session.user.email}
                </span>
              </div>
            </div>

            {/* User menu items */}
            <div className="flex flex-col gap-2">
              <Link
                href="/profile"
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-nsanity-cream transition"
              >
                <User size={20} className="text-nsanity-black/70" />
                <span className="font-medium">profile</span>
              </Link>

              {session.user.isAdmin && (
                <Link
                  href="/admin"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-nsanity-cream transition"
                >
                  <LayoutDashboard
                    size={20}
                    className="text-nsanity-black/70"
                  />
                  <span className="font-medium">admin</span>
                </Link>
              )}

              <Link
                href="/profile?tab=settings"
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-nsanity-cream transition"
              >
                <Settings size={20} className="text-nsanity-black/70" />
                <span className="font-medium">settings</span>
              </Link>

              <button
                onClick={() => {
                  closeMenu();
                  clearCart({ suppressDbSync: true });
                  signOut({ callbackUrl: "/" });
                }}
                className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-nsanity-cream transition text-left"
              >
                <LogOut size={20} className="text-nsanity-black/70" />
                <span className="font-medium">sign out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <Button
              variant="primary"
              onClick={() => {
                closeMenu();
                router.push("/auth/sign-in");
              }}
              className="w-full"
            >
              sign In
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
