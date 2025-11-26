"use client";

import { useEffect, ReactNode, useState, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/store/hooks";
import { setCookie, getCookie, deleteCookie } from 'cookies-next/client';
import { enqueueSnackbar } from "notistack";

interface AuthGuardProps {
  children: ReactNode;
}

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/redirect", "/external_download", "/one-platform"];

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAuth();
  const searchParams = useSearchParams();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isGuest_fromlocalstorage = typeof window !== "undefined" && sessionStorage.getItem("isGuest") === "true";
  
  // Add state to prevent redirect loops and manage loading states
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check for access token directly from cookies as fallback
  const hasAccessToken = typeof window !== "undefined" && !!getCookie("accessToken");

  // Initialize authentication state
  useEffect(() => {
    // Set initializing to false after a short delay to ensure all auth checks are complete
    const initTimer = setTimeout(() => {
      setIsInitializing(false);
    }, 100);

    return () => clearTimeout(initTimer);
  }, []);

   useEffect(() => {
    if (pathname !== '/stamp/payment') {
      sessionStorage.removeItem('estamp_prev_path');
    }
  }, [pathname]);

  useEffect(() => {
    const fullPath = `${pathname}?${searchParams.toString()}`;
    const guest_token = searchParams.get("token");
    const params = new URLSearchParams(window.location.search);
    
    if (isGuest_fromlocalstorage) {
      deleteCookie("user");
      deleteCookie("accessToken");
      deleteCookie("refreshToken");
    }

    if (pathname === "/redirect" || pathname === "/one-platform") {
      if (guest_token) {
        localStorage.setItem("token", guest_token);
        localStorage.setItem("accessToken", guest_token);
      } else {
        // enqueueSnackbar(`🎯 [AuthGuard] No token found in redirect URL. Redirecting to login.`, {
        //   variant: "warning", 
        //   autoHideDuration: 3000,
        // });
        router.replace('/login');
      }
      return;
    } else if (pathname === "/external_download") {
      const tokenString = btoa("https://dev-digitrust.softway.co.th/external_download?url=/api/file/public-download-pdf/:transaction_id");
      if (tokenString) {
        localStorage.setItem("token", tokenString);
        localStorage.setItem("accessToken", tokenString);
      }
    }
    
    // Clear any existing redirect timeout
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }
    
    // Prevent redirect loop by adding more specific conditions
    if (loading || isRedirecting || isInitializing) {
      return; // Don't redirect while loading, redirecting, or initializing
    }

    // Check if user is authenticated or is guest (use both Redux state and cookie fallback)
    const pendingFlowType = sessionStorage.getItem("pendingType");
    const pendingTransactionId = sessionStorage.getItem("pendingTransactionId");
    const isUserAuthenticated = isAuthenticated || hasAccessToken || isGuest_fromlocalstorage;
    
    // console.log('🔍 [AuthGuard] Auth check:', { 
    //   isUserAuthenticated, 
    //   isPublicRoute, 
    //   pathname, 
    //   pendingFlowType, 
    //   pendingTransactionId,
    //   loading,
    //   isRedirecting,
    //   isInitializing
    // });
    
    // If not authenticated and not on public route, redirect to login
    if (!isUserAuthenticated && !isPublicRoute) {
      // console.log('🔒 [AuthGuard] Not authenticated, redirecting to login');
      setIsRedirecting(true);
      router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    
    // If authenticated and on login page, let the login page handle the redirect
    if (isUserAuthenticated && pathname === "/login") {
      // console.log('✅ [AuthGuard] Already authenticated, letting login page handle redirect');
      // Don't redirect here - let the login page handle it to prevent UI flickering
      return;
    }
  }, [isAuthenticated, loading, pathname, router, isPublicRoute, isGuest_fromlocalstorage, searchParams, hasAccessToken, isInitializing]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  // Reset redirecting state when pathname changes
  useEffect(() => {
    setIsRedirecting(false);
  }, [pathname]);

  // Show loading screen for guest users
  if (isGuest_fromlocalstorage) {
    return <>{children}</>;
  } 

  // For redirects, don't show full screen loading - let the login page handle it
  if (isRedirecting || (!isAuthenticated && !isPublicRoute)) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
