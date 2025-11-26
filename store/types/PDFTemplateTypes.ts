/**
 * PDFTemplate Interface Types
 * 
 * This file contains interface definitions specific to PDFTemplate component
 */
"use client";
import { ApproverItem } from '@/store/mockData/mockPDFData';
// import { WorkflowEntity } from '@/store/backendStore/MappingBackend';
import { WorkflowEntity } from '@/store/types/mappingTypes'
import { FormItem } from './FormTypes';

/**
 * PDFTemplate Component Props Interface
 */
export interface PDFTemplateProps {
  // Core display options
  hasStickyTopBar?: boolean; // Show sticky top navigation bar
  hasFormSidebar?: boolean; // Show form sidebar with elements
  hasPDFThumbnail?: boolean; // Show PDF thumbnail navigation
  hasDocumentDetail?: boolean; // Show document detail panel

  // Data props
  initialPdfUrl?: string; // Initial PDF URL to load
  initialTitle?: string; // Initial document title
  documentId?: string; // Document ID for loading/saving
  mappingFormDataId?: string; // Mapping form data ID for loading/saving
  formItems?: FormItem[]; // Form items to display on the PDF
  approvers?: ApproverItem[]; // Approvers for the document
  documentData?: any; // Document data for mapping
  formDataFlow?: any; // Form data flow for mapping

  // Functionality flags
  isEditable?: boolean; // Whether form elements can be edited
  isViewMode?: boolean; // View-only mode (no editing)

  // Callbacks
  onSaveForm?: (formData: any) => Promise<any>; // Custom save handler
  onReject?: (formData: any) => Promise<any>; // Reject handler
  onApprove?: (formData: any) => Promise<any>; // Approve handler
  onCancel?: () => void; // Cancel handler
  onBack?: () => void; // Back button handler
}

/**
 * User Settings Data Interface
 */
export interface UserSettingData {
  approvers: {
    index: number;
    role: string;
    permission: string;
    section: string;
    validateType: string;
    entityType: string;
    entities: {
      id: string;
      name: string;
      email: string;
    }[];
    selfieVideo: boolean;
    selfieMessage: string;
  }[];
  formId: string;
  documentId: string | undefined;
}

/**
 * Workflow Step Interface
 */
export interface WorkflowStep {
  index: number;
  section: string;
  action: "approver" | "signer" | "test";
  validate_type: "otp" | "pin" | "password" | "";
  validate_data: string;
  selfie_video: boolean;
  script_video: string;
  type_entity: "personal" | "dept" | "role" | "sender";
  entity?: WorkflowEntity[];
  no_edit_mail: boolean;
}

/**
 * Flow Data Item Interface
 */
export interface FlowDataItem {
  index?: string;
  section?: string;
  action?: string;
  validate_type?: string;
  validate_data?: string;
  selfie_video?: boolean;
  script_video?: string;
  type_entity?: string;
  entity?: string[];
  status?: string;
  image_base64?: string;
  approved_at?: string;
}

// Import MappingSignatureItem from centralized types
import { MappingSignatureItem } from '@/store/types/mappingTypes';

/**
 * Signature Item with additional status fields for PDFTemplate
 */
export interface PDFSignatureItem extends MappingSignatureItem {
  status?: "pending" | "signed" | "rejected";
  signer?: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Mapped Flow Item Interface
 */
export interface MappedFlowItem extends FlowDataItem {
  correspondingSignatures: PDFSignatureItem[];
}

/**
 * Signature Image Setting Payload Interface
 */
export interface SignatureImagePayload {
  id: string;
  image: string;
} 