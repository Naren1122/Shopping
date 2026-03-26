"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { logout, initializeAuth } from "@/lib/features/auth/authSlice";
import {
  fetchAllProducts,
  fetchFeaturedProducts,
  Product,
} from "@/lib/features/products/productsSlice";
import { Navbar } from "@/components/Navbar";
import { DashboardHero } from "@/components/DashboardHero";
import { FeaturedProductsSlider } from "@/components/FeaturedProductsSlider";
import { Footer } from "@/components/Footer";

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth,
  );
  const {
    products,
    featuredProducts,
    isLoading: productsLoading,
  } = useAppSelector((state) => state.products);

  useEffect(() => {
    // Helper function to check and handle auth
    const checkAuth = () => {
      // Check if user is authenticated
      if (isAuthenticated) {
        // Redirect admins to admin dashboard
        if (user?.role === "admin") {
          router.push("/admin");
          return false;
        }
        // Allow customers to access
        return true;
      }

      // Check for existing auth in localStorage
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          // Redirect admins to admin dashboard
          if (parsedUser.role === "admin") {
            router.push("/admin");
            return false;
          }
          // Initialize auth for customers
          dispatch(initializeAuth({ user: parsedUser, token }));
          return true;
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
          return false;
        }
      }

      // Not authenticated - redirect to login
      router.push("/login");
      return false;
    };

    // Skip if still loading initial auth state
    if (isLoading) return;

    // Check auth
    checkAuth();
  }, [isLoading, isAuthenticated, user, dispatch, router]);

  // Fetch all products on mount (includes both featured and unfeatured)
  useEffect(() => {
    dispatch(fetchAllProducts({}));
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully!", {
      description: "See you soon!",
      icon: "✓",
    });
    router.push("/");
  };

  // Show loading while checking auth
  if (isLoading) {
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
      {/* Navigation - Same as main page but with auth-aware content */}
      <Navbar />

      {/* Personalized Hero Section */}
      <DashboardHero userName={user.name.split(" ")[0]} />

      {/* Main Content */}
      <main className="flex-1">
        {/* Featured Products for User */}
        <FeaturedProductsSlider
          products={products}
          isLoading={productsLoading}
        />

        {/* Continue Shopping CTA */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Ready to Shop More?</h2>
              <p className="text-muted-foreground mb-6">
                Discover amazing products at great prices
              </p>
              <Link href="/products">
                <Button size="lg">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Browse All Products
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
