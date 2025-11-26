import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ContractFormState, initialContractFormState, ContractFormData } from '../types/contractFormType';

const contractFormSlice = createSlice({
  name: 'contractForm',
  initialState: initialContractFormState,
  reducers: {
    // Document Details
    setDocumentTypeCode: (state, action: PayloadAction<string>) => {state.documentTypeCode = action.payload;},

    // Contract Information
    setContractId: (state, action: PayloadAction<string>) => {state.contractId = action.payload;},
    setContractNo: (state, action: PayloadAction<string>) => {state.contractNo = action.payload;},
    setCreationDate: (state, action: PayloadAction<string>) => {state.creationDate = action.payload;},
    setEffectiveDate: (state, action: PayloadAction<string>) => {state.effectiveDate = action.payload;},
    setExpireDate: (state, action: PayloadAction<string>) => {state.expireDate = action.payload;},
    setExpireDateText: (state, action: PayloadAction<string>) => {state.expireDateText = action.payload;},
    setReceiveDate: (state, action: PayloadAction<string>) => {state.receiveDate = action.payload;},
    setSendFormType: (state, action: PayloadAction<string>) => {state.sendFormType = action.payload;},
    setFilingNo: (state, action: PayloadAction<number>) => {state.filingNo = action.payload;},
    setDupNumber: (state, action: PayloadAction<number>) => {state.dupNumber = action.payload;},
    setInstAmount: (state, action: PayloadAction<number>) => {state.instAmount = action.payload;},
    setPartyRelationship: (state, action: PayloadAction<string>) => {state.partyRelationship = action.payload;},

    // Party Information
    setPartyTitleName: (state, action: PayloadAction<string>) => {state.partyTitleName = action.payload;},
    setPartyName: (state, action: PayloadAction<string>) => {state.partyName = action.payload;},
    setPartyMidname: (state, action: PayloadAction<string>) => {state.partyMidname = action.payload;},
    setPartySurname: (state, action: PayloadAction<string>) => {state.partySurname = action.payload;},
    setPartyBranchNo: (state, action: PayloadAction<string>) => {state.partyBranchNo = action.payload;},
    setPartyBranchType: (state, action: PayloadAction<string>) => {state.partyBranchType = action.payload;},
    setPartyForeignType: (state, action: PayloadAction<number>) => {state.partyForeignType = action.payload;},

    // Address Information
    setBuildingName: (state, action: PayloadAction<string>) => {state.buildingName = action.payload;},
    setRoomNo: (state, action: PayloadAction<string>) => {state.roomNo = action.payload;},
    setFloorNo: (state, action: PayloadAction<string>) => {state.floorNo = action.payload;},
    setVillageName: (state, action: PayloadAction<string>) => {state.villageName = action.payload;},
    setBuildingNumber: (state, action: PayloadAction<string>) => {state.buildingNumber = action.payload;},
    setMoo: (state, action: PayloadAction<string>) => {state.moo = action.payload;},
    setSoiName: (state, action: PayloadAction<string>) => {state.soiName = action.payload;},
    setJunctionName: (state, action: PayloadAction<string>) => {state.junctionName = action.payload;},
    setStreetName: (state, action: PayloadAction<string>) => {state.streetName = action.payload;},
    setCitySubDivisionName: (state, action: PayloadAction<string>) => {state.citySubDivisionName = action.payload;},
    setCityName: (state, action: PayloadAction<string>) => {state.cityName = action.payload;},
    setCountrySubDivisionName: (state, action: PayloadAction<string>) => {state.countrySubDivisionName = action.payload;},
    setPostCode: (state, action: PayloadAction<string>) => {state.postCode = action.payload;},
    setCountryId: (state, action: PayloadAction<string>) => {state.countryId = action.payload;},

    // Tax Registration
    setTaxRegistrationId: (state, action: PayloadAction<string>) => {state.taxRegistrationId = action.payload;},

    // Property Details
    setPropertyType: (state, action: PayloadAction<string>) => {state.propertyType = action.payload;},
    setPropertyTypeOther: (state, action: PayloadAction<string>) => {state.propertyTypeOther = action.payload;},
    setPropertyAddress: (state, action: PayloadAction<{
      buildingNumber: string;
      citySubDivisionName: string;
      cityName: string;
      countrySubDivisionName: string;
    }>) => {
      state.propertyAddress = action.payload;
    },

    // Rental Details
    setMonthlyRent: (state, action: PayloadAction<number>) => {
      state.monthlyRent = action.payload;
      // คำนวณ totalAmount อัตโนมัติ
      state.totalAmount = (state.monthlyRent * state.rentalMonths) + state.keyMoney;
      // คำนวณ instAmount อัตโนมัติ
      state.instAmount = state.totalAmount + state.totalAmountYearly + state.totalAmountEstimate + state.totalRentCost;
    },
    setKeyMoney: (state, action: PayloadAction<number>) => {
      state.keyMoney = action.payload;
      // คำนวณ totalAmount อัตโนมัติ
      state.totalAmount = (state.monthlyRent * state.rentalMonths) + state.keyMoney;
      // คำนวณ instAmount อัตโนมัติ
      state.instAmount = state.totalAmount + state.totalAmountYearly + state.totalAmountEstimate + state.totalRentCost;
    },
    setTotalAmount: (state, action: PayloadAction<number>) => {
      state.totalAmount = action.payload;
      // คำนวณ instAmount อัตโนมัติ
      state.instAmount = state.totalAmount + state.totalAmountYearly + state.totalAmountEstimate + state.totalRentCost;
    },
    setRentalMonths: (state, action: PayloadAction<number>) => {
      state.rentalMonths = action.payload;
      // คำนวณ totalAmount อัตโนมัติ
      state.totalAmount = (state.monthlyRent * state.rentalMonths) + state.keyMoney;
      // คำนวณ instAmount อัตโนมัติ
      state.instAmount = state.totalAmount + state.totalAmountYearly + state.totalAmountEstimate + state.totalRentCost;
    },

    // Loading and Error States
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setAttachDetail1: (state, action: PayloadAction<string>) => {
      state.attachDetail1 = action.payload;
    },
    setNumber1: (state, action: PayloadAction<number>) => {
      state.number1 = action.payload;
    },
    setActionType: (state, action: PayloadAction<string>) => {
      state.actionType = action.payload;
    },
    setRelateTaxRegistrationId: (state, action: PayloadAction<string>) => {
      state.relateTaxRegistrationId = action.payload;
    },
    setRelateTaxRegistrationName: (state, action: PayloadAction<string>) => {
      state.relateTaxRegistrationName = action.payload;
    },
    setAmount1: (state, action: PayloadAction<number>) => {
      state.amount1 = action.payload;
    },
    setAmount2: (state, action: PayloadAction<number>) => {
      state.amount2 = action.payload;
    },
    setAmount3: (state, action: PayloadAction<number>) => {
      state.amount3 = action.payload;
    },
    setAmount4: (state, action: PayloadAction<number>) => {
      state.amount4 = action.payload;
    },
    //ที่ดิน
    setLandPropertyType: (state, action: PayloadAction<string>) => {
      state.landPropertyType = action.payload;
    },
    setLandPropertyTypeOther: (state, action: PayloadAction<string>) => {
      state.landPropertyTypeOther = action.payload;
    },
    setLandBuildingNumber: (state, action: PayloadAction<string>) => {
      state.landBuildingNumber = action.payload;
    },
    setLandNumber1: (state, action: PayloadAction<string>) => {
      state.landNumber1 = action.payload;
    },
    setLandProvince: (state, action: PayloadAction<string>) => {
      state.landProvince = action.payload;
    },
    setLandAmphoe: (state, action: PayloadAction<string>) => {
      state.landAmphoe = action.payload;
    },
    setLandDistrict: (state, action: PayloadAction<string>) => {
      state.landDistrict = action.payload;
    },
    //โรงเรือน
    setBuildingPropertyType: (state, action: PayloadAction<string>) => {
      state.buildingPropertyType = action.payload;
    },
    setBuildingPropertyTypeOther: (state, action: PayloadAction<string>) => {
      state.buildingPropertyTypeOther = action.payload;
    },
    setBuildingBuildingNumber: (state, action: PayloadAction<string>) => {
      state.buildingBuildingNumber = action.payload;
    },
    setBuildingProvince: (state, action: PayloadAction<string>) => {
      state.buildingProvince = action.payload;
    },
    setBuildingAmphoe: (state, action: PayloadAction<string>) => {
      state.buildingAmphoe = action.payload;
    },
    setBuildingDistrict: (state, action: PayloadAction<string>) => {
      state.buildingDistrict = action.payload;
    },
    //สิ่งปลูกสร้างอื่น
    setOtherName: (state, action: PayloadAction<string>) => {
      state.otherName = action.payload;
    },
    setOtherBuildingNumber: (state, action: PayloadAction<string>) => {
      state.otherBuildingNumber = action.payload;
    },
    setOtherProvince: (state, action: PayloadAction<string>) => {
      state.otherProvince = action.payload;
    },
    setOtherAmphoe: (state, action: PayloadAction<string>) => {
      state.otherAmphoe = action.payload;
    },
    setOtherDistrict: (state, action: PayloadAction<string>) => {
      state.otherDistrict = action.payload;
    },
    //แพ
    setRaftNumber: (state, action: PayloadAction<string>) => {
      state.raftNumber = action.payload;
    },
    setRaftProvince: (state, action: PayloadAction<string>) => {
      state.raftProvince = action.payload;
    },
    setRaftAmphoe: (state, action: PayloadAction<string>) => {
      state.raftAmphoe = action.payload;
    },
    setRaftDistrict: (state, action: PayloadAction<string>) => {
      state.raftDistrict = action.payload;
    },
    //รถยนต์ใหม่
    setNewCarBrand: (state, action: PayloadAction<string>) => {
      state.newCarBrand = action.payload;
    },
    setNewCarModel: (state, action: PayloadAction<string>) => {
      state.newCarModel = action.payload;
    },
    setNewCarRegistrationNumber: (state, action: PayloadAction<string>) => {
      state.newCarRegistrationNumber = action.payload;
    },
    setNewCarEngineNumber: (state, action: PayloadAction<string>) => {
      state.newCarEngineNumber = action.payload;
    },
    setNewCarFrameNumber: (state, action: PayloadAction<string>) => {
      state.newCarFrameNumber = action.payload;
    },
    setNewCarColor: (state, action: PayloadAction<string>) => {
      state.newCarColor = action.payload;
    },
    //รถยนต์เก่า
    setOldCarBrand: (state, action: PayloadAction<string>) => {
      state.oldCarBrand = action.payload;
    },
    setOldCarModel: (state, action: PayloadAction<string>) => {
      state.oldCarModel = action.payload;
    },
    setOldCarRegistrationNumber: (state, action: PayloadAction<string>) => {
      state.oldCarRegistrationNumber = action.payload;
    },
    setOldCarEngineNumber: (state, action: PayloadAction<string>) => {
      state.oldCarEngineNumber = action.payload;
    },
    setOldCarFrameNumber: (state, action: PayloadAction<string>) => {
      state.oldCarFrameNumber = action.payload;
    },
    setOldCarColor: (state, action: PayloadAction<string>) => {
      state.oldCarColor = action.payload;
    },
    //รถจักรยานยนต์ใหม่
    setNewBicycleBrand: (state, action: PayloadAction<string>) => {
      state.newBicycleBrand = action.payload;
    },
    setNewBicycleModel: (state, action: PayloadAction<string>) => {
      state.newBicycleModel = action.payload;
    },
    setNewBicycleRegistrationNumber: (state, action: PayloadAction<string>) => {
      state.newBicycleRegistrationNumber = action.payload;
    },
    setNewBicycleEngineNumber: (state, action: PayloadAction<string>) => {
      state.newBicycleEngineNumber = action.payload;
    },
    setNewBicycleFrameNumber: (state, action: PayloadAction<string>) => {
      state.newBicycleFrameNumber = action.payload;
    },
    setNewBicycleColor: (state, action: PayloadAction<string>) => {
      state.newBicycleColor = action.payload;
    },
    //รถจักรยานยนต์เก่า
    setOldBicycleBrand: (state, action: PayloadAction<string>) => {
      state.oldBicycleBrand = action.payload;
    },
    setOldBicycleModel: (state, action: PayloadAction<string>) => {
      state.oldBicycleModel = action.payload;
    },
    setOldBicycleRegistrationNumber: (state, action: PayloadAction<string>) => {
      state.oldBicycleRegistrationNumber = action.payload;
    },
    setOldBicycleEngineNumber: (state, action: PayloadAction<string>) => {
      state.oldBicycleEngineNumber = action.payload;
    },
    setOldBicycleFrameNumber: (state, action: PayloadAction<string>) => {
      state.oldBicycleFrameNumber = action.payload;
    },
    setOldBicycleColor: (state, action: PayloadAction<string>) => {
      state.oldBicycleColor = action.payload;
    },
    //สังหาริมทรัพย์อื่นๆ
    setOtherMovablePropertyName: (state, action: PayloadAction<string>) => {
      state.otherMovablePropertyName = action.payload;
    },
    setOtherMovablePropertyType: (state, action: PayloadAction<string>) => {
      state.otherMovablePropertyType = action.payload;
    },
    setOtherMovableBrand: (state, action: PayloadAction<string>) => {
      state.otherMovableBrand = action.payload;
    },
    setOtherMovableModel: (state, action: PayloadAction<string>) => {
      state.otherMovableModel = action.payload;
    },
    setOtherMovableSerialNumber: (state, action: PayloadAction<string>) => {
      state.otherMovableSerialNumber = action.payload;
    },
    setOtherMovableOther: (state, action: PayloadAction<string>) => {
      state.otherMovableOther = action.payload;
    },
    setArrayDetail: (state, action: PayloadAction<{attType: string, attActionType1: string}[]>) => {
      state.arrayDetail = action.payload;
    },

    setYearlyRent: (state, action: PayloadAction<number>) => {
      state.yearlyRent = action.payload;
      // คำนวณ totalAmountYearly อัตโนมัติ
      state.totalAmountYearly = (state.yearlyRent * state.rentalYearly) + state.keyMoneyYearly;
      // คำนวณ instAmount อัตโนมัติ
      state.instAmount = state.totalAmount + state.totalAmountYearly + state.totalAmountEstimate + state.totalRentCost;
    },

    setKeyMoneyYearly: (state, action: PayloadAction<number>) => {
      state.keyMoneyYearly = action.payload;
      // คำนวณ totalAmountYearly อัตโนมัติ
      state.totalAmountYearly = (state.yearlyRent * state.rentalYearly) + state.keyMoneyYearly;
      // คำนวณ instAmount อัตโนมัติ
      state.instAmount = state.totalAmount + state.totalAmountYearly + state.totalAmountEstimate + state.totalRentCost;
    },

    setTotalAmountYearly: (state, action: PayloadAction<number>) => {
      state.totalAmountYearly = action.payload;
      // คำนวณ instAmount อัตโนมัติ
      state.instAmount = state.totalAmount + state.totalAmountYearly + state.totalAmountEstimate + state.totalRentCost;
    },

    setRentalYearly: (state, action: PayloadAction<number>) => {
      state.rentalYearly = action.payload;
      // คำนวณ totalAmountYearly อัตโนมัติ
      state.totalAmountYearly = (state.yearlyRent * state.rentalYearly) + state.keyMoneyYearly;
      // คำนวณ instAmount อัตโนมัติ
      state.instAmount = state.totalAmount + state.totalAmountYearly + state.totalAmountEstimate + state.totalRentCost;
    },

    setDetailEstimateRent: (state, action: PayloadAction<string>) => {
      state.detailEstimateRent = action.payload;
    },

    setEstimateRent: (state, action: PayloadAction<number>) => {
      state.estimateRent = action.payload;
      // คำนวณ totalAmountEstimate อัตโนมัติ
      state.totalAmountEstimate = state.estimateRent + state.keyMoneyEstimate;
      // คำนวณ instAmount อัตโนมัติ
      state.instAmount = state.totalAmount + state.totalAmountYearly + state.totalAmountEstimate + state.totalRentCost;
    },

    setKeyMoneyEstimate: (state, action: PayloadAction<number>) => {
      state.keyMoneyEstimate = action.payload;
      // คำนวณ totalAmountEstimate อัตโนมัติ
      state.totalAmountEstimate = state.estimateRent + state.keyMoneyEstimate;
      // คำนวณ instAmount อัตโนมัติ
      state.instAmount = state.totalAmount + state.totalAmountYearly + state.totalAmountEstimate + state.totalRentCost;
    },

    setTotalAmountEstimate: (state, action: PayloadAction<number>) => {
      state.totalAmountEstimate = action.payload;
      // คำนวณ instAmount อัตโนมัติ
      state.instAmount = state.totalAmount + state.totalAmountYearly + state.totalAmountEstimate + state.totalRentCost;
    },

    setRentCost: (state, action: PayloadAction<number>) => {
      state.rentCost = action.payload;
      // คำนวณ totalRentCost อัตโนมัติ
      state.totalRentCost = state.rentCost + state.keyMoneyRentCost;
      // คำนวณ instAmount อัตโนมัติ
      state.instAmount = state.totalAmount + state.totalAmountYearly + state.totalAmountEstimate + state.totalRentCost;
    },

    setKeyMoneyRentCost: (state, action: PayloadAction<number>) => {
      state.keyMoneyRentCost = action.payload;
      // คำนวณ totalRentCost อัตโนมัติ
      state.totalRentCost = state.rentCost + state.keyMoneyRentCost;
      // คำนวณ instAmount อัตโนมัติ
      state.instAmount = state.totalAmount + state.totalAmountYearly + state.totalAmountEstimate + state.totalRentCost;
    },
    
    setTotalRentCost: (state, action: PayloadAction<number>) => {
      state.totalRentCost = action.payload;
      // คำนวณ instAmount อัตโนมัติ
      state.instAmount = state.totalAmount + state.totalAmountYearly + state.totalAmountEstimate + state.totalRentCost;
    },

    // Reset Form
    resetForm: (state, action: PayloadAction<{ except?: string[] }>) => {
      const except = action.payload?.except || [];
      const initialState = { ...initialContractFormState };
      if (except.includes("documentTypeCode")) {
        initialState.documentTypeCode = state.documentTypeCode;
        // party information
        initialState.partyTitleName = state.partyTitleName;
        initialState.partyName = state.partyName;
        initialState.partySurname = state.partySurname;
        initialState.partyBranchNo = state.partyBranchNo;
        initialState.partyBranchType = state.partyBranchType;
        initialState.partyForeignType = state.partyForeignType;
        // address information
        initialState.buildingName = state.buildingName;
        initialState.roomNo = state.roomNo;
        initialState.floorNo = state.floorNo;
        initialState.villageName = state.villageName;
        initialState.buildingNumber = state.buildingNumber;
        initialState.moo = state.moo;
        initialState.soiName = state.soiName;
        initialState.junctionName = state.junctionName;
        initialState.streetName = state.streetName;
        initialState.citySubDivisionName = state.citySubDivisionName;
        initialState.cityName = state.cityName;
        initialState.countrySubDivisionName = state.countrySubDivisionName;
        initialState.postCode = state.postCode;
        initialState.countryId = state.countryId;
      }
      return { ...initialState };
    },

    // 🎯 NEW: InstInfo Array Management
    addInstInfo: (state) => {
      // Create new InstInfo object from current form state
      const newInstInfo: any = {
        id: state.contractId || `inst_${Date.now()}`,
        contractNo: state.contractNo,
        creationDate: state.creationDate,
        effectiveDate: state.effectiveDate,
        expireDate: state.expireDate,
        expireDateText: state.expireDateText,
        receiveDate: state.receiveDate,
        sendFormType: state.sendFormType,
        filingNo: state.filingNo,
        dupNumber: state.dupNumber,
        instAmount: state.instAmount,
        party: {
          specifiedTaxRegistration: {
            id: state.taxRegistrationId
          },
          titleName: state.partyTitleName,
          name: state.partyName,
          surname: state.partySurname,
          branchNo: state.partyBranchNo,
          branchType: state.partyBranchType,
          foreignType: state.partyForeignType,
          postalTradeAddress: {
            buildingName: state.buildingName,
            roomNo: state.roomNo,
            floorNo: state.floorNo,
            villageName: state.villageName,
            buildingNumber: state.buildingNumber,
            moo: state.moo,
            soiName: state.soiName,
            junctionName: state.junctionName,
            streetName: state.streetName,
            citySubDivisionName: state.citySubDivisionName,
            cityName: state.cityName,
            countrySubDivisionName: state.countrySubDivisionName,
            postCode: state.postCode,
            countryId: state.countryId,
          }
        },
        attachDetail: {
          actionType: state.propertyType,
          arrayDetail: [{
            attType: state.propertyType,
            attActionType1: state.propertyTypeOther,
            attActionType2: "ชำระค่าเช่าเป็นรายเดือน",
            attDetail1: state.propertyAddress.buildingNumber,
            attDetail2: state.propertyAddress.citySubDivisionName,
            attDetail3: state.propertyAddress.cityName,
            attDetail4: state.propertyAddress.countrySubDivisionName,
            attDetail5: "",
            attAmount1: state.monthlyRent,
            attAmount2: state.keyMoney,
            attAmount3: state.totalAmount,
            attNumber1: state.rentalMonths,
          }]
        }
      };
      
      state.instInfoList.push(newInstInfo);
      state.currentInstInfoIndex = state.instInfoList.length - 1;
    },

    removeInstInfo: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      if (index >= 0 && index < state.instInfoList.length) {
        state.instInfoList.splice(index, 1);
        if (state.currentInstInfoIndex >= state.instInfoList.length) {
          state.currentInstInfoIndex = Math.max(0, state.instInfoList.length - 1);
        }
      }
    },

    selectInstInfo: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      if (index >= 0 && index < state.instInfoList.length) {
        state.currentInstInfoIndex = index;
        // Load selected InstInfo data into form fields
        const selectedInstInfo = state.instInfoList[index];
        state.contractId = selectedInstInfo.id;
        state.contractNo = selectedInstInfo.contractNo || '';
        state.taxRegistrationId = selectedInstInfo.party.specifiedTaxRegistration.id;
        state.partyTitleName = selectedInstInfo.party.titleName;
        state.partyName = selectedInstInfo.party.name;
        state.partySurname = selectedInstInfo.party.surname;
        state.instAmount = selectedInstInfo.instAmount;
      }
    },

    updateCurrentInstInfo: (state) => {
      // Update the current InstInfo entry with form data
      if (state.instInfoList[state.currentInstInfoIndex]) {
        const updatedInstInfo = {
          ...state.instInfoList[state.currentInstInfoIndex],
          contractNo: state.contractNo,
          instAmount: state.instAmount,
          party: {
            ...state.instInfoList[state.currentInstInfoIndex].party,
            specifiedTaxRegistration: { id: state.taxRegistrationId },
            titleName: state.partyTitleName,
            name: state.partyName,
            surname: state.partySurname,
          }
        };
        state.instInfoList[state.currentInstInfoIndex] = updatedInstInfo;
      }
    },

    // Set Form Data from API Response
    setFormData: (state, action: PayloadAction<Partial<ContractFormState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const {
  // Document Details
  setDocumentTypeCode,
  
  // InstInfo Array Management
  addInstInfo,
  removeInstInfo,
  selectInstInfo,
  updateCurrentInstInfo,

  // Contract Information
  setContractId,
  setContractNo,
  setCreationDate,
  setEffectiveDate,
  setExpireDate,
  setExpireDateText,
  setReceiveDate,
  setSendFormType,
  setFilingNo,
  setDupNumber,
  setInstAmount,
  setPartyRelationship,

  // Party Information
  setPartyTitleName,
  setPartyName,
  setPartyMidname,
  setPartySurname,
  setPartyBranchNo,
  setPartyBranchType,
  setPartyForeignType,

  // Address Information
  setBuildingName,
  setRoomNo,
  setFloorNo,
  setVillageName,
  setBuildingNumber,
  setMoo,
  setSoiName,
  setJunctionName,
  setStreetName,
  setCitySubDivisionName,
  setCityName,
  setCountrySubDivisionName,
  setPostCode,
  setCountryId,

  // Tax Registration
  setTaxRegistrationId,

  // Property Details
  setPropertyType,
  setPropertyTypeOther,
  setPropertyAddress,

  // Rental Details
  setMonthlyRent,
  setKeyMoney,
  setTotalAmount,
  setRentalMonths,

  // Loading and Error States
  setLoading,
  setError,

  // Reset Form
  resetForm,
  setFormData,

  setAttachDetail1,
  setNumber1,
  setActionType,
  setRelateTaxRegistrationId,
  setRelateTaxRegistrationName,
  setAmount1,
  setAmount2,
  setAmount3,
  setAmount4,
  setLandPropertyType,
  setLandPropertyTypeOther,
  setLandBuildingNumber,
  setLandNumber1,
  setLandProvince,
  setLandAmphoe,
  setLandDistrict,
  setBuildingPropertyType,
  setBuildingPropertyTypeOther,
  setBuildingBuildingNumber,
  setBuildingProvince,
  setBuildingAmphoe,
  setBuildingDistrict,
  setOtherName,
  setOtherBuildingNumber,
  setOtherProvince,
  setOtherAmphoe,
  setOtherDistrict,
  setRaftNumber,
  setRaftProvince,
  setRaftAmphoe,
  setRaftDistrict,
  setNewCarBrand,
  setNewCarModel,
  setNewCarRegistrationNumber,
  setNewCarEngineNumber,
  setNewCarFrameNumber,
  setNewCarColor,
  setOldCarBrand,
  setOldCarModel,
  setOldCarRegistrationNumber,
  setOldCarEngineNumber,
  setOldCarFrameNumber,
  setOldCarColor,
  setNewBicycleBrand,
  setNewBicycleModel,
  setNewBicycleRegistrationNumber,
  setNewBicycleEngineNumber,
  setNewBicycleFrameNumber,
  setNewBicycleColor,
  setOldBicycleBrand,
  setOldBicycleModel,
  setOldBicycleRegistrationNumber,
  setOldBicycleEngineNumber,
  setOldBicycleFrameNumber,
  setOldBicycleColor,
  setOtherMovablePropertyName,
  setOtherMovablePropertyType,
  setOtherMovableBrand,
  setOtherMovableModel,
  setOtherMovableSerialNumber,
  setOtherMovableOther,
  setArrayDetail,
  setYearlyRent,
  setKeyMoneyYearly,
  setTotalAmountYearly,
  setRentalYearly,
  setDetailEstimateRent,
  setEstimateRent,
  setKeyMoneyEstimate,
  setTotalAmountEstimate,
  setRentCost,
  setKeyMoneyRentCost,
  setTotalRentCost,
} = contractFormSlice.actions;

export default contractFormSlice.reducer;