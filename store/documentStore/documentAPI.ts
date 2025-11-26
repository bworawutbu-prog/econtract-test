"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CitizenSchema, CitizenResponse } from "../types/citizenSchema";
import { enqueueSnackbar } from "notistack";
import { getTokenLogin } from "../token";
import axios from "axios";
import { detectApiError } from "@/utils/errorHandler";
import router from "next/router";

interface SearchB2BEmailData{
    email: string;
    type: string;
    tax_id?: string; // โพรเทคดาต้
    business: string;
}

export const B2BSearchByEmail = createAsyncThunk(
    "B2BSearchByEmail",
    async (value: SearchB2BEmailData) => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/";
        const apiUrl = `${
          baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"
        }transaction/validate/signer?`;
        // console.log('api path =>', apiUrl)
        const response = await axios.post(apiUrl, value, {
          headers: {
            Authorization: `Bearer ${getTokenLogin()}`,
            "Content-Type": "application/json",
          },

        });
  
        // Check if API returned status: false (Not Found)
        if (response.data.status === false) {
          // console.log('if => ', response)
          return null;
        }

        // console.log('response => ',response)
          
        return response.data;
      } catch (error) {
        console.error("Failed to search citizen by email:", error);
        if (axios.isAxiosError(error)) {
          // console.error("Axios error details:", {
          //   status: error.response?.status,
          //   data: error.response?.data,
          //   config: {
          //     url: error.config?.url,
          //     method: error.config?.method,
          //     headers: error.config?.headers,
          //   },
          // });
          
          // If it's a 404 error, return empty array to indicate "new email"
          if (error.response?.status === 404) {
            return [];
          }
        }
        throw error;
      }
    }
  );

  export const getDocumentType = createAsyncThunk(
    "getDocumentType",
    async (businessId: string) => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const apiUrl = `${baseUrl}/business/document-type`;
        const token = getTokenLogin();
  
        const request = await axios.get(apiUrl, {
          params: {
            business_id: businessId
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
  
        const response = await request.data.data;
        // console.log('resp =>',response)
        return response;
      } catch (error) {
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