import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      // Create a unique cart ID based on product ID and specific image (variant)
      // If no specific image passed in product object (e.g. from shop page), use default logic
      // Note: ProductDetails should pass { ...product, image: selectedImage }
      const cartId = `${product.id}-${product.image || product.images?.[0] || 'default'}`;

      const existing = prev.find((p) => p.cartId === cartId);

      if (existing) {
        return prev.map((p) =>
          p.cartId === cartId
            ? { ...p, qty: p.qty + (product.quantity || 1) } // Handle quantity if passed
            : p
        );
      }

      // New Item
      return [...prev, { ...product, cartId, qty: product.quantity || 1 }];
    });
  };

  const removeFromCart = (idToRemove) => {
    setCart((prev) => prev.filter((p) => p.cartId !== idToRemove && p.id !== idToRemove));
  };

  const increaseQty = (cartId) => {
    console.log("Increase Qty:", cartId);
    setCart((prev) =>
      prev.map((p) =>
        p.cartId === cartId ? { ...p, qty: Number(p.qty || 0) + 1 } : p
      )
    );
  };

  const decreaseQty = (cartId) => {
    console.log("Decrease Qty:", cartId);
    setCart((prev) =>
      prev
        .map((p) => (p.cartId === cartId ? { ...p, qty: Number(p.qty || 0) - 1 } : p))
        .filter((p) => p.qty > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  /* --- COUPONS LOGIC --- */
  const [discount, setDiscount] = useState(() => {
    const saved = localStorage.getItem("discount");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (discount) {
      localStorage.setItem("discount", JSON.stringify(discount));
    } else {
      localStorage.removeItem("discount");
    }
  }, [discount]);

  const applyCoupon = async (code) => {
    try {
      if (!code) throw new Error("Veuillez entrer un code.");

      // 1. Fetch coupon from Supabase (assuming supabase client is available or imported)
      // We need to import supabase here if not already imported.
      // Since supabase is not imported in this file, we will dynamically import it or assume it's global?
      // Better: pass supabase client or import it at top.
      const { createClient } = await import("@supabase/supabase-js");
      // Actually, better to use the configured client.
      const { supabase } = await import("../lib/supabase"); // Adjust path if needed

      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.toUpperCase())
        .single();

      if (error || !data) {
        throw new Error("Code promo invalide.");
      }

      // 2. Check Expiry
      if (new Date(data.expires_at) < new Date()) {
        throw new Error("Ce code promo a expiré.");
      }

      // 3. Apply Discount
      setDiscount({
        code: data.code,
        percent: data.discount_percent
      });

      return { success: true, message: `Code ${data.code} appliqué (-${data.discount_percent}%)` };

    } catch (err) {
      console.error(err);
      return { success: false, message: err.message };
    }
  };

  const removeCoupon = () => {
    setDiscount(null);
  };

  /* --- LOYALTY LOGIC --- */
  const [usePoints, setUsePoints] = useState(() => {
    const saved = localStorage.getItem("usePoints");
    return saved === "true"; // Parse boolean
  });

  const [loyaltyAmount, setLoyaltyAmount] = useState(() => {
    const saved = localStorage.getItem("loyaltyAmount");
    return saved ? Number(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem("usePoints", usePoints);
    localStorage.setItem("loyaltyAmount", loyaltyAmount);
  }, [usePoints, loyaltyAmount]);

  const togglePoints = (shouldUse, amount = 0) => {
    setUsePoints(shouldUse);
    setLoyaltyAmount(shouldUse ? amount : 0);
  };

  const subTotal = cart.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  const couponDiscountAmount = discount ? (subTotal * discount.percent) / 100 : 0;

  // Ensure we don't discount more than the subtotal
  const totalDiscount = couponDiscountAmount + (usePoints ? loyaltyAmount : 0);
  const totalPrice = Math.max(0, subTotal - totalDiscount);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        totalPrice,
        subTotal, // Raw total before discount
        discount, // Current discount object
        applyCoupon,
        removeCoupon,
        clearCart,
        // Loyalty
        usePoints,
        loyaltyAmount,
        togglePoints
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
