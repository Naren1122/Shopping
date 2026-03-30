import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import { ChatWidgetWrapper } from "@/components/ChatWidgetWrapper";
import { AddToCartMiniDrawerWrapper } from "@/components/AddToCartMiniDrawerWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bazar - Your Trusted Online Marketplace",
  description: "Shop the best products at competitive prices on Bazar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            toastOptions={{
              style: {
                background: "#22c55e",
                color: "white",
                border: "none",
              },
            }}
          />
          <ChatWidgetWrapper />
          <AddToCartMiniDrawerWrapper />
        </StoreProvider>
      </body>
    </html>
  );
}
