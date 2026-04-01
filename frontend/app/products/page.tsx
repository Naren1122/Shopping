"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ProductCard } from "@/components/ProductCard";
import { PriceFilter } from "@/components/PriceFilter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchAllProducts,
  fetchFeaturedProducts,
} from "@/lib/features/products/productsSlice";

function ProductsContent() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const { products, featuredProducts, isLoading, total, page, pages } =
    useAppSelector((state) => state.products);

  // Check if featured param exists in URL
  const featuredParam = searchParams.get("featured");
  const initialShowFeatured = featuredParam === "true";

  const [currentPage, setCurrentPage] = useState(1);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(initialShowFeatured);
  const [priceFilter, setPriceFilter] = useState<[number, number] | null>(null);

  // Use featured products when filter is active
  const displayedProducts = showFeaturedOnly ? featuredProducts : products;

  // Apply price filter client-side
  const filteredByPrice = priceFilter
    ? displayedProducts.filter(
        (p) => p.price >= priceFilter[0] && p.price <= priceFilter[1],
      )
    : displayedProducts;

  // Fetch products on mount and when filters change
  useEffect(() => {
    if (showFeaturedOnly) {
      dispatch(fetchFeaturedProducts(""));
    } else {
      dispatch(fetchAllProducts({ page: 1, limit: 8 }));
    }
  }, [dispatch, showFeaturedOnly]);

  const clearFilters = () => {
    setShowFeaturedOnly(false);
    setCurrentPage(1);
    dispatch(fetchAllProducts({ page: 1, limit: 8 }));
  };

  const handleFeaturedToggle = (featured: boolean) => {
    setShowFeaturedOnly(featured);
    setCurrentPage(1);
    if (featured) {
      dispatch(fetchFeaturedProducts(""));
    } else {
      dispatch(fetchAllProducts({ page: 1, limit: 8 }));
    }
  };

  const hasFilters = showFeaturedOnly;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        {/* Page Header with gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-teal-500/10 via-primary/5 to-amber-500/10 py-12">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-200/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-200/30 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto px-4 relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                  All Products
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Discover our curated collection of high-quality products at
                  unbeatable prices
                </p>
              </div>
              <div className="w-full lg:w-[280px]">
                <PriceFilter
                  products={displayedProducts}
                  onPriceFilter={(min, max) => {
                    setPriceFilter([min, max]);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Active Filters */}
          {showFeaturedOnly && (
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="secondary" className="gap-1">
                Featured Only
                <button onClick={() => handleFeaturedToggle(false)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
          )}

          {/* Results Count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-lg font-medium text-gray-700">
              {isLoading
                ? "Loading..."
                : priceFilter
                  ? `${filteredByPrice.length} products found`
                  : `${total} products found`}
            </p>
          </div>

          {/* Products Grid - 4 products per row */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-muted rounded-xl mb-4" />
                  <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-6 bg-muted rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : displayedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredByPrice.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <Search className="h-12 w-12 text-teal-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">No products found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                No products available yet. Check back soon!
              </p>
            </div>
          )}

          {/* Pagination - Always show for testing */}
          {pages >= 1 && (
            <div className="mt-12">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) {
                          setCurrentPage(page - 1);
                          dispatch(
                            fetchAllProducts({ page: page - 1, limit: 8 }),
                          );
                        }
                      }}
                      className={
                        page <= 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                  {[...Array(pages)].map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(i + 1);
                          dispatch(fetchAllProducts({ page: i + 1, limit: 8 }));
                        }}
                        isActive={page === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < pages) {
                          setCurrentPage(page + 1);
                          dispatch(
                            fetchAllProducts({ page: page + 1, limit: 8 }),
                          );
                        }
                      }}
                      className={
                        page >= pages ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Wrapper component with Suspense boundary for useSearchParams
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <p>Loading...</p>
          </div>
          <Footer />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
