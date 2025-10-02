"use client";

import SignInForm from "@/components/Sign-In/SignInForm";
import Image from "next/image";

export default function SignIn() {
  return (
    <div className="flex min-h-screen w-full">
      <div className="max-lg:w-full flex items-center justify-center lg:w-2/3 h-full  ">
        <SignInForm />
      </div>

      <div className="relative max-lg:hidden w-full">
        <Image
          src={"/images/bg-1.webp"}
          alt="Background Image"
          fill
          priority
          className="object-cover"
          quality={100}
        />
      </div>
    </div>
  );
}
