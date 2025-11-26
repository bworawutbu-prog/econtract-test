"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ApiResponse, FormSubmitData, WorkflowStep } from '../types/mappingTypes'
import { getTokenLogin } from "../token"
import axios from "axios"
import { PageFormItems } from "@/components/mappingComponents/FormUtils/pdfFormManager";
import { OperatorDetail } from "../types/contractB2BType";
const https = require('https');
const agent = new https.Agent({
  rejectUnauthorized: false
});

interface mappingCreate {
    data: FormSubmitData[];
    loading: 'idle' | 'pending' | 'succeeded' | 'failed'; // สถานะการโหลด
    error: string | null | undefined; // สำหรับเก็บข้อความ error
  }
const initialState: mappingCreate = {
    data: [],
    loading: 'idle' ,
    error: "",
  };
  
export const mappingCreates = createAsyncThunk(
  'listTransaction',
  async (
    args: {
      workspaceId: string,
      folderId: string,
      pdfFile: string,
      pdfName: string,
      taxId: string,
      isDraft: boolean,
      isEnabled: boolean,
      pageFormItems: PageFormItems,
      operator?: OperatorDetail,
      flowData?: WorkflowStep[],
      workflowId?: string,
      formId?: string,
      startEnabled?: string,
      endEnabled?: string,
      typeDocNo?: string,
      typeCode?: string
    }
  ) => {
    const {
      workspaceId,
      folderId,
      pdfFile,
      pdfName,
      taxId,
      isDraft,
      isEnabled,
      pageFormItems,
      operator,
      flowData = [],
      workflowId = "",
      formId = "",
      startEnabled = "",
      endEnabled = "",
      typeCode = "1"
    } = args;

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/form/create_form`;
      const payload = {
        workspaceId,
        folderId,
        pdfFile,
        pdfName,
        taxId,
        isDraft,
        isEnabled,
        pageFormItems,
        operator,
        flowData,
        workflowId,
        formId,
        startEnabled,
        endEnabled,
        typeCode,
      }

      const request = await axios.post(apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${getTokenLogin()}`
        }
      });

      const response = request.data;
      
      return response;

    } catch (error) {
      console.error('❌ [mappingCreates] Failed to load response data:', error);

      if (axios.isAxiosError(error)) {
        console.error('⚠️ [Axios Error]');
        console.error('🔢 Status:', error.response?.status);
        console.error('📦 Data:', error.response?.data);
        console.error('📨 Headers:', error.response?.headers);
        console.error('🛠️ Config:', error.config);
      } else {
        console.error('🧨 [Non-Axios Error]', error);
      }

      throw error;
    }
  }
);

export const mappingCreateItem = createAsyncThunk(
  'transactionPage',
  async (payload: any) => {
    

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/form/create_form_data`;
      

      const request = await axios.post(apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${getTokenLogin()}`
        }
      });

      const response = request.data;
      
      return response;

    } catch (error) {
      console.error('❌ [mappingCreateItem] Failed to load response data:', error);

      if (axios.isAxiosError(error)) {
        console.error('⚠️ [Axios Error]');
        console.error('🔢 Status:', error.response?.status);
        console.error('📦 Data:', error.response?.data);
        console.error('📨 Headers:', error.response?.headers);
        console.error('🛠️ Config:', error.config);
      } else {
        console.error('🧨 [Non-Axios Error]', error);
      }

      throw error;
    }
  }
);

export const mappingCreateData = createSlice({
    name: 'uselistTransaction',
    initialState,
    reducers: {},
    extraReducers(builder){
        builder

        .addCase(mappingCreates.pending,(state) => {
            state.loading = 'pending';
            state.error = null;
        })
        .addCase(mappingCreates.fulfilled,(state, action: PayloadAction<FormSubmitData[]>) => {
            state.loading = 'succeeded'
            state.error= null
            state.data = action.payload
        })
        .addCase(mappingCreates.rejected,(state, action) => {
            state.loading = 'failed';
            state.error = action.error.message;
            state.data = []
        })

        .addCase(mappingCreateItem.pending,(state) => {
            state.loading = 'pending';
            state.error = null;
        })
        .addCase(mappingCreateItem.fulfilled,(state, action: PayloadAction<FormSubmitData[]>) => {
            state.loading = 'succeeded'
            state.error= null
            state.data = action.payload
        })
        .addCase(mappingCreateItem.rejected,(state, action) => {
            state.loading = 'failed';
            state.error = action.error.message;
            state.data = []
        })
    }
})

export default mappingCreateData.reducer