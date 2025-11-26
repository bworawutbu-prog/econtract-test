/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { Input, Select } from "antd";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import Image from "next/image";
import InfoIcon from "@/assets/webp/register/register_1.webp";
import PasswordIcon from "@/assets/webp/register/register_2.webp";
import Image2 from "@/assets/image/login/Frame48.webp";
import LoginLayout from "@/components/layout/LoginLayout";
import { ChevronDown } from "lucide-react";

function RegisterPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Success message
      enqueueSnackbar("ลงทะเบียนสำเร็จ กรุณาเข้าสู่ระบบ", {
        variant: "success",
      });
      
      // Redirect to login page
      router.push("/login");
    } catch (error: any) {
      enqueueSnackbar("เกิดข้อผิดพลาดในการลงทะเบียน", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Custom width for register page - wider than the login page
  const registerWidth = "w-full md:w-[95%] lg:w-[90%] max-w-[1400px]";

  return (
    <LoginLayout 
      title="ลงทะเบียน" 
      contentWidth={registerWidth}
      showBackButton={true}
      backUrl="/login"
      leftImage={Image2}
    >
      <form onSubmit={handleSubmit} className="text-sm sm:text-base">
        <div className="flex gap-1 items-center mb-4">
          <Image src={InfoIcon} alt="Info Icon" width={24} height={24} />
          <p className="text-lg sm:text-md font-bold">ข้อมูลทั่วไป</p>
        </div>

        {/* ชื่อ-นามสกุล ภาษาไทย */}
        <div className="grid xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-1 grid-cols-1 gap-4 mb-4">
          <div className="min-w-[100px] w-full">
            <label className="block mb-1 text-md">คำนำหน้าชื่อ (ไทย) *</label>
            <Select
              suffixIcon={<ChevronDown size={20} />}
              placeholder="เลือก"
              className="w-full"
              options={[
                { value: "นาย", label: "นาย" },
                { value: "นาง", label: "นาง" },
                { value: "นางสาว", label: "นางสาว" },
              ]}
            />
          </div>

          <div className="flex-1 min-w-[150px] w-full">
            <label className="block mb-1">ชื่อ (ไทย) *</label>
            <Input placeholder="ระบุชื่อ" />
          </div>

          <div className="flex-1 min-w-[150px] w-full">
            <label className="block mb-1">นามสกุล (ไทย) *</label>
            <Input placeholder="ระบุนามสกุล" />
          </div>
        </div>

        {/* ชื่อ-นามสกุล ภาษาอังกฤษ */}
        <div className="grid xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-1 grid-cols-1 gap-4 mb-4">
          <div className="min-w-[100px] w-full">
            <label className="block mb-1">คำนำหน้าชื่อ (อังกฤษ) *</label>
            <Select
              placeholder="เลือก"
              className="w-full"
              options={[
                { value: "Mr", label: "Mr" },
                { value: "Mrs", label: "Mrs" },
                { value: "Ms", label: "Ms" },
              ]}
            />
          </div>

          <div className="flex-1 min-w-[150px] w-full">
            <label className="block mb-1">ชื่อ (อังกฤษ) *</label>
            <Input placeholder="ระบุชื่อ" />
          </div>

          <div className="flex-1 min-w-[150px] w-full">
            <label className="block mb-1">นามสกุล (อังกฤษ) *</label>
            <Input placeholder="ระบุนามสกุล" />
          </div>
        </div>

        {/* วิทยฐานะ */}
        <div className="grid xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-1 grid-cols-1 gap-4 mb-4">
          <div className="w-full">
            <label className="block mb-1">วิทยฐานะ (ไทย)</label>
            <Input placeholder="ระบุวิทยฐานะ" />
          </div>

          <div className="w-full">
            <label className="block mb-1">วิทยฐานะ (อังกฤษ)</label>
            <Input placeholder="ระบุวิทยฐานะ" />
          </div>
        </div>

        {/* อีเมล */}
        <div className="grid xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-1 grid-cols-1 gap-4 mb-4 w-full">
          <div className="w-full">
            <label className="block mb-1">อีเมล *</label>
            <Input placeholder="ระบุอีเมล" />
          </div>

          <div className="w-full">
            <label className="block mb-1">เบอร์โทร *</label>
            <Input placeholder="ระบุเบอร์โทร" accept="0123456789" />
          </div>
        </div>

        <div className="flex gap-1 items-center mb-4">
          <Image
            src={PasswordIcon}
            alt="Password Icon"
            width={24}
            height={24}
          />
          <p className="text-lg sm:text-md font-bold">รหัสผ่าน</p>
        </div>

        <div className="grid xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-1 grid-cols-1 gap-4 mb-8 w-full">
          <div className="w-full">
            <label className="block mb-1">รหัสผ่าน *</label>
            <Input
              type="password"
              placeholder="ระบุรหัสผ่าน"
              className="w-full"
            />
          </div>

          <div className="w-full">
            <label className="block mb-1">ยืนยันรหัสผ่าน *</label>
            <Input
              type="password"
              placeholder="ระบุรหัสผ่าน"
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-center w-full">
          <button 
            type="submit" 
            className={`btn-theme py-3 px-6 min-w-[200px] ${loading ? 'opacity-70' : ''}`}
            disabled={loading}
          >
            {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
          </button>
        </div>
      </form>
    </LoginLayout>
  );
}

export default RegisterPage;
