"use client";

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import type { RootState, AppDispatch } from './index';
import type { RootStateAdmin, AppDispatchAdmin } from './backendStore';
import { usePermission } from './backendStore/permissionManager';
import { logoutUser } from './slices/authSlice';
import { AnyAction } from '@reduxjs/toolkit';
import { ThunkDispatch } from '@reduxjs/toolkit';

// Define types for the hooks
export type AppDispatchHook = () => AppDispatch;
export type AppSelectorHook = TypedUseSelectorHook<RootState>;

// Frontend store hooks (using store/index.ts)
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Admin store hooks (using store/backendStore/index.ts)
export const useAdminAppDispatch = () => useDispatch<AppDispatchAdmin>();
export const useAdminAppSelector: TypedUseSelectorHook<RootStateAdmin> = useSelector;

// Alternative implementation using withTypes syntax (React Redux v8+)
// export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
// export const useAppSelector = useSelector.withTypes<RootState>();
// export const useAdminAppDispatch = useDispatch.withTypes<AppDispatchAdmin>();
// export const useAdminAppSelector = useSelector.withTypes<RootStateAdmin>();

/**
 * Custom hook to handle authentication state and actions
 * @returns Authentication state and methods
 */
export const useAuth = () => {
  const dispatch = useAppDispatch() as ThunkDispatch<RootState, unknown, AnyAction> | any ; 
  const router = useRouter();
  const { user, isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  // Logout function
  const logout = async () => {
    await dispatch(logoutUser());
    router.replace('/login');
  };

  // Require auth function to use in components
  const requireAuth = (callback?: () => void) => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
      return false;
    }
    
    if (callback && isAuthenticated) {
      callback();
    }
    
    return isAuthenticated;
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    logout,
    requireAuth,
    isAdmin: user?.role === 'Admin' || user?.role === 'Super Admin',
    isDesigner: user?.role === 'Designer',
    isMember: user?.role === 'Member',
    isSuperAdmin: user?.role === 'Super Admin',
  };
};

/**
 * Hook for tracking page loading state
 * @returns boolean indicating if the page is currently loading
 */
export const usePageLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const patchedRef = useRef(false);
  const originalsRef = useRef<{ pushState?: History['pushState']; replaceState?: History['replaceState']; } | null>(null);
  const currentPathRef = useRef(pathname);

  // Set loading to true when pathname changes
  useEffect(() => {
    if (currentPathRef.current !== pathname) {
      setIsLoading(true);
      currentPathRef.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    // Listen for route changes via browser lifecycle
    window.addEventListener('beforeunload', handleStart);
    window.addEventListener('load', handleComplete);

    return () => {
      window.removeEventListener('beforeunload', handleStart);
      window.removeEventListener('load', handleComplete);
    };
  }, []);

  // When the route has changed (effect runs), consider navigation complete
  useEffect(() => {
    // Don't show loading for login page, loading page, and frontend page to prevent flickering during redirects
    if (pathname === '/login' || pathname === '/redirect' || pathname === '/loading' || pathname === '/frontend') {
      setIsLoading(false);
      return;
    }
    
    // Add a small delay to ensure loading state is visible for other pages
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return isLoading;
};

/**
 * Enhanced loading state with manual control
 * Provides isLoading state and functions to manually start/stop loading
 */
export function useLoadingState() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // This effect runs when the route changes
  useEffect(() => {
    // Route changes have completed since we're in this effect
    setIsLoading(false);
    
    // Cleanup function is not needed in this approach
    return () => {
      // Set loading to true when navigating away
      setIsLoading(true);
    };
  }, [pathname, searchParams]);

  // Function to manually set loading state for client-side transitions
  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  return { isLoading, startLoading, stopLoading };
}

// Export the permission hook for easy access
export { usePermission };