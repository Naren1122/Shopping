"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  fetchProductsByCategory,
  searchProducts,
  fetchFeaturedProducts,
} from "@/lib/features/products/productsSlice";

const categories = [
  { name: "All Categories", value: "all" },
  { name: "Electronics", value: "Electronics" },
  { name: "Clothing", value: "Clothing" },
  { name: "Books", value: "Books" },
  { name: "Home & Garden", value: "Home & Garden" },
  { name: "Sports", value: "Sports" },
  { name: "Toys", value: "Toys" },
  { name: "Beauty", value: "Beauty" },
  { name: "Food", value: "Food" },
];

function ProductsContent() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const {
    products,
    featuredProducts,
    categoryProducts,
    isLoading,
    total,
    page,
    pages,
  } = useAppSelector((state) => state.products);

  // Check if featured param exists in URL
  const featuredParam = searchParams.get("featured");
  const initialShowFeatured = featuredParam === "true";

  // Check if category param exists in URL
  const categoryParam = searchParams.get("category");

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    categoryParam || "all",
  );
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(initialShowFeatured);
  const [priceFilter, setPriceFilter] = useState<[number, number] | null>(null);

  // Use featured products when filter is active
  const displayedProducts = showFeaturedOnly
    ? featuredProducts
    : selectedCategory && selectedCategory !== "all"
      ? categoryProducts
      : products;

  // Apply price filter client-side
  const filteredByPrice = priceFilter
    ? displayedProducts.filter(
        (p) => p.price >= priceFilter[0] && p.price <= priceFilter[1],
      )
    : displayedProducts;

  // Fetch products on mount and when filters change
  useEffect(() => {
    if (showFeaturedOnly) {
      dispatch(
        fetchFeaturedProducts(
          selectedCategory === "all" ? "" : selectedCategory,
        ),
      );
    } else if (selectedCategory && selectedCategory !== "all") {
      dispatch(
        fetchProductsByCategory({ category: selectedCategory, page: 1 }),
      );
    } else {
      dispatch(fetchAllProducts({ page: 1, limit: 10 }));
    }
  }, [dispatch, showFeaturedOnly, selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    if (searchQuery) {
      dispatch(searchProducts(searchQuery));
    } else if (selectedCategory && selectedCategory !== "all") {
      dispatch(
        fetchProductsByCategory({ category: selectedCategory, page: 1 }),
      );
    } else {
      dispatch(fetchAllProducts({ page: 1, limit: 10 }));
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setSearchQuery("");
    if (category && category !== "all") {
      dispatch(fetchProductsByCategory({ category, page: 1 }));
    } else {
      dispatch(fetchAllProducts({ page: 1, limit: 10 }));
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setShowFeaturedOnly(false);
    setCurrentPage(1);
    dispatch(fetchAllProducts({ page: 1, limit: 10 }));
  };

  const handleFeaturedToggle = (featured: boolean) => {
    setShowFeaturedOnly(featured);
    setCurrentPage(1);
    setSearchQuery("");
    if (featured) {
      dispatch(
        fetchFeaturedProducts(
          selectedCategory === "all" ? "" : selectedCategory,
        ),
      );
    } else if (selectedCategory && selectedCategory !== "all") {
      dispatch(
        fetchProductsByCategory({ category: selectedCategory, page: 1 }),
      );
    } else {
      dispatch(fetchAllProducts({ page: 1, limit: 10 }));
    }
  };

  const hasFilters =
    searchQuery ||
    (selectedCategory && selectedCategory !== "all") ||
    showFeaturedOnly;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        {/* Page Header */}
        <div className="bg-muted/30 py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">All Products</h1>
            <p className="text-muted-foreground">
              Browse our collection of products
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Featured Toggle */}
            <Button
              variant={showFeaturedOnly ? "default" : "outline"}
              onClick={() => handleFeaturedToggle(!showFeaturedOnly)}
              className={showFeaturedOnly ? "" : "gap-2"}
            >
              <Star
                className={`h-4 w-4 ${showFeaturedOnly ? "fill-current" : ""}`}
              />
              Featured
            </Button>

            {/* Price Filter */}
            <div className="w-[200px]">
              <PriceFilter
                products={displayedProducts}
                onPriceFilter={(min, max) => {
                  setPriceFilter([min, max]);
                }}
              />
            </div>
          </div>

          {/* Active Filters */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      dispatch(fetchAllProducts({ page: 1, limit: 10 }));
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedCategory && selectedCategory !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Category: {selectedCategory}
                  <button onClick={() => handleCategoryChange("all")}>
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
          <div className="mb-6">
            <p className="text-muted-foreground">
              {isLoading
                ? "Loading..."
                : showFeaturedOnly
                  ? `${displayedProducts.length} featured products`
                  : priceFilter
                    ? `${filteredByPrice.length} products found`
                    : `${total} products found`}
            </p>
          </div>

          {/* Products Grid - 5 products per row */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-muted rounded-lg mb-4" />
                  <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-6 bg-muted rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : displayedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {filteredByPrice.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                {hasFilters
                  ? "Try adjusting your filters or search terms"
                  : "No products available yet"}
              </p>
              {hasFilters && (
                <Button onClick={clearFilters}>Clear Filters</Button>
              )}
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
                          if (selectedCategory && selectedCategory !== "all") {
                            dispatch(
                              fetchProductsByCategory({
                                category: selectedCategory,
                                page: page - 1,
                              }),
                            );
                          } else {
                            dispatch(
                              fetchAllProducts({ page: page - 1, limit: 10 }),
                            );
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
                          setCurrentPage(i + 1);
                          if (selectedCategory && selectedCategory !== "all") {
                            dispatch(
                              fetchProductsByCategory({
                                category: selectedCategory,
                                page: i + 1,
                              }),
                            );
                          } else {
                            dispatch(
                              fetchAllProducts({ page: i + 1, limit: 10 }),
                            );
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
                          setCurrentPage(page + 1);
                          if (selectedCategory && selectedCategory !== "all") {
                            dispatch(
                              fetchProductsByCategory({
                                category: selectedCategory,
                                page: page + 1,
                              }),
                            );
                          } else {
                            dispatch(
                              fetchAllProducts({ page: page + 1, limit: 10 }),
                            );
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
