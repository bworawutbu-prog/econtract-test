'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from "react";
import axios from 'axios';
import { authCookies, updateUser, isAuthenticated } from '@/store/slices/authSlice';
import { loginBusiness } from '@/store/frontendStore/biz';
import { useAppDispatch } from '@/store/hooks';
import { AnyAction } from '@reduxjs/toolkit';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { setBusinessList, setSelectedBusiness } from '@/store/slices/businessSlice';
import { getUserProfile } from '@/store/frontendStore/userProfile';

// 🎯 Loading component for Suspense
function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F8FA]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p className="text-sm text-gray-600">กำลังโหลด...</p>
      </div>
    </div>
  );
}

// 🎯 Main component (needs to be wrapped in Suspense for useSearchParams)
function OnePlatformRedirectContent() {
  const dispatch = useAppDispatch() as ThunkDispatch<any, any, AnyAction>;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 🎯 FIXED: Use Next.js searchParams instead of window.location to avoid hydration errors
    const processAuth = async () => {
      try {
        setIsProcessing(true);
        setError(null);

        // Get params from Next.js searchParams (works on both server and client)
        const rawSearch = searchParams.toString();
        
        if (!rawSearch) {
          router.replace("/login");
          return;
        }

        // Clean search params
        const cleanedSearch = rawSearch
          .replaceAll("&&", "&")
          .replaceAll("%20", "")
          .replace("?", "");
        
        const params = new URLSearchParams(cleanedSearch);
        const one_sharedToken = params.get("sharedToken") || "";
        const BizID = params.get("BizID") || "";
        
        // Validate required parameters
        if (!one_sharedToken || !BizID) {
          console.error('❌ [One-Platform] Missing required parameters');
          router.replace("/login");
          return;
        }
        
        // Verify sharedToken
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/users/login/shared-token`,
          { shared_token: one_sharedToken },
          { headers: { 'Content-Type': 'application/json' } }
        );
        
        if (!response.data?.data) {
          throw new Error('Invalid response from authentication server');
        }

        const userData = response.data.data;
        const user = {
          id: userData.account_id || "0",
          username: userData.username || "",
          email: userData.email || "",
          fullName: userData.username || "",
          role: userData.role || "Member",
          business: userData.business || [],
          login_by: userData.login_by || userData.email || "",
        };
        
        // Save tokens and user data
        authCookies.saveTokens(
          userData.access_token,
          userData.refresh_token,
          user
        );
        
        // Update Redux state
        dispatch(updateUser(user));
        dispatch(isAuthenticated(true));
        
        const mapping = userData.business || [];
        
        // Verify business access
        const mappingCheck = mapping.find((item: any) => item.business_id === BizID);
        
        if (!mappingCheck || mappingCheck.business_id !== BizID) {
          throw new Error(`Business access denied for BizID: ${BizID}`);
        }
        
        // Set business list in Redux
        dispatch(setBusinessList(mapping));
        
        // Set selected business
        const selectedBusiness = mapping.find((item: any) => item.business_id === BizID);
        if (selectedBusiness) {
          dispatch(setSelectedBusiness({
            businessId: selectedBusiness.business_id,
            businessName: selectedBusiness.business_name_eng
          }));
          
          // Save to localStorage for Header display
          if (typeof window !== 'undefined') {
            localStorage.setItem("selectedBusiness", selectedBusiness.business_name_eng);
          }
        }
        
        // Get user profile
        await dispatch(getUserProfile());
        
        // Set session data
        if (typeof window !== 'undefined') {
          sessionStorage.setItem("isGuest", "false");
          localStorage.setItem("token", userData.access_token);
          localStorage.setItem("accessToken", userData.access_token);
        }
        
        // Login business to get roleBusiness
        const resultAction = await dispatch(loginBusiness(BizID));
        
        if (loginBusiness.fulfilled.match(resultAction) && typeof window !== 'undefined') {
          localStorage.setItem("roleBusiness", resultAction.payload.data.role);
        }
        
        if (typeof window !== 'undefined') {
          localStorage.setItem("remember_me", "true");
        }
        
        // Redirect to frontend
        router.replace("/frontend");
      } catch (err: any) {
        console.error('❌ [One-Platform] Authentication failed:', err);
        setError(err?.message || 'Authentication failed');
        
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
        
        // Redirect to login after a short delay
        setTimeout(() => {
          router.replace("/login");
        }, 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    processAuth();
  }, [searchParams, router, dispatch]);

  // 🎯 FIXED: Return JSX to prevent hydration errors
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F8FA]">
      <div className="flex flex-col items-center gap-4">
        {isProcessing ? (
          <>
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="text-sm text-gray-600">กำลังตรวจสอบสิทธิ์การเข้าถึง...</p>
          </>
        ) : error ? (
          <>
            <div className="text-red-500 text-xl">⚠️</div>
            <p className="text-sm text-red-600">{error}</p>
            <p className="text-xs text-gray-500">กำลังเปลี่ยนเส้นทางไปหน้าเข้าสู่ระบบ...</p>
          </>
        ) : (
          <>
            <div className="text-green-500 text-xl">✓</div>
            <p className="text-sm text-gray-600">กำลังเปลี่ยนเส้นทาง...</p>
          </>
        )}
      </div>
    </div>
  );
}

// 🎯 Export with Suspense boundary to prevent hydration errors
export default function OnePlatformRedirect() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OnePlatformRedirectContent />
    </Suspense>
  );
}