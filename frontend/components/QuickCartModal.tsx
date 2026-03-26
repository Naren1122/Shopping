"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch } from "@/lib/hooks";
import {
  updateCartQuantity,
  removeFromCart,
} from "@/lib/features/cart/cartSlice";

interface QuickCartProduct {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface QuickCartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: QuickCartProduct | null;
}

export function QuickCartModal({
  open,
  onOpenChange,
  product,
}: QuickCartModalProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [quantity, setQuantity] = useState(product?.quantity || 1);
  const [isUpdating, setIsUpdating] = useState(false);

  // Reset quantity when product changes
  useEffect(() => {
    if (product) {
      setQuantity(product.quantity || 1);
    }
  }, [product]);

  // Listen for quick cart events
  useEffect(() => {
    const handleOpenQuickCart = (e: Event) => {
      onOpenChange(true);
    };

    window.addEventListener(
      "open-quick-cart",
      handleOpenQuickCart as EventListener,
    );
    return () =>
      window.removeEventListener(
        "open-quick-cart",
        handleOpenQuickCart as EventListener,
      );
  }, [onOpenChange]);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || !product || isUpdating) return;

    setIsUpdating(true);
    try {
      await dispatch(
        updateCartQuantity({ productId: product._id, quantity: newQuantity }),
      ).unwrap();
      setQuantity(newQuantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleContinueShopping = () => {
    onOpenChange(false);
  };

  const handleViewCart = () => {
    onOpenChange(false);
    router.push("/cart");
  };

  // Don't render if no product
  if (!product) {
    return null;
  }

  const totalPrice = (product.price || 0) * quantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Added to Cart</DialogTitle>
        </DialogHeader>

        {/* Product Image */}
        <div className="flex justify-center py-4">
          <div className="w-48 h-48 rounded-lg overflow-hidden bg-muted">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-lg">{product.name}</h3>
          <p className="text-primary font-bold text-xl">
            Rs. {(product.price || 0).toLocaleString()}
          </p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-center gap-4 py-4">
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isUpdating}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-medium text-lg">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isUpdating}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Total Price */}
        <div className="text-center py-2 border-t">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="font-bold text-2xl">
            Rs. {totalPrice.toLocaleString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <Button className="w-full" size="lg" onClick={handleViewCart}>
            <ShoppingCart className="h-5 w-5 mr-2" />
            View Cart
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleContinueShopping}
          >
            Continue Shopping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
