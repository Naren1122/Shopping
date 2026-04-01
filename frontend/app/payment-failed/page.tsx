"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { XCircle, AlertTriangle, ShoppingCart, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    if (orderId) {
      router.push(`/checkout/payment?orderId=${orderId}`);
    } else {
      router.push("/cart");
    }
    setIsRetrying(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
            <p className="text-muted-foreground">
              Unfortunately, your payment could not be processed. Please try
              again.
            </p>
            {orderId && (
              <p className="text-sm text-muted-foreground mt-2">
                Order ID: <span className="font-medium">{orderId}</span>
              </p>
            )}
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Possible reasons:</p>
                  <ul className="text-sm text-red-700 mt-2 space-y-1">
                    <li>• Insufficient balance in your eSewa account</li>
                    <li>• Transaction timeout or network error</li>
                    <li>• Invalid payment credentials</li>
                    <li>• Bank server temporarily unavailable</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full sm:w-auto"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </>
              )}
            </Button>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="default" size="lg" className="w-full">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              If the problem persists, please contact our support team at{" "}
              <span className="text-primary">support@bazar.com</span>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
