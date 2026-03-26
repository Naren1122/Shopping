"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Minus, Plus, Check, ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch } from "@/lib/hooks";
import { addToCart } from "@/lib/features/cart/cartSlice";

interface MiniDrawerProduct {
  _id: string;
  name: string;
  price: number;
  image: string;
  buyNow?: boolean;
}

interface AddToCartMiniDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: MiniDrawerProduct | null;
}

export function AddToCartMiniDrawer({
  open,
  onOpenChange,
  product,
}: AddToCartMiniDrawerProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Local quantity state - independent from cart until user clicks Add
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Check if this is a "Buy Now" flow
  const isBuyNow = product?.buyNow === true;

  // Reset quantity when product changes or drawer opens
  useEffect(() => {
    if (open && product) {
      setQuantity(1);
      setIsAdded(false);
    }
  }, [open, product]);

  // Reset state when drawer closes
  useEffect(() => {
    if (!open) {
      setQuantity(1);
      setIsAdded(false);
    }
  }, [open]);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    if (!product || isAdding) return;

    setIsAdding(true);
    try {
      // If buyNow mode, store in session storage (not cart) and redirect to checkout
      if (product.buyNow) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            "buyNowItem",
            JSON.stringify({
              _id: product._id,
              name: product.name,
              price: product.price,
              image: product.image,
              quantity: quantity,
            }),
          );
        }
        onOpenChange(false);
        router.push("/checkout/address");
        return;
      }

      // Normal add to cart flow
      await dispatch(addToCart({ productId: product._id, quantity })).unwrap();

      // Successfully added - show success state
      setIsAdded(true);

      // Reset to normal state after 2 seconds
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleViewCart = () => {
    onOpenChange(false);
    router.push("/cart");
  };

  const handleContinueShopping = () => {
    onOpenChange(false);
  };

  // Don't render if no product
  if (!product) {
    return null;
  }

  const totalPrice = (product.price || 0) * quantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="sr-only">
            Add {product.name} to Cart
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
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
            <h3 className="font-semibold text-lg line-clamp-2">
              {product.name}
            </h3>
            <p className="text-primary font-bold text-xl">
              Rs. {(product.price || 0).toLocaleString()}
            </p>
          </div>

          {/* Quantity Controls - Plus/Minus */}
          <div className="flex items-center justify-center gap-4 py-4">
            <div className="flex items-center border rounded-lg bg-background">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-r-none"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium text-lg border-x py-2">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-l-none"
                onClick={() => handleQuantityChange(quantity + 1)}
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
          <div className="pt-4 space-y-2">
            {/* Buy Now Button - shown when buyNow flag is true */}
            {product?.buyNow && (
              <Button
                className="w-full"
                size="lg"
                onClick={handleAddToCart}
                disabled={isAdding}
              >
                {isAdding ? (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2 animate-pulse" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Buy Now (Rs. {totalPrice.toLocaleString()})
                  </>
                )}
              </Button>
            )}

            {/* Add to Cart Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleAddToCart}
              disabled={isAdding}
              variant={product?.buyNow ? "outline" : "default"}
            >
              {isAdded ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Added to Cart
                </>
              ) : isAdding ? (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2 animate-pulse" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleViewCart}
            >
              View Cart
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleContinueShopping}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
