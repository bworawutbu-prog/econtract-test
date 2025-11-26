"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getTokenLogin, getGuestToken } from "../token";
import type {
  listTransactionSchema,
  listTransactionResponse,
  payloadUpdateTransaction,
} from "../types/mappingTypes";
import axios from "axios";
import { deleteCookie, getCookie } from "cookies-next/client";
import { clearAllUserSession } from "../utils/localStorage";
import { enqueueSnackbar } from "notistack";
import { mockListTransactions } from "../mockData/mockContractStatusList";
import router from "next/router";
import { detectApiError } from "@/utils/errorHandler";
export interface listTransaction {
  data: listTransactionSchema[];
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string;
}

// Interface สำหรับ Check Expire Token Response
export interface CheckExpireTokenData {
  create_at: string;
  expire_at: string;
  time_left_sec: number;
  time_left_hms: string;
  isValid: boolean;
}

export type FilterType =
  | "all"
  | "บันทึกร่าง"
  | "รอดำเนินการ"
  | "กำลังดำเนินการ"
  | "ปฏิเสธ"
  | "ยกเลิก"
  | "เสร็จสิ้น";

export interface CheckExpireTokenResponse {
  status: boolean;
  message: string;
  data: CheckExpireTokenData;
}

const initialState: listTransaction = {
  data: [],
  loading: "idle",
  error: "",
};
//
export const UpdateTransactions = createAsyncThunk(
  "UpdateTransactions",
  async (update: payloadUpdateTransaction, { rejectWithValue }) => {
    // console.log("Beee => update", update);
    const sections = localStorage.getItem("sections");
    if (update.contract_type === "b2b") {
      try {
        let token = "";
        token = getTokenLogin() || "";
        let apiUrl = "";
        // apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/transaction/signing/transaction`;
        //   const request = await axios.put(apiUrl, update, {
        //     headers: {
        //       Authorization: `Bearer ${token}`,
        //       "Content-Type": "application/json",
        //     },
        //   });
        // apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/transaction/b2b/pre-sign/one-authorize/thaid?business_id=175128061064325`;
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/transaction/b2b/pre-sign/one-authorize/thaid`;
        const request = await axios.post(apiUrl, update, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const response = request.data.data;
        return response;
      } catch (error: any) {
        if (
          error?.response?.data?.message === "BadRequest: Invalid field: sign_base"
        ) {
          enqueueSnackbar("กรุณาลงนามก่อนดำเนินการอนุมัติ", {
            variant: "warning",
            autoHideDuration: 3000,
          });
        }
        if (axios.isAxiosError(error)) {
          const redirectUrl = error.response?.data?.redirectUrl;
          if (redirectUrl) {
            window.location.href = redirectUrl;
          }
        }

        const message =
          (axios.isAxiosError(error) && (error.response?.data?.message as string)) ||
          (error instanceof Error ? error.message : "Failed to update B2B transaction");
        return rejectWithValue(message);
      }
    } else {
      try {
        // const token = getTokenLogin();
        // Check guest
        const isGuest =
          typeof window !== "undefined" &&
          sessionStorage.getItem("isGuest") === "true";
        let token = "";
        if (isGuest) {
          token = getGuestToken() || "";
        } else if (!isGuest) {
          token = getTokenLogin() || "";
        }
        let apiUrl = "";
        // if (isGuest && sections !== "9") {
        //   //26 28
        //   // apiUrl = `${process.env.NEXT_PUBLIC_DEV2_API_URL}/api/external_services/signing/transaction/`;
        //   apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/external_services/signing/transaction/`;
        //   const request = await axios.put(apiUrl, update, {
        //     headers: {
        //       Authorization: `Bearer ${token}`,
        //       "Content-Type": "application/json",
        //     },
        //   });
        //   const response = request.data;
        //   return response;
        // } else if (isGuest && sections == "9") {
        //   apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/external_services/stamping/transaction/`;
        //   const request = await axios.put(apiUrl, update, {
        //     headers: {
        //       Authorization: `Bearer ${token}`,
        //       "Content-Type": "application/json",
        //     },
        //   });

        //   const response = request.data.data;
        //   return response;
        // }
        if (isGuest) {
          apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/external_services/pre-sign/thaid`;
          const request = await axios.post(apiUrl, update, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          const response = request.data.data;
          return response;
        } else {
          // apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/transaction/signing/transaction`;

          // const request = await axios.put(apiUrl, update, {
          //   headers: {
          //     Authorization: `Bearer ${token}`,
          //     "Content-Type": "application/json",
          //   },
          // });
          // apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/transaction/signing/transaction`;
          //   const request = await axios.put(apiUrl, update, {
          //     headers: {
          //       Authorization: `Bearer ${token}`,
          //       "Content-Type": "application/json",
          //     },
          //   });
          // apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/transaction/b2b/pre-sign/one-authorize/thaid?business_id=175128061064325`;
          apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/transaction/b2b/pre-sign/one-authorize/thaid`;
          const request = await axios.post(apiUrl, update, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          const response = request.data.data;
          return response;
        }
      } catch (error: any) {
        if (
          error?.response?.data?.message === "BadRequest: Invalid field: sign_base"
        ) {
          enqueueSnackbar("กรุณาลงนามก่อนดำเนินการอนุมัติ", {
            variant: "warning",
            autoHideDuration: 3000,
          });
        }
        if (axios.isAxiosError(error)) {
          const redirectUrl = error.response?.data?.redirectUrl;
          if (redirectUrl) {
            window.location.href = redirectUrl;
          }
        }

        const message =
          (axios.isAxiosError(error) && (error.response?.data?.message as string)) ||
          (error instanceof Error ? error.message : "Failed to update transaction");
        return rejectWithValue(message);
      }
    }
  }
);

export const transactions = createAsyncThunk(
  // TODO: mayby adding new token type
  "listTransaction",
  async (formId: string, { rejectWithValue }) => {
    try {
      const isGuest =
        typeof window !== "undefined" &&
        sessionStorage.getItem("isGuest") === "true";
      let token = "";
      if (isGuest) {
        token = getGuestToken() || "";
      } else if (!isGuest) {
        token = getTokenLogin() || "";
      }

      let apiUrl = "";

      if (isGuest) {
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/external_services/transaction/${formId}`;
      } else {
        //  const token = getTokenLogin(); TODO: maybe adding guest_token flag to use this here
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/transaction/${formId}`;
      }
      const request = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const response = await request.data.data;
      //
      return response;
    } catch (error: any) {
      if(axios.isAxiosError(error)){
        const apiError = detectApiError(error);
        return {
          error: error.response?.data,
          data: null,
          status: error.response?.status,
        }
      }
      const message =
        (axios.isAxiosError(error) && (error.response?.data?.message as string)) ||
        (error instanceof Error ? error.message : "Failed to load transactions");
      return rejectWithValue(message);
    }
  }
);

// ฟังก์ชันสำหรับดึงข้อมูลทั้งหมด (ไม่จำกัด business)
export const transactionsPage = createAsyncThunk(
  "transactionPage",
  async (page: any, { rejectWithValue }) => {
    try {
      const token = getTokenLogin();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/transaction/?page=${page}`;
      const request = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const response = await request.data;
      //
      return response;
    } catch (error: any) {
      const apiError = detectApiError(error);
      if (apiError.errorType === "network_error") {
        router.replace("/login");
      } else if (apiError.errorType === "unauthorized") {
        router.replace("/login");
      } else {
        console.log("error", error);
      }
      const message =
        apiError.message ||
        (error instanceof Error ? error.message : "Failed to load transaction page");
      return rejectWithValue(message);
    }
  }
);

export const getTransactionsData = createAsyncThunk(
  "getTransactionsData",
  async (
    {
      page = 1,
      limit = 10,
      status = "", // "", "D", "W", "N", "R", "C", "Y"
      search = "",
      businessId,
      isBusiness = false,
    }: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
      businessId?: string;
      isBusiness?: boolean;
    },
    { getState }
  ) => {
    try {
      const token = getTokenLogin();

      if (!token) {
        enqueueSnackbar("No authentication token found", {
          variant: "error",
        });
        localStorage.clear();
        sessionStorage.clear();
        router.replace("/login");
        throw new Error("No authentication token found");
      }
      const state = getState() as any;
      const selectedBusinessId = isBusiness
        ? businessId || state.business?.selectedBusinessId
        : null;

      // สร้าง URL พร้อม query parameters
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const searchParam = search ? search : "";
      const apiUrl = `${baseUrl}/transaction${
        isBusiness ? "/business" : ""
      }?page=${page}&limit=${limit}&status=${status}&search=${searchParam}`;
      const finalUrl =
        apiUrl +
        (apiUrl?.includes("/api/v2")
          ? `&business_id=${selectedBusinessId}`
          : "");

      const request = await axios.get(finalUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const response = await request.data;
      console.log('🎯 Fetching transactions data:', { response });

      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiError = detectApiError(error);
        if (apiError.errorType === "network_error") {
          router.replace("/login");
        } else if (apiError.errorType === "unauthorized") {
          router.replace("/login");
        } else {
          console.log("error", error);
        }
      }
      throw error;
    }
  }
);

export const getTemplates = createAsyncThunk(
  "getTemplates",
  async (
    {
      page = 1,
      limit = 10,
      status = "",
      search = null,
      businessId,
      isBusiness = false,
    }: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string | null;
      businessId?: string | null;
      isBusiness?: boolean;
    },
    { rejectWithValue, getState }
  ) => {
    try {
      const token = getTokenLogin();

      if (!token) {
        clearAllUserSession();
        return rejectWithValue("No authentication token found");
      }

      const state = getState() as any;
      const selectedBusinessId = state.business?.selectedBusinessId;

      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const searchParam = search ? search : "";
      const apiUrl = `${baseUrl}/templates${
        isBusiness ? "/business" : ""
      }?page=${page}&limit=${limit}&status=${status}&search=${searchParam}`;
      const finalUrl =
        apiUrl +
        (apiUrl?.includes("/api/v2")
          ? `&business_id=${selectedBusinessId}`
          : "");

      console.log('🎯 Fetching templates:', { page, limit, finalUrl });

      const request = await axios.get(finalUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const response = await request.data;

      return {
        data: response.data || [],
        total: response.total || 0, 
        count: response.count || 0,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiError = detectApiError(error);
        if (apiError.errorType === "network_error") {
          router.replace("/login");
        } else if (apiError.errorType === "unauthorized") {
          router.replace("/login");
        } else {
          console.log("error", error);
        }
      }
      throw error;
    }
  }
);

// ฟังก์ชันสำหรับดึงข้อมูลตาม business ที่เลือก
export const transactionsPageBusiness = createAsyncThunk(
  "transactionPageBusiness",
  async ({ page }: { page: any }) => {
    try {
      const token = getTokenLogin();

      if (!token) {
        // enqueueSnackbar("No authentication token found", {
        //   variant: "error",
        // });
        // localStorage.clear()
        // sessionStorage.clear()
        // router.replace("/login")
        throw new Error("No authentication token found");
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/transaction/business/?page=${page}`;
      const finalUrl =
        apiUrl +
        (apiUrl?.includes("/api/v2")
          ? `&&business_id=${"175128061064325"}`
          : "");

      const request = await axios.get(finalUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const response = await request.data;
      //
      return response;
    } catch (error) {
      const apiError = detectApiError(error);
      if (apiError.errorType === "network_error") {
        router.replace("/login");
      } else if (apiError.errorType === "unauthorized") {
        router.replace("/login");
      } else {
        console.log("error", error);
      }
      throw error;
    }
  }
);
export const listTransactionSlice = createSlice({
  name: "uselistTransaction",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder

      .addCase(transactions.pending, (state) => {
        state.loading = "pending";
        state.error = "";
      })
      .addCase(
        transactions.fulfilled,
        (state, action: PayloadAction<listTransactionResponse>) => {
          state.loading = "succeeded";
          state.error = "";
          state.data = action.payload;
        }
      )
      .addCase(transactions.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message || "An error occurred";
        state.data = [];
      })

      .addCase(transactionsPage.pending, (state) => {
        state.loading = "pending";
        state.error = "";
      })
      .addCase(
        transactionsPage.fulfilled,
        (state, action: PayloadAction<listTransactionResponse>) => {
          state.loading = "succeeded";
          state.error = "";
          state.data = action.payload;
        }
      )
      .addCase(transactionsPage.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message || "An error occurred";
        state.data = [];
      })

      .addCase(transactionsPageBusiness.pending, (state) => {
        state.loading = "pending";
        state.error = "";
      })
      .addCase(
        transactionsPageBusiness.fulfilled,
        (state, action: PayloadAction<listTransactionResponse>) => {
          state.loading = "succeeded";
          state.error = "";
          state.data = action.payload;
        }
      )
      .addCase(transactionsPageBusiness.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message || "An error occurred";
        state.data = [];
      });
  },
});

export const FilteredTransactions = createAsyncThunk(
  "transactions/fetchFiltered",
  async (tran_type: string, { rejectWithValue }) => {
    //
    //

    try {
      const token = getCookie("accessToken");
      //

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/transaction/filter/${tran_type}`;
      //

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      //

      if (!response.ok) {
        const text = await response.text(); // log raw error body if response is not OK
        enqueueSnackbar(
          `Failed to fetch filtered transactions.% Status: ${response.status}`,
          {
            variant: "error",
          }
        );
        // throw new Error(`Failed to fetch filtered transactions. Status: ${response.status}`);
      }

      const transactionData = await response.json();
      //

      const { data = [], totalData = 0 } = transactionData;

      if (!Array.isArray(data)) {
        console.error("[Thunk] 'data' is not an array:", data);
        // throw new Error("Invalid data format: 'data' is not an array");
      }

      const transformed = (data || []).map((item: any, i: number) => {
        const transformedItem = {
          key: i + 1,
          docId: item?.document_id,
          pdf: item?.path_pdf,
          pdfName: item?.pdf_name,
          startEnabled: item?.start_enabled,
          status: item?.status,
          // taxId: item.tax_id,
          updatedAt: item?.updated_at,
          updatedBy: item?.updated_by,
          workflowId: item?.workflow_id,
          createdAt: item?.created_at,
          createdBy: item?.created_by,
          id: item?._id,
        };
        //
        return transformedItem;
      });

      //
      //

      return {
        items: transformed,
        total: totalData,
      };
    } catch (error: any) {
      const apiError = detectApiError(error);
      if (apiError.errorType === "network_error") {
        router.replace("/login");
      } else if (apiError.errorType === "unauthorized") {
        router.replace("/login");
      } else {
        console.log("error", error);
      }
      return rejectWithValue(error.message || "Unknown error");
    }
  }
);
// otp api
export const document_CheckValidate = createAsyncThunk(
  "docid/validate",
  async (
    {
      docid,
      user_input,
      auth_type,
    }: { docid: string; user_input: string; auth_type: string },
    { rejectWithValue }
  ) => {
    try {
      const isGuest =
        typeof window !== "undefined" &&
        sessionStorage.getItem("isGuest") === "true";
      let token = "";
      if (isGuest) {
        token = getGuestToken() || "";
      } else if (!isGuest) {
        token = getTokenLogin() || "";
      }
      let apiUrl = "";
      if (isGuest) {
        //Guest

        apiUrl = `${
          process.env.NEXT_PUBLIC_API_URL
        }/external_services/transaction/verify/${encodeURIComponent(docid)}`;
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            auth_type,
            user_input,
          }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `Failed to Post password. Status: ${response.status}, Message: ${errorText}`
          );
          // throw new Error(
          //   `Failed to Post password. Status: ${response.status}, Message: ${errorText}`
          // );
        }
        const data = await response.json();
        return data; // return the response data as needed
        //http://203.154.81.73:443/api/external_services/sms/get-otp?phone=0632044543
      } else {
        //login
        apiUrl = `${
          process.env.NEXT_PUBLIC_API_URL
        }/transaction/verify/${encodeURIComponent(docid)}`; //origin
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            auth_type,
            user_input,
          }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            "Failed to Post password. Status: ${response.status}, Message: ${errorText}"
          );
          // throw new Error(
          //   `Failed to Post password. Status: ${response.status}, Message: ${errorText}`
          // );
        }
        const data = await response.json();
        return data; // return the response data as needed
      }
    } catch (error: any) {
      const apiError = detectApiError(error);
      if (apiError.errorType === "network_error") {
        router.replace("/login");
      } else if (apiError.errorType === "unauthorized") {
        router.replace("/login");
      } else {
        console.log("error", error);
      }
      return rejectWithValue(error.message || "Unknown error");
    }
  }
);

export const get_OTPPhone = createAsyncThunk(
  "otp/getPhone",
  async (phone: string, { rejectWithValue }) => {
    try {
      // const token = getCookie('accessToken')
      // if (!token) {
      //   throw new Error("No authentication token found");
      // }
      const isGuest =
        typeof window !== "undefined" &&
        sessionStorage.getItem("isGuest") === "true";
      let token = "";
      if (isGuest) {
        token = getGuestToken() || "";
      } else if (!isGuest) {
        token = getTokenLogin() || "";
      }
      let apiUrl = "";
      if (isGuest) {
        //Guest

        apiUrl = `${
          process.env.NEXT_PUBLIC_API_URL
        }/external_services/sms/get-otp?phone=${encodeURIComponent(phone)}`;
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `Failed to fetch OTP. Status: ${response.status}, Message: ${errorText}`
          );
          // throw new Error(
          //   `Failed to fetch OTP. Status: ${response.status}, Message: ${errorText}`
          // );
        }
        const data = await response.json();
        return data; // return the response data as needed
        //http://203.154.81.73:443/api/external_services/sms/get-otp?phone=0632044543
      } else {
        //login

        apiUrl = `${
          process.env.NEXT_PUBLIC_API_URL
        }/sms/get-otp?phone=${encodeURIComponent(phone)}`; //origin
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `Failed to fetch OTP. Status: ${response.status}, Message: ${errorText}`
          );
          // throw new Error(
          //   `Failed to fetch OTP. Status: ${response.status}, Message: ${errorText}`
          // );
        }
        const data = await response.json();
        return data; // return the response data as needed
      }
    } catch (error: any) {
      const apiError = detectApiError(error);
      if (apiError.errorType === "network_error") {
        router.replace("/login");
      } else if (apiError.errorType === "unauthorized") {
        router.replace("/login");
      } else {
        console.log("error", error);
      }
      return rejectWithValue(error.message || "Unknown error");
    }
  }
);

export const verify_OTPPhone = createAsyncThunk(
  "otp/verifyPhone",
  async (payload: { input_otp: string }, { rejectWithValue }) => {
    try {
      // const token = getCookie('accessToken')
      // if (!token) {
      //   throw new Error("No authentication token found");
      // }
      const isGuest =
        typeof window !== "undefined" &&
        sessionStorage.getItem("isGuest") === "true";
      let token = "";
      if (isGuest) {
        token = getGuestToken() || "";
      } else if (!isGuest) {
        token = getTokenLogin() || "";
      }
      let apiUrl = "";
      if (isGuest) {
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/external_services/sms/verify-otp`;
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            // phone: payload.phone,
            input_otp: payload.input_otp,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `Failed to verify OTP. Status: ${response.status}, Message: ${errorText}`
          );
          // throw new Error(
          //   `Failed to verify OTP. Status: ${response.status}, Message: ${errorText}`
          // );
        }
        const data = await response.json();

        return data;
      } else {
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/sms/verify-otp`;
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            // phone: payload.phone,
            input_otp: payload.input_otp,
          }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `Failed to verify OTP. Status: ${response.status}, Message: ${errorText}`
          );
          // throw new Error(
          //   `Failed to verify OTP. Status: ${response.status}, Message: ${errorText}`
          // );
        }
        const data = await response.json();
        return data;
      }
    } catch (error: any) {
      const apiError = detectApiError(error);
      if (apiError.errorType === "network_error") {
        router.replace("/login");
      } else if (apiError.errorType === "unauthorized") {
        router.replace("/login");
      } else {
        console.log("error", error);
      }
      return rejectWithValue(error.message || "Unknown error");
    }
  }
);

// 🔐 CHECK EXPIRE TOKEN API
export const checkExpireToken = createAsyncThunk(
  "auth/checkExpireToken",
  async (_, { rejectWithValue }) => {
    try {
      const token = getCookie("accessToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const isGuest =
        typeof window !== "undefined" &&
        sessionStorage.getItem("isGuest") === "true";
      let apiUrl = "";

      if (isGuest) {
        // Guest API endpoint (if different)
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/check_expire_token`;
      } else {
        // Regular user API endpoint
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/check_expire_token`;
      }

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("🔐 Token check failed:", {
          status: response.status,
          errorText,
        });
        // throw new Error(
        //   `Failed to check token expiration. Status: ${response.status}, Message: ${errorText}`
        // );
      }

      const data: CheckExpireTokenResponse = await response.json();

      // ✅ หาก token หมดอายุ ให้ทำการ logout
      if (!data.data.isValid) {
        clearAllUserSession();
        // Don't redirect here, let the calling component handle it
        throw new Error("Token has expired");
      }

      // ⚠️ หาก token เหลือเวลาน้อย (เช่น น้อยกว่า 30 นาที) แสดงการแจ้งเตือน
      if (data.data.time_left_sec < 1800) {
        // 30 minutes = 1800 seconds
        enqueueSnackbar(`⚠️ Token expiring soon: ${data.data.time_left_hms}`, {
          variant: "warning",
        });
      }

      return data;
    } catch (error: any) {
      const apiError = detectApiError(error);
      if (apiError.errorType === "network_error") {
        router.replace("/login");
      } else if (apiError.errorType === "unauthorized") {
        router.replace("/login");
      } else {
        console.log("error", error);
      }
      return rejectWithValue(error.message || "Unknown error");
    }
  }
);

export const uploadedFile = createAsyncThunk(
  "uploadedFile",
  async (
    payload: { formData: FormData; businessId?: string },
    { getState }
  ) => {
    const state = getState() as any;
    const selectedBusinessId = state.business?.selectedBusinessId;

    // Use provided businessId, then Redux state, then fallback
    const businessId = payload.businessId || selectedBusinessId; // fallback businessId

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const apiUrl = `${baseUrl}/file/upload_more_file?business_id=${businessId}`;
      const token = getTokenLogin();

      // console.log("🔍 [uploadedFile] Using businessId:", businessId);
      // console.log("🔍 [uploadedFile] Source:", payload.businessId ? "parameter" : selectedBusinessId ? "Redux" : "fallback");

      const request = await axios.post(apiUrl, payload.formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",

          // Don't set Content-Type - let browser set it with boundary for FormData
        },
      });

      const response = await request.data.data;
      return response;
    } catch (error) {
      const apiError = detectApiError(error);
      if (apiError.errorType === "network_error") {
        router.replace("/login");
      } else if (apiError.errorType === "unauthorized") {
        router.replace("/login");
      } else {
        console.log("error", error);
      }
      // enqueueSnackbar(`Failed to upload file: ${error}`, {
      //   variant: "error",
      // });
      // if (axios.isAxiosError(error)) {
      //   enqueueSnackbar(`Axios error: ${error}`, {
      //     variant: "error",
      //   });
      // } else {
      //   enqueueSnackbar(`Non-Axios error: ${error}`, {
      //     variant: "error",
      //   });
      // }
      throw error;
    }
  }
);

export const deleteMoreFile = createAsyncThunk(
  "deleteMoreFile",
  async (payload: any) => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/file/delete_more_file`;
      const token = getTokenLogin();

      const request = await axios.post(apiUrl, payload.uploadKey, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const response = await request.data.data;
      return response;
    } catch (error) {
      // enqueueSnackbar(`Failed to delete file: ${error}`, {
      //   variant: "error",
      // });
      const apiError = detectApiError(error);
      if (apiError.errorType === "network_error") {
        router.replace("/login");
      } else if (apiError.errorType === "unauthorized") {
        router.replace("/login");
      } else {
        console.log("error", error);
      }
      throw error;
    }
  }
);
export const getMessage = createAsyncThunk(
  "getMessage",
  async (messageData: string) => {
    try {
      let token = "";
      let apiUrl = "";
      const isGuest =
        typeof window !== "undefined" &&
        sessionStorage.getItem("isGuest") === "true";
      if (isGuest) {
        token = getGuestToken() || "";
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/external_services/message/${messageData}`;
      } else if (!isGuest) {
        token = getTokenLogin() || "";
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/message/${messageData}`;
      }
      if (!token) {
        throw new Error("No authentication token found");
      }

      const request = await axios.get(apiUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,

          // Don't set Content-Type - let browser set it with boundary for FormData
        },
      });

      const response = await request.data.data;
      return response;
    } catch (error) {
      // if (axios.isAxiosError(error)) {
      //   enqueueSnackbar(`Axios error: ${error}`, {
      //     variant: "error",
      //   });
      // } else {
      //   enqueueSnackbar(`Non-Axios error: ${error}`, {
      //     variant: "error",
      //   });
      // }
      const apiError = detectApiError(error);
      if (apiError.errorType === "network_error") {
        router.replace("/login");
      } else if (apiError.errorType === "unauthorized") {
        router.replace("/login");
      } else {
        console.log("error", error);
      }
      throw error;
    }
  }
);
export const postCreateMessage = createAsyncThunk(
  "postCreateMessage",
  async (messageData: any) => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/message/create`;
      const token = getTokenLogin();

      const request = await axios.post(apiUrl, messageData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,

          // Don't set Content-Type - let browser set it with boundary for FormData
        },
      });

      const response = await request.data.data;
      return response;
    } catch (error) {
      // if (axios.isAxiosError(error)) {
      //   enqueueSnackbar(`Axios error: ${error}`, {
      //     variant: "error",
      //   });
      // } else {
      //   enqueueSnackbar(`Non-Axios error: ${error}`, {
      //     variant: "error",
      //   });
      // }
      const apiError = detectApiError(error);
      if (apiError.errorType === "network_error") {
        router.replace("/login");
      } else if (apiError.errorType === "unauthorized") {
        router.replace("/login");
      } else {
        console.log("error", error);
      }
      throw error;
    }
  }
);
export const deleteMessage = createAsyncThunk(
  "deleteMessage",
  async (messageDelete: string) => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/message/${messageDelete}`;
      const token = getTokenLogin();

      const request = await axios.delete(apiUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,

          // Don't set Content-Type - let browser set it with boundary for FormData
        },
      });

      const response = await request.data.data;
      return response;
    } catch (error) {
      // if (axios.isAxiosError(error)) {
      //   enqueueSnackbar(`Axios error: ${error}`, {
      //     variant: "error",
      //   });
      // } else {
      //   enqueueSnackbar(`Non-Axios error: ${error}`, {
      //     variant: "error",
      //   });
      // }
      const apiError = detectApiError(error);
      if (apiError.errorType === "network_error") {
        router.replace("/login");
      } else if (apiError.errorType === "unauthorized") {
        router.replace("/login");
      } else {
        console.log("error", error);
      }
      throw error;
    }
  }
);

export const transactionSentEmail = createAsyncThunk(
  "transactionSentEmail",
  async (payload: any) => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/transaction/b2b/send-email`;
      const token = getTokenLogin();
      const request = await axios.post(apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const response = await request.data.data;
      return response;
    } catch (error) {
      const apiError = detectApiError(error);
      if (apiError.errorType === "network_error") {
        router.replace("/login");
      } else if (apiError.errorType === "unauthorized") {
        router.replace("/login");
      } else {
        console.log("error", error);
      }
      throw error;
    }
  }
);

export const transactionSentEmailB2B = async (payload: any) => {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/transaction/b2b/send-email`;
    const token = getTokenLogin();
    const request = await axios.post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const response = await request.data.data;
    return response;
  } catch (error) {
    // if (axios.isAxiosError(error) && error.response?.status === 401) {
    //   localStorage.clear();
    //   sessionStorage.clear();
    //   deleteCookie("accessToken");
    //   router.replace("/login");
    // }
    const apiError = detectApiError(error);
    if (apiError.errorType === "network_error") {
      router.replace("/login");
    } else if (apiError.errorType === "unauthorized") {
      router.replace("/login");
    } else {
      console.log("error", error);
    }
    throw error;
  }
};

export const transactionSentEmailB2C = async (payload: any) => {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/transaction/b2c/send-email`;
    const token = getTokenLogin();
    const request = await axios.post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const response = await request.data.data;
    return response;
  } catch (error) {
    // if (axios.isAxiosError(error) && error.response?.status === 401) {
    //   localStorage.clear();
    //   sessionStorage.clear();
    //   deleteCookie("accessToken");
    //   router.replace("/login");
    // }
    const apiError = detectApiError(error);
    if (apiError.errorType === "network_error") {
      router.replace("/login");
    } else if (apiError.errorType === "unauthorized") {
      router.replace("/login");
    } else {
      console.log("error", error);
    }
    throw error;
  }
};

const applyFilter = (list: listTransactionSchema[], filter: FilterType) =>
  filter === "all" ? list : list.filter((t) => t.status === filter);

export const contractStatusList = createAsyncThunk(
  "contractStatusList",
  async ({
    page = 1,
    filter = "all",
  }: {
    page: number;
    filter: FilterType;
  }) => {
    try {
      const token = getTokenLogin();

      if (!token) {
        // enqueueSnackbar("No authentication token found", {
        //   variant: "error",
        // });
        // localStorage.clear()
        // sessionStorage.clear()
        // router.replace("/login")
        throw new Error("No authentication token found");
      }

      // const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/transaction/?page=${page}`;
      // const request = await axios.get(apiUrl, {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //     "Content-Type": "application/json",
      //   },
      // });
      const response = mockListTransactions as listTransactionSchema[];
      return applyFilter(response, filter);

      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiError = detectApiError(error);
        if (apiError.errorType === "network_error") {
          router.replace("/login");
        } else if (apiError.errorType === "unauthorized") {
          router.replace("/login");
        } else {
          console.log("error", error);
        }
      }
      throw error;
    }
  }
);

export const downloadFile = createAsyncThunk(
  "downloadFile",
  async (path: string) => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/s3/more-file/?key=${path}`;
      const type = path.split(".").pop();
      const mimeType = getMemeType(type || "");
      const token = getTokenLogin();
      const request = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      });
      const blob = new Blob([request.data], { type: `${mimeType.mimeType}` });
      const url = URL.createObjectURL(blob);
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      // Convert office document to PDF using PSPDFKit library
      return {
        moreFileUrl: url,
        // pdfUrl: pdfUrl,
        base64: base64,
        mimeType: mimeType.mimeType,
        type: mimeType.type,
        mainType: mimeType.mainType,
      };
    } catch (error) {
      const apiError = detectApiError(error);
      if (apiError.errorType === "network_error") {
        router.replace("/login");
      } else if (apiError.errorType === "unauthorized") {
        router.replace("/login");
      } else {
        console.log("error", error);
      }
      throw error;
    }
  }
);

export default listTransactionSlice.reducer;

const getMemeType = (
  type: string
): { mimeType: string; type: string; mainType: string } => {
  switch (type) {
    case "pdf":
      return { mimeType: "application/pdf", type: "pdf", mainType: "pdf" };
    case "png":
      return { mimeType: "application/png", type: "png", mainType: "image" };
    case "jpg":
      return { mimeType: "application/jpeg", type: "jpg", mainType: "image" };
    case "jpeg":
      return { mimeType: "application/jpeg", type: "jpeg", mainType: "image" };
    case "gif":
      return { mimeType: "application/gif", type: "gif", mainType: "image" };
    case "webp":
      return { mimeType: "application/webp", type: "webp", mainType: "image" };
    case "svg":
      return {
        mimeType: "application/svg+xml",
        type: "svg",
        mainType: "image",
      };
    case "docx":
      return {
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        type: "docx",
        mainType: "office",
      };
    case "xlsx":
      return {
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        type: "xlsx",
        mainType: "office",
      };
    case "pptx":
      return {
        mimeType:
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        type: "pptx",
        mainType: "office",
      };
    case "mp3":
      return { mimeType: "application/mpeg", type: "mp3", mainType: "audio" };
    case "wav":
      return { mimeType: "application/wav", type: "wav", mainType: "audio" };
    case "ogg":
      return { mimeType: "application/ogg", type: "ogg", mainType: "audio" };
    case "aac":
      return { mimeType: "application/aac", type: "aac", mainType: "audio" };
    case "flac":
      return { mimeType: "application/flac", type: "flac", mainType: "audio" };
    case "mp4":
      return { mimeType: "application/mp4", type: "mp4", mainType: "video" };
    case "avi":
      return {
        mimeType: "application/x-msvideo",
        type: "avi",
        mainType: "video",
      };
    case "mkv":
      return {
        mimeType: "application/x-matroska",
        type: "mkv",
        mainType: "video",
      };
    case "webm":
      return { mimeType: "application/webm", type: "webm", mainType: "video" };
    case "mov":
      return {
        mimeType: "application/quicktime",
        type: "mov",
        mainType: "video",
      };
    case "ogv":
      return { mimeType: "application/ogg", type: "ogv", mainType: "video" };
    case "txt":
      return { mimeType: "text/plain", type: "txt", mainType: "text" };
    case "text":
      return { mimeType: "text/plain", type: "text", mainType: "text" };
    case "code":
      return { mimeType: "text/plain", type: "code", mainType: "text" };
    case "zip":
      return {
        mimeType: "application/x-zip-compressed",
        type: "zip",
        mainType: "compressed",
      };
    case "rar":
      return {
        mimeType: "application/x-rar-compressed",
        type: "rar",
        mainType: "compressed",
      };
    case "7z":
      return {
        mimeType: "application/x-7z-compressed",
        type: "7z",
        mainType: "compressed",
      };
    case "tar":
      return {
        mimeType: "application/x-tar",
        type: "tar",
        mainType: "compressed",
      };
    case "gzip":
      return {
        mimeType: "application/x-gzip",
        type: "gzip",
        mainType: "compressed",
      };
    case "bzip2":
      return {
        mimeType: "application/x-bzip2",
        type: "bzip2",
        mainType: "compressed",
      };
    case "lzma":
      return {
        mimeType: "application/x-lzma",
        type: "lzma",
        mainType: "compressed",
      };
    case "xz":
      return {
        mimeType: "application/x-xz",
        type: "xz",
        mainType: "compressed",
      };
    case "zst":
      return {
        mimeType: "application/x-zstd",
        type: "zst",
        mainType: "compressed",
      };
    case "zstd":
      return {
        mimeType: "application/x-zstd",
        type: "zstd",
        mainType: "compressed",
      };
    default:
      return {
        mimeType: "application/octet-stream",
        type: "other",
        mainType: "other",
      };
  }
};
