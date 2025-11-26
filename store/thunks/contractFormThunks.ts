import { createAsyncThunk } from '@reduxjs/toolkit';
import { ContractFormAPI, transformFormStateToAPI, validateFormData } from '../estampStore/contractFormAPI';
import { ContractFormState } from '../types/contractFormType';
import { setLoading, setError, setFormData } from '../slices/contractFormSlice';

// Submit contract form
export const submitContractForm = createAsyncThunk(
  'contractForm/submit',
  async (formState: ContractFormState, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      // Validate form data
      const validation = validateFormData(formState);
      if (!validation.isValid) {
        dispatch(setError(validation.errors.join(', ')));
        return {
          success: false,
          message: validation.errors.join(', '),
        };
      }

      // Transform form state to API format
      const apiData = transformFormStateToAPI(formState);

      // Submit to API
      const response = await ContractFormAPI.submitContractForm(apiData);

      if (response.success) {
        dispatch(setError(null));
      } else {
        dispatch(setError(response.message));
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch(setError(errorMessage));
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Get contract form by ID
export const getContractForm = createAsyncThunk(
  'contractForm/getById',
  async (id: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await ContractFormAPI.getContractForm(id);

      if (response.success && response.data) {
        // Transform API data back to form state
        const formState = transformAPIToFormState(response.data);
        dispatch(setFormData(formState));
        dispatch(setError(null));
      } else {
        dispatch(setError(response.message));
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch(setError(errorMessage));
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Update contract form
export const updateContractForm = createAsyncThunk(
  'contractForm/update',
  async ({ id, formState }: { id: string; formState: ContractFormState }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      // Validate form data
      const validation = validateFormData(formState);
      if (!validation.isValid) {
        dispatch(setError(validation.errors.join(', ')));
        return {
          success: false,
          message: validation.errors.join(', '),
        };
      }

      // Transform form state to API format
      const apiData = transformFormStateToAPI(formState);

      // Update via API
      const response = await ContractFormAPI.updateContractForm(id, apiData);

      if (response.success) {
        dispatch(setError(null));
      } else {
        dispatch(setError(response.message));
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch(setError(errorMessage));
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Delete contract form
export const deleteContractForm = createAsyncThunk(
  'contractForm/delete',
  async (id: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await ContractFormAPI.deleteContractForm(id);

      if (response.success) {
        dispatch(setError(null));
      } else {
        dispatch(setError(response.message));
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch(setError(errorMessage));
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Get contract forms list
export const getContractFormsList = createAsyncThunk(
  'contractForm/getList',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await ContractFormAPI.getContractFormsList();

      if (response.success) {
        dispatch(setError(null));
      } else {
        dispatch(setError(response.message));
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch(setError(errorMessage));
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Transform API data back to form state
const transformAPIToFormState = (apiData: any): Partial<ContractFormState> => {
  if (!apiData.form || !apiData.form[0] || !apiData.form[0].instInfo || !apiData.form[0].instInfo[0]) {
    return {};
  }

  const instInfo = apiData.form[0].instInfo[0];
  const party = instInfo.party;
  const address = party.postalTradeAddress;
  const attachDetail = instInfo.attachDetail?.arrayDetail?.[0];

  return {
    // Document Details
    documentTypeCode: apiData.form[0].documentDetail?.typeCode || "1",

    // Contract Information
    contractId: instInfo.id || "",
    contractNo: instInfo.contractNo || "",
    creationDate: instInfo.creationDate || "",
    effectiveDate: instInfo.effectiveDate || "",
    expireDate: instInfo.expireDate || "",
    expireDateText: instInfo.expireDateText || "",
    receiveDate: instInfo.receiveDate || "",
    sendFormType: instInfo.sendFormType || "1",
    filingNo: instInfo.filingNo || 1,
    dupNumber: instInfo.dupNumber || 1,
    instAmount: instInfo.instAmount || 0,

    // Party Information
    partyTitleName: party?.titleName || "",
    partyName: party?.name || "",
    partySurname: party?.surname || "",
    partyBranchNo: party?.branchNo || "0",
    partyBranchType: party?.branchType || "",
    partyForeignType: party?.foreignType || 0,

    // Address Information
    buildingName: address?.buildingName || "",
    roomNo: address?.roomNo || "",
    floorNo: address?.floorNo || "",
    villageName: address?.villageName || "",
    buildingNumber: address?.buildingNumber || "",
    moo: address?.moo || "",
    soiName: address?.soiName || "",
    junctionName: address?.junctionName || "",
    streetName: address?.streetName || "",
    citySubDivisionName: address?.citySubDivisionName || "",
    cityName: address?.cityName || "",
    countrySubDivisionName: address?.countrySubDivisionName || "",
    postCode: address?.postCode || "",
    countryId: address?.countryId || "TH",

    // Tax Registration
    taxRegistrationId: party?.specifiedTaxRegistration?.id || "",

    // Property Details
    propertyType: attachDetail?.attType || "",
    propertyTypeOther: attachDetail?.attDetail5 || "",
    propertyAddress: {
      buildingNumber: attachDetail?.attDetail1 || "",
      citySubDivisionName: attachDetail?.attDetail2 || "",
      cityName: attachDetail?.attDetail3 || "",
      countrySubDivisionName: attachDetail?.attDetail4 || "",
    },

    // Rental Details
    monthlyRent: attachDetail?.attAmount1 || 0,
    keyMoney: attachDetail?.attAmount2 || 0,
    totalAmount: attachDetail?.attAmount3 || 0,
    rentalMonths: attachDetail?.attNumber1 || 0,
  };
}; 