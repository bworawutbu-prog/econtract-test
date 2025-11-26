/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import "@/store/libs/browser-polyfill";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react";
import { Button, Divider } from "antd";
import { ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "@/store/libs/pdf-worker";
import { enqueueSnackbar } from "notistack";

// PDF.js worker configuration is handled in pdf-worker.ts

interface PDFViewerProps {
  pdfUrl: string;
  currentPage?: number;
  onPageChange?: (pageNumber: number) => void;
  className?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  pdfUrl, 
  currentPage = 1,
  onPageChange,
  className = ""
}) => {
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(currentPage);
  const [scale, setScale] = useState(1);
  const [zoomPreset, setZoomPreset] = useState<string>("100%");
  const [pdfDimensions, setPdfDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync pageNumber with currentPage prop
  useEffect(() => {
    setPageNumber(currentPage);
  }, [currentPage]);
  

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);

    // Try to get the actual PDF dimensions from the rendered page
    setTimeout(() => {
      const pageElement = document.querySelector(".react-pdf__Page");
      if (pageElement) {
        const { width, height } = pageElement.getBoundingClientRect();
        if (width > 0 && height > 0) {
          // Store the actual dimensions (unscaled)
          setPdfDimensions({
            width: width / scale,
            height: height / scale,
          });
        }
      }
    }, 500); // Give it time to render
  };

  // Enhanced zoom functions
  const zoomIn = () => {
    setScale((prevScale) => {
      const newScale = Math.min(prevScale + 0.1, 3.0);
      setZoomPreset(`${Math.round(newScale * 100)}%`);
      return newScale;
    });
  };

  const zoomOut = () => {
    setScale((prevScale) => {
      const newScale = Math.max(prevScale - 0.1, 0.1);
      setZoomPreset(`${Math.round(newScale * 100)}%`);
      return newScale;
    });
  };

  const fitToScreen = useCallback(() => {
    if (!pdfDimensions || !containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const widthRatio = (container.width * 0.9) / pdfDimensions.width;
    const heightRatio = (container.height * 0.9) / pdfDimensions.height;

    // Use the smaller ratio to ensure the PDF fits completely
    const newScale = Math.min(widthRatio, heightRatio);
    setScale(newScale);
    setZoomPreset("Fit");
  },[pdfDimensions]);

  const zoomToActualSize = () => {
    setScale(1.0);
    setZoomPreset("100%");
  };

  // Add keyboard shortcuts for zooming
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "=": // Ctrl/Cmd + Plus (=)
          case "+":
            e.preventDefault();
            zoomIn();
            break;
          case "-": // Ctrl/Cmd + Minus
            e.preventDefault();
            zoomOut();
            break;
          case "0": // Ctrl/Cmd + 0
            e.preventDefault();
            zoomToActualSize();
            break;
          case "\\": // Ctrl/Cmd + \
            e.preventDefault();
            fitToScreen();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pdfDimensions, fitToScreen]);

  // Handle page changes - แก้ไขให้แสดงทีละหน้า
  const handlePageChange = (newPageNumber: number) => {
    // 🎯 NEW: บันทึก currentPageNumber ใน sessionStorage สำหรับ coordinate calculation
    if (typeof window !== "undefined") {
      sessionStorage.setItem('currentPageNumber', newPageNumber.toString());
    }
    
    setPageNumber(newPageNumber);
    onPageChange?.(newPageNumber);
  };

  // Update zoom preset dropdown options
  const zoomOptions = [
    { value: "Fit", label: "Fit to Screen" },
    { value: "50%", label: "50%" },
    { value: "75%", label: "75%" },
    { value: "100%", label: "100%" },
    { value: "125%", label: "125%" },
    { value: "150%", label: "150%" },
    { value: "200%", label: "200%" },
  ];

  // Handle zoom preset change
  const handleZoomChange = (value: string) => {
    setZoomPreset(value);

    if (value === "Fit") {
      fitToScreen();
    } else {
      // Extract percentage value
      const percentage = parseInt(value);
      if (!isNaN(percentage)) {
        setScale(percentage / 100);
      }
    }
  };

  // Load the PDF with proper options and comprehensive error handling
  useEffect(() => {
    if (!pdfUrl) {
      setError('No PDF URL provided');
      return;
    }

    const loadPDF = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        let response;
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
        );

        const fetchPromise = async () => {
          if (pdfUrl.startsWith('http')) {
            // For HTTP URLs with enhanced headers
            return await fetch(pdfUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/pdf,*/*',
                'Cache-Control': 'no-cache',
              },
              mode: 'cors',
              credentials: 'same-origin',
            });
          } else if (pdfUrl.startsWith('blob:')) {
            // For blob URLs
            return await fetch(pdfUrl);
          } else if (pdfUrl.startsWith('data:')) {
            // For data URLs, handle directly
            return new Response(pdfUrl);
          } else {
            // For local files
            return await fetch(pdfUrl);
          }
        };

        response = await Promise.race([fetchPromise(), timeoutPromise]) as Response;

        // Enhanced response validation
        if (!response.ok) {
          enqueueSnackbar(`🎯 [PDFViewer] HTTP error! status: ${response.status}`, {
            variant: "error",
            autoHideDuration: 3000,
          });
          // throw new Error(`HTTP error! status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        
        // Validate arrayBuffer
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          throw new Error('Received empty PDF data');
        }

        setPdfData(arrayBuffer);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        enqueueSnackbar(`🎯 [PDFViewer] Error loading PDF: ${errorMessage}`, {
          variant: "error",
          autoHideDuration: 3000,
        });
        
        // Provide user-friendly error messages
        if (errorMessage.includes('timeout')) {
          setError('PDF loading timed out. Please check your internet connection.');
        } else if (errorMessage.includes('CORS')) {
          setError('Unable to access PDF due to security restrictions.');
        } else if (errorMessage.includes('404')) {
          setError('PDF file not found.');
        } else if (errorMessage.includes('0')) {
          setError('Server is not responding. Please try again later.');
        } else {
          setError(`Failed to load PDF: ${errorMessage}`);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPDF();
  }, [pdfUrl]);

  if (error) {
    return (
      <div className="flex justify-center items-center h-[600px] text-red-500">
        Error loading PDF: {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex-1 h-full bg-[#F6F8FA] ${className}`}
    >
      <div 
        className="flex justify-center items-start w-full h-full" 
        style={{ 
          overflow: "auto",
          maxHeight: "calc(100vh - 64px)",
          position: "relative",
        }}
      >
        <div className="relative flex justify-center w-auto h-auto py-8">
          {pdfData && (
            <Document
              file={pdfData}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => {
                enqueueSnackbar(`🎯 [PDFViewer] PDF Document load error: ${error}`, {
                  variant: "error",
                  autoHideDuration: 3000,
                });
                const errorMsg = error?.message || 'Unknown PDF error';
                if (errorMsg.includes('UnexpectedResponseException')) {
                  setError('PDF format error. The file may be corrupted or incomplete.');
                } else {
                  setError(`PDF processing failed: ${errorMsg}`);
                }
              }}
              loading={
                <div className="flex justify-center items-center h-[600px]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p>{isLoading ? "กำลังโหลด PDF..." : "กำลังเตรียมเอกสาร..."}</p>
                  </div>
                </div>
              }
              error={
                <div className="flex justify-center items-center h-[600px] text-red-500 text-center">
                  <div>
                    <div className="text-6xl mb-4">📄❌</div>
                    <div className="text-lg font-medium mb-2">ไม่สามารถโหลดไฟล์ PDF ได้</div>
                    <div className="text-sm text-gray-600">
                      โปรดตรวจสอบไฟล์และลองใหม่อีกครั้ง
                    </div>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      รีเฟรชหน้า
                    </button>
                  </div>
                </div>
              }
              options={{
                cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
                cMapPacked: true,
                standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
                verbosity: 0, // Reduce console logs from PDF.js
                // Add error recovery options  
                maxImageSize: 16777216, // 16MB max image size
                disableFontFace: false,
                disableRange: false,
                disableStream: false,
              }}
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-md max-w-full"
                width={undefined}
                onLoadError={(error) => {
                  enqueueSnackbar(`🎯 [PDFViewer] PDF Page load error: ${error}`, {
                    variant: "error",
                    autoHideDuration: 3000,
                  });
                  setError(`Page ${pageNumber} failed to load: ${error?.message || 'Unknown error'}`);
                }}
                onRenderError={(error) => {
                  enqueueSnackbar(`🎯 [PDFViewer] PDF Page render error: ${error}`, {
                    variant: "error",
                    autoHideDuration: 3000,
                  });
                  setError(`Page ${pageNumber} failed to render: ${error?.message || 'Unknown error'}`);
                }}
              />
            </Document>
          )}
        </div>
      </div>

      {numPages && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col bg-white items-center rounded-lg shadow-lg p-2 z-50">
          <div className="flex items-center">
            <Button
              type="default"
              icon={<ZoomOutOutlined />}
              onClick={zoomOut}
              className="mr-2"
            />
            <div className="px-2 min-w-[60px] text-center">
              <select
                value={zoomPreset}
                onChange={(e) => handleZoomChange(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer"
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
            <Button
              type="default"
              icon={<ZoomInOutlined />}
              onClick={zoomIn}
              className="ml-2 mr-4"
            />

            <span>หน้า&nbsp;</span>

            <button
              onClick={() => handlePageChange(Math.max(pageNumber - 1, 1))}
              disabled={pageNumber <= 1}
              className="disabled:opacity-50"
            >
              <ChevronLeft />
            </button>
            <span>
              {pageNumber} / {numPages}
            </span>
            <button
              onClick={() =>
                handlePageChange(Math.min(pageNumber + 1, numPages))
              }
              disabled={pageNumber >= numPages}
              className="disabled:opacity-50"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
