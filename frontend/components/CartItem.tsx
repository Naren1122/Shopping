"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CartItem as CartItemType } from "@/lib/features/cart/cartSlice";
import { useAppDispatch } from "@/lib/hooks";
import {
  updateCartQuantity,
  removeFromCart,
} from "@/lib/features/cart/cartSlice";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || isUpdating) return;

    setIsUpdating(true);
    try {
      await dispatch(
        updateCartQuantity({ productId: item._id, quantity: newQuantity }),
      ).unwrap();
    } catch (error) {
      console.error("Failed to update quantity:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (isRemoving) return;

    setIsRemoving(true);
    try {
      await dispatch(removeFromCart(item._id)).unwrap();
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleBuyNow = () => {
    // Store this specific item for checkout (not all cart items)
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "buyNowItem",
        JSON.stringify({
          _id: item._id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
        }),
      );
    }
    router.push("/checkout/address");
  };

  const lineTotal = item.price * item.quantity;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <Link href={`/products/${item._id}`} className="shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-muted">
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
            <Link href={`/products/${item._id}`}>
              <h3 className="font-medium text-sm md:text-base line-clamp-2 hover:text-primary transition-colors">
                {item.name}
              </h3>
            </Link>
            <p className="text-muted-foreground text-sm mt-1">
              {item.category}
            </p>

            {/* Price and Quantity Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
              {/* Price */}
              <p className="font-bold text-lg text-primary">
                Rs. {item.price?.toLocaleString() || "0"}
              </p>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(item.quantity - 1)}
                    disabled={item.quantity <= 1 || isUpdating}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(item.quantity + 1)}
                    disabled={isUpdating}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={handleRemove}
                  disabled={isRemoving}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Buy Now Button */}
            <div className="mt-3">
              <Button size="sm" className="w-full" onClick={handleBuyNow}>
                <CreditCard className="h-4 w-4 mr-2" />
                Buy Now
              </Button>
            </div>
          </div>

          {/* Line Total (mobile-friendly) */}
          <div className="hidden sm:block text-right shrink-0">
            <p className="text-sm text-muted-foreground">Subtotal</p>
            <p className="font-bold text-lg">
              Rs. {lineTotal.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Mobile Line Total */}
        <div className="flex sm:hidden justify-end mt-3 pt-3 border-t">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Subtotal</p>
            <p className="font-bold text-lg">
              Rs. {lineTotal.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
