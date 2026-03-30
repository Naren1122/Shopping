"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart,
  Heart,
  ChevronLeft,
  Minus,
  Plus,
  Check,
  CreditCard,
  PackageX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ReviewsList } from "@/components/ReviewsList";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchProductById } from "@/lib/features/products/productsSlice";
import { addToCart } from "@/lib/features/cart/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/lib/features/wishlist/wishlistSlice";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { currentProduct, isLoading, error } = useAppSelector(
    (state) => state.products,
  );
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);

  const productId = params?.id as string;

  useEffect(() => {
    if (productId) {
      dispatch(fetchProductById(productId));

      // Track browsing history if user is authenticated
      const token = localStorage.getItem("token");
      if (token) {
        fetch("http://localhost:5000/api/auth/track-view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId }),
          credentials: "include",
        }).catch(() => {
          // Silently fail - tracking is non-critical
        });
      }
    }
  }, [dispatch, productId]);

  // Check if product is in wishlist
  const isInWishlist = wishlistItems.some((item) => item._id === productId);

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setIsAddingToCart(true);
    try {
      await dispatch(addToCart({ productId, quantity })).unwrap();
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setIsAddingToCart(true);
    try {
      await dispatch(addToCart({ productId, quantity })).unwrap();
      router.push("/checkout/address");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setIsAddingToWishlist(true);
    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(productId)).unwrap();
        setAddedToWishlist(false);
      } else {
        await dispatch(addToWishlist(productId)).unwrap();
        setAddedToWishlist(true);
        setTimeout(() => setAddedToWishlist(false), 2000);
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !currentProduct) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The product you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Button onClick={() => window.history.back()}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Page Header with gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-teal-500/10 via-primary/5 to-amber-500/10 py-6">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-200/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-200/30 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto px-4 relative">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Product Details
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Image */}
            <div className="relative flex items-center justify-center">
              <div className="relative aspect-square max-w-md rounded-xl overflow-hidden bg-muted shadow-md">
                {currentProduct.image ? (
                  <img
                    src={currentProduct.image}
                    alt={currentProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <span className="text-4xl">No Image</span>
                  </div>
                )}
                {/* Featured Badge */}
                {currentProduct.isFeatured && (
                  <div className="absolute top-3 left-3 bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-md">
                    Featured
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              {/* Category */}
              <p className="text-xs font-medium text-teal-600 uppercase tracking-wider">
                {currentProduct.category}
              </p>

              {/* Product Name */}
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                {currentProduct.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-teal-600">
                  Rs. {currentProduct.price?.toLocaleString() || "0"}
                </p>
              </div>

              {/* Description */}
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground text-sm">
                  {currentProduct.description || "No description available."}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-3 py-3 border-y border-gray-100 dark:border-gray-800">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantity:
                </p>
                <div className="flex items-center border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="h-9 w-9 rounded-none hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center font-bold text-sm">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={increaseQuantity}
                    className="h-9 w-9 rounded-none hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentProduct.isFeatured ? "In Stock" : "Out of Stock"}
                </p>
              </div>

              {/* Action Buttons - Show based on isFeatured */}
              {currentProduct.isFeatured ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    className="flex-1 h-11 text-sm"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    variant="outline"
                  >
                    {addedToCart ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 h-11 text-sm bg-[lab(6.13658_22.6572_-45.619)] hover:bg-[lab(5.5_20_-40)]"
                    onClick={handleBuyNow}
                    disabled={isAddingToCart}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Buy Now
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 h-11 text-sm"
                    disabled
                  >
                    <Heart className="h-4 w-4 mr-2 text-muted-foreground" />
                    Wishlist
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    className="flex-1 h-11 text-sm"
                    disabled
                    variant="secondary"
                  >
                    <PackageX className="h-4 w-4 mr-2" />
                    Out of Stock
                  </Button>
                  <Button
                    size="lg"
                    variant={isInWishlist ? "default" : "outline"}
                    className={`flex-1 h-11 text-sm ${
                      isInWishlist ? "bg-red-500 hover:bg-red-600" : ""
                    }`}
                    onClick={handleAddToWishlist}
                    disabled={isAddingToWishlist}
                  >
                    <Heart
                      className={`h-4 w-4 mr-2 ${
                        isInWishlist ? "fill-current" : ""
                      }`}
                    />
                    {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
                  </Button>
                </div>
              )}

              {/* Product Details Card */}
              <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-sm">Product Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded shadow-sm">
                      <p className="text-muted-foreground text-[10px]">
                        Category
                      </p>
                      <p className="font-medium text-xs">
                        {currentProduct.category}
                      </p>
                    </div>
                    <div className="p-2 bg-white dark:bg-gray-800 rounded shadow-sm">
                      <p className="text-muted-foreground text-[10px]">
                        Status
                      </p>
                      <p className="font-medium text-xs">
                        {currentProduct.isFeatured ? (
                          <span className="text-teal-600">In Stock</span>
                        ) : (
                          <span className="text-red-500">Out of Stock</span>
                        )}
                      </p>
                    </div>
                    <div className="p-2 bg-white dark:bg-gray-800 rounded shadow-sm col-span-2">
                      <p className="text-muted-foreground text-[10px]">
                        Added On
                      </p>
                      <p className="font-medium text-xs">
                        {currentProduct.createdAt
                          ? new Date(
                              currentProduct.createdAt,
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-8">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-lg font-bold">Customer Reviews</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-teal-500/50 to-transparent" />
            </div>
            <ReviewsList productId={productId} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
