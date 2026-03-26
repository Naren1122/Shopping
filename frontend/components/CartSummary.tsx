"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";

interface CartSummaryProps {
  onCheckout?: () => void;
}

export function CartSummary({ onCheckout }: CartSummaryProps) {
  const router = useRouter();
  const { items } = useAppSelector((state) => state.cart);
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);

  // Calculate totals
  const subtotal = items.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0,
  );

  const shipping = subtotal > 0 ? (subtotal >= 1000 ? 0 : 100) : 0;
  const discount = couponApplied ? subtotal * 0.1 : 0; // 10% discount if coupon applied
  const total = subtotal + shipping - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    // Simulate coupon validation - in real app, call API
    setTimeout(() => {
      setCouponApplied(true);
      setIsApplyingCoupon(false);
    }, 500);
  };

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      router.push("/checkout/address");
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0) {
    return null;
  }

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Coupon Code */}
        <div className="space-y-2">
          <Label htmlFor="coupon">Coupon Code</Label>
          <div className="flex gap-2">
            <Input
              id="coupon"
              placeholder="Enter coupon"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={couponApplied}
            />
            <Button
              variant="secondary"
              onClick={handleApplyCoupon}
              disabled={isApplyingCoupon || couponApplied || !couponCode.trim()}
            >
              {couponApplied ? "Applied" : "Apply"}
            </Button>
          </div>
          {couponApplied && (
            <p className="text-sm text-green-600">10% discount applied!</p>
          )}
        </div>

        <Separator />

        {/* Order Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Subtotal ({itemCount} items)
            </span>
            <span>Rs. {subtotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>
              {shipping === 0 ? "Free" : `Rs. ${shipping.toLocaleString()}`}
            </span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-Rs. {discount.toLocaleString()}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>Rs. {total.toLocaleString()}</span>
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-3">
        <Button className="w-full" size="lg" onClick={handleCheckout}>
          Proceed to Checkout
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Shipping is free for orders above Rs. 1,000
        </p>
      </CardFooter>
    </Card>
  );
}
