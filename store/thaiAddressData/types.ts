// Types สำหรับข้อมูลที่อยู่ไทย
export interface AddressData {
  province: string; // จังหวัด
  amphoe: string; // อำเภอ/เขต
  district: string; // ตำบล/แขวง
  zipcode: string; // รหัสไปรษณีย์
}

// Types สำหรับข้อมูลจาก API
export interface ThaiProvince {
  id: number;
  name_th?: string;
  name_en?: string;
  geography_id?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ThaiAmphure {
  id: number;
  name_th?: string;
  name_en?: string;
  province_id?: number;
  geography_id?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ThaiTambon {
  id?: number | string;
  name_th?: string;
  name_en?: string;
  amphure_id?: number | string;
  province_id?: number | string;
  geography_id?: number | string;
  zip_code?: string | number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ThaiGeography {
  id: number;
  name: string;
}

// Types สำหรับ Select Options
export interface AddressOption {
  value: string;
  label: string;
  id: number;
  zip?: string; // สำหรับ tambon options
}

// Types สำหรับ InputThaiAddress Props
export interface InputThaiAddressProps {
  showZipcode?: boolean;
  onAddressChange?: (address: AddressData) => void;
  onAddressSelect?: (address: AddressData) => void;
  initialAddress?: AddressData;
  isPropertyAddress?: boolean;
  errArray?: {key:string, message:string}[]
  keyError?: {province:string, amphoe:string, district:string}
  disabled?: boolean;
} 