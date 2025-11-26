"use client";

import React, { useState, useEffect } from "react";
import { Select } from "antd";
import { ChevronDown } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setPartyRelationship,
  setDocumentTypeCode,
  setArrayDetail,
  resetForm,
} from "@/store/slices/contractFormSlice";
import {
  DocumentTypeOption,
  documentTypeOptions,
  partyRelationshipOptions,
} from "@/store/types/estampTypes";

interface StampEsignProps {
  onDocumentTypeChange: (documentType: DocumentTypeOption) => void; // callback สำหรับส่งข้อมูล document type กลับไป
  onRelationshipChange: (relationship: string) => void; // callback สำหรับส่งข้อมูล relationship กลับไป
  onClearErrors?: () => void; // callback สำหรับเครียร์ error array
  errArray?: {key:string, message:string}[]
}

const StampEsign: React.FC<StampEsignProps> = ({
  onDocumentTypeChange,
  onRelationshipChange,
  onClearErrors,
  errArray
}) => {
  const dispatch = useAppDispatch();
  const contractForm = useAppSelector((state) => state.contractForm);

  // Set default values when component mounts
  useEffect(() => {
    // ส่งข้อมูลเริ่มต้นกลับไปยัง parent component
    const defaultDocumentType = documentTypeOptions.find(
      (option) => option.value === contractForm.documentTypeCode || "1"
    );
    if (defaultDocumentType) {
      onDocumentTypeChange(defaultDocumentType);
    }
    onRelationshipChange(contractForm.partyRelationship || "1");
  }, []); // รันครั้งเดียวเมื่อ component mount

  // Handler สำหรับ document type change
  const handleDocumentTypeChange = (value: string) => {
    // อัพเดท Redux store ด้วย setDocumentTypeCode
    dispatch(setDocumentTypeCode(value || "1"));
    // ล้าง form ยกเว้น Document Type Code
    dispatch(setArrayDetail([]));
    dispatch(resetForm({ except: ["documentTypeCode"] }));
    // เครียร์ errArray ในฟอร์ม
    if (onClearErrors) {
      onClearErrors();
    }

    const selectedDocumentType = documentTypeOptions.find(
      (option) => option.value === value
    );
    if (selectedDocumentType) {
      onDocumentTypeChange(selectedDocumentType);
    }
  };

  // Handler สำหรับ relationship change
  const handleRelationshipChange = (value: string) => {
    // อัพเดท Redux store ด้วย setPartyRelationship (ไม่ใช่ setContractNo)
    dispatch(setPartyRelationship(value || ""));
    onRelationshipChange(value);
  };

  // ตรวจสอบ error จาก errArray
  const genError = (key: string) => {
    if (errArray) {
      const error = errArray.find((item) => item.key === key);
      if (error) {
        return error.message;
      }
    }
  }

  return (
    <>
      <div className="bg-gray-200 text-theme p-3 mb-4 rounded">
        <h3 className="font-semibold">ลักษณะตราสารอิเล็กทรอนิกส์</h3>
      </div>
      <div className="mb-6 px-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">ลักษณะแห่งตราสาร <span className="text-red-500">*</span></label>
            <Select
              placeholder="เลือกลักษณะแห่งตราสาร"
              suffixIcon={<ChevronDown size={20} />}
              value={contractForm.documentTypeCode || "1"}
              onChange={handleDocumentTypeChange}
              className="w-full"
              status={`${(genError("documentTypeCode") && contractForm.documentTypeCode == "") ? "error" : ""}`}
            >
              {documentTypeOptions?.map((option) => (
                <Select.Option key={option.key} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
            {
              (genError("documentTypeCode") && contractForm.documentTypeCode == "") && (
                <div className="text-red-500 text-sm">
                  {genError("documentTypeCode")}
                </div>
              )
            }
          </div>
          <div>
            <label className="block mb-2">ผู้ขอเสียอากรแสตมป์ในฐานะ <span className="text-red-500">*</span></label>
            <Select
              value={contractForm.partyRelationship || "1"}
              suffixIcon={<ChevronDown size={20} />}
              onChange={handleRelationshipChange}
              placeholder="เลือกฐานะ"
              className="w-full"
              status={`${(genError("partyRelationship") && contractForm.partyRelationship == "") ? "error" : ""}`}
            >
              {
                partyRelationshipOptions.filter((option) => option.typeCode === contractForm.documentTypeCode).map((option) => (
                  option?.data?.map((item) => (
                    <Select.Option key={item.key} value={item.value}>
                      {item.label}
                    </Select.Option>
                  ))
                ))
              }
            </Select>
            {
              (genError("partyRelationship") && contractForm.partyRelationship == "") && (
                <div className="text-red-500 text-sm">
                  {genError("partyRelationship")}
                </div>
              )
            }
          </div>
        </div>
      </div>
    </>
  );
};

export default StampEsign;
