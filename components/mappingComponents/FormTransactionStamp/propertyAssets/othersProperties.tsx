"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { AttachDetailItem } from "../../../../store/types/contractFormType";
import { DocumentType7 } from "../documentTypeForm/documentType7";
import { DocumentType17 } from "../documentTypeForm/documentType17";
import { DocumentType4 } from "../documentTypeForm/documentType4";
import { DocumentType1 } from "../documentTypeForm/documentType1";
import DocumentType28 from "../documentTypeForm/documentType28";
import { DocumentType3 } from "../documentTypeForm/documentType3";

interface OthersPropertiesProps {
  propertyRentalData: AttachDetailItem; // arrayDetail.attType === "1" (ทรัพย์สินที่เช่า)
  isOtherProperty: boolean; // true เมื่อ attActionType1 === "3"
  onAttActionType1Change: (value: string) => void; // callback สำหรับส่งค่า attActionType1 กลับไป
  onPropertyRentalDataChange?: (data: AttachDetailItem) => void; // callback สำหรับอัพเดท propertyRentalData
  type: string; // 1. เช่าที่ดิน โรงเรือน สิ่งปลูกสร้างอย่างอื่น หรือแพ 3. เช่าซื้อทรัพย์สิน 4. จ้างทำของ 7. ใบมอบอำนาจ 17. ค้ำประกัน 28. ใบรับสาหรับการขาย ขายฝาก ให้เช่าซื้อ หรือโอนกรรมสิทธิยานพาหนะ
  errArray?: {key:string, message:string}[]
}

const OthersProperties: React.FC<OthersPropertiesProps> = ({
  propertyRentalData,
  isOtherProperty,
  onAttActionType1Change,
  onPropertyRentalDataChange,
  type,
  errArray
}) => {
  const dispatch = useAppDispatch();
  const contractForm = useAppSelector((state: any) => state.contractForm);

  // State แยกสำหรับ checkbox "สิ่งปลูกสร้างอื่น" - กำหนด default value จาก propertyRentalData.attActionType1
  const [isOtherPropertyChecked, setIsOtherPropertyChecked] = useState<string[]>([]);
  const [detailList, setDetailList] = useState<any[]>([]);
  const [selectValue, setSelectValue] = useState<string>("1");
  const formatBuildingNumber = (value: string): string => {
    // ลบทุกอย่างที่ไม่ใช่ตัวเลข
    const numbers = value.replace(/\D/g, "");
    return numbers;
  };

  // อัพเดท state เมื่อ propertyRentalData.attActionType1 เปลี่ยน
  // useEffect(() => {
  //   setIsOtherPropertyChecked(propertyRentalData.attActionType1 === "3");
  // }, [propertyRentalData.attActionType1]);

  // const handleCheckboxChange = (e: any) => {
  //   console.log("e =>", e);
  //   setIsOtherPropertyChecked(e);

  //   // อัพเดท propertyType ใน Redux store
  //   dispatch(setPropertyType(e.length > 0 ? "1" : "0"));

  //   // ส่งค่า attActionType1 กลับไป (แทนการ hard code "3")
  //   onAttActionType1Change(e.length > 0 ? "3" : "0");
  // };

  // const handleCheckboxChange = (e: any) => {
  //   let newCheckedState: string[];
  //   if (e.target.checked) {
  //     newCheckedState = [...isOtherPropertyChecked, e.target.value].sort((a, b) => a - b);
  //   } else {
  //     newCheckedState = isOtherPropertyChecked.filter((item) => item !== e.target.value).sort();
  //   }
    
  //   setIsOtherPropertyChecked(newCheckedState);
    
    
  //   // อัพเดท propertyType ใน Redux store
  //   dispatch(setPropertyType(newCheckedState.length > 0 ? "1" : "0"));

  //   // ส่งค่า attActionType1 กลับไป
  //   onAttActionType1Change(newCheckedState.length > 0 ? "3" : "0");
  // };

  // const handleBuildingNumberChange = (e: any) => {
  //   const formattedValue = formatBuildingNumber(e.target.value);
  //   dispatch(setPropertyAddress({
  //     ...contractForm.propertyAddress,
  //     buildingNumber: formattedValue,
  //   }));
  // };

  // // Handler สำหรับรับข้อมูลที่อยู่จาก InputThaiAddress
  // const handleAddressChange = (address: AddressData) => {
  //   // อัพเดท propertyRentalData ด้วยข้อมูลที่อยู่ใหม่
  //   const updatedPropertyRentalData = {
  //     ...propertyRentalData,
  //     attDetail2: address.district, // ตำบล/แขวง
  //     attDetail3: address.amphoe,   // อำเภอ/เขต
  //     attDetail4: address.province, // จังหวัด
  //   };

  //   // ส่งข้อมูลกลับไปยัง parent component
  //   onPropertyRentalDataChange?.(updatedPropertyRentalData);
  // };

  const genError = (key: string) => {
    if (errArray) {
      const error = errArray.find((item) => item.key === key);
      if (error) {
        return error.message;
      }
    }
  }

  const formatPropertyTypeList = (type: string) => {
    switch (type) {
      case "1":
        return (
          <DocumentType1
            propertyRentalData={propertyRentalData}
            errArray={errArray}
            onAttActionType1Change={onAttActionType1Change}
            onPropertyRentalDataChange={onPropertyRentalDataChange}
            genError={genError}
          />
        )
      case "3":
        return (
          <DocumentType3 
            errArray={errArray}
            genError={genError}
          />
        )
      case "4":
        return (
          <DocumentType4 
            genError={genError}
          />
        )
      case "7":
        return (
          <DocumentType7 
            genError={genError}
          />
        )
      case "17":
        return (
          <DocumentType17 
            genError={genError}
          />
        )
      case "28":
        return (
          <DocumentType28 />
        )
    }
  }

  return (
    <div>
      {formatPropertyTypeList(type)}
    </div>
  );
};

export default OthersProperties;
