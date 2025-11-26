import { conditionForSecurityList } from "@/store/types/othersPropertiesType"
import { Input, Select } from "antd"
import { useAppDispatch, useAppSelector } from "@/store"
import { setActionType,  setInstAmount,  setRelateTaxRegistrationId,  setRelateTaxRegistrationName,  setTotalAmount } from "@/store/slices/contractFormSlice"

interface DocumentType17Props {
    errArray?: {key:string, message:string}[]
    genError: (key: string) => string | undefined;
}

export const DocumentType17 = ({ errArray, genError }: DocumentType17Props) => {
    const dispatch = useAppDispatch();
    const contractForm = useAppSelector((state) => state.contractForm);
    
    // console.log("contractForm.actionType",contractForm.actionType);
  return (
    <div className="grid grid-cols-1 gap-4 m-4">
        <div className="gap-2">
            จำนวนเงินค้ำประกัน {contractForm.actionType !== "1" && (<span className="text-red-500">*</span>)}
            <Input 
                type="number"  
                value={contractForm.instAmount} 
                onChange={(e) => dispatch(setInstAmount(Number(e.target.value)))} 
                status={
                    ((contractForm.actionType === "2" && contractForm.instAmount > 1000) ||(contractForm.actionType === "2" && contractForm.instAmount <= 0)) ? "error" : 
                    ((contractForm.actionType === "3" && contractForm.instAmount > 10000) || (contractForm.actionType === "3" && contractForm.instAmount < 1000)) ? "error" : 
                    (contractForm.actionType === "4" && contractForm.instAmount < 10000) ? "error" : ""
                }
            />
            {
                (contractForm.actionType === "2" && contractForm.instAmount <= 0) && (
                    <div className="text-red-500 text-sm">
                        จำนวนเงินค้ำประกันต้องมีค่ามากกว่า 0 บาท
                    </div>
                ) || 
                (contractForm.actionType === "2" && contractForm.instAmount > 1000) && (
                    <div className="text-red-500 text-sm">
                        จำนวนเงินค้ำประกันต้องมีค่าไม่เกิน 1,000 บาท
                    </div>
                ) ||
                ((contractForm.actionType === "3" && contractForm.instAmount > 10000) || (contractForm.actionType === "3" && contractForm.instAmount < 1000)) && (
                    <div className="text-red-500 text-sm">
                        จำนวนเงินค้ำประกันต้องมีค่าระหว่าง 1,000 บาท กับ 10,000 บาท
                    </div>
                ) ||
                 (contractForm.actionType === "4" && contractForm.instAmount < 10000) && (
                    <div className="text-red-500 text-sm">
                        จำนวนเงินค้ำประกันต้องมีค่ามากกว่า 10,000 บาท
                    </div>
                )
            }
        </div>
        <div className="gap-2">
            เงื่อนไขการค้ำประกัน <span className="text-red-500">*</span>
            <Select 
                options={conditionForSecurityList} 
                value={contractForm.actionType}
                defaultValue={conditionForSecurityList[0]?.value}
                onChange={(e) => dispatch(setActionType(e))}
                className="w-full"
                status={`${(genError("actionType17") && contractForm.actionType == "") ? "error" : ""}`}
            />
            {
                (genError("actionType17") && contractForm.actionType == "") && (
                    <div className="text-red-500 text-sm">
                        {genError("actionType17")}
                    </div>
                )
            }
        </div>
        <div className="gap-2">
            เลขประจำตัวผู้เสียภาษีอากรของเจ้าหนี้/ผู้ว่าจ้าง <span className="text-red-500">*</span>
            <Input 
                type="text" 
                value={contractForm.relateTaxRegistrationId} 
                onChange={(e) => dispatch(setRelateTaxRegistrationId(e.target.value))}
                status={`${ (genError("relateTaxRegistrationId") && contractForm.relateTaxRegistrationId == "") || 
                            (genError("relateTaxRegistrationIdLength") && contractForm.relateTaxRegistrationId.length != 13) ? "error" : ""}`}
                maxLength={13}
            />
            {
                (genError("relateTaxRegistrationId") && contractForm.relateTaxRegistrationId == "") && (
                    <div className="text-red-500 text-sm">
                        {genError("relateTaxRegistrationId")}
                    </div>
                ) ||
                (genError("relateTaxRegistrationIdLength") && contractForm.relateTaxRegistrationId.length != 13) && (
                    <div className="text-red-500 text-sm">
                        {genError("relateTaxRegistrationIdLength")}
                    </div>
                )
            }
        </div>
        <div className="gap-2">
            ชื่อเจ้าหนี้/ผู้ว่าจ้าง <span className="text-red-500">*</span>
            <Input 
                type="text" 
                value={contractForm.relateTaxRegistrationName} 
                onChange={(e) => dispatch(setRelateTaxRegistrationName(e.target.value))}
                status={`${(genError("relateTaxRegistrationName") && contractForm.relateTaxRegistrationName == "") ? "error" : ""}`}
            />
            {
                (genError("relateTaxRegistrationName") && contractForm.relateTaxRegistrationName == "") && (
                    <div className="text-red-500 text-sm">
                        {genError("relateTaxRegistrationName")}
                    </div>
                )
            }
        </div>
        
    </div>
  )
}
