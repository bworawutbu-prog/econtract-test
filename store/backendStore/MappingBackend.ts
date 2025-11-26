/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import axios from "axios";
import { PageFormItems } from "@/components/mappingComponents/FormUtils/pdfFormManager";
import { getTokenLogin } from "../token";
import {
  FormItemPosition,
  FormItemConfig,
  FormItemStyle,
  MappingTextItem,
  MappingDateTimeItem,
  MappingSignatureItem,
  MappingRadioboxItem,
  MappingCheckboxItem,
  MappingStampItem,
  MappingDocNoItem,
  MappingFileItem,
  MappingESealItem,
  WorkflowEntity,
  WorkflowStep,
  FormSubmitData,
  ApiResponse,
  UserSetting,
} from "../types/mappingTypes";
// ✅ Import default style system

import { buildAllMappings } from "@/components/mappingComponents/FormUtils/mappingBuilder";
import { OperatorDetail } from "../types/contractB2BType";
// Create HTTPS agent to bypass certificate validation issues (for development)
const https = require("https");
const agent = new https.Agent({
  rejectUnauthorized: false,
});
import { selectTypeDocNo } from "../slices/mappingSlice";
import { store } from "../storeInstance";
import router from "next/router";
import { detectApiError } from "@/utils/errorHandler";
/**
 * Converts a PDF file to base64 string
 */
const convertPdfToBase64 = async (pdfUrl: string): Promise<string> => {
  try {
    if (pdfUrl.startsWith("data:application/pdf;base64,")) {
      // Already base64
      return pdfUrl.split(",")[1];
    }

    // Fetch the PDF file
    const response = await fetch(pdfUrl);
    const blob = await response.blob();

    // Convert to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix
        const base64 = base64String.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting PDF to base64:", error);
    throw error;
  }
};

/**
 * Creates a form submission with typeDocNo from parameter or Redux store
 */
export const createFormSubmissionWithRedux = async (
  workspaceId: string,
  pdfFile: string,
  pdfName: string,
  taxId: string,
  isDraft: boolean,
  isEnabled: boolean,
  pageFormItems: PageFormItems,
  flowData: WorkflowStep[] = [],
  workflowId: string = "",
  formId: string = "",
  startEnabled: string = "",
  endEnabled: string = "",
  typeCode: string = "1",
  docType?: string,
  coTaxId?: string,
  operator?: OperatorDetail,
  paymentChannel?: string,
  typeDocNo?: string // 🎯 NEW: Accept typeDocNo as parameter (from docTypeId in URL)
): Promise<ApiResponse> => {
  // 🎯 FIXED: Use typeDocNo from parameter first, then fallback to Redux store
  const templateFormDataStr = sessionStorage.getItem("templateFormData");
  const templateFormData = templateFormDataStr ? JSON.parse(templateFormDataStr) : null;
  const typeDocNoFromTemplate = templateFormData?.contract?.document_type_id || "";
  const typeDocNoFromRedux = selectTypeDocNo(store.getState());
  const finalTypeDocNo = typeDocNo || typeDocNoFromRedux || typeDocNoFromTemplate || "";

  return createFormSubmission(
    workspaceId,
    pdfFile,
    pdfName,
    taxId,
    isDraft,
    isEnabled,
    pageFormItems,
    flowData,
    workflowId,
    formId,
    startEnabled,
    endEnabled,
    typeCode,
    docType,
    coTaxId,
    finalTypeDocNo, // 🎯 FIXED: Use finalTypeDocNo (parameter > Redux > empty string)
    operator,
    paymentChannel
  );
};

/**
 * Creates a form submission with the provided data
 */
export const createFormSubmission = async (
  workspaceId: string,
  pdfFile: string,
  pdfName: string,
  taxId: string,
  isDraft: boolean,
  isEnabled: boolean,
  pageFormItems: PageFormItems,
  flowData: WorkflowStep[] = [],
  workflowId: string = "",
  formId: string = "",
  startEnabled: string = "",
  endEnabled: string = "",
  typeCode: string = "1", // 🎯 เพิ่ม typeCode
  docType?: string,
  coTaxId?: string,
  typeDocNo?: string, // เปลี่ยนจาก typeDocNos เป็น typeDocNo
  operator?: OperatorDetail,
  paymentChannel?: string
): Promise<ApiResponse> => {
  try {
    if (!pdfFile) {
      return {
        success: false,
        message: "PDF file is required",
        error: "PDF_REQUIRED",
      };
    }

    // Convert PDF to base64
    const pdfBase64 = await convertPdfToBase64(pdfFile);

    // ✅ Use centralized mapping builder with expansion for "all" step items
    // Extract available step indices from flowData
    const availableStepIndices = (flowData ?? []).map((step) =>
      step?.index?.toString()
    );
    const allMappings = buildAllMappings(
      pageFormItems,
      true,
      availableStepIndices
    );
    const {
      mappingText,
      mappingCheckbox,
      mappingRadio,
      mappingDate,
      mappingSignature,
      mappingMoreFile,
      mappingStamp,
    } = allMappings;

    let submitData: FormSubmitData;
    if (docType === "b2b") {
      // ทุก flow data ที่มาตรา 26,28 ต้องมี mapping_signature
      for (const flow of flowData) {
        if (flow.section === "26,28") {
          if (flow.action === "signer") {
            const signature = mappingSignature.find(
              (signature) => signature.step_index === flow.index
            );
            if (!signature) {
              return {
                success: false,
                message:
                  "ผู้อนุมัติ ที่เลือกประเภทเป็น signer ต้องมีการกำหนดลายเซ็น",
                error: "FLOW_DATA_MISSING_SIGNATURE",
              };
            }
          }
        }
      }

      // if (mappingStamp.length === 0 && flowData.some(flow => flow.section !== "9")) {
      //   return {
      //     success: false,
      //     message: "ต้องมีการกำหนดตราประทับองค์กร",
      //     error: "FLOW_DATA_MISSING_STAMP",
      //   };
      // }

      submitData = {
        // business_id: "175128061064325",
        // key ที่เพิ่มมาใน b2b
        estamp_payment:
          paymentChannel == "ในระบบ"
            ? "internal"
            : paymentChannel == "นอกระบบ"
            ? "external"
            : "non_payment",
        contract_type: "b2b",
        co_tax_id: coTaxId,
        // key เดิม
        workspace_id: "",
        folder_id: "",
        pdf_base64: pdfBase64,
        pdf_name: `${pdfName}`,
        tax_id: taxId,
        doc_type_id: typeDocNo,
        is_draft: isDraft,
        is_enabled: isEnabled,
        start_enabled: startEnabled,
        end_enabled: endEnabled,
        type_code: typeCode,
        mapping_text: mappingText,
        mapping_checkbox: mappingCheckbox,
        mapping_date_time: mappingDate,
        mapping_signature: mappingSignature,
        mapping_radiobox: mappingRadio,
        mapping_stamp: [],
        mapping_doc_no: [],
        mapping_more_file: mappingMoreFile,
        mapping_eseal: mappingStamp,
        workflow_id: workflowId,
        mapping_form_id: formId,
        flow_data: flowData,
        sign_base: "",
        operator: operator,
      };
    } else {
      // ทุก flow data ที่มาตรา 26,28 ต้องมี mapping_signature
      // ผู้อนุมัติลำดับ 1 ต้องมี mapping อย่างน้อย 1 รายการ
      for (const flow of flowData) {
        if (flow.index == 0) {
          const signature =
            mappingSignature.find(
              (signature) => signature?.step_index === flow.index
            ) ?? [];
          const checkbox =
            mappingCheckbox.find(
              (checkbox) => checkbox?.step_index === flow.index
            ) ?? [];
          const text =
            mappingText.find((text) => text?.step_index === flow.index) ?? [];
          const date =
            mappingDate.find((date) => date?.step_index === flow.index) ?? [];
          const radio =
            mappingRadio.find((radio) => radio?.step_index === flow.index) ??
            [];
          if (!signature && !checkbox && !text && !date && !radio) {
            return {
              success: false,
              message: "ผู้อนุมัติลำดับ 1 ต้องมีการกำหนด อย่างน้อย 1 รายการ",
              error: "FLOW_DATA_MISSING_SIGNATURE",
            };
          }
        }
        if (flow.section === "26,28") {
          if (flow.action === "signer") {
            const signature =
              mappingSignature.find(
                (signature) => signature?.step_index === flow.index
              ) ?? [];
            if (!signature) {
              return {
                success: false,
                message:
                  "ผู้อนุมัติ ที่เลือกประเภทเป็น signer ต้องมีการกำหนดลายเซ็น",
                error: "FLOW_DATA_MISSING_SIGNATURE",
              };
            }
          }
        }
      }
      // if (mappingStamp.length === 0 && flowData.some(flow => flow.section !== "9")) {
      //   return {
      //     success: false,
      //     message: "ต้องมีการกำหนดตราประทับองค์กร",
      //     error: "FLOW_DATA_MISSING_STAMP",
      //   };
      // }

      submitData = {
        // business_id: "175128061064325",
        workspace_id: "",
        folder_id: "",
        pdf_base64: pdfBase64,
        pdf_name: `${pdfName}`,
        tax_id: taxId,
        doc_type_id: typeDocNo,
        is_draft: isDraft,
        is_enabled: isEnabled,
        start_enabled: startEnabled,
        end_enabled: endEnabled,
        type_code: typeCode,
        mapping_text: mappingText,
        mapping_checkbox: mappingCheckbox,
        mapping_date_time: mappingDate,
        mapping_signature: mappingSignature,
        mapping_radiobox: mappingRadio,
        mapping_stamp: [],
        mapping_doc_no: [],
        mapping_more_file: mappingMoreFile,
        mapping_eseal: mappingStamp,
        workflow_id: workflowId,
        mapping_form_id: formId,
        flow_data: flowData,
        sign_base: "",
        estamp_payment:
          paymentChannel == "ในระบบ"
            ? "internal"
            : paymentChannel == "นอกระบบ"
            ? "external"
            : "non_payment",
        contract_type: "b2c",
        // co_tax_id: coTaxId,
      };
    }

    const path = docType === "b2b" ? "/form/b2b/create_form_data" : "/form/b2c";

    // Make the API request
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}${path}${
        process.env.NEXT_PUBLIC_API_URL?.includes("/api/v2")
          ? "?business_id=175128061064325"
          : ""
      }`,
      submitData,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${getTokenLogin()}`,
          "Content-Type": "application/json",
        },
        httpsAgent: agent,
      }
    );

    return {
      success: true,
      message: "Form created successfully",
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("Error creating form submission:", error);

    // // Add more detailed error logging
    // if (axios.isAxiosError(error)) {
    //   console.error("Axios error details:");
    //   console.error("Status:", error.response?.status);
    //   console.error("Data:", error.response?.data);
    //   console.error("Headers:", error.response?.headers);
    //   console.error("Config:", error.config);
    // } else {
    //   console.error("Non-Axios error:", error);
    // }
    const apiError = detectApiError(error);
    if (apiError.errorType === "network_error") {
      router.replace("/login");
    } else if (apiError.errorType === "unauthorized") {
      router.replace("/login");
    } else {
      console.log("error", error);
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

/**
 * Updates the handleSaveForm function in page.tsx to use this API
 * This function can be integrated with the existing handleSaveForm
 */
export const handleSaveFormSubmission = async (
  formId: string | null,
  formTitle: string,
  pdfFile: string | null,
  numPages: number | null,
  pageFormItems: PageFormItems
): Promise<ApiResponse> => {
  try {
    // Default workflow for testing
    const defaultWorkflow: WorkflowStep[] = [
      {
        index: 0,
        section: "26&28",
        action: "test",
        validate_type: "",
        validate_data: "",
        selfie_video: false,
        script_video: "",
        type_entity: "sender",
        entity: [],
        no_edit_mail: false,
      },
    ];

    // Use workspace ID from environment or default
    const workspaceId = process.env.NEXT_PUBLIC_WORKSPACE_ID || "003";

    // Extract PDF name from the file path or use the form title
    const pdfName = formTitle || "Untitled Form";

    // Use organization tax ID from environment or default
    const taxId = process.env.NEXT_PUBLIC_TAX_ID || "test";

    // Check if PDF file exists
    if (!pdfFile) {
      return {
        success: false,
        message: "PDF file is required",
        error: "PDF_REQUIRED",
      };
    }

    // Submit the form
    return await createFormSubmission(
      workspaceId,
      pdfFile,
      pdfName,
      taxId,
      false, // Not a draft
      true, // Enabled
      pageFormItems,
      defaultWorkflow,
      "",
      formId || ""
    );
  } catch (error: unknown) {
    console.error("Error in handleSaveFormSubmission:", error);

    const errorMsg =
      error instanceof Error ? error.message : "Unknown error occurred";

    return {
      success: false,
      message: errorMsg,
      error: "UNKNOWN_ERROR",
    };
  }
};
