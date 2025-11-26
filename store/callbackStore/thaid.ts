import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getGuestToken, getTokenLogin } from "../token";


export const verifyThaid = createAsyncThunk(
    "verifyThaid",
    async ({ code, sessionId }: { code: string, sessionId: string }) => {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/external_services/verify/thaid`;
        const payload = {
            code:code,
            session_id:sessionId,
        }
        try {
            const response = await axios.post(apiUrl, payload, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }
);

export const signThaid = createAsyncThunk(
    "signThaid",
    async ({ code, sessionId }: { code: string, sessionId: string }) => {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/external_services/transaction/b2c`;
        const payload = {
            code:code,
            session_id:sessionId,
        }
        const token = getGuestToken();
        if (!token) {
            throw new Error("No authentication token found");
        }
        try {
            const response = await axios.put(apiUrl, payload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }
);

export const signingThaidB2B = createAsyncThunk(
    "signThaidB2B",
    async ({ sessionId, sharedToken }: { sessionId: string, sharedToken: string }) => {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/transaction/signing`;
        const payload = {  
            session_id:sessionId,
            shared_token:sharedToken,
        }
        const token = getTokenLogin();
        if (!token) {
            throw new Error("No authentication token found");
        }
        try {
            const response = await axios.put(apiUrl, payload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                return error.response;
            } else {
                throw error;
            }
        }
    }
);