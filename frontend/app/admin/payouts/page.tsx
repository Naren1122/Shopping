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

interface Payout {
  vendor: string;
  amount: number;
  commission: number;
  status: string;
}

interface OrderWithPayout {
  _id: string;
  user: { name: string; email: string };
  payouts: Payout[];
  orderStatus: string;
  deliveredAt?: string;
}

export default function AdminPayoutsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<OrderWithPayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Protect admin route
  useEffect(() => {
    if (isAuthenticated && user?.role !== "admin") {
      toast.error("Access denied. Admin only.");
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  // Fetch orders with payouts
  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/orders/admin/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          // Filter orders that have payouts
          const ordersWithPayouts = data.orders.filter(
            (order: any) => order.payouts && order.payouts.length > 0
          );
          setOrders(ordersWithPayouts);
        }
      } catch (error) {
        console.error("Failed to fetch payouts");
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchPayouts();
    }
  }, [user]);

  const handleMarkAsPaid = async (orderId: string, vendorId: string) => {
    // For now, just show success (we'll add real API later)
    toast.success(`Marked payout as paid for vendor ${vendorId.slice(-6)}`);
    // TODO: Call backend API to update payout status
  };

  if (isLoading) {
    return <div className="p-8">Loading payouts...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Vendor Payouts</h1>
          <p className="text-muted-foreground">
            Manage and approve payouts to vendors
          </p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No payouts available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order._id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Order #{order._id.slice(-8)}</CardTitle>
                    <Badge>{order.orderStatus}</Badge>
                  </div>
                  {order.deliveredAt && (
                    <p className="text-sm text-muted-foreground">
                      Delivered: {new Date(order.deliveredAt).toLocaleDateString()}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.payouts.map((payout, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border-b pb-3 last:border-0"
                      >
                        <div>
                          <p className="font-medium">
                            Vendor: {payout.vendor.slice(-8)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Commission: Rs. {payout.commission}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold">Rs. {payout.amount}</p>
                            <Badge
                              variant={payout.status === "paid" ? "default" : "secondary"}
                            >
                              {payout.status}
                            </Badge>
                          </div>
                          {payout.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkAsPaid(order._id, payout.vendor)}
                            >
                              Mark as Paid
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
