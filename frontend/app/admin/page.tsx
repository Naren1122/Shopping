"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { logout, initializeAuth } from "@/lib/features/auth/authSlice";

export default function AdminDashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    // Helper function to check and handle auth
    const checkAuth = () => {
      // Check if user is authenticated and is admin
      if (isAuthenticated && user?.role === "admin") {
        return true;
      }

      // Check for existing auth in localStorage
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.role === "admin") {
            // Initialize auth and allow access
            dispatch(initializeAuth({ user: parsedUser, token }));
            return true;
          } else {
            // User is not admin
            toast.error("Access denied. Admin only.");
            router.push("/dashboard");
            return false;
          }
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
          return false;
        }
      }

      // Not authenticated
      router.push("/login");
      return false;
    };

    // Skip if still loading initial auth state
    if (isLoading) return;

    // Check auth
    checkAuth();
  }, [isLoading, isAuthenticated, user, dispatch, router]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully!", {
      description: "See you soon!",
      icon: "✓",
    });
    // Use window.location for a hard redirect
    window.location.href = "/";
  };

  // Also handle View Store button to go to homepage
  const handleViewStore = () => {
    window.location.href = "/";
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
  if (!isAuthenticated || !user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Bazar Admin
              </span>
            </Link>

            {/* Admin Navigation */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                Welcome, {user.name}
              </span>
              <Button variant="outline" size="sm" onClick={handleViewStore}>
                View Store
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your store, products, and orders
          </p>
        </div>

        {/* Admin Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="border border-border rounded-xl p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+12%</span>
            </div>
            <h3 className="text-2xl font-bold">1,234</h3>
            <p className="text-sm text-muted-foreground">Total Products</p>
          </div>

          <div className="border border-border rounded-xl p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+8%</span>
            </div>
            <h3 className="text-2xl font-bold">567</h3>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </div>

          <div className="border border-border rounded-xl p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+15%</span>
            </div>
            <h3 className="text-2xl font-bold">890</h3>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </div>

          <div className="border border-border rounded-xl p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+22%</span>
            </div>
            <h3 className="text-2xl font-bold">Rs. 1.2M</h3>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </div>
        </div>

        {/* Admin Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Products Management */}
          <Link href="/admin/products" className="group">
            <div className="border border-border rounded-xl p-6 bg-card hover:border-primary hover:shadow-md transition-all duration-200 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </div>
                <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Manage Products
              </h3>
              <p className="text-sm text-muted-foreground">
                Add, edit, or remove products from your store
              </p>
            </div>
          </Link>

          {/* Add New Product */}
          <Link href="/admin/products/new" className="group">
            <div className="border border-border rounded-xl p-6 bg-card hover:border-green-500 hover:shadow-md transition-all duration-200 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                  <Plus className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Add New Product
              </h3>
              <p className="text-sm text-muted-foreground">
                Create a new product listing
              </p>
            </div>
          </Link>

          {/* Orders Management */}
          <Link href="/admin/orders" className="group">
            <div className="border border-border rounded-xl p-6 bg-card hover:border-primary hover:shadow-md transition-all duration-200 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Manage Orders
              </h3>
              <p className="text-sm text-muted-foreground">
                View and update order status
              </p>
            </div>
          </Link>

          {/* Analytics */}
          <Link href="/admin/analytics" className="group">
            <div className="border border-border rounded-xl p-6 bg-card hover:border-primary hover:shadow-md transition-all duration-200 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Analytics
              </h3>
              <p className="text-sm text-muted-foreground">
                View sales and performance analytics
              </p>
            </div>
          </Link>

          {/* User Management */}
          <Link href="/admin/users" className="group">
            <div className="border border-border rounded-xl p-6 bg-card hover:border-primary hover:shadow-md transition-all duration-200 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Manage Users
              </h3>
              <p className="text-sm text-muted-foreground">
                View and manage user accounts
              </p>
            </div>
          </Link>

          {/* Settings */}
          <Link href="/admin/settings" className="group">
            <div className="border border-border rounded-xl p-6 bg-card hover:border-primary hover:shadow-md transition-all duration-200 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center group-hover:bg-muted-foreground/20 transition-colors">
                  <Settings className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Settings
              </h3>
              <p className="text-sm text-muted-foreground">
                Configure store settings
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
