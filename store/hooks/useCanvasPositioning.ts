/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../index';
import {
  setActiveId,
  setConfigElement,
  setCurrentPageNumber,
  setCurrentStepIndex,
  setPageItems,
  addPageItem,
  addPageItems,
  updateItemPosition,
  updatePageItem,
  removePageItem,
  removePageItems,
  batchUpdatePages,
  clearPageItems,
  CanvasFormItem,
  ElementPosition,
  PageFormItems,
} from '../slices/canvasSlice';

/**
 * 🎯 POSITIONING: Custom hook for managing canvas positioning and form items
 * This centralizes all positioning logic in Redux state
 */
export const useCanvasPositioning = () => {
  const dispatch = useAppDispatch();
  const canvasState = useAppSelector((state) => state.canvas);

  // ==================== SELECTORS ====================
  
  /**
   * Get current active drag ID (from dnd-kit)
   */
  const activeId = canvasState.activeId;

  /**
   * Get currently selected/configured element
   */
  const configElement = canvasState.configElement;

  /**
   * Get current page number
   */
  const currentPageNumber = canvasState.currentPageNumber;

  /**
   * Get current step index
   */
  const currentStepIndex = canvasState.currentStepIndex;

  /**
   * Get all page form items (all pages)
   */
  const pageFormItems = canvasState.pageFormItems;

  /**
   * Get current page items (computed automatically by Redux)
   */
  const currentPageItems = canvasState.currentPageItems;

  /**
   * Get PDF dimensions
   */
  const pdfDimensions = canvasState.pdfDimensions;

  /**
   * Get canvas scale
   */
  const scale = canvasState.canvasScale;

  /**
   * Get dragging state
   */
  const isDragging = canvasState.isDragging;

  /**
   * Get dragged item ID
   */
  const draggedItemId = canvasState.draggedItemId;

  /**
   * Get active element ID
   */
  const activeElementId = canvasState.activeElementId;

  // ==================== ACTIONS ====================

  /**
   * Set active drag ID (for dnd-kit)
   */
  const setActiveIdAction = useCallback((id: string | null) => {
    dispatch(setActiveId(id));
  }, [dispatch]);

  /**
   * Set config element (element being configured)
   */
  const setConfigElementAction = useCallback((element: CanvasFormItem | null) => {
    dispatch(setConfigElement(element));
  }, [dispatch]);

  /**
   * Set current page number
   */
  const setCurrentPageNumberAction = useCallback((pageNumber: number) => {
    dispatch(setCurrentPageNumber(pageNumber));
  }, [dispatch]);

  /**
   * Set current step index
   */
  const setCurrentStepIndexAction = useCallback((stepIndex: string) => {
    dispatch(setCurrentStepIndex(stepIndex));
  }, [dispatch]);

  /**
   * Set all items for a specific page (replaces existing items)
   */
  const setPageItemsAction = useCallback((pageNumber: number, items: CanvasFormItem[]) => {
    dispatch(setPageItems({ pageNumber, items }));
  }, [dispatch]);

  /**
   * Add a single item to a page
   */
  const addPageItemAction = useCallback((pageNumber: number, item: CanvasFormItem) => {
    dispatch(addPageItem({ pageNumber, item }));
  }, [dispatch]);

  /**
   * Add multiple items to a page
   */
  const addPageItemsAction = useCallback((pageNumber: number, items: CanvasFormItem[]) => {
    dispatch(addPageItems({ pageNumber, items }));
  }, [dispatch]);

  /**
   * Update an item's position
   */
  const updateItemPositionAction = useCallback((
    itemId: string,
    position: ElementPosition,
    pageNumber?: number
  ) => {
    dispatch(updateItemPosition({ itemId, position, pageNumber }));
  }, [dispatch]);

  /**
   * Update an entire item (partial update)
   */
  const updatePageItemAction = useCallback((
    itemId: string,
    item: Partial<CanvasFormItem>,
    pageNumber?: number
  ) => {
    dispatch(updatePageItem({ itemId, item, pageNumber }));
  }, [dispatch]);

  /**
   * Remove an item from a page
   */
  const removePageItemAction = useCallback((itemId: string, pageNumber?: number) => {
    dispatch(removePageItem({ itemId, pageNumber }));
  }, [dispatch]);

  /**
   * Remove multiple items from a page
   */
  const removePageItemsAction = useCallback((itemIds: string[], pageNumber?: number) => {
    dispatch(removePageItems({ itemIds, pageNumber }));
  }, [dispatch]);

  /**
   * Batch update multiple pages at once
   */
  const batchUpdatePagesAction = useCallback((pages: PageFormItems) => {
    dispatch(batchUpdatePages(pages));
  }, [dispatch]);

  /**
   * Clear all items from a page
   */
  const clearPageItemsAction = useCallback((pageNumber: number) => {
    dispatch(clearPageItems(pageNumber));
  }, [dispatch]);

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Get items for a specific page
   */
  const getPageItems = useCallback((pageNumber: number): CanvasFormItem[] => {
    return pageFormItems[pageNumber] || [];
  }, [pageFormItems]);

  /**
   * Get an item by ID from current page
   */
  const getItemById = useCallback((itemId: string): CanvasFormItem | undefined => {
    return currentPageItems.find(item => item.id === itemId);
  }, [currentPageItems]);

  /**
   * Get an item by ID from a specific page
   */
  const getItemByIdFromPage = useCallback((itemId: string, pageNumber: number): CanvasFormItem | undefined => {
    const items = pageFormItems[pageNumber] || [];
    return items.find(item => item.id === itemId);
  }, [pageFormItems]);

  /**
   * Check if an item exists on current page
   */
  const hasItem = useCallback((itemId: string): boolean => {
    return currentPageItems.some(item => item.id === itemId);
  }, [currentPageItems]);

  /**
   * Get filtered items by step index
   */
  const getItemsByStepIndex = useCallback((stepIndex: string): CanvasFormItem[] => {
    if (stepIndex === "all") {
      return currentPageItems;
    }
    return currentPageItems.filter(item => 
      !item.step_index || item.step_index === stepIndex || item.type === "stamp"
    );
  }, [currentPageItems]);

  /**
   * Get filtered items by type
   */
  const getItemsByType = useCallback((type: string): CanvasFormItem[] => {
    return currentPageItems.filter(item => item.type === type);
  }, [currentPageItems]);

  /**
   * Update multiple items at once on current page
   */
  const bulkUpdateCurrentPageItems = useCallback((updates: Array<{ itemId: string; item: Partial<CanvasFormItem> }>) => {
    updates.forEach(({ itemId, item }) => {
      dispatch(updatePageItem({ itemId, item, pageNumber: currentPageNumber }));
    });
  }, [dispatch, currentPageNumber]);

  return {
    // State selectors
    activeId,
    configElement,
    currentPageNumber,
    currentStepIndex,
    pageFormItems,
    currentPageItems,
    pdfDimensions,
    scale,
    isDragging,
    draggedItemId,
    activeElementId,
    
    // Actions
    setActiveId: setActiveIdAction,
    setConfigElement: setConfigElementAction,
    setCurrentPageNumber: setCurrentPageNumberAction,
    setCurrentStepIndex: setCurrentStepIndexAction,
    setPageItems: setPageItemsAction,
    addPageItem: addPageItemAction,
    addPageItems: addPageItemsAction,
    updateItemPosition: updateItemPositionAction,
    updatePageItem: updatePageItemAction,
    removePageItem: removePageItemAction,
    removePageItems: removePageItemsAction,
    batchUpdatePages: batchUpdatePagesAction,
    clearPageItems: clearPageItemsAction,
    
    // Utility functions
    getPageItems,
    getItemById,
    getItemByIdFromPage,
    hasItem,
    getItemsByStepIndex,
    getItemsByType,
    bulkUpdateCurrentPageItems,
  };
};

