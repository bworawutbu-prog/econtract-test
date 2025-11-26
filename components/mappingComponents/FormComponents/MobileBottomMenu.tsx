"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Button, Tooltip, Select } from "antd";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useViewport } from "../FormUtils/responsiveUtils";
import Image from "next/image";
import SignatureIcon from "@/assets/webp/signature.webp";
import { FormItem } from "../../../store/types/FormTypes";
import LayerPanel from "./LayerPanel";
import { FormElement, formElements } from "./FormSidebar";
import { Plus } from "lucide-react";
import { 
  Type, 
  StampIcon, 
  FileEdit, 
  UserRoundCogIcon, 
  Users,
  Calendar,
  SquareCheck,
  CircleDotIcon,
  FileDigit,
  Settings,
  LayoutGrid
} from "lucide-react";
import { FormElementConfigData } from "./FormElementConfig";

// Base tool categories - will be enhanced with approvers category dynamically
const baseToolCategories = [
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

interface MobileBottomMenuProps {
  configElement: FormItem | null;
  onConfigChange?: (itemId: string, configData: FormElementConfigData) => void;
  onValueChange?: (id: string, value: any) => void;
  onCloseConfig?: () => void;
  onDeleteItem?: (itemId: string) => void;
  onGroupedDelete?: (itemIds: string[]) => void;
  onElementClick?: (element: any) => void;
  onCategoryChange?: (categoryId: string) => void;
  items: FormItem[];
  activePage: number;
  numPages: number | null;
  onLayerVisibilityToggle?: (itemId: string, visible: boolean) => void;
  onLayerSelect?: (item: FormItem) => void;
  defaultCollapsed?: boolean;
  isSettingsMode?: boolean;
  approvers?: any[];
  formDataFlow?: any[];
  currentStepIndex?: string;
  onValidationChange?: (isValid: boolean) => void;
  isPdfReady?: boolean;
  pdfFile?: string;
  docType?: string;
  onStepIndexChange?: (stepIndex: string) => void; // 🎯 NEW: Handler for changing step index
}

const MobileBottomMenu: React.FC<MobileBottomMenuProps> = ({
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
  currentStepIndex = "all",
  onValidationChange,
  isPdfReady = true,
  pdfFile,
  docType,
  onStepIndexChange,
}) => {
  // 🎯 RESPONSIVE: Auto-detect viewport
  const viewport = useViewport();
  
  // 🎯 NEW: Create toolCategories with approvers category if approvers exist
  const toolCategories = useMemo(() => {
    const categories = [...baseToolCategories];
    
    // Add "ผู้กรอกข้อมูลเอกสาร" category if approvers exist
    if (approvers && approvers.length > 0) {
      categories.unshift({
        id: "approvers",
        icon: <Users size={20} />,
        label: "ลำดับ",
      });
    }
    
    return categories;
  }, [approvers]);

  // 🎯 NEW: Auto-show when mobile/tablet, expanded state
  // 🎯 FIXED: Default to "approvers" if available, otherwise "text"
  const [activeCategory, setActiveCategory] = useState<string>("text");
  const [dateTimeType, setDateTimeType] = useState<"date" | "periodDate">(
    "date"
  );
  const [isFormValid, setIsFormValid] = useState(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<HTMLDivElement>(null);
  
  // 🎯 NEW: Sync activeCategory when approvers change (only once on mount)
  useEffect(() => {
    if (approvers && approvers.length > 0) {
      // Set to "approvers" as default if available
      setActiveCategory((prev) => {
        // Only change if still on default "text" or if approvers category was just added
        return prev === "text" ? "approvers" : prev;
      });
    }
  }, [approvers?.length]); // Only depend on approvers length to avoid unnecessary updates

  // 🎯 FIXED: Show on all viewports except desktop (mobile, tablet, and any viewport < 1024px)
  const shouldShow = !viewport.isDesktop;

  // 🎯 NEW: Handle category click - expand menu when clicked
  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    // Expand menu when category is clicked
    setIsExpanded(true);
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  // Handle collapse/expand toggle
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle element click
  const handleElementClick = (element: any) => {
    if (onElementClick) {
      // Find approver for current step
      const approver = approvers.find((a) => {
        const approverStepIndex = `${a.index - 1}`;
        return approverStepIndex === currentStepIndex;
      });

      const actorId = approver ? `${approver.index - 1}` : undefined;

      const elementWithType = {
        ...element,
        ...(actorId && { actorId }),
        ...(actorId && { step_index: actorId }),
        ...(element.type === "date" && { dateTimeType }),
      };
      onElementClick(elementWithType);
      // 🎯 NEW: Collapse menu after clicking element (instead of closing)
      setIsExpanded(false);
    }
  };

  // Calculate total file size for more-file validation
  const calculateTotalFileSize = () => {
    const moreFileItems = items.filter((item) => item.type === "more-file");
    const totalSize = moreFileItems.reduce((total, item) => {
      const fileSize = (item as any).maxFileSize ?? 0;
      return total + fileSize;
    }, 0);
    return totalSize;
  };

  // Check more-file validation
  const checkMoreFileValidation = () => {
    const totalSize = calculateTotalFileSize();
    const isFileSizeValid = totalSize <= 100;
    const moreFileItems = items.filter((item) => item.type === "more-file");
    const isTypeNameValid = moreFileItems.every((item) => {
      const typeName = (item as any).typeName ?? "";
      return typeName.trim() !== "";
    });
    return isFileSizeValid && isTypeNameValid;
  };

  // Handle validation change
  const handleValidationChange = (isValid: boolean) => {
    const moreFileIsValid = checkMoreFileValidation();
    const combinedIsValid = isValid && moreFileIsValid;
    setIsFormValid(combinedIsValid);
    if (onValidationChange) {
      onValidationChange(combinedIsValid);
    }
  };

  // Convert approvers to Actor format
  const actors = useMemo(() => {
    if (!approvers || approvers.length === 0) return null;

    return approvers.map((approver) => ({
      id: `${approver.index - 1}`,
      name: `คนที่ ${approver.index}`,
      step_index: `${approver.index - 1}`,
      role: approver.role,
      permission: approver.permission,
      section: approver.section,
      validateType: approver.validateType,
      validateData: approver.validateData,
      entities: approver.entities,
      order: approver.index - 1,
    }));
  }, [approvers, activeCategory]);

  // Check current step permission type
  const currentStepPermissionType = useMemo(() => {
    if (!approvers || approvers.length === 0) return null;
    if (currentStepIndex === "all") return null;

    const currentApprover = approvers.find((approver) => {
      const approverStepIndex = `${approver.index - 1}`;
      return approverStepIndex === currentStepIndex;
    });

    return currentApprover?.permission || null;
  }, [approvers, currentStepIndex]);

  // Filter tool categories based on permission
  const filteredToolCategories = useMemo(() => {
    let filtered = [...toolCategories];
    
    // Never filter out "approvers" category
    if (currentStepIndex !== "all" && currentStepPermissionType) {
      if (currentStepPermissionType === "Approver") {
        filtered = filtered.filter((category) => category.id !== "signature");
      }
    }

    return filtered;
  }, [toolCategories, currentStepIndex, currentStepPermissionType]);

  // Render tool content for current category
  const renderToolContent = () => {
    // 🎯 NEW: Handle approvers category
    if (activeCategory === "approvers") {
      if (!approvers || approvers.length === 0) {
        return (
          <div className="px-4 py-2">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-gray-600 text-xs font-medium mb-1">
                ไม่มีผู้กรอกข้อมูล
              </div>
              <div className="text-gray-500 text-xs">
                กรุณาตั้งค่าผู้กรอกข้อมูลเอกสารก่อน
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="px-4 py-2">
          <div className="space-y-2">
            {/* "All" option */}
            <button
              onClick={() => {
                if (onStepIndexChange) {
                  onStepIndexChange("all");
                }
              }}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg
                transition-all duration-200
                ${
                  currentStepIndex === "all"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }
              `}
            >
              <div className="flex items-center gap-2">
                <Users size={18} className={currentStepIndex === "all" ? "text-white" : "text-gray-600"} />
                <span className="text-sm font-medium">ทุกคน</span>
              </div>
              {currentStepIndex === "all" && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </button>

            {/* Approver options */}
            {approvers.map((approver, index) => {
              const approverStepIndex = `${approver.index - 1}`;
              const isSelected = currentStepIndex === approverStepIndex;
              
              return (
                <button
                  key={approver.id || index}
                  onClick={() => {
                    if (onStepIndexChange) {
                      onStepIndexChange(approverStepIndex);
                    }
                  }}
                  className={`
                    w-full flex items-center justify-between p-3 rounded-lg
                    transition-all duration-200
                    ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }
                  `}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      ${isSelected ? "bg-blue-500" : "bg-gray-200"}
                      text-xs font-semibold
                      ${isSelected ? "text-white" : "text-gray-700"}
                    `}>
                      {approver.index}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">
                        คนที่ {approver.index}
                      </span>
                      {approver.permission && (
                        <span className={`text-xs ${isSelected ? "text-blue-100" : "text-gray-500"}`}>
                          {approver.permission}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // Don't show tools for signature, more-file, and stamp categories
    if (
      activeCategory === "signature" ||
      activeCategory === "more-file" ||
      activeCategory === "stamp"
    ) {
      return null;
    }

    // Special handling for dateTime category
    if (activeCategory === "dateTime") {
      const existingDateItems = items.filter((item) => item.type === "date");
      const dateCount = existingDateItems.length + 1;
      const uniqueId = `${dateTimeType}-${dateCount}`;

      return (
        <div className="px-4 py-2">
          {currentStepIndex === "all" ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <div className="text-blue-600 text-xs font-medium mb-1">
                📅 เลือก "ผู้กรอกข้อมูลเอกสาร"
              </div>
              <div className="text-blue-500 text-xs">
                กรุณาเลือกลำดับผู้กรอกข้อมูลเพื่อเริ่มสร้างองค์ประกอบวันที่
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <FormElement
                id={uniqueId}
                type="date"
                label={dateTimeType === "date" ? "Date" : "Period Date"}
                icon={<Plus size={18} />}
                onClick={(element) => {
                  const elementWithType = {
                    ...element,
                    dateTimeType: dateTimeType,
                  };
                  handleElementClick(elementWithType);
                }}
                disabled={currentStepIndex === "all"}
                style={{ minWidth: "120px", flexShrink: 0 }}
              />
            </div>
          )}
        </div>
      );
    }

    // For all other categories
    const categoryTools = formElements.filter(
      (element) => element.categoryId === activeCategory
    );

    // 🎯 NEW: Handle categories that don't have formElements (docNo, settingsDoc, etc.)
    if (categoryTools.length === 0) {
      // Categories that don't have tools yet
      const emptyCategories = ["docNo", "settingsDoc"];
      
      if (emptyCategories.includes(activeCategory)) {
        return (
          <div className="px-4 py-2">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-gray-600 text-xs font-medium mb-1">
                🚧 ฟีเจอร์นี้กำลังอยู่ระหว่างการพัฒนา
              </div>
              <div className="text-gray-500 text-xs">
                {activeCategory === "docNo" 
                  ? "ฟีเจอร์ Doc No จะพร้อมใช้งานเร็วๆ นี้"
                  : "ฟีเจอร์ Settings Doc จะพร้อมใช้งานเร็วๆ นี้"}
              </div>
            </div>
          </div>
        );
      }
    }

    return (
      <div className="px-4 py-2">
        {currentStepIndex === "all" ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <div className="text-blue-600 text-xs font-medium mb-1">
              📝 เลือก "ผู้กรอกข้อมูลเอกสาร"
            </div>
            <div className="text-blue-500 text-xs">
              กรุณาเลือกลำดับผู้กรอกข้อมูลเพื่อเริ่มสร้างองค์ประกอบฟอร์ม
            </div>
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categoryTools?.length > 0 ? (
              categoryTools.map((tool) => (
                <div key={tool.id} style={{ minWidth: "120px", flexShrink: 0 }}>
                  <FormElement
                    id={tool.id}
                    type={tool.type}
                    label={tool.label}
                    icon={tool.icon}
                    onClick={(element) => handleElementClick(element)}
                    disabled={currentStepIndex === "all"}
                    style={{ minWidth: "120px", flexShrink: 0 }}
                  />
                </div>
              ))
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center w-full">
                <div className="text-gray-600 text-xs font-medium mb-1">
                  ไม่มีองค์ประกอบในหมวดหมู่นี้
                </div>
                <div className="text-gray-500 text-xs">
                  กรุณาเลือกหมวดหมู่อื่น
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // 🎯 NEW: Prevent body scroll when expanded (only when expanded)
  useEffect(() => {
    if (isExpanded && shouldShow) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isExpanded, shouldShow]);

  // 🎯 NEW: Auto-show when mobile/tablet
  if (!shouldShow) return null;

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-50
        bg-white shadow-2xl
        transition-all duration-300 ease-out
        ${isExpanded ? "max-h-[85vh]" : "max-h-[120px]"}
        flex flex-col
        border-t border-gray-200
      `}
    >
      {/* 🎯 NEW: Handle Bar with Expand/Collapse */}
      <div className="relative w-full flex flex-col items-center gap-1">
        <div
          className="absolute top-[-14px] flex items-center justify-center bg-white border border-gray-200 rounded-xl px-2 shadow-md"
          onClick={handleToggleExpand}
        >
          {isExpanded ? (
            <ChevronDown size={24} className="text-gray-500 cursor-pointer" />
          ) : (
            <ChevronUp size={24} className="text-gray-500 cursor-pointer" />
          )}
        </div>
      </div>

      {/* 🎯 NEW: Header - Show only when expanded */}
      {/* {isExpanded && (
        <div className="flex items-center justify-between px-4 pb-2 border-b">
          <h3 className="text-base font-semibold text-gray-800">
            {toolCategories.find((c) => c.id === activeCategory)?.label ||
              "Tools"}
          </h3>
        </div>
      )} */}

      {/* Categories Horizontal Scroll */}
      <div className="border-b bg-gray-50">
        <div
          ref={categoriesRef}
          className="flex gap-3 px-4 pt-4 pb-3 overflow-x-auto scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            scrollBehavior: "smooth",
          }}
        >
          {filteredToolCategories.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`
                    flex flex-col items-center justify-center gap-1
                    ${viewport.isMobile ? 'px-3 py-1.5' : 'px-4 py-2'}
                    rounded-xl
                    ${viewport.isMobile ? 'min-w-[70px]' : 'min-w-[80px]'}
                    flex-shrink-0
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }
                  `}
              >
                <div className={isActive ? "brightness-0 invert" : ""}>
                  {typeof category.icon === "function"
                    ? category.icon(isActive)
                    : category.icon}
                </div>
                <span className={`${viewport.isMobile ? 'text-[10px]' : 'text-xs'} font-medium leading-tight`}>
                  {category.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🎯 NEW: Content Area - Show only when expanded */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* DateTime Type Selector */}
          {activeCategory === "dateTime" && (
            <div className="px-4 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เลือกประเภทวันที่
              </label>
              <Select
                defaultValue="date"
                value={dateTimeType}
                style={{ width: "100%" }}
                onChange={(value) =>
                  setDateTimeType(value as "date" | "periodDate")
                }
                suffixIcon={<ChevronDown size={20} />}
              >
                <Select.Option value="date">Date</Select.Option>
                <Select.Option value="periodDate">Period Date</Select.Option>
              </Select>
            </div>
          )}

          {/* Layer Panel */}
          {!isSettingsMode && (
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
                return {
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
              dateTimeType={dateTimeType}
              docType={docType}
              currentStepPermissionType={currentStepPermissionType || ""}
            />
          )}

          {/* Tool Content - Horizontal Scroll */}
          <div ref={elementsRef}>{renderToolContent()}</div>
        </div>
      )}
    </div>
  );
};

export default MobileBottomMenu;
