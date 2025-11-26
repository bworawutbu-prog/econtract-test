// 🎯 **PDF Coordinate Calculation Examples**
// This file demonstrates how to use the coordinate calculation functions

import { enqueueSnackbar } from 'notistack';
import { 
  calculatePdfCoordsFromValues, 
  calculatePdfCoordsA4,
  calculatePdfNormalizedCoords,
  convertPdfCoordsToUI,
  validatePdfCoordinates,
  testCoordinateCalculation,
  PDF_STANDARD_DIMENSIONS
} from './coordinates';

/**
 * 🧪 **Example 1: Calculate coordinates from user's data**
 */
export function exampleUserData() {
  
  const userInput = {
    left: 221,
    top: 164,
    width: 131,
    height: 30,
    pageWidth: 595,
    pageHeight: 841,
    scale: 1.0
  };
  
  const result = calculatePdfCoordsFromValues(
    userInput.left,
    userInput.top,
    userInput.width,
    userInput.height,
    userInput.pageWidth,
    userInput.pageHeight,
    userInput.scale
  );
  
  // Validate results
  const isValid = validatePdfCoordinates(result);
  
  return result;
}

/**
 * 🔍 **Example 2: Different zoom levels**
 */
export function exampleDifferentZoomLevels() {
  
  const baseCoords = { left: 221, top: 164, width: 131, height: 30 };
  const pageSize = { width: 595, height: 841 };
  
  const zoomLevels = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  
  zoomLevels.forEach(zoom => {
    
    // UI coordinates would be scaled by zoom level
    const scaledUICoords = {
      left: baseCoords.left * zoom,
      top: baseCoords.top * zoom,
      width: baseCoords.width * zoom,
      height: baseCoords.height * zoom
    };
    
    // Calculate PDF coordinates accounting for zoom
    const pdfCoords = calculatePdfNormalizedCoords(
      scaledUICoords,
      pageSize,
      zoom
    );
    
  });
}

/**
 * 📱 **Example 3: Real-world usage in React Component**
 */
export function exampleReactUsage() {
  
  // Simulating data you might get from a PDF viewer component
  const pdfViewerData = {
    // From mouse click or drag event
    clickEvent: {
      clientX: 300,
      clientY: 200,
    },
    
    // From PDF viewer component
    pdfViewerRect: {
      left: 50,
      top: 100,
    },
    
    // Element dimensions (from drag or fixed size)
    elementSize: {
      width: 150,
      height: 40,
    },
    
    // PDF page info
    pageInfo: {
      width: 595,
      height: 841,
      currentScale: 1.2, // 120% zoom
    }
  };
  
  // Calculate relative position within PDF viewer
  const relativeX = pdfViewerData.clickEvent.clientX - pdfViewerData.pdfViewerRect.left;
  const relativeY = pdfViewerData.clickEvent.clientY - pdfViewerData.pdfViewerRect.top;
  
  
  // Calculate PDF coordinates
  const pdfCoords = calculatePdfNormalizedCoords(
    {
      left: relativeX,
      top: relativeY,
      width: pdfViewerData.elementSize.width,
      height: pdfViewerData.elementSize.height
    },
    {
      width: pdfViewerData.pageInfo.width,
      height: pdfViewerData.pageInfo.height
    },
    pdfViewerData.pageInfo.currentScale
  );
  
  return pdfCoords;
}

/**
 * 🔄 **Example 4: Reverse conversion (PDF to UI)**
 */
export function exampleReverseConversion() {
  
  // Start with PDF coordinates (e.g., from saved data)
  const savedPdfCoords = {
    llx: 0.37142857,
    lly: 0.76932223,
    urx: 0.59159664,
    ury: 0.80499405
  };
  
  
  // Convert back to UI coordinates for different zoom levels
  const pageSize = { width: 595, height: 841 };
  const zoomLevels = [1.0, 1.5, 2.0];
  
  zoomLevels.forEach(zoom => {
    const uiCoords = convertPdfCoordsToUI(
      savedPdfCoords,
      pageSize,
      zoom
    );
    
  });
}

/**
 * 🎨 **Example 5: Working with A4 pages**
 */
export function exampleA4Usage() {
  
  // Standard A4 elements
  const elements = [
    { name: 'Header Logo', left: 50, top: 50, width: 100, height: 30 },
    { name: 'Title', left: 200, top: 100, width: 200, height: 40 },
    { name: 'Signature Box', left: 400, top: 700, width: 150, height: 60 },
    { name: 'Footer Text', left: 50, top: 800, width: 500, height: 20 },
  ];
  
  
  elements.forEach(element => {
    const coords = calculatePdfCoordsA4(
      element.left,
      element.top,
      element.width,
      element.height,
      1.0 // 100% zoom
    );
    
  });
}

/**
 * 🚨 **Example 6: Error handling and edge cases**
 */
export function exampleErrorHandling() {
  
  // Test edge cases
  const edgeCases = [
    { name: 'Zero dimensions', left: 100, top: 100, width: 0, height: 0 },
    { name: 'Negative position', left: -10, top: -5, width: 50, height: 30 },
    { name: 'Outside page bounds', left: 700, top: 900, width: 100, height: 100 },
    { name: 'Very small scale', left: 1000, top: 1000, width: 200, height: 200 },
  ];
  
  edgeCases.forEach(testCase => {
    
    try {
      const coords = calculatePdfCoordsA4(
        testCase.left,
        testCase.top,
        testCase.width,
        testCase.height,
        1.0
      );
      
      const isValid = validatePdfCoordinates(coords);
      
      
      
    } catch (error) {
      enqueueSnackbar(`  ❌ Error: ${error}`, { variant: 'error' });
    }
  });
}

/**
 * 🎯 **Run all examples**
 */
export function runAllExamples() {
  
  exampleUserData();
  exampleDifferentZoomLevels();
  exampleReactUsage();
  exampleReverseConversion();
  exampleA4Usage();
  exampleErrorHandling();
  
  // Run the built-in test function
  testCoordinateCalculation();
}

/**
 * 🎯 **Quick calculation function for immediate use**
 */
export function quickCalculate(
  left: number,
  top: number,
  width: number,
  height: number,
  pageWidth: number = 595,
  pageHeight: number = 841,
  scale: number = 1.0
) {
  const result = calculatePdfCoordsFromValues(left, top, width, height, pageWidth, pageHeight, scale);
  
  return result;
}

// Export default for easy importing
export default {
  runAllExamples,
  quickCalculate,
  exampleUserData,
  exampleDifferentZoomLevels,
  exampleReactUsage,
  exampleReverseConversion,
  exampleA4Usage,
  exampleErrorHandling
}; 