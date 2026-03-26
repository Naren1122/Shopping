"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Tag, Clock, Shield } from "lucide-react";

interface PromoBannerProps {
  title?: string;
  description?: string;
  discount?: string;
  ctaText?: string;
  ctaLink?: string;
}

export function PromoBanner({
  title = "Summer Sale",
  description = "Get amazing discounts on all electronics and fashion items. Limited time offer!",
  discount = "50% OFF",
  ctaText = "Shop Now",
  ctaLink = "/products?sale=true",
}: PromoBannerProps) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Main Promo Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 via-teal-500 to-amber-500 p-8 md:p-12">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
            <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white rounded-full" />
            <div className="absolute bottom-1/4 right-1/3 w-16 h-16 bg-white rounded-full" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left Content */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Tag className="w-4 h-4 text-white" />
                <span className="text-white font-medium text-sm">
                  Limited Time Offer
                </span>
              </div>

              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                {title}
              </h2>

              <p className="text-white/90 text-lg mb-6 max-w-xl">
                {description}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                <Link href={ctaLink}>
                  <Button
                    size="lg"
                    className="bg-white text-teal-600 hover:bg-white/90 font-semibold px-8"
                  >
                    {ctaText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <div className="flex items-center gap-2 text-white/80">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Ends in 2 days</span>
                </div>
              </div>
            </div>

            {/* Right - Discount Badge */}
            <div className="hidden md:block">
              <div className="relative w-48 h-48">
                {/* Outer ring */}
                <div className="absolute inset-0 border-4 border-white/30 rounded-full" />
                {/* Inner circle */}
                <div className="absolute inset-4 bg-white/20 backdrop-blur-sm rounded-full flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-white">
                    {discount}
                  </span>
                  <span className="text-white/80 text-sm font-medium mt-1">
                    DISCOUNT
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Secure Payment</p>
              <p className="text-xs text-muted-foreground">
                100% Secure Transactions
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Best Prices</p>
              <p className="text-xs text-muted-foreground">
                Lowest Price Guarantee
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Fast Delivery</p>
              <p className="text-xs text-muted-foreground">
                Delivery within 24 Hours
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
