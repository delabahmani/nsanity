"use client";

import Button from "@/components/ui/Button";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "general",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      toast.success("Message sent successfully! We'll get back to you soon.");

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        category: "general",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg p-4 border border-nsanity-darkorange/20"
          >
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-1">
                  What&apos;s this about?
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-nsanity-darkorange rounded-md focus:outline-none focus:ring-2 focus:ring-nsanity-darkorange/50"
                >
                  <option value="general">General</option>
                  <option value="selling">Selling Help</option>
                  <option value="orders">Order Issue</option>
                  <option value="technical">Technical Problem</option>
                  <option value="business">Business Inquiry</option>
                  <option value="bug">Bug Report</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    className="w-full p-3 border border-nsanity-darkorange rounded-md focus:outline-none focus:ring-2 focus:ring-nsanity-darkorange/50"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    className="w-full p-3 border border-nsanity-darkorange rounded-md focus:outline-none focus:ring-2 focus:ring-nsanity-darkorange/50"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  placeholder="Brief description of your issue"
                  className="w-full p-3 border border-nsanity-darkorange rounded-md focus:outline-none focus:ring-2 focus:ring-nsanity-darkorange/50"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Message</label>
                <textarea
                  name="message"
                  placeholder="Describe your question or issue in detail..."
                  rows={4}
                  className="w-full p-3 border border-nsanity-darkorange rounded-md focus:outline-none focus:ring-2 focus:ring-nsanity-darkorange/50"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button
                type="submit"
                className={`${isSubmitting ? "bg-nsanity-darkorange" : ""} w-full`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </form>

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
          src={"/images/bg-2.png"}
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
