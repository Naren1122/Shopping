"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/features/products/productsSlice";

interface AIRecommendedProductsProps {
  products: Product[];
  isLoading: boolean;
}

export function AIRecommendedProducts({
  products,
  isLoading,
}: AIRecommendedProductsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate every 3 seconds
  useEffect(() => {
    if (products.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [products.length]);

  // Don't render if no products
  if (!isLoading && products.length === 0) {
    return null;
  }

  const currentProduct = products[currentIndex];

  return (
    <div className="relative w-full max-w-xl">
      {isLoading ? (
        <div className="w-full h-80 rounded-2xl bg-muted animate-pulse" />
      ) : (
        <>
          {/* Product Image */}
          <Link href={`/products/${currentProduct._id}`} className="block">
            <div className="relative w-full h-80 rounded-2xl overflow-hidden">
              <div
                className="w-full h-full transition-transform duration-500 hover:scale-110"
                style={{
                  backgroundImage: `url(${currentProduct.image || "/placeholder.jpg"})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {/* Product Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <p className="text-sm opacity-80 mb-1">
                  {currentProduct.category}
                </p>
                <h3 className="text-lg font-bold mb-1 truncate">
                  {currentProduct.name}
                </h3>
                <p className="text-xl font-bold text-teal-400">
                  Rs. {currentProduct.price.toLocaleString()}
                </p>
              </div>
            </div>
          </Link>

          {/* Dots indicator */}
          {products.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {products.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? "bg-teal-500 w-4"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  aria-label={`Go to product ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
