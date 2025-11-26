"use client";

// components/layout/PasswordLayout.tsx
import { useState } from "react";
import Image from "next/image";
import Img_otp from "@/assets/webp/img_otp.webp";
import { useRouter, useSearchParams } from "next/navigation"; //
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import {ConfirmModal} from "@/components/modal/modalConfirm"
import { SuccessModal } from "@/components/modal/modalSuccess"; // import the success modal
import img_failedModal from "@/assets/webp/img_failedModal.webp"
import ModalFailed from "@/components/modal/modalFailedpassword";
import Img_password_confrim from "@/assets/webp/img_password_confrim.webp"
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from "@/store";
import { document_CheckValidate  } from "@/store/frontendStore/transactionAPI"
import { enqueueSnackbar } from "notistack";


const PasswordLayout: React.FC = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // ← new state
  const [isFailedModalOpen, setIsFailedModalOpen] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const router = useRouter(); // 🆕
  const searchParams = useSearchParams(); // 🆕
  const dispatch = useAppDispatch() as ThunkDispatch<
    RootState,
    unknown,
    AnyAction
  >;

  const handleConfirm = () => {
    checkPassword();
    // setIsModalOpen(false);           // close confirm modal
    // setIsSuccessModalOpen(true);     // show success modal
    
  };
  const handleCancel = () => {
    // 
    setIsModalOpen(false);
  };
  const handleFailedClose = () => {
    setIsFailedModalOpen(false);
  };
  const handleSuccessClose = () => {
    setIsSuccessModalOpen(false);
    const documentId = searchParams.get("documentId"); // 🆕
    if (documentId) {
      sessionStorage.setItem(`validated_${documentId}`, "true")
      // router.push(`/frontend/Mapping?documentId=${documentId}`); // 🆕
      router.push(`/frontend/Mapping?documentId=${documentId}&validated=true`);
    } else {
      enqueueSnackbar(`🎯 [PasswordLayout] No documentId found in URL.`, {
        variant: "warning",
        autoHideDuration: 3000,
      });
    }
  };
  const checkPassword = async () => {
    const documentId = searchParams.get("documentId");
      if (!documentId) {
        enqueueSnackbar(`🎯 [PasswordLayout] No documentId in URL.`, {
          variant: "error",
          autoHideDuration: 3000,
        });
        return;
      }
    try {
        const resultAction = await dispatch(
          document_CheckValidate({
            docid: documentId,
            auth_type: "password",
            user_input: inputPassword,
          })
        );

        if (document_CheckValidate.fulfilled.match(resultAction)) {
          const responseData = resultAction.payload;
          setIsPasswordError(false);
          setIsModalOpen(false);
          setIsSuccessModalOpen(true);
        } else {
          setIsPasswordError(true);
          const newAttempts = wrongAttempts + 1;
          setWrongAttempts(newAttempts);
          setIsModalOpen(false);
          if (newAttempts >= 3) {
            setIsFailedModalOpen(true);
            setWrongAttempts(0);
          }
        }
    } catch (error) {
    }
  };
  const handleLoginClick = () => {
    setIsModalOpen(true);
  };
  return (
    <div className="min-h-full flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-[60px] py-6 sm:py-10">
      <div className="w-full space-y-4 max-w-sm mx-auto">
        <Image
          src={Img_otp}
          alt="Password login"
          priority
          width={230}
          height={160}
          className="object-cover mx-auto"
          sizes="(min-width: 1024px) 50vw, 0vw"
        />
        <h1 className="text-center mb-6 sm:mb-10 font-extrabold text-2xl sm:text-3xl text-theme">
          ยืนยันรหัสผ่าน
        </h1>
        <p className="text-center font-medium">
          กรุณากรอกรหัสผ่านของคุณเพื่อเข้าสู่ระบบ
        </p>
        <div className="relative">
          <input
            type={passwordVisible ? "text" : "password"}
            placeholder="รหัสผ่าน"
            value={inputPassword}
            onChange={(e) => {
              setInputPassword(e.target.value);
              setIsPasswordError(false);
            }}
            className={`w-full border rounded-lg px-4 py-2 pr-10 ${
              isPasswordError ? "border-red-500" : "border-gray-300"
            }`}
          />
          <span
            onClick={() => setPasswordVisible(!passwordVisible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
          >
            {passwordVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          </span>
          {isPasswordError && (
            <p className="text-red-500 text-sm mt-1">
              รหัสผ่านไม่ถูกต้อง โปรดระบุอีกครั้ง
            </p>
          )}
        </div>
        <button
          className="w-full bg-theme text-white py-2 rounded-lg hover:bg-theme-dark transition"
          onClick={handleLoginClick}
        >
          เข้าสู่ระบบ
        </button>
      </div>

      <ConfirmModal
        open={isModalOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        titleName="ยืนยัน"
        message="คุณต้องการยืนยันตัวตนผ่านรหัสผ่าน ใช่หรือไม่??"
        modalIcon={Img_password_confrim.src}
      />
      <SuccessModal
        open={isSuccessModalOpen}
        onClose={handleSuccessClose}
        message="เข้าสู่ระบบสำเร็จ!"
      />
      <ModalFailed
        open={isFailedModalOpen}
        onClose={handleFailedClose}
        header="รหัสผ่านผิด"
        message="คุณกรอกรหัสผ่านผิดหลายครั้ง\nโปรดตรวจสอบและลองใหม่อีกครั้ง"
        buttonText="ตกลง"
        imgSrc={img_failedModal}
      />
    </div>
  );
};

export default PasswordLayout;
