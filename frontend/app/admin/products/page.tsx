"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchAllProducts,
  deleteProduct,
  toggleFeatured,
  fetchFeaturedProducts,
} from "@/lib/features/products/productsSlice";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Star, Plus, Edit } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function AdminProductsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { products, isLoading, total, page, pages } = useAppSelector(
    (state) => state.products,
  );
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);

  // Check if user is admin
  useEffect(() => {
    if (isAuthenticated && user?.role !== "admin") {
      toast.error("Access denied. Admin only.");
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  // Fetch products
  useEffect(() => {
    dispatch(fetchAllProducts({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);

  const handleDelete = async (productId: string) => {
    try {
      await dispatch(deleteProduct(productId)).unwrap();
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleToggleFeatured = async (productId: string) => {
    try {
      // First fetch all products to ensure we have data for fallback
      await dispatch(fetchAllProducts({ page: currentPage, limit: 10 }));
      // Then toggle featured
      await dispatch(toggleFeatured(productId)).unwrap();
      // Refresh featured products so homepage shows updated data
      dispatch(fetchFeaturedProducts(""));
      toast.success("Product updated successfully");
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pages) {
      setCurrentPage(newPage);
    }
  };

  // Show loading or check auth
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-10">
        <p>Loading...</p>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      {/* Back Button and Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin")}
            className="mb-2 -ml-2"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Products Management</h1>
          <p className="text-muted-foreground">
            Manage your store products ({total} total)
          </p>
        </div>
        <Button onClick={() => router.push("/admin/products/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>
            View and manage all products in your store
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground mb-4">No products found</p>
              <Button onClick={() => router.push("/admin/products/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <div className="w-16 h-16 relative rounded-md overflow-hidden bg-muted">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              No Image
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        Rs. {product.price.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFeatured(product._id)}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              product.isFeatured
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/products/${product._id}/edit`)
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Product
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &nbsp;
                                  {product.name}
                                  &nbsp;? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(product._id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(page - 1)}
                          className={
                            page === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                      {Array.from({ length: pages }, (_, i) => i + 1).map(
                        (p) => (
                          <PaginationItem key={p}>
                            <PaginationLink
                              onClick={() => handlePageChange(p)}
                              isActive={page === p}
                              className="cursor-pointer"
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        ),
                      )}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(page + 1)}
                          className={
                            page === pages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
