"use client";

import { useEffect, useCallback } from 'react';

// Zoom preset options for the dropdown
export const zoomOptions = [
  { value: "Fit", label: "Fit to Screen" },
  { value: "50%", label: "50%" },
  { value: "75%", label: "75%" },
  { value: "100%", label: "100%" },
  { value: "125%", label: "125%" },
  { value: "150%", label: "150%" },
  { value: "200%", label: "200%" },
];

// Interface for zoom utility functions
export interface ZoomUtils {
  zoomIn: (mouseX?: number, mouseY?: number) => void;
  zoomOut: (mouseX?: number, mouseY?: number) => void;
  fitToScreen: () => void;
  zoomToActualSize: () => void;
  handleZoomChange: (value: string) => void;
}

// Import PDFDimensions from pdfFormManager to avoid duplication
import { PDFDimensions } from './pdfFormManager';

// Interface for canvas reference
export interface CanvasRefType {
  current: HTMLDivElement | null;
}

// Hook for creating zoom utility functions
export const useZoomUtils = (
  scale: number,
  setScale: (scale: any) => void,
  zoomPreset: string,
  setZoomPreset: (preset: string) => void,
  pdfDimensions: PDFDimensions | null,
  canvasRef: CanvasRefType
): ZoomUtils => {
  
  // 🎯 BROWSER-LIKE ZOOM: Simple CSS transform zoom with natural scrolling
  const applyZoomToCanvas = useCallback((newScale: number) => {
    if (!canvasRef.current) return;
    
    // Find the inner container that holds the PDF and FormCanvas
    const innerContainer = canvasRef.current.querySelector('.relative.flex.flex-col.justify-center.space-y-4') as HTMLElement;
    if (!innerContainer) return;
    
    // 🎯 FIXED: Use top center as origin to zoom from the top (like browser zoom)
    // This prevents content from being cut off at the top
    innerContainer.style.transformOrigin = 'top center';
    innerContainer.style.transform = `scale(${newScale})`;
    
    // 🎯 FIXED: Always ensure overflow is auto for natural scrolling
    canvasRef.current.style.overflow = 'auto';
    
    // 🎯 FIXED: Ensure no overflow hidden anywhere in the chain
    // This prevents any parent elements from blocking scrolling during zoom
  }, [canvasRef]);
  
  const zoomIn = () => {
    setScale((prevScale: any) => {
      const newScale = Math.min(prevScale + 0.1, 3.0);
      setZoomPreset(`${Math.round(newScale * 100)}%`);
      // Apply CSS transform zoom
      setTimeout(() => applyZoomToCanvas(newScale), 0);
      return newScale;
    });
  };

  const zoomOut = () => {
    setScale((prevScale: any) => {
      const newScale = Math.max(prevScale - 0.1, 0.1);
      setZoomPreset(`${Math.round(newScale * 100)}%`);
      // Apply zoom with centered origin
      setTimeout(() => applyZoomToCanvas(newScale), 0);
      return newScale;
    });
  };

  const fitToScreen = () => {
    if (!pdfDimensions || !canvasRef.current) return;

    const container = canvasRef.current.getBoundingClientRect();
    const widthRatio = (container.width * 0.9) / pdfDimensions.width;
    const heightRatio = (container.height * 0.9) / pdfDimensions.height;

    // Use the smaller ratio to ensure the PDF fits completely
    const newScale = Math.min(widthRatio, heightRatio);
    setScale(newScale);
    setZoomPreset("Fit");
    // Apply CSS transform zoom
    setTimeout(() => applyZoomToCanvas(newScale), 0);
  };

  const zoomToActualSize = () => {
    setScale(1.0);
    setZoomPreset("100%");
    // Apply CSS transform zoom
    setTimeout(() => applyZoomToCanvas(1.0), 0);
  };

  const handleZoomChange = (value: string) => {
    setZoomPreset(value);

    if (value === "Fit") {
      fitToScreen();
    } else {
      // Extract percentage value
      const percentage = parseInt(value);
      if (!isNaN(percentage)) {
        const newScale = percentage / 100;
        setScale(newScale);
        // Apply CSS transform zoom
        setTimeout(() => applyZoomToCanvas(newScale), 0);
      }
    }
  };

  // 🎯 FIXED: Apply zoom only on mount (other zoom functions handle their own zoom)
  useEffect(() => {
    // Only apply zoom on mount, not on every scale change
    if (scale === 1.0) {
      applyZoomToCanvas(scale);
    }
  }, [applyZoomToCanvas]);

  return {
    zoomIn,
    zoomOut,
    fitToScreen,
    zoomToActualSize,
    handleZoomChange,
  };
};

// Hook for zoom keyboard shortcuts
export const useZoomKeyboardShortcuts = (
  zoomUtils: ZoomUtils,
  pdfDimensions: PDFDimensions | null
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only listen for keyboard shortcuts when the form builder is active
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "=": // Ctrl/Cmd + Plus (=)
          case "+":
            e.preventDefault();
            zoomUtils.zoomIn();
            break;
          case "-": // Ctrl/Cmd + Minus
            e.preventDefault();
            zoomUtils.zoomOut();
            break;
          case "0": // Ctrl/Cmd + 0
            e.preventDefault();
            zoomUtils.zoomToActualSize();
            break;
          case "\\": // Ctrl/Cmd + \
            e.preventDefault();
            zoomUtils.fitToScreen();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [zoomUtils, pdfDimensions]);
};

// Utility function to create zoom state setters (for use with setState pattern)
export const createZoomSetters = (
  setScale: React.Dispatch<React.SetStateAction<any>>,
  setZoomPreset: React.Dispatch<React.SetStateAction<string>>
) => {
  const scaleSetterWrapper = (scale: number) => setScale(scale);
  const presetSetterWrapper = (preset: string) => setZoomPreset(preset);

  return {
    setScale: scaleSetterWrapper,
    setZoomPreset: presetSetterWrapper,
  };
}; 