"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ShoppingBag,
  Trash2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { initializeAuth } from "@/lib/features/auth/authSlice";
import { fetchOrderById } from "@/lib/features/orders/ordersSlice";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
  } = useAppSelector((state) => state.auth);
  const {
    currentOrder: order,
    isLoading: orderLoading,
    error,
  } = useAppSelector((state) => state.orders);

  // Cancel dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Review dialog state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    productId: string;
    name: string;
    image?: string;
  } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedProducts, setReviewedProducts] = useState<string[]>([]);

  useEffect(() => {
    // Check auth
    if (!isAuthenticated && !authLoading) {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          dispatch(initializeAuth({ user: parsedUser, token }));
        } catch {
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, authLoading, dispatch, router]);

  // Fetch order details when authenticated
  useEffect(() => {
    if (isAuthenticated && params.id) {
      dispatch(fetchOrderById(params.id as string));
    }
  }, [isAuthenticated, params.id, dispatch]);

  // Show error if any
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle cancel order
  const handleCancelOrder = async () => {
    if (!order) return;

    setCancelling(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "/api"}/orders/${order._id}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: cancelReason }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to cancel order");
      }

      toast.success("Order cancelled successfully");
      setCancelDialogOpen(false);
      setCancelReason("");
      // Refresh order details
      dispatch(fetchOrderById(order._id));
    } catch (err: unknown) {
      console.error("Error cancelling order:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to cancel order",
      );
    } finally {
      setCancelling(false);
    }
  };

  // Handle delete order
  const handleDeleteOrder = async () => {
    if (!order) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "/api"}/orders/${order._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete order");
      }

      toast.success("Order deleted successfully");
      router.push("/orders");
    } catch (err: unknown) {
      console.error("Error deleting order:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete order",
      );
    } finally {
      setDeleting(false);
    }
  };

  // Handle submit review
  const handleSubmitReview = async () => {
    if (!selectedProduct || !reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "/api"}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: selectedProduct.productId,
            rating: reviewRating,
            comment: reviewComment,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to submit review");
      }

      toast.success("Review submitted successfully!");
      setReviewedProducts([...reviewedProducts, selectedProduct.productId]);
      setReviewDialogOpen(false);
      setSelectedProduct(null);
      setReviewRating(5);
      setReviewComment("");
    } catch (err: unknown) {
      console.error("Error submitting review:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to submit review",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Clock className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-yellow-500";
      case "shipped":
        return "bg-blue-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render if redirecting
  if (!isAuthenticated || !user) {
    return null;
  }

  // Show loading while fetching order
  if (orderLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Order not found
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Order not found</h2>
            <p className="text-muted-foreground mb-4">
              The order you&apos;re looking for doesn&apos;t exist or you
              don&apos;t have access.
            </p>
            <Link href="/orders">
              <Button>View All Orders</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link
            href="/orders"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>

          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-muted-foreground">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge
                className={`${getStatusColor(order.orderStatus)} text-white`}
              >
                <span className="flex items-center gap-1">
                  {getStatusIcon(order.orderStatus)}
                  {order.orderStatus.charAt(0).toUpperCase() +
                    order.orderStatus.slice(1)}
                </span>
              </Badge>
              <Badge
                className={`${getPaymentStatusColor(order.paymentStatus)} text-white`}
              >
                {order.paymentStatus.charAt(0).toUpperCase() +
                  order.paymentStatus.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Order Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.orderItems.map((item, index) => (
                      <div key={index}>
                        <div className="flex gap-4">
                          <div className="w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × Rs.{" "}
                              {item.price.toLocaleString()}
                            </p>
                            {/* Review button for delivered orders */}
                            {order.orderStatus === "delivered" &&
                              item.product && (
                                <div className="mt-2">
                                  {reviewedProducts.includes(item.product) ? (
                                    <div className="flex items-center gap-1 text-sm text-green-600">
                                      <Star className="h-4 w-4 fill-green-600" />
                                      Reviewed
                                    </div>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedProduct({
                                          productId: item.product,
                                          name: item.name,
                                          image: item.image,
                                        });
                                        setReviewDialogOpen(true);
                                      }}
                                    >
                                      <Star className="h-4 w-4 mr-1" />
                                      Write Review
                                    </Button>
                                  )}
                                </div>
                              )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              Rs.{" "}
                              {(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {index < order.orderItems.length - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Payment Method
                      </p>
                      <p className="font-medium">
                        {order.paymentMethod === "esewa"
                          ? "eSewa"
                          : "Cash on Delivery"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Payment Status
                      </p>
                      <p className="font-medium capitalize">
                        {order.paymentStatus}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <Separator className="my-2" />
                      <div className="flex justify-between pt-2">
                        <p className="font-semibold">Total</p>
                        <p className="text-xl font-bold">
                          Rs. {order.totalPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Shipping Address */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">
                      {order.shippingAddress.fullName}
                    </p>
                    <p className="text-muted-foreground">
                      {order.shippingAddress.address}
                    </p>
                    <p className="text-muted-foreground">
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.district}
                    </p>
                    <p className="text-muted-foreground">
                      {order.shippingAddress.province}
                    </p>
                    {order.shippingAddress.phone && (
                      <div className="flex items-center gap-2 pt-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {order.shippingAddress.phone}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Order Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Order Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div>
                        <p className="text-sm font-medium">Order Placed</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    {order.orderStatus !== "cancelled" && (
                      <>
                        {(order.orderStatus === "shipped" ||
                          order.orderStatus === "delivered") && (
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <div>
                              <p className="text-sm font-medium">
                                Order Shipped
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Your order has been dispatched
                              </p>
                            </div>
                          </div>
                        )}
                        {order.orderStatus === "delivered" && (
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <div>
                              <p className="text-sm font-medium">Delivered</p>
                              <p className="text-xs text-muted-foreground">
                                {order.deliveredAt
                                  ? formatDate(order.deliveredAt)
                                  : "Delivered"}
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {order.orderStatus === "cancelled" && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <div>
                          <p className="text-sm font-medium">Order Cancelled</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Cancel Order Button - Only show for pending/processing orders */}
              {(order.orderStatus === "pending" ||
                order.orderStatus === "processing") && (
                <Card className="mt-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-yellow-800 dark:text-yellow-200">
                          Need to cancel this order?
                        </p>
                        <p className="text-sm text-yellow-600 dark:text-yellow-300">
                          You can cancel your order before it is shipped.
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => setCancelDialogOpen(true)}
                      >
                        Request Cancellation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Delete Order Button - Only show for cancelled orders */}
              {order.orderStatus === "cancelled" && (
                <Card className="mt-4 border-red-200 bg-red-50 dark:bg-red-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-800 dark:text-red-200">
                          Delete this order?
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-300">
                          Permanently remove this order from your history.
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        Delete Order
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be
              undone.
              {order?.paymentStatus === "paid" && (
                <p className="mt-2 text-yellow-600">
                  This order has been paid. A refund will be initiated.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              Reason for cancellation (optional)
            </label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              Keep Order
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Order Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this order? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteOrder}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              How was your experience with {selectedProduct?.name}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Rating Selection */}
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= reviewRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-muted text-muted"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {reviewRating === 5
                ? "Excellent!"
                : reviewRating === 4
                  ? "Great!"
                  : reviewRating === 3
                    ? "Good"
                    : reviewRating === 2
                      ? "Fair"
                      : "Poor"}
            </p>
            {/* Comment */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Your Review
              </label>
              <Textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReviewDialogOpen(false);
                setSelectedProduct(null);
                setReviewRating(5);
                setReviewComment("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={submittingReview || !reviewComment.trim()}
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
