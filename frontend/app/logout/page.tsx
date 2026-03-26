"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { logout } from "@/lib/features/auth/authSlice";

export default function LogoutPage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Perform logout
    dispatch(logout());

    // Use window.location for a hard redirect to ensure clean state
    // Delay slightly to ensure logout action completes
    const timer = setTimeout(() => {
      window.location.href = "/";
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Logging out...</p>
      </div>
    </div>
  );
}
