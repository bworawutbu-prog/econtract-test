import { AttachDetail } from "./contractFormType"
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getTokenLogin } from "../token";
import axios from "axios";
import { clearAllUserSession } from "../utils/localStorage";

export interface listTypeStampDuty {
    transaction_count: number
    id: string,
    name: string
}

export interface CountTransactionStatus {
    "pending": string,
    "complete": string,
    "failed": string,
    "total": string
}
export interface listEStamp {
    "_id": string,
    "edocument_id": string,
    "name": string,
    "status": string,
    "transaction_id": string,
    "creation_date": string,
    "expired_date": string,
}

export interface ListEstampType {
    "message": string,
    "status": boolean
    data: listTypeStampDuty[],
    "count_page": string,
    "current_page": string,
    "total_data": string,
}

export interface ListEstampTransaction {
    "message": string,
    "status": boolean
    data: listEStamp[],
    "count_page": string,
    "current_page": string,
    "total_data": string,
}

export interface DocumentTypeOption {
  key: string;
  value: string;
  label: string;
}

export interface PartyRelationshipOption {
  typeCode: string;
  data: {
    key: string;
    value: string;
    label: string;
  }[];
}

// 🎯 CENTRALIZED: Document Type Options Constants
export const documentTypeOptions: DocumentTypeOption[] = [
  {
    key: "1",
    value: "1",
    label: "ลักษณะตราสาร 1. เช่าที่ดิน โรงเรือน สิ่งปลูกสร้างอย่างอื่น หรือแพ",
  },
  // {
  //   key: "2",
  //   value: "2",
  //   label: "ลักษณะตราสาร 2. โอนใบหุ้น ใบหุ้นกู้ พันธบัตร ใบรับรองหนี้ฯ",
  // },
  {
    key: "3",
    value: "3",
    label: "ลักษณะตราสาร 3. เช่าซื้อทรัพย์สิน",
  },
  {
    key: "4",
    value: "4",
    label: "ลักษณะตราสาร 4. จ้างทำของ",
  },
  {
    key: "7",
    value: "7",
    label: "ลักษณะตราสาร 7. ใบมอบอำนาจ",
  },
  {
    key: "17",
    value: "17",
    label: "ลักษณะตราสาร 17. ค้ำประกัน",
  },
  // {
  //   key: "28",
  //   value: "28",
  //   label: "ลักษณะตราสาร 28.(ค) ใบรับสาหรับการขาย ขายฝาก ให้เช่าซื้อ หรือโอนกรรมสิทธิยานพาหนะ",
  // }
];

export const partyRelationshipOptions : PartyRelationshipOption[] = [
{
  typeCode: "1",
  data: [
    {
      key: "1",
      value: "1",
      label: "ผู้ให้เช่า",
    },
    {
      key: "2",
      value: "2",
      label: "ผู้เช่า",
    },
  ],
},
{
  typeCode: "3",
  data: [
    {
      key: "1",
      value: "1",
      label: "ผู้ให้เช่า",
    },
    {
      key: "2",
      value: "2",
      label: "ผู้เช่า",
    },
  ],
},
{
  typeCode: "4",
  data: [
    {
      key: "1",
      value: "1",
      label: "ผู้รับจ้าง",
    },
    {
      key: "2",
      value: "2",
      label: "ผู้ว่าจ้าง",
    },
  ],
},
{
  typeCode: "7",
  data: [
    {
      key: "1",
      value: "1",
      label: "ผู้มอบอำนาจ",
    },
    {
      key: "2",
      value: "2",
      label: "ผู้รับมอบอำนาจ",
    },
  ],
},
{
  typeCode: "17",
  data: [
    {
      key: "1",
      value: "1",
      label: "ผู้ค้ำ",
    },
    {
      key: "2",
      value: "2",
      label: "ลูกหนี้/ผู้รับจ้าง",
    },
  ],
},
{
  typeCode: "28",
  data: [
    {
      key: "1",
      value: "1",
      label: "ผู้ออกใบรับ",
    },
    {
      key: "2",
      value: "2",
      label: "คู่สัญญา",
    },
  ],
},
];

// 🎯 API: Get E-Stamp Details
export const getEstampDetails = createAsyncThunk(
  "getEstampDetails",
  async (_, { rejectWithValue, getState }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = getTokenLogin();
    if (!token) {
      clearAllUserSession();
      return rejectWithValue("No authentication token found");
    }

    // Get business_id from Redux state
    const state = getState() as any;
    const businessId = state.business?.selectedBusinessId;

    try {
      // Build URL with query params
      let url = `${baseUrl}/e-stamp/details`;
      if (businessId) {
        url += `?business_id=${businessId}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error: any) {
      console.error("Error getting e-stamp details:", error);

      // Use rejectWithValue instead of throwing to avoid uncaught exceptions
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as any;
        const message =
          (typeof errorData === "string" && errorData) ||
          errorData?.message ||
          error.message ||
          "Failed to get e-stamp details";
        return rejectWithValue(message);
      }

      const fallbackMessage =
        error instanceof Error
          ? error.message
          : "An unknown error occurred while getting e-stamp details";
      return rejectWithValue(fallbackMessage);
    }
  }
);

// 🎯 CENTRALIZED: Helper Functions for Document Types
export const getDocumentTypeLabel = (typeCode: string): string => {
  const option = documentTypeOptions.find(opt => opt.value === typeCode);
  return option ? option.label : documentTypeOptions[0].label;
};

export const getPartyRelationshipLabel = (typeCode: string): string => {
  switch (typeCode) {
    case "1":
      return "ผู้ให้เช่า";
    case "2":
      return "ผู้เช่า";
    default:
      return "ไม่ระบุ";
  }
};

// 🎯 CENTRALIZED: Transaction Data Interface (Enhanced version)
export interface TransactionData {
  _id: string;
  name: string;
  ref_no: string;
  eform_data: Array<{
    documentDetail: {
      typeCode: string;
    };
    instInfo: Array<{
      id: string;
      contractNo: string;
      creationDate: string;
      effectiveDate: string;
      expireDate: string;
      instAmount: number;
      party: {
        specifiedTaxRegistration: {
          id: string;
        };
        titleName: string;
        name: string;
        surname: string;
        branchNo: string;
        branchType: string;
        postalTradeAddress: {
          buildingName: string;
          roomNo: string;
          floorNo: string;
          villageName: string;
          buildingNumber: string;
          moo: string;
          soiName: string;
          junctionName: string;
          streetName: string;
          citySubDivisionName: string;
          cityName: string;
          countrySubDivisionName: string;
          postCode: string;
          countryId: string;
        };
        totalParty: number;
      };
    }>;
  }>;
  status: string;
  payment_info: {
    expireDate: string;
    totalAmount: number;
    totalDuty: number;
    totalSurcharge: number;
    totalFine: number;
  };
}

// 🎯 CENTRALIZED: Display Data Interface for UI
export interface DisplayDataItem {
  docId: string;
  docName: string;
  docRefId: string;
  docDetails: string;
  createDate: string;
  startDate: string;
  endDate: string;
  docAmount: number;
  docCurrency: string;
  docCounterpartyInfo: {
    name: string;
    address: string;
  };
}

// 🎯 CENTRALIZED: Transform API Data to Display Data Function
export const transformApiDataToDisplayData = (transactionData: TransactionData | null): DisplayDataItem[] => {
  if (!transactionData || !transactionData?.eform_data || transactionData?.eform_data?.length === 0) {
    return [];
  }

  return (transactionData?.eform_data ?? []).map((eformItem) => {
    const instInfo = eformItem?.instInfo[0] ?? {} ; // ใช้ข้อมูลแรก
    const address = instInfo.party.postalTradeAddress;
    
    return {
      docId: transactionData?._id,
      docName: transactionData?.name,
      docRefId: transactionData?.ref_no,
      docDetails: transactionData?.name, // ใช้ name แทน
      createDate: instInfo?.creationDate ?? "",
      startDate: instInfo?.effectiveDate ?? "",
      endDate: instInfo?.expireDate ?? "",
      docAmount: instInfo?.instAmount ?? 0,
      docCurrency: "บาท",
      docCounterpartyInfo: {
        name: `${instInfo?.party?.titleName}${instInfo?.party?.name} ${instInfo?.party?.surname}`,
        address: `${address?.buildingName} ${address?.roomNo} ${address?.floorNo} ${address?.villageName} ${address?.buildingNumber} ${address?.moo} ${address?.soiName} ${address?.junctionName} ${address?.streetName} ${address?.citySubDivisionName} ${address?.cityName} ${address?.countrySubDivisionName} ${address?.postCode}`
      }
    };
  });
};

export interface TransactionDetail {
    _id: string
    name: string
    ref_no: string
    eform_data: EformDaum[]
    status: string
    payment_info: PaymentInfo
  }
  
  export interface EformDaum {
    documentDetail: DocumentDetail
    instInfo: InstInfo[]
  }
  
  export interface DocumentDetail {
    typeCode: string
  }
  
  export interface InstInfo {
    id: string
    contractNo: string
    creationDate: string
    effectiveDate: string
    expireDate: string
    instAmount: number
    party: Party
    attachDetail: AttachDetail
    relateContract: {
      specifiedTaxRegistration: {
        id: string
      }
      name: string
      surname?: string
      branchNo?: string
      branchType?: string
    }[]
  }
  
  export interface Party {
    specifiedTaxRegistration: SpecifiedTaxRegistration
    titleName: string
    name: string
    surname: string
    branchNo: string
    branchType: string
    postalTradeAddress: PostalTradeAddress
    totalParty: number
  }
  
  export interface SpecifiedTaxRegistration {
    id: string
  }
  
  export interface PostalTradeAddress {
    buildingName: string
    roomNo: string
    floorNo: string
    villageName: string
    buildingNumber: string
    moo: string
    soiName: string
    junctionName: string
    streetName: string
    citySubDivisionName: string
    cityName: string
    countrySubDivisionName: string
    postCode: string
    countryId: string
  }
  
  export interface PaymentInfo {
    expireDate: string
    totalAmount: number
    totalDuty: number
    totalSurcharge: number
    totalFine: number
  }
  