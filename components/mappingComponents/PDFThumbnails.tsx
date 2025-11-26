/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import "@/store/libs/browser-polyfill";
import { Document, Page } from "react-pdf";
import { EyeIcon, EyeOffIcon, ChevronDown } from "lucide-react";
import { Collapse } from "antd";
import "@/store/libs/pdf-worker";

interface PDFThumbnailsProps {
  pdfUrl: string;
  currentPage: number;
  onPageChange: (pageNumber: number) => void;
}

const PDFThumbnails: React.FC<PDFThumbnailsProps> = ({
  pdfUrl,
  currentPage,
  onPageChange,
}) => {
  const [numPages, setNumPages] = useState(0);
  const [thumbnailsVisible, setThumbnailsVisible] = useState(true);
  const [isPdfReady, setIsPdfReady] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [activeKeys, setActiveKeys] = useState<string[]>(["1"]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsPdfReady(true);
    setIsLoadingPdf(false);
  };

  if (!pdfUrl) return <></>;

  // Reset states when pdfUrl changes
  React.useEffect(() => {
    if (pdfUrl) {
      setIsPdfReady(false);
      setIsLoadingPdf(true);
    }
  }, [pdfUrl]);
  setTimeout(() => {
    setIsPdfReady(true);
  }, 1000);

  // Create collapse items for PDF thumbnails
  const createThumbnailCollapseItems = () => [
    {
      key: "1",
      label: (
        <div className="flex gap-2">
          <h3 className="font-black text-[#333333]">หน้าเอกสาร</h3>
        </div>
      ),
      children: (
        <div className="overflow-y-auto max-h-[calc(100vh-4rem)] p-2">
          {!isPdfReady && isLoadingPdf && (
            <div className="flex justify-center items-center h-40">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <span className="text-gray-500">กำลังโหลด PDF...</span>
              </div>
            </div>
          )}
          
          {isPdfReady && (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={() => {
                setIsLoadingPdf(false);
                setIsPdfReady(false);
              }}
              loading={
                <div className="flex justify-center items-center h-20">
                  <span className="text-gray-500">Loading PDF...</span>
                </div>
              }
              error={
                <div className="flex justify-center items-center h-20 text-red-500">
                  Error loading PDF
                </div>
              }
            >
              {Array.from(new Array(numPages), (el, index) => (
                <div
                  key={`thumbnail-${index + 1}`}
                  className={`mb-4 cursor-pointer transition-all duration-200 ${
                    currentPage === index + 1
                      ? "ring-2 ring-theme ring-offset-2"
                      : "hover:ring-1 hover:ring-gray-300"
                  }`}
                  onClick={() => onPageChange(index + 1)}
                >
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <div className="relative">
                      <Page
                        pageNumber={index + 1}
                        width={180}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Document>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-full w-full">
      <div className="bg-white min-h-screen h-full flex flex-col w-full max-w-64">
        <div className="[&_.ant-collapse-content]:border-t-0">
          <Collapse
            className="bg-[#F0F6FF] border-[#F0F6FF]"
            activeKey={activeKeys}
            onChange={(keys) => setActiveKeys(keys as string[])}
            expandIconPosition="end"
            expandIcon={({ isActive }) => (
              <ChevronDown
                className="bg-theme rounded-full p-1"
                size={28}
                color="white"
                style={{ transform: `rotate(${isActive ? 180 : 0}deg)` }}
              />
            )}
            items={createThumbnailCollapseItems()}
          />
        </div>
      </div>
    </div>
  );
};

export default PDFThumbnails;
