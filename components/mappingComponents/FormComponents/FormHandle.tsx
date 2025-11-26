"use client";

import React, { useMemo } from "react";
import { FiMove, FiSettings, FiCopy } from "react-icons/fi";
import { Trash } from "lucide-react";

interface FormHandleProps {
  id: string;
  type?: string; // Add type prop to identify signature elements
  hasEditPermission: () => boolean;
  isUserEditingInModal: boolean;
  onConfigClick?: () => void;
  onLayerDelete?: (itemId: string) => void;
  onLayerDuplicate?: (itemId: string) => void; // Add duplicate handler
  setShowConfig: (show: boolean) => void;
  attributes: any;
  listeners: any;
  documentType?: string; // 🎯 NEW: Document mode (create, draft, template)
}

export const FormHandle: React.FC<FormHandleProps> = ({
  id,
  type,
  hasEditPermission,
  isUserEditingInModal,
  onConfigClick,
  onLayerDelete,
  onLayerDuplicate,
  setShowConfig,
  attributes,
  listeners,
  documentType, // 🎯 NEW: Document mode for template mode
}) => {
  const isTemplateMode = false;
  void documentType;
  const formHandle = useMemo(() => {
    // 🛡️ Hide form handle when user is editing in Frontend modal or in template mode
    if (!hasEditPermission() || isUserEditingInModal || isTemplateMode) {
      return null;
    }

    return (
      <div
        id="form-handle"
        className="absolute"
        style={{
          top: "-40px", // Position above the element
          left: "0px",
          zIndex: 1001, // Ensure it's above resize handles
          pointerEvents: "auto", // Enable interactions
        }}
      >
        <div className="inline-flex rounded-md shadow-theme" role="group">
          <div
            className={`px-2 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 cursor-move transition-colors ${
              type === "signature" ? "rounded-s-lg" : "rounded-s-lg"
            }`}
            {...listeners}
            {...attributes}
            data-drag-handle="true"
            onTouchStart={(e) => {
              e.preventDefault();
            }}
            style={{
              touchAction: "none",
            }}
            title="เคลื่อนย้าย"
          >
            <FiMove className="w-4 h-4" />
          </div>

          {type !== "signature" &&
            type !== "radio" &&
            type !== "checkbox" &&
            type !== "days" &&
            type !== "months" &&
            type !== "years" && (
              <button
                type="button"
                onClick={onConfigClick || (() => setShowConfig(true))}
                className="px-2 py-2 text-sm font-medium text-gray-900 bg-white border-y border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 transition-colors"
                title="ตั้งค่า"
              >
                <FiSettings className="w-4 h-4" />
              </button>
            )}

          {/* Show duplicate button only for signature elements */}
          {type === "signature" && onLayerDuplicate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLayerDuplicate(id);
              }}
              className="px-2 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-green-700 focus:z-10 focus:ring-2 focus:ring-green-500 transition-colors"
              title="ทำซ้ำ"
            >
              <FiCopy className="w-4 h-4" />
            </button>
          )}
          {onLayerDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLayerDelete(id);
              }}
              className={`px-2 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 hover:text-red-700 focus:z-10 focus:ring-2 focus:ring-red-500 transition-colors ${
                type === "signature" ? "rounded-e-lg" : "rounded-e-lg"
              }`}
              title="ลบ"
            >
              <Trash className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
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
  ]);

  return formHandle;
};
