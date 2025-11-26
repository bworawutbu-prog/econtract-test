/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * API Utilities
 *
 * This utility provides functions to handle API operations like saving forms,
 * approving/rejecting documents, user settings management, and email sending confirmation.
 */
"use client";

import { FormItem, ElementStyle } from "../../../store/types";
import {
  UserSettingData,
  FlowDataItem,
  MappedFlowItem,
} from "@/store/types/PDFTemplateTypes";
import { useAppSelector } from "@/store/hooks";
import { selectTypeDocNo } from "@/store/slices/mappingSlice";
import { 
  WorkflowStep, 
  payloadUpdateTransaction,
  MoreFilePayload,
  MoreFileStepData,
  MoreFileTypeData,
  FormItemStyle,
  MappingTextItem,
  MappingSignatureItem,
  MappingCheckboxItem,
  MappingRadioboxItem,
  MappingDateTimeItem
} from "@/store/types/mappingTypes";
import { PageFormItems } from "./pdfFormManager";
import { createFormSubmission, createFormSubmissionWithRedux } from "@/store/backendStore/MappingBackend";
import { transactionSentEmail, transactionSentEmailB2B, transactionSentEmailB2C, UpdateTransactions } from "@/store/frontendStore/transactionAPI";
import appEmitter from "@/store/libs/eventEmitter";
import { ThunkDispatch, AnyAction } from "@reduxjs/toolkit";
import { RootState, store, useAppDispatch } from "@/store";
import { contractForm } from "@/store/estampStore/contractForm";

// import {
//   stampItemsOnPdf,
//   createStampItemsFromFormData,
//   downloadStampedPdf,
//   previewStampedPdf,
// } from "./pdfStampUtils";
import {
  getCompleteDefaultStyle,
  convertStyleToApiFormat,
  convertStyleToImageParams,
  debugStyleCompleteness,
  getDefaultElementSize,
  BASE_DEFAULT_STYLE,
  STYLE_CONSTANTS,
  CONFIG_CONSTANTS,
  getCompleteElementConfig,
  convertApiToElementStyle,
  getDefaultDateConfig,
} from "./defaultStyle";
import {
  buildBasePayload,
  processCoordinates,
  processPosition,
  processElementStyle,
  processElementSize,
  filterItemsByType,
  groupDateItems,
  expandAllStepItems,
  extractAvailableStepIndices,
  getFilteredFlowData,
} from "./payloadUtils";
import {
  buildAllMappings,
  createTextMapping,
  createCheckboxMapping,
  createRadioMapping,
  createSignatureMapping,
  createDateMapping,
  createMoreFileMapping,
  createStampMapping,
  createESealMapping,
} from "./mappingBuilder";
import { enqueueSnackbar } from "notistack";
import { mappingCreates } from "@/store/backendStore/formCreateAPI";
import { OperatorDetail } from "@/store/types/contractB2BType";
import { putValidateTransaction } from "@/store/backendStore/documentAPI";
import { createTemplate, CreateTemplatePayload, FlowDataEntity } from "@/store/backendStore/templateAPI";

// Interface for API function parameters
export interface SaveFormParams {
  setIsSaving: (saving: boolean) => void;
  setSaveMessage: (message: string) => void;
  setIsConfirmModalOpen: (open: boolean) => void;
}

export interface ConfirmSaveParams {
  setIsConfirmModalOpen: (open: boolean) => void;
  setIsSuccessModalOpen: (open: boolean) => void;
  setIsErrorModalOpen: (open: boolean) => void;
  setIsEmailConfirmModalOpen: (open: boolean) => void;
  setTransactionId: (transactionId: string) => void;
  setErrorMessage: (message: string) => void;
  setIsSaving: (saving: boolean) => void;
  setSaveMessage: (message: string) => void;
  pdfFile: string | null;
  formTitle: string;
  pageFormItems: PageFormItems;
  operator: OperatorDetail;
  workflowSteps: WorkflowStep[];
  formId: string | null;
  typeCode?: string;
  workspaceId?: string;
  folderId?: string;
  type?: string;
  docType?: string;
  coTaxId?: string;
  typeDocNo?: string;
  // operator?: OperatorDetail;
  paymentChannel?: string;
  isTemplateMode?: boolean;
  docTypeId?: string; // Document type ID for template
}

export interface ApproveParams {
  allPageItems: FormItem[];
  currentPageItems?: FormItem[];
  documentData: any;
  mappingFormDataId: string | null;
  stepIndex: string;
  dispatch: ThunkDispatch<RootState, unknown, AnyAction>;
  setErrorMessage: (message: string) => void;
  setIsConfirmModalOpen: (open: boolean) => void;
  setIsSuccessModalOpen: (open: boolean) => void;
  setIsErrorModalOpen: (open: boolean) => void;
  pdfFile?: string | null;
  shouldStampPdf?: boolean;
  mappingMoreFile?: any[];
}

export interface RejectParams {
  allPageItems: FormItem[];
  currentPageItems?: FormItem[];
  documentData: any;
  mappingFormDataId: string | null;
  stepIndex: string;
  reason?: string; // 🎯 FIXED: Add reason parameter
  dispatch: ThunkDispatch<RootState, unknown, AnyAction>;
  setErrorMessage: (message: string) => void;
  setIsRejectModalOpen: (open: boolean) => void;
  setIsSuccessModalOpen: (open: boolean) => void;
  setIsErrorModalOpen: (open: boolean) => void;
}

export interface SaveUserSettingParams {
  userSettings: UserSettingData | null;
  documentId: string;
  formId: string | null;
  setIsSettingsMode: (mode: boolean) => void;
  setWorkflowSteps: (steps: WorkflowStep[]) => void;
  handleCategoryChange?: (category: string) => void;
  typeCode?: string;
}

export interface UserSettingMappingParams {
  approvers: any[] | undefined;
  setUserSettings: (data: UserSettingData | null) => void;
  documentId: string;
  formId: string | null;
}

// 🎯 NEW: Updated interfaces using proper types from our system
export interface TextToImageParams {
  width?: string | number;
  height?: string | number;
  text?: string;
  required?: string;
  max_characters?: string;
  max_lines?: string;
  font_family?: string;
  font_size?: string | number;
  font_weight?: string;
  font_style?: string;
  text_align?: string;
  text_decoration?: string;
  justify_content?: string;
  underline?: string | boolean;
  fill?: string;
  background_color?: string;
  border_color?: string;
  border_width?: string | number;
  border_style?: string;
  border_radius?: string | number;
  padding?: string | number;
  margin?: string | number;
  value?: string;
  border?: string;
}

export interface CheckboxToImageParams {
  width?: string | number;
  height?: string | number;
  font_family?: string;
  font_size?: string | number;
  font_weight?: string;
  font_style?: string;
  text_align?: "left" | "center" | "right";
  fill?: string;
  background_color?: string;
  padding?: string | number;
  border?: string;
  option_spacing?: number;
  box_size?: number;
  box_border_color?: string;
  box_border_width?: number;
  check_color?: string;
}

export interface RadioToImageParams {
  width?: string | number;
  height?: string | number;
  font_family?: string;
  font_size?: string | number;
  font_weight?: string;
  font_style?: string;
  text_align?: "left" | "center" | "right";
  fill?: string;
  background_color?: string;
  padding?: string | number;
  border?: string;
  option_spacing?: number;
  box_size?: number;
  box_border_color?: string;
  box_border_width?: number;
  check_color?: string;
}

/**
 * Handle form save operation
 *
 * @param params - Save form parameters
 */
//debug
export async function handleSaveForm(params: SaveFormParams): Promise<void> {
  const { setIsSaving, setSaveMessage, setIsConfirmModalOpen } = params;

  try {
    setIsSaving(true);
    setIsConfirmModalOpen(true);
  } catch (error) {
    enqueueSnackbar(`🎯 [apiUtils] Error in handleSaveForm: ${error}`, {
      variant: "error",
      autoHideDuration: 3000,
    });
    setSaveMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    setIsSaving(false);
  }
}

/**
 * 🎯 REFACTORED: สร้าง mapping arrays จาก pageFormItems สำหรับ template mode
 * ใช้ centralized functions จาก mappingBuilder.ts
 * 
 * @param pageFormItems - Form items organized by page
 * @param workflowSteps - Workflow steps for expanding items
 * @returns Mapping arrays for template API
 */
function createMappingsFromPageFormItems(
  pageFormItems: PageFormItems,
  workflowSteps: WorkflowStep[]
): {
  mapping_text: MappingTextItem[];
  mapping_checkbox: any[];
  mapping_date_time: any[];
  mapping_signature: MappingSignatureItem[];
  mapping_radiobox: any[];
  mapping_stamp: any[];
  mapping_doc_no: any[];
  mapping_more_file: any[];
  mapping_eseal: any[];
} {
  // ✅ Extract available step indices from workflow
  const availableStepIndices = workflowSteps?.map((step, index) => index.toString()) || [];
  
  const normalizePageNumber = (page: number | string | undefined) => {
    const parsed = Number(page);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  };

  // ✅ Normalize items so that each entry represents a single page
  const allPageItemsMap = new Map<string, FormItem>();

  Object.entries(pageFormItems).forEach(([pageNum, items]) => {
    const pageItems = items as FormItem[];
    const normalizedContextPage = normalizePageNumber(pageNum);

    pageItems.forEach((item) => {
      const normalizedPageNumber = normalizePageNumber(
        item.pageNumber ?? normalizedContextPage
      );

      const normalizedItem = {
        ...item,
        pageNumber: normalizedPageNumber,
      } as FormItem;

      // Deduplicate by item id + page number to avoid duplicated entries
      const dedupeKey = `${item.id ?? ""}__${normalizedPageNumber}__${item.step_index ?? ""}`;
      allPageItemsMap.set(dedupeKey, normalizedItem);
    });
  });

  const allPageItems: FormItem[] = Array.from(allPageItemsMap.values());

  // ✅ Filter and expand items by type using centralized utilities
  const textItems = filterItemsByType(allPageItems, "text");
  const expandedTextItems = expandAllStepItems(textItems, availableStepIndices);
  
  const signatureItems = filterItemsByType(allPageItems, "signature");
  const expandedSignatureItems = expandAllStepItems(signatureItems, availableStepIndices);
  
  const checkboxItems = filterItemsByType(allPageItems, "checkbox");
  const expandedCheckboxItems = expandAllStepItems(checkboxItems, availableStepIndices);
  
  const radioItems = filterItemsByType(allPageItems, "radio");
  const expandedRadioItems = expandAllStepItems(radioItems, availableStepIndices);
  
  const stampItems = filterItemsByType(allPageItems, "stamp");
  const expandedStampItems = expandAllStepItems(stampItems, availableStepIndices);

  const esealItems = filterItemsByType(allPageItems, "eseal");
  const expandedESealItems = expandAllStepItems(esealItems, availableStepIndices);
  
  const moreFileItems = filterItemsByType(allPageItems, "more-file");
  const expandedMoreFileItems = expandAllStepItems(moreFileItems, availableStepIndices);
  
  // Date items (days, months, years)
  const dateItems = allPageItems.filter((item: any) => 
    item.type === "days" || item.type === "months" || item.type === "years"
  );
  const expandedDateItems = expandAllStepItems(dateItems, availableStepIndices);

  // 🎯 REFACTORED: Map text items using centralized utilities
  const mappingText: MappingTextItem[] = expandedTextItems.map((item: FormItem, index: number) => {
    // ✅ Use centralized payload builder
    const basePayload = buildBasePayload(item, item.type, index);
    const { apiStyleFormat } = processElementStyle(item, item.type);
    const completeConfig = getCompleteElementConfig(item.type, item.config);

    return {
      type: "text",
      ...basePayload,
      font_size: typeof basePayload.font_size === "string" ? parseInt(basePayload.font_size) : basePayload.font_size,
      underline: typeof basePayload.underline === "string" ? basePayload.underline === "true" : basePayload.underline,
      text: item.text || `ข้อความ ${parseInt(item.step_index || "0")}`,
      max_characters: completeConfig.maxLength?.toString() || CONFIG_CONSTANTS.TEXT_MAX_LENGTH.toString(),
      max_lines: completeConfig.minLines?.toString() || CONFIG_CONSTANTS.TEXT_MIN_LINES.toString(),
      value: (item.value || "").toString(),
      // 🎯 Template API requires image_base64
      image_base64: convertTextToImage({
        width: apiStyleFormat.width,
        height: apiStyleFormat.height,
        text: item.text || `ข้อความ ${parseInt(item.step_index || "0")}`,
        required: completeConfig.required?.toString() || "false",
        max_characters: completeConfig.maxLength?.toString() || "100",
        max_lines: completeConfig.minLines?.toString() || "1",
        font_family: apiStyleFormat.font_family,
        font_size: apiStyleFormat.font_size,
        font_weight: apiStyleFormat.font_weight,
        font_style: apiStyleFormat.font_style,
        text_align: apiStyleFormat.text_align,
        text_decoration: apiStyleFormat.text_decoration,
        justify_content: apiStyleFormat.justify_content,
        underline: apiStyleFormat.underline,
        fill: apiStyleFormat.fill,
        border_color: apiStyleFormat.border_color,
        border_width: apiStyleFormat.border_width,
        border_style: apiStyleFormat.border_style,
        border_radius: apiStyleFormat.border_radius,
        padding: apiStyleFormat.padding,
        margin: apiStyleFormat.margin,
        value: (item.value || "").toString(),
      }, (item.value || "").toString()).replace(/data:image\/png;base64,/, ""),
    };
  });

  // 🎯 REFACTORED: Map signature items using centralized utilities
  const mappingSignature: MappingSignatureItem[] = expandedSignatureItems.map((item: FormItem, index: number) => {
    // ✅ Use centralized payload builder
    const basePayload = buildBasePayload(item, item.type, index);

    return {
      type: "signature",
      ...basePayload,
      font_size: typeof basePayload.font_size === "string" ? parseInt(basePayload.font_size) : basePayload.font_size,
      underline: typeof basePayload.underline === "string" ? basePayload.underline === "true" : basePayload.underline,
      text: item.text || `ลายเซ็น ${item.label}`,
      signatureType: item.type || "signature",
      actorId: item.actorId || item.step_index,
      image_base64: ((item.value as string) || "").replace(/^data:image\/png;base64,/, ""),
    };
  });

  // 🎯 REFACTORED: Map checkbox items using centralized utilities
  const mappingCheckbox: any[] = expandedCheckboxItems.map((item: any, index: number) => {
    // ✅ Use centralized payload builder
    const basePayload = buildBasePayload(item, item.type, index);
    const { apiStyleFormat } = processElementStyle(item, item.type);
    const completeConfig = getCompleteElementConfig(item.type, item.config);

    return {
      type: "checkbox",
      id: item.id,
      ...basePayload,
      text: item.text || item.label || `ตัวเลือก ${parseInt(item.step_index || "0")}`,
      checkboxType: item.type || "checkbox",
      actorId: item.actorId || item.step_index,
      value: Array.isArray(item.value) ? item.value.length > 0 : Boolean(item.value),
      checkboxOptions: item.checkboxOptions || completeConfig.checkboxOptions || ["ตัวเลือกที่ 1"],
      checkedValues: Array.isArray(item.value) ? item.value : [],
      // 🎯 Template API requires image_base64
      image_base64: convertCheckboxToImage({
        width: basePayload.width,
        height: basePayload.height,
        font_family: apiStyleFormat.font_family,
        font_size: apiStyleFormat.font_size,
        font_weight: apiStyleFormat.font_weight,
        font_style: apiStyleFormat.font_style,
        text_align: apiStyleFormat.text_align as "left" | "center" | "right",
        fill: apiStyleFormat.fill,
        padding: apiStyleFormat.padding,
        box_size: undefined,
        box_border_color: apiStyleFormat.border_color,
        box_border_width: parseInt(apiStyleFormat.border_width || "1"),
        check_color: "#0153BD",
      }, item.checkboxOptions || completeConfig.checkboxOptions || ["ตัวเลือกที่ 1"], Array.isArray(item.value) ? item.value : []).replace(/data:image\/png;base64,/, ""),
    };
  });

  // 🎯 REFACTORED: Map radio items using centralized utilities
  const mappingRadiobox: any[] = expandedRadioItems.map((item: any, index: number) => {
    // ✅ Use centralized payload builder
    const basePayload = buildBasePayload(item, item.type, index);
    const { apiStyleFormat } = processElementStyle(item, item.type);
    const completeConfig = getCompleteElementConfig(item.type, item.config);

    return {
      type: "radio",
      id: item.id,
      ...basePayload,
      text: item.text || item.label || `ตัวเลือก ${parseInt(item.step_index || "0")}`,
      radioType: item.type || "radio",
      actorId: item.actorId || item.step_index,
      value: typeof item.value === "string" ? item.value : "",
      radioOptions: item.radioOptions || completeConfig.radioOptions || ["ตัวเลือกที่ 1"],
      selectedValue: typeof item.value === "string" ? item.value : "",
      // 🎯 Template API requires image_base64
      image_base64: convertRadioToImage({
        width: basePayload.width,
        height: basePayload.height,
        font_family: apiStyleFormat.font_family,
        font_size: apiStyleFormat.font_size,
        font_weight: apiStyleFormat.font_weight,
        font_style: apiStyleFormat.font_style,
        text_align: apiStyleFormat.text_align as "left" | "center" | "right",
        fill: apiStyleFormat.fill,
        padding: apiStyleFormat.padding,
        box_size: undefined,
        box_border_color: apiStyleFormat.border_color,
        box_border_width: parseInt(apiStyleFormat.border_width || "1"),
        check_color: "#000000",
      }, item.radioOptions || completeConfig.radioOptions || ["ตัวเลือกที่ 1"], item.value !== "" ? item.value : "").replace(/data:image\/png;base64,/, ""),
    };
  });

  // 🎯 REFACTORED: Map stamp items using centralized utilities
  const mappingStamp: any[] = expandedStampItems.map((item: FormItem, index: number) => {
    // ✅ Use centralized payload builder
    const basePayload = buildBasePayload(item, item.type, index);
    const stampType = item.stampType || (item.id.includes('-') ? 
      (parseInt(item.id.split('-')[2]) === 0 ? "ต้นสัญญา" : "คู่สัญญา") : "ต้นสัญญา");
    const section = item.section || (item.id.includes('-') ? item.id.split('-')[1] : "มาตรา 9");

    return {
      type: "stamp",
      ...basePayload,
      text: stampType,
      stampType: stampType,
      value: typeof item.value === "string" ? item.value : "",
      section: section,
    };
  });

  // 🎯 REFACTORED: Map e-seal items using centralized utilities
  const mappingESeal: any[] = expandedESealItems.map((item: FormItem, index: number) => {
    // ✅ Use centralized payload builder
    const basePayload = buildBasePayload(item, item.type, index);

    return {
      type: "eseal",
      ...basePayload,
      text: item.label || `E-Seal ${index + 1}`,
      sealType: (item as any).sealType || "default",
      value: typeof item.value === "string" ? item.value : "",
    };
  });

  // 🎯 REFACTORED: Map date items using centralized grouping utility
  const dateGroups = groupDateItems(expandedDateItems);

  const mappingDateTime: any[] = Array.from(dateGroups.entries()).map(([groupKey, dateGroup], groupIndex) => {
    const sortedGroup = dateGroup.sort((a, b) => {
      const order = { "days": 0, "months": 1, "years": 2 };
      return order[a.type as keyof typeof order] - order[b.type as keyof typeof order];
    });

    const daysItem = sortedGroup.find(item => item.type === "days");
    const monthsItem = sortedGroup.find(item => item.type === "months");
    const yearsItem = sortedGroup.find(item => item.type === "years");

    const dateConfig = {
      header: daysItem?.label || daysItem?.text || CONFIG_CONSTANTS.DATE_HEADER,
      required: daysItem?.required !== undefined ? daysItem.required : CONFIG_CONSTANTS.DATE_REQUIRED,
      format: CONFIG_CONSTANTS.DATE_FORMAT,
      currentDate: CONFIG_CONSTANTS.DATE_CURRENT_DATE,
    };

    const dateElements: any[] = [];
    let elementIndex = 0;

    [daysItem, monthsItem, yearsItem].forEach((dateItem, idx) => {
      if (!dateItem) return;
      const dateType = ["days", "months", "years"][idx];
      const completeConfig = getCompleteElementConfig(dateItem.type, dateItem.config);
      const completeStyle = getCompleteDefaultStyle(dateItem.type || dateType, dateItem.style, undefined);
      const apiStyleFormat = convertStyleToApiFormat(completeStyle, dateItem.type || dateType);
      const defaultDateSize = getDefaultElementSize(dateType as any);
      const widthFromStyle = dateItem.style?.width
        ? typeof dateItem.style.width === "string" ? dateItem.style.width.replace("px", "") : dateItem.style.width.toString()
        : defaultDateSize.width.toString();
      const heightFromStyle = dateItem.style?.height
        ? typeof dateItem.style.height === "string" ? dateItem.style.height.replace("px", "") : dateItem.style.height.toString()
        : defaultDateSize.height.toString();

      dateElements.push({
        type: dateType,
        index: elementIndex++,
        step_index: parseInt(dateItem.step_index || "0"),
        llx: dateItem.coordinates?.llx?.toString() || "0",
        lly: dateItem.coordinates?.lly?.toString() || "0",
        urx: dateItem.coordinates?.urx?.toString() || "0",
        ury: dateItem.coordinates?.ury?.toString() || "0",
        left: (dateItem.position?.x || "0").toString(),
        top: (dateItem.position?.y || "0").toString(),
        scale_X: (dateItem.position?.x || 0).toString(),
        scale_Y: (dateItem.position?.y || 0).toString(),
        width: widthFromStyle,
        height: heightFromStyle,
        text: dateType === "days" ? "วัน" : dateType === "months" ? "เดือน" : "ปี",
        value: dateItem.value || "",
        required: dateConfig.required?.toString() || CONFIG_CONSTANTS.DATE_REQUIRED.toString(),
        pageNumber: dateItem.pageNumber || 1,
        font_family: apiStyleFormat.font_family,
        font_size: apiStyleFormat.font_size,
        font_weight: apiStyleFormat.font_weight,
        font_style: apiStyleFormat.font_style,
        text_align: apiStyleFormat.text_align,
        text_decoration: apiStyleFormat.text_decoration,
        justify_content: apiStyleFormat.justify_content,
        underline: apiStyleFormat.underline,
        fill: apiStyleFormat.fill,
        background_color: apiStyleFormat.background_color,
        border_color: apiStyleFormat.border_color,
        border_width: apiStyleFormat.border_width,
        border_style: apiStyleFormat.border_style,
        border_radius: apiStyleFormat.border_radius,
        padding: apiStyleFormat.padding,
        margin: apiStyleFormat.margin,
        date_type: dateType,
        date_element_id: dateItem.id,
        image_base64: convertTextToImage({
          width: widthFromStyle,
          height: heightFromStyle,
          text: dateItem.value || (dateType === "days" ? "วัน" : dateType === "months" ? "เดือน" : "ปี"),
          required: dateConfig.required?.toString() || "false",
          max_characters: dateType === "years" ? "4" : "2",
          max_lines: "1",
          font_family: apiStyleFormat.font_family,
          font_size: apiStyleFormat.font_size,
          font_weight: apiStyleFormat.font_weight,
          font_style: apiStyleFormat.font_style,
          text_align: apiStyleFormat.text_align,
          text_decoration: apiStyleFormat.text_decoration,
          justify_content: apiStyleFormat.justify_content,
          underline: apiStyleFormat.underline,
          fill: apiStyleFormat.fill,
          border_color: apiStyleFormat.border_color,
          border_width: apiStyleFormat.border_width,
          border_style: apiStyleFormat.border_style,
          border_radius: apiStyleFormat.border_radius,
          padding: apiStyleFormat.padding,
          margin: apiStyleFormat.margin,
          value: dateItem.value || "",
        }, dateItem.value || (dateType === "days" ? "วัน" : dateType === "months" ? "เดือน" : "ปี")).replace(/data:image\/png;base64,/, ""),
      });
    });

    const originalTimestamp = groupKey.split('-step-')[0];
    return {
      header: dateConfig.header || CONFIG_CONSTANTS.DATE_HEADER,
      required: dateConfig.required || CONFIG_CONSTANTS.DATE_REQUIRED,
      format: dateConfig.format || CONFIG_CONSTANTS.DATE_FORMAT,
      currentDate: dateConfig.currentDate || CONFIG_CONSTANTS.DATE_CURRENT_DATE,
      date_group_timestamp: originalTimestamp,
      date_group_index: groupIndex,
      date_group_size: sortedGroup.length,
      is_complete_group: sortedGroup.length === 3,
      date_elements: dateElements,
    };
  });

  // 🎯 REFACTORED: Map more-file items using centralized config
  const mappingMoreFile: any[] = expandedMoreFileItems.map((item: any, index: number) => {
    const completeConfig = getCompleteElementConfig(item.type, item.config);
    
    return {
      type: "more-file",
      index: index,
      step_index: parseInt(item.step_index || "0"),
      text: item.text || item.typeName || completeConfig.typeName || `ไฟล์เพิ่มเติม ${item.label}`,
      required: item.config?.required ?? item.required ?? completeConfig.required ?? CONFIG_CONSTANTS.DEFAULT_REQUIRED,
      actorId: item.actorId || item.step_index,
      type_name: item.typeName || completeConfig.typeName || CONFIG_CONSTANTS.MORE_FILE_DEFAULT_TYPE_NAME,
      file_accept: (item.fileAccept || completeConfig.fileAccept || []).join(","),
      is_embedded: item.isEmbedded ?? completeConfig.isEmbedded ?? CONFIG_CONSTANTS.MORE_FILE_DEFAULT_IS_EMBEDDED,
      max_file_size: item.maxFileSize?.toString() || completeConfig.maxFileSize?.toString() || CONFIG_CONSTANTS.MORE_FILE_MAX_SIZE.toString(),
      file_size: item.maxFileSize || completeConfig.maxFileSize || CONFIG_CONSTANTS.MORE_FILE_MAX_SIZE,
    };
  });

  return {
    mapping_text: mappingText,
    mapping_checkbox: mappingCheckbox,
    mapping_date_time: mappingDateTime,
    mapping_signature: mappingSignature,
    mapping_radiobox: mappingRadiobox,
    mapping_stamp: mappingStamp,
    mapping_doc_no: [], // 🎯 TODO: Implement doc_no mapping if needed
    mapping_more_file: mappingMoreFile,
    mapping_eseal: mappingESeal,
  };
}

/**
 * สร้าง payload จาก documentData โดยใช้ centralized utilities
 *
 * @param documentData - ข้อมูลเอกสารจาก API
 * @param allPageItems - รายการ form items ทั้งหมด
 * @param stepIndex - step index ปัจจุบัน
 * @returns payload object สำหรับส่งไปยัง API
 */
function createPayloadFromDocumentData(
  documentData: any,
  allPageItems: FormItem[],
  stepIndex: string
) {
  // ✅ Use centralized utility functions
  const availableStepIndices = extractAvailableStepIndices(documentData);
  const validFlowData = getFilteredFlowData(documentData);

  const signatureItems = filterItemsByType(allPageItems, "signature");
  const expandedSignatureItems = expandAllStepItems(signatureItems, availableStepIndices);
  const textItems = filterItemsByType(allPageItems, "text");
  const expandedTextItems = expandAllStepItems(textItems, availableStepIndices);
  const moreFileItems = filterItemsByType(allPageItems, "more-file");
  const expandedMoreFileItems = expandAllStepItems(moreFileItems, availableStepIndices);
  const checkboxItems = filterItemsByType(allPageItems, "checkbox");
  const expandedCheckboxItems = expandAllStepItems(checkboxItems, availableStepIndices);
  const radioItems = filterItemsByType(allPageItems, "radio");
  const expandedRadioItems = expandAllStepItems(radioItems, availableStepIndices);
  const stampItems = filterItemsByType(allPageItems, "stamp");
  const expandedStampItems = expandAllStepItems(stampItems, availableStepIndices);
  const esealItems = filterItemsByType(allPageItems, "eseal");
  const expandedESealItems = expandAllStepItems(esealItems, availableStepIndices);

  // 🎯 REFACTORED: Map text items using centralized utilities
  const mappingTextFromDataOnly: MappingTextItem[] = expandedTextItems.map(
    (item: FormItem, index: number) => {
      // Get coordinates from documentData - safely handle empty filter results
      const filteredItems = documentData.mapping_form_data_id.mapping_text.filter(
        (flowItem: any) =>
          flowItem.step_index == item.step_index &&
          parseInt(flowItem.top) == parseInt((item.position?.y || 0).toString()) &&
          parseInt(flowItem.left) == parseInt((item.position?.x || 0).toString())
      );
      const { llx, lly, urx, ury } = filteredItems[0] || {};
      console.log("llx =>", llx);
      console.log("lly =>", lly);
      console.log("urx =>", urx);
      console.log("ury =>", ury);

      // ✅ Use centralized payload builder
      const basePayload = buildBasePayload(item, item.type, index);
      const { apiStyleFormat } = processElementStyle(item, item.type);
      const completeConfig = getCompleteElementConfig(item.type, item.config);

      return {
        type: "text",
        ...basePayload,
        font_size: typeof basePayload.font_size === "string" ? parseInt(basePayload.font_size) : basePayload.font_size,
        underline: typeof basePayload.underline === "string" ? basePayload.underline === "true" : basePayload.underline,
        // Override coordinates from documentData
        llx: llx?.toString() || "0",
        lly: lly?.toString() || "0",
        urx: urx?.toString() || "0",
        ury: ury?.toString() || "0",
        text: item.text || `ข้อความ ${parseInt(item.step_index || "0")}`,
        max_characters: completeConfig.maxLength?.toString() || CONFIG_CONSTANTS.TEXT_MAX_LENGTH.toString(),
        max_lines: completeConfig.minLines?.toString() || CONFIG_CONSTANTS.TEXT_MIN_LINES.toString(),
        value: (item.value || "").toString(),
        // 🎯 Transaction API requires image_base64
        image_base64: convertTextToImage({
          width: apiStyleFormat.width,
          height: apiStyleFormat.height,
          text: item.text || `ข้อความ ${parseInt(item.step_index || "0")}`,
          required: completeConfig.required?.toString() || "false",
          max_characters: completeConfig.maxLength?.toString() || "100",
          max_lines: completeConfig.minLines?.toString() || "1",
          font_family: apiStyleFormat.font_family,
          font_size: apiStyleFormat.font_size,
          font_weight: apiStyleFormat.font_weight,
          font_style: apiStyleFormat.font_style,
          text_align: apiStyleFormat.text_align,
          text_decoration: apiStyleFormat.text_decoration,
          justify_content: apiStyleFormat.justify_content,
          underline: apiStyleFormat.underline,
          fill: apiStyleFormat.fill,
          border_color: apiStyleFormat.border_color,
          border_width: apiStyleFormat.border_width,
          border_style: apiStyleFormat.border_style,
          border_radius: apiStyleFormat.border_radius,
          padding: apiStyleFormat.padding,
          margin: apiStyleFormat.margin,
          value: (item.value || "").toString(),
        }, (item.value || "").toString()).replace(/data:image\/png;base64,/, ""),
      };
    }
  );

  // 🎯 REFACTORED: Map signature items using centralized utilities
  const mappingSignatureFromDataOnly: MappingSignatureItem[] = expandedSignatureItems.map(
    (item: FormItem, index: number) => {
      // Get coordinates from documentData - safely handle empty filter results
      const filteredItems = documentData.mapping_form_data_id.mapping_signature.filter(
        (flowItem: any) =>
          flowItem.step_index == item.step_index &&
          parseInt(flowItem.top) == parseInt((item.position?.y || 0).toString()) &&
          parseInt(flowItem.left) == parseInt((item.position?.x || 0).toString())
      );
      const { llx, lly, urx, ury } = filteredItems[0] || {};

      // ✅ Use centralized payload builder
      const basePayload = buildBasePayload(item, item.type, index);

      return {
        type: "signature",
        ...basePayload,
        font_size: typeof basePayload.font_size === "string" ? parseInt(basePayload.font_size) : basePayload.font_size,
        underline: typeof basePayload.underline === "string" ? basePayload.underline === "true" : basePayload.underline,
        // Override coordinates from documentData
        llx: llx?.toString() || "0",
        lly: lly?.toString() || "0",
        urx: urx?.toString() || "0",
        ury: ury?.toString() || "0",
        text: item.text || `ลายเซ็น ${item.label}`,
        signatureType: item.type || "signature",
        actorId: item.actorId || item.step_index,
        image_base64: (
          (signatureItems.find((originalItem) => originalItem.id === item.id)
            ?.value as string) || ""
        ).replace(/^data:image\/png;base64,/, ""),
      };
    }
  );

  // 🎯 Map checkbox items
  const mappingCheckboxFromDataOnly = expandedCheckboxItems.map(
    (item: any, index: number) => {
      // Safely handle empty filter results
      const filteredItems = documentData.mapping_form_data_id.mapping_checkbox.filter(
        (flowItem: any) =>
          flowItem.step_index == item.step_index &&
          parseInt(flowItem.top) == parseInt(item.position.y) &&
          parseInt(flowItem.left) == parseInt(item.position.x)
      );
      const { llx, lly, urx, ury } = filteredItems[0] || {};
      const checkboxCoordinates = documentData.mapping_form_data_id?.mapping_checkbox
      ?.flatMap((flowItem: any) => 
        flowItem.option_elements?.filter((dateElement: any) => 
          flowItem.step_index == item.step_index &&
          dateElement.checkbox_id == item.id
        ) || []
      ) || [];
      const completeConfig = getCompleteElementConfig(item.type, item.config);
      const completeStyle = getCompleteDefaultStyle(
        item.type || "checkbox",
        item.style,
        undefined // computedDefaults can be added here if available
      );
      // console.log('WWW completeStyle', checkboxCoordinates, index)
      // ✅ Convert to API format using centralized conversion
      const apiStyleFormat = convertStyleToApiFormat(
        completeStyle,
        item.type || "checkbox"
      );

      // 🎯 CENTRALIZED: Use default checkbox size from defaultStyle.ts
      const defaultCheckboxSize = getDefaultElementSize("checkbox");

      // 📏 Convert width/height from style properties to string
      const widthFromStyle = item.style?.width
        ? typeof item.style.width === "string"
          ? item.style.width.replace("px", "")
          : item.style.width.toString()
        : defaultCheckboxSize.width.toString();

      const heightFromStyle = item.style?.height
        ? typeof item.style.height === "string"
          ? item.style.height.replace("px", "")
          : item.style.height.toString()
        : defaultCheckboxSize.height.toString();

      return {
        type: "checkbox",
        id: item.id,
        index: item.expandedIndex, // Use expandedIndex for uniqueness
        step_index: parseInt(item.step_index || 0),
        llx: llx?.toString() || "0",
        lly: lly?.toString() || "0",
        urx: urx?.toString() || "0",
        ury: ury?.toString() || "0",
        left: (item.position?.x || "0").toString(),
        top: (item.position?.y || "0").toString(),
        scale_X: (item.position?.x || 0).toString(),
        scale_Y: (item.position?.y || 0).toString(),
        width: widthFromStyle,
        height: heightFromStyle,
        text: item.text || item.label || `ตัวเลือก ${parseInt(item.step_index || 0)}`,
        required: completeConfig.required?.toString() || CONFIG_CONSTANTS.DEFAULT_REQUIRED.toString(),
        checkboxType: item.type || "checkbox",
        actorId: item.actorId || item.step_index,
        pageNumber: item.pageNumber || 1,
        font_family: apiStyleFormat.font_family,
        font_size: apiStyleFormat.font_size,
        font_weight: apiStyleFormat.font_weight,
        font_style: apiStyleFormat.font_style,
        text_align: apiStyleFormat.text_align,
        text_decoration: apiStyleFormat.text_decoration,
        justify_content: apiStyleFormat.justify_content,
        underline: apiStyleFormat.underline,
        fill: apiStyleFormat.fill,
        background_color: apiStyleFormat.background_color,
        border_color: apiStyleFormat.border_color,
        border_width: apiStyleFormat.border_width,
        border_style: apiStyleFormat.border_style,
        border_radius: apiStyleFormat.border_radius,
        padding: apiStyleFormat.padding,
        margin: apiStyleFormat.margin,
        value: Array.isArray(item.value) ? item.value.length > 0 : Boolean(item.value), // Convert to boolean
        checkboxOptions: item.checkboxOptions || completeConfig.checkboxOptions || ["ตัวเลือกที่ 1"],
        checkedValues: Array.isArray(item.value) ? item.value : [],
        image_base64: convertCheckboxToImage(
          {
            width: widthFromStyle,
            height: heightFromStyle,
            font_family: apiStyleFormat.font_family,
            font_size: apiStyleFormat.font_size,
            font_weight: apiStyleFormat.font_weight,
            font_style: apiStyleFormat.font_style,
            text_align: apiStyleFormat.text_align as
              | "left"
              | "center"
              | "right",
            fill: apiStyleFormat.fill,
            // background_color: apiStyleFormat.background_color,
            padding: apiStyleFormat.padding,
            box_size: undefined,
            box_border_color: apiStyleFormat.border_color,
            box_border_width: parseInt(apiStyleFormat.border_width || "1"),
            check_color: "#0153BD",
          },
          item.checkboxOptions ||
            completeConfig.checkboxOptions || ["ตัวเลือกที่ 1"],
          Array.isArray(item.value) ? item.value : []
        ).replace(/data:image\/png;base64,/, ""),
      };
    }
  );


  const mappingRadioFromDataOnly = expandedRadioItems.map(
    (item: any, index: number) => {
        // Safely handle empty filter results
        const filteredItems = documentData.mapping_form_data_id.mapping_radiobox.filter(
          (flowItem: any) =>
            flowItem.step_index == item.step_index &&
            parseInt(flowItem.top) == parseInt(item.position.y) &&
            parseInt(flowItem.left) == parseInt(item.position.x)
        );
        const { llx, lly, urx, ury } = filteredItems[0] || {};
        const radioCoordinates = documentData.mapping_form_data_id?.mapping_radiobox
        ?.flatMap((flowItem: any) => 
          flowItem.option_elements?.filter((dateElement: any) => 
            flowItem.step_index == item.step_index &&
            dateElement.radio_id == item.id
          ) || []
        ) || [];
      // ✅ Get complete config using centralized system
      const completeConfig = getCompleteElementConfig(item.type, item.config);

      // ✅ Get complete default style using the new system
      const completeStyle = getCompleteDefaultStyle(
        item.type || "radio",
        item.style,
        undefined // computedDefaults can be added here if available
      );

      // ✅ Convert to API format using centralized conversion
      const apiStyleFormat = convertStyleToApiFormat(
        completeStyle,
        item.type || "radio"
      );

      // 🎯 CENTRALIZED: Use default radio size from defaultStyle.ts
      const defaultRadioSize = getDefaultElementSize("radio");

      // 📏 Convert width/height from style properties to string
      const widthFromStyle = item.style?.width
        ? typeof item.style.width === "string"
          ? item.style.width.replace("px", "")
          : item.style.width.toString()
        : defaultRadioSize.width.toString();

      const heightFromStyle = item.style?.height
        ? typeof item.style.height === "string"
          ? item.style.height.replace("px", "")
          : item.style.height.toString()
        : defaultRadioSize.height.toString();

      return {
        type: "radio",
        id: item.id,
        index: index, // Use index instead of expandedIndex
        step_index: parseInt(item.step_index || 0),
        llx: llx?.toString() || "0",
        lly: lly?.toString() || "0",
        urx: urx?.toString() || "0",
        ury: ury?.toString() || "0",
        left: (item.position?.x || "0").toString(),
        top: (item.position?.y || "0").toString(),
        scale_X: (item.position?.x || 0).toString(),
        scale_Y: (item.position?.y || 0).toString(),
        width: widthFromStyle,
        height: heightFromStyle,
        text: item.text || item.label || `ตัวเลือก ${parseInt(item.step_index || 0)}`,
        required: completeConfig.required?.toString() || CONFIG_CONSTANTS.DEFAULT_REQUIRED.toString(),
        radioType: item.type || "radio",
        actorId: item.actorId || item.step_index,
        pageNumber: item.pageNumber || 1,
        font_family: apiStyleFormat.font_family,
        font_size: apiStyleFormat.font_size,
        font_weight: apiStyleFormat.font_weight,
        font_style: apiStyleFormat.font_style,
        text_align: apiStyleFormat.text_align,
        text_decoration: apiStyleFormat.text_decoration,
        justify_content: apiStyleFormat.justify_content,
        underline: apiStyleFormat.underline,
        fill: apiStyleFormat.fill,
        background_color: apiStyleFormat.background_color,
        border_color: apiStyleFormat.border_color,
        border_width: apiStyleFormat.border_width,
        border_style: apiStyleFormat.border_style,
        border_radius: apiStyleFormat.border_radius,
        padding: apiStyleFormat.padding,
        margin: apiStyleFormat.margin,
        value: typeof item.value === "string" ? item.value : "",
        radioOptions: item.radioOptions || completeConfig.radioOptions || ["ตัวเลือกที่ 1"],
        selectedValue: typeof item.value === "string" ? item.value : "",
        image_base64: convertRadioToImage(
          {
            width: widthFromStyle,
            height: heightFromStyle,
            font_family: apiStyleFormat.font_family,
            font_size: apiStyleFormat.font_size,
            font_weight: apiStyleFormat.font_weight,
            font_style: apiStyleFormat.font_style,
            text_align: apiStyleFormat.text_align as
              | "left"
              | "center"
              | "right",
            fill: apiStyleFormat.fill,
            // background_color: apiStyleFormat.background_color,
            padding: apiStyleFormat.padding,
            box_size: undefined,
            box_border_color: apiStyleFormat.border_color,
            box_border_width: parseInt(apiStyleFormat.border_width || "1"),
            check_color: "#000000",
          },
          item.radioOptions || completeConfig.radioOptions || ["ตัวเลือกที่ 1"],
          item.value !== "" ? item.value : ""
        ).replace(/data:image\/png;base64,/, ""),
      };
    }
  );

  // 🎯 Map date items (days, months, years grouped as date)
  const dateItems = allPageItems.filter((item: any) => 
    item.type === "days" || item.type === "months" || item.type === "years"
  );
  const expandedDateItems = expandAllStepItems(dateItems, availableStepIndices);
  
  // 🎯 FIXED: Group date items by timestamp + step_index to separate different approvers
  const dateGroups = new Map<string, any[]>();
  expandedDateItems.forEach((item: any) => {
    // Extract timestamp from ID pattern: date-1-days-1756356191710-1
    const idParts = item.id.split('-');
    let timestamp = '';
    for (let i = 0; i < idParts.length; i++) {
      if (idParts[i].length >= 10 && /^\d+$/.test(idParts[i])) {
        timestamp = idParts[i];
        break;
      }
    }
    
    // 🎯 FIXED: Use composite key (timestamp + step_index) to separate groups per approver
    const groupKey = `${timestamp}-step-${item.step_index}`;
    
    if (timestamp) {
      if (!dateGroups.has(groupKey)) {
        dateGroups.set(groupKey, []);
      }
      dateGroups.get(groupKey)!.push(item);
    }
  });

  const mappingDateFromDataOnly = Array.from(dateGroups.entries()).map(([groupKey, dateGroup], groupIndex) => {
    // console.log("BBB dateGroup =>>", dateGroup);
    // Sort by type order: days, months, years
    const sortedGroup = dateGroup.sort((a, b) => {
      const order = { "days": 0, "months": 1, "years": 2 };
      return order[a.type as keyof typeof order] - order[b.type as keyof typeof order];
    });

    // Extract individual date values
    const daysItem = sortedGroup.find(item => item.type === "days");
    const monthsItem = sortedGroup.find(item => item.type === "months");
    const yearsItem = sortedGroup.find(item => item.type === "years");

    // Get date configuration from context or defaults
    const dateConfig = {
      header: daysItem?.label || daysItem?.text || CONFIG_CONSTANTS.DATE_HEADER,
      required: daysItem?.required !== undefined ? daysItem.required : CONFIG_CONSTANTS.DATE_REQUIRED,
      format: CONFIG_CONSTANTS.DATE_FORMAT,
      currentDate: CONFIG_CONSTANTS.DATE_CURRENT_DATE,
      days: daysItem?.value || CONFIG_CONSTANTS.DATE_DAYS_PLACEHOLDER,
      months: monthsItem?.value || CONFIG_CONSTANTS.DATE_MONTHS_PLACEHOLDER,
      years: yearsItem?.value || CONFIG_CONSTANTS.DATE_YEARS_PLACEHOLDER,
    };

    // 🎯 TRY TO EXTRACT ACTUAL FORMAT FROM DATE ELEMENTS' CONTEXT
    if (daysItem?.value && typeof daysItem.value === 'string' && daysItem.value.includes('"format"')) {
      try {
        const parsedValue = JSON.parse(daysItem.value);
        if (parsedValue.dateContext?.format) {
          dateConfig.format = parsedValue.dateContext.format;
        }
        if (parsedValue.dateContext?.useCurrentDate !== undefined) {
          dateConfig.currentDate = parsedValue.dateContext.useCurrentDate;
        }
      } catch (error) {
        enqueueSnackbar(`🎯 [apiUtils] Could not parse date context from value: ${daysItem.value}`, {
          variant: "error",
          autoHideDuration: 3000,
        });
      }
    }

    // 🎯 NEW STRUCTURE: Create individual date elements array
    const dateElements = [];
    let elementIndex = 0;

    // Add days element
    if (daysItem) {
      // ✅ Get complete config using centralized system for days item
      const completeConfig = getCompleteElementConfig(daysItem.type, daysItem.config);

      // ✅ Get complete default style using the new system for days item
      const completeStyle = getCompleteDefaultStyle(
        daysItem.type || "days",
        daysItem.style,
        undefined
      );

      // ✅ Convert to API format using centralized conversion for days item
      const apiStyleFormat = convertStyleToApiFormat(
        completeStyle,
        daysItem.type || "days"
      );

      // 🎯 CENTRALIZED: Use default date size from defaultStyle.ts for days
      const defaultDateSize = getDefaultElementSize("days");

      // 📏 Convert width/height from style properties to string for days item
      const widthFromStyle = daysItem.style?.width
        ? typeof daysItem.style.width === "string"
          ? daysItem.style.width.replace("px", "")
          : daysItem.style.width.toString()
        : defaultDateSize.width.toString();

      const heightFromStyle = daysItem.style?.height
        ? typeof daysItem.style.height === "string"
          ? daysItem.style.height.replace("px", "")
          : daysItem.style.height.toString()
        : defaultDateSize.height.toString();
      // 🎯 ดึงข้อมูล llx, lly, urx, ury จาก documentData.mapping_form_data_id.mapping_date_time สำหรับ days
      // ค้นหา date_elements ที่มี date_type === "days" และตรงกับ step_index, position
      const daysCoordinates = documentData.mapping_form_data_id?.mapping_date_time
        ?.flatMap((flowItem: any) => 
          flowItem.date_elements?.filter((dateElement: any) => 
            dateElement.date_type === "days" &&
            flowItem.step_index == daysItem.step_index &&
            dateElement.date_element_id == daysItem.id
          ) || []
        ) || [];

      // ดึงค่า coordinates จาก date_element แรกที่พบ (หรือใช้ default values)
      const daysLlx = daysCoordinates[0]?.llx || daysItem.coordinates?.llx || "0";
      const daysLly = daysCoordinates[0]?.lly || daysItem.coordinates?.lly || "0";
      const daysUrx = daysCoordinates[0]?.urx || daysItem.coordinates?.urx || "0";
      const daysUry = daysCoordinates[0]?.ury || daysItem.coordinates?.ury || "0";

      // console.log('🎯 Days coordinates found:', {
      //   step_index: daysItem.step_index,
      //   position: { x: daysItem.position?.x, y: daysItem.position?.y },
      //   coordinates: { llx: daysLlx, lly: daysLly, urx: daysUrx, ury: daysUry },
      //   found_elements: daysCoordinates.length
      // });
      dateElements.push({
        type: "days", // 🎯 เพิ่ม type field
        index: elementIndex++,
        step_index: parseInt(daysItem.step_index || "0"), // ✅ Convert to number
        llx: daysLlx?.toString() || daysItem.coordinates?.llx?.toString() || "0",
        lly: daysLly?.toString() || daysItem.coordinates?.lly?.toString() || "0",
        urx: daysUrx?.toString() || daysItem.coordinates?.urx?.toString() || "0",
        ury: daysUry?.toString() || daysItem.coordinates?.ury?.toString() || "0",
        left: (daysItem.position?.x || "0").toString(),
        top: (daysItem.position?.y || "0").toString(),
        scale_X: (daysItem.position?.x || 0).toString(),
        scale_Y: (daysItem.position?.y || 0).toString(),
        width: widthFromStyle,
        height: heightFromStyle,
        text: "วัน",
        value: daysItem.value || "",
        required: dateConfig.required?.toString() || CONFIG_CONSTANTS.DATE_REQUIRED.toString(), // 🎯 เพิ่ม required field
        pageNumber: daysItem.pageNumber || 1, // ✅ Add pageNumber
        font_family: apiStyleFormat.font_family,
        font_size: apiStyleFormat.font_size,
        font_weight: apiStyleFormat.font_weight,
        font_style: apiStyleFormat.font_style,
        text_align: apiStyleFormat.text_align,
        text_decoration: apiStyleFormat.text_decoration,
        justify_content: apiStyleFormat.justify_content,
        underline: apiStyleFormat.underline,
        fill: apiStyleFormat.fill,
        background_color: apiStyleFormat.background_color,
        border_color: apiStyleFormat.border_color,
        border_width: apiStyleFormat.border_width,
        border_style: apiStyleFormat.border_style,
        border_radius: apiStyleFormat.border_radius,
        padding: apiStyleFormat.padding,
        margin: apiStyleFormat.margin,
        date_type: "days",
        date_element_id: daysItem.id,
        image_base64: (() => {
          const imageBase64 = convertTextToImage({
            width: widthFromStyle,
            height: heightFromStyle,
            text: daysItem.value || "วัน",
            required: dateConfig.required?.toString() || "false",
            max_characters: "2",
            max_lines: "1",
            font_family: apiStyleFormat.font_family,
            font_size: apiStyleFormat.font_size,
            font_weight: apiStyleFormat.font_weight,
            font_style: apiStyleFormat.font_style,
            text_align: apiStyleFormat.text_align,
            text_decoration: apiStyleFormat.text_decoration,
            justify_content: apiStyleFormat.justify_content,
            underline: apiStyleFormat.underline,
            fill: apiStyleFormat.fill,
            border_color: apiStyleFormat.border_color,
            border_width: apiStyleFormat.border_width,
            border_style: apiStyleFormat.border_style,
            border_radius: apiStyleFormat.border_radius,
            padding: apiStyleFormat.padding,
            margin: apiStyleFormat.margin,
            value: daysItem.value || "",
          }, daysItem.value || "วัน").replace(/data:image\/png;base64,/, "");
          
          return imageBase64;
        })(),
      });
    }

    // Add months element
    if (monthsItem) {
      // ✅ Get complete config using centralized system for months item
      const completeConfig = getCompleteElementConfig(monthsItem.type, monthsItem.config);

      // ✅ Get complete default style using the new system for months item
      const completeStyle = getCompleteDefaultStyle(
        monthsItem.type || "months",
        monthsItem.style,
        undefined
      );

      // ✅ Convert to API format using centralized conversion for months item
      const apiStyleFormat = convertStyleToApiFormat(
        completeStyle,
        monthsItem.type || "months"
      );

      // 🎯 CENTRALIZED: Use default date size from defaultStyle.ts for months
      const defaultDateSize = getDefaultElementSize("months");

      // 📏 Convert width/height from style properties to string for months item
      const widthFromStyle = monthsItem.style?.width
        ? typeof monthsItem.style.width === "string"
          ? monthsItem.style.width.replace("px", "")
          : monthsItem.style.width.toString()
        : defaultDateSize.width.toString();

      const heightFromStyle = monthsItem.style?.height
        ? typeof monthsItem.style.height === "string"
          ? monthsItem.style.height.replace("px", "")
          : monthsItem.style.height.toString()
        : defaultDateSize.height.toString();

      // 🎯 ดึงข้อมูล llx, lly, urx, ury จาก documentData.mapping_form_data_id.mapping_date_time สำหรับ months
      // ค้นหา date_elements ที่มี date_type === "months" และตรงกับ step_index, position
      const monthsCoordinates = documentData.mapping_form_data_id?.mapping_date_time
        ?.flatMap((flowItem: any) => 
          flowItem.date_elements?.filter((dateElement: any) => 
            dateElement.date_type === "months" &&
            flowItem.step_index == monthsItem.step_index &&
            dateElement.date_element_id == monthsItem.id
          ) || []
        ) || [];

      // ดึงค่า coordinates จาก date_element แรกที่พบ (หรือใช้ default values)
      const monthsLlx = monthsCoordinates[0]?.llx || monthsItem.coordinates?.llx || "0";
      const monthsLly = monthsCoordinates[0]?.lly || monthsItem.coordinates?.lly || "0";
      const monthsUrx = monthsCoordinates[0]?.urx || monthsItem.coordinates?.urx || "0";
      const monthsUry = monthsCoordinates[0]?.ury || monthsItem.coordinates?.ury || "0";

      // console.log('🎯 Months coordinates found:', {
      //   step_index: monthsItem.step_index,
      //   position: { x: monthsItem.position?.x, y: monthsItem.position?.y },
      //   coordinates: { llx: monthsLlx, lly: monthsLly, urx: monthsUrx, ury: monthsUry },
      //   found_elements: monthsCoordinates.length
      // });

      dateElements.push({
        type: "months", // 🎯 เพิ่ม type field
        index: elementIndex++,
        step_index: parseInt(monthsItem.step_index || "0"), // ✅ Convert to number
        llx: monthsLlx?.toString() || monthsItem.coordinates?.llx?.toString() || "0",
        lly: monthsLly?.toString() || monthsItem.coordinates?.lly?.toString() || "0",
        urx: monthsUrx?.toString() || monthsItem.coordinates?.urx?.toString() || "0",
        ury: monthsUry?.toString() || monthsItem.coordinates?.ury?.toString() || "0",
        left: (monthsItem.position?.x || "0").toString(),
        top: (monthsItem.position?.y || "0").toString(),
        scale_X: (monthsItem.position?.x || 0).toString(),
        scale_Y: (monthsItem.position?.y || 0).toString(),
        width: widthFromStyle,
        height: heightFromStyle,
        text: "เดือน",
        value: monthsItem.value || "",
        required: dateConfig.required?.toString() || CONFIG_CONSTANTS.DATE_REQUIRED.toString(), // 🎯 เพิ่ม required field
        pageNumber: monthsItem.pageNumber || 1, // ✅ Add pageNumber
        font_family: apiStyleFormat.font_family,
        font_size: apiStyleFormat.font_size,
        font_weight: apiStyleFormat.font_weight,
        font_style: apiStyleFormat.font_style,
        text_align: apiStyleFormat.text_align,
        text_decoration: apiStyleFormat.text_decoration,
        justify_content: apiStyleFormat.justify_content,
        underline: apiStyleFormat.underline,
        fill: apiStyleFormat.fill,
        background_color: apiStyleFormat.background_color,
        border_color: apiStyleFormat.border_color,
        border_width: apiStyleFormat.border_width,
        border_style: apiStyleFormat.border_style,
        border_radius: apiStyleFormat.border_radius,
        padding: apiStyleFormat.padding,
        margin: apiStyleFormat.margin,
        date_type: "months",
        date_element_id: monthsItem.id,
        image_base64: (() => {
          const imageBase64 = convertTextToImage({
            width: widthFromStyle,
            height: heightFromStyle,
            text: monthsItem.value || "เดือน",
            required: dateConfig.required?.toString() || "false",
            max_characters: "2",
            max_lines: "1",
            font_family: apiStyleFormat.font_family,
            font_size: apiStyleFormat.font_size,
            font_weight: apiStyleFormat.font_weight,
            font_style: apiStyleFormat.font_style,
            text_align: apiStyleFormat.text_align,
            text_decoration: apiStyleFormat.text_decoration,
            justify_content: apiStyleFormat.justify_content,
            underline: apiStyleFormat.underline,
            fill: apiStyleFormat.fill,
            border_color: apiStyleFormat.border_color,
            border_width: apiStyleFormat.border_width,
            border_style: apiStyleFormat.border_style,
            border_radius: apiStyleFormat.border_radius,
            padding: apiStyleFormat.padding,
            margin: apiStyleFormat.margin,
            value: monthsItem.value || "",
          }, monthsItem.value || "เดือน").replace(/data:image\/png;base64,/, "");
          
          return imageBase64;
        })(),
      });
    }

    // Add years element
    if (yearsItem) {
      // ✅ Get complete config using centralized system for years item
      const completeConfig = getCompleteElementConfig(yearsItem.type, yearsItem.config);

      // ✅ Get complete default style using the new system for years item
      const completeStyle = getCompleteDefaultStyle(
        yearsItem.type || "years",
        yearsItem.style,
        undefined
      );

      // ✅ Convert to API format using centralized conversion for years item
      const apiStyleFormat = convertStyleToApiFormat(
        completeStyle,
        yearsItem.type || "years"
      );

      // 🎯 CENTRALIZED: Use default date size from defaultStyle.ts for years
      const defaultDateSize = getDefaultElementSize("years");

      // 📏 Convert width/height from style properties to string for years item
      const widthFromStyle = yearsItem.style?.width
        ? typeof yearsItem.style.width === "string"
          ? yearsItem.style.width.replace("px", "")
          : yearsItem.style.width.toString()
        : defaultDateSize.width.toString();

      const heightFromStyle = yearsItem.style?.height
        ? typeof yearsItem.style.height === "string"
          ? yearsItem.style.height.replace("px", "")
          : yearsItem.style.height.toString()
        : defaultDateSize.height.toString();

      // 🎯 ดึงข้อมูล llx, lly, urx, ury จาก documentData.mapping_form_data_id.mapping_date_time สำหรับ years
      // ค้นหา date_elements ที่มี date_type === "years" และตรงกับ step_index, position
      const yearsCoordinates = documentData.mapping_form_data_id?.mapping_date_time
        ?.flatMap((flowItem: any) => 
          flowItem.date_elements?.filter((dateElement: any) => 
            dateElement.date_type === "years" &&
            flowItem.step_index == yearsItem.step_index &&
            dateElement.date_element_id == yearsItem.id
          ) || []
        ) || [];

      // ดึงค่า coordinates จาก date_element แรกที่พบ (หรือใช้ default values)
      const yearsLlx = yearsCoordinates[0]?.llx || yearsItem.coordinates?.llx || "0";
      const yearsLly = yearsCoordinates[0]?.lly || yearsItem.coordinates?.lly || "0";
      const yearsUrx = yearsCoordinates[0]?.urx || yearsItem.coordinates?.urx || "0";
      const yearsUry = yearsCoordinates[0]?.ury || yearsItem.coordinates?.ury || "0";

      // console.log('🎯 Years coordinates found:', {
      //   step_index: yearsItem.step_index,
      //   position: { x: yearsItem.position?.x, y: yearsItem.position?.y },
      //   coordinates: { llx: yearsLlx, lly: yearsLly, urx: yearsUrx, ury: yearsUry },
      //   found_elements: yearsCoordinates.length
      // });

      dateElements.push({
        type: "years", // 🎯 เพิ่ม type field
        index: elementIndex++,
        step_index: parseInt(yearsItem.step_index || "0"), // ✅ Convert to number
        llx: yearsLlx?.toString() || yearsItem.coordinates?.llx?.toString() || "0",
        lly: yearsLly?.toString() || yearsItem.coordinates?.lly?.toString() || "0",
        urx: yearsUrx?.toString() || yearsItem.coordinates?.urx?.toString() || "0",
        ury: yearsUry?.toString() || yearsItem.coordinates?.ury?.toString() || "0",
        left: (yearsItem.position?.x || "0").toString(),
        top: (yearsItem.position?.y || "0").toString(),
        scale_X: (yearsItem.position?.x || 0).toString(),
        scale_Y: (yearsItem.position?.y || 0).toString(),
        width: widthFromStyle,
        height: heightFromStyle,
        text: "ปี",
        value: yearsItem.value || "",
        required: dateConfig.required?.toString() || CONFIG_CONSTANTS.DATE_REQUIRED.toString(), // 🎯 เพิ่ม required field
        pageNumber: yearsItem.pageNumber || 1, // ✅ Add pageNumber
        font_family: apiStyleFormat.font_family,
        font_size: apiStyleFormat.font_size,
        font_weight: apiStyleFormat.font_weight,
        font_style: apiStyleFormat.font_style,
        text_align: apiStyleFormat.text_align,
        text_decoration: apiStyleFormat.text_decoration,
        justify_content: apiStyleFormat.justify_content,
        underline: apiStyleFormat.underline,
        fill: apiStyleFormat.fill,
        background_color: apiStyleFormat.background_color,
        border_color: apiStyleFormat.border_color,
        border_width: apiStyleFormat.border_width,
        border_style: apiStyleFormat.border_style,
        border_radius: apiStyleFormat.border_radius,
        padding: apiStyleFormat.padding,
        margin: apiStyleFormat.margin,
        date_type: "years",
        date_element_id: yearsItem.id,
        image_base64: (() => {
          const imageBase64 = convertTextToImage({
            width: widthFromStyle,
            height: heightFromStyle,
            text: yearsItem.value || "ปี",
            required: dateConfig.required?.toString() || "false",
            max_characters: "4",
            max_lines: "1",
            font_family: apiStyleFormat.font_family,
            font_size: apiStyleFormat.font_size,
            font_weight: apiStyleFormat.font_weight,
            font_style: apiStyleFormat.font_style,
            text_align: apiStyleFormat.text_align,
            text_decoration: apiStyleFormat.text_decoration,
            justify_content: apiStyleFormat.justify_content,
            underline: apiStyleFormat.underline,
            fill: apiStyleFormat.fill,
            border_color: apiStyleFormat.border_color,
            border_width: apiStyleFormat.border_width,
            border_style: apiStyleFormat.border_style,
            border_radius: apiStyleFormat.border_radius,
            padding: apiStyleFormat.padding,
            margin: apiStyleFormat.margin,
            value: yearsItem.value || "",
          }, yearsItem.value || "ปี").replace(/data:image\/png;base64,/, "");

          return imageBase64;
        })(),
      });
    }

    // 🎯 FIXED: Extract original timestamp from groupKey
    const originalTimestamp = groupKey.split('-step-')[0];
    
    // 🎯 RETURN NEW STRUCTURE: Header object with date elements array
    return {
      header: dateConfig.header || CONFIG_CONSTANTS.DATE_HEADER,
      required: dateConfig.required || CONFIG_CONSTANTS.DATE_REQUIRED,
      format: dateConfig.format || CONFIG_CONSTANTS.DATE_FORMAT,
      currentDate: dateConfig.currentDate || CONFIG_CONSTANTS.DATE_CURRENT_DATE,
      date_group_timestamp: originalTimestamp,
      date_group_index: groupIndex,
      date_group_size: sortedGroup.length,
      is_complete_group: sortedGroup.length === 3,
      date_elements: dateElements,
    };
  });

  // Map more-file items
  const mappingMoreFileFromDataOnly = expandedMoreFileItems.map(
    (item: any, index: number) => {
      // ✅ Get complete config using centralized system
      const completeConfig = getCompleteElementConfig(item.type, item.config);

      const result = {
        type: "more-file",
        index: index, // Use index instead of expandedIndex
        step_index: parseInt(item.step_index || 0),
        text: item.text || item.typeName || completeConfig.typeName || `ไฟล์เพิ่มเติม ${item.label}`,
        required: item.config?.required ?? item.required ?? completeConfig.required ?? CONFIG_CONSTANTS.DEFAULT_REQUIRED,
        actorId: item.actorId || item.step_index,
        type_name: item.typeName || completeConfig.typeName || CONFIG_CONSTANTS.MORE_FILE_DEFAULT_TYPE_NAME,
        file_accept: (item.fileAccept || completeConfig.fileAccept || []).join(","),
        is_embedded: item.isEmbedded ?? completeConfig.isEmbedded ?? CONFIG_CONSTANTS.MORE_FILE_DEFAULT_IS_EMBEDDED,
        max_file_size: item.maxFileSize?.toString() || completeConfig.maxFileSize?.toString() || CONFIG_CONSTANTS.MORE_FILE_MAX_SIZE.toString(),
        file_size: item.maxFileSize || completeConfig.maxFileSize || CONFIG_CONSTANTS.MORE_FILE_MAX_SIZE,
      };

      return result;
    }
  );

  const filteredFlowData = documentData.flow_data
    .filter((flowItem: any) => flowItem.status !== "W")
    .map((flowItem: any) => flowItem.index.toString());

  const mappingSignatureFromData =
    documentData.mapping_form_data_id?.mapping_signature
      ?.filter((signature: any) =>
        filteredFlowData.includes(signature.step_index.toString())
      )
      .map((signature: any, index: number) => {
        const defaultSize = getDefaultElementSize("signature");
        const fallbackStyle = {
          ...BASE_DEFAULT_STYLE,
          width: defaultSize.width,
          height: defaultSize.height,
        };
        const apiStyleFormat = convertStyleToApiFormat(
          fallbackStyle,
          "signature"
        );

        return {
          index: index, //beware  signature.index || 0
          step_index: parseInt(signature.step_index || 0),
          llx: (signature.llx || "0").toString(),
          lly: (signature.lly || "0").toString(),
          urx: (signature.urx || "0").toString(),
          ury: (signature.ury || "0").toString(),
          left: (signature.left || "0").toString(),
          top: (signature.top || "0").toString(),
          scale_X: (signature.scale_X || "1").toString(),
          scale_Y: (signature.scale_Y || "1").toString(),
          angle: (signature.angle || "0").toString(),
          width: (signature.width || apiStyleFormat.width).toString(),
          height: (signature.height || apiStyleFormat.height).toString(),
          text: (signature.text || `ลายเซ็น ${signature.step_index}`).toString(),
          required: (signature.required || "false").toString(),
          signatureType: (signature.signatureType || "signature").toString(),
          value: (signature.value || "").toString(),
          actorId: (signature.actorId || signature.step_index).toString(),
          pageNumber: signature.pageNumber || 1,
          font_family: (signature.font_family || apiStyleFormat.font_family).toString(),
          font_size: parseInt(signature.font_size || apiStyleFormat.font_size),
          font_weight: (signature.font_weight || apiStyleFormat.font_weight).toString(),
          font_style: (signature.font_style || apiStyleFormat.font_style).toString(),
          text_align: (signature.text_align || apiStyleFormat.text_align).toString(),
          text_decoration: (signature.text_decoration || apiStyleFormat.text_decoration).toString(),
          justify_content: (signature.justify_content || apiStyleFormat.justify_content).toString(),
          underline: signature.underline || apiStyleFormat.underline,
          fill: (signature.fill || apiStyleFormat.fill).toString(),
          background_color: (signature.background_color || apiStyleFormat.background_color).toString(),
          border_color: (signature.border_color || apiStyleFormat.border_color).toString(),
          border_width: (signature.border_width || apiStyleFormat.border_width).toString(),
          border_style: (signature.border_style || apiStyleFormat.border_style).toString(),
          border_radius: (signature.border_radius || apiStyleFormat.border_radius).toString(),
          padding: (signature.padding || apiStyleFormat.padding).toString(),
          margin: (signature.margin || apiStyleFormat.margin).toString(),
          // image_base64: (signature.image_base64 || "").toString()
        };
      });

  const mappingCheckboxFromData =
    documentData.mapping_form_data_id?.mapping_checkbox
      ?.filter((checkbox: any) =>
        filteredFlowData.includes(checkbox.step_index.toString())
      )
      .map((checkbox: any, index: number) => {
        const defaultSize = getDefaultElementSize("checkbox");
        const fallbackStyle = {
          ...BASE_DEFAULT_STYLE,
          width: defaultSize.width,
          height: defaultSize.height,
        };
        const apiStyleFormat = convertStyleToApiFormat(
          fallbackStyle,
          "checkbox"
        );

        return {
          index: index,
          id: checkbox.id,
          step_index: parseInt(checkbox.step_index || 0),
          llx: (checkbox.llx || "0").toString(),
          lly: (checkbox.lly || "0").toString(),
          urx: (checkbox.urx || "0").toString(),
          ury: (checkbox.ury || "0").toString(),
          left: (checkbox.left || "0").toString(),
          top: (checkbox.top || "0").toString(),
          scale_X: (checkbox.scale_X || "1").toString(),
          scale_Y: (checkbox.scale_Y || "1").toString(),
          angle: (checkbox.angle || "0").toString(),
          width: (checkbox.width || apiStyleFormat.width).toString(),
          height: (checkbox.height || apiStyleFormat.height).toString(),
          text: (checkbox.text || `ตัวเลือก ${checkbox.step_index}`).toString(),
          required: (checkbox.required || "false").toString(),
          checkboxType: (checkbox.checkboxType || "checkbox").toString(),
          value: Array.isArray(checkbox.value) ? checkbox.value : [],
          actorId: (checkbox.actorId || checkbox.step_index).toString(),
          pageNumber: checkbox.pageNumber || 1,
          font_family: (checkbox.font_family || apiStyleFormat.font_family).toString(),
          font_size: parseInt(checkbox.font_size || apiStyleFormat.font_size),
          font_weight: (checkbox.font_weight || apiStyleFormat.font_weight).toString(),
          font_style: (checkbox.font_style || apiStyleFormat.font_style).toString(),
          text_align: (checkbox.text_align || apiStyleFormat.text_align).toString(),
          text_decoration: (checkbox.text_decoration || apiStyleFormat.text_decoration).toString(),
          justify_content: (checkbox.justify_content || apiStyleFormat.justify_content).toString(),
          underline: checkbox.underline || apiStyleFormat.underline,
          fill: (checkbox.fill || apiStyleFormat.fill).toString(),
          background_color: (checkbox.background_color || apiStyleFormat.background_color).toString(),
          border_color: (checkbox.border_color || apiStyleFormat.border_color).toString(),
          border_width: (checkbox.border_width || apiStyleFormat.border_width).toString(),
          border_style: (checkbox.border_style || apiStyleFormat.border_style).toString(),
          border_radius: (checkbox.border_radius || apiStyleFormat.border_radius).toString(),
          padding: (checkbox.padding || apiStyleFormat.padding).toString(),
          margin: (checkbox.margin || apiStyleFormat.margin).toString(),
          checkboxOptions: Array.isArray(checkbox.checkboxOptions) ? checkbox.checkboxOptions : ["ตัวเลือกที่ 1"],
          checkedValues: Array.isArray(checkbox.checkedValues) ? checkbox.checkedValues : [],
        };
      });

  const mappingRadioFromData =
    documentData.mapping_form_data_id?.mapping_radiobox
      ?.filter((radio: any) =>
        filteredFlowData.includes(radio.step_index.toString())
      )
      .map((radio: any, index: number) => {
        // 🎯 CENTRALIZED: Use default style system for existing radio data mapping
        const defaultSize = getDefaultElementSize("radio");
        const fallbackStyle = {
          ...BASE_DEFAULT_STYLE,
          width: defaultSize.width,
          height: defaultSize.height,
        };
        const apiStyleFormat = convertStyleToApiFormat(fallbackStyle, "radio");

        return {
          index: index,
          id: radio.id,
          step_index: parseInt(radio.step_index || 0),
          llx: (radio.llx || "0").toString(),
          lly: (radio.lly || "0").toString(),
          urx: (radio.urx || "0").toString(),
          ury: (radio.ury || "0").toString(),
          left: (radio.left || "0").toString(),
          top: (radio.top || "0").toString(),
          scale_X: (radio.scale_X || "1").toString(),
          scale_Y: (radio.scale_Y || "1").toString(),
          angle: (radio.angle || "0").toString(),
          width: (radio.width || apiStyleFormat.width).toString(),
          height: (radio.height || apiStyleFormat.height).toString(),
          text: (radio.text || `ตัวเลือก ${radio.step_index}`).toString(),
          required: (radio.required || "false").toString(),
          radioType: (radio.radioType || "radio").toString(),
          value: (radio.value || "").toString(),
          actorId: (radio.actorId || radio.step_index).toString(),
          pageNumber: radio.pageNumber || 1,
          font_family: (radio.font_family || apiStyleFormat.font_family).toString(),
          font_size: parseInt(radio.font_size || apiStyleFormat.font_size),
          font_weight: (radio.font_weight || apiStyleFormat.font_weight).toString(),
          font_style: (radio.font_style || apiStyleFormat.font_style).toString(),
          text_align: (radio.text_align || apiStyleFormat.text_align).toString(),
          text_decoration: (radio.text_decoration || apiStyleFormat.text_decoration).toString(),
          justify_content: (radio.justify_content || apiStyleFormat.justify_content).toString(),
          underline: radio.underline || apiStyleFormat.underline,
          fill: (radio.fill || apiStyleFormat.fill).toString(),
          background_color: (radio.background_color || apiStyleFormat.background_color).toString(),
          border_color: (radio.border_color || apiStyleFormat.border_color).toString(),
          border_width: (radio.border_width || apiStyleFormat.border_width).toString(),
          border_style: (radio.border_style || apiStyleFormat.border_style).toString(),
          border_radius: (radio.border_radius || apiStyleFormat.border_radius).toString(),
          padding: (radio.padding || apiStyleFormat.padding).toString(),
          margin: (radio.margin || apiStyleFormat.margin).toString(),
          radioOptions: Array.isArray(radio.radioOptions)? radio.radioOptions: ["ตัวเลือกที่ 1"],
          selectedValue: (radio.selectedValue || "").toString(),
        };
      });

  // 🎯 STAMP MAPPING - Create stamp mapping from expanded stamp items
  const mappingStampFromDataOnly = expandedStampItems.map((item: FormItem, index: number) => {
    // ✅ Get complete config using centralized system
    const completeConfig = getCompleteElementConfig(item.type, item.config);

    // ✅ Get complete default style using the new system
    const elementStyle: ElementStyle | undefined = item.style
      ? {
          fontFamily: item.style.fontFamily,
          fontSize: typeof item.style.fontSize === "string" ? parseInt(item.style.fontSize) : item.style.fontSize,
          fontWeight: item.style.fontWeight,
          fontStyle: item.style.fontStyle,
          textDecoration: item.style.textDecoration,
          textAlign: item.style.textAlign,
          justifyContent: item.style.justifyContent,
          color: item.style.color,
          backgroundColor: item.style.backgroundColor,
          borderColor: item.style.borderColor,
          borderWidth: typeof item.style.borderWidth === "string" ? parseInt(item.style.borderWidth) : item.style.borderWidth,
          borderStyle: item.style.borderStyle,
          borderRadius: typeof item.style.borderRadius === "string" ? parseInt(item.style.borderRadius) : item.style.borderRadius,
          padding: typeof item.style.padding === "string" ? parseInt(item.style.padding) : item.style.padding,
          margin: typeof item.style.margin === "string" ? parseInt(item.style.margin) : item.style.margin,
          width: typeof item.style.width === "string" ? parseInt(item.style.width) : item.style.width,
          height: typeof item.style.height === "string" ? parseInt(item.style.height) : item.style.height,
        }
      : undefined;

    // ✅ Get complete default style
    const completeStyle = getCompleteDefaultStyle(
      item.type,
      elementStyle,
      undefined
    );

    // ✅ Convert to API format
    const apiStyleFormat = convertStyleToApiFormat(completeStyle, item.type);

    // Extract stamp type and section from ID
    const stampType = item.stampType || (item.id.includes('-') ? 
      (parseInt(item.id.split('-')[2]) === 0 ? "ต้นสัญญา" : "คู่สัญญา") : "ต้นสัญญา");
    const section = item.section || (item.id.includes('-') ? item.id.split('-')[1] : "มาตรา 9");

    return {
      type: "stamp",
      index: index,
      llx: (item.coordinates?.llx || 0).toString(),
      lly: (item.coordinates?.lly || 0).toString(),
      urx: (item.coordinates?.urx || 0).toString(),
      ury: (item.coordinates?.ury || 0).toString(),
      left: (item.position?.x || 0).toString(),
      top: (item.position?.y || 0).toString(),
      scale_X: (item.position?.x || 0).toString(),
      scale_Y: (item.position?.y || 0).toString(),
      width: apiStyleFormat.width,
      height: apiStyleFormat.height,
      text: stampType,
      required: completeConfig.required?.toString() || CONFIG_CONSTANTS.SIGNATURE_REQUIRED.toString(),
      stampType: stampType,
      value: typeof item.value === "string" ? item.value : "",
      pageNumber: item.pageNumber || 1,
      section: section,
      font_family: apiStyleFormat.font_family,
      font_size: apiStyleFormat.font_size,
      font_weight: apiStyleFormat.font_weight,
      font_style: apiStyleFormat.font_style,
      text_align: apiStyleFormat.text_align,
      text_decoration: apiStyleFormat.text_decoration,
      justify_content: apiStyleFormat.justify_content,
      underline: apiStyleFormat.underline,
      fill: apiStyleFormat.fill,
      background_color: apiStyleFormat.background_color,
      border_color: apiStyleFormat.border_color,
      border_width: apiStyleFormat.border_width,
      border_style: apiStyleFormat.border_style,
      border_radius: apiStyleFormat.border_radius,
      padding: apiStyleFormat.padding,
      margin: apiStyleFormat.margin,
    };
  });

  // 🎯 E-SEAL MAPPING - Create e-seal mapping using centralized utilities
  const mappingESealFromDataOnly = expandedESealItems.map((item: FormItem, index: number) => {
    // ✅ Use centralized payload builder
    const basePayload = buildBasePayload(item, item.type, index);

    return {
      type: "eseal",
      ...basePayload,
      text: item.label || `E-Seal ${index + 1}`,
      sealType: (item as any).sealType || "default",
      value: typeof item.value === "string" ? item.value : "",
    };
  });

  // ใช้ flatMap เพื่อ map ข้อมูลจาก flow_data และ mapping_text
  const mappingTextFromData = documentData.mapping_form_data_id?.mapping_text
    ?.filter((text: any) =>
      filteredFlowData.includes(text.step_index.toString())
    )
    .map((text: any, index: number) => {
      // 🎯 CENTRALIZED: Use default style system for existing data mapping
      const defaultSize = getDefaultElementSize("text");
      const fallbackStyle = {
        ...BASE_DEFAULT_STYLE,
        width: defaultSize.width,
        height: defaultSize.height,
      };
      const apiStyleFormat = convertStyleToApiFormat(fallbackStyle, "text");

      return {
        index: index,
        step_index: parseInt(text.step_index || 0),
        llx: (text.llx || "0").toString(),
        lly: (text.lly || "0").toString(),
        urx: (text.urx || "0").toString(),
        ury: (text.ury || "0").toString(),
        left: (text.left || "0").toString(),
        top: (text.top || "0").toString(),
        scale_X: (text.scale_X || 1).toString(),
        scale_Y: (text.scale_Y || 1).toString(),
        angle: (text.angle || "0").toString(),
        width: (text.width || apiStyleFormat.width).toString(),
        height: (text.height || apiStyleFormat.height).toString(),
        text: (text.text || `ข้อความ ${index + 1}`).toString(),
        required: (text.required || "false").toString(),
        max_characters: (text.max_characters || "100").toString(),
        max_lines: (text.max_lines || "1").toString(),
        font_family: (text.font_family || apiStyleFormat.font_family).toString(),
        font_size: parseInt(text.font_size || apiStyleFormat.font_size),
        font_weight: (text.font_weight || apiStyleFormat.font_weight).toString(),
        font_style: (text.font_style || apiStyleFormat.font_style).toString(),
        text_align: (text.text_align || apiStyleFormat.text_align).toString(),
        underline: text.underline || apiStyleFormat.underline,
        fill: (text.fill || apiStyleFormat.fill).toString(),
        background_color: (text.background_color || apiStyleFormat.background_color).toString(),
        value: (text.value || "").toString(),
        pageNumber: text.pageNumber || 1,
        // image_base64: (text.image_base64 || "").toString()
      };
    });

  // ใช้ flatMap เพื่อ map ข้อมูลจาก flow_data และ mapping_more_file
  const mappingMoreFileFromData =
    documentData.mapping_form_data_id?.mapping_more_file
      ?.filter((moreFile: any) =>
        filteredFlowData.includes(moreFile.step_index.toString())
      )
      .map((moreFile: any, index: number) => {
        return {
          index: index,
          actorId: (moreFile.actorId || moreFile.step_index).toString(),
          step_index: parseInt(moreFile.step_index || 0),
          text: (moreFile.text || `ไฟล์เพิ่มเติม ${moreFile.step_index}`).toString(),
          required:moreFile.required ?? CONFIG_CONSTANTS.MORE_FILE_DEFAULT_IS_REQUIRED,
          type_name: (moreFile.type_name || CONFIG_CONSTANTS.MORE_FILE_DEFAULT_TYPE_NAME).toString(),
          file_accept: (moreFile.file_accept || "").toString(),
          is_embedded:moreFile.is_embedded ??CONFIG_CONSTANTS.MORE_FILE_DEFAULT_IS_EMBEDDED,
          max_file_size: (moreFile.max_file_size || CONFIG_CONSTANTS.MORE_FILE_MAX_SIZE).toString(),
          file_size:parseInt(moreFile.max_file_size) ||CONFIG_CONSTANTS.MORE_FILE_MAX_SIZE,
        };
      });

  // 🎯 Create new more-file payload structure with new API format
  const moreFilePayload = createMoreFilePayload(
    allPageItems,
    documentData?.document_id
  );

  // 🎯 NEW: Create mapping_more_file with new API structure
  const mappingMoreFileApiPayload = (() => {
    // Filter valid more file data
    const filteredMoreFiles =
      documentData.mapping_form_data_id?.mapping_more_file?.filter(
        (moreFile: any) =>
          filteredFlowData.includes(moreFile.step_index.toString())
      ) || [];

    // Group by step_index first
    const stepIndexMap = new Map<number, any[]>();

    filteredMoreFiles.forEach((moreFile: any) => {
      const stepIndex = parseInt(moreFile.step_index || 0);
      if (!stepIndexMap.has(stepIndex)) {
        stepIndexMap.set(stepIndex, []);
      }
      stepIndexMap.get(stepIndex)!.push(moreFile);
    });

    // Convert to desired structure
    return Array.from(stepIndexMap.entries()).map(([stepIndex, moreFiles]) => {
      const typeData = moreFiles
        .map((moreFile: any, typeIndex: number) => {
          // Handle both new structure (type_data array) and old structure (single file)
          if (Array.isArray(moreFile.type_data)) {
            return moreFile.type_data.map(
              (typeItem: any, subIndex: number) => ({
                type_index: typeIndex * 10 + subIndex, // Ensure unique type_index
                type_name: (typeItem.type_name ||CONFIG_CONSTANTS.MORE_FILE_DEFAULT_TYPE_NAME).toString(),
                type: Array.isArray(typeItem.type)? typeItem.type: typeItem.file_accept? typeItem.file_accept.split(",").map((t: string) => t.trim()): [],
                is_required:typeItem.is_required ??typeItem.required ??CONFIG_CONSTANTS.MORE_FILE_DEFAULT_IS_REQUIRED,
                file_data: typeItem.file_data || [],
                is_embedded: typeItem.is_embedded ??CONFIG_CONSTANTS.MORE_FILE_DEFAULT_IS_EMBEDDED,
                file_size:parseInt(typeItem.file_size || typeItem.max_file_size) ||CONFIG_CONSTANTS.MORE_FILE_MAX_SIZE,
              })
            );
          } else {
            // Handle old structure - convert to new structure
            return {
              type_index: typeIndex,
              type_name: (moreFile.type_name ||CONFIG_CONSTANTS.MORE_FILE_DEFAULT_TYPE_NAME).toString(),
              type:moreFile.type || moreFile.file_accept ? Array.isArray(moreFile.type) ? moreFile.type : moreFile.file_accept.split(",").map((type: string) => type.trim()) : [],
              is_required:moreFile.required ??moreFile.is_required ??CONFIG_CONSTANTS.MORE_FILE_DEFAULT_IS_REQUIRED,
              file_data: moreFile.file_data || [],
              is_embedded:moreFile.is_embedded ??CONFIG_CONSTANTS.MORE_FILE_DEFAULT_IS_EMBEDDED,
              file_size:parseInt(moreFile.max_file_size || moreFile.file_size) ||CONFIG_CONSTANTS.MORE_FILE_MAX_SIZE,
            };
          }
        })
        .flat(); // Flatten in case of nested arrays

      return {
        step_index: stepIndex,
        type_data: typeData,
      };
    });
  })();

  return {
    mappingSignature: mappingSignatureFromDataOnly,
    mappingText: mappingTextFromDataOnly,
    mappingCheckbox: mappingCheckboxFromDataOnly, 
    mappingRadio: mappingRadioFromDataOnly, 
    mappingDate: mappingDateFromDataOnly, 
    mappingMoreFile: mappingMoreFileFromDataOnly,
    mappingStamp: mappingStampFromDataOnly,
    mappingESeal: mappingESealFromDataOnly,
    mappingSignaturePayload: [ ...mappingSignatureFromData, ...mappingSignatureFromDataOnly, ].sort((a, b) => a.step_index - b.step_index),
    mappingTextPayload: [ ...mappingTextFromData, ...mappingTextFromDataOnly, ].sort((a, b) => a.step_index - b.step_index),
    mappingCheckboxPayload: [ ...mappingCheckboxFromData, ...mappingCheckboxFromDataOnly, ].sort((a, b) => a.step_index - b.step_index), 
    mappingRadioPayload: [ ...mappingRadioFromData, ...mappingRadioFromDataOnly, ].sort((a, b) => a.step_index - b.step_index), 
    mappingDatePayload: [ ...mappingDateFromDataOnly,], 
    mappingMoreFilePayload: [ ...mappingMoreFileFromData, ...mappingMoreFileFromDataOnly, ].sort((a, b) => a.step_index - b.step_index),
    mappingStampPayload: [ ...mappingStampFromDataOnly,],
    mappingESealPayload: [ ...mappingESealFromDataOnly,],
    moreFileApiPayload: moreFilePayload,
    mappingMoreFileApiPayload: mappingMoreFileApiPayload,
  };
}

/**
 * Create More File Payload according to new API structure
 * Groups more-file configs by step_index and organizes by type
 *
 * @param allPageItems - Form items from all pages
 * @param documentId - Document ID for the payload
 * @returns MoreFilePayload with new structure
 */
function createMoreFilePayload(
  allPageItems: FormItem[],
  documentId?: string
): MoreFilePayload {
  // Get all available step indices for "all" mapping
  const stepIndicesSet = new Set<number>();
  allPageItems.forEach((item) => {
    if (item.step_index && item.step_index !== "all") {
      stepIndicesSet.add(parseInt(item.step_index));
    }
  });
  const availableStepIndices = Array.from(stepIndicesSet);

  // Filter more-file items
  const moreFileItems = allPageItems.filter(
    (item: any) => item.type === "more-file"
  );

  // Expand items with step_index "all" to all available step indices
  const expandedMoreFileItems: any[] = [];
  moreFileItems.forEach((item: any, originalIndex: number) => {
    if (item.step_index === "all") {
      // Create copies for each available step index
      availableStepIndices.forEach(
        (availableStepIndex: number, copyIndex: number) => {
          expandedMoreFileItems.push({
            ...item,
            step_index: availableStepIndex,
            actorId: availableStepIndex.toString(),
            originalIndex: originalIndex,
            copyIndex: copyIndex,
            expandedIndex: expandedMoreFileItems.length,
          });
        }
      );
    } else {
      // Keep original item
      expandedMoreFileItems.push({
        ...item,
        originalIndex: originalIndex,
        copyIndex: 0,
        expandedIndex: expandedMoreFileItems.length,
      });
    }
  });

  // Group by step_index
  const stepDataMap = new Map<number, MoreFileTypeData[]>();

  expandedMoreFileItems.forEach((item: any, index: number) => {
    const stepIndex = parseInt(item.step_index || "0");
    const completeConfig = getCompleteElementConfig(item.type, item.config);

    // Create type data for this item (use item properties first, then fallback to config)
    const typeData: MoreFileTypeData = {
      type_index: index,
      type_name: item.typeName || completeConfig.typeName || CONFIG_CONSTANTS.MORE_FILE_DEFAULT_TYPE_NAME,
      type: item.fileAccept || completeConfig.fileAccept || [],
      is_required: item.config?.required ?? item.required ?? completeConfig.required ?? CONFIG_CONSTANTS.MORE_FILE_DEFAULT_IS_REQUIRED,
      file_data: [], // Empty initially, will be populated when files are uploaded
      is_embedded: item.isEmbedded ?? completeConfig.isEmbedded ?? CONFIG_CONSTANTS.MORE_FILE_DEFAULT_IS_EMBEDDED,
      file_size: item.maxFileSize || completeConfig.maxFileSize || CONFIG_CONSTANTS.MORE_FILE_MAX_SIZE,
    };

    // Add to step data
    if (!stepDataMap.has(stepIndex)) {
      stepDataMap.set(stepIndex, []);
    }
    stepDataMap.get(stepIndex)!.push(typeData);
  });

  // Convert map to array of MoreFileStepData
  const moreFileData: MoreFileStepData[] = Array.from(
    stepDataMap.entries()
  ).map(([stepIndex, typeData]) => ({
    step_index: stepIndex,
    type_data: typeData,
  }));

  // Create final payload
  const payload: MoreFilePayload = {
    _id: documentId,
    transaction_id: documentId,
    more_file_data: moreFileData,
    created_at: new Date().toISOString(),
    created_by: "system",
    updated_at: new Date().toISOString(),
    updated_by: "system",
  };

  return payload;
}

function convertTextToImage(
  text: TextToImageParams,
  textValue: string
): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const defaultSize = getDefaultElementSize("text");
  const width = typeof text.width === "string" ? parseInt(text.width) : text.width || defaultSize.width;
  const height = typeof text.height === "string" ? parseInt(text.height) : text.height || defaultSize.height;
  const fontSize = typeof text.font_size === "string" ? parseInt(text.font_size) : text.font_size || STYLE_CONSTANTS.DEFAULT_FONT_SIZE;
  const fontFamily = text.font_family || STYLE_CONSTANTS.DEFAULT_FONT_FAMILY;
  const fontWeight = text.font_weight || STYLE_CONSTANTS.DEFAULT_FONT_WEIGHT;
  const fontStyle = text.font_style || STYLE_CONSTANTS.DEFAULT_FONT_STYLE;
  const textAlign = text.text_align || STYLE_CONSTANTS.DEFAULT_TEXT_ALIGN;
  const fillColor = text.fill || STYLE_CONSTANTS.DEFAULT_COLOR;
  const backgroundColor = text.background_color || STYLE_CONSTANTS.TRANSPARENT_BACKGROUND;
  const padding = typeof text.padding === "string" ? parseInt(text.padding) : text.padding || STYLE_CONSTANTS.DEFAULT_PADDING;
  const borderRadius = typeof text.border_radius === "string" ? parseInt(text.border_radius) : text.border_radius || STYLE_CONSTANTS.DEFAULT_BORDER_RADIUS;
  const displayText = textValue || text.text || CONFIG_CONSTANTS.TEXT_PLACEHOLDER;
  const isUnderline = text.underline === true || text.underline === "true";

  // Set canvas size
  canvas.width = width;
  canvas.height = height;

  // Enable high DPI rendering
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  ctx.scale(dpr, dpr);

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Draw background
  if (backgroundColor !== "transparent") {
    ctx.fillStyle = backgroundColor;
    if (borderRadius > 0) {
      // Draw rounded rectangle
      ctx.beginPath();
      ctx.roundRect(0, 0, width, height, borderRadius);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, width, height);
    }
  }

  // Draw border if specified
  if (text.border) {
    const borderParts = text.border.split(" ");
    const borderWidth = parseInt(borderParts[0]) || 1;
    const borderColor = borderParts[2] || "#000000";

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;

    if (borderRadius > 0) {
      ctx.beginPath();
      ctx.roundRect(
        borderWidth / 2,
        borderWidth / 2,
        width - borderWidth,
        height - borderWidth,
        borderRadius
      );
      ctx.stroke();
    } else {
      ctx.strokeRect(
        borderWidth / 2,
        borderWidth / 2,
        width - borderWidth,
        height - borderWidth
      );
    }
  }

  // Set text properties
  ctx.fillStyle = fillColor;
  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textBaseline = "middle";

  // Handle text alignment
  let textX = padding;
  if (textAlign === "center") {
    ctx.textAlign = "center";
    textX = width / 2;
  } else if (textAlign === "right") {
    ctx.textAlign = "right";
    textX = width - padding;
  } else {
    ctx.textAlign = "left";
  }

  // Handle multi-line text with CONFIG_CONSTANTS
  const maxLines = parseInt(
    text.max_lines || CONFIG_CONSTANTS.TEXT_MIN_LINES.toString()
  );
  const maxChars = parseInt(
    text.max_characters || CONFIG_CONSTANTS.TEXT_MAX_LENGTH.toString()
  );

  if (maxLines > 1) {
    // Multi-line text handling
    const words = displayText.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > width - padding * 2 && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }

      if (lines.length >= maxLines - 1) break;
    }

    if (currentLine) lines.push(currentLine);

    // Draw each line
    const lineHeight = fontSize * 1.2;
    const totalTextHeight = lines.length * lineHeight;
    const startY = (height - totalTextHeight) / 2 + lineHeight / 2;

    lines.forEach((line, index) => {
      const y = startY + index * lineHeight;
      ctx.fillText(line.substring(0, maxChars), textX, y);

      // Draw underline if needed
      if (isUnderline) {
        const textWidth = ctx.measureText(line).width;
        let underlineX = textX;
        if (textAlign === "center") underlineX -= textWidth / 2;
        else if (textAlign === "right") underlineX -= textWidth;

        ctx.beginPath();
        ctx.moveTo(underlineX, y + fontSize * 0.1);
        ctx.lineTo(underlineX + textWidth, y + fontSize * 0.1);
        ctx.strokeStyle = fillColor;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  } else {
    // Single line text
    const truncatedText = displayText.substring(0, maxChars);
    const textY = height / 2;

    ctx.fillText(truncatedText, textX, textY);

    // Draw underline if needed
    if (isUnderline) {
      const textWidth = ctx.measureText(truncatedText).width;
      let underlineX = textX;
      if (textAlign === "center") underlineX -= textWidth / 2;
      else if (textAlign === "right") underlineX -= textWidth;

      ctx.beginPath();
      ctx.moveTo(underlineX, textY + fontSize * 0.1);
      ctx.lineTo(underlineX + textWidth, textY + fontSize * 0.1);
      ctx.strokeStyle = fillColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Return base64 image
  return canvas.toDataURL("image/png");
}
// Core renderer for checkbox group to base64 PNG
function renderCheckboxGroupImage(
  params: CheckboxToImageParams,
  options: string[],
  checkedValues: string[]
): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const defaultSize = getDefaultElementSize("checkbox");
  const width = typeof params.width === "string" ? parseInt(params.width) : params.width || defaultSize.width;
  const height = typeof params.height === "string" ? parseInt(params.height) : params.height || Math.max(defaultSize.height, 40);
  const fontSize = typeof params.font_size === "string" ? parseInt(params.font_size) : params.font_size || 12;
  const fontFamily = params.font_family || STYLE_CONSTANTS.DEFAULT_FONT_FAMILY;
  const fontWeight = params.font_weight || STYLE_CONSTANTS.DEFAULT_FONT_WEIGHT;
  const fontStyle = params.font_style || STYLE_CONSTANTS.DEFAULT_FONT_STYLE;
  const textAlign = params.text_align || "left";
  const fillColor = params.fill || STYLE_CONSTANTS.DEFAULT_COLOR;
  const backgroundColor = params.background_color || STYLE_CONSTANTS.TRANSPARENT_BACKGROUND;
  const padding = typeof params.padding === 'string' ? parseInt(params.padding) : (params.padding || 6);
  const optionSpacing = params.option_spacing ?? 6;
  const boxSize = Math.max(10, Math.min(18, params.box_size ?? 16));
  const boxBorderColor = params.box_border_color || '#000000';
  const boxBorderWidth = params.box_border_width ?? 1;
  const checkColor = params.check_color || "#0153BD";

  // Determine canvas height if not explicitly provided, based on options
  const totalHeight = padding * 2 + options.length * (boxSize + optionSpacing);

  // Enable high DPI rendering
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = totalHeight * dpr;
  canvas.style.width = width + "px";
  canvas.style.height = totalHeight + "px";
  ctx.scale(dpr, dpr);

  // Clear canvas
  ctx.clearRect(0, 0, width, totalHeight);

  // Draw background
  if (backgroundColor !== 'transparent') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, totalHeight);
  }

  // Draw border if specified (CSS-like shorthand: '1px solid #000')
  if (params.border) {
    const borderParts = params.border.split(" ");
    const borderWidth = parseInt(borderParts[0]) || 1;
    const borderColor = borderParts[2] || "#000000";
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(
      borderWidth / 2,
      borderWidth / 2,
      width - borderWidth,
      totalHeight - borderWidth
    );
  }

  // Set text properties
  ctx.fillStyle = fillColor;
  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textBaseline = "top";

  // Alignment
  let textBaseX = padding + boxSize + 6; // box + gap
  if (textAlign === "center") {
    ctx.textAlign = "left"; // compute manually with base offset
  } else if (textAlign === "right") {
    ctx.textAlign = "right";
  } else {
    ctx.textAlign = "left";
  }

  // Draw options
  let cursorY = padding;
  options.forEach((opt) => {
    // Box
    ctx.strokeStyle = boxBorderColor;
    ctx.lineWidth = boxBorderWidth;
    ctx.strokeRect(padding, cursorY, boxSize, boxSize);

    // Check mark if selected
    const isChecked = Array.isArray(checkedValues) && checkedValues.includes('checked')
    //Array.isArray(checkedValues) && checkedValues.includes(opt);
  //  console.log('BBB isChecked', isChecked, checkedValues, opt)
    if (isChecked) {
      const pad = Math.max(2, Math.floor(boxSize * 0.2));
      // ctx.strokeStyle = checkColor;
      ctx.lineWidth = Math.max(2, Math.floor(boxSize * 0.15));
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      // Draw check mark
      const startX = padding + pad;
      const startY = cursorY + Math.floor(boxSize * 0.55);
      const midX = padding + Math.floor(boxSize * 0.35);
      const midY = cursorY + boxSize - pad;
      const endX = padding + boxSize - pad;
      const endY = cursorY + pad;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(midX, midY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    // Label
    const textX = textBaseX;
    ctx.fillStyle = fillColor;
    ctx.fillText(opt, textX, cursorY + Math.max(0, (boxSize - fontSize) / 2));

    cursorY += boxSize + optionSpacing;
  });

  return canvas.toDataURL("image/png");
}
// Core renderer for checkbox group to base64 PNG
function renderRadioGroupImage(
  params: RadioToImageParams,
  options: string[],
  checkedValues: string[]
): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const defaultSize = getDefaultElementSize("radio");
  const width = typeof params.width === "string" ? parseInt(params.width) : params.width || defaultSize.width;
  const fontSize = typeof params.font_size === "string" ? parseInt(params.font_size) : params.font_size || 12;
  const fontFamily = params.font_family || STYLE_CONSTANTS.DEFAULT_FONT_FAMILY;
  const fontWeight = params.font_weight || STYLE_CONSTANTS.DEFAULT_FONT_WEIGHT;
  const fontStyle = params.font_style || STYLE_CONSTANTS.DEFAULT_FONT_STYLE;
  const textAlign = params.text_align || "left";
  const fillColor = params.fill || STYLE_CONSTANTS.DEFAULT_COLOR;
  const backgroundColor = params.background_color || STYLE_CONSTANTS.TRANSPARENT_BACKGROUND;
  const padding = typeof params.padding === "string" ? parseInt(params.padding) : params.padding || 6;
  const optionSpacing = params.option_spacing ?? 6;
  const boxSize = Math.max(12, Math.min(20, params.box_size ?? 16));
  const boxBorderColor = params.box_border_color || "#000000";
  const boxBorderWidth = params.box_border_width ?? 1;
  const checkColor = STYLE_CONSTANTS.DEFAULT_COLOR;

  // คำนวณความสูงตามจำนวน options
  // const totalHeight = padding * 2 + options.length * (boxSize + optionSpacing);
  const totalHeight = options.length * (boxSize + optionSpacing);

  // Retina scaling
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = totalHeight * dpr;
  canvas.style.width = width + "px";
  canvas.style.height = totalHeight + "px";
  ctx.scale(dpr, dpr);

  // background
  if (backgroundColor !== "transparent") {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, totalHeight);
  }

  // border (optional)
  if (params.border) {
    const borderParts = params.border.split(" ");
    const borderWidth = parseInt(borderParts[0]) || 1;
    const borderColor = borderParts[2] || "#000000";
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(
      borderWidth / 2,
      borderWidth / 2,
      width - borderWidth,
      totalHeight - borderWidth
    );
  }

  // text
  ctx.fillStyle = fillColor;
  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textBaseline = "top";

  let textBaseX = padding + boxSize + 6;
  if (textAlign === "right") {
    ctx.textAlign = "right";
  } else {
    ctx.textAlign = "left";
  }

  // loop วาด options
  let cursorY = padding;
  options.forEach((opt) => {
    const isChecked =
        checkedValues.includes(opt);

    // 🔵 วาดวงกลมแทนสี่เหลี่ยม
    ctx.beginPath();
    ctx.arc(
      padding + boxSize / 2,
      cursorY + boxSize / 2,
      boxSize / 2,
      0,
      Math.PI * 2
    );
    ctx.strokeStyle = boxBorderColor;
    ctx.lineWidth = boxBorderWidth;
    ctx.stroke();

    // ถ้า checked → วาดวงกลมเล็กด้านใน
    if (isChecked) {
      ctx.beginPath();
      ctx.arc(
        padding + boxSize / 2,
        cursorY + boxSize / 2,
        boxSize / 3,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = checkColor;
      ctx.fill();
    }

    // Label
    ctx.fillStyle = fillColor;
    ctx.fillText(opt, textBaseX, cursorY + Math.max(0, (boxSize - fontSize) / 2));

    cursorY += boxSize + optionSpacing;
  });

  return canvas.toDataURL("image/png");
}
// Flexible API: support either (params, options, checkedValues) or (item)
function convertCheckboxToImage(
  paramsOrItem: CheckboxToImageParams | any,
  optionsArg?: string[],
  checkedArg?: string[]
): string {
  // 3-arg usage
  if (Array.isArray(optionsArg) || Array.isArray(checkedArg)) {
    const params = paramsOrItem as CheckboxToImageParams;
    return renderCheckboxGroupImage(params, optionsArg || [], checkedArg || []);
  }

  // 1-arg usage: derive from mapping item shape
  const item = paramsOrItem as any;

  const derivedParams: CheckboxToImageParams = {
    width: parseInt(item.width || "0") || getDefaultElementSize("checkbox").width,
    height: parseInt(item.height || "0") || getDefaultElementSize("checkbox").height,
    font_family: item.font_family || STYLE_CONSTANTS.DEFAULT_FONT_FAMILY,
    font_size: parseInt(item.font_size || "12") || 12,
    font_weight: item.font_weight,
    font_style: item.font_style,
    text_align: (item.text_align as "left" | "center" | "right") || "left",
    fill: item.fill || STYLE_CONSTANTS.DEFAULT_COLOR,
    background_color: item.background_color || STYLE_CONSTANTS.TRANSPARENT_BACKGROUND,
    padding: parseInt(item.padding || "6") || 6,
    box_border_color: item.border_color || "#000000",
    box_border_width: parseInt(item.border_width || "1") || 1,
    check_color: "#0153BD",
  };
  const derivedOptions: string[] = Array.isArray(item.checkboxOptions) ? item.checkboxOptions : ["ตัวเลือกที่ 1"];
  const derivedChecked: string[] = Array.isArray(item.checkedValues) ? item.checkedValues : Array.isArray(item.value) ? item.value : [];
  return renderCheckboxGroupImage(
    derivedParams,
    derivedOptions,
    derivedChecked
  );
}

function convertRadioToImage(
  paramsOrItem: RadioToImageParams | any,
  optionsArg?: string[],
  checkedArg?: string[]
): string {
  // 3-arg usage
  if (Array.isArray(optionsArg) || Array.isArray(checkedArg)) {
    const params = paramsOrItem as RadioToImageParams;
    return renderRadioGroupImage(params, optionsArg || [], checkedArg || []);
  }

  // 1-arg usage: derive from mapping item shape
  const item = paramsOrItem as any;
  const derivedParams: RadioToImageParams = {
    width: parseInt(item.width || "0") || getDefaultElementSize("radio").width,
    height: parseInt(item.height || "0") || getDefaultElementSize("radio").height,
    font_family: item.font_family || STYLE_CONSTANTS.DEFAULT_FONT_FAMILY,
    font_size: parseInt(item.font_size || "12") || 12,
    font_weight: item.font_weight,
    font_style: item.font_style,
    text_align: (item.text_align as "left" | "center" | "right") || "left",
    fill: item.fill || STYLE_CONSTANTS.DEFAULT_COLOR,
    background_color: item.background_color || STYLE_CONSTANTS.TRANSPARENT_BACKGROUND,
    padding: parseInt(item.padding || "6") || 6,
    box_border_color: item.border_color || "#000000",
    box_border_width: parseInt(item.border_width || "1") || 1,
    check_color: "#000000",
  };
  const derivedOptions: string[] = Array.isArray(item.radioOptions) ? item.radioOptions : ["ตัวเลือกที่ 1"];
  const derivedChecked: string[] = Array.isArray(item.checkedValues) ? item.checkedValues : item.value !== "" ? [item.value] : [];
  return renderRadioGroupImage(derivedParams, derivedOptions, derivedChecked);
}

/**
 * Stamp PDF with form data
 */
// async function stampPdfWithFormData(
//   pdfFile: string,
//   mappingSignature: any[],
//   mappingText: any[]
// ): Promise<void> {
//   try {

//     // แปลง base64 PDF เป็น Uint8Array
//     const pdfBytes = Uint8Array.from(atob(pdfFile), c => c.charCodeAt(0));

//     // สร้าง stamp items จาก form data
//     const stampItems = createStampItemsFromFormData(mappingSignature, mappingText);

//     if (stampItems.length === 0) {

//       return;
//     }
//     // Stamp PDF
//     const stampedPdfBytes = await stampItemsOnPdf(pdfBytes, stampItems);

//     // ดาวน์โหลด PDF ที่ stamp แล้ว
//     const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//     const filename = `approved-document-${timestamp}`;
//     downloadStampedPdf(stampedPdfBytes, filename);

//   } catch (error) {
//     enqueueSnackbar(`❌ Error in PDF stamping: ${error}`, {
//       variant: "error",
//       autoHideDuration: 3000,
//     });
//     // ไม่ throw error เพื่อไม่ให้หยุดกระบวนการ approve

//   }
// }
//debug
// const pdfStampToBase64 = (pdfStamp: Uint8Array): Promise<string> => {
//   const blob = new Blob([new Uint8Array(pdfStamp)], {
//     type: "application/pdf",
//   });
//   const reader = new FileReader();
//   return new Promise((resolve, reject) => {
//     reader.onload = () => {
//       resolve(reader.result as string);
//     };
//     reader.onerror = reject;
//     reader.readAsDataURL(blob);
//   });
// };

export async function handleApprove(params: ApproveParams): Promise<void> {
  const {
    allPageItems,
    currentPageItems,
    documentData,
    mappingFormDataId,
    stepIndex,
    setIsConfirmModalOpen,
    setIsSuccessModalOpen,
    dispatch,
    setErrorMessage,
    setIsErrorModalOpen,
    mappingMoreFile = [], // 🎯 รับข้อมูลจาก Redux
  } = params;
  //  setIsConfirmModalOpen(true);

  try {
    setIsConfirmModalOpen(true);
    // setIsConfirmModalOpen(false);
    // ใช้ฟังก์ชันใหม่เพื่อสร้าง payload จาก documentData โดยใช้ flatMap
    const payloadFromDocumentData = createPayloadFromDocumentData(
      documentData,
      allPageItems,
      stepIndex
    );

    const reEmail = /[@]/;
    const guestEmail = sessionStorage.getItem("guestName");
    const guestEmail2 = sessionStorage.getItem("guestEmail");
    const sections = documentData.flow_data
      .filter((flowItem: FlowDataItem) => {
        return (
          flowItem.status === "W" &&
          flowItem.entity
            ?.map((e: any) => e.name)
            .includes(
              guestEmail?.search(reEmail) !== -1
                ? guestEmail
                : guestEmail2 || ""
            )
        );
      })
      .map((flowItem: FlowDataItem) => flowItem.section?.toString() || "");
    localStorage.setItem("sections", sections.length > 0 ? sections[0] : "9");
    let pdfBytes: Uint8Array;
    try {
      if (typeof documentData.pdf_base64 === "string") {
        // ลบ prefix ถ้ามี
        const base64Data = documentData.pdf_base64.replace(
          /^data:application\/pdf;base64,/,
          ""
        );
        pdfBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
      } else {
        pdfBytes = documentData.pdf_base64;
      }
    } catch (error) {
      enqueueSnackbar(`Error preparing PDF bytes: ${error}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
      throw new Error("Invalid PDF data");
    }
    // Stamp PDF
    // const pdfStamp = await stampItemsOnPdf(pdfBytes, payloadFromDocumentData);

    // แปลงเป็น base64 อย่างปลอดภัย
    // const pdfStampBase64 = await pdfStampToBase64(pdfStamp);
    // try {
    //   // ใช้ FileReader API สำหรับไฟล์ใหญ่
    //   const blob = new Blob([pdfStamp], { type: 'application/pdf' });
    //   const reader = new FileReader();

    //   pdfStampBase64 = await new Promise((resolve, reject) => {
    //     reader.onload = () => {
    //       const result = reader.result as string;
    //       resolve(result.split(',')[1]); // ลบ prefix
    //     };
    //     reader.onerror = reject;
    //     reader.readAsDataURL(blob);
    //   });

    // } catch (error) {
    //   enqueueSnackbar(`Error converting to base64: ${error}`, {
    //     variant: "error",
    //     autoHideDuration: 3000,
    //   });
    //   // Fallback ถ้า FileReader ไม่ทำงาน
    //   pdfStampBase64 = btoa(String.fromCharCode(...Array.from(pdfStamp)));
    // }
    // สร้าง payload สำหรับส่งไปอัพเดท
    const payload: payloadUpdateTransaction = {
      // biz_id: "5228881808066777",
      contract_type: documentData.contract_type || "",
      mapping_form_data_id: mappingFormDataId || "",
      mapping_text: payloadFromDocumentData.mappingTextPayload,
      // mapping_checkbox: payloadFromDocumentData.mappingCheckboxPayload,
      mapping_checkbox: (() => {
        // First, group all checkbox items by their group ID
        // console.log('WWW payloadFromDocumentData.mappingCheckboxPayload', payloadFromDocumentData.mappingCheckboxPayload)
        const groupedItems = (payloadFromDocumentData.mappingCheckboxPayload || []).reduce((acc: any, checkboxGroup: any) => {
          // Extract group ID from checkbox_id pattern: "checkbox-input-{timestamp}-{groupIndex}-{elementIndex}"
          // const checkboxElements = checkboxGroup.option_elements || [];
          
          // checkboxElements.forEach((element: any) => {
            const checkboxId = checkboxGroup.id || `checkbox-input-${Date.now()}-${checkboxGroup.index || 0}-${checkboxGroup.index || 0}`;
            const [_, __, timestamp, groupIndex, ___] = checkboxId.split("-");
            const groupId = `${timestamp}-${groupIndex}`;
            
            if (!acc[groupId]) {
              acc[groupId] = {
                groupInfo: {
                  index: parseInt(groupIndex) || 0,
                  step_index: checkboxGroup.step_index || 0,
                  header: checkboxGroup.header || "Checkbox",
                  required: checkboxGroup.required || false,
                  text: checkboxGroup.header || "Checkbox",
                  value: false,
                  pageNumber: checkboxGroup.pageNumber || 1,
                  group_timestamp: checkboxGroup.group_timestamp || `checkbox-group-${groupId}`
                },
                elements: []
              };
            }
            
            // Add element to the group
            acc[groupId].elements.push({
              index: checkboxGroup.index || 0,
              checkbox_id: checkboxId,
              checkbox_name: checkboxGroup.checkbox_name || checkboxGroup.text || `ตัวเลือกที่ ${(checkboxGroup.index || 0) + 1}`,
              llx: checkboxGroup.llx || "0",
              lly: checkboxGroup.lly || "0",
              urx: checkboxGroup.urx || "0",
              ury: checkboxGroup.ury || "0",
              left: checkboxGroup.left || "0",
              top: checkboxGroup.top || "0",
              scale_X: checkboxGroup.scale_X || checkboxGroup.left || "0",
              scale_Y: checkboxGroup.scale_Y || checkboxGroup.top || "0",
              text: checkboxGroup.text || checkboxGroup.checkbox_name || `ตัวเลือกที่ ${(checkboxGroup.index || 0) + 1}`,
              value: checkboxGroup.value || false,
              required: checkboxGroup.required || false,
              font_family: checkboxGroup.font_family || "Arial",
              font_size: checkboxGroup.font_size || 14,
              font_weight: checkboxGroup.font_weight || "normal",
              font_style: checkboxGroup.font_style || "normal",
              text_align: checkboxGroup.text_align || "left",
              text_decoration: checkboxGroup.text_decoration || "none",
              justify_content: checkboxGroup.justify_content || "flex-start",
              underline: checkboxGroup.underline || false,
              fill: checkboxGroup.fill || "#000000",
              background_color: checkboxGroup.background_color || "rgba(239, 68, 68, 0.3)",
              border_color: checkboxGroup.border_color || "none",
              border_width: checkboxGroup.border_width || "0",
              border_style: checkboxGroup.border_style || "none",
              border_radius: checkboxGroup.border_radius || "0",
              padding: checkboxGroup.padding || "4",
              margin: checkboxGroup.margin || "0",
              width: checkboxGroup.width || "120",
              height: checkboxGroup.height || "30"
            });
          // });
          
          return acc;
        }, {});
        
        // Convert grouped items to array format
        return Object.values(groupedItems).map((group: any) => ({
          ...group.groupInfo,
          option_elements: group.elements
        }));
      })(), // 🎯 Group by checkbox_id and create option_elements array
      mapping_date_time: payloadFromDocumentData.mappingDatePayload.map(dateGroup => {
        const header = dateGroup.header || CONFIG_CONSTANTS.DATE_HEADER;
        const required = dateGroup.required || CONFIG_CONSTANTS.DATE_REQUIRED;
        const format = dateGroup.format || CONFIG_CONSTANTS.DATE_FORMAT;
        const currentDate = dateGroup.currentDate || CONFIG_CONSTANTS.DATE_CURRENT_DATE;
        return {
          header: header,
          required: required,
          format: format,
          currentDate: currentDate,
          text: header, // Add required text property
          pageNumber: (dateGroup as any).pageNumber || 1,
          step_index: (dateGroup as any).step_index || 0,
          date_group_timestamp: (dateGroup as any).date_group_timestamp || Date.now().toString(),
          date_group_index: (dateGroup as any).date_group_index || 0,
          date_group_size: (dateGroup as any).date_group_size || dateGroup.date_elements?.length || 0,
          is_complete_group: (dateGroup as any).is_complete_group || true,
          date_elements: dateGroup.date_elements.map(element => ({
            index: element.index || 0,
            llx: element.llx || "0",
            lly: element.lly || "0", 
            urx: element.urx || "0",
            ury: element.ury || "0",
            left: element.left || "0",
            top: element.top || "0",
            scale_X: element.scale_X || element.left || "0",
            scale_Y: element.scale_Y || element.top || "0",
            width: element.width || CONFIG_CONSTANTS.DATE_INPUT_WIDTH.toString(),
            height: element.height || CONFIG_CONSTANTS.DATE_INPUT_HEIGHT.toString(),
            text: element.text || (element.date_type === "days" ? "วัน" : element.date_type === "months" ? "เดือน" : "ปี"),
            value: element.value || "",
            font_family: element.font_family || "Arial",
            font_size: element.font_size || 14,
            font_weight: element.font_weight || "normal",
            font_style: element.font_style || "normal",
            text_align: element.text_align || "left",
            text_decoration: element.text_decoration || "none",
            justify_content: element.justify_content || "flex-start",
            underline: element.underline || false,
            fill: element.fill || "#000000",
            background_color: element.background_color || "rgba(239, 68, 68, 0.3)",
            border_color: element.border_color || "none",
            border_width: element.border_width || "0",
            border_style: element.border_style || "none",
            border_radius: element.border_radius || "0",
            padding: element.padding || "4",
            margin: element.margin || "0",
            date_type: element.date_type || "days",
            date_element_id: element.date_element_id || `date-${dateGroup.date_group_index || 0}-${element.date_type || "days"}-${dateGroup.date_group_timestamp || Date.now()}-${element.index || 0}`
          }))
        };
      }), // 🎯 Transform to match the expected structure with date_elements array
      mapping_signature: payloadFromDocumentData.mappingSignaturePayload,
      // mapping_radiobox: payloadFromDocumentData.mappingRadioPayload,
      mapping_radiobox: (() => {
        // First, group all radio items by their group ID
        // console.log('WWW payloadFromDocumentData.mappingRadioPayload', payloadFromDocumentData.mappingRadioPayload)
        const groupedItems = (payloadFromDocumentData.mappingRadioPayload || []).reduce((acc: any, radioGroup: any) => {
          // Extract group ID from radio_id pattern: "radio-input-{timestamp}-{groupIndex}-{elementIndex}"
          // const radioElements = radioGroup.option_elements || [];
          
            const radioId = radioGroup.id || `radio-input-${Date.now()}-${radioGroup.index || 0}-${radioGroup.index || 0}`;
            const [_, __, timestamp, groupIndex, ___] = radioId.split("-");
            const groupId = `${timestamp}-${groupIndex}`;
            
            if (!acc[groupId]) {
              acc[groupId] = {
                groupInfo: {
                  index: parseInt(groupIndex) || 0,
                  step_index: radioGroup.step_index || 0,
                  header: radioGroup.header || "Radio",
                  required: radioGroup.required || false,
                  text: radioGroup.header || "Radio",
                  group: radioGroup.header || "Radio",
                  value: false,
                  pageNumber: radioGroup.pageNumber || 1,
                  group_timestamp: radioGroup.group_timestamp || `radio-group-${groupId}`
                },
                elements: []
              };
            }
            
            // Add element to the group
            acc[groupId].elements.push({
              index: radioGroup.index || 0,
              radio_id: radioId,
              radio_name: radioGroup.radio_name || radioGroup.text || `ตัวเลือกที่ ${(radioGroup.index || 0) + 1}`,
              llx: radioGroup.llx || "0",
              lly: radioGroup.lly || "0",
              urx: radioGroup.urx || "0",
              ury: radioGroup.ury || "0",
              left: radioGroup.left || "0",
              top: radioGroup.top || "0",
              scale_X: radioGroup.scale_X || radioGroup.left || "0",
              scale_Y: radioGroup.scale_Y || radioGroup.top || "0",
              text: radioGroup.text || radioGroup.radio_name || `ตัวเลือกที่ ${(radioGroup.index || 0) + 1}`,
              value: radioGroup.value || false,
              required: radioGroup.required || false,
              font_family: radioGroup.font_family || "Arial",
              font_size: radioGroup.font_size || 14,
              font_weight: radioGroup.font_weight || "normal",
              font_style: radioGroup.font_style || "normal",
              text_align: radioGroup.text_align || "left",
              text_decoration: radioGroup.text_decoration || "none",
              justify_content: radioGroup.justify_content || "flex-start",
              underline: radioGroup.underline || false,
              fill: radioGroup.fill || "#000000",
              background_color: radioGroup.background_color || "rgba(239, 68, 68, 0.3)",
              border_color: radioGroup.border_color || "none",
              border_width: radioGroup.border_width || "0",
              border_style: radioGroup.border_style || "none",
              border_radius: radioGroup.border_radius || "0",
              padding: radioGroup.padding || "4",
              margin: radioGroup.margin || "0",
              width: radioGroup.width || "120",
              height: radioGroup.height || "30"
            });
          return acc;
        }, {});
        
        // Convert grouped items to array format
        return Object.values(groupedItems).map((group: any) => ({
          ...group.groupInfo,
          option_elements: group.elements
        }));
      })(), // 🎯 Group by radio_id and create option_elements array
      mapping_stamp: [],
      mapping_doc_no: [],
      mapping_more_file: (() => {
        // 🎯 ใช้ข้อมูลจาก Redux state (ไฟล์ที่อัปโหลดใหม่) เป็นหลัก
        if (!mappingMoreFile || mappingMoreFile.length === 0) {
          return documentData.mapping_form_data_id?.mapping_more_file || [];
        }
        
        // 🎯 สร้าง payload structure ตามตัวอย่างที่กำหนด
        // const formattedMoreFiles = mappingMoreFile.map((reduxItem: any) => {
        //   return {
        //     step_index: reduxItem.step_index.toString(),
        //     type_data: (reduxItem.type_data || []).map((typeItem: any) => {
        //       return {
        //         type_index: parseInt(typeItem.type_index) || 0,
        //         type_name: typeItem.type_name || "ไฟล์เพิ่มเติม",
        //         type: typeItem.type || ["microsoft_pdf"],
        //         is_required: typeItem.is_required || false,
        //         file_data: (typeItem.file_data || []).map((file: any, fileIndex: number) => {
        //           return {
        //             file_index: fileIndex,
        //             file_name: file.file_name || "unknown_file",
        //             file_path: file.file_path || ""
        //           };
        //         }),
        //         is_embedded: typeItem.is_embedded || false,
        //         file_size: typeItem.file_size || 10
        //       };
        //     })
        //   };
        // });

        const formattedMoreFiles = documentData.mapping_form_data_id?.mapping_more_file.map((moreFile: any) => {
          if (moreFile.step_index.toString() === stepIndex) {
            return {
              step_index: moreFile.step_index.toString(),
              type_data: moreFile.type_data.map((typeData: any) => {
                const typeDataMapping = mappingMoreFile.find((reduxItem: any) => reduxItem.step_index.toString() == moreFile.step_index.toString())
                const typeDataMappingItem = typeDataMapping.type_data.find((typeItem: any) => typeItem.type_index == typeData.type_index)
                return {
                  type_index: typeData.type_index,
                  type_name: typeData.type_name,
                  type: typeData.type,
                  is_required: typeData.is_required,
                  file_data: typeDataMappingItem.file_data,
                  is_embedded: typeData.is_embedded,
                  file_size: typeData.file_size
                }
              })
            }
          } else {
            return moreFile;
          }
        });
        
        // 🎯 DEBUG: Log formatted data
        // console.log("🔍 [apiUtils] Redux more files:", mappingMoreFile);
        // console.log("🔍 [apiUtils] Formatted more files:", formattedMoreFiles);
        
        return formattedMoreFiles as any; // 🎯 Cast to any to match expected type
      })(), // 🎯 ใช้ข้อมูลจาก Redux state และ format ตามตัวอย่าง
      mapping_eseal: documentData.mapping_form_data_id?.mapping_eseal || [],
      step_index: parseInt(stepIndex),
      // pdf_base64: "", // ไม่ต้องส่ง pdf_base64 
      // pdf_base64: pdfStampBase64.replace(/^data:application\/pdf;base64,/, ""),
      sign_base: (
        (allPageItems.find((item) => item.type === "signature")
          ?.value as string) || ""
      ).replace(/^data:image\/png;base64,/, ""),
      type: "approved",
    };
    // console.log("BBB payload =>>", payload);
    // เรียก API เพื่ออัพเดทข้อมูล
    const response = await dispatch(UpdateTransactions(payload));
    // const response = { meta: { requestStatus: "fulfilled" }, payload: {} };

    // // แสดง success message หรือ redirect ตามที่ต้องการ
    if (response.meta.requestStatus === "fulfilled") {
      //   // TODO: แสดง success message หรือ redirect RECALL Function
      const redirectUrl = response.payload?.redirectUrl || response.payload?.url;
      if (redirectUrl) {
        //fake redirect research later
        window.location.href = redirectUrl;
      } else {
        setIsSuccessModalOpen(true);
        // Optionally show a success message here
      }
    } else {
      sessionStorage.setItem(
        "pendingTransactionPayload",
        JSON.stringify(payload)
      );
      // window.location.href = redirectUrl;
    }
  } catch (error: any) {
    enqueueSnackbar(`❌ Error in handleApprove: ${error}`, {
      variant: "error",
      autoHideDuration: 3000,
    });
    if (
      error instanceof RangeError &&
      error.message?.includes("Maximum call stack")
    ) {
      enqueueSnackbar("🔄 Infinite recursion detected in handleApprove", {
        variant: "error",
        autoHideDuration: 3000,
      });
      setErrorMessage("เกิดข้อผิดพลาดในการประมวลผล PDF (Recursion Error)");
    } else if (error?.message?.includes("Invalid PDF data")) {
      enqueueSnackbar("📄 PDF data is invalid", {
        variant: "error",
        autoHideDuration: 3000,
      });
      setErrorMessage("ข้อมูล PDF ไม่ถูกต้อง");
    } else {
      console.log("🚨 General error in approve process", error);
      setErrorMessage("เกิดข้อผิดพลาดในการอนุมัติเอกสาร");
    }
    setIsErrorModalOpen(true);
  }
}

export async function handleReject(params: RejectParams): Promise<void> {
  const {
    allPageItems,
    currentPageItems,
    documentData,
    mappingFormDataId,
    stepIndex,
    reason, // 🎯 FIXED: Extract reason parameter
    dispatch,
    setErrorMessage,
    setIsErrorModalOpen,
    setIsRejectModalOpen,
    setIsSuccessModalOpen,
  } = params;

  try {
    setIsRejectModalOpen(true);
    // // ใช้ฟังก์ชันใหม่เพื่อสร้าง payload จาก documentData โดยใช้ flatMap
    // const payloadFromDocumentData = createPayloadFromDocumentData(
    //   documentData,
    //   currentPageItems || [],
    //   stepIndex
    // );
    // // แปลง PDF base64 เป็น Uint8Array
    // let pdfBytes: Uint8Array;
    // try {
    //   if (typeof documentData.pdf_base64 === "string") {
    //     // ลบ prefix ถ้ามี
    //     const base64Data = documentData.pdf_base64.replace(
    //       /^data:application\/pdf;base64,/,
    //       ""
    //     );
    //     pdfBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    //   } else {
    //     pdfBytes = documentData.pdf_base64;
    //   }
    // } catch (error) {
    //   enqueueSnackbar(`Error preparing PDF bytes: ${error}`, {
    //     variant: "error",
    //     autoHideDuration: 3000,
    //   });
    //   throw new Error("Invalid PDF data");
    // }

    // // Stamp PDF
    // const pdfStamp = await stampItemsOnPdf(pdfBytes, payloadFromDocumentData);

    // // แปลงเป็น base64 อย่างปลอดภัย
    // let pdfStampBase64: string;
    // try {
    //   // ใช้ FileReader API สำหรับไฟล์ใหญ่
    //   const blob = new Blob([new Uint8Array(pdfStamp)], {
    //     type: "application/pdf",
    //   });
    //   const reader = new FileReader();
    //   pdfStampBase64 = await new Promise((resolve, reject) => {
    //     reader.onload = () => {
    //       const result = reader.result as string;
    //       resolve(result.split(",")[1]); // ลบ prefix
    //     };
    //     reader.onerror = reject;
    //     reader.readAsDataURL(blob);
    //   });
    // } catch (error) {
    //   enqueueSnackbar(`Error converting to base64: ${error}`, {
    //     variant: "error",
    //     autoHideDuration: 3000,
    //   });
    //   // Fallback ถ้า FileReader ไม่ทำงาน
    //   pdfStampBase64 = btoa(String.fromCharCode(...Array.from(pdfStamp)));
    // }
    
    // สำหรับการปฏิเสธ ไม่จำเป็นต้อง stamp PDF ใช้ PDF ต้นฉบับ
    let pdfBase64: string;
    if (typeof documentData.pdf_base64 === "string") {
      // ลบ prefix ถ้ามี
      pdfBase64 = documentData.pdf_base64.replace(
        /^data:application\/pdf;base64,/,
        ""
      );
    } else {
      // ถ้าเป็น Uint8Array แปลงเป็น base64
      const pdfUint8Array = documentData.pdf_base64 as Uint8Array;
      pdfBase64 = btoa(String.fromCharCode(...Array.from(pdfUint8Array)));
    }
    // สร้าง payload สำหรับส่งไปอัพเดท
    const payload: payloadUpdateTransaction = {
      mapping_form_data_id: mappingFormDataId || "",
      mapping_text: [], //payloadFromDocumentData.mappingTextPayload,
      mapping_checkbox: [],
      mapping_date_time: [],
      mapping_signature: [], //payloadFromDocumentData.mappingSignaturePayload,
      mapping_radiobox: [],
      mapping_stamp: [],
      mapping_doc_no: [],
      mapping_more_file: [],
      mapping_eseal: [],
      // pdf_base64: pdfBase64, //ไม่ต้องส่ง pdf_base64
      step_index: parseInt(stepIndex),
      sign_base: (
        (allPageItems.find((item) => item.type === "signature")
          ?.value as string) || ""
      ).replace(/^data:image\/png;base64,/, ""),
      type: "rejected",
      reason: reason || "", // 🎯 FIXED: Include rejection reason in payload
      contract_type: documentData.contract_type || "",
    };

    // เรียก API เพื่ออัพเดทข้อมูล
    const response = await dispatch(UpdateTransactions(payload));

    // แสดง success message หรือ redirect ตามที่ต้องการ
    if (response.meta.requestStatus === "fulfilled") {
      // TODO: แสดง success message หรือ redirect RECALL Function
      const redirectUrl = response.payload?.redirectUrl || response.payload?.url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        setIsSuccessModalOpen(true);
        // Optionally show a success message here
      }
    } else {
      sessionStorage.setItem(
        "pendingTransactionPayload",
        JSON.stringify(payload)
      );
      // window.location.href = redirectUrl;
    }
  } catch (error) {
    enqueueSnackbar(`Error in handleReject: ${error}`, {
      variant: "error",
      autoHideDuration: 3000,
    });
    setErrorMessage("เกิดข้อผิดพลาดในการปฏิเสธเอกสาร");
    setIsErrorModalOpen(true);
  }
}

/**
 * Handles confirmed email sending for B2B transactions
 */
export async function handleConfirmedEmailSending(
  transactionId: string,
  docType: string,
  setIsSuccessModalOpen: (open: boolean) => void,
  setIsErrorModalOpen: (open: boolean) => void,
  setErrorMessage: (message: string) => void
): Promise<void> {
  try {
    // console.log("Sending email for transaction:", transactionId);
    if(docType === "b2b") {
      await transactionSentEmailB2B({
        transactionId: transactionId,
      });
    } else if(docType === "b2c") {
      await transactionSentEmailB2C({
        transactionId: transactionId,
      });
    }
    setIsSuccessModalOpen(true);
  } catch (error) {
    console.error("Error sending email:", error);
    setErrorMessage("เกิดข้อผิดพลาดในการส่งอีเมล");
    setIsErrorModalOpen(true);
  }
}

/**
 * Handle confirm save operation
 *
 * @param params - Confirm save parameters
 */
//debug
export async function handleConfirmSave(
  params: ConfirmSaveParams
): Promise<void> {
  const {
    setIsConfirmModalOpen,
    setIsSuccessModalOpen,
    setIsErrorModalOpen,
    setIsEmailConfirmModalOpen,
    setTransactionId,
    setErrorMessage,
    setIsSaving,
    setSaveMessage,
    pdfFile,
    formTitle,
    pageFormItems,
    operator,
    workflowSteps,
    formId,
    typeCode,
    workspaceId,
    folderId,
    type,
    docType,
    coTaxId,
    typeDocNo,
    paymentChannel,
  } = params;

  // console.log('params apiUtil =>',params)

  // ใช้ typeDocNo จาก Redux store หากไม่มีใน params
  // const typeDocNoFromRedux = useAppSelector(selectTypeDocNo);
  // const finalTypeDocNo = typeDocNo || typeDocNoFromRedux;
  try {
    setIsConfirmModalOpen(false);

    // ใช้ workspace ID จาก environment หรือค่าเริ่มต้น
    const workspaceID = workspaceId || process.env.NEXT_PUBLIC_WORKSPACE_ID || "WS00001";

    // ดึงชื่อไฟล์จาก path หรือใช้ชื่อฟอร์ม
    // const pdfName = pdfFile
    //   ? pdfFile.split("/").pop() || `${formTitle}.pdf`
    //   : `${formTitle}.pdf`;
    const pdfName = formTitle;

    // ใช้ tax ID จาก environment หรือค่าเริ่มต้น
    const taxId = process.env.NEXT_PUBLIC_TAX_ID || "Test-Film";

    // Workflow เริ่มต้นสำหรับการทดสอบ
    const defaultWorkflow: WorkflowStep[] = workflowSteps;

    // แปลง pageFormItems เป็น array เพื่อดูข้อมูล
    const formItemsArray = Object.values(pageFormItems).flat();

    // console.log("aong test ==>",docType,coTaxId,operator)
    let response;
    
    // 🎯 NEW: Handle template mode - save as template
    if (params.isTemplateMode && params.docTypeId) {
      try {
        // Convert PDF file to base64
        const pdfBase64 = await fetch(pdfFile || "")
          .then(res => res.blob())
          .then(blob => {
            return new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64 = reader.result as string;
                // Remove data:application/pdf;base64, prefix
                const base64Clean = base64.split(',')[1] || base64;
                resolve(base64Clean);
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          });

        // 🎯 NEW: Build mappings from pageFormItems using the new utility function
        const mappings = createMappingsFromPageFormItems(pageFormItems, defaultWorkflow);

        // Build template payload
        const templatePayload: CreateTemplatePayload = {
          pdf_name: pdfName,
          pdf_base64: pdfBase64,
          contract_type: docType?.toLowerCase() || "b2b",
          doc_type_id: params.docTypeId,
          estamp_payment: paymentChannel == "ในระบบ"
            ? "internal"
            : paymentChannel == "นอกระบบ"
            ? "external"
            : "non_payment",
          flow_data: defaultWorkflow?.map((step, index) => {
            // 🎯 Convert co_contract: "ต้นสัญญา" → "internal", "คู่สัญญา" → "external"
            // Also handle if it's already "internal" or "external"
            const coContractValue = (step as any).co_contract || (step as any).approverType || "";
            const coContract = coContractValue === "ต้นสัญญา"
              ? "internal"
              : coContractValue === "คู่สัญญา"
              ? "external"
              : (coContractValue === "internal" || coContractValue === "external")
              ? coContractValue
              : "internal"; // Default to "internal" if not specified
            
            // 🎯 FIXED: Properly map entity to FlowDataEntity format
            // Handle different entity structures:
            // 1. If entity is already in FlowDataEntity format (from generateActualSection for idx !== 0)
            // 2. If entity is UserListData format (from generateActualSection for idx === 0)
            // 3. If entity has name/id_card/email directly
            const mapEntityToFlowDataEntity = (e: any): FlowDataEntity => {
              // Case 1: Already in FlowDataEntity format (has name, id_card, email, id)
              if (e.name !== undefined || e.id_card !== undefined || e.email !== undefined) {
                return {
                  name: e.name || e.fullName || "",
                  id_card: e.id_card || e.idCard || "",
                  email: e.email || "",
                  id: e.id || e.accountId || "",
                  nationality: e.nationality || "thailand",
                };
              }
              
              // Case 2: UserListData format (has fullName, idCard, email, accountId)
              if (e.fullName !== undefined || e.idCard !== undefined || e.accountId !== undefined) {
                return {
                  name: e.fullName || "",
                  id_card: e.idCard || "",
                  email: e.email || "",
                  id: e.accountId || e.id || "",
                  nationality: e.nationality || "thailand",
                };
              }
              
              // Case 3: Fallback - try to extract any available fields
              return {
                name: e.name || e.fullName || "",
                id_card: e.id_card || e.idCard || "",
                email: e.email || "",
                id: e.id || e.accountId || "",
                nationality: e.nationality || "thailand",
              };
            };
            
            return {
              index: index,
              section: step.section || "9",
              action: step.action || "signer",
              validate_type: step.validate_type || "",
              validate_data: step.validate_data || "",
              selfie_video: step.selfie_video || false,
              script_video: step.script_video || "",
              type_entity: step.type_entity || "personal",
              co_contract: coContract,
              entity: step.entity?.map(e => ({
                name: (e as any).fullName || e.name || "",
                id_card: e.id_card || "",
                email: e.email || "",
                id: e.id || "",
                nationality: e.nationality || "",
              })) || [
                {
                  name: "",
                  id_card: "",
                  email: "",
                  id: "",
                  nationality: "",
                }
              ],
            };
          }) || [],
          
          // Optional fields
          co_tax_id: coTaxId || "",
          operator: operator ? {
            name: operator.name || "", // 🎯 FIXED: Use 'name' instead of 'operatorName'
            email: operator.email || "", // 🎯 FIXED: Use 'email' instead of 'operatorEmail'
          } : undefined,

          // 🎯 NEW: Use mappings from createMappingsFromPageFormItems
          mapping_text: mappings.mapping_text,
          mapping_checkbox: mappings.mapping_checkbox,
          mapping_date_time: mappings.mapping_date_time,
          mapping_signature: mappings.mapping_signature,
          mapping_radiobox: mappings.mapping_radiobox,
          mapping_stamp: mappings.mapping_stamp,
          mapping_doc_no: mappings.mapping_doc_no,
          mapping_more_file: mappings.mapping_more_file,
          mapping_eseal: mappings.mapping_eseal,
        };

        // Call template API
        const result = await (store.dispatch as any)(createTemplate(templatePayload));
        
        if (result?.payload?.status) {
          response = {
            success: true,
            message: "สร้าง Template สำเร็จ",
            data: result.payload.data,
          };
        } else {
          throw new Error(result?.payload?.message || "ไม่สามารถสร้าง Template ได้");
        }
      } catch (error: any) {
        console.error("Error creating template:", error);
        throw new Error(`ไม่สามารถสร้าง Template ได้: ${error.message}`);
      }
    }
    // เรียกใช้ฟังก์ชัน API โดยตรง
    else if (type === "draft") {
      const result: any = await (store.dispatch as any)(
        mappingCreates({
          workspaceId: workspaceID,
          folderId: folderId || "",
          pdfFile: pdfFile || "",
          pdfName: pdfName,
          taxId: taxId,
          isDraft: true,
          isEnabled: false,
          pageFormItems: pageFormItems,
          operator: operator,
          flowData: defaultWorkflow,
          workflowId: "",
          formId: formId || "",
          startEnabled: "",
          endEnabled: "",
          typeDocNo: typeDocNo || "",
          typeCode: typeCode || "1",
        })
      );
      response = result?.payload;
    } else {
      // 🎯 FIXED: Use docTypeId from params if available, otherwise use typeDocNo
      // docTypeId comes from URL (docTypeId query param) or props
      // typeDocNo comes from Redux store (set by setTypeDocNo action)
      // console.log('parammmm =>',params)
      // console.log('typeDocNo =>',typeDocNo)
      const finalTypeDocNo = params.docTypeId || typeDocNo || "";
      // console.log("final =>",finalTypeDocNo)

      // 🎯 FIXED: Validate docTypeId before calling API
      // if (!finalTypeDocNo || finalTypeDocNo.trim() === "") {
      //   const errorMsg = "ไม่พบ doc_type_id กรุณาตรวจสอบ URL หรือ Redux store";
      //   console.error("❌ [apiUtils] Missing docTypeId:", {
      //     params_docTypeId: params.docTypeId,
      //     typeDocNo: typeDocNo,
      //     finalTypeDocNo: finalTypeDocNo,
      //   });
      //   setIsErrorModalOpen(true);
      //   setErrorMessage(errorMsg);
      //   setIsSaving(false);
      //   return;
      // }
      const finalDefaultWorkflow = defaultWorkflow.map(step => {
        return {
          ...step,
          entity: step.entity?.map(e => ({
            ...e,
            name: (e as any).fullName || e.name || "",
          })) || [],
        }
      })
      response = await createFormSubmissionWithRedux(
        workspaceID,
        pdfFile || "", // แก้ไข type error โดยใส่ค่าว่างถ้า pdfFile เป็น null
        pdfName,
        taxId,
        false, // ไม่ใช่แบบร่าง
        true, // เปิดใช้งาน
        pageFormItems,
        finalDefaultWorkflow,
        "", // workflow_id
        formId || "", // mapping_form_id
        "", // startEnabled
        "", // endEnabled
        typeCode || "1", // 🎯 ส่ง typeCode
        docType,
        coTaxId,
        operator,
        paymentChannel,
        finalTypeDocNo, // 🎯 FIXED: Pass docTypeId as typeDocNo parameter
      );
    }
    

    // แสดงข้อความสถานะ
    setSaveMessage(response.message);
    if (response.success) {
      // 🎯 NEW: Handle template mode success - show success modal directly
      if (params.isTemplateMode) {
        setIsSuccessModalOpen(true);
        return; // Exit early for template mode
      }

      const tempData = response?.data as { transactionData?: { _id: string } };
      const transactionId = docType === "b2b" ? tempData?.transactionData?._id || "" : response.data.data.transaction_id || "";
      setTransactionId(transactionId);
      // แสดง Success Modal
      // await contractForm(response.transactionData?._id || "");
      // if (docType === "b2b") {
      // console.log("aong test paymentChannel ==>",paymentChannel)
        if(paymentChannel === "ในระบบ") {
          const contractFormResponse = await contractForm(transactionId || "");
          if(contractFormResponse.success) {
            const validateTransaction = await putValidateTransaction(transactionId || "", docType || "");
            if(validateTransaction.success) {
              if (validateTransaction.data.is_verified || validateTransaction.data.data.is_verified) {
                // แสดง modal ยืนยันการส่ง email แทนการส่งโดยตรง
                setIsEmailConfirmModalOpen(true);
              } else {
                setErrorMessage("เอกสารฉบับนี้จะถูกเก็บไว้ในสถานะร่างและจะสมบูรณ์หลังจากคู่สัญญายืนยันตัวตนสำเร็จ");
                setIsErrorModalOpen(true);
              }
            } else {
              setErrorMessage(validateTransaction.message);
              setIsErrorModalOpen(true);
            }
          } else {
            setErrorMessage(contractFormResponse.message);
            setIsErrorModalOpen(true);
          }
        } else {
            const validateTransaction = await putValidateTransaction(transactionId || "", docType || "");
            if(validateTransaction.success) {
              if (validateTransaction.data.is_verified || validateTransaction.data.data.is_verified) {
                // แสดง modal ยืนยันการส่ง email แทนการส่งโดยตรง
                setIsEmailConfirmModalOpen(true);
              } else {
                setErrorMessage("เอกสารฉบับนี้จะถูกเก็บไว้ในสถานะร่างและจะสมบูรณ์หลังจากคู่สัญญายืนยันตัวตนสำเร็จ");
                setIsErrorModalOpen(true);
              }
            } else {
              setErrorMessage(validateTransaction.message);
              setIsErrorModalOpen(true);
            }
        }
      // }

        
     
      // ล้างข้อความหลังจากผ่านไป 3 วินาที
      await setTimeout(() => setSaveMessage(""), 4000);

      // ดำเนินการเพิ่มเติมเมื่อบันทึกสำเร็จ
    } else {
      // แสดง Error Modal กรณีเกิดข้อผิดพลาด
      setErrorMessage(response.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      setIsErrorModalOpen(true);
      enqueueSnackbar(`Error saving form: ${response.error}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  } catch (error) {
    enqueueSnackbar(`Error in handleConfirmSave: ${error}`, {
      variant: "error",
      autoHideDuration: 3000,
    });
    setErrorMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    setIsErrorModalOpen(true);
  } finally {
    setIsSaving(false);
  }
}

/**
 * Handle user setting mapping
 *
 * @param params - User setting mapping parameters
 */
export function handleUserSettingMapping(
  params: UserSettingMappingParams
): void {
  const { approvers, setUserSettings, documentId, formId } = params;

  if (!approvers) return;

  // Transform approvers data to match your workflow format
  const workflowSteps = approvers.map((approver: any) => ({
    index: approver.index, // 🎯 FIXED: Remove -1 to prevent negative values
    section: approver.section === "มาตรา 9" ? "9" : "26,28",
    action: approver.permission.toLowerCase() as "approver" | "signer" | "test",
    validate_type: approver.validateType.toLowerCase().includes("pin")
      ? "pin"
      : approver.validateType.toLowerCase().includes("otp")
      ? "otp"
      : approver.validateType.toLowerCase().includes("password")
      ? "password"
      : "",
    validate_data: "",
    selfie_video: approver.selfieVideo || false,
    script_video: approver.selfieMessage || "",
    type_entity:
      approver.entityType === "person"
        ? "sender"
        : ("dept" as "personal" | "dept" | "role" | "sender"),
    entity: approver.entities.map((entity: any) => ({
      id: entity.id || entity.id,
      name: entity.email || entity.name,
    })),
    no_edit_mail: false,
  }));

  // Update userSettings with the new approvers data
  const newSettings: UserSettingData = {
    approvers: approvers,
    formId: formId || "",
    documentId: documentId || "",
  };
  setUserSettings(newSettings);
}

/**
 * Handle save user setting operation
 *
 * @param params - Save user setting parameters
 */
export async function handleSaveUserSetting(
  params: SaveUserSettingParams
): Promise<void> {
  const {
    userSettings,
    documentId,
    setIsSettingsMode,
    setWorkflowSteps,
    handleCategoryChange,
  } = params;

  if (userSettings?.approvers) {
    try {
      // Transform and save the workflow steps
      const workflowData: WorkflowStep[] = userSettings.approvers.map(
        (approver: any) => ({
          index: approver.index, // 🎯 FIXED: Remove -1 to prevent negative values
          section: approver.section === "มาตรา 9" ? "9" : "26,28",
          action: approver.permission.toLowerCase() as
            | "approver"
            | "signer"
            | "test",
          validate_type: approver.validateType.toLowerCase().includes("pin")
            ? "pin"
            : approver.validateType.toLowerCase().includes("otp")
            ? "otp"
            : approver.validateType.toLowerCase().includes("password")
            ? "password"
            : "",
          validate_data: "",
          selfie_video: approver.selfieVideo,
          script_video: approver.selfieMessage,
          type_entity:
            approver.entityType === "sender"
              ? "sender"
              : approver.entityType === "dept"
              ? "dept"
              : approver.entityType === "role"
              ? "role"
              : "personal",
          entity: approver.entities.map((entity: any) => ({
            id: entity.id,
            name: entity.email || entity.name,
          })),
          no_edit_mail: false,
        })
      );

      // Emit the approvers data through the event emitter
      appEmitter.emit("userSetting", {
        approvers: userSettings.approvers,
        formId: "",
        documentId: documentId,
      });

      // Here you would typically save to your backend
      //

      // Exit settings mode and switch to default category
      setIsSettingsMode(false);
      setWorkflowSteps(workflowData);

      // Emit event to notify that user settings have been saved
      appEmitter.emit("userSettingSaved");

      // Reset to default category and notify FormSidebar
      if (handleCategoryChange) {
        handleCategoryChange("text");
      }

      return Promise.resolve();
    } catch (error) {
      enqueueSnackbar(`Error saving user settings: ${error}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
      return Promise.reject(error);
    }
  } else {
    // Exit settings mode and switch to default category
    setIsSettingsMode(false);

    // Emit event to notify that user settings have been saved
    appEmitter.emit("userSettingSaved");

    if (handleCategoryChange) {
      handleCategoryChange("text");
    }
    return Promise.resolve();
  }
}