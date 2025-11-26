"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Define interfaces for the API responses and requests
interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  status: boolean;
  message: string;
  data: {
    token_type: string;
    expires_in: number;
    access_token: string;
    refresh_token: string;
    expiration_date: string;
    account_id: string;
    result: string;
    username: string;
    email: string;
    login_by: string;
  };
}
import axios from "axios";
const https = require("https");
const agent = new https.Agent({
  rejectUnauthorized: false,
});

// API functions
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    return data;
  },

  refresh: async (refreshToken: string): Promise<any> => {
    // Implement token refresh logic
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }
    );

    const data = await response.json();
    return data;
  },
};

// Admin store types
import { configureStore, createSlice } from "@reduxjs/toolkit";

// Create a simple placeholder reducer
const adminPlaceholderSlice = createSlice({
  name: "adminPlaceholder",
  initialState: { initialized: true },
  reducers: {
    setInitialized: (state, action) => {
      state.initialized = action.payload;
    },
  },
});

// Create a simple admin store for now
const adminStore = configureStore({
  reducer: {
    // Add admin reducers here
    adminPlaceholder: adminPlaceholderSlice.reducer,
  },
});

// Export types for the admin store
export type RootStateAdmin = ReturnType<typeof adminStore.getState>;
export type AppDispatchAdmin = typeof adminStore.dispatch;

// Export MappingBackend functions
export {
  handleSaveFormSubmission,
  createFormSubmission,
} from "./MappingBackend";

// Export orgAPI functions
export {
  createESeal,
  getAllESeals,
  getESealById,
  updateESeal,
  deleteESeal,
  createESeal2,
  updateESeal2,
  deleteESeal2,
  updateBusinessLogo,
  getBusinessProfile,
  clearESealData,
  setESealError,
} from "./orgAPI";

// Export templateAPI functions
export {
  createTemplate,
} from "./templateAPI";

export type {
  CreateTemplatePayload,
  CreateTemplateResponse,
  EstampPayer,
  FlowDataEntity,
  TemplateFlowData,
} from "./templateAPI";

// Re-export mapping types for backward compatibility
export type {
  MappingTextItem,
  MappingSignatureItem,
  MappingDateTimeItem,
  MappingCheckboxItem,
  MappingRadioboxItem,
  MappingStampItem,
  MappingDocNoItem,
  MappingFileItem,
  MappingESealItem,
  WorkflowEntity,
  WorkflowStep,
  FormSubmitData,
  ApiResponse,
  FormItemBase,
  FormItemPosition,
  FormItemConfig,
  FormItemStyle,
} from "../types/mappingTypes";
