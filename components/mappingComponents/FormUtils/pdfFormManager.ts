/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * PDF Form Manager Utility
 * 
 * This utility provides functions to manage form elements across multiple PDF pages.
 * It allows for saving, restoring, updating, and deleting form objects per page.
 */
"use client";

import { FormItem } from '../../../store/types';
import { fetchFormItemsAPI } from '@/store/backendStore/formAPI';

// Interface for PDF dimensions
export interface PDFDimensions {
  width: number;
  height: number;
}

// Type definition for page-based form items storage
export interface PageFormItems {
  [pageNumber: number]: FormItem[];
}

/**
 * Save form objects for the current page
 * 
 * @param formItems - Array of form items to save
 * @param pageNumber - Current page number
 * @param existingItems - Existing page-based form items (optional)
 * @returns Updated page-based form items
 */
export function saveCurrentPageObjects(
  formItems: FormItem[],
  pageNumber: number,
  existingItems: PageFormItems = {}
): PageFormItems {
  // Create a deep copy to avoid mutation issues
  const updatedItems = { ...existingItems };
  
  // Save the items for the current page
  updatedItems[pageNumber] = [...formItems];
  return updatedItems;
}

/**
 * Restore form objects for a specific page
 * 
 * @param pageNumber - Page number to restore items for
 * @param pageFormItems - Page-based form items storage
 * @returns Array of form items for the specified page
 */
export function restorePageObjects(
  pageNumber: number,
  pageFormItems: PageFormItems
): FormItem[] {
  // If no items exist for this page, return an empty array
  if (!pageFormItems[pageNumber]) {
    return [];
  }
  
  // Return a copy of the items for the specified page
  return [...pageFormItems[pageNumber]];
}

/**
 * Update form objects for a specific page
 * 
 * @param pageNumber - Page number to update
 * @param formItems - New form items for the page
 * @param pageFormItems - Existing page-based form items
 * @returns Updated page-based form items
 */
export function updatePageObjects(
  pageNumber: number,
  formItems: FormItem[],
  pageFormItems: PageFormItems
): PageFormItems {
  // Create a deep copy to avoid mutation issues
  const updatedItems = { ...pageFormItems };
  
  // Update the items for the specified page
  updatedItems[pageNumber] = [...formItems];
  
  return updatedItems;
}

/**
 * Delete all form objects for a specific page
 * 
 * @param pageNumber - Page number to delete items from
 * @param pageFormItems - Existing page-based form items
 * @returns Updated page-based form items
 */
export function deletePageObjects(
  pageNumber: number,
  pageFormItems: PageFormItems
): PageFormItems {
  // Create a deep copy to avoid mutation issues
  const updatedItems = { ...pageFormItems };
  
  // Delete items for the specified page
  delete updatedItems[pageNumber];
  
  return updatedItems;
}

/**
 * Delete a specific form object from a page
 * 
 * @param pageNumber - Page number containing the item
 * @param itemId - ID of the item to delete
 * @param pageFormItems - Existing page-based form items
 * @returns Updated page-based form items
 */
export function deleteFormObject(
  pageNumber: number,
  itemId: string,
  pageFormItems: PageFormItems
): PageFormItems {
  // If no items exist for this page, return the unchanged items
  if (!pageFormItems[pageNumber]) {
    return pageFormItems;
  }
  
  // Create a deep copy to avoid mutation issues
  const updatedItems = { ...pageFormItems };
  
  // Filter out the specified item
  updatedItems[pageNumber] = pageFormItems[pageNumber].filter(
    item => item.id !== itemId
  );
  
  return updatedItems;
}

/**
 * Get all form objects across all pages
 * 
 * @param pageFormItems - Page-based form items
 * @returns Array of all form items from all pages
 */
export function getAllFormObjects(pageFormItems: PageFormItems): FormItem[] {
  // Flatten all items from all pages into a single array
  return Object.values(pageFormItems).reduce(
    (allItems, pageItems) => [...allItems, ...pageItems],
    [] as FormItem[]
  );
}

/**
 * Move a form object from one page to another
 * 
 * @param fromPage - Source page number
 * @param toPage - Destination page number
 * @param itemId - ID of the item to move
 * @param pageFormItems - Existing page-based form items
 * @returns Updated page-based form items or null if item not found
 */
export function moveFormObject(
  fromPage: number,
  toPage: number,
  itemId: string,
  pageFormItems: PageFormItems
): PageFormItems | null {
  // If source page doesn't exist, return null
  if (!pageFormItems[fromPage]) {
    return null;
  }
  
  // Find the item to move
  const itemToMove = pageFormItems[fromPage].find(item => item.id === itemId);
  
  // If item not found, return null
  if (!itemToMove) {
    return null;
  }
  
  // Create a deep copy to avoid mutation issues
  const updatedItems = { ...pageFormItems };
  
  // Remove the item from the source page
  updatedItems[fromPage] = pageFormItems[fromPage].filter(
    item => item.id !== itemId
  );
  
  // Initialize destination page if it doesn't exist
  if (!updatedItems[toPage]) {
    updatedItems[toPage] = [];
  }
  
  // Add the item to the destination page
  updatedItems[toPage] = [...updatedItems[toPage], itemToMove];
  
  return updatedItems;
}

/**
 * Check if a page has any form objects
 * 
 * @param pageNumber - Page number to check
 * @param pageFormItems - Page-based form items
 * @returns True if the page has items, false otherwise
 */
export function hasPageObjects(
  pageNumber: number,
  pageFormItems: PageFormItems
): boolean {
  return !!(pageFormItems[pageNumber]?.length > 0);
}

/**
 * Count the number of form objects on a specific page
 * 
 * @param pageNumber - Page number to count items for
 * @param pageFormItems - Page-based form items
 * @returns Number of items on the specified page
 */
export function countPageObjects(
  pageNumber: number,
  pageFormItems: PageFormItems
): number {
  return pageFormItems[pageNumber]?.length || 0;
}

/**
 * PDF Document Management Functions
 */

/**
 * Handle PDF document load success
 * 
 * @param numPages - Number of pages in the PDF
 * @param setNumPages - Function to set number of pages
 * @param pageNumber - Current page number
 * @param setPageNumber - Function to set page number
 * @param pageFormItems - Existing page form items
 * @param setCurrentPageItems - Function to set current page items
 * @param setIsLoadingPdf - Function to set PDF loading state
 * @param scale - Current scale of the PDF
 * @param setPdfDimensions - Function to set PDF dimensions
 */
export function handleDocumentLoadSuccess(
  numPages: number,
  setNumPages: (num: number) => void,
  pageNumber: number,
  setPageNumber: (page: number) => void,
  pageFormItems: PageFormItems,
  setCurrentPageItems: (items: FormItem[]) => void,
  setIsLoadingPdf: (loading: boolean) => void,
  scale: number,
  setPdfDimensions: (dimensions: PDFDimensions) => void
): void {
  setNumPages(numPages);

  // Keep the current page if already set, otherwise set to page 1
  // This prevents resetting to page 1 unnecessarily
  if (!pageNumber) {
    setPageNumber(1);

    // If we have page form items, load the current page items
    if (Object.keys(pageFormItems).length > 0) {
      setCurrentPageItems(pageFormItems[1] || []);
    }
  }

  setIsLoadingPdf(false);

  // Try to get the actual PDF dimensions from the rendered page
  setTimeout(() => {
    // First try to find the Document element, then fall back to Page
    const documentElement = document.querySelector(".react-pdf__Document");
    const pageElement = document.querySelector(".react-pdf__Page");
    const pdfElement = documentElement || pageElement;
    
    if (pdfElement) {
      const { width, height } = pdfElement.getBoundingClientRect();
      if (width > 0 && height > 0) {
        // Store the actual dimensions (unscaled)
        setPdfDimensions({
          width: width / scale,
          height: height / scale,
        });
      }
    } else {
      console.warn("Could not find PDF element to get dimensions");
    }
  }, 500); // Give it time to render
}

/**
 * Handle page change with form item management
 * 
 * @param newPageNumber - Target page number
 * @param currentPageNumber - Current page number
 * @param currentPageItems - Current page form items
 * @param pageFormItems - All page form items
 * @param setPageFormItems - Function to update page form items
 * @param setPageNumber - Function to set page number
 * @param setCurrentPageItems - Function to set current page items
 * @param configElement - Current config element
 * @param setConfigElement - Function to set config element
 * @param setActiveElementId - Function to set active element ID
 * @param setShowStylePanel - Function to show/hide style panel
 */
export function handlePageChangeWithFormManagement(
  newPageNumber: number,
  currentPageNumber: number,
  currentPageItems: FormItem[],
  pageFormItems: PageFormItems,
  setPageFormItems: (items: PageFormItems) => void,
  setPageNumber: (page: number) => void,
  setCurrentPageItems: (items: FormItem[]) => void,
  configElement: FormItem | null,
  setConfigElement: (element: FormItem | null) => void,
  setActiveElementId: (id: string | null) => void,
  setShowStylePanel: (show: boolean) => void
): void {
  // Do nothing if trying to navigate to same page
  if (newPageNumber === currentPageNumber) return;

  // Save the current page items before switching
  const updatedPageItems = saveCurrentPageObjects(
    currentPageItems,
    currentPageNumber,
    pageFormItems
  );

  // Update the page items state
  setPageFormItems(updatedPageItems);

  // Change the page number
  setPageNumber(newPageNumber);

  // Load the items for the new page - use the updated page items to ensure consistency
  const newPageItems = restorePageObjects(newPageNumber, updatedPageItems);
  setCurrentPageItems(newPageItems);

  // If we have a configElement, reset it as we're changing pages
  if (configElement) {
    setConfigElement(null);
    setActiveElementId(null);
    setShowStylePanel(false);
  }
}

/**
 * Handle step index change with config element reset
 * 
 * @param newStepIndex - New step index value
 * @param setStepIndex - Function to set step index
 * @param configElement - Current config element
 * @param setConfigElement - Function to set config element
 * @param setActiveElementId - Function to set active element ID
 * @param setShowStylePanel - Function to show/hide style panel
 */
export function handleStepIndexChangeWithReset(
  newStepIndex: string,
  setStepIndex: (stepIndex: string) => void,
  configElement: FormItem | null,
  setConfigElement: (element: FormItem | null) => void,
  setActiveElementId: (id: string) => void,
  setShowStylePanel: (show: boolean) => void
): void {
  setStepIndex(newStepIndex);

  // Reset config element since we're changing context
  if (configElement) {
    setConfigElement(null);
    setActiveElementId("");
    setShowStylePanel(false);
  }
}

/**
 * Handle form item deletion from current page
 * 
 * @param itemId - ID of the item to delete
 * @param currentPageItems - Current page form items
 * @param pageNumber - Current page number
 * @param setCurrentPageItems - Function to set current page items
 * @param setPageFormItems - Function to update page form items
 */
export function handleFormItemDeletion(
  itemId: string,
  currentPageItems: FormItem[],
  pageNumber: number,
  setCurrentPageItems: (items: FormItem[]) => void,
  setPageFormItems: (updateFn: (prev: PageFormItems) => PageFormItems) => void
): void {
  // Update the current page items by filtering out the deleted item
  const updatedItems = currentPageItems.filter((item) => item.id !== itemId);
  setCurrentPageItems(updatedItems);

  // Update the page items state
  setPageFormItems((prevPageItems) =>
    updatePageObjects(pageNumber, updatedItems, prevPageItems)
  );
}

/**
 * Toggle PDF visibility
 * 
 * @param showPdf - Current PDF visibility state
 * @param setShowPdf - Function to set PDF visibility
 */
export function togglePdfVisibility(
  showPdf: boolean,
  setShowPdf: (show: boolean) => void
): void {
  setShowPdf(!showPdf);
}

/**
 * Update coordinates for a specific form item
 * 
 * @param itemId - ID of the item to update coordinates for
 * @param coordinates - New coordinates to set
 * @param pageNumber - Current page number
 * @param currentPageItems - Current page form items
 * @param setCurrentPageItems - Function to set current page items
 * @param setPageFormItems - Function to update page form items
 */
export function updateFormItemCoordinates(
  itemId: string,
  coordinates: { llx: number; lly: number; urx: number; ury: number },
  pageNumber: number,
  currentPageItems: FormItem[],
  setCurrentPageItems: (items: FormItem[]) => void,
  setPageFormItems: (updateFn: (prev: PageFormItems) => PageFormItems) => void
): void {
  
  // Update the current page items with new coordinates
  const updatedItems = currentPageItems.map((item) => {
    if (item.id === itemId) {
      return {
        ...item,
        coordinates: coordinates
      };
    }
    return item;
  });

  // Update current page items
  setCurrentPageItems(updatedItems);

  // Update the page items state
  setPageFormItems((prevPageItems) =>
    updatePageObjects(pageNumber, updatedItems, prevPageItems)
  );
  
}

/**
 * Load form items from API
 * 
 * @param documentId - Document ID to load items for
 * @param setPageFormItems - Function to set page form items
 * @param setPageNumber - Function to set page number
 * @param setCurrentPageItems - Function to set current page items
 */
export async function loadFormItems(
  documentId: string,
  setPageFormItems: (items: PageFormItems) => void,
  setPageNumber: (page: number) => void,
  setCurrentPageItems: (items: FormItem[]) => void
): Promise<void> {
  try {
    const items = await fetchFormItemsAPI(documentId);

    // Ensure all items have pageNumber set
    const itemsWithPageNumber = items.map((item) => ({
      ...item,
      pageNumber: item.pageNumber || 1, // Default to page 1 if not specified
    }));

    // Group items by page number
    const itemsByPage: PageFormItems = {};
    itemsWithPageNumber.forEach((item) => {
      const page = item.pageNumber || 1;
      if (!itemsByPage[page]) {
        itemsByPage[page] = [];
      }
      itemsByPage[page].push(item);
    });

    // Debug log to show items per page

    // Save all items grouped by page
    setPageFormItems(itemsByPage);

    // Initialize page number to 1
    setPageNumber(1);

    // Initialize form items for page 1 - make sure we get items for page 1 if they exist
    setCurrentPageItems(itemsByPage[1] || []);

    // Force a refresh after a small delay to ensure components update
    setTimeout(() => {
      // Create a shallow copy to force a re-render
      setCurrentPageItems([...(itemsByPage[1] || [])]);
    }, 100);
  } catch (error) {
    console.error("Error loading form items:", error);
  }
}
