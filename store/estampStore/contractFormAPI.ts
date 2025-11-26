import { ContractFormData, ContractFormState } from '../types/contractFormType';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

// Transform form state to API format
export const transformFormStateToAPI = (formState: ContractFormState): ContractFormData => {
  return {
    form: [
      {
        documentDetail: {
          typeCode: formState.documentTypeCode,
        },
        instInfo: [
          {
            id: formState.contractId,
            contractNo: formState.contractNo,
            creationDate: formState.creationDate,
            effectiveDate: formState.effectiveDate,
            expireDate: formState.expireDate,
            expireDateText: formState.expireDateText,
            receiveDate: formState.receiveDate,
            sendFormType: formState.sendFormType,
            filingNo: formState.filingNo,
            dupNumber: formState.dupNumber,
            instAmount: formState.instAmount,
            taxPayer: {
              specifiedTaxRegistration: {
                id: formState.taxRegistrationId,
              },
              branchNo: formState.partyBranchNo,
              branchType: formState.partyBranchType,
              relationship: formState.partyRelationship,
            },
            party: {
              specifiedTaxRegistration: {
                id: formState.taxRegistrationId,
              },
              titleName: formState.partyTitleName,
              name: formState.partyName,
              surname: formState.partySurname,
              branchNo: formState.partyBranchNo,
              branchType: formState.partyBranchType,
              postalTradeAddress: {
                buildingName: formState.buildingName,
                roomNo: formState.roomNo,
                floorNo: formState.floorNo,
                villageName: formState.villageName,
                buildingNumber: formState.buildingNumber,
                moo: formState.moo,
                soiName: formState.soiName,
                junctionName: formState.junctionName,
                streetName: formState.streetName,
                citySubDivisionName: formState.citySubDivisionName,
                cityName: formState.cityName,
                countrySubDivisionName: formState.countrySubDivisionName,
                postCode: formState.postCode,
                countryId: formState.countryId,
              },
              foreignType: formState.partyForeignType,
              totalParty: 1, // Default to 1 party
            },
            attachDetail: {
              actionType: "0",
              arrayDetail: [
                {
                  attType: formState.propertyType,
                  attActionType1: formState.propertyType === "other" ? "3" : "1", // สิ่งปลูกสร้างอื่น
                  attActionType2: "1", // ชำระค่าเช้าเป็นรายเดือน
                  attDetail1: formState.propertyAddress.buildingNumber,
                  attDetail2: formState.propertyAddress.citySubDivisionName,
                  attDetail3: formState.propertyAddress.cityName,
                  attDetail4: formState.propertyAddress.countrySubDivisionName,
                  attDetail5: formState.propertyTypeOther || formState.buildingName,
                  attAmount1: formState.monthlyRent,
                  attAmount2: formState.keyMoney,
                  attAmount3: formState.totalAmount,
                  attNumber1: formState.rentalMonths,
                },
              ],
            },
          },
        ],
      },
    ],
  };
};

// API Service Class
export class ContractFormAPI {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Submit contract form
  static async submitContractForm(formData: ContractFormData): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        message: string;
        data?: any;
      }>('/contract/submit', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Get contract form by ID
  static async getContractForm(id: string): Promise<{
    success: boolean;
    message: string;
    data?: ContractFormData;
  }> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        message: string;
        data?: ContractFormData;
      }>(`/contract/${id}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Update contract form
  static async updateContractForm(
    id: string,
    formData: ContractFormData
  ): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        message: string;
        data?: any;
      }>(`/contract/${id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Delete contract form
  static async deleteContractForm(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        message: string;
      }>(`/contract/${id}`, {
        method: 'DELETE',
      });

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Get contract forms list
  static async getContractFormsList(): Promise<{
    success: boolean;
    message: string;
    data?: ContractFormData[];
  }> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        message: string;
        data?: ContractFormData[];
      }>('/contract/list', {
        method: 'GET',
      });

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

// Utility functions
export const validateFormData = (formState: ContractFormState): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Required field validations
  if (!formState.contractNo) {
    errors.push('หมายเลขสัญญาเป็นข้อมูลที่จำเป็น');
  }

  if (!formState.creationDate) {
    errors.push('วันที่ทำสัญญาเป็นข้อมูลที่จำเป็น');
  }

  if (!formState.effectiveDate) {
    errors.push('วันที่เริ่มต้นสัญญาเป็นข้อมูลที่จำเป็น');
  }

  if (!formState.expireDate) {
    errors.push('วันที่สิ้นสุดสัญญาเป็นข้อมูลที่จำเป็น');
  }

  if (!formState.partyName) {
    errors.push('ชื่อคู่สัญญาเป็นข้อมูลที่จำเป็น');
  }

  if (!formState.partySurname) {
    errors.push('นามสกุลคู่สัญญาเป็นข้อมูลที่จำเป็น');
  }

  if (!formState.buildingNumber) {
    errors.push('อาคาร/บ้านเลขที่เป็นข้อมูลที่จำเป็น');
  }

  if (!formState.citySubDivisionName) {
    errors.push('ตำบล/แขวงเป็นข้อมูลที่จำเป็น');
  }

  if (!formState.cityName) {
    errors.push('อำเภอ/เขตเป็นข้อมูลที่จำเป็น');
  }

  if (!formState.countrySubDivisionName) {
    errors.push('จังหวัดเป็นข้อมูลที่จำเป็น');
  }

  if (!formState.postCode) {
    errors.push('รหัสไปรษณีย์เป็นข้อมูลที่จำเป็น');
  }

  if (!formState.propertyType) {
    errors.push('ประเภททรัพย์สินที่เช่าเป็นข้อมูลที่จำเป็น');
  }

  if (formState.propertyType === 'other' && !formState.propertyTypeOther) {
    errors.push('ชื่อสิ่งปลูกสร้างอื่นๆเป็นข้อมูลที่จำเป็น');
  }

  if (formState.monthlyRent <= 0) {
    errors.push('ค่าเช่าเดือนละต้องมากกว่า 0');
  }

  if (formState.rentalMonths <= 0) {
    errors.push('จำนวนเดือนต้องมากกว่า 0');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}; 