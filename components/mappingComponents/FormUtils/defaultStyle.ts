/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Default Style Configuration - CENTRALIZED HUB
 * 
 * This file contains all default style values for form elements
 * to ensure consistent styling across FormCanvas.tsx and StylePanel.tsx
 */

import { enqueueSnackbar } from "notistack";
import { ElementStyle } from "../../../store/types/FormTypes";
import dayjs from "dayjs";

// Default element sizes based on FormCanvas getDefaultSize logic
export const getDefaultElementSize = (type: string, dateTimeType?: string) => {
  switch (type) {
    case "text":      return { width: 150, height: 30 };
    case "signature": return { width: 150, height: 80 };
    case "date":      return { width: 50,  height: 30 }; 
    case "days":      return { width: 60,  height: 30 }; 
    case "months":    return { width: 80,  height: 30 }; 
    case "years":     return { width: 80,  height: 30 }; 
    case "select":    return { width: 180, height: 60 };
    case "checkbox":  return { width: 120, height: 30 };
    case "radio":     return { width: 120, height: 30 };
    case "stamp":     return { width: 150, height: 80 };
    default:          return { width: 180, height: 60 };
  }
};

// 🎯 NEW: Calculate dynamic size for checkbox and radio based on number of options
export const calculateDynamicElementSize = (
  type: string, 
  baseSize: { width: number; height: number },
  options?: string[]
): { width: number; height: number } => {
  if (type !== "checkbox" && type !== "radio") {
    return baseSize;
  }

  const optionCount = options?.length || 0;
  if (optionCount === 0) {
    return baseSize;
  }

  // Calculate height based on number of options
  // Each option takes approximately 24px (checkbox/radio + text + padding)
  const optionHeight = 24;
  const padding = 8; // 4px top + 4px bottom
  const calculatedHeight = Math.max(baseSize.height, (optionCount * optionHeight) + padding);

  return {
    width: baseSize.width,
    height: calculatedHeight,
  };
};

// 🎯 DATE CONFIG INTERFACE - Specific configuration for date elements with dateTimeType = "date"
export interface DateConfig {
  header: string; // "วันที่" by default
  days?: string; // "DD" by default
  months?: string; // "MM" by default
  years?: string; // "YYYY" by default
  format?: "EU" | "US"; // "EU" (DD/MM/YYYY) or "US" (MM/DD/YYYY)
  currentDate?: boolean; // false by default
  required?: boolean; // false by default
}

// 🎯 CENTRALIZED CONSTANTS - Single source of truth
export const STYLE_CONSTANTS = {
  DEFAULT_FONT_FAMILY: "Arial",
  DEFAULT_FONT_SIZE: 14,
  DEFAULT_FONT_WEIGHT: "normal",
  DEFAULT_FONT_STYLE: "normal",
  DEFAULT_TEXT_DECORATION: "none",
  DEFAULT_TEXT_ALIGN: "left",
  DEFAULT_JUSTIFY_CONTENT: "flex-start",
  DEFAULT_COLOR: "#000000",
  DEFAULT_BACKGROUND_COLOR: "rgba(239, 68, 68, 0.3)",
  DEFAULT_BORDER_COLOR: "none",
  DEFAULT_BORDER_WIDTH: 0,
  DEFAULT_BORDER_STYLE: "none",
  DEFAULT_BORDER_RADIUS: 0,
  DEFAULT_PADDING: 4,
  DEFAULT_MARGIN: 0,
  TRANSPARENT_BACKGROUND: "transparent",
  OUTLINE_COLOR: "#1890ff",
  GPU_WILL_CHANGE: "width, height",
} as const;

// 🎯 CONFIG CONSTANTS - Centralized config defaults for form elements
export const CONFIG_CONSTANTS = {
  DEFAULT_REQUIRED: false,
  DEFAULT_MAX_LENGTH: 100,
  DEFAULT_MIN_LINES: 1,
  DEFAULT_PLACEHOLDER: "",
  TEXT_MAX_LENGTH: 100,
  TEXT_MIN_LINES: 1,
  TEXT_PLACEHOLDER: "กรอกข้อมูล",
  SELECT_PLACEHOLDER: "เลือกตัวเลือก",
  DATE_PLACEHOLDER: "เลือกวันที่",
  DATE_HEADER: "วันที่",
  DATE_DAYS_PLACEHOLDER: "DD",
  DATE_MONTHS_PLACEHOLDER: "MM", 
  DATE_YEARS_PLACEHOLDER: "YYYY",
  DATE_FORMAT: "EU", // EU format (DD/MM/YYYY)
  DATE_CURRENT_DATE: false,
  DATE_REQUIRED: false,
  DAYS_LABEL: "Days",
  MONTHS_LABEL: "Months", 
  YEARS_LABEL: "Years",
  DAYS_MAX_LENGTH: 2,
  MONTHS_MAX_LENGTH: 2,
  YEARS_MAX_LENGTH: 4,
  DATE_INPUT_WIDTH: 50,
  DATE_INPUT_HEIGHT: 30,
  DATE_INPUT_GAP: 10,
  SIGNATURE_REQUIRED: true,
  CHECKBOX_MIN_OPTIONS: 1,
  RADIO_MIN_OPTIONS: 1,
  MORE_FILE_MAX_SIZE: 10, // MB (file_size)
  MORE_FILE_DEFAULT_TYPE_NAME: "เอกสารแนบ", // type_name
  MORE_FILE_DEFAULT_IS_EMBEDDED: false, // is_embedded
  MORE_FILE_DEFAULT_IS_REQUIRED: false, // is_required
  MORE_FILE_FILE_ACCEPT: [] as string[], // file_accept - default empty array, user will select manually
  // 🎯 THAI NUMBER SUPPORT - Constants for Thai number formatting
  // Unicode Block: U+0E50..U+0E59 (๐-๙)
  THAI_NUMBERS: ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"],
} as const;

// 🎯 ELEMENT CONFIG INTERFACE - Type-safe config properties
export interface ElementConfig {
  required?: boolean;
  maxLength?: number;
  minLines?: number;
  placeholder?: string;
  label?: string;
  checkboxOptions?: string[];
  radioOptions?: string[]; // เพิ่มสำหรับ radio
  selectOptions?: string[]; // เพิ่มสำหรับ select
  maxFileSize?: number; // file_size in MB
  typeName?: string; // type_name
  isEmbedded?: boolean; // is_embedded
  fileAccept?: string[]; // file_accept
  dateConfig?: DateConfig; // For date elements
  dateInputs?: { // For date elements with dateTimeType = "date"
    days?: {
      placeholder?: string;
      maxLength?: number;
      required?: boolean;
    };
    months?: {
      placeholder?: string;
      maxLength?: number;
      required?: boolean;
    };
    years?: {
      placeholder?: string;
      maxLength?: number;
      required?: boolean;
    };
  };
}

// Base default style properties using centralized constants
export const BASE_DEFAULT_STYLE: ElementStyle = {
  fontFamily: STYLE_CONSTANTS.DEFAULT_FONT_FAMILY,
  fontSize: STYLE_CONSTANTS.DEFAULT_FONT_SIZE,
  fontWeight: STYLE_CONSTANTS.DEFAULT_FONT_WEIGHT,
  fontStyle: STYLE_CONSTANTS.DEFAULT_FONT_STYLE,
  textDecoration: STYLE_CONSTANTS.DEFAULT_TEXT_DECORATION,
  textAlign: STYLE_CONSTANTS.DEFAULT_TEXT_ALIGN,
  justifyContent: STYLE_CONSTANTS.DEFAULT_JUSTIFY_CONTENT, 
  color: STYLE_CONSTANTS.DEFAULT_COLOR,
  backgroundColor: STYLE_CONSTANTS.DEFAULT_BACKGROUND_COLOR, 
  borderColor: STYLE_CONSTANTS.DEFAULT_BORDER_COLOR,
  borderWidth: STYLE_CONSTANTS.DEFAULT_BORDER_WIDTH,
  borderStyle: STYLE_CONSTANTS.DEFAULT_BORDER_STYLE,
  borderRadius: STYLE_CONSTANTS.DEFAULT_BORDER_RADIUS,
  padding: STYLE_CONSTANTS.DEFAULT_PADDING,
  margin: STYLE_CONSTANTS.DEFAULT_MARGIN,
};

/**
 * 🎯 FOR FORMCANVAS - Get CSS-compatible default styles
 * Replaces hardcoded defaults in consolidatedStyles
 */
export const getFormCanvasDefaults = (
  elementStyle?: Partial<ElementStyle>,
  type?: string
): React.CSSProperties => {
  const size = type ? getDefaultElementSize(type) : { width: 200, height: 60 };
  
  // 🎯 NEW: Special handling for date inputs to ensure consistent sizing
  let finalSize = size;
  if (type === "days" || type === "months" || type === "years") {
    finalSize = { width: 50, height: 30 }; // Fixed size for date inputs
  }
  
  return {
    fontFamily: elementStyle?.fontFamily || STYLE_CONSTANTS.DEFAULT_FONT_FAMILY,
    fontSize: elementStyle?.fontSize ? `${elementStyle.fontSize}px` : `${STYLE_CONSTANTS.DEFAULT_FONT_SIZE}px`,
    fontWeight: elementStyle?.fontWeight || STYLE_CONSTANTS.DEFAULT_FONT_WEIGHT,
    fontStyle: elementStyle?.fontStyle || STYLE_CONSTANTS.DEFAULT_FONT_STYLE,
    textDecoration: elementStyle?.textDecoration || STYLE_CONSTANTS.DEFAULT_TEXT_DECORATION,
    textAlign: (elementStyle?.textAlign as React.CSSProperties["textAlign"]) || STYLE_CONSTANTS.DEFAULT_TEXT_ALIGN,
    justifyContent: (elementStyle?.justifyContent as React.CSSProperties["justifyContent"]) || STYLE_CONSTANTS.DEFAULT_JUSTIFY_CONTENT,
    color: elementStyle?.color || STYLE_CONSTANTS.DEFAULT_COLOR,
    backgroundColor: elementStyle?.backgroundColor || STYLE_CONSTANTS.DEFAULT_BACKGROUND_COLOR,
    borderColor: elementStyle?.borderColor && elementStyle.borderColor !== "none" ? elementStyle.borderColor : undefined,
    borderWidth: elementStyle?.borderWidth && (typeof elementStyle.borderWidth === 'number' ? elementStyle.borderWidth > 0 : true) ? `${elementStyle.borderWidth}px` : undefined,
    borderStyle: elementStyle?.borderStyle && elementStyle.borderStyle !== "none" ? elementStyle.borderStyle : undefined,
    borderRadius: elementStyle?.borderRadius ? `${elementStyle.borderRadius}px` : `${STYLE_CONSTANTS.DEFAULT_BORDER_RADIUS}px`,
    padding: elementStyle?.padding !== undefined ? `${elementStyle.padding}px` : `${STYLE_CONSTANTS.DEFAULT_PADDING}px`,
    margin: elementStyle?.margin !== undefined ? `${elementStyle.margin}px` : `${STYLE_CONSTANTS.DEFAULT_MARGIN}px`,
    width: elementStyle?.width || `${finalSize.width}px`,
    height: elementStyle?.height || `${finalSize.height}px`,
  };
};

/**
 * 🎯 FOR STYLEPANEL - Get ElementStyle-compatible defaults  
 * Replaces getDefaultStyle function in StylePanel
 */
export const getStylePanelDefaults = (
  currentStyle?: Partial<ElementStyle>,
  computedDefaults?: ElementStyle,
  type?: string
): ElementStyle => {
  const size = type ? getDefaultElementSize(type) : { width: 200, height: 60 };
  
  // 🎯 NEW: Special handling for date inputs to ensure consistent sizing
  let finalSize = size;
  if (type === "days" || type === "months" || type === "years") {
    finalSize = { width: 50, height: 30 }; // Fixed size for date inputs
  }
  
  // Priority: computedDefaults > BASE_DEFAULT_STYLE
  const baseDefaults = computedDefaults ? {
    ...BASE_DEFAULT_STYLE,
    ...computedDefaults,
  } : BASE_DEFAULT_STYLE;

  // 🎯 FIX: Handle width/height properly - preserve existing values and convert px strings to numbers
  const getWidthValue = (): number => {
    if (currentStyle?.width !== undefined) {
      if (typeof currentStyle.width === 'string') {
        const numericValue = parseInt(currentStyle.width.replace('px', ''));
        return isNaN(numericValue) ? finalSize.width : numericValue;
      }
      return currentStyle.width as number;
    }
    return finalSize.width;
  };

  const getHeightValue = (): number => {
    if (currentStyle?.height !== undefined) {
      if (typeof currentStyle.height === 'string') {
        const numericValue = parseInt(currentStyle.height.replace('px', ''));
        return isNaN(numericValue) ? finalSize.height : numericValue;
      }
      return currentStyle.height as number;
    }
    return finalSize.height;
  };

  const result = {
    fontFamily: currentStyle?.fontFamily !== undefined ? currentStyle.fontFamily : baseDefaults.fontFamily,
    fontSize: currentStyle?.fontSize !== undefined ? currentStyle.fontSize : baseDefaults.fontSize,
    fontWeight: currentStyle?.fontWeight || baseDefaults.fontWeight,
    fontStyle: currentStyle?.fontStyle || baseDefaults.fontStyle,
    textDecoration: currentStyle?.textDecoration || baseDefaults.textDecoration,
    textAlign: currentStyle?.textAlign || baseDefaults.textAlign,
    justifyContent: currentStyle?.justifyContent || baseDefaults.justifyContent,
    color: currentStyle?.color || baseDefaults.color,
    backgroundColor: currentStyle?.backgroundColor !== undefined ? currentStyle.backgroundColor : baseDefaults.backgroundColor,
    borderColor: currentStyle?.borderColor || baseDefaults.borderColor,
    borderWidth: currentStyle?.borderWidth !== undefined ? currentStyle.borderWidth : baseDefaults.borderWidth,
    borderStyle: currentStyle?.borderStyle || baseDefaults.borderStyle,
    borderRadius: currentStyle?.borderRadius !== undefined ? currentStyle.borderRadius : baseDefaults.borderRadius,
    padding: currentStyle?.padding !== undefined ? currentStyle.padding : baseDefaults.padding,
    margin: currentStyle?.margin !== undefined ? currentStyle.margin : baseDefaults.margin,
    width: getWidthValue(),
    height: getHeightValue(),
  };

  return result;
};

/**
 * Get complete default style for a specific element type
 * @param type - Element type (text, signature, etc.)
 * @param currentStyle - Current style object (may be incomplete)
 * @param computedDefaults - Optional computed defaults from FormCanvas
 * @returns Complete ElementStyle with all properties filled
 */
export const getCompleteDefaultStyle = (
  type: string,
  currentStyle?: Partial<ElementStyle>,
  computedDefaults?: Partial<ElementStyle>
): ElementStyle => {
  return getStylePanelDefaults(currentStyle, computedDefaults as ElementStyle, type);
};

/**
 * 🎯 TYPE-SPECIFIC STYLE ADJUSTMENTS - Centralized logic
 * Replaces type-specific styling scattered across FormCanvas
 */
export const getTypeSpecificStyles = (
  type: string, 
  baseStyles: React.CSSProperties,
  isResizing: boolean = false
): React.CSSProperties => {
  // 🎯 FIXED: Keep explicit width/height from baseStyles, don't override with fit-content
  const commonResizableStyles = {
    ...baseStyles,
    display: "flex",
    alignItems: "center",
    justifyContent: baseStyles.justifyContent || STYLE_CONSTANTS.DEFAULT_JUSTIFY_CONTENT,
    overflow: "hidden",
    transition: isResizing ? "none" : "all 0.2s ease",
    width: baseStyles.width,
    height: baseStyles.height,
  };

  switch (type) {
    case "text":
      return {
        ...commonResizableStyles,
        cursor: "pointer",
        alignItems: "flex-start",
        wordWrap: "break-word" as const,
        whiteSpace: "pre-wrap" as const,
        overflow: "hidden" as const,
      };
      
    case "signature":
    case "stamp":
      return {
        ...commonResizableStyles,
        alignItems: "center",
        justifyContent: "center",
        // Use padding from StylePanel, but fallback to 0px for signature if default
        padding: baseStyles.padding === `${STYLE_CONSTANTS.DEFAULT_PADDING}px` ? "0px" : baseStyles.padding,
      };
      
    case "date":
    case "select":
      return {
        ...commonResizableStyles,
        alignItems: "center",
      };
      
    case "days":
    case "months":
    case "years":
      return {
        ...commonResizableStyles,
        cursor: "pointer",
      };
      
    case "checkbox":
    case "radio":
      return {
        ...commonResizableStyles,
        alignItems: "flex-start",
        flexDirection: "column",
        overflow: "auto",
        // height: "auto",
        minHeight: baseStyles.height,
        maxHeight: "none",
        gap: "4px",
        padding: "4px",
      };
      
    default:
      return commonResizableStyles;
  }
};

/**
 * Convert ElementStyle to API format for MappingTextItem
 * @param elementStyle - Complete ElementStyle object
 * @param elementType - Type of element
 * @returns Object with API-compatible format
 */
export const convertStyleToApiFormat = (
  elementStyle: ElementStyle,
  elementType: string = "text"
) => {
  // 🎯 Helper function to ensure px-free string conversion
  const ensureNumberString = (value: string | number | undefined, fallback: string): string => {
    if (!value) return fallback;
    if (typeof value === 'number') return value.toString();
    // Remove px if present and return as string
    return value.toString().replace('px', '');
  };

  const result = {
    font_family: elementStyle.fontFamily || STYLE_CONSTANTS.DEFAULT_FONT_FAMILY,
    font_size: typeof elementStyle.fontSize === "number" 
      ? elementStyle.fontSize 
      : parseInt(String(elementStyle.fontSize || STYLE_CONSTANTS.DEFAULT_FONT_SIZE)),
    font_weight: elementStyle.fontWeight || STYLE_CONSTANTS.DEFAULT_FONT_WEIGHT,
    font_style: elementStyle.fontStyle || STYLE_CONSTANTS.DEFAULT_FONT_STYLE,
    text_align: elementStyle.textAlign || STYLE_CONSTANTS.DEFAULT_TEXT_ALIGN,
    text_decoration: elementStyle.textDecoration || STYLE_CONSTANTS.DEFAULT_TEXT_DECORATION,
    justify_content: elementStyle.justifyContent || STYLE_CONSTANTS.DEFAULT_JUSTIFY_CONTENT,
    underline: elementStyle.textDecoration?.includes("underline") || false,
    fill: elementStyle.color || STYLE_CONSTANTS.DEFAULT_COLOR,
    background_color: elementStyle.backgroundColor || STYLE_CONSTANTS.TRANSPARENT_BACKGROUND,
    border_color: elementStyle.borderColor || STYLE_CONSTANTS.DEFAULT_BORDER_COLOR,
    border_width: ensureNumberString(elementStyle.borderWidth, STYLE_CONSTANTS.DEFAULT_BORDER_WIDTH.toString()),
    border_style: elementStyle.borderStyle || STYLE_CONSTANTS.DEFAULT_BORDER_STYLE,
    border_radius: ensureNumberString(elementStyle.borderRadius, STYLE_CONSTANTS.DEFAULT_BORDER_RADIUS.toString()),
    padding: ensureNumberString(elementStyle.padding, STYLE_CONSTANTS.DEFAULT_PADDING.toString()),
    margin: ensureNumberString(elementStyle.margin, STYLE_CONSTANTS.DEFAULT_MARGIN.toString()),
    width: ensureNumberString(elementStyle.width, getDefaultElementSize(elementType).width.toString()),
    height: ensureNumberString(elementStyle.height, getDefaultElementSize(elementType).height.toString()),
  };

  return result;
};

/**
 * Convert API response data back to ElementStyle format with px units
 * @param apiData - Data from API response (without px units)
 * @param elementType - Type of element
 * @returns ElementStyle object with proper px units for DOM
 */
export const convertApiToElementStyle = (
  apiData: any,
  elementType: string = "text"
): ElementStyle => {
  // 🎯 Helper function to ensure px units for DOM styles
  const ensurePxValue = (value: string | number | undefined, fallback: number): string => {
    if (!value) return `${fallback}px`;
    const numValue = typeof value === 'string' ? parseInt(value) : value;
    return `${numValue}px`;
  };

  const defaultSize = getDefaultElementSize(elementType);
  
  const result = {
    fontFamily: apiData.font_family || STYLE_CONSTANTS.DEFAULT_FONT_FAMILY,
    fontSize: typeof apiData.font_size === "number" ? apiData.font_size  : parseInt(String(apiData.font_size || STYLE_CONSTANTS.DEFAULT_FONT_SIZE)),
    fontWeight: apiData.font_weight || STYLE_CONSTANTS.DEFAULT_FONT_WEIGHT,
    fontStyle: apiData.font_style || STYLE_CONSTANTS.DEFAULT_FONT_STYLE,
    textDecoration: apiData.text_decoration || STYLE_CONSTANTS.DEFAULT_TEXT_DECORATION,
    textAlign: apiData.text_align || STYLE_CONSTANTS.DEFAULT_TEXT_ALIGN,
    justifyContent: apiData.justify_content || STYLE_CONSTANTS.DEFAULT_JUSTIFY_CONTENT,
    color: apiData.fill || STYLE_CONSTANTS.DEFAULT_COLOR,
    backgroundColor: apiData.background_color || STYLE_CONSTANTS.TRANSPARENT_BACKGROUND,
    borderColor: apiData.border_color || STYLE_CONSTANTS.DEFAULT_BORDER_COLOR,
    borderWidth: parseInt(apiData.border_width || STYLE_CONSTANTS.DEFAULT_BORDER_WIDTH.toString()),
    borderStyle: apiData.border_style || STYLE_CONSTANTS.DEFAULT_BORDER_STYLE,
    borderRadius: parseInt(apiData.border_radius || STYLE_CONSTANTS.DEFAULT_BORDER_RADIUS.toString()),
    padding: parseInt(apiData.padding || STYLE_CONSTANTS.DEFAULT_PADDING.toString()),
    margin: parseInt(apiData.margin || STYLE_CONSTANTS.DEFAULT_MARGIN.toString()),
    width: ensurePxValue(apiData.width, defaultSize.width),
    height: ensurePxValue(apiData.height, defaultSize.height),
  };

  return result;
};

/**
 * Convert ElementStyle to TextToImageParams format
 * @param elementStyle - Complete ElementStyle object
 * @param elementType - Type of element
 * @param additionalParams - Additional parameters for image generation
 * @returns Object compatible with convertTextToImage function
 */
export const convertStyleToImageParams = (
  elementStyle: ElementStyle,
  elementType: string = "text",
  additionalParams: {
    text?: string;
    value?: string;
    maxLength?: number;
    required?: boolean;
  } = {}
) => {
  const defaultSize = getDefaultElementSize(elementType);
  
  return {
    width: elementStyle.width || defaultSize.width,
    height: elementStyle.height || defaultSize.height,
    font_family: elementStyle.fontFamily || STYLE_CONSTANTS.DEFAULT_FONT_FAMILY,
    font_size: elementStyle.fontSize || STYLE_CONSTANTS.DEFAULT_FONT_SIZE,
    font_weight: elementStyle.fontWeight || STYLE_CONSTANTS.DEFAULT_FONT_WEIGHT,
    font_style: elementStyle.fontStyle || STYLE_CONSTANTS.DEFAULT_FONT_STYLE,
    text_align: elementStyle.textAlign || STYLE_CONSTANTS.DEFAULT_TEXT_ALIGN,
    underline: elementStyle.textDecoration?.includes("underline") || false,
    fill: elementStyle.color || STYLE_CONSTANTS.DEFAULT_COLOR,
    background_color: elementStyle.backgroundColor || STYLE_CONSTANTS.TRANSPARENT_BACKGROUND,
    padding: elementStyle.padding || STYLE_CONSTANTS.DEFAULT_PADDING,
    border_radius: elementStyle.borderRadius || STYLE_CONSTANTS.DEFAULT_BORDER_RADIUS,
    max_characters: additionalParams.maxLength?.toString() || "100",
    max_lines: "1",
    text: additionalParams.text || `ข้อความ`,
    required: additionalParams.required?.toString() || "false",
    value: additionalParams.value || ""
  };
};

/**
 * 🎯 HELPER FUNCTIONS for consistent usage across components
 */

// For FormCanvas computed styles emission  
export const createComputedDefaults = (elementBaseStyles: React.CSSProperties): ElementStyle => {
  return {
    fontFamily: (elementBaseStyles.fontFamily as string) || STYLE_CONSTANTS.DEFAULT_FONT_FAMILY,
    fontSize: parseInt((elementBaseStyles.fontSize as string)?.replace('px', '') || STYLE_CONSTANTS.DEFAULT_FONT_SIZE.toString()),
    fontWeight: (elementBaseStyles.fontWeight as string) || STYLE_CONSTANTS.DEFAULT_FONT_WEIGHT,
    fontStyle: (elementBaseStyles.fontStyle as string) || STYLE_CONSTANTS.DEFAULT_FONT_STYLE,
    textDecoration: (elementBaseStyles.textDecoration as string) || STYLE_CONSTANTS.DEFAULT_TEXT_DECORATION,
    textAlign: (elementBaseStyles.textAlign as string) || STYLE_CONSTANTS.DEFAULT_TEXT_ALIGN,
    justifyContent: (elementBaseStyles.justifyContent as string) || STYLE_CONSTANTS.DEFAULT_JUSTIFY_CONTENT,
    color: (elementBaseStyles.color as string) || STYLE_CONSTANTS.DEFAULT_COLOR,
    backgroundColor: (elementBaseStyles.backgroundColor as string) || STYLE_CONSTANTS.DEFAULT_BACKGROUND_COLOR,
    borderColor: (elementBaseStyles.borderColor as string) || STYLE_CONSTANTS.DEFAULT_BORDER_COLOR,
    borderWidth: parseInt((elementBaseStyles.borderWidth as string)?.replace('px', '') || STYLE_CONSTANTS.DEFAULT_BORDER_WIDTH.toString()),
    borderStyle: (elementBaseStyles.borderStyle as string) || STYLE_CONSTANTS.DEFAULT_BORDER_STYLE,
    borderRadius: parseInt((elementBaseStyles.borderRadius as string)?.replace('px', '') || STYLE_CONSTANTS.DEFAULT_BORDER_RADIUS.toString()),
    padding: parseInt((elementBaseStyles.padding as string)?.replace('px', '') || STYLE_CONSTANTS.DEFAULT_PADDING.toString()),
    margin: parseInt((elementBaseStyles.margin as string)?.replace('px', '') || STYLE_CONSTANTS.DEFAULT_MARGIN.toString()),
  };
};

/**
 * Debug function to log style completeness
 * @param elementStyle - Style object to check
 * @param elementId - Element ID for logging
 */
export const debugStyleCompleteness = (
  elementStyle: Partial<ElementStyle> | undefined,
  elementId: string
) => {
  if (!elementStyle) {
    enqueueSnackbar(`🚨 Element ${elementId}: No style object provided`, {
      variant: "warning", 
      autoHideDuration: 3000,
    });
    return false;
  }

  const requiredProperties = [
    'fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
    'textAlign', 'color', 'backgroundColor', 'width', 'height'
  ];

  const missingProperties = requiredProperties.filter(
    prop => elementStyle[prop as keyof ElementStyle] === undefined
  );

  if (missingProperties.length > 0) {
    console.warn(`🚨 Element ${elementId}: Missing style properties:`, missingProperties);
    console.warn(`🔧 Current style:`, elementStyle);
    return false;
  }

  return true;
};

/**
 * Get default configuration for a specific element type
 * @param type - Element type (text, signature, etc.)
 * @returns Default ElementConfig for the type
 */
export const getDefaultElementConfig = (type: string): ElementConfig => {
  switch (type) {
    case "text":
      return {
        required: CONFIG_CONSTANTS.DEFAULT_REQUIRED,
        maxLength: CONFIG_CONSTANTS.TEXT_MAX_LENGTH,
        minLines: CONFIG_CONSTANTS.TEXT_MIN_LINES,
        placeholder: CONFIG_CONSTANTS.TEXT_PLACEHOLDER,
      };
      
    case "signature":
    case "stamp":
      return {
        required: CONFIG_CONSTANTS.SIGNATURE_REQUIRED,
        placeholder: "",
      };
      
    case "date":
      return {
        required: CONFIG_CONSTANTS.DEFAULT_REQUIRED,
        placeholder: CONFIG_CONSTANTS.DATE_PLACEHOLDER,
        dateConfig: getDefaultDateConfig(),
        dateInputs: {
          days: {
            placeholder: CONFIG_CONSTANTS.DATE_DAYS_PLACEHOLDER,
            maxLength: CONFIG_CONSTANTS.DAYS_MAX_LENGTH,
            required: CONFIG_CONSTANTS.DATE_REQUIRED,
          },
          months: {
            placeholder: CONFIG_CONSTANTS.DATE_MONTHS_PLACEHOLDER,
            maxLength: CONFIG_CONSTANTS.MONTHS_MAX_LENGTH,
            required: CONFIG_CONSTANTS.DATE_REQUIRED,
          },
          years: {
            placeholder: CONFIG_CONSTANTS.DATE_YEARS_PLACEHOLDER,
            maxLength: CONFIG_CONSTANTS.YEARS_MAX_LENGTH,
            required: CONFIG_CONSTANTS.DATE_REQUIRED,
          },
        },
      };
      
    case "days":
      return {
        required: CONFIG_CONSTANTS.DATE_REQUIRED,
        placeholder: CONFIG_CONSTANTS.DATE_DAYS_PLACEHOLDER,
        maxLength: CONFIG_CONSTANTS.DAYS_MAX_LENGTH,
        label: CONFIG_CONSTANTS.DAYS_LABEL,
        dateConfig: {
          ...getDefaultDateConfig(),
          days: CONFIG_CONSTANTS.DATE_DAYS_PLACEHOLDER,
        },
      };
      
    case "months":
      return {
        required: CONFIG_CONSTANTS.DATE_REQUIRED,
        placeholder: CONFIG_CONSTANTS.DATE_MONTHS_PLACEHOLDER,
        maxLength: CONFIG_CONSTANTS.MONTHS_MAX_LENGTH,
        label: CONFIG_CONSTANTS.MONTHS_LABEL,
        dateConfig: {
          ...getDefaultDateConfig(),
          months: CONFIG_CONSTANTS.DATE_MONTHS_PLACEHOLDER,
        },
      };
      
    case "years":
      return {
        required: CONFIG_CONSTANTS.DATE_REQUIRED,
        placeholder: CONFIG_CONSTANTS.DATE_YEARS_PLACEHOLDER,
        maxLength: CONFIG_CONSTANTS.YEARS_MAX_LENGTH,
        label: CONFIG_CONSTANTS.YEARS_LABEL,
        dateConfig: {
          ...getDefaultDateConfig(),
          years: CONFIG_CONSTANTS.DATE_YEARS_PLACEHOLDER,
        },
      };
      
    case "select":
      return {
        required: CONFIG_CONSTANTS.DEFAULT_REQUIRED,
        placeholder: CONFIG_CONSTANTS.SELECT_PLACEHOLDER,
        selectOptions: ["ตัวเลือกที่ 1"], // เพิ่มสำหรับ select
      };
      
    case "checkbox":
      return {
        required: CONFIG_CONSTANTS.DEFAULT_REQUIRED,
        checkboxOptions: ["ตัวเลือกที่ 1"],
      };
      
    case "radio":
      return {
        required: CONFIG_CONSTANTS.DEFAULT_REQUIRED,
        radioOptions: ["ตัวเลือกที่ 1"], // เพิ่มสำหรับ radio
      };
      
    case "more-file":
      return {
        required: CONFIG_CONSTANTS.DEFAULT_REQUIRED,
        maxFileSize: CONFIG_CONSTANTS.MORE_FILE_MAX_SIZE,
        typeName: CONFIG_CONSTANTS.MORE_FILE_DEFAULT_TYPE_NAME,
        isEmbedded: CONFIG_CONSTANTS.MORE_FILE_DEFAULT_IS_EMBEDDED,
        fileAccept: CONFIG_CONSTANTS.MORE_FILE_FILE_ACCEPT,
      };
      
    default:
      return {
        required: CONFIG_CONSTANTS.DEFAULT_REQUIRED,
        maxLength: CONFIG_CONSTANTS.DEFAULT_MAX_LENGTH,
        minLines: CONFIG_CONSTANTS.DEFAULT_MIN_LINES,
        placeholder: CONFIG_CONSTANTS.DEFAULT_PLACEHOLDER,
      };
  }
};

/**
 * Get default configuration for date elements with dateTimeType = "date"
 * @returns Default DateConfig for date elements
 */
export const getDefaultDateConfig = (): DateConfig => {
  return {
    header: CONFIG_CONSTANTS.DATE_HEADER,
    days: CONFIG_CONSTANTS.DATE_DAYS_PLACEHOLDER,
    months: CONFIG_CONSTANTS.DATE_MONTHS_PLACEHOLDER,
    years: CONFIG_CONSTANTS.DATE_YEARS_PLACEHOLDER,
    format: CONFIG_CONSTANTS.DATE_FORMAT as "EU" | "US",
    currentDate: CONFIG_CONSTANTS.DATE_CURRENT_DATE,
    required: CONFIG_CONSTANTS.DATE_REQUIRED,
  };
};

/**
 * Generate date input IDs for dateTimeType = "date" elements
 * Similar to checkbox and radio elements structure
 * @param baseId - Base element ID (e.g., "date-1-1755676131047-1-date")
 * @returns Object with days, months, and years input IDs
 */
export const generateDateInputIds = (baseId: string) => {
  return {
    days: `${baseId}-days`,
    months: `${baseId}-months`,
    years: `${baseId}-years`,
  };
};

/**
 * Get date input type from input ID
 * @param inputId - Input ID (e.g., "date-1-1755676131047-1-date-days")
 * @returns "days", "months", "years", or null if not a date input
 */
export const getDateInputType = (inputId: string): "days" | "months" | "years" | null => {
  if (inputId.endsWith("-days")) return "days";
  if (inputId.endsWith("-months")) return "months";
  if (inputId.endsWith("-years")) return "years";
  return null;
};

/**
 * Get base date element ID from input ID
 * @param inputId - Input ID (e.g., "date-1-1755676131047-1-date-days")
 * @returns Base element ID without input type suffix
 */
export const getBaseDateElementId = (inputId: string): string | null => {
  const inputType = getDateInputType(inputId);
  if (!inputType) return null;
  
  // Remove the input type suffix
  return inputId.replace(`-${inputType}`, "");
};

/**
 * Calculate position offset for date inputs based on input type
 * Similar to checkbox and radio elements positioning
 * @param basePosition - Base position of the date element
 * @param inputType - Type of date input ("days", "months", "years")
 * @param inputWidth - Width of individual input
 * @param gap - Gap between inputs
 * @returns Position with offset for the specific input
 */
export const calculateDateInputPosition = (
  basePosition: { x: number; y: number },
  inputType: "days" | "months" | "years",
  inputWidth: number = CONFIG_CONSTANTS.DATE_INPUT_WIDTH,
  gap: number = CONFIG_CONSTANTS.DATE_INPUT_GAP
): { x: number; y: number } => {
  const offsets = {
    days: 0,
    months: inputWidth + gap,
    years: (inputWidth + gap) * 2,
  };

  return {
    x: basePosition.x + offsets[inputType],
    y: basePosition.y,
  };
};

/**
 * Get default spacing configuration for date inputs
 * @returns Object with width, height, and gap values
 */
export const getDateInputSpacing = () => {
  return {
    inputWidth: CONFIG_CONSTANTS.DATE_INPUT_WIDTH,
    inputHeight: CONFIG_CONSTANTS.DATE_INPUT_HEIGHT,
    gap: CONFIG_CONSTANTS.DATE_INPUT_GAP,
    separatorWidth: 20, // Width for "/" separator
    totalWidth: CONFIG_CONSTANTS.DATE_INPUT_WIDTH * 3 + CONFIG_CONSTANTS.DATE_INPUT_GAP * 2, // 50*3 + 10*2 = 170
  };
};

/**
 * Validate date input values
 * @param days - Days value (1-31)
 * @param months - Months value (1-12)
 * @param years - Years value (1900-2100)
 * @param format - Date format ("EU" or "US")
 * @returns Object with validation results
 */
export const validateDateInputs = (
  days: string,
  months: string,
  years: string,
  format: "EU" | "US" = "EU"
) => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate days
  const daysNum = parseInt(days);
  if (!days || daysNum < 1 || daysNum > 31) {
    errors.push("วันต้องเป็นตัวเลขระหว่าง 1-31");
  }

  // Validate months
  const monthsNum = parseInt(months);
  if (!months || monthsNum < 1 || monthsNum > 12) {
    errors.push("เดือนต้องเป็นตัวเลขระหว่าง 1-12");
  }

  // Validate years
  const yearsNum = parseInt(years);
  if (!years || yearsNum < 1900 || yearsNum > 2100) {
    errors.push("ปีต้องเป็นตัวเลขระหว่าง 1900-2100");
  }

  // Validate date combination
  if (days && months && years) {
    const date = new Date(yearsNum, monthsNum - 1, daysNum);
    if (date.getDate() !== daysNum || date.getMonth() !== monthsNum - 1 || date.getFullYear() !== yearsNum) {
      errors.push("วันที่ไม่ถูกต้อง");
    }
  }

  // Check if current date
  const now = new Date();
  const isCurrentDate = daysNum === now.getDate() && monthsNum === now.getMonth() + 1 && yearsNum === now.getFullYear();
  if (isCurrentDate) {
    warnings.push("วันที่ปัจจุบัน");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    formattedDate: format === "EU" ? `${days}/${months}/${years}` : `${months}/${days}/${years}`,
  };
};

/**
 * Get days in month using dayjs
 * @param month - Month value (1-12)
 * @param year - Year value (4 digits)
 * @returns Array of day options for the given month and year
 */
export const getDaysInMonth = (month: number, year: number): string[] => {
  const daysCount = dayjs(`${year}-${month.toString().padStart(2, '0')}-01`).daysInMonth();
  const days: string[] = [];
  
  for (let i = 1; i <= daysCount; i++) {
    days.push(i.toString().padStart(2, '0'));
  }
  
  return days;
};

/**
 * Get years array for select options
 * @param startYear - Start year (default: 1900)
 * @param endYear - End year (default: current year + 50)
 * @returns Array of year options
 */
export const getYearsArray = (startYear: number = 1900, endYear?: number): string[] => {
  const currentYear = dayjs().year();
  const finalEndYear = endYear || currentYear + 50;
  const years: string[] = [];
  
  for (let i = startYear; i <= finalEndYear; i++) {
    years.push(i.toString());
  }
  
  return years.reverse(); // Recent years first
};

/**
 * Format date according to specified format
 * @param day - Day value
 * @param month - Month value
 * @param year - Year value
 * @param format - Date format ("EU" or "US")
 * @returns Formatted date string
 */
export const formatDateString = (
  day: string,
  month: string,
  year: string,
  format: "EU" | "US" = "EU"
): string => {
  if (!day || !month || !year) return "";
  
  if (format === "US") {
    return `${month}/${day}/${year}`;
  } else {
    return `${day}/${month}/${year}`;
  }
};

/**
 * Parse date string according to format
 * @param dateString - Date string to parse
 * @param format - Date format ("EU" or "US")
 * @returns Object with day, month, year values
 */
export const parseDateString = (
  dateString: string,
  format: "EU" | "US" = "EU"
): { day: string; month: string; year: string } => {
  if (!dateString) return { day: "", month: "", year: "" };
  
  const parts = dateString.split("/");
  if (parts.length !== 3) return { day: "", month: "", year: "" };
  
  if (format === "US") {
    return {
      month: parts[0].padStart(2, '0'),
      day: parts[1].padStart(2, '0'),
      year: parts[2],
    };
  } else {
    return {
      day: parts[0].padStart(2, '0'),
      month: parts[1].padStart(2, '0'),
      year: parts[2],
    };
  }
};

/**
 * Get complete configuration by merging current config with defaults
 * @param type - Element type
 * @param currentConfig - Current config object (may be incomplete)
 * @returns Complete ElementConfig with all properties filled
 */
export const getCompleteElementConfig = (
  type: string,
  currentConfig?: Partial<ElementConfig>
): ElementConfig => {
  const defaultConfig = getDefaultElementConfig(type);
  
  return {
    required: currentConfig?.required !== undefined ? currentConfig.required : defaultConfig.required,
    maxLength: currentConfig?.maxLength !== undefined ? currentConfig.maxLength : defaultConfig.maxLength,
    minLines: currentConfig?.minLines !== undefined ? currentConfig.minLines : defaultConfig.minLines,
    placeholder: currentConfig?.placeholder !== undefined ? currentConfig.placeholder : defaultConfig.placeholder,
    label: currentConfig?.label || "",
    checkboxOptions: currentConfig?.checkboxOptions || defaultConfig.checkboxOptions,
    radioOptions: currentConfig?.radioOptions || defaultConfig.radioOptions, // เพิ่มสำหรับ radio
    selectOptions: currentConfig?.selectOptions || defaultConfig.selectOptions, // เพิ่มสำหรับ select
    maxFileSize: currentConfig?.maxFileSize !== undefined ? currentConfig.maxFileSize : defaultConfig.maxFileSize,
    typeName: currentConfig?.typeName !== undefined ? currentConfig.typeName : defaultConfig.typeName,
    isEmbedded: currentConfig?.isEmbedded !== undefined ? currentConfig.isEmbedded : defaultConfig.isEmbedded,
    fileAccept: currentConfig?.fileAccept || defaultConfig.fileAccept,
    dateConfig: currentConfig?.dateConfig || defaultConfig.dateConfig,
    dateInputs: currentConfig?.dateInputs || defaultConfig.dateInputs,
  };
};

/**
 * 🎯 THAI NUMBER UTILITIES - Functions for Thai number formatting using HTML entity notation
 */

/**
 * Convert Arabic numbers to Thai numbers using HTML entity notation
 * @param number - Arabic number (string or number)
 * @returns Thai number string with HTML entities
 */
export const convertToThaiNumber = (number: string | number): string => {
  const numStr = number.toString();
  return numStr.replace(/[0-9]/g, (digit) => {
    const index = parseInt(digit);
    const thaiDigit = CONFIG_CONSTANTS.THAI_NUMBERS[index];
    if (thaiDigit) {
      // Convert to HTML entity notation
      const codePoint = thaiDigit.codePointAt(0);
      if (codePoint) {
        return `&#x${codePoint.toString(16).toUpperCase()};`;
      }
    }
    return digit;
  });
};

/**
 * Convert Thai numbers from HTML entity notation to Arabic numbers
 * @param thaiNumber - Thai number string with HTML entities
 * @returns Arabic number string
 */
export const convertFromThaiNumber = (thaiNumber: string): string => {
  // First decode HTML entities to get actual Thai characters
  const decodedThai = decodeHtmlEntities(thaiNumber);
  
  // Then convert Thai characters to Arabic numbers
  return decodedThai.replace(/[๐-๙]/g, (thaiDigit) => {
    const codePoint = thaiDigit.codePointAt(0);
    if (codePoint && codePoint >= 0x0E50 && codePoint <= 0x0E59) {
      return (codePoint - 0x0E50).toString();
    }
    return thaiDigit;
  });
};

/**
 * Decode HTML entities to actual characters
 * @param htmlString - String with HTML entities
 * @returns Decoded string with actual characters
 */
export const decodeHtmlEntities = (htmlString: string): string => {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return htmlString.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
  }
  
  const elem = document.createElement('div');
  elem.innerHTML = htmlString;
  return elem.textContent || elem.innerText || '';
};

/**
 * Encode string to HTML entities
 * @param str - String to encode
 * @returns HTML entity encoded string
 */
export const encodeToHtmlEntities = (str: string): string => {
  return str.replace(/[\u00A0-\u9999<>\&]/g, (char) => {
    const codePoint = char.codePointAt(0);
    if (codePoint) {
      return `&#x${codePoint.toString(16).toUpperCase()};`;
    }
    return char;
  });
}; 