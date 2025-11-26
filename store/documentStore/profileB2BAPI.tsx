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

interface SearchB2BEmailData{
    email?: string;
    type?: string;
    name?: string;
    tax_id?: string // โพรเทคดาต้า
}

export const B2BSearchByEmail = createAsyncThunk(
    "B2BSearchByEmail",
    async (value: SearchB2BEmailData) => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/";
        const apiUrl = `${
          baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"
        }transaction/validate/signer`;
        // console.log('api path =>', apiUrl)
        const response = await axios.post(apiUrl,value, {
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
export const B2BSearchByEmailOrName = createAsyncThunk(
    "B2BSearchByEmail",
    async (value: SearchB2BEmailData) => {
      // console.log('api value =>',value)
      const token = getTokenLogin();
      if (!token) {
          console.error("No authentication token found");
          // return rejectWithValue("No authentication token found");
      }
      let query = '';
      if (value && value.email && value.email !== '') {
        if (query === '') {
          query += `?email=${value.email}`;
        } else {
          query += `&email=${value.email}`;
        }
      }
      if (value && value.name && value.name !== '') {
        if (query === '') {
          query += `?name=${value.name}`;
        } else {
          query += `&name=${value.name}`;
        }
      }
      if (value && value.tax_id && value.tax_id !== '') {
        if (query === '') {
          query += `?taxId=${value.tax_id}`;
        } else {
          query += `&taxId=${value.tax_id}`;
        }
      }
      try {
        // console.log('api query =>',query)
        // console.log('getTokenLogin =>',getTokenLogin())
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/";
        const apiUrl = `${
          baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"
        }users/search${query}`;
        // &business_id=175128061064325
        // console.log('api path =>', apiUrl)
        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
  
        // Check if API returned status: false (Not Found)
        if (response.data.status === false) {
          return null;
        }
        return response.data.data;
      } catch (error) {
        // handleAxiosError(error);
        throw error;
      }
    }
  );
