"use client";

import { useState, useEffect } from "react";
import { AddToCartMiniDrawer } from "@/components/AddToCartMiniDrawer";

interface MiniDrawerProduct {
  _id: string;
  name: string;
  price: number;
  image: string;
  buyNow?: boolean;
}

export function AddToCartMiniDrawerWrapper() {
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState<MiniDrawerProduct | null>(null);

  useEffect(() => {
    // Listen for the custom event to open the drawer
    const handleOpenDrawer = (event: CustomEvent<MiniDrawerProduct>) => {
      setProduct(event.detail);
      setOpen(true);
    };

    window.addEventListener(
      "open-add-to-cart-drawer",
      handleOpenDrawer as EventListener,
    );

    return () => {
      window.removeEventListener(
        "open-add-to-cart-drawer",
        handleOpenDrawer as EventListener,
      );
    };
  }, []);

  return (
    <AddToCartMiniDrawer open={open} onOpenChange={setOpen} product={product} />
  );
}
