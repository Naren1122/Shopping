"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartItem } from "@/components/CartItem";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchCart } from "@/lib/features/cart/cartSlice";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { items, isLoading, error } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10">
              <ShoppingCart className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Login Required
            </h2>
            <p className="text-muted-foreground mb-8 text-lg max-w-sm mx-auto">
              Please login to view and manage your shopping cart
            </p>
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Login to Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
            <p className="text-muted-foreground text-lg">
              Loading your cart...
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
          <div className="text-center px-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <ShoppingCart className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Something went wrong</h2>
            <p className="text-muted-foreground mb-8">{error}</p>
            <Button size="lg" onClick={() => dispatch(fetchCart())}>
              Try Again
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
        <Navbar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto text-center py-16">
              <div className="relative inline-block mb-8">
                <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10">
                  <ShoppingCart className="h-16 w-16 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">🛒</span>
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Your cart is empty
              </h2>
              <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
                Looks like you haven&apos;t added anything to your cart yet.
                Start shopping to find something you love!
              </p>
              <Link href="/products">
                <Button size="lg" className="gap-2 text-lg px-8 py-6">
                  Start Shopping
                  <ArrowRight className="h-5 w-5" />
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/10">
      <Navbar />

      <main className="flex-1">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-b">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50"></div>
          <div className="container mx-auto px-4 py-12 relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                  Shopping Cart
                </h1>
                <p className="text-muted-foreground text-lg">
                  You have{" "}
                  <span className="font-semibold text-primary">
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </span>{" "}
                  in your cart
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-background/50 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden shadow-sm">
              <div className="p-6 space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item._id}
                    className="relative animate-in fade-in slide-in-from-bottom-4 duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CartItem item={item} />
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-8 text-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
