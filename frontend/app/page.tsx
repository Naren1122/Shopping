"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchAllProducts,
  fetchFeaturedProducts,
  Product,
} from "@/lib/features/products/productsSlice";
import { Navbar } from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import { ProductCard } from "@/components/ProductCard";
import { Footer } from "@/components/Footer";
import { ChatWidgetWrapper } from "@/components/ChatWidgetWrapper";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PRODUCTS_PER_PAGE = 8;
const PRODUCTS_PER_ROW = 4;

// API URL for backend
const API_URL = "http://localhost:5000/api/auth";

export default function Home() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { products, featuredProducts, isLoading } = useAppSelector(
    (state) => state.products,
  );
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Redirect authenticated users to their dashboard (client-side check)
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [isAuthenticated, user, router]);

  // Check authentication on page mount - redirect if already logged in (backend check)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/check-auth`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });

        // Skip redirect if response is not OK or not JSON
        if (
          !response.ok ||
          response.headers.get("content-type")?.indexOf("application/json") ===
            -1
        ) {
          return;
        }

        const data = await response.json();

        if (data.isAuthenticated && data.redirectTo) {
          router.replace(data.redirectTo);
        }
      } catch (error) {
        // Silently fail - user stays on homepage
        console.error("Auth check failed:", error);
      }
    };

    checkAuth();
  }, [router]);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Fetch both all products and featured products
    dispatch(fetchAllProducts({}));
    dispatch(fetchFeaturedProducts(""));
  }, [dispatch]);

  // Use all products from the store (includes both featured and unfeatured)
  const allProducts = products;
  const unfeaturedProducts = allProducts.filter((p) => !p.isFeatured);
  const featuredOnly = allProducts.filter((p) => p.isFeatured);

  // Calculate pagination for all products (including unfeatured)
  const totalProducts = allProducts.length;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = allProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of products section
    const productsSection = document.getElementById("featured-products");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Featured Products with Pagination */}
        <section id="featured-products" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            {/* Section Header */}

            {/* Products Grid - 4 products per row */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-muted rounded-lg mb-4" />
                    <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                    <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-6 bg-muted rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : currentProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {currentProducts.map((product: Product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1) {
                                handlePageChange(currentPage - 1);
                              }
                            }}
                            className={
                              currentPage <= 1
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>

                        {/* Page Numbers */}
                        {[...Array(totalPages)].map((_, i) => (
                          <PaginationItem key={i + 1}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(i + 1);
                              }}
                              isActive={currentPage === i + 1}
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
                              if (currentPage < totalPages) {
                                handlePageChange(currentPage + 1);
                              }
                            }}
                            className={
                              currentPage >= totalPages
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <p className="text-4xl">📦</p>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No Featured Products Yet
                </h3>
                <p className="text-muted-foreground">
                  Check back later for featured products
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Chat Widget */}
      <ChatWidgetWrapper />
    </div>
  );
}
