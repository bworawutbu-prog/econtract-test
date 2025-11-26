"use client";

import { useAuth } from "@/store/hooks";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Component that runs on initial app load to check authentication status
 * This is used to ensure auth state is initialized before any page renders
 */
export default function AuthInit() {
  // useAuth hook automatically checks auth status on mount
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Preload common routes and heavy layouts after login to reduce client-side latency
  useEffect(() => {
    if (!isAuthenticated) return;

    // Prefetch common app routes
    try {
      router.prefetch?.("/frontend");
      router.prefetch?.("/backend");
      router.prefetch?.("/profile");
      router.prefetch?.("/organization");
      router.prefetch?.("/stamp");
      router.prefetch?.("/frontend/Mapping");
      router.prefetch?.("/backend/Mapping");
      router.prefetch?.("/backend/MappingTest");
      router.prefetch?.("/stamp/form");
      router.prefetch?.("/stamp/allForm");
      router.prefetch?.("/document/statusContract");
      router.prefetch?.("/manageBusinessUser/internal");
    } catch { }

    // Warm-up dynamic mapping routes (without navigation)
    try {
      void import("@/components/layout/pdfLayout");
      void import("@/components/layout/backendLayout");
      void import("@/components/layout/frontendLayout");
      void import("@/components/loadingSkeleton/PDFSkeleton");
      void import("@/components/loadingSkeleton/TableSkeleton");
      void import("@/components/loadingSkeleton/FormSkeleton");
    } catch { }
  }, [isAuthenticated, router]);

  // This component doesn't render anything
  return <></>;
}
