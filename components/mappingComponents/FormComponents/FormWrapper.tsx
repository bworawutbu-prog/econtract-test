/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Form Wrapper Components - CENTRALIZED WRAPPER COMPONENTS
 * 
 * This file contains centralized wrapper components for FormCanvas
 * to eliminate code duplication and improve maintainability
 */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "antd";
import { 
  getDaysInMonth, 
  convertToThaiNumber, 
  decodeHtmlEntities,
  getFormCanvasDefaults,
  getTypeSpecificStyles,
  createComputedDefaults,
  STYLE_CONSTANTS
} from "../FormUtils/defaultStyle";
import { generatePositionStyles } from "../FormUtils/dimensionUtils";
import { DateProvider } from "./DateTimeComponents/DateContext";
import DateInputControls from "./DateTimeComponents/DateInputControls";
import { ElementStyle } from "../../../store/types/FormTypes";

// 🎯 STYLE MANAGEMENT INTERFACES
export interface StyleManagementConfig {
  id: string;
  type: string;
  elementStyle: ElementStyle;
  adjustedPosition?: { x: number; y: number } | null;
  parentScale: number;
  isDragging: boolean;
  isSelected: boolean;
  transform?: { x: number; y: number } | null;
  isInputFocused: boolean;
  isResizing: boolean;
  elementSize: { width: number; height: number };
  isUserEditingInModal: boolean;
  isSignatureInDrawMode: boolean;
  isStampInDrawMode: boolean;
  isSignatureInteracting: boolean;
  onComputedStylesChange?: (elementId: string, computedDefaults: ElementStyle) => void;
  lastComputedStylesRef: React.MutableRefObject<string>;
}

export interface ConsolidatedStyles {
  position: React.CSSProperties;
  inputContent: React.CSSProperties;
  elementBase: React.CSSProperties;
}

// 🎯 FORM ELEMENT WRAPPER INTERFACES
export interface FormElementWrapperProps {
  children?: React.ReactNode;
  id: string;
  type: string;
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
  consolidatedStyles: ConsolidatedStyles;
  setNodeRef: (node: HTMLElement | null) => void;
  elementRef: React.RefObject<HTMLDivElement | null>;
  resizeRef: React.RefObject<HTMLDivElement | null>;
  formHandle: React.ReactNode;
  ResizeHandlesComponent: React.ComponentType;
  handleElementClick: () => void;
  documentType?: string; // 🎯 NEW: Document mode (create, draft, template)
}

export interface DateElementWrapperProps {
  id: string;
  elementType: "days" | "months" | "years";
  coordinatesData: any;
  consolidatedStyles: any;
  children: React.ReactNode;
  onEditModal?: () => void;
  onCloseEditModal?: () => void;
  onSaveEditModal?: () => void;
  showEditModal: boolean;
  isFrontend: () => boolean;
  FormElementWrapper: React.ComponentType<any>;
  localValue?: string | string[] | boolean | number;
  dateFormat?: "EU" | "US" | "THBCnumber";
  showDateModal: boolean;
  dateModalState: any;
  onOpenDateModal: () => void;
  onCloseDateModal: () => void;
  onSaveDateModal: () => void;
  onDateStateChange: (newState: any) => void;
}

// 🎯 FORM ELEMENT WRAPPER COMPONENT
export const FormElementWrapper: React.FC<FormElementWrapperProps> = ({
  children,
  id,
  type,
  isSelected,
  isDragging,
  isResizing,
  consolidatedStyles,
  setNodeRef,
  elementRef,
  resizeRef,
  formHandle,
  ResizeHandlesComponent,
  handleElementClick,
  documentType: _documentType, // 🎯 NEW: Document mode for template mode
}) => {
  const Wrapper = useMemo(() => {
    const WrapperComponent = React.memo(
      ({ children }: { children: React.ReactNode }) => (
        <>
          <div
            ref={(node) => {
              setNodeRef(node);
              if (elementRef.current !== node) {
                elementRef.current = node as HTMLDivElement | null;
              }
              if (resizeRef.current !== node) {
                resizeRef.current = node as HTMLDivElement | null;
              }
            }}
            style={{
              ...consolidatedStyles.position,
            }}
            className={`form-element relative ${
              isDragging ? "fixed" : "absolute"
            }`}
            onClick={handleElementClick}
            data-draggable-element={`dropped-${id}`}
          >
            {isSelected && formHandle}

            <div
              className="flex gap-2 relative"
              style={{
                transition: isResizing ? "none" : "all 0.2s ease",
                ...(isResizing && { willChange: "width, height" }),
              }}
            >
              <div className="flex-1 overflow-hidden">{children}</div>
              <ResizeHandlesComponent />
            </div>
          </div>
        </>
      )
    );
    WrapperComponent.displayName = "FormElementWrapper";
    return WrapperComponent;
  }, [
    id,
    type,
    isSelected,
    isDragging,
    isResizing,
    consolidatedStyles.position,
    setNodeRef,
    elementRef,
    resizeRef,
    formHandle,
    ResizeHandlesComponent,
    handleElementClick,
  ]);

  return <Wrapper>{children}</Wrapper>;
};

// 🎯 DATE ELEMENT WRAPPER COMPONENT
export const DateElementWrapper: React.FC<DateElementWrapperProps> = ({
  id,
  elementType,
  coordinatesData,
  consolidatedStyles,
  children,
  onEditModal,
  onCloseEditModal,
  onSaveEditModal,
  showEditModal,
  isFrontend,
  FormElementWrapper,
  localValue: parentLocalValue,
  dateFormat = "EU",
  showDateModal,
  dateModalState,
  onOpenDateModal,
  onCloseDateModal,
  onSaveDateModal,
  onDateStateChange,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [availableDays, setAvailableDays] = useState<string[]>([]);

  // 🎯 THAI NUMBER DISPLAY FUNCTION
  const formatThaiDisplayValue = (value: string | string[] | boolean | number | undefined): string => {
    if (!value || typeof value !== 'string') return '';
    
    // Check if the value contains HTML entities (Thai numbers)
    if (value.includes('&#x')) {
      return decodeHtmlEntities(value);
    }
    
    // If it's a regular number and we're in THBCnumber format, convert it
    if (dateFormat === 'THBCnumber' && /^\d+$/.test(value)) {
      const thaiNumber = convertToThaiNumber(value);
      return decodeHtmlEntities(thaiNumber);
    }
    
    return value;
  };

  // Use parentLocalValue directly (already formatted by FormCanvas)
  const localValue = typeof parentLocalValue === "string" ? parentLocalValue : "";

  // จัดการการเปลี่ยนแปลงของ month และ year เพื่ออัพเดท available days
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      const month = parseInt(selectedMonth);
      const year = parseInt(selectedYear);
      const days = getDaysInMonth(month, year);
      setAvailableDays(days);
    }
  }, [selectedMonth, selectedYear]);

  // Parse ค่าปัจจุบันเมื่อเปิด Modal สำหรับ days
  useEffect(() => {
    if (showEditModal && (elementType === "days" || elementType === "months" || elementType === "years")) {
      // ถ้ามีค่าใน localValue ให้ parse เพื่อดึง month และ year ที่เกี่ยวข้อง
      // ในกรณีนี้เราต้องหาวิธีเข้าถึงค่า months และ years ของ elements อื่นๆ ในกลุ่มเดียวกัน
      // สำหรับตอนนี้ใช้ค่า default
      const currentYear = new Date().getFullYear().toString();
      setSelectedYear(currentYear);
      setSelectedMonth("01"); // Default to January
    }
  }, [showEditModal, elementType, localValue]);

  // Listen for date element value changes
  useEffect(() => {
    const handleValueChange = (event: CustomEvent) => {
      const {
        elementId,
        elementType: eventElementType,
        value,
        dateContext,
      } = event.detail;

      if (id === elementId && eventElementType === elementType) {
        // Value will be updated through parentLocalValue prop
        // No need to set local state here since we use parentLocalValue directly
      }
    };

    // Listen for date element value changes
    window.addEventListener(
      "dateElementValueChange",
      handleValueChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "dateElementValueChange",
        handleValueChange as EventListener
      );
    };
  }, [id, elementType]);

  const handleClick = () => {
    // Use unified date modal instead of individual modal
    onOpenDateModal();
  };

  return (
    <FormElementWrapper>
      <div
        id={id}
        data-coordinates={JSON.stringify(coordinatesData)}
        data-date-time-type="date"
        data-date-element-type={elementType}
        style={{
          ...consolidatedStyles.inputContent,
        }}
        onClick={isFrontend() ? handleClick : undefined}
        className="date-element"
      >
        {localValue || children}
      </div>

      {/* Unified Date Modal - แสดงครั้งเดียวสำหรับทุก date element */}
      {isFrontend() && (elementType === "days" || elementType === "months" || elementType === "years") && (
        <Modal
          title="แก้ไขข้อมูลวันที่"
          open={showDateModal}
          onOk={onSaveDateModal}
          onCancel={onCloseDateModal}
          okText="บันทึก"
          cancelText="ยกเลิก"
          width={300}
          centered
          maskClosable={false}
        >
          <DateProvider 
            key={`date-modal-${id}-${elementType}-${dateModalState.format}`}
            initialState={dateModalState} 
            onStateChange={onDateStateChange}
          >
            <DateInputControls />     
          </DateProvider>
        </Modal>
      )}
    </FormElementWrapper>
  );
};

// 🎯 STYLE MANAGEMENT FUNCTIONS
export const createConsolidatedStyles = (config: StyleManagementConfig): ConsolidatedStyles => {
  const {
    id,
    type,
    elementStyle,
    adjustedPosition,
    parentScale,
    isDragging,
    isSelected,
    transform,
    isInputFocused,
    isResizing,
    elementSize,
    isUserEditingInModal,
    isSignatureInDrawMode,
    isSignatureInteracting,
    onComputedStylesChange,
    lastComputedStylesRef
  } = config;

  // Special handling for modal editing states
  if (
    isUserEditingInModal ||
    isSignatureInDrawMode ||
    isSignatureInteracting
  ) {
    return {
      position: {//
        position: "absolute" as const,
        left: adjustedPosition?.x || 0,
        top: adjustedPosition?.y || 0,
      },
      inputContent: {},
      elementBase: {},
    };
  }

  // 🎯 CENTRALIZED: Use getFormCanvasDefaults from defaultStyle.ts
  const elementBaseStyles = getFormCanvasDefaults(elementStyle, type);

  // Debug log for dynamic style updates and emit computed styles
  // 🛡️ Only in Backend mode or when not editing in modal
  if (isSelected && !isUserEditingInModal) {
    if (onComputedStylesChange) {
      const computedDefaults = createComputedDefaults(elementBaseStyles);

      // ✅ เฉพาะเมื่อ computed styles เปลี่ยนแปลงจริง ๆ เท่านั้น
      const computedStylesHash = JSON.stringify(computedDefaults);
      if (lastComputedStylesRef.current !== computedStylesHash) {
        lastComputedStylesRef.current = computedStylesHash;
        onComputedStylesChange(id, computedDefaults);
      }
    }
  }

  // 2. Position wrapper styles
  const isSmallScreen =
    typeof window !== "undefined" && window.innerWidth < 1024;
  const safePosition = {
    x: adjustedPosition?.x ?? 0,
    y: adjustedPosition?.y ?? 0,
  };
  const basePositionStyles = generatePositionStyles(
    safePosition,
    parentScale,
    {
      isDragging,
      isSelected,
      opacity: isDragging ? (isSmallScreen ? 0.9 : 0.6) : 1,
      transform: transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
    }
  );

  const positionStyles: React.CSSProperties = {
    ...basePositionStyles,
    fontSize: `${STYLE_CONSTANTS.DEFAULT_FONT_SIZE * parentScale}px`,
    transition: isDragging
      ? "none"
      : "font-size 0.2s, max-width 0.2s, box-shadow 0.3s",
    ...(isDragging && { pointerEvents: "none", willChange: "transform" }),
  };

  // 🎯 CENTRALIZED: Use getTypeSpecificStyles from defaultStyle.ts
  // Start with base element styles
  let inputContentStyles: React.CSSProperties = {
    ...elementBaseStyles,
  };

  // 🎯 UNIVERSAL RESIZE SUPPORT - Apply to all element types
  // During resize, always use elementSize for real-time feedback
  // Otherwise use elementStyle.width/height if available, fallback to elementSize
  const finalWidth = isResizing
    ? `${elementSize.width}px`
    : elementStyle.width || `${elementSize.width}px`;
  const finalHeight = isResizing
    ? `${elementSize.height}px`
    : elementStyle.height || `${elementSize.height}px`;

  // Add resize-specific width and height
  inputContentStyles = {
    ...inputContentStyles,
    width: finalWidth,
    height: finalHeight,
  };

  // 🎯 CENTRALIZED: Apply type-specific styles from defaultStyle.ts
  inputContentStyles = getTypeSpecificStyles(
    type,
    inputContentStyles,
    isResizing
  );

  // State-based adjustments
  if (isInputFocused) {
    inputContentStyles = {
      ...inputContentStyles,
      maxWidth: "none",
    };
  } else if (isSelected && !isInputFocused) {
    inputContentStyles = {
      ...inputContentStyles,
      outline: `2px solid ${STYLE_CONSTANTS.OUTLINE_COLOR}`,
      outlineOffset: "2px",
    };
  }

  // 4. Clean undefined values function
  const cleanStyles = (styles: React.CSSProperties): React.CSSProperties => {
    return Object.entries(styles).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key as keyof React.CSSProperties] = value;
      }
      return acc;
    }, {} as React.CSSProperties);
  };

  return {
    position: cleanStyles(positionStyles),
    inputContent: cleanStyles(inputContentStyles),
    elementBase: cleanStyles(elementBaseStyles),
  };
};

// 🎯 WRAPPER FACTORY FUNCTIONS
export const createFormElementWrapper = (
  props: FormElementWrapperProps
): React.ComponentType<{ children: React.ReactNode }> => {
  return ({ children }) => <FormElementWrapper {...props}>{children}</FormElementWrapper>;
};

export const createDateElementWrapper = (
  props: DateElementWrapperProps
): React.ComponentType<{ children: React.ReactNode }> => {
  return ({ children }) => <DateElementWrapper {...props}>{children}</DateElementWrapper>;
};

// 🎯 HELPER FUNCTIONS
export const createWrapperProps = (
  baseProps: any,
  additionalProps: any = {}
): any => {
  return {
    ...baseProps,
    ...additionalProps,
  };
};

// 🎯 EXPORT ALL WRAPPER COMPONENTS
export default {
  FormElementWrapper,
  DateElementWrapper,
  createFormElementWrapper,
  createDateElementWrapper,
  createWrapperProps,
  createConsolidatedStyles,
};
