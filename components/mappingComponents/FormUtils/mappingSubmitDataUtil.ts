import { ContractFormState } from "@/store/types/contractFormType";

interface MappingSubmitDataUtilProps {
    documentTypeCode?: string;
    contractForm: ContractFormState;
}

export const mappingSubmitDataUtil = ({ documentTypeCode, contractForm }: MappingSubmitDataUtilProps) => {

    switch (documentTypeCode) {
        case "1":
          const arrayDetailDocumentType1 = contractForm.arrayDetail.map((item) => {
            if (item.attType === "1") {
              if (item.attActionType1 === "1") {
                return {
                  attType: "1",
                  attActionType1: "1",
                  attActionType2: contractForm.landPropertyType,
                  attDetail1: contractForm.landBuildingNumber,
                  attDetail2: contractForm.landProvince,
                  attDetail3: contractForm.landAmphoe,
                  attDetail4: contractForm.landDistrict,
                  attDetail5: contractForm.landPropertyTypeOther,
                  attDetail6: contractForm.landNumber1,
                }
              }
              if (item.attActionType1 === "2") {
                return {
                  attType: "1",
                  attActionType1: "2",
                  attActionType2: contractForm.buildingPropertyType,
                  attDetail1: contractForm.buildingBuildingNumber,
                  attDetail2: contractForm.buildingProvince,
                  attDetail3: contractForm.buildingAmphoe,
                  attDetail4: contractForm.buildingDistrict,
                  attDetail5: contractForm.buildingPropertyTypeOther,
                }
              }
              if (item.attActionType1 === "3") {
                return {
                  attType: "1",
                  attActionType1: "3",
                  attDetail1: contractForm.otherBuildingNumber,
                  attDetail2: contractForm.otherProvince,
                  attDetail3: contractForm.otherAmphoe,
                  attDetail4: contractForm.otherDistrict,
                  attDetail5: contractForm.otherName,
                }
              }
              if (item.attActionType1 === "4") {
                return {
                  attType: "1",
                  attActionType1: "4",
                  attDetail1: contractForm.raftNumber,
                  attDetail2: contractForm.raftProvince,
                  attDetail3: contractForm.raftAmphoe,
                  attDetail4: contractForm.raftDistrict,
                }
              }
            } else if (item.attType === "2") {
              if (item.attActionType1 === "1") {
                return {
                  attType: "2",
                  attActionType1: "1",
                  attAmount1: contractForm.monthlyRent,
                  attAmount2: contractForm.keyMoney,
                  attAmount3: contractForm.totalAmount,
                  attNumber1: contractForm.rentalMonths,
                }
              }
              if (item.attActionType1 === "2") {
                return {
                  attType: "2",
                  attActionType1: "2",
                  attAmount1: contractForm.yearlyRent,
                  attAmount2: contractForm.keyMoneyYearly,
                  attAmount3: contractForm.totalAmountYearly,
                  attNumber1: contractForm.rentalYearly,
                }
              }
              if (item.attActionType1 === "3") {
                return {
                  attType: "2",
                  attActionType1: "3",
                  attDetail1: contractForm.detailEstimateRent,
                  attAmount1: contractForm.estimateRent,
                  attAmount2: contractForm.keyMoneyEstimate,
                  attAmount3: contractForm.totalAmountEstimate,
                }
              }
              if (item.attActionType1 === "4") {
                return {
                  attType: "2",
                  attActionType1: "4",
                  attAmount1: contractForm.rentCost,
                  attAmount2: contractForm.keyMoneyRentCost,
                  attAmount3: contractForm.totalRentCost,
                }
              }
            }
          })
            // return {
            //       actionType: "0",
            //       arrayDetail: [
            //         {
            //           attType: "1", // ทรัพย์สินที่เช่า
            //           attActionType1: "3", // สิ่งปลูกสร้างอื่น
            //           attActionType2: "1", // ชำระค่าเช่าเป็นรายเดือน
            //           attDetail1:
            //             contractForm.propertyAddress?.buildingNumber || "",
            //           attDetail2:
            //             contractForm.propertyAddress?.citySubDivisionName || "",
            //           attDetail3: contractForm.propertyAddress?.cityName || "",
            //           attDetail4:
            //             contractForm.propertyAddress?.countrySubDivisionName || "",
            //           attDetail5: contractForm.propertyTypeOther || "",
            //         },
            //         {
            //           attType: "2", // ค่าเช่า หรือประมาณการค่าเช่า
            //           attActionType1: "1", // ชำระค่าเช่าเป็นรายเดือน
            //           attActionType2: "1", // ชำระค่าเช่าเป็นรายเดือน (สำหรับ checkbox condition)
            //           attNumber1: contractForm.rentalMonths || 0,
            //           attAmount1: contractForm.monthlyRent || 0,
            //           attAmount2: contractForm.keyMoney || 0,
            //           attAmount3: contractForm.totalAmount || 0,
            //         },
            //       ],
            //     }
          return {
            actionType: "0",
            arrayDetail: arrayDetailDocumentType1
          };
        case "3":
                
              const arrayDetailDocumentType3 = contractForm.arrayDetail.map((item) => {
                if (contractForm.actionType === "1") {
                  if (item.attActionType1 === "1") {
                    return {
                      attType: "1",
                      attActionType1: "1",
                      attActionType2: contractForm.landPropertyType,
                      attDetail1: contractForm.landBuildingNumber,
                      attDetail2: contractForm.landProvince,
                      attDetail3: contractForm.landAmphoe,
                      attDetail4: contractForm.landDistrict,
                      attDetail5: contractForm.landPropertyTypeOther,
                      attDetail6: contractForm.landNumber1,
                    }
                  }
                  if (item.attActionType1 === "2") {
                    return {
                      attType: "1",
                      attActionType1: "2",
                      attActionType2: contractForm.buildingPropertyType,
                      attDetail1: contractForm.buildingBuildingNumber,
                      attDetail2: contractForm.buildingProvince,
                      attDetail3: contractForm.buildingAmphoe,
                      attDetail4: contractForm.buildingDistrict,
                      attDetail5: contractForm.buildingPropertyTypeOther,
                    }
                  }
                  if (item.attActionType1 === "3") {
                    return {
                      attType: "1",
                      attActionType1: "3",
                      attActionType2: null,
                      attDetail1: contractForm.otherBuildingNumber,
                      attDetail2: contractForm.otherProvince,
                      attDetail3: contractForm.otherAmphoe,
                      attDetail4: contractForm.otherDistrict,
                      attDetail5: contractForm.otherName,
                    }
                  }
                } else if (contractForm.actionType === "2") {
                  if (item.attActionType1 === "1") {
                    return {
                      attType: "2",
                      attActionType1: "1",
                      attActionType2: "",
                      attDetail1: contractForm.newCarBrand,
                      attDetail2: contractForm.newCarModel,
                      attDetail3: contractForm.newCarRegistrationNumber,
                      attDetail4: contractForm.newCarEngineNumber,
                      attDetail5: contractForm.newCarFrameNumber,
                      attDetail6: contractForm.newCarColor,
                    }
                  }
                  if (item.attActionType1 === "2") {
                    return {
                      attType: "2",
                      attActionType1: "2",
                      attActionType2: "",
                      attDetail1: contractForm.oldCarBrand,
                      attDetail2: contractForm.oldCarModel,
                      attDetail3: contractForm.oldCarRegistrationNumber,
                      attDetail4: contractForm.oldCarEngineNumber,
                      attDetail5: contractForm.oldCarFrameNumber,
                      attDetail6: contractForm.oldCarColor,
                    }
                  }
                  if (item.attActionType1 === "3") {
                    return {
                      attType: "2",
                      attActionType1: "3",
                      attActionType2: "",
                      attDetail1: contractForm.newBicycleBrand,
                      attDetail2: contractForm.newBicycleModel,
                      attDetail3: contractForm.newBicycleRegistrationNumber,
                      attDetail4: contractForm.newBicycleEngineNumber,
                      attDetail5: contractForm.newBicycleFrameNumber,
                      attDetail6: contractForm.newBicycleColor,
                    }
                  }
                  if (item.attActionType1 === "4") {
                    return {
                      attType: "2",
                      attActionType1: "4",
                      attActionType2: "",
                      attDetail1: contractForm.oldBicycleBrand,
                      attDetail2: contractForm.oldBicycleModel,
                      attDetail3: contractForm.oldBicycleRegistrationNumber,
                      attDetail4: contractForm.oldBicycleEngineNumber,
                      attDetail5: contractForm.oldBicycleFrameNumber,
                      attDetail6: contractForm.oldBicycleColor,
                    }
                  }
                  if (item.attActionType1 === "5") {
                    return {
                      attType: "2",
                      attActionType1: "5",
                      attActionType2: "",
                      attDetail1: contractForm.otherMovableBrand,
                      attDetail2: contractForm.otherMovableModel,
                      attDetail3: contractForm.otherMovableSerialNumber,
                      attDetail4: contractForm.otherMovablePropertyType,
                      attDetail5: contractForm.otherMovableOther,
                      attDetail6: contractForm.otherMovablePropertyName,
                    }
                  }
                }
              })

            return {
              actionType: contractForm.actionType,
              amount: contractForm.amount1,
              amount1: contractForm.amount2,
              amount2: contractForm.amount3,
              number: contractForm.number1,
              // detail1: contractForm.attachDetail1,
              arrayDetail: arrayDetailDocumentType3
            };
        case "4":
            return {
              amount: contractForm.amount1,
              number: contractForm.number1,
              detail1: contractForm.attachDetail1,
            };
        case "7":
            return {
                    actionType: contractForm.actionType,
                    detail1: contractForm.attachDetail1
            };
        case "17":
            return {
              actionType: contractForm.actionType,
            };
        case "28":
            return {};
    }
}

export const mappingRelateContractFormUtil = ({ contractForm }: MappingSubmitDataUtilProps) => {
    return [{ // ผู้เกี่ยวข้องกับสัญญา มาตรา[17]->  รายการ เจ้าหนี้/ผู้ว่าจ้าง
      specifiedTaxRegistration: {
            id: contractForm.relateTaxRegistrationId
        },
        // titleName: "",
        name: contractForm.relateTaxRegistrationName,
        // surname: "",
        // branchNo: "",
        // branchType: ""
  }]
}