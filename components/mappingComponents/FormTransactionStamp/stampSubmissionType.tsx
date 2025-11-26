"use client";

import React from "react";
import { Radio } from "antd";
interface StampSubmissionTypeProps {
  documentSubmissionType: string;
  onDocumentSubmissionTypeChange: (value: string) => void;
}

const StampSubmissionType: React.FC<StampSubmissionTypeProps> = ({
  documentSubmissionType,
  onDocumentSubmissionTypeChange,
}) => {
  return (
    <>
      <div className="bg-gray-200 text-theme p-3 mb-4 rounded">
        <h3 className="font-semibold">ประเภทการยื่นตราสาร</h3>
      </div>
      <div className="mb-6 px-4">
        <Radio.Group
          value={documentSubmissionType}
          onChange={(e) => onDocumentSubmissionTypeChange(e.target.value)}
          className="flex gap-6"
        >
          <Radio value="1" checked>
            ตราสารอิเล็กทรอนิกส์
          </Radio>
          {/* <Radio value="2">ตราสารกระดาษ</Radio> */}
        </Radio.Group>
      </div>
    </>
  );
};

export default StampSubmissionType; 