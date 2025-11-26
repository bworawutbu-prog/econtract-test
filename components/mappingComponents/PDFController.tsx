"use client";

import React, { useState, useEffect } from "react";
import { Button } from "antd";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import { 
  useZoomUtils, 
  useZoomKeyboardShortcuts,
  zoomOptions,
  ZoomUtils 
} from "./FormUtils/zoomUtils";
import { useViewport } from "./FormUtils/responsiveUtils";

interface PDFControllerProps {
  scale: number;
  setScale: (scale: number) => void;
  pdfDimensions: { width: number; height: number } | null;
  pageNumber: number;
  numPages: number | null;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
  // 🎯 NEW: เพิ่ม props สำหรับ page navigation
  onPageChange?: (pageNumber: number) => void;
}

const PDFController: React.FC<PDFControllerProps> = ({
  scale,
  setScale,
  pdfDimensions,
  pageNumber,
  numPages,
  containerRef,
  className = "",
  onPageChange, // 🎯 NEW: เพิ่ม onPageChange
}) => {
  // 🎯 RESPONSIVE: Track viewport for responsive UI
  const viewport = useViewport();

  // Internal zoom preset state
  const [zoomPreset, setZoomPreset] = useState<string>("100%");

  // Create zoom utilities using the custom hook
  const zoomUtils = useZoomUtils(
    scale,
    setScale,
    zoomPreset,
    setZoomPreset,
    pdfDimensions,
    containerRef || { current: null }
  );
  // Add keyboard shortcuts for zooming (disabled on mobile)
  useZoomKeyboardShortcuts(zoomUtils, viewport.isMobile ? null : pdfDimensions);

  // 🎯 NEW: เพิ่มฟังก์ชัน handlePageChange
  const handlePageChange = (newPageNumber: number) => {
    console.log('ทดสอบ handlePageChange', newPageNumber)
    if (onPageChange) {
      // บันทึก currentPageNumber ใน sessionStorage สำหรับ coordinate calculation
      if (typeof window !== "undefined") {
        sessionStorage.setItem('currentPageNumber', newPageNumber.toString());
      }
      onPageChange(newPageNumber);
    }
  };

  // 🎯 FIXED: Add mouse wheel zoom support with centered origin only
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Only zoom when Ctrl/Cmd is held down
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        
        if (e.deltaY < 0) {
          // Scroll up = zoom in
          zoomUtils.zoomIn();
        } else {
          // Scroll down = zoom out
          zoomUtils.zoomOut();
        }
      }
    };

    // Add event listener to the container
    if (containerRef?.current) {
      containerRef.current.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (containerRef?.current) {
        containerRef.current.removeEventListener('wheel', handleWheel);
      }
    };
  }, [zoomUtils, containerRef]);

  // Don't render if no pages
  if (!numPages) return <></>;

  return (
    <div
      className={`
        ${containerRef?.current ? "fixed" : ""}
        ${viewport.isMobile ? 'bottom-2 left-1/2' : 'bottom-4 left-1/2'}
        transform -translate-x-1/2 z-20 
        flex flex-col items-center 
        bg-white rounded-lg shadow-lg 
        ${viewport.isMobile ? 'p-1.5' : 'p-2'}
        ${className}
      `}
    >
      <div className={`flex items-center ${viewport.isMobile ? 'gap-1' : 'gap-0'}`}>
        {/* 🎯 RESPONSIVE: Hide zoom controls on mobile, show only on tablet+ */}
        {!viewport.isMobile && (
          <>
            {/* Zoom Out Button */}
            <Button
              type="default"
              icon={<ZoomOutOutlined />}
              onClick={() => zoomUtils.zoomOut()}
              className="mr-2"
              size={viewport.isTablet ? 'small' : 'middle'}
            />

            {/* Zoom Preset Dropdown */}
            <div className={`px-2 text-center ${viewport.isTablet ? 'min-w-[50px]' : 'min-w-[60px]'}`}>
              <select
                value={zoomPreset}
                onChange={(e) => zoomUtils.handleZoomChange(e.target.value)}
                className={`
                  bg-transparent border-none outline-none cursor-pointer
                  ${viewport.isTablet ? 'text-xs' : 'text-sm'}
                `}
                aria-label="ระดับการซูม"
                title="ระดับการซูม"
              >
                {zoomOptions?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Zoom In Button */}
            <Button
              type="default"
              icon={<ZoomInOutlined />}
              onClick={() => zoomUtils.zoomIn()}
              className="ml-2 mr-4"
              size={viewport.isTablet ? 'small' : 'middle'}
            />
          </>
        )}

        {/* 🎯 RESPONSIVE: Page navigation - always visible */}
        <div className="flex items-center gap-1">
          <span className={viewport.isMobile ? 'text-xs' : 'text-sm'}>
            {viewport.isMobile ? '' : 'หน้า'}&nbsp;
          </span>
          <button
            onClick={() => handlePageChange(Math.max(pageNumber - 1, 1))}
            disabled={pageNumber <= 1}
            className={`
              disabled:opacity-30 disabled:cursor-not-allowed
              hover:bg-gray-100 rounded p-1 transition-colors
              ${viewport.isMobile ? 'p-0.5' : 'p-1'}
            `}
            aria-label="หน้าก่อนหน้า"
          >
            <ChevronLeft className={viewport.isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
          </button>
          <span className={`
            font-medium 
            ${viewport.isMobile ? 'text-xs px-1' : 'text-sm px-2'}
          `}>
            {pageNumber} / {numPages}
          </span>
          <button
            onClick={() =>
              handlePageChange(Math.min(pageNumber + 1, numPages))
            }
            disabled={pageNumber >= numPages}
            className={`
              disabled:opacity-30 disabled:cursor-not-allowed
              hover:bg-gray-100 rounded p-1 transition-colors
              ${viewport.isMobile ? 'p-0.5' : 'p-1'}
            `}
            aria-label="หน้าถัดไป"
          >
            <ChevronRight className={viewport.isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFController;