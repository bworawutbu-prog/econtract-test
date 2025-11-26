"use client";

import React from "react";
import { BaseStyle } from "./mappingTypes";

// 🎯 NEW: ElementStyle extends BaseStyle for consistency
export interface ElementStyle extends BaseStyle {
  // ElementStyle inherits all properties from BaseStyle
  // Additional properties specific to form elements can be added here
}

export interface FormItem {
  id: string;
  type: string;
  label: string;
  position?: { x: number; y: number };
  value?: string | string[] | boolean | number;
  checkboxOptions?: string[];
  radioOptions?: string[];
  selectOptions?: string[];
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
  style?: ElementStyle;
  isSelected?: boolean;
  actorId?: string;
  signatureType?: string;
  stampType?: string;
  text?: string;
  step_index?: string;
  pageNumber?: number;
  pageNumbers?: number[];
  icon?: React.ReactNode;
  dateTimeType?: string;
  section?: string; // 🎯 NEW: Section for stamp elements (มาตรา 9, มาตรา 26 และมาตรา 28)
  date?: {
    days: string;
    months: string;
    years: string;
    format?: string;
    useCurrentDate?: boolean;
  };
  config?: {
    min?: number;
    max?: number;
    required?: boolean;
    maxLength?: number;
    placeholder?: string;
    dateFormat?: "EU" | "US" | "THBCnumber";
  };
  coordinates?: {
    llx: number;
    lly: number;
    urx: number;
    ury: number;
  };
  parentId?: string; // Reference to parent group for checkbox/radio options
  optionIndex?: number; // Index within the group for checkbox/radio options
} 