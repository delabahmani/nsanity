import Button from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen nav-pad">
      <section className="relative h-[80vh] flex items-center justify-center">
        <div className="relative z-10">
          <Image
            src={"/images/hero.webp"}
            alt="Logo"
            width={2000}
            height={2000}
            quality={100}
            priority
            className="w-full h-auto "
          />
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
            <Link href="/products" className="text-xl">
              <Button variant="primary" size="xl" asChild>
                shop now
              </Button>
            </Link>
          </span>
        </div>
      </section>
    </div>
  );
}
