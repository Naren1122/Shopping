"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function EsewaDemoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId") || "";
  const amount = searchParams.get("amt") || "0";
  const productId = searchParams.get("pid") || "";

  const [step, setStep] = useState<"credentials" | "processing" | "success" | "failed">("credentials");
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("processing");
    setTimeout(() => { setStep("success"); }, 2000);
  };

  const handleSuccess = async () => {
    router.push(`/payment-success?orderId=${orderId}`);
  };

  const handleFailed = () => {
    router.push(`/payment-failed?orderId=${orderId}`);
  };

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Invalid Request</h2>
            <p className="text-muted-foreground">No order ID provided</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <div className="bg-[#60b530] text-white p-4 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#60b530] font-bold text-xl">e</span>
            </div>
            <div><h1 className="font-bold text-lg">eSewa</h1><p className="text-xs opacity-80">Secure Payment Gateway</p></div>
          </div>
        </div>
        <CardHeader><CardTitle className="text-center">{step === "credentials" && "Enter Payment Details"}{step === "processing" && "Processing Payment"}{step === "success" && "Payment Successful"}{step === "failed" && "Payment Failed"}</CardTitle></CardHeader>
        <CardContent>
          {step !== "failed" && <div className="bg-gray-50 p-4 rounded-lg mb-6 text-center"><p className="text-sm text-muted-foreground">Pay Amount</p><p className="text-3xl font-bold text-gray-900">Rs. {parseFloat(amount).toLocaleString()}</p><p className="text-xs text-muted-foreground mt-1">Product: {productId}</p></div>}
          {step === "credentials" && <form onSubmit={handleLogin} className="space-y-4"><div className="space-y-2"><Label htmlFor="username">eSewa ID / Mobile Number</Label><Input id="username" type="text" placeholder="Enter your eSewa ID" value={credentials.username} onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} required /></div><div className="space-y-2"><Label htmlFor="password">Password / MPIN</Label><Input id="password" type="password" placeholder="Enter your password" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} required /></div><div className="bg-blue-50 p-3 rounded-lg"><p className="text-xs text-blue-700"><strong>Demo Mode:</strong> Use any credentials to test.</p></div><Button type="submit" className="w-full bg-[#60b530] hover:bg-[#4a9e26]">Pay Now</Button><Button type="button" variant="outline" className="w-full mt-2" onClick={handleFailed}>Cancel</Button></form>}
          {step === "processing" && <div className="text-center py-8"><Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-[#60b530]" /><p className="text-muted-foreground">Processing your payment</p></div>}
          {step === "success" && <div className="text-center py-6"><CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" /><h3 className="text-xl font-bold mb-2">Payment Successful!</h3><Button onClick={handleSuccess} className="w-full bg-[#60b530] hover:bg-[#4a9e26]">Continue</Button></div>}
          {step === "failed" && <div className="text-center py-6"><XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" /><h3 className="text-xl font-bold mb-2">Payment Failed</h3><Button onClick={() => router.push(`/payment-failed?orderId=${orderId}`)} className="w-full">Go Back</Button></div>}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground"><Lock className="h-3 w-3" /><span>Secure 256-bit SSL Encrypted Connection</span></div>
        </CardContent>
      </Card>
      <div className="fixed bottom-4 text-center w-full"><p className="text-xs text-muted-foreground">Demo Payment Page | For Development Testing Only</p></div>
    </div>
  );
}

function Loading() {
  return (<div className="min-h-screen flex items-center justify-center bg-gray-100"><Card className="w-full max-w-md"><CardContent className="pt-6 text-center"><Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" /><p className="text-muted-foreground">Loading...</p></CardContent></Card></div>);
}

export default function EsewaDemoPage() { return (<Suspense fallback={<Loading />}><EsewaDemoContent /></Suspense>); }
