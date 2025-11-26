"use client";

import React from "react";

const PDFSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#F6F8FA] animate-pulse">
      {/* Header Skeleton */}
      <div className="sticky top-0 left-0 right-0 z-20 bg-white p-4 shadow-theme">
        <div className="flex justify-between items-center">
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="flex h-[calc(100vh-72px)] p-4">
        {/* Left Sidebar Skeleton */}
        <div className="w-20 bg-white shadow-md">
          <div className="p-4 flex flex-col gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 w-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 p-4">
          <div className="h-full bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Skeleton */}
        <div className="w-64 bg-white shadow-md">
          <div className="p-4">
            <div className="h-8 w-full bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-6 w-full bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFSkeleton; 