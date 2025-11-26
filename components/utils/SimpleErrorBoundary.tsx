"use client";

import React, { useEffect } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class SimpleErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  // componentDidMount() {
  //   window.location.reload();
  // } 
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
      //   <div className="min-h-screen flex items-center justify-center bg-gray-50">
      //   <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
      //     <div className="animate-pulse">
      //       <div className="flex items-center justify-center mb-6">
      //         <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
      //       </div>
      //       <div className="space-y-4">
      //         <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
      //         <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
      //         <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
      //       </div>
      //       <div className="mt-8 space-y-3">
      //         <div className="h-10 bg-gray-200 rounded w-full"></div>
      //         <div className="h-10 bg-gray-200 rounded w-full"></div>
      //       </div>
      //     </div>
      //   </div>
      // </div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">เกิดข้อผิดพลาด</h2>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              รีเฟรชหน้า
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
