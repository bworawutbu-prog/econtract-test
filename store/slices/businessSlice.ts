import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BusinessState {
  selectedBusinessId: string | null;
  selectedBusinessName: string | null;
  businessList: any[];
}

const initialState: BusinessState = {
  selectedBusinessId: null,
  selectedBusinessName: null,
  businessList: [],
};

const businessSlice = createSlice({
  name: "business",
  initialState,
  reducers: {
    setSelectedBusiness: (state, action: PayloadAction<{ businessId: string | null; businessName: string | null }>) => {
      state.selectedBusinessId = action.payload.businessId;
      state.selectedBusinessName = action.payload.businessName;
    },
    setBusinessList: (state, action: PayloadAction<any[]>) => {
      state.businessList = action.payload;
    },
    clearSelectedBusiness: (state) => {
      state.selectedBusinessId = null;
      state.selectedBusinessName = null;
    },
  },
});

export const { setSelectedBusiness, setBusinessList, clearSelectedBusiness } = businessSlice.actions;
export default businessSlice.reducer;
