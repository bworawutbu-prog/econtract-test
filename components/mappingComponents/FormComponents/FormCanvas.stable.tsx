"use client";

import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  useCallback,
} from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { Modal, Select, Tabs } from "antd";
import Image from "next/image";
import SignatureCanvas from "react-signature-canvas";
import { FormElementConfigData } from "./FormElementConfig";
import { ElementStyle } from "../../../store/types/FormTypes";
import { FormHandle } from "./FormHandle";
import { ResizeHandles, useElementResize } from "./ResizeHandle";
import {
  calculatePdfDimensionsFromElement,
  calculatePdfCoordinates,
  calculatePdfCoordinatesForMultiPage,
} from "../FormUtils/dimensionUtils";
import {
  CONFIG_CONSTANTS,
  convertToThaiNumber,
  decodeHtmlEntities,
  type DateConfig,
} from "../FormUtils/defaultStyle";
import {
  createModalHandlers,
  createInitialDateModalState,
  createInitialDateElementsSync,
  type DateModalState,
  type DateElementsSync,
  type ModalHandlersConfig,
} from "../FormUtils/approversModalUtils";
import {
  FormElementWrapper,
  DateElementWrapper,
  createConsolidatedStyles,
  type FormElementWrapperProps,
  type DateElementWrapperProps,
  type StyleManagementConfig,
  type ConsolidatedStyles,
} from "./FormWrapper";
import { get_all_user_sign } from "@/store/frontendStore/profileAPI";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from "@/store/frontendStore";
import NonSignatureIcon from "@/assets/webp/nonsignature.webp";
import { enqueueSnackbar } from "notistack";
import { getPdfElements, getPdfElementsForPage, getBestPdfElement, setupPdfElementObservers, handlePdfElementChange } from "../../../store/utils/pdfElementUtils";
import { setIsDragging, setPdfDimensions, setCanvasScale, setIsPdfReady } from "../../../store/slices/canvasSlice";

interface FormCanvasProps {
  children: React.ReactNode;
  hasPdfBackground?: boolean;
  pdfDimensions?: { width: number; height: number };
  scale?: number;
  userRole?: string;
  onCoordinatesUpdate?: (
    elementId: string,
    coordinates: { llx: number; lly: number; urx: number; ury: number }
  ) => void;
  onComputedStylesChange?: (
    elementId: string,
    computedDefaults: ElementStyle
  ) => void;
  onLayerDelete?: (itemId: string) => void;
  onLayerDuplicate?: (itemId: string) => void;
  documentType?: string; // 🎯 NEW: Document mode (create, draft, template)
}

// Convert to forwardRef to allow parent components to access the DOM element
export const FormCanvas = React.forwardRef<HTMLDivElement, FormCanvasProps>(
  (
    {
      children,
      hasPdfBackground = false,
      pdfDimensions,
      scale = 1,
      userRole = "Admin",
      onCoordinatesUpdate,
      onComputedStylesChange,
      onLayerDelete,
      onLayerDuplicate,
      documentType, // 🎯 NEW: Document mode for template mode
    },
    ref
  ) => {
    // 🔧 **Fix: Move useAppDispatch inside component body**
    const dispatch = useAppDispatch() as ThunkDispatch<
      RootState,
      unknown,
      AnyAction
    >;

    // 🎯 NEW: Use Redux state for canvas management
    const canvasState = useAppSelector((state) => state.canvas);
    const isDragging = canvasState.isDragging;
    const canvasScale = canvasState.canvasScale;
    const reduxPdfDimensions = canvasState.pdfDimensions;

    const { setNodeRef } = useDroppable({
      id: "form-canvas",
    });

    const canvasRef = useRef<HTMLDivElement>(null);
    const pdfAreaRef = useRef<HTMLDivElement>(null);
    const [pdfRect, setPdfRect] = useState<{
      width: number;
      height: number;
      top: number;
      left: number;
    }>({
      width: 0,
      height: 0,
      top: 0,
      left: 0,
    });

    // 🎯 NEW: Use centralized PDF element management
    useEffect(() => {
      const handleResize = () => {
        if (canvasRef.current) {
          // 🎯 FIXED: Always use scale 1.0 for PDF and FormCanvas
          if (pdfDimensions || reduxPdfDimensions) {
            const dimensions = pdfDimensions || reduxPdfDimensions;
            setPdfRect({
              width: dimensions!.width,
              height: dimensions!.height,
              top: 0,
              left: 0,
            });
            dispatch(setCanvasScale(1.0));
          } else {
            // 🎯 NEW: Use centralized PDF element utilities
            const pdfElements = getPdfElements();
            const pdfElement = getBestPdfElement(pdfElements);

            if (pdfElement) {
              const pdfDims = calculatePdfDimensionsFromElement(
                pdfElement,
                1.0
              );
              setPdfRect({
                width: pdfDims.width,
                height: pdfDims.height,
                top: 0,
                left: 0,
              });
              dispatch(setCanvasScale(1.0));
              dispatch(setPdfDimensions(pdfDims));
            } else {
              dispatch(setCanvasScale(1.0));
            }
          }
        }
      };

      handleResize();

      // 🎯 NEW: Use centralized PDF element observers
      const cleanupObserver = setupPdfElementObservers(dispatch);

      // Add event listeners
      window.addEventListener("resize", handleResize);
      window.addEventListener("orientationchange", handleResize);

      // Update form canvas when scale changes
      const scaleObserver = new MutationObserver(() => {
        handleResize();
      });

      if (canvasRef.current?.parentElement) {
        scaleObserver.observe(canvasRef.current.parentElement, {
          attributes: true,
          attributeFilter: ["style"],
        });
      }

      return () => {
        cleanupObserver();
        scaleObserver.disconnect();
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("orientationchange", handleResize);
      };
    }, [pdfDimensions, reduxPdfDimensions, scale, dispatch]);

  // 🎯 BROWSER-LIKE ZOOM: Don't interfere with canvas overflow during drag
  // The overflow is managed by the zoom system, so we only prevent body scrolling
  useEffect(() => {
    if (isDragging) {
      // Only prevent body scrolling, don't touch canvasRef overflow
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scrolling
      document.body.style.overflow = "";
    }

    // Cleanup function to ensure body scrolling is restored
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDragging]);

    // 🎯 DRAG EVENT LISTENERS: Listen for drag start/end events
    useEffect(() => {
      const handleDragStart = (event: CustomEvent) => {
        // Check if this is a form element drag
        if (event.detail?.elementId && event.detail?.type) {
          dispatch(setIsDragging(true));
        }
      };

      const handleDragEnd = (event: CustomEvent) => {
        // Check if this is a form element drag
        if (event.detail?.elementId && event.detail?.type) {
          dispatch(setIsDragging(false));
        }
      };

      // Listen for custom drag events from form elements
      window.addEventListener("dragStart", handleDragStart as EventListener);
      window.addEventListener("dragEnd", handleDragEnd as EventListener);

      // Also listen for mouse events as fallback
      const handleMouseDown = (event: MouseEvent) => {
        // Check if the target is a draggable form element
        const target = event.target as HTMLElement;
        if (target && target.hasAttribute("data-draggable-element")) {
          dispatch(setIsDragging(true));
        }
      };

      const handleMouseUp = () => {
        dispatch(setIsDragging(false));
      };

      window.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("dragStart", handleDragStart as EventListener);
        window.removeEventListener("dragEnd", handleDragEnd as EventListener);
        window.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }, [dispatch]);

    // Effect to forward the PDF area ref to the parent component
    useEffect(() => {
      if (typeof ref === "function") {
        ref(pdfAreaRef.current);
      } else if (ref) {
        ref.current = pdfAreaRef.current;
      }
    }, [ref, pdfAreaRef.current]);

    // Get the canvas style based on PDF dimensions
    const canvasStyle = useMemo(() => {
      const dimensions = pdfDimensions || reduxPdfDimensions;
      if (!hasPdfBackground || !dimensions) {
        return {
          position: "relative" as const,
          width: "100%",
          height: "100%",
        };
      }

      return {
        width: "100%",
        height: "100%",
        position: "absolute" as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none" as const,
      };
    }, [hasPdfBackground, pdfDimensions, reduxPdfDimensions]);

    // Create a positioned container for the PDF area only
    const pdfAreaStyle = useMemo(() => {
      const dimensions = pdfDimensions || reduxPdfDimensions;
      if (!hasPdfBackground || !dimensions) {
        return {};
      }
      return {
        width: `100%`,
        height: `100%`,
        top: 0,
        left: 0,
        background: "transparent",
        pointerEvents: "all" as const,
        zIndex: 10,
      };
    }, [hasPdfBackground, pdfDimensions, reduxPdfDimensions, pdfRect]);

    return (
      <div
        ref={(node) => {
          setNodeRef(node);
          if (canvasRef.current !== node) {
            canvasRef.current = node as HTMLDivElement | null;
          }
        }}
        className={`form-element w-full h-full ${
          hasPdfBackground
            ? "bg-transparent"
            : "bg-white border-2 border-dashed border-gray-300"
        } rounded-lg relative`}
        style={canvasStyle}
        data-scale={canvasScale}
      >
        {hasPdfBackground && (pdfDimensions || reduxPdfDimensions) ? (
          <div
            ref={pdfAreaRef}
            className="form-element pdf-form-area"
            style={pdfAreaStyle}
            data-pdf-width={pdfRect.width}
            data-pdf-height={pdfRect.height}
            data-scale={scale}
            data-padding-top={pdfRect.top}
            data-padding-left={pdfRect.left}
          >
            {React.Children?.map(children, (child) => {
              if (
                React.isValidElement(child) &&
                child.type === DroppedElement
              ) {
                return React.cloneElement(child, {
                  userRole,
                  onCoordinatesUpdate,
                  onComputedStylesChange,
                  onLayerDelete,
                  onLayerDuplicate,
                  documentType, // 🎯 NEW: Pass documentType prop for template mode
                } as Partial<React.ComponentProps<typeof DroppedElement>>);
              }
              return child;
            })}
          </div>
        ) : (
          React.Children?.map(children, (child) => {
            if (React.isValidElement(child) && child.type === DroppedElement) {
              return React.cloneElement(child, {
                userRole,
                onCoordinatesUpdate,
                onComputedStylesChange,
                onLayerDelete,
                onLayerDuplicate,
              } as Partial<React.ComponentProps<typeof DroppedElement>>);
            }
            return child;
          })
        )}
      </div>
    );
  }
);
FormCanvas.displayName = "FormCanvas";


export const DroppedElement: React.FC<{
  id: string;
  type: string;
  label: string;
  position?: { x: number; y: number };
  value?: string | string[] | boolean | number;
  checkboxOptions?: string[];
  radioOptions?: string[]; // เพิ่มสำหรับ radio
  selectOptions?: string[]; // เพิ่มสำหรับ select
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
    options?: string[] // เปลี่ยนเป็น options ทั่วไป
  ) => void;
  onConfigChange?: (config: FormElementConfigData) => void;
  onConfigClick?: () => void;
  onStyleChange?: (style: ElementStyle) => void;
  onSelect?: () => void;
  onLayerDelete?: (itemId: string) => void;
  onLayerDuplicate?: (itemId: string) => void; // Add duplicate handler
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
  dateConfig?: DateConfig; // Add dateConfig for date elements
  dateFormat?: "EU" | "US" | "THBCnumber"; // Add dateFormat for date elements
  documentType?: string; // 🎯 NEW: Document mode (create, draft, template)
}> = ({
  id,
  type,
  label,
  position,
  value,
  checkboxOptions,
  radioOptions, // เพิ่มสำหรับ radio
  selectOptions, // เพิ่มสำหรับ select
  maxLength,
  required = false,
  placeholder = "",
  style: elementStyle = {} as ElementStyle,
  isSelected = false,
  actorId,
  coordinatesform,
  onValueChange,
  onConfigChange,
  onConfigClick,
  onStyleChange,
  onSelect,
  onLayerDelete,
  onLayerDuplicate,
  userRole,
  step_index,
  onCoordinatesUpdate,
  onComputedStylesChange,
  dateConfig,
  dateFormat = "EU",
  documentType, // 🎯 NEW: Document mode for template mode
}) => {
  const isTemplateMode = false;
  void documentType;

  // ========== DND SETUP ==========
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `dropped-${id}`,
    disabled: isTemplateMode, // 🎯 Keep drag enabled for template mode
  });
  const dispatch = useAppDispatch() as ThunkDispatch<
    RootState,
    unknown,
    AnyAction
  >;
  // console.log('actorId', actorId, step_index, id)

  // 🎯 DRAG EVENT EMITTERS: Emit custom events for drag state
  useEffect(() => {
    if (isDragging) {
      // Emit drag start event
      const dragStartEvent = new CustomEvent("dragStart", {
        detail: {
          elementId: id,
          type: type,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(dragStartEvent);
    } else {
      // Emit drag end event
      const dragEndEvent = new CustomEvent("dragEnd", {
        detail: {
          elementId: id,
          type: type,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(dragEndEvent);
    }
  }, [isDragging, id, type]);

  // ========== STATE: UI Controls ==========
  const [showConfig, setShowConfig] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<"startSign" | "drawSign">("startSign");
  const [signatureData, setSignatureData] = useState<any[]>([]);
  const [stampData, setStampData] = useState<any[]>([]);

  // ========== STATE: Layout & Dimensions ==========
  const [parentScale, setParentScale] = useState(1);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [pdfDimensions, setPdfDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // ========== STATE: Form Values ==========
  const [localValue, setLocalValue] = useState<string | string[] | boolean | number | undefined>(value);
  const [localCheckboxOptions, setLocalCheckboxOptions] = useState<string[] | undefined>(checkboxOptions);
  const [localRadioOptions, setLocalRadioOptions] = useState<string[] | undefined>(radioOptions);
  const [localSelectOptions, setLocalSelectOptions] = useState<string[] | undefined>(selectOptions);

  // ========== STATE: Date Elements Sync ==========
  const [dateElementsSync, setDateElementsSync] = useState<{
    days: string;
    months: string;
    years: string;
    format: string;
    groupTimestamp?: string;
  }>({
    days: "",
    months: "",
    years: "",
    format: dateFormat || "EU",
  });

  // Update format when dateFormat prop changes
  useEffect(() => {
    if (dateFormat) {
      setDateElementsSync(prev => ({
        ...prev,
        format: dateFormat,
      }));
    }
  }, [dateFormat]);

  // ========== REFS ==========
  const elementRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const signatureImageRef = useRef<string | null>(null);
  const signatureInitializedRef = useRef(false);
  const isSignatureInteracting = useRef<boolean>(false);
  const lastComputedStylesRef = useRef<string>("");
  const lastEmittedSignatureRef = useRef<string>("");

  // ========== DATE MODAL STATE ==========
  const [showDateModal, setShowDateModal] = useState(false);
  const [dateModalState, setDateModalState] = useState<DateModalState>(
    createInitialDateModalState(type, localValue, createInitialDateElementsSync(dateFormat), dateFormat)
  );

  // ========== STATE: Internal ==========
  const [, forceUpdate] = useState(0);
  const [coordinates, setCoordinates] = useState<{
    llx: number;
    lly: number;
    urx: number;
    ury: number;
  } | null>(null);
  // ========== SIGNATURE INITIALIZATION ==========
  useEffect(() => {
    if (
      type === "signature" &&
      localValue &&
      typeof localValue === "string" &&
      localValue.startsWith("data:image") &&
      !signatureInitializedRef.current &&
      signatureImageRef.current !== localValue
    ) {
      signatureImageRef.current = localValue;
      signatureInitializedRef.current = true;
      forceUpdate((prev) => prev + 1);
    }
  }, [localValue, type]);

  // ========== HELPER FUNCTIONS ==========
  const getSignatureImage = useCallback(() => {
    return signatureImageRef.current ?? null;
  }, []);

  const hasSignatureImage = useCallback(() => {
    const hasImage = !!signatureImageRef.current;
    return hasImage;
  }, [id]);

  const getStampImage = useCallback(() => {
    return signatureImageRef.current ?? null;
  }, []);

  const hasStampImage = useCallback(() => {
    const hasImage = !!signatureImageRef.current;
    return hasImage;
  }, [id]);

  const hasEditPermission = useCallback(() => {
    const hasRolePermission = userRole !== "Member";
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "";
    const isBackendMapping = currentPath.includes("/backend/Mapping");
    return hasRolePermission && isBackendMapping;
  }, [userRole]);

  const isFrontend = useCallback(() => {
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "";
    return !currentPath.includes("/backend");
  }, []);

  // ========== THAI NUMBER DISPLAY ==========
  // Format display value for Thai numbers
  const formatThaiDisplayValue = (value: string | string[] | boolean | number | undefined): string => {
    if (!value || typeof value !== 'string') return '';
    
    // Check if the value contains HTML entities (Thai numbers)
    if (value.includes('&#x')) {
      return decodeHtmlEntities(value);
    }
    
    // Use dateFormat prop directly instead of dateElementsSync.format
    if (dateFormat === 'THBCnumber' && /^\d+$/.test(value)) {
      const thaiNumber = convertToThaiNumber(value);
      return decodeHtmlEntities(thaiNumber);
    }
    
    return value;
  };

  // ========== RESIZE SYSTEM ==========
  const {
    elementSize,
    setElementSize,
    isResizing,
    positionOffset,
    permanentPositionOffset,
    resizeRef,
    handleResizeStart,
  } = useElementResize({
    type,
    elementStyle,
    position,
    onStyleChange,
    onConfigChange,
    id,
    documentType, // 🎯 NEW: Pass documentType prop for template mode
  });

  // ========== EFFECTS ==========

  // Add window resize listener and other setup
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    const handleScroll = () => {
      setScrollOffset(window.scrollY);
    };

    // 🔧 **Fix: Add passive flag to scroll-blocking events**
    const resizeOptions = { passive: true };
    const scrollOptions = { passive: true };

    // Add all event listeners with passive flag
    window.addEventListener("resize", handleResize, resizeOptions);
    window.addEventListener("scroll", handleScroll, scrollOptions);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Get the canvas scale and PDF dimensions from parent elements
  useEffect(() => {
    const updateFromParent = () => {
      if (elementRef.current) {
        let parent = elementRef.current.parentElement;
        let pdfAreaElement = null;

        while (parent) {
          if (parent.hasAttribute("data-scale")) {
            const scale = parseFloat(parent.getAttribute("data-scale") || "1");
            setParentScale(scale);
          }

          if (parent.classList.contains("pdf-form-area")) {
            pdfAreaElement = parent;
          }

          parent = parent.parentElement;
        }

        // Get PDF dimensions and padding if available
        if (pdfAreaElement) {
          const width = parseFloat(
            pdfAreaElement.getAttribute("data-pdf-width") || "0"
          );
          const height = parseFloat(
            pdfAreaElement.getAttribute("data-pdf-height") || "0"
          );

          if (width && height) {
            setPdfDimensions({
              width,
              height,
            });
          }
        }
      }
    };

    updateFromParent();
    // Note: Resize handling is already done in the previous useEffect
  }, [id]);

  const coordinatesData = useMemo(() => {
    return coordinatesform
      ? coordinatesform
      : coordinates || { llx: 0, lly: 0, urx: 0, ury: 0 };
  }, [coordinatesform, coordinates]);

  // 🎯 PERFORMANCE: Ref to track if we're currently calculating coordinates
  const coordinateCalculationRef = useRef<number | null>(null);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);

  // Adjust position based on parent scale and constrain to PDF area using dimensionUtils
  // 🎯 PERFORMANCE: Removed coordinate calculation from useMemo to prevent blocking during drag
  const adjustedPosition = useMemo(() => {
    const defaultPosition = { x: 0, y: 0 };
    if (!position) return defaultPosition;

    // คำนวณ offset สำหรับ formHandle - ใน Frontend เมื่อ formHandle หายไป children จะขยับขึ้นมา
    // ต้อง offset ตำแหน่งลงเพื่อให้ children อยู่ตำแหน่งเดิม
    let adjustedPos = { ...position };

    // Apply position offset - both permanent and temporary (during resize)
    adjustedPos.x += permanentPositionOffset.x;
    adjustedPos.y += permanentPositionOffset.y;

    if (isResizing) {
      adjustedPos.x += positionOffset.x;
      adjustedPos.y += positionOffset.y;
    }

    // 🎯 PERFORMANCE: Store position for coordinate calculation (only when not dragging)
    lastPositionRef.current = adjustedPos;

    return adjustedPos;
  }, [
    position?.x,
    position?.y,
    isResizing,
    positionOffset,
    permanentPositionOffset,
  ]);

  // 🎯 PERFORMANCE: Calculate coordinates only when drag ends or position changes (not during drag)
  useEffect(() => {
    // Skip coordinate calculation during drag to prevent lag
    if (isDragging) {
      return;
    }

    // Skip if no PDF dimensions or position
    if (!pdfDimensions || !lastPositionRef.current) {
      return;
    }

    // Cancel any pending calculation
    if (coordinateCalculationRef.current !== null) {
      cancelAnimationFrame(coordinateCalculationRef.current);
    }

    // Use requestAnimationFrame to defer heavy DOM queries
    coordinateCalculationRef.current = requestAnimationFrame(() => {
      try {
        // 🎯 NEW: Get currentPageNumber safely
        const currentPageNumber =
          typeof window !== "undefined"
            ? parseInt(
                sessionStorage.getItem("currentPageNumber") || "1",
                10
              )
            : 1;

        // ใช้ฟังก์ชันหลักที่แก้ไขแล้ว
        const coordinatesTemp = calculatePdfCoordinatesForMultiPage(
          id,
          undefined,
          parentScale,
          currentPageNumber
        );

        // ถ้าไม่สำเร็จ ใช้ฟังก์ชันเดิม
        const fallbackCoords =
          coordinatesTemp || calculatePdfCoordinates(id);

        // ใช้ผลลัพธ์ที่คำนวณได้
        const finalCoords = coordinatesTemp || fallbackCoords;

        // Only update coordinates if calculation was successful
        if (finalCoords) {
          setCoordinates(finalCoords);
        }
      } catch (error) {
        // 🎯 FIXED: Handle any errors gracefully without breaking the component
        console.warn(
          `[FormCanvas] Error calculating coordinates for element ${id}:`,
          error
        );
      } finally {
        coordinateCalculationRef.current = null;
      }
    });

    // Cleanup
    return () => {
      if (coordinateCalculationRef.current !== null) {
        cancelAnimationFrame(coordinateCalculationRef.current);
        coordinateCalculationRef.current = null;
      }
    };
  }, [
    adjustedPosition.x,
    adjustedPosition.y,
    pdfDimensions,
    parentScale,
    id,
    isDragging, // 🎯 KEY: Only calculate when drag ends
  ]);

  useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value);
    }
  }, [value, id]);

  // 🎯 PERFORMANCE: Separate useEffect for coordinate updates - debounced to avoid excessive calls
  useEffect(() => {
    // Skip coordinate update during drag to prevent lag
    if (isDragging) {
      return;
    }

    if (onCoordinatesUpdate && coordinates && coordinates.llx !== undefined) {
      // Use requestAnimationFrame to batch coordinate updates
      const frameId = requestAnimationFrame(() => {
        onCoordinatesUpdate(id, coordinates);
      });

      return () => {
        cancelAnimationFrame(frameId);
      };
    }
  }, [coordinates, onCoordinatesUpdate, id, isDragging]);

  // จัดการการอัพเดท options สำหรับแต่ละ type
  useEffect(() => {
    if (type === "checkbox" && checkboxOptions) {
      setLocalCheckboxOptions(checkboxOptions);
    } else if (type === "radio" && radioOptions) {
      setLocalRadioOptions(radioOptions);
    } else if (type === "select" && selectOptions) {
      setLocalSelectOptions(selectOptions);
    }
  }, [checkboxOptions, radioOptions, selectOptions, type]);

  // Listen for date context changes and sync across elements
  useEffect(() => {
    if (["days", "months", "years"].includes(type)) {
      const handleValueChange = (event: CustomEvent) => {
        const { elementId, elementType, value, dateContext, groupTimestamp } = event.detail;

        // 🎯 FIXED: Extract group info from current element ID to match with other elements
        const currentGroupParts = id.split('-');
        const currentGroupTimestamp = currentGroupParts[3] || currentGroupParts[2];
        
        // Check if this event is for an element in the same group
        const eventGroupParts = elementId.split('-');
        const eventGroupTimestamp = eventGroupParts[3] || eventGroupParts[2];
        const isSameGroup = currentGroupTimestamp === eventGroupTimestamp;

        // 🎯 FIXED: Update own value if this is for current element
        if (id === elementId && elementType === type) {
          setLocalValue(value);
        }

        // 🎯 FIXED: Update sync state for group coordination - only for same group
        if (isSameGroup && groupTimestamp) {
          setDateElementsSync(prev => ({
            ...prev,
            [elementType]: value,
            groupTimestamp,
            format: dateContext?.format || prev.format,
          }));

          // 🎯 FIXED: Also update localValue if this event is for the current element type
          // This ensures that when we save from modal, all elements in the group get updated
          if (elementType === type) {
            setLocalValue(value);
          }
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
    }
  }, [id, type]);

  // ========== INPUT HANDLERS ==========
  const handleLocalInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (onValueChange) {
      const options =
        type === "checkbox"
          ? localCheckboxOptions
          : type === "radio"
          ? localRadioOptions
          : type === "select"
          ? localSelectOptions
          : undefined;
      onValueChange(newValue as string | string[] | boolean | number, options);
    }
  };

  const handleInputBlur = () => {
    if (onValueChange) {
      const options =
        type === "checkbox"
          ? localCheckboxOptions
          : type === "radio"
          ? localRadioOptions
          : type === "select"
          ? localSelectOptions
          : undefined;
      onValueChange(
        localValue as string | string[] | boolean | number,
        options
      );
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();

      // For date elements, also trigger save on Enter
      if (type === "days" || type === "months" || type === "years") {
        handleSaveEditModal();
      }
    } else if (e.key === "Escape") {
      // For date elements, close modal on Escape
      if (type === "days" || type === "months" || type === "years") {
        handleCloseEditModal();
      }
    }
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
  };

  // ========== CENTRALIZED MODAL HANDLERS ==========
  const modalConfig: ModalHandlersConfig = {
    id,
    type,
    localValue,
    setShowEditModal,
    setShowDateModal,
    setDateModalState,
    setDateElementsSync,
    setLocalValue,
    setActiveTab,
    textareaRef,
    signatureRef,
    signatureImageRef,
    lastEmittedSignatureRef,
    dateElementsSync,
    dateModalState,
    dateFormat,
    maxLength,
    activeTab,
    signatureData,
    stampData,
    localCheckboxOptions,
    localRadioOptions,
    localSelectOptions,
    onValueChange,
    getSignatureImage,
    getStampImage,
  };

  const {
    handleOpenDateModal,
    handleCloseDateModal,
    handleSaveDateModal,
    handleDateStateChange,
    handleOpenEditModal,
    handleCloseEditModal,
    handleSaveEditModal,
  } = createModalHandlers(modalConfig);

  // ========== COMPUTED VALUES ==========
  const isUserEditingInModal = useMemo(() => {
    return isFrontend() && showEditModal;
  }, [showEditModal, isFrontend]);

  const isSignatureInDrawMode = useMemo(() => {
    return type === "signature" && showEditModal && activeTab === "drawSign";
  }, [type, showEditModal, activeTab]);

  const isStampInDrawMode = useMemo(() => {
    return type === "stamp" && showEditModal && activeTab === "drawSign";
  }, [type, showEditModal, activeTab]);

  // 🔧 **Separate useEffect for signature data loading**
  useEffect(() => {
    if (showEditModal && type === "signature") {
      const isGuest = sessionStorage.getItem("isGuest") === "true";
      console.log('isGuest =>',isGuest)
      // Only fetch signature data if user is not a guest
      if (!isGuest) {
        const loadSignatureData = async () => {
          // console.log('fetch signature data')
          try {
            dispatch(get_all_user_sign())
              .unwrap()
              .then((response) => {
                // 🔧 **Safe API Response Handling**
                let signatureArray = [];

                if (Array.isArray(response)) {
                  // Response is already an array
                  signatureArray = response;
                } else if (response && typeof response === "object") {
                  // Response is an object - check common response patterns
                  if (Array.isArray(response.data)) {
                    signatureArray = response.data;
                  } else if (Array.isArray(response.result)) {
                    signatureArray = response.result;
                  } else if (Array.isArray(response.signatures)) {
                    signatureArray = response.signatures;
                  } else {
                    enqueueSnackbar(
                      `🎯 [Signature] Unknown API response structure: ${response}`,
                      {
                        variant: "warning",
                        autoHideDuration: 3000,
                      }
                    );
                    signatureArray = [];
                  }
                } else {
                  enqueueSnackbar(
                    `🎯 [Signature] Invalid API response type: ${typeof response}`,
                    {
                      variant: "warning",
                      autoHideDuration: 3000,
                    }
                  );
                  signatureArray = [];
                }
                setSignatureData(signatureArray);
                setLocalValue(
                  signatureArray.length > 0
                    ? signatureArray[0].stamp_name
                    : "เลือกชื่อลายเซ็น"
                );
              })
              .catch((error: Error) => {
                enqueueSnackbar(`🎯 [Signature] API Error: ${error}`, {
                  variant: "error",
                  autoHideDuration: 3000,
                });
                setSignatureData([]);
              });
          } catch (error) {
            enqueueSnackbar(`🎯 [Signature] Unexpected error: ${error}`, {
              variant: "error",
              autoHideDuration: 3000,
            });
            setSignatureData([]);
          }
        };
        loadSignatureData();
      } else {
        // If guest, set empty array and default value
        setSignatureData([]);
        setLocalValue("เลือกชื่อลายเซ็น");
      }
    }
  }, [showEditModal, type, dispatch]);

  // 🔧 **Separate useEffect for stamp data loading**
  useEffect(() => {
    if (showEditModal && type === "stamp") {
      const loadStampData = async () => {
        console.log('fetch stamp data 222222222')
        try {
          dispatch(get_all_user_sign())
            .unwrap()
            .then((response) => {
              // 🔧 **Safe API Response Handling**
              let stampArray = [];

              if (Array.isArray(response)) {
                // Response is already an array
                stampArray = response;
              } else if (response && typeof response === "object") {
                // Response is an object - check common response patterns
                if (Array.isArray(response.data)) {
                  stampArray = response.data;
                } else if (Array.isArray(response.result)) {
                  stampArray = response.result;
                } else if (Array.isArray(response.stamps)) {
                  stampArray = response.stamps;
                } else {
                  enqueueSnackbar(
                    `🎯 [Stamp] Unknown API response structure: ${response}`,
                    {
                      variant: "warning",
                      autoHideDuration: 3000,
                    }
                  );
                  stampArray = [];
                }
              } else {
                enqueueSnackbar(
                  `🎯 [Stamp] Invalid API response type: ${typeof response}`,
                  {
                    variant: "warning",
                    autoHideDuration: 3000,
                  }
                );
                stampArray = [];
              }
              setStampData(stampArray);
              setLocalValue(
                stampArray.length > 0
                  ? stampArray[0].stamp_name
                  : "เลือกชื่อตราประทับ"
              );
            })
            .catch((error: Error) => {
              enqueueSnackbar(`🎯 [Stamp] API Error: ${error}`, {
                variant: "error",
                autoHideDuration: 3000,
              });
              setStampData([]);
            });
        } catch (error) {
          enqueueSnackbar(`🎯 [Stamp] Unexpected error: ${error}`, {
            variant: "error",
            autoHideDuration: 3000,
          });
          setStampData([]);
        }
      };
      loadStampData();
    }
  }, [showEditModal, type, dispatch]);
  const viewportWidth = windowWidth;
  const isMobileViewport = viewportWidth <= 640;
  const isTabletViewport = viewportWidth > 640 && viewportWidth <= 1024;
  const memoizedSignatureCanvas = useMemo(() => {
    if (activeTab !== "drawSign") return null;

    const modalWidth = (() => {
      if (isMobileViewport) {
        return Math.min(Math.max(viewportWidth - 32, 240), 360);
      }
      if (isTabletViewport) {
        return Math.min(Math.max(viewportWidth * 0.6, 320), 420);
      }
      return 390;
    })();

    const horizontalPadding = isMobileViewport ? 24 : 40;
    const canvasWidth = Math.max(modalWidth - horizontalPadding, 220);
    const maxCanvasHeight = isMobileViewport ? 140 : 150;
    const canvasHeight = Math.min(canvasWidth * 0.4, maxCanvasHeight);

    return (
      <div className="mb-4">
        <SignatureCanvas
          penColor="blue"
          backgroundColor="rgba(255,255,255,0)"
          canvasProps={{
            width: canvasWidth,
            height: canvasHeight,
            className: "signature-canvas",
            style: {
              backgroundColor: "#f5f5f5",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
              maxWidth: "100%",
            },
          }}
          ref={signatureRef}
          onBegin={() => {
            isSignatureInteracting.current = true;
          }}
          onEnd={() => {
            setTimeout(() => {
              isSignatureInteracting.current = false;
            }, 100);
          }}
        />
      </div>
    );
  }, [activeTab, isMobileViewport, isTabletViewport, viewportWidth]);

  const ResizeHandlesComponent: React.FC = () => {
    return (
      <ResizeHandles
        isSelected={isSelected}
        isInputFocused={isInputFocused}
        isUserEditingInModal={isUserEditingInModal}
        isFrontend={isFrontend}
        handleResizeStart={handleResizeStart}
        documentType={documentType} // 🎯 NEW: Pass documentType prop for template mode
      />
    );
  };

  // ========== STYLE MANAGEMENT ==========
  const consolidatedStyles = useMemo((): ConsolidatedStyles => {
    const styleConfig: StyleManagementConfig = {
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
      isStampInDrawMode,
      isSignatureInteracting: isSignatureInteracting.current,
      onComputedStylesChange,
      lastComputedStylesRef,
    };

    return createConsolidatedStyles(styleConfig);
  }, [
    adjustedPosition?.x,
    adjustedPosition?.y,
    parentScale,
    isDragging,
    isSelected,
    transform,
    type,
    isInputFocused,
    isResizing,
    elementSize.width,
    elementSize.height,
    isUserEditingInModal,
    isSignatureInDrawMode,
    isStampInDrawMode,
    elementStyle.fontFamily,
    elementStyle.fontSize,
    elementStyle.fontWeight,
    elementStyle.fontStyle,
    elementStyle.textDecoration,
    elementStyle.textAlign,
    elementStyle.justifyContent,
    elementStyle.color,
    elementStyle.backgroundColor,
    elementStyle.borderColor,
    elementStyle.borderWidth,
    elementStyle.borderStyle,
    elementStyle.borderRadius,
    elementStyle.padding,
    elementStyle.margin,
    elementStyle.width,
    elementStyle.height,
  ]);

  const handleElementClick = () => {
    if (isUserEditingInModal) {
      return;
    }

    if (onSelect) {
      onSelect();
    }
  };

  const formHandle = useMemo(() => {
    return (
      <FormHandle
        id={id}
        type={type}
        hasEditPermission={hasEditPermission}
        isUserEditingInModal={isUserEditingInModal}
        onConfigClick={onConfigClick}
        onLayerDelete={onLayerDelete}
        onLayerDuplicate={onLayerDuplicate}
        setShowConfig={setShowConfig}
        attributes={attributes}
        listeners={listeners}
        documentType={documentType} // 🎯 NEW: Pass documentType prop for template mode
      />
    );
  }, [
    attributes,
    listeners,
    onConfigClick,
    onLayerDelete,
    onLayerDuplicate,
    hasEditPermission,
    isUserEditingInModal,
    id,
    type,
    setShowConfig,
    documentType, // 🎯 NEW: Add documentType to dependencies
  ]);

  // 🎯 CENTRALIZED: Create FormElementWrapper props
  const formElementWrapperProps: FormElementWrapperProps = {
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
    documentType, // 🎯 NEW: Pass documentType prop for template mode
  };

  const FormElementWrapperComponent = useMemo(() => {
    return ({ children }: { children: React.ReactNode }) => (
      <FormElementWrapper {...formElementWrapperProps}>
        {children}
      </FormElementWrapper>
    );
  }, [formElementWrapperProps]);

  switch (type) {
    case "text":
      return (
        <FormElementWrapperComponent>
          <div
            id={id}
            data-coordinates={JSON.stringify(coordinatesData)}
            onClick={isFrontend() ? handleOpenEditModal : undefined}
            style={consolidatedStyles.inputContent}
          >
            {localValue !== null &&
            localValue !== undefined &&
            String(localValue).trim() !== ""
              ? String(localValue)
              : placeholder || CONFIG_CONSTANTS.TEXT_PLACEHOLDER}
          </div>

          {/* Edit Modal - แสดงเฉพาะใน Frontend */}
          {isFrontend() && (
            <Modal
              title="แก้ไขข้อมูล"
              open={showEditModal}
              onOk={handleSaveEditModal}
              onCancel={handleCloseEditModal}
              okText="บันทึก"
              cancelText="ยกเลิก"
              style={{
                width: "100%",
              }}
              maskClosable={false}
              centered
            >
              <textarea
                ref={textareaRef}
                defaultValue={String(localValue || "")}
                placeholder={placeholder || CONFIG_CONSTANTS.TEXT_PLACEHOLDER}
                className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none"
                maxLength={maxLength}
                autoFocus
              />
              {maxLength && (
                <div className="text-xs text-gray-500">
                  <span className="text-count" id={`text-count-${id}`}>
                    {String(localValue || "").length}
                  </span>
                  /{maxLength}
                </div>
              )}
            </Modal>
          )}
        </FormElementWrapperComponent>
      );
    case "signature":
      return (
        <FormElementWrapperComponent>
          <div
            id={id}
            data-coordinates={JSON.stringify(coordinates)}
            onClick={isFrontend() ? handleOpenEditModal : undefined}
            style={{
              ...consolidatedStyles.inputContent,
              backgroundColor: hasSignatureImage()
                ? "transparent"
                : consolidatedStyles.inputContent.backgroundColor,
              overflow: "hidden",
            }}
          >
            {!hasSignatureImage() && (
              <div
                className={`w-full h-full flex items-center justify-center border-2 border-dashed border-[${elementStyle.borderColor}] rounded-md w-[${elementSize.width}px] h-[${elementSize.height}px]`}
              >
                  {label || `คนที่ ${Number(id?.split('-')[2]) + 1 || '1'}`}
              </div>
            )}
            {hasSignatureImage() && (
              <div className="w-full h-full flex items-center justify-center">
                <Image
                  src={getSignatureImage() || ""}
                  alt="Signature"
                  width={elementSize.width}
                  height={elementSize.height}
                  style={{
                    width: `${elementSize.width}px`,
                    height: `${elementSize.height}px`,
                    backgroundColor: "transparent",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}
          </div>
          {isFrontend() && (
            <Modal
              title={
                <div className="text-sm font-medium">
                  ลายเซ็น <span className="text-red-500">*</span>
                </div>
              }
              open={showEditModal}
              onCancel={handleCloseEditModal}
              onOk={handleSaveEditModal}
              width={400}
              centered
              maskClosable={true}
              footer={[
                <button
                  key="cancel"
                  className="px-4 py-2 rounded text-sm border border-gray-300 hover:bg-gray-50"
                  onClick={handleCloseEditModal}
                >
                  ยกเลิก
                </button>,
                <button
                  key="save"
                  onClick={() => {
                    if (
                      !signatureRef.current?.isEmpty() &&
                      signatureRef.current
                    ) {
                      const dataURL = signatureRef.current.toDataURL();
                      signatureImageRef.current = dataURL;
                      forceUpdate((prev) => prev + 1);
                      handleSaveEditModal();
                    } else if (activeTab === "startSign") {
                      forceUpdate((prev) => prev + 1);
                      handleSaveEditModal();
                    }
                  }}
                  className={`ml-2 px-4 py-2 rounded text-sm ${
                    (activeTab === "drawSign" &&
                      localValue &&
                      localValue !== "") ||
                    (activeTab === "startSign" &&
                      localValue &&
                      localValue !== "เลือกชื่อลายเซ็น")
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  บันทึก
                </button>,
              ]}
            >
              <Tabs
                activeKey={activeTab}
                onChange={(key) =>
                  setActiveTab(key as "startSign" | "drawSign")
                }
                className="w-full"
                size="small"
                tabBarStyle={{
                  marginBottom: 16,
                }}
                items={[
                  {
                    key: "startSign",
                    label: "ลายเซ็นเริ่มต้น",
                    children: (
                      <>
                        <div className="text-sm mb-1">ชื่อลายเซ็น</div>
                        <Select
                          onChange={(selectedStampName: string) => {
                            setLocalValue(selectedStampName);

                            // อัพเดท signature image ทันทีเมื่อเลือกลายเซ็น
                            const selectedSignature = signatureData.find(
                              (item) => item.stamp_name === selectedStampName
                            );
                            if (selectedSignature?.sign_base64) {
                              signatureImageRef.current =
                                selectedSignature.sign_base64;
                              signatureInitializedRef.current = true;
                              // Force re-render เพื่อแสดงลายเซ็นใหม่
                              forceUpdate((prev) => prev + 1);
                            }

                            if (onValueChange) {
                              onValueChange(selectedStampName);
                            }
                          }}
                          value={
                            Array.isArray(signatureData)
                              ? signatureData.find(
                                  (item) => item.stamp_name === localValue
                                )?.stamp_name || ""
                              : ""
                          }
                          className="w-full mb-3"
                          disabled={signatureData.length === 0}
                          placeholder="เลือกชื่อลายเซ็น"
                          allowClear={false}
                        >
                          {Array.isArray(signatureData) &&
                            signatureData?.map((item, index) => (
                              <Select.Option
                                key={index}
                                value={item.stamp_name}
                              >
                                {item.stamp_name}
                              </Select.Option>
                            ))}
                        </Select>
                        {(!Array.isArray(signatureData) ||
                          signatureData.length === 0) && (
                          <div className="border border-gray-300 rounded bg-gray-100 p-4 text-center text-gray-400 text-sm mb-4">
                            ยังไม่มีลายเซ็น
                          </div>
                        )}
                        {Array.isArray(signatureData) &&
                          signatureData.length > 0 && (
                            <div
                              className={`${
                                localValue !== "เลือกชื่อลายเซ็น"
                                  ? " bg-gray-100"
                                  : ""
                              } text-gray-400 flex items-center justify-center border-gray-300 border rounded-xl text-sm mb-4"`}
                            >
                              <Image
                                src={
                                  signatureData.find(
                                    (item) => item.stamp_name === localValue
                                  )?.sign_base64 || NonSignatureIcon
                                }
                                alt="Signature"
                                className="w-full h-full object-contain"
                                width={200}
                                height={100}
                              />
                            </div>
                          )}
                      </>
                    ),
                  },
                  {
                    key: "drawSign",
                    label: "วาดลายเซ็น",
                    children: (
                      <>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm text-gray-600">
                            วาดลายเซ็นของคุณ
                          </span>
                          <button
                            onClick={() => {
                              if (signatureRef.current) {
                                signatureRef.current.clear();
                              }
                            }}
                            className="text-sm text-blue-500 hover:underline px-2 py-1 rounded hover:bg-blue-50"
                          >
                            ล้างค่า
                          </button>
                        </div>
                        {memoizedSignatureCanvas}
                      </>
                    ),
                  },
                ]}
              />
            </Modal>
          )}
        </FormElementWrapperComponent>
      );
    case "days":
      return (
        <DateElementWrapper
          id={id}
          elementType="days"
          coordinatesData={coordinatesData}
          consolidatedStyles={consolidatedStyles}
          onEditModal={handleOpenEditModal}
          onCloseEditModal={handleCloseEditModal}
          onSaveEditModal={handleSaveEditModal}
          showEditModal={showEditModal}
          isFrontend={isFrontend}
          FormElementWrapper={FormElementWrapperComponent}
          localValue={formatThaiDisplayValue(localValue)}
          dateFormat={dateFormat}
          showDateModal={showDateModal}
          dateModalState={dateModalState}
          onOpenDateModal={handleOpenDateModal}
          onCloseDateModal={handleCloseDateModal}
          onSaveDateModal={handleSaveDateModal}
          onDateStateChange={handleDateStateChange}
        >
          {localValue &&
          typeof localValue === "string" &&
          localValue.trim() !== ""
            ? formatThaiDisplayValue(localValue)
            : "DD"}
        </DateElementWrapper>
      );
    case "months":
      return (
        <DateElementWrapper
          id={id}
          elementType="months"
          coordinatesData={coordinatesData}
          consolidatedStyles={consolidatedStyles}
          onEditModal={handleOpenEditModal}
          onCloseEditModal={handleCloseEditModal}
          onSaveEditModal={handleSaveEditModal}
          showEditModal={showEditModal}
          isFrontend={isFrontend}
          FormElementWrapper={FormElementWrapperComponent}
          localValue={formatThaiDisplayValue(localValue)}
          dateFormat={dateFormat}
          showDateModal={showDateModal}
          dateModalState={dateModalState}
          onOpenDateModal={handleOpenDateModal}
          onCloseDateModal={handleCloseDateModal}
          onSaveDateModal={handleSaveDateModal}
          onDateStateChange={handleDateStateChange}
        >
          {localValue &&
          typeof localValue === "string" &&
          localValue.trim() !== ""
            ? formatThaiDisplayValue(localValue)
            : "MM"}
        </DateElementWrapper>
      );
    case "years":
      return (
        <DateElementWrapper
          id={id}
          elementType="years"
          coordinatesData={coordinatesData}
          consolidatedStyles={consolidatedStyles}
          onEditModal={handleOpenEditModal}
          onCloseEditModal={handleCloseEditModal}
          onSaveEditModal={handleSaveEditModal}
          showEditModal={showEditModal}
          isFrontend={isFrontend}
          FormElementWrapper={FormElementWrapperComponent}
          localValue={formatThaiDisplayValue(localValue)}
          dateFormat={dateFormat}
          showDateModal={showDateModal}
          dateModalState={dateModalState}
          onOpenDateModal={handleOpenDateModal}
          onCloseDateModal={handleCloseDateModal}
          onSaveDateModal={handleSaveDateModal}
          onDateStateChange={handleDateStateChange}
        >
          {localValue &&
          typeof localValue === "string" &&
          localValue.trim() !== ""
            ? formatThaiDisplayValue(localValue)
            : "YYYY"}
        </DateElementWrapper>
      );
    case "periodDate":
      return (
        <FormElementWrapperComponent>
          <div
            id={id}
            data-coordinates={JSON.stringify(coordinatesData)}
            data-date-time-type="periodDate"
            style={consolidatedStyles.inputContent}
            onClick={isFrontend() ? handleOpenEditModal : undefined}
          >
            <input
              id={`${id}-date`}
              type="text"
              className="w-full h-full border-none outline-none bg-transparent"
              title={label}
              placeholder={placeholder || CONFIG_CONSTANTS.DATE_PLACEHOLDER}
              value={(localValue as string) || ""}
              onChange={handleLocalInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              required={required}
              style={{ fontSize: "inherit", fontFamily: "inherit" }}
            />
          </div>
        </FormElementWrapperComponent>
      );
    case "select":
      return (
        <FormElementWrapperComponent>
          <div style={consolidatedStyles.inputContent}>
            <select
              id={`${id}-select`}
              className="w-full h-full border-none outline-none bg-transparent"
              value={(localValue as string) || ""}
              onChange={handleLocalInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              required={required}
              style={{ fontSize: "inherit", fontFamily: "inherit" }}
            >
              <option value="">
                {placeholder || CONFIG_CONSTANTS.SELECT_PLACEHOLDER}
              </option>
              {(localCheckboxOptions || []).map((option, index) => (
                <option key={`${id}-option-${index}`} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </FormElementWrapperComponent>
      );
    case "checkbox":
      return (
        <FormElementWrapperComponent>
          <div
            id={id}
            data-coordinates={JSON.stringify(coordinates)}
            style={{
              ...consolidatedStyles.inputContent,
              height: "auto",
              minHeight: consolidatedStyles.inputContent.height,
              maxHeight: "none",
              overflow: "visible",
            }}
          >
          <div className="flex items-center gap-2">
            <input
              id={`checkbox-input-${id}`}
              type="checkbox"
              className="w-[18px] h-[18px] text-blue-600 rounded"
              checked={Array.isArray(localValue) ? localValue.length > 0 : false}
              onChange={(e) => {
                const newValue = e.target.checked ? ["checked"] : [];
                setLocalValue(newValue);
                if (onValueChange) {
                  onValueChange(newValue, localCheckboxOptions);
                }
              }}
              style={{ fontSize: "inherit", fontFamily: "inherit" }}
            />
            <span style={{ fontSize: "inherit", fontFamily: "inherit" }}>
              {localCheckboxOptions?.[0] || ""}
            </span>
            </div>
          </div>
        </FormElementWrapperComponent>
      );
    case "radio":
      return (
        <FormElementWrapperComponent>
          <div
            id={id}
            data-coordinates={JSON.stringify(coordinates)}
            style={{
              ...consolidatedStyles.inputContent,
              height: "auto",
              minHeight: consolidatedStyles.inputContent.height,
              maxHeight: "none",
              overflow: "visible",
            }}
          >
            <div className="flex items-center gap-2">
            <input
              id={`radio-input-${id}`}
              type="radio"
              className="w-4 h-4 text-blue-600 rounded-full"
              checked={
                typeof localValue === "string" && 
                localRadioOptions?.includes(localValue as string)
              }
              onChange={(e) => {
                const optionName = localRadioOptions?.[0] || "";
                const newValue = e.target.checked ? optionName : "";
                setLocalValue(newValue);
                if (onValueChange) {
                  onValueChange(newValue, localRadioOptions);
                }
              }}
              name={`radio-group-${id.split('-').slice(0, -1).join('-')}`} // Group by parent ID
              style={{ fontSize: "inherit", fontFamily: "inherit" }}
            />
            <span style={{ fontSize: "inherit", fontFamily: "inherit" }}>
              {localRadioOptions?.[0] || ""}
            </span>
            </div>
          </div>
        </FormElementWrapperComponent>
      );
    case "stamp":
      // 🎯 NEW: Extract index from ID to determine stamp type
      const getStampType = (elementId: string): string => {
        // Extract index from ID pattern: stamp-{section}-{index}-{timestamp}
        const idParts = elementId.split('-');
        const indexPart = idParts[2]; // index is the 3rd part
        const index = parseInt(indexPart, 10);
        
        // index 0 = ต้นสัญญา, index 1 = คู่สัญญา
        return index === 0 ? "ต้นสัญญา" : "คู่สัญญา";
      };

      const stampType = getStampType(id);

      return (
        <FormElementWrapperComponent>
          <div
            id={id}
            data-coordinates={JSON.stringify(coordinates)}
            onClick={isFrontend() ? handleOpenEditModal : undefined}
            style={{
              ...consolidatedStyles.inputContent,
              backgroundColor: hasSignatureImage()
                ? "transparent"
                : consolidatedStyles.inputContent.backgroundColor,
              overflow: "hidden",
            }}
          >
            {!hasStampImage() && (
              <div
                className={`w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-[${elementStyle.borderColor}] rounded-md w-[${elementSize.width}px] h-[${elementSize.height}px]`}
              >
                <div className="text-sm font-medium mb-1">
                  ตราประทับ
                </div>
                <div className="text-xs">
                  ({stampType})
                </div>
              </div>
            )}
            {hasStampImage() && (
              <div className="w-full h-full flex items-center justify-center">
                <Image
                  src={getStampImage() || ""}
                  alt="Stamp"
                  width={elementSize.width}
                  height={elementSize.height}
                  style={{
                    width: `${elementSize.width}px`,
                    height: `${elementSize.height}px`,
                    backgroundColor: "transparent",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}
          </div>
          {isFrontend() && (
            <Modal
              title={
                <div className="text-sm font-medium">
                  ตราประทับ <span className="text-red-500">*</span>
                </div>
              }
              open={showEditModal}
              onCancel={handleCloseEditModal}
              onOk={handleSaveEditModal}
              width={400}
              centered
              maskClosable={true}
              footer={[
                <button
                  key="cancel"
                  className="px-4 py-2 rounded text-sm border border-gray-300 hover:bg-gray-50"
                  onClick={handleCloseEditModal}
                >
                  ยกเลิก
                </button>,
                <button
                  key="save"
                  onClick={() => {
                    if (
                      !signatureRef.current?.isEmpty() &&
                      signatureRef.current
                    ) {
                      const dataURL = signatureRef.current.toDataURL();
                      signatureImageRef.current = dataURL;
                      forceUpdate((prev) => prev + 1);
                      handleSaveEditModal();
                    } else if (activeTab === "startSign") {
                      forceUpdate((prev) => prev + 1);
                      handleSaveEditModal();
                    }
                  }}
                  className={`ml-2 px-4 py-2 rounded text-sm ${
                    (activeTab === "drawSign" &&
                      localValue &&
                      localValue !== "") ||
                    (activeTab === "startSign" &&
                      localValue &&
                      localValue !== "เลือกชื่อตราประทับ")
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  บันทึก
                </button>,
              ]}
            >
              <Tabs
                activeKey={activeTab}
                onChange={(key) =>
                  setActiveTab(key as "startSign" | "drawSign")
                }
                className="w-full"
                size="small"
                tabBarStyle={{
                  marginBottom: 16,
                }}
                items={[
                  {
                    key: "startSign",
                    label: "ตราประทับเริ่มต้น",
                    children: (
                      <>
                        <div className="text-sm mb-1">ชื่อตราประทับ</div>
                        <Select
                          onChange={(selectedStampName: string) => {
                            setLocalValue(selectedStampName);

                            // อัพเดท stamp image ทันทีเมื่อเลือกตราประทับ
                            const selectedStamp = stampData.find(
                              (item) => item.stamp_name === selectedStampName
                            );
                            if (selectedStamp?.sign_base64) {
                              signatureImageRef.current =
                                selectedStamp.sign_base64;
                              signatureInitializedRef.current = true;
                              // Force re-render เพื่อแสดงตราประทับใหม่
                              forceUpdate((prev) => prev + 1);
                            }

                            if (onValueChange) {
                              onValueChange(selectedStampName);
                            }
                          }}
                          value={
                            Array.isArray(stampData)
                              ? stampData.find(
                                  (item) => item.stamp_name === localValue
                                )?.stamp_name || ""
                              : ""
                          }
                          className="w-full mb-3"
                          disabled={stampData.length === 0}
                          placeholder="เลือกชื่อตราประทับ"
                          allowClear={false}
                        >
                          {Array.isArray(stampData) &&
                            stampData?.map((item, index) => (
                              <Select.Option
                                key={index}
                                value={item.stamp_name}
                              >
                                {item.stamp_name}
                              </Select.Option>
                            ))}
                        </Select>
                        {(!Array.isArray(stampData) ||
                          stampData.length === 0) && (
                          <div className="border border-gray-300 rounded bg-gray-100 p-4 text-center text-gray-400 text-sm mb-4">
                            ยังไม่มีตราประทับ
                          </div>
                        )}
                        {Array.isArray(stampData) &&
                          stampData.length > 0 && (
                            <div
                              className={`${
                                localValue !== "เลือกชื่อตราประทับ"
                                  ? " bg-gray-100"
                                  : ""
                              } text-gray-400 flex items-center justify-center border-gray-300 border rounded-xl text-sm mb-4"`}
                            >
                              <Image
                                src={
                                  stampData.find(
                                    (item) => item.stamp_name === localValue
                                  )?.sign_base64 || NonSignatureIcon
                                }
                                alt="Stamp"
                                className="w-full h-full object-contain"
                                width={200}
                                height={100}
                              />
                            </div>
                          )}
                      </>
                    ),
                  },
                  {
                    key: "drawSign",
                    label: "วาดตราประทับ",
                    children: (
                      <>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm text-gray-600">
                            วาดตราประทับของคุณ
                          </span>
                          <button
                            onClick={() => {
                              if (signatureRef.current) {
                                signatureRef.current.clear();
                              }
                            }}
                            className="text-sm text-blue-500 hover:underline px-2 py-1 rounded hover:bg-blue-50"
                          >
                            ล้างค่า
                          </button>
                        </div>
                        {memoizedSignatureCanvas}
                      </>
                    ),
                  },
                ]}
              />
            </Modal>
          )}
        </FormElementWrapperComponent>
      );
    default:
      return null;
  }
};