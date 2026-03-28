"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { initializeAuth } from "@/lib/features/auth/authSlice";
import { fetchRecommendations } from "@/lib/features/recommendations/recommendationsSlice";
import { addToCart } from "@/lib/features/cart/cartSlice";
import { addToWishlist } from "@/lib/features/wishlist/wishlistSlice";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function RecommendationsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
  } = useAppSelector((state) => state.auth);
  const {
    recommendations,
    isLoading: recLoading,
    error,
  } = useAppSelector((state) => state.recommendations);

  // Check auth and fetch recommendations
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          dispatch(initializeAuth({ user: parsedUser, token }));
        } catch {
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, authLoading, dispatch, router]);

  // Fetch recommendations when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchRecommendations());
    }
  }, [isAuthenticated, dispatch]);

  // Show error if any
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleAddToCart = (productId: string) => {
    dispatch(addToCart({ productId, quantity: 1 }));
    toast.success("Added to cart!", {
      icon: "✓",
    });
  };

  const handleAddToWishlist = (productId: string) => {
    dispatch(addToWishlist(productId));
    toast.success("Added to wishlist!", {
      icon: "♥",
    });
  };

  const handleRefresh = () => {
    dispatch(fetchRecommendations());
    toast.info("Refreshing recommendations...", {
      icon: <RefreshCw className="h-4 w-4" />,
    });
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render if redirecting
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Link */}
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Recommended for You</h1>
                <p className="text-muted-foreground">
                  AI-powered personalized suggestions based on your preferences
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Loading State */}
          {recLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recommendations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No recommendations yet
                </h3>
                <p className="text-muted-foreground mb-4 text-center">
                  Browse some products and add items to your wishlist to get
                  personalized recommendations.
                </p>
                <Link href="/products">
                  <Button>Browse Products</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendations.map((rec) => (
                <Card
                  key={rec.productId}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <Link href={`/products/${rec.productId}`}>
                    <div className="h-48 bg-muted relative overflow-hidden">
                      {rec.product.image ? (
                        <img
                          src={rec.product.image}
                          alt={rec.product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Sparkles className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {/* AI Reason Badge */}
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                        {rec.reason}
                      </div>
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <Link href={`/products/${rec.productId}`}>
                      <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors line-clamp-1">
                        {rec.product.name}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                      {rec.product.description}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold text-primary">
                        Rs. {rec.product.price?.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {rec.product.stock > 0
                          ? `${rec.product.stock} in stock`
                          : "Out of stock"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        size="sm"
                        onClick={() => handleAddToCart(rec.productId)}
                        disabled={rec.product.stock <= 0}
                      >
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddToWishlist(rec.productId)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Info Section */}
          <div className="mt-12 p-6 bg-muted/50 rounded-xl">
            <h3 className="font-semibold mb-2">How recommendations work</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                Our AI analyzes your browsing history and wishlist
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                Products are matched based on your interests and preferences
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                Click refresh to get new recommendations
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
