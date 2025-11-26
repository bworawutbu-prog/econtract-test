"use client";

import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getTokenLogin } from "../token";
import { clearAllUserSession } from "../utils/localStorage";

interface QueryLogActionUsers {
  search: string;
  size: number;
  page: number;
  date?: string;
}

export const getLogActionUsers = createAsyncThunk(
  "getLogActionUsers",
  async ({ search, size, page, date }: QueryLogActionUsers) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const url = `${baseUrl}/log-activities?search=${search}&size=${size}&page=${page}${
      date ? `&date=${date}` : ""
    }${baseUrl?.includes("/api/v2") ? "&business_id=175128061064325" : ""}`;
    const token = getTokenLogin();

    if (!token) {
      clearAllUserSession();
      console.error("No authentication token found");
      window.location.href = "/login";
      return;
    }

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error: any) {
      console.error("Error getting log action users:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to get log action users",
        status: error.response?.status || 500,
      };
    }
  }
);
