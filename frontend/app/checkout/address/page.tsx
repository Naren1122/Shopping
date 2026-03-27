"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  ShoppingCart,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AddressList } from "@/components/AddressList";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchAddresses,
  setSelectedAddress,
} from "@/lib/features/addresses/addressesSlice";
import { Address } from "@/lib/features/addresses/addressesSlice";

export default function CheckoutAddressPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { addresses, selectedAddress, isLoading, error } = useAppSelector(
    (state) => state.addresses,
  );
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { items } = useAppSelector((state) => state.cart);

  // Buy Now item state - only read on client using lazy initialization
  const [buyNowItem] = useState<{
    _id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
  } | null>(() => {
    // Lazily initialize from sessionStorage only on client
    if (typeof window === "undefined") return null;
    const itemStr = sessionStorage.getItem("buyNowItem");
    if (itemStr) {
      sessionStorage.removeItem("buyNowItem");
      try {
        return JSON.parse(itemStr);
      } catch (e) {
        console.error("Failed to parse buyNowItem:", e);
      }
    }
    return null;
  });

  // If buyNowItem exists, show it in order summary; otherwise show cart items
  // Use useMemo to keep stable reference
  const orderItems = useMemo(() => {
    if (buyNowItem) {
      return [{ ...buyNowItem, _id: `buynow-${buyNowItem._id}` }];
    }
    return items;
  }, [buyNowItem, items]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    dispatch(fetchAddresses());
  }, [dispatch, isAuthenticated, router]);

  const handleContinueToPayment = () => {
    if (!selectedAddress) {
      return;
    }

    // Store selected address and buyNow item (if any) in localStorage for the payment page
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedAddress", JSON.stringify(selectedAddress));

      // Store order items - if buyNowItem exists use it, otherwise use cart items
      if (buyNowItem) {
        localStorage.setItem("checkoutItems", JSON.stringify([buyNowItem]));
      } else if (items.length > 0) {
        localStorage.setItem("checkoutItems", JSON.stringify(items));
      }
    }

    router.push("/checkout/payment");
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading addresses...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => dispatch(fetchAddresses())}>
              Try Again
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header */}
      <div className="bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground">
            Select a shipping address for your order
          </p>
        </div>
      </div>

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Checkout Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-primary">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <span className="text-sm font-medium">Address</span>
              </div>
              <div className="w-8 h-px bg-muted-foreground/30" />
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="text-sm font-medium">Payment</span>
              </div>
              <div className="w-8 h-px bg-muted-foreground/30" />
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <span className="text-sm font-medium">Confirm</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Address Selection */}
            <div className="lg:col-span-2">
              <AddressList
                addresses={addresses}
                selectedAddress={selectedAddress}
                onSelectAddress={(address: Address) =>
                  dispatch(setSelectedAddress(address))
                }
              />
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-muted/30 rounded-lg p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Order Summary
                  </h3>

                  {buyNowItem ? (
                    // Show Buy Now item (not in cart)
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center shrink-0">
                          {buyNowItem.image ? (
                            <img
                              src={buyNowItem.image}
                              alt={buyNowItem.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate">{buyNowItem.name}</p>
                          <p className="text-muted-foreground">
                            Qty: {buyNowItem.quantity}
                          </p>
                        </div>
                        <p className="font-medium shrink-0">
                          Rs.{" "}
                          {(
                            (buyNowItem.price || 0) * buyNowItem.quantity
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ) : orderItems.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No items in cart
                    </p>
                  ) : (
                    // Show cart items
                    <div className="space-y-3">
                      {orderItems.slice(0, 3).map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center gap-3 text-sm"
                        >
                          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate">{item.name}</p>
                            <p className="text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium shrink-0">
                            Rs. {(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}

                      {orderItems.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          +{orderItems.length - 3} more items
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleContinueToPayment}
                      disabled={!selectedAddress}
                    >
                      Continue to Payment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-4">
                    <Link href={buyNowItem ? "/products" : "/cart"}>
                      <Button variant="ghost" className="w-full">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {buyNowItem ? "Continue Shopping" : "Back to Cart"}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
