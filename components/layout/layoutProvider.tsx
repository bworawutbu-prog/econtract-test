"use client";

import React, { Suspense, memo } from "react";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { theme } from "antd";
import { SnackbarProvider } from "notistack";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store";
import { usePageLoading } from "@/store/hooks";
import LoadingWrapper from "@/components/loadingSkeleton/LoadingWrapper";
import AuthGuard from "./AuthGuard";
import AuthInit from "./AuthInit";

// Create a loader component
const LayoutLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
  </div>
);

// Use next/dynamic for layouts to optimize code-splitting and control SSR
const BackendLayout = dynamic(() => import("./backendLayout"), {
  ssr: false,
  loading: () => <LayoutLoader />,
});

const FrontendLayout = dynamic(() => import("./frontendLayout"), {
  ssr: false,
  loading: () => <LayoutLoader />,
});

const PdfLayout = dynamic(() => import("./pdfLayout"), {
  ssr: false,
  loading: () => <LayoutLoader />,
});

// Update layout type mapping with more specific paths
const layoutTypeMap: Record<string, "pdf" | "table" | "form"> = {
  "/backend": "table",
  "/backend/folderWorkspace": "table",
  "/backend/Mapping": "pdf",
  "/backend/MappingTest": "pdf",
  "/frontend/Mapping": "pdf",
  "/profile": "table",
  "/backend/organization": "table",
  "/stamp": "table",
  "/document": "table",
  "/manageBusinessUser/internal": "table",
};

const mappingPaths = ["/backend/Mapping", "/backend/MappingTest", "/frontend/Mapping"];

// Create a separate component for layout selection with loading state
const LayoutSelector = memo(({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const isLoading = usePageLoading();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Memoize layout selection logic
  const getSkeletonType = React.useMemo(() => {
    // Check exact matches first
    if (layoutTypeMap[pathname]) return layoutTypeMap[pathname];

    // Check dynamic routes
    if (pathname.includes('/Mapping')) return 'pdf';
    if (pathname.includes('/MappingTest')) return 'pdf';
    if (pathname.includes('/folderWorkspace')) return 'table';
    if (pathname.includes('/profile')) return 'table';
    if (pathname.includes('/organization')) return 'table';
    // Default to table skeleton
    return 'table';
  }, [pathname]);

  // Don't show loading for login page, redirect routes, and loading page to prevent flickering
  const shouldShowLoading = React.useMemo(() => {
    if (pathname === '/login' || pathname === '/redirect' || pathname === '/loading') {
      return false; // Never show loading for these pages to prevent flickering
    }
    return isLoading;
  }, [isLoading, pathname]);

  const getLayout = React.useCallback(() => {
    switch (true) {
      // Special handling for login, redirect, and loading pages - no loading wrapper to prevent flickering
      case pathname === '/login':
      case pathname === '/redirect':
      case pathname === '/loading':
        return <>{children}</>;

      case mappingPaths.includes(pathname):
        return (
          <Suspense fallback={<LayoutLoader />}>
            <PdfLayout>
              <LoadingWrapper loading={isLoading} type={getSkeletonType}>
                {children}
              </LoadingWrapper>
            </PdfLayout>
          </Suspense>
        );

      case pathname.startsWith("/backend"):
      case pathname.startsWith("/profile"):
      case pathname.startsWith("/organization"):
      case pathname.startsWith("/stamp"):
      case pathname.startsWith("/document"):
      case pathname.startsWith("/manageBusinessUser"):
        return (
          <Suspense fallback={<LayoutLoader />}>
            <BackendLayout
              colorBgContainer={colorBgContainer}
              borderRadiusLG={borderRadiusLG}
            >
              <LoadingWrapper loading={isLoading} type={getSkeletonType}>
                {children}
              </LoadingWrapper>
            </BackendLayout>
          </Suspense>
        );

      case pathname.startsWith("/frontend"):
        return (
          <Suspense fallback={<LayoutLoader />}>
            <FrontendLayout>
              <LoadingWrapper loading={isLoading} type={getSkeletonType}>
                {children}
              </LoadingWrapper>
            </FrontendLayout>
          </Suspense>
        );

      default:
        return (
          <LoadingWrapper loading={shouldShowLoading} type={getSkeletonType}>
            {children}
          </LoadingWrapper>
        );
    }
  }, [pathname, children, mappingPaths, isLoading, getSkeletonType, shouldShowLoading]);

  return getLayout();
});

// Main provider component
export const LayoutProvider = memo(({ children }: { children: ReactNode }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={<LayoutLoader />} persistor={persistor}>
        <AuthInit />
        <SnackbarProvider
          maxSnack={3}
          autoHideDuration={2000}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          style={{
            fontFamily: "sarabun, sans-serif",
          }}
        >
          <AuthGuard>
            <LayoutSelector>{children}</LayoutSelector>
          </AuthGuard>
        </SnackbarProvider>
      </PersistGate>
    </Provider>
  );
});
