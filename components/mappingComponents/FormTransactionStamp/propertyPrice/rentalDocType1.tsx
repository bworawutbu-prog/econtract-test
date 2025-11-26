import { useAppDispatch, useAppSelector } from "@/store";
import { setArrayDetail, setDetailEstimateRent, setEstimateRent, setKeyMoney, setKeyMoneyEstimate, setKeyMoneyRentCost, setKeyMoneyYearly, setMonthlyRent, setRentalMonths, setRentalYearly, setRentCost, setYearlyRent } from "@/store/slices/contractFormSlice";
import { rentalEstimatePropertyTypeList } from "@/store/types/othersPropertiesType";
import { Checkbox, Input, InputNumber } from "antd";
import { useState } from "react";

interface RentalDocType1Props {
    errArray?: { key: string; message: string }[];
}

const RentalDocType1 = ({ errArray }: RentalDocType1Props) => {
    const dispatch = useAppDispatch();
    const contractForm = useAppSelector((state) => state.contractForm);

    const [isRentalEstimatePropertyChecked, setIsRentalEstimatePropertyChecked] = useState<string[]>([]);

    const handleCheckboxChange = (e: any) => {
        let newCheckedState: string[];
        if (e.target.checked) {
          newCheckedState = [...isRentalEstimatePropertyChecked, e.target.value].sort((a, b) => a - b);
        } else {
          newCheckedState = isRentalEstimatePropertyChecked.filter((item) => item !== e.target.value).sort();
        }
        
        setIsRentalEstimatePropertyChecked(newCheckedState);

        // console.log("newCheckedState =>", newCheckedState);

        const newArrayDetail = newCheckedState?.map((item) => ({
            attType: "2",
            attActionType1: item,
        }));

        // console.log("newArrayDetail =>", newArrayDetail);

        // รวมกับ arrayDetail เดิมและลบตัวซ้ำ
        const existingArrayDetail = contractForm.arrayDetail.filter((item) => item.attType == "1");
        // console.log("existingArrayDetail =>", existingArrayDetail);
        const mergedArrayDetail = [...existingArrayDetail, ...newArrayDetail];
        // console.log("mergedArrayDetail =>", mergedArrayDetail);
        // ลบตัวซ้ำโดยใช้ attType และ attActionType1 เป็นตัวกำหนด
        const uniqueArrayDetail = mergedArrayDetail.filter((item, index, self) => 
            index === self.findIndex(t => t.attType === item.attType && t.attActionType1 === item.attActionType1)
        );
        // console.log("uniqueArrayDetail =>", uniqueArrayDetail);

        dispatch(setArrayDetail(uniqueArrayDetail));
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
        <div>
            {
                rentalEstimatePropertyTypeList?.map((item) => (
                    <div key={item.value} className="mb-4">
                        <div className="flex items-center gap-4 mb-4">
                            <Checkbox 
                                value={item.value}
                                onChange={handleCheckboxChange}
                                // checked={isRentalEstimatePropertyChecked.includes(item.value)}
                                checked={isRentalEstimatePropertyChecked.includes(item.value)}
                                className="text-gray-700"
                            >
                                {item.label}
                            </Checkbox>
                        </div>
                        <div className="gap-4">
                            {isRentalEstimatePropertyChecked.includes(item.value) && item.value === "1" && (
                                <div className="monthly-rental-details col-span-12 lg:col-span-9">
                                    <div className="grid grid-cols-4 gap-4">
                                        <div>
                                            <label className="block mb-2 text-sm">จำนวนเดือน <span className="text-red-500">*</span></label>
                                            <InputNumber
                                                value={contractForm.rentalMonths}
                                                min={0}
                                                onChange={(e) => dispatch(setRentalMonths(Number(e) || 0))}
                                                className="text-gray-700 w-full"
                                                status={`${(genError("rentalMonths") && contractForm.rentalMonths == 0) ? "error" : ""}`}
                                            />
                                            {
                                                (genError("rentalMonths") && contractForm.rentalMonths == 0) && (
                                                    <div className="text-red-500 text-sm">
                                                        {genError("rentalMonths")}
                                                    </div>
                                                )
                                            }
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm">ค่าเช่าเดือนละ <span className="text-red-500">*</span></label>
                                            <InputNumber
                                                value={contractForm.monthlyRent}
                                                min={0}
                                                onChange={(e) => dispatch(setMonthlyRent(Number(e) || 0))}
                                                className="text-gray-700 w-full"
                                                status={`${(genError("monthlyRent") && contractForm.monthlyRent == 0) ? "error" : ""}`}
                                            />
                                            {
                                                (genError("monthlyRent") && contractForm.monthlyRent == 0) && (
                                                    <div className="text-red-500 text-sm">
                                                        {genError("monthlyRent")}
                                                    </div>
                                                )
                                            }
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm">เงินกินเปล่า</label>
                                            <InputNumber
                                                min={0}
                                                value={contractForm.keyMoney}
                                                onChange={(e) => dispatch(setKeyMoney(Number(e) || 0))}
                                                className="text-gray-700 w-full"
                                            />
                                        </div>
                                        <div> 
                                            <label className="block mb-2 text-sm">รวมเป็นเงิน</label>
                                            <InputNumber
                                                value={contractForm.monthlyRent * contractForm.rentalMonths + contractForm.keyMoney}
                                                className="text-gray-700 w-full"
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {isRentalEstimatePropertyChecked.includes(item.value) && item.value === "2" && (
                                <div className="monthly-rental-details col-span-12 lg:col-span-9">
                                    <div className="grid grid-cols-4 gap-4">
                                        <div>
                                            <label className="block mb-2 text-sm">จำนวนปี <span className="text-red-500">*</span></label>
                                            <InputNumber
                                                value={contractForm.rentalYearly}
                                                min={0}
                                                onChange={(e) => dispatch(setRentalYearly(Number(e) || 0))}
                                                className="text-gray-700 w-full"
                                                status={`${(genError("rentalYearly") && contractForm.rentalYearly == 0) ? "error" : ""}`}
                                            />
                                            {
                                                (genError("rentalYearly") && contractForm.rentalYearly == 0) && (
                                                    <div className="text-red-500 text-sm">
                                                        {genError("rentalYearly")}
                                                    </div>
                                                )
                                            }
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm">ค่าเช่าปีละ <span className="text-red-500">*</span></label>
                                            <InputNumber
                                                value={contractForm.yearlyRent}
                                                min={0}
                                                onChange={(e) => dispatch(setYearlyRent(Number(e) || 0))}
                                                className="text-gray-700 w-full"
                                                status={`${(genError("yearlyRent") && contractForm.yearlyRent == 0) ? "error" : ""}`}
                                            />
                                            {
                                                (genError("yearlyRent") && contractForm.yearlyRent == 0) && (
                                                    <div className="text-red-500 text-sm">
                                                        {genError("yearlyRent")}
                                                    </div>
                                                )
                                            }
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm">เงินกินเปล่า</label>
                                            <InputNumber
                                                value={contractForm.keyMoneyYearly}
                                                min={0}
                                                onChange={(e) => dispatch(setKeyMoneyYearly(Number(e) || 0))}
                                                className="text-gray-700 w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm">รวมเป็นเงิน</label>
                                            <InputNumber
                                                value={contractForm.yearlyRent * contractForm.rentalYearly + contractForm.keyMoneyYearly}
                                                className="text-gray-700 w-full"
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {isRentalEstimatePropertyChecked.includes(item.value) && item.value === "3" && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    <div className="col-span-3">
                                        <label className="block mb-2 text-sm">รายละเอียดการประมาณการ</label>
                                        <Input
                                            value={contractForm.detailEstimateRent}
                                            onChange={(e) => dispatch(setDetailEstimateRent(e.target.value))}
                                            className="text-gray-700 w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm">ประมาณการค่าเช่าผันแปร <span className="text-red-500">*</span></label>
                                        <InputNumber
                                            value={contractForm.estimateRent}
                                            min={0}
                                            onChange={(e) => dispatch(setEstimateRent(Number(e) || 0))}
                                            className="text-gray-700 w-full"
                                            status={`${(genError("estimateRent") && contractForm.estimateRent == 0) ? "error" : ""}`}
                                        />
                                        {
                                            (genError("estimateRent") && contractForm.estimateRent == 0) && (
                                                <div className="text-red-500 text-sm">
                                                    {genError("estimateRent")}
                                                </div>
                                            )
                                        }
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm">เงินกินเปล่า</label>
                                        <InputNumber
                                            value={contractForm.keyMoneyEstimate}
                                            min={0}
                                            onChange={(e) => dispatch(setKeyMoneyEstimate(Number(e) || 0))}
                                            className="text-gray-700 w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm">รวมเป็นเงิน</label>
                                        <InputNumber
                                            value={contractForm.estimateRent + contractForm.keyMoneyEstimate}
                                            className="text-gray-700 w-full"
                                            readOnly
                                        />
                                    </div>
                                </div>
                            )}
                            {isRentalEstimatePropertyChecked.includes(item.value) && item.value === "4" && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block mb-2 text-sm">ค่าเช่าตลอดอายุสัญญาเช่า <span className="text-red-500">*</span></label>
                                        <InputNumber
                                            value={contractForm.rentCost}
                                            min={0}
                                            onChange={(e) => dispatch(setRentCost(Number(e) || 0))}
                                            className="text-gray-700 w-full"
                                            status={`${(genError("rentCost") && contractForm.rentCost == 0) ? "error" : ""}`}
                                        />
                                        {
                                            (genError("rentCost") && contractForm.rentCost == 0) && (
                                                <div className="text-red-500 text-sm">
                                                    {genError("rentCost")}
                                                </div>
                                            )
                                        }
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm">เงินกินเปล่า</label>
                                        <InputNumber
                                            value={contractForm.keyMoneyRentCost}
                                            min={0}
                                            onChange={(e) => dispatch(setKeyMoneyRentCost(Number(e) || 0))}
                                            className="text-gray-700 w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm">รวมเป็นเงิน</label>
                                        <InputNumber
                                            value={contractForm.rentCost + contractForm.keyMoneyRentCost}
                                            className="text-gray-700 w-full"
                                            readOnly
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            }
            {
                (genError("arrayDetail2") && (
                    <div className="text-red-500 text-sm">
                        {genError("arrayDetail2")}
                    </div>
                ))
            }
        </div>
    )
}

export default RentalDocType1;