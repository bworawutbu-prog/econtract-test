"use client"

import { Input, AutoComplete } from 'antd'
import React, { useState } from 'react'
import countryData from '../../../store/thaiAddressData/thCountryLists.json'

// Interface สำหรับข้อมูลประเทศจาก thCountryLists.ts
interface CountryData {
  name: string;
  enName: string;
  alpha2: string;
  alpha3: string;
  numeric: string;
  iso3166_2: string;
}

// Interface สำหรับข้อมูลประเทศ
interface CountryOption {
  value: string;
  label: string;
  alpha2: string;
  alpha3: string;
}

// Interface สำหรับ props ของ InputForeignAddress
interface InputForeignAddressProps {
  disabled?: boolean;
}

function InputForeignAddress({ disabled = false }: InputForeignAddressProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  // ตรวจสอบและแปลงข้อมูลประเทศเป็น options สำหรับ AutoComplete
  const countryOptions: CountryOption[] = Array.isArray(countryData) 
    ? countryData?.map((country: CountryData) => ({
        value: country.name, // ใช้ชื่อภาษาไทยเป็น value
        label: `${country.name} (${country.enName})`, // แสดงทั้งภาษาไทยและอังกฤษ
        alpha2: country.alpha2,
        alpha3: country.alpha3,
      }))
    : [];

  // Handler สำหรับการเลือกประเทศ
  const handleCountrySelect = (value: string) => {
    setSelectedCountry(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div>
        <label className="block mb-2">ประเทศ *</label>
        <AutoComplete
          placeholder="ระบุประเทศ"
          className="rounded w-full"
          options={countryOptions}
          value={selectedCountry}
          onSelect={handleCountrySelect}
          onChange={setSelectedCountry}
          disabled={disabled}
          filterOption={(inputValue, option) => {
            if (!option) return false;
            return option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
                   option.value.toLowerCase().includes(inputValue.toLowerCase());
          }}
        />
      </div>
      <div>
        <label className="block mb-2">รัฐ/จังหวัด *</label>
        <Input
          placeholder="ระบุรัฐ/จังหวัด"
          className="rounded"
          disabled={disabled}
        />
      </div>
      <div>
        <label className="block mb-2">เมือง/อำเภอ *</label>
        <Input
          placeholder="ระบุเมือง/อำเภอ"
          className="rounded"
          disabled={disabled}
        />
      </div>
      <div>
        <label className="block mb-2">ตำบล *</label>
        <Input
          placeholder="ระบุตำบล"
          className="rounded"
          disabled={disabled}
        />
      </div>
      <div>
        <label className="block mb-2">รหัสไปรษณีย์ *</label>
        <Input
          placeholder="ระบุรหัสไปรษณีย์"
          className="rounded"
          disabled={disabled}
        />
      </div>
    </div>
  )
}

export default InputForeignAddress