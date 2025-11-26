"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CitizenSchema, CitizenResponse } from "../types/citizenSchema";
import { enqueueSnackbar } from "notistack";
import { getTokenLogin } from "../token";
import axios from "axios";
const https = require("https");
const agent = new https.Agent({
  rejectUnauthorized: false,
});

export const getRedirectBusiness = createAsyncThunk(
    "getRedirectBusiness",
    async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/";
        const apiUrl = `${
          baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"
        }business/redirect-url?business_id=175128061064325`;

        const response = await axios.get(apiUrl,{
          headers: {
            Authorization: `Bearer ${getTokenLogin()}`,
            "Content-Type": "application/json",
          },
        });
  
        // Check if API returned status: false (Not Found)
        if (response.data.status === false) {
          return null;
        }
        
        return response.data;
      } catch (error) {
        // handleAxiosError(error);
        throw error;
      }
    }
  );

  // Helper error logger
function handleAxiosError(error: any) {
  enqueueSnackbar(`Failed to load response data: ${error}`, {
    variant: "error",
  });
  if (axios.isAxiosError(error)) {
    enqueueSnackbar(`Axios error details: ${error}`, {
      variant: "error",
    });
  } else {
    enqueueSnackbar(`Non-Axios error: ${error}`, {
      variant: "error",
    });
  }
}