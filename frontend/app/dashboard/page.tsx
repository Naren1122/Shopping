"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { logout, initializeAuth } from "@/lib/features/auth/authSlice";
import {
  fetchAllProducts,
  Product,
} from "@/lib/features/products/productsSlice";
import { Navbar } from "@/components/Navbar";
import { DashboardHero } from "@/components/DashboardHero";
import { DashboardProducts } from "@/components/DashboardProducts";
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
      <DashboardHero
        userName={user.name.split(" ")[0]}
        products={products}
        isLoading={productsLoading}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* All Products with Pagination */}
        <DashboardProducts products={products} isLoading={productsLoading} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
