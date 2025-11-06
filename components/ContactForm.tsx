"use client";

import Button from "@/components/ui/Button";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ContactForm() {
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to send message. Please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
  );
}
