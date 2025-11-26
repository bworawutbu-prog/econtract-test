"use client";

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer, { AuthState } from '../slices/authSlice';
import uiReducer from '../slices/uiSlice';

// Configure persist for auth
const authPersistConfig = {
  key: 'frontend-auth',
  storage,
  whitelist: ['isAuthenticated', 'accessToken', 'refreshToken', 'user'], // Only persist these fields
};

// Create the store with proper typing
export const store = configureStore({
  reducer: {
    auth: persistReducer<AuthState>(authPersistConfig, authReducer),
    ui: uiReducer,
    // Add other frontend-specific reducers here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Properly ignore persist actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Ignore paths that might contain non-serializable values
        ignoredPaths: ['some.path.to.non.serializable.value'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create the persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
