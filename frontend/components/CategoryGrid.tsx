"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  {
    name: "Electronics",
    icon: "📱",
    slug: "Electronics",
    color: "from-blue-500 to-blue-600",
  },
  {
    name: "Clothing",
    icon: "👕",
    slug: "Clothing",
    color: "from-pink-500 to-pink-600",
  },
  {
    name: "Books",
    icon: "📚",
    slug: "Books",
    color: "from-amber-500 to-amber-600",
  },
  {
    name: "Home & Garden",
    icon: "🏠",
    slug: "Home & Garden",
    color: "from-green-500 to-green-600",
  },
  {
    name: "Sports",
    icon: "⚽",
    slug: "Sports",
    color: "from-orange-500 to-orange-600",
  },
  {
    name: "Toys",
    icon: "🎮",
    slug: "Toys",
    color: "from-purple-500 to-purple-600",
  },
  {
    name: "Beauty",
    icon: "💄",
    slug: "Beauty",
    color: "from-rose-500 to-rose-600",
  },
  { name: "Food", icon: "🍕", slug: "Food", color: "from-red-500 to-red-600" },
];

interface CategoryGridProps {
  productCounts?: Record<string, number>;
}

export function CategoryGrid({ productCounts = {} }: CategoryGridProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Shop by Category
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our wide range of products across different categories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.slug}
              href={`/products?category=${encodeURIComponent(category.slug)}`}
              className="group"
            >
              <div
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${category.color} p-6 h-full min-h-[160px] transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl`}
              >
                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl">
                      {category.icon}
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/70 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {category.name}
                    </h3>
                    <p className="text-white/70 text-sm">
                      {productCounts[category.slug] || 0} products
                    </p>
                  </div>
                </div>

                {/* Background decoration */}
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />
              </div>
            </Link>
          ))}
        </div>

        {/* View All Categories */}
        <div className="text-center mt-10">
          <Link href="/products">
            <Button variant="outline" size="lg">
              View All Categories
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
