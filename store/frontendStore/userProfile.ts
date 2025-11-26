"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getTokenLogin, getGuestToken } from "../token";
import axios from "axios";
import { clearAllUserSession } from "../utils/localStorage";
import { setCookie, getCookie, deleteCookie } from "cookies-next/client";
import divide from 'lodash/divide';

// Interface สำหรับ Notify Email Data
export interface NotifyEmailData {
  email: string;
  status: "active" | "inactive";
}

// Interface สำหรับ User Profile Data - ตรงกับ API response
export interface UserProfileData {
  first_name_eng?: string;
  middle_name_eng?: string | null;
  last_name_eng?: string;
  first_name_th?: string;
  middle_name_th?: string | null;
  last_name_th?: string;
  account_title_th?: string;
  account_title_eng?: string;
  special_title_name_th?: string | null;
  special_title_name_eng?: string | null;
  mobile?: string[];
  email?: string[];
  report_notify: boolean;
  notify_email?: NotifyEmailData[];
}

export interface UserProfileResponse {
  status: boolean;
  message: string;
  data: UserProfileData;
}

export interface UserProfileState {
  data: UserProfileData | null;
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null | undefined;
}

const initialState: UserProfileState = {
  data: null,
  loading: "idle",
  error: null,
};

// 🔥 GET User Profile API
export const getUserProfile = createAsyncThunk(
  "userProfile/getUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      // Check if user is guest
      // console.log('getUserProfile')

      const isGuest =
        typeof window !== "undefined" &&
        sessionStorage.getItem("isGuest") === "true";
      // let token = "";
      // if (isGuest) {
      //   token = getGuestToken() ?? "";
      // } else {
      //   token = getTokenLogin() ?? "";
      // }

      const token = getTokenLogin() ?? "";

      if (!token) {
        throw new Error("No authentication token found");
      }

      // let apiUrl = "";

      // if (isGuest) {
      //   // Guest API endpoint (if different for guest users)
      //   apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/external_services/users/user_profile`;
      // } else {
      //   // Regular user API endpoint
      //   // console.log('else get profile')
      //   apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/profile`;
      // }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/profile`;

      const request = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const response = request.data;

      return response.data || response;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        // Handle redirect if provided
        const redirectUrl = error.response?.data?.redirectUrl;
        if (redirectUrl) {
          window.location.href = redirectUrl;
        }

        // Handle token expiration
        if (error.response?.status === 401 || error.response?.status === 403) {
          clearAllUserSession();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        } else if (error.response?.status === 429) {
          return rejectWithValue("Too Many Requests");
        }

        return rejectWithValue(error.response?.data?.message || error.message);
      } else {
        return rejectWithValue(error.message || "Unknown error");
      }
    }
  }
);

// 🔥 SET Report Notify API
export const setReportNotify = createAsyncThunk(
  "userProfile/setReportNotify",
  async (report_notify: boolean, { rejectWithValue }) => {
    try {
      // Check if user is guest
      const isGuest =
        typeof window !== "undefined" &&
        sessionStorage.getItem("isGuest") === "true";
      let token = "";

      if (isGuest) {
        token = getGuestToken() ?? "";
      } else {
        token = getTokenLogin() ?? "";
      }

      if (!token) {
        throw new Error("No authentication token found");
      }

      let apiUrl = "";

      apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/user_setting/set_report_notify`;

      const request = await axios.post(
        apiUrl,
        { report_notify },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const response = request.data;

      return { report_notify }; // Return the updated value
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        // Handle redirect if provided
        const redirectUrl = error.response?.data?.redirectUrl;
        if (redirectUrl) {
          window.location.href = redirectUrl;
        }

        // Handle token expiration
        if (error.response?.status === 401 || error.response?.status === 403) {
          clearAllUserSession();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }

        return rejectWithValue(error.response?.data?.message || error.message);
      } else {
        return rejectWithValue(error.message || "Unknown error");
      }
    }
  }
);

// 🔥 SET Email Notify API
export const setEmailNotify = createAsyncThunk(
  "userProfile/setEmailNotify",
  async (
    payload: { email: string; status: "active" | "inactive" },
    { rejectWithValue }
  ) => {
    try {
      // Check if user is guest
      const isGuest =
        typeof window !== "undefined" &&
        sessionStorage.getItem("isGuest") === "true";
      let token = "";

      if (isGuest) {
        token = getGuestToken() ?? "";
      } else {
        token = getTokenLogin() ?? "";
      }

      if (!token) {
        throw new Error("No authentication token found");
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/user_setting/email`;
      // const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/user_setting/set_notify_email`; //old version

      const request = await axios.put(apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const response = request.data;

      return payload; // Return the updated value
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        // Handle redirect if provided
        const redirectUrl = error.response?.data?.redirectUrl;
        if (redirectUrl) {
          window.location.href = redirectUrl;
        }

        // Handle token expiration
        if (error.response?.status === 401 || error.response?.status === 403) {
          clearAllUserSession();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }

        return rejectWithValue(error.response?.data?.message || error.message);
      } else {
        return rejectWithValue(error.message || "Unknown error");
      }
    }
  }
);

// 🔥 DELETE Email Notify API
export const deleteEmailNotify = createAsyncThunk(
  "userProfile/deleteEmailNotify",
  async (email: string, { rejectWithValue }) => {
    try {
      // Check if user is guest
      const isGuest =
        typeof window !== "undefined" &&
        sessionStorage.getItem("isGuest") === "true";
      let token = "";

      if (isGuest) {
        token = getGuestToken() ?? "";
      } else {
        token = getTokenLogin() ?? "";
      }

      if (!token) {
        throw new Error("No authentication token found");
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/user_setting/delete_notify_email`;

      const request = await axios.delete(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          email: email,
        },
      });

      const response = request.data;

      return { email }; // Return the deleted email
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        // Handle redirect if provided
        const redirectUrl = error.response?.data?.redirectUrl;
        if (redirectUrl) {
          window.location.href = redirectUrl;
        }

        // Handle token expiration
        if (error.response?.status === 401 || error.response?.status === 403) {
          clearAllUserSession();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }

        return rejectWithValue(error.response?.data?.message || error.message);
      } else {
        return rejectWithValue(error.message || "Unknown error");
      }
    }
  }
);

// Redux Slice
export const userProfileSlice = createSlice({
  name: "userProfile",
  initialState,
  reducers: {
    // Action สำหรับ clear user profile data
    clearUserProfile: (state) => {
      state.data = null;
      state.loading = "idle";
      state.error = null;
    },
    // Action สำหรับ update user profile data locally
    updateUserProfile: (
      state,
      action: PayloadAction<Partial<UserProfileData>>
    ) => {
      if (state.data) {
        state.data = { ...state.data, ...action.payload };
      }
    },
  },
  extraReducers(builder) {
    builder
      // Get User Profile
      .addCase(getUserProfile.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        getUserProfile.fulfilled,
        (state, action: PayloadAction<UserProfileData>) => {
          state.loading = "succeeded";
          state.error = null;
          state.data = action.payload;
        }
      )
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = "failed";
        state.error =
          action.payload === "Too Many Requests"
            ? "Too Many Requests"
            : (action.payload as string) ||
              action.error.message ||
              "An error occurred";
        // ไม่ clear data เมื่อ error เพื่อให้ยังแสดงข้อมูลเก่าได้
      })

      // Set Report Notify
      .addCase(setReportNotify.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        setReportNotify.fulfilled,
        (state, action: PayloadAction<{ report_notify: boolean }>) => {
          state.loading = "succeeded";
          state.error = null;
          // Update the report_notify field in the current user profile data
          if (state.data) {
            state.data.report_notify = action.payload.report_notify;
          }
        }
      )
      .addCase(setReportNotify.rejected, (state, action) => {
        state.loading = "failed";
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "An error occurred";
      })

      // Set Email Notify
      .addCase(setEmailNotify.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        setEmailNotify.fulfilled,
        (
          state,
          action: PayloadAction<{
            email: string;
            status: "active" | "inactive";
          }>
        ) => {
          state.loading = "succeeded";
          state.error = null;
          // Update the email notifications in the current user profile data
          if (state.data?.notify_email) {
            const existingIndex = state.data.notify_email.findIndex(
              (item) => item.email === action.payload.email
            );

            if (existingIndex >= 0) {
              // Update existing notification
              state.data.notify_email[existingIndex].status =
                action.payload.status;
            } else {
              // Add new notification
              state.data.notify_email.push(action.payload);
            }
          }
        }
      )
      .addCase(setEmailNotify.rejected, (state, action) => {
        state.loading = "failed";
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "An error occurred";
      })

      // Delete Email Notify
      .addCase(deleteEmailNotify.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        deleteEmailNotify.fulfilled,
        (state, action: PayloadAction<{ email: string }>) => {
          state.loading = "succeeded";
          state.error = null;
          // Remove the email from notify_email array
          if (state.data?.notify_email) {
            state.data.notify_email = state.data.notify_email.filter(
              (item) => item.email !== action.payload.email
            );
          }
          // Remove the email from email array
          if (state.data?.email) {
            state.data.email = state.data.email.filter(
              (email) => email !== action.payload.email
            );
          }
        }
      )
      .addCase(deleteEmailNotify.rejected, (state, action) => {
        state.loading = "failed";
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "An error occurred";
      });
  },
});

// Export actions
export const { clearUserProfile, updateUserProfile } = userProfileSlice.actions;

// Export reducer
export default userProfileSlice.reducer;
