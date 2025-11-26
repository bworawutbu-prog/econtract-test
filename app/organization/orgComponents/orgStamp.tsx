"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Input, Select } from "antd";
import StampIcon from "@/assets/webp/org/stamp.webp";
import EditIcon from "@/assets/webp/Edit_Pen.webp";
import DeleteIcon from "@/assets/webp/Bin_Empty.webp";
import NoStampIcon from "@/assets/webp/org/no_stamp_2.webp";
import { ChevronDown, PlusIcon } from "lucide-react";
import ModalComponent from "@/components/modal/modal";
import DragAndDropFile from "@/components/ui/dragAndDropFile";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  createESeal,
  getAllESeals,
  getESealById,
  updateESeal,
  deleteESeal,
  getBusinessProfile,
} from "@/store/backendStore";
import {
  createESeal2,
  updateESeal2,
  deleteESeal2,
} from "@/store/backendStore/orgAPI";
import { setCompanyData } from "@/store/slices/companySlice";
import BusinessUtils from "@/store/utils/businessUtils";
import { StampUser } from "@/store/types/user";
import { enqueueSnackbar } from "notistack";

interface EntityObject {
  id: string;
  name: string;
  email: string;
  department?: string;
}

interface StampConfig {
  stamp_name: string;
  accessType: "public" | "private" | "department";
  users: StampUser[];
  departments?: { [company: string]: string[] } | "all";
  file: File | null;
  stamp_width: number;
  stamp_height: number;
  stamp_unit: "mm" | "cm" | "in";
}

function orgStamp() {
  const dispatch = useAppDispatch();
  const [isStampModalOpen, setIsStampModalOpen] = useState(false);
  const [isStampDeleteModalOpen, setIsStampDeleteModalOpen] = useState(false);
  const [stampName, setStampName] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [eSealsData, setESealsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [businessProfile, setBusinessProfile] = useState<any>(null);
  const [selectedStampImage, setSelectedStampImage] = useState<string | null>(
    null
  );
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [stampConfig, setStampConfig] = useState<StampConfig>({
    stamp_name: "",
    accessType: "private",
    users: [],
    file: null,
    stamp_width: 0,
    stamp_height: 0,
    stamp_unit: "cm",
  });

  // Preserve form data for confirmation (pending state)
  const [pendingStampName, setPendingStampName] = useState("");
  const [pendingUploadedFile, setPendingUploadedFile] = useState<File | null>(
    null
  );
  const [pendingStampConfig, setPendingStampConfig] = useState<StampConfig>({
    stamp_name: "",
    accessType: "private",
    users: [],
    file: null,
    stamp_width: 0,
    stamp_height: 0,
    stamp_unit: "cm",
  });
  const [pendingEditingId, setPendingEditingId] = useState<string | null>(null);
  const eSealState = useAppSelector((state) => state.eSeal);
  const companyData = useAppSelector((state) => state.company.data);
  const { selectedBusinessId, selectedBusinessName } = useAppSelector(
    (state) => state.business
  );

  // 🔧 Load Business Profile and Seals when component mounts
  useEffect(() => {
    refreshStampsData();
  }, [dispatch, selectedBusinessId, companyData?.business_id]); // Reload when business_id changes
  const handleEdit = async (id: string) => {
    try {
      setIsModalLoading(true);
      setEditingId(id);

      // Find the selected seal from eSealsData using _id
      let selectedSeal = eSealsData.find((seal) => seal._id === id);

      if (!selectedSeal) {
        await refreshData();

        selectedSeal = eSealsData.find((seal) => seal._id === id);
        if (!selectedSeal) {
          enqueueSnackbar(
            `ไม่พบข้อมูลตราประทับหลังจากรีเฟรช กรุณาลองใหม่อีกครั้ง.`,
            {
              variant: "error",
              autoHideDuration: 3000,
            }
          );
          return;
        }
      }

      // ตั้งค่าข้อมูลในฟอร์ม
      setStampName(selectedSeal.name || "");

      // ตั้งค่า preview image หากมี seal_base64 (เพิ่ม data URI prefix หากยังไม่มี)
      if (selectedSeal.seal_base64) {
        const base64WithPrefix = selectedSeal.seal_base64.startsWith("data:")
          ? selectedSeal.seal_base64
          : `data:image/png;base64,${selectedSeal.seal_base64}`;
        setPreviewImage(base64WithPrefix);
      }

      setStampConfig({
        stamp_name: selectedSeal.name || "",
        accessType: "private",
        users: [],
        file: null, // ไฟล์จะต้องอัปโหลดใหม่หากต้องการเปลี่ยน
        stamp_width: selectedSeal.size
          ? parseFloat(selectedSeal.size.width)
          : 0,
        stamp_height: selectedSeal.size
          ? parseFloat(selectedSeal.size.height)
          : 0,
        stamp_unit: selectedSeal.size ? selectedSeal.size.unit : "cm",
      });

      // Clear pending data when opening modal for editing
      setPendingStampName("");
      setPendingUploadedFile(null);
      setPendingStampConfig({
        stamp_name: "",
        accessType: "private",
        users: [],
        file: null,
        stamp_width: 0,
        stamp_height: 0,
        stamp_unit: "cm",
      });
      setPendingEditingId(null);

      // เปิด modal
      setIsStampModalOpen(true);
    } catch (error) {
      console.error("Error in handleEdit:", error);
      // enqueueSnackbar(`โหลดข้อมูลตราประทับล้มเหลว: ${error}`, {
      //   variant: "error",
      //   autoHideDuration: 3000,
      // });
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // เปิด delete modal
    setIsStampDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (): Promise<boolean> => {
    try {
      const businessId = selectedBusinessId || companyData?.business_id;
      if (!businessId) {
        throw new Error("ไม่พบข้อมูลบริษัท");
      }

      // หาข้อมูลตราประทับที่จะลบ
      const sealToDelete = eSealsData.find((seal) => seal._id === stampName);
      if (!sealToDelete) {
        throw new Error("ไม่พบข้อมูลตราประทับที่จะลบ");
      }

      // เรียก API ลบตราประทับ (ส่งข้อมูลเดิมเพื่อยืนยันการลบ)
      await dispatch(
        deleteESeal2({
          businessId: businessId,
          sealId: stampName,
          data: {
            seal_name: sealToDelete.name,
            seal_base64: sealToDelete.seal_base64 || "",
            business_id: businessId,
          },
        }) as any
      ).unwrap();

      // แสดงข้อความสำเร็จ
      enqueueSnackbar(`ลบตราประทับสำเร็จ: ${sealToDelete.name}`, {
        variant: "success",
        autoHideDuration: 3000,
      });

      // โหลดข้อมูลใหม่
      await refreshStampsData();

      // ปิด modal
      setIsStampDeleteModalOpen(false);

      return true;
    } catch (error: any) {
      enqueueSnackbar(`ลบตราประทับไม่สำเร็จ: ${error}`, {
        variant: "error",
        autoHideDuration: 3000,
      });

      // แสดงข้อความผิดพลาด
      let errorMessage = "เกิดข้อผิดพลาดในการลบตราประทับ กรุณาลองใหม่อีกครั้ง";
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      enqueueSnackbar(`ลบตราประทับไม่สำเร็จ: ${errorMessage}`, {
        variant: "error",
        autoHideDuration: 3000,
      });

      return false;
    }
  };
  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    setStampConfig((prev) => ({ ...prev, file }));
  };

  const handlePreviewImageChange = (image: string | null) => {
    setPreviewImage(image);
  };

  const handleFileValidationError = (error: string) => {
    setFileError(error);
  };

  const handleFileValidationSuccess = (file: File) => {
    setFileError(null);
  };

  // Function to handle stamp selection
  const handleStampSelect = (value: string) => {
    setStampName(value);
    setSelectedOption(value);

    // Find the selected stamp from eSealsData
    const selectedStamp = eSealsData.find((seal) => seal._id === value);

    if (selectedStamp) {
      // Set the selected stamp image
      setSelectedStampImage(
        selectedStamp.seal_base64
          ? `data:image/png;base64,${selectedStamp.seal_base64}`
          : null
      );

      if (companyData) {
        // Update companyData with the selected stamp's base64 image
        const updatedCompanyData = {
          ...companyData,
          logo_url: selectedStamp.seal_base64
            ? `data:image/png;base64,${selectedStamp.seal_base64}`
            : companyData.logo_url,
        };

        // Dispatch the updated company data to Redux store
        dispatch(setCompanyData(updatedCompanyData));
      }
    } else if (value === "" && companyData) {
      // Clear logo when no stamp is selected
      setSelectedStampImage(null);
      const updatedCompanyData = {
        ...companyData,
        logo_url: undefined,
      };

      dispatch(setCompanyData(updatedCompanyData));
    }
  };

  const customFileValidation = (file: File): boolean | string => {
    // Custom validation for stamp files
    if (file.type === "application/pdf") {
      // Additional PDF validation if needed
      return true;
    }

    // For image files, basic validation
    if (file.type.startsWith("image/")) {
      // You can add more specific validation here
      return true;
    }

    return true;
  };

  // Function to convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Function to save current form data to pending state
  const saveToPendingData = () => {
    setPendingStampName(stampName);
    setPendingUploadedFile(uploadedFile);
    setPendingStampConfig(stampConfig);
    setPendingEditingId(editingId);
  };

  // Function to clear all form data
  const clearAllFormData = () => {
    setStampName("");
    setUploadedFile(null);
    setPreviewImage(null);
    setEditingId(null);
    setStampConfig({
      stamp_name: "",
      accessType: "private",
      users: [],
      file: null,
      stamp_width: 0,
      stamp_height: 0,
      stamp_unit: "cm",
    });
    // Clear pending data as well
    setPendingStampName("");
    setPendingUploadedFile(null);
    setPendingStampConfig({
      stamp_name: "",
      accessType: "private",
      users: [],
      file: null,
      stamp_width: 0,
      stamp_height: 0,
      stamp_unit: "cm",
    });
    setPendingEditingId(null);
    // Don't clear selectedStampImage and selectedOption here - they should persist for display
  };

  // Function to open create modal
  const openCreateModal = () => {
    clearAllFormData();
    setIsStampModalOpen(true);
  };

  // Function to close modal and refresh data
  const closeModal = () => {
    // Save current form data to pending state before closing
    saveToPendingData();
    setIsStampModalOpen(false);
    // Don't clear data immediately - preserve it for confirmation
    // Data will be cleared after successful save or when modal is reopened
  };

  // Function to refresh data when needed
  const refreshData = async () => {
    try {
      await refreshStampsData();
    } catch (error) {
      console.error("Failed to refresh data:", error);
    }
  };

  // Function to refresh stamps data (similar to refresh_stamp_sign in SignatureSetting)
  const refreshStampsData = async (selected?: string, isCreate = false) => {
    try {
      setLoading(true);

      const businessId = selectedBusinessId || companyData?.business_id;
      if (!businessId) {
        // console.log(
        //   "No business ID available in orgStamp - selectedBusinessId:",
        //   selectedBusinessId,
        //   "companyData:",
        //   companyData
        // );
        setLoading(false);
        return;
      }

      const response = await dispatch(
        getBusinessProfile(businessId) as any
      ).unwrap();
      setBusinessProfile(response.data);

      // Update eSealsData from the seal_list in business profile
      if (response.data.seal_list && Array.isArray(response.data.seal_list)) {
        const transformedSeals = response?.data?.seal_list?.map((seal: any) => ({
          _id: seal.id,
          name: seal.name,
          seal_base64: seal.seal,
          size: { width: "100", height: "100", unit: "px" },
          permission: [],
        }));
        setESealsData(transformedSeals);

        // Determine which seal to select (similar to SignatureSetting logic)
        let pick: string | undefined;
        if (selected) {
          pick = selected;
        } else if (isCreate && transformedSeals.length > 0) {
          pick = transformedSeals[transformedSeals.length - 1]._id; // Select the newly created one
        } else if (transformedSeals.length > 0) {
          pick = transformedSeals[0]._id; // Select the first one by default
        }

        if (pick) {
          setStampName(pick);
          setSelectedOption(pick);

          // Find the selected seal and set its image
          const selectedSeal = transformedSeals.find(
            (seal: any) => seal._id === pick
          );
          if (selectedSeal && selectedSeal.seal_base64) {
            const base64WithPrefix = selectedSeal.seal_base64.startsWith(
              "data:"
            )
              ? selectedSeal.seal_base64
              : `data:image/png;base64,${selectedSeal.seal_base64}`;
            setSelectedStampImage(base64WithPrefix);

            // Update company logo
            if (companyData) {
              const updatedCompanyData = {
                ...companyData,
                logo_url: base64WithPrefix,
              };
              dispatch(setCompanyData(updatedCompanyData));
            }
          }
        } else {
          setStampName("");
          setSelectedOption("");
          setSelectedStampImage(null);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to refresh stamps data:", error);
      // enqueueSnackbar(`รีเฟรชตราประทับล้มเหลว: ${error}`, {
      //   variant: "error",
      //   autoHideDuration: 3000,
      // });
      setLoading(false);
    }
  };

  const renderDeleteModal = () => (
    <ModalComponent
      open={isStampDeleteModalOpen}
      onClose={() => setIsStampDeleteModalOpen(false)}
      titleName="ลบตราประทับ"
      btnConfirm="ลบ"
      modalType="delete"
      isDisabled={eSealsData.length >= 1}
      onConfirm={handleConfirmDelete}
    />
  );

  // Render Functions (similar to SignatureSetting.tsx)
  const renderStampSelector = () => (
    <div className="flex items-center gap-2 flex-wrap">
      <label className="text-gray-600 block">ตราประทับ : </label>
      <div className="flex items-center gap-2 flex-wrap">
        {loading ? (
          <div className="flex-1 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
        ) : (
          <Select
            options={eSealsData?.map((seal, index) => ({
              label: seal.name || `ตราประทับ ${index + 1}`,
              value: seal._id,
            }))}
            placeholder="เลือก"
            value={selectedOption}
            className="flex-1 h-10 [&_.ant-select-selector]:rounded-xl min-w-[200px]"
            onChange={handleStampSelect}
            suffixIcon={<ChevronDown size={20} />}
            disabled={eSealsData.length === 0}
            notFoundContent={
              eSealsData.length === 0
                ? "กรุณาเพิ่มตราประทับก่อน"
                : "ไม่พบข้อมูล"
            }
          />
        )}
        {eSealsData.length > 0 && (
          <button
            onClick={openCreateModal}
            className={`border border-theme text-theme px-4 py-2 flex items-center gap-2 rounded-xl ${
              eSealsData.length >= 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading || eSealsData.length >= 1}
          >
            <PlusIcon size={24} />
            อัปโหลด
          </button>
        )}
      </div>
    </div>
  );

  const renderStampDisplay = () => (
    <>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-6 bg-[#FAFAFA] gap-3 rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
          </div>
        </div>
      ) : selectedStampImage ? (
        <div className="flex flex-col items-center justify-center pt-3 px-3 pb-6 bg-[#FAFAFA] gap-3 rounded-xl">
          <div className="flex items-center gap-2 w-full justify-end">
            <button
              onClick={() => handleEdit(stampName)}
              className="border border-theme text-theme px-4 py-2 flex items-center gap-2 rounded-xl"
              disabled={loading}
            >
              <Image src={EditIcon} alt="Edit" width={14} height={14} />
            </button>
            {/* <button
              onClick={() => handleDelete(stampName)}
              className={`border border-theme text-theme px-4 py-2 flex items-center gap-2 rounded-xl ${
                eSealsData.length >= 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading || eSealsData.length >= 1}
            >
              <Image src={DeleteIcon} alt="Delete" width={14} height={14} />
            </button> */}
          </div>
          <div>
            <img
              src={selectedStampImage}
              alt="Selected Stamp"
              className="max-w-full h-auto object-contain rounded-lg lg:max-h-[400px] max-h-[250px]"
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 bg-[#FAFAFA] gap-3 rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <Image src={NoStampIcon} alt="No Stamp" width={60} height={60} />
            <p>ยังไม่มีตราประทับ</p>
          </div>
          <button
            onClick={openCreateModal}
            className={`border border-theme text-theme px-4 py-2 flex items-center gap-2 rounded-xl ${
              eSealsData.length >= 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            <PlusIcon size={24} />
            เพิ่มตราประทับ
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      <div className="flex justify-between items-center gap-2 flex-wrap mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          ตราประทับ
        </h3>
        {renderStampSelector()}
      </div>
      <div className="space-y-4">{renderStampDisplay()}</div>

      <ModalComponent
        open={isStampModalOpen}
        onClose={closeModal}
        titleName={editingId ? "แก้ไขตราประทับ" : "เพิ่มตราประทับ"}
        modalType={editingId ? "default" : "create"}
        isDisabled={
          eSealState.loading === "pending" ||
          isModalLoading ||
          !stampName ||
          !stampName.trim() ||
          (!editingId && !uploadedFile) || // ไฟล์จำเป็นเฉพาะเมื่อสร้างใหม่
          !(selectedBusinessId || companyData?.business_id) // ต้องมี business_id
        }
        btnConfirm={
          eSealState.loading === "pending"
            ? editingId
              ? "กำลังแก้ไข..."
              : "กำลังสร้าง..."
            : "ยืนยัน"
        }
        onConfirm={async () => {
          try {
            // Use pending data if available, otherwise use current form data
            const finalStampName = pendingStampName || stampName;
            const finalUploadedFile = pendingUploadedFile || uploadedFile;
            const finalEditingId = pendingEditingId || editingId;

            if (!finalEditingId && !finalUploadedFile) {
              enqueueSnackbar(
                `อัปเดตตราประทับล้มเหลว: กรุณาอัปโหลดไฟล์สำหรับตราประทับใหม่`,
                {
                  variant: "error",
                  autoHideDuration: 3000,
                }
              );
              return false;
            }

            const businessId = selectedBusinessId || companyData?.business_id;
            if (!businessId) {
              enqueueSnackbar(
                `อัปเดตตราประทับล้มเหลว: ไม่มี business ที่เลือก`,
                {
                  variant: "error",
                  autoHideDuration: 3000,
                }
              );
              return false;
            }

            let base64String = "";

            if (finalUploadedFile) {
              const base64Data = await convertFileToBase64(finalUploadedFile);
              base64String = base64Data.split(",")[1];
            } else if (finalEditingId) {
              // If editing and no new file, use existing base64
              const existingSeal = eSealsData.find(
                (seal) => seal._id === finalEditingId
              );
              base64String = existingSeal?.seal_base64 || "";
            }

            let result;
            if (finalEditingId) {
              // Update existing seal using PUT /v1/business/seal/:id (simplified body)
              const updatePayload = {
                seal_name: finalStampName,
                seal_base64: base64String,
                business_id: businessId,
              };

              result = await dispatch(
                updateESeal2({
                  businessId: businessId,
                  sealId: finalEditingId,
                  data: updatePayload,
                }) as any
              ).unwrap();

              enqueueSnackbar(`อัปเดตชื่อตราประทับสำเร็จ`, {
                variant: "success",
                autoHideDuration: 3000,
              });

              // Refresh stamps data and select the updated seal
              await refreshStampsData(finalEditingId, false);
            } else {
              // Create new seal using POST /v1/business/seal (with business_id)
              const createPayload = {
                seal_name: finalStampName,
                seal_base64: base64String,
                business_id: businessId,
              };

              result = await dispatch(
                createESeal2({
                  businessId: businessId,
                  data: createPayload,
                }) as any
              ).unwrap();
              enqueueSnackbar(`สร้างตราประทับสำเร็จ`, {
                variant: "success",
                autoHideDuration: 3000,
              });

              // Refresh stamps data and select the newly created seal
              await refreshStampsData(undefined, true);
            }

            // Note: refreshStampsData() is already called above
            // so we don't need to call it again here
            clearAllFormData();
            setIsStampModalOpen(false);

            return true;
          } catch (error: any) {
            enqueueSnackbar(
              `อัปเดตตราประทับล้มเหลว ${
                editingId ? "update" : "create"
              } E-Seal: ${error}`,
              {
                variant: "error",
                autoHideDuration: 3000,
              }
            );
            let errorMessage = editingId
              ? "เกิดข้อผิดพลาดในการแก้ไขตราประทับ กรุณาลองใหม่อีกครั้ง"
              : "เกิดข้อผิดพลาดในการสร้างตราประทับ กรุณาลองใหม่อีกครั้ง";

            if (error?.response?.data?.message) {
              errorMessage = error.response.data.message;
            } else if (error?.message) {
              errorMessage = error.message;
            }

            enqueueSnackbar(
              `อัปเดตตราประทับล้มเหลว ${
                editingId ? "update" : "create"
              } E-Seal: ${errorMessage}`,
              {
                variant: "error",
                autoHideDuration: 3000,
              }
            );
            return false;
          }
        }}
        modalClassName="max-w-[600px] w-[600px]"
      >
        <div className="w-full mb-2">
          <label className="mb-1">ชื่อตราประทับ</label>
          <Input
            type="text"
            placeholder="ระบุ"
            value={stampName}
            onChange={(e) => {
              const value = e.target.value;
              setStampName(value);
              setStampConfig((prev) => ({
                ...prev,
                stamp_name: value,
              }));
            }}
            className="w-full border border-gray-300 rounded-xl"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2">อัปโหลดไฟล์</label>
          <DragAndDropFile
            onFileSelect={handleFileSelect}
            onFileValidationError={handleFileValidationError}
            onFileValidationSuccess={handleFileValidationSuccess}
            acceptedFileTypes={[".pdf", ".png", ".jpg", ".jpeg"]}
            maxFileSize={2}
            placeholder={
              <>
                <span className="text-theme">คลิกเพื่ออัปโหลด</span> หรือ
                ลากไฟล์มาวางที่นี่
              </>
            }
            description={
              editingId
                ? "รองรับเฉพาะไฟล์ PDF, PNG, JPG, JPEG ขนาดไม่เกิน 2 MB (เลือกใหม่หากต้องการเปลี่ยนไฟล์)"
                : "รองรับเฉพาะไฟล์ PDF, PNG, JPG, JPEG ขนาดไม่เกิน 2 MB"
            }
            preview={true}
            previewImage={previewImage || ""}
            onPreviewImageChange={handlePreviewImageChange}
            customValidation={customFileValidation}
            errorMessage={fileError || ""}
            clearError={() => setFileError(null)}
          />
        </div>
      </ModalComponent>

      {renderDeleteModal()}
    </>
  );
}

export default orgStamp;
