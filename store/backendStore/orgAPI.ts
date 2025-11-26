"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getTokenLogin } from "../token";
import BusinessUtils from "@/store/utils/businessUtils";
import axios from "axios";
import type { RootState } from "../index";
import router from "next/router";
import { detectApiError } from "@/utils/errorHandler";
const https = require("https");
const agent = new https.Agent({
  rejectUnauthorized: false,
});

// Types for E-Seal
interface ESealSize {
  width: string;
  height: string;
  unit: string;
}

interface CreateESealRequest {
  name: string;
  permission: {
    index: number;
    email: string;
    account_id: string;
  }[];
  seal_base64: string;
  size: ESealSize;
}

// Simplified types for /v1/business/seal API
interface CreateSealRequest {
  seal_base64: string;
  seal_name: string;
  business_id: string;
}

interface UpdateSealRequest {
  seal_base64: string;
  seal_name: string;
  business_id: string;
}

interface DeleteSealRequest {
  seal_base64: string;
  seal_name: string;
  business_id: string;
}

interface UpdateLogoRequest {
  business_id: string;
  logo_base64: string;
}

// Types for /v1/business/profile API
interface SealItem {
  id: string;
  name: string;
  seal: string;
}

interface BusinessProfileResponse {
  business_id: string;
  has_ca: boolean;
  logo_base64: string;
  name_on_document_th: string;
  name_th: string;
  seal_list: SealItem[];
  tax_id: string;
  trust_level: string;
}

interface UpdateESealRequest {
  name: string;
  permission: {
    index: number;
    email: string;
    account_id: string;
  }[];
  seal_base64: string;
  size: ESealSize;
}

interface DeleteESealRequest {
  name: string;
  permission: {
    index: number;
    email: string;
    account_id: string;
  }[];
  seal_base64: string;
  size: ESealSize;
}

interface ESealResponse {
  id: string;
  name: string;
  permission: {
    index: number;
    email: string;
    account_id: string;
  }[];
  seal_base64: string;
  size: ESealSize;
  created_at: string;
  updated_at: string;
}

interface ESealState {
  data: ESealResponse[];
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null | undefined;
}

const initialState: ESealState = {
  data: [],
  loading: "idle",
  error: "",
};

// Create E-Seal with optional businessId
export const createESeal = createAsyncThunk(
  "createESeal",
  async (payload: { businessId?: string; data: CreateESealRequest }) => {
    const businessId = payload.businessId || BusinessUtils.getBusinessId();
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const apiUrl = `${
        baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"
      }business/${businessId}/company_seal/create_company_seal`;

      const request = await axios.post(apiUrl, payload.data, {
        headers: {
          Authorization: `Bearer ${getTokenLogin()}`,
          "Content-Type": "application/json",
        },
        httpsAgent: agent,
      });

      return request.data;
    } catch (error) {
      console.error("Failed to create E-Seal:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
          },
        });
      }
      throw error;
    }
  }
);

// Get All E-Seals with optional businessId
export const getAllESeals = createAsyncThunk(
  "getAllESeals",
  async (businessId?: string) => {
    const currentBusinessId = businessId || BusinessUtils.getBusinessId();
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const apiUrl = `${
        baseUrl?.endsWith("/") ? baseUrl : baseUrl + "/"
      }business/${currentBusinessId}/company_seal/all_seals`;

      const request = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${getTokenLogin()}`,
        },
        httpsAgent: agent,
      });

      return request.data;
    } catch (error) {
      console.error("Failed to get all E-Seals:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
          },
        });
      }
      throw error;
    }
  }
);

// Get E-Seal by ID with optional businessId
export const getESealById = createAsyncThunk(
  "getESealById",
  async (payload: { businessId?: string; esealId: string }) => {
    const businessId = payload.businessId || BusinessUtils.getBusinessId();
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const apiUrl = `${
        baseUrl?.endsWith("/") ? baseUrl : baseUrl + "/"
      }business/${businessId}/company_seal/?company_seal_id=${payload.esealId}`;

      const request = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${getTokenLogin()}`,
        },
        httpsAgent: agent,
      });

      return request.data;
    } catch (error) {
      console.error("Failed to get E-Seal by ID:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
          },
        });
      }
      throw error;
    }
  }
);

// Update E-Seal with optional businessId
export const updateESeal = createAsyncThunk(
  "updateESeal",
  async (payload: { 
    businessId?: string; 
    esealId: string; 
    data: UpdateESealRequest 
  }) => {
    const businessId = payload.businessId || BusinessUtils.getBusinessId();
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const apiUrl = `${
        baseUrl?.endsWith("/") ? baseUrl : baseUrl + "/"
      }business/${businessId}/company_seal/?company_seal_id=${payload.esealId}`;

      const request = await axios.put(apiUrl, payload.data, {
        headers: {
          Authorization: `Bearer ${getTokenLogin()}`,
          "Content-Type": "application/json",
        },
        httpsAgent: agent,
      });

      return request.data;
    } catch (error) {
      console.error("Failed to update E-Seal:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
          },
        });
      }
      throw error;
    }
  }
);

// Delete E-Seal with optional businessId
export const deleteESeal = createAsyncThunk(
  "deleteESeal",
  async (payload: { 
    businessId?: string; 
    esealId: string; 
    data: DeleteESealRequest 
  }) => {
    const businessId = payload.businessId || BusinessUtils.getBusinessId();
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const apiUrl = `${
        baseUrl?.endsWith("/") ? baseUrl : baseUrl + "/"
      }business/${businessId}/company_seal/?company_seal_id=${payload.esealId}`;

      const request = await axios.delete(apiUrl, {
        headers: {
          Authorization: `Bearer ${getTokenLogin()}`,
          "Content-Type": "application/json",
        },
        data: payload.data,
        httpsAgent: agent,
      });

      return request.data;
    } catch (error) {
      console.error("Failed to delete E-Seal:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
          },
        });
      }
      throw error;
    }
  }
);

// Create Seal using /v1/business/seal (simplified version)
export const createESeal2 = createAsyncThunk(
  "createESeal2",
  async (payload: { businessId?: string; data: CreateSealRequest }, { getState }) => {
    const state = getState() as RootState;
    const selectedBusinessId = state.business.selectedBusinessId;
    
    // Use provided businessId, then Redux state, then fallback
    const businessId = payload.businessId || selectedBusinessId || BusinessUtils.getBusinessId();
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      // Replace v2 with v1 in the base URL
      const baseUrlV1 = baseUrl.replace('/api/v2/', '/api/v1/');
      const apiUrl = `${
        baseUrlV1.endsWith("/") ? baseUrlV1 : baseUrlV1 + "/"
      }business/seal`;

      // Include business_id in the payload data
      const requestData = {
        ...payload.data,
        business_id: businessId
      };

      // console.log("🔍 [createESeal2] Using businessId:", businessId);
      // console.log("🔍 [createESeal2] Source:", payload.businessId ? "parameter" : selectedBusinessId ? "Redux" : "fallback");

      const request = await axios.post(apiUrl, requestData, {
        headers: {
          Authorization: `Bearer ${getTokenLogin()}`,
          "Content-Type": "application/json",
        },
        httpsAgent: agent,
      });

      return request.data;
    } catch (error) {
      console.error("Failed to create Seal:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
          },
        });
        throw new Error(
          error.response?.data?.message ||
            `HTTP ${error.response?.status}: ${error.message}`
        );
      }
      throw error;
    }
  }
);

// Update Seal using /v1/business/seal/:id (simplified version)
export const updateESeal2 = createAsyncThunk(
  "updateESeal2",
  async (payload: { 
    businessId?: string; 
    sealId: string; 
    data: UpdateSealRequest 
  }, { getState }) => {
    const state = getState() as RootState;
    const selectedBusinessId = state.business.selectedBusinessId;
    
    // Use provided businessId, then Redux state, then fallback
    const businessId = payload.businessId || selectedBusinessId || BusinessUtils.getBusinessId();
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      // Replace v2 with v1 in the base URL
      const baseUrlV1 = baseUrl.replace('/api/v2/', '/api/v1/');
      const apiUrl = `${
        baseUrlV1.endsWith("/") ? baseUrlV1 : baseUrlV1 + "/"
      }business/seal/${payload.sealId}`;

      // Include business_id in the payload data
      const requestData = {
        ...payload.data,
        business_id: businessId
      };

      // console.log("🔍 [updateESeal2] Using businessId:", businessId);
      // console.log("🔍 [updateESeal2] Source:", payload.businessId ? "parameter" : selectedBusinessId ? "Redux" : "fallback");

      const request = await axios.put(apiUrl, requestData, {
        headers: {
          Authorization: `Bearer ${getTokenLogin()}`,
          "Content-Type": "application/json",
        },
        httpsAgent: agent,
      });

      return request.data;
    } catch (error) {
      console.error("Failed to update Seal:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
          },
        });
        throw new Error(
          error.response?.data?.message ||
            `HTTP ${error.response?.status}: ${error.message}`
        );
      }
      throw error;
    }
  }
);

// Delete Seal using /v1/business/seal/:id
export const deleteESeal2 = createAsyncThunk(
  "deleteESeal2",
  async (payload: { 
    businessId?: string; 
    sealId: string; 
    data: DeleteSealRequest 
  }, { getState }) => {
    const state = getState() as RootState;
    const selectedBusinessId = state.business.selectedBusinessId;
    
    // Use provided businessId, then Redux state, then fallback
    const businessId = payload.businessId || selectedBusinessId || BusinessUtils.getBusinessId();
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      // Replace v2 with v1 in the base URL
      const baseUrlV1 = baseUrl.replace('/api/v2/', '/api/v1/');
      const apiUrl = `${
        baseUrlV1.endsWith("/") ? baseUrlV1 : baseUrlV1 + "/"
      }business/seal/${payload.sealId}`;

      // Include business_id in the payload data
      const requestData = {
        ...payload.data,
        business_id: businessId
      };

      // console.log("🔍 [deleteESeal2] Using businessId:", businessId);
      // console.log("🔍 [deleteESeal2] Source:", payload.businessId ? "parameter" : selectedBusinessId ? "Redux" : "fallback");

      const request = await axios.delete(apiUrl, {
        data: requestData,
        headers: {
          Authorization: `Bearer ${getTokenLogin()}`,
          "Content-Type": "application/json",
        },
        httpsAgent: agent,
      });

      return request.data;
    } catch (error) {
      console.error("Failed to delete Seal:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
          },
        });
        throw new Error(
          error.response?.data?.message ||
            `HTTP ${error.response?.status}: ${error.message}`
        );
      }
      throw error;
    }
  }
);

// Update Business Logo using /v1/business/logo
export const updateBusinessLogo = createAsyncThunk(
  "updateBusinessLogo",
  async (payload: { 
    businessId?: string; 
    data: UpdateLogoRequest 
  }, { getState }) => {
    const state = getState() as RootState;
    const selectedBusinessId = state.business.selectedBusinessId;
    
    // Use provided businessId, then Redux state, then fallback
    const businessId = payload.businessId || selectedBusinessId || BusinessUtils.getBusinessId();
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      // Replace v2 with v1 in the base URL
      const baseUrlV1 = baseUrl.replace('/api/v2/', '/api/v1/');
      const apiUrl = `${
        baseUrlV1.endsWith("/") ? baseUrlV1 : baseUrlV1 + "/"
      }business/logo`;

      // Include business_id in the payload data
      const requestData = {
        ...payload.data,
        business_id: businessId
      };

      // console.log("🔍 [updateBusinessLogo] Using businessId:", businessId);
      // console.log("🔍 [updateBusinessLogo] Source:", payload.businessId ? "parameter" : selectedBusinessId ? "Redux" : "fallback");

      const request = await axios.put(apiUrl, requestData, {
        headers: {
          Authorization: `Bearer ${getTokenLogin()}`,
          "Content-Type": "application/json",
        },
        httpsAgent: agent,
      });

      return request.data;
    } catch (error) {
      console.error("Failed to update Business Logo:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
          },
        });
        throw new Error(
          error.response?.data?.message ||
            `HTTP ${error.response?.status}: ${error.message}`
        );
      }
      throw error;
    }
  }
);

// Get Business Profile using /v1/business/profile
export const getBusinessProfile = createAsyncThunk(
  "getBusinessProfile",
  async (businessId: string | undefined, { getState }) => {
    const state = getState() as RootState;
    const selectedBusinessId = state.business.selectedBusinessId;
    
    // Use provided businessId, then Redux state, then fallback
    const currentBusinessId = businessId || selectedBusinessId || BusinessUtils.getBusinessId();
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      // Replace v2 with v1 in the base URL
      const baseUrlV1 = baseUrl.replace('/api/v2/', '/api/v1/');
      const apiUrl = `${
        baseUrlV1.endsWith("/") ? baseUrlV1 : baseUrlV1 + "/"
      }business/profile?business_id=${currentBusinessId}`;

      // console.log("🔍 [getBusinessProfile] Using businessId:", currentBusinessId);
      // console.log("🔍 [getBusinessProfile] Source:", businessId ? "parameter" : selectedBusinessId ? "Redux" : "fallback");

      const request = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${getTokenLogin()}`,
        },
        httpsAgent: agent,
      });

      return request.data;
    } catch (error) {
      console.error("Failed to get business profile:", error);
      // if (axios.isAxiosError(error)) {
      //   console.error("Axios error details:", {
      //     status: error.response?.status,
      //     data: error.response?.data,
      //     config: {
      //       url: error.config?.url,
      //       method: error.config?.method,
      //       headers: error.config?.headers,
      //     },
      //   });
      //   throw new Error(
      //     error.response?.data?.message ||
      //       `HTTP ${error.response?.status}: ${error.message}`
      //   );
      // }
      const apiError = detectApiError(error);
      if (apiError.errorType === 'network_error') {
          router.replace("/login");
      } else if (apiError.errorType === 'unauthorized') {
          router.replace("/login");
      } else {
          console.log("error", error);
      }
      throw error;
    }
  }
);

// E-Seal Slice
const eSealSlice = createSlice({
  name: "eSeal",
  initialState,
  reducers: {
    clearESealData: (state) => {
      state.data = [];
      state.loading = "idle";
      state.error = null;
    },
    setESealError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create E-Seal
    builder
      .addCase(createESeal.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(createESeal.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.error = null;
        // Optionally add the new seal to the data array
        if (action.payload.data) {
          state.data.push(action.payload.data);
        }
      })
      .addCase(createESeal.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message || "Failed to create E-Seal";
      });

    // Get All E-Seals
    builder
      .addCase(getAllESeals.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(getAllESeals.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.error = null;
        state.data = action.payload.data || [];
      })
      .addCase(getAllESeals.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message || "Failed to get E-Seals";
      });

    // Get E-Seal by ID
    builder
      .addCase(getESealById.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(getESealById.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.error = null;
        // Update the specific seal in the data array
        const index = state.data.findIndex(seal => seal.id === action.payload.data?.id);
        if (index !== -1) {
          state.data[index] = action.payload.data;
        } else if (action.payload.data) {
          state.data.push(action.payload.data);
        }
      })
      .addCase(getESealById.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message || "Failed to get E-Seal";
      });

    // Update E-Seal
    builder
      .addCase(updateESeal.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(updateESeal.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.error = null;
        // Update the specific seal in the data array
        const index = state.data.findIndex(seal => seal.id === action.payload.data?.id);
        if (index !== -1) {
          state.data[index] = action.payload.data;
        }
      })
      .addCase(updateESeal.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message || "Failed to update E-Seal";
      });

    // Delete E-Seal
    builder
      .addCase(deleteESeal.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(deleteESeal.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.error = null;
        // Remove the deleted seal from the data array
        // You might need to adjust this based on the actual response structure
        if (action.payload.data?.id) {
          state.data = state.data.filter(seal => seal.id !== action.payload.data.id);
        }
      })
      .addCase(deleteESeal.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message || "Failed to delete E-Seal";
      });

    // Create Seal (simplified)
    builder
      .addCase(createESeal2.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(createESeal2.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.error = null;
        // Optionally add the new seal to the data array
        if (action.payload.data) {
          state.data.push(action.payload.data);
        }
      })
      .addCase(createESeal2.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message || "Failed to create Seal";
      });

    // Update Seal (simplified)
    builder
      .addCase(updateESeal2.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(updateESeal2.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.error = null;
        // Update the specific seal in the data array
        const index = state.data.findIndex(seal => seal.id === action.payload.data?.id);
        if (index !== -1) {
          state.data[index] = action.payload.data;
        }
      })
      .addCase(updateESeal2.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message || "Failed to update Seal";
      });

    // Delete E-Seal2
    builder
      .addCase(deleteESeal2.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(deleteESeal2.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.error = null;
        // Optionally remove the deleted seal from the data array
        // You might want to implement this based on your needs
      })
      .addCase(deleteESeal2.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message || "Failed to delete Seal";
      });

    // Update Business Logo
    builder
      .addCase(updateBusinessLogo.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(updateBusinessLogo.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.error = null;
        // Optionally update logo data in the state
        // You might want to implement this based on your needs
      })
      .addCase(updateBusinessLogo.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message || "Failed to update Business Logo";
      });

    // Get Business Profile
    builder
      .addCase(getBusinessProfile.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(getBusinessProfile.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.error = null;
        // Store business profile data in the state
        // You might want to add a separate field for business profile data
      })
      .addCase(getBusinessProfile.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message || "Failed to get business profile";
      });
  },
});

export const { clearESealData, setESealError } = eSealSlice.actions;
export default eSealSlice.reducer; 