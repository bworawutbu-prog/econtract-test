import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 🎯 POSITIONING: Position interface for elements
export interface ElementPosition {
  x: number;
  y: number;
}

// 🎯 POSITIONING: FormItem minimal interface for canvas state
export interface CanvasFormItem {
  id: string;
  type: string;
  label: string;
  position: ElementPosition;
  pageNumber?: number;
  step_index?: string;
  actorId?: string;
  style?: any;
  value?: any;
  config?: any;
  checkboxOptions?: string[];
  radioOptions?: string[];
  selectOptions?: string[];
  [key: string]: any; // Allow additional properties
}

// 🎯 POSITIONING: Page-based form items structure
export interface PageFormItems {
  [pageNumber: number]: CanvasFormItem[];
}

interface CanvasState {
  isDragging: boolean;
  pdfDimensions: {
    width: number;
    height: number;
  } | null;
  canvasScale: number;
  isPdfReady: boolean;
  activeElementId: string | null;
  draggedItemId: string | null;
  activeId: string | null; // dnd-kit active drag ID
  configElement: CanvasFormItem | null; // Currently selected element for configuration
  currentPageNumber: number; // Current active page
  currentStepIndex: string; // Current active step (e.g., "0", "1", "all")
  pageFormItems: PageFormItems; // All form items organized by page
  currentPageItems: CanvasFormItem[]; // Items on current page (computed from pageFormItems)
}

const initialState: CanvasState = {
  isDragging: false,
  pdfDimensions: null,
  canvasScale: 1,
  isPdfReady: false,
  activeElementId: null,
  draggedItemId: null,
  // 🎯 POSITIONING: Initialize new state
  activeId: null,
  configElement: null,
  currentPageNumber: 1,
  currentStepIndex: "0",
  pageFormItems: {},
  currentPageItems: [],
};

const canvasSlice = createSlice({
  name: "canvas",
  initialState,
  reducers: {
    setIsDragging: (state, action: PayloadAction<boolean>) => {
      state.isDragging = action.payload;
    },
    setPdfDimensions: (state, action: PayloadAction<{ width: number; height: number } | null>) => {
      state.pdfDimensions = action.payload;
    },
    setCanvasScale: (state, action: PayloadAction<number>) => {
      state.canvasScale = action.payload;
    },
    setIsPdfReady: (state, action: PayloadAction<boolean>) => {
      state.isPdfReady = action.payload;
    },
    setActiveElementId: (state, action: PayloadAction<string | null>) => {
      state.activeElementId = action.payload;
    },
    setDraggedItemId: (state, action: PayloadAction<string | null>) => {
      state.draggedItemId = action.payload;
    },
    // 🎯 POSITIONING: New reducers for positioning management
    setActiveId: (state, action: PayloadAction<string | null>) => {
      state.activeId = action.payload;
    },
    setConfigElement: (state, action: PayloadAction<CanvasFormItem | null>) => {
      state.configElement = action.payload;
    },
    setCurrentPageNumber: (state, action: PayloadAction<number>) => {
      state.currentPageNumber = action.payload;
      // Auto-update currentPageItems when page changes
      state.currentPageItems = state.pageFormItems[action.payload] || [];
    },
    setCurrentStepIndex: (state, action: PayloadAction<string>) => {
      state.currentStepIndex = action.payload;
    },
    // 🎯 POSITIONING: Set all items for a specific page
    setPageItems: (state, action: PayloadAction<{ pageNumber: number; items: CanvasFormItem[] }>) => {
      const { pageNumber, items } = action.payload;
      state.pageFormItems[pageNumber] = items;
      // Update currentPageItems if this is the current page
      if (pageNumber === state.currentPageNumber) {
        state.currentPageItems = items;
      }
    },
    // 🎯 POSITIONING: Add a single item to a page
    addPageItem: (state, action: PayloadAction<{ pageNumber: number; item: CanvasFormItem }>) => {
      const { pageNumber, item } = action.payload;
      if (!state.pageFormItems[pageNumber]) {
        state.pageFormItems[pageNumber] = [];
      }
      state.pageFormItems[pageNumber].push(item);
      // Update currentPageItems if this is the current page
      if (pageNumber === state.currentPageNumber) {
        state.currentPageItems = state.pageFormItems[pageNumber];
      }
    },
    // 🎯 POSITIONING: Add multiple items to a page
    addPageItems: (state, action: PayloadAction<{ pageNumber: number; items: CanvasFormItem[] }>) => {
      const { pageNumber, items } = action.payload;
      if (!state.pageFormItems[pageNumber]) {
        state.pageFormItems[pageNumber] = [];
      }
      state.pageFormItems[pageNumber].push(...items);
      // Update currentPageItems if this is the current page
      if (pageNumber === state.currentPageNumber) {
        state.currentPageItems = state.pageFormItems[pageNumber];
      }
    },
    // 🎯 POSITIONING: Update an item's position
    updateItemPosition: (state, action: PayloadAction<{ itemId: string; position: ElementPosition; pageNumber?: number }>) => {
      const { itemId, position, pageNumber } = action.payload;
      const targetPage = pageNumber !== undefined ? pageNumber : state.currentPageNumber;
      
      if (state.pageFormItems[targetPage]) {
        const itemIndex = state.pageFormItems[targetPage].findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
          state.pageFormItems[targetPage][itemIndex].position = position;
          
          // Update currentPageItems if this is the current page
          if (targetPage === state.currentPageNumber) {
            state.currentPageItems = state.pageFormItems[targetPage];
          }
        }
      }
    },
    // 🎯 POSITIONING: Update an entire item
    updatePageItem: (state, action: PayloadAction<{ itemId: string; item: Partial<CanvasFormItem>; pageNumber?: number }>) => {
      const { itemId, item, pageNumber } = action.payload;
      const targetPage = pageNumber !== undefined ? pageNumber : state.currentPageNumber;
      
      if (state.pageFormItems[targetPage]) {
        const itemIndex = state.pageFormItems[targetPage].findIndex(i => i.id === itemId);
        if (itemIndex !== -1) {
          state.pageFormItems[targetPage][itemIndex] = {
            ...state.pageFormItems[targetPage][itemIndex],
            ...item,
          };
          
          // Update currentPageItems if this is the current page
          if (targetPage === state.currentPageNumber) {
            state.currentPageItems = state.pageFormItems[targetPage];
          }
        }
      }
    },
    // 🎯 POSITIONING: Remove an item from a page
    removePageItem: (state, action: PayloadAction<{ itemId: string; pageNumber?: number }>) => {
      const { itemId, pageNumber } = action.payload;
      const targetPage = pageNumber !== undefined ? pageNumber : state.currentPageNumber;
      
      if (state.pageFormItems[targetPage]) {
        state.pageFormItems[targetPage] = state.pageFormItems[targetPage].filter(item => item.id !== itemId);
        
        // Update currentPageItems if this is the current page
        if (targetPage === state.currentPageNumber) {
          state.currentPageItems = state.pageFormItems[targetPage];
        }
      }
    },
    // 🎯 POSITIONING: Remove multiple items from a page
    removePageItems: (state, action: PayloadAction<{ itemIds: string[]; pageNumber?: number }>) => {
      const { itemIds, pageNumber } = action.payload;
      const targetPage = pageNumber !== undefined ? pageNumber : state.currentPageNumber;
      
      if (state.pageFormItems[targetPage]) {
        state.pageFormItems[targetPage] = state.pageFormItems[targetPage].filter(
          item => !itemIds.includes(item.id)
        );
        
        // Update currentPageItems if this is the current page
        if (targetPage === state.currentPageNumber) {
          state.currentPageItems = state.pageFormItems[targetPage];
        }
      }
    },
    // 🎯 POSITIONING: Batch update multiple pages
    batchUpdatePages: (state, action: PayloadAction<PageFormItems>) => {
      state.pageFormItems = action.payload;
      // Update currentPageItems
      state.currentPageItems = state.pageFormItems[state.currentPageNumber] || [];
    },
    // 🎯 POSITIONING: Clear all items from a page
    clearPageItems: (state, action: PayloadAction<number>) => {
      const pageNumber = action.payload;
      delete state.pageFormItems[pageNumber];
      
      // Update currentPageItems if this is the current page
      if (pageNumber === state.currentPageNumber) {
        state.currentPageItems = [];
      }
    },
    resetCanvasState: (state) => {
      console.log('resetCanvasState')
      console.log('initialState =>',initialState)
      return initialState;
    },
  },
});

export const {
  setIsDragging,
  setPdfDimensions,
  setCanvasScale,
  setIsPdfReady,
  setActiveElementId,
  setDraggedItemId,
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
  resetCanvasState,
} = canvasSlice.actions;

export default canvasSlice.reducer;
