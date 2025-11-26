"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AutoComplete, Input } from "antd";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { RootState } from "@/store";
import { setPropertyAddress } from "@/store/slices/contractFormSlice";
import { AddressData, ThaiProvince, ThaiAmphure, ThaiTambon, AddressOption, InputThaiAddressProps, provinces_json, amphures_json, tambons_json, geographies_json, countryLists_json } from "@/store/thaiAddressData";


function getZipcodeFromTambon(item: any): string {
  return (
    item?.zip_code ?? item?.zipcode ?? item?.post_code ?? item?.postcode ?? ""
  );
}

const InputThaiAddress: React.FC<InputThaiAddressProps> = ({
  showZipcode = false,
  onAddressChange,
  onAddressSelect,
  initialAddress,
  isPropertyAddress = false, // default เป็น false (party address)
  errArray,
  keyError = {province: "", amphoe: "", district: ""},
  disabled = false
}) => {
  const dispatch = useAppDispatch();
  const contractForm = useAppSelector((state: RootState) => state.contractForm);

  const [provinces, setProvinces] = useState<ThaiProvince[]>([]);
  const [amphoes, setAmphoes] = useState<ThaiAmphure[]>([]);
  const [tambons, setTambons] = useState<ThaiTambon[]>([]);
  const [loading, setLoading] = useState(true);

  const [address, setAddress] = useState<AddressData>(() => {
    // ใช้ initialAddress ถ้ามี หรือใช้ข้อมูลจาก contractForm
    if (initialAddress) {
      return initialAddress;
    }
    
    // ถ้าเป็น property address ให้ใช้ข้อมูลจาก contractForm.propertyAddress
    if (isPropertyAddress) {
      return {
        province: contractForm?.propertyAddress?.countrySubDivisionName || "",
        amphoe: contractForm?.propertyAddress?.cityName || "",
        district: contractForm?.propertyAddress?.citySubDivisionName || "",
        zipcode: contractForm?.postCode || "",
      };
    }
    
    // ถ้าเป็น party address ให้ใช้ข้อมูลจาก contractForm โดยตรง
    return {
      province: contractForm?.countrySubDivisionName || "",
      amphoe: contractForm?.cityName || "",
      district: contractForm?.citySubDivisionName || "",
      zipcode: contractForm?.postCode || "",
    };
  });

  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [selectedAmphoeId, setSelectedAmphoeId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // const [provRes, amphRes, tambRes] = await Promise.all([
        //   fetch("/stamp/thai-address/provinces").then((r) => r.json()),
        //   fetch("/stamp/thai-address/amphoes").then((r) => r.json()),
        //   fetch("/stamp/thai-address/tambons").then((r) => r.json()),
        // ]);
        if (!mounted) return;
        setProvinces(provinces_json);
        setAmphoes(amphures_json);
        setTambons(tambons_json);

        if (address.province) {
          const p = provinces_json.find((x: ThaiProvince) => x?.name_th === address.province);
          setSelectedProvinceId(p?.id ?? null);
        }
        if (address.amphoe) {
          const a = amphures_json.find((x: ThaiAmphure) => x?.name_th === address.amphoe);
          setSelectedAmphoeId(a?.id ?? null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // อัพเดท address เมื่อ initialAddress เปลี่ยน
  useEffect(() => {
    if (initialAddress) {
      setAddress(initialAddress);
    }
  }, [initialAddress]);

  const provinceOptions = useMemo(
    (): AddressOption[] =>
      provinces.map((p) => ({ value: p.name_th || '', label: p.name_th || '', id: p.id })),
    [provinces]
  );

  const amphoeOptions = useMemo((): AddressOption[] => {
    if (!selectedProvinceId) return [];
    return amphoes
      .filter((a) => a.province_id === selectedProvinceId)
      .map((a) => ({ value: a.name_th || '', label: a.name_th || '', id: a.id }));
  }, [amphoes, selectedProvinceId]);

  const districtOptions = useMemo((): AddressOption[] => {
    if (!selectedAmphoeId) return [];
    return tambons
      .filter((t) => t.amphure_id === selectedAmphoeId)
      .map((t) => ({
        value: t.name_th || '',
        label: t.name_th || '',
        id: typeof t.id === 'number' ? t.id : parseInt(t.id as string) || 0,
        zip: getZipcodeFromTambon(t),
      }));
  }, [tambons, selectedAmphoeId]);

  const propagate = (next: AddressData) => {
    setAddress(next);
    onAddressChange?.(next);
    
    // อัพเดท Redux store เฉพาะเมื่อเป็น property address
    if (isPropertyAddress) {
      dispatch(
        setPropertyAddress({
          buildingNumber: contractForm.propertyAddress?.buildingNumber ?? "",
          citySubDivisionName: next.district,
          cityName: next.amphoe,
          countrySubDivisionName: next.province,
        })
      );
    }
  };

  const onSelectProvince = (_value: string, option: AddressOption) => {
    const id = option?.id ?? provinces.find((p) => p.name_th === _value)?.id ?? null;
    setSelectedProvinceId(id);
    setSelectedAmphoeId(null);
    const next: AddressData = {
      province: _value,
      amphoe: "",
      district: "",
      zipcode: "",
    };
    propagate(next);
    onAddressSelect?.(next);
  };

  const onSelectAmphoe = (_value: string, option: AddressOption) => {
    const id = option?.id ?? amphoes.find((a) => a.name_th === _value)?.id ?? null;
    setSelectedAmphoeId(id);
    const next: AddressData = {
      province: address.province,
      amphoe: _value,
      district: "",
      zipcode: "",
    };
    propagate(next);
    onAddressSelect?.(next);
  };

  const onSelectDistrict = (_value: string, option: AddressOption) => {
    const zip = option?.zip ?? "";
    const next: AddressData = {
      province: address.province,
      amphoe: address.amphoe,
      district: _value,
      zipcode: zip,
    };
    propagate(next);
    onAddressSelect?.(next);
  };
// ตรวจสอบ error จาก errArray
  const genError = (key: string) => {
    if (errArray) {
      const error = errArray.find((item) => item.key === key);
      if (error) {
        return error.message;
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">จังหวัด <span className="text-red-500">*</span></label>
        <AutoComplete
          value={address.province}
          options={provinceOptions}
          onSelect={onSelectProvince}
          onChange={(val) => propagate({ ...address, province: val })}
          placeholder={loading ? "กำลังโหลด..." : "เลือกจังหวัด"}
          className="w-full"
          disabled={disabled || loading}
          filterOption={(inputValue, option) =>
            (option?.label as string)?.toLowerCase().includes(inputValue.toLowerCase())
          }
        >
          <Input className="w-full" status={`${(genError(keyError.province) && address.province == "") ? "error" : ""}`}/>
        </AutoComplete>
        {
          (genError(keyError.province) && address.province == "") && (
            <div className="text-red-500 text-sm">
              {genError(keyError.province)}
            </div>
          )
        }
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">อำเภอ/เขต <span className="text-red-500">*</span></label>
        <AutoComplete
          value={address.amphoe}
          options={amphoeOptions}
          onSelect={onSelectAmphoe}
          onChange={(val) => propagate({ ...address, amphoe: val })}
          placeholder={selectedProvinceId ? "เลือกอำเภอ/เขต" : "กรุณาเลือกจังหวัดก่อน"}
          className="w-full"
          disabled={disabled || loading || !selectedProvinceId}
          filterOption={(inputValue, option) =>
            (option?.label as string)?.toLowerCase().includes(inputValue.toLowerCase())
          }
        >
          <Input className="w-full" status={`${(genError(keyError.amphoe) && address.amphoe == "") ? "error" : ""}`}/>
        </AutoComplete>
        {
          (genError(keyError.amphoe) && address.amphoe == "") && (
            <div className="text-red-500 text-sm">
              {genError(keyError.amphoe)}
            </div>
          )
        }
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">ตำบล/แขวง <span className="text-red-500">*</span></label>
        <AutoComplete
          value={address.district}
          options={districtOptions}
          onSelect={onSelectDistrict}
          onChange={(val) => propagate({ ...address, district: val })}
          placeholder={selectedAmphoeId ? "เลือกตำบล/แขวง" : "กรุณาเลือกอำเภอก่อน"}
          className="w-full"
          disabled={disabled || loading || !selectedAmphoeId}
          filterOption={(inputValue, option) =>
            (option?.label as string)?.toLowerCase().includes(inputValue.toLowerCase())
          }
        >
          <Input className="w-full" status={`${(genError(keyError.district) && address.district == "") ? "error" : ""}`}/>
        </AutoComplete>
        {
          (genError(keyError.district) && address.district == "") && (
            <div className="text-red-500 text-sm">
              {genError(keyError.district)}
            </div>
          )
        }
      </div>

      {showZipcode && (
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">รหัสไปรษณีย์</label>
          <Input
            value={address.zipcode}
            onChange={(e) => propagate({ ...address, zipcode: e.target.value })}
            className="w-full"
            placeholder="รหัสไปรษณีย์"
            disabled={disabled || true}
          />
        </div>
      )}
    </div>
  );
};

export default InputThaiAddress; 