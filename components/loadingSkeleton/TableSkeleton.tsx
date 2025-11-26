"use client";
import React from "react";

const TableSkeleton = () => {
  return (
    <div className="bg-[#FAFAFA] flex h-screen overflow-hidden">
      {/* Sidebar */}
      {/* <div className="min-h-screen bg-[#F6F8FA] min-w-60 p-5 shadow-[0px_-0px_24px_#e2e9f1] flex flex-col gap-4 rounded-tr-3xl">
        <div className="flex justify-between items-center animate-pulse">
          <div className="h-6 w-24 bg-gray-200 rounded"></div>
          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
        </div>
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={`page-${i}`}
              className="h-8 w-full bg-gray-200 rounded"
            ></div>
          ))}
        </div>
      </div> */}

      <div className="min-h-screen bg-[#F6F8FA] animate-pulse p-5 grow">
        {/* Header */}
        <div className="mb-3">
          <div className="h-8 w-48 bg-gray-200 rounded mb-3"></div>
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
        </div>

        {/* Content Section */}
        <div className="bg-[#FAFAFA] rounded-xl p-4 shadow-[0px_-0px_24px_#e2e9f1]">
          {/* Table Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-24 bg-gray-200 rounded"></div>
              <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 p-4 bg-[#4E73F80A]">
              {[...Array(6)].map((_, i) => (
                <div
                  key={`header-${i}`}
                  className="h-6 bg-gray-200 rounded"
                ></div>
              ))}
            </div>

            {/* Table Rows */}
            {[...Array(5)].map((_, rowIndex) => (
              <div
                key={`row-${rowIndex}`}
                className="grid grid-cols-6 gap-4 p-4 border-b border-gray-100"
              >
                {[...Array(6)].map((_, colIndex) => (
                  <div
                    key={`cell-${rowIndex}-${colIndex}`}
                    className="h-6 bg-gray-200 rounded"
                  ></div>
                ))}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-4">
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={`page-${i}`}
                  className="h-8 w-8 bg-gray-200 rounded"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableSkeleton;
