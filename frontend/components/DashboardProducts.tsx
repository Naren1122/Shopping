"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/lib/features/products/productsSlice";
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

interface DashboardProductsProps {
  products: Product[];
  isLoading: boolean;
}

export function DashboardProducts({
  products,
  isLoading,
}: DashboardProductsProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalProducts = products.length;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = products.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const productsSection = document.getElementById("dashboard-products");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="dashboard-products" className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">All Products</h2>

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
              No Products Available
            </h3>
            <p className="text-muted-foreground">
              Check back later for products
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
