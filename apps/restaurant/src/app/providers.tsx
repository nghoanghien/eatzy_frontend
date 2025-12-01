"use client";
import { QueryProvider } from "@repo/lib";
import { ThemeProvider, LoadingProvider } from "@repo/ui";
import { CartUIProvider } from "@/context/CartUIContext";
import CartOverlay from "@/components/cart/CartOverlay";
import { CartButton } from "@/components/cart";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <LoadingProvider>
          <CartUIProvider>
            {children}
            <CartOverlay />
            <CartButton />
          </CartUIProvider>
        </LoadingProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}