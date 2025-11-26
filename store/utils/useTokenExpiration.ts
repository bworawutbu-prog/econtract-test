"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export const useTokenExpiration = () => {
  const [showTokenExpiredModal, setShowTokenExpiredModal] = useState(false);
  const router = useRouter();

  const clearUserSession = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("remember_me");

    // Clear sessionStorage
    sessionStorage.removeItem("isGuest");
    sessionStorage.removeItem("pendingTransactionPayload");

  };

  const handleTokenExpired = () => {
    setShowTokenExpiredModal(true);
  };

  const handleModalConfirm = () => {
    setShowTokenExpiredModal(false);
    clearUserSession();
    router.push("/login");
  };

  // ฟังก์ชันสำหรับตรวจสอบ API response
  const checkTokenExpiration = (error: any) => {
    if (
      error?.response?.status === 401 ||
      error?.response?.status === 403 ||
      error?.response?.data?.message?.toLowerCase()?.includes("token") ||
      error?.response?.data?.message?.toLowerCase()?.includes("expired")
    ) {
      handleTokenExpired();
      return true;
    }
    return false;
  };

  return {
    showTokenExpiredModal,
    handleModalConfirm,
    checkTokenExpiration,
    clearUserSession,
  };
};
