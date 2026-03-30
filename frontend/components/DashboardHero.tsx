"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Package, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIRecommendedProducts } from "./AIRecommendedProducts";
import { Product } from "@/lib/features/products/productsSlice";

interface DashboardHeroProps {
  userName: string;
  products: Product[];
  isLoading: boolean;
}

export function DashboardHero({
  userName,
  products,
  isLoading,
}: DashboardHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-8 md:py-10">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col lg:flex-row items-start gap-0">
          {/* Left Side - Welcome Message & Actions */}
          <div className="w-full lg:w-2/5">
            {/* Welcome Badge */}

            {/* Headline */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Hello, <span className="text-primary">{userName}</span>! 👋
            </h1>

            {/* Subheadline */}
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mb-6">
              Welcome to Bazar. Track your orders, manage your wishlist, and
              discover products tailored just for you.
            </p>

            {/* Quick Stats & Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex gap-3">
                <Link href="/products">
                  <Button size="lg" className="text-base px-6 h-10">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Shop Now
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-base px-6 h-10"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Links Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <Link href="/orders" className="group">
                <div className="bg-background/80 backdrop-blur-sm rounded-xl p-4 border hover:border-primary hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Track Orders</p>
                      <p className="text-xs text-muted-foreground">
                        View shipping status
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/wishlist" className="group">
                <div className="bg-background/80 backdrop-blur-sm rounded-xl p-4 border hover:border-favorite hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Wishlist</p>
                      <p className="text-xs text-muted-foreground">
                        Your saved items
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/cart" className="group">
                <div className="bg-background/80 backdrop-blur-sm rounded-xl p-4 border hover:border-primary hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Shopping Cart</p>
                      <p className="text-xs text-muted-foreground">
                        Checkout items
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Right Side - AI Recommended Products */}
          <div className="w-full lg:w-3/5 mt-6 lg:mt-0">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Recommended For You
            </h3>
            <div className="flex justify-center">
              <AIRecommendedProducts
                products={products}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
