"use client";

import { useState,useRef } from "react";
import Image from "next/image";
import Img_otp from "@/assets/webp/img_otp.webp";
import { useRouter, useSearchParams } from "next/navigation"; //
import {ConfirmModal} from "@/components/modal/modalConfirm"
import { SuccessModal } from "@/components/modal/modalSuccess";
import { useDispatch } from "react-redux";
import { get_OTPPhone,verify_OTPPhone  } from "@/store/frontendStore/transactionAPI"
import {ThunkDispatch} from "@reduxjs/toolkit";
import Img_password_confrim from "@/assets/webp/img_password_confrim.webp"
import img_failedOTP from "@/assets/webp/img_failedOTP.webp"
import img_OTP_timeout from "@/assets/webp/img_OTP_timeout.webp"
import ModalFailed from "@/components/modal/modalFailedpassword";
import { document_CheckValidate  } from "@/store/frontendStore/transactionAPI"
import { enqueueSnackbar } from "notistack";


const OtpLayout = () => {
  const [isOtpRequested, setIsOtpRequested] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // ← new state
  const [inputPhonenumber, setinputPhonenumber] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isFailedModalOpen, setIsFailedModalOpen] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpInput, setOtpInput] = useState(Array(6).fill(""));
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const router = useRouter(); // 🆕
  const searchParams = useSearchParams(); // 🆕
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  const handleLoginClick = () => {
    
     const joinedOtp = otpInput.join(""); 
    
    setIsModalOpen(true);
  };
  const handleConfirm = () => {
     
    verifly_Otp()
    // setIsModalOpen(false);           // close confirm modal
    // setIsSuccessModalOpen(true);     // show success modal
    
  };
   const handleCancel = () => {
    
    setIsModalOpen(false);
  };
  const handleSuccessClose = () => {
    
    setIsSuccessModalOpen(false);
    const documentId = searchParams.get("documentId"); // 🆕
    if (documentId) {
      // router.push(`/frontend/Mapping?documentId=${documentId}`); // 🆕
      router.push(`/frontend/Mapping?documentId=${documentId}&validated=true`);
    } else {
      enqueueSnackbar(`🎯 [OtpLayout] No documentId found in URL.`, {
        variant: "warning",
        autoHideDuration: 3000,
      });
    }
  };
  const verifly_Otp = async () => {
    const joinedOtp = otpInput.join(""); 
    
    
    
    
    if (!inputPhonenumber || otpInput.length !== 6) {
      // check if full otp 6 num
      enqueueSnackbar(`🎯 [OtpLayout] Missing phone number or incomplete OTP.`, {
        variant: "warning",
        autoHideDuration: 3000,
      });
      return;
    }
    try {
      
      const resultAction = await dispatch(
        verify_OTPPhone({ input_otp: joinedOtp })
      );
      

      if (verify_OTPPhone.fulfilled.match(resultAction)) {
        
        setIsModalOpen(false);
        setIsSuccessModalOpen(true); // show success modal
      } else {
        setIsModalOpen(false);         // hide confirm modal
        setIsFailedModalOpen(true);    // show failed modal
      }
    } catch (err) {
      enqueueSnackbar(`🎯 [OtpLayout] Unexpected error during OTP verification: ${err}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };
  const handleRequestOtp = async () => {
    const documentId = searchParams.get("documentId");
     if (!documentId) {
        enqueueSnackbar(`🎯 [OtpLayout] No documentId in URL.`, {
          variant: "error",
          autoHideDuration: 3000,
        });
        return;
      }
    // Basic validation (optional)
    if (!inputPhonenumber || inputPhonenumber.length < 9) {
      enqueueSnackbar(`🎯 [OtpLayout] Invalid phone number format.`, {
        variant: "error",
        autoHideDuration: 3000,
      });
      setIsFailedModalOpen(true);
      return;
    }
    
    try {
       const resultAction = await dispatch(
          document_CheckValidate({
            docid: documentId,
            auth_type: "otp",
            user_input: inputPhonenumber,
          })
        );
      if(document_CheckValidate.fulfilled.match(resultAction)){
       const resultAction = await dispatch(get_OTPPhone(inputPhonenumber)); 
       if (get_OTPPhone.fulfilled.match(resultAction)) {
         setIsOtpRequested(true);
         startResendCountdown(); 
       } else {
         enqueueSnackbar(`🎯 [OtpLayout] OTP request failed: ${resultAction.payload || resultAction.error}`, {
          variant: "error",
          autoHideDuration: 3000,
        });
       }
      }else{
         setIsFailedModalOpen(true);
      }
    } catch (err) {
      enqueueSnackbar(`🎯 [OtpLayout] Unexpected error in OTP request: ${err}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
    // Simulate sending OTP
    // setIsOtpRequested(true);
    // 
  };
  const startResendCountdown = () => {
    setCanResend(false);
    setResendTimer(60); // reset to 60 seconds

    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return isOtpRequested ? (
    // ✅ OTP Code Input UI
    <div className="flex flex-col items-center text-center px-4 sm:px-6 md:px-8 lg:px-[60px] py-6 sm:py-10 space-y-6">
      <Image
        src={Img_otp}
        alt="Otp Verification"
        priority
        width={180}
        height={140}
        className="mx-auto"
      />
      <h1 className="text-theme font-extrabold text-2xl">
        ยืนยันเบอร์โทรศัพท์ของคุณ
      </h1>
      <p className="text-sm text-gray-600">
        กรุณากรอกหมายเลข OTP ที่ส่งไปยัง
        <br />
        <span className="font-semibold">
          {inputPhonenumber
            ? `${inputPhonenumber.slice(0, 3)}-${"*".repeat(
                inputPhonenumber.length - 3
              )}`
            : "xxx-xxxxxxx"}
        </span>{" "}
        {/* (Ref: RMP024) */}
      </p>

      {/* OTP boxes */}
      <div className="flex justify-center space-x-2">
        {otpInput?.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ""); // only digits
              if (!value) return;

              const newOtp = [...otpInput];
              newOtp[i] = value;
              setOtpInput(newOtp);

              // Auto focus next input
              if (i < 5 && value) {
                inputRefs.current[i + 1]?.focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace") {
                const newOtp = [...otpInput];
                if (otpInput[i]) {
                  newOtp[i] = "";
                  setOtpInput(newOtp);
                } else if (i > 0) {
                  inputRefs.current[i - 1]?.focus();
                  newOtp[i - 1] = "";
                  setOtpInput(newOtp);
                }
              }
            }}
            className="w-12 h-12 border border-gray-300 text-center text-xl rounded"
          />
        ))}
      </div>

      <button
        className="w-full max-w-sm bg-theme text-white py-2 rounded-lg hover:bg-theme-dark transition"
        onClick={handleLoginClick}
      >
        ยืนยัน
      </button>

      <p className="text-xs text-gray-600">
        ไม่ได้รับรหัส OTP ?
        <button
          className={`ml-1 underline ${
            canResend ? "text-theme" : "text-gray-400 cursor-not-allowed"
          }`}
          onClick={() => {
            if (canResend) {
              handleRequestOtp();
            }
          }}
          disabled={!canResend}
        >
          {canResend
            ? "ขอ OTP อีกครั้ง"
            : `ขอ OTP อีกครั้งใน ${String(resendTimer).padStart(
                2,
                "0"
              )}:00 นาที`}
        </button>
      </p>
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
        onClose={() => setIsFailedModalOpen(false)}
        header="รหัส OTP หมดอายุ"
        message="กรุณาขอรหัส OTP ใหม่อีกครั้ง"
        buttonText="ตกลง"
        imgSrc={img_OTP_timeout}
      />
    </div>
  ) : (
    // ✅ Phone Number Input UI
    <div className="min-h-full flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-[60px] py-6 sm:py-10">
      <div className="w-full space-y-4">
        <Image
          src={Img_otp}
          alt="Otp login"
          priority
          width={230}
          height={160}
          className="object-cover mx-auto"
          sizes="(min-width: 1024px) 50vw, 0vw"
        />
        <h1 className="text-center mb-6 sm:mb-10 font-extrabold text-2xl sm:text-3xl text-theme">
          ยืนยันตัวตนผ่าน OTP
        </h1>
        <p className="text-center font-medium">
          กรุณากรอกเบอร์โทรศัพท์มือถือ ที่ต้องการใช้
        </p>
        <div className="w-full flex justify-center">
          <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl space-y-4">
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="ระบุหมายเลขโทรศัพท์"
              value={inputPhonenumber}
              onChange={(e) => {
                setinputPhonenumber(e.target.value);
                // setIsPasswordError(false);
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
            <button
              className="w-full bg-theme text-white py-2 rounded-lg hover:bg-theme-dark transition"
              onClick={handleRequestOtp}
            >
              ขอรหัส OTP
            </button>
          </div>
        </div>
      </div>
      <ModalFailed
        open={isFailedModalOpen}
        onClose={() => setIsFailedModalOpen(false)}
        header="เบอร์โทรศัพท์ไม่ถูกต้อง"
        message="กรุณาเบอร์โทรศัพท์ ใหม่อีกครั้ง"
        buttonText="ตกลง"
        imgSrc={img_failedOTP}
      />
    </div>
  );
  
};

export default OtpLayout;
