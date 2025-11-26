/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FormItem } from "@/store/types";
import { mockPDFData, PDFDataType } from "../mockData/mockPDFData";
import { STYLE_CONSTANTS } from '@/components/mappingComponents/FormUtils/defaultStyle';
import { BusinessUtils } from "@/store/utils/businessUtils";

// Interface for extended form data that includes items
interface ExtendedFormData extends PDFDataType {
  items: FormItem[];
}

// Create a map of form data keyed by id using the mockPDFData
export const mockPDFFormsData: Record<string, ExtendedFormData> = {};

/**
 * Simulate API call to fetch form items based on document ID
 */
export const fetchFormItemsAPI = async (documentId: string): Promise<FormItem[]> => {
  // Add artificial delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 500));
  
  
  
  // Check if we have items for this document
  if (documentId in mockPDFFormsData) {
    const items = mockPDFFormsData[documentId].items;
    
    return JSON.parse(JSON.stringify(items)); // Return a deep clone
  }
  
  // Return empty array if no items found
  
  return [];
};

/**
 * Simulate API call to save form items
 */
export const saveFormItemsAPI = async (documentId: string, items: FormItem[]): Promise<{ success: boolean; message: string }> => {
  // Add artificial delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 800));
  
  
  
  // Transform items to the new format for API
  const mappingText = items
    .filter(item => ['text', 'textarea', 'email', 'phone', 'number', 'date', 'name'].includes(item.type))
    .map(item => ({
      left: item.position?.x.toString() || "0",
      top: item.position?.y.toString() || "0",
      text: item.label,
      required: item.config?.required ? "true" : "false",
      max_characters: item.config?.maxLength?.toString() || "100",
      max_lines: item.type === 'textarea' ? "5" : "1", // Use fixed value based on type
      font_family: item.style?.fontFamily || STYLE_CONSTANTS.DEFAULT_FONT_FAMILY,
      font_size: item.style?.fontSize || STYLE_CONSTANTS.DEFAULT_FONT_SIZE,
      font_weight: item.style?.fontWeight || STYLE_CONSTANTS.DEFAULT_FONT_WEIGHT,
      font_style: item.style?.fontStyle || STYLE_CONSTANTS.DEFAULT_FONT_STYLE,
      text_align: item.style?.textAlign || STYLE_CONSTANTS.DEFAULT_TEXT_ALIGN,
      underline: item.style?.textDecoration === "underline",
      fill: item.style?.color || STYLE_CONSTANTS.DEFAULT_COLOR,
      background_color: item.style?.backgroundColor || STYLE_CONSTANTS.TRANSPARENT_BACKGROUND,
      page_number: item.pageNumber || 1
    }));

  const mappingRadio = items
    .filter(item => ['radio', 'checkbox', 'select'].includes(item.type))
    .map(item => ({
      left: item.position?.x.toString() || "0",
      top: item.position?.y.toString() || "0",
      text: item.label,
      required: item.config?.required ? "true" : "false",
      options: item.checkboxOptions || [],
      font_family: item.style?.fontFamily || "Arial",
      font_size: item.style?.fontSize || 14,
      font_weight: item.style?.fontWeight || "normal",
      font_style: item.style?.fontStyle || "normal",
      text_align: item.style?.textAlign || "left",
      fill: item.style?.color || "#000000",
      background_color: item.style?.backgroundColor || "transparent",
      page_number: item.pageNumber || 1
    }));

  // Create request body
  const requestBody = {
    // business_id: BusinessUtils.getBusinessId() || "",
    // business_id: "175128061064325",
    workspace_id:"",
    folder_id: "",
    pdf_base64: mockPDFFormsData[documentId]?.url || "",
    pdf_name: mockPDFFormsData[documentId]?.fileName || "",
    tax_id: "", // Empty for now
    is_dreft: false,
    is_enabled: true,
    start_enabled: new Date().toISOString().split('T')[0],
    mapping_text: mappingText,
    mapping_radio: mappingRadio,
    mapping_sign: []
  };
  
  
  
  // In a real implementation, you would send the requestBody to your API
  // const response = await fetch(`/api/form/${documentId}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(requestBody)
  // });
  // return await response.json();
  
  // Update the mock data (in a real app, this would be a POST request)
  if (documentId in mockPDFFormsData) {
    mockPDFFormsData[documentId] = {
      ...mockPDFFormsData[documentId],
      items: JSON.parse(JSON.stringify(items)),
    };
    
    return {
      success: true,
      message: `บันทึกข้อมูลสำเร็จ: ${items.length} รายการ`
    };
  }
  
  return {
    success: false,
    message: 'ไม่พบเอกสารที่ต้องการบันทึก'
  };
};

/**
 * Simulate API call to save a new form
 */
export const simulateApiCall = async (formData: {
  formId: string | null;
  formTitle: string;
  pdfFilename: string | null | undefined;
  totalPages: number | null;
  items: FormItem[];
}): Promise<{ success: boolean; message: string }> => {

  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // If we have a formId, use the saveFormItemsAPI
  if (formData.formId) {
    return saveFormItemsAPI(formData.formId, formData.items);
  }

  // In a real implementation, we would POST the structured request body to the API
  // const response = await fetch('/api/form', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(requestBody)
  // });
  // return await response.json();

  // Simulate successful response
  return { success: true, message: "ข้อมูลถูกบันทึกเรียบร้อยแล้ว" };
};

/**
 * Format and prepare API request to save form data
 */
export const saveFormData = async (
  formId: string | null,
  formTitle: string,
  pdfFile: string | null,
  numPages: number | null,
  pageFormItems: Record<number, FormItem[]>
): Promise<{ success: boolean; message: string }> => {
  try {
    // Gather all items from all pages
    const allItems = Object.entries(pageFormItems).flatMap(([pageNum, items]) =>
      items.map((item: FormItem) => ({
        ...item,
        pageNumber: parseInt(pageNum),
      }))
    );

    // Extract the filename from the pdf path
    const filename = pdfFile ? pdfFile.split("/").pop() : null;
    
    // Transform items into the required API format with only essential properties
    const mappingText = allItems
      .filter(item => ['text', 'textarea', 'email', 'phone', 'number', 'date', 'name'].includes(item.type))
      .map(item => ({
        left: item.position?.x.toString() || "0",
        top: item.position?.y.toString() || "0",
        text: item.label,
        required: item.config?.required ? "true" : "false",
        max_characters: item.config?.maxLength?.toString() || "100",
        max_lines: item.type === 'textarea' ? "5" : "1", // Use fixed value based on type
        font_family: item.style?.fontFamily || STYLE_CONSTANTS.DEFAULT_FONT_FAMILY,
        font_size: item.style?.fontSize || STYLE_CONSTANTS.DEFAULT_FONT_SIZE,
        font_weight: item.style?.fontWeight || STYLE_CONSTANTS.DEFAULT_FONT_WEIGHT,
        font_style: item.style?.fontStyle || STYLE_CONSTANTS.DEFAULT_FONT_STYLE,
        text_align: item.style?.textAlign || STYLE_CONSTANTS.DEFAULT_TEXT_ALIGN,
        underline: item.style?.textDecoration === "underline",
        fill: item.style?.color || STYLE_CONSTANTS.DEFAULT_COLOR,
        background_color: item.style?.backgroundColor || STYLE_CONSTANTS.TRANSPARENT_BACKGROUND,
        page_number: item.pageNumber || 1
      }));

    const mappingRadio = allItems
      .filter(item => ['radio', 'checkbox', 'select'].includes(item.type))
      .map(item => ({
        left: item.position?.x.toString() || "0",
        top: item.position?.y.toString() || "0",
        text: item.label,
        required: item.config?.required ? "true" : "false",
        options: item.checkboxOptions || [],
        font_family: item.style?.fontFamily || STYLE_CONSTANTS.DEFAULT_FONT_FAMILY,
        font_size: item.style?.fontSize || STYLE_CONSTANTS.DEFAULT_FONT_SIZE,
        font_weight: item.style?.fontWeight || STYLE_CONSTANTS.DEFAULT_FONT_WEIGHT,
        font_style: item.style?.fontStyle || STYLE_CONSTANTS.DEFAULT_FONT_STYLE,
        text_align: item.style?.textAlign || STYLE_CONSTANTS.DEFAULT_TEXT_ALIGN,
        fill: item.style?.color || STYLE_CONSTANTS.DEFAULT_COLOR,
        background_color: item.style?.backgroundColor || STYLE_CONSTANTS.TRANSPARENT_BACKGROUND,
        page_number: item.pageNumber || 1
      }));

    // Add mapping for signature elements
    const mappingSignature = allItems
      .filter(item => item.type === 'signature')
      .map(item => {
        // Calculate default width and height since they're not in ElementStyle
        const defaultWidth = 300;
        const defaultHeight = 100;
        
        return {
          left: item.position?.x.toString() || "0",
          top: item.position?.y.toString() || "0",
          width: defaultWidth.toString(),
          height: defaultHeight.toString(),
          text: item.label,
          required: item.config?.required ? "true" : "false",
          signatureType: "normal", // Default signature type
          page_number: item.pageNumber || 1,
          actorId: item.actorId || "" // Include the actor ID to associate signatures with approvers
        };
      });

    // Prepare the API request body according to the required format
    const requestBody = {
      // business_id: BusinessUtils.getBusinessId() || "",
      // business_id: "175128061064325",
      workspace_id:"",
      folder_id: "",
      pdf_base64: pdfFile || "",
      pdf_name: filename || "",
      tax_id: "", // Empty for now, would need to be populated from user data
      is_dreft: false, // Set default value, could be a parameter
      is_enabled: true, // Default to enabled
      start_enabled: new Date().toISOString().split('T')[0], // Current date as default
      mapping_text: mappingText,
      mapping_radio: mappingRadio,
      mapping_sign: mappingSignature // Include signatures in the request
    };

    

    // Use the appropriate API based on whether we have a formId
    let response;
    if (formId) {
      // Use the API with the formatted request body
      response = await saveFormItemsAPI(formId, allItems);
      // In a real implementation, you would send the requestBody to your API
      // response = await fetch(`/api/form/${formId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(requestBody)
      // }).then(res => res.json());
    } else {
      // For new forms
      response = await simulateApiCall({
        formId: formId,
        formTitle: formTitle,
        pdfFilename: filename,
        totalPages: numPages,
        items: allItems
      });
      // In a real implementation, you would send the requestBody to your API
      // response = await fetch('/api/form', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(requestBody)
      // }).then(res => res.json());
    }

    return response;
  } catch (error) {
    console.error("Error saving form:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล"
    };
  }
}; 