"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8 md:py-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 items-center">
          {/* Content */}
          <div className="space-y-4 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              Welcome to Bazar
            </div>

            {/* Headline */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Discover <span className="text-primary">Amazing Products</span> at
              Great Prices
            </h1>

            {/* Subheadline */}
            <p className="text-base md:text-lg text-muted-foreground max-w-lg">
              Your one-stop marketplace for quality products. Shop with
              confidence using secure payments and fast delivery.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base px-6 h-10"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/products">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base px-6 h-10"
                >
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image/Visual */}
          <div
            className="relative animate-fade-in hidden md:block"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="relative aspect-square max-w-sm mx-auto">
              {/* Decorative rings */}
              <div className="absolute inset-0 border-2 border-primary/20 rounded-full" />
              <div className="absolute inset-4 border-2 border-primary/10 rounded-full" />
              <div className="absolute inset-8 border-2 border-primary/5 rounded-full" />

              {/* Center content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                    <span className="text-5xl">🛒</span>
                  </div>
                  <p className="text-base font-semibold text-foreground">
                    Shop with Confidence
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Secure payments • Fast delivery
                  </p>
                </div>
              </div>

              {/* Floating cards */}
              <div
                className="absolute -top-2 -right-2 bg-background p-2 rounded-lg shadow-lg border animate-bounce"
                style={{ animationDuration: "3s" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <span className="text-sm">✓</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Order Confirmed</p>
                    <p className="text-[10px] text-muted-foreground">
                      Just now
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
