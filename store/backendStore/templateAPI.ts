import { createAsyncThunk } from "@reduxjs/toolkit";
import { getTokenLogin } from "../token";
import axios, { AxiosError } from "axios";
import { clearAllUserSession } from "../utils/localStorage";
import {
  MappingTextItem,
  MappingDateTimeItem,
  MappingSignatureItem,
  MappingRadioboxItem,
  MappingCheckboxItem,
  MappingStampItem,
  MappingDocNoItem,
  MappingFileItem,
  MappingESealItem,
} from "../types/mappingTypes";
import { OperatorDetail } from "../types/contractB2BType";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface EstampPayer {
  type?: string;
  name?: string;
  email?: string;
}

export interface FlowDataEntity {
  name?: string;
  id_card?: string;
  email?: string;
  id?: string;
  nationality?: string;
}

export interface TemplateFlowData {
  index: number; // Y
  section: string; // Y
  action: string; // Y
  validate_type?: string; // N
  validate_data?: string; // N
  selfie_video?: boolean; // N
  script_video?: string; // N
  type_entity: string; // Y
  co_contract: string; // Y
  entity?: FlowDataEntity[]; // N
}

export interface CreateTemplatePayload {
  // Required fields
  pdf_name: string; // Y
  pdf_base64: string; // Y
  contract_type: string; // Y
  doc_type_id: string; // Y
  estamp_payment: string; // Y
  flow_data: TemplateFlowData[]; // Y

  // Optional fields
  estamp_payer?: EstampPayer; // N
  co_tax_id?: string; // N
  operator?: {
    name?: string; // N
    email?: string; // N
  }; // N

  // Mapping arrays (all optional, default to empty arrays)
  mapping_text?: MappingTextItem[];
  mapping_checkbox?: MappingCheckboxItem[];
  mapping_date_time?: MappingDateTimeItem[];
  mapping_signature?: MappingSignatureItem[];
  mapping_radiobox?: MappingRadioboxItem[];
  mapping_stamp?: MappingStampItem[];
  mapping_doc_no?: MappingDocNoItem[];
  mapping_more_file?: MappingFileItem[];
  mapping_eseal?: MappingESealItem[];
}

export interface CreateTemplateResponse {
  status: boolean;
  message?: string;
  data?: {
    _id?: string;
    pdf_name?: string;
    doc_type_id?: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: any;
  };
  error?: string;
}

export interface TemplateFormItem {
  id: string;
  document_no: string;
  name: string;
  version: string;
  is_enable: boolean;
}

export interface GetTemplateFormsResponse {
  status: boolean;
  message?: string;
  data?: TemplateFormItem[];
  count?: number;
  total?: number;
  error?: string;
}

// =============================================================================
// GET TEMPLATE FORM BY ID TYPES
// =============================================================================

export interface TemplateFormFile {
  pdf_name?: string;
  pdf_base64?: string;
}

export interface TemplateFormContract {
  type?: string;
  section?: string;
  document_type_id?: string;
  expiry?: {
    start_date?: string;
    end_date?: string;
  };
}

export interface TemplateFormEstamp {
  chanel?: string;
  payer?: {
    type?: string;
    name?: string;
    email?: string;
  };
}

export interface TemplateFormCoContract {
  tax_id?: string;
  operator?: {
    name?: string;
    email?: string;
  };
}

export interface TemplateFormMappingSignature {
  index?: number;
  step_index?: number;
  llx?: string;
  lly?: string;
  urx?: string;
  ury?: string;
  left?: string;
  top?: string;
  scale_X?: string;
  scale_Y?: string;
  width?: string;
  height?: string;
  text?: string;
  required?: string;
  pageNumber?: number;
  font_family?: string;
  font_size?: number;
  font_weight?: string;
  font_style?: string;
  text_align?: string;
  text_decoration?: string;
  justify_content?: string;
  underline?: boolean;
  fill?: string;
  background_color?: string;
  border_color?: string;
  border_width?: string;
  border_style?: string;
  border_radius?: string;
  padding?: string;
  margin?: string;
  signatureType?: string;
  value?: string;
  actorId?: string;
}

export interface TemplateFormMapping {
  text?: MappingTextItem[];
  signature?: TemplateFormMappingSignature[];
  date_time?: MappingDateTimeItem[];
  radiobox?: MappingRadioboxItem[];
  doc_no?: MappingDocNoItem[];
  more_file?: MappingFileItem[];
  eseal?: MappingESealItem[];
  checkbox?: MappingCheckboxItem[];
}

export interface GetTemplateFormByIdResponse {
  status: boolean;
  message?: string;
  data?: {
    file?: TemplateFormFile;
    contract?: TemplateFormContract;
    estamp?: TemplateFormEstamp;
    co_contract?: TemplateFormCoContract;
    flow_data?: TemplateFlowData[];
    mapping?: TemplateFormMapping;
  };
  error?: string;
}

export interface ApiResponse{
  status: boolean;
  message?: string;
  data?: null
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Creates a new template by uploading PDF and configuration
 * POST /templates
 */
export const createTemplate = createAsyncThunk(
  "createTemplate",
  async (payload: CreateTemplatePayload, { rejectWithValue, getState }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = getTokenLogin();

    if (!token) {
      clearAllUserSession();
      return rejectWithValue("No authentication token found");
    }

    // Get business_id from Redux state (if needed)
    const state = getState() as any;
    const businessId = state.business?.selectedBusinessId;

    try {
      // Build URL
      let url = `${baseUrl}/templates`;
      if (businessId) {
        url += `?business_id=${businessId}`;
      }

      // Prepare payload with default empty arrays for mapping fields
      const requestPayload: CreateTemplatePayload = {
        // ...payload,
        co_tax_id: payload.co_tax_id || "",
        operator: {
          name: payload.operator?.name || "",
          email: payload.operator?.email || "",
        },
        pdf_base64: payload.pdf_base64 || "",
        pdf_name: payload.pdf_name || "",
        contract_type: payload.contract_type || "b2b",
        doc_type_id: payload.doc_type_id || "",
        estamp_payment: payload.estamp_payment || "non_payment",
        flow_data: payload.flow_data.length > 0 
          ? payload.flow_data.map((flowItem) => ({
              ...flowItem,
              entity: flowItem.entity && flowItem.entity.length > 0 
                ? flowItem.entity 
                : [
                    {
                      id: "",
                      name: "",
                      email: "",
                      nationality: "",
                      id_card: "",
                    },
                  ],
            }))
          : [
              {
                index: 0,
                section: "9",
                action: "approver",
                validate_type: "",
                validate_data: "",
                selfie_video: false,
                script_video: "",
                type_entity: "sender",
                co_contract: "internal",
                entity: [
                  {
                    id: "",
                    name: "",
                    email: "",
                    nationality: "",
                    id_card: "",
                  },
                ],
              },
            ],
        mapping_text: payload.mapping_text || [],
        mapping_checkbox: payload.mapping_checkbox || [],
        mapping_date_time: payload.mapping_date_time || [],
        mapping_signature: payload.mapping_signature || [],
        mapping_radiobox: payload.mapping_radiobox || [],
        mapping_stamp: payload.mapping_stamp || [],
        mapping_doc_no: payload.mapping_doc_no || [],
        mapping_more_file: payload.mapping_more_file || [],
        mapping_eseal: payload.mapping_eseal || [],
      };

      const response = await axios.post<CreateTemplateResponse>(
        url,
        requestPayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        // Handle specific error cases
        if (error.response?.status === 400) {
          return rejectWithValue({
            status: 400,
            message: error.response?.data?.message || "Invalid request payload",
            error: error.response?.data,
          });
        }
        if (error.response?.status === 401) {
          clearAllUserSession();
          return rejectWithValue({
            status: 401,
            message: "Unauthorized - Please login again",
          });
        }
        if (error.response?.status === 409) {
          return rejectWithValue({
            status: 409,
            message: error.response?.data?.message || "Template already exists",
          });
        }
        if (error.response?.status === 422) {
          return rejectWithValue({
            status: 422,
            message:
              error.response?.data?.message ||
              "Validation error - Please check required fields",
            error: error.response?.data,
          });
        }

        // Return error response if available
        return rejectWithValue({
          status: error.response?.status || 500,
          message: error.response?.data?.message || "Unknown error occurred",
          error: error.response?.data,
        });
      }

      console.error("Error creating template:", error);
      return rejectWithValue({
        status: 500,
        message: "Failed to create template",
        error: error,
      });
    }
  }
);

/**
 * Gets template forms by template ID
 * GET /templates/:id/form
 */
export const getTemplateForms = createAsyncThunk(
  "getTemplateForms",
  async (templateId: string, { rejectWithValue, getState }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = getTokenLogin();

    if (!token) {
      clearAllUserSession();
      return rejectWithValue("No authentication token found");
    }

    // Get business_id from Redux state (if needed)
    const state = getState() as any;
    const businessId = state.business?.selectedBusinessId;

    try {
      // Build URL
      let url = `${baseUrl}/templates/${templateId}/form`;
      if (businessId) {
        url += `?business_id=${businessId}`;
      }

      const response = await axios.get<GetTemplateFormsResponse>(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        // Handle specific error cases
        if (error.response?.status === 400) {
          return rejectWithValue({
            status: 400,
            message: error.response?.data?.message || "Invalid request",
            error: error.response?.data,
          });
        }
        if (error.response?.status === 401) {
          clearAllUserSession();
          return rejectWithValue({
            status: 401,
            message: "Unauthorized - Please login again",
          });
        }
        if (error.response?.status === 404) {
          return rejectWithValue({
            status: 404,
            message: error.response?.data?.message || "Template not found",
            error: error.response?.data,
          });
        }

        // Return error response if available
        return rejectWithValue({
          status: error.response?.status || 500,
          message: error.response?.data?.message || "Unknown error occurred",
          error: error.response?.data,
        });
      }

      console.error("Error getting template forms:", error);
      return rejectWithValue({
        status: 500,
        message: "Failed to get template forms",
        error: error,
      });
    }
  }
);

/**
 * Gets template form details by form ID (includes PDF and mapping data)
 * GET /templates/form/:id
 */
export const getTemplateFormById = createAsyncThunk(
  "getTemplateFormById",
  async (formId: string, { rejectWithValue, getState }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = getTokenLogin();

    if (!token) {
      clearAllUserSession();
      return rejectWithValue("No authentication token found");
    }

    // Get business_id from Redux state (if needed)
    const state = getState() as any;
    const businessId = state.business?.selectedBusinessId;

    try {
      // Build URL
      let url = `${baseUrl}/templates/form/${formId}`;
      if (businessId) {
        url += `?business_id=${businessId}`;
      }

      const response = await axios.get<GetTemplateFormByIdResponse>(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        // Handle specific error cases
        if (error.response?.status === 400) {
          return rejectWithValue({
            status: 400,
            message: error.response?.data?.message || "Invalid request",
            error: error.response?.data,
          });
        }
        if (error.response?.status === 401) {
          clearAllUserSession();
          return rejectWithValue({
            status: 401,
            message: "Unauthorized - Please login again",
          });
        }
        if (error.response?.status === 404) {
          return rejectWithValue({
            status: 404,
            message: error.response?.data?.message || "Template form not found",
            error: error.response?.data,
          });
        }

        // Return error response if available
        return rejectWithValue({
          status: error.response?.status || 500,
          message: error.response?.data?.message || "Unknown error occurred",
          error: error.response?.data,
        });
      }

      console.error("Error getting template form by ID:", error);
      return rejectWithValue({
        status: 500,
        message: "Failed to get template form",
        error: error,
      });
    }
  }
);

export const deleteTemplateFromId = createAsyncThunk(
  "deleteTemplateFromId",
  async (formId: string,  { rejectWithValue, getState }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = getTokenLogin();

    if (!token) {
      clearAllUserSession();
      return rejectWithValue("No authentication token found");
    }


    try {
      // Build URL
      let url = `${baseUrl}/templates/form/${formId}?business_id=175128061064325`;

      const response = await axios.delete<ApiResponse>(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        // Handle specific error cases
        if (error.response?.status === 400) {
          return rejectWithValue({
            status: 400,
            message: error.response?.data?.message || "Invalid request",
            error: error.response?.data,
          });
        }
        if (error.response?.status === 401) {
          clearAllUserSession();
          return rejectWithValue({
            status: 401,
            message: "Unauthorized - Please login again",
          });
        }
        if (error.response?.status === 404) {
          return rejectWithValue({
            status: 404,
            message: error.response?.data?.message || "Template form not found",
            error: error.response?.data,
          });
        }

        // Return error response if available
        return rejectWithValue({
          status: error.response?.status || 500,
          message: error.response?.data?.message || "Unknown error occurred",
          error: error.response?.data,
        });
      }

      console.error("Error getting template form by ID:", error);
      return rejectWithValue({
        status: 500,
        message: "Failed to get template form",
        error: error,
      });
    }
  }
);

export const updateStatusTemplate = createAsyncThunk(
  "updateStatusTemplate",
  async ({formId, status}:{formId: string, status: boolean}, { rejectWithValue, getState }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = getTokenLogin();

    if (!token) {
      clearAllUserSession();
      return rejectWithValue("No authentication token found");
    }


    try {
      // Build URL
      let url = `${baseUrl}/templates/form/${formId}?business_id=175128061064325`;

      const response = await axios.put<ApiResponse>(url,{is_enable:status}, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        // Handle specific error cases
        if (error.response?.status === 400) {
          return rejectWithValue({
            status: 400,
            message: error.response?.data?.message || "Invalid request",
            error: error.response?.data,
          });
        }
        if (error.response?.status === 401) {
          clearAllUserSession();
          return rejectWithValue({
            status: 401,
            message: "Unauthorized - Please login again",
          });
        }
        if (error.response?.status === 404) {
          return rejectWithValue({
            status: 404,
            message: error.response?.data?.message || "Template form not found",
            error: error.response?.data,
          });
        }

        // Return error response if available
        return rejectWithValue({
          status: error.response?.status || 500,
          message: error.response?.data?.message || "Unknown error occurred",
          error: error.response?.data,
        });
      }

      console.error("Error getting template form by ID:", error);
      return rejectWithValue({
        status: 500,
        message: "Failed to get template form",
        error: error,
      });
    }
  }
);

