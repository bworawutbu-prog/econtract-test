"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button, Tooltip, Input, Select } from "antd";
// import { useDraggable } from "@dnd-kit/core";
import {
  LayoutGrid,
  Type,
  ChevronLeft,
  Plus,
  Settings,
  FileEdit,
  Calendar,
  ChevronDown,
  StampIcon,
  FileDigit,
  Settings2,
  UserRoundCogIcon,
  icons,
  CircleDotIcon,
  SquareCheck,
} from "lucide-react";
import Image from "next/image";
import SignatureIcon from "@/assets/webp/signature.webp";
import appEmitter from "@/store/libs/eventEmitter";
import { useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store";
import {
  selectMainDocument,
  selectAttachedDocuments,
  StoredDocument,
} from "@/store/slices/documentStorageSlice";
import { FormElementConfigData } from "./FormElementConfig";
import LayerPanel from "./LayerPanel";
import { FormItem } from "../../../store/types/FormTypes";

// Tool categories definition
const toolCategories = [
  {
    id: "settings",
    icon: <UserRoundCogIcon size={20} />,
    label: "Settings",
  },
  {
    id: "text",
    icon: <Type size={20} />,
    label: "Text",
  },
  // {
  //   id: "dateTime",
  //   icon: <Calendar size={20} />,
  //   label: "Date / Time",
  // },
  {
    id: "signature",
    icon: (isActive: boolean) => (
      <div className={isActive ? "brightness-0 invert" : ""}>
        <Image src={SignatureIcon} alt="Signature" width={20} height={20} />
      </div>
    ),
    label: "Signature",
  },
  // {
  //   id: "checkboxElements",
  //   icon: <SquareCheck size={20} />,
  //   label: "Checkbox",
  // },
  // {
  //   id: "radioElements",
  //   icon: <CircleDotIcon size={20} />,
  //   label: "Radio",
  // },
  {
    id: "stamp",
    icon: <StampIcon size={20} />,
    label: "Stamp",
  },
  // {
  //   id: "docNo",
  //   icon: <FileDigit size={20} />,
  //   label: "Doc No",
  // },
  {
    id: "more-file",
    icon: <FileEdit size={20} />,
    label: "More File",
  },
  // {
  //   id: "settingsDoc",
  //   icon: <Settings size={20} />,
  //   label: "Settings Doc",
  // },
  // {
  //   id: "elements",
  //   icon: <LayoutGrid size={24} />,
  //   label: "Elements",
  // },
];

// Define form element types
export const formElements = [
  {
    id: "text-input",
    type: "text",
    label: "Add Text",
    icon: <Plus size={20} />,
    categoryId: "text",
  },
  {
    id: "date-input",
    type: "date",
    label: "Add Date",
    icon: <Plus size={20} />,
    categoryId: "dateTime",
  },
  {
    id: "select",
    type: "select",
    label: "เลือกตัวเลือก",
    icon: <Plus size={20} />,
    categoryId: "elements",
  },
  {
    id: "checkbox",
    type: "checkbox",
    label: "Checkbox",
    icon: <Plus size={20} />,
    categoryId: "checkboxElements",
  },
  {
    id: "radio",
    type: "radio",
    label: "Radio",
    icon: <Plus size={20} />,
    categoryId: "radioElements",
  },
  {
    id: "stamp",
    type: "stamp",
    label: "Stamp",
    icon: <Plus size={20} />,
    categoryId: "stampElements",
  },
  {
    id: "date",
    type: "date",
    label: "วันที่",
    icon: <Plus size={20} />,
    categoryId: "dateTimeElements",
  },
  {
    id: "signature",
    type: "signature",
    label: "ลายเซ็น",
    icon: <Plus size={20} />,
    categoryId: "signature",
  },
  // {
  //   id: "more-file",
  //   type: "more-file",
  //   label: "More File",
  //   icon: <Plus size={20} />,
  //   categoryId: "more-file",
  // },
];

// Clickable form element component (not draggable anymore)
export const FormElement: React.FC<{
  id: string;
  type: string;
  label: string;
  step_index?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: (element: { id: string; type: string; label: string }) => void;
  style?: React.CSSProperties;
}> = ({ id, type, label, icon, onClick, disabled, style }) => {
  // const { attributes, listeners, setNodeRef, transform } = useDraggable({
  //   id,
  // });

  // const style = transform
  //   ? {
  //       transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  //     }
  //   : undefined;

  return (
    <div
      // ref={setNodeRef}
      // {...listeners}
      // {...attributes}
      className={`p-2 mb-2 bg-white hover:bg-blue-100 transition-all duration-300 border border-theme text-theme rounded-xl ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      style={style}
      onClick={() => !disabled && onClick && onClick({ id, type, label })}
    >
      <div className="w-full flex items-center justify-center gap-1">
        <span className="mr-2">{icon}</span>
        <span className="text-medium font-medium">{label}</span>
      </div>
    </div>
  );
};

interface FormSidebarProps {
  configElement: FormItem | null;
  onConfigChange: (itemId: string, configData: FormElementConfigData) => void;
  onValueChange: (
    id: string,
    newValue: string | string[] | boolean | number,
    checkboxOptions?: string[]
  ) => void;
  onCloseConfig: () => void;
  onDeleteItem: (itemId: string) => void;
  onGroupedDelete?: (itemIds: string[]) => void; // Add grouped delete handler
  onElementClick: (element: {
    id: string;
    type: string;
    label: string;
    dateTimeType?: string;
  }) => void;
  onCategoryChange: (categoryId: string) => void;
  items: FormItem[];
  activePage: number;
  numPages?: number | null;
  onLayerVisibilityToggle: (itemId: string, visible: boolean) => void;
  onLayerSelect: (item: FormItem) => void;
  defaultCollapsed?: boolean;
  isSettingsMode?: boolean;
  approvers?: {
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
  formDataFlow?: any[]; // 🎯 NEW: Form data flow from flow_data
  currentStepIndex?: string;
  onValidationChange?: (isValid: boolean) => void;
  isPdfReady?: boolean;
  pdfFile?: string;
  docType?: string; // Add docType prop to determine document type
  documentType?: string; // 🎯 NEW: Document mode (create, draft, template)
  isViewMode?: boolean; // 🎯 NEW: View mode prop
}

// Main component using PDFToolbar styling
const FormSidebar: React.FC<FormSidebarProps> = ({
  configElement,
  onConfigChange,
  onValueChange,
  onCloseConfig,
  onDeleteItem,
  onGroupedDelete,
  onElementClick,
  onCategoryChange,
  items,
  activePage,
  numPages,
  onLayerVisibilityToggle,
  onLayerSelect,
  defaultCollapsed = false,
  isSettingsMode = false,
  approvers = [],
  formDataFlow = [],
  currentStepIndex,
  onValidationChange,
  isPdfReady,
  pdfFile,
  docType,
  documentType,
  isViewMode = false, // 🎯 มีค่า default เป็น false
}) => {

  const searchParams = useSearchParams();

  // State สำหรับตรวจสอบว่าเป็นการอัปโหลดไฟล์ใหม่หรือไม่
  const [isNewFileUpload, setIsNewFileUpload] = useState(false);
  const [hasUserSettingsSaved, setHasUserSettingsSaved] = useState(false);
  const [dateTimeType, setDateTimeType] = useState<string>("date");
  
  // 🎯 NEW: State for attached documents
  const [selectedAttachedDoc, setSelectedAttachedDoc] = useState<string>("");
  
  // 🎯 NEW: Get documents from Redux instead of sessionStorage
  const mainDocumentFromRedux = useAppSelector(selectMainDocument);
  const attachedDocumentsFromRedux = useAppSelector(selectAttachedDocuments);
  
  // 🎯 NEW: Get main document info from Redux or URL params (fallback)
  const mainDocumentUrl = mainDocumentFromRedux?.url || searchParams.get("pdfUrl") || "";
  const mainDocumentTitle = mainDocumentFromRedux?.name || searchParams.get("title") || "";
  
  // 🎯 NEW: Convert Redux documents to list format for compatibility
  const attachedDocsList = attachedDocumentsFromRedux.map((doc: StoredDocument) => ({
    url: doc.url,
    name: doc.name,
    size: doc.size,
    index: doc.index,
  }));

  // ตรวจสอบว่าเป็นการอัปโหลดไฟล์ใหม่หรือไม่
  useEffect(() => {
    const pdfUrl = searchParams.get("pdfUrl");
    const title = searchParams.get("title");

    // ถ้ามี pdfUrl และ title ใน URL parameters แสดงว่าเป็นการอัปโหลดไฟล์ใหม่
    if (pdfUrl && title) {
      setIsNewFileUpload(true);
      setHasUserSettingsSaved(false);
    }
  }, [searchParams]);

  // 🎯 NEW: Initialize selected document to main document if available and not already set
  useEffect(() => {

    // 🎯 NEW: Initialize selected document to main document if available and not already set
    if (mainDocumentUrl && !selectedAttachedDoc) {
      setSelectedAttachedDoc(mainDocumentUrl);
    }
  }, [mainDocumentUrl, selectedAttachedDoc, mainDocumentFromRedux, attachedDocumentsFromRedux]);

  // Listen for user settings saved event
  useEffect(() => {
    const handleUserSettingSaved = () => {
      //
      setHasUserSettingsSaved(true);
      setIsNewFileUpload(false);

      // Reset to default category when settings are saved
      setActiveCategory("text");
    };

    // 🎯 NEW: Listen for userSettingMapping event from SettingDocument
    const handleUserSettingMapping = (approvers: any[] | undefined) => {
      if (approvers) {

        // The approvers prop will be updated by PDFTemplate.tsx
      }
    };

    appEmitter.on("userSettingSaved", handleUserSettingSaved);
    appEmitter.on("userSettingMapping", handleUserSettingMapping);

    return () => {
      appEmitter.off("userSettingSaved", handleUserSettingSaved);
      appEmitter.off("userSettingMapping", handleUserSettingMapping);
    };
  }, []);

  // ตั้งค่า activeCategory เป็น "settings" โดยอัตนมัติเมื่อเป็นการอัปโหลดไฟล์ใหม่
  // แต่ไม่เข้าสู่ settings mode หาก docType เป็น "b2b" หรือ "b2c"
  useEffect(() => {
    if (isNewFileUpload && !hasUserSettingsSaved) {
      // สำหรับ B2B และ B2C documents ให้ข้ามการตั้งค่าและไปที่หน้า mapping โดยตรง
      if (docType === "b2b" || docType === "b2c") {
        setActiveCategory("text");
        setHasUserSettingsSaved(true); // Mark as saved to prevent auto-settings mode
        setIsNewFileUpload(false);
        if (onCategoryChange) {
          onCategoryChange("text");
        }
      } else {
        // สำหรับ document types อื่นๆ ให้เข้าสู่ settings mode ตามปกติ
        setActiveCategory("settings");
        if (onCategoryChange) {
          onCategoryChange("settings");
        }
      }
    }
  }, [isNewFileUpload, hasUserSettingsSaved, onCategoryChange, docType]);

  // กำหนดว่าควรซ่อนเครื่องมือหรือไม่ - แต่ไม่ซ่อนใน settings mode เพื่อให้สามารถเปลี่ยน category ได้
  // สำหรับ B2B และ B2C documents ไม่ซ่อนเครื่องมือเพราะข้าม settings mode
  const hideTools = isNewFileUpload && !hasUserSettingsSaved && docType !== "b2b" && docType !== "b2c";

  const [isExpanded, setIsExpanded] = useState(
    !defaultCollapsed && !hideTools && !isSettingsMode
  );
  const [activeCategory, setActiveCategory] = useState<string>("text");
  const [isFormValid, setIsFormValid] = useState<boolean>(true);

  useEffect(() => {
    setIsExpanded(!defaultCollapsed && !hideTools && !isSettingsMode);
  }, [defaultCollapsed, hideTools, isSettingsMode]);

  useEffect(() => {
    if (hideTools || isSettingsMode) {
      setIsExpanded(false);
    }
  }, [hideTools, isSettingsMode]);

  const handleCategoryClick = (categoryId: string) => {
    // ไม่ expand เมื่อเลือก settings category
    if (!isExpanded && categoryId !== "settings") {
      setIsExpanded(true);
    }
    setActiveCategory(categoryId);

    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  const handleElementClick = (
    element: { id: string; type: string; label: string; dateTimeType?: string },
    actorId?: string
  ) => {
    if (onElementClick) {
      // For date elements with dateTimeType === "date", create 3 separate elements
      if (element.type === "date" && element.dateTimeType === "date") {
        // 🎯 FIXED: Send a single date element instead of 3 separate elements
        // This allows elementDndUtils.tsx to create all 3 date inputs at once
        const dateElement = {
          id: element.id,
          type: "date", // Keep as "date" type
          label: "Date",
          dateTimeType: "date", // This will trigger the creation of 3 elements
          ...(actorId && { actorId }),
          ...(actorId && { step_index: actorId }),
        };

        // Call onElementClick only once with the date element
        onElementClick(dateElement);
      } else {
        // For other elements, use the original logic
        const elementWithType = {
          ...element,
          ...(actorId && { actorId }),
          ...(actorId && { step_index: actorId }),
          // For date elements, always use the current dateTimeType
          ...(element.type === "date" && { dateTimeType }),
        };
        onElementClick(elementWithType);
      }
    }
  };

  // Calculate total file size across all more-file items
  const calculateTotalFileSize = () => {
    const moreFileItems = items.filter((item) => item.type === "more-file");
    const totalSize = moreFileItems.reduce((total, item) => {
      const fileSize = (item as any).maxFileSize ?? 0;
      return total + fileSize;
    }, 0);

    return totalSize;
  };

  // Check if all more-file items have valid typeName
  const checkTypeNameValidation = () => {
    const moreFileItems = items.filter((item) => item.type === "more-file");

    return moreFileItems.every((item) => {
      const typeName = (item as any).typeName ?? "";
      const isValid = typeName.trim() !== "";
      return isValid;
    });
  };

  // Global validation check
  const checkMoreFileValidation = () => {
    const totalSize = calculateTotalFileSize();
    const isFileSizeValid = totalSize <= 100;
    const isTypeNameValid = checkTypeNameValidation();
    const isValid = isFileSizeValid && isTypeNameValid;

    return isValid;
  };

  // Handle validation change
  const handleValidationChange = (isValid: boolean) => {
    // Combine local validation with more-file validation
    const moreFileIsValid = checkMoreFileValidation();
    const combinedIsValid = isValid && moreFileIsValid;

    setIsFormValid(combinedIsValid);
    if (onValidationChange) {
      onValidationChange(combinedIsValid);
    }
  };

  // Check more-file validation whenever items change
  useEffect(() => {
    const moreFileIsValid = checkMoreFileValidation();
    setIsFormValid(moreFileIsValid);
    if (onValidationChange) {
      onValidationChange(moreFileIsValid);
    }
  }, [items]);

  // Convert formDataFlow to Actor format (prioritize formDataFlow over approvers)
  const actors = useMemo(() => {
    if (!approvers || approvers.length === 0) return null;

    const convertedActors = approvers?.map((approver) => ({
      id: `${approver.index - 1}`, // 🎯 Convert to 0-based for API compatibility
      name: `คนที่ ${approver.index}`, // Keep display name as 1-based for user
      step_index: `${approver.index - 1}`, // 🎯 Convert to 0-based for API compatibility
      role: approver.role,
      permission: approver.permission,
      section: approver.section,
      validateType: approver.validateType,
      validateData: approver.validateData,
      entities: approver.entities,
      order: approver.index - 1, // 🎯 Convert to 0-based for API compatibility

    }));
    
    return convertedActors;
  }, [formDataFlow, approvers, activeCategory]);

  // 🎯 NEW: Check if current stepIndex has permissionType "Signer" or "Approver"
  const currentStepPermissionType = useMemo(() => {
    if (!approvers || approvers.length === 0) return null;
    if (currentStepIndex === "all") return null;
    
    // Find the approver that matches the current stepIndex
    const currentApprover = approvers.find((approver) => {
      const approverStepIndex = `${approver.index - 1}`; // Convert to 0-based
      return approverStepIndex === currentStepIndex;
    });
    
    return currentApprover?.permission || null;
  }, [approvers, currentStepIndex]);

  // 🎯 NEW: Filter toolCategories based on permissionType
  const filteredToolCategories = useMemo(() => {
    // If currentStepIndex is "all" or no permission type found, show all categories
    if (currentStepIndex === "all" || !currentStepPermissionType) {
      return toolCategories;
    }
    
    // Filter out signature category if permissionType is "Approver"
    if (currentStepPermissionType === "Approver") {
      return toolCategories.filter(category => category.id !== "signature");
    }
    
    // Show all categories for "Signer" or other permission types
    return toolCategories;
  }, [currentStepIndex, currentStepPermissionType]);

  // 🎯 NEW: Handler for document change (both main and attached)
  const handleAttachedDocChange = (value: string) => {
    setSelectedAttachedDoc(value);
    
    // Check if it's the main document (special value "main" or matches mainDocumentUrl)
    if (value === "main" || value === mainDocumentUrl) {
      // Emit event for main document
      appEmitter.emit("changeAttachedDocument", {
        url: mainDocumentUrl,
        index: -1, // 🎯 Use -1 to indicate main document
        isMain: true,
      });
    } else {
      // Emit event for attached document (from Redux)
      const docIndex = attachedDocumentsFromRedux.findIndex((doc: StoredDocument) => doc.url === value);
      appEmitter.emit("changeAttachedDocument", {
        url: value,
        index: docIndex,
        isMain: false,
      });
    }
  };

  const renderToolContent = () => {
    // 🎯 NEW: Show Select for documents (both main and attached) in settingsDoc category
    if (activeCategory === "settingsDoc") {
      // 🎯 Create options array with main document first, then attached documents
      const documentOptions = [];
      
      // Add main document option if available (from Redux)
      if (mainDocumentFromRedux) {
        documentOptions.push({
          value: mainDocumentFromRedux.url,
          label: `📄 เอกสารหลัก: ${mainDocumentFromRedux.name || "เอกสารหลัก"}`,
        });
      }
      
      // Add attached documents options (from Redux)
      attachedDocumentsFromRedux.forEach((doc: StoredDocument) => {
        documentOptions.push({
          value: doc.url,
          label: `📎 เอกสารแนบ ${doc.index + 1}: ${doc.name || `เอกสารแนบ ${doc.index + 1}`}`,
        });
      });
      
      // 🎯 Initialize selected value to main document if not set
      const currentValue = selectedAttachedDoc || (mainDocumentUrl ? mainDocumentUrl : "");
      
      return (
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เลือกเอกสาร
              </label>
              <Select
                suffixIcon={<ChevronDown size={20} />}
                className="w-full max-w-72"
                placeholder="เลือกเอกสาร"
                value={currentValue}
                onChange={handleAttachedDocChange}
                options={documentOptions}
                disabled={documentOptions.length === 0}
              />
              {documentOptions.length === 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  ไม่มีเอกสาร กรุณาอัปโหลดเอกสารจากหน้า "อัปโหลดเอกสารชุด"
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Don't show tools for signature, more-file, and stamp categories - they will be shown in actors
    if (
      activeCategory === "signature" ||
      activeCategory === "more-file" ||
      activeCategory === "stamp"
    ) {
      return null;
    }

    // Special handling for dateTime category - show only the FormElement button
    if (activeCategory === "dateTime") {
      // Count existing date elements to generate unique ID
      const existingDateItems = items.filter((item) => item.type === "date");
      const dateCount = existingDateItems.length + 1;
      const uniqueId = `${dateTimeType}-${dateCount}`;

      return (
        <div className={`p-4`}>
          {currentStepIndex === "all" ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-blue-600 text-sm font-medium mb-2">
                📅 เลือก "ผู้กรอกข้อมูลเอกสาร"
              </div>
              <div className="text-blue-500 text-xs">
                กรุณาเลือกลำดับผู้กรอกข้อมูลจากเมนูด้านขวา<br />
                เพื่อเริ่มสร้างองค์ประกอบวันที่
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              <FormElement
                id={uniqueId}
                type="date"
                label={dateTimeType === "date" ? "Date" : "Period Date"}
                icon={<Plus size={20} />}
                onClick={(element) => {
                  // Pass the selected dateTime type to the element
                  const elementWithType = {
                    ...element,
                    dateTimeType: dateTimeType,
                  };
                  handleElementClick(elementWithType);
                }}
                disabled={currentStepIndex === "all"}
                style={{ display: currentStepIndex === "all" ? "none" : "block" }}
              />
            </div>
          )}
        </div>
      );
    }

    // For all other categories, show regular form elements
    const categoryTools = formElements.filter(
      (element) => element.categoryId === activeCategory
    );

    return (
      <div className={`p-4`}>
        {currentStepIndex === "all" ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-blue-600 text-sm font-medium mb-2">
              📝 เลือก "ผู้กรอกข้อมูลเอกสาร"
            </div>
            <div className="text-blue-500 text-xs">
              กรุณาเลือกลำดับผู้กรอกข้อมูลจากเมนูด้านขวา<br />
              เพื่อเริ่มสร้างองค์ประกอบฟอร์ม
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {categoryTools?.map((tool) => (
              <FormElement
                key={tool.id}
                id={tool.id}
                type={tool.type}
                label={tool.label}
                icon={tool.icon}
                onClick={(element) => handleElementClick(element)}
                disabled={currentStepIndex === "all"}
                style={{ display: currentStepIndex === "all" ? "none" : "block" }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="form-sidebar flex h-full">
      {/* 🎯 2. ซ่อนเครื่องมือเมื่ออยู่ใน View Mode */}
      {!hideTools && (
        <div className="bg-white shadow-theme w-16 flex flex-col flex-wrap items-center py-4 z-30">
          {filteredToolCategories?.map((category) => (
            <Tooltip key={category.id} title={category.label} placement="right">
              <Button
                type={activeCategory === category.id ? "primary" : "text"}
                onClick={() => handleCategoryClick(category.id)}
                className="mb-2 flex items-center justify-center w-12 h-12 border-none"
              >
                {typeof category.icon === "function"
                  ? category.icon(activeCategory === category.id)
                  : category.icon}
              </Button>
            </Tooltip>
          ))}
        </div>
      )}

      {/* 🎯 3. ซ่อนส่วน Settings button เมื่ออยู่ใน View Mode */}
      {isNewFileUpload && !hasUserSettingsSaved  && (
        <div className="bg-white w-16 flex flex-col items-center py-4">
          {filteredToolCategories
            .filter((category) => category.id === "settings")
            .map((category) => (
              <Tooltip
                key={category.id}
                title={category.label}
                placement="right"
              >
                <Button
                  type={activeCategory === category.id ? "primary" : "text"}
                  onClick={() => handleCategoryClick(category.id)}
                  className="mb-2 flex items-center justify-center w-12 h-12 border-none"
                >
                  {typeof category.icon === "function"
                    ? category.icon(activeCategory === category.id)
                    : category.icon}
                </Button>
              </Tooltip>
            ))}
        </div>
      )}

      <div
        className={`bg-white shadow-theme transition-all duration-300 relative z-20 ${
          isExpanded ? "min-w-80 w-fit" : "w-0" // 🎯 4. ปิด expand ใน View Mode
        }`}
      >
        {/* 🎯 5. ซ่อนปุ่ม Collapse/Expand ใน View Mode */}
        {isExpanded && !hideTools  && (
          <div
            className={`absolute top-1/2 z-10 ${
              isExpanded ? "-right-4" : "-right-10"
            } -translate-y-1/2 transition-all duration-300`}
          >
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 bg-white shadow-theme py-2 rounded-lg hover:bg-neutral-200"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        )}

        <div
          className={`${
            isExpanded  ? "opacity-100" : "opacity-0" // 🎯 6. ซ่อนเนื้อหาใน View Mode
          } transition-opacity duration-300 h-full overflow-y-auto overflow-x-hidden pb-4`}
        >
          {!hideTools && !isSettingsMode  && ( // 🎯 7. เพิ่ม && !isViewMode
            <>
              {/* 🎯 8. ส่ง isViewMode ไปให้ LayerPanel */}
              <LayerPanel
                items={items?.map((item) => ({
                  ...item,
                  actorId: item.actorId || "",
                  step_index: item.step_index || "",
                }))}
                activePage={activePage}
                numPages={numPages}
                onLayerSelect={onLayerSelect || (() => {})}
                onLayerDelete={onDeleteItem || (() => {})}
                onGroupedDelete={onGroupedDelete}
                onLayerVisibilityToggle={onLayerVisibilityToggle}
                selectedItemId={configElement?.id}
                onConfigChange={onConfigChange}
                onValueChange={onValueChange}
                onCloseConfig={onCloseConfig}
                currentStepIndex={currentStepIndex}
                actors={actors?.map((actor) => {
                  const actorAny = actor as any;
                  const mappedActor = {
                    id: actor.id,
                    name: actor.name,
                    step_index: actorAny.step_index || actor.id,
                    role: actor.role || "",
                    permission: actorAny.permission || "",
                    section: actorAny.section || "มาตรา 9",
                    validateType: actorAny.validateType || "",
                    validateData: actorAny.validateData || "",
                    entities: actorAny.entities || [],
                    order: actor.order,
                  };
                  return mappedActor;
                })}
                onElementClick={handleElementClick}
                configElement={
                  configElement
                    ? {
                        ...configElement,
                        actorId: configElement.actorId || "",
                        step_index: configElement.step_index || "",
                      }
                    : null
                }
                activeCategory={activeCategory}
                onValidationChange={handleValidationChange}
                documentType={documentType}
                dateTimeType={dateTimeType}
                docType={docType}
                currentStepPermissionType={currentStepPermissionType || ""}
                // isViewMode={isViewMode} // 🎯 เพิ่มบรรทัดนี้
              />

              {/* 🎯 9. ซ่อน renderToolContent ใน View Mode */}
              { <div>{renderToolContent()}</div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormSidebar;