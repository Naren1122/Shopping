"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function VendorDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (user?.role !== "vendor") {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || !isAuthenticated || user?.role !== "vendor") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user?.name}! Manage your store and products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="font-semibold mb-2">My Products</h3>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Total products</p>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h3 className="font-semibold mb-2">Pending Orders</h3>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Awaiting fulfillment</p>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h3 className="font-semibold mb-2">Store Status</h3>
            <p className="text-lg font-medium text-yellow-600">Pending Approval</p>
            <p className="text-sm text-muted-foreground">Awaiting admin review</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/vendor/products")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Manage Products
            </button>
            <button
              onClick={() => router.push("/vendor/orders")}
              className="px-4 py-2 border rounded-md hover:bg-accent"
            >
              View My Orders
            </button>
            <button
              onClick={() => router.push("/vendor/profile")}
              className="px-4 py-2 border rounded-md hover:bg-accent"
            >
              Update Store Profile
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
