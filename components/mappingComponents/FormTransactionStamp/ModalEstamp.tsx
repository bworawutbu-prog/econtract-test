"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Modal, Button, Form, message } from "antd";
import { submitContractForm } from "@/store/thunks/contractFormThunks";
import { X } from "lucide-react";
import { RootState, useAppDispatch, useAppSelector } from "@/store";
import appEmitter from "@/store/libs/eventEmitter";
import { ContractForm, AttachDetailItem } from "@/store/types/contractFormType";
import StampSubmissionType from "./stampSubmissionType";
import StampEsign from "./stampEsign";
import {
  DocumentTypeOption,
  documentTypeOptions,
  getDocumentTypeLabel,
} from "@/store/types/estampTypes";
import StampContractDetails from "./stampContractDetails";
import StampPropertyDetails from "./stampPropertyDetails";
import StampPartyDetails from "./stampPartyDetails";
import { setContractNo, resetForm, setPartyTitleName, setPartyName, setBuildingName, setRoomNo, setVillageName, setBuildingNumber, setMoo, setSoiName, setJunctionName, setStreetName, setCitySubDivisionName, setCityName, setCountrySubDivisionName, setPostCode, setCountryId, setArrayDetail } from "@/store/slices/contractFormSlice";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { mappingRelateContractFormUtil, mappingSubmitDataUtil } from "../FormUtils/mappingSubmitDataUtil";
import { GetCoBusinessDetail } from "@/store/estampStore/typeEstamp";
import { CoBusinessDetail } from "@/store/types/MappingElementTypes";


interface EstampModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (estampData: any) => Promise<boolean>;
  title?: string;
  isLoading?: boolean;
  initialData?: any | null;
}

const ModalEstamp: React.FC<EstampModalProps> = ({
  open,
  onClose,
  onConfirm,
  title = "จัดการดิจิทัลแสตมป์",
  isLoading = false,
  initialData = null,
}) => {
  const dispatch = useAppDispatch() as ThunkDispatch<
    RootState,
    unknown,
    AnyAction
  >;

  const [documentSubmissionType, setDocumentSubmissionType] =
    useState<string>("1");
  const contractForm = useAppSelector((state) => state.contractForm);
  const [isCoBusinessDetail, setIsCoBusinessDetail] = useState<boolean>(false);

  // State สำหรับรับข้อมูลจาก StampEsign - ใช้จาก contractForm แทน
  const [selectedDocumentType, setSelectedDocumentType] =
    useState<DocumentTypeOption>({
      key: contractForm.documentTypeCode || "1",
      value: contractForm.documentTypeCode || "1",
      label: getDocumentTypeLabel(contractForm.documentTypeCode || "1"),
    });
  const [selectedRelationship, setSelectedRelationship] = useState<string>(
    contractForm.partyRelationship || "1"
  );
  const B2BformData = useAppSelector((state) => state.contractB2BForm);
  const business = useAppSelector((state) => state.business);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const getCoBusinessDetail = async () => {
      if (B2BformData?.forms?.contractParty?.taxId) {
        let payload = {
          tax_id: "",
          business_id: ""
        }
        if (B2BformData?.forms?.docsTypeDetail?.stampDutyBizPayer == "contractor") {
          payload = {
            tax_id: B2BformData?.forms?.contractParty?.taxId,
            business_id: ""
          }
        } else {
          // get business_id from selectedBusinessId in Header
          payload = {
            tax_id: "",
            business_id: business.selectedBusinessId || ""
          }
        }
        const coBusinessDetailResponse = await dispatch(GetCoBusinessDetail(payload));
        // console.log("coBusinessDetailResponse =>", coBusinessDetailResponse);
        if (coBusinessDetailResponse.payload) {
          const coBusinessDetail: CoBusinessDetail = coBusinessDetailResponse.payload.data;
          dispatch(setPartyTitleName(coBusinessDetail.titleName));
          dispatch(setPartyName(coBusinessDetail.name));
          dispatch(setBuildingName(coBusinessDetail.buildingName));
          dispatch(setRoomNo(coBusinessDetail.roomNo));
          dispatch(setVillageName(coBusinessDetail.villageName));
          dispatch(setBuildingNumber(coBusinessDetail.buildingNumber));
          dispatch(setMoo(coBusinessDetail.moo));
          dispatch(setSoiName(coBusinessDetail.soiName));
          dispatch(setJunctionName(coBusinessDetail.junctionName));
          dispatch(setStreetName(coBusinessDetail.streetName));
          dispatch(setCitySubDivisionName(coBusinessDetail.citySubDivisionName));
          dispatch(setCityName(coBusinessDetail.cityName));
          dispatch(setCountrySubDivisionName(coBusinessDetail.countrySubDivisionName));
          dispatch(setPostCode(coBusinessDetail.postCode));
          dispatch(setCountryId(coBusinessDetail.countryId));
          setIsCoBusinessDetail(true);
        }
      }
    }
    getCoBusinessDetail();
  }, [open]);

  // Set default values when component mounts
  useEffect(() => {
    const keepType1 = contractForm.arrayDetail.filter((i) => i.attType === "1");
    dispatch(setArrayDetail(keepType1));
    setResetKey((k) => k + 1);
    if (open) {
      if (!documentSubmissionType) {
        setDocumentSubmissionType("1");
      }
    }
  }, [open, documentSubmissionType]);

  // อัพเดท selectedDocumentType และ selectedRelationship เมื่อ contractForm เปลี่ยน
  useEffect(() => {
    setSelectedDocumentType({
      key: contractForm.documentTypeCode || "1",
      value: contractForm.documentTypeCode || "1",
      label: getDocumentTypeLabel(contractForm.documentTypeCode || "1"),
    });
    setSelectedRelationship(contractForm.partyRelationship || "1");
  }, [contractForm.documentTypeCode, contractForm.partyRelationship]);


  const [errArray, setErrArray] = useState<{ key: string, message: string }[]>([]);

  // Function สำหรับเครียร์ errors
  const clearErrors = () => {
    const keyNotClear = ["effectiveDate", "creationDate", "expireDate", "documentTypeCode", "partyRelationship", "partyTitleName", "partyName", "countrySubDivisionName", "cityName", "citySubDivisionName", "taxRegistrationId"];
    const arrErr = errArray.filter((item) => keyNotClear.includes(item.key));
    setErrArray(arrErr);
  };
  // Handle form submission
  const handleSubmit = async () => {
    // ล้าง errArray
    const newErrors: { key: string; message: string }[] = [];

    // Helper function to add errors
    const addError = (key: string, message: string) => {
      newErrors.push({ key, message });
    };

    const attachDetail = mappingSubmitDataUtil({
      documentTypeCode: contractForm.documentTypeCode,
      contractForm: contractForm
    });

    const submitData = {
      // eform_id: "689a05fb884a57ecba1ebe34",
      // transaction_id: "",
      // name: selectedDocumentType.label || "",
      // eform_data: {
      //   documentDetail: {
      //     typeCode: selectedDocumentType.value || "1",
      //   },
      //   instInfo: [
      //     {
      //       id: contractForm.contractId || "",
      //       contractNo: contractForm.contractNo || "",
      //       creationDate: contractForm.creationDate || "",
      //       effectiveDate: contractForm.effectiveDate || "",
      //       expireDate: contractForm.expireDate || "",
      //       instAmount: contractForm.totalAmount || 0,
      //       taxPayer: {
      //         specifiedTaxRegistration: {
      //           id: contractForm.taxRegistrationId || "1111111111119",
      //         },
      //         branchNo: contractForm.partyBranchNo || "0",
      //         branchType: "O",
      //         relationship: selectedRelationship || "2",
      //       },
      //       party: {
      //         specifiedTaxRegistration: {
      //           id: contractForm.taxRegistrationId || "1212121212121",
      //         },
      //         titleName: contractForm.partyTitleName || "",
      //         name: contractForm.partyName || "",
      //         surname: contractForm.partySurname || "",
      //         branchNo: contractForm.partyBranchNo || "0",
      //         branchType: "O",
      //         postalTradeAddress: {
      //           buildingName: contractForm.buildingName || "",
      //           roomNo: contractForm.roomNo || "",
      //           floorNo: contractForm.floorNo || "",
      //           villageName: contractForm.villageName || "",
      //           buildingNumber: contractForm.buildingNumber || "",
      //           moo: contractForm.moo || "",
      //           soiName: contractForm.soiName || "",
      //           junctionName: contractForm.junctionName || "",
      //           streetName: contractForm.streetName || "",
      //           citySubDivisionName: partyAddressData.citySubDivisionName || "",
      //           cityName: partyAddressData.cityName || "",
      //           countrySubDivisionName: partyAddressData.countrySubDivisionName || "",
      //           postCode: partyAddressData.postCode || "",
      //           countryId: contractForm.countryId || "TH",
      //         },
      //         totalParty: 1,
      //       },
      //       attachDetail: {
      //         actionType: "0", //ลักษณะแห่งตราสาร
      //         arrayDetail: [
      //           {
      //             attType: "1", // ทรัพย์สินที่เช่า
      //             attActionType1: "3", // สิ่งปลูกสร้างอื่น
      //             attActionType2: "1", // ชำระค่าเช่าเป็นรายเดือน
      //             attDetail1:
      //               contractForm.propertyAddress?.buildingNumber || "",
      //             attDetail2:
      //               contractForm.propertyAddress?.citySubDivisionName || "",
      //             attDetail3: contractForm.propertyAddress?.cityName || "",
      //             attDetail4:
      //               contractForm.propertyAddress?.countrySubDivisionName || "",
      //             attDetail5: contractForm.propertyTypeOther || "",
      //           },
      //           {
      //             attType: "2", // ค่าเช่า หรือประมาณการค่าเช่า
      //             attActionType1: "1", // ชำระค่าเช่าเป็นรายเดือน
      //             attActionType2: "1", // ชำระค่าเช่าเป็นรายเดือน (สำหรับ checkbox condition)
      //             attNumber1: contractForm.rentalMonths || 0,
      //             attAmount1: contractForm.monthlyRent || 0,
      //             attAmount2: contractForm.keyMoney || 0,
      //             attAmount3: contractForm.totalAmount || 0,
      //           },
      //         ],
      //       },
      //     },
      //   ],
      // },
      documentDetail: {
        typeCode: contractForm.documentTypeCode || "1", // ลักษณะแห่งตราสาร เปลี่ยนตามลักษณะแห่งตราสารที่เลือก
      },
      instInfo: [
        {
          // id: contractForm.contractId || "",
          // contractNo: contractForm.contractNo || "",
          // creationDate: contractForm.creationDate || "",
          effectiveDate: contractForm.effectiveDate || "",
          expireDate: contractForm.expireDate || "",
          instAmount: contractForm.instAmount || 0,
          taxPayer: {
            // specifiedTaxRegistration: {
            //   id: contractForm.taxRegistrationId || "1111111111119",
            // },
            branchNo: contractForm.partyBranchNo || "00000",
            branchType: "O",
            relationship: selectedRelationship || "2",
          },
          // party: {
          //   specifiedTaxRegistration: {
          //     id: B2BformData?.forms?.contractParty?.taxId || contractForm.taxRegistrationId || "",
          //   },
          //   titleName: contractForm.partyTitleName || "",
          //   name: contractForm.partyName || "",
          //   surname: contractForm.partySurname || "",
          //   branchNo: B2BformData?.forms == null ? "" : "0",
          //   branchType: B2BformData?.forms == null ? "" : "O",
          //   postalTradeAddress: {
          //     buildingName: contractForm.buildingName || "",
          //     roomNo: contractForm.roomNo || "",
          //     floorNo: contractForm.floorNo || "",
          //     villageName: contractForm.villageName || "",
          //     buildingNumber: contractForm.buildingNumber || "",
          //     moo: contractForm.moo || "",
          //     soiName: contractForm.soiName || "",
          //     junctionName: contractForm.junctionName || "",
          //     streetName: contractForm.streetName || "",
          //     citySubDivisionName: contractForm.citySubDivisionName || "",
          //     cityName: contractForm.cityName || "",
          //     countrySubDivisionName: contractForm.countrySubDivisionName || "",
          //     postCode: contractForm.postCode || "",
          //     countryId: contractForm.countryId || "TH",
          //   },
          //   totalParty: 1,
          // },
          // attachDetail: {
          //   actionType: "0", //ลักษณะแห่งตราสาร
          //   arrayDetail: [
          //     {
          //       attType: "1", // ทรัพย์สินที่เช่า
          //       attActionType1: "3", // สิ่งปลูกสร้างอื่น
          //       attActionType2: "1", // ชำระค่าเช่าเป็นรายเดือน
          //       attDetail1:
          //         contractForm.propertyAddress?.buildingNumber || "",
          //       attDetail2:
          //         contractForm.propertyAddress?.citySubDivisionName || "",
          //       attDetail3: contractForm.propertyAddress?.cityName || "",
          //       attDetail4:
          //         contractForm.propertyAddress?.countrySubDivisionName || "",
          //       attDetail5: contractForm.propertyTypeOther || "",
          //     },
          //     {
          //       attType: "2", // ค่าเช่า หรือประมาณการค่าเช่า
          //       attActionType1: "1", // ชำระค่าเช่าเป็นรายเดือน
          //       attActionType2: "1", // ชำระค่าเช่าเป็นรายเดือน (สำหรับ checkbox condition)
          //       attNumber1: contractForm.rentalMonths || 0,
          //       attAmount1: contractForm.monthlyRent || 0,
          //       attAmount2: contractForm.keyMoney || 0,
          //       attAmount3: contractForm.totalAmount || 0,
          //     },
          //   ],
          // },
          attachDetail: attachDetail,
          relateContract: contractForm.documentTypeCode == "17" ? mappingRelateContractFormUtil({ contractForm: contractForm }) : [],
        },
      ],
    };
    // ตรวจสอบ error จาก errArray ไม่แบ่งตาม documentTypeCode
    if (submitData.instInfo[0].effectiveDate == "") {
      addError("effectiveDate", "กรุณากรอกวันที่เริ่มต้นสัญญาให้ถูกต้อง");
    }
    // if(submitData.instInfo[0].creationDate == "") {
    //   addError("creationDate", "กรุณากรอกวันที่ทำสัญญาให้ถูกต้อง");
    // } 
    if (submitData.instInfo[0].expireDate == "") {
      addError("expireDate", "กรุณากรอกวันที่สิ้นสุดสัญญาให้ถูกต้อง");
    }
    if (submitData.documentDetail.typeCode == "") {
      addError("documentTypeCode", "กรุณาเลือกลักษณะแห่งตราสารให้ถูกต้อง");
    }
    if (submitData.instInfo[0].taxPayer.relationship == "") {
      addError("partyRelationship", "กรุณาเลือกผู้ขอเสียอากรแสตมป์ในฐานะให้ถูกต้อง");
    }
    // if(submitData.instInfo[0].party.titleName == "") {
    //   addError("partyTitleName", "กรุณากรอกคำนำหน้าชื่อให้ถูกต้อง");
    // } 
    // if(submitData.instInfo[0].party.name == "") {
    //   addError("partyName", "กรุณากรอกชื่อให้ถูกต้อง");
    // }
    // if (submitData.instInfo[0]?.party?.postalTradeAddress?.countrySubDivisionName == "") {
    //   addError("countrySubDivisionName", "กรุณาเลือก จังหวัด ให้ถูกต้อง");
    // } 
    // if (submitData.instInfo[0]?.party?.postalTradeAddress?.cityName == "") {
    //   addError("cityName", "กรุณาเลือก อำเภอ/เขต ให้ถูกต้อง");
    // } 
    // if (submitData.instInfo[0]?.party?.postalTradeAddress?.citySubDivisionName == "") {
    //   addError("citySubDivisionName", "กรุณาเลือก ตำบล/แขวง ให้ถูกต้อง");
    // } 
    // if (B2BformData?.forms == null) {
    //   if (contractForm.taxRegistrationId == "") {
    //       addError("taxRegistrationId", "กรุณากรอกเลขประจำตัวผู้เสียภาษีอากรให้ถูกต้อง");
    //     }
    // }
    if (contractForm.documentTypeCode == "1") {
      // console.log("contract.arrDetail =>", contractForm.arrayDetail);
      if (submitData.instInfo[0]?.attachDetail?.arrayDetail?.filter((item) => item?.attType == "1").length == 0) {
        addError("arrayDetail1", "กรุณาเลือกรายละเอียดทรัพย์สินที่เช่าซื้ออย่างน้อย 1 รายละเอียด");
      }
      if (submitData.instInfo[0]?.attachDetail?.arrayDetail?.filter((item) => item?.attType == "2").length == 0) {
        addError("arrayDetail2", "กรุณาเลือกรายละเอียดค่าเช่า หรือประมาณการค่าเช่าอย่างน้อย 1 รายละเอียด");
      }
      contractForm.arrayDetail.forEach((item: { attType: string; attActionType1: string; }) => {
        const arrDetailForCheck = submitData.instInfo[0]?.attachDetail?.arrayDetail?.find((detailItem) => detailItem?.attActionType1 == item.attActionType1 && detailItem?.attType == item.attType) as AttachDetailItem | undefined;
        if (item.attType == "1") {
          if (item.attActionType1 == "1") {
            if (!arrDetailForCheck?.attActionType2 || arrDetailForCheck?.attActionType2 === "") {
              addError("landPropertyType", "กรุณาเลือกประเภทของที่ดิน");
            }
            if (!arrDetailForCheck?.attDetail1 || arrDetailForCheck?.attDetail1 === "") {
              addError("landBuildingNumber", "กรุณากรอกเลขที่");
            }
            if (!arrDetailForCheck?.attDetail6 || arrDetailForCheck?.attDetail6 === "") {
              addError("landNumber1", "กรุณากรอกเลขที่ที่ดิน");
            }
            if (!arrDetailForCheck?.attDetail2 || arrDetailForCheck?.attDetail2 === "") {
              addError("landProvince", "กรุณาเลือกจังหวัดให้ถูกต้อง");
            }
            if (!arrDetailForCheck?.attDetail3 || arrDetailForCheck?.attDetail3 === "") {
              addError("landAmphoe", "กรุณาเลือกอำเภอ/เขตให้ถูกต้อง");
            }
            if (!arrDetailForCheck?.attDetail4 || arrDetailForCheck?.attDetail4 === "") {
              addError("landDistrict", "กรุณาเลือกตำบล/แขวงให้ถูกต้อง");
            }
          }
          if (item.attActionType1 == "2") {
            if (!arrDetailForCheck?.attActionType2 || arrDetailForCheck?.attActionType2 === "") {
              addError("buildingPropertyType", "กรุณาเลือกประเภทของโรงเรือน");
            }
            if (!arrDetailForCheck?.attDetail1 || arrDetailForCheck?.attDetail1 === "") {
              addError("buildingBuildingNumber", "กรุณากรอกเลขที่");
            }
            if (!arrDetailForCheck?.attDetail2 || arrDetailForCheck?.attDetail2 === "") {
              addError("buildingProvince", "กรุณาเลือกจังหวัดให้ถูกต้อง");
            }
            if (!arrDetailForCheck?.attDetail3 || arrDetailForCheck?.attDetail3 === "") {
              addError("buildingAmphoe", "กรุณาเลือกอำเภอ/เขตให้ถูกต้อง");
            }
            if (!arrDetailForCheck?.attDetail4 || arrDetailForCheck?.attDetail4 === "") {
              addError("buildingDistrict", "กรุณาเลือกตำบล/แขวงให้ถูกต้อง");
            }
          }
          if (item.attActionType1 == "3") {
            if (!arrDetailForCheck?.attDetail1 || arrDetailForCheck?.attDetail1 === "") {
              addError("otherName", "กรุณากรอกชื่อสิ่งปลูกสร้างอื่นๆ");
            }
            if (!arrDetailForCheck?.attDetail2 || arrDetailForCheck?.attDetail2 === "") {
              addError("otherProvince", "กรุณาเลือกจังหวัดให้ถูกต้อง");
            }
            if (!arrDetailForCheck?.attDetail3 || arrDetailForCheck?.attDetail3 === "") {
              addError("otherAmphoe", "กรุณาเลือกอำเภอ/เขตให้ถูกต้อง");
            }
            if (!arrDetailForCheck?.attDetail4 || arrDetailForCheck?.attDetail4 === "") {
              addError("otherDistrict", "กรุณาเลือกตำบล/แขวงให้ถูกต้อง");
            }
            if (!arrDetailForCheck?.attDetail5 || arrDetailForCheck?.attDetail5 === "") {
              addError("otherBuildingNumber", "กรุณากรอกเลขที่สิ่งปลูกสร้างอื่นๆ");
            }
          }
          if (item.attActionType1 == "4") {
            if (!arrDetailForCheck?.attDetail1 || arrDetailForCheck?.attDetail1 === "") {
              addError("raftNumber", "กรุณากรอกเลขที่แพ");
            }
            if (!arrDetailForCheck?.attDetail2 || arrDetailForCheck?.attDetail2 === "") {
              addError("raftProvince", "กรุณาเลือกจังหวัดให้ถูกต้อง");
            }
            if (!arrDetailForCheck?.attDetail3 || arrDetailForCheck?.attDetail3 === "") {
              addError("raftAmphoe", "กรุณาเลือกอำเภอ/เขตให้ถูกต้อง");
            }
            if (!arrDetailForCheck?.attDetail4 || arrDetailForCheck?.attDetail4 === "") {
              addError("raftDistrict", "กรุณาเลือกตำบล/แขวงให้ถูกต้อง");
            }
          }
        }
        if (item.attType == "2") {
          if (item.attActionType1 == "1") {
            if (!arrDetailForCheck?.attAmount1 || arrDetailForCheck?.attAmount1 === 0) {
              addError("monthlyRent", "กรุณากรอกค่าเช่า");
            }
            if (!arrDetailForCheck?.attNumber1 || arrDetailForCheck?.attNumber1 === 0) {
              addError("rentalMonths", "กรุณากรอกจำนวนเดือน");
            }
          }
          if (item.attActionType1 == "2") {
            if (!arrDetailForCheck?.attAmount1 || arrDetailForCheck?.attAmount1 === 0) {
              addError("yearlyRent", "กรุณากรอกค่าเช่า");
            }
            if (!arrDetailForCheck?.attNumber1 || arrDetailForCheck?.attNumber1 === 0) {
              addError("rentalYearly", "กรุณากรอกจำนวนปี");
            }
          }
          if (item.attActionType1 == "3") {
            if (!arrDetailForCheck?.attAmount1 || arrDetailForCheck?.attAmount1 === 0) {
              addError("estimateRent", "กรุณากรอกค่าเช่า");
            }
          }
          if (item.attActionType1 == "4") {
            if (!arrDetailForCheck?.attAmount1 || arrDetailForCheck?.attAmount1 === 0) {
              addError("rentCost", "กรุณากรอกค่าเช่า");
            }
          }
        }
      });
    }



    // ตรวจสอบ error จาก errArray documentTypeCode is ลักษณะแห่งตราสาร 3 ทรัพย์สินที่เช่า ค่าเช่า หรือประมาณการค่าเช่า
    if (contractForm.documentTypeCode == "3") {

      // ตรวจสอบ error จาก errArray ทุกครั้งไม่ว่า actionType จะเป็น 1 หรือ 2
      if (submitData.instInfo[0]?.attachDetail?.actionType == "") {
        addError("actionType", "กรุณาเลือกประเภททรัพสินที่เช่าซื้อ");
      }
      if (submitData.instInfo[0]?.attachDetail?.amount == 0) {
        addError("amount1", "กรุณากรอกราคาทุนทรัพย์/ราคาเงินสดให้ถูกต้อง");
      }
      if (submitData.instInfo[0]?.attachDetail?.amount1 == 0) {
        addError("amount2", "กรุณากรอกดอกผลตามสัญญาเช่าซื้อให้ถูกต้อง");
      }
      if (submitData.instInfo[0]?.attachDetail?.amount2 == 0) {
        addError("amount3", "กรุณากรอกค่างวดเช่าซื้อให้ถูกต้อง");
      }
      if (submitData.instInfo[0]?.attachDetail?.number == 0) {
        addError("number1", "กรุณากรอกจำนวนงวดให้ถูกต้อง");
      }
      if (submitData.instInfo[0]?.instAmount == 0) {
        addError("instAmount", "กรุณากรอกมูลค่าในตราสารให้ถูกต้อง");
      }
      if (submitData.instInfo[0]?.attachDetail?.arrayDetail?.length == 0 && contractForm.actionType == "1") {
        addError("arrayDetail1", "กรุณาเลือกรายละเอียดทรัพย์สินที่เช่าซื้ออย่างน้อย 1 รายละเอียด");
      }
      if (submitData.instInfo[0]?.attachDetail?.arrayDetail?.length == 0 && contractForm.actionType == "2") {
        addError("arrayDetail2", "กรุณาเลือกรายละเอียดสังหาริมทรัพย์อื่นๆอย่างน้อย 1 รายละเอียด");
      }
      contractForm.arrayDetail.forEach((item: { attType: string; attActionType1: string; }) => {
        if (contractForm.actionType == "1") {
          //ที่ดิน
          if (item.attType == "1" && item.attActionType1 === "1") {
            const arrDetailForCheck = submitData.instInfo[0]?.attachDetail?.arrayDetail?.find((detailItem) => detailItem?.attActionType1 === "1") as AttachDetailItem | undefined;
            // console.log("arrDetailForCheck =>", arrDetailForCheck);
            if (arrDetailForCheck) {
              if (!arrDetailForCheck.attActionType2 || arrDetailForCheck.attActionType2 === "") {
                addError("landPropertyType", "กรุณาเลือกประเภทของที่ดิน");
              }
              if (!arrDetailForCheck.attDetail1 || arrDetailForCheck.attDetail1 === "") {
                addError("landBuildingNumber", "กรุณากรอกเลขที่");
              }
              if (!arrDetailForCheck.attDetail2 || arrDetailForCheck.attDetail2 === "") {
                addError("landProvince", "กรุณาเลือกจังหวัดให้ถูกต้อง");
              }
              if (!arrDetailForCheck.attDetail3 || arrDetailForCheck.attDetail3 === "") {
                addError("landAmphoe", "กรุณาเลือกอำเภอ/เขตให้ถูกต้อง");
              }
              if (!arrDetailForCheck.attDetail4 || arrDetailForCheck.attDetail4 === "") {
                addError("landDistrict", "กรุณาเลือกตำบล/แขวงให้ถูกต้อง");
              }
              if (!arrDetailForCheck.attDetail6 || arrDetailForCheck.attDetail6 === "") {
                addError("landNumber1", "กรุณากรอกเลขที่ที่ดิน");
              }
            }
          }
          //โรงเรือน
          if (item.attActionType1 == "2") {
            const arrDetailForCheck = submitData.instInfo[0]?.attachDetail?.arrayDetail?.find((detailItem) => detailItem?.attActionType1 == "2") as AttachDetailItem | undefined;
            if (!arrDetailForCheck?.attActionType2 || arrDetailForCheck?.attActionType2 === "") {
              addError("buildingPropertyType", "กรุณาเลือกประเภทของโรงเรือน");
            }
            if (arrDetailForCheck?.attDetail1 == "") {
              addError("buildingBuildingNumber", "กรุณากรอกโรงเรือนเลขที่");
            }
            if (arrDetailForCheck?.attDetail2 == "") {
              addError("buildingProvince", "กรุณาเลือกจังหวัดให้ถูกต้อง");
            }
            if (arrDetailForCheck?.attDetail3 == "") {
              addError("buildingAmphoe", "กรุณาเลือกอำเภอ/เขตให้ถูกต้อง");
            }
            if (arrDetailForCheck?.attDetail4 == "") {
              addError("buildingDistrict", "กรุณาเลือกตำบล/แขวงให้ถูกต้อง");
            }
          }
          //สิ่งปลูกสร้างอื่นๆ
          if (item.attActionType1 == "3") {
            const arrDetailForCheck = submitData.instInfo[0]?.attachDetail?.arrayDetail?.find((detailItem) => detailItem?.attActionType1 == "3") as AttachDetailItem | undefined;
            if (arrDetailForCheck?.attDetail1 == "") {
              addError("otherName", "กรุณากรอกชื่อสิ่งปลูกสร้างอื่นๆ");
            }
            if (arrDetailForCheck?.attDetail2 == "") {
              addError("otherProvince", "กรุณาเลือกจังหวัดให้ถูกต้อง");
            }
            if (arrDetailForCheck?.attDetail3 == "") {
              addError("otherAmphoe", "กรุณาเลือกอำเภอ/เขตให้ถูกต้อง");
            }
            if (arrDetailForCheck?.attDetail4 == "") {
              addError("otherDistrict", "กรุณาเลือกตำบล/แขวงให้ถูกต้อง");
            }
            if (arrDetailForCheck?.attDetail5 == "") {
              addError("otherBuildingNumber", "กรุณากรอกเลขที่สิ่งปลูกสร้างอื่นๆ");
            }
          }
        } else if (contractForm.actionType == "2") {
          //รถยนต์ใหม่
          if (item.attActionType1 == "1") {
            const arrDetailForCheck = submitData.instInfo[0]?.attachDetail?.arrayDetail?.find((detailItem) => detailItem?.attActionType1 == "1") as AttachDetailItem | undefined;
            if (arrDetailForCheck?.attDetail1 == "") {
              addError("newCarBrand", "กรุณากรอกยี่ห้อรถ");
            }
            if (arrDetailForCheck?.attDetail2 == "") {
              addError("newCarModel", "กรุณากรอกรุ่นรถ");
            }
            if (arrDetailForCheck?.attDetail3 == "") {
              addError("newCarRegistrationNumber", "กรุณากรอกเลขทะเบียนรถ");
            }
            if (arrDetailForCheck?.attDetail4 == "") {
              addError("newCarEngineNumber", "กรุณากรอกเลขเครื่องยนต์");
            }
            if (arrDetailForCheck?.attDetail5 == "") {
              addError("newCarFrameNumber", "กรุณากรอกเลขตัวถัง");
            }
            if (arrDetailForCheck?.attDetail6 == "") {
              addError("newCarColor", "กรุณากรอกสีรถ");
            }
          }
          //รถยนต์เก่า
          if (item.attActionType1 == "2") {
            const arrDetailForCheck = submitData.instInfo[0]?.attachDetail?.arrayDetail?.find((detailItem) => detailItem?.attActionType1 == "2") as AttachDetailItem | undefined;
            if (arrDetailForCheck?.attDetail1 == "") {
              addError("oldCarBrand", "กรุณากรอกยี่ห้อรถ");
            }
            if (arrDetailForCheck?.attDetail2 == "") {
              addError("oldCarModel", "กรุณากรอกรุ่นรถ");
            }
            if (arrDetailForCheck?.attDetail3 == "") {
              addError("oldCarRegistrationNumber", "กรุณากรอกเลขทะเบียนรถ");
            }
            if (arrDetailForCheck?.attDetail4 == "") {
              addError("oldCarEngineNumber", "กรุณากรอกเลขเครื่องยนต์");
            }
            if (arrDetailForCheck?.attDetail5 == "") {
              addError("oldCarFrameNumber", "กรุณากรอกเลขตัวถัง");
            }
            if (arrDetailForCheck?.attDetail6 == "") {
              addError("oldCarColor", "กรุณากรอกสีรถ");
            }
          }
          //รถจักรยานยนต์ใหม่
          if (item.attActionType1 == "3") {
            const arrDetailForCheck = submitData.instInfo[0]?.attachDetail?.arrayDetail?.find((detailItem) => detailItem?.attActionType1 == "3") as AttachDetailItem | undefined;
            if (arrDetailForCheck?.attDetail1 == "") {
              addError("newBicycleBrand", "กรุณากรอกยี่ห้อรถ");
            }
            if (arrDetailForCheck?.attDetail2 == "") {
              addError("newBicycleModel", "กรุณากรอกรุ่นรถ");
            }
            if (arrDetailForCheck?.attDetail3 == "") {
              addError("newBicycleRegistrationNumber", "กรุณากรอกเลขทะเบียนรถ");
            }
            if (arrDetailForCheck?.attDetail4 == "") {
              addError("newBicycleEngineNumber", "กรุณากรอกเลขเครื่องยนต์");
            }
            if (arrDetailForCheck?.attDetail5 == "") {
              addError("newBicycleFrameNumber", "กรุณากรอกเลขตัวถัง");
            }
            if (arrDetailForCheck?.attDetail6 == "") {
              addError("newBicycleColor", "กรุณากรอกสีรถ");
            }
          }
          //รถจักรยานยนต์เก่า
          if (item.attActionType1 == "4") {
            const arrDetailForCheck = submitData.instInfo[0]?.attachDetail?.arrayDetail?.find((detailItem) => detailItem?.attActionType1 == "4") as AttachDetailItem | undefined;
            if (arrDetailForCheck?.attDetail1 == "") {
              addError("oldBicycleBrand", "กรุณากรอกยี่ห้อรถ");
            }
            if (arrDetailForCheck?.attDetail2 == "") {
              addError("oldBicycleModel", "กรุณากรอกรุ่นรถ");
            }
            if (arrDetailForCheck?.attDetail3 == "") {
              addError("oldBicycleRegistrationNumber", "กรุณากรอกเลขทะเบียนรถ");
            }
            if (arrDetailForCheck?.attDetail4 == "") {
              addError("oldBicycleEngineNumber", "กรุณากรอกเลขเครื่องยนต์");
            }
            if (arrDetailForCheck?.attDetail5 == "") {
              addError("oldBicycleFrameNumber", "กรุณากรอกเลขตัวถัง");
            }
            if (arrDetailForCheck?.attDetail6 == "") {
              addError("oldBicycleColor", "กรุณากรอกสีรถ");
            }
          }
          //สังหาริมทรัพย์อื่นๆ
          if (item.attActionType1 == "5") {
            const arrDetailForCheck = submitData.instInfo[0]?.attachDetail?.arrayDetail?.find((detailItem) => detailItem?.attActionType1 == "5") as AttachDetailItem | undefined;
            if (arrDetailForCheck?.attDetail4 == "") {
              addError("otherMovablePropertyType", "กรุณากรอกประเภททรัพย์สิน");
            }
            if (arrDetailForCheck?.attDetail6 == "") {
              addError("otherMovableBrand", "กรุณากรอกชื่อประเภทสังหาริมทรัพย์อื่นๆ");
            }
          }
        }
      });
    }

    // ตรวจสอบ error จาก errArray documentTypeCode is ลักษณะแห่งตราสาร 4 ค่าเช่า หรือประมาณการค่าเช่า
    if (contractForm.documentTypeCode == "4") {
      if (submitData.instInfo[0]?.attachDetail?.detail1 == "") {
        addError("detail4", "กรุณากรอกงานที่รับจ้าง");
      }
      if (submitData.instInfo[0]?.attachDetail?.number == 0) {
        addError("number", "กรุณากรอกจำนวนงวดให้ถูกต้อง");
      }
      if (submitData.instInfo[0]?.instAmount == 0) {
        addError("totalAmount", "กรุณากรอกมูลค่าในตราสารให้ถูกต้อง");
      }
    }

    // ตรวจสอบ error จาก errArray documentTypeCode is ลักษณะแห่งตราสาร 7 รายละเอียดการมอบอำนาจ
    if (contractForm.documentTypeCode == "7") {
      if (submitData.instInfo[0]?.attachDetail?.actionType == "") {
        addError("actionType7", "กรุณาเลือกเงื่อนไขการมอบอำนาจ");
      }
      if (submitData.instInfo[0]?.attachDetail?.detail1 == "") {
        addError("detail7", "กรุณากรอกรายละเอียดการมอบอำนาจให้ถูกต้อง");
      }
    }

    // ตรวจสอบ error จาก errArray documentTypeCode is ลักษณะแห่งตราสาร 17 คู่สัญญา
    if (contractForm.documentTypeCode == "17") {
      if (submitData.instInfo[0]?.attachDetail?.actionType == "") {
        addError("actionType17", "กรุณาเลือกเงื่อนไขการค้ำประกัน");
      }
      if (submitData.instInfo[0]?.relateContract[0]?.specifiedTaxRegistration?.id == "") {
        addError("relateTaxRegistrationId", "กรุณากรอกเลขประจำตัวผู้เสียภาษีอากรให้ถูกต้อง");
      }
      if (submitData.instInfo[0]?.relateContract[0]?.specifiedTaxRegistration?.id.length != 13) {
        addError("relateTaxRegistrationIdLength", "กรุณากรอกเลขประจำตัวผู้เสียภาษีอากร 13 หลัก");
      }
      if (submitData.instInfo[0]?.relateContract[0]?.name == "") {
        addError("relateTaxRegistrationName", "กรุณากรอกชื่อให้ถูกต้อง");
      }
    }

    // ตรวจสอบ error จาก errArray documentTypeCode is ลักษณะแห่งตราสาร 28 ข้อมูลคู่สัญญา
    if (contractForm.documentTypeCode == "28") {
    }

    setErrArray(newErrors); // Set errors once at the end
    // console.log("b2bformData =>", B2BformData);
    // console.log("submitData Submit =>",submitData);
    // console.log("newErrors =>", newErrors);
    if (newErrors.length === 0) { // Check the length of the newErrors array
      await appEmitter.emit("estampSaved");
      await appEmitter.emit("eStampForm", { payload: submitData });
    } else {
      message.error("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง"); // Display error message if there are errors
    }
  }

  // Handle form reset
  const handleReset = () => {
    dispatch(resetForm({ except: [] }));
    setErrArray([]);
    message.info("รีเซ็ตฟอร์มแล้ว");
  };

  const handleClose = () => {
    onClose();
    handleReset(); // Clear form on close
  };

  // สร้างข้อมูลที่มี type สำหรับ props ของ StampPropertyDetails
  const [propertyRentalData, setPropertyRentalData] =
    useState<AttachDetailItem>({
      attType: "1", // ทรัพย์สินที่เช่า
      attActionType1: "0", // เริ่มต้นเป็น "0" (ไม่เลือก)
      attActionType2: "0", // เริ่มต้นเป็น "0" (ไม่เลือก)
      attDetail1: contractForm.propertyAddress?.buildingNumber || "",
      attDetail2: contractForm.propertyAddress?.citySubDivisionName || "",
      attDetail3: contractForm.propertyAddress?.cityName || "",
      attDetail4: contractForm.propertyAddress?.countrySubDivisionName || "",
      attDetail5: contractForm.propertyTypeOther || "",
    });

  const [rentalPriceData, setRentalPriceData] = useState<AttachDetailItem>({
    attType: "2", // ค่าเช่า หรือประมาณการค่าเช่า
    attActionType1: "0", // เริ่มต้นเป็น "0" (ไม่เลือก)
    attActionType2: "0", // เริ่มต้นเป็น "0" (ไม่เลือก)
    attNumber1: contractForm.rentalMonths || 0,
    attAmount1: contractForm.monthlyRent || 0,
    attAmount2: contractForm.keyMoney || 0,
    attAmount3: contractForm.totalAmount || 0,
  });

  // สร้าง state แยกสำหรับข้อมูลที่อยู่ของ party
  const [partyAddressData, setPartyAddressData] = useState({
    citySubDivisionName: contractForm.citySubDivisionName || "",
    cityName: contractForm.cityName || "",
    countrySubDivisionName: contractForm.countrySubDivisionName || "",
    postCode: contractForm.postCode || "",
  });

  const handleConfirmSave = async () => {
    // console.log("handleConfirmSave");
    await appEmitter.emit("formSaved");
    onClose()
  };

  // อัพเดทข้อมูลเมื่อ form เปลี่ยน
  useEffect(() => {
    setPropertyRentalData((prev) => ({
      ...prev,
      attDetail1: contractForm.propertyAddress?.buildingNumber || "",
      attDetail2: contractForm.propertyAddress?.citySubDivisionName || "",
      attDetail3: contractForm.propertyAddress?.cityName || "",
      attDetail4: contractForm.propertyAddress?.countrySubDivisionName || "",
      attDetail5: contractForm.propertyTypeOther || "",
    }));

    setRentalPriceData((prev) => ({
      ...prev,
      attNumber1: contractForm.rentalMonths || 0,
      attAmount1: contractForm.monthlyRent || 0,
      attAmount2: contractForm.keyMoney || 0,
      attAmount3: contractForm.totalAmount || 0,
    }));
  }, [
    contractForm.propertyAddress,
    contractForm.propertyTypeOther,
    contractForm.rentalMonths,
    contractForm.monthlyRent,
    contractForm.keyMoney,
    contractForm.totalAmount,
  ]);

  // Handler สำหรับอัพเดท propertyRentalData
  const handlePropertyRentalDataChange = (data: AttachDetailItem) => {
    setPropertyRentalData(data);
  };

  // Handler สำหรับอัพเดท rentalPriceData
  const handleRentalPriceDataChange = (data: AttachDetailItem) => {
    setRentalPriceData(data);
  };

  // Handler สำหรับอัพเดท partyAddressData
  const handlePartyAddressChange = (address: any) => {
    setPartyAddressData({
      citySubDivisionName: address.district || "",
      cityName: address.amphoe || "",
      countrySubDivisionName: address.province || "",
      postCode: address.zipcode || "",
    });
  };

  // if (B2BformData?.forms?.docsTypeDetail.paymentChannel == "นอกระบบ") {
  //   return (
  //     <>
  //       <ConfirmModal
  //         titleName="ยืนยัน"
  //         message="คุณต้องการส่งเอกสารนี้ หรือไม่?"
  //         open={open}
  //         onConfirm={handleConfirmSave}
  //         onCancel={onClose}
  //         modalIcon={confirmIcon.src}
  //         />
  //     </>
  //   )
  // }
  return (
    <Modal
      title={
        <div className="text-center text-theme font-extrabold w-full text-lg">
          {title}
        </div>
      }
      centered
      open={open}
      onCancel={handleClose}
      width="90vw"
      style={{
        maxWidth: "1400px",
        width: "90vw",
      }}
      confirmLoading={isLoading}
      closeIcon={
        <span className="hover:opacity-70 rounded-full cursor-pointer inline-flex items-center justify-center">
          <X size={20} onClick={handleClose} />
        </span>
      }
      className="[&_.ant-modal-content]:rounded-[24px] [&.ant-modal]:!max-w-[1400px] [&.ant-modal]:!w-[90vw] [&.ant-modal]:!left-[50%] [&.ant-modal]:!top-[50%] [&.ant-modal]:!transform [&.ant-modal]:!-translate-x-[50%] [&.ant-modal]:!-translate-y-[50%] !max-w-[1400px] !w-[90vw] [&.ant-modal]:!fixed [&.ant-modal]:!inset-0 [&.ant-modal]:!flex [&.ant-modal]:!items-center [&.ant-modal]:!justify-center"
      wrapClassName=""
      modalRender={(node) => <div className="relative">{node}</div>}
      footer={
        <div className="absolute bottom-0 left-0 right-0 bg-white shadow-[0px_-4px_8px_-2px_rgba(78,115,248,0.04)] py-4 rounded-b-[24px]">
          <div className="flex w-full justify-center items-center gap-6">
            <Button
              type="text"
              className="w-24 text-theme btn py-4"
              onClick={handleClose}
            >
              ยกเลิก
            </Button>
            <button className="btn-theme" onClick={handleSubmit}>
              {isLoading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </div>
      }
    >
      <div className="mt-8 mb-20 max-h-[70vh] overflow-y-auto">
        <Form>
          {/* ประเภทการยื่นตราสาร */}
          <StampSubmissionType
            documentSubmissionType={documentSubmissionType}
            onDocumentSubmissionTypeChange={setDocumentSubmissionType}
          />

          {/* ลักษณะตราสารอิเล็กทรอนิกส์ + ผู้ขอเสียอากรแสตมป์ในฐานะ*/}
          <StampEsign
            onDocumentTypeChange={setSelectedDocumentType}
            onRelationshipChange={setSelectedRelationship}
            onClearErrors={clearErrors}
            errArray={errArray}
          />

          {/* รายละเอียดเกี่ยวกับสัญญา */}
          <StampContractDetails errArray={errArray} />

          {/* รายละเอียดเกี่ยวกับตราสาร */}
          <StampPropertyDetails
            key={resetKey}
            // ส่งข้อมูล arrayDetail.attType === "1" (ทรัพย์สินที่เช่า)
            propertyRentalData={propertyRentalData}
            // ส่งข้อมูล arrayDetail.attType === "2" (ค่าเช่า หรือประมาณการค่าเช่า)
            rentalPriceData={rentalPriceData}
            onPropertyRentalDataChange={handlePropertyRentalDataChange}
            onRentalPriceDataChange={handleRentalPriceDataChange}
            documentTypeCode={contractForm.documentTypeCode}
            errArray={errArray}
          />

          {/* ข้อมูลคู่สัญญา (ผู้ให้เช่า) */}
          {
            isCoBusinessDetail && (
              <StampPartyDetails disabled={true} onAddressChange={handlePartyAddressChange} errArray={errArray} />
            )
          }
        </Form>
      </div>
    </Modal>
  );
};

export default ModalEstamp;
