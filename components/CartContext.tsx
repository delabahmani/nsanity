"use client";
import { useSession } from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
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
  clearCart: (options?: { suppressDbSync?: boolean }) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedInitialCart, setHasLoadedInitialCart] = useState(false);
  const [previousStatus, setPreviousStatus] = useState<string>("loading");

  const suppressDbSyncRef = useRef(false);
  const signOutInProgressRef = useRef(false);

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      session?.user?.email
    ) {
      setHasLoadedInitialCart(false);
      loadCartFromDatabase();
    } else if (
      status === "unauthenticated" &&
      previousStatus !== "unauthenticated"
    ) {
      setHasLoadedInitialCart(false);
      loadCartFromLocalStorage();

      if (signOutInProgressRef.current) {
        signOutInProgressRef.current = false;
      }
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

  // Prevent saves during loading transitions or sign-out window
  useEffect(() => {
    if (!hasLoadedInitialCart) return;

    // If we’re in the sign-out window, block any save (dev StrictMode safe)
    if (signOutInProgressRef.current) {
      return;
    }

    // Skip a single DB sync when explicitly suppressed
    if (suppressDbSyncRef.current) {
      suppressDbSyncRef.current = false;
      return;
    }

    if (
      status === "authenticated" &&
      !isLoading &&
      previousStatus === "authenticated"
    ) {
      saveCartToDatabase();
    } else if (
      status === "unauthenticated" &&
      previousStatus === "unauthenticated"
    ) {
      // Guest persistence
      if (typeof window !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(cart));
      }
    }
  }, [
    cart,
    status,
    previousStatus,
    isLoading,
    hasLoadedInitialCart,
    saveCartToDatabase,
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

  const clearCart = (options?: { suppressDbSync?: boolean }) => {
    // When signing out, suppress DB syncs until auth becomes unauthenticated
    if (options?.suppressDbSync) {
      suppressDbSyncRef.current = true;
      signOutInProgressRef.current = true; // [ADD]
    }

    setCart([]);

    if (typeof window !== "undefined") {
      localStorage.removeItem("cart");
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
