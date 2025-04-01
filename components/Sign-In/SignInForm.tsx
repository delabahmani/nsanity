"use client";

import { signIn } from "next-auth/react";
import Button from "../ui/Button";
import Image from "next/image";

export default function SignInForm() {
  return (
    <div className="nav-pad bg-nsanity-cream min-h-screen w-full flex justify-center items-center flex-col">
      <div className="flex items-center justify-center gap-y-5 flex-col">
        <h1 className="font-bold text-4xl">welcome to nsanity</h1>
        <p className="font-semibold text-black/60">
          sign in to track orders and fave items
        </p>
      </div>

      <div className="mt-15">
        <Button
          variant="primary"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="gap-3 text-xl flex items-center justify-center h-13"
        >
          <Image
            src="/images/google-logo.webp"
            priority
            alt="Google Logo"
            aria-label="Google Logo"
            width={20}
            height={20}
            quality={100}
            className="max-lg:h-6 max-lg:w-6"
          />
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
