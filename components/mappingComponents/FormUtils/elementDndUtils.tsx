"use client";

import React, { useMemo, useCallback, useEffect } from "react";
import { DragStartEvent, DragEndEvent, DragMoveEvent } from "@dnd-kit/core";
import { FormElementConfigData } from "../FormComponents/FormElementConfig";
import { ElementStyle, FormItem } from "../../../store/types/FormTypes";
import { formElements } from "../FormComponents/FormSidebar";
import { DroppedElement } from "../FormComponents/FormCanvas.stable";
import { PageFormItems, updatePageObjects } from "./pdfFormManager";
import {
  calculateCenterPosition,
  calculateCenterPositionForPage,
  calculateAbsoluteCenterPositionForPage,
  calculatePositionFromMouseEvent,
  calculatePositionFromMouseEventWithPadding,
  calculatePositionFromMouseEventForPage,
  calculateDragPosition,
  calculatePdfDimensionsFromElement,
  calculatePdfDimensionsWithPadding,//
} from "./dimensionUtils";
// 🎯 CENTRALIZED: Import default style functions
import { getDefaultElementSize, BASE_DEFAULT_STYLE } from "./defaultStyle";
import {
  getPdfElements,
  getPdfElementsForPage,
  getBestPdfElement,
} from "../../../store/utils/pdfElementUtils";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  setIsDragging,
  setPdfDimensions,
  setActiveId as setReduxActiveId,
  setDraggedItemId as setReduxDraggedItemId,
  setActiveElementId as setReduxActiveElementId,
} from "../../../store/slices/canvasSlice";
import { useCanvasPositioning } from "../../../store/hooks/useCanvasPositioning";

// Interface for the element click handler
interface ElementClickData {
  id: string;
  type: string;
  label: string;
  actorId?: string;
  pageNumber?: number;
  dateTimeType?: string; // 🎯 NEW: Add support for dateTimeType
}

// Interface for element state management
interface ElementState {
  activeId: string | null;
  draggedItemId: string | null;
  activeElementId: string | null;
  currentPageItems: FormItem[];
  configElement: FormItem | null;
  pageNumber: number;
  stepIndex: string;
  scale: number;
  pdfDimensions: { width: number; height: number } | null;
  filteredCurrentPageItems: FormItem[];
  totalSteps?: number;
  maxStepIndex?: number;
  workflowSteps?: number;
  approversCount: number;
  showStylePanel: boolean; // 🎯 NEW: Add showStylePanel to ElementState
  docType?: string; // 🎯 NEW: Add docType to ElementState
}

// Interface for element state setters
interface ElementSetters {
  setActiveId: (id: string | null) => void;
  setDraggedItemId: (id: string | null) => void;
  setActiveElementId: (id: string | null) => void;
  setCurrentPageItems: (items: FormItem[]) => void;
  setPageFormItems: React.Dispatch<React.SetStateAction<PageFormItems>>;
  setConfigElement: (element: FormItem | null) => void;
  setShowStylePanel: (show: boolean) => void;
  setStepIndex: (index: string) => void;
}

// Interface for drag and drop handlers
export interface DragDropHandlers {
  handleDragStart: (event: DragStartEvent) => void;
  handleDragMove: (event: DragMoveEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleElementClick: (element: ElementClickData) => void;
}

// Interface for form item handlers
export interface FormItemHandlers {
  handleFormItemValueChange: (
    id: string,
    newValue: string | string[] | boolean | number,
    options?: string[] // เปลี่ยนจาก checkboxOptions เป็น options ทั่วไป
  ) => void;
  handleFormElementConfig: (
    itemId: string,
    configData: FormElementConfigData
  ) => void;
  handleOpenConfigPanel: (item: FormItem) => void;
  handleCloseConfigPanel: () => void;
  handleLayerSelect: (item: FormItem) => void;
  handleStyleUpdate: (style: ElementStyle) => void;
  handleLayerDelete: (itemId: string) => void;
  handleLayerDuplicate: (itemId: string) => void; // Add duplicate handler
  handleGroupedDelete: (itemIds: string[]) => void; // Add grouped delete handler
}

// Interface for rendered content
export interface RenderedContent {
  activeElement: any;
  formItemsContent: React.ReactNode;
  dragOverlayContent: React.ReactNode;
  emptyCanvasContent: React.ReactNode;
  createFormItemsForPage: (
    targetPageNumber: number,
    allPageItems: FormItem[],
    isInteractive?: boolean,
    stepIndexFilter?: string,
    onCoordinatesUpdate?: (
      elementId: string,
      coordinates: { llx: number; lly: number; urx: number; ury: number }
    ) => void
  ) => React.ReactNode[];
}

// Custom hook for drag and drop functionality
export function useDragDropHandlers(
  state: ElementState,
  setters: ElementSetters,
  pdfFormAreaRef: React.RefObject<HTMLDivElement | null>
): DragDropHandlers {
  const dispatch = useAppDispatch();
  const canvasState = useAppSelector((state) => state.canvas);
  // 🎯 POSITIONING: Use Redux positioning hook
  const positioning = useCanvasPositioning();

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const activeIdString = active.id as string;

      // 🎯 POSITIONING: Sync to both local state (backward compat) and Redux
      setters.setActiveId(activeIdString);
      positioning.setActiveId(activeIdString);

      // 🎯 FIXED: Don't set isDragging immediately - wait for actual drag movement
      // dispatch(setIsDragging(true));

      // Only set draggedItemId for dropped elements, not sidebar elements
      if (activeIdString.startsWith("dropped-")) {
        const draggedId = activeIdString.replace("dropped-", "");
        // 🎯 POSITIONING: Sync to both local state and Redux
        setters.setDraggedItemId(draggedId);
        dispatch(setReduxDraggedItemId(draggedId));
      }
    },
    [setters, dispatch, positioning]
  );

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      // 🎯 BROWSER-LIKE ZOOM: Set isDragging only when actual drag movement occurs
      // Don't force overflow: hidden on canvas to allow zoom scrolling
      if (!canvasState.isDragging) {
        dispatch(setIsDragging(true));

        // 🎯 BROWSER-LIKE ZOOM: Only prevent body scrolling during drag
        // Don't touch canvas overflow as it's managed by zoom system
        document.body.style.overflow = "hidden";
      }
    },
    [dispatch, canvasState.isDragging]
  );

  const handleElementClick = useCallback(
    (element: ElementClickData) => {
      // 🎯 NEW: Use centralized PDF element utilities
      const pdfElements = getPdfElementsForPage(state.pageNumber);
      const pdfContainer = getBestPdfElement(pdfElements);

      // Always prefer using the ref over querySelector
      let pdfArea = pdfFormAreaRef.current;
      let dimensions = state.pdfDimensions || canvasState.pdfDimensions;

      if (!dimensions && pdfContainer) {
        if (pdfArea && pdfContainer) {
          const dimsWithPadding = calculatePdfDimensionsWithPadding(
            pdfContainer,
            pdfArea,
            state.scale
          );
          dimensions = {
            width: dimsWithPadding.width,
            height: dimsWithPadding.height,
          };
        } else {
          dimensions = calculatePdfDimensionsFromElement(
            pdfContainer,
            state.scale
          );
        }

        // 🎯 NEW: Update PDF dimensions in Redux store
        if (dimensions) {
          dispatch(setPdfDimensions(dimensions));
        }
      }

      if (!pdfArea && pdfContainer) {
        pdfArea = document.querySelector(".react-pdf__Document");
      }

      if (!dimensions || !pdfArea) {
        return;
      }

      // 🎯 NEW: Use page-specific center position for multi-page view
      let centerPosition = calculateCenterPositionForPage(
        state.pageNumber,
        state.scale
      );

      // Fallback to old method if page-specific calculation fails
      if (!centerPosition) {
        centerPosition = calculateCenterPosition(dimensions);
      }

      const defaultSize = getDefaultElementSize(element.type);
      const defaultStyle = {
        ...BASE_DEFAULT_STYLE,
        width: defaultSize.width,
        height: defaultSize.height,
      };

      const createFormItem = (stepIdx: string): FormItem => {
        // 🎯 NEW: Handle date type with special configuration
        let finalStyle = defaultStyle;
        let finalConfig = {
          maxLength:
            element.type === "text" || element.type === "textarea"
              ? 100
              : undefined,
          required: false,
          placeholder: "",
        };

        // Special handling for date type
        if (element.type === "date") {
          finalStyle = {
            ...defaultStyle,
            width: 50, // Individual width for each date input
            height: 30, // Height for date inputs
          };
          finalConfig = {
            maxLength: 2, // Default maxLength for date inputs
            required: false,
            placeholder: "DD",
          };
        }

        const newItem = {
          id: `${element.id}-${Date.now()}-${stepIdx}`,
          type: element.type,
          label: element.label,
          position: centerPosition,
          // 🎯 FIXED: For stamp elements, don't use step_index to show in all stepIndex
          ...(element.type === "stamp"
            ? {}
            : {
                step_index: stepIdx,
                actorId: stepIdx,
              }),
          pageNumber: state.pageNumber,
          style: finalStyle,
          checkboxOptions:
            element.type === "checkbox" ? ["ตัวเลือกที่ 1"] : undefined,
          radioOptions:
            element.type === "radio" ? ["ตัวเลือกที่ 1"] : undefined,
          selectOptions:
            element.type === "select" ? ["ตัวเลือกที่ 1"] : undefined,
          value: element.type === "checkbox" ? [] : "",
          config: finalConfig,
        };

        return newItem;
      };

      // 🎯 NEW: Handle date elements with dateTimeType === "date"
      let newItems: FormItem[] = [];

      // 🎯 NEW: Create three separate date elements for independent handling
      if (element.type === "date" && (element as any).dateTimeType === "date") {
        const baseId = element.id;
        const timestamp = Date.now();

        if (state.stepIndex === "all") {
          // 🎯 FIXED: Create date elements for ALL steps when stepIndex === "all"
          const totalSteps = state.approversCount;

          for (let i = 0; i < totalSteps; i++) {
            const stepIdx = i.toString();

            // Days element for this step
            const daysItem: FormItem = {
              id: `${baseId}-days-${timestamp}-${stepIdx}`,
              type: "days",
              label: "Days",
              position: { ...centerPosition },
              step_index: stepIdx,
              pageNumber: state.pageNumber,
              actorId: stepIdx,
              style: { ...defaultStyle, width: 50, height: 30 },
              value: "",
              config: {
                maxLength: 2,
                required: false,
                placeholder: "DD",
              },
              dateTimeType: "date",
            };

            // Months element for this step - positioned to the right of days
            const monthsItem: FormItem = {
              id: `${baseId}-months-${timestamp}-${stepIdx}`,
              type: "months",
              label: "Months",
              position: {
                x: centerPosition.x + 60, // 50px width + 10px gap
                y: centerPosition.y,
              },
              step_index: stepIdx,
              pageNumber: state.pageNumber,
              actorId: stepIdx,
              style: { ...defaultStyle, width: 50, height: 30 },
              value: "",
              config: {
                maxLength: 2,
                required: false,
                placeholder: "MM",
              },
              dateTimeType: "date",
            };

            // Years element for this step - positioned to the right of months
            const yearsItem: FormItem = {
              id: `${baseId}-years-${timestamp}-${stepIdx}`,
              type: "years",
              label: "Years",
              position: {
                x: centerPosition.x + 120, // (50px + 10px) * 2
                y: centerPosition.y,
              },
              step_index: stepIdx,
              pageNumber: state.pageNumber,
              actorId: stepIdx,
              style: { ...defaultStyle, width: 50, height: 30 },
              value: "",
              config: {
                maxLength: 4,
                required: false,
                placeholder: "YYYY",
              },
              dateTimeType: "date",
            };

            // Add all three date elements for this step
            newItems.push(daysItem, monthsItem, yearsItem);
          }
        } else {
          // For specific step index, create date elements for that step only
          const stepIdx = state.stepIndex;

          // Days element
          const daysItem: FormItem = {
            id: `${baseId}-days-${timestamp}-${stepIdx}`,
            type: "days",
            label: "Days",
            position: { ...centerPosition },
            step_index: stepIdx,
            pageNumber: state.pageNumber,
            actorId: stepIdx,
            style: { ...defaultStyle, width: 50, height: 30 },
            value: "",
            config: {
              maxLength: 2,
              required: false,
              placeholder: "DD",
            },
            dateTimeType: "date",
          };

          // Months element - positioned to the right of days
          const monthsItem: FormItem = {
            id: `${baseId}-months-${timestamp}-${stepIdx}`,
            type: "months",
            label: "Months",
            position: {
              x: centerPosition.x + 60, // 50px width + 10px gap
              y: centerPosition.y,
            },
            step_index: stepIdx,
            pageNumber: state.pageNumber,
            actorId: stepIdx,
            style: { ...defaultStyle, width: 50, height: 30 },
            value: "",
            config: {
              maxLength: 2,
              required: false,
              placeholder: "MM",
            },
            dateTimeType: "date",
          };

          // Years element - positioned to the right of months
          const yearsItem: FormItem = {
            id: `${baseId}-years-${timestamp}-${stepIdx}`,
            type: "years",
            label: "Years",
            position: {
              x: centerPosition.x + 120, // (50px + 10px) * 2
              y: centerPosition.y,
            },
            step_index: stepIdx,
            pageNumber: state.pageNumber,
            actorId: stepIdx,
            style: { ...defaultStyle, width: 50, height: 30 },
            value: "",
            config: {
              maxLength: 4,
              required: false,
              placeholder: "YYYY",
            },
            dateTimeType: "date",
          };

          newItems = [daysItem, monthsItem, yearsItem];
        }
      } else if (element.type === "checkbox" || element.type === "radio") {
        // 🎯 NEW: Handle checkbox and radio elements with grouping
        const baseId = element.id;
        const currentTime = Date.now();

        // Check if this is adding a new option to existing group (from FormElementConfig)
        // Pattern: checkbox-input-1757388338121-0 (parent group without option index)
        const existingGroupPattern = /^(checkbox|radio)-input-(\d+)-(\d+)$/;
        const isAddingToExistingGroup = existingGroupPattern.test(baseId);

        if (isAddingToExistingGroup) {
          // Adding new option to existing group
          const [, elementType, timestamp, stepIdx] =
            baseId.match(existingGroupPattern) || [];

          if (elementType && timestamp && stepIdx) {
            // Find the next available option index for this group
            const parentId = `${elementType}-input-${timestamp}-${stepIdx}`;
            const existingOptions = state.currentPageItems.filter(
              (item) =>
                item.parentId === parentId ||
                (item.id.startsWith(
                  `${elementType}-input-${timestamp}-${stepIdx}`
                ) &&
                  item.type === elementType)
            );

            // 🎯 FIX: Find max optionIndex + 1 to prevent duplicate IDs
            const existingIndexes = existingOptions
              .map((item) => item.optionIndex || 0)
              .filter((index) => typeof index === "number");

            const nextOptionIndex =
              existingIndexes.length === 0
                ? 0
                : Math.max(...existingIndexes) + 1;

            // Calculate position offset for new option (below the last one)
            const positionOffset = nextOptionIndex * 40; // 40px spacing between options

            // Create new option element with updated ID pattern
            const optionItem: FormItem = {
              id: `${elementType}-input-${timestamp}-${stepIdx}-${nextOptionIndex}`,
              type: elementType, // "checkbox" or "radio"
              label: "", // No label for individual options
              position: {
                x: centerPosition.x,
                y: centerPosition.y + positionOffset,
              },
              step_index: stepIdx,
              pageNumber: state.pageNumber,
              actorId: stepIdx,
              style: { ...defaultStyle },
              value: elementType === "checkbox" ? [] : "",
              checkboxOptions:
                elementType === "checkbox"
                  ? [`ตัวเลือกที่ ${nextOptionIndex + 1}`]
                  : undefined,
              radioOptions:
                elementType === "radio"
                  ? [`ตัวเลือกที่ ${nextOptionIndex + 1}`]
                  : undefined,
              config: {
                required: false,
                placeholder: "",
              },
              parentId: parentId,
              optionIndex: nextOptionIndex,
            };

            newItems = [optionItem];
          }
        } else {
          // Creating new checkbox/radio group (from sidebar)
          const timestamp = currentTime;

          if (state.stepIndex === "all") {
            // Create checkbox/radio option elements for ALL steps when stepIndex === "all"
            const totalSteps = state.approversCount;

            for (let i = 0; i < totalSteps; i++) {
              const stepIdx = i.toString();

              // Create first option element for this step with updated ID pattern
              const optionItem: FormItem = {
                id: `${baseId}-input-${timestamp}-${stepIdx}-0`, // First option (index 0)
                type: element.type, // "checkbox" or "radio"
                label: element.label || "", // Use original label or empty
                position: { ...centerPosition },
                step_index: stepIdx,
                pageNumber: state.pageNumber,
                actorId: stepIdx,
                style: { ...defaultStyle },
                value: element.type === "checkbox" ? [] : "",
                checkboxOptions:
                  element.type === "checkbox" ? ["ตัวเลือกที่ 1"] : undefined,
                radioOptions:
                  element.type === "radio" ? ["ตัวเลือกที่ 1"] : undefined,
                config: {
                  required: false,
                  placeholder: "",
                },
                parentId: `${baseId}-input-${timestamp}-${stepIdx}`, // Reference to parent group
                optionIndex: 0, // Index within the group
              };

              newItems.push(optionItem);
            }
          } else {
            // For specific step index, create checkbox/radio option element for that step only
            const stepIdx = state.stepIndex;

            // Create first option element with updated ID pattern
            const optionItem: FormItem = {
              id: `${baseId}-input-${timestamp}-${stepIdx}-0`, // First option (index 0)
              type: element.type, // "checkbox" or "radio"
              label: element.label || "", // Use original label or empty
              position: { ...centerPosition },
              step_index: stepIdx,
              pageNumber: state.pageNumber,
              actorId: stepIdx,
              style: { ...defaultStyle },
              value: element.type === "checkbox" ? [] : "",
              checkboxOptions:
                element.type === "checkbox" ? ["ตัวเลือกที่ 1"] : undefined,
              radioOptions:
                element.type === "radio" ? ["ตัวเลือกที่ 1"] : undefined,
              config: {
                required: false,
                placeholder: "",
              },
              parentId: `${baseId}-input-${timestamp}-${stepIdx}`, // Reference to parent group
              optionIndex: 0, // Index within the group
            };

            newItems = [optionItem];
          }
        }
      } else if (element.type === "stamp") {
        // Determine section from element ID or use default
        let targetSection = "มาตรา 9"; // Default section

        // Extract section from element ID if it contains section info
        if (element.id.includes("มาตรา")) {
          if (element.id.includes("มาตรา 9")) {
            targetSection = "มาตรา 9";
          } else if (element.id.includes("มาตรา 26 และมาตรา 28")) {
            targetSection = "มาตรา 26 และมาตรา 28";
          }
        }

        // Determine how many stamp elements to create based on section and docType
        let maxStamps = 0;
        if (targetSection === "มาตรา 9") {
          // มาตรา 9: มีได้แค่ 1 คน (ต้นสัญญา) - fixed for both b2b and b2c
          maxStamps = 1;
        } else if (targetSection === "มาตรา 26 และมาตรา 28") {
          if (state.docType === "b2b") {
            // B2B: มี 2 คน (ต้นสัญญา กับ คู่สัญญา) - fixed
            maxStamps = 2;
          } else {
            // B2C: มี 1 คน (ต้นสัญญา) - fixed
            maxStamps = 1;
          }
        }

        if (state.docType === "b2b" && targetSection === "มาตรา 9") {
          const i = element.label.includes("ต้นสัญญา") ? 0 : 1;
          const timestamp = Date.now();
          const label = i === 0 ? "ต้นสัญญา" : "คู่สัญญา";
          const newItem: FormItem = {
            id: `stamp-${targetSection}-${i}-${timestamp}`,
            type: "stamp",
            label: `Stamp - ${label}`,
            position: centerPosition,
            pageNumber: state.pageNumber,
            section: targetSection,
            style: defaultStyle,
            value: "", // Initialize empty value for stamp
            config: {
              required: false,
              placeholder: "",
            },
          };
          newItems.push(newItem);
        } else {
        for (let i = 0; i < maxStamps; i++) {
          const label = i === 0 ? "ต้นสัญญา" : "คู่สัญญา";
          const timestamp = Date.now();

          const newItem: FormItem = {
            id: `stamp-${targetSection}-${i}-${timestamp}`,
            type: "stamp",
            label: `Stamp - ${label}`,
            position: centerPosition,
            // 🎯 FIXED: For stamp elements, don't use step_index to show in all stepIndex
            pageNumber: state.pageNumber,
            section: targetSection,
            style: defaultStyle,
            value: "", // Initialize empty value for stamp
            config: {
              required: false,
              placeholder: "",
            },
          };

          newItems.push(newItem);
        }
      }
      } else if (state.stepIndex === "all") {
        // Use approversCount from userSettings
        const totalSteps = state.approversCount;

        // When stepIndex === "all", create elements for each approver
        // Each element will have the same base ID but different step_index
        for (let i = 0; i < totalSteps; i++) {
          const newItem = createFormItem(i.toString());
          newItems.push(newItem);
        }
      } else {
        // For specific step index, create single item
        const newItem = createFormItem(state.stepIndex);
        newItems = [newItem];
      }

      const updatedItems = [...state.currentPageItems, ...newItems];

      // 🎯 POSITIONING: Sync to both local state and Redux
      setters.setCurrentPageItems(updatedItems);
      positioning.addPageItems(state.pageNumber, newItems as any);

      setters.setPageFormItems((prevPageItems) =>
        updatePageObjects(state.pageNumber, updatedItems, prevPageItems)
      );

      // 🎯 FIXED: Add a small delay to ensure elements are mounted before coordinate calculations
      setTimeout(() => {
        // Force a re-render to ensure elements are in the DOM
        setters.setCurrentPageItems([...updatedItems]);
      }, 50);
    },
    [
      state.pdfDimensions,
      pdfFormAreaRef,
      state.pageNumber,
      state.currentPageItems,
      state.scale,
      state.stepIndex,
      state.totalSteps,
      state.maxStepIndex,
      state.workflowSteps,
      state.approversCount,
      setters,
      dispatch,
      canvasState.pdfDimensions,
      positioning,
    ]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over, delta } = event;

      // 🎯 POSITIONING: Clear active ID in both local state and Redux
      setters.setActiveId(null);
      positioning.setActiveId(null);

      // 🎯 BROWSER-LIKE ZOOM: Set isDragging to false in Redux store
      dispatch(setIsDragging(false));

      // 🎯 BROWSER-LIKE ZOOM: Only restore body scrolling
      // Don't touch canvas overflow as it's managed by zoom system
      document.body.style.overflow = "";

      // Case 1: Dragging from sidebar to canvas
      if (
        over &&
        over.id === "form-canvas" &&
        !active.id.toString().startsWith("dropped-")
      ) {
        // Find the dragged element from available elements
        const draggedElement = formElements.find(
          (item: { id: string; type: string; label: string }) =>
            item.id === active.id
        );

        if (draggedElement) {
          try {
            // Get the mouse position from the event
            const activatorEvent = event.activatorEvent as MouseEvent;

            // Always use the ref as primary source for the PDF area
            const pdfArea = pdfFormAreaRef.current;

            if (!pdfArea) {
              return;
            }

            // 🎯 NEW: Use centralized PDF element utilities
            const pdfElements = getPdfElementsForPage(state.pageNumber);
            const pdfElement = getBestPdfElement(pdfElements);

            let dropPosition;

            // 📊 DEBUG: ติดตาม drag & drop event
            //   pdfArea: pdfArea ? {
            //     left: pdfArea.getBoundingClientRect().left,
            //     top: pdfArea.getBoundingClientRect().top,
            //     width: pdfArea.getBoundingClientRect().width,
            //     height: pdfArea.getBoundingClientRect().height
            //   } : null,
            //   pdfElement: pdfElement ? {
            //     left: pdfElement.getBoundingClientRect().left,
            //     top: pdfElement.getBoundingClientRect().top,
            //     width: pdfElement.getBoundingClientRect().width,
            //     height: pdfElement.getBoundingClientRect().height
            //   } : null,
            //   scale: state.scale
            // });

            if (pdfElement) {
              // 🎯 FIXED: ใช้ฟังก์ชันใหม่สำหรับ multi-page view ที่คำนวณ relative to current page
              dropPosition = calculatePositionFromMouseEventForPage(
                activatorEvent,
                pdfElement,
                state.scale
              );
            } else {
              // ใช้ฟังก์ชันเดิมถ้าหา PDF element ไม่พบ
              dropPosition = calculatePositionFromMouseEvent(
                activatorEvent,
                pdfArea,
                state.scale
              );
            }

            // 🎯 CENTRALIZED: Get default size and style for the element type
            const defaultSize = getDefaultElementSize(draggedElement.type);
            const defaultStyle = {
              ...BASE_DEFAULT_STYLE,
              width: defaultSize.width,
              height: defaultSize.height,
            };

            // For "all" stepIndex, mark element as applicable to all approvers
            const elementStepIndex =
              state.stepIndex === "all" ? "all" : state.stepIndex;
            const elementActorId =
              state.stepIndex === "all" ? "all" : state.stepIndex;

            // Add a new item to the form with a unique ID
            const newFormItem: FormItem = {
              ...draggedElement,
              id: `${draggedElement.id}-${Date.now()}`,
              position: dropPosition,
              pageNumber: state.pageNumber,
              // 🎯 FIXED: For stamp elements, don't use step_index to show in all stepIndex
              ...(draggedElement.type === "stamp"
                ? {}
                : {
                    step_index: elementStepIndex,
                    actorId: elementActorId,
                  }),
              // 🎯 CENTRALIZED: Add default style to ensure consistent sizing
              style: defaultStyle,
              // Add stamp-specific properties
              ...(draggedElement.type === "stamp" && {
                value: "", // Initialize empty value for stamp
              }),
            };

            // 🎯 POSITIONING: Update both local state and Redux
            const updatedItems = [...state.currentPageItems, newFormItem];
            setters.setCurrentPageItems(updatedItems);
            positioning.addPageItem(state.pageNumber, newFormItem as any);

            // Update page form items
            setters.setPageFormItems((prevPageItems) =>
              updatePageObjects(state.pageNumber, updatedItems, prevPageItems)
            );
          } catch (error) {
            console.error("Error calculating drop position:", error);
          }
        }
      }

      // Case 2: Repositioning elements within the canvas
      if (active.id.toString().startsWith("dropped-")) {
        const originalId = active.id.toString().replace("dropped-", "");
        const draggedItem = state.currentPageItems.find(
          (item) => item.id === originalId
        );

        if (draggedItem) {
          // Calculate new position using dimensionUtils
          const newPosition = calculateDragPosition(
            draggedItem.position || { x: 0, y: 0 },
            delta,
            state.scale
          );

          // 🎯 POSITIONING: Update position in Redux
          positioning.updateItemPosition(
            originalId,
            newPosition,
            state.pageNumber
          );

          // Update the current page items
          const updatedItems = state.currentPageItems.map((item: FormItem) => {
            if (item.id === originalId) {
              return {
                ...item,
                position: newPosition,
              };
            }
            return item;
          });

          // Update current page items
          setters.setCurrentPageItems(updatedItems);

          // 🎯 NEW: For signature and stamp elements, update position ONLY on current page
          // This ensures each page's signature/stamp can have independent positioning
          if (
            draggedItem.type === "signature" ||
            draggedItem.type === "stamp"
          ) {
            setters.setPageFormItems((prevPageItems) => {
              const newPageItems = { ...prevPageItems };

              // First, update the current page with new position
              newPageItems[state.pageNumber] = updatedItems;
              return newPageItems;
            });
          } else {
            // For non-signature/stamp elements, use regular update
            setters.setPageFormItems((prevPageItems) =>
              updatePageObjects(state.pageNumber, updatedItems, prevPageItems)
            );
          }
        }
      }

      // 🎯 POSITIONING: Reset draggedItemId in both local state and Redux
      setters.setDraggedItemId(null);
      dispatch(setReduxDraggedItemId(null));
    },
    [
      state.pageNumber,
      state.currentPageItems,
      state.scale,
      setters,
      pdfFormAreaRef,
      dispatch,
      positioning,
    ]
  );

  return {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleElementClick,
  };
}

// Custom hook for form item handlers
export function useFormItemHandlers(
  state: ElementState,
  setters: ElementSetters,
  isSettingsMode: boolean
): FormItemHandlers {
  // 🎯 POSITIONING: Use Redux positioning hook
  const positioning = useCanvasPositioning();
  const dispatch = useAppDispatch();

  // 🎯 NEW: Add ESC key handler to cancel layer selection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle ESC key when an element is selected
      if (event.key === "Escape" && state.configElement) {
        event.preventDefault();
        event.stopPropagation();

        // 🎯 POSITIONING: Close config panel in both local state and Redux
        setters.setConfigElement(null);
        setters.setActiveElementId(null);
        setters.setShowStylePanel(false);
        positioning.setConfigElement(null);
        dispatch(setReduxActiveElementId(null));
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleKeyDown, true);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [state.configElement, setters, positioning, dispatch]);

  const handleFormItemValueChange = useCallback(
    (
      id: string,
      newValue: string | string[] | boolean | number,
      options?: string[] // เปลี่ยนจาก checkboxOptions เป็น options ทั่วไป
    ) => {
      // หา item เพื่อดู type
      const targetItem = state.currentPageItems.find((item) => item.id === id);

      // Create a new array with updated items to ensure state change
      const updatedItems = state.currentPageItems.map((item) =>
        item.id === id
          ? {
              ...item,
              value: newValue,
              // อัพเดท options ใน field ที่ถูกต้องตาม type
              ...(targetItem?.type === "checkbox" &&
                options && { checkboxOptions: options }),
              ...(targetItem?.type === "radio" &&
                options && { radioOptions: options }),
              ...(targetItem?.type === "select" &&
                options && { selectOptions: options }),
            }
          : item
      );

      // Update configElement if it's the same item
      const updatedConfigElement =
        state.configElement && state.configElement.id === id
          ? {
              ...state.configElement,
              value: newValue,
              // อัพเดท options ใน field ที่ถูกต้องตาม type
              ...(state.configElement.type === "checkbox" &&
                options && { checkboxOptions: options }),
              ...(state.configElement.type === "radio" &&
                options && { radioOptions: options }),
              ...(state.configElement.type === "select" &&
                options && { selectOptions: options }),
            }
          : state.configElement;

      // 🎯 POSITIONING: Update in Redux
      positioning.updatePageItem(
        id,
        {
          value: newValue,
          ...(targetItem?.type === "checkbox" &&
            options && { checkboxOptions: options }),
          ...(targetItem?.type === "radio" &&
            options && { radioOptions: options }),
          ...(targetItem?.type === "select" &&
            options && { selectOptions: options }),
        } as any,
        state.pageNumber
      );

      if (updatedConfigElement) {
        positioning.setConfigElement(updatedConfigElement as any);
      }

      // Update configElement first to ensure UI updates
      setters.setConfigElement(updatedConfigElement);

      // Update current page items
      setters.setCurrentPageItems(updatedItems);

      // 🎯 UPDATE PAGE ITEMS STATE
      // For signature elements, this will update the value across all pages
      // while maintaining independent positioning for each page
      setters.setPageFormItems((prevPageItems) =>
        updatePageObjects(state.pageNumber, updatedItems, prevPageItems)
      );
    },
    [
      state.configElement,
      state.currentPageItems,
      state.pageNumber,
      setters,
      positioning,
    ]
  );

  const handleFormElementConfig = useCallback(
    (itemId: string, configData: FormElementConfigData) => {
      // Find the item being updated
      const targetItem = state.currentPageItems.find(
        (item) => item.id === itemId
      );
      // Update the current page items with the new configuration
      const updatedItems = state.currentPageItems.map((item) => {
        if (item.id === itemId) {
          const updatedItem = {
            ...item,
            label: configData.label,
            // อัพเดท options ใน fields ที่ถูกต้อง
            checkboxOptions: configData.checkboxOptions || item.checkboxOptions,
            radioOptions: configData.radioOptions || item.radioOptions,
            selectOptions: configData.selectOptions || item.selectOptions,
            config: {
              ...(item.config || {}),
              maxLength: configData.maxLength,
              minLines: configData.minLines,
              required: configData.required,
              placeholder: configData.placeholder,
              ...(configData.date && { date: configData.date }),
            },
            // Add more-file specific properties
            ...(item.type === "more-file" && {
              maxFileSize: configData.maxFileSize,
              typeName: configData.typeName,
              isEmbedded: configData.isEmbedded,
              fileAccept: configData.fileAccept || [],
            }),
            // Add signature page configuration
            ...(item.type === "signature" && {
              pageNumber: state.pageNumber,
              pageNumbers: configData.pageNumbers,
            }),
            // Add stamp page configuration
            ...(item.type === "stamp" && {
              pageNumber: state.pageNumber,
              pageNumbers: configData.pageNumbers,
            }),
            // Add style updates (for resize and other style changes)
            ...(configData.style && {
              style: {
                ...(item.style || {}),
                ...configData.style,
              },
            }),
            // Add position updates (from resize operations)
            ...(configData.position && {
              position: configData.position,
            }),
          };

          return updatedItem;
        }
        return item;
      });

      // Update current page items
      setters.setCurrentPageItems(updatedItems);

      // For signature and stamp elements with pageNumbers, we need to update all pages in pageFormItems
      if (targetItem?.type === "signature" || targetItem?.type === "stamp") {
        setters.setPageFormItems((prevPageItems) => {
          const newPageItems = { ...prevPageItems };

          if (configData.pageNumbers && configData.pageNumbers.length > 0) {
            const sharedPageNumbers = [...configData.pageNumbers];

            // Specific pages selected - add/update signature in specified pages only
            sharedPageNumbers.forEach((pageNum) => {
              const normalizedPage = Number(pageNum) || 1;
              const pageItems = newPageItems[normalizedPage]
                ? [...newPageItems[normalizedPage]]
                : [];

              const existingIndex = pageItems.findIndex(
                (item) => item.id === itemId
              );

              const updatedSignature = updatedItems.find(
                (item) => item.id === itemId
              );

              if (updatedSignature) {
                const {
                  position: basePosition,
                  coordinates: baseCoordinates,
                  ...signatureWithoutPosition
                } = updatedSignature;

                const sharedUpdates = {
                  ...signatureWithoutPosition,
                  pageNumber: normalizedPage,
                  pageNumbers: sharedPageNumbers,
                };

                if (existingIndex >= 0) {
                  const existingItem = pageItems[existingIndex];
                  const updatedItemForPage = {
                    ...existingItem,
                    ...sharedUpdates,
                    position: existingItem.position,
                    coordinates: existingItem.coordinates,
                  };

                  const updatedPageItems = pageItems.map((item, index) =>
                    index === existingIndex ? updatedItemForPage : item
                  );

                  newPageItems[normalizedPage] = updatedPageItems;
                } else {
                  newPageItems[normalizedPage] = [
                    ...pageItems,
                    {
                      ...sharedUpdates,
                      position: basePosition,
                      coordinates: baseCoordinates,
                    },
                  ];
                }
              }
            });

            // 🎯 FIX: Remove signature from pages not in pageNumbers (including current page)
            Object.keys(newPageItems).forEach((pageKey) => {
              const pageNum = parseInt(pageKey);
              if (!configData.pageNumbers!.includes(pageNum)) {
                // 🎯 FIX: Create a new array copy to avoid mutating read-only arrays
                const pageItems = newPageItems[pageNum] ? [...newPageItems[pageNum]] : [];
                const filteredItems = pageItems.filter(
                  (item) => item.id !== itemId
                );
                if (filteredItems.length !== pageItems.length) {
                  newPageItems[pageNum] = filteredItems;
                }
              }
            });

            // 🎯 FIX: Update current page items to reflect the filtered items
            const currentPageItems = newPageItems[state.pageNumber] || [];
            setters.setCurrentPageItems(currentPageItems);
          } else {
            // pageNumbers is undefined or empty (means "all" was selected) - add to all pages
            const updatedSignature = updatedItems.find(
              (item) => item.id === itemId
            );

            if (updatedSignature) {
              const {
                position: basePosition,
                coordinates: baseCoordinates,
                ...signatureWithoutPosition
              } = updatedSignature;

              Object.keys(newPageItems).forEach((pageKey) => {
                const pageNum = parseInt(pageKey);
                if (pageNum !== state.pageNumber) {
                  const pageItems = newPageItems[pageNum]
                    ? [...newPageItems[pageNum]]
                    : [];

                  const existingIndex = pageItems.findIndex(
                    (item) => item.id === itemId
                  );

                  const sharedUpdates = {
                    ...signatureWithoutPosition,
                    pageNumber: pageNum,
                    pageNumbers: undefined,
                  };

                  if (existingIndex >= 0) {
                    const existingItem = pageItems[existingIndex];
                    const updatedItemForPage = {
                      ...existingItem,
                      ...sharedUpdates,
                      position: existingItem.position,
                      coordinates: existingItem.coordinates,
                    };

                    const updatedPageItems = pageItems.map((item, index) =>
                      index === existingIndex ? updatedItemForPage : item
                    );

                    newPageItems[pageNum] = updatedPageItems;
                  } else {
                    newPageItems[pageNum] = [
                      ...pageItems,
                      {
                        ...sharedUpdates,
                        position: basePosition,
                        coordinates: baseCoordinates,
                      },
                    ];
                  }
                }
              });
            }
          }

          return newPageItems;
        });
      } else {
        // For non-signature elements, use regular update
        setters.setPageFormItems((prevPageItems) =>
          updatePageObjects(state.pageNumber, updatedItems, prevPageItems)
        );
      }
    },
    [state.currentPageItems, state.pageNumber, setters]
  );

  // Add handleLayerDuplicate function
  const handleLayerDuplicate = useCallback(
    (itemId: string) => {
      // Find the item to duplicate
      const originalItem = state.currentPageItems.find(
        (item) => item.id === itemId
      );

      if (!originalItem) {
        console.error("Item not found for duplication:", itemId);
        return;
      }

      // Create a new item with copied properties
      const duplicatedItem: FormItem = {
        ...originalItem,
        id: `${originalItem.id}-duplicate-${Date.now()}`, // Generate unique ID
        position: {
          x: (originalItem.position?.x || 0) + 20, // Offset position slightly
          y: (originalItem.position?.y || 0) + 20,
        },
        // Copy all style properties
        style: {
          ...originalItem.style,
        },
        // Copy all config properties
        config: {
          ...originalItem.config,
        },
        // Copy checkbox options if they exist
        checkboxOptions: originalItem.checkboxOptions
          ? [...originalItem.checkboxOptions]
          : undefined,
        // Reset value for the duplicated item
        value: originalItem.type === "checkbox" ? [] : "",
      };

      // 🎯 POSITIONING: Add to Redux
      positioning.addPageItem(state.pageNumber, duplicatedItem as any);

      // Add the duplicated item to current page items
      const updatedItems = [...state.currentPageItems, duplicatedItem];
      setters.setCurrentPageItems(updatedItems);

      // Update the page items state
      setters.setPageFormItems((prevPageItems) => {
        const newPageItems = { ...prevPageItems };

        // Add to current page
        newPageItems[state.pageNumber] = updatedItems;

        // For signature and stamp elements, also add to other pages if they have pageNumbers
        if (
          (originalItem.type === "signature" ||
            originalItem.type === "stamp") &&
          originalItem.pageNumbers &&
          originalItem.pageNumbers.length > 0
        ) {
          originalItem.pageNumbers.forEach((pageNum) => {
            if (pageNum !== state.pageNumber) {
              // 🎯 FIX: Create a new array copy to avoid mutating read-only arrays
              const pageItems = newPageItems[pageNum] ? [...newPageItems[pageNum]] : [];
              const duplicatedSignatureForPage = {
                ...duplicatedItem,
                pageNumber: pageNum,
                pageNumbers: originalItem.pageNumbers
                  ? [...originalItem.pageNumbers]
                  : undefined,
              };
              // 🎯 FIX: Create new array instead of mutating
              newPageItems[pageNum] = [...pageItems, duplicatedSignatureForPage];
            }
          });
        }

        return newPageItems;
      });

      // 🎯 POSITIONING: Select in Redux
      positioning.setConfigElement(duplicatedItem as any);
      dispatch(setReduxActiveElementId(duplicatedItem.id));

      // Select the duplicated item
      setters.setConfigElement(duplicatedItem);
      setters.setActiveElementId(duplicatedItem.id);
      setters.setShowStylePanel(true);
    },
    [state.currentPageItems, state.pageNumber, setters, positioning, dispatch]
  );

  // Add handleLayerDelete function for single item deletion
  const handleLayerDelete = useCallback(
    (itemId: string) => {
      // 🎯 UPDATED: Always delete only the specific item that was requested
      // This allows for individual deletion from FormHandle
      const deletedItem = state.currentPageItems.find(
        (item) => item.id === itemId
      );
      let itemsToDelete: string[] = [itemId];

      // 🎯 POSITIONING: Remove from Redux
      positioning.removePageItem(itemId, state.pageNumber);

      // Remove all items to delete from current page items
      const updatedItems = state.currentPageItems.filter(
        (item) => !itemsToDelete.includes(item.id)
      );

      // Update current page items
      setters.setCurrentPageItems(updatedItems);

      // Update the page items state
      setters.setPageFormItems((prevPageItems) => {
        const newPageItems = { ...prevPageItems };

        // Remove from current page
        newPageItems[state.pageNumber] = updatedItems;

        // For signature and stamp elements, also remove from other pages
        // if (deletedItem?.type === "signature" || deletedItem?.type === "stamp") {
        //   // Remove signature from all pages
        //   Object.keys(newPageItems).forEach(pageKey => {
        //     const pageNum = parseInt(pageKey);
        //     if (pageNum !== state.pageNumber) {
        //       const pageItems = newPageItems[pageNum] || [];
        //       const filteredItems = pageItems.filter(item => !itemsToDelete.includes(item.id));
        //       if (filteredItems.length !== pageItems.length) {
        //         newPageItems[pageNum] = filteredItems;
        //       }
        //     }
        //   });
        // }

        return newPageItems;
      });

      // Close config panel if any of the deleted items was selected
      if (
        state.configElement &&
        itemsToDelete.includes(state.configElement.id)
      ) {
        setters.setConfigElement(null);
        setters.setActiveElementId(null);
        setters.setShowStylePanel(false);
        // 🎯 POSITIONING: Clear in Redux too
        positioning.setConfigElement(null);
        dispatch(setReduxActiveElementId(null));
      }
    },
    [
      state.currentPageItems,
      state.configElement,
      state.pageNumber,
      setters,
      positioning,
      dispatch,
    ]
  );

  // Add handleGroupedDelete function for deleting multiple items at once
  const handleGroupedDelete = useCallback(
    (itemIds: string[]) => {
      if (!itemIds || itemIds.length === 0) {
        return;
      }

      // 🎯 POSITIONING: Remove from Redux
      positioning.removePageItems(itemIds, state.pageNumber);

      // Remove all items to delete from current page items
      const updatedItems = state.currentPageItems.filter(
        (item) => !itemIds.includes(item.id)
      );
      // Update current page items
      setters.setCurrentPageItems(updatedItems);

      // Update the page items state
      setters.setPageFormItems((prevPageItems) => {
        const newPageItems = { ...prevPageItems };

        // Remove from current page
        newPageItems[state.pageNumber] = updatedItems;

        // For signature and stamp elements, also remove from other pages
        const deletedItems = state.currentPageItems.filter((item) =>
          itemIds.includes(item.id)
        );
        const hasSignatureOrStampElements = deletedItems.some(
          (item) => item.type === "signature" || item.type === "stamp"
        );

        if (hasSignatureOrStampElements) {
          // Remove signature from all pages
          Object.keys(newPageItems).forEach((pageKey) => {
            const pageNum = parseInt(pageKey);
            if (pageNum !== state.pageNumber) {
              const pageItems = newPageItems[pageNum] || [];
              const filteredItems = pageItems.filter(
                (item) => !itemIds.includes(item.id)
              );
              if (filteredItems.length !== pageItems.length) {
                newPageItems[pageNum] = filteredItems;
              }
            }
          });
        }

        return newPageItems;
      });

      // Close config panel if any of the deleted items was selected
      if (state.configElement && itemIds.includes(state.configElement.id)) {
        setters.setConfigElement(null);
        setters.setActiveElementId(null);
        setters.setShowStylePanel(false);
        // 🎯 POSITIONING: Clear in Redux too
        positioning.setConfigElement(null);
        dispatch(setReduxActiveElementId(null));
      }
    },
    [
      state.currentPageItems,
      state.configElement,
      state.pageNumber,
      setters,
      positioning,
      dispatch,
    ]
  );

  const handleOpenConfigPanel = useCallback(
    (item: FormItem) => {
      // 🎯 FIXED: Only reset if switching to a different element
      // This prevents unnecessary re-renders of DateInputControls
      if (state.configElement?.id !== item.id) {
        // Only reset if we're switching to a different element
        setters.setConfigElement(null);
        setters.setActiveElementId(null);
        setters.setShowStylePanel(false);

        // Use setTimeout to ensure state reset completes before setting new element
        setTimeout(() => {
          setters.setConfigElement(item);
          setters.setActiveElementId(item.id);
          setters.setShowStylePanel(true);
        }, 0);
      } else {
        // Same element - just ensure it's selected and panel is open
        setters.setConfigElement(item);
        setters.setActiveElementId(item.id);
        setters.setShowStylePanel(true);
      }
    },
    [setters, state.configElement]
  );

  const handleCloseConfigPanel = useCallback(() => {
    setters.setConfigElement(null);
    setters.setActiveElementId(null);
    setters.setShowStylePanel(false);
  }, [setters, isSettingsMode]);

  const handleLayerSelect = useCallback(
    (item: FormItem) => {
      // 🎯 FIXED: Only reset if switching to a different element
      // This prevents unnecessary re-renders of DateInputControls
      if (state.configElement?.id !== item.id) {
        // Only reset if we're switching to a different element
        setters.setConfigElement(null);
        setters.setActiveElementId(null);
        setters.setShowStylePanel(false);

        // Use setTimeout to ensure state reset completes before setting new element
        setTimeout(() => {
          setters.setConfigElement(item);
          setters.setActiveElementId(item.id);
          setters.setShowStylePanel(true);
        }, 0);
      } else {
        // Same element - just ensure it's selected and panel is open
        setters.setConfigElement(item);
        setters.setActiveElementId(item.id);
        setters.setShowStylePanel(true);
      }
    },
    [setters, state.configElement]
  );

  const handleStyleUpdate = useCallback(
    (style: ElementStyle) => {
      if (!state.configElement) return;

      // Update the current page items with the new style
      const updatedItems = state.currentPageItems.map((item) => {
        if (item.id === state.configElement!.id) {
          const updatedItem = {
            ...item,
            style: {
              ...(item.style || {}),
              ...style,
            },
          };

          return updatedItem;
        }
        return item;
      });

      // 🎯 FIX: Also update configElement so StickyTopBar gets the latest style
      const updatedConfigElement = {
        ...state.configElement,
        style: {
          ...(state.configElement.style || {}),
          ...style,
        },
      };

      // Update configElement first
      setters.setConfigElement(updatedConfigElement);

      // Update current page items
      setters.setCurrentPageItems(updatedItems);

      // 🎯 NEW: For signature and stamp elements, update all pages where the element is displayed
      if (
        state.configElement.type === "signature" ||
        state.configElement.type === "stamp"
      ) {
        setters.setPageFormItems((prevPageItems) => {
          const newPageItems = { ...prevPageItems };

          // First, update the current page
          newPageItems[state.pageNumber] = updatedItems;

          // Get the pages where this signature should be displayed
          const targetPages =
            state.configElement!.pageNumbers &&
            state.configElement!.pageNumbers.length > 0
              ? state.configElement!.pageNumbers
              : Object.keys(newPageItems).map((p) => parseInt(p)); // If pageNumbers is undefined, update all pages

          // Update the signature in all target pages
          targetPages.forEach((pageNum) => {
            if (pageNum !== state.pageNumber) {
              // 🎯 FIX: Create a new array copy to avoid mutating read-only arrays
              const pageItems = newPageItems[pageNum] ? [...newPageItems[pageNum]] : [];
              const elementIndex = pageItems.findIndex(
                (item) => item.id === state.configElement!.id
              );

              if (elementIndex >= 0) {
                // 🎯 IMPORTANT: For signature and stamp elements, sync all style properties EXCEPT position
                // This allows each page's signature/stamp to maintain independent positioning
                // while keeping other properties (backgroundColor, fontFamily, etc.) synchronized
                const { position, ...styleWithoutPosition } = style as any; // Type assertion for position property

                // 🎯 FIX: Create new array with updated item instead of mutating
                const updatedPageItems = pageItems.map((item, index) => 
                  index === elementIndex
                    ? {
                        ...item,
                        style: {
                          ...(item.style || {}),
                          ...styleWithoutPosition, // Exclude position to maintain independent positioning per page
                          // ...style,
                        },
                      }
                    : item
                );
                newPageItems[pageNum] = updatedPageItems;
              }
            }
          });

          return newPageItems;
        });
      } else {
        // For non-signature elements, use regular update
        setters.setPageFormItems((prevPageItems) =>
          updatePageObjects(state.pageNumber, updatedItems, prevPageItems)
        );
      }
    },
    [state.configElement, state.currentPageItems, state.pageNumber, setters]
  );

  return {
    handleFormItemValueChange,
    handleFormElementConfig,
    handleOpenConfigPanel,
    handleCloseConfigPanel,
    handleLayerSelect,
    handleStyleUpdate,
    handleLayerDelete,
    handleLayerDuplicate,
    handleGroupedDelete,
  };
}

// Custom hook for rendered content
export function useRenderedContent(
  state: ElementState,
  formItemHandlers: FormItemHandlers,
  onCoordinatesUpdate?: (
    elementId: string,
    coordinates: { llx: number; lly: number; urx: number; ury: number }
  ) => void
): RenderedContent {
  // NEW: Function to create form items for a specific page (for multi-page view)
  const createFormItemsForPage = useCallback(
    (
      targetPageNumber: number,
      allPageItems: FormItem[],
      isInteractive: boolean = true,
      stepIndexFilter?: string,
      onCoordinatesUpdate?: (
        elementId: string,
        coordinates: { llx: number; lly: number; urx: number; ury: number }
      ) => void
    ) => {
      // Apply stepIndex filtering
      const stepFilteredItems =
        stepIndexFilter === "all"
          ? allPageItems
          : allPageItems.filter((item) => {
              // 🎯 FIXED: For stamp elements, always show regardless of stepIndex
              if (item.type === "stamp") {
                return true;
              }
              // For other elements, apply normal stepIndex filtering
              return !item.step_index || item.step_index === stepIndexFilter;
            });

      // Apply page filtering
      const pageFilteredItems = stepFilteredItems.filter((item) => {
        // For signature and stamp elements, check page visibility
        if (item.type === "signature" || item.type === "stamp") {
          if (typeof item.pageNumber === "number") {
            return item.pageNumber === targetPageNumber;
          }

          if (item.pageNumbers && item.pageNumbers.length > 0) {
            return item.pageNumbers.includes(targetPageNumber);
          }

          return true;
        }

        // For non-signature/stamp elements, show on target page or if no page specified
        return item.pageNumber === targetPageNumber || !item.pageNumber;
      });

      // Remove dragged items (only for current page)
      const filteredItems = isInteractive
        ? pageFilteredItems.filter((item) => item.id !== state.draggedItemId)
        : pageFilteredItems;

      return filteredItems.map((item, index) => {
        const isSelected = isInteractive && state.activeElementId === item.id;
        const isCurrentPage = targetPageNumber === state.pageNumber;

        return (
          <DroppedElement
            key={`${item.id}-page-${targetPageNumber}`}
            id={item.id}
            type={item.type}
            label={item.label}
            position={item.position}
            value={item.value}
            checkboxOptions={item.checkboxOptions}
            radioOptions={item.radioOptions}
            selectOptions={item.selectOptions}
            maxLength={item.config?.maxLength}
            required={item.config?.required}
            placeholder={item.config?.placeholder}
            style={item.style}
            isSelected={isSelected}
            step_index={item.step_index}
            actorId={item.actorId}
            coordinatesform={item.coordinates}
            userRole=""
            // Enable interactions only for current page in interactive mode
            onValueChange={
              isInteractive && isCurrentPage
                ? (newValue, options) => {
                    formItemHandlers.handleFormItemValueChange(
                      item.id,
                      newValue,
                      options
                    );
                  }
                : undefined
            }
            onConfigChange={
              isInteractive && isCurrentPage
                ? (configData) => {
                    formItemHandlers.handleFormElementConfig(
                      item.id,
                      configData
                    );
                  }
                : undefined
            }
            onConfigClick={
              isInteractive && isCurrentPage
                ? () => {
                    formItemHandlers.handleOpenConfigPanel(item);
                  }
                : undefined
            }
            onStyleChange={
              isInteractive && isCurrentPage
                ? (style) => {
                    if (
                      state.configElement &&
                      state.configElement.id === item.id
                    ) {
                      formItemHandlers.handleStyleUpdate(style);
                    }
                  }
                : undefined
            }
            onSelect={
              isInteractive && isCurrentPage
                ? () => {
                    formItemHandlers.handleOpenConfigPanel(item);
                  }
                : undefined
            }
            onLayerDelete={
              isInteractive && isCurrentPage
                ? () => {
                    formItemHandlers.handleLayerDelete(item.id);
                  }
                : undefined
            }
            onLayerDuplicate={
              isInteractive && isCurrentPage
                ? () => {
                    formItemHandlers.handleLayerDuplicate(item.id);
                  }
                : undefined
            }
            // Note: onCoordinatesUpdate and onComputedStylesChange should be passed from parent component
            onCoordinatesUpdate={(elementId: string, coordinates: any) => {
              if (onCoordinatesUpdate) {
                onCoordinatesUpdate(elementId, coordinates);
              }
            }}
            onComputedStylesChange={undefined}
          />
        );
      });
    },
    [
      state.draggedItemId,
      state.activeElementId,
      state.configElement,
      state.pageNumber,
      state.currentPageItems, // เพิ่ม dependency สำคัญ
      formItemHandlers,
    ]
  );
  // Find the active element for overlay
  const activeElement = useMemo(() => {
    if (!state.activeId) return null;

    return state.activeId.toString().startsWith("dropped-")
      ? state.currentPageItems.find(
          (item) => `dropped-${item.id}` === state.activeId
        )
      : formElements.find(
          (item: {
            id: string;
            type: string;
            label: string;
            icon?: React.ReactNode;
            categoryId: string;
          }) => item.id === state.activeId
        );
  }, [state.activeId, state.currentPageItems]);

  // Memoize the empty state to prevent recreation on each render
  const emptyCanvasContent = useMemo(
    () => (
      <div className="flex items-center justify-center h-full text-gray-400">
        {/* เลือกองค์ประกอบฟอร์มที่ต้องการเพิ่ม */}
      </div>
    ),
    []
  );

  // Memoize the form items rendering
  const formItemsContent = useMemo(() => {
    // Start with filteredCurrentPageItems which already handles stepIndex filtering
    // Apply additional filtering for page visibility (especially for signature and stamp elements)
    const items = state.filteredCurrentPageItems.filter((item) => {
      // For signature and stamp elements, check page visibility
      if (item.type === "signature" || item.type === "stamp") {
        const currentPage = state.pageNumber;

        // Check if item has pageNumbers configuration
        if (item.pageNumbers && item.pageNumbers.length > 0) {
          // If pageNumbers includes current page, show the element
          const displaySignature = item.pageNumbers.includes(currentPage);
          return displaySignature;
        }

        // Fallback to pageNumber if pageNumbers is not set
        if (item.pageNumber) {
          const displaySignature = item.pageNumber === currentPage;
          return displaySignature;
        }
        return true;
      }

      // For non-signature/stamp elements, show on current page or if no page specified
      return item.pageNumber === state.pageNumber || !item.pageNumber;
    });

    const filteredItems = items.filter((item) => {
      const isDragged = item.id === state.draggedItemId;
      return !isDragged;
    });

    const elements = filteredItems.map((item, index) => {
      const isSelected = state.activeElementId === item.id;
      return (
        <DroppedElement
          key={index}
          id={item.id}
          type={item.type}
          label={item.label}
          position={item.position}
          value={item.value}
          checkboxOptions={item.checkboxOptions}
          radioOptions={item.radioOptions}
          selectOptions={item.selectOptions}
          maxLength={item.config?.maxLength}
          required={item.config?.required}
          placeholder={item.config?.placeholder}
          style={item.style}
          isSelected={isSelected}
          onValueChange={(newValue, options) => {
            formItemHandlers.handleFormItemValueChange(
              item.id,
              newValue,
              options
            );
          }}
          onConfigChange={(configData) => {
            formItemHandlers.handleFormElementConfig(item.id, configData);
          }}
          onConfigClick={() => {
            formItemHandlers.handleOpenConfigPanel(item);
          }}
          onStyleChange={(style) => {
            if (state.configElement && state.configElement.id === item.id) {
              formItemHandlers.handleStyleUpdate(style);
            }
          }}
          onSelect={() => {
            formItemHandlers.handleOpenConfigPanel(item);
          }}
          onLayerDelete={() => {
            formItemHandlers.handleLayerDelete(item.id);
          }}
          onLayerDuplicate={() => {
            formItemHandlers.handleLayerDuplicate(item.id);
          }}
          // 🎯 FIXED: Add missing coordinate update handlers
          onCoordinatesUpdate={(elementId: string, coordinates: any) => {
            if (onCoordinatesUpdate) {
              onCoordinatesUpdate(elementId, coordinates);
            }
          }}
          onComputedStylesChange={undefined} // Will be handled by parent component
          dateFormat={
            (item.config?.dateFormat as "EU" | "US" | "THBCnumber") || "EU"
          }
        />
      );
    });

    return elements;
  }, [
    state.currentPageItems,
    state.filteredCurrentPageItems,
    state.stepIndex,
    state.pageNumber,
    state.draggedItemId,
    state.activeElementId,
    state.configElement,
    formItemHandlers,
    onCoordinatesUpdate,
  ]);

  // Memoize the drag overlay with full element properties
  const dragOverlayContent = useMemo(() => {
    if (!activeElement) return null;

    // For dropped elements, preserve all current properties including custom styles
    const isDroppedElement = state.activeId?.toString().startsWith("dropped-");

    if (isDroppedElement && "value" in activeElement) {
      // This is a dropped element with all properties
      return (
        <div className="opacity-80">
          <DroppedElement
            id={activeElement.id}
            type={activeElement.type}
            label={activeElement.label}
            position={{ x: 0, y: 0 }}
            value={activeElement.value}
            checkboxOptions={activeElement.checkboxOptions}
            radioOptions={activeElement.radioOptions}
            selectOptions={activeElement.selectOptions}
            maxLength={activeElement.config?.maxLength}
            required={activeElement.config?.required}
            placeholder={activeElement.config?.placeholder}
            style={activeElement.style as ElementStyle}
            isSelected={false}
            dateFormat={
              (activeElement.config?.dateFormat as
                | "EU"
                | "US"
                | "THBCnumber") || "EU"
            }
          />
        </div>
      );
    } else {
      // This is a sidebar element (new element being dragged)
      return (
        <div className="opacity-80">
          <DroppedElement
            id={activeElement.id}
            type={activeElement.type}
            label={activeElement.label}
            position={{ x: 0, y: 0 }}
          />
        </div>
      );
    }
  }, [activeElement, state.activeId]);

  return {
    activeElement,
    formItemsContent,
    dragOverlayContent,
    emptyCanvasContent,
    createFormItemsForPage,
  };
}

// Main custom hook that combines all element and DnD functionality
export function useElementDndUtils(
  state: ElementState,
  setters: ElementSetters,
  pdfFormAreaRef: React.RefObject<HTMLDivElement | null>,
  isSettingsMode: boolean = false,
  onCoordinatesUpdate?: (
    elementId: string,
    coordinates: { llx: number; lly: number; urx: number; ury: number }
  ) => void
) {
  const dragDropHandlers = useDragDropHandlers(state, setters, pdfFormAreaRef);
  const formItemHandlers = useFormItemHandlers(state, setters, isSettingsMode);
  const renderedContent = useRenderedContent(
    state,
    formItemHandlers,
    onCoordinatesUpdate
  );

  return {
    ...dragDropHandlers,
    ...formItemHandlers,
    ...renderedContent,
  };
}
