"use client"

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarCollapsed: boolean;
  darkMode: boolean;
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    dismissed: boolean;
  }>;
  loading: {
    isFileUploading: boolean;
    isDetailLoading: boolean;
    isPageLoading: boolean;
    uploadProgress: number;
    loadingMessage: string;
  };
}

const initialState: UIState = {
  sidebarCollapsed: false,
  darkMode: false,
  notifications: [],
  loading: {
    isFileUploading: false,
    isDetailLoading: false,
    isPageLoading: false,
    uploadProgress: 0,
    loadingMessage: '',
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    addNotification: (state, action: PayloadAction<{
      message: string;
      type: 'success' | 'error' | 'warning' | 'info';
    }>) => {
      const id = Date.now().toString();
      state.notifications.push({
        id,
        message: action.payload.message,
        type: action.payload.type,
        dismissed: false,
      });
    },
    dismissNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        state.notifications[index].dismissed = true;
      }
    },
    clearNotifications: (state) => {
      state.notifications = state.notifications.filter(n => !n.dismissed);
    },
    setFileUploadLoading: (state, action: PayloadAction<{ isUploading: boolean; progress?: number; message?: string }>) => {
      state.loading.isFileUploading = action.payload.isUploading;
      if (action.payload.progress !== undefined) {
        state.loading.uploadProgress = action.payload.progress;
      }
      if (action.payload.message !== undefined) {
        state.loading.loadingMessage = action.payload.message;
      }
    },
    setDetailLoading: (state, action: PayloadAction<{ isLoading: boolean; message?: string }>) => {
      state.loading.isDetailLoading = action.payload.isLoading;
      if (action.payload.message !== undefined) {
        state.loading.loadingMessage = action.payload.message;
      }
    },
    setPageLoading: (state, action: PayloadAction<{ isLoading: boolean; message?: string }>) => {
      state.loading.isPageLoading = action.payload.isLoading;
      if (action.payload.message !== undefined) {
        state.loading.loadingMessage = action.payload.message;
      }
    },
  },
});

export const {
  setSidebarCollapsed,
  toggleSidebar,
  toggleDarkMode,
  addNotification,
  dismissNotification,
  clearNotifications,
  setFileUploadLoading,
  setDetailLoading,
  setPageLoading,
} = uiSlice.actions;

export default uiSlice.reducer; 