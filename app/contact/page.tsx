import Image from "next/image";
import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "contact | nsanity",
  description: "reach out!",
};

export default function Contact() {
  return (
    <div className="flex min-h-screen bg-[#fffbf8] w-full nav-pad">
      <div className="max-lg:w-full flex items-center justify-center lg:w-2/3 h-full p-3">
        <div className="w-full max-w-sm xl:max-w-xl">
          <h1 className="text-nsanity-black font-bold text-3xl text-center mb-2">
            contact us
          </h1>

          {/* Quick help */}
          <div className="bg-white rounded-lg p-4 mb-4 border border-nsanity-darkorange/20">
            <h2 className="font-semibold mb-2 text-nsanity-darkorange">
              Need quick help?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="self-start">
                <h3 className="font-medium text-black mb-2 leading-none">
                  For Sellers:
                </h3>
                <ul className="space-y-1 text-nsanity-black/75">
                  <li>• How to create products</li>
                  <li>• Design Canvas help</li>
                  <li>• Printful integration</li>
                  <li>• Store setup</li>
                </ul>
              </div>
              <div className="self-start">
                <h3 className="font-medium text-black mb-2 leading-none">
                  For Buyers:
                </h3>
                <ul className="space-y-1 text-nsanity-black/75">
                  <li>• Order tracking</li>
                  <li>• Size guides</li>
                  <li>• Returns & exchanges</li>
                  <li>• Payment issues</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <ContactForm />

          <div className="text-center mt-4 text-sm text-nsanity-black/75">
            <p>We typically respond within 24 hours</p>
            <p>
              For urgent issues, expect a response within 4 hours during
              business days
            </p>
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="relative max-lg:hidden w-full">
        <Image
          src={"/images/bg-2.webp"}
          alt="Background image"
          fill
          priority
          className="object-cover"
          quality={100}
        />
      </div>
    </div>
  );
}
