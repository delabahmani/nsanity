// ...existing code...
import Image from "next/image";

export default async function ModelMockup() {
  return (
    <section className="py-1 relative z-20 mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center px-4 gap-8 md:gap-16">
        <div className="flex justify-center md:justify-start">
          <div className="w-full max-w-lg md:max-w-xl rounded-lg overflow-hidden">
            <Image
              src={"/images/bg-3.webp"}
              alt="model mockup"
              priority
              width={1200}
              height={800}
              quality={90}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        <div className="text-center md:text-left space-y-4 px-2 md:px-0">
          <h1 className="text-2xl md:text-3xl font-bold">fearless design</h1>
          <p className="text-base md:text-lg text-black/70 max-w-md mx-auto md:mx-0">
            oifjdoigjiosdjgoifjgoifdj iogjsdiogjsodi iogjsdiogdjs gio jiosdgj
            iodgj iosdgjio d
          </p>
        </div>
      </div>
    </section>
  );
}
// ...existing code...
