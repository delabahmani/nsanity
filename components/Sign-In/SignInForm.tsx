"use client";

import { signIn } from "next-auth/react";
import Button from "../ui/Button";
import Image from "next/image";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import Modal from "../Modal";

export default function SignInForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password states
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      // Registration
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (data.success) {
          toast.success(data.message);
          setIsSignUp(false);
          setName("");
          setPassword("");
          setEmail("");
          setShowPassword(false);
        } else {
          toast.error(data.error);
        }
      } catch (registrationError) {
        console.error("Registration failed:", registrationError);
        toast.error("Registration failed. Please try again.");
      }
    } else {
      // Sign in
      try {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          toast.error("Invalid email or password. Please try again.");
        } else {
          toast.success("Welcome back!");
          window.location.href = "/";
        }
      } catch (signInError: unknown) {
        console.error("Sign in failed:", signInError);
        const errorMessage =
          signInError instanceof Error
            ? signInError.message
            : "Sign in failed. Please try again.";
        toast.error(errorMessage);
      }
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Reset link sent! Check your email.");
        setShowForgot(false);
        setResetEmail("");
      } else {
        toast.error(data.error || "Could not send reset link.");
      }
    } catch (err) {
      toast.error("Error sending reset link.");
      console.error("An error occurred during sign in: ", err);
    }
    setForgotLoading(false);
  };

  return (
    <div className="nav-pad bg-nsanity-cream min-h-screen w-full flex justify-center items-center flex-col">
      <div className="flex items-center justify-center gap-y-5 flex-col mb-8">
        <h1 className="font-bold text-4xl">welcome to nsanity</h1>
        <p className="font-semibold text-black/60">
          {isSignUp
            ? "create an account to get started"
            : "sign in to track orders and fave items"}
        </p>
      </div>

      {/* Email/Password Form */}
      <div className="w-full max-w-md mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nsanity-orange focus:border-transparent"
              required
              disabled={loading}
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nsanity-orange focus:border-transparent"
            required
            disabled={loading}
          />
          {/* Password Input with Show/Hide Toggle */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={
                isSignUp ? "Password (min 6 characters)" : "Password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nsanity-orange focus:border-transparent"
              minLength={isSignUp ? 6 : 1}
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full h-12 text-lg"
          >
            {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
          </Button>

          {/* Forgot password btn */}
          {!isSignUp && (
            <div className="text-right mt-2">
              <Button
                type="button"
                variant="ghost"
                className="text-nsanity-darkorange underline text-sm"
                onClick={() => setShowForgot(true)}
                disabled={loading}
              >
                Forgot password?
              </Button>
            </div>
          )}
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setName("");
              setEmail("");
              setPassword("");
              setShowPassword(false); // Reset password visibility when switching
            }}
            className="text-black/60 hover:text-black transition-colors font-medium"
            disabled={loading}
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>

      <div className="flex items-center w-full max-w-md mb-6">
        <hr className="flex-1 border-gray-300" />
        <span className="px-4 text-black/60 font-medium">or</span>
        <hr className="flex-1 border-gray-300" />
      </div>

      {/* Google OAuth */}
      <Button
        variant="primary"
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="gap-3 text-xl flex items-center justify-center h-13"
        disabled={loading}
      >
        <Image
          src="/images/google-logo.webp"
          priority
          alt="Google Logo"
          aria-label="Google Logo"
          width={20}
          height={20}
          quality={100}
          className="max-lg:h-6 max-lg:w-6"
        />
        Continue with Google
      </Button>

      {/* Forgot password modal */}
      <Modal
        isOpen={showForgot}
        onClose={() => setShowForgot(false)}
        title="Reset your password"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className="w-full p-3 border border-nsanity-gray rounded-lg"
            required
            disabled={forgotLoading}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={forgotLoading}
            className="w-full"
          >
            {forgotLoading ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
