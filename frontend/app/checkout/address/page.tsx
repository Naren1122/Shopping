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
  AlertCircle,
  RefreshCw,
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
          <div className="text-center px-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading addresses...
            </p>
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
          <div className="text-center px-4 max-w-sm">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
            <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => dispatch(fetchAddresses())} size="sm">
              <RefreshCw className="mr-1.5 h-4 w-4" />
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

      {/* Header - Enhanced with gradient and better spacing */}
      <div className="relative bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5 py-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold mb-1">Checkout</h1>
            <p className="text-muted-foreground text-sm">
              Select a shipping address for your order
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          {/* Checkout Steps - Improved design */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  1
                </div>
                <span className="text-xs font-medium hidden sm:inline">
                  Address
                </span>
              </div>
              <div className="w-8 sm:w-12 h-0.5 bg-muted-foreground/30" />
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-muted border border-muted-foreground/20 flex items-center justify-center text-xs font-medium text-muted-foreground">
                  2
                </div>
                <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                  Payment
                </span>
              </div>
              <div className="w-8 sm:w-12 h-0.5 bg-muted-foreground/20" />
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-muted border border-muted-foreground/20 flex items-center justify-center text-xs font-medium text-muted-foreground">
                  3
                </div>
                <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                  Confirm
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Address Selection */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-xl border shadow-sm p-4 sm:p-5">
                <AddressList
                  addresses={addresses}
                  selectedAddress={selectedAddress}
                  onSelectAddress={(address: Address) =>
                    dispatch(setSelectedAddress(address))
                  }
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <div className="bg-card rounded-xl border shadow-sm p-4 sm:p-5">
                  <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                    </div>
                    Order Summary
                  </h3>

                  {buyNowItem ? (
                    // Show Buy Now item (not in cart)
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                        <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                          {buyNowItem.image ? (
                            <img
                              src={buyNowItem.image}
                              alt={buyNowItem.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {buyNowItem.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {buyNowItem.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium shrink-0">
                          Rs.{" "}
                          {(
                            (buyNowItem.price || 0) * buyNowItem.quantity
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ) : orderItems.length === 0 ? (
                    <div className="text-center py-4 px-3 rounded-lg bg-muted/30">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        No items in cart
                      </p>
                    </div>
                  ) : (
                    // Show cart items
                    <div className="space-y-2">
                      {orderItems.slice(0, 3).map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-medium shrink-0">
                            Rs. {(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}

                      {orderItems.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center py-1">
                          +{orderItems.length - 3} more items
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-border/60">
                    <Button
                      className="w-full h-10 text-sm"
                      size="lg"
                      onClick={handleContinueToPayment}
                      disabled={!selectedAddress}
                    >
                      Continue to Payment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-2">
                    <Link href={buyNowItem ? "/products" : "/cart"}>
                      <Button
                        variant="ghost"
                        className="w-full h-9 text-sm hover:bg-muted/50"
                      >
                        <ArrowLeft className="mr-2 h-5 w-5" />
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
