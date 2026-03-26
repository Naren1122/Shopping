"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, ShoppingCart, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  updateCartQuantity,
  removeFromCart,
} from "@/lib/features/cart/cartSlice";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);

  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Calculate totals
  const subtotal = items.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0,
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleQuantityChange = async (
    productId: string,
    newQuantity: number,
  ) => {
    if (newQuantity < 1) return;

    setIsUpdating(productId);
    try {
      await dispatch(
        updateCartQuantity({ productId, quantity: newQuantity }),
      ).unwrap();
    } catch (error) {
      console.error("Failed to update quantity:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await dispatch(removeFromCart(productId)).unwrap();
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const handleCheckout = () => {
    onOpenChange(false);
    router.push("/checkout/address");
  };

  const handleViewCart = () => {
    onOpenChange(false);
    router.push("/cart");
  };

  // Listen for cart open events from other components
  useEffect(() => {
    const handleOpenCart = () => {
      onOpenChange(true);
    };

    window.addEventListener("open-cart-drawer", handleOpenCart);
    return () => window.removeEventListener("open-cart-drawer", handleOpenCart);
  }, [onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart {itemCount > 0 && `(${itemCount})`}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-center">
              Your cart is empty
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => {
                  const lineTotal = (item.price || 0) * item.quantity;

                  return (
                    <div
                      key={item._id}
                      className="flex gap-3 pb-4 border-b last:border-0"
                    >
                      {/* Product Image */}
                      <Link
                        href={`/products/${item._id}`}
                        onClick={() => onOpenChange(false)}
                        className="shrink-0"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item._id}`}
                          onClick={() => onOpenChange(false)}
                        >
                          <h4 className="font-medium text-sm line-clamp-2 hover:text-primary">
                            {item.name}
                          </h4>
                        </Link>
                        <p className="text-sm text-primary font-medium mt-1">
                          Rs. {(item.price || 0).toLocaleString()}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border rounded-md">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                handleQuantityChange(
                                  item._id,
                                  item.quantity - 1,
                                )
                              }
                              disabled={
                                item.quantity <= 1 || isUpdating === item._id
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                handleQuantityChange(
                                  item._id,
                                  item.quantity + 1,
                                )
                              }
                              disabled={isUpdating === item._id}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <p className="font-medium text-sm">
                            Rs. {lineTotal.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemove(item._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Footer with Totals and Buttons */}
            <div className="border-t pt-4 space-y-4">
              {/* Subtotal */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-bold text-lg">
                  Rs. {subtotal.toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Shipping and taxes calculated at checkout
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  Add to Cart
                  <ShoppingCart className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
