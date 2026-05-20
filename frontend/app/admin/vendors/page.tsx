"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Vendor {
  _id: string;
  name: string;
  email: string;
  vendorProfile: {
    storeName: string;
    storeDescription: string;
    isApproved: boolean;
    commissionRate: number;
  };
  createdAt: string;
  productCount?: number;
  orderCount?: number;
  totalRevenue?: number;
}

export default function AdminVendorsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Protect admin route
  useEffect(() => {
    if (isAuthenticated && user?.role !== "admin") {
      toast.error("Access denied. Admin only.");
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  // Fetch all vendors with product statistics
  useEffect(() => {
    const fetchVendorsWithStats = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch vendors (we'll use a simple approach for now)
        const res = await fetch("/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const vendorUsers = data.filter((u: any) => u.role === "vendor");

          // Fetch stats for each vendor
          const vendorsWithStats = await Promise.all(
            vendorUsers.map(async (vendor: any) => {
              try {
                // Get product count
                const productsRes = await fetch(
                  `/api/products?vendorId=${vendor._id}`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
                const productsData = await productsRes.json();
                const productCount = productsData.total || productsData.products?.length || 0;

                // Get orders for this vendor (simplified)
                const ordersRes = await fetch(
                  `/api/orders/admin/all?vendorId=${vendor._id}`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
                const ordersData = await ordersRes.json();
                const orderCount = ordersData.total || 0;

                // Calculate estimated revenue (simplified)
                let totalRevenue = 0;
                if (ordersData.orders) {
                  ordersData.orders.forEach((order: any) => {
                    if (order.orderItems) {
                      order.orderItems.forEach((item: any) => {
                        if (item.vendor === vendor._id) {
                          totalRevenue += item.price * item.quantity;
                        }
                      });
                    }
                  });
                }

                return {
                  ...vendor,
                  productCount,
                  orderCount,
                  totalRevenue: Math.round(totalRevenue),
                };
              } catch {
                return { ...vendor, productCount: 0, orderCount: 0, totalRevenue: 0 };
              }
            })
          );

          setVendors(vendorsWithStats);
        } else {
          setVendors([]);
        }
      } catch (error) {
        console.error("Failed to fetch vendors");
        setVendors([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchVendorsWithStats();
    }
  }, [user]);

  const handleApprove = async (vendorId: string, approve: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/auth/vendor/${vendorId}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isApproved: approve }),
      });

      if (res.ok) {
        toast.success(`Vendor ${approve ? "approved" : "rejected"} successfully`);
        // Refresh list
        window.location.reload();
      } else {
        toast.error("Failed to update vendor status");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading vendors...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Vendor Management</h1>
            <p className="text-muted-foreground">Approve and manage vendors</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/admin")}>
            Back to Admin
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Vendors ({vendors.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {vendors.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No vendors registered yet.
              </div>
            ) : (
              <div className="space-y-4">
                {vendors.map((vendor) => (
                  <div
                    key={vendor._id}
                    className="border rounded-lg p-4 flex justify-between items-start"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{vendor.name}</h3>
                        <Badge variant={vendor.vendorProfile?.isApproved ? "default" : "secondary"}>
                          {vendor.vendorProfile?.isApproved ? "Approved" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{vendor.email}</p>
                    <p className="text-sm font-medium">
                      Store: {vendor.vendorProfile?.storeName || "Not set"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Commission: {vendor.vendorProfile?.commissionRate || 10}%
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                      <span>Products: {vendor.productCount || 0}</span>
                      <span>Orders: {vendor.orderCount || 0}</span>
                      <span>Revenue: Rs. {vendor.totalRevenue || 0}</span>
                    </div>
                    </div>

                    <div className="flex gap-2">
                      {!vendor.vendorProfile?.isApproved && (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(vendor._id, true)}
                        >
                          Approve
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleApprove(vendor._id, false)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
