"use client";

import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getTokenLogin } from "../token";
import { clearAllUserSession } from '../utils/localStorage';

export const getContractStatusDetail = createAsyncThunk(
  "getContractStatusDetail",
  async ({ id }: { id: string }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const url = `${baseUrl}/transaction/${id}/contracts${baseUrl?.includes("/api/v2") ? "?business_id=175128061064325" : ""}`;
    const token = getTokenLogin();

    if (!token) {
      clearAllUserSession();
      console.error("No authentication token found");
      window.location.href = "/login";
      return;
    }

    try {
      const response = await axios.put(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("Error getting contract status detail:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to get contract status detail",
        status: error.response?.status || 500,
      };
    }
  }
);


export const putValidateTransaction = async (transactionId: string, docType: string) : Promise<any> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const path = docType === "b2b" ? "/contracts" : "/b2c/contracts";
  const url = `${baseUrl}/transaction/${transactionId}${path}${baseUrl?.includes("/api/v2") ? "?business_id=175128061064325" : ""}`;
  const token = getTokenLogin();

  if (!token) {
    clearAllUserSession();
    console.error("No authentication token found");
    window.location.href = "/login";
    return;
  }

  try {
    const response = await axios.put(url, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      message: "Transaction validated successfully",
      data: response.data,
    };
  } catch (error: any) {
    console.error("Error validating transaction:", error);
    return {
      success: false,
      message: "Failed to validate transaction",
      error: error.response?.data?.message || error.message || "Unknown error",
    };
  }
}