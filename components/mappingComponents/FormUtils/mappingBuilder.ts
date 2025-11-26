/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Mapping Builder - SINGLE SOURCE OF TRUTH
 * 
 * This file contains centralized mapping functions that can be used by both
 * MappingBackend.ts and apiUtils.ts to eliminate code duplication
 */
"use client";

import { FormItem } from "../../../store/types";
import { PageFormItems } from "./pdfFormManager";
import {
  MappingTextItem,
  MappingSignatureItem,
  MappingCheckboxItem,
  MappingRadioboxItem,
  MappingDateTimeItem,
  NewMappingMoreFileItem,
} from "@/store/types/mappingTypes";
import {
  buildBasePayload,
  processCoordinates,
  processPosition,
  processElementStyle,
  processElementSize,
  filterItemsByType,
  groupDateItems,
  groupCheckboxItems,
  groupRadioItems,
  extractStampType,
  extractStampSection,
  expandAllStepItems,
} from "./payloadUtils";
import {
  CONFIG_CONSTANTS,
  STYLE_CONSTANTS,
} from "./defaultStyle";

// 🎯 CENTRALIZED TEXT MAPPING
export const createTextMapping = (
  pageFormItems: PageFormItems,
  expandMode: boolean = false,
  availableStepIndices: string[] = []
): MappingTextItem[] => {
  const mappingText: MappingTextItem[] = [];
  let index = 0;

  Object.entries(pageFormItems).forEach(([pageNumber, formItems]) => {
    let textItems = filterItemsByType(formItems, "text").concat(
      filterItemsByType(formItems, "textarea")
    );

    // Expand "all" step items if needed
    if (expandMode && availableStepIndices.length > 0) {
      textItems = expandAllStepItems(textItems, availableStepIndices);
    }

    textItems.forEach((item: FormItem) => {
      const basePayload = buildBasePayload(item, item.type, index);
      const { completeConfig } = processElementStyle(item, item.type);
      const coordinates = processCoordinates(item);
      const position = processPosition(item);

      const mappingItem = {
        ...basePayload,
        index_step: parseInt((item as any).step_index || 0),
        step_index: parseInt((item as any).step_index || 0),
        ...coordinates,
        left: position.left,
        top: position.top,
        scale_X: (item.style as any)?.scaleX || position.scale_X,
        scale_Y: (item.style as any)?.scaleY || position.scale_Y,
        angle: (item.style as any)?.angle || "0",
        text: item.label,
        max_characters: completeConfig.maxLength?.toString() || CONFIG_CONSTANTS.TEXT_MAX_LENGTH.toString(),
        max_lines: completeConfig.minLines?.toString() || CONFIG_CONSTANTS.TEXT_MIN_LINES.toString(),
        value: typeof item.value === "string" ? item.value : "",
        pageNumber: parseInt(pageNumber) || 1,
        font_size: typeof basePayload.font_size === "string"  ? parseInt(basePayload.font_size)  : basePayload.font_size,
        underline: typeof basePayload.underline === "string"  ? basePayload.underline === "true" : basePayload.underline,
      };

      mappingText.push(mappingItem as MappingTextItem);
      index++;
    });
  });

  return mappingText;
};

// 🎯 CENTRALIZED CHECKBOX MAPPING - GROUPED STRUCTURE
export const createCheckboxMapping = (
  pageFormItems: PageFormItems,
  expandMode: boolean = false,
  availableStepIndices: string[] = []
): any[] => {
  const mappingCheckbox: any[] = [];

  // Filter and collect all checkbox items
  const allCheckboxItems: FormItem[] = [];
  Object.entries(pageFormItems).forEach(([pageNumber, formItems]) => {
    const checkboxItems = filterItemsByType(formItems, "checkbox");
    
    checkboxItems.forEach(item => {
      allCheckboxItems.push({
        ...item,
        pageNumber: parseInt(pageNumber)
      });
    });
  });

    // Expand "all" step items if needed
  let processedCheckboxItems = allCheckboxItems;
    if (expandMode && availableStepIndices.length > 0) {
    processedCheckboxItems = expandAllStepItems(allCheckboxItems, availableStepIndices);
  }

  // Group checkbox items by timestamp
  const checkboxGroups = groupCheckboxItems(processedCheckboxItems);

  // Process each checkbox group
  Array.from(checkboxGroups.entries()).forEach(([groupKey, checkboxGroup], groupIndex) => {
    // Sort by option index
    const sortedGroup = checkboxGroup.sort((a, b) => {
      const aIndex = parseInt(a.optionIndex || 0);
      const bIndex = parseInt(b.optionIndex || 0);
      return aIndex - bIndex;
    });

    // Get the first item as base for common properties
    const baseItem = sortedGroup[0];
    
    // Extract timestamp and step index from group key
    const [timestamp, stepPart] = groupKey.split('-step-');
    const stepIndex = parseInt(stepPart || '0');
    
    // Create option elements array
    const optionElements = sortedGroup.map((item, index) => {
      const { completeConfig } = processElementStyle(item, item.type);
      const coordinates = processCoordinates(item);
      const position = processPosition(item);
      const basePayload = buildBasePayload(item, item.type, index);
      
      // Get option name from checkboxOptions - use actual value, no fallback
      const checkboxOptions = (item as any).checkboxOptions || [];
      const optionName = checkboxOptions[0] || "";
      
      return {
        index: index,
        checkbox_id: item.id,
        checkbox_name: optionName,
        ...coordinates,
        left: position.left,
        top: position.top,
        scale_X: position.scale_X,
        scale_Y: position.scale_Y,
        text: optionName, // Use actual option name, no fallback
        value: Array.isArray(item.value) ? item.value.length > 0 : false,
        required: (item as any).config?.required || false,
        font_family: basePayload.font_family,
        font_size: basePayload.font_size,
        font_weight: basePayload.font_weight,
        font_style: basePayload.font_style,
        text_align: basePayload.text_align,
        text_decoration: basePayload.text_decoration,
        justify_content: basePayload.justify_content,
        underline: basePayload.underline,
        fill: basePayload.fill || STYLE_CONSTANTS.DEFAULT_COLOR,
        background_color: basePayload.background_color || STYLE_CONSTANTS.TRANSPARENT_BACKGROUND,
        border_color: basePayload.border_color,
        border_width: basePayload.border_width,
        border_style: basePayload.border_style,
        border_radius: basePayload.border_radius,
        padding: basePayload.padding,
        margin: basePayload.margin,
        width: basePayload.width,
        height: basePayload.height,
      };
    });

    // Create group object with header (label) and pageNumber at group level
      const checkboxGroupItem = {
      index: groupIndex,
      step_index: stepIndex,
      header: baseItem.label || "", // Like date elements
      required: (baseItem as any).config?.required || false,
      pageNumber: (baseItem as any).pageNumber,
      group_timestamp: `checkbox-group-${timestamp}-${stepIndex}`,
      option_elements: optionElements
      };

      mappingCheckbox.push(checkboxGroupItem);
  });

  return mappingCheckbox;
};

// 🎯 CENTRALIZED RADIO MAPPING - GROUPED STRUCTURE
export const createRadioMapping = (
  pageFormItems: PageFormItems,
  expandMode: boolean = false,
  availableStepIndices: string[] = []
): any[] => {
  const mappingRadio: any[] = [];

  // Filter and collect all radio items
  const allRadioItems: FormItem[] = [];
  Object.entries(pageFormItems).forEach(([pageNumber, formItems]) => {
    const radioItems = filterItemsByType(formItems, "radio");
    
    radioItems.forEach(item => {
      allRadioItems.push({
        ...item,
        pageNumber: parseInt(pageNumber)
      });
    });
  });

    // Expand "all" step items if needed
  let processedRadioItems = allRadioItems;
    if (expandMode && availableStepIndices.length > 0) {
    processedRadioItems = expandAllStepItems(allRadioItems, availableStepIndices);
  }

  // Group radio items by timestamp
  const radioGroups = groupRadioItems(processedRadioItems);

  // Process each radio group
  Array.from(radioGroups.entries()).forEach(([groupKey, radioGroup], groupIndex) => {
    // Sort by option index
    const sortedGroup = radioGroup.sort((a, b) => {
      const aIndex = parseInt(a.optionIndex || 0);
      const bIndex = parseInt(b.optionIndex || 0);
      return aIndex - bIndex;
    });

    // Get the first item as base for common properties
    const baseItem = sortedGroup[0];
    
    // Extract timestamp and step index from group key
    const [timestamp, stepPart] = groupKey.split('-step-');
    const stepIndex = parseInt(stepPart || '0');
    
    // Create option elements array
    const optionElements = sortedGroup.map((item, index) => {
      const { completeConfig } = processElementStyle(item, item.type);
      const coordinates = processCoordinates(item);
      const position = processPosition(item);
      const basePayload = buildBasePayload(item, item.type, index);
      
      // Get option name from radioOptions - use actual value, no fallback
      const radioOptions = (item as any).radioOptions || [];
      const optionName = radioOptions[0] || "";
      
      // Check if this option is selected
      const isSelected = typeof item.value === "string" && 
        radioOptions.includes(item.value as string);
      
      return {
        index: index,
        radio_id: item.id,
        radio_name: optionName,
        ...coordinates,
        left: position.left,
        top: position.top,
        scale_X: position.scale_X,
        scale_Y: position.scale_Y,
        text: optionName, // Use actual option name, no fallback
        value: isSelected,
        required: (item as any).config?.required || false,
        font_family: basePayload.font_family,
        font_size: basePayload.font_size,
        font_weight: basePayload.font_weight,
        font_style: basePayload.font_style,
        text_align: basePayload.text_align,
        text_decoration: basePayload.text_decoration,
        justify_content: basePayload.justify_content,
        underline: basePayload.underline,
        fill: basePayload.fill || STYLE_CONSTANTS.DEFAULT_COLOR,
        background_color: basePayload.background_color || STYLE_CONSTANTS.TRANSPARENT_BACKGROUND,
        border_color: basePayload.border_color,
        border_width: basePayload.border_width,
        border_style: basePayload.border_style,
        border_radius: basePayload.border_radius,
        padding: basePayload.padding,
        margin: basePayload.margin,
        width: basePayload.width,
        height: basePayload.height,
      };
    });

    // Create group object with header (label) and pageNumber at group level
      const radioGroupItem = {
      index: groupIndex,
      step_index: stepIndex,
      header: baseItem.label || "", // Like date elements
      required: (baseItem as any).config?.required || false,
      pageNumber: (baseItem as any).pageNumber,
      group_timestamp: `radio-group-${timestamp}-${stepIndex}`,
      option_elements: optionElements
      };

      mappingRadio.push(radioGroupItem);
  });

  return mappingRadio;
};

// 🎯 CENTRALIZED SIGNATURE MAPPING
export const createSignatureMapping = (
  pageFormItems: PageFormItems,
  expandMode: boolean = false,
  availableStepIndices: string[] = []
): MappingSignatureItem[] => {
  const mappingSignature: MappingSignatureItem[] = [];
  let index = 0;

  Object.entries(pageFormItems).forEach(([pageNumber, formItems]) => {
    let signatureItems = filterItemsByType(formItems, "signature");

    // Expand "all" step items if needed
    if (expandMode && availableStepIndices.length > 0) {
      signatureItems = expandAllStepItems(signatureItems, availableStepIndices);
    }

    signatureItems.forEach((item: FormItem) => {
      const basePayload = buildBasePayload(item, item.type, index);
      const { completeConfig } = processElementStyle(item, item.type);
      const coordinates = processCoordinates(item);
      const position = processPosition(item);

      const signatureItem = {
        ...basePayload,
        step_index: parseInt((item as any).step_index || 0),
        ...coordinates,
        left: position.left,
        top: position.top,
        scale_X: position.scale_X,
        scale_Y: position.scale_Y,
        text: item.label || `Signature ${index + 1}`,
        required: completeConfig.required?.toString() || CONFIG_CONSTANTS.SIGNATURE_REQUIRED.toString(),
        signatureType: item.style?.fontWeight || "normal",
        value: typeof item.value === "string" ? item.value : "",
        actorId: (item as any).actorId || "",
        pageNumber: parseInt(pageNumber) || 1,
        font_size: typeof basePayload.font_size === "string"  ? parseInt(basePayload.font_size)  : basePayload.font_size,
        underline: typeof basePayload.underline === "string"  ? basePayload.underline === "true" : basePayload.underline,
      };

      mappingSignature.push(signatureItem as MappingSignatureItem);
      index++;
    });
  });

  return mappingSignature;
};

// 🎯 CENTRALIZED DATE MAPPING
export const createDateMapping = (
  pageFormItems: PageFormItems,
  expandMode: boolean = false,
  availableStepIndices: string[] = []
): any[] => {
  const mappingDate: any[] = [];

  // Filter and collect all date items
  const allDateItems: FormItem[] = [];
  Object.entries(pageFormItems).forEach(([pageNumber, formItems]) => {
    const dateItems = filterItemsByType(formItems, "days")
      .concat(filterItemsByType(formItems, "months"))
      .concat(filterItemsByType(formItems, "years"));
    
    dateItems.forEach(item => {
      allDateItems.push({
        ...item,
        pageNumber: parseInt(pageNumber)
      } as FormItem);
    });
  });

  // Expand "all" step items if needed
  let processedDateItems = allDateItems;
  if (expandMode && availableStepIndices.length > 0) {
    processedDateItems = expandAllStepItems(allDateItems, availableStepIndices);
  }

  // Group date items by timestamp
  const dateGroups = groupDateItems(processedDateItems);

  // Process each date group
  Array.from(dateGroups.entries()).forEach(([groupKey, dateGroup], groupIndex) => {
    // Sort by type order: days, months, years
    const sortedGroup = dateGroup.sort((a, b) => {
      const order = { "days": 0, "months": 1, "years": 2 };
      return order[a.type as keyof typeof order] - order[b.type as keyof typeof order];
    });

    // Get the first item as base for common properties
    const baseItem = sortedGroup[0];
    
    // Skip if no items in group
    if (!baseItem) {
      console.warn(`Skipping empty date group at index ${groupIndex}`);
      return;
    }
    
    // Extract individual date values
    const daysItem = sortedGroup.find(item => item.type === "days");
    const monthsItem = sortedGroup.find(item => item.type === "months");
    const yearsItem = sortedGroup.find(item => item.type === "years");
    
    // 🎯 FIXED: Get date configuration from FormItem config
    const getDateConfigFromItem = (item: FormItem | undefined) => {
      // Handle undefined or null item
      if (!item || typeof item !== 'object') {
        return null;
      }
      
      const config = (item as any).config;
      if (config && config.date) {
        return config.date;
      }
      return null;
    };

    // Try to get config from any of the date items (only if they exist)
    const dateConfigFromItem = getDateConfigFromItem(daysItem) || 
                               getDateConfigFromItem(monthsItem) || 
                               getDateConfigFromItem(yearsItem);

    // 🎯 FIXED: Use config from FormItem if available, otherwise use defaults
    const dateConfig = {
      header: dateConfigFromItem?.header || "", // Use header from config.date.header
      required: dateConfigFromItem?.required !== undefined ? dateConfigFromItem.required : (baseItem as any)?.required !== undefined ? (baseItem as any).required : CONFIG_CONSTANTS.DATE_REQUIRED,
      format: dateConfigFromItem?.format || CONFIG_CONSTANTS.DATE_FORMAT,
      currentDate: dateConfigFromItem?.useCurrentDate !== undefined ? dateConfigFromItem.useCurrentDate : CONFIG_CONSTANTS.DATE_CURRENT_DATE,
      days: daysItem?.value || CONFIG_CONSTANTS.DATE_DAYS_PLACEHOLDER,
      months: monthsItem?.value || CONFIG_CONSTANTS.DATE_MONTHS_PLACEHOLDER,
      years: yearsItem?.value || CONFIG_CONSTANTS.DATE_YEARS_PLACEHOLDER,
    };

    // Create individual date elements array
    const dateElements = [];
    let elementIndex = 0;

    // Add days element
    if (daysItem) {
      // ✅ Get complete config using centralized system for days item
      const { completeConfig: daysConfig, apiStyleFormat: daysStyleFormat } = processElementStyle(daysItem, "days");
      const daysSize = processElementSize(daysItem, "days");

      dateElements.push({
        index: elementIndex++,
        llx: ((daysItem as any).coordinates?.llx || "0").toString(),
        lly: ((daysItem as any).coordinates?.lly || "0").toString(),
        urx: ((daysItem as any).coordinates?.urx || "0").toString(),
        ury: ((daysItem as any).coordinates?.ury || "0").toString(),
        left: (daysItem.position?.x || "0").toString(),
        top: (daysItem.position?.y || "0").toString(),
        scale_X: (daysItem.position?.x || "0").toString(),
        scale_Y: (daysItem.position?.y || "0").toString(),
        width: daysSize.width,
        height: daysSize.height,
        text: "วัน",
        value: daysItem.value || "",
        font_family: daysStyleFormat.font_family,
        font_size: daysStyleFormat.font_size,
        font_weight: daysStyleFormat.font_weight,
        font_style: daysStyleFormat.font_style,
        text_align: daysStyleFormat.text_align,
        text_decoration: daysStyleFormat.text_decoration,
        justify_content: daysStyleFormat.justify_content,
        underline: daysStyleFormat.underline,
        fill: daysStyleFormat.fill,
        background_color: daysStyleFormat.background_color,
        border_color: daysStyleFormat.border_color,
        border_width: daysStyleFormat.border_width,
        border_style: daysStyleFormat.border_style,
        border_radius: daysStyleFormat.border_radius,
        padding: daysStyleFormat.padding,
        margin: daysStyleFormat.margin,
        date_type: "days",
        date_element_id: daysItem.id
      });
    }

    // Add months element
    if (monthsItem) {
      // ✅ Get complete config using centralized system for months item
      const { completeConfig: monthsConfig, apiStyleFormat: monthsStyleFormat } = processElementStyle(monthsItem, "months");
      const monthsSize = processElementSize(monthsItem, "months");

      dateElements.push({
        index: elementIndex++,
        llx: ((monthsItem as any).coordinates?.llx || "0").toString(),
        lly: ((monthsItem as any).coordinates?.lly || "0").toString(),
        urx: ((monthsItem as any).coordinates?.urx || "0").toString(),
        ury: ((monthsItem as any).coordinates?.ury || "0").toString(),
        left: (monthsItem.position?.x || "0").toString(),
        top: (monthsItem.position?.y || "0").toString(),
        scale_X: (monthsItem.position?.x || "0").toString(),
        scale_Y: (monthsItem.position?.y || "0").toString(),
        width: monthsSize.width, 
        height: monthsSize.height, 
        text: "เดือน",
        value: monthsItem.value || "",
        font_family: monthsStyleFormat.font_family,
        font_size: monthsStyleFormat.font_size,
        font_weight: monthsStyleFormat.font_weight,
        font_style: monthsStyleFormat.font_style,
        text_align: monthsStyleFormat.text_align,
        text_decoration: monthsStyleFormat.text_decoration,
        justify_content: monthsStyleFormat.justify_content,
        underline: monthsStyleFormat.underline,
        fill: monthsStyleFormat.fill,
        background_color: monthsStyleFormat.background_color,
        border_color: monthsStyleFormat.border_color,
        border_width: monthsStyleFormat.border_width,
        border_style: monthsStyleFormat.border_style,
        border_radius: monthsStyleFormat.border_radius,
        padding: monthsStyleFormat.padding,
        margin: monthsStyleFormat.margin,
        date_type: "months",
        date_element_id: monthsItem.id
      });
    }

    // Add years element
    if (yearsItem) {
      // ✅ Get complete config using centralized system for years item
      const { completeConfig: yearsConfig, apiStyleFormat: yearsStyleFormat } = processElementStyle(yearsItem, "years");
      const yearsSize = processElementSize(yearsItem, "years");

      dateElements.push({
        index: elementIndex++,
        llx: ((yearsItem as any).coordinates?.llx || "0").toString(),
        lly: ((yearsItem as any).coordinates?.lly || "0").toString(),
        urx: ((yearsItem as any).coordinates?.urx || "0").toString(),
        ury: ((yearsItem as any).coordinates?.ury || "0").toString(),
        left: (yearsItem.position?.x || "0").toString(),
        top: (yearsItem.position?.y || "0").toString(),
        scale_X: (yearsItem.position?.x || "0").toString(),
        scale_Y: (yearsItem.position?.y || "0").toString(),
        width: yearsSize.width,
        height: yearsSize.height,
        text: "ปี",
        value: yearsItem.value || "",
        font_family: yearsStyleFormat.font_family,
        font_size: yearsStyleFormat.font_size,
        font_weight: yearsStyleFormat.font_weight,
        font_style: yearsStyleFormat.font_style,
        text_align: yearsStyleFormat.text_align,
        text_decoration: yearsStyleFormat.text_decoration,
        justify_content: yearsStyleFormat.justify_content,
        underline: yearsStyleFormat.underline,
        fill: yearsStyleFormat.fill,
        background_color: yearsStyleFormat.background_color,
        border_color: yearsStyleFormat.border_color,
        border_width: yearsStyleFormat.border_width,
        border_style: yearsStyleFormat.border_style,
        border_radius: yearsStyleFormat.border_radius,
        padding: yearsStyleFormat.padding,
        margin: yearsStyleFormat.margin,
        date_type: "years",
        date_element_id: yearsItem.id
      });
    }

    // Return new structure: Header object with date elements array
    const mappingItem = {
      header: dateConfig.header || "", // Use header from config.date.header, no fallback
      required: dateConfig.required || CONFIG_CONSTANTS.DATE_REQUIRED,
      format: dateConfig.format || CONFIG_CONSTANTS.DATE_FORMAT,
      currentDate: dateConfig.currentDate || CONFIG_CONSTANTS.DATE_CURRENT_DATE,
      pageNumber: (baseItem as any)?.pageNumber || 1, // Move pageNumber to header level
      step_index: parseInt((baseItem as any)?.step_index || 0), // Move step_index to header level
      date_group_timestamp: groupKey?.split('-step-')[0] || `date-group-${Date.now()}`,
      date_group_index: groupIndex,
      date_group_size: sortedGroup.length,
      is_complete_group: sortedGroup.length === 3,
      date_elements: dateElements,
    };

    mappingDate.push(mappingItem);
  });

  return mappingDate;
};

// 🎯 CENTRALIZED MORE-FILE MAPPING
export const createMoreFileMapping = (
  pageFormItems: PageFormItems,
  expandMode: boolean = false,
  availableStepIndices: string[] = []
): any[] => {
  const mappingMoreFile: any[] = [];
  let index = 0;
  const stepIndexMap = new Map<number, any[]>();

  Object.entries(pageFormItems).forEach(([pageNumber, formItems]) => {
    let moreFileItems = filterItemsByType(formItems, "more-file");

    // Expand "all" step items if needed
    if (expandMode && availableStepIndices.length > 0) {
      moreFileItems = expandAllStepItems(moreFileItems, availableStepIndices);
    }

    moreFileItems.forEach((item: FormItem) => {
      const { completeConfig } = processElementStyle(item, item.type);

      const stepIndex = parseInt((item as any).step_index || 0);

      // Group items by step_index
      if (!stepIndexMap.has(stepIndex)) {
        stepIndexMap.set(stepIndex, []);
      }

      stepIndexMap.get(stepIndex)!.push({
        item,
        completeConfig,
        originalIndex: index++,
      });
    });
  });

  // Convert grouped data to new API structure
  Array.from(stepIndexMap.entries()).forEach(([stepIndex, items]) => {
    const typeData = items.map((itemData, typeIndex) => {
      const { item, completeConfig } = itemData;

      return {
        type_index: typeIndex,
        type_name:
          (item as any).typeName ||
          completeConfig.typeName ||
          CONFIG_CONSTANTS.MORE_FILE_DEFAULT_TYPE_NAME,
        type: (item as any).fileAccept || completeConfig.fileAccept || [],
        is_required:
          (item as any).config?.required ||
          (item as any).required ||
          completeConfig.required ||
          CONFIG_CONSTANTS.DEFAULT_REQUIRED,
        file_data: [], // Empty initially, will be populated when files are uploaded
        is_embedded:
          (item as any).isEmbedded ??
          completeConfig.isEmbedded ??
          CONFIG_CONSTANTS.MORE_FILE_DEFAULT_IS_EMBEDDED,
        file_size:
          (item as any).maxFileSize ||
          completeConfig.maxFileSize ||
          CONFIG_CONSTANTS.MORE_FILE_MAX_SIZE,
      };
    });

    const mappingItem = {
      step_index: stepIndex.toString(), // 🎯 Convert to string as per example
      type_data: typeData,
    };

    mappingMoreFile.push(mappingItem);
  });

  return mappingMoreFile;
};

// 🎯 CENTRALIZED STAMP MAPPING - Similar to signature mapping
export const createStampMapping = (
  pageFormItems: PageFormItems,
  expandMode: boolean = false,
  availableStepIndices: string[] = []
): any[] => {
  const mappingStamp: any[] = [];
  let index = 0;

  Object.entries(pageFormItems).forEach(([pageNumber, formItems]) => {
    let stampItems = filterItemsByType(formItems, "stamp");

    // Expand "all" step items if needed
    if (expandMode && availableStepIndices.length > 0) {
      stampItems = expandAllStepItems(stampItems, availableStepIndices);
    }

    stampItems.forEach((item: FormItem) => {
      const basePayload = buildBasePayload(item, item.type, index);
      const { completeConfig } = processElementStyle(item, item.type);
      const coordinates = processCoordinates(item);
      const position = processPosition(item);

      // Extract stamp type and section from ID or item properties
      const stampType = item.stampType || extractStampType(item.id);
      const section = item.section || extractStampSection(item.id);
      
      // Determine header based on section
      let header = "ต้นสัญญา"; // Default
      if (section === "มาตรา 26 และมาตรา 28") {
        // For มาตรา 26 และมาตรา 28, determine by stamp type
        header = stampType;
      } else if (section === "มาตรา 9") {
        // For มาตรา 9, always ต้นสัญญา
        header = "ต้นสัญญา";
      }

      const stampItem = {
        ...basePayload,
        ...coordinates,
        left: position.left,
        top: position.top,
        scale_X: position.scale_X,
        scale_Y: position.scale_Y,
        text: header, // Use header as text
        required: completeConfig.required?.toString() || CONFIG_CONSTANTS.SIGNATURE_REQUIRED.toString(),
        stampType: stampType,
        value: typeof item.value === "string" ? item.value : "",
        pageNumber: parseInt(pageNumber) || 1, // Move pageNumber to stamp_elements level
        section: section,
        font_size: typeof basePayload.font_size === "string" ? parseInt(basePayload.font_size) : basePayload.font_size,
        underline: typeof basePayload.underline === "string" ? basePayload.underline === "true" : basePayload.underline,
      };

      mappingStamp.push(stampItem);
      index++;
    });
  });

  return mappingStamp;
};

// 🎯 CENTRALIZED E-SEAL MAPPING - Similar to signature/stamp mapping
export const createESealMapping = (
  pageFormItems: PageFormItems,
  expandMode: boolean = false,
  availableStepIndices: string[] = []
): any[] => {
  const mappingESeal: any[] = [];
  let index = 0;

  Object.entries(pageFormItems).forEach(([pageNumber, formItems]) => {
    let esealItems = filterItemsByType(formItems, "eseal");

    // Expand "all" step items if needed
    if (expandMode && availableStepIndices.length > 0) {
      esealItems = expandAllStepItems(esealItems, availableStepIndices);
    }

    esealItems.forEach((item: FormItem) => {
      const basePayload = buildBasePayload(item, item.type, index);
      const { completeConfig } = processElementStyle(item, item.type);
      const coordinates = processCoordinates(item);
      const position = processPosition(item);

      const esealItem = {
        ...basePayload,
        ...coordinates,
        left: position.left,
        top: position.top,
        scale_X: position.scale_X,
        scale_Y: position.scale_Y,
        text: item.label || `E-Seal ${index + 1}`,
        required: completeConfig.required?.toString() || CONFIG_CONSTANTS.SIGNATURE_REQUIRED.toString(),
        sealType: (item as any).sealType || "default",
        value: typeof item.value === "string" ? item.value : "",
        pageNumber: parseInt(pageNumber) || 1,
        font_size: typeof basePayload.font_size === "string" ? parseInt(basePayload.font_size) : basePayload.font_size,
        underline: typeof basePayload.underline === "string" ? basePayload.underline === "true" : basePayload.underline,
      };

      mappingESeal.push(esealItem);
      index++;
    });
  });

  return mappingESeal;
};

// 🎯 MASTER MAPPING BUILDER - Single function to build all mappings
export const buildAllMappings = (
  pageFormItems: PageFormItems,
  expandMode: boolean = false,
  availableStepIndices: string[] = []
) => {
  return {
    mappingText: createTextMapping(pageFormItems, expandMode, availableStepIndices),
    mappingCheckbox: createCheckboxMapping(pageFormItems, expandMode, availableStepIndices),
    mappingRadio: createRadioMapping(pageFormItems, expandMode, availableStepIndices),
    mappingSignature: createSignatureMapping(pageFormItems, expandMode, availableStepIndices),
    mappingDate: createDateMapping(pageFormItems, expandMode, availableStepIndices),
    mappingMoreFile: createMoreFileMapping(pageFormItems, expandMode, availableStepIndices),
    mappingStamp: createStampMapping(pageFormItems, expandMode, availableStepIndices),
    mappingESeal: createESealMapping(pageFormItems, expandMode, availableStepIndices),
  };
}; 