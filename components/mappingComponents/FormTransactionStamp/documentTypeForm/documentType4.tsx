import { useAppDispatch, useAppSelector } from "@/store";
import { setAmount1, setAttachDetail1, setInstAmount, setNumber1, setTotalAmount } from "@/store/slices/contractFormSlice";
import { Input } from "antd"

interface DocumentType4Props {
    errArray?: {key:string, message:string}[]
    genError: (key: string) => string | undefined;
}

export const DocumentType4 = ({ errArray, genError }: DocumentType4Props) => {
    const dispatch = useAppDispatch();
    const contractForm = useAppSelector((state) => state.contractForm);
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 m-4">
            <div className="gap-2">
                งานที่รับจ้าง <span className="text-red-500">*</span>
                <Input 
                    type="text"  
                    value={contractForm.attachDetail1} 
                    onChange={(e) => dispatch(setAttachDetail1(e.target.value))}
                    status={(genError("detail4") && contractForm.attachDetail1 == "") ? "error" : ""}
                />
                {(genError("detail4") && contractForm.attachDetail1 == "") && (
                    <div className="text-red-500 text-sm">
                        {genError("detail4")}
                    </div>
                )}
            </div>
            <div className="gap-2">
                จำนวนงวด <span className="text-red-500">*</span>
                <Input 
                    type="number"  
                    value={contractForm.number1} 
                    onChange={(e) => dispatch(setNumber1(Number(e.target.value)))}
                    status={(genError("number") && contractForm.number1 == 0) ? "error" : ""}
                />
                {(genError("number") && contractForm.number1 == 0) && (
                    <div className="text-red-500 text-sm">
                        {genError("number")}
                    </div>
                )}
            </div>
                <div className="gap-2">
                มูลค่าในตราสาร (มูลค่าสัญญา ไม่รวมภาษีมูลค่าเพิ่ม) <span className="text-red-500">*</span>
                <Input 
                    type="number"  
                    value={contractForm.instAmount} 
                    onChange={(e) => dispatch(setInstAmount(Number(e.target.value)))}
                    status={(genError("totalAmount") && contractForm.totalAmount == 0) ? "error" : ""}
                />
                {(genError("totalAmount") && contractForm.totalAmount == 0) && (
                    <div className="text-red-500 text-sm">
                        {genError("totalAmount")}
                    </div>
                )}
            </div>
                <div className="gap-2">
                จำนวนเงินค้ำประกันตามสัญญา
                <Input type="number"  value={contractForm.amount1} onChange={(e) => dispatch(setAmount1(Number(e.target.value)))}/>
            </div>
        </div>
    )
}
