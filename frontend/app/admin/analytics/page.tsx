"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, TrendingUp, Package, DollarSign, ShoppingCart } from "lucide-react";

interface SalesData {
  _id: string;
  totalOrders: number;
  totalRevenue: number;
}

interface TopProduct {
  productId: string;
  name: string;
  image: string;
  totalSold: number;
  totalRevenue: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("week");
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [overview, setOverview] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    todayOrders: 0,
    todayRevenue: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const [salesRes, topProductsRes, overviewRes] = await Promise.all([
        fetch(`/api/analytics/sales?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/analytics/top-products`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/analytics/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (salesRes.status === 401 || salesRes.status === 403) {
        router.push("/login");
        return;
      }

      const salesData = await salesRes.json();
      const topProductsData = await topProductsRes.json();
      const overviewData = await overviewRes.json();

      setSalesData(salesData.salesData || []);
      setTopProducts(topProductsData || []);
      setOverview(overviewData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ne-NP", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your store performance and sales</p>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(overview.totalRevenue)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {overview.totalOrders}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {overview.totalProducts}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {overview.totalUsers}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <Tabs value={period} onValueChange={setPeriod}>
            <TabsList>
              <TabsTrigger value="day">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
              <TabsTrigger value="year">This Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Sales Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {salesData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="_id"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                      }}
                    />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `Rs. ${value}`} />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalRevenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6" }}
                      name="Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="totalOrders"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981" }}
                      name="Orders"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No sales data available for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Units Sold</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product, index) => (
                      <tr key={product.productId} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-md bg-gray-200 overflow-hidden flex-shrink-0">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                  <Package className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                            <span className="font-medium text-gray-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 text-gray-700">{product.totalSold}</td>
                        <td className="text-right py-3 px-4 font-medium text-green-600">
                          {formatCurrency(product.totalRevenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                No top products data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}