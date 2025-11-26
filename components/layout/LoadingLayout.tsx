"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

interface LoadingLayoutProps {
  children?: React.ReactNode;
}

const LoadingLayout: React.FC<LoadingLayoutProps> = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive redirect url and message from search params once, no extra state re-renders
  const { redirectUrl, loadingMessage } = useMemo(() => {
    const url = searchParams.get("redirectUrl") || "/frontend";
    const message = searchParams.get("message") || "กำลังโหลด...";
    return { redirectUrl: url, loadingMessage: message };
  }, [searchParams]);

  useEffect(() => {
    // Add a short delay to show loading state before redirect
    const timer = setTimeout(() => {
      router.replace(redirectUrl || "/frontend");
    }, 1000);

    return () => clearTimeout(timer);
  }, [router, redirectUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-6">
          <Spin 
            indicator={<LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} spin />} 
            size="large"
          />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-700">
            {loadingMessage}
          </h2>
          <p className="text-sm text-gray-500">
            กรุณารอสักครู่...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingLayout;
