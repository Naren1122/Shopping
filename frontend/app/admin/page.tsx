"use client";

import { useEffect, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { logout, initializeAuth } from "@/lib/features/auth/authSlice";

interface AnalyticsOverview {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
}

interface OrderItem {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface RecentOrder {
  _id: string;
  orderItems: OrderItem[];
  totalPrice: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth,
  );

  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentOrdersLoading, setRecentOrdersLoading] = useState(true);

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

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "/api"}/analytics/overview`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        console.error("Analytics fetch error:", response.status);
        setAnalytics({
          totalUsers: 0,
          totalOrders: 0,
          totalProducts: 0,
          totalRevenue: 0,
          todayOrders: 0,
          todayRevenue: 0,
        });
        return;
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAnalyticsError("Failed to load analytics data");
      setAnalytics({
        totalUsers: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalRevenue: 0,
        todayOrders: 0,
        todayRevenue: 0,
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchAnalytics();
    }
  }, [isAuthenticated, user]);

  // Fetch recent orders
  const fetchRecentOrders = async () => {
    setRecentOrdersLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "/api"}/orders/admin/all?limit=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          "Fetch orders error:",
          response.status,
          response.statusText,
          errorData,
        );
        // For 404, it might be route not found - need to check backend
        if (response.status === 404) {
          console.warn(
            "Route /api/orders/admin/all not found. Make sure backend is restarted with latest code.",
          );
        }
        setRecentOrders([]);
        return;
      }

      const data = await response.json();
      setRecentOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      setRecentOrders([]);
    } finally {
      setRecentOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchRecentOrders();
    }
  }, [isAuthenticated, user]);

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
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              {analyticsLoading ? (
                <div className="animate-pulse h-8 bg-muted rounded"></div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold">
                    {analytics?.totalProducts || 0}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Total Products
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
              </div>
              {analyticsLoading ? (
                <div className="animate-pulse h-8 bg-muted rounded"></div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold">
                    {analytics?.totalOrders || 0}
                  </h3>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              {analyticsLoading ? (
                <div className="animate-pulse h-8 bg-muted rounded"></div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold">
                    {analytics?.totalUsers || 0}
                  </h3>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              {analyticsLoading ? (
                <div className="animate-pulse h-8 bg-muted rounded"></div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold">
                    Rs. {(analytics?.totalRevenue || 0).toLocaleString()}
                  </h3>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </>
              )}
            </CardContent>
          </Card>
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

        {/* Recent Orders Table */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Recent Orders
            </h2>
            <Link href="/admin/orders">
              <Button variant="link">View All</Button>
            </Link>
          </div>
          <Card>
            <CardContent className="p-0">
              {recentOrdersLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse flex items-center gap-4"
                    >
                      <div className="h-4 w-4 bg-muted rounded"></div>
                      <div className="h-4 flex-1 bg-muted rounded"></div>
                      <div className="h-4 w-20 bg-muted rounded"></div>
                      <div className="h-4 w-20 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 font-medium text-muted-foreground">
                          Order ID
                        </th>
                        <th className="text-left p-4 font-medium text-muted-foreground">
                          Customer
                        </th>
                        <th className="text-left p-4 font-medium text-muted-foreground">
                          Items
                        </th>
                        <th className="text-left p-4 font-medium text-muted-foreground">
                          Total
                        </th>
                        <th className="text-left p-4 font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="text-left p-4 font-medium text-muted-foreground">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr
                          key={order._id}
                          className="border-b border-border hover:bg-muted/50"
                        >
                          <td className="p-4">
                            <span className="font-mono text-sm">
                              {order._id.slice(-8)}
                            </span>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">
                                {order.user?.name || "Unknown"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {order.user?.email}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-sm">
                              {order.orderItems?.length || 0} item(s)
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-medium">
                              Rs. {order.totalPrice.toLocaleString()}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.orderStatus === "delivered"
                                  ? "bg-green-100 text-green-800"
                                  : order.orderStatus === "shipped"
                                    ? "bg-blue-100 text-blue-800"
                                    : order.orderStatus === "processing"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {order.orderStatus || "pending"}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  No recent orders found
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
