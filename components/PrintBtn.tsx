"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="text-sm text-nsanity-orange hover:underline font-medium cursor-pointer flex items-center gap-2"
    >
      <Printer size={14} /> Print Receipt
    </button>
  );
}
