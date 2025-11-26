"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CitizenSchema, CitizenResponse } from "../types/citizenSchema";
import { getTokenLogin } from "../token";
import axios from "axios";
const https = require("https");
const agent = new https.Agent({
  rejectUnauthorized: false,
});

interface CitizenState {
  data: CitizenSchema[];
  loading: "idle" | "pending" | "succeeded" | "failed"; // สถานะการโหลด
  error: string | null | undefined; // สำหรับเก็บข้อความ error
}
const initialState: CitizenState = {
  data: [],
  loading: "idle",
  error: "",
};

export const citizenGetAll = createAsyncThunk("citizenGetAll", async () => {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/";
    // Ensure URL ends with a slash
    const apiUrl = `${
      baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"
    }users/get-all`;

     // Debug log

    const request = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${getTokenLogin()}`,
      },
    });
    const response = await request.data.data.map((item: any) => ({
      id: item.citizen_data?.id || null,
      first_name_th: item.citizen_data?.first_name_th || "",
      last_name_th: item.citizen_data?.last_name_th || "",
      email: item.citizen_data?.email?.[0]?.email || "",
      department: item.citizen_data?.department || "",
    }));
    
    return response;
  } catch (error) {
    // console.error("Failed to load response data:", error);
    // if (axios.isAxiosError(error)) {
    //   console.error("Axios error details:", {
    //     status: error.response?.status,
    //     data: error.response?.data,
    //     config: {
    //       url: error.config?.url,
    //       method: error.config?.method,
    //       headers: error.config?.headers,
    //     },
    //   });
    // }
    throw error;
  }
});
export const citizenSearch = createAsyncThunk(
  "transactionPage",
  async (payload: any) => {
    
    try {
      // const page = '1'
      // const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjdlMTZiZDlmYTRkNjNiMTg4ZjI4ZDk5ZGRlZDJhOTc5ODZmMzE3Yjk2NDExNTIwZDY4ODM0YzdhMTI1MmI2NzdmODAzNmY2MWY1NjIyMTI5In0.eyJhdWQiOiIxMjQ1IiwianRpIjoiN2UxNmJkOWZhNGQ2M2IxODhmMjhkOTlkZGVkMmE5Nzk4NmYzMTdiOTY0MTE1MjBkNjg4MzRjN2ExMjUyYjY3N2Y4MDM2ZjYxZjU2MjIxMjkiLCJpYXQiOjE3NDgxMDc5NDAsIm5iZiI6MTc0ODEwNzk0MCwiZXhwIjoxNzQ4MTk0MzQwLCJzdWIiOiIyNTE0NzQyOTE4NCIsInNjb3BlcyI6W119.GyjSMro2xupJ0P5k8jf_A6R8mayvgtqKr-36kxYxmYeSU967LmNm_sEkHyy8JH92OmzTzxMyoLKT2p4N0hq_IgCUGNKBvkYmDqtOF2iJHBYeGdm-UD_GouCpwPkpwWeUgNwUWbebbuCMzH4jtnRBsuZMcOErmzKWpA5zQ0Sc-ces1uJLaU0Xlkw4R6edepXWUz3TIwMflAuX27HJY8ooyT_OAAFy2nr2VR7NikvWXZJ9zjTzEVVBr93NxP413zZTIAxSCt_zy4C-ngoGOl4g_DwPpfv_nWS4wr90hrraZEw36RFKVOoC7qACvhWmsNNnzI-eG7PvMm2ULo34Ykyi3YzNagJ6HjQ8Pjyis7n8vAtitGJIMMUgXjcbCBdby85vos7XoJwRLSlmwmU1SbOAHu0wCUKmCd-N6DNz0dO9c2sTfGvcbKXJA4_-7U4yKGFg4nKkc6pApa2ejjgKiarDmPhypAhW4ZuVL4nOphbpibkGym08O4gfE53rTxy-pVQO_l2RtfOIYIKsPtIEsdCm-eAlDy5GfL2i16KSiaDOp7gmJRJk6jI_zGePly9i9lu55iwkf2hLVn2BrRPyIm6GrcgacfZkq8OrhyuyPUv-aVvGOYJnLtczrTpb5FJseMcyuO6VC4pc-FCptYhmH9AWc7l9IFk2XXJ4CenBb4zRDSo'
      ///api/external_service/api/v1/pre_document?tax_id=
      // //api/petty_cash/api/v1/get_hc_email
      // const apiUrl = `${process.env.NEXT_PUBLIC_DW_API_URL}api/external_service/api/v1/pre_document?tax_id=`;
      // const apiUrl = `${process.env.NEXT_PUBLIC_DEV_API_URL}api/petty_cash/api/v1/get_hc_email`;
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/search_citizen`;
      const request = await axios.post(apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${getTokenLogin()}`,
        },
      });
      const response = await request.data;
      
      return response;
    } catch (error) {
      // console.error("Failed to load response data:", error);
      // เพิ่มการตรวจสอบ error ที่ละเอียดขึ้นด้านล่าง
      // if (axios.isAxiosError(error)) {
      //   console.error("Axios error details:");
      //   console.error("Status:", error.response?.status);
      //   console.error("Data:", error.response?.data);
      //   console.error("Headers:", error.response?.headers);
      //   console.error("Config:", error.config);
      // } else {
      //   console.error("Non-Axios error:", error);
      // }
      // คุณอาจจะ throw error ต่อ หรือ return ค่า default/null ตามความเหมาะสม
      throw error; // หรือ return null;
    }
  }
);

// New API function for searching citizen by email
export const citizenSearchByEmail = createAsyncThunk(
  "citizenSearchByEmail",
  async (email: string) => {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/";
      const apiUrl = `${
        baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"
      }/users/search_citizen?email=${encodeURIComponent(email)}`;

      const request = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${getTokenLogin()}`,
        },
      });

      // Check if API returned status: false (Not Found)
      if (request.data.status === false) {
        return [];
      }

      // Transform response to match CitizenSchema format with safe property access
      const response = request.data.data?.map((item: any) => {
        // Handle the new API response format
        const emails = item?.email || [];
        
        // Find the specific email that matches the search query
        const matchingEmail = emails.find((emailObj: any) => 
          emailObj?.email?.toLowerCase() === email.toLowerCase()
        );
        
        // If no matching email found, use the first email (fallback)
        const targetEmail = matchingEmail || emails?.[0] || {};
        
        return {
          id: item?.account_id || null, // Use account_id as id
          first_name_th: item?.first_name_th || "",
          last_name_th: item?.last_name_th || "",
          email: targetEmail?.email || "",
          department: "", // Department not available in new API response
        };
      }) || [];
      
      return response;
    } catch (error) {
      // console.error("Failed to search citizen by email:", error);
      if (axios.isAxiosError(error)) {
        // console.error("Axios error details:", {
        //   status: error.response?.status,
        //   data: error.response?.data,
        //   config: {
        //     url: error.config?.url,
        //     method: error.config?.method,
        //     headers: error.config?.headers,
        //   },
        // });
        
        // If it's a 404 error, return empty array to indicate "new email"
        if (error.response?.status === 404) {
          return [];
        }
      }
      throw error;
    }
  }
);
export const citizenData = createSlice({
  name: "citizenData",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder

      .addCase(citizenGetAll.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        citizenGetAll.fulfilled,
        (state, action: PayloadAction<CitizenSchema[]>) => {
          state.loading = "succeeded";
          state.error = null;
          state.data = action.payload;
        }
      )
      .addCase(citizenGetAll.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message;
        state.data = [];
      })

      .addCase(citizenSearch.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        citizenSearch.fulfilled,
        (state, action: PayloadAction<CitizenSchema[]>) => {
          state.loading = "succeeded";
          state.error = null;
          state.data = action.payload;
        }
      )
      .addCase(citizenSearch.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message;
        state.data = [];
      })
      
      .addCase(citizenSearchByEmail.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        citizenSearchByEmail.fulfilled,
        (state, action: PayloadAction<CitizenSchema[]>) => {
          state.loading = "succeeded";
          state.error = null;
          state.data = action.payload;
        }
      )
      .addCase(citizenSearchByEmail.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message;
        state.data = [];
      });
  },
});

export default citizenData.reducer;
