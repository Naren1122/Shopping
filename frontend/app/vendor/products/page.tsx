"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchAllProducts,
  deleteProduct,
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, Plus, Edit } from "lucide-react";
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
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function VendorProductsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { products, isLoading } = useAppSelector((state) => state.products);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);

  // Protect route - only vendors
  useEffect(() => {
    if (isAuthenticated && user?.role !== "vendor") {
      toast.error("Access denied. Vendor only.");
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  // Fetch only this vendor's products
  useEffect(() => {
    if (user?.id) {
      dispatch(
        fetchAllProducts({
          page: currentPage,
          limit: 10,
          vendorId: user.id,
        })
      );
    }
  }, [dispatch, currentPage, user?.id]);

  const handleDelete = async (productId: string) => {
    try {
      await dispatch(deleteProduct(productId)).unwrap();
      toast.success("Product deleted successfully");
      // Refresh list
      if (user?.id) {
        dispatch(fetchAllProducts({ page: currentPage, limit: 10, vendorId: user.id }));
      }
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Products</h1>
            <p className="text-muted-foreground">Manage your store inventory</p>
          </div>
          <Button onClick={() => router.push("/vendor/products/new")}>
            <Plus className="mr-2 h-4 w-4" /> Add New Product
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Products ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No products yet. Start by adding your first product.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <div>{product.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>${product.price}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/vendor/products/${product._id}/edit`)
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
                                <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(product._id)}
                                  className="bg-destructive text-destructive-foreground"
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
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={() => router.push("/vendor")}
          >
            Back to Dashboard
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
