"use client";

import React, { useEffect, useState } from "react";
import { Input, Select, Radio } from "antd";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setTaxRegistrationId,
  setPartyTitleName,
  setPartyName,
  setPartySurname,
  setPartyMidname,
  setBuildingName,
  setRoomNo,
  setFloorNo,
  setVillageName,
  setBuildingNumber,
  setMoo,
  setSoiName,
  setJunctionName,
  setStreetName,
  setCitySubDivisionName,
  setCityName,
  setCountrySubDivisionName,
  setPostCode,
} from "@/store/slices/contractFormSlice";
import InputThaiAddress from "./inputThaiAddress";
import InputForeignAddress from "./inputForiegnAddress";
import { AddressData } from "@/store/thaiAddressData";
import { ChevronDown } from "lucide-react";
import { thaiPrefixes, titleLegalEntityList } from "@/store/types/othersPropertiesType";
import { partyRelationshipOptions } from "@/store/types";

interface StampPartyDetailsProps {
  onAddressChange?: (address: AddressData) => void; // callback สำหรับส่งข้อมูลที่อยู่กลับไป
  errArray?: {key:string, message:string}[]
  disabled?: boolean
}

const StampPartyDetails: React.FC<StampPartyDetailsProps> = ({
  onAddressChange,
  errArray,
  disabled
}) => {
  const dispatch = useAppDispatch();
  const contractForm = useAppSelector((state) => state.contractForm);
  const B2BformData = useAppSelector((state) => state.contractB2BForm);

  // Additional form states for Radio Groups
  const [partyType, setPartyType] = useState<string>(B2BformData?.forms ? "special" : "normal"); // สำหรับ "ประเภทของบุคคล"
  const [addressType, setAddressType] = useState<string>("domestic"); // สำหรับ "ประเภทข้อมูลที่อยู่"
  const [coContractStatus, setCoContractStatus] = useState<string>(""); // สำหรับ "สถานะของสัญญา"

  // สร้าง state แยกสำหรับข้อมูลที่อยู่ของ party
  // const [partyAddressData, setPartyAddressData] = useState({
  //   citySubDivisionName: contractForm.citySubDivisionName || "",
  //   cityName: contractForm.cityName || "",
  //   countrySubDivisionName: contractForm.countrySubDivisionName || "",
  //   postCode: contractForm.postCode || "",
  // });

  // Function สำหรับ format เลขประจำตัวผู้เสียภาษีอากร
  const formatTaxRegistrationId = (value: string): string => {
    // ลบทุกอย่างที่ไม่ใช่ตัวเลข
    const numbers = value.replace(/\D/g, "");

    // ตัดให้เหลือแค่ 13 หลัก
    return numbers.slice(0, 13);
  };

  // Handler สำหรับ taxRegistrationId
  const handleTaxRegistrationIdChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const formattedValue = formatTaxRegistrationId(e.target.value);
    dispatch(setTaxRegistrationId(formattedValue));
  };

  // Handler สำหรับรับข้อมูลที่อยู่จาก InputThaiAddress
  const handleAddressChange = (address: AddressData) => {
    // อัพเดท local state แทน Redux store เพื่อหลีกเลี่ยงการปนกันกับ property address
    // setPartyAddressData({
    //   citySubDivisionName: address.district, // district = ตำบล/แขวง
    //   cityName: address.amphoe, // amphoe = อำเภอ/เขต
    //   countrySubDivisionName: address.province, // province = จังหวัด
    //   postCode: address.zipcode, // zipcode = รหัสไปรษณีย์
    // });
    dispatch(setCitySubDivisionName(address.district));
    dispatch(setCityName(address.amphoe));
    dispatch(setCountrySubDivisionName(address.province));
    dispatch(setPostCode(address.zipcode));

    // ส่งข้อมูลกลับไปยัง ModalEstamp.tsx
    onAddressChange?.(address);
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

  useEffect(() => {
    const coContractStatus = partyRelationshipOptions.find((item) => item.typeCode === contractForm.documentTypeCode);
    if (coContractStatus) {
      setCoContractStatus(coContractStatus.data.find((item) => item.value === contractForm.partyRelationship)?.label || "");
    }
  }, [contractForm.documentTypeCode, contractForm.partyRelationship]);

  useEffect(() => {
    if (B2BformData?.forms?.docsType == "B2C") {
      setPartyType("normal");
    }
  }, [open,B2BformData?.forms?.docsType]);
 
  return (
    <>
      <div className="bg-gray-200 text-theme p-3 mt-6 mb-4 rounded">
        <h3 className="font-semibold">ข้อมูลคู่สัญญา ({coContractStatus})</h3>
      </div>
      <div className="mb-6 px-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">ประเภทของบุคคล</label>
            <Radio.Group
              value={partyType}
              onChange={(e) => setPartyType(e.target.value)}
              className="flex gap-6"
              disabled={true}
            >
              {(B2BformData?.forms == null) && (<Radio value="normal">กรณีบุคคลธรรมดา</Radio>)}
              <Radio value="special">กรณีเป็นนิติบุคคล</Radio>
              <Radio value="normal">กรณีเป็นบุคคลธรรมดา</Radio>
            </Radio.Group>
          </div>
          <div>
            <label className="block mb-2">ประเภทข้อมูลที่อยู่</label>
            <Radio.Group
              value={addressType}
              onChange={(e) => setAddressType(e.target.value)}
              className="flex gap-6"
              disabled={disabled}
            >
              <Radio value="domestic">อยู่ในประเทศไทย</Radio>
              {/* <Radio value="abroad">อยู่ต่างประเทศ</Radio> */}
            </Radio.Group>
          </div>
        </div>

        {partyType === "normal" && (
          <div>
            <label className="block mb-2">เลขประจำตัวผู้เสียภาษีอากร <span className="text-red-500">*</span></label>
            <Input
              placeholder="1409908602589"
              value={contractForm?.taxRegistrationId || ""}
              onChange={handleTaxRegistrationIdChange}
              className="rounded max-w-xs"
              status={`${(genError("taxRegistrationId") && contractForm.taxRegistrationId == "") ? "error" : ""}`}
              disabled={disabled}
            />
            {
              (genError("taxRegistrationId") && contractForm.taxRegistrationId == "") && (
                <div className="text-red-500 text-sm">
                  {genError("taxRegistrationId")}
                </div>
              )
            }
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block mb-2">คำนำหน้าชื่อ <span className="text-red-500">*</span></label>
            <Select
              suffixIcon={<ChevronDown size={20} />}
              className="w-full"
              placeholder="นาย"
              value={contractForm?.partyTitleName || ""}
              onChange={(value: string) => dispatch(setPartyTitleName(value))}
              status={`${(genError("partyTitleName") && contractForm.partyTitleName == "") ? "error" : ""}`}
              disabled={disabled}
            >
              {partyType === "normal" && (
                <>
                  {thaiPrefixes.map((item) => (
                    <Select.Option key={item} value={item}>{item}</Select.Option>
                  ))}
                </>
              )}
              {partyType === "special" && (
                <>
                  {titleLegalEntityList?.map((item) => (
                    <Select.Option key={item.titleCode} value={item.titleNameTh}>{item.titleNameTh}</Select.Option>
                  ))}
                </>
              )}
            </Select>
            {
              (genError("partyTitleName") && contractForm.partyTitleName == "") && (
                <div className="text-red-500 text-sm">
                  {genError("partyTitleName")}
                </div>
              )
            }
          </div>
          <div>
            <label className="block mb-2">ชื่อ <span className="text-red-500">*</span></label>
            <Input
              placeholder="ชื่อ"
              value={contractForm?.partyName || ""}
              onChange={(e) => dispatch(setPartyName(e.target.value))}
              className="rounded"
              status={`${(genError("partyName") && contractForm.partyName == "") ? "error" : ""}`}
              disabled={disabled}
            />
            {
              (genError("partyName") && contractForm.partyName == "") && (
                <div className="text-red-500 text-sm">
                  {genError("partyName")}
                </div>
              )
            }
          </div>
          {/* <div>
            <label className="block mb-2">ชื่อกลาง</label>
            <Input
              placeholder="ชื่อกลาง"
              value={contractForm?.partyMidname || ""}
              onChange={(e) => dispatch(setPartyMidname(e.target.value))}
              className="rounded"
              disabled={addressType === "normal"} // disabled เมื่ออยู่ในประเทศไทย
            />
          </div> */}
          {partyType === "normal" && (<div>
            <label className="block mb-2">นามสกุล</label>
            <Input
              placeholder="นามสกุล"
              value={contractForm?.partySurname || ""}
              onChange={(e) => dispatch(setPartySurname(e.target.value))}
              className="rounded"
              disabled={disabled}
            />
          </div>)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block mb-2">ที่อยู่: ชื่ออาคาร</label>
            <Input
              placeholder="ชื่ออาคาร"
              className="rounded"
              value={contractForm?.buildingName || ""}
              onChange={(e) => dispatch(setBuildingName(e.target.value))}
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block mb-2">ห้องเลขที่</label>
            <Input
              placeholder="ห้องเลขที่"
              value={contractForm?.roomNo || ""}
              onChange={(e) => dispatch(setRoomNo(e.target.value))}
              className="rounded"
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block mb-2">ชั้นที่</label>
            <Input
              placeholder="ชั้นที่"
              className="rounded"
              value={contractForm?.floorNo || ""}
              onChange={(e) => dispatch(setFloorNo(e.target.value))}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block mb-2">หมู่บ้าน</label>
            <Input
              placeholder="หมู่บ้าน"
              className="rounded"
              value={contractForm?.villageName || ""}
              onChange={(e) => dispatch(setVillageName(e.target.value))}
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block mb-2">อาคาร/บ้านเลขที่ <span className="text-red-500">*</span></label>
            <Input
              placeholder="อาคาร/บ้านเลขที่"
              className="rounded"
              value={contractForm?.buildingNumber || ""}
              onChange={(e) => {
                const value = e.target.value;
                const filteredValue = value.replace(/[^0-9\s\-\.\/\(\)]/g, '');
                dispatch(setBuildingNumber(filteredValue))
              }}
              status={`${(genError("buildingNumber") && contractForm.buildingNumber == "") ? "error" : ""}`}
              disabled={disabled}
            />
            {
              (genError("buildingNumber") && contractForm.buildingNumber == "") && (
                <div className="text-red-500 text-sm">
                  {genError("buildingNumber")}
                </div>
              )
            }
          </div>
          <div>
            <label className="block mb-2">หมู่ที่</label>
            <Input
              placeholder="หมู่ที่"
              className="rounded"
              value={contractForm?.moo || ""}
              onChange={(e) => dispatch(setMoo(e.target.value))}
              disabled={disabled || addressType === "abroad"}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block mb-2">ตรอก/ซอย</label>
            <Input
              placeholder="ตรอก/ซอย"
              className="rounded"
              value={contractForm?.soiName || ""}
              onChange={(e) => dispatch(setSoiName(e.target.value))}
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block mb-2">แยก</label>
            <Input
              placeholder="แยก"
              className="rounded"
              value={contractForm?.junctionName || ""}
              onChange={(e) => dispatch(setJunctionName(e.target.value))}
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block mb-2">ถนน</label>
            <Input
              placeholder="ถนน"
              className="rounded"
              value={contractForm?.streetName || ""}
              onChange={(e) => dispatch(setStreetName(e.target.value))}
              disabled={disabled}
            />
          </div>
        </div>

        {addressType === "domestic" ? (
          <InputThaiAddress
            showZipcode={true}
            onAddressChange={handleAddressChange}
            isPropertyAddress={false}
            initialAddress={{
              province: contractForm.countrySubDivisionName,
              amphoe: contractForm.cityName,
              district: contractForm.citySubDivisionName,
              zipcode: contractForm.postCode,
            }}
            errArray={errArray}
            keyError={{province: "countrySubDivisionName", amphoe: "cityName", district: "citySubDivisionName"}}
            disabled={disabled}
          />
        ) : (
          <InputForeignAddress disabled={disabled} />
        )}
      </div>
    </>
  );
};

export default StampPartyDetails;
