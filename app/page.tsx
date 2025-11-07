import FeaturedProducts from "@/components/Products/FeaturedProducts";
import ModelMockup from "@/components/Products/ModelMockup";
import Button from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen nav-pad bg-linear-to-br from-[#fffbf8] via-white to-orange-50/20">
      <section className="relative">
        <div className="relative w-full h-screen sm:h-[55vh] md:h-[70vh] lg:h-[calc(100vh-72px)] overflow-hidden">
          {/* Image for larger screens */}
          <Image
            src="/images/hero.webp"
            alt="Hero"
            fill
            priority
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 100vw, 100vw"
            className="object-cover object-top md:object-center hidden sm:block"
          />

          {/* Vertical video for small screens */}
          <video
            src="/videos/hero-vid.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-ful h-ful object-cover object-center sm:hidden"
            style={{ aspectRatio: "9/16" }}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto text-center">
              <Link href="/products" className="text-xl">
                <Button variant="primary" size="xl" asChild>
                  shop now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FeaturedProducts />

      <ModelMockup />
    </div>
  );
}
