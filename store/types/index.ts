"use client"
/**
 * Form Builder Types
 * 
 * This file contains type definitions used throughout the form builder.
 */
"use client"

import React from "react";
import { ElementStyle, FormItem } from './FormTypes';

/**
 * Base form item interface
 */
export interface MappingFormItem {
  id: string;
  mapping_form_data_id: string;
  type: string;
  label: string;
  icon?: React.ReactNode;
  position: { x: number; y: number };
  pageNumber?: number; // Optional page number (for multi-page PDFs)
  value?: string | string[] | boolean | number; // Value for form fields
  checkboxOptions?: string[]; // For storing checkbox options
  style?: ElementStyle; // Style properties for form elements
  config?: {
    maxLength?: number;
    placeholder?: string;
    required?: boolean;
    pattern?: string;
    min?: number;
    max?: number;
    step?: number;
    rows?: number;
    cols?: number;
  }; // Configuration options for form elements
  options?: {
    [key: string]: string | number | boolean | string[] | Record<string, unknown>;
  }; // Additional options specific to the form element type
}

export interface EntityDetail {
  id?: string;
  name?: string;
  role_id?: string;
  role_name?: string;
}

export interface FormUserSetting {
  index?: number;
  section?: string;
  action?: string;
  validate_type?: string;
  selfie_video?: boolean;
  script_video?: string;
  type_entity?: string;
  entity?: EntityDetail[];
  no_edit_mail?: boolean;
}

/**
 * Form element types
 */
export type FormElementType = 
  | 'text'
  | 'name'
  | 'email'
  | 'phone'
  | 'number'
  | 'textarea'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'signature'
  | 'stamp';

/**
 * PDF metadata
 */
export interface PdfMetadata {
  key: string;
  title: string;
  filename: string;
  description?: string;
  pageCount?: number;
  createdAt?: string;
}

/**
 * Form data including items and metadata
 */
export interface FormData extends PdfMetadata {
  items: FormItem[];
} 

// Export PDFTemplate specific types
export * from './PDFTemplateTypes';
// Export FormTypes to include ElementStyle and FormItem
export * from './FormTypes';
// Export estamp types
export * from './estampTypes';
// Export user types
export * from './user'; 