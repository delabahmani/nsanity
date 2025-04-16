import { User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ProfileBtn() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const user = session?.user;

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  if (!session) return null;

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
        <div className="absolute top-5 right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50 text-center">
          <ul
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
          >
            <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
              Profile
            </li>
            {user?.isAdmin && (
              <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                <Link href="/admin" className="block w-full h-full">
                  Admin
                </Link>
              </li>
            )}
            <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
              Settings
            </li>
            <li
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/" })}
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
