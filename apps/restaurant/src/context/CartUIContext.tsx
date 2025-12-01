"use client";
import React, { createContext, useCallback, useContext, useState } from "react";

type CartUIContextValue = {
  open: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

const CartUIContext = createContext<CartUIContextValue | undefined>(undefined);

export const CartUIProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);
  const toggleCart = useCallback(() => setOpen((v) => !v), []);

  return (
    <CartUIContext.Provider value={{ open, openCart, closeCart, toggleCart }}>{children}</CartUIContext.Provider>
  );
};

export function useCartUI() {
  const ctx = useContext(CartUIContext);
  if (!ctx) throw new Error("useCartUI must be used within CartUIProvider");
  return ctx;
}

export default CartUIContext;
