"use client"

import { changPageNumber } from "@/store/mockData/mockPDFData";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: changPageNumber = {
  pageNum: 1,
};

const changPageNumberSlice = createSlice({
  name: "pdfPage",
  initialState,
  reducers: {
    updatePage: (state, action: PayloadAction<Partial<changPageNumber>>) => {
      
      state.pageNum = action.payload.pageNum || 1;
      // return { ...state, ...action.payload };
    },
    nextStep: (state) => {
      state.pageNum += 1;
    },
    previousStep: (state) => {
      state.pageNum -= 1;
    },
  },
});

export const { updatePage, nextStep, previousStep } = changPageNumberSlice.actions;
export default changPageNumberSlice.reducer;
