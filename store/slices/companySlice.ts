import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CompanyData {
  business_id: string;
  business_name_th: string;
  business_name_eng: string;
  tax_id: string;
  trust_level: string;
  ca_status: string;
  logo_url?: string;
}

interface CompanyState {
  data: CompanyData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: CompanyState = {
  data: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setCompanyLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCompanyData: (state, action: PayloadAction<CompanyData>) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
      state.lastUpdated = Date.now();
    },
    setCompanyError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearCompanyData: (state) => {
      state.data = null;
      state.error = null;
      state.lastUpdated = null;
    },
  },
});

export const { setCompanyLoading, setCompanyData, setCompanyError, clearCompanyData } = companySlice.actions;
export default companySlice.reducer;
