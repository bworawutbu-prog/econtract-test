import { useAppDispatch, useAppSelector } from "@/store";
import { setActionType, setAttachDetail1 } from "@/store/slices/contractFormSlice";
import { conditionForPowerOfAttorneyList } from "@/store/types/othersPropertiesType";
import { Input, Select } from "antd"

interface DocumentType7Props {
    errArray?: {key:string, message:string}[]
    genError: (key: string) => string | undefined;
}

export const DocumentType7 = ({ errArray, genError }: DocumentType7Props) => {

    const dispatch = useAppDispatch();
    const contractForm = useAppSelector((state) => state.contractForm);

    

  return (
    <>
            <div className="grid grid-cols-1 gap-4 m-4">
                <div className="gap-2">
                    รายละเอียดการมอบอำนาจ <span className="text-red-500">*</span>
                    <Input 
                      type="text"  
                      value={contractForm.attachDetail1} 
                      onChange={(e) => dispatch(setAttachDetail1(e.target.value))}
                      status={`${(genError("detail7") && contractForm.attachDetail1 == "") ? "error" : ""}`}
                    />
                    {
                      (genError("detail7") && contractForm.attachDetail1 == "") && (
                        <div className="text-red-500 text-sm">
                          {genError("detail7")}
                        </div>
                      )
                    }
                </div>
                <div className="gap-2">
                    เงื่อนไขการมอบอำนาจ <span className="text-red-500">*</span>
                    <Select 
                      options={conditionForPowerOfAttorneyList} 
                      defaultValue={conditionForPowerOfAttorneyList[0].value}
                      onChange={(e) => dispatch(setActionType(e))}
                      className="w-full"
                      status={`${(genError("actionType7") && contractForm.actionType == "") ? "error" : ""}`}
                    />
                    {
                      (genError("actionType7") && contractForm.actionType == "") && (
                        <div className="text-red-500 text-sm">
                          {genError("actionType7")}
                        </div>
                      )
                    }
                </div>
            </div>
          </>
  )
}