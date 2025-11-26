"use client";

import React, { useEffect } from "react";
import { Input, DatePicker, Checkbox } from "antd";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setContractId,
  setContractNo,
  setEffectiveDate,
  setCreationDate,
  setExpireDate,
} from "@/store/slices/contractFormSlice";

interface StampContractDetailsProps {
  errArray? : {key:string, message:string}[]
}

const StampContractDetails: React.FC<StampContractDetailsProps>= ({errArray}) => {
  const dispatch = useAppDispatch();
  const contractForm = useAppSelector((state) => state.contractForm);
  //กำหนดให้ วันที่ทำสัญญา ย้อนหลังได้ 15 วัน และ ล่วงหน้าได้ 30 วัน
  const maxDate = dayjs().add(30, 'day');
  const minDate = dayjs().subtract(15, 'day');

  // ตรวจสอบ error จาก errArray
  const genError = (key: string) => {
    if (errArray) {
      const error = errArray.find((item) => item.key === key);
      if (error) {
        return error.message;
      }
    }
  }

  // Set default value for creationDate when component mounts
  useEffect(() => {
    if (!contractForm.creationDate) {
      const currentDate = dayjs().format("YYYY-MM-DD");
      dispatch(setCreationDate(currentDate));
    }
  }, []); // รันครั้งเดียวเมื่อ component mount

  // Function สำหรับตรวจสอบว่า expireDate ต้องไม่น้อยกว่า effectiveDate
  const isExpireDateDisabled = (date: dayjs.Dayjs) => {
    if (!contractForm.effectiveDate) return false;
    const effectiveDate = dayjs(contractForm.effectiveDate);
    return date.isBefore(effectiveDate, 'day');
  };

  return (
    <>
      <div className="bg-gray-200 text-theme p-3 mb-4 rounded">
        <h3 className="font-semibold">รายละเอียดเกี่ยวกับสัญญา</h3>
      </div>
      <div className="mb-6 px-4 space-y-4">
        {/* <div>
          <label className="block mb-2">
            หมายเลขอ้างอิงตราสารอิเล็กทรอนิกส์ *
          </label>
          <Input
            placeholder="99999999999999"
            value={contractForm?.contractId || ""}
            onChange={(e) => dispatch(setContractId(e.target.value))}
            className="rounded w-full"
          />
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
          {/* <div>
            <label className="block mb-2">สัญญาเลขที่</label>
            <Input
              placeholder="สัญญาเลขที่"
              value={contractForm?.contractNo || ""}
              onChange={(e) => dispatch(setContractNo(e.target.value))}
              className="rounded"
            />
          </div> */}

          {/* <div>
            <label className="block mb-2" >
              วันที่ทำสัญญา <span className="text-red-500">*</span> (ยื่นภายในกำหนดเวลา)
            </label>
            <DatePicker
              value={
                contractForm.creationDate
                  ? dayjs(contractForm.creationDate, "YYYY-MM-DD")
                  : null
              }
              onChange={(date) =>
                dispatch(setCreationDate(date ? date.format("YYYY-MM-DD") : ""))
              }
              className="w-full"
              placeholder="วันที่ทำสัญญา"
              maxDate={maxDate}
              minDate={minDate}
              required
              status={`${(genError("creationDate") && contractForm.creationDate == "") ? "error" : ""}`}
            />
            {
              (genError("creationDate") && contractForm.creationDate == "") && (
                <div className="text-red-500 text-sm">
                  {genError("creationDate")}
                </div>
              )
            }
          </div> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">วัน เดือน ปี ที่เริ่มต้นสัญญา <span className="text-red-500">*</span></label>
            <DatePicker
              value={
                contractForm.effectiveDate
                  ? dayjs(contractForm.effectiveDate, "YYYY-MM-DD")
                  : null
              }
              onChange={(date) =>
                dispatch(
                  setEffectiveDate(date ? date.format("YYYY-MM-DD") : "")
                )
              }
              className="w-full"
              placeholder="วันที่เริ่มต้นสัญญา"
              required
              status={`${(genError("effectiveDate") && contractForm.effectiveDate == "") ? "error" : ""}`}
            />
            {
              (genError("effectiveDate") && contractForm.effectiveDate == "") && (
                <div className="text-red-500 text-sm">
                  {genError("effectiveDate")}
                </div>
              )
            }
          </div>
          <div>
            <label className="block mb-2">วัน เดือน ปี ที่สิ้นสุดสัญญา <span className="text-red-500">*</span></label>
            <DatePicker
              value={
                contractForm.expireDate
                  ? dayjs(contractForm.expireDate, "YYYY-MM-DD")
                  : null
              }
              onChange={(date) =>
                dispatch(setExpireDate(date ? date.format("YYYY-MM-DD") : ""))
              }
              className="w-full"
              placeholder="วันสิ้นสุดสัญญา"
              disabled={contractForm.effectiveDate ? false : true}
              disabledDate={isExpireDateDisabled}
              required
              status={`${(genError("expireDate") && contractForm.expireDate == "") ? "error" : ""}`}
            />
            {
              (genError("expireDate") && contractForm.expireDate == "") && (
                <div className="text-red-500 text-sm">
                  {genError("expireDate")}
                </div>
              )
            }
          </div>
        </div>
        {/* <div>
          <Checkbox>
            ที่อยู่ตามทะเบียนบ้านเป็นที่อยู่ปัจจุบันซึ่งสามารถติดต่อได้
          </Checkbox>
        </div>
        <div>
          <Checkbox>ที่อยู่ปัจจุบัน (กรุณากรอกที่อยู่ปัจจุบัน)</Checkbox>
        </div> */}
      </div>
    </>
  );
};

export default StampContractDetails;