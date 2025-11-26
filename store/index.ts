/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import mappingReducer from './slices/mappingSlice'; // 🎯 เพิ่ม mapping slice
import contractFormReducer from './slices/contractFormSlice';
import companyReducer from './slices/companySlice'; // 🎯 เพิ่ม company slice
import businessReducer from './slices/businessSlice'; // 🎯 เพิ่ม business slice
import formElementConfigReducer from './slices/formElementConfigSlice'; // 🎯 เพิ่ม formElementConfig slice
import canvasReducer from './slices/canvasSlice'; // 🎯 เพิ่ม canvas slice
import documentFormItemsReducer from './slices/documentFormItemsSlice'; // 🎯 เพิ่ม documentFormItems slice
import documentStorageReducer from './slices/documentStorageSlice'; // 🎯 เพิ่ม documentStorage slice
import contractB2BFormReducer from './documentStore/B2BForm'
import transactionReducer from './frontendStore/transactionAPI';
import userProfileReducer from './frontendStore/userProfile';
import formMappingReducer from './backendStore/formCreateAPI'
import citizenReducer from './backendStore/citizenAPI'
import eSealReducer from './backendStore/orgAPI'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Configure the Redux persist for auth state
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['isAuthenticated', 'user', 'token', 'accessToken', 'refreshToken'], // persist all tokens
};
const userProfilePersistConfig = {
  key: 'userProfile',
  storage,
  whitelist: ['data'], // persist only user profile data, not loading/error states
};

// Configure the Redux persist for UI state
const uiPersistConfig = {
  key: 'ui',
  storage,
  whitelist: ['sidebarCollapsed', 'darkMode'], // persist sidebar and dark mode settings
};

// Configure the Redux persist for FormElementConfig state
const formElementConfigPersistConfig = {
  key: 'formElementConfig',
  storage,
  whitelist: ['configs', 'globalStates'], // persist all form element configs
};

// Configure the Redux store with our reducers
const store = configureStore({
  reducer: {
    auth: persistReducer(authPersistConfig, authReducer),
    ui: persistReducer(uiPersistConfig, uiReducer),
    mapping: mappingReducer, // 🎯 เพิ่ม mapping state
    contractForm: contractFormReducer,
    company: companyReducer, // 🎯 เพิ่ม company state
    business: businessReducer, // 🎯 เพิ่ม business state
    formElementConfig: persistReducer(formElementConfigPersistConfig, formElementConfigReducer), // 🎯 เพิ่ม formElementConfig state
    canvas: canvasReducer, // 🎯 เพิ่ม canvas state
    documentFormItems: documentFormItemsReducer, // 🎯 เพิ่ม documentFormItems state
    documentStorage: documentStorageReducer, // 🎯 เพิ่ม documentStorage state
    transaction: transactionReducer,
    userProfile:  persistReducer(userProfilePersistConfig, userProfileReducer),
    formMapping: formMappingReducer,
    citizen: citizenReducer,
    eSeal: eSealReducer,
    contractB2BForm: contractB2BFormReducer,
    
    // Add other reducers here as needed
  },
  middleware: (getDefaultMiddleware:any) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these actions from serializability checks (for redux-persist)
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persisted store
const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export store and persistor
export { store, persistor }; 