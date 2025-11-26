"use client";

import { ElementStyle } from "./FormTypes";
import { FormElementConfigData } from "../../components/mappingComponents/FormComponents/FormElementConfig";

// Base interface สำหรับ props ที่ใช้ร่วมกันทุก mapping component
export interface BaseMappingElementProps {
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
  coordinatesform?: {
    llx: number;
    lly: number;
    urx: number;
    ury: number;
  };
  onValueChange?: (
    value: string | string[] | boolean | number,
    options?: string[]
  ) => void;
  onConfigChange?: (config: FormElementConfigData) => void;
  onConfigClick?: () => void;
  onStyleChange?: (style: ElementStyle) => void;
  onSelect?: () => void;
  onLayerDelete?: (itemId: string) => void;
  onLayerDuplicate?: (itemId: string) => void;
  userRole?: string;
  step_index?: string;
  onCoordinatesUpdate?: (
    elementId: string,
    coordinates: { llx: number; lly: number; urx: number; ury: number }
  ) => void;
  onComputedStylesChange?: (
    elementId: string,
    computedDefaults: ElementStyle
  ) => void;
}

// Wrapper component props
export interface FormElementWrapperProps {
  children: React.ReactNode;
  consolidatedStyles: {
    position: React.CSSProperties;
    inputContent: React.CSSProperties;
    elementBase: React.CSSProperties;
  };
  isDragging: boolean;
  isSelected?: boolean;
  isResizing: boolean;
  elementSize: { width: number; height: number };
  handleElementClick: () => void;
  formHandle: React.ReactNode;
  resizeHandlesComponent: React.ReactNode;
  id: string;
  setNodeRef: (element: HTMLElement | null) => void;
  elementRef: React.RefObject<HTMLDivElement | null>;
  resizeRef: React.RefObject<HTMLDivElement | null>;
} 

export interface CoBusinessDetail {
  id: string
  titleName: string
  name: string
  buildingName: string
  roomNo: string
  villageName: string
  buildingNumber: string
  moo: string
  soiName: string
  junctionName: string
  streetName: string
  citySubDivisionName: string
  cityName: string
  countrySubDivisionName: string
  postCode: string
  countryId: string
}