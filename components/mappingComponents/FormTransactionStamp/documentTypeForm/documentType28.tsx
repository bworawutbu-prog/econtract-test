import { Input, Select } from "antd";
import { useState } from "react";

const DocumentType28 = () => {
    const [selectedUnit, setSelectedUnit] = useState("1");
    const [customUnit, setCustomUnit] = useState("");

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 m-4">
            <div className="gap-2">
                <h4 className="font-semibold">ประเภทยานพาหนะ <span className="text-red-500">*</span></h4>
                <Input type="text" />
            </div>
            <div className="gap-2">
                <h4 className="font-semibold">จำนวนยานพาหนะ <span className="text-red-500">*</span></h4>
                <Input type="number" />
            </div>
            <div className="gap-2">
                <h4 className="font-semibold">หน่วยของยานพาหนะ <span className="text-red-500">*</span></h4>
                <Select 
                    options={[{ label: "คัน", value: "1" }, { label: "ลำ", value: "2" }, { label: "อื่นๆ", value: "3" }]}
                    value={selectedUnit}
                    onChange={setSelectedUnit}
                    className="w-full"
                />
                {selectedUnit === "3" && (
                    <div className="flex flex-row items-center gap-2 mt-2">
                        <span className="w-fit">หน่วยอื่นๆ</span>
                        <Input 
                            type="text" 
                            placeholder="ระบุหน่วยอื่นๆ"
                            value={customUnit}
                            onChange={(e) => setCustomUnit(e.target.value)}
                            className="w-full"
                        />
                    </div>
                )}
            </div>
            <div className="gap-2">
                <h4 className="font-semibold">จำนวนเงินที่ได้รับชำระ <span className="text-red-500">*</span></h4>
                <Input type="number" />
            </div>
        </div>
    )
}

export default DocumentType28;