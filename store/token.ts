"use client";
// "use server";

import { setCookie, getCookie, deleteCookie } from 'cookies-next/client';
import { AuthUser } from "@/store/types/user";

export function getTokenLogin() {
  let tokenValue = "";
  if (typeof window !== "undefined") {
    tokenValue = getCookie("accessToken") || "";
  }
  return tokenValue;
}
export function getGuestToken() {
  let tokenValue = "";
  if (typeof window !== "undefined") {
    tokenValue = sessionStorage.getItem("guest_accessToken") || ""; //getCookie("accessToken");
    // tokenValue = getCookie("guest_accessToken")
  }
  return tokenValue;
}


export function getApprover() {
  let user: AuthUser | null = null;
  if (typeof window !== "undefined") {
    const approverValue = getCookie("user");
    if (approverValue) {
      user = JSON.parse(approverValue) as AuthUser;
    }
  }
  return user;
}

// Function to get business ID for testing and development
export function getBusinessId(): string {
  // For testing purposes, return the specific business ID
  // In production, this should come from user context or API response
  return "5228881808066777";
}

// Function to get current user's business ID
export function getCurrentUserBusinessId(): string {
  const user = getApprover();
  
  // If user has biz_id, use it
  if (user?.biz_id) {
    return user.biz_id;
  }
  
  // For testing/development, return the default business ID
  return getBusinessId();
}