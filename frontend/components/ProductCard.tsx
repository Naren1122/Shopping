"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Heart, Check, Zap, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/lib/features/products/productsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addToCart } from "@/lib/features/cart/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/lib/features/wishlist/wishlistSlice";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);

  const isInWishlist = wishlistItems.some((item) => item._id === product._id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Open the mini-drawer for quantity selection
    window.dispatchEvent(
      new CustomEvent("open-add-to-cart-drawer", {
        detail: {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          buyNow: false,
        },
      }),
    );
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Open the mini-drawer for quantity selection with buyNow flag
    window.dispatchEvent(
      new CustomEvent("open-add-to-cart-drawer", {
        detail: {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          buyNow: true,
        },
      }),
    );
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setIsTogglingWishlist(true);
    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(product._id)).unwrap();
        setAddedToWishlist(false);
      } else {
        await dispatch(addToWishlist(product._id)).unwrap();
        setAddedToWishlist(true);
        setTimeout(() => setAddedToWishlist(false), 2000);
      }
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  // Check if product is featured
  const isFeatured = product.isFeatured === true;

  return (
    <Link href={`/products/${product._id}`}>
      <Card className="group overflow-hidden border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 h-full">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-300 ${isFeatured ? "group-hover:scale-105" : ""}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          {/* Out of Stock Badge - Only show when not featured */}
          {!isFeatured && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2">
                <PackageX className="h-4 w-4" />
                Out of Stock
              </div>
            </div>
          )}
          {/* Quick actions - Wishlist button only for unfeatured products */}
          {!isFeatured && (
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleToggleWishlist}
                disabled={isTogglingWishlist}
              >
                <Heart
                  className={`h-4 w-4 ${isInWishlist ? "fill-current text-red-500" : ""}`}
                />
              </Button>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {product.category}
            </p>
            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center justify-between">
              <p className="font-bold text-lg text-primary">
                Rs. {product.price?.toLocaleString() || "0"}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              {isFeatured ? (
                <>
                  <Button
                    className="flex-1"
                    size="sm"
                    onClick={handleAddToCart}
                    variant="outline"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Cart
                  </Button>
                  <Button
                    className="flex-1"
                    size="sm"
                    onClick={handleBuyNow}
                    disabled={isAddingToCart}
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    Buy Now
                  </Button>
                </>
              ) : (
                <Button
                  className="flex-1"
                  size="sm"
                  disabled
                  variant="secondary"
                >
                  <PackageX className="h-4 w-4 mr-1" />
                  Unavailable
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
