"use client";

import React, { useRef, useState } from "react";
import { UploadIcon } from "lucide-react";

interface DragAndDropFileProps {
  onFileSelect: (file: File) => void;
  onFileValidationError?: (error: string) => void;
  onFileValidationSuccess?: (file: File) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
  className?: string;
  placeholder?: React.ReactNode;
  description?: string;
  preview?: boolean;
  previewImage?: string;
  onPreviewImageChange?: (image: string) => void;
  disabled?: boolean;
  allowMultiple?: boolean;
  customValidation?: (file: File) => boolean | string; // Return true if valid, error message if invalid
  showError?: boolean;
  errorMessage?: string;
  clearError?: () => void;
  onClearPreview?: () => void; // Add this new prop
}

const DragAndDropFile: React.FC<DragAndDropFileProps> = ({
  onFileSelect,
  onFileValidationError,
  onFileValidationSuccess,
  acceptedFileTypes = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"],
  maxFileSize = 5, // 5MB default
  className = "",
  placeholder = "คลิกหรือวางไฟล์",
  description = `รองรับไฟล์ ${acceptedFileTypes.join(
    ", "
  )} ขนาดไม่เกิน ${maxFileSize} MB`,
  preview = false,
  previewImage = "",
  onPreviewImageChange,
  disabled = false,
  allowMultiple = false,
  customValidation,
  showError = true,
  errorMessage: externalErrorMessage,
  clearError: externalClearError,
  onClearPreview,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [internalError, setInternalError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use external error if provided, otherwise use internal error
  const error =
    externalErrorMessage !== undefined && externalErrorMessage !== null ? externalErrorMessage : internalError;

  const clearError = () => {
    setInternalError("");
    externalClearError?.();
  };

  const validateFile = (file: File): boolean => {
    // Custom validation first
    if (customValidation) {
      const customResult = customValidation(file);
      if (typeof customResult === "string") {
        const errorMsg = customResult;
        setInternalError(errorMsg);
        onFileValidationError?.(errorMsg);
        return false;
      } else if (!customResult) {
        const errorMsg = "ไฟล์ไม่ผ่านการตรวจสอบ";
        setInternalError(errorMsg);
        onFileValidationError?.(errorMsg);
        return false;
      }
    }

    // Check file type
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!acceptedFileTypes.includes(fileExtension)) {
      const errorMsg = `รองรับเฉพาะไฟล์ ${acceptedFileTypes.join(
        ", "
      )} เท่านั้น`;
      setInternalError(errorMsg);
      onFileValidationError?.(errorMsg);
      return false;
    }

    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxFileSize) {
      const errorMsg = `ไฟล์ต้องมีขนาดไม่เกิน ${maxFileSize} MB`;
      setInternalError(errorMsg);
      onFileValidationError?.(errorMsg);
      return false;
    }

    // Clear any existing errors
    clearError();
    onFileValidationSuccess?.(file);
    return true;
  };

  const handleFileSelect = (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    // If preview is enabled, create preview image
    if (preview && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onPreviewImageChange?.(base64);
      };
      reader.readAsDataURL(file);
    }

    onFileSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (allowMultiple) {
        // Handle multiple files
        Array.from(files).forEach(handleFileSelect);
      } else {
        // Handle single file
        handleFileSelect(files[0]);
      }
    }
    // Reset the input value so selecting the same file again triggers onChange
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if (allowMultiple) {
        // Handle multiple files
        Array.from(files).forEach(handleFileSelect);
      } else {
        // Handle single file
        handleFileSelect(files[0]);
      }
    }
    // Also reset the hidden input to allow re-uploading the same file via click later
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleClearPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreviewImageChange?.("");
    clearError();
    onClearPreview?.(); // Call the new prop
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClearPreview}
        className="flex justify-end w-full mb-2"
      >
        ล้างค่า
      </button>
      <div
        className={`
          flex flex-col gap-2 bg-[#FAFCFF] rounded-xl border border-[#E6E6E6] border-dashed py-6 px-4 cursor-pointer transition-all duration-200
          ${isDragOver ? "border-theme bg-blue-50" : ""}
          ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:border-theme hover:bg-blue-50"
          }
          ${error ? "border-red-300 bg-red-50" : ""}
          ${className}
        `}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={acceptedFileTypes.join(",")}
          multiple={allowMultiple}
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          disabled={disabled}
        />

        {preview && previewImage ? (
          <div className="relative">
            <img
              src={previewImage}
              alt="Preview"
              className="max-h-48 mx-auto rounded-xl"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="p-3 rounded-full shadow-theme mb-3 bg-white">
              <UploadIcon size={32} color="#367AF7" />
            </div>
            <p className="mb-2 text-base text-gray-500">{placeholder}</p>
            <p className="text-sm text-gray-500 text-center">{description}</p>
          </div>
        )}

        {showError && error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DragAndDropFile;
