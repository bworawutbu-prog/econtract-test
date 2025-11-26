import { useAppDispatch, useAppSelector } from "@/store";
import { setAmount1, setAmount2, setAmount3, setInstAmount, setNumber1, setTotalAmount } from "@/store/slices/contractFormSlice";
import { Input } from "antd"

interface AmountDocType3Props {
    errArray?: { key: string, message: string }[]
}

export const AmountDocType3 = ({ errArray }: AmountDocType3Props) => {
    const dispatch = useAppDispatch();
    const contractForm = useAppSelector((state) => state.contractForm);

    const onChangeAmount1 = (e: any) => {
        dispatch(setAmount1(Number(e.target.value)));
        dispatch(setInstAmount(Number(e.target.value) + contractForm.amount2));
    }
    const onChangeAmount2 = (e: any) => {
        dispatch(setAmount2(Number(e.target.value)));
        dispatch(setInstAmount(Number(e.target.value) + contractForm.amount1));
    }

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
            <div>
                <h4 className="mb-4">ราคาทรัพย์สินที่เช่าซื้อ <span className="text-red-500">*</span></h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 m-4">
                    <div className="gap-2 col-span-2">
                        <label className="block mb-1 text-sm font-medium text-gray-700">ราคาทุนทรัพย์/ราคาเงินสด (รวมเงินชำระล่วงหน้า แต่ไม่รวมภาษีมูลค่าเพิ่ม) <span className="text-red-500">*</span></label>
                        <Input
                            type="number"
                            min={0}
                            value={contractForm.amount1}
                            onChange={(e) => onChangeAmount1(e)}
                            status={`${(genError("amount1") && contractForm.amount1 == 0) ? "error" : ""}`}
                        />
                        {
                            (genError("amount1") && contractForm.amount1 == 0) && (
                                <div className="text-red-500 text-sm">
                                    {genError("amount1")}
                                </div>
                            )
                        }
                    </div>
                    <div className="gap-2">
                        <label className="block mb-1 text-sm font-medium text-gray-700">ดอกผลตามสัญญาเช่าซื้อ (ไม่รวมภาษีมูลค่าเพิ่ม) <span className="text-red-500">*</span></label>
                        <Input
                            type="number"
                            min={0}
                            value={contractForm.amount2}
                            onChange={(e) => onChangeAmount2(e)}
                            status={`${(genError("amount2") && contractForm.amount2 == 0) ? "error" : ""}`}
                        />
                        {
                            (genError("amount2") && contractForm.amount2 == 0) && (
                                <div className="text-red-500 text-sm">
                                    {genError("amount2")}
                                </div>
                            )
                        }
                    </div>
                    <div className="gap-2">
                        <label className="block mb-1 text-sm font-medium text-gray-700">ค่างวดเช่าซื้อ (รวมภาษีมูลค่าเพิ่ม) <span className="text-red-500">*</span></label>
                        <Input type="number" min={0} value={contractForm.amount3} onChange={(e) => dispatch(setAmount3(Number(e.target.value)))}
                            status={`${(genError("amount3") && contractForm.amount3 == 0) ? "error" : ""}`}
                        />
                        {
                            (genError("amount3") && contractForm.amount3 == 0) && (
                                <div className="text-red-500 text-sm">
                                    {genError("amount3")}
                                </div>
                            )
                        }
                    </div>
                    <div className="gap-2">
                        <label className="block mb-1 text-sm font-medium text-gray-700">จำนวนงวด <span className="text-red-500">*</span></label>
                        <Input type="number" min={0} value={contractForm.number1} onChange={(e) => dispatch(setNumber1(Number(e.target.value)))}
                            status={`${(genError("number1") && contractForm.number1 == 0) ? "error" : ""}`}
                        />
                        {
                            (genError("number1") && contractForm.number1 == 0) && (
                                <div className="text-red-500 text-sm">
                                    {genError("number1")}
                                </div>
                            )
                        }
                    </div>
                    <div className="gap-2">
                        <label className="block mb-1 text-sm font-medium text-gray-700">มูลค่าในตราสาร (มูลค่าสัญญา ไม่รวมภาษีมูลค่าเพิ่ม)</label>
                        <Input type="number" min={0} readOnly disabled value={contractForm.amount1 + contractForm.amount2} />
                    </div>
                </div>
            </div>
        </>
    )
}