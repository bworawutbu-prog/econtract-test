"use client";

import React, { useState, useEffect } from "react";
import { Checkbox, Input } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
  setKeyMoney,
  setMonthlyRent,
  setPropertyType,
  setRentalMonths,
  setTotalAmount,
} from "../../../../store/slices/contractFormSlice";
import { AttachDetailItem } from "../../../../store/types/contractFormType";

interface MonthlyRentalProps {
  rentalPriceData: AttachDetailItem; // arrayDetail.attType === "2" (ค่าเช่า หรือประมาณการค่าเช่า)
  isMonthlyRental: boolean; // true เมื่อ attActionType2 === "1"
  onAttActionType1Change: (value: string) => void; // callback สำหรับส่งค่า attActionType1 กลับไป
  onAttActionType2Change: (value: string) => void; // callback สำหรับส่งค่า attActionType2 กลับไป
  errArray?: {key:string, message:string}[]
}

const MonthlyRental: React.FC<MonthlyRentalProps> = ({
  rentalPriceData,
  isMonthlyRental,
  onAttActionType1Change,
  onAttActionType2Change,
  errArray
}) => {
  const dispatch = useAppDispatch();
  const contractForm = useAppSelector((state: any) => state.contractForm);

  // State แยกสำหรับ checkbox "ชำระค่าเช่าเป็นรายเดือน" - กำหนด default value จาก rentalPriceData.attActionType2
  const [isMonthlyRentalChecked, setIsMonthlyRentalChecked] = useState(
    true
  );

  // อัพเดท state เมื่อ rentalPriceData.attActionType2 เปลี่ยน
  // useEffect(() => {
  //   setIsMonthlyRentalChecked(rentalPriceData.attActionType2 === "1");
  // }, [rentalPriceData.attActionType2]);

  const handleCheckboxChange = (e: any) => {
    const isChecked = e.target.checked;
    setIsMonthlyRentalChecked(isChecked);

    // อัพเดท propertyType ใน Redux store (แยกจาก OthersProperties)
    dispatch(setPropertyType(isChecked ? "2" : "0"));

    // ส่งค่า attActionType1 และ attActionType2 กลับไป (แทนการ hard code "1")
    onAttActionType1Change(isChecked ? "1" : "0");
    onAttActionType2Change(isChecked ? "1" : "0");
  };

  const genError = (key: string) => {
    if (errArray) {
      const error = errArray.find((item) => item.key === key);
      if (error) {
        return error.message;
      }
    }
  }

  return (
    <div className="monthly-rental-checkbox grid grid-cols-12 gap-2">
      <div className="col-span-12 lg:col-span-3">
        <Checkbox
          // ใช้ state แยกแทน contractForm.propertyType
          checked={isMonthlyRentalChecked}
          onChange={handleCheckboxChange}
          className="text-gray-700"
        >
          ชำระค่าเช่าเป็นรายเดือน
        </Checkbox>
      </div>

      {/* แสดงรายละเอียดเมื่อ checkbox ถูกเลือก */}
      {isMonthlyRentalChecked && (
        <div className="monthly-rental-details col-span-12 lg:col-span-9">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block mb-2 text-sm">จำนวนเดือน <span className="text-red-500">*</span></label>
              <Input
                placeholder="10"
                className="rounded"
                // ใช้ข้อมูลจาก attNumber1 (rentalMonths)
                value={
                  rentalPriceData.attNumber1 || contractForm.rentalMonths || ""
                }
                onChange={(e) =>
                  dispatch(setRentalMonths(Number(e.target.value) || 0))
                }
                status={`${(genError("attNumber1") && (rentalPriceData.attNumber1 == 0 || rentalPriceData.attNumber1 == undefined)) ? "error" : ""}`}
              />
              {
                (genError("attNumber1") && (rentalPriceData.attNumber1 == 0 || rentalPriceData.attNumber1 == undefined)) && (
                  <div className="text-red-500 text-sm">
                    {genError("attNumber1")}
                  </div>
                )
              }
            </div>
            <div>
              <label className="block mb-2 text-sm">ค่าเช่าเดือนละ <span className="text-red-500">*</span></label>
              <Input
                placeholder="2,000.00"
                className="rounded"
                // ใช้ข้อมูลจาก attAmount1 (monthlyRent)
                value={
                  rentalPriceData.attAmount1 || contractForm.monthlyRent || ""
                }
                onChange={(e) =>
                  dispatch(setMonthlyRent(Number(e.target.value) || 0))
                }
                status={`${(genError("attAmount1") && (rentalPriceData.attAmount1 == 0 || rentalPriceData.attAmount1 == undefined)) ? "error" : ""}`}
              />
              {
                (genError("attAmount1") && (rentalPriceData.attAmount1 == 0 || rentalPriceData.attAmount1 == undefined)) && (
                  <div className="text-red-500 text-sm">
                    {genError("attAmount1")}
                  </div>
                )
              }
            </div>
            <div>
              <label className="block mb-2 text-sm">เงินกินเปล่า</label>
              <Input
                placeholder="0.00"
                className="rounded"
                // ใช้ข้อมูลจาก attAmount2 (keyMoney)
                value={
                  rentalPriceData.attAmount2 || contractForm.keyMoney || ""
                }
                onChange={(e) =>
                  dispatch(setKeyMoney(Number(e.target.value) || 0))
                }
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">รวมเป็นเงิน</label>
              <Input
                className="rounded"
                readOnly
                disabled
                // ใช้ข้อมูลจาก attAmount3 (totalAmount)
                value={
                  rentalPriceData.attAmount3 || contractForm.totalAmount || ""
                }
                onChange={(e) =>
                  dispatch(setTotalAmount(Number(e.target.value) || 0))
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyRental;
