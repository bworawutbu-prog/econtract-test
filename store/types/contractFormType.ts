// Contract Form Types
export interface DocumentDetail {
  typeCode: string;
}

export interface SpecifiedTaxRegistration {
  id: string;
}

export interface PostalTradeAddress {
  buildingName: string; // ที่อยู่: ชื่ออาคาร
  roomNo: string; // ห้องเลขที่
  floorNo: string; // ชั้นที่
  villageName: string; // หมู่บ้าน
  buildingNumber: string; // อาคาร/บ้านเลขที่ *
  moo: string; // หมู่ที่
  soiName: string; // ตรอก/ซอย
  junctionName: string; // แยก
  streetName: string; // ถนน
  citySubDivisionName: string; // ตำบล/แขวง *
  cityName: string; // อำเภอ/เขต *
  countrySubDivisionName: string; // จังหวัด
  postCode: string; // รหัสไปรษณีย์ *
  countryId: string; // รหัสประเทศ ใช้ตาม ISO 3166-1 ในกรณีของเราจะเป็น TH
}

export interface Party {
  specifiedTaxRegistration: SpecifiedTaxRegistration;
  titleName: string; // นาย, นาง, นางสาว
  name: string;
  surname: string;
  branchNo: string;
  branchType: string;
  postalTradeAddress: PostalTradeAddress;
  totalParty: number; // จำนวนคู่สัญญา
  foreignType?: number; // ประเภทของบุคคล
}

export interface TaxPayer {
  specifiedTaxRegistration: SpecifiedTaxRegistration;
  branchNo: string;
  branchType: string;
  relationship: string;
}

export interface AttachDetailItem {
  attType: string; // "1" = ทรัพย์สินที่เช่า, "2" = ค่าเช่า หรือประมาณการค่าเช่า
  attActionType1: string; // สำหรับ attType "1": "1","2","3","4" (สิ่งปลูกสร้างอื่น), สำหรับ attType "2": "1" (ชำระค่าเช่าเป็นรายเดือน)
  attActionType2?: string; // สำหรับ attType "1": "1" (ชำระค่าเช่าเป็นรายเดือน)
  attDetail1?: string; // สำหรับ attType "1": สิ่งปลูกสร้างเลขที่
  attDetail2?: string; // สำหรับ attType "1": ตำบล/แขวง
  attDetail3?: string; // สำหรับ attType "1": อำเภอ/เขต
  attDetail4?: string; // สำหรับ attType "1": จังหวัด
  attDetail5?: string; // สำหรับ attType "1": ชื่ออาคาร
  attDetail6?: string; // สำหรับ attType "1": เพิ่มเติม (เช่น สีรถ, เลขที่ที่ดิน)
  attNumber1?: number; // สำหรับ attType "2": จำนวนเดือน
  attAmount1?: number; // สำหรับ attType "2": ค่าเช่าเดือนละ
  attAmount2?: number; // สำหรับ attType "2": เงินกินเปล่า
  attAmount3?: number; // สำหรับ attType "2": รวมเป็นเงิน
}

export interface AttachDetail {
  actionType: string;
  arrayDetail: AttachDetailItem[];
  amount?: number;
  amount1?: number;
  amount2?: number;
  amount3?: number;
  number?: number;
  detail1?: string;
}

export interface InstInfo {
  id: string; // หมายเลขอ้างอิงตราสารอิเล็กทรอนิกส์
  contractNo?: string; // สัญญาเลขที่ (optional ตาม API)
  creationDate: string; // วันที่ทำสัญญา
  effectiveDate?: string; // วันที่เริ่มต้นสัญญา
  expireDate?: string; // วันที่สิ้นสุดสัญญา
  expireDateText?: string; // วันที่สิ้นสุดสัญญา (ข้อความ)
  receiveDate?: string; // วันที่ได้รับ
  sendFormType?: string; // ประเภทการส่งแบบ
  filingNo?: number; // เลขที่การยื่น
  dupNumber?: number; // เลขที่สำเนา
  instAmount: number; // จํานวนเงิน
  taxPayer: TaxPayer; // ผู้ชำระอากรแสตมป์
  party: Party; // ข้อมูลคู่สัญญา (ผู้ให้เช่า)
  attachDetail: AttachDetail; // รายละเอียดเกี่ยวกับตราสาร
}

export interface ContractForm {
  documentDetail: DocumentDetail;
  instInfo: InstInfo[];
}

export interface ContractFormData {
  form: ContractForm[];
}

export interface ContractFormState {
  documentTypeCode: string;
  partyRelationship: string;
  instInfo: any;
  currentInstInfoIndex: number;
  instInfoList: InstInfo[];
  contractId: string;
  contractNo: string;
  creationDate: string;
  effectiveDate: string;
  expireDate: string;
  expireDateText: string;
  receiveDate: string;
  sendFormType: string;
  filingNo: number;
  dupNumber: number;
  instAmount: number;
  partyTitleName: string;
  partyName: string;
  partyMidname: string; // ชื่อกลาง
  partySurname: string;
  partyBranchNo: string;
  partyBranchType: string;
  partyForeignType: number;
  buildingName: string;
  roomNo: string;
  floorNo: string;
  villageName: string;
  buildingNumber: string;
  moo: string;
  soiName: string;
  junctionName: string;
  streetName: string;
  citySubDivisionName: string; // ตำบล/แขวง
  cityName: string; // อำเภอ/เขต
  countrySubDivisionName: string; // จังหวัด
  postCode: string;
  countryId: string;
  taxRegistrationId: string;
  propertyType: string; // ประเภททรัพย์สินที่เช่า
  propertyTypeOther: string; // ชื่อสิ่งปลูกสร้างอื่นๆ
  propertyAddress: {
    buildingNumber: string;
    citySubDivisionName: string; // ตำบล/แขวง
    cityName: string; // อำเภอ/เขต
    countrySubDivisionName: string; // จังหวัด
  };
  
  // Rental Details
  monthlyRent: number;
  keyMoney: number;
  totalAmount: number;
  rentalMonths: number;
  
  // Loading and Error States
  isLoading: boolean;
  error: string | null;

  //arrayDetail
  arrayDetail: {
    attType: string;
    attActionType1: string;
  }[];

  // Power of Attorney Details (Document Type 7)
  actionType: string;
  attachDetail1: string;

  // Security Details (Document Type 17)
  relateTaxRegistrationId: string;
  relateTaxRegistrationName: string;

  number1: number;
  amount1: number;
  amount2: number;
  amount3: number;
  amount4: number;

  //ที่ดิน
  landPropertyType: string;
  landPropertyTypeOther: string;
  landBuildingNumber: string;
  landNumber1: string;
  landProvince: string;
  landAmphoe: string;
  landDistrict: string;

  // โรงเรือน
  buildingPropertyType: string;
  buildingPropertyTypeOther: string;
  buildingBuildingNumber: string;
  buildingProvince: string;
  buildingAmphoe: string;
  buildingDistrict: string;

  //สิ่งปลูกสร้างอื่น
  otherName: string;
  otherBuildingNumber: string;
  otherProvince: string;
  otherAmphoe: string;
  otherDistrict: string;

  //แพ
  raftNumber: string;
  raftProvince: string;
  raftAmphoe: string;
  raftDistrict: string;

  //รถยนต์ใหม่
  newCarBrand: string;
  newCarModel: string;
  newCarRegistrationNumber: string;
  newCarEngineNumber: string;
  newCarFrameNumber: string;
  newCarColor: string;

  //รถยนต์เก่า
  oldCarBrand: string;
  oldCarModel: string;
  oldCarRegistrationNumber: string;
  oldCarEngineNumber: string;
  oldCarFrameNumber: string;
  oldCarColor: string;

  //รถจักรยานยนต์ใหม่
  newBicycleBrand: string;
  newBicycleModel: string;
  newBicycleRegistrationNumber: string;
  newBicycleEngineNumber: string;
  newBicycleFrameNumber: string;
  newBicycleColor: string;

  //รถจักรยานยนต์เก่า
  oldBicycleBrand: string;
  oldBicycleModel: string;
  oldBicycleRegistrationNumber: string;
  oldBicycleEngineNumber: string;
  oldBicycleFrameNumber: string;
  oldBicycleColor: string;

  //อื่นๆ
  otherMovablePropertyName: string;
  otherMovablePropertyType: string;
  otherMovableBrand: string;
  otherMovableModel: string;
  otherMovableSerialNumber: string;
  otherMovableOther: string;

  //ค่าเช่า หรือประมาณการค่าเช่า
  //ค่าเช่าเป็นรายปี
  yearlyRent: number;
  keyMoneyYearly: number;
  totalAmountYearly: number;
  rentalYearly: number;
  //ค่าเช่าผันแปร
  detailEstimateRent: string;
  estimateRent: number;
  keyMoneyEstimate: number;
  totalAmountEstimate: number;
  //ค่าเช่าตลอดอายุสัญญาเช่า
  rentCost: number;
  keyMoneyRentCost: number;
  totalRentCost: number;

}

// Initial State
export const initialContractFormState: ContractFormState = {
  documentTypeCode: "1",
  partyRelationship: "2",
  instInfo: [],
  currentInstInfoIndex: 0,
  instInfoList: [],
  contractId: "",
  contractNo: "",
  creationDate: "",
  effectiveDate: "",
  expireDate: "",
  expireDateText: "",
  receiveDate: "",
  sendFormType: "1",
  filingNo: 1,
  dupNumber: 1,
  instAmount: 0,
  partyTitleName: "",
  partyName: "",
  partyMidname: "",
  partySurname: "",
  partyBranchNo: "0",
  partyBranchType: "0",
  partyForeignType: 0,
  buildingName: "",
  roomNo: "",
  floorNo: "",
  villageName: "",
  buildingNumber: "",
  moo: "",
  soiName: "",
  junctionName: "",
  streetName: "",
  citySubDivisionName: "",
  cityName: "",
  countrySubDivisionName: "",
  postCode: "",
  countryId: "TH",
  taxRegistrationId: "",
  propertyType: "1",
  propertyTypeOther: "",
  propertyAddress: {
    buildingNumber: "",
    citySubDivisionName: "",
    cityName: "",
    countrySubDivisionName: "",
  },
  monthlyRent: 0,
  keyMoney: 0,
  totalAmount: 0,
  rentalMonths: 0,
  isLoading: false,
  error: null,
  actionType: "1",
  attachDetail1: "",
  number1: 0,
  relateTaxRegistrationId: "",
  relateTaxRegistrationName: "",
  amount1: 0,
  amount2: 0,
  amount3: 0,
  amount4: 0,
  //ที่ดิน
  landPropertyType: "",
  landPropertyTypeOther: "",
  landBuildingNumber: "",
  landNumber1: "",
  landProvince: "",
  landAmphoe: "",
  landDistrict: "",

  // โรงเรือน
  buildingPropertyType: "",
  buildingPropertyTypeOther: "",
  buildingBuildingNumber: "",
  buildingProvince: "",
  buildingAmphoe: "",
  buildingDistrict: "",

  //สิ่งปลูกสร้างอื่น
  otherName: "",
  otherBuildingNumber: "",
  otherProvince: "",
  otherAmphoe: "",
  otherDistrict: "",

  //แพ
  raftNumber: "",
  raftProvince: "",
  raftAmphoe: "",
  raftDistrict: "",

  //รถยนต์ใหม่
  newCarBrand: "",
  newCarModel: "",
  newCarRegistrationNumber: "",
  newCarEngineNumber: "",
  newCarFrameNumber: "",
  newCarColor: "",

  //รถยนต์เก่า
  oldCarBrand: "",
  oldCarModel: "",
  oldCarRegistrationNumber: "",
  oldCarEngineNumber: "",
  oldCarFrameNumber: "",
  oldCarColor: "",

  //รถจักรยานยนต์ใหม่
  newBicycleBrand: "",
  newBicycleModel: "",
  newBicycleRegistrationNumber: "",
  newBicycleEngineNumber: "",
  newBicycleFrameNumber: "",
  newBicycleColor: "",

  //รถจักรยานยนต์เก่า
  oldBicycleBrand: "",
  oldBicycleModel: "",
  oldBicycleRegistrationNumber: "",
  oldBicycleEngineNumber: "",
  oldBicycleFrameNumber: "",
  oldBicycleColor: "",

  //อื่นๆ
  otherMovablePropertyName: "",
  otherMovablePropertyType: "",
  otherMovableBrand: "",
  otherMovableModel: "",
  otherMovableSerialNumber: "",
  otherMovableOther: "",

  //ค่าเช่า หรือประมาณการค่าเช่า
  //ค่าเช่าเป็นรายปี
  yearlyRent: 0,
  keyMoneyYearly: 0,
  totalAmountYearly: 0,
  rentalYearly: 0,
  //ค่าเช่าผันแปร
  detailEstimateRent: "",
  estimateRent: 0,
  keyMoneyEstimate: 0,
  totalAmountEstimate: 0,
  //ค่าเช่าตลอดอายุสัญญาเช่า
  rentCost: 0,
  keyMoneyRentCost: 0,
  totalRentCost: 0,

  //arrayDetail
  arrayDetail: [],
}; 