"use client";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getTokenLogin } from "../token";   
import axios from "axios";

export const getCertificateAuthority = createAsyncThunk(
    "getCertificateAuthority",
    async () => {
        const token = getTokenLogin();
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/one_ca/get-user-credential-list`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        });
        // console.log('AAA CA', response.data)
        return response.data;
    }
);