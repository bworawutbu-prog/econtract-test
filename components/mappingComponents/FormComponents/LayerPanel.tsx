/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Collapse, Button, Tooltip, type CollapseProps } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { FormItem } from "../../../store/types/FormTypes";
import { FormElementConfig, FormElementConfigData } from "./FormElementConfig";
import { ChevronDown, Plus } from "lucide-react";
import { enqueueSnackbar } from "notistack";

interface ExtendedFormItem extends FormItem {
  actorId: any;
  step_index: any;
  visible?: boolean;
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
  checkboxOptions?: string[];
  maxFileSize?: number; // file_size in MB
  typeName?: string; // type_name
  isEmbedded?: boolean; // is_embedded
  fileAccept?: string[]; // file_accept
  dateTimeType?: string; // date or periodDate
  section?: string; // 🎯 NEW: Section for stamp elements (มาตรา 9, มาตรา 26 และมาตรา 28)
}

interface LayerPanelProps {
  items: ExtendedFormItem[];
  activePage: number;
  numPages?: number | null;
  selectedItemId?: string;
  onLayerSelect?: (item: ExtendedFormItem) => void;
  onLayerDelete?: (itemId: string) => void;
  onGroupedDelete?: (itemIds: string[]) => void; // Add grouped delete handler
  onLayerVisibilityToggle?: (itemId: string, visible: boolean) => void;
  onConfigChange?: (itemId: string, configData: FormElementConfigData) => void;
  onValueChange?: (
    itemId: string,
    value: string | string[] | boolean | number,
    checkboxOptions?: string[]
  ) => void;
  onCloseConfig?: () => void;
  currentStepIndex?: string;
  actors?: {
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
  }[];
  onElementClick?: (
    element: { id: string; type: string; label: string; dateTimeType?: string },
    actorId?: string
  ) => void;
  configElement?: ExtendedFormItem | null;
  activeCategory?: string;
  onValidationChange?: (isValid: boolean) => void;
  dateTimeType?: string; // Current dateTimeType selection from FormSidebar
  docType?: string; // 🎯 NEW: Document type (b2b, b2c, etc.)
  currentStepPermissionType?: string; // 🎯 NEW: Current step permission type to determine approver mode
  documentType?: string; // 🎯 NEW: Document mode (create, draft, template)
}

const LayerPanel: React.FC<LayerPanelProps> = ({
  items,
  activePage,
  numPages,
  selectedItemId,
  onLayerSelect,
  onLayerDelete,
  onGroupedDelete,
  onLayerVisibilityToggle,
  onConfigChange,
  onValueChange,
  onCloseConfig,
  currentStepIndex,
  actors,
  onElementClick,
  configElement,
  activeCategory,
  onValidationChange,
  dateTimeType,
  docType,
  currentStepPermissionType, // 🎯 NEW: Add currentStepPermissionType prop
  documentType, // 🎯 NEW: Document mode for template mode
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [configItem, setConfigItem] = useState<ExtendedFormItem | null>(null);
  const [visibilityState, setVisibilityState] = useState<Record<string, boolean>>({});
  const [expandedItemId, setExpandedItemId] = useState<string | undefined>(undefined);
  const [expandedActorIds, setExpandedActorIds] = useState<string[]>([]);
  const [expandedStampId, setExpandedStampId] = useState<string | undefined>(undefined);

  // Filter items based on currentStepIndex (only for non-signature items)
  const filteredItems = useMemo(() => {
    // If currentStepIndex is "all", show all items without filtering
    if (!currentStepIndex || currentStepIndex === "all") return items;

    return items.filter((item) => {
      // For signature items, show all signatures (they have their own filtering logic)
      if (item.type === "signature") return true;

      // For other items, show items that have no step_index OR have matching step_index
      const hasNoStepIndex = !item.step_index || item.step_index === "";
      const hasMatchingStepIndex = item.step_index === currentStepIndex;
      const shouldShow = hasNoStepIndex || hasMatchingStepIndex;

      return shouldShow;
    });
  }, [items, currentStepIndex]);

  // Define panel style
  const panelStyle: React.CSSProperties = {
    marginTop: 24,
    background: "#FAFAFA",
    borderRadius: "12px",
    border: "none",
  };

  // Filter items for the current page and current step based on activeCategory
  const pageItems = filteredItems.filter((item) => {
    const isCurrentPage = item.pageNumber === activePage;
    const isNotSignature = item.type !== "signature";
    const isNotMoreFile = item.type !== "more-file";
    const isNotStamp = item.type !== "stamp";
    // If no activeCategory or activeCategory is for special types, show regular items (excluding signature/more-file)
    if (
      !activeCategory ||
      activeCategory === "signature" ||
      activeCategory === "more-file" ||
      activeCategory === "settings" ||
      activeCategory === "stamp"
    ) {
      return isCurrentPage && isNotSignature && isNotMoreFile;
    }

    // For specific categories, filter by item type
    const matchesActiveCategory = (() => {
      switch (activeCategory) {
        case "text":
          return item.type === "text";
        case "checkboxElements":
          return item.type === "checkbox";
        case "radioElements":
          return item.type === "radio";
        case "selectElements":
          return item.type === "select";
        case "dateElements":
          return item.type === "date";
        case "dateTime":
          return (
            item.type === "date" ||
            item.type === "days" ||
            item.type === "months" ||
            item.type === "years"
          );
        default:
          return null; // Don't show anything if category not recognized
      }
    })();

    return (
      isCurrentPage && isNotSignature && isNotMoreFile && isNotStamp && matchesActiveCategory
    );
  });

  const groupDateElements = (items: ExtendedFormItem[]) => {
    const groupedItems: ExtendedFormItem[] = [];
    const processedIds = new Set<string>();

    // Create a map to track date groups by composite key (timestamp + step_index)
    // This ensures separate groups per approver when stepIndex === "all"
    const dateGroups: Record<string, ExtendedFormItem[]> = {};

    // First pass: collect all date elements and group them by timestamp
    items.forEach((item) => {
      if (
        item.type === "days" ||
        item.type === "months" ||
        item.type === "years"
      ) {
        if (item.dateTimeType === "date") {
          // Extract timestamp from ID pattern: date-1-days-1756356191710-1
          // ID format: ${baseId}-${type}-${timestamp}-${stepIndex}
          const idParts = item.id.split("-");

          // Find timestamp - it's usually a long number (13 digits for milliseconds)
          let timestamp = "";
          for (let i = 0; i < idParts.length; i++) {
            if (idParts[i].length >= 10 && /^\d+$/.test(idParts[i])) {
              timestamp = idParts[i];
              break;
            }
          }
          // Extract step index - usually the last segment
          const lastPart = idParts[idParts.length - 1] || "";
          const stepIndex = /^\d+$/.test(lastPart) ? lastPart : "";
          // Build composite group key to differentiate groups per step
          const groupKey = timestamp ? `${timestamp}-${stepIndex}` : "";

          if (groupKey) {
            if (!dateGroups[groupKey]) {
              dateGroups[groupKey] = [];
            }
            dateGroups[groupKey].push(item);
          }
        }
      }
    });

    // Second pass: process all items
    items.forEach((item) => {
      if (processedIds.has(item.id)) return;

      if (
        item.type === "days" ||
        item.type === "months" ||
        item.type === "years"
      ) {
        if (item.dateTimeType === "date") {
          // Extract timestamp from this item
          const idParts = item.id.split("-");
          let timestamp = "";
          for (let i = 0; i < idParts.length; i++) {
            if (idParts[i].length >= 10 && /^\d+$/.test(idParts[i])) {
              timestamp = idParts[i];
              break;
            }
          }
          const lastPart = idParts[idParts.length - 1] || "";
          const stepIndex = /^\d+$/.test(lastPart) ? lastPart : "";
          const groupKey = timestamp ? `${timestamp}-${stepIndex}` : "";

          if (!timestamp) {
            // If no timestamp found, treat as individual
            groupedItems.push(item);
            processedIds.add(item.id);
            return;
          }

          const relatedElements = (groupKey && dateGroups[groupKey]) || [];

          // Create consolidated group for ANY number of related date elements (1-3)
          if (relatedElements.length > 0) {
            // Check if this is the first element we're processing for this group
            const isFirstOfGroup = relatedElements.every(
              (el) => !processedIds.has(el.id)
            );

            if (isFirstOfGroup) {
              // Sort elements in order: days, months, years
              const sortedElements = relatedElements.sort((a, b) => {
                const order = { days: 0, months: 1, years: 2 };
                return (
                  order[a.type as keyof typeof order] -
                  order[b.type as keyof typeof order]
                );
              });

              // Generate a consolidated ID for this group based on timestamp + stepIndex
              const consolidatedId = `date-group-${timestamp}-${stepIndex}`;

              const consolidatedItem: ExtendedFormItem = {
                ...sortedElements[0], // Use first available element as base
                id: consolidatedId, // Use timestamp-based ID for the consolidated item
                type: "date", // Change type to "date" for display
                label: "Date", // Set label to "Date"
                dateTimeType: "date", // Mark as date type
                __dateElements: sortedElements,
                __timestamp: timestamp, // Store timestamp for reference
                __stepIndex: stepIndex, // Store stepIndex for reference
                __isIncomplete: relatedElements.length < 3, // Mark if incomplete
              } as ExtendedFormItem & {
                __dateElements: ExtendedFormItem[];
                __timestamp: string;
                __stepIndex: string;
                __isIncomplete: boolean;
              };

              groupedItems.push(consolidatedItem);

              // Mark all related elements as processed
              relatedElements.forEach((el) => processedIds.add(el.id));
            }
          } else {
            // This shouldn't happen if we found the timestamp, but fallback to individual
            enqueueSnackbar(
              `🎯 [groupDateElements] No related elements found for ${timestamp}`,
              {
                variant: "warning",
                autoHideDuration: 3000,
              }
            );
            groupedItems.push(item);
            processedIds.add(item.id);
          }
        } else {
          // Non-date dateTimeType, show individually
          groupedItems.push(item);
          processedIds.add(item.id);
        }
      } else if (item.type === "date") {
        // Regular date element (not days/months/years)
        groupedItems.push(item);
        processedIds.add(item.id);
      } else {
        // Non-date element
        groupedItems.push(item);
        processedIds.add(item.id);
      }
    });

    return groupedItems;
  };

  // 🎯 NEW: Group checkbox and radio elements by parentId
  const groupCheckboxRadioElements = (items: ExtendedFormItem[]) => {
    const groupedItems: ExtendedFormItem[] = [];
    const processedIds = new Set<string>();

    // Create a map to track checkbox/radio groups by parentId
    const checkboxRadioGroups: Record<string, ExtendedFormItem[]> = {};

    // First pass: collect all checkbox/radio elements and group them by parentId
    items.forEach((item) => {
      if (item.type === "checkbox" || item.type === "radio") {
        if (item.parentId) {
          if (!checkboxRadioGroups[item.parentId]) {
            checkboxRadioGroups[item.parentId] = [];
          }
          checkboxRadioGroups[item.parentId].push(item);
        }
      }
    });

    // Second pass: process all items
    items.forEach((item) => {
      if (processedIds.has(item.id)) return;

      if (item.type === "checkbox" || item.type === "radio") {
        if (item.parentId) {
          const relatedElements = checkboxRadioGroups[item.parentId] || [];

          if (relatedElements.length > 0) {
            // Check if this is the first element we're processing for this group
            const isFirstOfGroup = relatedElements.every(
              (el) => !processedIds.has(el.id)
            );

            if (isFirstOfGroup) {
              // Sort elements by optionIndex
              const sortedElements = relatedElements.sort((a, b) => {
                const indexA = a.optionIndex || 0;
                const indexB = b.optionIndex || 0;
                return indexA - indexB;
              });

              // Generate a consolidated ID for this group
              const consolidatedId = item.parentId;

              const consolidatedItem: ExtendedFormItem = {
                ...sortedElements[0], // Use first available element as base
                id: consolidatedId, // Use parentId as the consolidated item ID
                type: item.type, // Keep original type (checkbox or radio)
                label:
                  sortedElements[0].label ||
                  `${item.type === "checkbox" ? "Checkbox" : "Radio"}`, // Use first element's label or default
                __checkboxRadioElements: sortedElements,
                __parentId: item.parentId,
                __isGroup: true,
              } as ExtendedFormItem & {
                __checkboxRadioElements: ExtendedFormItem[];
                __parentId: string;
                __isGroup: boolean;
              };

              groupedItems.push(consolidatedItem);

              // Mark all related elements as processed
              relatedElements.forEach((el) => processedIds.add(el.id));
            }
          } else {
            // No parentId, show individually
            groupedItems.push(item);
            processedIds.add(item.id);
          }
        } else {
          // No parentId, show individually
          groupedItems.push(item);
          processedIds.add(item.id);
        }
      } else {
        // Non-checkbox/radio element
        groupedItems.push(item);
        processedIds.add(item.id);
      }
    });

    return groupedItems;
  };

  // 🎯 NEW: Apply grouping to pageItems based on activeCategory
  const groupedPageItems = useMemo(() => {
    if (activeCategory === "dateTime") {
      return groupDateElements(pageItems);
    } else if (
      activeCategory === "checkboxElements" ||
      activeCategory === "radioElements"
    ) {
      return groupCheckboxRadioElements(pageItems);
    }
    return pageItems;
  }, [pageItems, activeCategory]);

  // Auto-expand LayerPanel when an element is selected in FormCanvas
  useEffect(() => {
    if (selectedItemId) {
      // Check if the selected item is in the current page's items
      const isItemInCurrentPage = pageItems.some(
        (item) => item.id === selectedItemId
      );

      if (isItemInCurrentPage) {
        const selectedItem = pageItems.find(
          (item) => item.id === selectedItemId
        );

        if (
          selectedItem &&
          (selectedItem.type === "days" ||
            selectedItem.type === "months" ||
            selectedItem.type === "years")
        ) {
          if (activeCategory === "dateTime") {
            const groupedItem = groupedPageItems.find((item) => {
              if (item.type === "date" && (item as any).__dateElements) {
                return (item as any).__dateElements.some(
                  (dateEl: ExtendedFormItem) => dateEl.id === selectedItemId
                );
              }
              return false;
            });

            if (groupedItem) {
              setExpandedItemId(groupedItem.id);
            } else {
              setExpandedItemId(selectedItemId);
            }
          } else {
            setExpandedItemId(selectedItemId);
          }
        } else if (
          selectedItem &&
          (selectedItem.type === "checkbox" || selectedItem.type === "radio")
        ) {
          // 🎯 NEW: Handle checkbox/radio groups
          if (
            activeCategory === "checkboxElements" ||
            activeCategory === "radioElements"
          ) {
            const groupedItem = groupedPageItems.find((item) => {
              if (
                (item.type === "checkbox" || item.type === "radio") &&
                (item as any).__checkboxRadioElements
              ) {
                return (item as any).__checkboxRadioElements.some(
                  (element: ExtendedFormItem) => element.id === selectedItemId
                );
              }
              return false;
            });

            if (groupedItem) {
              setExpandedItemId(groupedItem.id);
            } else {
              setExpandedItemId(selectedItemId);
            }
          } else {
            setExpandedItemId(selectedItemId);
          }
        } else if (selectedItem && selectedItem.type === "signature") {
          // 🎯 NEW: Handle signature elements - expand the actor
          if (activeCategory === "signature" && selectedItem.actorId) {
            setExpandedActorIds((prev) => {
              if (!prev.includes(selectedItem.actorId)) {
                return [...prev, selectedItem.actorId];
              }
              return prev;
            });
          }
        } else if (selectedItem && selectedItem.type === "stamp") {
          // 🎯 NEW: Handle stamp elements - expand the stamp section
          if (activeCategory === "stamp" && selectedItem.section) {
            // Extract stamp ID from the selected item
            // For stamp elements, we need to find the corresponding stamp collapse key
            const stampId = `stamp-${selectedItem.section}-${selectedItem.id.split('-')[2] || '0'}`;

            // 🎯 FIX: Only auto-expand if not already expanded to a different stamp
            // This prevents auto-expand from overriding manual expand actions
            if (!expandedStampId || expandedStampId === stampId) {
              setExpandedStampId(stampId);
            }
          }
        } else {
          setExpandedItemId(selectedItemId);
        }
      }
    }
  }, [selectedItemId, pageItems, activeCategory, groupedPageItems, expandedStampId]);

  // 🎯 NEW: Get stamps by section instead of by actor
  const getStampsBySection = (section: string) => {
    return items.filter(
      (item) => item.type === "stamp" && item.section === section
    );
  };

  // 🎯 NEW: Calculate maximum stamp elements based on section and docType
  const calculateMaxStampElements = () => {
    if (!actors || actors.length === 0) return 0;

    // Group actors by section
    const sectionGroups = actors.reduce((acc, actor) => {
      const section = actor.section;
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(actor);
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate max stamps based on section and docType rules
    let maxStamps = 0;

    // มาตรา 9: มีได้แค่ 1 คน (ต้นสัญญา) - fixed for both b2b and b2c
    if (sectionGroups["มาตรา 9"]) {
      maxStamps += 1;
    }

    // มาตรา 26 และมาตรา 28: depends on docType
    if (sectionGroups["มาตรา 26 และมาตรา 28"]) {
      if (docType === "b2b") {
        // B2B: มี 2 คน (ต้นสัญญา กับ คู่สัญญา) - fixed
        maxStamps += 2;
      } else {
        // B2C: มี 1 คน (ต้นสัญญา) - fixed
        maxStamps += 1;
      }
    }

    return maxStamps;
  };

  // 🎯 NEW: Check if can add more stamp elements for a specific section
  const canAddStampElementForSection = (section: string) => {
    const maxStamps = calculateMaxStampElements();
    const currentStamps = items.filter(item => item.type === "stamp").length;
    const sectionStamps = getStampsBySection(section).length;

    // For มาตรา 9: max 1 stamp (both b2b and b2c)
    if (section === "มาตรา 9") {
      return sectionStamps < 1 && currentStamps < maxStamps;
    }

    // For มาตรา 26 และมาตรา 28: depends on docType
    if (section === "มาตรา 26 และมาตรา 28") {
      if (docType === "b2b") {
        // B2B: max 2 stamps (ต้นสัญญา กับ คู่สัญญา)
        return sectionStamps < 2 && currentStamps < maxStamps;
      } else {
        // B2C: max 1 stamp (ต้นสัญญา)
        return sectionStamps < 1 && currentStamps < maxStamps;
      }
    }

    return false;
  };

  // Render actors with their signatures
  const renderActors = () => {
    if (!actors || actors.length === 0) return null;

    // Handle actor expand/collapse
    const handleActorExpandChange = (actorId: string) => {
      setExpandedActorIds((prev) =>
        prev.includes(actorId)
          ? prev.filter((id) => id !== actorId)
          : [...prev, actorId]
      );
    };

    // Handle stamp expand/collapse (accordion mode - only one at a time)
    const handleStampExpandChange = (stampId: string) => {
      setExpandedStampId(expandedStampId === stampId ? undefined : stampId);
    };

    // 🎯 NEW: Group actors by section for stamp display
    const actorsBySection = (actors || []).reduce((acc, actor) => {
      const section = actor.section;
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(actor);
      return acc;
    }, {} as Record<string, any[]>);

    // 🎯 DEBUG: Log actorsBySection for stamp category
    if (activeCategory === "stamp") {
      // console.log("🎯 [LayerPanel] actorsBySection:", actorsBySection);
      // console.log("🎯 [LayerPanel] sections:", Object.keys(actorsBySection));
    }

    // Create collapse items for actor headers only (no children)
    const actorCollapseItems: CollapseProps["items"] = actors?.map((actor) => {
      return {
        key: actor.id,
        label: (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{actor.name}</h3>
            </div>
            {/* <div className="flex gap-2">{getItemCountBadge()}</div> */}
          </div>
        ),
        children: null, // No children in collapse
        style: panelStyle,
      };
    });

    return (
      <div className="layer-panel-actors mb-2">
        {/* 🎯 FIXED: Show stamp elements by section with Collapse component */}
        {activeCategory === "stamp" ? (
          Object.keys(actorsBySection).map((section) => {
            // 🎯 FIXED: Calculate maxStamps based on section and docType
            let maxStamps = 0;
            if (section === "มาตรา 9") {
              // มาตรา 9: มีได้แค่ 1 คน (ต้นสัญญา) - fixed for both b2b and b2c
              // maxStamps = 1;
              if (docType === "b2b") {
                maxStamps = 2;
              } else {
                maxStamps = 1;
              }
            } else if (section === "มาตรา 26 และมาตรา 28") {
              if (docType === "b2b") {
                // B2B: มี 2 คน (ต้นสัญญา กับ คู่สัญญา) - fixed
                maxStamps = 2;
              } else {
                // B2C: มี 1 คน (ต้นสัญญา) - fixed
                maxStamps = 1;
              }
            }

            if (maxStamps === 0) return null;

            const stampCollapseItems: CollapseProps["items"] = Array.from({ length: maxStamps }, (_, index) => {
              const label = index === 0 ? "ต้นสัญญา" : "คู่สัญญา";
              const firstActorInSection = actorsBySection[section]?.[0];

              return {
                key: `stamp-${section}-${index}`,
                label: (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">ตราประทับ ({label})</h3>
                    </div>
                  </div>
                ),
                children: (
                  <FormElementConfig
                    id={`stamp-${section}-${index}`}
                    type="stamp"
                    label={`ตราประทับ (${label})`}
                    actorId={firstActorInSection?.id || ""}
                    actors={actors}
                    items={items.filter(item =>
                      item.type === "stamp"
                      // && 
                      // item.section === section && 
                      // 🎯 NEW: Use ID-based filtering instead of label filtering
                      // Pattern: stamp-{section}-{index}-{timestamp}
                      // index === 0 means "ต้นสัญญา", index === 1 means "คู่สัญญา"
                      // item.id.includes(`stamp-${section}-${index}-`)
                    )} // 🎯 NEW: Filter items based on ID pattern
                    numPages={numPages}
                    activePage={activePage}
                    configElement={configElement}
                    onLayerSelect={onLayerSelect}
                    onLayerDelete={onLayerDelete}
                    onElementClick={onElementClick}
                    showAddButton={canAddStampElementForSection(section)}
                    section={section} // 🎯 FIXED: Pass section prop
                    stepIndex={currentStepIndex} // 🎯 NEW: Pass stepIndex for signature elements
                    currentStepPermissionType={currentStepPermissionType} // 🎯 NEW: Pass permission type to determine approver mode
                    onConfigChange={(configData) => {
                      if (onConfigChange) {
                        onConfigChange(configData.id, configData);
                      }
                    }}
                    onClose={() => {
                      if (onCloseConfig) {
                        onCloseConfig();
                      }
                    }}
                    docType={docType}
                    documentType={documentType} // 🎯 NEW: Pass documentType prop for template mode
                  />
                ),
                style: panelStyle,
              };
            });

            return (
              <div key={`stamp-section-${section}`} className="stamp-section-container mb-4">
                <div className="mt-2">
                  <div className="space-y-2">
                    {stampCollapseItems?.map((item) => (
                      <Collapse
                        key={item.key}
                        bordered={false}
                        className="stamp-collapse shadow-none border-0 rounded-lg [&_.ant-collapse-content-box]:!p-0"
                        expandIcon={({ isActive }) => (
                          <ChevronDown
                            className={`${isActive ? "rotate-180" : ""
                              } bg-theme px-1 rounded-full`}
                            size={24}
                            color="white"
                          />
                        )}
                        items={[item]}
                        activeKey={expandedStampId === item.key ? [item.key as string] : []}
                        onChange={(keys) => {
                          const key = Array.isArray(keys) ? keys[0] : keys;

                          // 🎯 FIX: When user manually expands/collapses, clear the selection
                          // This prevents useEffect from overriding the manual expand/collapse action
                          if (key) {
                            // Expanding - clear any existing selection to allow manual expand
                            if (onCloseConfig) {
                              onCloseConfig();
                            }
                          }

                          // Always call handleStampExpandChange - it will handle both expand and collapse
                          handleStampExpandChange(item.key as string);
                        }}
                        style={{
                          background: "transparent",
                          marginBottom: "0px",
                        }}
                        expandIconPosition="start"
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          // Show other categories by individual actors
          actors?.map((actor) => (
            <div key={actor.id} className="actor-collapse-container">
              {/* Actor Header */}
              <Collapse
                bordered={false}
                className="actor-collapse shadow-none border-0 rounded-lg [&_.ant-collapse-content-box]:!p-0"
                expandIcon={({ isActive }) => (
                  <ChevronDown
                    className={`${isActive ? "rotate-180" : ""
                      } bg-theme px-1 rounded-full`}
                    size={24}
                    color="white"
                  />
                )}
                items={[
                  actorCollapseItems.find((item) => item.key === actor.id)!,
                ]}
                activeKey={expandedActorIds.includes(actor.id) ? [actor.id] : []}
                onChange={(keys) => {
                  const key = Array.isArray(keys) ? keys[0] : keys;
                  // Always call handleActorExpandChange - it will handle both expand and collapse
                  handleActorExpandChange(actor.id);
                }}
                style={{
                  background: "transparent",
                  marginBottom: "0px",
                }}
                expandIconPosition="start"
              />

              {/* Actor Content - Custom styled, outside of collapse */}
              {expandedActorIds.includes(actor.id) && (
                <div className="mt-2 actor-collapse-content">
                  <div className="space-y-2">
                    {/* Show only the section that matches activeCategory */}
                    {activeCategory === "signature" && (
                      <FormElementConfig
                        id={`signature-${actor.id}`}
                        type="signature"
                        label={`ลายเซ็น - ${actor.name}`}
                        actorId={actor.id}
                        actors={actors}
                        items={items}
                        numPages={numPages}
                        activePage={activePage}
                        configElement={configElement}
                        onLayerSelect={onLayerSelect}
                        onLayerDelete={onLayerDelete}
                        onElementClick={onElementClick}
                        showAddButton={
                          currentStepIndex !== "all" &&
                          currentStepIndex === actor.order.toString()
                        }
                        stepIndex={currentStepIndex} // 🎯 NEW: Pass stepIndex for signature elements
                        currentStepPermissionType={currentStepPermissionType} // 🎯 NEW: Pass permission type to determine approver mode
                        onConfigChange={(configData) => {
                          // Handle signature config changes if needed
                          if (onConfigChange) {
                            onConfigChange(configData.id, configData);
                          }
                        }}
                        onClose={() => {
                          if (onCloseConfig) {
                            onCloseConfig();
                          }
                        }}
                        documentType={documentType} // 🎯 NEW: Pass documentType prop for template mode
                      />
                    )}

                    {activeCategory === "more-file" && (
                      <FormElementConfig
                        id={`more-file-${actor.id}`}
                        type="more-file"
                        label={`ไฟล์เพิ่มเติม - ${actor.name}`}
                        actorId={actor.id}
                        actors={actors}
                        items={items}
                        numPages={numPages}
                        activePage={activePage}
                        configElement={configElement}
                        onLayerSelect={onLayerSelect}
                        onLayerDelete={onLayerDelete}
                        onElementClick={onElementClick}
                        showAddButton={
                          currentStepIndex !== "all" &&
                          currentStepIndex === actor.order.toString()
                        }
                        stepIndex={currentStepIndex} // 🎯 NEW: Pass stepIndex for signature elements
                        currentStepPermissionType={currentStepPermissionType} // 🎯 NEW: Pass permission type to determine approver mode
                        onValidationChange={onValidationChange}
                        onConfigChange={(configData) => {
                          if (onConfigChange) {
                            onConfigChange(configData.id, configData);
                          }
                        }}
                        onClose={() => {
                          if (onCloseConfig) {
                            onCloseConfig();
                          }
                        }}
              documentType={documentType} // 🎯 NEW: Pass documentType prop for template mode
            />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Show info card when currentStepIndex is "all" */}
        {currentStepIndex === "all" && activeCategory !== "stamp" && (
          // <div className="mt-4 space-y-2">
          // {activeCategory === "signature" && onElementClick && (
          //   <button
          //     onClick={() =>
          //       onElementClick({
          //         id: "signature-global",
          //         type: "signature",
          //         label: "เพิ่มลายเซ็น",
          //       })
          //     }
          //     className="flex items-center justify-center w-full gap-2 p-2 mb-2 bg-white hover:bg-blue-100 transition-all duration-300 border border-theme text-theme rounded-xl cursor-pointer"
          //     style={{ display: currentStepIndex === "all" ? "none" : "flex" }}
          //   >
          //     <Plus size={20} />
          //     เพิ่มลายเซ็น
          //   </button>
          // )}

          // {activeCategory === "more-file" && onElementClick && (
          //   <button
          //     onClick={() =>
          //       onElementClick({
          //         id: "more-file-global",
          //         type: "more-file",
          //         label: "เพิ่มประเภท",
          //       })
          //     }
          //     className="flex items-center justify-center w-full gap-2 p-2 mb-2 bg-white hover:bg-blue-100 transition-all duration-300 border border-theme text-theme rounded-xl cursor-pointer"
          //     style={{ display: currentStepIndex === "all" ? "none" : "flex" }}
          //   >
          //     <Plus size={20} />
          //     เพิ่มประเภท
          //   </button>
          // )}
          // </div>

          <div className="mt-4 space-y-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-blue-600 text-sm font-medium mb-2">
                👥 เลือก "ผู้กรอกข้อมูลเอกสาร"
              </div>
              <div className="text-blue-500 text-xs">
                กรุณาเลือกลำดับผู้กรอกข้อมูลจากเมนูด้านขวา<br />
                เพื่อเริ่มสร้างองค์ประกอบฟอร์ม
              </div>
            </div>
          </div>
        )}

        {/* 🎯 FIXED: Show stamp add buttons by section - always available regardless of stepIndex */}
        {activeCategory === "stamp" && onElementClick && (
          <div className="mt-4 space-y-2">
            {(() => {
              const sections = Object.keys(actorsBySection);
              return sections?.map((section) => {
                // 🎯 FIXED: Calculate maxStamps based on section and docType
                let maxStamps = 0;
                if (section === "มาตรา 9") {
                  // มาตรา 9: มีได้แค่ 1 คน (ต้นสัญญา) - fixed for both b2b and b2c
                  maxStamps = 1;
                } else if (section === "มาตรา 26 และมาตรา 28") {
                  if (docType === "b2b") {
                    // B2B: มี 2 คน (ต้นสัญญา กับ คู่สัญญา) - fixed
                    maxStamps = 2;
                  } else {
                    // B2C: มี 1 คน (ต้นสัญญา) - fixed
                    maxStamps = 1;
                  }
                }

                const currentStamps = getStampsBySection(section).length;

                if (section === "มาตรา 9" && docType === "b2b") {
                  return null;
                }

                if (currentStamps < maxStamps) {
                  return (
                    <button
                      key={`stamp-add-${section}`}
                    onClick={() => {
                      onElementClick({
                        id: `stamp-global-${section}`,
                        type: "stamp",
                        label: `เพิ่มตราประทับ (${section})`,
                      });
                    }}
                      className="flex items-center justify-center w-full gap-2 p-2 mb-2 bg-white hover:bg-blue-100 transition-all duration-300 border border-theme text-theme rounded-xl cursor-pointer"
                    >
                      <Plus size={20} />
                      เพิ่มตราประทับ
                    </button>
                  );
                }
                return null;
              });
            })()}
          </div>
        )}
      </div>
    );
  };

  const getReadableTypeName = (type: string, item?: ExtendedFormItem) => {
    switch (type) {
      case "text":
        return "Text";
      case "checkbox":
        return "Checkbox";
      case "select":
        return "Select";
      case "date":
        if (item && item.id) {
          const idParts = item.id.split("-");
          if (idParts.length > 0) {
            const firstPart = idParts[0];
            if (firstPart === "periodDate") {
              return "Period Date";
            } else if (firstPart === "date") {
              return "Date";
            }
          }
        }
        if (item && item.dateTimeType === "periodDate") {
          return "Period Date";
        }
        return "Date";
      case "signature":
        return "Signature";
      case "more-file":
        return "More File";
      case "stamp":
        return "Stamp";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Generate a display name for each item type with sequence number
  const getElementDisplayName = (
    item: ExtendedFormItem,
    items: ExtendedFormItem[]
  ) => {
    if (item.type === "date") {
      let itemDateTimeType = "date"; // default

      // Check if this is a grouped date element
      if ((item as any).__dateElements) {
        itemDateTimeType = "date"; // This is a grouped date element
      } else if (item.id) {
        const idParts = item.id.split("-");
        if (idParts.length > 0) {
          const firstPart = idParts[0];
          if (firstPart === "periodDate") {
            itemDateTimeType = "periodDate";
          } else if (firstPart === "date") {
            itemDateTimeType = "date";
          }
        }
      }

      // For grouped date elements, count them as one unit
      if ((item as any).__dateElements) {
        // Get all grouped date elements and sort by timestamp
        const allGroupedDateItems = items.filter((i) => {
          return i.type === "date" && (i as any).__dateElements;
        });

        // Sort primarily by stepIndex (numeric), then by timestamp to ensure consistent ordering
        const sortedGroupedItems = allGroupedDateItems.sort((a, b) => {
          const stepA = parseInt((a as any).__stepIndex || "0", 10);
          const stepB = parseInt((b as any).__stepIndex || "0", 10);
          if (!isNaN(stepA) && !isNaN(stepB) && stepA !== stepB) {
            return stepA - stepB;
          }
          const timestampA = (a as any).__timestamp || "";
          const timestampB = (b as any).__timestamp || "";
          return timestampA.localeCompare(timestampB);
        });

        const itemIndex = sortedGroupedItems.findIndex((i) => i.id === item.id);
        const typeName = getReadableTypeName(item.type, item);

        // Check if this is an incomplete group
        const isIncomplete = (item as any).__isIncomplete;
        const elementCount = (item as any).__dateElements?.length || 0;

        // Add incomplete indicator if not all 3 elements are present
        const displayName = `${typeName} ${itemIndex + 1}${isIncomplete ? ` (${elementCount}/3)` : ""
          }`;
        return displayName;
      }

      // For regular date elements, use the original logic
      const sameDateTimeTypeItems = items.filter((i) => {
        if (i.type !== "date" || !i.id) return false;

        const iIdParts = i.id.split("-");
        if (iIdParts.length === 0) return false;

        const iFirstPart = iIdParts[0];
        return iFirstPart === itemDateTimeType;
      });

      // Find the index of this item within its dateTimeType group
      const itemIndex = sameDateTimeTypeItems.findIndex(
        (i) => i.id === item.id
      );
      const typeName = getReadableTypeName(item.type, item);

      return `${typeName} ${itemIndex + 1}`;
    }

    // 🎯 NEW: Handle checkbox/radio groups
    if (
      (item.type === "checkbox" || item.type === "radio") &&
      (item as any).__checkboxRadioElements
    ) {
      // This is a grouped checkbox/radio element
      const allGroupedItems = items.filter((i) => {
        return i.type === item.type && (i as any).__checkboxRadioElements;
      });

      // Sort by parentId to ensure consistent ordering
      const sortedGroupedItems = allGroupedItems.sort((a, b) => {
        const parentIdA = (a as any).__parentId || "";
        const parentIdB = (b as any).__parentId || "";
        return parentIdA.localeCompare(parentIdB);
      });

      const itemIndex = sortedGroupedItems.findIndex((i) => i.id === item.id);
      const typeName = getReadableTypeName(item.type, item);
      const elementCount = (item as any).__checkboxRadioElements?.length || 0;

      return `${typeName} ${itemIndex + 1} (${elementCount} options)`;
    }

    // For other types, use the original logic
    const sameTypeItems = items.filter((i) => i.type === item.type);
    const itemIndex = sameTypeItems.findIndex((i) => i.id === item.id);
    const typeName = getReadableTypeName(item.type, item);
    return `${typeName} ${itemIndex + 1}`;
  };

  const handleConfigClose = () => {
    setShowConfig(false);
    setConfigItem(null);
    if (onCloseConfig) {
      onCloseConfig();
    }
  };

  const handleConfigChange = (configData: FormElementConfigData) => {
    if (configItem && onConfigChange) {
      onConfigChange(configItem.id, configData);
    }
    setShowConfig(false);
    setConfigItem(null);
  };

  // Handle expand change for non-signature items
  const handleExpandChange = (key: string | string[]) => {
    const newExpandedId = Array.isArray(key) ? key[0] : key;

    if (newExpandedId) {
      const selectedItem = groupedPageItems.find(
        (item) => item.id === newExpandedId
      );

      if (
        selectedItem &&
        selectedItem.type === "date" &&
        (selectedItem as any).__dateElements
      ) {
        setExpandedItemId(newExpandedId);

        if (onLayerSelect) {
          const firstDateElement = (selectedItem as any).__dateElements[0];
          onLayerSelect(firstDateElement);
        }
      } else {
        setExpandedItemId(newExpandedId);

        if (onLayerSelect) {
          onLayerSelect(selectedItem!);
        }
      }
    } else {
      // Collapsing - close config
      setExpandedItemId(undefined);
      if (onCloseConfig) {
        onCloseConfig();
      }
    }
  };

  // Create collapse items for non-signature elements
  const collapseItems: CollapseProps["items"] = groupedPageItems?.map((item) => {
    const isVisible = visibilityState[item.id] !== false;
    const displayName = getElementDisplayName(item, groupedPageItems);

    return {
      key: item.id,
      label: (
        <div className="flex items-center justify-between w-full">
          <span
            className={`truncate flex-1 ${!isVisible ? "text-gray-400" : ""}`}
          >
            {displayName}
          </span>
          {/* Show warning icon for incomplete date groups */}
          {item.type === "date" && (item as any).__isIncomplete && (
            <Tooltip
              title={`Incomplete group: missing ${3 - ((item as any).__dateElements?.length || 0)
                } element(s)`}
            >
              <span className="text-yellow-500 text-xs ml-2">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </Tooltip>
          )}
        </div>
      ),
      extra: (
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Delete">
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                if (
                  item.type === "date" &&
                  (item as any).__dateElements &&
                  onGroupedDelete
                ) {
                  const groupedElements = (item as any).__dateElements;
                  const elementIds = groupedElements?.map(
                    (el: ExtendedFormItem) => el.id
                  );

                  onGroupedDelete(elementIds);
                } else if (
                  (item.type === "checkbox" || item.type === "radio") &&
                  (item as any).__checkboxRadioElements &&
                  onGroupedDelete
                ) {
                  // For checkbox/radio groups, delete all elements in the group
                  const groupedElements = (item as any).__checkboxRadioElements;
                  const elementIds = groupedElements?.map(
                    (el: ExtendedFormItem) => el.id
                  );

                  onGroupedDelete(elementIds);
                } else if (onLayerDelete) {
                  onLayerDelete(item.id);
                }
              }}
              danger
              className="mx-1"
            />
          </Tooltip>
        </div>
      ),
      children: (
        <div className="form-element-config space-y-2">
          {/* 🎯 FIXED: Always render FormElementConfig but control visibility with CSS */}
          {onConfigChange && onValueChange && (
            <div
              style={{
                display: expandedItemId === item.id ? 'block' : 'none',
                height: expandedItemId === item.id ? 'auto' : '0',
                overflow: 'hidden'
              }}
            >
              <FormElementConfig
                id={item.id}
                type={item.type}
                label={displayName}
                checkboxOptions={item.checkboxOptions}
                maxLength={item.maxLength}
                required={item.required}
                placeholder={item.placeholder}
                value={item.value}
                maxFileSize={item.maxFileSize}
                typeName={item.typeName}
                isEmbedded={item.isEmbedded}
                fileAccept={item.fileAccept}
                items={items}
                numPages={numPages}
                activePage={activePage}
                configElement={configElement}
                onElementClick={onElementClick}
                onValidationChange={onValidationChange}
                onLayerDelete={onLayerDelete}
                onGroupedDelete={onGroupedDelete}
                // 🎯 NEW: Pass grouped elements for real-time updates
                groupedCheckboxRadioElements={
                  (item.type === "checkbox" || item.type === "radio") &&
                    (item as any).__checkboxRadioElements
                    ? (item as any).__checkboxRadioElements
                    : undefined
                }
                onConfigChange={(configData) => {
                  if (onConfigChange) {
                    if (item.type === "date" && (item as any).__dateElements) {
                      (item as any).__dateElements.forEach(
                        (dateEl: ExtendedFormItem) => {
                          const groupConfigData = {
                            ...configData,
                            id: dateEl.id,
                            // 🎯 FIXED: Include date config with header for mappingBuilder
                            date: configData.date
                              ? {
                                ...configData.date,
                                header:
                                  configData.label ||
                                  configData.date.header ||
                                  "",
                              }
                              : undefined,
                          };
                          onConfigChange(dateEl.id, groupConfigData);
                        }
                      );
                    } else if (
                      (item.type === "checkbox" || item.type === "radio") &&
                      (item as any).__checkboxRadioElements
                    ) {
                      // For checkbox/radio groups, update all elements in the group
                      (item as any).__checkboxRadioElements.forEach(
                        (element: ExtendedFormItem) => {
                          const groupConfigData = {
                            ...configData,
                            id: element.id,
                          };
                          onConfigChange(element.id, groupConfigData);
                        }
                      );
                    } else {
                      onConfigChange(item.id, configData);
                    }
                  }
                }}
                onValueChange={(newValue, checkboxOptions) => {
                  if (onValueChange) {
                    if (item.type === "date" && (item as any).__dateElements) {
                      try {
                        const valueData = JSON.parse(newValue as string);
                        if (
                          valueData.elementId &&
                          valueData.value !== undefined
                        ) {
                          onValueChange(
                            valueData.elementId,
                            valueData.value,
                            checkboxOptions
                          );
                        } else {
                          const firstDateElement = (item as any)
                            .__dateElements[0];
                          onValueChange(
                            firstDateElement.id,
                            newValue,
                            checkboxOptions
                          );
                        }
                      } catch (error) {
                        const firstDateElement = (item as any).__dateElements[0];
                        onValueChange(
                          firstDateElement.id,
                          newValue,
                          checkboxOptions
                        );
                      }
                    } else if (
                      (item.type === "checkbox" || item.type === "radio") &&
                      (item as any).__checkboxRadioElements
                    ) {
                      // 🎯 FIX: For checkbox/radio groups, we need to determine which specific element to update
                      // The newValue should contain the elementId information
                      if (
                        typeof newValue === "string" &&
                        newValue.includes("elementId:")
                      ) {
                        // Extract elementId from the value string
                        const parts = newValue.split("elementId:");
                        const elementId = parts[1].split(":")[0];
                        const actualValue = parts[1]
                          .split(":")
                          .slice(1)
                          .join(":");

                        onValueChange(elementId, actualValue, checkboxOptions);
                      } else {
                        // Fallback: update the first element (representative)
                        const firstElement = (item as any)
                          .__checkboxRadioElements[0];
                        onValueChange(firstElement.id, newValue, checkboxOptions);
                      }
                    } else {
                      onValueChange(item.id, newValue, checkboxOptions);
                    }
                  }
                }}
                onClose={() => {
                  setExpandedItemId(undefined);
                  if (onCloseConfig) {
                    onCloseConfig();
                  }
                }}
                onDelete={() => {
                  if (
                    item.type === "date" &&
                    (item as any).__dateElements &&
                    onGroupedDelete
                  ) {
                    const groupedElements = (item as any).__dateElements;
                    const elementIds = groupedElements?.map(
                      (el: ExtendedFormItem) => el.id
                    );

                    onGroupedDelete(elementIds);
                  } else if (
                    (item.type === "checkbox" || item.type === "radio") &&
                    (item as any).__checkboxRadioElements &&
                    onGroupedDelete
                  ) {
                    // For checkbox/radio groups, delete all elements in the group
                    const groupedElements = (item as any).__checkboxRadioElements;
                    const elementIds = groupedElements?.map(
                      (el: ExtendedFormItem) => el.id
                    );

                    onGroupedDelete(elementIds);
                  } else if (onLayerDelete) {
                    onLayerDelete(item.id);
                  }
                }}
                groupedDateElements={(() => {
                  if (item.type === "date" && (item as any).__dateElements) {
                    return (item as any).__dateElements;
                  }
                  return undefined;
                })()}
                stepIndex={currentStepIndex} // 🎯 NEW: Pass stepIndex for signature elements
                currentStepPermissionType={currentStepPermissionType} // 🎯 NEW: Pass permission type to determine approver mode
              />
            </div>
          )}
        </div>
      ),
      style: panelStyle,
    };
  });

  // Render content based on activeCategory
  const renderCategoryContent = () => {
    if (
      activeCategory === "signature" ||
      activeCategory === "more-file" ||
      activeCategory === "stamp"
    ) {
      // Show only actors for signature, more-file, and stamp categories
      return renderActors();
    } else if (activeCategory === "settings") {
      // Don't show anything for settings
      return null;
    } else {
      return (
        <>
          {collapseItems.length > 0 && (
            <Collapse
              accordion
              bordered={false}
              className="shadow-none border-0 rounded-lg"
              expandIcon={({ isActive }) => (
                <ChevronDown
                  className={`${isActive ? "rotate-180" : ""
                    } bg-theme px-1 rounded-full`}
                  size={24}
                  color="white"
                />
              )}
              activeKey={expandedItemId ? [expandedItemId] : []}
              onChange={handleExpandChange}
              items={collapseItems}
              style={{
                background: "transparent",
                marginBottom: "0px !important",
              }}
              expandIconPosition="start"
            />
          )}
        </>
      );
    }
  };

  return (
    <div
      className={`layer-panel px-4 ${collapseItems.length > 0 ||
        activeCategory === "signature" ||
        activeCategory === "more-file" ||
        activeCategory === "stamp"
        ? "pb-2"
        : ""
        }`}
    >
      <div className="h-full">{renderCategoryContent()}</div>
      {showConfig && configItem && (
        <div className="fixed top-1/2 right-0 -translate-y-1/2 z-50">
          <FormElementConfig
            id={configItem.id}
            type={configItem.type}
            label={configItem.label}
            checkboxOptions={configItem.checkboxOptions}
            maxLength={configItem.maxLength}
            required={configItem.required}
            placeholder={configItem.placeholder}
            maxFileSize={configItem.maxFileSize}
            typeName={configItem.typeName}
            isEmbedded={configItem.isEmbedded}
            fileAccept={configItem.fileAccept}
            numPages={numPages}
            activePage={activePage}
            configElement={configElement}
            onElementClick={onElementClick}
            onConfigChange={handleConfigChange}
            onClose={handleConfigClose}
            stepIndex={currentStepIndex} // 🎯 NEW: Pass stepIndex for signature elements
            currentStepPermissionType={currentStepPermissionType} // 🎯 NEW: Pass permission type to determine approver mode
              documentType={documentType} // 🎯 NEW: Pass documentType prop for template mode
            />
        </div>
      )}
    </div>
  );
};

export default LayerPanel;
