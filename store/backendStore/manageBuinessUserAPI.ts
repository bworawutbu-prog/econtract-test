import { createAsyncThunk } from "@reduxjs/toolkit";
import { getTokenLogin } from "../token";
import axios, { AxiosError } from "axios";
import { mockB2BPartners } from "../mockData/mockManageBusinessUser";
import { detectApiError } from "@/utils/errorHandler";
import router from "next/router";

export const getListBusinessUserInternal = createAsyncThunk(
    "getListBusinessUserInternal",
    async (payload: { page?: number; size?: number; businessId?: string }, { rejectWithValue }) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!baseUrl) return rejectWithValue("API base URL is not configured");

        const token = getTokenLogin();
        const page = payload?.page ?? 1;
        const size = payload?.size ?? 10;
        const businessId = payload?.businessId; // Default fallback

        try {
            const isV2 = baseUrl.includes("/api/v2");
            const url = `${baseUrl}/users/business`;

            const response = await axios.get(url, {
                params: isV2
                    ? { business_id: businessId, page, size }
                    : { page, size },
                withCredentials: true,
                headers: token
                    ? { Authorization: `Bearer ${token}`, Accept: "application/json" }
                    : { Accept: "application/json" },
            });

            return response.data;
        } catch (err) {
            const apiError = detectApiError(err);
            if (apiError.errorType === 'network_error') {
                router.replace("/login");
            } else if (apiError.errorType === 'unauthorized') {
                router.replace("/login");
            } else {
                console.log("error", err);
            }
            // console.error("Error fetching business users:", err);
            // return rejectWithValue("Error fetching business users");
        }
    }
);

export const getListBusinessB2BPartner = createAsyncThunk(
    "getListBusinessB2BPartner",
    async (payload: { page?: number; size?: number; businessId?: string }, { rejectWithValue }) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!baseUrl) return rejectWithValue("API base URL is not configured");

        const token = getTokenLogin();
        const page = payload?.page ?? 1;
        const size = payload?.size ?? 10;
        const businessId = payload?.businessId;

        return mockB2BPartners;

        // try {
        //     const isV2 = baseUrl.includes("/api/v2");
        //     const url = `${baseUrl}/users/business`;

        //     const response = await axios.get(url, {
        //         params: isV2
        //             ? { business_id: businessId, page, size } 
        //             : { page, size },                                  
        //         withCredentials: true,
        //         headers: token
        //             ? { Authorization: `Bearer ${token}`, Accept: "application/json" }
        //             : { Accept: "application/json" },
        //     });

        //     return response.data;
        // } catch (err) {
        //     console.error("Error fetching business users:", err);
        //     return rejectWithValue("Error fetching business users");
        // }
    }
);
