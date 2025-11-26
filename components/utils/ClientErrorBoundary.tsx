"use client";

import { SimpleErrorBoundary } from './SimpleErrorBoundary';

// ✅ Client wrapper สำหรับ ErrorBoundary ที่ใช้ใน Server Layout
export function ClientErrorBoundary({ children }: { children: React.ReactNode }) {
  return <SimpleErrorBoundary>{children}</SimpleErrorBoundary>;
}

