/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Frontend Modal Utilities - CENTRALIZED MODAL STATE MANAGEMENT
 * 
 * This file contains centralized modal handlers and state management
 * for FormCanvas components to eliminate code duplication and improve maintainability
 */
"use client";

import { useCallback, useRef } from "react";
import appEmitter from "@/store/libs/eventEmitter";

// 🎯 MODAL STATE INTERFACES
export interface DateModalState {
  days: string;
  months: string;
  years: string;
  format: "EU" | "US" | "THBCnumber";
  useCurrentDate: boolean;
  availableElements: {
    days: boolean;
    months: boolean;
    years: boolean;
  };
}

export interface DateElementsSync {
  days: string;
  months: string;
  years: string;
  format: string;
  groupTimestamp?: string;
}

export interface ModalHandlersConfig {
  // Element identification
  id: string;
  type: string;
  localValue: string | string[] | boolean | number | undefined;
  
  // State setters
  setShowEditModal: (show: boolean) => void;
  setShowDateModal: (show: boolean) => void;
  setDateModalState: (state: DateModalState | ((prev: DateModalState) => DateModalState)) => void;
  setDateElementsSync: (sync: DateElementsSync | ((prev: DateElementsSync) => DateElementsSync)) => void;
  setLocalValue: (value: string | string[] | boolean | number | undefined) => void;
  setActiveTab: (tab: "startSign" | "drawSign") => void;
  
  // Refs
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  signatureRef: React.RefObject<any>;
  signatureImageRef: React.RefObject<string | null>;
  lastEmittedSignatureRef: React.RefObject<string>;
  
  // Data
  dateElementsSync: DateElementsSync;
  dateModalState: DateModalState;
  dateFormat?: "EU" | "US" | "THBCnumber";
  maxLength?: number;
  activeTab: "startSign" | "drawSign";
  signatureData: any[];
  stampData?: any[];
  localCheckboxOptions?: string[];
  localRadioOptions?: string[];
  localSelectOptions?: string[];
  
  // Callbacks
  onValueChange?: (
    value: string | string[] | boolean | number,
    options?: string[]
  ) => void;
  getSignatureImage: () => string | null;
  getStampImage?: () => string | null;
}

// 🎯 DATE MODAL HANDLERS
export const createDateModalHandlers = (config: ModalHandlersConfig) => {
  const {
    id,
    type,
    localValue,
    setShowDateModal,
    setDateModalState,
    setDateElementsSync,
    setLocalValue,
    dateElementsSync,
    dateFormat = "EU",
  } = config;

  const handleOpenDateModal = useCallback(() => {
    // 🎯 CENTRALIZED: Initialize date modal state with ALL current values from sync state
    const initialState: DateModalState = {
      days: dateElementsSync.days || (type === "days" ? String(localValue || "") : ""),
      months: dateElementsSync.months || (type === "months" ? String(localValue || "") : ""),
      years: dateElementsSync.years || (type === "years" ? String(localValue || "") : ""),
      format: dateElementsSync.format as "EU" | "US",
      useCurrentDate: false,
      availableElements: {
        days: true, // Allow all elements in modal
        months: true,
        years: true
      }
    };
    
    // Only update if state actually changed
    setDateModalState(prev => {
      if (JSON.stringify(prev) === JSON.stringify(initialState)) {
        return prev;
      }
      return initialState;
    });
    setShowDateModal(true);
  }, [type, localValue, dateElementsSync, setDateModalState, setShowDateModal]);

  const handleCloseDateModal = useCallback(() => {
    setShowDateModal(false);
    // 🎯 CENTRALIZED: Reset to current sync state values (not just current element)
    setDateModalState({
      days: dateElementsSync.days || (type === "days" ? String(localValue || "") : ""),
      months: dateElementsSync.months || (type === "months" ? String(localValue || "") : ""),
      years: dateElementsSync.years || (type === "years" ? String(localValue || "") : ""),
      format: dateElementsSync.format as "EU" | "US",
      useCurrentDate: false,
      availableElements: {
        days: true,
        months: true,
        years: true
      }
    });
  }, [type, localValue, dateElementsSync, setDateModalState, setShowDateModal]);

  const handleSaveDateModal = useCallback(() => {
    // Get current modal state from the config
    const currentModalState = config.dateModalState;
    
    // 🎯 CENTRALIZED: Update current element with the value from modal state
    const currentValue = type === "days" ? currentModalState.days : 
                        type === "months" ? currentModalState.months : 
                        type === "years" ? currentModalState.years : "";
    
    setLocalValue(currentValue);
    setShowDateModal(false);

    // 🎯 CENTRALIZED: Update sync state with all values from modal
    setDateElementsSync(prev => ({
      ...prev,
      days: currentModalState.days,
      months: currentModalState.months,
      years: currentModalState.years,
    }));

    // 🎯 CENTRALIZED: Emit events for ALL three elements to sync across the group
    const dateElements = [
      { type: "days", value: currentModalState.days },
      { type: "months", value: currentModalState.months },
      { type: "years", value: currentModalState.years }
    ];

    dateElements.forEach(({ type: elementType, value }) => {
      // Create a unique element ID for each date type in the group
      const groupParts = id.split('-');
      const groupTimestamp = groupParts[3] || groupParts[2]; // Get timestamp part
      const stepIndex = groupParts[4] || groupParts[3] || "0"; // Get step index
      const elementId = `date-${groupParts[1]}-${elementType}-${groupTimestamp}-${stepIndex}`;
      
      // 🎯 CENTRALIZED: Emit dateElementValueChange event for ALL elements
      const dateValueChangeEvent = new CustomEvent("dateElementValueChange", {
        detail: { 
          elementId, 
          elementType, 
          value: value || "", // Include empty values to trigger updates
          dateContext: {
            ...currentModalState,
            format: currentModalState.format
          },
          groupTimestamp
        },
      });
      window.dispatchEvent(dateValueChangeEvent);

      // 🎯 CENTRALIZED: Also emit formValueChanged for each element
      const formValueEvent = new CustomEvent("formValueChanged", {
        detail: { id: elementId, value: value || "", type: elementType },
      });
      window.dispatchEvent(formValueEvent);
    });

    // 🎯 CENTRALIZED: Emit for current element as well
    if (currentValue) {
      const formValueEvent = new CustomEvent("formValueChanged", {
        detail: { id, value: currentValue, type },
      });
      window.dispatchEvent(formValueEvent);
    }
  }, [type, config, id, setLocalValue, setDateElementsSync, setShowDateModal]);

  const handleDateStateChange = useCallback((newState: any) => {
    // Prevent infinite loop by checking if state actually changed
    setDateModalState(prev => {
      const nextState = {
        ...prev,
        ...newState,
        format: (newState.format || prev.format) as "EU" | "US",
        availableElements: prev.availableElements
      };
      
      // More efficient comparison - only check essential fields
      const hasChanged = 
        prev.days !== nextState.days ||
        prev.months !== nextState.months ||
        prev.years !== nextState.years ||
        prev.format !== nextState.format ||
        prev.useCurrentDate !== nextState.useCurrentDate;
      
      if (!hasChanged) {
        return prev;
      }
      
      return nextState;
    });
  }, [setDateModalState]);

  return {
    handleOpenDateModal,
    handleCloseDateModal,
    handleSaveDateModal,
    handleDateStateChange,
  };
};

// 🎯 GENERAL EDIT MODAL HANDLERS
export const createEditModalHandlers = (config: ModalHandlersConfig) => {
  const {
    id,
    type,
    localValue,
    setShowEditModal,
    setLocalValue,
    setActiveTab,
    textareaRef,
    signatureRef,
    signatureImageRef,
    lastEmittedSignatureRef,
    maxLength,
    activeTab,
    signatureData,
    localCheckboxOptions,
    localRadioOptions,
    localSelectOptions,
    onValueChange,
    getSignatureImage,
  } = config;

  const handleOpenEditModal = useCallback(() => {
    setShowEditModal(true);

    if (type === "text") {
      setTimeout(() => {
        if (textareaRef.current) {
          const currentText = String(localValue || "");
          textareaRef.current.value = currentText;
          textareaRef.current.focus();

          // ตั้งค่า cursor ให้อยู่ท้ายข้อความ
          const textLength = currentText.length;
          textareaRef.current.setSelectionRange(textLength, textLength);

          // เพิ่ม event listener สำหรับนับตัวอักษร
          if (maxLength) {
            const textCountElement = document.getElementById(`text-count-${id}`);
            if (textCountElement) {
              const updateCharCount = () => {
                const currentLength = textareaRef.current?.value.length || 0;
                textCountElement.textContent = currentLength.toString();
              };

              textareaRef.current.addEventListener("input", updateCharCount);
              updateCharCount(); // เรียกครั้งแรกเพื่อแสดงค่าเริ่มต้น
            }
          }
        }
      }, 100);
    } else if (type === "signature") {
      if (signatureRef.current) {
        const existingSignature = getSignatureImage();
        if (existingSignature) {
          const modalWidth = Math.min(window.innerWidth * 0.8, 390);
          const canvasWidth = modalWidth - 40;
          const canvasHeight = Math.min(canvasWidth * 0.4, 150);

          signatureRef.current.fromDataURL(existingSignature, {
            ratio: 1,
            width: canvasWidth,
            height: canvasHeight,
          });
        } else {
          signatureRef.current.clear();
        }
      }
    }
  }, [type, localValue, maxLength, id, textareaRef, signatureRef, getSignatureImage, setShowEditModal]);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);

    if (type === "text") {
      if (textareaRef.current) {
        textareaRef.current.value = "";
      }
    } else if (type === "signature") {
      if (signatureRef.current) {
        signatureRef.current.clear();
      }
    }
  }, [type, textareaRef, signatureRef, setShowEditModal]);

  const handleSaveEditModal = useCallback(() => {
    let finalValue: string | string[] | boolean | number = "";

    if (type === "text") {
      finalValue = textareaRef.current?.value || "";
      setLocalValue(finalValue);
      setShowEditModal(false);
    } else if (type === "signature") {
      if (activeTab === "drawSign") {
        // กรณีวาดลายเซ็น
        finalValue = signatureImageRef.current || "";
        setShowEditModal(false);

        if (
          signatureImageRef.current &&
          lastEmittedSignatureRef.current !== signatureImageRef.current
        ) {
          lastEmittedSignatureRef.current = signatureImageRef.current;

          setTimeout(() => {
            appEmitter.emit("settingImageSignature", {
              id: id,
              image: signatureImageRef.current,
            });
          }, 0);
        }
      } else if (activeTab === "startSign") {
        // กรณีเลือกลายเซ็นจาก Select
        const selectedSignature = signatureData.find(
          (item) => item.stamp_name === localValue
        );
        finalValue = selectedSignature?.sign_base64 || "";

        // อัพเดท signatureImageRef.current เพื่อให้ getSignatureImage() ทำงานได้
        signatureImageRef.current = finalValue as string;

        setLocalValue(finalValue as string);
        setShowEditModal(false);

        if (finalValue && finalValue !== "") {
          lastEmittedSignatureRef.current = finalValue as string;

          setTimeout(() => {
            appEmitter.emit("settingImageSignature", {
              id: id,
              image: finalValue as string,
            });
          }, 0);
        }
      }
    }

    // ✅ ส่งค่าไปยัง parent component (ถ้ามีค่าจริง)
    if (finalValue) {
      setTimeout(() => {
        if (onValueChange) {
          const options =
            type === "checkbox"
              ? localCheckboxOptions
              : type === "radio"
              ? localRadioOptions
              : type === "select"
              ? localSelectOptions
              : undefined;
          onValueChange(finalValue, options);
        }

        const formValueChangedEvent = new CustomEvent("formValueChanged", {
          detail: { id, value: finalValue, type },
        });
        window.dispatchEvent(formValueChangedEvent);
      }, 0);
    }
  }, [
    type,
    activeTab,
    textareaRef,
    signatureImageRef,
    lastEmittedSignatureRef,
    signatureData,
    localValue,
    id,
    setLocalValue,
    setShowEditModal,
    localCheckboxOptions,
    localRadioOptions,
    localSelectOptions,
    onValueChange,
  ]);

  return {
    handleOpenEditModal,
    handleCloseEditModal,
    handleSaveEditModal,
  };
};

// 🎯 UNIFIED MODAL HANDLERS FACTORY
export const createModalHandlers = (config: ModalHandlersConfig) => {
  const dateHandlers = createDateModalHandlers(config);
  const editHandlers = createEditModalHandlers(config);

  return {
    ...dateHandlers,
    ...editHandlers,
  };
};

// 🎯 HELPER FUNCTIONS
export const createInitialDateModalState = (
  type: string,
  localValue: string | string[] | boolean | number | undefined,
  dateElementsSync: DateElementsSync,
  dateFormat: "EU" | "US" | "THBCnumber" = "EU"
): DateModalState => {
  return {
    days: dateElementsSync.days || (type === "days" ? String(localValue || "") : ""),
    months: dateElementsSync.months || (type === "months" ? String(localValue || "") : ""),
    years: dateElementsSync.years || (type === "years" ? String(localValue || "") : ""),
    format: dateElementsSync.format as "EU" | "US" | "THBCnumber",
    useCurrentDate: false,
    availableElements: {
      days: true,
      months: true,
      years: true
    }
  };
};

export const createInitialDateElementsSync = (
  dateFormat: "EU" | "US" | "THBCnumber" = "EU"
): DateElementsSync => {
  return {
    days: "",
    months: "",
    years: "",
    format: dateFormat,
  };
};

// 🎯 EVENT EMITTERS
export const emitDateElementValueChange = (
  elementId: string,
  elementType: string,
  value: string,
  dateContext: any,
  groupTimestamp?: string
) => {
  const dateValueChangeEvent = new CustomEvent("dateElementValueChange", {
    detail: { 
      elementId, 
      elementType, 
      value: value || "",
      dateContext,
      groupTimestamp
    },
  });
  window.dispatchEvent(dateValueChangeEvent);
};

export const emitFormValueChanged = (
  id: string,
  value: string | string[] | boolean | number,
  type: string
) => {
  const formValueEvent = new CustomEvent("formValueChanged", {
    detail: { id, value, type },
  });
  window.dispatchEvent(formValueEvent);
};
