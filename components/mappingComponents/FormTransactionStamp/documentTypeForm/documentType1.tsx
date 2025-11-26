import { buildingPropertyTypeList, landPropertyTypeList, RentPropertyTypeList1 } from "@/store/types/othersPropertiesType"
import { Checkbox, Input, Select } from "antd"
import InputThaiAddress from "../inputThaiAddress"
import { useAppDispatch, useAppSelector } from "@/store";
import { AttachDetailItem } from "@/store/types/contractFormType";
import { setArrayDetail, setBuildingAmphoe, setBuildingBuildingNumber, setBuildingDistrict, setBuildingName, setBuildingPropertyType, setBuildingPropertyTypeOther, setBuildingProvince, setLandAmphoe, setLandBuildingNumber, setLandDistrict, setLandNumber1, setLandPropertyType, setLandPropertyTypeOther, setLandProvince, setOtherAmphoe, setOtherBuildingNumber, setOtherDistrict, setOtherName, setOtherProvince, setPropertyAddress, setPropertyType, setPropertyTypeOther, setRaftAmphoe, setRaftDistrict, setRaftNumber, setRaftProvince } from "@/store/slices/contractFormSlice";
import { useState } from "react";
import { AddressData } from "@/store/thaiAddressData";

interface DocumentType1Props {
    propertyRentalData: AttachDetailItem; 
    errArray?: {key:string, message:string}[]
    onAttActionType1Change: (value: string) => void;
    onPropertyRentalDataChange?: (data: AttachDetailItem) => void;
    genError: (key: string) => string | undefined;
}

export const DocumentType1 = ({ propertyRentalData, errArray, onAttActionType1Change, onPropertyRentalDataChange, genError}: DocumentType1Props) => {
    const dispatch = useAppDispatch();
    const contractForm = useAppSelector((state) => state.contractForm);
    const [isOtherPropertyChecked, setIsOtherPropertyChecked] = useState<string[]>([]);

    const handleCheckboxChange = (e: any) => {
        let newCheckedState: string[];
        if (e.target.checked) {
          newCheckedState = [...isOtherPropertyChecked, e.target.value].sort((a, b) => a - b);
        } else {
          newCheckedState = isOtherPropertyChecked.filter((item) => item !== e.target.value).sort();
        }
        
        setIsOtherPropertyChecked(newCheckedState);
        
        
        // อัพเดท propertyType ใน Redux store
        dispatch(setPropertyType(newCheckedState.length > 0 ? "1" : "0"));
    
        // ส่งค่า attActionType1 กลับไป
        onAttActionType1Change(newCheckedState.length > 0 ? "3" : "0");

        const newArrayDetail = newCheckedState?.map((item) => ({
            attType: "1",
            attActionType1: item,
        }));

        // รวมกับ arrayDetail เดิมและลบตัวซ้ำ
        const existingArrayDetail = contractForm.arrayDetail.filter((item) => item.attType == "2");
        const mergedArrayDetail = [...existingArrayDetail, ...newArrayDetail];
        
        // ลบตัวซ้ำโดยใช้ attType และ attActionType1 เป็นตัวกำหนด
        const uniqueArrayDetail = mergedArrayDetail.filter((item, index, self) => 
            index === self.findIndex(t => t.attType === item.attType && t.attActionType1 === item.attActionType1)
        );

        dispatch(setArrayDetail(uniqueArrayDetail));
      };

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

      const handleRaftAddressChange = (address: AddressData) => {
        dispatch(setRaftProvince(address.province));
        dispatch(setRaftAmphoe(address.amphoe));
        dispatch(setRaftDistrict(address.district));
    }

    return (
        <>
            <div className="mb-4">
              <h4 className="font-semibold">ทรัพย์สินที่เช่า <span className="text-red-500">*</span></h4>
            </div>
            <div className="space-y-4">
              {
                RentPropertyTypeList1?.map((item) => (
                  <div key={item.value} className="mb-4">
                    <div className="flex items-center gap-4">
                        <Checkbox
                          value={item.value} 
                          onChange={handleCheckboxChange}
                          checked={isOtherPropertyChecked.includes(item.value)}
                          className="text-gray-700"
                        >
                          {item.label}
                        </Checkbox>
                    </div>
                    <div className="gap-4">
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
                            <div>
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
                      {isOtherPropertyChecked.includes(item.value) && item.value === "4" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 m-4">
                          <div className="gap-2">
                            <label className="block mb-1 text-sm font-medium text-gray-700">แพเลขที่ <span className="text-red-500">*</span></label>
                            <Input
                              placeholder="กรอกแพเลขที่"
                              value={contractForm.raftNumber || ""}
                              onChange={(e) => dispatch(setRaftNumber(e.target.value))}
                              status={`${(genError("raftNumber") && contractForm.raftNumber == "") ? "error" : ""}`}
                            />
                            {
                              (genError("raftNumber") && contractForm.raftNumber == "") && (
                                <div className="text-red-500 text-sm">
                                  {genError("raftNumber")}
                                </div>
                              )
                            }
                            </div>
                            <div>
                              <InputThaiAddress 
                                showZipcode={false} 
                                onAddressChange={handleRaftAddressChange}
                                isPropertyAddress={true}
                                initialAddress={{
                                  province: contractForm.raftProvince || "",
                                  amphoe: contractForm.raftAmphoe || "",
                                  district: contractForm.raftDistrict || "",
                                  zipcode: "",
                                }}
                                errArray={errArray}
                                keyError={{province: "raftProvince", amphoe: "raftAmphoe", district: "raftDistrict"}}
                              />
                            </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              }
              {
                (genError("arrayDetail1") && (
                  <div className="text-red-500 text-sm">
                    {genError("arrayDetail1")}
                  </div>
                ))
              }
            </div>
          </>
    )
}
