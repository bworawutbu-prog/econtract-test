"use client";

import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getTokenLogin } from "../token";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ContractFormState,
  initialContractFormState,
  ContractFormData,
} from "../types/contractFormType";
import { ContractForm } from "../types/contractFormType";
import appEmitter from "../libs/eventEmitter";
import { enqueueSnackbar } from "notistack";
import { documentTypeOptions } from "../types/estampTypes";

let eStampForm: ContractForm | null = null;

// Event listener for eStampForm
appEmitter.on("eStampForm", (payload: any) => {
  eStampForm = payload.payload;
});

let payerName: string = "";
let payerType: string = "";
let payerEmail: string = "";
let payerIdCard: string = "";

appEmitter.on("payerDetail", (payload: { payerName: string; payerType: string; payerEmail: string; payerIdCard: string } | undefined) => {
  if (payload) {
    payerName = payload.payerName;
    payerType = payload.payerType;
    payerEmail = payload.payerEmail;
    payerIdCard = payload.payerIdCard;
  }
});

interface ContractFormResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export const contractForm = async (
  e_stamp: string,
  payload?: ContractForm
): Promise<ContractFormResponse> => {
  try {
    // Create the submission data
    const name = documentTypeOptions.find((item) => item.value == eStampForm?.documentDetail?.typeCode)?.label;
    const submitData: any = {
      eform_id: "689a05fb884a57ecba1ebe34",
      name: name,
      eform_data: payload || eStampForm,
      transaction_id: e_stamp,
      type_code: eStampForm?.documentDetail?.typeCode,
      payer_name: payerName,
      payer: payerType,
      email: payerEmail,
      id_card: payerIdCard,
    };

    // Make the API request
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/e-stamp/transaction${process.env.NEXT_PUBLIC_API_URL?.includes("/api/v2") ? "?business_id=175128061064325" : ""}`,
      submitData,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${getTokenLogin()}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      message: "Form created successfully",
      data: response.data,
    };
  } catch (error: unknown) {
    enqueueSnackbar(`Error creating form submission: ${error}`, {
      variant: "error",
    });

    // Add more detailed error logging
    if (axios.isAxiosError(error)) {
      enqueueSnackbar(`Axios error details: ${error}`, {
        variant: "error",
      });
    } else {
      enqueueSnackbar(`Non-Axios error: ${error}`, {
        variant: "error",
      });
    }

    const errorObj = error as {
      response?: { data?: { message?: string; error?: string } };
    };

    return {
      success: false,
      message: errorObj.response?.data?.message || "Failed to create form",
      error: errorObj.response?.data?.error || "API_ERROR",
    };
  }
};

const contractFormSlice = createSlice({
  name: "contractForm",
  initialState: initialContractFormState,
  reducers: {
    // Document Details
    setDocumentTypeCode: (state, action: PayloadAction<string>) => {
      state.documentTypeCode = action.payload;
    },

    // Contract Information
    setContractId: (state, action: PayloadAction<string>) => {
      state.contractId = action.payload;
    },
    setContractNo: (state, action: PayloadAction<string>) => {
      state.contractNo = action.payload;
    },
    setCreationDate: (state, action: PayloadAction<string>) => {
      state.creationDate = action.payload;
    },
    setEffectiveDate: (state, action: PayloadAction<string>) => {
      state.effectiveDate = action.payload;
    },
    setExpireDate: (state, action: PayloadAction<string>) => {
      state.expireDate = action.payload;
    },
    setExpireDateText: (state, action: PayloadAction<string>) => {
      state.expireDateText = action.payload;
    },
    setReceiveDate: (state, action: PayloadAction<string>) => {
      state.receiveDate = action.payload;
    },
    setSendFormType: (state, action: PayloadAction<string>) => {
      state.sendFormType = action.payload;
    },
    setFilingNo: (state, action: PayloadAction<number>) => {
      state.filingNo = action.payload;
    },
    setDupNumber: (state, action: PayloadAction<number>) => {
      state.dupNumber = action.payload;
    },
    setInstAmount: (state, action: PayloadAction<number>) => {
      state.instAmount = action.payload;
    },
    setPartyRelationship: (state, action: PayloadAction<string>) => {
      state.partyRelationship = action.payload;
    },
    // Party Information
    setPartyTitleName: (state, action: PayloadAction<string>) => {
      state.partyTitleName = action.payload;
    },
    setPartyName: (state, action: PayloadAction<string>) => {
      state.partyName = action.payload;
    },
    setPartySurname: (state, action: PayloadAction<string>) => {
      state.partySurname = action.payload;
    },
    setPartyBranchNo: (state, action: PayloadAction<string>) => {
      state.partyBranchNo = action.payload;
    },
    setPartyBranchType: (state, action: PayloadAction<string>) => {
      state.partyBranchType = action.payload;
    },
    setPartyForeignType: (state, action: PayloadAction<number>) => {
      state.partyForeignType = action.payload;
    },

    // Address Information
    setBuildingName: (state, action: PayloadAction<string>) => {
      state.buildingName = action.payload;
    },
    setRoomNo: (state, action: PayloadAction<string>) => {
      state.roomNo = action.payload;
    },
    setFloorNo: (state, action: PayloadAction<string>) => {
      state.floorNo = action.payload;
    },
    setVillageName: (state, action: PayloadAction<string>) => {
      state.villageName = action.payload;
    },
    setBuildingNumber: (state, action: PayloadAction<string>) => {
      state.buildingNumber = action.payload;
    },
    setMoo: (state, action: PayloadAction<string>) => {
      state.moo = action.payload;
    },
    setSoiName: (state, action: PayloadAction<string>) => {
      state.soiName = action.payload;
    },
    setJunctionName: (state, action: PayloadAction<string>) => {
      state.junctionName = action.payload;
    },
    setStreetName: (state, action: PayloadAction<string>) => {
      state.streetName = action.payload;
    },
    setCitySubDivisionName: (state, action: PayloadAction<string>) => {
      state.citySubDivisionName = action.payload;
    },
    setCityName: (state, action: PayloadAction<string>) => {
      state.cityName = action.payload;
    },
    setCountrySubDivisionName: (state, action: PayloadAction<string>) => {
      state.countrySubDivisionName = action.payload;
    },
    setPostCode: (state, action: PayloadAction<string>) => {
      state.postCode = action.payload;
    },
    setCountryId: (state, action: PayloadAction<string>) => {
      state.countryId = action.payload;
    },

    // Tax Registration
    setTaxRegistrationId: (state, action: PayloadAction<string>) => {
      state.taxRegistrationId = action.payload;
    },

    // Property Details
    setPropertyType: (state, action: PayloadAction<string>) => {
      state.propertyType = action.payload;
    },
    setPropertyTypeOther: (state, action: PayloadAction<string>) => {
      state.propertyTypeOther = action.payload;
    },
    setPropertyAddress: (
      state,
      action: PayloadAction<{
        buildingNumber: string;
        citySubDivisionName: string;
        cityName: string;
        countrySubDivisionName: string;
      }>
    ) => {
      state.propertyAddress = action.payload;
    },

    // Rental Details
    setMonthlyRent: (state, action: PayloadAction<number>) => {
      state.monthlyRent = action.payload;
      // คำนวณ totalAmount อัตโนมัติ
      state.totalAmount =
        state.monthlyRent * state.rentalMonths + state.keyMoney;
    },
    setKeyMoney: (state, action: PayloadAction<number>) => {
      state.keyMoney = action.payload;
      // คำนวณ totalAmount อัตโนมัติ
      state.totalAmount =
        state.monthlyRent * state.rentalMonths + state.keyMoney;
    },
    setTotalAmount: (state, action: PayloadAction<number>) => {
      state.totalAmount = action.payload;
    },
    setRentalMonths: (state, action: PayloadAction<number>) => {
      state.rentalMonths = action.payload;
      // คำนวณ totalAmount อัตโนมัติ
      state.totalAmount =
        state.monthlyRent * state.rentalMonths + state.keyMoney;
    },

    // Loading and Error States
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Reset Form
    resetForm: (state) => {
      return { ...initialContractFormState };
    },

    // Set Form Data from API Response
    setFormData: (state, action: PayloadAction<Partial<ContractFormState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const {
  // Document Details
  setDocumentTypeCode,

  // Contract Information
  setContractId,
  setContractNo,
  setCreationDate,
  setEffectiveDate,
  setExpireDate,
  setExpireDateText,
  setReceiveDate,
  setSendFormType,
  setFilingNo,
  setDupNumber,
  setInstAmount,
  setPartyRelationship,

  // Party Information
  setPartyTitleName,
  setPartyName,
  setPartySurname,
  setPartyBranchNo,
  setPartyBranchType,
  setPartyForeignType,

  // Address Information
  setBuildingName,
  setRoomNo,
  setFloorNo,
  setVillageName,
  setBuildingNumber,
  setMoo,
  setSoiName,
  setJunctionName,
  setStreetName,
  setCitySubDivisionName,
  setCityName,
  setCountrySubDivisionName,
  setPostCode,
  setCountryId,

  // Tax Registration
  setTaxRegistrationId,

  // Property Details
  setPropertyType,
  setPropertyTypeOther,
  setPropertyAddress,

  // Rental Details
  setMonthlyRent,
  setKeyMoney,
  setTotalAmount,
  setRentalMonths,

  // Loading and Error States
  setLoading,
  setError,

  // Reset Form
  resetForm,
  setFormData,
} = contractFormSlice.actions;

export default contractFormSlice.reducer;
