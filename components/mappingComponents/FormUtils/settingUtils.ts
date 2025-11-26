/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Settings Utilities
 *
 * This utility provides functions to handle user settings and related operations.
 */
"use client";

import { FormItem } from "../../../store/types/FormTypes";
import {UserSettingData ,SignatureImagePayload} from '@/store/types/PDFTemplateTypes' 
import { PageFormItems } from "./pdfFormManager";
import { UserSettingMappingParams, SaveUserSettingParams } from "./apiUtils";

// Interface for user setting function parameters
export interface UserSettingParams {
  data: UserSettingData | undefined;
  setUserSettings: (data: UserSettingData | null) => void;
}

// Interface for signature image setting parameters
export interface SignatureImageParams {
  payload: SignatureImagePayload | undefined;
  currentPageItems: FormItem[];
  pageNumber: number;
  setCurrentPageItems: (items: FormItem[]) => void;
  setPageFormItems: (updater: (prev: PageFormItems) => PageFormItems) => void;
}

/**
 * Handle signature image setting
 *
 * @param params - Signature image parameters
 */
export function settingImageSignature(params: SignatureImageParams): void {
  const {
    payload,
    currentPageItems,
    pageNumber,
    setCurrentPageItems,
    setPageFormItems,
  } = params;

  if (!payload) return;

  // อัพเดต currentPageItems - ทุกลายเซ็นในหน้าปัจจุบัน
  const updatedItems = currentPageItems.map((item) => {
    if (item.type === "signature") {
      return {
        ...item,
        value: payload.image, // เก็บค่า base64 ของ signature ใน value
      };
    }
    return item;
  });

  // อัพเดท state หน้าปัจจุบัน
  setCurrentPageItems(updatedItems);

  // อัพเดท pageFormItems - ทุกหน้าที่มีลายเซ็น
  setPageFormItems((prev) => {
    const newPageItems = { ...prev };
    
    // อัพเดทหน้าปัจจุบันก่อน
    newPageItems[pageNumber] = updatedItems;
    
    // อัพเดททุกหน้าอื่นๆ ที่มีลายเซ็น
    Object.keys(newPageItems).forEach((pageKey) => {
      const pageNum = parseInt(pageKey);
      if (pageNum !== pageNumber) {
        const pageItems = newPageItems[pageNum] || [];
        const updatedPageItems = pageItems.map((item) => {
          if (item.type === "signature") {
            return {
              ...item,
              value: payload.image, // ใช้ลายเซ็นเดียวกันทุกหน้า
            };
          }
          return item;
        });
        
        // อัพเดทเฉพาะเมื่อมีการเปลี่ยนแปลง
        if (JSON.stringify(pageItems) !== JSON.stringify(updatedPageItems)) {
          newPageItems[pageNum] = updatedPageItems;
        }
      }
    });
    
    return newPageItems;
  });
}

/**
 * Create signature image event handler
 *
 * @param currentPageItems - Current page form items
 * @param pageNumber - Current page number
 * @param setCurrentPageItems - Function to set current page items
 * @param setPageFormItems - Function to set page form items
 * @returns Signature image event handler function
 */
export function createSignatureImageHandler(
  currentPageItems: FormItem[],
  pageNumber: number,
  setCurrentPageItems: (items: FormItem[]) => void,
  setPageFormItems: (updater: (prev: PageFormItems) => PageFormItems) => void
) {
  return (payload: SignatureImagePayload | undefined) => {
    const params: SignatureImageParams = {
      payload,
      currentPageItems,
      pageNumber,
      setCurrentPageItems,
      setPageFormItems,
    };
    settingImageSignature(params);
  };
}

/**
 * Initialize signature image event listener
 *
 * @param appEmitter - Event emitter instance
 * @param currentPageItems - Current page form items
 * @param pageNumber - Current page number
 * @param setCurrentPageItems - Function to set current page items
 * @param setPageFormItems - Function to set page form items
 * @returns Cleanup function
 */
export function initializeSignatureImageListener(
  appEmitter: any,
  currentPageItems: FormItem[],
  pageNumber: number,
  setCurrentPageItems: (items: FormItem[]) => void,
  setPageFormItems: (updater: (prev: PageFormItems) => PageFormItems) => void
): () => void {
  const handler = createSignatureImageHandler(
    currentPageItems,
    pageNumber,
    setCurrentPageItems,
    setPageFormItems
  );

  appEmitter.on("settingImageSignature", handler);

  return () => {
    appEmitter.off("settingImageSignature", handler);
  };
}

/**
 * Handle user setting data update
 *
 * @param params - User setting parameters
 */
export function handleUserSetting(params: UserSettingParams): void {
  const { data, setUserSettings } = params;
  
  if (!data) return;
  setUserSettings(data);
}

/**
 * Subscribe to user setting events
 * 
 * @param appEmitter - Event emitter instance
 * @param handleUserSettingCallback - Callback function for user settings
 * @param handleUserSettingMappingCallback - Callback function for user setting mapping
 * @returns Cleanup function to unsubscribe from events
 */
export function subscribeToUserSettingEvents(
  appEmitter: any,
  handleUserSettingCallback: (data: UserSettingData | undefined) => void,
  handleUserSettingMappingCallback: (approvers: any[] | undefined) => void
): () => void {
  // Subscribe to userSetting events
  appEmitter.on("userSetting", handleUserSettingCallback);
  appEmitter.on("userSettingMapping", handleUserSettingMappingCallback);

  // Return cleanup function
  return () => {
    appEmitter.off("userSetting", handleUserSettingCallback);
    appEmitter.off("userSettingMapping", handleUserSettingMappingCallback);
  };
}

/**
 * Create user setting event handlers
 * 
 * @param setUserSettings - Function to set user settings
 * @param userSettingMappingAPI - API function for user setting mapping
 * @param documentId - Document ID
 * @param formId - Form ID
 * @returns Object with event handler functions
 */
export function createUserSettingHandlers(
  setUserSettings: (data: UserSettingData | null) => void,
  userSettingMappingAPI: any,
  documentId: string,
  formId: string | null
) {
  const handleUserSettingCallback = (data: UserSettingData | undefined) => {
    const params: UserSettingParams = { data, setUserSettings };
    handleUserSetting(params);
  };

  const handleUserSettingMappingCallback = (approvers: any[] | undefined) => {
    const params = {
      approvers,
      setUserSettings,
      documentId: documentId || "",
      formId: formId || null,
    };
    return userSettingMappingAPI(params);
  };

  return {
    handleUserSettingCallback,
    handleUserSettingMappingCallback,
  };
}

/**
 * Initialize user settings for a component
 * 
 * @param appEmitter - Event emitter instance
 * @param setUserSettings - Function to set user settings
 * @param userSettingMappingAPI - API function for user setting mapping
 * @param documentId - Document ID
 * @param formId - Form ID
 * @returns Cleanup function
 */
export function initializeUserSettings(
  appEmitter: any,
  setUserSettings: (data: UserSettingData | null) => void,
  userSettingMappingAPI: any,
  documentId: string,
  formId: string | null
): () => void {
  const { handleUserSettingCallback, handleUserSettingMappingCallback } =
    createUserSettingHandlers(
      setUserSettings,
      userSettingMappingAPI,
      documentId,
      formId
    );

  return subscribeToUserSettingEvents(
    appEmitter,
    handleUserSettingCallback,
    handleUserSettingMappingCallback
  );
}

/**
 * Transform approvers data to workflow format
 * 
 * @param approvers - Array of approver data
 * @returns Transformed workflow steps
 */
export function transformApproversToWorkflow(approvers: any[]): any[] {
  return approvers.map((approver: any) => ({
    index: approver.index - 1,
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
}

/**
 * Validate user settings data
 * 
 * @param userSettings - User settings data to validate
 * @returns Validation result
 */
export function validateUserSettings(userSettings: UserSettingData | null): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!userSettings) {
    errors.push("User settings data is required");
    return { isValid: false, errors };
  }

  if (!userSettings.approvers || userSettings.approvers.length === 0) {
    errors.push("At least one approver is required");
  }

  if (!userSettings.formId) {
    errors.push("Form ID is required");
  }

  userSettings.approvers?.forEach((approver, index) => {
    if (!approver.index) {
      errors.push(`Approver ${index + 1}: Index is required`);
    }
    if (!approver.permission) {
      errors.push(`Approver ${index + 1}: Permission is required`);
    }
    if (!approver.entities || approver.entities.length === 0) {
      errors.push(`Approver ${index + 1}: At least one entity is required`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Import interfaces from apiUtils to avoid duplication
// Note: UserSettingMappingParams and SaveUserSettingParams are defined in apiUtils.ts

/**
 * Handle user setting mapping
 *
 * @param params - User setting mapping parameters
 * @param userSettingMappingAPI - API function for user setting mapping
 * @returns API call result
 */
export function handleUserSettingMapping(
  params: UserSettingMappingParams,
  userSettingMappingAPI: any
) {
  return userSettingMappingAPI(params);
}

/**
 * Handle save user setting
 *
 * @param params - Save user setting parameters
 * @param saveUserSettingAPI - API function for saving user settings
 * @returns API call result
 */
export function handleSaveUserSetting(
  params: SaveUserSettingParams,
  saveUserSettingAPI: any
) {
  return saveUserSettingAPI(params);
}
