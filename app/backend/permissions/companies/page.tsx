"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ErrorModal } from "@/components/modal/modalError";
import { BadgeCheck, Building2Icon } from "lucide-react";
import OrgStamp from "@/app/organization/orgComponents/orgStamp";
import { getBusinessProfile, updateBusinessLogo } from "@/store/backendStore";
import EditIcon from "@/assets/webp/Edit_Pen.webp";
import { enqueueSnackbar } from "notistack";

const CompanyManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    data: companyData,
    loading,
    error,
  } = useAppSelector((state) => state.company);
  const { selectedBusinessId, selectedBusinessName } = useAppSelector((state) => state.business);
  const [businessProfile, setBusinessProfile] = useState<any>(null);
  const [isLoadingBusinessProfile, setIsLoadingBusinessProfile] = useState(false);
  const [isOpenErrorModal, setIsOpenErrorModal] = useState(false);
  const [isUpdatingLogo, setIsUpdatingLogo] = useState(false);

  // Load business profile
  useEffect(() => {
    const loadBusinessProfile = async () => {
      try {
        const businessId = selectedBusinessId || companyData?.business_id;
        if (businessId) {
          setIsLoadingBusinessProfile(true);
          const response = await dispatch(
            getBusinessProfile(businessId) as any
          ).unwrap();
          setBusinessProfile(response.data);
          // console.log("Business Profile:", response);
        }
      } catch (error) {
        console.error("Failed to load business profile:", error);
        // enqueueSnackbar("ไม่สามารถโหลดข้อมูลบริษัทได้", {
        //   variant: "error",
        //   autoHideDuration: 3000,
        // });
        // localStorage.clear();
        // sessionStorage.clear();
        // router.replace("/login");
      } finally {
        setIsLoadingBusinessProfile(false);
      }
    };

    if (selectedBusinessId || companyData?.business_id) {
      loadBusinessProfile();
    }
  }, [dispatch, selectedBusinessId, companyData?.business_id]);

  // Handle error modal
  useEffect(() => {
    if (error) {
      setIsOpenErrorModal(true);
    }
  }, [error]);

  // Convert file to base64
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

  // Handle file input change
  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      enqueueSnackbar("กรุณาเลือกไฟล์รูปภาพเท่านั้น", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      enqueueSnackbar("ขนาดไฟล์ต้องไม่เกิน 2 MB", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    const businessId = selectedBusinessId || companyData?.business_id;
    if (!businessId) {
      enqueueSnackbar("ไม่พบข้อมูลบริษัท", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    try {
      setIsUpdatingLogo(true);
      
      const base64Data = await convertFileToBase64(file);
      const base64String = base64Data.split(",")[1]; // Remove data:image/...;base64, prefix

      await dispatch(
        updateBusinessLogo({
          businessId: businessId,
          data: {
            business_id: businessId,
            logo_base64: base64String,
          },
        }) as any
      ).unwrap();

      // Reload business profile to get updated logo
      setIsLoadingBusinessProfile(true);
      const response = await dispatch(
        getBusinessProfile(businessId) as any
      ).unwrap();
      setBusinessProfile(response.data);
      setIsLoadingBusinessProfile(false);

      enqueueSnackbar("อัปเดตรูป Profile สำเร็จ", {
        variant: "success",
        autoHideDuration: 3000,
      });
    } catch (error: any) {
      enqueueSnackbar(`อัปเดตรูป Profile ไม่สำเร็จ: ${error}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
    } finally {
      setIsUpdatingLogo(false);
      // Clear the input value so the same file can be selected again
      event.target.value = '';
    }
  };

  return (
    <>
      <h1 className="text-xl font-extrabold text-theme mb-6">ข้อมูลบริษัท</h1>

      <div className="space-y-8">
        <div className="bg-white rounded-2xl px-8 py-6 shadow-theme">
          {isLoadingBusinessProfile ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme"></div>
              <span className="ml-2 text-theme">กำลังโหลดข้อมูล...</span>
            </div>
          ) : businessProfile ? (
            <div className="flex flex-wrap gap-12 justify-between items-center">
              <div className="relative">
                {businessProfile.logo_base64 ? (
                  <img
                    src={`data:image/png;base64,${businessProfile.logo_base64}`}
                    alt="Company Logo"
                    className="rounded-full shadow-theme min-w-[100px] min-h-[100px] object-cover object-center max-w-[150px] max-h-[150px]"
                    onError={(e) => {
                      // Hide image if error loading
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="rounded-full shadow-theme p-6 min-w-[100px] min-h-[100px] max-w-[150px] max-h-[150px]">
                    <Building2Icon size={100} />
                  </div>
                )}
                <div className="absolute bottom-[-5px] right-[-5px]">
                  <label className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-theme hover:bg-gray-50 transition-colors cursor-pointer" htmlFor="logo-upload">
                    <Image src={EditIcon} alt="Edit" width={20} height={20} />
                  </label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={isUpdatingLogo}
                  />
                </div>
              </div>
              <div className="flex-1 w-full">
                <h1 className="text-2xl font-extrabold text-theme mb-6">
                  {businessProfile.name_on_document_th
                    ? businessProfile.name_on_document_th
                    : businessProfile.name_th
                    ? businessProfile.name_th
                    : businessProfile.name_eng
                    ? businessProfile.name_eng
                    : "ไม่ระบุ"}
                </h1>
                <div className="flex justify-between flex-wrap gap-2">
                  <p className="text-medium">
                    <span className="text-[#989898]">Tax ID : </span>
                    <span>{businessProfile.business_id}</span>
                  </p>
                  <p className="text-medium">
                    <span className="text-[#989898]">ความน่าเชื่อถือ : </span>
                    <>
                      {businessProfile.trust_level ? (
                        <span className="text-[#00C45A] rounded-full px-2 py-1 bg-[#EAF8EF]">
                          {" "}
                          Biz Level {Number(businessProfile.trust_level) + 1}
                        </span>
                      ) : (
                        <span className="text-[#C4C4C4] rounded-full px-2 py-1 bg-[#F5F5F5]">
                          {" "}
                          ไม่ระบุ
                        </span>
                      )}
                    </>
                  </p>
                  <p className="text-medium flex items-center gap-2 w-fit">
                    <span className="text-[#989898]">ข้อมูล CA : </span>
                    <>
                      {businessProfile.has_ca ? (
                        <span className="text-[#0153BD] flex items-center gap-1">
                          <BadgeCheck size={20} /> พบ CA
                        </span>
                      ) : (
                        <span className="text-[#C4C4C4]">ไม่พบ CA</span>
                      )}
                    </>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">ไม่พบข้อมูลบริษัท</p>
              <p className="text-sm text-gray-400 mt-2">
                กรุณาเลือกบริษัทใน Header
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl px-8 py-6 shadow-theme">
          <OrgStamp />
        </div>

        {/* <div className="bg-white rounded-2xl px-8 py-6 shadow-theme">
          <p className="font-semibold text-lg mb-4">แจ้งเตือนอีเมล</p>
          <div className="flex justify-between flex-wrap items-center gap-2 w-full">
            <p className="w-fit flex-none">Email : </p>
            <Input
              placeholder="ระบุอีเมล"
              value="test@test.com"
              className="flex-1"
            />
            <button className="bg-white p-2 rounded-md shadow-sm hover:bg-gray-50 transition-colors flex-none">
              <PenIcon className="text-theme" size={20} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl px-8 py-6 shadow-theme">
          <p className="font-semibold text-lg mb-4">Email Server</p>
          <div className="flex justify-between flex-wrap items-center gap-2 w-full">
            <p className="w-fit flex-none">Email : </p>
            <Input
              placeholder="ระบุอีเมล"
              value="test@test.com"
              className="flex-1"
            />
            <button className="bg-white p-2 rounded-md shadow-sm hover:bg-gray-50 transition-colors flex-none">
              <PenIcon className="text-theme" size={20} />
            </button>
          </div>
        </div> */}
      </div>

      <ErrorModal
        titleName="เกิดข้อผิดพลาด"
        message={error || "ไม่สามารถโหลดข้อมูลบริษัทได้"}
        open={isOpenErrorModal}
        onClose={() => {
          setIsOpenErrorModal(false);
        }}
      />
    </>
  );
};

export default CompanyManagementPage;
