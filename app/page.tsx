import FeaturedProducts from "@/components/Products/FeaturedProducts";
import Button from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen nav-pad bg-nsanity-cream/50">
      <section className="relative">
        <div className="relative w-full h-[40vh] sm:h-[55vh] md:h-[70vh] lg:h-[calc(100vh-72px)] overflow-hidden">
          <Image
            src="/images/hero.webp"
            alt="Hero"
            fill
            priority
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 100vw, 100vw"
            className="object-cover object-top md:object-center"
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
    </div>
  );
}
