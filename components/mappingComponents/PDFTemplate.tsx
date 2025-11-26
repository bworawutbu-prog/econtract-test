"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { ChevronDown } from "lucide-react";
import "@/store/libs/browser-polyfill";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "@/store/libs/pdf-worker";
import { Button, Form, Select } from "antd";
import { useSnackbar } from "notistack";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  pointerWithin,
} from "@dnd-kit/core";
import FormSidebar from "./FormComponents/FormSidebar";
import MobileBottomMenu from "./FormComponents/MobileBottomMenu";
import { FormCanvas } from "./FormComponents/FormCanvas.stable";
import { FormItem, SignatureImagePayload } from "../../store/types/index";
import { ApproverItem } from "@/store/mockData/mockPDFData";
import { WorkflowStep } from "@/store/types/mappingTypes";
import { OperatorDetail } from "@/store/types/contractB2BType";
import approve_icon from "@assets/webp/approveIcon.webp";
import rejected_icon from "@assets/webp/rejectedIcon.webp";
import { BusinessUtils } from "@/store/utils/businessUtils";
import { getFlowDataIndex } from "@/app/frontend/Mapping/page";
import {
  PageFormItems,
  updatePageObjects,
  hasPageObjects,
  countPageObjects,
  handleDocumentLoadSuccess,
  handlePageChangeWithFormManagement,
  handleStepIndexChangeWithReset,
  handleFormItemDeletion,
  togglePdfVisibility,
  loadFormItems,
  PDFDimensions,
} from "./FormUtils/pdfFormManager";
import {
  handleSaveForm as saveFormAPI,
  handleReject as rejectAPI,
  handleApprove as approveAPI,
  handleConfirmSave as confirmSaveAPI,
  handleConfirmedEmailSending,
  handleUserSettingMapping as userSettingMappingAPI,
  handleSaveUserSetting as saveUserSettingAPI,
  SaveFormParams,
  ConfirmSaveParams,
  ApproveParams,
  RejectParams,
  SaveUserSettingParams,
  UserSettingMappingParams,
} from "./FormUtils/apiUtils";
import {
  renderFormattedDate,
  renderFormattedTime,
} from "./FormUtils/dateTimeUtils";
import {
  initializeUserSettings,
  initializeSignatureImageListener,
  handleUserSettingMapping as handleUserSettingMappingUtil,
  handleSaveUserSetting as handleSaveUserSettingUtil,
} from "./FormUtils/settingUtils";
import {
  useZoomUtils,
  useZoomKeyboardShortcuts,
  zoomOptions,
  ZoomUtils,
} from "./FormUtils/zoomUtils";
import { useElementDndUtils } from "./FormUtils/elementDndUtils";
import {
  useViewport,
  useResponsivePdfScale,
  getResponsiveContainerStyles,
  getResponsivePdfWrapperStyles,
  getPageSpacing,
  useTouchGestures,
} from "./FormUtils/responsiveUtils";
import PDFThumbnails from "./PDFThumbnails";
import { mockPDFFormsData } from "@/store/backendStore/formAPI";
import DocumentDetails from "./FormComponents/DocumentDetails";
import StickyTopBar from "./FormComponents/StickyTopBar";
import SettingDocument from "./SettingDocument";
import PDFController from "./PDFController";
import appEmitter from "@/store/libs/eventEmitter";
import { ConfirmModal } from "@/components/modal/modalConfirm";
import { ErrorModal } from "@/components/modal/modalError";
import { SuccessModal } from "@/components/modal/modalSuccess";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { AnyAction } from "redux";
import { RootState, useAppSelector } from "@/store";
import { useAppDispatch } from "@/store/hooks";
import { setApprovers } from "@/store/documentStore/B2BForm";
import { RejectModal } from "@/components/modal/modalReject";
import { useSelector } from "react-redux";
import { selectMappingMoreFileData } from "@/store/slices/mappingSlice";
import { SettingDocsModal } from "./FormComponents/FormB2BDocument/modalSettingDocument";
import { SettingDocsTemplateModal } from "./FormComponents/FormB2BDocument/modalSettingDocumentTemplate";
import { SettingDocsModalUseDocument } from "./FormComponents/FormB2BDocument/modalSettingDocumentUse";
import { FormB2B } from "./FormComponents/FormB2BDocument/FormB2B";
import { DocsSetting } from "@/store/types/contractB2BType";
import confirmIcon from "@/assets/image/modal/confirm2.webp";
import { buildAllMappings } from "./FormUtils/mappingBuilder";
import { useAppSelector as useCanvasSelector } from "@/store/hooks";
import Item from "antd/es/list/Item";
import { FormB2C } from "./FormComponents/FormB2BDocument/FormB2C";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Define props interface for PDFTemplate
interface PDFTemplateProps {
  hasStickyTopBar?: boolean; // Show sticky top navigation bar
  hasFormSidebar?: boolean; // Show form sidebar with elements
  hasPDFThumbnail?: boolean; // Show PDF thumbnail navigation
  hasDocumentDetail?: boolean; // Show document detail panel
  initialPdfUrl?: string; // Initial PDF URL to load
  initialTitle?: string; // Initial document title
  documentId?: string; // Document ID for loading/saving
  mappingFormDataId?: string; // Mapping form data ID for loading/saving
  formItems?: FormItem[]; // Form items to display on the PDF
  approvers?: ApproverItem[]; // Approvers for the document
  documentData?: any; // Document data for mapping
  formDataFlow?: any; // Form data flow for mapping
  documentStatus?: string; // Document status (Y=completed, R=rejected, etc.)
  currentUserStepIndex?: string; // Current user's step index for frontend filtering
  currentUserAction?: string; // 🎯 NEW: Current user's action (signer or approver)
  isEditable?: boolean; // Whether form elements can be edited
  isViewMode?: boolean; // View-only mode (no editing)
  typeCode?: string; // Document type for settings
  onSaveForm?: (formData: any) => Promise<any>; // Custom save handler
  onReject?: (formData: any) => Promise<any>; // Reject handler
  onApprove?: (formData: any) => Promise<any>; // Approve handler
  onCancel?: () => void; // Cancel handler
  onBack?: () => void; // Back button handler
  onFormItemsChange?: (formItems: FormItem[]) => void; // Callback for form items changes
  type?: string; // draft, create, or template
  workspaceId?: string;
  folderId?: string;
  isCreatorOrSender?: boolean; // 🎯 NEW: Whether user is creator/sender (doesn't need CA)
  docType?: string;
  docTypeId?: string; // 🎯 NEW: Document type ID for template mode
}

// Add interface for user settings data
interface UserSettingData {
  typeCode: string;
  approvers: {
    index: number;
    role: string;
    permission: string;
    section: string;
    validateType: string;
    validateData: string;
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

const PDFTemplate: React.FC<PDFTemplateProps> = (props) => {
  const {
    hasStickyTopBar = true,
    hasFormSidebar = true,
    hasPDFThumbnail = true,
    hasDocumentDetail = false,
    initialPdfUrl,
    initialTitle,
    documentId,
    mappingFormDataId,
    formItems = [],
    approvers = [],
    documentData = {},
    formDataFlow = [],
    documentStatus,
    currentUserStepIndex,
    currentUserAction = "approver",
    isEditable = true,
    isViewMode = false,
    onSaveForm,
    onReject,
    onApprove,
    onCancel,
    onBack,
    onFormItemsChange,
    typeCode,
    type = "create",
    workspaceId,
    folderId,
    isCreatorOrSender = false, // 🎯 NEW: Default to false for backward compatibility
    docType,
    docTypeId, // 🎯 NEW: Document type ID for template mode
  } = props;
  const dispatch = useAppDispatch() as ThunkDispatch<
    RootState,
    unknown,
    AnyAction
  >;
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLDivElement>(null);
  const pdfFormAreaRef = useRef<HTMLDivElement>(null);
  const canvasState = useCanvasSelector((state) => state.canvas);
  const isDragging = canvasState.isDragging;
  
  const [isMounted, setIsMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const [zoomPreset, setZoomPreset] = useState<string>("100%");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [configElement, setConfigElement] = useState<FormItem | null>(null);
  const [showStylePanel, setShowStylePanel] = useState<boolean>(false);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettingData | null>(null);
  const [isSettingsMode, setIsSettingsMode] = useState(false);
  // Get approvers from Redux store and add 1-based index
  const rawApproversData = useAppSelector((state) => state.contractB2BForm.approvers) || [];
  
  // Add 1-based index to approversData to match userSettings structure
  const approversData = useMemo(() => {
    if (!rawApproversData || rawApproversData.length === 0) return [];
    
    return rawApproversData?.map((approver: any, index: number) => ({
      ...approver,
      index: index + 1, // 🎯 FIXED: Add 1-based index like userSettings
    }));
  }, [rawApproversData]);
  
  const [isSettingsFormValid, setIsSettingsFormValid] = useState(true);
  const [isFileValidationValid, setIsFileValidationValid] = useState(true);
  const [isGeneralFormValid, setIsGeneralFormValid] = useState(true);
  const [currentDocumentType, setCurrentDocumentType] = useState<string>(typeCode || "1");
  const [settingsFormData, setSettingsFormData] = useState<any>(null);

  const isBackend = pathname?.includes("/backend/Mapping");
  const isFrontend = pathname?.includes("/frontend/Mapping");

  const pdfUrl = initialPdfUrl || searchParams.get("pdfUrl") || "";
  const title = initialTitle || searchParams.get("title") || "[debug]Untitled.pdf";
  const [pdfTitle, setPdfTitle] = useState(searchParams.get("title") || "Untitled.pdf");
  const [formTitle, setFormTitle] = useState<string>(searchParams.get("title") || initialTitle || "แบบฟอร์มไม่มีชื่อ");
  // 🎯 NEW: Get docType from URL parameters or props
  const urlDocType = searchParams.get("docType");
  const finalDocType = docType || urlDocType || "";
  
  // 🎯 NEW: Get docTypeId from URL parameters or props (for template mode detection)
  const urlDocTypeId = searchParams.get("docTypeId");
  const finalDocTypeId = docTypeId || urlDocTypeId || "";
  
  // 🎯 NEW: Get B2B form data from Redux store
  const B2BformData = useAppSelector((state) => state.contractB2BForm);
  
  // 🎯 NEW: Create actors data from B2BformData for B2B documents
  const createActorsFromB2BData = useMemo(() => {
    if (finalDocType !== "b2b" || !B2BformData?.forms?.contractParty?.approvers) {
      return userSettings?.approvers || [];
    }
    
    return B2BformData.forms.contractParty.approvers?.map((approver, index) => ({
      id: `b2b-approver-${index}`,
      name: (approver.userList && approver.userList[0] && approver.userList[0].fullName) || `ผู้อนุมัติ ${index + 1}`,
      step_index: index.toString() || "",
      role: "Creator",
      permission: approver.permissionType || "approver",
      section: approver.section || "มาตรา 9",
      validateType: "",
      validateData: "",
      entityType: approver.approverType === "ภายใน" ? "sender" : "personal",
      entities: (approver.userList && approver.userList.map(user => ({
        id: user.idCard || `user-${index}`,
        name: user.fullName || "",
        email: user.email || ""
      }))) || [],
      selfieVideo: false,
      selfieMessage: "",
      index: index + 1, // 🎯 FIXED: Add index property for type compatibility
      order: index + 1
    }));
  }, [finalDocType, B2BformData, userSettings]);
  
  const [formId, setFormId] = useState<string>("");
  const [currentPageItems, setCurrentPageItems] = useState<FormItem[]>([]);
  const [pageFormItems, setPageFormItems] = useState<PageFormItems>({});
  const [pdfFile, setPdfFile] = useState<string>("");
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [showPdf, setShowPdf] = useState<boolean>(true);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [isPdfReady, setIsPdfReady] = useState<boolean>(false);
  const mappingMoreFileDataFromRedux = useSelector(selectMappingMoreFileData);
  const [mappingMoreFileFromEvent, setMappingMoreFileFromEvent] = useState<any[]>([]);

  const [allPagesItems, setAllPagesItems] = useState<PageFormItems>({});
  const [visiblePageNumber, setVisiblePageNumber] = useState<number>(1);
  const pageRefs = useRef<{ [pageNum: number]: HTMLDivElement | null }>({});


  const [pdfDimensions, setPdfDimensions] = useState<{width: number, height: number} | null>(null);
  const [stepIndex, setStepIndex] = useState<string>(""); //FOUND YOU BUGFIX: happend because you use fixed number in here it should be dynamic!sigma
  const [isRequired, setIsRequired] = useState<boolean>(false);
  const isGuest = sessionStorage.getItem("isGuest") === "true";

  // 🎯 RESPONSIVE: Add viewport tracking and responsive scale
  const viewport = useViewport();
  const responsiveScale = useResponsivePdfScale(
    canvasRef,
    pdfDimensions,
    scale,
    viewport
  );

  // เพิ่ม state สำหรับควบคุมการแสดง modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
  const [isEmailConfirmModalOpen, setIsEmailConfirmModalOpen] = useState<boolean>(false);
  const [transactionId, setTransactionId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
  const [currentAction, setCurrentAction] = useState<"save" | "approve" | "reject" | "">("");
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);


  const allPageItems = useMemo(() => {
    return Object.values(pageFormItems).flat();
  }, [pageFormItems]);

  // ✅ FIX: Move appEmitter.emit to useEffect to avoid "Cannot update component while rendering" error
  // This ensures the event is only fired after React has safely finished the render phase
  useEffect(() => {
    appEmitter.emit("allPageItems", allPageItems);
  }, [allPageItems]);

  const handleResetAllMapping = useCallback(() => {
    setPageFormItems((prevPageItems) => {
      const newPageItems: PageFormItems = {};

      // Filter out signature elements from all pages
      Object.keys(prevPageItems).forEach((pageKey) => {
        const pageNum = parseInt(pageKey);
        const pageItems = prevPageItems[pageNum] || [];
        // Keep only stamp or eseal elements
        const filteredItems = pageItems.filter((item) => item.type === "stamp" || item.type === "eseal");

        if (filteredItems.length > 0) {
          newPageItems[pageNum] = filteredItems;
        }
      });

      return newPageItems;
    });

    // Also update currentPageItems if current page has signatures
    setCurrentPageItems((prevItems) => 
      prevItems.filter((item) => item.type === "stamp" || item.type === "eseal")
    );

    // Clear config panel if selected element is a signature
    if (configElement && configElement.type !== "stamp" && configElement.type !== "eseal") {
      setConfigElement(null);
      setActiveElementId(null);
      setShowStylePanel(false);
    }
  }, [configElement]);

  appEmitter.on("resetAllMapping", handleResetAllMapping);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 🎯 BROWSER-LIKE ZOOM: Prevent scroll during drag without layout shift
  // 🎯 FIX: Use event prevention instead of overflow:hidden to avoid scrollbar layout shift
  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    // Prevent scroll events during drag
    const preventScroll = (e: WheelEvent | TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    if (isDragging) {
      // Prevent scrolling during drag using CSS and event listeners
      canvasElement.style.userSelect = "none";
      canvasElement.style.overscrollBehavior = "none";
      
      // Add event listeners to prevent scroll
      canvasElement.addEventListener("wheel", preventScroll, { passive: false });
      canvasElement.addEventListener("touchmove", preventScroll, { passive: false });
    } else {
      canvasElement.style.userSelect = "auto";
      canvasElement.style.overscrollBehavior = "auto";
    }

    // Cleanup function to ensure styles and listeners are restored
    return () => {
      if (canvasElement) {
        canvasElement.style.userSelect = "auto";
        canvasElement.style.overscrollBehavior = "auto";
        canvasElement.removeEventListener("wheel", preventScroll);
        canvasElement.removeEventListener("touchmove", preventScroll);
      }
    };
  }, [isDragging]);

  useEffect(() => {
    if (pdfUrl) {
      setPdfTitle(title);
    }
  }, [pdfUrl, title]);

  // Add filtered current page items based on stepIndex
  const filteredCurrentPageItems = useMemo(() => {
    if (stepIndex === "all") {
      return currentPageItems;
    }

    const filtered = currentPageItems.filter(
      (item) => {
        // 🎯 FIXED: For stamp elements, always show regardless of stepIndex
        if (item.type === "stamp") {
          return true;
        }
        // For other elements, apply normal stepIndex filtering
        return !item.step_index || item.step_index === stepIndex;
      }
    );

    return filtered;
  }, [currentPageItems, stepIndex]);
  useEffect(() => {
    const isRequired = currentPageItems.filter(
      (item) =>
        item.type === "text" && item.config?.required && item.value === ""
    );
    setIsRequired(isRequired.length !== 0);
  }, [currentPageItems]);

  // Calculate approversCount based on approversData or userSettings
  const approversCount = useMemo(() => {
    // 🎯 FIXED: Use approversData length if available, otherwise fallback to userSettings
    if (approversData && approversData.length > 0) {
      return approversData.length;
    }
    return (userSettings && userSettings.approvers && userSettings.approvers.length) || 1;
  }, [approversData, userSettings?.approvers?.length]);

  // โหลดข้อมูลเมื่อค่า formItems เปลี่ยนแปลงครั้งแรก (ไม่ reset เมื่อเปลี่ยนหน้า)
  // TODO: ADD TRANSACTION API HERE SO IT CAN RENDER (replace pdfData with transactionAPI+ID)
  useEffect(() => {
    //
    if (formItems && formItems.length > 0 && Object.keys(pageFormItems).length === 0) {
      // Only initialize if pageFormItems is empty (first load)
      // Group form items by page number
      const itemsByPage: PageFormItems = {};
      formItems.forEach((item) => {
        const pageNum = item.pageNumber || 1;
        if (!itemsByPage[pageNum]) {
          itemsByPage[pageNum] = [];
        }
        itemsByPage[pageNum].push(item as any);
      });

      // Update page form items
      setPageFormItems(itemsByPage);

      // Set current page items if we're on a page that has items
      if (itemsByPage[pageNumber]) {
        const firstStepIndex = itemsByPage[pageNumber][0]?.step_index || "";
        // Set stepIndex only if it's currently empty to avoid overriding user selection
        if (stepIndex === "") {
          const defaultIndex = firstStepIndex || "0"; // 🎯 Default to "0" (0-based) instead of "1"
          setStepIndex(defaultIndex);
        }
        setCurrentPageItems(itemsByPage[pageNumber]);
      }
    }
  }, [formItems]); // 🎯 FIXED: Remove pageNumber dependency

  useEffect(() => {
    // Use documentId from props
    if (documentId && documentId in mockPDFFormsData) {
      const pdfData =
        mockPDFFormsData[documentId as keyof typeof mockPDFFormsData];

      // Load form title and ID
      setFormTitle(
        pdfData.fileName ||
          searchParams.get("title") ||
          initialTitle ||
          "สร้างฟอร์มใหม่"
      );
      setFormId(pdfData.key);

      if (pdfData) {
        setIsLoadingPdf(true);
        setIsPdfReady(false); // Reset PDF ready state
        setPdfFile(pdfData.url);
      }

      // Use the simulated API to fetch form items
      loadFormItems(
        documentId,
        setPageFormItems,
        setPageNumber,
        setCurrentPageItems
      );
    } else if (pdfUrl) {
      // If no documentId but pdfUrl is provided (from folderWorkspace navigation)
      setIsLoadingPdf(true);
      setIsPdfReady(false); // Reset PDF ready state
      setPdfFile(pdfUrl);
      setPdfTitle(title);
    }
    if (docType === "b2b" || docType === "b2c") {
      setIsPdfReady(true);
    }
  }, [documentId, pdfUrl, title]);

  // Add a useEffect to ensure items are properly displayed
  useEffect(() => {
    if (
      currentPageItems.length === 0 &&
      pageFormItems[pageNumber]?.length > 0
    ) {
      setCurrentPageItems(pageFormItems[pageNumber]);
    }
  }, [currentPageItems, pageNumber, pageFormItems]);
  // Add effect to monitor and log the PDF form area ref
  useEffect(() => {
    if (pdfFormAreaRef.current) {
    }
  }, [pdfFormAreaRef.current]);

  // 🎯 Listen for mappingMoreFileForApprove event from DocumentDetails
  useEffect(() => {
    console.log("🔍 AAA URL =>>", pdfUrl);
    const handleMappingMoreFileForApprove = (data: any) => {
      // console.log("🔍 [PDFTemplate] Received mappingMoreFileForApprove:", data);
      setMappingMoreFileFromEvent(data);
    };

    appEmitter.on("mappingMoreFileForApprove", handleMappingMoreFileForApprove);

    return () => {
      appEmitter.off("mappingMoreFileForApprove", handleMappingMoreFileForApprove);
    };
  }, []);

  // PDF functions - using utility from pdfFormManager
  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    handleDocumentLoadSuccess(
      numPages,
      setNumPages,
      pageNumber,
      setPageNumber,
      pageFormItems,
      setCurrentPageItems,
      setIsLoadingPdf,
      scale,
      setPdfDimensions
    );
    // Set PDF as ready when successfully loaded
    setIsPdfReady(true);
  }

  // Function to handle page changes - แก้ไขให้แสดงทีละหน้าแทน scroll
  const handlePageChange = (newPageNumber: number) => {
    // 🎯 NEW: บันทึก currentPageNumber ใน sessionStorage สำหรับ coordinate calculation
    if (typeof window !== "undefined") {
      sessionStorage.setItem('currentPageNumber', newPageNumber.toString());
    }

    // 🎯 FIXED: ไม่ใช้ scrollIntoView แล้ว - แสดงทีละหน้า
    // Update page number and current page items
    setPageNumber(newPageNumber);
    setVisiblePageNumber(newPageNumber);

    // Update currentPageItems for the new page
    if (allPagesItems[newPageNumber]) {
      setCurrentPageItems(allPagesItems[newPageNumber]);
    } else {
      setCurrentPageItems([]);
    }

    // 🎯 FIXED: Don't reset config panel to preserve FormElementConfig state
    // setConfigElement(null);
    // setActiveElementId(null);
    // setShowStylePanel(false);
  };

  // Add function to handle stepIndex change - using utility from pdfFormManager
  const handleStepIndexChange = (newStepIndex: string) => {
    handleStepIndexChangeWithReset(
      newStepIndex,
      setStepIndex,
      configElement as any,
      setConfigElement,
      setActiveElementId,
      setShowStylePanel
    );
  };

  // Function to delete an item from the current page - using utility from pdfFormManager
  const handleDeleteItem = (itemId: string) => {
    handleFormItemDeletion(
      itemId,
      currentPageItems as any,
      pageNumber,
      setCurrentPageItems,
      setPageFormItems
    );
  };

  // ฟังก์ชันสำหรับอัพเดท coordinates แบบ event-based (ป้องกัน loop)
  const handleCoordinatesUpdate = useCallback(
    (
      elementId: string,
      coordinates: { llx: number; lly: number; urx: number; ury: number }
    ) => {
      // ใช้ setTimeout เพื่อให้ state update เสร็จก่อน
      setTimeout(() => {
        setPageFormItems((prevPageItems) => {
          const currentPageItemsFromState = prevPageItems[pageNumber] || [];

          // ตรวจสอบว่ามี element นี้และ coordinates เปลี่ยนแปลงจริงหรือไม่
          const targetItem = currentPageItemsFromState.find(
            (item) => item.id === elementId
          );
          if (!targetItem) {
            return prevPageItems;
          }

          // ตรวจสอบว่า coordinates เปลี่ยนแปลงจริงหรือไม่
          const hasChanged =
            !targetItem.coordinates ||
            targetItem.coordinates.llx !== coordinates.llx ||
            targetItem.coordinates.lly !== coordinates.lly ||
            targetItem.coordinates.urx !== coordinates.urx ||
            targetItem.coordinates.ury !== coordinates.ury;

          if (!hasChanged) {
            return prevPageItems;
          }

          // อัพเดท coordinates
          const updatedItems = currentPageItemsFromState?.map((item) => {
            if (item.id === elementId) {
              const updatedItem = {
                ...item,
                coordinates: coordinates,
              };

              return updatedItem;
            }
            return item;
          });

          // อัพเดท currentPageItems ด้วย (แยกจาก pageFormItems update)
          setCurrentPageItems(updatedItems);

          return {
            ...prevPageItems,
            [pageNumber]: updatedItems,
          };
        });
      }, 0);
    },
    [pageNumber, setPageFormItems, setCurrentPageItems]
  );

  // Create zoom utilities using the custom hook
  const zoomUtils = useZoomUtils(
    scale,
    setScale,
    zoomPreset,
    setZoomPreset,
    pdfDimensions,
    canvasRef
  );

  // Add keyboard shortcuts for zooming
  useZoomKeyboardShortcuts(zoomUtils, pdfDimensions);

  // 🎯 RESPONSIVE: Add touch gesture support for mobile pinch-to-zoom
  useTouchGestures(canvasRef, (newScale) => {
    if (viewport.isMobile) {
      const clampedScale = Math.max(0.5, Math.min(3.0, newScale));
      setScale(clampedScale);
    }
  });

  // Create element state for the utility hooks
  const elementState = useMemo(
    () => {
      const state = {
        activeId,
        draggedItemId,
        activeElementId,
        currentPageItems,
        configElement,
        pageNumber,
        stepIndex,
        scale,
        pdfDimensions,
        filteredCurrentPageItems,
        approversCount,
        docType: docType || finalDocType, // 🎯 FIXED: Use finalDocType (from URL or props)
      };

      return state;
    },
    [
      activeId,
      draggedItemId,
      activeElementId,
      currentPageItems,
      configElement,
      pageNumber,
      stepIndex,
      scale,
      pdfDimensions,
      filteredCurrentPageItems,
      approversCount,
      docType,
      finalDocType, // 🎯 FIXED: Use finalDocType in dependencies
    ]
  );

  // Create element setters for the utility hooks
  const elementSetters = {
    setActiveId,
    setDraggedItemId,
    setActiveElementId,
    setCurrentPageItems,
    setPageFormItems,
    setConfigElement,
    setShowStylePanel,
    setStepIndex,
  };

  // Use the element and DnD utilities
  const {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleElementClick,
    handleFormItemValueChange,
    handleFormElementConfig,
    handleOpenConfigPanel,
    handleCloseConfigPanel,
    handleLayerSelect,
    handleStyleUpdate,
    handleLayerDelete,
    handleLayerDuplicate,
    handleGroupedDelete,
    activeElement,
    formItemsContent,
    dragOverlayContent,
    emptyCanvasContent,
    createFormItemsForPage, // 🎯 NEW: Access the new function
  } = useElementDndUtils({
    ...elementState,
    showStylePanel: false // Add missing required property
  },
    elementSetters,
    pdfFormAreaRef,
    isSettingsMode,
    handleCoordinatesUpdate  // 🎯 Pass coordinate update handler
  );

  // Function to toggle layer visibility
  const handleLayerVisibilityToggle = (itemId: string, visible: boolean) => {
    enqueueSnackbar("ฟีเจอร์การซ่อน/แสดงองค์ประกอบกำลังอยู่ระหว่างการพัฒนา", {
      variant: "info",
      autoHideDuration: 4000,
    });
  };

  // Save form data to API
  const handleSaveForm = async () => {
    const params: SaveFormParams = {
      setIsSaving,
      setSaveMessage,
      setIsConfirmModalOpen,
    };
    return saveFormAPI(params);
  };

  const handleReject = ({reason}: {reason: string}) => {
    // 🎯 FIXED: รวบรวมข้อมูลทั้งหมดจากทุกหน้า
    const allPageItems = Object.values(pageFormItems).flat();
    
    const params: RejectParams = {
      allPageItems, // 🎯 FIXED: ส่งข้อมูลทั้งหมดจากทุกหน้า
      currentPageItems, // 🎯 เก็บไว้เพื่อ backward compatibility
      documentData,
      mappingFormDataId: mappingFormDataId || "",
      stepIndex,
      reason, // 🎯 FIXED: Pass the reason parameter
      dispatch,
      setErrorMessage,
      setIsRejectModalOpen,
      setIsSuccessModalOpen,
      setIsErrorModalOpen,
    };
    setIsRejectModalOpen(false);
    return rejectAPI(params);
  };
  const handleRejectClick = () => {
    setIsConfirmModalOpen(false);
    setIsRejectModalOpen(true);
  };
  const handleApproveClick = () => {
    setIsConfirmModalOpen(true);
  };
  const handleApprove = async () => {
    // 🎯 FIXED: รวบรวมข้อมูลทั้งหมดจากทุกหน้า
    const allPageItems = Object.values(pageFormItems).flat();
    
    const params: ApproveParams = {
      allPageItems, // 🎯 FIXED: ส่งข้อมูลทั้งหมดจากทุกหน้า
      currentPageItems, // 🎯 เก็บไว้เพื่อ backward compatibility
      documentData,
      mappingFormDataId: mappingFormDataId || "",
      stepIndex,
      dispatch,
      setIsConfirmModalOpen,
      setIsSuccessModalOpen,
      setErrorMessage,
      setIsErrorModalOpen,
      mappingMoreFile: mappingMoreFileFromEvent.length > 0 ? mappingMoreFileFromEvent : mappingMoreFileDataFromRedux,
    };
    // console.log('params ->',params)
    setIsConfirmModalOpen(false);
    return approveAPI(params);
  };

  // ฟังก์ชันสำหรับจัดการเมื่อยืนยันการบันทึก
  const handleConfirmSave = async () => {
    try {
      setCurrentAction("save");
      setIsConfirmModalOpen(false);
      setIsSaving(true);

      // 🎯 DEBUG: Log to verify pdfFile has value when called via emit
      // console.log("🎯 [handleConfirmSave] pdfFile value:", pdfFile);
      // console.log("B2BformData =>>", B2BformData.forms);
      let flowData = [];
      let coTaxId = "";
      if(docType === "b2b" || docType === "b2c") {
        coTaxId = B2BformData.forms?.contractParty.taxId || "";
        const payerName = B2BformData.forms?.docsTypeDetail?.stampDutyPlayer?.fullName || "";
        const payerType = B2BformData.forms?.docsTypeDetail?.stampDutyBizPayer == "contractor" ? "internal" : "external"
        const payerEmail = B2BformData.forms?.docsTypeDetail?.stampDutyPlayer?.email || "";
        const payerIdCard = B2BformData.forms?.docsTypeDetail?.stampDutyPlayer?.idCard || "";
        appEmitter.emit("payerDetail", { payerName, payerType, payerEmail, payerIdCard });
      }

      if(B2BformData.forms && B2BformData.forms.contractParty.approvers && B2BformData.forms?.contractParty.approvers.length > 0) {
          flowData = B2BformData.forms?.contractParty?.approvers?.map((approver, index) => ({
            index: index,
            section: B2BformData.forms?.docsTypeDetail?.section == "มาตรา 9" ? "9" : "26,28",
            action: approver?.permissionType?.toLowerCase() as "approver" | "signer",
            validate_type: "",
            validate_data: "",
            selfie_video: false,
            script_video: "",
            type_entity: index === 0 ? "sender" : "personal",
            co_contract:approver.approverType,
            entity: B2BformData.forms?.contractParty.approvers?.[index].userList?.map((user) => ({
              ...user
              // username: user.userName || "",
            })),
            no_edit_mail: false,
          }))
        } else {
          flowData = workflowSteps;
        }
console.log("AAA type =>>", type);
console.log("AAAfinalDocTypeId =>>", finalDocTypeId);
const templateFormDataStr = sessionStorage.getItem("templateFormData");
const templateFormData = templateFormDataStr ? JSON.parse(templateFormDataStr) : null;
const typeDocNoFromTemplate = templateFormData?.contract?.document_type_id || "";

      const params: ConfirmSaveParams = {
        setIsConfirmModalOpen,
        setIsSuccessModalOpen,
        setIsErrorModalOpen,
        setIsEmailConfirmModalOpen,
        setTransactionId,
        setErrorMessage,
        setIsSaving,
        setSaveMessage,
        pdfFile,
        formTitle,
        pageFormItems,
        workflowSteps: flowData as WorkflowStep[],
        formId,
        typeCode: currentDocumentType || typeCode || "1", // 🎯 ส่ง typeCode
        workspaceId,
        folderId,
        type,
        docType,
        coTaxId,
        operator: B2BformData.forms?.contractParty.operator as OperatorDetail,
        paymentChannel: B2BformData.forms?.docsTypeDetail.paymentChannel || "",
        isTemplateMode: type === "template", // 🎯 NEW: Flag for template mode (check by type OR docTypeId)
        docTypeId: finalDocTypeId || typeDocNoFromTemplate || "", // 🎯 NEW: Document type ID for template (use finalDocTypeId from URL or props)
      };

      // console.log("params =>>", params);

      await confirmSaveAPI(params);
      // หาก API สำเร็จจะแสดง SuccessModal ผ่าน confirmSaveAPI แล้ว
    } catch (error) {
      // console.log("error =>>", error);
      setErrorMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      setIsErrorModalOpen(true);
      setIsSaving(false);
    }
  };

  // ฟังก์ชันสำหรับจัดการเมื่อยืนยันการส่ง email
  const handleConfirmEmailSending = async () => {
    try {
      setIsEmailConfirmModalOpen(false);
      // console.log("transactionId =>>", transactionId);
      if (transactionId) {
        await handleConfirmedEmailSending(
          transactionId,
          docType || "",
          setIsSuccessModalOpen,
          setIsErrorModalOpen,
          setErrorMessage
        );
      }
    } catch (error) {
      console.error("Error in handleConfirmEmailSending:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการส่งอีเมล");
      setIsErrorModalOpen(true);
    }
  };

  // ✅ ย้าย event listener ไปใน useEffect เพื่อป้องกันการ register ซ้ำ
  useEffect(() => {
    const handleFormSaved = async () => {
      await handleConfirmSave();
    };

    appEmitter.on("formSaved", handleFormSaved);

    // ✅ Cleanup function เมื่อ component unmount
    return () => {
      appEmitter.off("formSaved", handleFormSaved);
    };
  }, [
    // 🎯 FIXED: Include dependencies so event listener captures current values
    pdfFile,
    formTitle,
    pageFormItems,
    workflowSteps,
    formId,
    currentDocumentType,
    typeCode,
    workspaceId,
    folderId,
    type,
    docType,
    finalDocTypeId, // 🎯 NEW: Include finalDocTypeId for template mode detection
    B2BformData
  ]); // 🎯 FIXED: Include dependencies to capture current state values

  if (isFrontend) {
    setTimeout(() => {
      setIsPdfReady(true);
    }, 700);
  }

  // Update formTitle when initialTitle changes
  useEffect(() => {
    if (initialTitle) {
      setFormTitle(initialTitle);
    }
  }, [initialTitle]);

  // 🎯 Auto-open SettingDocsModal when template mode with B2B/B2C
  useEffect(() => {
    if (type === "template" && (docType === "b2b" || docType === "b2c") && isBackend && isMounted) {
      // Auto-open modal for template mode
      setIsSettingsMode(true);
    }
  }, [type, docType, isBackend, isMounted]);

  // Update the handleCategoryChange function to detect settings mode
  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      // เมื่อผู้ใช้เลือก category 'settings' จะเปลี่ยนไปยังโหมดการตั้งค่าเอกสาร
      // ซึ่งจะแสดงหน้า SettingDocument แทนที่ Canvas และ Right-sidebar
      if (categoryId === "settings") {
        setIsSettingsMode(true);
      } else if (isSettingsMode) {
        // If already in settings mode but selected another category, exit settings mode
        setIsSettingsMode(false);
      }
    },
    [isSettingsMode]
  );

  // 🎯 Handler สำหรับรับ validation status จาก SettingDocument
  const handleSettingsValidationChange = useCallback((isValid: boolean) => {
    setIsSettingsFormValid(isValid);
  }, []);

  // 🎯 Handler สำหรับรับ typeCode จาก SettingDocument
  const handleDocumentTypeChange = useCallback((newDocumentType: string) => {
    setCurrentDocumentType(newDocumentType);
  }, []);

  // 🎯 Handler สำหรับรับข้อมูลฟอร์มจาก SettingDocument
  const handleFormDataChange = useCallback((formData: any) => {
    setSettingsFormData(formData);
  }, []);

  // Handle file validation change (more-file specific)
  const handleFileValidationChange = (isValid: boolean) => {
    setIsFileValidationValid(isValid);
  };

  // Check general form validation (for non-more-file elements)
  const checkGeneralFormValidation = () => {
    // For now, we'll consider it always valid unless there are specific requirements
    // You can add specific validation logic here for text, checkbox, radio, etc.

    // Example: Check if required text fields have values
    const textElements = currentPageItems.filter(
      (item) => item.type === "text"
    );
    const requiredTextElements = textElements.filter(
      (item) => item.config?.required
    );

    // Check if all required text elements have values
    const hasAllRequiredTextValues = requiredTextElements.every(
      (item) =>
        item.value && typeof item.value === "string" && item.value.trim() !== ""
    );

    // For backward compatibility, we'll return true for now
    return true; // hasAllRequiredTextValues;
  };

  // Check general form validation when items change
  useEffect(() => {
    const isValid = checkGeneralFormValidation();
    setIsGeneralFormValid(isValid);
  }, [currentPageItems]);

  // Handle signature image event listener
  useEffect(() => {
    const cleanup = initializeSignatureImageListener(
      appEmitter,
      currentPageItems as any,
      pageNumber,
      setCurrentPageItems,
      setPageFormItems
    );

    return cleanup;
  }, [currentPageItems, pageNumber]);

  // Handle form value changes from text elements
  useEffect(() => {
    const handleFormValueChanged = (event: CustomEvent) => {
      const { id, value, type } = event.detail;

      // Update the form item value in current page items
      const updatedItems = currentPageItems?.map((item) => {
        if (item.id === id) {
          return { ...item, value };
        }
        return item;
      });
      // Update state
      setCurrentPageItems(updatedItems);
      setPageFormItems((prev) => {
        const newPageFormItems = {
          ...prev,
          [pageNumber]: updatedItems as any,
        };

        return newPageFormItems;
      });
    };

    // Add event listener
    window.addEventListener(
      "formValueChanged",
      handleFormValueChanged as EventListener
    );

    // Cleanup
    return () => {
      window.removeEventListener(
        "formValueChanged",
        handleFormValueChanged as EventListener
      );
    };
  }, [currentPageItems, pageNumber]);

  // Initialize user settings
  useEffect(() => {
    const handleUserSetting = (data: UserSettingData | null | undefined) => {
      // console.log('data => pdfTemplate',data)
    const formData = data;
      if (!formData) return;
      setUserSettings(formData);
    };

    const handleUserSettingMapping = (approvers: any[] | null | undefined) => {
      // console.log('CCC approvers =>', approvers)
      if (!approvers) return;

      // Update userSettings with the new approvers data
      setUserSettings((prev) => {
        const newUserSettings = {
          ...(prev || {}),
          approvers: approvers,
          formId: formId || "",
          documentId: documentId,
          typeCode: typeCode || "1",
        };
        // console.log('new user =>',newUserSettings)
        return newUserSettings;
      });
    };


    // Subscribe to userSetting events
    appEmitter.on("userSetting", handleUserSetting);
    appEmitter.on("userSettingMapping", handleUserSettingMapping);

    // Cleanup subscription
    return () => {
      appEmitter.off("userSetting", handleUserSetting);
      appEmitter.off("userSettingMapping", handleUserSettingMapping);
    };
  }, [documentId, formId, typeCode]);

  // Set default stepIndex based on currentUserStepIndex or fallback
  useEffect(() => {
    if (stepIndex === "") {
      // Use currentUserStepIndex from props if available (for Frontend mode)
      if (currentUserStepIndex !== undefined) {
        setStepIndex(currentUserStepIndex);
      } else if (isFrontend) {
        // For Frontend mode without currentUserStepIndex, default to "0" (0-based)
        setStepIndex("0");
      } else {
        // For Backend mode, use "all" (ทุกคน)
        setStepIndex("all");
      }
    }
  }, [stepIndex, currentUserStepIndex, isFrontend]);

  // Add function to handle user settings save
  const handleSaveUserSetting = async () => {
    const params: SaveUserSettingParams = {
      userSettings,
      documentId: documentId || "",
      formId: formId || "",
      setIsSettingsMode,
      setWorkflowSteps,
      handleCategoryChange,
      typeCode: currentDocumentType || typeCode || "1" // 🎯 ส่ง typeCode
    };
    //BUG: somtum mai aroy
    // return handleSaveUserSettingUtil(params, saveUserSettingAPI);
    setTimeout(() => {
      setIsPdfReady(true);
    }, 700);
    if (userSettings?.approvers) {
      try {
        // Transform and save the workflow steps
        const workflowData: WorkflowStep[] = userSettings?.approvers?.map(
          (approver) => ({
            index: approver?.index - 1,
            section: approver?.section === "มาตรา 9" ? "9" : "26,28",
            action: approver?.permission?.toLowerCase() as
              | "approver"
              | "signer"
              | "test",
            validate_type: approver?.validateType?.toLowerCase().includes("pin")
              ? "pin"
              : approver?.validateType.toLowerCase().includes("otp")
              ? "otp"
              : approver?.validateType.toLowerCase().includes("password")
              ? "password"
              : "",
            validate_data: approver?.validateData,
            selfie_video: approver?.selfieVideo,
            script_video: approver?.selfieMessage,
            type_entity:
              approver?.entityType === "sender"
                ? "sender"
                : approver?.entityType === "dept"
                ? "dept"
                : approver?.entityType === "role"
                ? "role"
                : "personal",
            // default fallback//=== "person" ? "sender" : "personal" as 'personal',
            // type_entity: approver.entityType = "personal",
            entity: approver?.entities?.map((entity) => ({
              id: entity?.id,
              name: entity?.email || entity?.name,
            })),
            no_edit_mail: false,
          })
        );
        // console.log('userSettings 1244 =>',userSettings.approvers)
        // Emit the approvers data through the event emitter
        appEmitter.emit("userSetting", {
          approvers: userSettings.approvers,
          formId: "",
          documentId: documentId,
          typeCode: typeCode || "1",
        });

        // 🎯 NEW: Also emit userSettingMapping event for FormSidebar
        appEmitter.emit("userSettingMapping", userSettings.approvers);

        // Here you would typically save to your backend

        // Exit settings mode and switch to default category
        setIsSettingsMode(false);
        setWorkflowSteps(workflowData);

        // Emit event to notify that user settings have been saved
        appEmitter.emit("userSettingSaved");

        // Reset to default category and notify FormSidebar
        if (handleCategoryChange) {
          handleCategoryChange("text");
        }

        return Promise.resolve();
      } catch (error) {
        enqueueSnackbar(`🎯 [PDFTemplate] Error saving user settings: ${error}`, {
          variant: "error",
          autoHideDuration: 3000,
        });
        return Promise.reject(error);
      }
    } else {
      // Exit settings mode and switch to default category
      setIsSettingsMode(false);

      // Emit event to notify that user settings have been saved
      appEmitter.emit("userSettingSaved");

      if (handleCategoryChange) {
        handleCategoryChange("text");
      }
      return Promise.resolve();
    }
  };

  // Intersection Observer for automatic page tracking
  useEffect(() => {
    if (!canvasRef.current || !numPages) return;

    const observerOptions = {
      root: canvasRef.current,
      rootMargin: "-20% 0px -20% 0px", // Trigger when page is 20% visible from top/bottom
      threshold: [0.1, 0.5, 0.9], // Multiple thresholds for better detection
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Find the page with the highest intersection ratio
      let maxVisiblePage = 1;
      let maxIntersectionRatio = 0;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const pageElement = entry.target as HTMLDivElement;
          const pageNumber = parseInt(pageElement.dataset.pageNumber || "1");

          if (entry.intersectionRatio > maxIntersectionRatio) {
            maxIntersectionRatio = entry.intersectionRatio;
            maxVisiblePage = pageNumber;
          }
        }
      });

      // Update visible page if it changed and has significant visibility
      if (maxIntersectionRatio > 0.1 && maxVisiblePage !== visiblePageNumber) {
        setVisiblePageNumber(maxVisiblePage);

        // Update pageNumber to maintain compatibility with existing functions
        if (maxVisiblePage !== pageNumber) {
          setPageNumber(maxVisiblePage);

          // Update currentPageItems for the visible page
          if (allPagesItems[maxVisiblePage]) {
            setCurrentPageItems(allPagesItems[maxVisiblePage]);
          } else {
            setCurrentPageItems([]);
          }
        }
      }
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    // Use setTimeout to ensure page elements are rendered before observing
    const timeoutId = setTimeout(() => {
      // Observe all page elements
      Object.values(pageRefs.current).forEach((pageElement) => {
        if (pageElement) {
          observer.observe(pageElement);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [canvasRef, numPages, visiblePageNumber, pageNumber, allPagesItems]);

  // Sync allPagesItems with pageFormItems
  useEffect(() => {
    setAllPagesItems(pageFormItems);
    // console.log('rawApproversData =>',rawApproversData)
    // console.log('allPagesItems =>',allPagesItems)
  }, [pageFormItems]);

  // 🎯 NEW: Send form items changes back to parent component
  useEffect(() => {
    if (onFormItemsChange && isViewMode) {
      // Convert pageFormItems back to flat array for parent component
      const allItems = Object.values(pageFormItems).flat();
      if (allItems.length > 0) {
        onFormItemsChange(allItems);
      }
    }
  }, [pageFormItems, onFormItemsChange, isViewMode]);

  const [form] = Form.useForm<DocsSetting>();
  useEffect(() => {
    const defaultValues = {
      docsType: B2BformData?.forms?.docsType || "B2B",
      docsTypeDetail: B2BformData?.forms?.docsTypeDetail || {},
      contractParty: {
        ...B2BformData?.forms?.contractParty,
        approvers: B2BformData?.forms?.contractParty?.approvers?.map((approver: any) => ({
          ...approver,
          userList: approver?.userList?.map((user: any) => ({
            ...user,
            fullName: user?.name || "",
            idCard: user?.id_card || "",
          })),
        })),
      },
    };
    form.setFieldsValue(defaultValues);
  }, [B2BformData])
  // const [allPagesItems, setAllPagesItems] = useState<PageFormItems>({});
  // B2BformData.forms.contractParty.approvers

  const validateSignatures = (allPagesItems: PageFormItems, signatureList: string[]) => {
    const allItems: FormItem[] = Object.values(allPagesItems).flat();
    // console.log('allItems ==>',allItems)
    if (allItems.length === 0) return false;
  
    const foundSignatures = new Set(
      allItems
        .filter(item => item.type === "signature")
        .map(item => String(item.actorId))
    );
    // console.log('foundSignatures => ',foundSignatures)
  
    return signatureList.every(sig => foundSignatures.has(sig));
  };
  
  
  const isValidateSigner = useMemo(() => {
    // console.log('isValidateSinger =>')
    let signerList: string[] = [];
    const approvers = B2BformData?.forms?.contractParty.approvers || [];
  
    approvers.forEach((approver, index) => {
      if (approver.permissionType === "Signer") {
        signerList.push(`${index}`);
      }
    });
  
    if (signerList.length > 0) {

      if (!Object.keys(allPagesItems).length) {
        return false;
      }

      return validateSignatures(allPagesItems, signerList);
    }
  

    return true;
  }, [allPagesItems, B2BformData]);

  const isValidateEsseal = useMemo(() => {
    //validate esseal
    if(B2BformData?.forms?.contractParty?.approvers && B2BformData?.forms?.docsTypeDetail?.section !== "มาตรา 9") {
      // console.log('formDataFlow =>',formDataFlow)
    const availableStepIndices = B2BformData?.forms?.contractParty?.approvers?.map((step,index) => index.toString());
    // console.log('availableStepIndices =>',availableStepIndices)
    const allMappings = buildAllMappings(pageFormItems, true, availableStepIndices);
    const {
      mappingStamp,
    } = allMappings;
    let contract = mappingStamp.some((stmap) => stmap.stampType == "ต้นสัญญา") 
    let co_contract = mappingStamp.some((stmap) => stmap.stampType == "คู่สัญญา") 
    if(B2BformData?.forms?.docsType == "B2B"){
        return contract && co_contract;
      } else {
        return contract
      }
    } else {
      return true;
    }
  }, [allPagesItems, B2BformData, formDataFlow]);
  
  
  return (
    <div className="grid grid-rows-[auto_1fr] h-full w-full bg-[#F6F8FA]">
      {/* แสดง top bar ทั้งในโหมดปกติและโหมด Settings */}
      <div className="z-50 bg-white shadow-sm">
        <StickyTopBar
          formTitle={formTitle}
          showStylePanel={showStylePanel && !isSettingsMode}
          configElement={configElement}
          isSaving={isSaving}
          onBack={() => {
            router.back();
          }}
          onCloseConfig={handleCloseConfigPanel}
          onStyleChange={handleStyleUpdate}
          onSaveForm={handleSaveForm}
          onReject={handleRejectClick}
          onApprove={handleApproveClick}
          onSaveUserSetting={handleSaveUserSetting}
          onFormTitleChange={(newTitle) => setFormTitle(newTitle)}
          version={documentId ? "1.0" : "1.0"}
          isSettingsMode={isSettingsMode}
          documentStatus={documentStatus}
          isFormValid={
            isSettingsMode ? isSettingsFormValid : isGeneralFormValid
          }
          isRequiredText={isRequired}
          isFileValidationValid={isFileValidationValid}
          isPdfReady={!!(pdfFile && showPdf && isPdfReady)}
          isCreatorOrSender={isCreatorOrSender} 
          setIsConfirmModalOpen={setIsConfirmModalOpen}
          isValidateSigner={isValidateSigner}
          isValidateEsseal={isValidateEsseal}
          setErrorMessage={setErrorMessage}
          setIsErrorModalOpenEseal={setIsErrorModalOpen}
          formDataFlow={formDataFlow}
          currentUserStepIndex={currentUserStepIndex}
          currentUserAction={currentUserAction}
          documentType={type} // 🎯 NEW: Pass documentType prop for template mode
        />
      </div>

      {isMounted && (
        <>
          <DndContext
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            autoScroll={true}
          >
            <div className="flex h-full overflow-hidden">
              {/* 🎯 RESPONSIVE: แสดง FormSidebar ในกรณี backend หรือ แสดง PDFThumbnails ในกรณี frontend */}
              {hasFormSidebar && !viewport.isMobile && (
                <>
                  {isBackend ? (
                    <>
                      <div className="lg:block hidden flex-shrink-0 h-full">
                        <FormSidebar
                          configElement={configElement}
                          onConfigChange={handleFormElementConfig}
                          onValueChange={handleFormItemValueChange}
                          onCloseConfig={handleCloseConfigPanel}
                          onDeleteItem={handleDeleteItem}
                          onGroupedDelete={handleGroupedDelete}
                          onElementClick={handleElementClick}
                          onCategoryChange={handleCategoryChange}
                          items={currentPageItems}
                          activePage={pageNumber}
                          numPages={numPages}
                          onLayerVisibilityToggle={handleLayerVisibilityToggle}
                          onLayerSelect={handleLayerSelect}
                          defaultCollapsed={
                            Object.values(pageFormItems).flat().length === 0
                          }
                          isSettingsMode={isSettingsMode}
                          approvers={approversData.length > 0 ? approversData : userSettings?.approvers}
                          formDataFlow={formDataFlow}
                          currentStepIndex={stepIndex}
                          onValidationChange={handleFileValidationChange}
                          isPdfReady={isPdfReady || !pdfFile}
                          docType={docType ||finalDocType} // 🎯 FIXED: Use finalDocType instead of docType
                          documentType={type} // 🎯 NEW: Pass documentType prop for template mode
                        />
                      </div>

                      {/* 🎯 RESPONSIVE: Mobile/Tablet Bottom Menu - แสดงอัตโนมัติและ expand เมื่อคลิก category */}
                      {!isSettingsMode && (
                        <MobileBottomMenu
                          configElement={configElement}
                          onConfigChange={(itemId, configData) => {
                            handleFormElementConfig(itemId, configData);
                          }}
                          onValueChange={handleFormItemValueChange}
                          onCloseConfig={handleCloseConfigPanel}
                          onDeleteItem={handleDeleteItem}
                          onGroupedDelete={handleGroupedDelete}
                          onElementClick={handleElementClick}
                          onCategoryChange={handleCategoryChange}
                          items={currentPageItems}
                          activePage={pageNumber}
                          numPages={numPages}
                          onLayerVisibilityToggle={handleLayerVisibilityToggle}
                          onLayerSelect={(item) => {
                            handleLayerSelect(item);
                          }}
                          defaultCollapsed={
                            Object.values(pageFormItems).flat().length === 0
                          }
                          isSettingsMode={isSettingsMode}
                          approvers={approversData.length > 0 ? approversData : userSettings?.approvers}
                          formDataFlow={formDataFlow}
                          currentStepIndex={stepIndex}
                          onStepIndexChange={handleStepIndexChange} // 🎯 NEW: Handler for changing step index
                          onValidationChange={handleFileValidationChange}
                          isPdfReady={isPdfReady}
                          pdfFile={pdfFile || ""}
                          docType={finalDocType}
                        />
                      )}
                    </>
                  ) : isFrontend && hasPDFThumbnail ? (
                    <div className="flex-shrink-0 h-full overflow-y-auto lg:block hidden">
                      <PDFThumbnails
                        pdfUrl={pdfFile || ""}
                        currentPage={pageNumber}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  ) : null}
                </>
              )}

              <div className="flex-1 h-full overflow-auto">
                {/* Main content area */} 
                { isSettingsMode && isBackend ? (
                  // 🎯 FIXED: Use SettingDocsTemplateModal ONLY when type === "template"
                  // Don't check finalDocTypeId because docTypeId can exist in document mode too
                  (() => {
                    // 🎯 DEBUG: Debug type value at line 1579
                    // const urlType = searchParams.get("type");
                    const typeFromProps = type;
                    // const typeFromURL = urlType;
                    const finalType = sessionStorage.getItem("typeForm") || typeFromProps || "create";
                    
                    console.log("🔍 [PDFTemplate:1579] Type Debug:", {
                      line: 1579,
                      typeFromProps: typeFromProps,
                      // typeFromURL: typeFromURL,
                      finalType: finalType,
                      isSettingsMode: isSettingsMode,
                      isBackend: isBackend,
                      condition1_template: finalType === "template",
                      condition2_useDocument: finalType === "useDocument",
                      condition3_default: finalType !== "template" && finalType !== "useDocument",
                      fullURL: typeof window !== "undefined" ? window.location.href : "",
                      allSearchParams: searchParams.toString(),
                    });
                    
                    if (finalType === "template" ) {
                      return (
                        <SettingDocsTemplateModal 
                          open={isSettingsMode}
                          onClose={() => {
                            setIsSettingsMode(false);
                          }}
                          pdfPage={pageNumber}
                          pdfName={title}
                          pdfUrl={pdfUrl}
                          docTypeId={finalDocTypeId} // 🎯 Pass docTypeId for template mode
                          workspaceId={workspaceId || searchParams.get("workspaceId") || ""} // 🎯 Pass workspaceId for template mode
                          isSave={()=>{}}
                        />
                      );
                    } else if (finalType === "useDocument") {
                      return (
                        <SettingDocsModalUseDocument
                          open={isSettingsMode}
                          onClose={() => {
                            setIsSettingsMode(false);
                          }}
                          pdfPage={pageNumber}
                          pdfName={title}
                          pdfUrl={pdfUrl}
                          from={"mapping"}
                          mode="document" // 🎯 FIXED: Always use document mode when type !== "template"
                          docTypeId={finalDocTypeId} // 🎯 Pass docTypeId even in document mode (for reference)
                          isSave={()=>{}}
                        />
                      );
                    } else {
                      return (
                        <SettingDocsModal 
                          open={isSettingsMode}
                          onClose={() => {
                            setIsSettingsMode(false);
                          }}
                          pdfPage={pageNumber}
                          pdfName={title}
                          pdfUrl={pdfUrl}
                          from={"mapping"}
                          mode="document" // 🎯 FIXED: Always use document mode when type !== "template"
                          docTypeId={finalDocTypeId} // 🎯 Pass docTypeId even in document mode (for reference)
                          isSave={()=>{}}
                        />
                      );
                    }
                  })()
                ) : (
                  <>
                    {pdfFile && showPdf && isPdfReady ? (
                      <div
                        ref={canvasRef}
                        className={`
                          relative w-full h-full overflow-auto 
                          flex justify-center items-start
                          ${viewport.isMobile ? 'p-2' : viewport.isTablet ? 'p-4' : 'p-8'}
                          transition-all duration-300
                        `}
                        style={{
                          ...getResponsiveContainerStyles(viewport),
                          // 🎯 RESPONSIVE: Dynamic background based on viewport
                          backgroundColor: viewport.isMobile ? '#FFFFFF' : '#F6F8FA',
                        }}
                      >
                        <div 
                          className={`
                            relative flex flex-col justify-center items-center
                            ${getPageSpacing(viewport)}
                            transition-all duration-300
                            ${viewport.isMobile ? 'w-full' : viewport.isDesktop ? 'w-auto' : 'w-full'}
                          `}
                          style={{
                            // 🎯 FIXED: Max width constraints - desktop ไม่ limit เพื่อให้ PDF แสดงขนาดธรรมชาติ
                            maxWidth: viewport.isMobile ? '100%' : viewport.isTablet ? '90%' : 'none',
                          }}
                        >
                          <Document
                            file={pdfFile}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={
                              <div className={`
                                flex justify-center items-center 
                                ${viewport.isMobile ? 'h-[400px]' : 'h-[600px]'}
                              `}>
                                {isLoadingPdf && (
                                  <div className="flex flex-col items-center gap-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className={`${viewport.isMobile ? 'text-sm' : 'text-base'}`}>
                                      กำลังโหลด PDF...
                                    </span>
                                  </div>
                                )}
                              </div>
                            }
                            data-pdf-document="true"
                            className="pdf-document-container"
                          >
                            {/* 🎯 RESPONSIVE: Render only current page with responsive scaling */}
                            {numPages && (
                              <div
                                key={pageNumber}
                                className={`relative ${viewport.isMobile ? 'mb-6' : 'mb-12'}`}
                                data-page-number={pageNumber}
                                style={getResponsivePdfWrapperStyles(viewport)}
                              >
                                <Page
                                  pageNumber={pageNumber}
                                  scale={responsiveScale}
                                  renderTextLayer={false}
                                  renderAnnotationLayer={false}
                                  className={`
                                    shadow-md
                                    ${viewport.isDesktop ? 'max-w-none' : 'max-w-full'}
                                    ${viewport.isMobile ? 'rounded-sm' : 'rounded-md'}
                                  `}
                                  width={viewport.isMobile ? viewport.viewport.width - 32 : undefined}
                                  data-pdf-page={pageNumber}
                                  data-scale={responsiveScale}
                                />

                                {/* 🎯 RESPONSIVE: FormCanvas for current page with responsive scaling */}
                                <div
                                  className="absolute top-0 bottom-0 left-0 right-0 pointer-events-auto"
                                  style={{ 
                                    zIndex: 10,
                                    // 🎯 RESPONSIVE: Touch action for mobile gestures
                                    touchAction: viewport.isMobile ? 'pan-x pan-y pinch-zoom' : 'auto',
                                  }}
                                >
                                  <FormCanvas
                                    hasPdfBackground={
                                      !!(pdfFile && showPdf)
                                    }
                                    pdfDimensions={
                                      pdfDimensions || undefined
                                    }
                                    scale={responsiveScale}
                                    ref={pdfFormAreaRef}
                                    onCoordinatesUpdate={
                                      handleCoordinatesUpdate
                                    }
                                    onLayerDelete={handleLayerDelete}
                                    onLayerDuplicate={
                                      handleLayerDuplicate
                                    }
                                    documentType={type} // 🎯 NEW: Pass documentType prop for template mode
                                  >
                                    {/* 🎯 RESPONSIVE: Current page with adaptive content */}
                                    {currentPageItems.length === 0 &&
                                    isBackend
                                      ? emptyCanvasContent
                                      : formItemsContent}
                                  </FormCanvas>
                                </div>
                              </div>
                            )}
                          </Document>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* 🎯 RESPONSIVE: No PDF fallback with adaptive sizing */}
                        <div className={`
                          flex flex-col gap-4 justify-center items-center min-h-[80vh]
                          ${viewport.isMobile ? 'px-4' : 'px-8'}
                        `}>
                          <div className="flex flex-col gap-1 justify-center items-center text-center">
                            <h1 className={`font-bold ${viewport.isMobile ? 'text-xl' : 'text-2xl'}`}>
                              {/* ไม่พบไฟล์ PDF */}
                              กําลังโหลดข้อมูล...
                            </h1>
                            <p className={`text-gray-500 ${viewport.isMobile ? 'text-sm' : 'text-base'}`}>
                              กรุณาตรวจสอบไฟล์ PDF ที่อัปโหลด
                            </p>
                          </div>
                          <button 
                            className={`btn-theme ${viewport.isMobile ? 'text-sm px-4 py-2' : ''}`}
                            onClick={() => {
                              router.push("/frontend");
                            }}
                          >
                            กลับหน้าหลัก
                          </button>
                        </div>
                      </>
                    )}

                    {/* 🎯 RESPONSIVE: PDF Controller Component with adaptive positioning */}
                    {pdfFile && showPdf && numPages && (
                      <PDFController
                        scale={scale}
                        setScale={setScale}
                        pdfDimensions={pdfDimensions}
                        pageNumber={pageNumber}
                        numPages={numPages}
                        containerRef={canvasRef}
                        onPageChange={handlePageChange}
                      />
                    )}
                  </>
                )}
              </div>

              {/* 🎯 RESPONSIVE: แสดง PDFThumbnails/DocumentDetails - ซ่อนบน mobile */}
              {hasPDFThumbnail && !isSettingsMode && !viewport.isMobile && (
                <div className={`
                  xl:block lg:hidden hidden h-full overflow-x-hidden overflow-y-auto z-20
                  ${viewport.isTablet ? 'w-64' : 'w-auto'}
                `}>
                  {isBackend ? (
                    <div className="h-full bg-white max-w-64 min-w-60 w-full">
                      {/* 🎯 FIXED: Use else if to prevent duplicate Select components */}
                      {userSettings?.approvers &&
                        userSettings.approvers.length > 0 ? (
                          <>
                          <div className="p-4 bg-[#F0F6FF] flex justify-between items-center">
                            <h3 className="font-medium">ผู้กรอกข้อมูลเอกสาร</h3>
                          </div>
                          <div className="space-y-4 p-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                ลำดับ
                              </label>
                              <Select
                                suffixIcon={<ChevronDown size={20} />}
                                className="w-full"
                                placeholder="เลือก workflow step"
                                value={stepIndex}
                                onChange={(value) =>
                                  handleStepIndexChange(value)
                                }
                                options={[
                                  { value: "all", label: "ทุกคน" },
                                  ...userSettings?.approvers?.map(
                                    (approver: any) => ({
                                      value: (approver?.index - 1).toString(), // 🎯 Convert to 0-based for API compatibility
                                      label: `คนที่ ${approver?.index}`,
                                    })
                                  ),
                                ]}
                              />
                              </div>
                            </div>
                          </>
                        ) : approversData &&
                          approversData.length > 0 ? (
                            <>
                            <div className="p-4 bg-[#F0F6FF] flex justify-between items-center">
                              <h3 className="font-medium">ผู้กรอกข้อมูลเอกสาร</h3>
                            </div>
                            <div className="space-y-4 p-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  ลำดับ
                                </label>
                                <Select
                                  suffixIcon={<ChevronDown size={20} />}
                                  className="w-full"
                                  placeholder="เลือก workflow step"
                                  value={stepIndex}
                                  onChange={(value) =>
                                    handleStepIndexChange(value)
                                  }
                                  options={[
                                    { value: "all", label: "ทุกคน" },
                                    ...approversData?.map(
                                      (approver: any) => ({
                                        value: (approver.index - 1).toString(), // 🎯 Convert to 0-based for API compatibility
                                        label: `คนที่ ${approver.index}`,
                                      })
                                    ),
                                  ]}
                                />
                                </div>
                              </div>
                            </>
                          ) : null}
                        
                        {/* 🎯 Show FormB2B or FormB2C based on docType for template mode */}
                        {/* Show when template mode OR when B2BformData has data */}
                        {((docType === "b2b" || docType === "b2c") && (type === "template" || B2BformData?.forms)) && (
                          <div className="document-collapse-container flex flex-col gap-20">
                            {(() => {
                              // Determine which form to show based on docType or B2BformData
                              const formType = docType === "b2b" 
                                ? "b2b" 
                                : docType === "b2c" 
                                ? "b2c" 
                                : (B2BformData?.forms?.docsType === "B2B" ? "b2b" : "b2c");
                              
                              // return formType === "b2b" ? (
                              //   <FormB2B 
                              //     open={true} 
                              //     pdfPage={pageNumber} 
                              //     pdfObject={pdfFile} 
                              //     form={form} 
                              //     style={"1column"}
                              //   />
                              // ) : (
                              //   <FormB2C 
                              //     open={true} 
                              //     pdfPage={pageNumber} 
                              //     pdfObject={pdfFile} 
                              //     form={form} 
                              //     style={"1column"}
                              //   />
                              // );
                              return (
                                <FormB2B 
                                  open={true} 
                                  pdfPage={pageNumber} 
                                  pdfObject={pdfFile} 
                                  form={form} 
                                  style={"1column"}
                                />
                              )
                            })()}
                          </div>
                        )}
                      {/* แสดง PDFThumbnails ด้านล่าง */}
                      {/* <div className={`${docType === "b2b" ? "mt-0" : "mt-6"}`}> */}
                      <div className={`mt-0`}>
                        <PDFThumbnails
                          pdfUrl={pdfFile || ""}
                          currentPage={pageNumber}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    </div>
                  ) : isFrontend && hasDocumentDetail && pdfFile && showPdf && numPages && (
                    <div style={{ minWidth: "332px" }}>
                      <DocumentDetails
                        company={documentData?.business_name || "INET"} //debug Company title not inclue
                        documentName={initialTitle || "[debug]Sample Document"}
                        documentId={
                          documentData?.document_id || "[debug]DOC-123456"
                        }
                        mappingFormDataId={
                          documentData?.mapping_form_data_id._id
                        }
                        business_id={(() => {
                          const businessId = documentData?.business_id || BusinessUtils.getBusinessId() || "";
                          return businessId;
                        })()}
                        transactionId={documentData?._id}
                        // sender={`${documentData?.flow_data[0].entity[0].first_name_th} ${documentData?.flow_data[0].entity[0].last_name_th}`}
                        sender={documentData?.flow_data[0].entity[0].name || ""}
                        sentDate={renderFormattedDate(documentData?.created_at)}
                        sentTime={renderFormattedTime(documentData?.created_at)}
                        obj_box={{}}
                        approvers={formDataFlow}
                        formDataFlow={(() => {
                          return formDataFlow;
                        })()}
                        currentUserStepIndex={stepIndex} // 🎯 NEW: Pass current user's step index for validation
                        attachFileStatus={(() => {
                          // 🎯 Use same logic as page.tsx for flow validation
                          if (!documentData?.mapping_form_data_id?.mapping_more_file) return false;
                          
                          const isGuest = sessionStorage.getItem("isGuest") === "true";
                          const transactionType = sessionStorage.getItem("transactionType");
                          const guestEmail = sessionStorage.getItem("guestName") || "";
                          const guestEmail2 = sessionStorage.getItem("guestEmail") || "";
                          const b2bUserContext = sessionStorage.getItem("b2bUserContext") || "";
                          
                          // 🎯 กำหนด email ที่จะใช้ตาม transaction type
                          const effectiveEmail = transactionType === "b2b" ? b2bUserContext : guestEmail;
                          const effectiveEmail2 = transactionType === "b2b" ? "" : guestEmail2;
                          const isEffectiveGuest = transactionType === "b2c" || isGuest;
                          
                          const flow_data_index = getFlowDataIndex(documentData, isEffectiveGuest, effectiveEmail, effectiveEmail2);
                          
                          return documentData.mapping_form_data_id.mapping_more_file.some((item: any) => {
                            const isInFlow = flow_data_index.includes(item.step_index?.toString() || "");
                            return isInFlow;
                          });
                        })()}
                        attachFileData={(() => {
                          // 🎯 Use same logic as page.tsx for flow validation
                          if (!documentData?.mapping_form_data_id?.mapping_more_file) return [];
                          
                          const isGuest = sessionStorage.getItem("isGuest") === "true";
                          const transactionType = sessionStorage.getItem("transactionType") || "";
                          const guestEmail = sessionStorage.getItem("guestName") || "";
                          const guestEmail2 = sessionStorage.getItem("guestEmail") || "";
                          const b2bUserContext = sessionStorage.getItem("b2bUserContext") || "";
                          
                          // 🎯 กำหนด email ที่จะใช้ตาม transaction type
                          const effectiveEmail = transactionType === "b2b" ? b2bUserContext : guestEmail;
                          const effectiveEmail2 = transactionType === "b2b" ? "" : guestEmail2;
                          const isEffectiveGuest = transactionType === "b2c" || isGuest;
                          const flow_data_index = getFlowDataIndex(documentData, isEffectiveGuest, effectiveEmail, effectiveEmail2);
                          if(documentStatus == "Y") {
                            return documentData.mapping_form_data_id.mapping_more_file;
                          } else {
                          return documentData.mapping_form_data_id.mapping_more_file.filter((item: any) => {
                              const isInFlow = flow_data_index.includes(item.step_index?.toString() || "");
                              return isInFlow;
                            });
                          }
                        })()}
                        statusFormDataFlow={documentStatus || ""}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            <DragOverlay>{dragOverlayContent}</DragOverlay>
          </DndContext>

          {/* 🎯 FIXED: Modal Components - ย้ายออกมาจาก conditional rendering เพื่อให้แสดงได้ทุก viewport */}
          {/* Backend Modal Components */}
          {isBackend && (
            <>
              <ConfirmModal
                open={isConfirmModalOpen}
                titleName="ส่งเอกสาร"
                message="คุณต้องการส่งเอกสารนี้ หรือไม่?"
                onConfirm={handleConfirmSave}
                modalIcon={confirmIcon.src}
                onCancel={() => {
                  setIsConfirmModalOpen(false);
                  setIsSaving(false);
                }}
              />

              <ConfirmModal
                open={isEmailConfirmModalOpen}
                titleName="ยืนยันการส่งอีเมล"
                message="คุณต้องการส่งเอกสารสัญญาให้ผู้ลงนามเลยหรือไม่"
                onConfirm={handleConfirmEmailSending}
                modalIcon={confirmIcon.src}
                onCancel={() => {
                  setIsEmailConfirmModalOpen(false);
                  setIsSuccessModalOpen(true);
                }}
                cancelButtonText="บันทึกร่าง"
              />

              <SuccessModal
                open={isSuccessModalOpen}
                titleName="บันทึกสำเร็จ"
                message={type === "template" ? "สร้าง Template สำเร็จ" : "บันทึกฟอร์มเรียบร้อยแล้ว"}
                onClose={() => {
                  setIsSuccessModalOpen(false);
                  // 🎯 NEW: Redirect based on mode
                  if (type === "template") {
                    router.push("/backend"); // Go back to template list
                  } else {
                    router.push("/document/statusContract");
                  }
                }}
                autoCloseDelay={2000}
              />
            </>
          )}

          {/* Frontend Modal Components */}
          {isFrontend && (
            <>
              <ConfirmModal
                open={isConfirmModalOpen}
                titleName="อนุมัติ"
                message="คุณต้องการอนุมัติเอกสารนี้ ใช่หรือไม่?"
                onConfirm={handleApprove}
                modalIcon={approve_icon.src}
                onCancel={() => {
                  setIsConfirmModalOpen(false);
                }}
              />
              <RejectModal
                open={isRejectModalOpen}
                titleName="ปฏิเสธ"
                modalIcon={rejected_icon.src}
                onConfirm={(reason) => handleReject({reason: reason || ""})}
                message="หากคุณต้องการปฏิเสธการอนุมัติเอกสารนี้? กรุณาระบุเหตุผลการปฏิเสธ"
                onCancel={() => {
                  setIsRejectModalOpen(false);
                }}
              />
              <SuccessModal
                open={isSuccessModalOpen}
                titleName="สำเร็จ"
                onClose={() => {
                  setIsConfirmModalOpen(false);
                  setIsSuccessModalOpen(false);
                  if (isGuest) {
                    window.location.reload();
                  } else {
                    router.push("/document/statusContract");
                  }
                }}
                autoCloseDelay={2000}
              />
            </>
          )}

          {/* Error Modal - แสดงได้ทั้ง backend และ frontend */}
          <ErrorModal
            open={isErrorModalOpen}
            titleName={
              currentAction === "save"
                ? "ไม่สามารถส่งเอกสาร"
                : currentAction === "approve"
                ? "เกิดข้อผิดพลาดไม่สามารถอนุมัติได้"
                : currentAction === "reject"
                ? "เกิดข้อผิดพลาดไม่สามารถปฏิเสธได้"
                : "เกิดข้อผิดพลาด"
            }
            message={errorMessage}
            onClose={() => {
              setIsErrorModalOpen(false);
              setCurrentAction("");
              if (errorMessage === "เอกสารฉบับนี้จะถูกเก็บไว้ในสถานะร่างและจะสมบูรณ์หลังจากคู่สัญญายืนยันตัวตนสำเร็จ") {
                setIsSuccessModalOpen(true);
              }
            }}
          />
        </>
      )}
    </div>
  );
};

export default PDFTemplate;