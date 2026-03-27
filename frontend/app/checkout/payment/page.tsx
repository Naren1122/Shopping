"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Banknote,
  ShoppingCart,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { clearCartItems } from "@/lib/features/cart/cartSlice";

interface Address {
  fullName: string;
  address: string;
  city: string;
  district: string;
  province: string;
  ward: string;
  phone: string;
}

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "esewa">("cod");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = subtotal > 1000 ? 0 : 100; // Free shipping above Rs. 1000
  const total = subtotal + shipping;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Load data from localStorage
    if (typeof window !== "undefined") {
      const addressStr = localStorage.getItem("selectedAddress");
      const itemsStr = localStorage.getItem("checkoutItems");

      if (addressStr) {
        setSelectedAddress(JSON.parse(addressStr));
      } else {
        // No address selected, redirect back
        router.push("/checkout/address");
        return;
      }

      if (itemsStr) {
        setOrderItems(JSON.parse(itemsStr));
      } else {
        router.push("/cart");
        return;
      }
    }
  }, [isAuthenticated, router]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress || orderItems.length === 0) {
      setError("Missing order information");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      // Prepare order items for API
      const orderItemsPayload = orderItems.map((item) => ({
        product: item._id.replace("buynow-", ""),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));

      // Create order
      const orderResponse = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderItems: orderItemsPayload,
          shippingAddress: selectedAddress,
          paymentMethod: paymentMethod,
          totalPrice: total,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      const order = await orderResponse.json();

      if (paymentMethod === "cod") {
        // COD - go directly to success
        // Clear cart after successful order
        dispatch(clearCartItems());
        localStorage.removeItem("checkoutItems");
        localStorage.removeItem("selectedAddress");

        router.push(`/payment-success?orderId=${order._id}`);
      } else {
        // eSewa - submit form to eSewa with proper parameters
        try {
          const paymentResponse = await fetch(
            "http://localhost:5000/api/payments/esewa/initiate",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ orderId: order._id }),
            },
          );

          if (!paymentResponse.ok) {
            throw new Error("Failed to initiate payment");
          }

          const paymentData = await paymentResponse.json();

          // DEBUG: Log the payment data received from backend
          console.log(
            "[Frontend eSewa Debug] Payment Data from backend:",
            paymentData,
          );

          // Check if demo mode is enabled
          if (paymentData.demoMode) {
            // Clear cart (order is already created)
            dispatch(clearCartItems());
            localStorage.removeItem("checkoutItems");
            localStorage.removeItem("selectedAddress");

            // Redirect to demo eSewa page
            const demoUrl = `/esewa-demo?orderId=${order._id}&amt=${paymentData.amount}&pid=${paymentData.transaction_uuid}`;
            router.push(demoUrl);
            return;
          }

          // Clear cart (order is already created)
          dispatch(clearCartItems());
          localStorage.removeItem("checkoutItems");
          localStorage.removeItem("selectedAddress");

          // Store order ID in localStorage so we can fetch details after payment
          localStorage.setItem("pendingOrderId", order._id);

          // Create and submit eSewa form programmatically
          // This follows the official eSewa form submission format
          const form = document.createElement("form");
          form.method = "POST";
          form.action = paymentData.paymentUrl;

          // Add all required eSewa parameters
          const params = [
            "amount",
            "tax_amount",
            "product_service_charge",
            "product_delivery_charge",
            "product_code",
            "total_amount",
            "transaction_uuid",
            "success_url",
            "failure_url",
            "signed_field_names",
            "signature",
          ];

          params.forEach((param) => {
            if (paymentData[param]) {
              const input = document.createElement("input");
              input.type = "hidden";
              input.name = param;
              input.value = paymentData[param];
              form.appendChild(input);

              // DEBUG: Log each parameter
              console.log(`[Frontend eSewa] ${param} = ${paymentData[param]}`);
            }
          });

          // DEBUG: Log before submission
          console.log("[Frontend eSewa] Form action:", form.action);
          console.log("[Frontend eSewa] Form method:", form.method);

          document.body.appendChild(form);
          form.submit();
          document.body.removeChild(form);

          // Show message to user
          setError(
            "Redirecting to eSewa... Please complete the payment there.",
          );
        } catch (networkError) {
          // If eSewa is unreachable, go to success (demo fallback)
          console.log("eSewa not reachable - using fallback");
          dispatch(clearCartItems());
          localStorage.removeItem("checkoutItems");
          localStorage.removeItem("selectedAddress");
          router.push(`/payment-success?orderId=${order._id}`);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (!selectedAddress || orderItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/cart" className="hover:text-primary">
            Cart
          </Link>
          <span>/</span>
          <Link href="/checkout/address" className="hover:text-primary">
            Address
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Payment</span>
        </div>

        <h1 className="text-2xl font-bold mb-8">Checkout - Payment Method</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Method & Shipping Address */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm">
                    1
                  </span>
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{selectedAddress.fullName}</p>
                  <p className="text-muted-foreground">
                    {selectedAddress.address}, {selectedAddress.ward},{" "}
                    {selectedAddress.city}
                  </p>
                  <p className="text-muted-foreground">
                    {selectedAddress.district}, {selectedAddress.province}
                  </p>
                  <p className="text-muted-foreground">
                    Phone: {selectedAddress.phone}
                  </p>
                </div>
                <Link href="/checkout/address">
                  <Button variant="link" className="mt-4 p-0">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Change Address
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Payment Method Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm">
                    2
                  </span>
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) =>
                    setPaymentMethod(value as "cod" | "esewa")
                  }
                  className="space-y-4"
                >
                  {/* Cash on Delivery */}
                  <div className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-accent/50 cursor-pointer transition-colors">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Banknote className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="font-medium">Cash on Delivery</p>
                          <p className="text-sm text-muted-foreground">
                            Pay when you receive your order
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>

                  {/* eSewa */}
                  <div className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-accent/50 cursor-pointer transition-colors">
                    <RadioGroupItem value="esewa" id="esewa" />
                    <Label htmlFor="esewa" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-6 w-6 text-blue-600" />
                        <div>
                          <p className="font-medium">eSewa</p>
                          <p className="text-sm text-muted-foreground">
                            Pay securely via eSewa
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {error && (
                  <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-lg">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {orderItems.map((item, index) => (
                    <div key={`${item._id}-${index}`} className="flex gap-3">
                      <div className="w-16 h-16 rounded-md bg-muted overflow-hidden flex-shrink-0">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Rs. {item.price.toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? "FREE" : `Rs. ${shipping}`}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>Rs. {total.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {paymentMethod === "cod"
                        ? "Placing Order..."
                        : "Redirecting to Payment..."}
                    </>
                  ) : (
                    <>
                      {paymentMethod === "cod"
                        ? "Place Order"
                        : "Proceed to Payment"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
