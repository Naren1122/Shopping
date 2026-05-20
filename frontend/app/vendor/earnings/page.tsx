"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Payout {
  amount: number;
  commission: number;
  status: string;
  orderId: string;
}

export default function VendorEarningsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    totalCommission: 0,
    pendingPayouts: 0,
    paidPayouts: 0,
  });
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Protect vendor route
  useEffect(() => {
    if (isAuthenticated && user?.role !== "vendor") {
      toast.error("Access denied. Vendor only.");
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  // Fetch vendor earnings
  useEffect(() => {
    const fetchEarnings = async () => {
      if (!user?.id) return;

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/orders?vendorId=${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          // For now, we'll simulate earnings from orders
          // In real implementation, this would come from backend payout data
          let total = 0;
          let commission = 0;
          let pending = 0;
          let paid = 0;

          const payoutList: Payout[] = [];

          data.orders?.forEach((order: any) => {
            if (order.payouts) {
              order.payouts.forEach((p: any) => {
                if (p.vendor === user.id) {
                  total += p.amount;
                  commission += p.commission;

                  if (p.status === "pending") pending += p.amount;
                  if (p.status === "paid") paid += p.amount;

                  payoutList.push({
                    ...p,
                    orderId: order._id,
                  });
                }
              });
            }
          });

          setEarnings({
            totalEarnings: total,
            totalCommission: commission,
            pendingPayouts: pending,
            paidPayouts: paid,
          });
          setPayouts(payoutList);
        }
      } catch (error) {
        console.error("Failed to fetch earnings");
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === "vendor") {
      fetchEarnings();
    }
  }, [user]);

  if (isLoading) {
    return <div className="p-8">Loading earnings...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Earnings</h1>
          <p className="text-muted-foreground">Track your sales and payouts</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Rs. {earnings.totalEarnings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Platform Commission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                Rs. {earnings.totalCommission}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Payouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                Rs. {earnings.pendingPayouts}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Paid Out
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                Rs. {earnings.paidPayouts}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payout History */}
        <Card>
          <CardHeader>
            <CardTitle>Payout History</CardTitle>
          </CardHeader>
          <CardContent>
            {payouts.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">
                No payouts yet. Start selling to see earnings here.
              </p>
            ) : (
              <div className="space-y-4">
                {payouts.map((payout, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center border-b pb-4 last:border-0"
                  >
                    <div>
                      <p className="font-medium">Order #{payout.orderId.slice(-8)}</p>
                      <p className="text-sm text-muted-foreground">
                        Commission: Rs. {payout.commission}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">Rs. {payout.amount}</p>
                      <Badge
                        variant={payout.status === "paid" ? "default" : "secondary"}
                      >
                        {payout.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
