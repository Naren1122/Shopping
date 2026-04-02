
"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle,
  Package,
  Home,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAppDispatch } from "@/lib/hooks";
import { initializeAuth } from "@/lib/features/auth/authSlice";

interface OrderDetails {
  _id: string;
  orderItems: Array<{
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    district: string;
  };
  totalPrice: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Check if user has a token in localStorage (more reliable than Redux state after redirect)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Get orderId from URL first, then from localStorage
  const urlOrderId = searchParams.get("orderId");
  const [orderId, setOrderId] = useState<string | null>(urlOrderId);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication from localStorage (survives server-side redirects)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch(initializeAuth({ user, token }));
        setIsAuthenticated(true);
      } catch (e) {
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    setAuthChecked(true);
  }, [dispatch]);

  // Redirect to login if not authenticated after checking
  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      router.push("/login");
    }
  }, [authChecked, isAuthenticated, router]);

  // Try to get orderId from localStorage if not in URL
  useEffect(() => {
    if (!urlOrderId && isAuthenticated) {
      const storedOrderId = localStorage.getItem("pendingOrderId");
      if (storedOrderId) {
        setOrderId(storedOrderId);
      }
    }
  }, [urlOrderId, isAuthenticated]);

  // Fetch order details when orderId is available
  useEffect(() => {
    if (orderId && isAuthenticated) {
      fetchOrderDetails();
    }
  }, [orderId, isAuthenticated]);

  const fetchOrderDetails = async () => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data);
        // Clear the pending order ID after successful fetch
        localStorage.removeItem("pendingOrderId");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth or not authenticated
  if (!authChecked || (!isAuthenticated && !isLoading)) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If no orderId but authenticated, show generic success
  if (!orderId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold mb-2">
                Order Placed Successfully!
              </h1>
              <p className="text-muted-foreground">
                Thank you for your order. We&apos;ll send you a confirmation
                email shortly.
              </p>
            </div>
            <div className="text-center">
              <Link href="/dashboard">
                <Button className="bg-primary hover:bg-primary/90">
                  View My Orders
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-muted-foreground">
              Thank you for your order. We&apos;ll send you a confirmation email
              shortly.
            </p>
            {orderId && (
              <p className="text-sm text-muted-foreground mt-2">
                Order ID: <span className="font-medium">{orderId}</span>
              </p>
            )}
          </div>

          {/* Order Details Card */}
          {!isLoading && order && (
            <Card className="mb-8">
              <CardContent className="pt-6 space-y-6">
                {/* Order Status */}
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <Package className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">
                      {order.paymentMethod === "cod"
                        ? "Cash on Delivery - Order Pending"
                        : "Payment Received - Order Confirmed"}
                    </p>
                    <p className="text-sm text-green-600">
                      Order Status:{" "}
                      {order.orderStatus.charAt(0).toUpperCase() +
                        order.orderStatus.slice(1)}
                    </p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <p className="text-muted-foreground">
                    {order.shippingAddress.fullName}
                    <br />
                    {order.shippingAddress.address}
                    <br />
                    {order.shippingAddress.city},{" "}
                    {order.shippingAddress.district}
                  </p>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-md bg-muted overflow-hidden flex-shrink-0">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Rs. {item.price.toLocaleString()} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-4 flex justify-between items-center">
                  <p className="font-semibold">Total Amount</p>
                  <p className="text-xl font-bold">
                    Rs. {order.totalPrice.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading order details...</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button className="w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="w-full sm:w-auto">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
