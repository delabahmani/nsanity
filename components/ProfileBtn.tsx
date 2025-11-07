import { LayoutDashboard, LogOut, Settings, User } from "lucide-react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./CartContext";

export default function ProfileBtn({ session }: { session: Session | null }) {
  const { clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const user = session?.user;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!session) return null;

  const handleMenuClick = () => setIsOpen(false);

  return (
    <div className="relative hover:cursor-pointer">
      <div>
        {user?.image ? (
          <Image
            src={user.image}
            alt="Profile Picture"
            width={24}
            height={24}
            className="rounded-full cursor-pointer w-6 h-6 lg:h-7 lg:w-7 hover:scale-105 transition"
            onClick={handleOpen}
          />
        ) : (
          <User
            className="h-6 w-6 lg:w-7 lg:h-7 link-hover"
            onClick={handleOpen}
          />
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-4 md:w-64 z-50"
          role="menu"
          aria-label="Profile menu"
          onClick={handleMenuClick}
        >
          {/* Pointer */}
          <div className="absolute right-2 -top-2 h-4 w-4 rotate-45 bg-white border border-nsanity-gray/40 shadow-sm" />

          <div className="relative rounded-2xl border border-nsanity-gray/40 bg-white shadow-xl ring-1 ring-black/5 overflow-hidden">
            {/* Header strip */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-nsanity-gray/30 bg-nsanity-cream/60">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt="Profile"
                  width={36}
                  height={36}
                  className="rounded-full h-9 w-9 object-cover"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-nsanity-cream flex items-center justify-center">
                  <User size={18} className="text-nsanity-black/70" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold truncate">
                  {user?.name || user?.email || "Account"}
                </p>
                {user?.email && (
                  <p className="text-xs text-nsanity-black/70 truncate">
                    {user.email}
                  </p>
                )}
              </div>
            </div>

            {/* Items */}
            <ul className="py-2">
              <li>
                <Link
                  href="/profile"
                  onClick={handleMenuClick}
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-nsanity-cream/50 transition"
                  role="menuitem"
                >
                  <User size={16} className="text-nsanity-black/70" />
                  <span>profile</span>
                </Link>
              </li>

              {user?.isAdmin && (
                <li>
                  <Link
                    href="/admin"
                    onClick={handleMenuClick}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-nsanity-cream/50 transition"
                    role="menuitem"
                  >
                    <LayoutDashboard
                      size={16}
                      className="text-nsanity-black/70"
                    />
                    <span>admin</span>
                  </Link>
                </li>
              )}

              <li>
                <Link
                  href="/profile?tab=settings"
                  onClick={handleMenuClick}
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-nsanity-cream/50 transition"
                  role="menuitem"
                >
                  <Settings size={16} className="text-nsanity-black/70" />
                  <span>settings</span>
                </Link>
              </li>

              <li>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    clearCart({ suppressDbSync: true });
                    signOut({ callbackUrl: "/" });
                  }}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm hover:cursor-pointer hover:bg-nsanity-cream/50 transition"
                  aria-label="Sign out"
                  role="menuitem"
                >
                  <LogOut size={16} className="text-nsanity-black/70" />
                  <span>sign out</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
