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
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-primary">
              Products
            </Link>
            <span>/</span>
            <span className="text-foreground">{currentProduct.name}</span>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Image */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
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
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category */}
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                {currentProduct.category}
              </p>

              {/* Product Name */}
              <h1 className="text-3xl md:text-4xl font-bold">
                {currentProduct.name}
              </h1>

              {/* Price */}
              <p className="text-3xl font-bold text-primary">
                Rs. {currentProduct.price?.toLocaleString() || "0"}
              </p>

              {/* Description */}
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground">
                  {currentProduct.description || "No description available."}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <p className="font-medium">Quantity:</p>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={increaseQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons - Show based on isFeatured */}
              {currentProduct.isFeatured ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    variant="outline"
                  >
                    {addedToCart ? (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={handleBuyNow}
                    disabled={isAddingToCart}
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Buy Now
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1"
                    disabled
                  >
                    <Heart className="h-5 w-5 mr-2 text-muted-foreground" />
                    Wishlist
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="flex-1"
                    disabled
                    variant="secondary"
                  >
                    <PackageX className="h-5 w-5 mr-2" />
                    Out of Stock
                  </Button>
                  <Button
                    size="lg"
                    variant={isInWishlist ? "default" : "outline"}
                    className="flex-1"
                    onClick={handleAddToWishlist}
                    disabled={isAddingToWishlist}
                  >
                    <Heart
                      className={`h-5 w-5 mr-2 ${
                        isInWishlist ? "fill-current" : ""
                      }`}
                    />
                    {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
                  </Button>
                </div>
              )}

              {/* Product Details Card */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold">Product Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-medium">{currentProduct.category}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Featured</p>
                      <p className="font-medium">
                        {currentProduct.isFeatured ? "Yes" : "No"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Added On</p>
                      <p className="font-medium">
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
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            <ReviewsList productId={productId} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
