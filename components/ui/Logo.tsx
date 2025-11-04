import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  variant?: "navbar" | "footer";
  className?: string;
}

export default function Logo({
  variant = "navbar",
  className = "",
}: LogoProps) {
  const sizeClasses = variant === "navbar" ? "w-30 lg:w-36" : "w-36";
  
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <Image
        src="/images/logo.webp"
        alt="NSANITY Logo"
        width={200}
        height={200}
        quality={100}
        priority={variant === "navbar"}
        className={`${sizeClasses} h-auto object-contain`}
      />
    </Link>
  );
}
