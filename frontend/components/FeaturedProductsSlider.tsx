"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/lib/features/products/productsSlice";

interface FeaturedProductsSliderProps {
  products: Product[];
  isLoading: boolean;
}

export function FeaturedProductsSlider({
  products,
  isLoading,
}: FeaturedProductsSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      checkScroll();
      return () => container.removeEventListener("scroll", checkScroll);
    }
  }, [products]);

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">
                Featured Products
              </h2>
              <p className="text-muted-foreground">Handpicked for you</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Products Slider */}
        {isLoading ? (
          <div className="flex gap-6 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-72 shrink-0 animate-pulse">
                <div className="aspect-square bg-muted rounded-xl mb-4" />
                <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                <div className="h-6 bg-muted rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product) => (
              <div key={product._id} className="w-72 shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Star className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              No Featured Products Yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Check back later for featured products
            </p>
            <Link href="/products">
              <Button>Browse All Products</Button>
            </Link>
          </div>
        )}

        {/* View All Link */}
        {products.length > 0 && (
          <div className="text-center mt-8">
            <Link href="/products?featured=true">
              <Button variant="outline">View All Products</Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
