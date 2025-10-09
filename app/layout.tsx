import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavbarContainer from "@/components/NavbarContainer";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/components/CartContext";
import { FavoritesProvider } from "@/components/FavoritesContext";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <NavbarContainer />
              <Toaster position="top-center" />
              <main>{children}</main>
              <Footer />
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
