/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Payload Utilities - CENTRALIZED PAYLOAD BUILDER
 * 
 * This file contains common payload building functions to eliminate
 * code duplication between apiUtils.ts and MappingBackend.ts
 */
"use client";

import { FormItem } from "../../../store/types";
import {
  getCompleteDefaultStyle,
  convertStyleToApiFormat,
  getDefaultElementSize,
  getCompleteElementConfig,
  CONFIG_CONSTANTS,
  STYLE_CONSTANTS,
} from "./defaultStyle";

// 🎯 COMMON PAYLOAD INTERFACES
export interface BasePayloadItem {
  index: number;
  step_index: number;
  llx: string;
  lly: string;
  urx: string;
  ury: string;
  left: string;
  top: string;
  scale_X: string;
  scale_Y: string;
  width: string;
  height: string;
  text: string;
  required: string;
  pageNumber: number;
  font_family: string;
  font_size: string | number;
  font_weight: string;
  font_style: string;
  text_align: string;
  text_decoration: string;
  justify_content: string;
  underline: string | boolean;
  fill: string;
  background_color: string;
  border_color: string;
  border_width: string;
  border_style: string;
  border_radius: string;
  padding: string;
  margin: string;
}

// 🎯 COORDINATE HANDLER - Single source for coordinate processing
export const processCoordinates = (item: FormItem) => {
  const coordinates = (item as any).coordinates;
  
  if (coordinates) {
    return {
      llx: coordinates.llx?.toString() || "0",
      lly: coordinates.lly?.toString() || "0", 
      urx: coordinates.urx?.toString() || "0",
      ury: coordinates.ury?.toString() || "0",
    };
  }
  
  // Fallback to zero coordinates
  return {
    llx: "0",
    lly: "0", 
    urx: "0",
    ury: "0",
  };
};

// 🎯 POSITION HANDLER - Single source for position processing
export const processPosition = (item: FormItem) => {
  const position = (item as any).position;
  
  return {
    left: (position?.x || 0).toString(),
    top: (position?.y || 0).toString(),
    scale_X: (position?.x || 0).toString(),
    scale_Y: (position?.y || 0).toString(),
  };
};

// 🎯 STYLE PROCESSOR - Single source for style processing
export const processElementStyle = (item: FormItem, elementType: string | undefined) => {
  // Handle undefined or invalid elementType
  const validElementType = elementType && typeof elementType === 'string' ? elementType : 'text';
  
  // ✅ Get complete config using centralized system
  const completeConfig = getCompleteElementConfig(validElementType, (item as any).config);

  // ✅ Process element style with null safety
  const elementStyle = (item as any).style ? {
    fontFamily: (item as any).style.fontFamily,
    fontSize: typeof (item as any).style.fontSize === "string" ? parseInt((item as any).style.fontSize) : (item as any).style.fontSize,
    fontWeight: (item as any).style.fontWeight,
    fontStyle: (item as any).style.fontStyle,
    textDecoration: (item as any).style.textDecoration,
    textAlign: (item as any).style.textAlign,
    justifyContent: (item as any).style.justifyContent,
    color: (item as any).style.color,
    backgroundColor: (item as any).style.backgroundColor,
    borderColor: (item as any).style.borderColor,
    borderWidth: typeof (item as any).style.borderWidth === "string" ? parseInt((item as any).style.borderWidth) : (item as any).style.borderWidth,
    borderStyle: (item as any).style.borderStyle,
    borderRadius: typeof (item as any).style.borderRadius === "string" ? parseInt((item as any).style.borderRadius) : (item as any).style.borderRadius,
    padding: typeof (item as any).style.padding === "string" ? parseInt((item as any).style.padding) : (item as any).style.padding,
    margin: typeof (item as any).style.margin === "string" ? parseInt((item as any).style.margin) : (item as any).style.margin,
    width: typeof (item as any).style.width === "string" ? parseInt((item as any).style.width) : (item as any).style.width,
    height: typeof (item as any).style.height === "string" ? parseInt((item as any).style.height) : (item as any).style.height,
  } : undefined;

  // ✅ Get complete default style
  const completeStyle = getCompleteDefaultStyle(
    validElementType,
    elementStyle,
    undefined
  );

  // ✅ Convert to API format
  const apiStyleFormat = convertStyleToApiFormat(completeStyle, validElementType);

  return {
    completeConfig,
    completeStyle,
    apiStyleFormat,
  };
};

// 🎯 SIZE PROCESSOR - Single source for size processing
export const processElementSize = (item: FormItem, elementType: string | undefined) => {
  // Handle undefined or invalid elementType
  const validElementType = elementType && typeof elementType === 'string' ? elementType : 'text';
  const defaultSize = getDefaultElementSize(validElementType);
  
  const widthFromStyle = (item as any).style?.width
    ? typeof (item as any).style.width === "string"
      ? ((item as any).style.width as string).replace("px", "")
      : ((item as any).style.width as number).toString()
    : defaultSize.width.toString();

  const heightFromStyle = (item as any).style?.height
    ? typeof (item as any).style.height === "string"
      ? ((item as any).style.height as string).replace("px", "")
      : ((item as any).style.height as number).toString()
    : defaultSize.height.toString();

  return {
    width: widthFromStyle,
    height: heightFromStyle,
  };
};

// 🎯 BASE PAYLOAD BUILDER - Core function for building common payload structure
export const buildBasePayload = (
  item: FormItem,
  elementType: string | undefined,
  index: number,
  additionalProps: Partial<BasePayloadItem> = {}
): BasePayloadItem => {
  // Handle undefined or invalid elementType
  const validElementType = elementType && typeof elementType === 'string' ? elementType : 'text';
  
  const coordinates = processCoordinates(item);
  const position = processPosition(item);
  const { completeConfig, apiStyleFormat } = processElementStyle(item, validElementType);
  const size = processElementSize(item, validElementType);

  return {
    index,
    step_index: parseInt((item as any).step_index || "0"),
    ...coordinates,
    ...position,
    ...size,
    text: (item as any).text || (item as any).label || `${validElementType} ${index + 1}`,
    required: completeConfig.required?.toString() || CONFIG_CONSTANTS.DEFAULT_REQUIRED.toString(),
    pageNumber: (item as any).pageNumber || 1,
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
    ...additionalProps,
  };
};

// 🎯 STEP INDEX EXPANDER - Handle "all" step_index expansion
export const expandAllStepItems = (
  items: FormItem[],
  availableStepIndices: string[]
) => {
  const expandedItems: any[] = [];
  
  items.forEach((item: any, originalIndex: number) => {
    if (item.step_index === "all") {
      // Create copies for each available step index
      availableStepIndices.forEach((availableStepIndex: string, copyIndex: number) => {
        expandedItems.push({
          ...item,
          step_index: availableStepIndex,
          actorId: availableStepIndex,
          originalIndex: originalIndex,
          copyIndex: copyIndex,
          expandedIndex: expandedItems.length,
        });
      });
    } else {
      // Keep original item
      expandedItems.push({
        ...item,
        originalIndex: originalIndex,
        copyIndex: 0,
        expandedIndex: expandedItems.length,
      });
    }
  });
  
  return expandedItems;
};

// 🎯 AVAILABLE STEP INDICES EXTRACTOR
export const extractAvailableStepIndices = (documentData: any): string[] => {
  return documentData.flow_data?.map((flowItem: any) => flowItem.index.toString()) || [];
};

// 🎯 FILTERED FLOW DATA PROCESSOR
export const getFilteredFlowData = (documentData: any): string[] => {
  return documentData.flow_data
    ?.filter((flowItem: any) => flowItem.status !== "W")
    .map((flowItem: any) => flowItem.index.toString()) || [];
};

// 🎯 ELEMENT TYPE FILTER
export const filterItemsByType = (
  items: FormItem[],
  type: string
): FormItem[] => {
  return items.filter((item: any) => item.type === type);
};

// 🎯 DATE GROUP PROCESSOR - Special handler for date grouping
export const groupDateItems = (dateItems: FormItem[]) => {
  const dateGroups = new Map<string, any[]>();
  
  dateItems.forEach((item: any) => {
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
  
  return dateGroups;
};

// 🎯 CHECKBOX GROUP PROCESSOR - Special handler for checkbox grouping
export const groupCheckboxItems = (checkboxItems: FormItem[]) => {
  const checkboxGroups = new Map<string, any[]>();
  
  checkboxItems.forEach((item: any) => {
    // Extract timestamp from ID pattern: checkbox-input-1757388338121-0-0
    // Pattern: checkbox-input-{timestamp}-{stepIdx}-{optionIndex}
    const idParts = item.id.split('-');
    let timestamp = '';
    let stepIndex = '';
    
    if (idParts.length >= 5 && idParts[1] === 'input') {
      // Pattern: checkbox-input-timestamp-stepIdx-optionIndex
      timestamp = idParts[2];
      stepIndex = idParts[3];
    }
    
    // Use composite key (timestamp + step_index) to separate groups per approver
    const groupKey = `${timestamp}-step-${stepIndex}`;
    
    if (timestamp && stepIndex) {
      if (!checkboxGroups.has(groupKey)) {
        checkboxGroups.set(groupKey, []);
      }
      checkboxGroups.get(groupKey)!.push(item);
    }
  });
  return checkboxGroups;
};

// 🎯 RADIO GROUP PROCESSOR - Special handler for radio grouping  
export const groupRadioItems = (radioItems: FormItem[]) => {
  const radioGroups = new Map<string, any[]>();
  
  radioItems.forEach((item: any) => {
    // Extract timestamp from ID pattern: radio-input-1757388338121-0-0
    // Pattern: radio-input-{timestamp}-{stepIdx}-{optionIndex}
    const idParts = item.id.split('-');
    let timestamp = '';
    let stepIndex = '';
    
    if (idParts.length >= 5 && idParts[1] === 'input') {
      // Pattern: radio-input-timestamp-stepIdx-optionIndex
      timestamp = idParts[2];
      stepIndex = idParts[3];
    }
    
    // Use composite key (timestamp + step_index) to separate groups per approver
    const groupKey = `${timestamp}-step-${stepIndex}`;
    
    if (timestamp && stepIndex) {
      if (!radioGroups.has(groupKey)) {
        radioGroups.set(groupKey, []);
      }
      radioGroups.get(groupKey)!.push(item);
    }
  });
  return radioGroups;
};

// 🎯 STAMP TYPE EXTRACTOR - Extract stamp type from ID
export const extractStampType = (itemId: string): string => {
  // Extract index from ID pattern: stamp-{section}-{index}-{timestamp}
  const idParts = itemId.split('-');
  const indexPart = idParts[2]; // index is the 3rd part
  const index = parseInt(indexPart, 10);
  
  // index 0 = ต้นสัญญา, index 1 = คู่สัญญา
  return index === 0 ? "ต้นสัญญา" : "คู่สัญญา";
};

// 🎯 STAMP SECTION EXTRACTOR - Extract section from ID
export const extractStampSection = (itemId: string): string => {
  // Extract section from ID pattern: stamp-{section}-{index}-{timestamp}
  const idParts = itemId.split('-');
  return idParts[1] || "มาตรา 9"; // Default to มาตรา 9
};