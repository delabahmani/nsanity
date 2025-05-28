import { User } from "lucide-react";
import { Session } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function ProfileBtn({ session }: { session: Session | null }) {
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
    <div className="relative">
      <div>
        {user?.image ? (
          <Image
            src={user.image}
            alt="Profile Picture"
            width={24}
            height={24}
            className="rounded-full cursor-pointer"
            onClick={handleOpen}
          />
        ) : (
          <User className="h-6 w-6  link-hover" onClick={handleOpen} />
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-5 right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50 text-center"
        >
          <ul
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
          >
            <li
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              onClick={handleMenuClick}
            >
              Profile
            </li>
            {user?.isAdmin && (
              <li
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                onClick={handleMenuClick}
              >
                <Link href="/admin" className="block w-full h-full">
                  Admin
                </Link>
              </li>
            )}
            <li
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              onClick={handleMenuClick}
            >
              Settings
            </li>
            <li
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              aria-label="Sign out"
            >
              Sign Out
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
