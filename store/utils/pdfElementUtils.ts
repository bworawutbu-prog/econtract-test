/**
 * Centralized PDF Element Utilities
 * This module provides centralized functions for managing PDF elements across the application
 */

export interface PdfElementRefs {
  document: Element | null;
  page: Element | null;
  container: Element | null;
}

export interface PdfDimensions {
  width: number;
  height: number;
}

/**
 * Get PDF elements from DOM
 * This function centralizes the logic for finding PDF elements
 */
export const getPdfElements = (): PdfElementRefs => {
  const pdfDocument = document.querySelector(".react-pdf__Document");
  const pdfPage = document.querySelector(".react-pdf__Page");
  const pdfContainer = pdfDocument || pdfPage;

  return {
    document: pdfDocument,
    page: pdfPage,
    container: pdfContainer,
  };
};

/**
 * Get PDF elements for a specific page
 * @param pageNumber - The page number to find elements for
 */
export const getPdfElementsForPage = (pageNumber: number): PdfElementRefs => {
  const currentPageElement = document.querySelector(`[data-page-number="${pageNumber}"]`);
  const currentPdfPage = currentPageElement?.querySelector('.react-pdf__Page');
  const pdfDocument = document.querySelector(".react-pdf__Document");
  
  return {
    document: pdfDocument,
    page: currentPdfPage || null,
    container: currentPdfPage || pdfDocument,
  };
};

/**
 * Calculate PDF dimensions from element
 * @param element - The PDF element to calculate dimensions from
 * @param scale - The scale factor
 */
export const calculatePdfDimensionsFromElement = (
  element: Element,
  scale: number = 1
): PdfDimensions => {
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width / scale,
    height: rect.height / scale,
  };
};

/**
 * Check if PDF is ready
 * @param elements - PDF elements to check
 */
export const isPdfReady = (elements: PdfElementRefs): boolean => {
  return !!(elements.document || elements.page || elements.container);
};

/**
 * Get the best PDF element to use
 * Priority: page > document > container
 */
export const getBestPdfElement = (elements: PdfElementRefs): Element | null => {
  return elements.page || elements.document || elements.container;
};

/**
 * Handle PDF element changes
 * This function can be used as a callback for PDF element updates
 */
export const handlePdfElementChange = (
  dispatch: any,
  pageNumber?: number
) => {
  const elements = pageNumber 
    ? getPdfElementsForPage(pageNumber)
    : getPdfElements();
    
  // Calculate and update dimensions if elements are available
  const bestElement = getBestPdfElement(elements);
  if (bestElement) {
    const dimensions = calculatePdfDimensionsFromElement(bestElement, 1);
    dispatch({
      type: 'canvas/setPdfDimensions',
      payload: dimensions,
    });
  }
};

/**
 * Setup PDF element observers
 * This function sets up observers to watch for PDF element changes
 */
export const setupPdfElementObservers = (
  dispatch: any,
  pageNumber?: number
) => {
  const observer = new MutationObserver((mutations) => {
    const pdfRendered = mutations.some((mutation) =>
      Array.from(mutation.addedNodes).some(
        (node) =>
          node instanceof Element &&
          (node.classList.contains("react-pdf__Document") ||
            node.classList.contains("react-pdf__Page"))
      )
    );

    if (pdfRendered) {
      setTimeout(() => {
        handlePdfElementChange(dispatch, pageNumber);
      }, 50);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
  };
};
