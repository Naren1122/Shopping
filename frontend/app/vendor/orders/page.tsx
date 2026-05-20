"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchUserOrders } from "@/lib/features/orders/ordersSlice";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function VendorOrdersPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { orders, isLoading } = useAppSelector((state) => state.orders);

  // Protect route
  useEffect(() => {
    if (isAuthenticated && user?.role !== "vendor") {
      toast.error("Access denied. Vendor only.");
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  // Fetch orders
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserOrders());
    }
  }, [dispatch, user?.id]);

  // Filter orders that contain this vendor's products
  const vendorOrders = orders
    .map((order) => {
      const myItems = order.orderItems.filter(
        (item) => item.vendor === user?.id
      );
      if (myItems.length === 0) return null;

      const myTotal = myItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return {
        ...order,
        myItems,
        myTotal,
      };
    })
    .filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="text-muted-foreground">
              Orders containing your products
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/vendor")}>
            Back to Dashboard
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading orders...</div>
        ) : vendorOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No orders yet for your products.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {vendorOrders.map((order: any) => (
              <Card key={order._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order._id.slice(-8)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        order.orderStatus === "delivered"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {order.orderStatus}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.myItems.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-between pt-2 font-semibold">
                      <span>Your Total</span>
                      <span>${order.myTotal.toFixed(2)}</span>
                    </div>
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
