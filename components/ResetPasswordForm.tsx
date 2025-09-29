"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Password reset! You can now sign in.");
        setNewPassword("");
        setTimeout(() => {
          router.push("/auth/sign-in");
        }, 1500);
      } else {
        toast.error(data.error || "Could not reset password.");
      }
    } catch (err) {
      console.error("Reset password error: ", err);
      toast.error("Error resetting password.");
    }
    setLoading(false);
  };

  return (
    <div className="nav-pad bg-nsanity-cream min-h-screen w-full flex justify-center items-center flex-col">
      <h1 className="font-bold text-2xl mb-4">reset your password</h1>

      <form onSubmit={handleReset} className="space-y-4">
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-3 border border-nsanity-gray rounded-lg"
          minLength={6}
          required
          disabled={loading}
        />
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="w-full"
        >
          {loading ? "Resetting..." : "Reset password"}
        </Button>
      </form>
    </div>
  );
}
