"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Trash2,
  PackageX,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchWishlist,
  removeFromWishlist,
  WishlistItem,
} from "@/lib/features/wishlist/wishlistSlice";
import { addToCart } from "@/lib/features/cart/cartSlice";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function WishlistPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    items: wishlistItems,
    isLoading,
    error,
  } = useAppSelector((state) => state.wishlist);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    // Fetch wishlist on mount
    dispatch(fetchWishlist());
  }, [dispatch, isAuthenticated, router]);

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    }
  };

  const handleAddToCart = async (product: WishlistItem) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    try {
      await dispatch(
        addToCart({ productId: product._id, quantity: 1 }),
      ).unwrap();
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-lg mb-4" />
                <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                <div className="h-6 bg-muted rounded w-1/4" />
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
          <p className="text-muted-foreground">
            {wishlistItems.length}{" "}
            {wishlistItems.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Wishlist Grid */}
        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item, index) => {
              const isFeatured = item.isFeatured === true;
              return (
                <Card
                  key={item._id || `wishlist-${index}`}
                  className="overflow-hidden border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                    {/* Out of Stock Badge */}
                    {!isFeatured && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="bg-destructive text-destructive-foreground px-3 py-1.5 rounded-full font-semibold text-sm flex items-center gap-1.5">
                          <PackageX className="h-3.5 w-3.5" />
                          Out of Stock
                        </div>
                      </div>
                    )}
                    {/* Remove Button */}
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        console.log(
                          "Remove button clicked, item ID:",
                          item._id,
                        );
                        handleRemoveFromWishlist(item._id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  {/* Product Info */}
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      {item.category || "Uncategorized"}
                    </p>
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                      {item.name || "Unknown Product"}
                    </h3>
                    <p className="font-bold text-lg text-primary mb-3">
                      Rs. {item.price ? item.price.toLocaleString() : "0"}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {isFeatured ? (
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handleAddToCart(item)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1.5" />
                          Add to Cart
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full"
                          disabled
                          variant="secondary"
                        >
                          <PackageX className="h-4 w-4 mr-1.5" />
                          Unavailable
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveFromWishlist(item._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Heart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Save your favorite products to your wishlist and they will appear
              here. Start shopping to add items!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/products">
                <Button>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Browse Products
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Go to Homepage</Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
