"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import HeaderTitleLogo from "@/assets/webp/backend-home-1.webp";
import { ChevronDown, Mail } from "lucide-react";
import Image from "next/image";
import { Button, Input, Select, Space, Spin } from "antd";
import { useDispatch } from "react-redux";
import {
  updateGroup,
  deleteGroup,
  deleteDocumentType,
  searchBusinessById,
  getDocumentTypes,
  createDocumentType,
  GetDocumentTypesParams,
} from "@/store/backendStore/groupAPI";
import {
  BusinessContactType,
  SearchBusinessResponseType,
  UpdateGroupPayload,
  CreateDocumentTypePayload,
  DocumentTypeResponseType,
} from "@/store/types/groupType";
import SearchBusiness from "@/assets/webp/search-business.webp";
import { sentEmailAPI } from "@/store/backendStore/sentEmailAPI";
import { enqueueSnackbar } from "notistack";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  DocumentTypeOption,
  getEstampDetails,
} from "@/store/types/estampTypes";
import { setDocumentTypeCode } from "@/store/slices/contractFormSlice";

interface ModalCreateUpdateGroupProps {
  type: "create" | "addBusiness";
  groupNameInput?: string;
  updateGroupList?: () => void;
  onUpdateGroup?: (
    id: string,
    oldName: string,
    newName: string,
    businessContact: BusinessContactType[]
  ) => void;
  groupId?: string;
  groupSelectedBusiness?: BusinessContactType[];
}

// ===== CONSTANTS =====
const DEBOUNCE_DELAY_MS = 500;
const MIN_SEARCH_LENGTH = 3;
const SNACKBAR_DURATION = 3000;

// ===== DYNAMIC IMPORTS =====
const CollapseComponent = dynamic(
  () => import("@/components/ui/collapseTable"),
  {
    loading: () => (
      <Spin size="large" className="flex justify-center items-center py-8" />
    ),
    ssr: false,
  }
);

const ModalComponent = dynamic(() => import("@/components/modal/modal"), {
  loading: () => <Spin size="large" />,
  ssr: false,
});

const SearchInput = dynamic(() => import("@/components/ui/searchInput"), {
  loading: () => (
    <div className="w-72 h-10 bg-gray-200 rounded animate-pulse" />
  ),
  ssr: false,
});

const ConfirmModal = dynamic(
  () =>
    import("@/components/modal/modalConfirm").then((mod) => ({
      default: mod.ConfirmModal,
    })),
  {
    loading: () => <Spin size="large" />,
    ssr: false,
  }
);

const TextEditorComponent = dynamic(
  () => import("@/components/ui/textEditor"),
  {
    loading: () => (
      <div className="w-full h-32 bg-gray-200 rounded animate-pulse" />
    ),
    ssr: false,
  }
);

// ===== HELPER FUNCTIONS =====
const showErrorSnackbar = (message: string) => {
  enqueueSnackbar(message, {
    variant: "error",
    autoHideDuration: SNACKBAR_DURATION,
  });
};

const transformApiDataToOptions = (
  apiData: any[]
): DocumentTypeOption[] => {
  return apiData.map((item) => ({
    key: item._id,
    value: item._id,
    label: item.name,
  }));
};

const findMatchingDocumentType = (
  options: DocumentTypeOption[],
  documentTypeCode: string
): DocumentTypeOption => {
  if (!documentTypeCode || options.length === 0) return options[0] || { key: "", value: "", label: "" };
  const found = options.find(
    (opt) =>
      opt.label.includes(`ลักษณะตราสาร ${documentTypeCode}`) ||
      opt.label.includes(`ตราสาร ${documentTypeCode}`)
  );
  return found || options[0] || { key: "", value: "", label: "" };
};

// ===== MODAL CREATE UPDATE GROUP COMPONENT =====

export const ModalCreateUpdateGroup: React.FC<ModalCreateUpdateGroupProps> = ({
  type,
  groupNameInput,
  updateGroupList,
  onUpdateGroup,
  groupId,
  groupSelectedBusiness,
}) => {
  // Redux
  const dispatch = useAppDispatch();
  const contractForm = useAppSelector((state) => state.contractForm);
  const { selectedBusinessId } = useAppSelector((state) => state.business);

  // Form State
  const [newGroupName, setNewGroupName] = useState("");
  const [documentCode, setDocumentCode] = useState("");
  const [isDocumentLinked, setIsDocumentLinked] = useState(false);
  const [formEstampId, setFormEstampId] = useState<string>(
    contractForm.documentTypeCode || ""
  );
  const [documentTypeOptionsFromAPI, setDocumentTypeOptionsFromAPI] =
    useState<DocumentTypeOption[]>([]);

  // Business Search State
  const [searchBusiness, setSearchBusiness] = useState("");
  const [businessList, setBusinessList] = useState<SearchBusinessResponseType[]>(
    []
  );
  const [selectedBusiness, setSelectedBusiness] = useState<
    SearchBusinessResponseType[]
  >([]);
  const [isOpenSearchBusiness, setIsOpenSearchBusiness] = useState(false);
  const [isOpenDeleteAll, setIsOpenDeleteAll] = useState(false);
  const [isOpenSearchFailed, setIsOpenSearchFailed] = useState(false);

  // Debounce State
  const [debouncedSearchBusiness, setDebouncedSearchBusiness] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Constants
  const isCreateType = type === "create";
  const title = isCreateType ? "สร้างประเภทเอกสารใหม่" : "เพิ่ม Business";
  const btnName = isCreateType ? "สร้างประเภทเอกสาร" : "เพิ่ม Business";
  const btnConfirm = isCreateType ? "บันทึก" : "เพิ่ม";
  const isDisabled = isCreateType
    ? !newGroupName.trim() || !documentCode.trim() || (isDocumentLinked && !formEstampId.trim())
      : selectedBusiness.length === 0;

  // Reset Form State
  const resetFormState = () => {
    setNewGroupName("");
    setDocumentCode("");
    setFormEstampId(contractForm.documentTypeCode || "");
    setSelectedBusiness([]);
    setSearchBusiness("");
    setDebouncedSearchBusiness("");
    setBusinessList([]);
    setIsOpenSearchBusiness(false);
    setIsOpenSearchFailed(false);
  };

  // Fetch Document Types from API
  useEffect(() => {
    const fetchEstampDetails = async () => {
      try {
        const response = await dispatch(getEstampDetails() as any);
        const apiData = Array.isArray(response.payload)
          ? response.payload
          : (response.payload && response.payload.data) || [];

        if (Array.isArray(apiData) && apiData.length > 0) {
          const transformedOptions = transformApiDataToOptions(apiData);
          setDocumentTypeOptionsFromAPI(transformedOptions);

          // Set default formEstampId
          const currentFormEstampId = formEstampId;
          if (
            !currentFormEstampId ||
            !transformedOptions.find((opt) => opt.value === currentFormEstampId)
          ) {
            const matchingOption = findMatchingDocumentType(
              transformedOptions,
              contractForm.documentTypeCode || ""
            );
            const defaultOption = matchingOption || transformedOptions[0];
            if (defaultOption) {
              setFormEstampId(defaultOption.value);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch e-stamp details:", error);
      }
    };

    fetchEstampDetails();
    
    // ✅ FIXED: Move sessionStorage to client-side only to prevent hydration mismatch
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem("templateFormData");
      sessionStorage.setItem("typeForm", "template");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, selectedBusinessId]);

  // Debounced Search Handler
  const handleSearchBusinessChange = (value: string) => {
    setSearchBusiness(value);
    setIsOpenSearchFailed(false);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchBusiness(value.trim());
    }, DEBOUNCE_DELAY_MS);
  };

  // Business Search Effect
  useEffect(() => {
    const performSearch = async () => {
      if (
        debouncedSearchBusiness &&
        debouncedSearchBusiness.length >= MIN_SEARCH_LENGTH
      ) {
        try {
          setIsSearching(true);
          const response = await dispatch(
            searchBusinessById(debouncedSearchBusiness) as any
          );

          if (response.payload && response.payload.data) {
            setIsOpenSearchFailed(false);
            setBusinessList(
              response.payload.data.filter(
                (business: SearchBusinessResponseType) =>
            !(groupSelectedBusiness || []).some(
              (item) => item.business_id === business.business_id
            )
              )
            );
            setIsOpenSearchBusiness(true);
          } else if (response.status !== true) {
            setIsOpenSearchFailed(true);
            setBusinessList([]);
            setIsOpenSearchBusiness(false);
          }
        } catch (error) {
          showErrorSnackbar(`Failed to search business: ${error}`);
          setIsOpenSearchFailed(true);
          setBusinessList([]);
          setIsOpenSearchBusiness(false);
        } finally {
          setIsSearching(false);
        }
      } else if (debouncedSearchBusiness === "") {
        setBusinessList([]);
        setIsOpenSearchBusiness(false);
        setIsOpenSearchFailed(false);
      }
    };

    performSearch();
  }, [debouncedSearchBusiness, dispatch, groupSelectedBusiness]);

  // Manual Search on Enter
  const handleSearchBusiness = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && searchBusiness !== "") {
      setIsSearching(true);
      const response = await dispatch(
        searchBusinessById(searchBusiness) as any
      );
      if (response.payload && response.payload.data) {
        setIsOpenSearchFailed(false);
        setBusinessList(
          response.payload.data.filter(
            (business: SearchBusinessResponseType) =>
            !(groupSelectedBusiness || []).some(
              (item) => item.business_id === business.business_id
            )
          )
        );
        setIsOpenSearchBusiness(true);
      } else if (response.status !== true) {
        setIsOpenSearchFailed(true);
      }
      setIsSearching(false);
    }
  };

  const onDocumentLinkedChange = (value: string) => {
    if (value === "yes") {
      setIsDocumentLinked(true);
    } else {
      setIsDocumentLinked(false);
      setFormEstampId("");
    }
  };

  // Cleanup debounce timeout
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Helper Functions
  const checkBusinessAlreadySelected = (
    business: SearchBusinessResponseType
  ) => {
    return selectedBusiness.some(
      (item) => item.business_id === business.business_id
    );
  };

  const createNewDocumentType = async (payload: CreateDocumentTypePayload) => {
    try {
      const response = await dispatch(createDocumentType(payload) as any);
      
      console.log("Full Response:", response); // 🔍 Debug
    
      // ✅ ตรวจสอบ error จาก Redux (rejected action)
      if (response.error) {
        return {
          payload: {
            status: false,
            message: response.error.message || "สร้างประเภทเอกสารไม่สำเร็จ",
            error_id: response.error.error_id,
          }
        };
      }
      
      // ✅ ตรวจสอบ payload.status
      if (response.payload && response.payload.status === false) {
        return response;
      }
      
      // ✅ สร้างสำเร็จ - refresh list
      if (response.payload && updateGroupList) {
        updateGroupList();
      }
      
      return response;
    } catch (error) {
      console.error("createNewDocumentType error:", error);
      return {
        payload: {
          status: false,
          message: `Failed to create document type: ${error}`,
        }
      };
    }
  };

  // Event Handlers
  const handleAddNewGroup = async (): Promise<boolean> => {
    const groupName = newGroupName.trim();
    const code = documentCode.trim();

    if (!groupName || !code || (isDocumentLinked && !formEstampId)) {
      showErrorSnackbar("กรุณากรอกข้อมูลให้ครบถ้วน");
      return false;
    }

    const selectedOption = documentTypeOptionsFromAPI.find(
      (option) => option.value === formEstampId
    );

    if (isDocumentLinked && !selectedOption) {
      showErrorSnackbar("ไม่พบข้อมูลลักษณะตราสารที่เลือก");
      return false;
    }

    const cleanedGroupName = groupName.includes("ประเภทเอกสาร")
      ? groupName.replace("ประเภทเอกสาร", "")
      : groupName;

    const payload: CreateDocumentTypePayload = {
      name: cleanedGroupName,
      code: code,
      form_estamp_id: isDocumentLinked ? selectedOption?.value : undefined,
    };

    try {
      const response = await createNewDocumentType(payload);
    
      console.log("handleAddNewGroup response:", response); // 🔍 Debug
    
      // ✅ ตรวจสอบว่ามี response และ payload
      if (!response || !response.payload) {
        showErrorSnackbar("สร้างประเภทเอกสารไม่สำเร็จ");
        return false;
      }

      // ✅ ตรวจสอบ status: false (Conflict หรือ error อื่นๆ)
      if (response.payload.status === false) {
        const errorMessage = response.payload.message || "สร้างประเภทเอกสารไม่สำเร็จ";
      
        // แสดง error message
        showErrorSnackbar(errorMessage);
      
        // Log error_id ถ้ามี
        if (response.payload.error_id) {
          console.error(`Error ID: ${response.payload.error_id}`);
        }
      
        return false;
      }

      // ✅ สร้างสำเร็จ
      resetFormState();
      enqueueSnackbar("สร้างประเภทเอกสารสำเร็จ", {
        variant: "success",
        autoHideDuration: SNACKBAR_DURATION,
      });
      return true;
    } catch (error) {
      console.error("handleAddNewGroup error:", error); // 🔍 Debug
      showErrorSnackbar(`Failed to add document type: ${error}`);
      return false;
    }
  };

  const handleUpdateGroup = async (): Promise<boolean> => {
    const selectBusiness: BusinessContactType[] =
      (groupSelectedBusiness || []).map((business, businessIndex) => ({
          index: businessIndex,
          business_id: business.business_id,
      })) || [];

    selectedBusiness.forEach((business) => {
      if (
        !selectBusiness.some(
          (item) => item.business_id === business.business_id
        )
      ) {
        selectBusiness.push({
          index: selectBusiness.length,
          business_id: business.business_id,
        });
      }
    });

    try {
      if (typeof onUpdateGroup === "function") {
        await onUpdateGroup(
          groupId || "",
          groupNameInput || "",
          groupNameInput || "",
          selectBusiness
        );
        return true;
      } else {
        showErrorSnackbar(`onUpdateGroup is not defined or not a function`);
        return false;
      }
    } catch (error) {
      showErrorSnackbar(`Failed to update group: ${error}`);
      return false;
    }
  };

  const handleDocumentTypeChange = (value: string) => {
    dispatch(setDocumentTypeCode(value || "1"));
  };

  const genError = (key: string) => {
    return "";
  };

  return (
    <ModalComponent
      btnName={btnName}
      triggerBtnClassName={
        isCreateType
          ? "btn-theme"
          : "text-theme border-b border-theme font-medium"
      }
      titleName={title}
      onConfirm={isCreateType ? handleAddNewGroup : handleUpdateGroup}
      isDisabled={isDisabled}
      btnConfirm={btnConfirm}
      modalType={isCreateType ? "create" : "rename"}
    >
      {/* Form Fields */}
      <div className="mb-4">
        <label className="mb-2">ชื่อประเภทเอกสาร</label>
        <Input
          placeholder="ระบุ"
          value={isCreateType ? newGroupName : (groupNameInput || "")}
          onChange={(e) => setNewGroupName(e.target.value)}
          disabled={!isCreateType}
        />
      </div>

      <div className="mb-4">
        <label className="mb-2">รหัสเอกสาร</label>
        <Input
          placeholder="ระบุ"
          value={isCreateType ? documentCode : ""}
          onChange={(e) => setDocumentCode(e.target.value)}
          disabled={!isCreateType}
        />
      </div>

      <div className="mb-4">
        <label className="mb-2">ผูกกับตราสารหรือไม่</label>
        <Select
          placeholder="เลือก"
          suffixIcon={<ChevronDown size={20} />}
          value={isDocumentLinked ? "yes" : "no"}
          onChange={onDocumentLinkedChange}
          disabled={!isCreateType}
          className="w-full"
        >
          <Select.Option value="yes">ผูก</Select.Option>
          <Select.Option value="no">ไม่ผูก</Select.Option>
        </Select>
      </div>

      {isDocumentLinked && <div className="mb-4">
        <label className="block">ตราสาร</label>
        <Select
          placeholder="เลือกลักษณะแห่งตราสาร"
          suffixIcon={<ChevronDown size={20} />}
          value={
            isCreateType
              ? formEstampId
              : (contractForm.documentTypeCode || "ลักษณะตราสาร 1.เช่าที่ดิน โรงเรือน สิ่งปลูกสร้างอย่างอื่น หรือแพ")
          }
          onChange={(value) => {
            if (isCreateType) {
              setFormEstampId(value);
            }
            handleDocumentTypeChange(value);
          }}
          disabled={!isCreateType}
          className="w-full"
          status={
            genError("documentTypeCode") &&
            (isCreateType ? formEstampId : (contractForm.documentTypeCode || "")) === ""
              ? "error"
              : ""
          }
        >
          {(documentTypeOptionsFromAPI || []).map((option) => (
            <Select.Option key={option.key} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </div>}

      {/* Search Helper Text */}
      <div className="mb-4">
        {searchBusiness &&
          searchBusiness.length > 0 &&
          searchBusiness.length < MIN_SEARCH_LENGTH && (
            <p className="text-xs text-gray-500 mt-1">
              พิมพ์อย่างน้อย {MIN_SEARCH_LENGTH} ตัวอักษรเพื่อค้นหา
            </p>
          )}
        {isSearching && (
          <p className="text-xs text-blue-500 mt-1">กำลังค้นหา...</p>
        )}
      </div>

      {/* Search Results / Selected Business */}
      {isOpenSearchFailed ? (
        <div className="flex flex-col justify-center items-center">
          <Image
            src={SearchBusiness}
            alt="Search Business"
            width={100}
            height={100}
          />
          <span>ผลการค้นหา "{searchBusiness}" ไม่พบข้อมูล</span>
          <SendEmailModal />
        </div>
      ) : (
        selectedBusiness.length > 0 && (
          <div>
            <div className="flex justify-between items-center">
              <span>ทั้งหมด {selectedBusiness.length} รายการ</span>
              <Button
                type="link"
                size="small"
                onClick={() => setIsOpenDeleteAll(true)}
              >
                ลบทั้งหมด
              </Button>
            </div>
            <div>
              {selectedBusiness.map((business) => (
                <div
                  key={business.business_id}
                  className="flex justify-between px-4 py-2"
                >
                  <div className="flex-auto justify-start">
                    <div className="flex flex-col gap-1 text-left">
                      <span>{business.name_on_document_th}</span>
                      <span className="text-xs text-[#989898]">
                        {business.business_id}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center items-center">
                    <Button
                      type="link"
                      size="small"
                      onClick={() =>
                        setSelectedBusiness(
                          selectedBusiness.filter(
                            (item) => item.business_id !== business.business_id
                          )
                        )
                      }
                    >
                      ลบ
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* Delete All Confirmation Modal */}
      <ConfirmModal
        titleName="ลบทั้งหมด"
        message="คุณต้องการลบรายการทั้งหมดหรือไม่? การดำเนินการนี้ไม่สามารถกู้คืนได้"
        open={isOpenDeleteAll}
        onConfirm={() => {
          setSelectedBusiness([]);
          setIsOpenDeleteAll(false);
        }}
        onCancel={() => setIsOpenDeleteAll(false)}
      />
    </ModalComponent>
  );
};

// ===== SEND EMAIL MODAL COMPONENT =====
export const SendEmailModal = () => {
  const dispatch = useDispatch();
  const [emailTo, setEmailTo] = useState<string[]>([]);
  const [emailToInput, setEmailToInput] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState<string>("");
  const [emailToError, setEmailToError] = useState<string>("");

  const isValidEmail = (email: string) => {
    const value = (email || "").trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return regex.test(value);
  };

  const sendEmail = async ({
    to,
    subject,
    content,
  }: {
    to: string[];
    subject: string;
    content: string;
  }): Promise<boolean> => {
    const response = await dispatch(
      sentEmailAPI({
        to: to,
        subject: subject,
        html: content,
      }) as any
    );
    return response.payload || false;
  };

  const handleSendEmail = async (): Promise<boolean> => {
    const response = await sendEmail({
      to: emailTo,
      subject: emailSubject,
      content: emailContent,
    });
    return response || false;
  };

  const handleEmailChange = (value: string[]) => {
    const newValues = Array.isArray(value) ? value : [];
    const newlyAdded = newValues.filter((v) => !emailTo.includes(v));
    const invalids = newlyAdded.filter((v) => !isValidEmail(v));
    if (invalids.length > 0) {
      const cleaned = newValues.filter((v) => !invalids.includes(v));
      setEmailTo(cleaned);
      setEmailToInput("");
      setEmailToError(`อีเมลไม่ถูกต้อง: ${invalids.join(", ")}`);
    } else {
      setEmailTo(newValues);
      setEmailToInput("");
      setEmailToError("");
    }
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent) => {
    if ((e as any).key === "Enter" && emailToInput.trim()) {
      if (!isValidEmail(emailToInput.trim())) {
        e.preventDefault();
        setEmailToError("รูปแบบอีเมลไม่ถูกต้อง");
      } else {
        setEmailToError("");
      }
    }
  };

  return (
    <ModalComponent
      titleName="ส่งข้อมูลลงทะเบียน"
      btnName="เชิญลงทะเบียน"
      onConfirm={handleSendEmail}
      triggerBtnClassName="text-theme border-b border-theme text-sm sm:text-base"
      modalType="create"
      modalClassName="95vw"
      modalWidth={800}
    >
      <div className="flex flex-col gap-3 sm:gap-4 px-2 sm:px-0">
        <div className="flex flex-col gap-2">
          <label className="text-sm sm:text-base">ถึง</label>
          <Select
            mode="tags"
            style={{ width: "100%" }}
            placeholder="ระบุอีเมล"
            prefix={<Mail size={16} color="#C4C4C4" className="mr-1" />}
            value={emailTo}
            searchValue={emailToInput}
            open={false}
            filterOption={false}
            options={[]}
            onChange={handleEmailChange}
            onSearch={setEmailToInput}
            onInputKeyDown={handleEmailKeyDown}
          />
          {emailToError && emailToError !== "" && (
            <span className="text-xs text-red-500">{emailToError}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm sm:text-base">เรื่อง</label>
          <Input
            placeholder="ระบุเรื่อง"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            className="text-sm sm:text-base"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm sm:text-base">รายละเอียด</label>
          <div className="w-full overflow-hidden">
            <TextEditorComponent onChange={setEmailContent} />
          </div>
        </div>
      </div>
    </ModalComponent>
  );
};

// ===== MAIN COMPONENT =====
export default function RelationManagement() {
  // State
  const [groupList, setGroupList] = useState<DocumentTypeResponseType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedDocumentType, setSelectedDocumentType] = useState("ทั้งหมด");
  const [documentTypeOptions, setDocumentTypeOptions] = useState<DocumentTypeOption[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Redux
  const { selectedBusinessId } = useAppSelector((state) => state.business);
  const dispatch = useAppDispatch();
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Document Types from API
  useEffect(() => {
    const fetchEstampDetails = async () => {
      try {
        const response = await dispatch(getEstampDetails() as any);
        const apiData = Array.isArray(response.payload)
          ? response.payload
          : (response.payload && response.payload.data) || [];

        if (Array.isArray(apiData) && apiData.length > 0) {
          const transformedOptions = transformApiDataToOptions(apiData);
          setDocumentTypeOptions(transformedOptions);
        }
      } catch (error) {
        console.error("Failed to fetch e-stamp details:", error);
      }
    };

    fetchEstampDetails();
  }, [dispatch, selectedBusinessId]);

  // Derived values
  const getUniqueDocumentTypes = () => {
    const options = [
      { value: "ทั้งหมด", label: "ทั้งหมด" },
      ...documentTypeOptions.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    ];
    return options;
  };

  // Debounce search query
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // Reset to first page when search changes
    }, DEBOUNCE_DELAY_MS);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery]);

  // API Functions
  const getGroupList = useCallback(async (params?: GetDocumentTypesParams) => {
    try {
      setLoading(true);
      const apiParams: GetDocumentTypesParams = {
        search: (params && params.search) ? params.search : (debouncedSearchQuery || ""),
        limit: (params && params.limit) ? params.limit : limit,
        page: (params && params.page) ? params.page : page,
        filter: (params && params.filter) ? params.filter : (selectedDocumentType === "ทั้งหมด" ? "" : selectedDocumentType),
      };

      const response = await dispatch(getDocumentTypes(apiParams) as any);
      if (response.payload) {
        // Handle response structure - could be { data: [...], total: number } or just array
        const data = response.payload.data || response.payload;
        const responseTotal = response.payload.total || response.payload.count || (Array.isArray(data) ? data.length : 0);
        
        if (Array.isArray(data)) {
          setGroupList(data);
          setTotal(responseTotal);
        } else {
          setGroupList([]);
          setTotal(0);
        }
      } else {
        setGroupList([]);
        setTotal(0);
      }
    } catch (error) {
      showErrorSnackbar(`Failed to get document types: ${error}`);
      setGroupList([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, limit, page, selectedDocumentType, dispatch]);

  const updateGroupData = async (payload: UpdateGroupPayload, id: string) => {
    try {
      const response = await dispatch(updateGroup({ payload, id }) as any);
      if (response.payload && response.payload.data) {
        return response.payload;
      }
    } catch (error) {
      showErrorSnackbar(`Failed to update group: ${error}`);
    }
  };

  const deleteGroupData = async (id: string) => {
    try {
      const response = await dispatch(deleteGroup(id) as any);
      if (response.payload && response.payload.data) {
        return response.payload;
      }
    } catch (error) {
      showErrorSnackbar(`Failed to delete group: ${error}`);
    }
  };

  // Event Handlers
  const handleUpdateGroup = async (
    id: string,
    oldName: string,
    newName: string,
    businessContact: BusinessContactType[]
  ) => {
    const payload: UpdateGroupPayload = {
      old_name: oldName,
      new_name: newName,
      business_contact: businessContact,
    };
    try {
      const response = await updateGroupData(payload, id);
      if (response && response.data) {
        await getGroupList();
        return true;
      }
      return false;
    } catch (error) {
      showErrorSnackbar(`Failed to update group: ${error}`);
      return false;
    }
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      // 🎯 API ถูกเรียกแล้วใน collapseTable.tsx (confirmDelete)
      // ฟังก์ชันนี้ถูกเรียกเพื่อ refresh ข้อมูลหลังจากลบสำเร็จ
      // ดังนั้นเราแค่เรียก getGroupList() เพื่อ refresh ข้อมูล
      await getGroupList();
      return true;
    } catch (error) {
      showErrorSnackbar(`Failed to refresh document types list: ${error}`);
      return false;
    }
  };

  // 🎯 Handle search query changes (debounced)
  // getGroupList จะใช้ค่า selectedDocumentType จาก dependency โดยอัตโนมัติ
  useEffect(() => {
    getGroupList();
  }, [debouncedSearchQuery, getGroupList]);

  // 🎯 Reset to first page when filter (selectedDocumentType) changes
  // getGroupList จะถูกเรียกอัตโนมัติผ่าน useEffect ที่ depend on getGroupList
  useEffect(() => {
    setPage(1);
  }, [selectedDocumentType]);

  // Reset selectedDocumentType when businessId changes
  useEffect(() => {
    setSelectedDocumentType("ทั้งหมด");
    setPage(1);
    // Refresh list when businessId changes (filter will be reset to "")
    getGroupList({
      search: debouncedSearchQuery || "",
      limit: limit,
      page: 1,
      filter: "", // Reset filter when business changes
    });
  }, [selectedBusinessId, debouncedSearchQuery, limit]);

  return (
    <>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Image
            src={HeaderTitleLogo}
            height={0}
            width={0}
            alt="Title Logo"
            className="w-8 h-8"
          />
          <h1 className="text-3xl font-extrabold">เทมเพลตเอกสารสัญญา</h1>
        </div>
        <div className="flex items-center gap-2">
          <ModalCreateUpdateGroup type="create" updateGroupList={getGroupList} />
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
        <div>
          <SearchInput
            placeholder="ค้นหา"
            className="w-72 min-w-full"
            value={searchQuery}
            onChange={setSearchQuery}
            debounceMs={700}
          />
        </div>
         <Space wrap>
           <label>ตราสาร : </label>
           <Select
             value={selectedDocumentType}
             suffixIcon={<ChevronDown size={20} />}
             onChange={setSelectedDocumentType}
             className="rounded-xl w-60"
             options={getUniqueDocumentTypes()}
           />
          {/* <label>ชื่อ Business : </label>
          <Select
            defaultValue="ทั้งหมด"
            style={{ width: 120 }}
            suffixIcon={<ChevronDown size={20} />}
            onChange={() => {}}
            className="rounded-xl"
            options={[
              { value: "ทั้งหมด", label: "ทั้งหมด" },
              { value: "jack", label: "Jack" },
              { value: "Yiminghe", label: "yiminghe" },
            ]}
          /> */}
        </Space>
      </div>
      <p className="mb-4">กลุ่มทั้งหมด {total} รายการ</p>
      {/* Content Section */}
      {loading ? (
        <div className="min-h-[calc(100vh-15rem)] flex justify-center items-center bg-neutral-50 rounded-xl">
          <Spin size="large" />
        </div>
      ) : groupList.length > 0 ? (
        <>
          <CollapseComponent
            items={groupList}
            onUpdateGroup={handleUpdateGroup}
            onDeleteGroup={handleDeleteGroup}
            total={total}
            currentPage={page}
            pageSize={limit}
            onPageChange={(newPage, newPageSize) => {
              setPage(newPage);
              if (newPageSize) {
                setLimit(newPageSize);
              }
              getGroupList({
                search: debouncedSearchQuery || "",
                limit: newPageSize || limit,
                page: newPage,
                filter: selectedDocumentType === "ทั้งหมด" ? "" : selectedDocumentType,
              });
            }}
            showSizeChanger={true}
          />
        </>
      ) : (
        <div className="min-h-[calc(100vh-15rem)] flex justify-center items-center bg-neutral-50 rounded-xl">
          No result found
        </div>
      )}
    </>
  );
}
