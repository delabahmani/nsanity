"use client";
import { useSession } from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image?: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    size: string,
    color: string
  ) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedInitialCart, setHasLoadedInitialCart] = useState(false);
  const [previousStatus, setPreviousStatus] = useState<string>("loading");

  const loadCartFromLocalStorage = useCallback(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        try {
          const parsedCart = JSON.parse(storedCart);
          setCart(parsedCart);
        } catch (error) {
          console.error("Error parsing localStorage cart:", error);
          setCart([]);
        }
      } else {
        setCart([]);
      }
    }
    setHasLoadedInitialCart(true);
  }, []);

  const loadCartFromDatabase = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (data.cart && Array.isArray(data.cart)) {
        setCart(data.cart);
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error("Failed to load cart from database:", error);
      setCart([]);
    } finally {
      setIsLoading(false);
      setHasLoadedInitialCart(true);
    }
  }, []);

  const saveCartToLocalStorage = useCallback(() => {
    if (!hasLoadedInitialCart) return;

    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, hasLoadedInitialCart]);

  const saveCartToDatabase = useCallback(async () => {
    if (!hasLoadedInitialCart) return;

    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cart }),
      });
    } catch (error) {
      console.error("Failed to save cart to database:", error);
    }
  }, [cart, hasLoadedInitialCart]);

  // Only load cart on meaningful auth changes, not loading states
  useEffect(() => {
    // Only act on meaningful transitions, not loading states
    if (
      status === "authenticated" &&
      previousStatus !== "authenticated" &&
      session?.user?.email &&
      !hasLoadedInitialCart
    ) {
      loadCartFromDatabase();
    } else if (
      status === "unauthenticated" &&
      previousStatus !== "unauthenticated" &&
      !hasLoadedInitialCart
    ) {
      loadCartFromLocalStorage();
    }

    setPreviousStatus(status);
  }, [
    session,
    status,
    previousStatus,
    loadCartFromDatabase,
    loadCartFromLocalStorage,
    hasLoadedInitialCart,
  ]);

  // Prevent saves during loading transitions
  useEffect(() => {
    // Only save if cart has items OR if we're updating an existing cart
    if (
      status === "authenticated" &&
      !isLoading &&
      hasLoadedInitialCart &&
      previousStatus === "authenticated"
    ) {
      // Don't save empty cart immediately after loading - only save if cart has items
      saveCartToDatabase();
    } else if (
      status === "unauthenticated" &&
      hasLoadedInitialCart &&
      previousStatus === "unauthenticated"
    ) {
      saveCartToLocalStorage();
    }
  }, [
    cart,
    status,
    previousStatus,
    isLoading,
    hasLoadedInitialCart,
    saveCartToDatabase,
    saveCartToLocalStorage,
  ]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) =>
          i.productId === item.productId &&
          i.size === item.size &&
          i.color === item.color
      );
      if (existing) {
        return prev.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    setCart((prev) =>
      prev.filter(
        (i) =>
          !(i.productId === productId && i.size === size && i.color === color)
      )
    );
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    size: string,
    color: string
  ) => {
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId && i.size === size && i.color === color
          ? { ...i, quantity }
          : i
      )
    );
  };

  const clearCart = () => {
    setCart([]);

    // Clear from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("cart");
    }

    // Force save empty cart to db if authenticated
    if (status === "authenticated") {
      fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cart: [] }),
      }).catch(console.error);
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
