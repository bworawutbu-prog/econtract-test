"use client";

import React from "react";
import { Divider } from "antd";
import OthersProperties from "./propertyAssets/othersProperties";
import MonthlyRental from "./propertyPrice/monthlyRental";
import { AttachDetailItem } from "../../../store/types/contractFormType";
import { AmountDocType3 } from "./propertyPrice/amountDocType3";
import RentalDocType1 from "./propertyPrice/rentalDocType1";

interface StampPropertyDetailsProps {
  propertyRentalData: AttachDetailItem;
  rentalPriceData: AttachDetailItem;
  onPropertyRentalDataChange: (data: AttachDetailItem) => void; // callback สำหรับอัพเดท propertyRentalData
  onRentalPriceDataChange: (data: AttachDetailItem) => void; // callback สำหรับอัพเดท rentalPriceData
  documentTypeCode: string;
  errArray? : {key:string, message:string}[]
}

const StampPropertyDetails: React.FC<StampPropertyDetailsProps> = ({
  propertyRentalData,
  rentalPriceData,
  onPropertyRentalDataChange,
  onRentalPriceDataChange,
  documentTypeCode,
  errArray
}) => {
  // Handler สำหรับรับค่า attActionType1 จาก OthersProperties
  const handleAttActionType1Change = (value: string) => {
    const updatedData = { ...propertyRentalData, attActionType1: value };
    onPropertyRentalDataChange(updatedData);
  };

  // Handler สำหรับรับค่า attActionType1 และ attActionType2 จาก MonthlyRental
  const handleAttActionTypeChange = (
    attActionType1: string,
    attActionType2: string
  ) => {
    const updatedData = { ...rentalPriceData, attActionType1, attActionType2 };
    onRentalPriceDataChange(updatedData);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-200 text-theme p-3 mb-4 rounded">
        <h3 className="font-semibold">ลักษณะตราสารอิเล็กทรอนิกส์</h3>
      </div>

      {/* <h4 className="font-semibold">ทรัพย์สินที่เช่า <span className="text-red-500">*</span></h4> */}
      {/* ส่งข้อมูล arrayDetail.attType === "1" และ attActionType1 === "3" */}
      <OthersProperties
        propertyRentalData={propertyRentalData}
        // ส่งเฉพาะ attActionType1 === "3" สำหรับเงื่อนไข checkbox
        isOtherProperty={propertyRentalData.attActionType1 === "3"}
        onAttActionType1Change={handleAttActionType1Change}
        type={documentTypeCode}
        errArray={errArray}
      />

      {documentTypeCode === "1" && (
        <>
          <Divider />

          <h4 className="font-semibold">ค่าเช่า หรือประมาณการค่าเช่า <span className="text-red-500">*</span></h4>
          {/* ส่งข้อมูล arrayDetail.attType === "2" */}
          {/* <MonthlyRental
            rentalPriceData={rentalPriceData}
            // ส่งเฉพาะ attActionType2 === "1" สำหรับเงื่อนไข checkbox
            isMonthlyRental={rentalPriceData.attActionType2 === "1"}
            onAttActionType1Change={(value) =>
              handleAttActionTypeChange(value, rentalPriceData.attActionType2 || "")
            }
            onAttActionType2Change={(value) =>
              handleAttActionTypeChange(rentalPriceData.attActionType1 || "", value)
            }
            errArray={errArray}
          />  */}
          <RentalDocType1 
            errArray={errArray}
          />
        </>
      )}
      {
        documentTypeCode === "3" && (
          <>
            <Divider />
            <AmountDocType3 
              errArray={errArray}
            />
          </>
        )
      }
    </div>
  );
};

export default StampPropertyDetails;
