"use client";

import React, {
  useState,
  useEffect,
  ChangeEvent,
  useRef,
  useCallback,
} from "react";
import {
  Input,
  InputNumber,
  Button,
  Select,
  Collapse,
  type CollapseProps,
} from "antd";
import {
  CalendarOutlined,
  CloseOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Plus, ChevronDown, Trash } from "lucide-react";
import { FormItem, ElementStyle } from "../../../store/types/FormTypes";
import {
  CONFIG_CONSTANTS,
  getDefaultElementConfig,
} from "../FormUtils/defaultStyle";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import thaiLocale from "dayjs/locale/th";
import { DateProvider } from "./DateTimeComponents/DateContext";
import DateInputControls from "./DateTimeComponents/DateInputControls";
import DateFormatSelector from "./DateTimeComponents/DateFormatSelector";
import CurrentDateToggle from "./DateTimeComponents/CurrentDateToggle";
import { getThaiMonthNames } from "./DateTimeComponents/DateFormatUtils";
import {
  convertToThaiNumber,
  decodeHtmlEntities,
} from "../FormUtils/defaultStyle";
import { useFormElementConfig } from "../../../store/hooks/useFormElementConfig";
import { FormElementConfigState } from "../../../store/slices/formElementConfigSlice";
import appEmitter from "@/store/libs/eventEmitter";
import { useAppSelector } from "@/store/hooks";

dayjs.extend(buddhistEra);
dayjs.locale(thaiLocale);

// Type for Actor
interface Actor {
  id: string;
  name: string;
  step_index: string;
  role: string;
  permission: string;
  section: string;
  validateType: string;
  validateData: string;
  entities: {
    id: string;
    name: string;
    email: string;
  }[];
  order: number;
}

// Extended FormItem interface to include actor specific properties
interface ExtendedFormItem extends FormItem {
  actorId: any;
  step_index: any;
  visible?: boolean;
  maxFileSize?: number; // file_size in MB
  typeName?: string; // type_name
  isEmbedded?: boolean; // is_embedded
  fileAccept?: string[]; // file_accept
}

// Type for configuration options
export interface FormElementConfigProps {
  id: string;
  type: string;
  label: string;
  checkboxOptions?: string[];
  radioOptions?: string[]; // เพิ่มสำหรับ radio
  selectOptions?: string[]; // เพิ่มสำหรับ select
  maxLength?: number;
  minLines?: number;
  required?: boolean;
  placeholder?: string;
  value?: string | string[] | boolean | number;
  maxFileSize?: number; // file_size in MB
  typeName?: string; // type_name
  isEmbedded?: boolean; // is_embedded
  fileAccept?: string[]; // file_accept
  onConfigChange: (config: FormElementConfigData) => void;
  onValueChange?: (
    value: string | string[] | boolean | number,
    options?: string[] // เปลี่ยนจาก checkboxOptions เป็น options ทั่วไป
  ) => void;
  onClose: () => void;
  onDelete?: () => void;
  actors?: Actor[];
  items?: ExtendedFormItem[]; // All form items for signature/more-file lookup
  numPages?: number | null;
  activePage?: number;
  configElement?: ExtendedFormItem | null;
  onLayerSelect?: (item: ExtendedFormItem) => void;
  onLayerDelete?: (itemId: string) => void;
  onGroupedDelete?: (itemIds: string[]) => void; // Add grouped delete handler
  onElementClick?: (
    element: { id: string; type: string; label: string; dateTimeType?: string },
    actorId?: string
  ) => void;
  actorId?: any;
  showAddButton?: boolean;
  onValidationChange?: (isValid: boolean) => void;
  groupedDateElements?: ExtendedFormItem[];
  groupedCheckboxRadioElements?: ExtendedFormItem[];
  section?: string; // 🎯 NEW: Section for stamp elements
  stepIndex?: string; // 🎯 NEW: Current step index for signature elements
  currentStepPermissionType?: string; // 🎯 NEW: Current step permission type to determine approver mode
  docType?: string; // 🎯 NEW: Document type (b2b, b2c, etc.)
  documentType?: string; // 🎯 NEW: Document mode (create, draft, template)
  isViewMode?: boolean; // 🎯 เพิ่มบรรทัดนี้
}

// Use FormElementConfigState from Redux slice as the main interface
export type FormElementConfigData = FormElementConfigState;

export const FormElementConfig: React.FC<FormElementConfigProps> = ({
  id,
  type,
  label,
  checkboxOptions = [],
  radioOptions = [],
  selectOptions = [],
  maxLength,
  minLines = 1,
  required = false,
  placeholder = "",
  value,
  maxFileSize,
  typeName,
  isEmbedded,
  fileAccept,
  onConfigChange,
  onValueChange,
  actors,
  items,
  numPages,
  activePage,
  configElement,
  onLayerSelect,
  onLayerDelete,
  onGroupedDelete,
  onElementClick,
  actorId,
  showAddButton = true,
  onValidationChange,
  groupedDateElements,
  groupedCheckboxRadioElements,
  section, // 🎯 NEW: Section for stamp elements
  stepIndex, // 🎯 NEW: Current step index for signature elements
  currentStepPermissionType, // 🎯 NEW: Current step permission type to determine approver mode
  docType, // 🎯 NEW: Document type (b2b, b2c, etc.)
  documentType, // 🎯 NEW: Document mode for template mode
  isViewMode, // 🎯 NEW: View mode flag
}): React.ReactElement => {
  // Template mode should behave like regular document creation, so keep all interactions enabled
  const isTemplateMode = false;
  void documentType;
  const typeDefaults = getDefaultElementConfig(type);
  // 🎯 NEW: Use Redux state instead of local state
  const {
    getElementConfig,
    setElementConfig,
    updateElementConfigField,
    setEditingState,
    setTempConfig,
    setLocalValue,
    setInputValue,
    setCheckboxOptionValues,
    setRadioOptionValues,
    getExpandedMoreFileIds,
    getMoreFileConfigs,
    getSignaturePageConfigs,
    getStampPageConfigs,
    setExpandedMoreFileIds,
    setMoreFileConfigs,
    setSignaturePageConfigs,
    setStampPageConfigs,
  } = useFormElementConfig();

  // Get persisted state from Redux
  const persistedConfig = getElementConfig(id);

  // Initialize form state from Redux or props
  const [formState, setFormState] = useState<FormElementConfigData>(() => {
    if (persistedConfig) {
      return {
        id,
        label: persistedConfig.label || label,
        checkboxOptions: persistedConfig.checkboxOptions,
        radioOptions: persistedConfig.radioOptions,
        selectOptions: persistedConfig.selectOptions,
        required:
          persistedConfig.required !== undefined
            ? persistedConfig.required
            : required,
        maxFileSize:
          persistedConfig.maxFileSize !== undefined
            ? persistedConfig.maxFileSize
            : maxFileSize,
        fileAccept: persistedConfig.fileAccept,
        typeName: persistedConfig.typeName,
        isEmbedded: persistedConfig.isEmbedded,
        date: persistedConfig.date,
      };
    }

    // Fallback to default initialization
    return {
      id,
      label,
      checkboxOptions:
        type === "checkbox"
          ? checkboxOptions && checkboxOptions.length > 0
            ? checkboxOptions
            : typeDefaults.checkboxOptions
          : undefined,
      radioOptions:
        type === "radio"
          ? radioOptions && radioOptions.length > 0
            ? radioOptions
            : typeDefaults.radioOptions
          : undefined,
      selectOptions:
        type === "select"
          ? selectOptions && selectOptions.length > 0
            ? selectOptions
            : typeDefaults.selectOptions
          : undefined,
      required: required !== undefined ? required : typeDefaults.required,
      maxFileSize:
        maxFileSize !== undefined ? maxFileSize : typeDefaults.maxFileSize,
      fileAccept:
        fileAccept !== undefined ? fileAccept : typeDefaults.fileAccept,
      typeName: typeName !== undefined ? typeName : typeDefaults.typeName,
      isEmbedded:
        isEmbedded !== undefined ? isEmbedded : typeDefaults.isEmbedded,
      date:
        type === "date"
          ? {
            days: "",
            months: "",
            years: "",
            format: "EU",
            useCurrentDate: false,
          }
          : undefined,
    };
  });

  // 🎯 NEW: Use Redux state for temp config and editing state
  const tempConfigState = persistedConfig?.tempConfig || formState;
  const isEditingConfig = persistedConfig?.isEditing || {};

  // 🎯 NEW: Use Redux state for local values
  const localValue =
    persistedConfig?.localValue !== undefined
      ? persistedConfig.localValue
      : value;
  const textInputRef = useRef<HTMLInputElement>(null);
  const inputValue =
    persistedConfig?.inputValue !== undefined
      ? persistedConfig.inputValue
      : typeof value === "string"
        ? value
        : "";

  // 🎯 NEW: Use Redux state for checkbox/radio options
  const checkboxOptionRefs = useRef<{ [key: number]: any }>({});
  const radioOptionRefs = useRef<{ [key: number]: any }>({});
  const checkboxOptionValues = persistedConfig?.checkboxOptionValues || {};
  const radioOptionValues = persistedConfig?.radioOptionValues || {};

  // 🎯 NEW: Initialize Redux state on mount and when props change
  useEffect(() => {
    const typeDefaults = getDefaultElementConfig(type);

    // Initialize Redux state if not exists
    if (!persistedConfig) {
      const initialConfig = {
        id,
        label,
        checkboxOptions:
          type === "checkbox"
            ? checkboxOptions && checkboxOptions.length > 0
              ? checkboxOptions
              : typeDefaults.checkboxOptions
            : undefined,
        radioOptions:
          type === "radio"
            ? radioOptions && radioOptions.length > 0
              ? radioOptions
              : typeDefaults.radioOptions
            : undefined,
        selectOptions:
          type === "select"
            ? selectOptions && selectOptions.length > 0
              ? selectOptions
              : typeDefaults.selectOptions
            : undefined,
        maxLength: maxLength !== undefined ? maxLength : typeDefaults.maxLength,
        minLines: minLines !== undefined ? minLines : typeDefaults.minLines,
        required: required !== undefined ? required : typeDefaults.required,
        placeholder:
          placeholder !== undefined ? placeholder : typeDefaults.placeholder,
        maxFileSize:
          maxFileSize !== undefined ? maxFileSize : typeDefaults.maxFileSize,
        fileAccept:
          fileAccept !== undefined ? fileAccept : typeDefaults.fileAccept,
        typeName: typeName !== undefined ? typeName : typeDefaults.typeName,
        isEmbedded:
          isEmbedded !== undefined ? isEmbedded : typeDefaults.isEmbedded,
        localValue: value,
        inputValue: typeof value === "string" ? value : "",
        date:
          type === "date"
            ? {
              days: "",
              months: "",
              years: "",
              format: "EU",
              useCurrentDate: false,
            }
            : undefined,
      };

      setElementConfig(id, initialConfig);
    }

    // Update form state from Redux
    if (persistedConfig) {
      setFormState((prevState) => ({
        id,
        label: persistedConfig.label || label,
        checkboxOptions: persistedConfig.checkboxOptions,
        radioOptions: persistedConfig.radioOptions,
        selectOptions: persistedConfig.selectOptions,
        maxLength:
          persistedConfig.maxLength !== undefined
            ? persistedConfig.maxLength
            : maxLength,
        minLines:
          persistedConfig.minLines !== undefined
            ? persistedConfig.minLines
            : minLines,
        required:
          persistedConfig.required !== undefined
            ? persistedConfig.required
            : required,
        placeholder:
          persistedConfig.placeholder !== undefined
            ? persistedConfig.placeholder
            : placeholder,
        maxFileSize:
          persistedConfig.maxFileSize !== undefined
            ? persistedConfig.maxFileSize
            : maxFileSize,
        fileAccept: persistedConfig.fileAccept,
        typeName: persistedConfig.typeName,
        isEmbedded: persistedConfig.isEmbedded,
        date: persistedConfig.date,
      }));
    }

    // 🎯 Initialize checkbox/radio option values from grouped elements
    if (type === "checkbox" || type === "radio") {
      const groupedElements =
        groupedCheckboxRadioElements ||
        (configElement as any)?.__checkboxRadioElements ||
        [];

      if (groupedElements.length > 0) {
        const newCheckboxValues: { [key: number]: string } = {};
        const newRadioValues: { [key: number]: string } = {};

        groupedElements.forEach((element: any, index: number) => {
          if (type === "checkbox") {
            newCheckboxValues[index] = element.checkboxOptions?.[0] || "";
          } else if (type === "radio") {
            newRadioValues[index] = element.radioOptions?.[0] || "";
          }
        });

        if (type === "checkbox") {
          setCheckboxOptionValues(id, newCheckboxValues);
        } else if (type === "radio") {
          setRadioOptionValues(id, newRadioValues);
        }
      }
    }

    // Only update when props actually change, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, type, value]);

  // 🎯 NEW: Use Redux state for global states
  const expandedMoreFileIds = getExpandedMoreFileIds();
  const moreFileConfigs = getMoreFileConfigs();
  const signaturePageConfigs = getSignaturePageConfigs();
  const stampPageConfigs = getStampPageConfigs();
  const moreFileInputRefs = useRef<{
    [key: string]: {
      [field: string]: HTMLInputElement | HTMLSelectElement | null;
    };
  }>({});

  // State for stamp data
  const [stampData, setStampData] = useState<any[]>([]);

  // Initialize moreFileConfigs from existing items data
  useEffect(() => {
    if (items && items.length > 0) {
      const newConfigs: { [key: string]: any } = {};

      items
        .filter((item) => item.type === "more-file")
        .forEach((item) => {
          // Initialize config from existing item data if not already in moreFileConfigs
          if (!moreFileConfigs[item.id]) {
            newConfigs[item.id] = {
              maxFileSize:
                item.maxFileSize || CONFIG_CONSTANTS.MORE_FILE_MAX_SIZE,
              typeName: item.typeName || "",
              isEmbedded:
                item.isEmbedded ??
                CONFIG_CONSTANTS.MORE_FILE_DEFAULT_IS_EMBEDDED,
              required:
                item.required ?? CONFIG_CONSTANTS.MORE_FILE_DEFAULT_IS_REQUIRED,
              fileAccept: item.fileAccept || [],
            };
          }
        });

      // Only update if we have new configs to set
      if (Object.keys(newConfigs).length > 0) {
        setMoreFileConfigs({
          ...moreFileConfigs,
          ...newConfigs,
        });
      }
    }
  }, [items]);

  // Initialize signature page configs from existing items data
  useEffect(() => {
    if (items && items.length > 0) {
      const newSignatureConfigs: { [key: string]: string[] } = {};

      items
        .filter((item) => item.type === "signature")
        .forEach((item) => {
          // Initialize page config from existing item data if not already in signaturePageConfigs
          if (!signaturePageConfigs[item.id]) {
            // Use pageNumbers from item if available, otherwise use pageNumber, otherwise default to "all"
            let pageConfig: string[];
            if (item.pageNumbers && item.pageNumbers.length > 0) {
              pageConfig = item?.pageNumbers?.map((p) => p.toString());
            } else if (item.pageNumber) {
              pageConfig = [item.pageNumber.toString()];
            } else {
              pageConfig = ["all"];
            }
            newSignatureConfigs[item.id] = pageConfig;
          }
        });

      // Only update if we have new configs to set
      if (Object.keys(newSignatureConfigs).length > 0) {
        setSignaturePageConfigs({
          ...signaturePageConfigs,
          ...newSignatureConfigs,
        });
      }
    }
  }, [items]);

  // Initialize stamp page configs from existing items data
  useEffect(() => {
    if (items && items.length > 0) {
      const newStampConfigs: { [key: string]: string[] } = {};

      items
        .filter((item) => item.type === "stamp")
        .forEach((item) => {
          // Initialize page config from existing item data if not already in stampPageConfigs
          if (!stampPageConfigs[item.id]) {
            // Use pageNumbers from item if available, otherwise use pageNumber, otherwise default to "all"
            let pageConfig: string[];
            if (item.pageNumbers && item.pageNumbers.length > 0) {
              pageConfig = item?.pageNumbers?.map((p) => p.toString());
            } else if (item.pageNumber) {
              pageConfig = [item.pageNumber.toString()];
            } else {
              pageConfig = ["all"];
            }
            newStampConfigs[item.id] = pageConfig;
          }
        });

      // Only update if we have new configs to set
      if (Object.keys(newStampConfigs).length > 0) {
        setStampPageConfigs({
          ...stampPageConfigs,
          ...newStampConfigs,
        });
      }
    }
  }, [items]);

  // Calculate total file size across all actors with local state
  const calculateTotalFileSize = () => {
    if (!items) return 0;

    const moreFileItems = items.filter((item) => item.type === "more-file");

    // Group elements that were created together from stepIndex = "all"
    const processedIds = new Set<string>();
    let total = 0;

    moreFileItems.forEach((item) => {
      if (processedIds.has(item.id)) return;

      // Use local state value if available, otherwise use item's maxFileSize
      const localConfig = moreFileConfigs[item.id];
      const fileSize = localConfig?.maxFileSize ?? item.maxFileSize ?? 0;

      // Check if this is part of a group created from stepIndex = "all"
      const itemTimestamp = item.id.split("-").slice(-2, -1)[0]; // Extract timestamp
      const groupItems = moreFileItems.filter((groupItem) => {
        const groupTimestamp = groupItem.id.split("-").slice(-2, -1)[0];
        return (
          groupTimestamp === itemTimestamp &&
          groupItem.id.includes("more-file-")
        );
      });

      if (groupItems.length > 1) {
        // This is a group - count file size only once for the group
        total += fileSize;
        groupItems.forEach((groupItem) => processedIds.add(groupItem.id));
      } else {
        // Individual element
        total += fileSize;
        processedIds.add(item.id);
      }
    });

    return total;
  };

  // Check if a file size value would exceed the system-wide limit
  const validateFileSize = (currentFileId: string, newSize: number) => {
    if (!items)
      return { isValid: true, currentTotal: 0, remaining: 100, totalUsed: 0 };

    const moreFileItems = items.filter((item) => item.type === "more-file");

    // Group elements and calculate total excluding current item/group
    const processedIds = new Set<string>();
    let totalOtherFiles = 0;

    // Check if currentFileId is part of a group
    const currentItemTimestamp = currentFileId.split("-").slice(-2, -1)[0];
    const currentGroupItems = moreFileItems.filter((item) => {
      const itemTimestamp = item.id.split("-").slice(-2, -1)[0];
      return (
        itemTimestamp === currentItemTimestamp && item.id.includes("more-file-")
      );
    });
    const currentGroupIds = new Set(currentGroupItems.map((item) => item.id));

    moreFileItems.forEach((item) => {
      if (processedIds.has(item.id) || currentGroupIds.has(item.id)) return;

      const localConfig = moreFileConfigs[item.id];
      const fileSize = localConfig?.maxFileSize ?? item.maxFileSize ?? 0;

      // Check if this is part of a group
      const itemTimestamp = item.id.split("-").slice(-2, -1)[0];
      const groupItems = moreFileItems.filter((groupItem) => {
        const groupTimestamp = groupItem.id.split("-").slice(-2, -1)[0];
        return (
          groupTimestamp === itemTimestamp &&
          groupItem.id.includes("more-file")
        );
      });

      if (groupItems.length > 1) {
        // This is a group - count file size only once
        totalOtherFiles += fileSize;
        groupItems.forEach((groupItem) => processedIds.add(groupItem.id));
      } else {
        // Individual element
        totalOtherFiles += fileSize;
        processedIds.add(item.id);
      }
    });

    const currentTotal = totalOtherFiles + newSize;
    const remaining = Math.max(0, 100 - totalOtherFiles);

    return {
      isValid: currentTotal <= 100,
      currentTotal,
      remaining,
      totalUsed: totalOtherFiles,
    };
  };

  // Check overall validation status for all more-file items
  const checkOverallValidation = () => {
    if (!items) return true;

    const totalSize = calculateTotalFileSize();
    const isFileSizeValid = totalSize <= 100;

    // Check typeName validation for more-file items (grouped)
    const moreFileItems = items.filter((item) => item.type === "more-file");
    const processedIds = new Set<string>();
    let isTypeNameValid = true;

    moreFileItems.forEach((item) => {
      if (processedIds.has(item.id)) return;

      // Check if this is part of a group
      const itemTimestamp = item.id.split("-").slice(-2, -1)[0];
      const groupItems = moreFileItems.filter((groupItem) => {
        const groupTimestamp = groupItem.id.split("-").slice(-2, -1)[0];
        return (
          groupTimestamp === itemTimestamp &&
          groupItem.id.includes("more-file-")
        );
      });

      if (groupItems.length > 1) {
        // This is a group - check validation for the first item only
        const currentConfig = moreFileConfigs[item.id] || {};
        const typeName = currentConfig.typeName ?? item.typeName ?? "";
        if (typeName.trim() === "") {
          isTypeNameValid = false;
        }
        groupItems.forEach((groupItem) => processedIds.add(groupItem.id));
      } else {
        // Individual element
        const currentConfig = moreFileConfigs[item.id] || {};
        const typeName = currentConfig.typeName ?? item.typeName ?? "";
        if (typeName.trim() === "") {
          isTypeNameValid = false;
        }
        processedIds.add(item.id);
      }
    });

    const isValid = isFileSizeValid && isTypeNameValid;

    return isValid;
  };

  // Send validation status to parent
  useEffect(() => {
    if (onValidationChange) {
      const isValid = checkOverallValidation();
      onValidationChange(isValid);
    }
  }, [items, onValidationChange, moreFileConfigs]);

  // Helper functions for signature and more-file
  const getActorSignatures = (actorId: string) => {
    if (!items) return [];
    return items.filter(
      (item) => item.actorId === actorId && item.type === "signature"
    );
  };

  const getActorName = (actorId: string, actors: Actor[] | undefined): string => {
    if (!actors) return `คนที่ ${parseInt(actorId) + 1}`;

    const actor = actors.find(a => a.id === actorId || String(a.order) === actorId);
    return actor?.name || `คนที่ ${parseInt(actorId) + 1}`;
  };

  const B2BformData = useAppSelector((s: any) => s.contractB2BForm);

  const getB2BActorName = (actorId: string): string | null => {
    try {
      const contract = B2BformData?.forms?.contractParty;
      if (!contract) return null;
      const idx = Number(actorId);
      // ลำดับ 0 ถือเป็น operator (ต้นสัญญา)
      if (idx === 0) {
      const approver = contract.approvers?.[0];
      const user = approver?.userList?.[0];
      return (
        user?.fullName ||
        user?.name ||
        user?.email ||
        null
      );
      }
      const approver = contract.approvers?.[idx];
      if (!approver) return null;
      // ถ้า approverType เป็น external ให้ใช้ userList ตัวแรก (คู่สัญญา)
      if (approver.approverType === "external") {
          return (
        approver.userList?.[0]?.fullName ||
        approver.userList?.[0]?.name ||
        approver.userList?.[0]?.email ||
        null
      );
      }
      // internal -> ถ้ามี userList ให้ใช้ชื่อช่องแรก มิฉะนั้น fallback ไปหา operator หรือ permission label
    return (
      approver.userList?.[0]?.fullName ||
      approver.userList?.[0]?.name ||
      approver.userList?.[0]?.email ||
      approver?.permissionType ||
      null
      );
    } catch {
      return null;
    }
  };

  const displayActorName = getB2BActorName(actorId) ?? getActorName(actorId, actors);


  const getActorMoreFiles = (actorId: string) => {
    if (!items) return [];
    return items.filter(
      (item) => item.actorId === actorId && item.type === "more-file"
    );
  };

  // const getActorStamps = (actorId: string) => {
  //   if (!items) return [];
  //   return items.filter(
  //     (item) => item.actorId === actorId && item.type === "stamp"
  //   );
  // };

  const handleElementClick = (
    element: { id: string; type: string; label: string; dateTimeType?: string },
    actorId?: string
  ) => {
    if (onElementClick) {
      onElementClick(
        {
          ...element,
          ...(actorId && { actorId }),
          ...(actorId && { step_index: actorId }),
        },
        actorId
      );
    }
  };

  // Handle stamp page selection change - similar to signature
  const handleStampPageChange = (stampId: string, pageValues: string[]) => {
    if (!numPages || numPages <= 0) return;

    // Get current selection state
    const currentValues = stampPageConfigs[stampId] || ["all"];
    // Generate page numbers starting from 1 to numPages (not 0-based)
    const allPageNumbers = Array.from({ length: numPages }, (_, i) =>
      (i + 1).toString()
    );

    let finalPageValues = pageValues;

    // Prevent unchecking the last option - if only 1 option remains, keep it checked
    if (pageValues.length === 0) {
      // Don't allow empty selection, keep current values
      finalPageValues = currentValues;
      return; // Exit early, don't update state
    }

    // 🎯 FIXED: Don't delete stamp element when pageValues.length === 0
    // Instead, keep current values to prevent FormElementConfig from disappearing
    if (pageValues.length === 0) {
      // // Delete the stamp element by calling onLayerDelete
      // if (onLayerDelete) {
      //   onLayerDelete(stampId);
      // }

      // // Remove from local state
      // setStampPageConfigs((prev) => {
      //   const newConfigs = { ...prev };
      //   delete newConfigs[stampId];
      //   return newConfigs;
      // });

      finalPageValues = currentValues;
      return; // Exit early, don't update state
    }

    // Check if "all" was just selected or deselected
    const wasAllSelected = currentValues.includes("all");
    const isAllSelected = pageValues.includes("all");

    if (isAllSelected && !wasAllSelected) {
      // "ทุกหน้า" was just selected → select all pages
      finalPageValues = ["all", ...allPageNumbers];
    } else if (!isAllSelected && wasAllSelected) {
      // "ทุกหน้า" was just deselected → keep current page instead of defaulting to page 1
      const individualPages = pageValues.filter((val) => val !== "all");
      if (individualPages.length > 0) {
        finalPageValues = individualPages;
      } else {
        // If no individual pages selected, default to current page
        const currentPage = activePage || 1;
        finalPageValues = [currentPage.toString()];
      }
    } else if (!isAllSelected) {
      // "ทุกหน้า" is not selected, check if all individual pages are selected
      const individualPages = pageValues.filter((val) => val !== "all");

      // If all individual pages are selected, automatically add "ทุกหน้า"
      if (
        individualPages.length === numPages &&
        allPageNumbers.every((page) => individualPages.includes(page))
      ) {
        finalPageValues = ["all", ...allPageNumbers];
      } else {
        // Keep only individual page selections
        finalPageValues = individualPages;
      }
    } else if (isAllSelected && wasAllSelected) {
      // "ทุกหน้า" is still selected, but some individual pages might have been unchecked
      const individualPages = pageValues.filter((val) => val !== "all");

      // If not all pages are selected, uncheck "ทุกหน้า"
      if (
        individualPages.length < numPages ||
        !allPageNumbers.every((page) => individualPages.includes(page))
      ) {
        // Keep current page if no individual pages selected
        finalPageValues =
          individualPages.length > 0
            ? individualPages
            : [(activePage || 1).toString()];
      } else {
        // All pages are still selected, keep "ทุกหน้า" checked
        finalPageValues = ["all", ...allPageNumbers];
      }
    }

    // Ensure we always have at least one page selected
    if (finalPageValues.length === 0) {
      // Default to current page instead of page 1
      const currentPage = activePage || 1;
      finalPageValues = [currentPage.toString()];
    }

    // 🎯 NEW: Update Redux state
    setStampPageConfigs({
      ...stampPageConfigs,
      [stampId]: finalPageValues,
    });

    // Send configuration change to parent component
    if (onConfigChange) {
      const pageNumbers = finalPageValues.includes("all")
        ? Array.from({ length: numPages }, (_, i) => i + 1) // All pages from 1 to numPages
        : finalPageValues.filter((p) => p !== "all").map((p) => parseInt(p));

      const configData: FormElementConfigData = {
        id: stampId,
        label: `ตราประทับ - ${finalPageValues.includes("all")
          ? "ทุกหน้า"
          : `หน้า ${finalPageValues.filter((p) => p !== "all").join(", ")}`
          }`,
        // Add page configuration to the config data
        // If "all" is selected, set pageNumbers to all pages (1 to numPages)
        // Otherwise, convert string values to numbers (excluding "all")
        pageNumbers: pageNumbers,
        // 🎯 FIXED: Add pageNumber for backward compatibility
        pageNumber: finalPageValues.includes("all")
          ? 1
          : parseInt(finalPageValues[0]) || 1,
      };

      onConfigChange(configData);
    }
  };

  // Handle stamp configuration change
  const handleStampConfigChange = (
    stampId: string,
    field: string,
    value: any
  ) => {
    if (onConfigChange) {
      const configData: FormElementConfigData = {
        id: stampId,
        label: `ตราประทับ - ${value}`,
        [field]: value,
      };
      onConfigChange(configData);
    }
  };

  // Handle signature page selection change
  const handleSignaturePageChange = (
    signatureId: string,
    pageValues: string[]
  ) => {
    if (!numPages || numPages <= 0) return;

    // Get current selection state
    const currentValues = signaturePageConfigs[signatureId] || ["all"];
    // 🎯 FIX: Generate page numbers starting from 1 to numPages (not 0-based)
    const allPageNumbers = Array.from({ length: numPages }, (_, i) =>
      (i + 1).toString()
    );

    let finalPageValues = pageValues;

    // 🎯 FIX: Prevent unchecking the last option - if only 1 option remains, keep it checked
    if (pageValues.length === 0) {
      // Don't allow empty selection, keep current values
      finalPageValues = currentValues;
      return; // Exit early, don't update state
    }

    // 🎯 FIX: Check if user unselected all pages (no options selected)
    if (pageValues.length === 0) {
      // Delete the signature element by calling onLayerDelete
      if (onLayerDelete) {
        onLayerDelete(signatureId);
      }

      // 🎯 NEW: Update Redux state
      const newConfigs = { ...signaturePageConfigs };
      delete newConfigs[signatureId];
      setSignaturePageConfigs(newConfigs);

      return; // Exit early, don't send config change
    }

    // Check if "all" was just selected or deselected
    const wasAllSelected = currentValues.includes("all");
    const isAllSelected = pageValues.includes("all");

    if (isAllSelected && !wasAllSelected) {
      // "ทุกหน้า" was just selected → select all pages
      finalPageValues = ["all", ...allPageNumbers];
    } else if (!isAllSelected && wasAllSelected) {
      // 🎯 FIX: "ทุกหน้า" was just deselected → keep current page instead of defaulting to page 1
      const individualPages = pageValues.filter((val) => val !== "all");
      if (individualPages.length > 0) {
        finalPageValues = individualPages;
      } else {
        // If no individual pages selected, default to current page
        const currentPage = activePage || 1;
        finalPageValues = [currentPage.toString()];
      }
    } else if (!isAllSelected) {
      // "ทุกหน้า" is not selected, check if all individual pages are selected
      const individualPages = pageValues.filter((val) => val !== "all");

      // If all individual pages are selected, automatically add "ทุกหน้า"
      if (
        individualPages.length === numPages &&
        allPageNumbers.every((page) => individualPages.includes(page))
      ) {
        finalPageValues = ["all", ...allPageNumbers];
      } else {
        // Keep only individual page selections
        finalPageValues = individualPages;
      }
    } else if (isAllSelected && wasAllSelected) {
      // "ทุกหน้า" is still selected, but some individual pages might have been unchecked
      const individualPages = pageValues.filter((val) => val !== "all");

      // If not all pages are selected, uncheck "ทุกหน้า"
      if (
        individualPages.length < numPages ||
        !allPageNumbers.every((page) => individualPages.includes(page))
      ) {
        // Keep current page if no individual pages selected
        finalPageValues =
          individualPages.length > 0
            ? individualPages
            : [(activePage || 1).toString()];
      } else {
        // All pages are still selected, keep "ทุกหน้า" checked
        finalPageValues = ["all", ...allPageNumbers];
      }
    }

    // 🎯 FIX: Ensure we always have at least one page selected
    if (finalPageValues.length === 0) {
      // Default to current page instead of page 1
      const currentPage = activePage || 1;
      finalPageValues = [currentPage.toString()];
    }

    // 🎯 NEW: Update Redux state
    setSignaturePageConfigs({
      ...signaturePageConfigs,
      [signatureId]: finalPageValues,
    });

    // Send configuration change to parent component
    if (onConfigChange) {
      const pageNumbers = finalPageValues.includes("all")
        ? Array.from({ length: numPages }, (_, i) => i + 1) // All pages from 1 to numPages
        : finalPageValues.filter((p) => p !== "all").map((p) => parseInt(p));

      const configData: FormElementConfigData = {
        id: signatureId,
        label: `ลายเซ็น - ${finalPageValues.includes("all")
          ? "ทุกหน้า"
          : `หน้า ${finalPageValues.filter((p) => p !== "all").join(", ")}`
          }`,
        // 🎯 FIX: Add page configuration to the config data
        // If "all" is selected, set pageNumbers to all pages (1 to numPages)
        // Otherwise, convert string values to numbers (excluding "all")
        pageNumbers: pageNumbers,
      };

      onConfigChange(configData);
    }
  };

  const handleMoreFileConfigChange = (
    moreFileId: string,
    field: string,
    value: any
  ) => {
    const moreFileItems =
      items?.filter((item) => item.type === "more-file") || [];

    // Check if this item is part of a group
    const itemTimestamp = moreFileId.split("-").slice(-2, -1)[0];
    const groupItems = moreFileItems.filter((groupItem) => {
      const groupTimestamp = groupItem.id.split("-").slice(-2, -1)[0];
      return (
        groupTimestamp === itemTimestamp && groupItem.id.includes("more-file-")
      );
    });

    // Determine which items to update
    const foundItem = moreFileItems.find((item) => item.id === moreFileId);
    const itemsToUpdate =
      groupItems.length > 1 ? groupItems : foundItem ? [foundItem] : [];

    // Update local state for all items in the group
    const newMoreFileConfigs = { ...moreFileConfigs };
    itemsToUpdate.forEach((item) => {
      if (item) {
        newMoreFileConfigs[item.id] = {
          ...newMoreFileConfigs[item.id],
          [field]: value,
        };
      }
    });

    // 🎯 NEW: Update Redux state
    setMoreFileConfigs(newMoreFileConfigs);

    // Update the items and send config changes to parent
    if (items && onConfigChange) {
      itemsToUpdate.forEach((currentItem) => {
        if (currentItem) {
          // Get all current values from local state or fallback to item
          const currentLocalConfig = newMoreFileConfigs[currentItem.id] || {};

          // Create comprehensive config data with all current values including the new one
          const configData: FormElementConfigData = {
            id: currentItem.id,
            label: currentItem.label || "",
            maxFileSize:
              currentLocalConfig.maxFileSize ??
              currentItem.maxFileSize ??
              CONFIG_CONSTANTS.MORE_FILE_MAX_SIZE,
            typeName: currentLocalConfig.typeName ?? currentItem.typeName ?? "",
            isEmbedded:
              currentLocalConfig.isEmbedded ??
              currentItem.isEmbedded ??
              CONFIG_CONSTANTS.MORE_FILE_DEFAULT_IS_EMBEDDED,
            required:
              currentLocalConfig.required ??
              currentItem.required ??
              CONFIG_CONSTANTS.MORE_FILE_DEFAULT_IS_REQUIRED,
            fileAccept:
              currentLocalConfig.fileAccept ?? currentItem.fileAccept ?? [],
            // Override with the specific field being updated
            [field]: value,
          };
          // Send the updated config to parent
          onConfigChange(configData);
        }
      });
    }

    // Trigger validation immediately for both maxFileSize and typeName changes
    if (
      (field === "maxFileSize" || field === "typeName") &&
      onValidationChange
    ) {
      // Small delay to ensure state is updated before validation
      setTimeout(() => {
        const isValid = checkOverallValidation();
        onValidationChange(isValid);
      }, 0);
    }
  };

  // Render signature elements for a specific actor
  const renderSignatureElements = (actorId: string) => {
    const actorSignatures = getActorSignatures(actorId);

    // Generate page options for dropdown
    const generatePageOptions = () => {
      if (!numPages || numPages <= 0) return [];

      const options = [{ value: "all", label: "ทุกหน้า" }];

      for (let i = 1; i <= numPages; i++) {
        options.push({
          value: i.toString(),
          label: `หน้า ${i}`,
        });
      }

      return options;
    };

    const pageOptions = generatePageOptions();

    return (
      <div className="space-y-2">
        {/* 🎯 NEW: Show warning message when in Approver mode and has existing signatures */}
        {/* {currentStepPermissionType === "Approver" && actorSignatures.length > 0 && (
          <div className="p-3 mb-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-yellow-800 text-sm font-medium mb-1">
              ⚠️ โหมด Approver
            </div>
            <div className="text-yellow-700 text-xs">
              ไม่สามารถแก้ไขลายเซ็นได้ในโหมด Approver
            </div>
          </div>
        )} */}

        {/* Show existing signatures */}
        {actorSignatures?.map((signature, index) => {
          const currentValues = signaturePageConfigs[signature.id] || ["all"];
          // 🎯 FIX: Remove the disabled logic that was causing issues
          // const isLastOption = currentValues.length === 1;

          return (
            <div
              key={signature.id}
              onClick={() => onLayerSelect && onLayerSelect(signature)}
            >
              <Select
                suffixIcon={<ChevronDown size={20} />}
                mode="multiple"
                placeholder="เลือกหน้า"
                options={pageOptions} // 🎯 FIX: Remove disabled logic
                value={currentValues}
                className="w-full max-w-full [&ant-select-selector]:!border-none [&ant-select-selector]:!border-0 "
                onClick={(e) => e.stopPropagation()}
                onChange={(value) => {
                  handleSignaturePageChange(signature.id, value);
                }}
                maxTagCount={1}
                maxTagTextLength={10}
                maxTagPlaceholder={(omittedValues) => (
                  <span className="text-gray-500 !bg-transparent">
                    ... +{omittedValues.length}
                  </span>
                )}
                disabled={isTemplateMode || stepIndex === "all" || currentStepPermissionType === "Approver" || isViewMode} // 🎯 เพิ่ม || isViewMode
              />
              {/* Delete button moved to FormCanvas formHandle */}
              {/* {onLayerDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerDelete(signature.id);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash size={16} />
                  </button>
                )} */}
            </div>
          );
        })}

        {/* Add signature button */}
        {showAddButton && currentStepPermissionType !== "Approver" && !isTemplateMode && !isViewMode && (
          <div
            className="p-2 mb-2 bg-white hover:bg-blue-100 transition-all duration-300 border border-theme text-theme rounded-xl cursor-pointer"
            onClick={() =>
              handleElementClick(
                {
                  id: "signature",
                  type: "signature",
                  label: `คนที่ ${parseInt(actorId) + 1}`,
                },
                actorId
              )
            }
          >
            <div className="w-full flex items-center justify-center gap-1">
              <span className="mr-2">
                <Plus size={20} />
              </span>
              <span className="text-medium font-medium">เพิ่มลายเซ็น</span>
            </div>
          </div>
        )}

        {/* 🎯 NEW: Show warning message when in Approver mode */}
        {/* {currentStepPermissionType === "Approver" && (
          <div className="p-3 mb-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-yellow-800 text-sm font-medium mb-1">
              ⚠️ โหมด Approver
            </div>
            <div className="text-yellow-700 text-xs">
              ไม่สามารถเพิ่มลายเซ็นได้ในโหมด Approver
            </div>
          </div>
        )} */}
      </div>
    );
  };

  // Render more-file configuration UI
  const renderMoreFileConfig = (moreFile: ExtendedFormItem) => {
    // Initialize refs for this more-file if not exists
    if (!moreFileInputRefs.current[moreFile.id]) {
      moreFileInputRefs.current[moreFile.id] = {};
    }

    // Get current config values from state or fallback to moreFile props
    const currentConfig = moreFileConfigs[moreFile.id] || {};
    const isEmbedded =
      currentConfig.isEmbedded ??
      moreFile.isEmbedded ??
      CONFIG_CONSTANTS.MORE_FILE_DEFAULT_IS_EMBEDDED;
    const required =
      currentConfig.required ??
      moreFile.required ??
      CONFIG_CONSTANTS.MORE_FILE_DEFAULT_IS_REQUIRED;
    const typeName = currentConfig.typeName ?? moreFile.typeName ?? "";
    const maxFileSize =
      currentConfig.maxFileSize ??
      moreFile.maxFileSize ??
      CONFIG_CONSTANTS.MORE_FILE_MAX_SIZE;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 w-full flex-wrap">
          {/* <div className="flex items-center gap-2">
            <input
              ref={(el) => {
                if (moreFileInputRefs.current[moreFile.id]) {
                  moreFileInputRefs.current[moreFile.id].isEmbedded = el;
                }
              }}
              type="checkbox"
              checked={isEmbedded}
              onChange={(e) => {
                handleMoreFileConfigChange(
                  moreFile.id,
                  "isEmbedded",
                  e.target.checked
                );
              }}
            />
            <span className="text-sm font-medium">แนบไฟล์ไปกับ PDF</span>
          </div> */}

          <div className="flex items-center gap-2">
            <input
              ref={(el) => {
                if (moreFileInputRefs.current[moreFile.id]) {
                  moreFileInputRefs.current[moreFile.id].required = el;
                }
              }}
              type="checkbox"
              checked={required}
              disabled={isTemplateMode || isViewMode} // 🎯 เพิ่ม || isViewMode
              onChange={(e) => {
                if (!isTemplateMode && !isViewMode) { // 🎯 เพิ่ม && !isViewMode
                  handleMoreFileConfigChange(
                    moreFile.id,
                    "required",
                    e.target.checked
                  );
                }
              }}
            />
            <span className="text-sm font-medium">Required</span>
          </div>
        </div>

        <div className="mb-2">
          <label className="text-sm font-medium block mb-1">ชื่อประเภท</label>
          <Input
            ref={(el) => {
              if (moreFileInputRefs.current[moreFile.id]) {
                moreFileInputRefs.current[moreFile.id].typeName =
                  el?.input || null;
              }
            }}
            value={typeName}
            disabled={isTemplateMode || isViewMode} // 🎯 เพิ่ม || isViewMode
            onChange={(e) => {
              if (!isTemplateMode && !isViewMode) { // 🎯 เพิ่ม && !isViewMode
                handleMoreFileConfigChange(
                  moreFile.id,
                  "typeName",
                  e.target.value
                );
              }
            }}
            placeholder="ระบุ"
            className={`w-full ${typeName.trim() === "" ? "border-red-500" : ""
              }`}
            status={typeName.trim() === "" ? "error" : undefined}
          />
          {typeName.trim() === "" && (
            <div className="text-red-600 text-xs font-medium mt-1">
              กรุณาระบุชื่อประเภท
            </div>
          )}
        </div>

        <div className="mb-2">
          <label className="text-sm font-medium block mb-1">
            ขนาดไฟล์ (MB)
          </label>
          {(() => {
            const currentSize = maxFileSize || 0;
            const validation = validateFileSize(moreFile.id, currentSize);
            const isInvalid = !validation.isValid;
            const totalUsed = calculateTotalFileSize();
            const maxAllowed = Math.max(1, validation.remaining);

            return (
              <>
                <InputNumber
                  ref={(el) => {
                    if (moreFileInputRefs.current[moreFile.id] && el) {
                      moreFileInputRefs.current[moreFile.id].maxFileSize =
                        el as any;
                    }
                  }}
                  min={1}
                  max={maxAllowed}
                  disabled={isTemplateMode || isViewMode} // 🎯 เพิ่ม || isViewMode
                  value={currentSize}
                  onChange={(value) => {
                    if (!isTemplateMode && !isViewMode) { // 🎯 เพิ่ม && !isViewMode
                      const newValue = Math.min(
                        Math.max(value || 1, 1),
                        maxAllowed
                      );

                      handleMoreFileConfigChange(
                        moreFile.id,
                        "maxFileSize",
                        newValue
                      );
                    }
                  }}
                  onBlur={(e) => {
                    if (!isTemplateMode && !isViewMode) { // 🎯 เพิ่ม && !isViewMode
                      // Force clamp the value on blur
                      const inputValue = parseFloat(e.target.value) || 1;
                      const clampedValue = Math.min(
                        Math.max(inputValue, 1),
                        maxAllowed
                      );

                      if (inputValue !== clampedValue) {
                        handleMoreFileConfigChange(
                          moreFile.id,
                          "maxFileSize",
                          clampedValue
                        );
                      }
                    }
                  }}
                  className={`w-full ${isInvalid ? "border-red-500 text-red-500" : ""
                    }`}
                  placeholder="1"
                  status={isInvalid ? "error" : undefined}
                />

                {/* แสดงข้อมูลสถานะการใช้งาน */}
                <div className="mt-1 space-y-1">
                  {isInvalid && (
                    <div className="text-red-600 text-xs font-medium">
                      ขนาดไฟล์รวมเกิน 100 MB กรุณาลดขนาดไฟล์
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>

        <div className="mb-2">
          <label className="text-sm font-medium block mb-1">รูปแบบ</label>
          <Select
            suffixIcon={<ChevronDown size={20} />}
            ref={(el) => {
              if (moreFileInputRefs.current[moreFile.id] && el) {
                moreFileInputRefs.current[moreFile.id].fileAccept = el as any;
              }
            }}
            mode="multiple"
            disabled={isTemplateMode || isViewMode} // 🎯 เพิ่ม || isViewMode
            value={currentConfig.fileAccept || []}
            onChange={(value) => {
              if (!isTemplateMode && !isViewMode) { // 🎯 เพิ่ม && !isViewMode
                handleMoreFileConfigChange(moreFile.id, "fileAccept", value);
              }
            }}
            placeholder="เลือกประเภทไฟล์"
            className="w-full max-w-full"
            maxTagCount={1}
            maxTagTextLength={20}
            maxTagPlaceholder={(omittedValues) => (
              <span className="text-gray-500 !bg-transparent">
                ... +{omittedValues.length}
              </span>
            )}
            options={[
              { value: "compressed_file", label: "ไฟล์บีบอัด" },
              {
                value: "document_text_code",
                label: "เอกสารทั่วไป/ ข้อความ/ โค้ด",
              },
              { value: "microsoft_office", label: "เอกสาร Microsoft Office" },
              { value: "microsoft_pdf", label: "เอกสาร Microsoft PDF" },
              { value: "audio_file", label: "เสียง (Audio Files)" },
              { value: "video_file", label: "วิดีโอ (Video Files)" },
              { value: "image_file", label: "รูปภาพ (Image Files)" },
              // { value: "other", label: "อื่นๆ" },
            ]}
            allowClear
            style={{
              overflow: "hidden",
            }}
          />
        </div>
      </div>
    );
  };

  // Render more-file elements for a specific actor
  const renderMoreFileElements = (actorId: string) => {
    const actorMoreFiles = getActorMoreFiles(actorId);
    const totalUsed = calculateTotalFileSize();
    const isOverLimit = totalUsed > 100;

    // Group more-file elements that were created together
    const processedIds = new Set<string>();
    const displayItems: ExtendedFormItem[] = [];

    actorMoreFiles.forEach((item) => {
      if (processedIds.has(item.id)) return;

      // Check if this is part of a group created from stepIndex = "all"
      const itemTimestamp = item.id.split("-").slice(-2, -1)[0];
      const groupItems = actorMoreFiles.filter((groupItem) => {
        const groupTimestamp = groupItem.id.split("-").slice(-2, -1)[0];
        return (
          groupTimestamp === itemTimestamp &&
          groupItem.id.includes("more-file-")
        );
      });

      if (groupItems.length > 1) {
        // This is a group - show only the first item as representative
        displayItems.push({
          ...item,
          __isGroup: true,
          __groupItems: groupItems,
        } as ExtendedFormItem & { __isGroup: boolean; __groupItems: ExtendedFormItem[] });
        groupItems.forEach((groupItem) => processedIds.add(groupItem.id));
      } else {
        // Individual element
        displayItems.push(item);
        processedIds.add(item.id);
      }
    });

    // Create collapse items for display items
    const moreFileCollapseItems: CollapseProps["items"] = displayItems.map(
      (moreFile, index) => ({
        key: moreFile.id,
        label: (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="text-sm">
                ประเภท {index + 1}
                {(moreFile as any).__isGroup && (
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full ml-2">
                    ทุกคน
                  </span>
                )}
              </span>
            </div>
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Delete button moved to FormCanvas formHandle */}
              {onLayerDelete && !isTemplateMode && !isViewMode && (
                <button
                  onClick={(e) => {
                    if (!isTemplateMode && !isViewMode) { // 🎯 เพิ่ม && !isViewMode
                      e.stopPropagation();
                      if ((moreFile as any).__isGroup && (moreFile as any).__groupItems) {
                        (moreFile as any).__groupItems.forEach((groupItem: ExtendedFormItem) => {
                          onLayerDelete(groupItem.id);
                        });
                      } else {
                        onLayerDelete(moreFile.id);
                      }
                    }
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash size={16} />
                </button>
              )}
            </div>
          </div>
        ),
        children: renderMoreFileConfig(moreFile),
        style: {
          marginBottom: 8,
          background: "#FAFAFA",
          borderRadius: "4px",
          border: "none",
          padding: "0 !important",
        },
      })
    );

    return (
      <>
        {/* More-file elements collapse */}
        <div className="mb-2">
          {actorMoreFiles.length > 0 && (
            <Collapse
              bordered={false}
              className="shadow-none border-0 rounded-lg mb-2" //[&_.ant-collapse-content-box]:!p-0 [&_.ant-collapse-header]:!py-1 [&_.ant-collapse-header]:!px-0
              expandIcon={({ isActive }) => (
                <ChevronDown
                  className={`${isActive ? "rotate-180" : ""
                    } bg-theme px-1 rounded-full`}
                  size={24}
                  color="white"
                />
              )}
              items={moreFileCollapseItems}
              activeKey={expandedMoreFileIds}
              onChange={(keys) =>
                setExpandedMoreFileIds(
                  Array.isArray(keys) ? keys : [keys].filter(Boolean)
                )
              }
              style={{
                background: "transparent",
                padding: "0 !important",
              }}
              expandIconPosition="start"
            />
          )}

          {/* Add more-file button */}
          {showAddButton && (
            <div
              className="p-2 mb-2 bg-white hover:bg-blue-100 transition-all duration-300 border border-theme text-theme rounded-xl cursor-pointer"
              onClick={() =>
                handleElementClick(
                  {
                    id: "more-file",
                    type: "more-file",
                    label: `คนที่ ${parseInt(actorId) + 1}`,
                  },
                  actorId
                )
              }
            >
              <div className="w-full flex items-center justify-center gap-1">
                <span className="mr-2">
                  <Plus size={20} />
                </span>
                <span className="text-medium font-medium">เพิ่มประเภท</span>
                เพิ่มประเภทไฟล์เพิ่มเติม
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  const [allPageItems, setAllPageItems] = useState<FormItem[]>([]);

  const handleAllPageItems = (data: FormItem[]) => {
    setAllPageItems(data);
  };
  useEffect(() => {
    const listener = (data?: FormItem[]) => {
      if (data) {
        handleAllPageItems(data);
      }
    };

    appEmitter.on("allPageItems", listener);
    return () => {
      appEmitter.off("allPageItems", listener);
    };
  }, []);

  // 🎯 NEW: Get stamps by section using ID-based filtering
  const getStampsBySection = (section: string, co_contract?: string) => {

    // pattern stamp-มาตรา 9-0-123-page2
    const coContractIndex = co_contract === "ต้นสัญญา" ? "0" : "1";
    const coContractItems = items && items.length > 0 ? items.filter(item => item.id.split("-")[2] === coContractIndex) : [];
    const coContractAllItems = allPageItems.length > 0 ? allPageItems.filter(item => item.id.split("-")[2] === coContractIndex) : [];
    let resourceItems = coContractItems && coContractItems.length > 0 ? coContractItems : coContractAllItems.length > 0 ? coContractAllItems : [];
    if (!resourceItems) return [];
    return resourceItems.filter(
      (item) =>
        item.type === "stamp" &&
        item.section === section &&
        // Use ID pattern to filter stamps: stamp-{section}-{index}-{timestamp}
        item.id.includes(`stamp-${section}-`)
    );
  };

  // Render stamp elements for a specific section
  const renderStampElements = (section: string) => {
    // 🎯 FIXED: Get stamps by section like signature elements all page
    const co_contract = label.includes("ต้นสัญญา") ? "ต้นสัญญา" : "คู่สัญญา";
    const allSectionStamps = getStampsBySection(section, co_contract);
    // pattern stamp-มาตรา 9-0-123-page2
    const sectionStamps = allSectionStamps.filter((item, index) => index === 0);

    // Generate page options for dropdown
    const generatePageOptions = () => {
      if (!numPages || numPages <= 0) return [];

      const options = [{ value: "all", label: "ทุกหน้า" }];

      for (let i = 1; i <= numPages; i++) {
        options.push({
          value: i.toString(),
          label: `หน้า ${i}`,
        });
      }

      return options;
    };

    const pageOptions = generatePageOptions();

    // if sectionStamps is empty, return add stamp button
    if (sectionStamps.length === 0 && section === "มาตรา 9" && docType === "b2b" && !isTemplateMode && !isViewMode) {
      return (
        <div className="space-y-2">
          <button 
          className="flex items-center justify-center w-full gap-2 p-2 mb-2 bg-white hover:bg-blue-100 transition-all duration-300 border border-theme text-theme rounded-xl cursor-pointer"
          onClick={() => {
            if (!isTemplateMode && !isViewMode) { // 🎯 เพิ่ม && !isViewMode
              handleElementClick({
                id: `stamp-global-${section}`,
                type: "stamp",
                label: `เพิ่มตราประทับ (${co_contract}-${section})`,
              })
            }
          }}
          >
            <Plus size={20} />
            เพิ่มตราประทับ
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {/* Show existing stamps unique */}
        {sectionStamps?.map((stamp, index) => {
          const currentValues = stampPageConfigs[stamp.id] || ["all"];

          return (
            <div
              key={stamp.id}
              onClick={() => onLayerSelect && onLayerSelect(stamp as ExtendedFormItem)}
              className="stamp-config bg-white"
            >
              <div className="w-full">
                {/* <div className="mb-4">
                  <h4 className="text-sm font-bold block py-2">{section}</h4> */}
                  {/* <label
                    className="text-sm font-medium block mb-1"
                    htmlFor="stamp"
                  >
                    ตราประทับ
                  </label> */}
                  {/* <Select
                    suffixIcon={<ChevronDown size={20} />}
                    disabled={isTemplateMode} // 🎯 NEW: Disable in template mode
                    value={"เลือกตราประทับ"}
                    onChange={(value) => {
                      if (!isTemplateMode) {
                        handleStampConfigChange(stamp.id, "stamp_name", value);
                      }
                    }}
                    placeholder="เลือกตราประทับ"
                    className="w-full max-w-full"
                    options={stampData?.map((stamp) => ({
                      value: stamp.stamp_name,
                      label: stamp.stamp_name,
                    }))}
                    allowClear={false}
                    style={{
                      overflow: "hidden",
                    }}
                  /> */}
                {/* </div> */}
                <div>
                  <label
                    className="text-sm font-medium block mb-1"
                    htmlFor="stamp"
                  >
                    ตำแหน่งตราประทับ
                  </label>
                  <Select
                    suffixIcon={<ChevronDown size={20} />}
                    mode="multiple"
                    disabled={isTemplateMode || isViewMode} // 🎯 เพิ่ม || isViewMode
                    placeholder="เลือกหน้า"
                    options={pageOptions}
                    value={currentValues}
                    className="w-full max-w-full [&ant-select-selector]:!border-none [&ant-select-selector]:!border-0 "
                    onClick={(e) => e.stopPropagation()}
                    onChange={(value) => {
                      if (!isTemplateMode && !isViewMode) { // 🎯 เพิ่ม && !isViewMode
                        handleStampPageChange(stamp.id, value);
                      }
                    }}
                    maxTagCount={1}
                    maxTagTextLength={10}
                    maxTagPlaceholder={(omittedValues) => (
                      <span className="text-gray-500 !bg-transparent">
                        ... +{omittedValues.length}
                      </span>
                    )}
                  />
                </div>
                {/* <div>
                  <button className="text-sm font-medium block mb-1">
                    <Plus size={20} />
                    เพิ่มตราประทับ
                  </button>
                </div> */}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Handle input changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement> | number | boolean | string,
    field: string
  ) => {
    const newValue = typeof e === "object" ? e.target?.value : e;

    // 🎯 NEW: Update Redux state immediately
    updateElementConfigField(id, field, newValue);

    // 🎯 REAL-TIME UPDATE: Update local state immediately
    setFormState((prev) => ({
      ...prev,
      [field]: newValue,
    }));

    // 🎯 REAL-TIME UPDATE: Update config immediately for label changes
    if (field === "label" && onConfigChange) {
      const configData: FormElementConfigData = {
        ...formState,
        [field]: String(newValue),
        // 🎯 FIXED: Include date config if it exists
        ...(formState.date && {
          date: {
            ...formState.date,
            // 🎯 FIXED: Update header when label changes
            header: String(newValue),
          },
        }),
      };
      onConfigChange(configData);
    }
  };

  // ฟังก์ชันสำหรับอัปเดตค่า
  const handleValueChange = (
    newValue: string | string[] | boolean | number,
    index?: number
  ) => {
    // 🎯 สำหรับ text elements ใหม่ที่ไม่มีค่า ใช้ default placeholder
    let finalValue = newValue;
    if (
      type === "text" &&
      typeof newValue === "string" &&
      newValue === "" &&
      !localValue
    ) {
      finalValue = CONFIG_CONSTANTS.TEXT_PLACEHOLDER;
    } else if (
      type === "select" &&
      typeof newValue === "string" &&
      newValue === "" &&
      !localValue
    ) {
      finalValue = CONFIG_CONSTANTS.SELECT_PLACEHOLDER;
    } else if (
      type === "date" &&
      typeof newValue === "string" &&
      newValue === "" &&
      !localValue
    ) {
      finalValue = CONFIG_CONSTANTS.DATE_PLACEHOLDER;
    }

    if (index !== undefined && Array.isArray(localValue)) {
      // กรณีเป็น array เช่น checkbox options
      const newArray = [...localValue];
      newArray[index] = finalValue as string;

      // 🎯 NEW: Update Redux state
      setLocalValue(id, newArray);

      if (onValueChange) {
        const options =
          type === "checkbox"
            ? formState.checkboxOptions
            : type === "radio"
              ? formState.radioOptions
              : type === "select"
                ? formState.selectOptions
                : undefined;
        onValueChange(newArray, options);
      }
    } else {
      // กรณีเป็นค่าเดี่ยวๆ

      // 🎯 NEW: Update Redux state
      setLocalValue(id, finalValue);

      if (onValueChange) {
        const options =
          type === "checkbox"
            ? formState.checkboxOptions
            : type === "radio"
              ? formState.radioOptions
              : type === "select"
                ? formState.selectOptions
                : undefined;
        onValueChange(finalValue, options);
      }
    }
  };

  const renderElementConfigUI = () => {
    if (
      type !== "signature" &&
      type !== "more-file" &&
      type !== "stamp" &&
      (localValue === undefined || localValue === null)
    ) {
      return null;
    }

    switch (type) {
      case "text":
        return (
          <>
            <div className="mb-2">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="input"
                  className="text-sm font-medium block mb-2"
                >
                  Text
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={
                      isEditingConfig.required
                        ? tempConfigState.required
                        : formState.required
                    }
                    disabled={isTemplateMode || isViewMode} // ❌ ควรเป็น: isTemplateMode || isViewMode
                    onChange={(e) => {
                      if (!isTemplateMode) { // ❌ ควรเป็น: if (!isTemplateMode && !isViewMode)
                        // 🎯 NEW: Update Redux state
                        setTempConfig(id, {
                          ...tempConfigState,
                          required: e.target.checked,
                        });
                        setEditingState(id, "required", true);
                      }
                    }}
                    onBlur={() => {
                      if (!isTemplateMode) {
                        // 🎯 NEW: Update Redux state
                        setEditingState(id, "required", false);
                        updateElementConfigField(
                          id,
                          "required",
                          tempConfigState.required
                        );
                        setFormState((prev) => ({
                          ...prev,
                          required: tempConfigState.required,
                        }));
                        onConfigChange({
                          ...formState,
                          required: tempConfigState.required,
                        });
                      }
                    }}
                  />
                  <span>Required field</span>
                </div>
              </div>
              <input
                ref={textInputRef}
                type="text"
                disabled={isTemplateMode || isViewMode} // ❌ ควรเป็น: isTemplateMode || isViewMode
                onChange={(e) => {
                  if (!isTemplateMode && !isViewMode) { // ❌ ควรเป็น: if (!isTemplateMode && !isViewMode)
                    setInputValue(id, e.target.value);
                  }
                }}
                className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={
                  formState.placeholder || CONFIG_CONSTANTS.TEXT_PLACEHOLDER
                }
                maxLength={
                  isEditingConfig.maxLength
                    ? tempConfigState.maxLength
                    : formState.maxLength
                }
                onBlur={(e) => {
                  if (!isTemplateMode && !isViewMode) { // ❌ ควรเป็น: if (!isTemplateMode && !isViewMode)
                    // Update parent state only when input loses focus
                    const currentValue = e.target.value;
                    if (currentValue !== localValue) {
                      // 🎯 NEW: Update Redux state
                      setLocalValue(id, currentValue);
                      if (onValueChange) {
                        onValueChange(currentValue, formState.checkboxOptions);
                      }
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (!isTemplateMode && e.key === "Enter") { // ❌ ควรเป็น: if (!isTemplateMode && !isViewMode && e.key === "Enter")
                    // อัปเดต parent state ทันทีเมื่อกด Enter
                    const currentValue = e.currentTarget.value;
                    if (currentValue !== localValue) {
                      // 🎯 NEW: Update Redux state
                      setLocalValue(id, currentValue);
                      if (onValueChange) {
                        onValueChange(currentValue, formState.checkboxOptions);
                      }
                    }
                    e.currentTarget.blur(); // Trigger onBlur
                  }
                }}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <label
                  htmlFor="maxLength"
                  className="text-sm font-medium block mb-2"
                >
                  Character No.
                </label>
                <InputNumber
                  min={1}
                  max={1000}
                  disabled={isTemplateMode || isViewMode} // ❌ ควรเป็น: isTemplateMode || isViewMode
                  value={
                    isEditingConfig.maxLength
                      ? tempConfigState.maxLength
                      : formState.maxLength
                  }
                  onChange={(value) => {
                    if (!isTemplateMode && !isViewMode) { // ❌ ควรเป็น: if (!isTemplateMode && !isViewMode)
                      // 🎯 NEW: Update Redux state
                      setTempConfig(id, {
                        ...tempConfigState,
                        maxLength: value as number,
                      });
                      setEditingState(id, "maxLength", true);
                    }
                  }}
                  onBlur={() => {
                    if (!isTemplateMode && !isViewMode) { // ❌ ควรเป็น: if (!isTemplateMode && !isViewMode)
                      // 🎯 NEW: Update Redux state
                      setEditingState(id, "maxLength", false);
                      updateElementConfigField(
                        id,
                        "maxLength",
                        tempConfigState.maxLength
                      );
                      setFormState((prev) => ({
                        ...prev,
                        maxLength: tempConfigState.maxLength,
                      }));
                      onConfigChange({
                        ...formState,
                        maxLength: tempConfigState.maxLength,
                      });
                    }
                  }}
                />
              </div>
              <div className="mb-0">
                <label
                  htmlFor="placeholder"
                  className="text-sm font-medium block mb-2"
                >
                  lines No.
                </label>
                <InputNumber
                  min={1}
                  max={1000}
                  disabled={isTemplateMode || isViewMode} // ❌ ควรเป็น: isTemplateMode || isViewMode
                  value={
                    isEditingConfig.minLines
                      ? tempConfigState.minLines
                      : formState.minLines
                  }
                  onChange={(value) => {
                    if (!isTemplateMode && !isViewMode) { // ❌ ควรเป็น: if (!isTemplateMode && !isViewMode)
                      // 🎯 NEW: Update Redux state
                      setTempConfig(id, {
                        ...tempConfigState,
                        minLines: value as number,
                      });
                      setEditingState(id, "minLines", true);
                    }
                  }}
                  onBlur={() => {
                    if (!isTemplateMode && !isViewMode) { // ❌ ควรเป็น: if (!isTemplateMode && !isViewMode)
                      // 🎯 NEW: Update Redux state
                      setEditingState(id, "minLines", false);
                      updateElementConfigField(
                        id,
                        "minLines",
                        tempConfigState.minLines
                                           );
                      setFormState((prev) => ({
                        ...prev,
                        minLines: tempConfigState.minLines,
                      }));
                      onConfigChange({
                        ...formState,
                        minLines: tempConfigState.minLines,
                      });
                    }
                  }}
                  placeholder="1"
                />
              </div>
            </div>
          </>
        );
      case "checkbox":
        const checkboxValues = Array.isArray(localValue) ? localValue : [];

        // 🎯 CHECKBOX-SPECIFIC HANDLERS (INDEPENDENT)
        const handleCheckboxOptionTextChange = (
          elementId: string,
          newValue: string
        ) => {
          // 🎯 NEW: Find index by elementId for more accurate targeting
          const groupedElements =
            groupedCheckboxRadioElements ||
            (configElement as any)?.__checkboxRadioElements ||
            [];
          const elementIndex = groupedElements.findIndex(
            (el: any) => el.id === elementId
          );

          if (elementIndex >= 0) {
            // 🎯 NEW: Update Redux state with correct index
            const newState = {
              ...checkboxOptionValues,
              [elementIndex]: newValue,
            };
            setCheckboxOptionValues(id, newState);
          } else {
            console.error(
              "❌ [handleCheckboxOptionTextChange] Element not found:",
              elementId
            );
          }
        };

        const handleCheckboxOptionClick = (elementId: string) => {
          // 🎯 NEW: Handle element selection like isSelected in FormCanvas
          if (onLayerSelect && groupedCheckboxRadioElements) {
            const element = groupedCheckboxRadioElements.find(
              (el: any) => el.id === elementId
            );
            if (element) {
              onLayerSelect(element);
            }
          }
        };

        const handleCheckboxOptionBlur = (elementId: string) => {
          // 🎯 NEW: Handle grouped elements on blur using elementId
          const groupedElements =
            groupedCheckboxRadioElements ||
            (configElement as any)?.__checkboxRadioElements ||
            [];

          if (groupedElements.length > 0) {
            const elementIndex = groupedElements.findIndex(
              (el: any) => el.id === elementId
            );
            const elementToUpdate = groupedElements[elementIndex];
            const currentValue = checkboxOptionValues[elementIndex] || "";

            if (elementToUpdate && onValueChange && elementIndex >= 0) {
              // 🎯 FIX: Update the specific element's checkboxOptions with correct value
              const updatedOptions = [currentValue]; // Each element has only one option

              // 🎯 CRITICAL FIX: Pass the correct element ID to onValueChange
              // This ensures the correct element gets updated, not just the first one
              // Send elementId with the value so LayerPanel can identify which element to update
              const valueWithElementId = `elementId:${elementId}:${JSON.stringify(
                elementToUpdate.value || []
              )}`;
              onValueChange(valueWithElementId, updatedOptions);
            }
          } else {
            // Fallback to formState for non-grouped elements
            const elementIndex = groupedElements.findIndex(
              (el: any) => el.id === elementId
            );
            const updatedOptions = [...(formState.checkboxOptions || [])];
            updatedOptions[elementIndex] =
              checkboxOptionValues[elementIndex] || "";

            // 🎯 NEW: Update Redux state immediately
            updateElementConfigField(id, "checkboxOptions", updatedOptions);

            // Update local state immediately
            setFormState((prev) => ({
              ...prev,
              checkboxOptions: updatedOptions,
            }));

            // Update parent state immediately
            if (onValueChange) {
              onValueChange(checkboxValues, updatedOptions);
            }

            // Update config immediately
            if (onConfigChange) {
              onConfigChange({
                ...formState,
                checkboxOptions: updatedOptions,
              });
            }
          }
        };

        const handleCheckboxOptionRemove = (index: number) => {
          // 🎯 SIMPLIFIED: Use onLayerDelete directly like FormHandle
          const groupedElements =
            groupedCheckboxRadioElements ||
            (configElement as any)?.__checkboxRadioElements ||
            [];

          if (groupedElements.length > 0) {
            // Get the element to delete
            const elementToDelete = groupedElements[index];

            if (elementToDelete && onLayerDelete) {
              // 🎯 FIX: Use onLayerDelete directly like FormHandle - no complex re-index logic
              onLayerDelete(elementToDelete.id);
            }
          } else {
            // Fallback to formState for non-grouped elements
            const updatedOptions = [...(formState.checkboxOptions || [])];
            updatedOptions.splice(index, 1);

            // 🎯 FIX: Re-index remaining options to ensure sequential numbering
            const reindexedOptions = updatedOptions?.map(
              (_, idx) => `ตัวเลือกที่ ${idx + 1}`
            );

            // Update local state immediately
            setFormState((prev) => ({
              ...prev,
              checkboxOptions: reindexedOptions,
            }));

            // Update parent state immediately
            if (onValueChange) {
              onValueChange(checkboxValues, reindexedOptions);
            }

            // Update config immediately with dynamic size calculation
            if (onConfigChange) {
              const updatedConfig = {
                ...formState,
                checkboxOptions: reindexedOptions,
              };

              onConfigChange(updatedConfig);
            }
          }
        };

        const handleCheckboxOptionAdd = () => {
          // 🎯 NEW: Create new independent draggable checkbox element instead of adding option
          if (configElement && onElementClick) {
            // Extract parent info from current element ID
            const currentId = configElement.id;

            // Parse ID pattern: checkbox-input-1757388338121-0-0
            const idParts = currentId.split("-");

            if (idParts.length >= 4) {
              const baseType = idParts[0]; // "checkbox"
              const inputType = idParts[1]; // "input"
              const timestamp = idParts[2]; // timestamp
              const stepIdx = idParts[3]; // step index

              // Create element object for new checkbox option using updated pattern
              const newElement = {
                id: `${baseType}-${inputType}-${timestamp}-${stepIdx}`, // Same parent group
                type: "checkbox",
                label: "ตัวเลือก", // No label for individual options
              };

              // Call onElementClick directly to create new draggable element
              onElementClick(newElement, stepIdx);
            }
          }
        };

        return (
          <div>
            <div className="mb-6">
              <label htmlFor="label" className="text-sm font-medium block mb-2">
                Header
              </label>
              <Input
                id="label"
                value={formState.label}
                onChange={(e) => handleInputChange(e, "label")}
                placeholder={`ป้ายกำกับ ${type}`}
                className="w-full"
              />
            </div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium">ตัวเลือก</label>
            </div>
            {(() => {
              // 🎯 NEW: Get options from grouped elements if available, otherwise use formState
              const groupedElements =
                groupedCheckboxRadioElements ||
                (configElement as any)?.__checkboxRadioElements ||
                [];
              const optionsToShow =
                groupedElements.length > 0
                  ? groupedElements?.map((element: any, index: number) => {
                    // 🎯 NEW: Use local state values instead of element values
                    return checkboxOptionValues[index] !== undefined
                      ? checkboxOptionValues[index]
                      : element.checkboxOptions?.[0] || "";
                  })
                  : formState.checkboxOptions || [];

              return optionsToShow?.map((option: string, index: number) => {
                // 🎯 NEW: Get element ID for accurate targeting
                const element =
                  groupedElements.length > 0 ? groupedElements[index] : null;
                const elementId = element?.id || `checkbox-${index}`;

                return (
                  <div key={elementId} className="flex items-center mb-2">
                    <Input
                      type="checkbox"
                      checked={checkboxValues.includes(option)}
                      disabled={isTemplateMode || isViewMode} // 🎯 เพิ่ม || isViewMode
                      onChange={(e) => {
                        if (!isTemplateMode && !isViewMode) { // ❌ ควรเป็น: if (!isTemplateMode && !isViewMode)
                          const newValues = e.target.checked
                            ? [...checkboxValues, option]
                            : checkboxValues.filter((val) => val !== option);
                          handleValueChange(newValues);
                        }
                      }}
                      className="mr-2 w-[18px] h-[18px]"
                      title={option}
                      aria-label={option}
                    />
                    <Input
                      ref={(el) => {
                        checkboxOptionRefs.current[elementId] = el;
                      }}
                      value={option || ""} // 🎯 FIX: Allow empty values without fallback
                      disabled={isTemplateMode || isViewMode} // 🎯 เพิ่ม || isViewMode
                      onChange={(e) => {
                        if (!isTemplateMode && !isViewMode) { // ❌ ควรเป็น: if (!isTemplateMode && !isViewMode)
                          handleCheckboxOptionTextChange(
                            elementId,
                            e.target.value
                          );
                        }
                      }}
                      onBlur={() => {
                        if (!isTemplateMode && !isViewMode) { // ❌ ควรเป็น: if (!isTemplateMode && !isViewMode)
                          handleCheckboxOptionBlur(elementId);
                        }
                      }}
                      onClick={() => !isTemplateMode && handleCheckboxOptionClick(elementId)} // ❌ ควรเป็น: !isTemplateMode && !isViewMode && ...
                      className="mr-2"
                      placeholder="" // Allow empty placeholder
                    />
                    <Button
                      type="text"
                      danger
                      icon={<CloseOutlined />}
                      disabled={isTemplateMode || isViewMode || optionsToShow.length === 1} // ❌ ควรเป็น: isTemplateMode || isViewMode || optionsToShow.length === 1
                      onClick={() => {
                        if (!isTemplateMode) { // ❌ ควรเป็น: if (!isTemplateMode && !isViewMode)
                          handleCheckboxOptionRemove(index);
                        }
                      }}
                    />
                  </div>
                );
              });
            })()}
            {!isTemplateMode && !isViewMode && ( // 🎯 เพิ่ม && !isViewMode
              <button
                type="button"
                className="text-blue-500 hover:text-blue-700 flex items-center gap-1 mb-2"
                onClick={handleCheckboxOptionAdd}
              >
                <PlusOutlined />
                เพิ่มตัวเลือก
              </button>
            )}
          </div>
        );
      case "radio":
        const radioValue = localValue as string;

        // 🎯 RADIO-SPECIFIC HANDLERS (INDEPENDENT)
        const handleRadioOptionTextChange = (
          elementId: string,
          newValue: string
        ) => {
          // 🎯 NEW: Find index by elementId for more accurate targeting
          const groupedElements =
            groupedCheckboxRadioElements ||
            (configElement as any)?.__checkboxRadioElements ||
            [];
          const elementIndex = groupedElements.findIndex(
            (el: any) => el.id === elementId
          );

          if (elementIndex >= 0) {
            // 🎯 NEW: Update Redux state with correct index
            const newState = {
              ...radioOptionValues,
              [elementIndex]: newValue,
            };
            setRadioOptionValues(id, newState);
          } else {
            console.error(
              "❌ [handleRadioOptionTextChange] Element not found:",
              elementId
            );
          }
        };

        const handleRadioOptionClick = (elementId: string) => {
          // 🎯 NEW: Handle element selection like isSelected in FormCanvas
          if (onLayerSelect && groupedCheckboxRadioElements) {
            const element = groupedCheckboxRadioElements.find(
              (el: any) => el.id === elementId
            );
            if (element) {
              onLayerSelect(element);
            }
          }
        };

        const handleRadioOptionBlur = (elementId: string) => {
          // 🎯 NEW: Handle grouped elements on blur using elementId
          const groupedElements =
            groupedCheckboxRadioElements ||
            (configElement as any)?.__checkboxRadioElements ||
            [];

          if (groupedElements.length > 0) {
            const elementIndex = groupedElements.findIndex(
              (el: any) => el.id === elementId
            );
            const elementToUpdate = groupedElements[elementIndex];
            const currentValue = radioOptionValues[elementIndex] || "";

            if (elementToUpdate && onValueChange && elementIndex >= 0) {
              // 🎯 FIX: Update the specific element's radioOptions with correct value
              const updatedOptions = [currentValue]; // Each element has only one option

              // 🎯 CRITICAL FIX: Pass the correct element ID to onValueChange
              // This ensures the correct element gets updated, not just the first one
              // Send elementId with the value so LayerPanel can identify which element to update
              const valueWithElementId = `elementId:${elementId}:${JSON.stringify(
                elementToUpdate.value || ""
              )}`;
              onValueChange(valueWithElementId, updatedOptions);
            }
          } else {
            // Fallback to formState for non-grouped elements
            const elementIndex = groupedElements.findIndex(
              (el: any) => el.id === elementId
            );
            const updatedOptions = [...(formState.radioOptions || [])];
            updatedOptions[elementIndex] =
              radioOptionValues[elementIndex] || "";

            // 🎯 NEW: Update Redux state immediately
            updateElementConfigField(id, "radioOptions", updatedOptions);

            // Update local state immediately
            setFormState((prev) => ({
              ...prev,
              radioOptions: updatedOptions,
            }));

            // Update parent state immediately
            if (onValueChange) {
              onValueChange(radioValue, updatedOptions);
            }

            // Update config immediately
            if (onConfigChange) {
              onConfigChange({
                ...formState,
                radioOptions: updatedOptions,
              });
            }
          }
        };

        const handleRadioOptionRemove = (index: number) => {
          // 🎯 SIMPLIFIED: Use onLayerDelete directly like FormHandle
          const groupedElements =
            groupedCheckboxRadioElements ||
            (configElement as any)?.__checkboxRadioElements ||
            [];

          if (groupedElements.length > 0) {
            // Get the element to delete
            const elementToDelete = groupedElements[index];

            if (elementToDelete && onLayerDelete) {
              // 🎯 FIX: Use onLayerDelete directly like FormHandle - no complex re-index logic
              onLayerDelete(elementToDelete.id);
            }
          } else {
            // Fallback to formState for non-grouped elements
            const updatedOptions = [...(formState.radioOptions || [])];
            updatedOptions.splice(index, 1);

            // 🎯 FIX: Re-index remaining options to ensure sequential numbering
            const reindexedOptions = updatedOptions?.map(
              (_, idx) => `ตัวเลือกที่ ${idx + 1}`
            );

            // Update local state immediately
            setFormState((prev) => ({
              ...prev,
              radioOptions: reindexedOptions,
            }));

            // Update parent state immediately
            if (onValueChange) {
              onValueChange(radioValue, reindexedOptions);
            }

            // Update config immediately
            if (onConfigChange) {
              onConfigChange({
                ...formState,
                radioOptions: reindexedOptions,
              });
            }
          }
        };

        const handleRadioOptionAdd = () => {
          // 🎯 NEW: Create new independent draggable radio element instead of adding option
          if (configElement && onElementClick) {
            // Extract parent info from current element ID
            const currentId = configElement.id;

            // Parse ID pattern: radio-input-1757388338121-0-0
            const idParts = currentId.split("-");

            if (idParts.length >= 4) {
              const baseType = idParts[0]; // "radio"
              const inputType = idParts[1]; // "input"
              const timestamp = idParts[2]; // timestamp
              const stepIdx = idParts[3]; // step index

              // Create element object for new radio option using updated pattern
              const newElement = {
                id: `${baseType}-${inputType}-${timestamp}-${stepIdx}`, // Same parent group
                type: "radio",
                label: "ตัวเลือก", // No label for individual options
              };

              // Call onElementClick directly to create new draggable element
              onElementClick(newElement, stepIdx);
            }
          }
        };

        return (
          <div>
            <div className="mb-6">
              <label htmlFor="label" className="text-sm font-medium block mb-2">
                Header
              </label>
              <Input
                id="label"
                value={formState.label}
                onChange={(e) => handleInputChange(e, "label")}
                placeholder={`ป้ายกำกับ ${type}`}
                className="w-full"
              />
            </div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium">ตัวเลือก</label>
            </div>
            {(() => {
              // 🎯 NEW: Get options from grouped elements if available, otherwise use formState
              const groupedElements =
                groupedCheckboxRadioElements ||
                (configElement as any)?.__checkboxRadioElements ||
                [];
              const optionsToShow =
                groupedElements.length > 0
                  ? groupedElements?.map((element: any, index: number) => {
                    // 🎯 NEW: Use local state values instead of element values
                    return radioOptionValues[index] !== undefined
                      ? radioOptionValues[index]
                      : element.radioOptions?.[0] || "";
                  })
                  : formState.radioOptions || [];

              return optionsToShow?.map((option: string, index: number) => {
                // 🎯 FIX: Check individual element's value instead of shared radioValue
                const groupedElements =
                  groupedCheckboxRadioElements ||
                  (configElement as any)?.__checkboxRadioElements ||
                  [];
                const isChecked =
                  groupedElements.length > 0
                    ? groupedElements[index]?.value === true ||
                    groupedElements[index]?.value === option
                    : radioValue === option;

                // 🎯 NEW: Get element ID for accurate targeting
                const element =
                  groupedElements.length > 0 ? groupedElements[index] : null;
                const elementId = element?.id || `radio-${index}`;

                return (
                  <div key={elementId} className="flex items-center mb-2">
                    <input
                      type="radio"
                      id={`radio-${id}-${index}`}
                      checked={isChecked}
                      disabled={isTemplateMode || isViewMode} // ❌ ควรเป็น: isTemplateMode || isViewMode
                      onChange={() => {
                        if (!isTemplateMode) { // ❌ ควรเป็น: if (!isTemplateMode && !isViewMode)
                          // 🎯 FIX: Handle radio selection properly for grouped elements
                          if (groupedElements.length > 0) {
                            // Update only the selected element and clear others
                            const elementToUpdate = groupedElements[index];
                            if (elementToUpdate && onConfigChange) {
                              // First, clear all other radio elements in the group
                              groupedElements.forEach((el: any, i: number) => {
                                if (i !== index && onConfigChange) {
                                  const clearConfigData: FormElementConfigData = {
                                    id: el.id,
                                    label: el.label || "",
                                    radioOptions: el.radioOptions || [],
                                  };
                                  onConfigChange(clearConfigData);

                                  // Clear the value
                                  if (onValueChange) {
                                    onValueChange("", el.radioOptions || []);
                                  }
                                }
                              });

                              // Then set the selected element
                              const configData: FormElementConfigData = {
                                id: elementToUpdate.id,
                                label: elementToUpdate.label || "",
                                radioOptions: elementToUpdate.radioOptions || [],
                              };
                              onConfigChange(configData);

                              // Set the value for the selected element
                              if (onValueChange) {
                                onValueChange(
                                  option,
                                  elementToUpdate.radioOptions || []
                                );
                              }
                            }
                          } else {
                            handleValueChange(option);
                          }
                        }
                      }}
                      className="mr-2"
                      title={option || ""}
                      aria-label={option || ""}
                      name={`radio-group-${id}`}
                    />
                    <Input
                      ref={(el) => {
                        // 🎯 FIX: Use elementId as key instead of index
                        radioOptionRefs.current[elementId] = el;
                      }}
                      value={option || ""} // 🎯 FIX: Allow empty values without fallback
                      disabled={isTemplateMode || isViewMode} // ❌ ควรเป็น: isTemplateMode || isViewMode
                      onChange={(e) => {
                        if (!isTemplateMode && !isViewMode) { // ❌ ควรเป็น: if (!isTemplateMode && !isViewMode)
                          handleRadioOptionTextChange(elementId, e.target.value);
                        }
                      }}
                      onBlur={() => {
                        if (!isTemplateMode && !isViewMode) { // ❌ ควรเป็น: if (!isTemplateMode && !isViewMode)
                          handleRadioOptionBlur(elementId);
                        }
                      }}
                      onClick={() => !isTemplateMode && handleRadioOptionClick(elementId)} // ❌ ควรเป็น: !isTemplateMode && !isViewMode && ...
                      className="mr-2"
                      placeholder="" // Allow empty placeholder
                    />
                    <Button
                      type="text"
                      danger
                      disabled={isTemplateMode || isViewMode || optionsToShow.length === 1} // ❌ ควรเป็น: isTemplateMode || isViewMode || optionsToShow.length === 1
                      onClick={() => {
                        if (!isTemplateMode) { // ❌ ควรเป็น: if (!isTemplateMode && !isViewMode)
                          handleRadioOptionRemove(index);
                        }
                      }}
                    />
                  </div>
                );
              });
            })()}
            <button
              type="button"
              className="text-blue-500 hover:text-blue-700 flex items-center gap-1 mb-2"
              onClick={handleRadioOptionAdd}
            >
              <PlusOutlined />
              เพิ่มตัวเลือก
            </button>
          </div>
        );
      case "stamp":
        // 🎯 FIXED: Use section prop instead of finding from actor
        const stampSection = section || "มาตรา 9";

        return <>{renderStampElements(stampSection)}</>;
      case "select":
        const selectValue = localValue as string;

        // 🎯 SELECT-SPECIFIC HANDLERS (INDEPENDENT)
        const handleSelectOptionTextChange = (
          index: number,
          newValue: string
        ) => {
          const updatedOptions = [...(formState.selectOptions || [])];
          updatedOptions[index] = newValue;

          // Update local state immediately
          setFormState((prev) => ({
            ...prev,
            selectOptions: updatedOptions,
          }));

          // Update parent state immediately
          if (onValueChange) {
            onValueChange(selectValue || "", updatedOptions);
          }

          // Update config immediately
          if (onConfigChange) {
            onConfigChange({
              ...formState,
              selectOptions: updatedOptions,
            });
          }
        };

        const handleSelectOptionRemove = (index: number) => {
          const updatedOptions = [...(formState.selectOptions || [])];
          updatedOptions.splice(index, 1);

          // Update local state immediately
          setFormState((prev) => ({
            ...prev,
            selectOptions: updatedOptions,
          }));

          // Update parent state immediately
          if (onValueChange) {
            onValueChange(selectValue || "", updatedOptions);
          }

          // Update config immediately
          if (onConfigChange) {
            onConfigChange({
              ...formState,
              selectOptions: updatedOptions,
            });
          }
        };

        const handleSelectOptionAdd = () => {
          const currentLength = formState.selectOptions?.length || 0;
          const newOptionText =
            currentLength === 0
              ? getDefaultElementConfig(type).checkboxOptions?.[0] ||
              "ตัวเลือกที่ 1"
              : `ตัวเลือกที่ ${currentLength + 1}`;

          const updatedOptions = [
            ...(formState.selectOptions || []),
            newOptionText,
          ];

          // Update local state immediately
          setFormState((prev) => ({
            ...prev,
            selectOptions: updatedOptions,
          }));

          // Update parent state immediately
          if (onValueChange) {
            onValueChange(selectValue || "", updatedOptions);
          }

          // Update config immediately
          if (onConfigChange) {
            onConfigChange({
              ...formState,
              selectOptions: updatedOptions,
            });
          }
        };

        return (
          <>
            <div className="mb-2">
              <select
                value={selectValue}
                className="w-full border border-gray-300 p-2 rounded"
                onChange={(e) => handleValueChange(e.target.value)}
                title={`เลือก${label}`}
                aria-label={`เลือก${label}`}
              >
                <option value="">{CONFIG_CONSTANTS.SELECT_PLACEHOLDER}</option>
                {formState.selectOptions?.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <label className="font-medium">ตัวเลือก</label>
                <Button type="primary" onClick={handleSelectOptionAdd}>
                  เพิ่มตัวเลือก
                </Button>
              </div>
              {formState.selectOptions?.map((option, index) => (
                <div key={index} className="flex items-center mb-2">
                  <Input
                    value={option}
                    onChange={(e) =>
                      handleSelectOptionTextChange(index, e.target.value)
                    }
                    className="mr-2"
                  />
                  <Button
                    type="text"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => handleSelectOptionRemove(index)}
                    disabled={formState.selectOptions?.length === 1}
                  />
                </div>
              ))}
            </div>
          </>
        );
      case "date":
        if (groupedDateElements && groupedDateElements.length > 0) {
          // Support both complete (3 elements) and incomplete groups
          const daysElement = groupedDateElements.find(
            (el) => el.type === "days"
          );
          const monthsElement = groupedDateElements.find(
            (el) => el.type === "months"
          );
          const yearsElement = groupedDateElements.find(
            (el) => el.type === "years"
          );

          // Use state to track available elements for real-time updates
          const [availableElements, setAvailableElements] = useState({
            days: !!daysElement,
            months: !!monthsElement,
            years: !!yearsElement,
          });

          // Update available elements when groupedDateElements changes
          useEffect(() => {
            const newAvailableElements = {
              days: !!daysElement,
              months: !!monthsElement,
              years: !!yearsElement,
            };

            // Only update if there's actually a change
            const hasChanged =
              newAvailableElements.days !== availableElements.days ||
              newAvailableElements.months !== availableElements.months ||
              newAvailableElements.years !== availableElements.years;

            if (hasChanged) {
              setAvailableElements(newAvailableElements);
            }
          }, [
            daysElement,
            monthsElement,
            yearsElement,
            groupedDateElements.length,
          ]);

          const isIncomplete = groupedDateElements.length < 3;
          const missingElements = [];
          if (!availableElements.days) missingElements.push("days");
          if (!availableElements.months) missingElements.push("months");
          if (!availableElements.years) missingElements.push("years");

          // Use state for date context to trigger re-renders
          const [dateContextState, setDateContextState] = useState({
            days: daysElement?.value
              ? String(daysElement.value)
              : formState.date?.days || "",
            months: monthsElement?.value
              ? String(monthsElement.value)
              : formState.date?.months || "",
            years: yearsElement?.value
              ? String(yearsElement.value)
              : formState.date?.years || "",
            format: formState.date?.format || "EU",
            useCurrentDate: formState.date?.useCurrentDate || false,
            availableElements,
          });

          // Update dateContextState when availableElements or formState changes
          useEffect(() => {
            const newContextState = {
              days: daysElement?.value
                ? String(daysElement.value)
                : formState.date?.days || "",
              months: monthsElement?.value
                ? String(monthsElement.value)
                : formState.date?.months || "",
              years: yearsElement?.value
                ? String(yearsElement.value)
                : formState.date?.years || "",
              format: formState.date?.format || "EU",
              useCurrentDate: formState.date?.useCurrentDate || false,
              availableElements,
            };

            setDateContextState(newContextState);
          }, [
            availableElements,
            daysElement?.value,
            monthsElement?.value,
            yearsElement?.value,
            formState.date?.days,
            formState.date?.months,
            formState.date?.years,
            formState.date?.format,
            formState.date?.useCurrentDate,
          ]);

          // Helper function to get current date values using dayjs
          const getCurrentDateValues = () => {
            const now = dayjs();
            const currentFormat = dateContextState.format;
            const thaiMonths = getThaiMonthNames();

            let days, months, years;

            switch (currentFormat) {
              case "EU":
              case "US":
              case "EUs":
                days = now.format("DD");
                months = now.format("MM");
                years =
                  currentFormat === "EUs"
                    ? now.format("YY")
                    : now.format("YYYY");
                break;

              case "THsBC":
                // Thai short format: 1 ม.ค. 2025
                days = now.format("D");
                months = thaiMonths[now.month()].short;
                years = now.format("YYYY");
                break;

              case "THsBB":
                // Thai short format with Buddhist Era: 1 ม.ค. 2568
                days = now.format("D");
                months = thaiMonths[now.month()].short;
                years = String(now.year() + 543);
                break;

              case "THBC":
                // Thai full format: 1 มกราคม 2025
                days = now.format("D");
                months = thaiMonths[now.month()].full;
                years = now.format("YYYY");
                break;

              case "THBCnumber":
                // Thai number format with Thai numerals: ๑ มกราคม ๒๕๖๘
                days = decodeHtmlEntities(convertToThaiNumber(now.format("D")));
                months = thaiMonths[now.month()].full;
                years = decodeHtmlEntities(
                  convertToThaiNumber(String(now.year() + 543))
                );
                break;

              case "THBB":
                // Thai format with Buddhist Era: 1 มกราคม 2568
                days = now.format("D");
                months = thaiMonths[now.month()].full;
                years = String(now.year() + 543);
                break;

              default:
                days = now.format("DD");
                months = now.format("MM");
                years = now.format("YYYY");
            }

            return { days, months, years };
          };

          // Emit custom events for date changes
          const emitDateElementChange = useCallback(
            (elementType: string, value: string, elementId: string) => {
              const event = new CustomEvent("dateElementValueChange", {
                detail: {
                  elementId,
                  elementType,
                  value,
                  dateContext: dateContextState,
                },
              });
              window.dispatchEvent(event);
            },
            [dateContextState]
          );

          const handleDateStateChange = useCallback(
            (newState: any) => {
              // 🎯 FIXED: Prevent infinite loop by checking if state actually changed
              const hasChanges =
                newState.days !== dateContextState.days ||
                newState.months !== dateContextState.months ||
                newState.years !== dateContextState.years ||
                newState.format !== dateContextState.format ||
                newState.useCurrentDate !== dateContextState.useCurrentDate;

              if (!hasChanges) {
                return;
              }

              // Update both formState and dateContextState
              setDateContextState((prev) => ({
                ...prev,
                ...newState,
                availableElements: groupedDateElements, // Keep current availableElements
              }));
              // Update formState
              setFormState((prev) => ({
                ...prev,
                date: newState,
              }));

              // 🎯 FIXED: Send config change for format and other date settings
              if (onConfigChange) {
                const configData: FormElementConfigData = {
                  id: id,
                  label: formState.label || "Date",
                  date: {
                    ...newState,
                    // 🎯 FIXED: Include header in date config for mappingBuilder
                    header: formState.label || "Date",
                  },
                  dateFormat: newState.format as "EU" | "US" | "THBCnumber",
                };
                onConfigChange(configData);

                // 🎯 DEBUG: Log the config being sent
                // console.log('🎯 [FormElementConfig] Sending date config:', configData);
              }

              // Emit changes to canvas elements via onValueChange
              if (onValueChange) {
                // Days element
                if (daysElement && newState.days !== dateContextState.days) {
                  const valueWithContext = {
                    value: newState.days,
                    elementId: daysElement.id,
                    elementType: "days",
                    dateContext: newState,
                  };
                  onValueChange(JSON.stringify(valueWithContext));
                  // Also emit custom event for real-time sync
                  emitDateElementChange("days", newState.days, daysElement.id);
                }

                // Months element
                if (
                  monthsElement &&
                  newState.months !== dateContextState.months
                ) {
                  const valueWithContext = {
                    value: newState.months,
                    elementId: monthsElement.id,
                    elementType: "months",
                    dateContext: newState,
                  };
                  onValueChange(JSON.stringify(valueWithContext));
                  // Also emit custom event for real-time sync
                  emitDateElementChange(
                    "months",
                    newState.months,
                    monthsElement.id
                  );
                }

                // Years element
                if (yearsElement && newState.years !== dateContextState.years) {
                  const valueWithContext = {
                    value: newState.years,
                    elementId: yearsElement.id,
                    elementType: "years",
                    dateContext: newState,
                  };
                  onValueChange(JSON.stringify(valueWithContext));
                  // Also emit custom event for real-time sync
                  emitDateElementChange(
                    "years",
                    newState.years,
                    yearsElement.id
                  );
                }
              }
            },
            [
              onValueChange,
              onConfigChange,
              daysElement,
              monthsElement,
              yearsElement,
              dateContextState,
              emitDateElementChange,
              id,
              formState.label,
            ]
          );

          const applyCurrentDate = useCallback(() => {
            const currentDate = getCurrentDateValues();

            // Update via context
            handleDateStateChange({
              ...dateContextState,
              ...currentDate,
            });
          }, [dateContextState, handleDateStateChange]);

          return (
            <DateProvider
              key={`date-provider-${Object.values(availableElements).join(
                "-"
              )}`}
              initialState={dateContextState}
              onStateChange={handleDateStateChange}
            >
              <div className="date-settings space-y-4">
                <div className="mb-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                    <label className="text-sm font-medium block">
                      Date Format
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formState.required || false}
                        onChange={(e) =>
                          handleInputChange(e.target.checked, "required")
                        }
                        className="text-lg-right"
                      />
                      <span className="text-sm font-medium">
                        Required field
                      </span>
                    </div>
                  </div>
                  <DateFormatSelector />
                </div>

                {/* Header Configuration */}
                <div className="mb-4">
                  <label
                    htmlFor="dateHeader"
                    className="text-sm font-medium block mb-2"
                  >
                    Header
                  </label>
                  <Input
                    id="dateHeader"
                    value={formState.label || "Date"}
                    onChange={(e) => handleInputChange(e, "label")}
                    placeholder="ป้ายกำกับ Date"
                    className="w-full"
                  />
                </div>

                {/* Individual Date Inputs */}
                <DateInputControls />

                {/* Current Date Toggle */}
                <CurrentDateToggle onApplyCurrentDate={applyCurrentDate} />
              </div>
            </DateProvider>
          );
        } else {
          // Regular date element - show simple date picker
          return (
            <div className="mb-2">
              <Input
                type="date"
                value={localValue as string}
                className="w-full"
                onChange={(e) => handleValueChange(e.target.value)}
                placeholder={CONFIG_CONSTANTS.DATE_PLACEHOLDER}
              />
            </div>
          );
        }
      case "periodDate":
        return <div className="period-date-settings"></div>;
      case "signature":
        return actorId ? (
          <>
            {/* <h4 className="text-sm font-bold block py-2">{section}</h4> */}
            <div className="flex items-center justify-between gap-2 w-full flex-wrap mb-2">
              <p className="text-sm font-medium ">
                ลำดับ {parseInt(actorId) + 1}
              </p>
              <p className="text-sm font-medium ">
                จำนวนกล่องลายเซ็น ({getActorSignatures(actorId).length})
              </p>
            </div>
            <p className="text-sm font-medium mb-3">
              ผู้ลงนาม: {displayActorName}
            </p>

            {renderSignatureElements(actorId)}
          </>
        ) : (
          <div className="text-center text-gray-500">
            ไม่พบข้อมูล Actor สำหรับลายเซ็น
          </div>
        );
      case "more-file":
        return actorId ? (
          <>
            {/* <h4 className="text-sm font-medium mb-2 text-gray-700">
              ไฟล์เพิ่มเติม - {actors?.find(a => a.id === actorId)?.name || `คนที่ ${actorId}`}
            </h4> */}
            {renderMoreFileElements(actorId)}
          </>
        ) : (
          <div className="text-center text-gray-500">
            ไม่พบข้อมูล Actor สำหรับไฟล์เพิ่มเติม
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="w-full">{renderElementConfigUI()}</div>;
};
