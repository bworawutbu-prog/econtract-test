"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { PlusIcon, Trash, Pencil, ChevronDown } from "lucide-react";
import NoSignatureIcon from "@/assets/webp/profile/no_signature.webp";
import { Input, Select, Tabs } from "antd";
import ModalComponent from "@/components/modal/modal";
import SignatureCanvas from "react-signature-canvas";
import DragAndDropFile from "@/components/ui/dragAndDropFile";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from "@/store";
import {
  post_user_sign,
  get_user_sign,
  get_all_user_sign,
  update_user_sign,
  delete_user_sign,
} from "@/store/frontendStore/profileAPI";
import { enqueueSnackbar } from "notistack";
import router from "next/router";

// Types
interface SignatureSettingProps {
  dispatch: ThunkDispatch<RootState, unknown, AnyAction>;
}

type TabType = "uploadFile" | "draw" | "profile" | "signature" | "email";
type LoadingState = "idle" | "pending" | "succeeded" | "failed";

interface SignatureOption {
  label: string;
  value: string;
}

const SignatureSetting: React.FC<SignatureSettingProps> = ({ dispatch }) => {
  // Modal states
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isSignatureDeleteModalOpen, setIsSignatureDeleteModalOpen] =
    useState(false);

  // Signature data states
  const [userSignature, setUserSignature] = useState<string | null>(null);
  const [allSignatures, setAllSignatures] = useState<SignatureOption[]>([]);
  const [selectedStampName, setSelectedStampName] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<string>("");

  // Form states
  const [stampName, setStampName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Preserve form data for confirmation
  const [pendingStampName, setPendingStampName] = useState("");
  const [pendingUploadedBase64, setPendingUploadedBase64] = useState<
    string | null
  >(null);
  const [pendingIsEditing, setPendingIsEditing] = useState(false);

  // Separate state for each tab to preserve data when switching
  const [uploadTabData, setUploadTabData] = useState<string | null>(null);
  const [drawTabData, setDrawTabData] = useState<string | null>(null);

  // UI states
  const [SigningIMGtabs, setSigningIMGtabs] = useState<TabType>("uploadFile");
  const [signatureLoading, setSignatureLoading] =
    useState<LoadingState>("idle");

  // Refs
  const signatureRef = useRef<SignatureCanvas>(null);
  const signatureContainerRef = useRef<HTMLDivElement>(null); // Ref สำหรับ container ที่หุ้ม canvas

  // Canvas size state - ใช้สำหรับให้ canvas size ตรงกับ container size
  const [canvasSize, setCanvasSize] = useState({ width: 470, height: 150 });

  // Computed values
  const isLoading = signatureLoading === "pending";
  const hasSignatures = allSignatures.length > 0;

  // Check if each tab has data
  const hasUploadData = !!(uploadTabData || uploadedBase64);
  const hasDrawData = !!(
    drawTabData ||
    (signatureRef.current && !signatureRef.current.isEmpty())
  );

  // Determine which tabs should be disabled
  // Disable tabs in both create and edit modes when there's data in the other tab
  const isUploadTabDisabled = hasDrawData;
  const isDrawTabDisabled = hasUploadData;

  // API Functions
  const call_post_user_sign = async (payload: {
    stamp_name: string;
    sign_base64: string;
  }) => {
    try {
      const res = await dispatch(post_user_sign(payload)).unwrap();
      return res;
    } catch (error) {
      enqueueSnackbar(`โหลดข้อมูลลายเซ็นไม่สำเร็จ: ${error}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
      // localStorage.clear();
      // sessionStorage.clear();
      // router.replace("/login");
      throw error;
    }
  };

  const refresh_stamp_sign = async (selected?: string, isCreate = false) => {
    try {
      setSignatureLoading("pending");
      const res = await dispatch(get_all_user_sign()).unwrap();
      const data = res?.data ?? [];
      const options = data?.map((item: any) => ({
        label: item.stamp_name,
        value: item.stamp_name,
      }));
      setAllSignatures(options);
      // Determine which signature to select
      let pick: string | undefined;
      if (selected) {
        pick = selected;
      } else if (isCreate && options.length > 0) {
        pick = options[options.length - 1].value; // Select the newly created one
      } else if (options.length > 0) {
        pick = options[0].value; // Select the first one by default
      }
      if (pick) {
        setSelectedOption(pick);
        setSelectedStampName(pick);
        const sigRes = await dispatch(get_user_sign(pick)).unwrap();
        setUserSignature(sigRes?.data?.sign_base64 ?? "");
      } else {
        setSelectedOption("");
        setSelectedStampName("");
        setUserSignature(null);
      }
      setSignatureLoading("succeeded");
    } catch (err) {
      setSignatureLoading("failed");
    }
  };

  // Event Handlers
  const handleDeleteSignature = async () => {
    try {
      await dispatch(delete_user_sign(selectedStampName)).unwrap();
      await refresh_stamp_sign(undefined, false);
      return true;
    } catch (error) {
      enqueueSnackbar(`ลบลายเซ็นไม่สำเร็จ: ${error}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
      return false;
    }
  };

  const validateAndGetSignatureBase64 = (): string | null => {
    // Use pending data if available, otherwise use current form data
    const finalStampName = pendingStampName || stampName;
    const finalUploadedBase64 = pendingUploadedBase64 || uploadedBase64;

    if (!finalStampName.trim()) {
      return null;
    }

    // Check upload tab data first, then uploadedBase64
    if (uploadTabData) {
      return uploadTabData;
    }
    if (finalUploadedBase64) {
      return finalUploadedBase64;
    }

    // Check draw tab data
    if (drawTabData) {
      return drawTabData;
    }

    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      return null;
    }
    return signatureRef.current.toDataURL();
  };

  const handleUploadFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setUploadedBase64(base64);
      setUploadTabData(base64); // Save to tab-specific state
      // Clear draw tab data when upload tab is used (both create and edit modes)
      setDrawTabData(null);
      if (signatureRef.current) {
        signatureRef.current.clear();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileValidationError = (error: string) => {
    setFileError(error);
  };

  const handleFileValidationSuccess = (file: File) => {
    setFileError(null);
  };

  const customSignatureValidation = (file: File): boolean | string => {
    if (file.type !== "image/png" && file.type !== "image/webp") {
      return "รองรับเฉพาะไฟล์ PNG และ WEBP เท่านั้น";
    }
    return true;
  };

  const handleConfirmSaveSign = async () => {
    // Use pending data if available, otherwise use current form data
    const finalStampName = pendingStampName || stampName;
    const finalUploadedBase64 = pendingUploadedBase64 || uploadedBase64;
    const finalIsEditing = pendingIsEditing || isEditing;

    const signBase64 = validateAndGetSignatureBase64();
    if (!signBase64) {
      return false;
    }

    if (finalIsEditing) {
      try {
        await dispatch(
          update_user_sign({
            old_stamp_name: selectedStampName,
            new_stamp_name: finalStampName,
            sign_base64: signBase64,
          })
        ).unwrap();
        await refresh_stamp_sign(finalStampName, false);
        // Clear all data after successful save
        clearAllFormData();
        return true;
      } catch (error) {
        enqueueSnackbar(`อัปเดตลายเซ็นล้มเหลว: ${error}`, {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }
    } else {
      try {
        await call_post_user_sign({
          stamp_name: finalStampName,
          sign_base64: signBase64,
        });
        await refresh_stamp_sign(undefined, true);
        // Clear all data after successful save
        clearAllFormData();
        return true;
      } catch (error) {
        enqueueSnackbar(`สร้างลายเซ็นไม่สำเร็จ: ${error}`, {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }
    }
  };

  const handleSignatureSelect = (val: string) => {
    const stampValue = val || "";
    setSelectedOption(val);
    setSelectedStampName(stampValue);

    dispatch(get_user_sign(stampValue))
      .unwrap()
      .then((data) => {
        if (data?.data?.sign_base64) {
          setUserSignature(data.data.sign_base64);
        } else {
          enqueueSnackbar(`ไม่พบ sign_base64 `, {
            variant: "warning",
            autoHideDuration: 3000,
          });
          setUserSignature("");
        }
      })
      .catch((error) => {
        // enqueueSnackbar(`โหลดข้อมูลลายเซ็นไม่สำเร็จ: ${error}`, {
        //   variant: "error",
        //   autoHideDuration: 3000,
        // });
        setUserSignature("");
        // localStorage.clear();
        // sessionStorage.clear();
        // router.replace("/login");
      });
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setIsSignatureModalOpen(true);
    setStampName("");
    setUploadedBase64(null);
    setFileError(null);
    // Clear pending data as well
    setPendingStampName("");
    setPendingUploadedBase64(null);
    setPendingIsEditing(false);
    // Clear tab-specific data for new signatures
    setUploadTabData(null);
    setDrawTabData(null);
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const openEditModal = () => {
    setIsEditing(true);
    setIsSignatureModalOpen(true);
    setStampName(selectedStampName);
    setUploadedBase64(userSignature);

    setPendingStampName("");
    setPendingUploadedBase64(null);
    setPendingIsEditing(false);
    if (userSignature) {
      setUploadTabData(userSignature);
      setDrawTabData(null);
    }
    setSigningIMGtabs("uploadFile");
  };

  const openDeleteModal = () => {
    setIsSignatureDeleteModalOpen(true);
  };

  const closeSignatureModal = () => {
    // Save current form data to pending state before closing
    saveToPendingData();
    setSigningIMGtabs("uploadFile");
    setIsSignatureModalOpen(false);
    // Don't clear data immediately - preserve it for confirmation
    // Data will be cleared after successful save or when modal is reopened
  };

  const clearSignatureCanvas = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
    setDrawTabData(null);
    // Clear upload tab data when draw tab is cleared (both create and edit modes)
    setUploadTabData(null);
    setUploadedBase64(null);
  };

  const clearUploadData = () => {
    setUploadTabData(null);
    setUploadedBase64(null);
    setFileError(null);
  };

  const clearAllFormData = () => {
    setStampName("");
    setUploadedBase64(null);
    setFileError(null);
    setPendingStampName("");
    setPendingUploadedBase64(null);
    setPendingIsEditing(false);
    // Clear tab-specific data
    setUploadTabData(null);
    setDrawTabData(null);
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const saveToPendingData = () => {
    setPendingStampName(stampName);
    setPendingUploadedBase64(uploadedBase64);
    setPendingIsEditing(isEditing);
    // Save tab-specific data as well
    setPendingUploadedBase64(uploadTabData || uploadedBase64);
  };

  // Effects
  // 🎯 FIXED: ใช้ useLayoutEffect เพื่อวัดขนาด container และอัปเดต canvas size
  // ทำให้ canvas bitmap size ตรงกับ CSS display size เสมอ
  useLayoutEffect(() => {
    // ทำงานเฉพาะเมื่อ modal เปิด
    if (!isSignatureModalOpen) return;

    function updateCanvasSize() {
      const container = signatureContainerRef.current;
      if (container && container.clientWidth > 0) {
        // อ่านขนาดจริงของ container (clientWidth) และกำหนดความสูงคงที่
        setCanvasSize({
          width: container.clientWidth,
          height: 150, // ความสูงคงที่ หรือจะคำนวณอัตราส่วนก็ได้
        });
      }
    }

    // อัปเดตเมื่อหน้าจอเปลี่ยนขนาด
    window.addEventListener("resize", updateCanvasSize);
    
    // อัปเดตครั้งแรกเมื่อ modal เปิด (ใช้ setTimeout เพื่อให้ DOM render เสร็จก่อน)
    // ใช้ requestAnimationFrame เพื่อให้แน่ใจว่า DOM render เสร็จแล้ว
    const rafId = requestAnimationFrame(() => {
      updateCanvasSize();
      // อัปเดตอีกครั้งหลังจาก render เสร็จ (fallback)
      setTimeout(updateCanvasSize, 100);
    });

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      cancelAnimationFrame(rafId);
    };
  }, [isSignatureModalOpen]); // ทำงานเมื่อ modal เปิด/ปิด

  useEffect(() => {
    const canvas = document.querySelector(".signature-canvas");
    if (!canvas) return;

    const handleDraw = () => {
      if (signatureRef.current) {
        // Optional: Add any draw event handling here
      }
    };

    canvas.addEventListener("mouseup", handleDraw);
    canvas.addEventListener("touchend", handleDraw);

    return () => {
      canvas.removeEventListener("mouseup", handleDraw);
      canvas.removeEventListener("touchend", handleDraw);
    };
  }, []);

  useEffect(() => {
    refresh_stamp_sign();
  }, [dispatch]);

  // Load existing signature data when editing
  useEffect(() => {
    if (isEditing && userSignature) {
      setUploadTabData(userSignature);
      setDrawTabData(null);
      setUploadedBase64(userSignature);
    }
  }, [isEditing, userSignature]);

  // Render Functions
  const renderSignatureSelector = () => (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 flex-wrap w-full md:w-[40%]">
      <label className="text-gray-600 block mb-1">ลายเซ็นเริ่มต้น :</label>
      {isLoading ? (
        <div className="flex-1 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
      ) : (
        <Select
          options={allSignatures}
          placeholder="เลือก"
          value={selectedOption}
          className="flex-1 h-10 [&_.ant-select-selector]:rounded-xl w-full md:min-w-[200px]"
          onChange={handleSignatureSelect}
          suffixIcon={<ChevronDown size={20} />}
        />
      )}
      {hasSignatures && (
        <button
          onClick={openCreateModal}
          className="border border-theme text-theme px-4 py-2 flex items-center gap-2 rounded-xl"
          disabled={isLoading}
        >
          <PlusIcon size={24} />
          เพิ่มลายเซ็น
        </button>
      )}
    </div>
  );

  const renderSignatureDisplay = () => (
    <div>
      <label className="text-gray-600 block mb-1">ลายเซ็น</label>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-6 bg-[#FAFAFA] gap-3 rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
          </div>
        </div>
      ) : userSignature ? (
        <div className="flex flex-col items-center justify-center pt-3 px-3 pb-6 bg-[#FAFAFA] gap-3 rounded-xl">
          <div className="flex items-center gap-2 w-full justify-end">
            <button
              onClick={openEditModal}
              className="border border-theme text-theme px-4 py-2 flex items-center gap-2 rounded-xl"
              disabled={isLoading}
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={openDeleteModal}
              className="border border-theme text-theme px-4 py-2 flex items-center gap-2 rounded-xl"
              disabled={isLoading}
            >
              <Trash size={14} />
            </button>
          </div>
          <div>
            <img
              src={userSignature}
              alt="User Signature"
              className="max-w-full h-auto object-contain rounded-lg lg:max-h-[400px] max-h-[250px]"
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 bg-[#FAFAFA] gap-3 rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <Image
              src={NoSignatureIcon}
              alt="No Signature"
              width={60}
              height={60}
            />
            <p>ยังไม่มีลายเซ็น</p>
          </div>
          <button
            onClick={openCreateModal}
            className="border border-theme text-theme px-4 py-2 flex items-center gap-2 rounded-xl"
            disabled={isLoading}
          >
            <PlusIcon size={24} />
            เพิ่มลายเซ็น
          </button>
        </div>
      )}
    </div>
  );

  const renderSignatureModal = () => (
    <ModalComponent
      open={isSignatureModalOpen}
      onClose={closeSignatureModal}
      onConfirm={handleConfirmSaveSign}
      titleName={`${isEditing ? "แก้ไขลายเซ็น" : "อัปโหลดลายเซ็น"}`}
      btnConfirm="ยืนยัน"
      modalType="create"
      isDisabled={
        !stampName.trim() ||
        (!uploadedBase64 && signatureRef.current?.isEmpty())
      }
    >
      <div>
        <label className="mb-1">ชื่อลายเซ็น</label>
        <Input
          type="text"
          placeholder="ระบุ"
          value={stampName}
          onChange={(e) => setStampName(e.target.value)}
          className="w-full border border-gray-300 rounded-xl"
        />
      </div>

      <div>
        <Tabs
          activeKey={SigningIMGtabs}
          onChange={(key) => {
            const newKey = key as TabType;
            setSigningIMGtabs(newKey);
            // Don't clear data when switching tabs - preserve it
            // The data will be available when user switches back
          }}
          items={[
            {
              label: isUploadTabDisabled
                ? "กรุณาล้างค่าก่อนอัปโหลดไฟล์"
                : "อัปโหลดไฟล์",
              key: "uploadFile",
              disabled: isUploadTabDisabled,
              children: (
                <>
                  <DragAndDropFile
                    onFileSelect={handleUploadFileChange}
                    onFileValidationError={handleFileValidationError}
                    onFileValidationSuccess={handleFileValidationSuccess}
                    acceptedFileTypes={[".png", ".webp"]}
                    maxFileSize={5}
                    placeholder={
                      <>
                        <span className="text-theme">คลิกหรือวางไฟล์ PNG</span>
                      </>
                    }
                    description="รองรับเฉพาะไฟล์ PNG และ WEBP ขนาดไม่เกิน 5 MB"
                    preview={true}
                    previewImage={uploadTabData || uploadedBase64 || ""}
                    onPreviewImageChange={(image) => {
                      setUploadedBase64(image);
                      setUploadTabData(image);
                    }}
                    customValidation={customSignatureValidation}
                    errorMessage={fileError || ""}
                    clearError={() => setFileError(null)}
                    onClearPreview={clearUploadData}
                  />
                </>
              ),
            },
            {
              label: isDrawTabDisabled
                ? "กรุณาล้างค่าก่อนวาดลายเซ็น"
                : "วาดลายเซ็น",
              key: "draw",
              disabled: isDrawTabDisabled,
              children: (
                <>
                  <div className="flex items-end flex-col gap-2 w-full">
                    <button
                      className="text-sm text-right w-fit"
                      onClick={clearSignatureCanvas}
                    >
                      ล้างค่า
                    </button>
                    {/* 🎯 FIXED: ใส่ ref ให้ container เพื่อวัดขนาด */}
                    <div className="w-full" ref={signatureContainerRef}>
                      <SignatureCanvas
                        penColor="blue"
                        backgroundColor="rgba(255,255,255,0)"
                        ref={signatureRef}
                        canvasProps={{
                          // 🎯 FIXED: ใช้ขนาดจาก state แทนค่าตายตัว
                          width: canvasSize.width,
                          height: canvasSize.height,
                          // 🎯 FIXED: ลบ w-full ออก เพราะเราควบคุมขนาดจาก width attribute แล้ว
                          className:
                            "signature-canvas border border-[#E6E6E6] rounded-xl max-h-[180px]",
                        }}
                        onEnd={() => {
                          // Save signature data when user finishes drawing
                          if (
                            signatureRef.current &&
                            !signatureRef.current.isEmpty()
                          ) {
                            const signatureData =
                              signatureRef.current.toDataURL();
                            setDrawTabData(signatureData);
                            // Clear upload tab data when draw tab is used (both create and edit modes)
                            setUploadTabData(null);
                            setUploadedBase64(null);
                          }
                        }}
                      />
                    </div>
                  </div>
                </>
              ),
            },
          ]}
        />
      </div>
    </ModalComponent>
  );

  const renderDeleteModal = () => (
    <ModalComponent
      open={isSignatureDeleteModalOpen}
      onClose={() => setIsSignatureDeleteModalOpen(false)}
      titleName="ลบลายเซ็น"
      btnConfirm="ลบ"
      modalType="delete"
      onConfirm={handleDeleteSignature}
    >
      <div className="text-center">
        <p className="text-sm font-normal">
          คุณต้องการลบลายเซ็นนี้ ใช่หรือไม่?
        </p>
      </div>
    </ModalComponent>
  );

  return (
    <section className="profile-content p-6 bg-white text-medium rounded-2xl w-full shadow-theme">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h3 className="text-[18px] font-semibold flex items-center gap-2 mb-6">
          ลายเซ็น
        </h3>
        {renderSignatureSelector()}
      </div>
      <div className="space-y-4">{renderSignatureDisplay()}</div>

      {renderSignatureModal()}
      {renderDeleteModal()}
    </section>
  );
};

export default SignatureSetting;
