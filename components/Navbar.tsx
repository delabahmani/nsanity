"use client";
import { ShoppingBasket, User } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const path = usePathname();
  const { data: session, status } = useSession();

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
            {status === "loading" ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent " />
            ) : session ? (
              <Link
                href={"/account"}
                className="text-sm font-semibold text-nsanity-black link-hover"
              >
                <User className="h-6 w-6 link-hover" />
              </Link>
            ) : (
              <Link
                href={"/auth/sign-in"}
                className="text-sm font-semibold text-nsanity-black link-hover"
              >
                sign in
              </Link>
            )}

            <Link
              href={"/cart"}
              className="text-sm font-semibold leading-6 text-nsanity-black "
            >
              <ShoppingBasket className="h-6 w-6 link-hover" />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
