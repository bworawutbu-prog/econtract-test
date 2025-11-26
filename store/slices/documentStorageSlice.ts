"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 🎯 DOCUMENT STORAGE: Interface for stored PDF document
export interface StoredDocument {
  url: string; // Blob URL
  name: string;
  size: number;
  index: number; // Index for attached documents (-1 for main document)
  isMain: boolean;
}

// 🎯 DOCUMENT STORAGE: State interface for storing PDF documents
interface DocumentStorageState {
  // Main document (เอกสารหลัก)
  mainDocument: StoredDocument | null;
  // Attached documents (เอกสารแนบ)
  attachedDocuments: StoredDocument[];
  // Current active document URL
  currentDocumentUrl: string | null;
}

const initialState: DocumentStorageState = {
  mainDocument: null,
  attachedDocuments: [],
  currentDocumentUrl: null,
};

const documentStorageSlice = createSlice({
  name: "documentStorage",
  initialState,
  reducers: {
    // 🎯 Set main document
    setMainDocumentInStorage: (
      state,
      action: PayloadAction<{
        url: string;
        name: string;
        size: number;
      }>
    ) => {
      const { url, name, size } = action.payload;
      state.mainDocument = {
        url,
        name,
        size,
        index: -1,
        isMain: true,
      };
      // Set as current document if no current document is set
      if (!state.currentDocumentUrl) {
        state.currentDocumentUrl = url;
      }
    },

    // 🎯 Add attached document
    addAttachedDocument: (
      state,
      action: PayloadAction<{
        url: string;
        name: string;
        size: number;
      }>
    ) => {
      const { url, name, size } = action.payload;
      const newIndex = state.attachedDocuments.length;
      state.attachedDocuments.push({
        url,
        name,
        size,
        index: newIndex,
        isMain: false,
      });
    },

    // 🎯 Add multiple attached documents
    addAttachedDocuments: (
      state,
      action: PayloadAction<
        Array<{
          url: string;
          name: string;
          size: number;
        }>
      >
    ) => {
      const documents = action.payload;
      documents.forEach((doc) => {
        const newIndex = state.attachedDocuments.length;
        state.attachedDocuments.push({
          url: doc.url,
          name: doc.name,
          size: doc.size,
          index: newIndex,
          isMain: false,
        });
      });
    },

    // 🎯 Remove attached document by index
    removeAttachedDocument: (state, action: PayloadAction<number>) => {
      const indexToRemove = action.payload;
      state.attachedDocuments = state.attachedDocuments.filter(
        (doc, index) => index !== indexToRemove
      );
      // Re-index remaining documents
      state.attachedDocuments.forEach((doc, index) => {
        doc.index = index;
      });
    },

    // 🎯 Clear all attached documents
    clearAttachedDocuments: (state) => {
      state.attachedDocuments = [];
    },

    // 🎯 Set current document URL
    setCurrentDocumentUrl: (state, action: PayloadAction<string | null>) => {
      state.currentDocumentUrl = action.payload;
    },

    // 🎯 Clear main document
    clearMainDocument: (state) => {
      // If current document is the main document, clear it
      const mainDocUrl = state.mainDocument?.url;
      state.mainDocument = null;
      if (mainDocUrl && state.currentDocumentUrl === mainDocUrl) {
        state.currentDocumentUrl = null;
      }
    },

    // 🎯 Reset all documents
    resetAllDocuments: (state) => {
      state.mainDocument = null;
      state.attachedDocuments = [];
      state.currentDocumentUrl = null;
    },
  },
});

export const {
  setMainDocumentInStorage,
  addAttachedDocument,
  addAttachedDocuments,
  removeAttachedDocument,
  clearAttachedDocuments,
  setCurrentDocumentUrl,
  clearMainDocument,
  resetAllDocuments,
} = documentStorageSlice.actions;

export default documentStorageSlice.reducer;

// 🎯 Selectors
export const selectMainDocument = (state: any) =>
  state.documentStorage.mainDocument;

export const selectAttachedDocuments = (state: any) =>
  state.documentStorage.attachedDocuments;

export const selectCurrentDocumentUrl = (state: any) =>
  state.documentStorage.currentDocumentUrl;

export const selectAllDocuments = (state: any) => {
  const { mainDocument, attachedDocuments } = state.documentStorage;
  const allDocs: StoredDocument[] = [];
  if (mainDocument) {
    allDocs.push(mainDocument);
  }
  allDocs.push(...attachedDocuments);
  return allDocs;
};

export const selectDocumentByUrl = (url: string) => (state: any) => {
  const { mainDocument, attachedDocuments } = state.documentStorage;
  if (mainDocument?.url === url) {
    return mainDocument;
  }
  return attachedDocuments.find((doc: StoredDocument) => doc.url === url) || null;
};

