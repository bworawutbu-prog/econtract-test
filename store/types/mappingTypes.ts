/**
 * Mapping Types
 *
 * Centralized type definitions for form mapping functionality.
 * This file consolidates and refactors mapping interfaces from multiple sources
 * to eliminate duplication and provide better type safety.
 */

// =============================================================================
// BASE INTERFACES
// =============================================================================
"use client";

import { OperatorDetail } from "./contractB2BType";

export interface FormItemPosition {
  x: number;
  y: number;
}

export interface FormItemConfig {
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
  dateFormat?: "EU" | "US"; // 🎯 NEW: Add date format support
}

// 🎯 NEW: Base style interface that combines ElementStyle and FormItemStyle
export interface BaseStyle {
  // Common style properties
  fontFamily?: string;
  fontSize?: string | number;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: string;
  textDecoration?: string;
  justifyContent?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number | string;
  borderStyle?: string;
  borderRadius?: number | string;
  padding?: number | string;
  margin?: number | string;
  width?: string | number;
  height?: string | number;
}

// 🎯 NEW: Extended style interface for mapping items
export interface FormItemStyle extends BaseStyle {
  // Additional properties specific to mapping
  scaleX?: string;
  scaleY?: string;
  angle?: string;
  underline?: boolean;
  fill?: string;
}

// 🎯 NEW: Base mapping item interface
export interface BaseMappingItem {
  index?: number;
  index_step?: number;
  step_index?: string | number;
  llx?: string;
  lly?: string;
  urx?: string;
  ury?: string;
  left?: string;
  top?: string;
  scale_X?: string;
  scale_Y?: string;
  angle?: string;
  width?: string;
  height?: string;
  pageNumber?: number;
  image_base64?: string;
}

// 🎯 NEW: Base style properties for mapping items
export interface BaseMappingStyle {
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
  width?: string;
  height?: string;
}

export interface FormItemBase {
  id: string;
  type: string;
  label: string;
  position: FormItemPosition;
  step_index?: string;
  pageNumber: number;
  value?: string | string[] | boolean | number;
  config?: FormItemConfig;
  style?: FormItemStyle;
  checkboxOptions?: string[];
  radioOptions?: string[];
  selectOptions?: string[];
  actorId?: string;
  coordinates?: {
    llx: number;
    lly: number;
    urx: number;
    ury: number;
  };
}

// =============================================================================
// MAPPING ITEM INTERFACES
// =============================================================================

// 🎯 NEW: Use spread operator to extend base interfaces
export interface MappingTextItem extends BaseMappingItem, BaseMappingStyle {
  text?: string;
  required?: string;
  max_characters?: string;
  max_lines?: string;
  value?: string;
}

export interface MappingDateTimeItem extends BaseMappingItem {
  text: string;
  required: string;
  format: string;
  value?: string;
}

export interface MappingSignatureItem
  extends BaseMappingItem,
    BaseMappingStyle {
  text?: string;
  required?: string;
  signatureType?: string;
  value?: string;
  actorId?: string;
}

export interface MappingRadioboxItem extends BaseMappingItem, BaseMappingStyle {
  text: string;
  group: string;
  required: string;
  value: boolean;
}

export interface MappingCheckboxItem extends BaseMappingItem, BaseMappingStyle {
  text: string;
  required: string;
  value: boolean;
}

export interface MappingStampItem extends BaseMappingItem {
  text?: string;
  required?: string;
  stampType?: string;
  value?: string;
  actorId?: string;
}

export interface MappingDocNoItem extends BaseMappingItem {
  text: string;
  format: string;
  required?: string;
  value?: string;
}

export interface MappingFileItem extends BaseMappingItem {
  text: string;
  required: boolean;
  actorId?: string;
  type_name?: string;
  file_accept?: string;
  is_embedded?: boolean;
  max_file_size?: string;
  file_size?: number;
}

// New interfaces for more-file API structure
export interface MoreFileData {
  file_index: number;
  file_name: string;
  file_path: string;
}

export interface MoreFileTypeData {
  type_index: number;
  type_name: string;
  type: string[];
  is_required: boolean;
  file_data: MoreFileData[];
  is_embedded: boolean;
  file_size: number;
}

export interface MoreFileStepData {
  step_index: number;
  type_data: MoreFileTypeData[];
}

export interface NewMappingMoreFileItem {
  step_index: number;
  type_data: MoreFileTypeData[];
}

export interface MoreFilePayload {
  _id?: string;
  transaction_id?: string;
  more_file_data: MoreFileStepData[];
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface MappingESealItem extends BaseMappingItem {
  text: string;
  required: string;
  sealType: string;
  value?: string;
}

// =============================================================================
// WORKFLOW INTERFACES
// =============================================================================

export interface WorkflowEntity {
  id: string;
  name: string;
  role_id?: string;
  role_name?: string;
  nationality?: string;
  id_card?: string;
  email?: string;
}

export interface WorkflowStep {
  index: number;
  section: string;
  action: string;
  validate_type: string;
  validate_data: string;
  selfie_video: boolean;
  script_video: string;
  type_entity: string;
  entity?: WorkflowEntity[];
  no_edit_mail: boolean;
}

// =============================================================================
// FORM SUBMISSION INTERFACES
// =============================================================================

export interface FormSubmitData {
  business_id?: string;
  workspace_id: string;
  folder_id: string;
  pdf_base64: string;
  pdf_name: string;
  tax_id: string;
  is_draft: boolean;
  is_enabled: boolean;
  start_enabled: string;
  end_enabled?: string;
  type_code?: string; // 🎯 เพิ่ม type_code field
  mapping_text: MappingTextItem[];
  mapping_date_time: MappingDateTimeItem[];
  mapping_signature: MappingSignatureItem[];
  mapping_radiobox: MappingRadioboxItem[];
  mapping_stamp: MappingStampItem[];
  mapping_doc_no: MappingDocNoItem[];
  mapping_more_file: MappingFileItem[];
  mapping_eseal: MappingESealItem[];
  mapping_checkbox: MappingCheckboxItem[];
  workflow_id?: string;
  mapping_form_id?: string;
  flow_data: WorkflowStep[];
  sign_base: string;
  operator?: OperatorDetail;
  contract_type?: string;
  co_tax_id?: string;
  type_doc_no?: string;
  estamp_payment?: string;
  doc_type_id?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
  transactionData?: {
    _id: string;
  };
}

// =============================================================================
// UTILITY INTERFACES
// =============================================================================

export interface UserSetting {
  index?: number;
  index_step?: number;
  llx?: string;
  lly?: string;
  urx?: string;
  ury?: string;
  left: string;
}

// =============================================================================
// TYPE UNIONS AND HELPERS
// =============================================================================

export type MappingItem =
  | MappingTextItem
  | MappingDateTimeItem
  | MappingSignatureItem
  | MappingRadioboxItem
  | MappingCheckboxItem
  | MappingStampItem
  | MappingDocNoItem
  | MappingFileItem
  | MappingESealItem;

export type MappingType =
  | "text"
  | "date_time"
  | "signature"
  | "radiobox"
  | "checkbox"
  | "stamp"
  | "doc_no"
  | "file"
  | "eseal";

// =============================================================================
// TRANSACTION INTERFACES
// =============================================================================

interface MappingFormData {
  _id: number;
  name: string;
  email: string;
  mapping_text: MappingTextItem[];
  mapping_date_time: string[];
  mapping_signature: MappingSignatureItem[];
  mapping_radiobox: string[];
  mapping_stamp: string[];
  mapping_doc_no: string[];
  mapping_more_file: string[];
  mapping_eseal: string[];
  mapping_checkbox: string[];
  mapping_form_id: string;
  tax_id: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

interface FlowData {
  index: string;
  section: string;
  action: string;
  validate_type: string;
  validate_data: string;
  selfie_video: boolean;
  script_video: string;
  type_entity: string;
  entity: string[];
  status: string;
  approved_at: string;
}

interface Approver {
  email: string;
  name: string;
  id: string;
}

export interface listTransactionSchema {
  _id?: string; // 🎯 ADD THIS
  pdf_base64?: string; // 🎯 ADD THIS
  mapping: {};
  contract_type: string;
  document_type?: string;
  key: number;
  id: string;
  path_pdf: string;
  pdf_name: string;
  template_form_version: number;
  template_form_id: string;
  workflow_id: string;
  mapping_form_data_id: MappingFormData;
  tax_id: string;
  start_enabled: string;
  end_enabled: string;
  status:
    | "บันทึกร่าง"
    | "รอดำเนินการ"
    | "กำลังดำเนินการ"
    | "ปฏิเสธ"
    | "ยกเลิก"
    | "เสร็จสิ้น"
    | "N"
    | "W"
    | "R"
    | "C"
    | "Y"
    | "D";
  flow_data: FlowData[];
  participant: string[];
  inprogress_participant: string[];
  document_id: string;
  erp_document_id?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  approver: Approver[];
  codeStatus?: string;
}

export type listTransactionResponse = listTransactionSchema[];

interface FlowEntity {
  id: string;
  name: string;
}
// [Debug 2export] มี Flowdataitem export 2 ตัว
interface FlowDataItem {
  index: number;
  section: string;
  action: string;
  validate_type: string; // e.g., "pin", "otp"
  validate_data: string;
  selfie_video: boolean;
  script_video: string;
  type_entity: string; // e.g., "sender", "recipient", "group"
  entity: FlowEntity[];
  no_edit_mail: boolean;
}

export interface payloadUpdateTransaction {
  // biz_id: string;
  contract_type?: string;
  mapping_form_data_id: string;
  mapping_text: MappingTextItem[];
  mapping_checkbox: MappingCheckboxItem[];
  mapping_date_time: MappingDateTimeItem[];
  mapping_signature: MappingSignatureItem[];
  mapping_radiobox: MappingRadioboxItem[];
  mapping_stamp: MappingStampItem[];
  mapping_doc_no: MappingDocNoItem[];
  mapping_more_file: MappingFileItem[];
  mapping_eseal: MappingESealItem[];
  pdf_base64?: string;
  step_index: number;
  sign_base: string;
  type: string;
  reason?: string; // 🎯 FIXED: Add reason field for rejection
  flow_data?: FlowData[];
}

// Backward compatibility aliases (deprecated - use new types)
/** @deprecated Use FormSubmitData instead */
export type mappingCreateSchema = FormSubmitData;

/** @deprecated Use FormSubmitData[] instead */
export type mappingCreateResponse = FormSubmitData[];

// =============================================================================
// UTILITY TYPES AND HELPERS
// =============================================================================

// 🎯 NEW: Utility type for creating mapping items with partial data
export type PartialMappingItem<T extends BaseMappingItem> = Partial<T>;

// 🎯 NEW: Utility type for style conversion between ElementStyle and BaseMappingStyle
export type StyleConversionMap = {
  fontFamily: "font_family";
  fontSize: "font_size";
  fontWeight: "font_weight";
  fontStyle: "font_style";
  textAlign: "text_align";
  textDecoration: "text_decoration";
  justifyContent: "justify_content";
  color: "fill";
  backgroundColor: "background_color";
  borderColor: "border_color";
  borderWidth: "border_width";
  borderStyle: "border_style";
  borderRadius: "border_radius";
  padding: "padding";
  margin: "margin";
  width: "width";
  height: "height";
};

// 🎯 NEW: Helper function to convert ElementStyle to BaseMappingStyle
export const convertElementStyleToMappingStyle = (
  elementStyle: any
): BaseMappingStyle => {
  return {
    font_family: elementStyle.fontFamily,
    font_size:
      typeof elementStyle.fontSize === "string"
        ? parseInt(elementStyle.fontSize)
        : elementStyle.fontSize,
    font_weight: elementStyle.fontWeight,
    font_style: elementStyle.fontStyle,
    text_align: elementStyle.textAlign,
    text_decoration: elementStyle.textDecoration,
    justify_content: elementStyle.justifyContent,
    underline: elementStyle.textDecoration?.includes("underline") || false,
    fill: elementStyle.color,
    background_color: elementStyle.backgroundColor,
    border_color: elementStyle.borderColor,
    border_width: elementStyle.borderWidth?.toString(),
    border_style: elementStyle.borderStyle,
    border_radius: elementStyle.borderRadius?.toString(),
    padding: elementStyle.padding?.toString(),
    margin: elementStyle.margin?.toString(),
    width: elementStyle.width?.toString(),
    height: elementStyle.height?.toString(),
  };
};

// 🎯 NEW: Helper function to convert BaseMappingStyle to ElementStyle
export const convertMappingStyleToElementStyle = (mappingStyle: any): any => {
  return {
    fontFamily: mappingStyle.font_family,
    fontSize:
      typeof mappingStyle.font_size === "string"
        ? parseInt(mappingStyle.font_size)
        : mappingStyle.font_size,
    fontWeight: mappingStyle.font_weight,
    fontStyle: mappingStyle.font_style,
    textDecoration: mappingStyle.text_decoration,
    textAlign: mappingStyle.text_align,
    justifyContent: mappingStyle.justify_content,
    color: mappingStyle.fill,
    backgroundColor: mappingStyle.background_color,
    borderColor: mappingStyle.border_color,
    borderWidth:
      typeof mappingStyle.border_width === "string"
        ? parseInt(mappingStyle.border_width)
        : mappingStyle.border_width,
    borderStyle: mappingStyle.border_style,
    borderRadius:
      typeof mappingStyle.border_radius === "string"
        ? parseInt(mappingStyle.border_radius)
        : mappingStyle.border_radius,
    padding:
      typeof mappingStyle.padding === "string"
        ? parseInt(mappingStyle.padding)
        : mappingStyle.padding,
    margin:
      typeof mappingStyle.margin === "string"
        ? parseInt(mappingStyle.margin)
        : mappingStyle.margin,
    width: mappingStyle.width,
    height: mappingStyle.height,
  };
};

// 🎯 NEW: Type guard functions for runtime type checking
export const isBaseMappingItem = (obj: any): obj is BaseMappingItem => {
  return obj && typeof obj === "object" && "index" in obj;
};

export const isBaseMappingStyle = (obj: any): obj is BaseMappingStyle => {
  return obj && typeof obj === "object" && "font_family" in obj;
};

export const isMappingTextItem = (obj: any): obj is MappingTextItem => {
  return isBaseMappingItem(obj) && "text" in obj && "max_characters" in obj;
};

export const isMappingSignatureItem = (
  obj: any
): obj is MappingSignatureItem => {
  return isBaseMappingItem(obj) && "signatureType" in obj;
};

export const isMappingCheckboxItem = (obj: any): obj is MappingCheckboxItem => {
  return (
    isBaseMappingItem(obj) && "value" in obj && typeof obj.value === "boolean"
  );
};

export const isMappingRadioboxItem = (obj: any): obj is MappingRadioboxItem => {
  return (
    isBaseMappingItem(obj) &&
    "group" in obj &&
    "value" in obj &&
    typeof obj.value === "boolean"
  );
};

// 🎯 NEW: Factory functions for creating mapping items
export const createBaseMappingItem = (
  data: Partial<BaseMappingItem>
): BaseMappingItem => {
  return {
    index: data.index || 0,
    step_index: data.step_index || "0",
    llx: data.llx || "0",
    lly: data.lly || "0",
    urx: data.urx || "0",
    ury: data.ury || "0",
    left: data.left || "0",
    top: data.top || "0",
    scale_X: data.scale_X || "1",
    scale_Y: data.scale_Y || "1",
    angle: data.angle || "0",
    width: data.width || "100",
    height: data.height || "30",
    pageNumber: data.pageNumber || 1,
    image_base64: data.image_base64 || "",
  };
};

export const createBaseMappingStyle = (
  data: Partial<BaseMappingStyle>
): BaseMappingStyle => {
  return {
    font_family: data.font_family || "Arial",
    font_size: data.font_size || 14,
    font_weight: data.font_weight || "normal",
    font_style: data.font_style || "normal",
    text_align: data.text_align || "left",
    text_decoration: data.text_decoration || "none",
    justify_content: data.justify_content || "flex-start",
    underline: data.underline || false,
    fill: data.fill || "#000000",
    background_color: data.background_color || "transparent",
    border_color: data.border_color || "none",
    border_width: data.border_width || "0",
    border_style: data.border_style || "none",
    border_radius: data.border_radius || "0",
    padding: data.padding || "4",
    margin: data.margin || "0",
    width: data.width || "auto",
    height: data.height || "auto",
  };
};
