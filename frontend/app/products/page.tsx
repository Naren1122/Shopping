"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { X, PackageOpen } from "lucide-react";
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
  fetchProductsByCategory,
  searchProducts,
  Product,
} from "@/lib/features/products/productsSlice";

// Category display config
const categoryConfig: Record<string, { icon: string; color: string }> = {
  Electronics: { icon: "📱", color: "from-blue-500 to-blue-600" },
  Clothing: { icon: "👕", color: "from-pink-500 to-pink-600" },
  Books: { icon: "📚", color: "from-amber-500 to-amber-600" },
  "Home & Garden": { icon: "🏠", color: "from-green-500 to-green-600" },
  Sports: { icon: "⚽", color: "from-orange-500 to-orange-600" },
  Toys: { icon: "🎮", color: "from-purple-500 to-purple-600" },
  Beauty: { icon: "💄", color: "from-rose-500 to-rose-600" },
  Food: { icon: "🍕", color: "from-red-500 to-red-600" },
};

function ProductsContent() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();

  const {
    products,
    featuredProducts,
    categoryProducts,
    isLoading,
    total,
    page,
    pages,
  } = useAppSelector((state) => state.products);

  // Check URL params
  const categoryParam = searchParams.get("category");
  const featuredParam = searchParams.get("featured");
  const searchParam = searchParams.get("search");
  const initialShowFeatured = featuredParam === "true";

  const [currentPage, setCurrentPage] = useState(1);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(initialShowFeatured);
  const [activeCategory, setActiveCategory] = useState<string | null>(
    categoryParam
  );
  const [activeSearch, setActiveSearch] = useState<string | null>(searchParam);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [priceFilter, setPriceFilter] = useState<[number, number] | null>(null);

  // Determine which products to display based on active filters
  const getDisplayedProducts = useCallback(() => {
    if (showFeaturedOnly) return featuredProducts;
    if (activeSearch) return searchResults;
    if (activeCategory) return categoryProducts;
    return products;
  }, [showFeaturedOnly, featuredProducts, activeSearch, searchResults, activeCategory, categoryProducts, products]);

  const displayedProducts = getDisplayedProducts();

  // Apply price filter client-side
  const filteredByPrice = priceFilter
    ? displayedProducts.filter(
        (p) => p.price >= priceFilter[0] && p.price <= priceFilter[1],
      )
    : displayedProducts;

  // Sync activeCategory and activeSearch with URL param changes
  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
      setShowFeaturedOnly(false);
      setActiveSearch(null);
    } else {
      setActiveCategory(null);
    }
    if (searchParam) {
      setActiveSearch(searchParam);
      setShowFeaturedOnly(false);
      setActiveCategory(null);
    } else if (!categoryParam) {
      setActiveSearch(null);
    }
  }, [categoryParam, searchParam]);

  // Fetch products on mount and when filters change
  useEffect(() => {
    if (showFeaturedOnly) {
      dispatch(fetchFeaturedProducts(""));
    } else if (activeSearch) {
      dispatch(searchProducts({ query: activeSearch, page: currentPage, limit: 8 }));
    } else if (activeCategory) {
      dispatch(fetchProductsByCategory({ category: activeCategory, page: currentPage, limit: 8 }));
    } else {
      dispatch(fetchAllProducts({ page: currentPage, limit: 8 }));
    }
  }, [dispatch, showFeaturedOnly, activeSearch, activeCategory, currentPage]);

  // Update searchResults when search thunk resolves
  useEffect(() => {
    if (activeSearch) {
      const fetchSearch = async () => {
        const result = await dispatch(searchProducts({ query: activeSearch, page: currentPage, limit: 8 }));
        if (searchProducts.fulfilled.match(result)) {
          const data = result.payload;
          if (Array.isArray(data)) {
            setSearchResults(data);
          } else {
            setSearchResults(data.products || []);
          }
        }
      };
      fetchSearch();
    }
  }, [activeSearch, currentPage]);

  const clearFilters = () => {
    setShowFeaturedOnly(false);
    setActiveCategory(null);
    setActiveSearch(null);
    setSearchResults([]);
    setCurrentPage(1);
    setPriceFilter(null);
    router.push("/products");
  };

  const handleFeaturedToggle = (featured: boolean) => {
    setShowFeaturedOnly(featured);
    setActiveCategory(null);
    setActiveSearch(null);
    setSearchResults([]);
    setCurrentPage(1);
    setPriceFilter(null);
    if (featured) {
      router.push("/products?featured=true");
      dispatch(fetchFeaturedProducts(""));
    } else {
      router.push("/products");
      dispatch(fetchAllProducts({ page: 1, limit: 8 }));
    }
  };

  const handleCategoryClear = () => {
    setActiveCategory(null);
    setCurrentPage(1);
    setPriceFilter(null);
    router.push("/products");
    dispatch(fetchAllProducts({ page: 1, limit: 8 }));
  };

  const handleSearchClear = () => {
    setActiveSearch(null);
    setSearchResults([]);
    setCurrentPage(1);
    setPriceFilter(null);
    router.push("/products");
    dispatch(fetchAllProducts({ page: 1, limit: 8 }));
  };

  const hasFilters = showFeaturedOnly || !!activeCategory || !!activeSearch;

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
                  {activeSearch
                    ? `Search: "${activeSearch}"`
                    : activeCategory
                      ? `${categoryConfig[activeCategory]?.icon || ""} ${activeCategory}`
                      : "All Products"}
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl">
                  {activeSearch
                    ? `Showing results for "${activeSearch}"`
                    : activeCategory
                      ? `Browse our selection of ${activeCategory.toLowerCase()} products`
                      : "Discover our curated collection of high-quality products at unbeatable prices"}
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
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {showFeaturedOnly && (
                <Badge variant="secondary" className="gap-1">
                  Featured Only
                  <button onClick={() => handleFeaturedToggle(false)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {activeCategory && (
                <Badge variant="secondary" className="gap-1">
                  {categoryConfig[activeCategory]?.icon || ""} {activeCategory}
                  <button onClick={handleCategoryClear}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {activeSearch && (
                <Badge variant="secondary" className="gap-1">
                  🔍 &quot;{activeSearch}&quot;
                  <button onClick={handleSearchClear}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
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
              {filteredByPrice.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <PackageOpen className="h-12 w-12 text-teal-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                {activeSearch
                  ? `No results for "${activeSearch}"`
                  : activeCategory
                    ? `No ${activeCategory} products found`
                    : "No products found"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {activeSearch || activeCategory
                  ? "Try a different search or browse all products"
                  : "No products available yet. Check back soon!"}
              </p>
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Browse all products
                </Button>
              )}
            </div>
          )}

          {/* Pagination */}
          {pages >= 1 && !activeSearch && (
            <div className="mt-12">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) {
                          const newPage = page - 1;
                          setCurrentPage(newPage);
                          if (activeCategory) {
                            dispatch(fetchProductsByCategory({ category: activeCategory, page: newPage, limit: 8 }));
                          } else {
                            dispatch(fetchAllProducts({ page: newPage, limit: 8 }));
                          }
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
                          const newPage = i + 1;
                          setCurrentPage(newPage);
                          if (activeCategory) {
                            dispatch(fetchProductsByCategory({ category: activeCategory, page: newPage, limit: 8 }));
                          } else {
                            dispatch(fetchAllProducts({ page: newPage, limit: 8 }));
                          }
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
                          const newPage = page + 1;
                          setCurrentPage(newPage);
                          if (activeCategory) {
                            dispatch(fetchProductsByCategory({ category: activeCategory, page: newPage, limit: 8 }));
                          } else {
                            dispatch(fetchAllProducts({ page: newPage, limit: 8 }));
                          }
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
