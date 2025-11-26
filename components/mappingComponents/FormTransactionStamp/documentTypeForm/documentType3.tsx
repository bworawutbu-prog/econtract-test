import { Checkbox, Input, Select } from "antd"
import InputThaiAddress from "../inputThaiAddress"
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { buildingPropertyTypeList, landPropertyTypeList, movablePropertyTypeList, RentPropertyTypeList3 } from "@/store/types/othersPropertiesType";
import { 
    setBuildingAmphoe, setBuildingBuildingNumber, setBuildingDistrict, setBuildingPropertyType, setBuildingPropertyTypeOther, setBuildingProvince, 
    setLandAmphoe, setLandBuildingNumber, setLandDistrict, setLandNumber1, setLandPropertyType, setLandPropertyTypeOther, setLandProvince, 
    setOtherProvince, setOtherDistrict,  setOtherAmphoe, setOtherName, setOtherBuildingNumber, 
    setNewCarBrand, setNewCarModel, setNewCarRegistrationNumber, setNewCarEngineNumber, setNewCarFrameNumber, setNewCarColor, 
    setOldCarBrand, setOldCarModel, setOldCarRegistrationNumber, setOldCarEngineNumber, setOldCarFrameNumber, setOldCarColor, 
    setNewBicycleBrand, setNewBicycleModel, setNewBicycleRegistrationNumber, setNewBicycleEngineNumber, setNewBicycleFrameNumber, setNewBicycleColor, 
    setOldBicycleBrand, setOldBicycleModel, setOldBicycleRegistrationNumber, setOldBicycleEngineNumber, setOldBicycleFrameNumber, setOldBicycleColor, 
    setOtherMovablePropertyName, setOtherMovablePropertyType, setOtherMovableBrand, setOtherMovableSerialNumber, setOtherMovableModel, setOtherMovableOther, 
    setActionType,
    setArrayDetail
} from "@/store/slices/contractFormSlice";
import { AddressData } from "@/store/thaiAddressData";


interface DocumentType3Props {
    errArray?: {key:string, message:string}[]
    genError: (key: string) => string | undefined;
}

export const DocumentType3 = ({ errArray, genError} : DocumentType3Props) => {

    const dispatch = useAppDispatch();
    const contractForm = useAppSelector((state) => state.contractForm);
    const [isOtherPropertyChecked, setIsOtherPropertyChecked] = useState<string[]>([]);
    const [selectValue, setSelectValue] = useState<string>("1");


    const handleSelectChange = (e: any) => {
        setSelectValue(e);
        dispatch(setActionType(e));
        setIsOtherPropertyChecked([]);
        dispatch(setArrayDetail([]));
    }

    const handleLandAddressChange = (address: AddressData) => {
        dispatch(setLandProvince(address.province));
        dispatch(setLandAmphoe(address.amphoe));
        dispatch(setLandDistrict(address.district));
    }

    const handleBuildingAddressChange = (address: AddressData) => {
        dispatch(setBuildingProvince(address.province));
        dispatch(setBuildingAmphoe(address.amphoe));
        dispatch(setBuildingDistrict(address.district));
    }

    const handleOtherAddressChange = (address: AddressData) => {
        dispatch(setOtherProvince(address.province));
        dispatch(setOtherAmphoe(address.amphoe));
        dispatch(setOtherDistrict(address.district));
    }

    const handleCheckboxChange = (e: any) => {
        let newCheckedState: string[];
        if (e.target.checked) {
          newCheckedState = [...isOtherPropertyChecked, e.target.value].sort((a, b) => a - b);
        } else {
          newCheckedState = isOtherPropertyChecked.filter((item) => item !== e.target.value).sort();
        }
        setIsOtherPropertyChecked(newCheckedState);
        const arrayDetail = newCheckedState?.map((item) => ({
            attType: "1",
            attActionType1: item,
        }));
        dispatch(setArrayDetail(arrayDetail));
      };

    return (
        <>
            <div>
              <h4 className="mb-4">ประเภททรัพสินที่เช่าซื้อ <span className="text-red-500">*</span></h4>
            </div>
            <div className="gap-4">
                <Select 
                className="w-full" 
                onChange={(e) => handleSelectChange(e)}
                defaultValue="1"
                value={selectValue}
                options={[
                    {
                    label: "อสังหาริมทรัพย์",
                    value: "1",
                    },
                    {
                    label: "สังหาริมทรัพย์",
                    value: "2",
                    },
                    ]}
                />
                {selectValue === "1" &&   
                <div className="gap-4">
                    <h4 className="font-semibold my-4">รายละเอียดทรัพย์สินที่เช่าซื้อ <span className="text-red-500">*</span></h4>
                    <div className="gap-4">
                    {RentPropertyTypeList3?.map((item) => (
                        <div key={item.value} className="col-span-12 gap-2">
                        <div className="flex items-center gap-2 mb-4">
                            <Checkbox  
                            type="checkbox" 
                            value={item.value}
                            onChange={handleCheckboxChange}
                            checked={isOtherPropertyChecked.includes(item.value)}
                            className={"text-gray-700"}
                            />
                            {item.label}
                        </div>
                        <div>
                        {isOtherPropertyChecked.includes(item.value) && item.value === "1" && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 m-4">
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">ประเภทของที่ดิน <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        options={landPropertyTypeList}
                                        // onChange={(e) => handleSelectChange(e)}
                                        defaultValue="1"
                                        // value={selectValue}
                                        value={contractForm.landPropertyType || ""}
                                        onChange={(e) => dispatch(setLandPropertyType(e))}
                                        className="w-full"
                                        status={`${(genError("landPropertyType") && contractForm.landPropertyType == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("landPropertyType") && contractForm.landPropertyType == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("landPropertyType")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">ประเภทเอกสารสิทธิ์อื่นๆ
                                    </label>
                                    <Input
                                        placeholder="ประเภทเอกสารสิทธิ์อื่นๆ"
                                        value={contractForm.landPropertyTypeOther || ""}
                                        onChange={(e) => dispatch(setLandPropertyTypeOther(e.target.value))}
                                        disabled={contractForm.landPropertyType !== "6"}
                                    />
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">เลขที่ <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        placeholder="กรอกเลขที่"
                                        value={contractForm.landBuildingNumber || ""}
                                        onChange={(e) => {
                                            // อนุญาตเฉพาะตัวเลขและอักษรพิเศษ
                                            const value = e.target.value;
                                            const filteredValue = value.replace(/[^0-9\s\-\.\/\(\)]/g, '');
                                            dispatch(setLandBuildingNumber(filteredValue));
                                        }}
                                        status={`${(genError("landBuildingNumber") && contractForm.landBuildingNumber == "") ? "error" : ""}`}
                                        
                                    />
                                    {
                                        (genError("landBuildingNumber") && contractForm.landBuildingNumber == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("landBuildingNumber")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">ที่ดินเลขที่ <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        placeholder="กรอกที่ดินเลขที่"
                                        value={contractForm.landNumber1 || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const filteredValue = value.replace(/[^0-9\s\-\.\/\(\)]/g, '');
                                            dispatch(setLandNumber1(filteredValue))
                                        }}
                                        status={`${(genError("landNumber1") && contractForm.landNumber1 == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("landNumber1") && contractForm.landNumber1 == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("landNumber1")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2 lg:col-span-2">
                                <InputThaiAddress 
                                    showZipcode={false} 
                                    onAddressChange={handleLandAddressChange}
                                    isPropertyAddress={true}
                                    initialAddress={{
                                        province: contractForm.landProvince || "",
                                        amphoe: contractForm.landAmphoe || "",
                                        district: contractForm.landDistrict || "",
                                        zipcode: "",
                                    }}
                                    errArray={errArray}
                                    keyError={{province: "landProvince", amphoe: "landAmphoe", district: "landDistrict"}}
                                    />
                                </div>
                            </div>
                        )}
                        {isOtherPropertyChecked.includes(item.value) && item.value === "2" && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 m-4">
                            <div className="gap-2">
                                <label className="block mb-1 text-sm font-medium text-gray-700">ประเภทของโรงเรือน <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    options={buildingPropertyTypeList}
                                    defaultValue="1"
                                    value={contractForm.buildingPropertyType || ""}
                                    onChange={(e) => dispatch(setBuildingPropertyType(e))}
                                    className="w-full"
                                    status={`${(genError("buildingPropertyType") && contractForm.buildingPropertyType == "") ? "error" : ""}`}
                                />
                                {
                                    (genError("buildingPropertyType") && contractForm.buildingPropertyType == "") && (
                                        <div className="text-red-500 text-sm">
                                            {genError("buildingPropertyType")}
                                        </div>
                                    )
                                }
                            </div>
                            <div className="gap-2">
                                <label className="block mb-1 text-sm font-medium text-gray-700">ประเภทโรงเรือนอื่นๆ
                                </label>
                                <Input
                                placeholder="ประเภทโรงเรือนอื่นๆ"
                                value={contractForm.buildingPropertyTypeOther || ""}
                                onChange={(e) => dispatch(setBuildingPropertyTypeOther(e.target.value))}
                                disabled={contractForm.buildingPropertyType !== "6"}
                                />
                            </div>
                            <div className="gap-2">
                                <label className="block mb-1 text-sm font-medium text-gray-700">โรงเรือนเลขที่ <span className="text-red-500">*</span>
                                </label>
                                <Input
                                placeholder="กรอกโรงเรือนเลขที่"
                                value={contractForm.buildingBuildingNumber || ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const filteredValue = value.replace(/[^0-9\s\-\.\/\(\)]/g, '');
                                    dispatch(setBuildingBuildingNumber(filteredValue))
                                }}
                                status={`${(genError("buildingBuildingNumber") && contractForm.buildingBuildingNumber == "") ? "error" : ""}`}
                                />
                                {
                                    (genError("buildingBuildingNumber") && contractForm.buildingBuildingNumber == "") && (
                                        <div className="text-red-500 text-sm">
                                            {genError("buildingBuildingNumber")}
                                        </div>
                                    )
                                }
                            </div>
                            <div className="gap-2 lg:col-span-3">
                                <InputThaiAddress 
                                    showZipcode={false} 
                                    onAddressChange={handleBuildingAddressChange}
                                    isPropertyAddress={true}
                                    initialAddress={{
                                    province: contractForm.buildingProvince || "",
                                    amphoe: contractForm.buildingAmphoe || "",
                                    district: contractForm.buildingDistrict || "",
                                    zipcode: "",
                                    }}
                                    errArray={errArray}
                                    keyError={{province: "buildingProvince", amphoe: "buildingAmphoe", district: "buildingDistrict"}}
                                />
                            </div>
                            </div>
                        )}
                        {isOtherPropertyChecked.includes(item.value) && item.value === "3" && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 m-4">
                                <div className="gap-2">
                                <label className="block mb-1 text-sm font-medium text-gray-700">ชื่อสิ่งปลูกสร้างอื่นๆ <span className="text-red-500">*</span></label>
                                <Input
                                    placeholder="กรอกชื่อสิ่งปลูกสร้างอื่นๆ"
                                    value={contractForm.otherName || ""}
                                    onChange={(e) => dispatch(setOtherName(e.target.value))}
                                    status={`${(genError("otherName") && contractForm.otherName == "") ? "error" : ""}`}
                                />
                                {
                                    (genError("otherName") && contractForm.otherName == "") && (
                                        <div className="text-red-500 text-sm">
                                            {genError("otherName")}
                                        </div>
                                    )
                                }
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1">สิ่งปลูกสร้างเลขที่ <span className="text-red-500">*</span></label>
                                    <Input
                                    placeholder="ชื่อสิ่งปลูกสร้าง"
                                    // ใช้ข้อมูลจาก attDetail1 (buildingNumber)
                                    value={contractForm.otherBuildingNumber || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const filteredValue = value.replace(/[^0-9\s\-\.\/\(\)]/g, '');
                                        dispatch(setOtherBuildingNumber(filteredValue))
                                    }}
                                    status={`${(genError("otherBuildingNumber") && contractForm.otherBuildingNumber == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("otherBuildingNumber") && contractForm.otherBuildingNumber == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("otherBuildingNumber")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2 lg:col-span-2">
                                <InputThaiAddress 
                                    showZipcode={false} 
                                    onAddressChange={handleOtherAddressChange}
                                    isPropertyAddress={true}
                                    initialAddress={{
                                    province: contractForm.otherProvince || "",
                                    amphoe: contractForm.otherAmphoe || "",
                                    district: contractForm.otherDistrict || "",
                                    zipcode: "",
                                    }}
                                    errArray={errArray}
                                    keyError={{province: "otherProvince", amphoe: "otherAmphoe", district: "otherDistrict"}}
                                />
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                    ))}
                    </div>
                </div>}
                {selectValue === "2" && 
                <div className="gap-4">
                    <h4 className="font-semibold my-4">รายละเอียดสังหาริมทรัพย์ <span className="text-red-500">*</span></h4>
                    <div className="gap-4">
                    {movablePropertyTypeList?.map((item) => (
                        <div key={item.value}  className="col-span-12 gap-2">
                        <div className="flex items-center gap-2 mb-4">
                            <Checkbox
                            value={item.value} 
                            onChange={handleCheckboxChange}
                            checked={isOtherPropertyChecked.includes(item.value)}
                            className="text-gray-700"
                            >
                            {item.label}
                            </Checkbox>
                        </div>
                        <div>
                            {isOtherPropertyChecked.includes(item.value) && item.value === "1" && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 m-4">
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">ยี่ห้อ <span className="text-red-500">*</span>
                                    </label>
                                    <Input 
                                        type="text"  
                                        value={contractForm.newCarBrand || ""}
                                        onChange={(e) => dispatch(setNewCarBrand(e.target.value))}
                                        status={`${(genError("newCarBrand") && contractForm.newCarBrand == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("newCarBrand") && contractForm.newCarBrand == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("newCarBrand")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">รุ่น <span className="text-red-500">*</span>
                                    </label>
                                    <Input 
                                        type="text"  
                                        value={contractForm.newCarModel || ""}
                                        onChange={(e) => dispatch(setNewCarModel(e.target.value))}
                                        status={`${(genError("newCarModel") && contractForm.newCarModel == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("newCarModel") && contractForm.newCarModel == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("newCarModel")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">เลขทะเบียน
                                    </label>
                                    <Input 
                                        type="text"  
                                        value={contractForm.newCarRegistrationNumber || ""}
                                        onChange={(e) => dispatch(setNewCarRegistrationNumber(e.target.value))}
                                        status={`${(genError("newCarRegistrationNumber") && contractForm.newCarRegistrationNumber == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("newCarRegistrationNumber") && contractForm.newCarRegistrationNumber == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("newCarRegistrationNumber")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">เลขเครื่องยนต์ <span className="text-red-500">*</span>
                                    </label>
                                    <Input 
                                        type="text"  
                                        value={contractForm.newCarEngineNumber || ""}
                                        onChange={(e) => dispatch(setNewCarEngineNumber(e.target.value))}
                                        status={`${(genError("newCarEngineNumber") && contractForm.newCarEngineNumber == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("newCarEngineNumber") && contractForm.newCarEngineNumber == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("newCarEngineNumber")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">เลขตัวรถ <span className="text-red-500">*</span>
                                    </label>
                                    <Input 
                                        type="text"  
                                        value={contractForm.newCarFrameNumber || ""}
                                        onChange={(e) => dispatch(setNewCarFrameNumber(e.target.value))}
                                        status={`${(genError("newCarFrameNumber") && contractForm.newCarFrameNumber == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("newCarFrameNumber") && contractForm.newCarFrameNumber == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("newCarFrameNumber")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">สี <span className="text-red-500">*</span>
                                    </label>
                                    <Input 
                                        type="text"  
                                        value={contractForm.newCarColor || ""}
                                        onChange={(e) => dispatch(setNewCarColor(e.target.value))}
                                        status={`${(genError("newCarColor") && contractForm.newCarColor == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("newCarColor") && contractForm.newCarColor == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("newCarColor")}
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                            )}
                            {isOtherPropertyChecked.includes(item.value) && item.value === "2" && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 m-4">
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">ยี่ห้อ <span className="text-red-500">*</span>
                                    </label>
                                    <Input 
                                        type="text"  
                                        value={contractForm.oldCarBrand || ""}
                                        onChange={(e) => dispatch(setOldCarBrand(e.target.value))}
                                        status={`${(genError("oldCarBrand") && contractForm.oldCarBrand == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("oldCarBrand") && contractForm.oldCarBrand == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("oldCarBrand")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">รุ่น <span className="text-red-500">*</span>
                                    </label>
                                    <Input type="text"  
                                        value={contractForm.oldCarModel || ""}
                                        onChange={(e) => dispatch(setOldCarModel(e.target.value))}
                                        status={`${(genError("oldCarModel") && contractForm.oldCarModel == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("oldCarModel") && contractForm.oldCarModel == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("oldCarModel")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">เลขทะเบียน <span className="text-red-500">*</span>
                                    </label>
                                    <Input type="text" 
                                        value={contractForm.oldCarRegistrationNumber || ""}
                                        onChange={(e) => dispatch(setOldCarRegistrationNumber(e.target.value))}
                                        status={`${(genError("oldCarRegistrationNumber") && contractForm.oldCarRegistrationNumber == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("oldCarRegistrationNumber") && contractForm.oldCarRegistrationNumber == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("oldCarRegistrationNumber")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">เลขเครื่องยนต์ <span className="text-red-500">*</span>
                                    </label>
                                    <Input type="text" 
                                        value={contractForm.oldCarEngineNumber || ""}
                                        onChange={(e) => dispatch(setOldCarEngineNumber(e.target.value))}
                                        status={`${(genError("oldCarEngineNumber") && contractForm.oldCarEngineNumber == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("oldCarEngineNumber") && contractForm.oldCarEngineNumber == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("oldCarEngineNumber")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">เลขตัวรถ <span className="text-red-500">*</span>
                                    </label>
                                    <Input type="text"  
                                        value={contractForm.oldCarFrameNumber || ""}
                                        onChange={(e) => dispatch(setOldCarFrameNumber(e.target.value))}
                                        status={`${(genError("oldCarFrameNumber") && contractForm.oldCarFrameNumber == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("oldCarFrameNumber") && contractForm.oldCarFrameNumber == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("oldCarFrameNumber")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">สี <span className="text-red-500">*</span>
                                    </label>
                                    <Input type="text"  
                                        value={contractForm.oldCarColor || ""}
                                        onChange={(e) => dispatch(setOldCarColor(e.target.value))}
                                        status={`${(genError("oldCarColor") && contractForm.oldCarColor == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("oldCarColor") && contractForm.oldCarColor == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("oldCarColor")}
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                            )}
                            {isOtherPropertyChecked.includes(item.value) && item.value === "3" && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 m-4">
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">ยี่ห้อ <span className="text-red-500">*</span>
                                    </label>
                                    <Input type="text"  
                                        value={contractForm.newBicycleBrand || ""}
                                        onChange={(e) => dispatch(setNewBicycleBrand(e.target.value))}
                                        status={`${(genError("newBicycleBrand") && contractForm.newBicycleBrand == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("newBicycleBrand") && contractForm.newBicycleBrand == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("newBicycleBrand")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">รุ่น <span className="text-red-500">*</span>
                                    </label>
                                    <Input type="text"  
                                        value={contractForm.newBicycleModel || ""}
                                        onChange={(e) => dispatch(setNewBicycleModel(e.target.value))}
                                        status={`${(genError("newBicycleModel") && contractForm.newBicycleModel == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("newBicycleModel") && contractForm.newBicycleModel == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("newBicycleModel")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">เลขทะเบียน
                                    </label>
                                    <Input type="text"  
                                        value={contractForm.newBicycleRegistrationNumber || ""}
                                        onChange={(e) => dispatch(setNewBicycleRegistrationNumber(e.target.value))}
                                        status={`${(genError("newBicycleRegistrationNumber") && contractForm.newBicycleRegistrationNumber == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("newBicycleRegistrationNumber") && contractForm.newBicycleRegistrationNumber == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("newBicycleRegistrationNumber")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">เลขเครื่องยนต์ <span className="text-red-500">*</span>
                                    </label>
                                    <Input type="text"  
                                        value={contractForm.newBicycleEngineNumber || ""}
                                        onChange={(e) => dispatch(setNewBicycleEngineNumber(e.target.value))}
                                        status={`${(genError("newBicycleEngineNumber") && contractForm.newBicycleEngineNumber == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("newBicycleEngineNumber") && contractForm.newBicycleEngineNumber == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("newBicycleEngineNumber")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">เลขตัวรถ <span className="text-red-500">*</span>
                                    </label>
                                    <Input type="text"  
                                        value={contractForm.newBicycleFrameNumber || ""}
                                        onChange={(e) => dispatch(setNewBicycleFrameNumber(e.target.value))}
                                        status={`${(genError("newBicycleFrameNumber") && contractForm.newBicycleFrameNumber == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("newBicycleFrameNumber") && contractForm.newBicycleFrameNumber == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("newBicycleFrameNumber")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">สี <span className="text-red-500">*</span>
                                    </label>
                                    <Input type="text"  
                                        value={contractForm.newBicycleColor || ""}
                                        onChange={(e) => dispatch(setNewBicycleColor(e.target.value))}
                                        status={`${(genError("newBicycleColor") && contractForm.newBicycleColor == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("newBicycleColor") && contractForm.newBicycleColor == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("newBicycleColor")}
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                            )}
                            {isOtherPropertyChecked.includes(item.value) && item.value === "4" && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 m-4">
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">ยี่ห้อ <span className="text-red-500">*</span>
                                    </label>
                                    <Input type="text"  
                                        value={contractForm.oldBicycleBrand || ""}
                                        onChange={(e) => dispatch(setOldBicycleBrand(e.target.value))}
                                        status={`${(genError("oldBicycleBrand") && contractForm.oldBicycleBrand == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("oldBicycleBrand") && contractForm.oldBicycleBrand == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("oldBicycleBrand")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">รุ่น <span className="text-red-500">*</span>
                                    </label>
                                    <Input type="text"  
                                        value={contractForm.oldBicycleModel || ""}
                                        onChange={(e) => dispatch(setOldBicycleModel(e.target.value))}
                                        status={`${(genError("oldBicycleModel") && contractForm.oldBicycleModel == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("oldBicycleModel") && contractForm.oldBicycleModel == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("oldBicycleModel")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">เลขทะเบียน <span className="text-red-500">*</span>
                                    </label>
                                    <Input type="text"  
                                        value={contractForm.oldBicycleRegistrationNumber || ""}
                                        onChange={(e) => dispatch(setOldBicycleRegistrationNumber(e.target.value))}
                                        status={`${(genError("oldBicycleRegistrationNumber") && contractForm.oldBicycleRegistrationNumber == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("oldBicycleRegistrationNumber") && contractForm.oldBicycleRegistrationNumber == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("oldBicycleRegistrationNumber")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">เลขเครื่องยนต์ <span className="text-red-500">*</span>
                                    </label>
                                    <Input type="text"  
                                        value={contractForm.oldBicycleEngineNumber || ""}
                                        onChange={(e) => dispatch(setOldBicycleEngineNumber(e.target.value))}
                                        status={`${(genError("oldBicycleEngineNumber") && contractForm.oldBicycleEngineNumber == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("oldBicycleEngineNumber") && contractForm.oldBicycleEngineNumber == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("oldBicycleEngineNumber")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">เลขตัวรถ <span className="text-red-500">*</span>
                                    </label>
                                    <Input type="text"  
                                        value={contractForm.oldBicycleFrameNumber || ""}
                                        onChange={(e) => dispatch(setOldBicycleFrameNumber(e.target.value))}
                                        status={`${(genError("oldBicycleFrameNumber") && contractForm.oldBicycleFrameNumber == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("oldBicycleFrameNumber") && contractForm.oldBicycleFrameNumber == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("oldBicycleFrameNumber")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">สี <span className="text-red-500">*</span>
                                    </label>
                                    <Input type="text"  
                                        value={contractForm.oldBicycleColor || ""}
                                        onChange={(e) => dispatch(setOldBicycleColor(e.target.value))}
                                        status={`${(genError("oldBicycleColor") && contractForm.oldBicycleColor == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("oldBicycleColor") && contractForm.oldBicycleColor == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("oldBicycleColor")}
                                            </div>
                                        )
                                    }
                                </div>
                            </div>  
                            )}
                            {isOtherPropertyChecked.includes(item.value) && item.value === "5" && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 m-4">

                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">ชื่อประเภทสังหาริมทรัพย์อื่นๆ <span className="text-red-500">*</span>
                                    </label>
                                    <Input type="text"  
                                        value={contractForm.otherMovablePropertyName || ""}
                                        onChange={(e) => dispatch(setOtherMovablePropertyName(e.target.value))}
                                        status={`${(genError("otherMovablePropertyName") && contractForm.otherMovablePropertyName == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("otherMovablePropertyName") && contractForm.otherMovablePropertyName == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("otherMovablePropertyName")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">ประเภททรัพย์สิน <span className="text-red-500">*</span>
                                    </label>
                                    <Input type="text" 
                                        value={contractForm.otherMovablePropertyType || ""}
                                        onChange={(e) => dispatch(setOtherMovablePropertyType(e.target.value))}
                                        status={`${(genError("otherMovablePropertyType") && contractForm.otherMovablePropertyType == "") ? "error" : ""}`}
                                    />
                                    {
                                        (genError("otherMovablePropertyType") && contractForm.otherMovablePropertyType == "") && (
                                            <div className="text-red-500 text-sm">
                                                {genError("otherMovablePropertyType")}
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">ยี่ห้อ
                                    </label>
                                    <Input type="text"  
                                        value={contractForm.otherMovableBrand || ""}
                                        onChange={(e) => dispatch(setOtherMovableBrand(e.target.value))}
                                    />
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">รุ่น
                                    </label>
                                    <Input type="text"  
                                        value={contractForm.otherMovableModel || ""}
                                        onChange={(e) => dispatch(setOtherMovableModel(e.target.value))}
                                    />
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">เลขทะเบียน/Serialnumber
                                    </label>
                                    <Input type="text"  
                                        value={contractForm.otherMovableSerialNumber || ""}
                                        onChange={(e) => dispatch(setOtherMovableSerialNumber(e.target.value))}
                                    />
                                </div>
                                <div className="gap-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">อื่นๆ
                                    </label>
                                    <Input type="text" 
                                        value={contractForm.otherMovableOther || ""}
                                        onChange={(e) => dispatch(setOtherMovableOther(e.target.value))}
                                    />
                                </div>
                            </div>
                            )}
                        </div>  
                        </div>
                    ))}
                </div>
                </div>}
                <div>
                    {genError("arrayDetail1") && (
                        <div className="text-red-500 text-sm">
                            {genError("arrayDetail1")}
                        </div>
                    )}
                    {genError("arrayDetail2") && (
                        <div className="text-red-500 text-sm">
                            {genError("arrayDetail2")}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}