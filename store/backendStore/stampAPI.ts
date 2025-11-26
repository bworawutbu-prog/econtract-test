"use client";

import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getTokenLogin } from "../token";
const https = require("https");
const agent = new https.Agent({
  rejectUnauthorized: false,
});

export const getTransactionSlip = createAsyncThunk(
  "getTransactionSlip",
  async (transaction_estamp_id: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const apiUrl = `${
        baseUrl?.endsWith("/") ? baseUrl : baseUrl + "/"
      }/e-stamp/transaction/slip/${transaction_estamp_id}`;
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${getTokenLogin()}`,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
        httpsAgent: agent,
      });
      // แปลงเป็น Blob
      const fileBlob = new Blob([response.data], { type: "application/pdf" });

      // ทำ object URL สำหรับ preview/download
      const fileUrl = URL.createObjectURL(fileBlob);

      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(fileBlob);
      });

      return {
        success: true,
        blob: fileBlob,
        url: fileUrl,
        base64: base64,
      };

      // return response.data;
    } catch (error: any) {
      console.error("Error fetching transaction slip:", error);

      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch transaction slip",
        status: error.response?.status || 500,
      };
    }
  }
);

export const getDetailTransactionSlip = createAsyncThunk(
  "getDetailTransactionSlip",
  async (transaction_estamp_id: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const apiUrl = `${
        baseUrl?.endsWith("/") ? baseUrl : baseUrl + "/"
      }e-stamp/transaction/${transaction_estamp_id}${baseUrl?.includes("/api/v2") ? "?business_id=175128061064325" : ""}`;
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${getTokenLogin()}`,
          "Content-Type": "application/json",
        },
        httpsAgent: agent,
      });

      return response.data;
    } catch (error: any) {
      console.error("Error fetching transaction detail:", error);

      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch transaction detail",
        status: error.response?.status || 500,
      };
    }
  }
);

export const getQrCodeTransaction = createAsyncThunk(
  "getQrCodeTransaction",
  async (transaction_estamp_id: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const apiUrl = `${
        baseUrl?.endsWith("/") ? baseUrl : baseUrl + "/"
      }/e-stamp/transaction/qr/${transaction_estamp_id}`;
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${getTokenLogin()}`,
          "Content-Type": "application/json",
        },
        httpsAgent: agent,
        responseType: "arraybuffer",
      });

      const blob = new Blob([response.data], { type: "image/png" });
      const url = URL.createObjectURL(blob);

      const base64 = Buffer.from(response.data, "binary").toString("base64");
      const base64Url = `data:image/png;base64,${base64}`;

      return {
        success: true,
        url, // Object URL
        blob, // Blob object
        base64Url, // Base64 
      };
      // return response.data;
    } catch (error: any) {
      console.error("Error fetching QR code:", error);

      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch QR code",
        status: error.response?.status || 500,
      };
    }
  }
);
