"use client";

import { enqueueSnackbar } from "notistack";

// 📐 **PDF Coordinate Calculation Utilities**

// 🎯 **Interface Definitions**
interface UIElementCoords {
  left: number;   // x position from top-left of the page element (UI pixels)
  top: number;    // y position from top-left of the page element (UI pixels)
  width: number;  // element width (UI pixels)
  height: number; // element height (UI pixels)
}

interface PageDimensions {
  width: number;  // Full page width at scale 1.0, in pixels (e.g., 595)
  height: number; // Full page height at scale 1.0, in pixels (e.g., 841)
}

interface PDFCoordinates {
  llx: number; // Lower-Left X (normalized 0-1)
  lly: number; // Lower-Left Y (normalized 0-1)
  urx: number; // Upper-Right X (normalized 0-1)
  ury: number; // Upper-Right Y (normalized 0-1)
}

// 📏 **Standard PDF Page Dimensions**
export const PDF_STANDARD_DIMENSIONS = {
  A4: { width: 595, height: 841 },
  LETTER: { width: 612, height: 792 },
  LEGAL: { width: 612, height: 1008 },
} as const;

/**
 * 🎯 **Main Function: Calculate PDF Normalized Coordinates**
 * 
 * Calculates PDF coordinates (llx, lly, urx, ury) from UI pixels,
 * accounting for display scale and converting to PDF's bottom-left origin.
 *
 * @param uiCoords - UI element's left, top, width, height in screen pixels
 * @param pageDims - Full page width and height at scale 1.0 in pixels
 * @param currentDisplayScale - The current zoom/scale factor of the PDF viewer (e.g., 1.0, 1.5, 0.75)
 * @returns Object containing llx, lly, urx, ury normalized (0-1) coordinates
 */
export function calculatePdfNormalizedCoords(
  uiCoords: UIElementCoords,
  pageDims: PageDimensions,
  currentDisplayScale: number = 1.0
): PDFCoordinates {

  // ✅ **Step 1: Convert UI Pixels back to "Real" Pixels (at scale 1.0)**
  const real_x_start_pixel = uiCoords.left / currentDisplayScale;
  const real_y_start_pixel = uiCoords.top / currentDisplayScale;
  const real_element_width_pixel = uiCoords.width / currentDisplayScale;
  const real_element_height_pixel = uiCoords.height / currentDisplayScale;

  // ✅ **Step 2: Calculate Top-Right and Bottom-Left in "Real" Pixels**
  const bottom_left_x_real_pixel = real_x_start_pixel;
  const bottom_left_y_real_pixel = real_y_start_pixel + real_element_height_pixel;
  
  const top_right_x_real_pixel = real_x_start_pixel + real_element_width_pixel;
  const top_right_y_real_pixel = real_y_start_pixel;

  // ✅ **Step 3: Transform Y-axis from Top-Origin (UI) to Bottom-Origin (PDF)**
  const pdf_y_from_bottom_for_top_point = pageDims.height - top_right_y_real_pixel;
  const pdf_y_from_bottom_for_bottom_point = pageDims.height - bottom_left_y_real_pixel;

  // ✅ **Step 4: Normalize coordinates (0-1)**
  const llx = bottom_left_x_real_pixel / pageDims.width;
  const lly = pdf_y_from_bottom_for_bottom_point / pageDims.height;
  const urx = top_right_x_real_pixel / pageDims.width;
  const ury = pdf_y_from_bottom_for_top_point / pageDims.height;

  const result: PDFCoordinates = { llx, lly, urx, ury };

  return result;
}

/**
 * 🔧 **Helper Function: Calculate from individual parameters**
 * 
 * Convenience function for when you have individual coordinate values
 */
export function calculatePdfCoordsFromValues(
  left: number,
  top: number,
  width: number,
  height: number,
  pageWidth: number = 595,
  pageHeight: number = 841,
  scale: number = 1.0
): PDFCoordinates {
  return calculatePdfNormalizedCoords(
    { left, top, width, height },
    { width: pageWidth, height: pageHeight },
    scale
  );
}

/**
 * 🎨 **Helper Function: Calculate coordinates for common PDF page sizes**
 */
export function calculatePdfCoordsA4(
  left: number,
  top: number,
  width: number,
  height: number,
  scale: number = 1.0
): PDFCoordinates {
  return calculatePdfCoordsFromValues(
    left, top, width, height,
    PDF_STANDARD_DIMENSIONS.A4.width,
    PDF_STANDARD_DIMENSIONS.A4.height,
    scale
  );
}

/**
 * 🔄 **Reverse Function: Convert PDF coordinates back to UI coordinates**
 * 
 * Useful for displaying existing PDF annotations on the UI
 */
export function convertPdfCoordsToUI(
  pdfCoords: PDFCoordinates,
  pageDims: PageDimensions,
  currentDisplayScale: number = 1.0
): UIElementCoords {
  // Convert normalized coordinates back to real pixels
  const real_left = pdfCoords.llx * pageDims.width;
  const real_top = pageDims.height - pdfCoords.ury * pageDims.height;
  const real_width = (pdfCoords.urx - pdfCoords.llx) * pageDims.width;
  const real_height = (pdfCoords.ury - pdfCoords.lly) * pageDims.height;

  // Scale back to UI pixels
  return {
    left: real_left * currentDisplayScale,
    top: real_top * currentDisplayScale,
    width: real_width * currentDisplayScale,
    height: real_height * currentDisplayScale
  };
}

/**
 * 🎯 **Validation Function: Check if coordinates are valid**
 */
export function validatePdfCoordinates(coords: PDFCoordinates): boolean {
  const { llx, lly, urx, ury } = coords;
  
  // Check if all values are between 0 and 1
  const inRange = [llx, lly, urx, ury].every(val => val >= 0 && val <= 1);
  
  // Check if lower-left is actually lower and left compared to upper-right
  const correctOrientation = llx < urx && lly < ury;
  
  return inRange && correctOrientation;
}

/**
 * 🔧 **Legacy Function: Maintain backward compatibility**
 */
export const calculateCoordinates = (id: string) => {
  // This maintains the existing function signature
  // You can implement specific logic here or call calculatePdfCoordinates
  const coordinates = calculatePdfCoordinates(id);
  return coordinates;
};

/**
 * 🎯 **Example Usage and Testing Function**
 */
export function testCoordinateCalculation() {
  
  // Test case from user's example
  const testCase = {
    left: 221,
    top: 164,
    width: 131,
    height: 30,
    pageWidth: 595,
    pageHeight: 841,
    scale: 1.0
  };
  
  const result = calculatePdfCoordsFromValues(
    testCase.left,
    testCase.top,
    testCase.width,
    testCase.height,
    testCase.pageWidth,
    testCase.pageHeight,
    testCase.scale
  );
  
  const scaleTest = calculatePdfCoordsFromValues(
    testCase.left * 1.5, // Simulating 150% zoom UI coordinates
    testCase.top * 1.5,
    testCase.width * 1.5,
    testCase.height * 1.5,
    testCase.pageWidth,
    testCase.pageHeight,
    1.5 // Accounting for 150% scale
  );
  
  return result;
}

// Placeholder for the existing function - you may need to implement this
function calculatePdfCoordinates(id: string) {
  // Implementation would depend on your existing logic
  enqueueSnackbar(`🎯 [coordinates] Implementation needed for id: ${id}`, {
    variant: "warning",
    autoHideDuration: 3000,
  });
  return { x: 0, y: 0, width: 0, height: 0 };
}