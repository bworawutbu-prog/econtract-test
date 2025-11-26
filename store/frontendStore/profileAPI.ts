"use client";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getTokenLogin, getGuestToken} from "../token"
import type { listTransactionSchema, listTransactionResponse, payloadUpdateTransaction } from '../types/mappingTypes'
import axios, { AxiosError } from "axios"
import { clearAllUserSession } from '../utils/localStorage';
import { setCookie, getCookie, deleteCookie } from 'cookies-next/client';
import { Section } from "lucide-react";
import { enqueueSnackbar } from "notistack";

type PostUserSignPayload = {
  stamp_name: string;
  sign_base64: string;
};
type UpdateUserSignPayload = {
  old_stamp_name: string;
  new_stamp_name: string;
  sign_base64: string;
};

// POST
export const post_user_sign = createAsyncThunk(
  'post_user_sign',
  async (payload: PostUserSignPayload) => {
    try {
      const token = !getTokenLogin() ? sessionStorage.getItem("guest_accessToken") : getTokenLogin()
      if (!token) {
        clearAllUserSession()
        enqueueSnackbar("No authentication token found", {
          variant: "error",
        });
        window.location.href = '/login';
        return;
      }
      // TODO: Replace this with your actual POST API endpoint
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/user_setting/create_signature`;

      const response = await axios.post(apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error);
      throw error;
    }
  }
);

// GET (single or paged)
export const get_user_sign = createAsyncThunk(
  'get_user_sign',
  async (my_signature :string) => {
    try {
      const token = !getTokenLogin() ? sessionStorage.getItem("guest_accessToken") : getTokenLogin()
      if (!token) {
        clearAllUserSession()
        enqueueSnackbar("No authentication token found", {
          variant: "error",
        });
        window.location.href = '/login';
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/user_setting/get_signature?stamp_name=${encodeURIComponent(my_signature)}`;
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      handleAxiosError(error);
      throw error;
    }
  }
);

// GET (all without pagination, if applicable)
export const get_all_user_sign = createAsyncThunk(
  "get_all_user_sign",
  async () => {
    try {
      const token = !getTokenLogin()
        ? sessionStorage.getItem("guest_accessToken")
        : getTokenLogin();
      if (!token) {
        clearAllUserSession();
        enqueueSnackbar("No authentication token found", {
          variant: "error",
        });
        window.location.href = "/login";
        return;
      }
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/user_setting/get_user_stamplist`;

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (
          error.response?.status === 404 &&
          error.response?.data?.message === "Not Found"
        ) {
          return {
            data: [],
          };
        }
      }
      handleAxiosError(error);
      throw error;
    }
  }
);

// PUT (update)
export const update_user_sign = createAsyncThunk(
  'update_user_sign',
  async (payload: UpdateUserSignPayload) => {
    try {
      const token = !getTokenLogin() ? sessionStorage.getItem("guest_accessToken") : getTokenLogin()
      if (!token) {
        clearAllUserSession()
        enqueueSnackbar("No authentication token found", {
          variant: "error",
        });
        window.location.href = '/login';
        return;
      }
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/user_setting/update_signature`;
      const response = await axios.put(apiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error);
      throw error;
    }
  }
);

// DELETE
export const delete_user_sign = createAsyncThunk(
  'delete_user_sign',
  async (my_signature: string) => {
    try {
      const token = !getTokenLogin() ? sessionStorage.getItem("guest_accessToken") : getTokenLogin()
      if (!token) {
        clearAllUserSession()
        enqueueSnackbar("No authentication token found", {
          variant: "error",
        });
        window.location.href = '/login';
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/user_setting/delete_signature?stamp_name=${encodeURIComponent(my_signature)}`;

      const response = await axios.delete(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      handleAxiosError(error);
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



































































