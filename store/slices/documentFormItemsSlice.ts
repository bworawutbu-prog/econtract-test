"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FormItem } from "../types/FormTypes";

// 🎯 DOCUMENT FORM ITEMS: Page-based form items structure for each document
export interface PageFormItems {
  [pageNumber: number]: FormItem[];
}

// 🎯 DOCUMENT FORM ITEMS: State interface for storing form items per document
interface DocumentFormItemsState {
  // Store form items for each document using document URL as key
  documentFormItems: {
    [documentUrl: string]: PageFormItems;
  };
  // Current active document URL
  currentDocumentUrl: string | null;
  // Store document metadata (title, etc.)
  documentMetadata: {
    [documentUrl: string]: {
      title?: string;
      isMain?: boolean;
      index?: number;
    };
  };
}

const initialState: DocumentFormItemsState = {
  documentFormItems: {},
  currentDocumentUrl: null,
  documentMetadata: {},
};

const documentFormItemsSlice = createSlice({
  name: "documentFormItems",
  initialState,
  reducers: {
    // 🎯 Set current document URL
    setCurrentDocumentUrl: (state, action: PayloadAction<string | null>) => {
      state.currentDocumentUrl = action.payload;
    },

    // 🎯 Initialize document form items (create empty structure if not exists)
    initializeDocument: (
      state,
      action: PayloadAction<{
        documentUrl: string;
        title?: string;
        isMain?: boolean;
        index?: number;
      }>
    ) => {
      const { documentUrl, title, isMain, index } = action.payload;
      
      if (!state.documentFormItems[documentUrl]) {
        state.documentFormItems[documentUrl] = {};
      }
      
      if (title || isMain !== undefined || index !== undefined) {
        state.documentMetadata[documentUrl] = {
          ...state.documentMetadata[documentUrl],
          ...(title && { title }),
          ...(isMain !== undefined && { isMain }),
          ...(index !== undefined && { index }),
        };
      }
    },

    // 🎯 Set all form items for a document (replace entire structure)
    setDocumentFormItems: (
      state,
      action: PayloadAction<{
        documentUrl: string;
        pageFormItems: PageFormItems;
      }>
    ) => {
      const { documentUrl, pageFormItems } = action.payload;
      state.documentFormItems[documentUrl] = pageFormItems;
    },

    // 🎯 Set form items for a specific page of a document
    setDocumentPageItems: (
      state,
      action: PayloadAction<{
        documentUrl: string;
        pageNumber: number;
        items: FormItem[];
      }>
    ) => {
      const { documentUrl, pageNumber, items } = action.payload;
      
      if (!state.documentFormItems[documentUrl]) {
        state.documentFormItems[documentUrl] = {};
      }
      
      state.documentFormItems[documentUrl][pageNumber] = items;
    },

    // 🎯 Add a single item to a specific page of a document
    addDocumentPageItem: (
      state,
      action: PayloadAction<{
        documentUrl: string;
        pageNumber: number;
        item: FormItem;
      }>
    ) => {
      const { documentUrl, pageNumber, item } = action.payload;
      
      if (!state.documentFormItems[documentUrl]) {
        state.documentFormItems[documentUrl] = {};
      }
      
      if (!state.documentFormItems[documentUrl][pageNumber]) {
        state.documentFormItems[documentUrl][pageNumber] = [];
      }
      
      state.documentFormItems[documentUrl][pageNumber].push(item);
    },

    // 🎯 Add multiple items to a specific page of a document
    addDocumentPageItems: (
      state,
      action: PayloadAction<{
        documentUrl: string;
        pageNumber: number;
        items: FormItem[];
      }>
    ) => {
      const { documentUrl, pageNumber, items } = action.payload;
      
      if (!state.documentFormItems[documentUrl]) {
        state.documentFormItems[documentUrl] = {};
      }
      
      if (!state.documentFormItems[documentUrl][pageNumber]) {
        state.documentFormItems[documentUrl][pageNumber] = [];
      }
      
      state.documentFormItems[documentUrl][pageNumber].push(...items);
    },

    // 🎯 Update a specific item in a document page
    updateDocumentPageItem: (
      state,
      action: PayloadAction<{
        documentUrl: string;
        pageNumber: number;
        itemId: string;
        updates: Partial<FormItem>;
      }>
    ) => {
      const { documentUrl, pageNumber, itemId, updates } = action.payload;
      
      if (state.documentFormItems[documentUrl]?.[pageNumber]) {
        const itemIndex = state.documentFormItems[documentUrl][pageNumber].findIndex(
          (item) => item.id === itemId
        );
        
        if (itemIndex !== -1) {
          state.documentFormItems[documentUrl][pageNumber][itemIndex] = {
            ...state.documentFormItems[documentUrl][pageNumber][itemIndex],
            ...updates,
          };
        }
      }
    },

    // 🎯 Remove an item from a document page
    removeDocumentPageItem: (
      state,
      action: PayloadAction<{
        documentUrl: string;
        pageNumber: number;
        itemId: string;
      }>
    ) => {
      const { documentUrl, pageNumber, itemId } = action.payload;
      
      if (state.documentFormItems[documentUrl]?.[pageNumber]) {
        state.documentFormItems[documentUrl][pageNumber] = state.documentFormItems[documentUrl][pageNumber].filter(
          (item) => item.id !== itemId
        );
      }
    },

    // 🎯 Remove multiple items from a document page
    removeDocumentPageItems: (
      state,
      action: PayloadAction<{
        documentUrl: string;
        pageNumber: number;
        itemIds: string[];
      }>
    ) => {
      const { documentUrl, pageNumber, itemIds } = action.payload;
      
      if (state.documentFormItems[documentUrl]?.[pageNumber]) {
        state.documentFormItems[documentUrl][pageNumber] = state.documentFormItems[documentUrl][pageNumber].filter(
          (item) => !itemIds.includes(item.id)
        );
      }
    },

    // 🎯 Clear all items from a specific page of a document
    clearDocumentPage: (
      state,
      action: PayloadAction<{
        documentUrl: string;
        pageNumber: number;
      }>
    ) => {
      const { documentUrl, pageNumber } = action.payload;
      
      if (state.documentFormItems[documentUrl]) {
        delete state.documentFormItems[documentUrl][pageNumber];
      }
    },

    // 🎯 Clear all form items for a document
    clearDocument: (state, action: PayloadAction<string>) => {
      const documentUrl = action.payload;
      delete state.documentFormItems[documentUrl];
      delete state.documentMetadata[documentUrl];
    },

    // 🎯 Reset all document form items
    resetAllDocumentFormItems: (state) => {
      state.documentFormItems = {};
      state.currentDocumentUrl = null;
      state.documentMetadata = {};
    },
  },
});

export const {
  setCurrentDocumentUrl,
  initializeDocument,
  setDocumentFormItems,
  setDocumentPageItems,
  addDocumentPageItem,
  addDocumentPageItems,
  updateDocumentPageItem,
  removeDocumentPageItem,
  removeDocumentPageItems,
  clearDocumentPage,
  clearDocument,
  resetAllDocumentFormItems,
} = documentFormItemsSlice.actions;

export default documentFormItemsSlice.reducer;

// 🎯 Selectors
export const selectDocumentFormItems = (documentUrl: string) => (state: any) =>
  state.documentFormItems.documentFormItems[documentUrl] || {};

export const selectCurrentDocumentUrl = (state: any) =>
  state.documentFormItems.currentDocumentUrl;

export const selectDocumentMetadata = (documentUrl: string) => (state: any) =>
  state.documentFormItems.documentMetadata[documentUrl] || {};

export const selectAllDocumentUrls = (state: any) =>
  Object.keys(state.documentFormItems.documentFormItems);

