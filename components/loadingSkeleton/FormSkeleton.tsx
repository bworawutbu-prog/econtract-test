"use client";

import React from "react";

const FormSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#F6F8FA] animate-pulse">
      {/* Header */}
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

      {/* Form Content */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Form Fields */}
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-10 w-full bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <div className="h-10 w-24 bg-gray-200 rounded"></div>
            <div className="h-10 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormSkeleton;