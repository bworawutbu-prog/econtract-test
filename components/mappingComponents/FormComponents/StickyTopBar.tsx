/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { Button, Input, Tooltip } from "antd";
import { useSnackbar } from "notistack";
import {
  ChevronLeft,
  X,
  Heart,
  Edit2,
  Check,
  Settings,
  Save,
} from "lucide-react";
import Image from "next/image";
import PreviewAPI from "@assets/webp/backend-mappingCheckbox-1.webp";
import EditIcon from "@assets/webp/edit.webp";
import StylePanel from "./StylePanel";
import { FormItem } from "../../../store/types/FormTypes";
import { usePathname, useSearchParams } from "next/navigation";
import appEmitter from "../../../store/libs/eventEmitter";
import { useRouter } from "next/navigation";
import { ElementStyle } from "../../../store/types/FormTypes";
import ModalEstamp from "@/components/mappingComponents/FormTransactionStamp/ModalEstamp";
import { authStorage } from "@/store/utils/localStorage";
import { ErrorModal } from "@/components/modal/modalError";
import { useAppSelector, useAppDispatch, RootState } from "@/store";
import { SuccessModal } from "@/components/modal/modalSuccess";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { AnyAction } from "redux";
import { getContractStatusDetail } from "@/store/backendStore/documentAPI";
import { ProcessB2BModal } from "@/components/modal/modalProcessingB2B";
import { StatusB2BModal } from "@/components/modal/modalStatusProcessB2B";
import { transactionSentEmail } from "@/store/frontendStore/transactionAPI";
import { useViewport } from "../FormUtils/responsiveUtils";

interface StickyTopBarProps {
  formTitle: string;
  showStylePanel: boolean;
  configElement: FormItem | null;
  isSaving: boolean;
  onBack: () => void;
  onCloseConfig: () => void;
  onStyleChange: (style: ElementStyle) => void;
  onSaveForm: () => Promise<void>;
  onSaveUserSetting: () => Promise<void>;
  onFormTitleChange?: (newTitle: string) => void;
  onReject: () => void;
  onApprove: () => void;
  version?: string;
  isSettingsMode?: boolean;
  documentStatus?: string;
  computedStyleDefaults?: ElementStyle;
  isFormValid?: boolean;
  isRequiredText?: boolean;
  isFileValidationValid?: boolean;
  isPdfReady?: boolean; // 🎯 NEW: PDF ready state for disabling buttons
  isCreatorOrSender?: boolean; // 🎯 NEW: Whether user is creator/sender (doesn't need CA)
  setIsConfirmModalOpen?: (open: boolean) => void; // 🎯 NEW: Set is open send form
  isValidateSigner?: boolean;
  isValidateEsseal?: boolean;
  setErrorMessage?: (message: string) => void;
  setIsErrorModalOpenEseal?: (open: boolean) => void;
  formDataFlow?: any[]; // 🎯 Use formDataFlow instead of flowData
  currentUserStepIndex?: string;
  currentUserAction?: string; // 🎯 NEW: Current user's action (signer or approver)
  documentType?: string; // 🎯 NEW: Document mode (create, draft, template)
}

const StickyTopBar: React.FC<StickyTopBarProps> = ({
  formTitle,
  showStylePanel,
  configElement,
  isSaving,
  onBack,
  onCloseConfig,
  onStyleChange,
  onSaveForm,
  onSaveUserSetting,
  onFormTitleChange,
  onReject,
  onApprove,
  version = "1.0",
  isSettingsMode = false,
  documentStatus,
  computedStyleDefaults,
  isFormValid = true,
  isRequiredText = false,
  isFileValidationValid = true,
  isPdfReady = true, // 🎯 NEW: Default to true for backward compatibility
  isCreatorOrSender = false, // 🎯 NEW: Default to false for backward compatibility
  setIsConfirmModalOpen,
  isValidateSigner,
  isValidateEsseal,
  setErrorMessage,
  setIsErrorModalOpenEseal,
  formDataFlow = [], // 🎯 Use formDataFlow instead of flowData
  currentUserStepIndex = "",
  currentUserAction = "approver", // 🎯 NEW: Default to approver for backward compatibility
  documentType, // 🎯 NEW: Document mode for template mode
}) => {
  // 🎯 RESPONSIVE: Track viewport for responsive UI
  const viewport = useViewport();

  const dispatch = useAppDispatch() as ThunkDispatch<
    RootState,
    unknown,
    AnyAction
  >;
  const searchParams = useSearchParams();
  const documentId = searchParams.get("documentId") || "";
  const [isProcessingOpen, setIsProcessingOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [docsStatus, setDocsStatus] = useState<string>(documentStatus || "");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
  useEffect(() => {
    // console.log('validate form StickyTopBar =>',isValidateSigner)
  }, [isValidateSigner]);

  useEffect(() => {
    checkPermissionType();
  });

  // 🎯 NEW: Add ESC key handler to cancel element selection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle ESC key when an element is selected and style panel is open
      if (event.key === "Escape" && configElement && showStylePanel) {
        event.preventDefault();
        event.stopPropagation();

        // Close config panel (cancel element selection)
        onCloseConfig();
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleKeyDown, true);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [configElement, showStylePanel, onCloseConfig]);

  const pathname = usePathname();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const isBackend = pathname?.includes("/backend/Mapping");
  const isFrontend = pathname?.includes("/frontend/Mapping");

  // State for editing form title
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(formTitle);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const isGuest = sessionStorage.getItem("isGuest") === "true";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isStatusB2B, setIsStatusB2B] = useState<boolean>(false);
  const [statusResult, setStatusResult] = useState<"approved" | "failed">(
    "approved"
  );

  const B2BformData = useAppSelector((state) => state.contractB2BForm);
  const selectedBusinessId = localStorage.getItem("selectedBusinessId");

  // 🎯 ฟังก์ชันตรวจสอบและเลือก Certificate Authority credentials
  const getSelectedCredential = () => {
    const caData = authStorage.getCertificateAuthority();

    if (
      !caData?.data?.credentials ||
      !Array.isArray(caData.data.credentials) ||
      caData.data.credentials.length === 0
    ) {
      console.warn("🔍 [StickyTopBar] No certificates available");
      return null;
    }

    const credentials = caData.data.credentials;

    // 1. หาเจ้าหน้าที่ก่อน
    const officerCredential = credentials.find(
      (cred: any) => cred.credentialType === "เจ้าหน้าที่"
    );
    if (officerCredential) {
      // console.log('👤 [StickyTopBar] Using officer credential:', officerCredential.credentialId);
      return officerCredential;
    }

    // 2. ถ้าไม่มีเจ้าหน้าที่ ใช้นิติบุคคล
    const legalEntityCredential = credentials.find(
      (cred: any) => cred.credentialType === "นิติบุคคล"
    );
    if (legalEntityCredential) {
      // console.log('🏢 [StickyTopBar] Using legal entity credential:', legalEntityCredential.credentialId);
      return legalEntityCredential;
    }

    // 3. กรณีสุดท้าย ใช้ credentials[0]
    if (credentials[0]) {
      // console.log('📄 [StickyTopBar] Using first available credential:', credentials[0].credentialId);
      return credentials[0];
    }

    return null;
  };

  const sendMail = async () => {
    try {
      const payload = {
        transactionId: documentId,
        business_id: "175128061064325",
      };
      const resp = await dispatch(transactionSentEmail(payload)).unwrap();
      if (resp) {
        setIsSuccessModalOpen(true);
      }
    } catch (err) {
      setIsErrorModalOpen(true);
    }
  };

  const getContractStatusDetailData = async () => {
    setIsProcessingOpen(true);
    setIsStatusB2B(false);

    try {
      if (!documentId) {
        enqueueSnackbar(`เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง`, {
          variant: "error",
          autoHideDuration: 2000,
        });
        setStatusResult("failed");
        return;
      }

      const response = await dispatch(
        getContractStatusDetail({ id: documentId }) as any
      );
      const data = response?.payload?.data;

      if (data) {
        // console.log("success payload =>", data);

        if (data.is_verified) {
          setStatusResult("approved");
          setDocsStatus("D");
        } else {
          setStatusResult("failed");
          setDocsStatus("N");
        }
      } else {
        setStatusResult("failed");
        enqueueSnackbar(`ไม่พบข้อมูลเอกสาร`, {
          variant: "error",
          autoHideDuration: 2000,
        });
      }
    } catch (error) {
      console.error(error);
      setStatusResult("failed");
      enqueueSnackbar(`เกิดข้อผิดพลาดจากระบบ`, {
        variant: "error",
        autoHideDuration: 2000,
      });
    } finally {
      setIsProcessingOpen(true);
      setTimeout(() => {
        setIsProcessingOpen(false);
        setIsStatusB2B(true);
      }, 2500);
    }
  };

  // 🎯 ฟังก์ชันตรวจสอบว่ามี credentials หรือไม่
  // const hasValidCredentials = () => {
  //   // ถ้า เป็น มาตรา 9 ไม่ต้องมี CA
  //   if (formDataFlow && currentUserStepIndex) {
  //     const currentUserFlow = formDataFlow.find(
  //       (flow: any) => flow.level?.toString() === currentUserStepIndex
  //     );
  //     if (currentUserFlow?.section === "9") {
  //       return true;
  //     }
  //   }
  //   // ถ้าเป็น creator/sender ไม่จำเป็นต้องมี CA
  //   if (isCreatorOrSender) {
  //     return true;
  //   }

  //   return getSelectedCredential() !== null;
  // };

  // 🎯 ฟังก์ชันจัดการเมื่อไม่มี credentials
  const handleMissingCredentials = () => {
    // ถ้าเป็น creator/sender ไม่ควรถึงจุดนี้เลย แต่เป็น safety check
    if (isCreatorOrSender) {
      return;
    }
    setShowErrorModal(true);
  };

  // 🎯 ฟังก์ชันจัดการ onApprove ที่มีการตรวจสอบ credentials
  const handleApprove = () => {
    // if (!hasValidCredentials()) {
    //   handleMissingCredentials();
    //   return;
    // }
    onApprove();
  };

  // 🎯 ฟังก์ชันจัดการ onReject ที่มีการตรวจสอบ credentials
  const handleReject = () => {
    // if (!hasValidCredentials()) {
    //   handleMissingCredentials();
    //   return;
    // }
    onReject();
  };

  // 🎯 NEW: ฟังก์ชันตรวจสอบการแสดงปุ่มตาม flow.status และ stepIndex
  const shouldShowActionButtons = () => {
    // ถ้าไม่ใช่ frontend mode ไม่ต้องตรวจสอบ
    if (!isFrontend) {
      return true;
    }

    // ถ้าไม่มี formDataFlow หรือ currentUserStepIndex ไม่ต้องแสดงปุ่ม
    if (!formDataFlow || formDataFlow.length === 0 || !currentUserStepIndex) {
      return false;
    }

    // หา flow ที่ตรงกับ currentUserStepIndex
    const currentUserFlow = formDataFlow.find(
      (flow: any) => flow.level?.toString() === currentUserStepIndex
    );

    if (!currentUserFlow) {
      return false;
    }

    // เงื่อนไข 1: หาก flow.status === "R" จะไม่แสดงปุ่ม
    if (currentUserFlow.status === "R") {
      return false;
    }

    // เงื่อนไข 2: สำหรับ flow.status === "W" ตรวจสอบ stepIndex
    if (currentUserFlow.status === "W") {
      // หา flow ที่มี status "W" ทั้งหมด
      const waitingFlows = formDataFlow.filter(
        (flow: any) => flow.status === "W"
      );

      if (waitingFlows.length === 0) {
        return false;
      }

      // เรียงลำดับตาม level
      waitingFlows.sort(
        (a: any, b: any) => Number(a.level ?? 0) - Number(b.level ?? 0)
      );

      // ตรวจสอบว่า currentUserStepIndex เป็น flow แรกที่รอการอนุมัติหรือไม่
      const firstWaitingFlow = waitingFlows[0];
      const isCurrentUserTurn =
        firstWaitingFlow.level?.toString() === currentUserStepIndex;

      return isCurrentUserTurn;
    }

    // สำหรับ status อื่นๆ (Y, D, C) ไม่แสดงปุ่ม
    return false;
  };

  // Function to handle saving edited title
  const handleSaveTitle = () => {
    const newTitle = editedTitle.trim();
    if (onFormTitleChange && newTitle !== "") {
      if (newTitle.endsWith(".pdf")) {
        onFormTitleChange(editedTitle);
      } else {
        let resultTitle = newTitle + ".pdf";
        setEditedTitle(resultTitle);
        onFormTitleChange(resultTitle);
      }
    }
    setIsEditingTitle(false);
  };

  // Function to toggle favorite status
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const openEstampModal = () => {
    // setIsModalOpen(true);
    // console.log('isValidateEsseal =>',isValidateEsseal)
    if (!isValidateEsseal) {
      if (setIsErrorModalOpenEseal && setErrorMessage) {
        setErrorMessage("ต้องมีการกำหนดตราประทับองค์กร");
        setIsErrorModalOpenEseal(true);
      }
    } else {
      if (
        B2BformData?.forms?.docsTypeDetail.paymentChannel == "นอกระบบ" ||
        B2BformData?.forms?.docsTypeDetail.paymentChannel == "ไม่ชำระอากรแสตมป์"
      ) {
        if (setIsConfirmModalOpen) {
          setIsConfirmModalOpen(true);
        }
      } else {
        setIsModalOpen(true);
      }
    }
  };

  const checkPermissionType = () => {
    const data = B2BformData?.forms?.contractParty;
    // console.log('contractParty --->',data)
  };
  const handleConfirm = async (estampData: any): Promise<boolean> => {
    try {
      await setIsModalOpen(false);
      await onSaveForm();
      return true; // Return true on success
    } catch (error) {
      enqueueSnackbar(`🎯 [StickyTopBar] Error in handleConfirm: ${error}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
      return false; // Return false on error
    }
  };

  // Function to handle saving user settings
  const handleSaveUserSettings = async () => {
    try {
      setIsSavingSettings(true);
      await onSaveUserSetting();
      enqueueSnackbar("บันทึกการตั้งค่าสำเร็จ", {
        variant: "success",
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });

      // ส่งอีเวนต์ว่าการตั้งค่าถูกบันทึกแล้ว
      appEmitter.emit("userSettingSaved", true);

      // After successful saving, go back to form editing
      onCloseConfig();
    } catch (error) {
      enqueueSnackbar("เกิดข้อผิดพลาดในการบันทึกการตั้งค่า", {
        variant: "error",
        autoHideDuration: 4000,
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });
    } finally {
      setIsSavingSettings(false);
    }
  };
  useEffect(() => {
    const handleEstampSaved = () => {
      handleConfirm({}); // Pass empty object as estampData
    };

    appEmitter.on("estampSaved", handleEstampSaved);

    return () => {
      appEmitter.off("estampSaved", handleEstampSaved);
    };
  }, []);
  // เตรียมเนื้อหากลางที่จะแสดงบน TopBar
  const renderMiddleContent = () => {
    if (isSettingsMode) {
      return (
        <div className="flex items-center">
          <Settings size={18} className="mr-2 text-theme" />
          <p className="font-medium">
            ตั้งค่าเอกสาร: {formTitle || "แบบฟอร์มไม่มีชื่อ"}
          </p>
        </div>
      );
    } else if (showStylePanel && configElement && isBackend) {
      return (
        <StylePanel
          style={configElement.style as ElementStyle}
          onStyleChange={onStyleChange}
          computedDefaults={computedStyleDefaults}
          elementId={configElement.id}
          documentType={documentType} // 🎯 NEW: Pass documentType prop for template mode
        />
      );
    } else if (isEditingTitle && isBackend) {
      return (
        <div className="flex items-center">
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="mr-2"
            autoFocus
            onPressEnter={handleSaveTitle}
          />
          <Button
            type="primary"
            icon={<Check size={16} />}
            onClick={handleSaveTitle}
            size="small"
          />
        </div>
      );
    } else {
      return (
        <div className="flex gap-2 items-center">
          {isFrontend && (
            <button
              onClick={toggleFavorite}
              className={`${
                isFavorite ? "text-red-500" : "text-gray-400"
              } hover:text-red-500`}
            >
              {/* <Heart size={16} fill={isFavorite ? "#EF4444" : "none"} /> */}
            </button>
          )}
          <p className="font-medium">{formTitle || "แบบฟอร์มไม่มีชื่อ"}</p>

          {/* Show document status badge in frontend mode when finalized */}
          {isFrontend &&
            documentStatus &&
            (documentStatus === "Y" || documentStatus === "R") && (
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${
                  documentStatus === "Y"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {documentStatus === "Y" ? "เสร็จสิ้น" : "ปฏิเสธ"}
              </span>
            )}

          {/* Show Edit icon in backend mode */}
          {isBackend && onFormTitleChange && !isSettingsMode && (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Edit2 size={16} />
            </button>
          )}

          {/* Show favorite icon and version in frontend mode */}
          {isFrontend && (
            <span className="text-xs text-gray-500 bg-[#F0F6FF] px-4 py-1 rounded-full">
              {version}
            </span>
          )}
        </div>
      );
    }
  };

  // เตรียมเนื้อหาปุ่มด้านขวา
  const renderRightButtons = () => {
    if (isSettingsMode) {
      // console.log('a')
      return (
        <button
          className={`
            ${viewport.isMobile ? "min-w-20 text-xs px-2 py-1" : "min-w-24"}
            ${
              isSavingSettings || !isFormValid
                ? "btn-theme btn-disabled cursor-not-allowed opacity-50"
                : "btn-theme"
            }
          `}
          onClick={handleSaveUserSettings}
          disabled={isSavingSettings || !isFormValid}
          title={!isFormValid ? "กรุณากรอกข้อมูลให้ครบถ้วน" : ""}
        >
          {viewport.isMobile ? "บันทึก" : "บันทึกการตั้งค่า"}
        </button>
      );
    } else if (configElement && isBackend) {
      // console.log('b')
      return (
        <button
          onClick={onCloseConfig}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={18} />
        </button>
      );
    } else if (isBackend) {
      // console.log('c')

      return (
        <>
          {/* <button className="btn flex items-center gap-1 hover:opacity-60">
            <Image src={PreviewAPI} height={20} width={20} alt="Preview API" />
            <p className="text-theme font-medium border-b border-theme">
              Preview API
            </p>
          </button>
          <button
            className={`btn border border-theme min-w-24 text-theme hover:bg-theme hover:text-white ${
              !isPdfReady ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!isPdfReady}
            title={
              !isPdfReady
                ? "ไม่สามารถบันทึกร่างได้ เนื่องจาก PDF ยังไม่พร้อม"
                : ""
            }
          >
            บันทึกร่าง
          </button> */}
          <button
            className={`
              ${viewport.isMobile ? "min-w-20 text-xs px-2 py-1" : "min-w-24"}
              ${
                isSaving ||
                !isFormValid ||
                !isFileValidationValid ||
                !isPdfReady ||
                !isValidateSigner
                  ? "btn-theme btn-disabled cursor-not-allowed opacity-50"
                  : "btn-theme"
              }
            `}
            disabled={
              isSaving ||
              !isFormValid ||
              !isFileValidationValid ||
              !isPdfReady ||
              !isValidateSigner
            }
            onClick={openEstampModal}
            title={
              !isPdfReady
                ? "ไม่สามารถบันทึกได้ เนื่องจาก PDF ยังไม่พร้อม"
                : !isFileValidationValid
                ? "ไม่สามารถบันทึกได้ เนื่องจากขนาดไฟล์เกิน 100 MB"
                : !isFormValid
                ? "กรุณากรอกข้อมูลให้ครบถ้วน"
                : ""
            }
          >
            บันทึก
          </button>
          <ModalEstamp
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleConfirm}
            isLoading={false}
            title="แบบขอเสียอากรแสตมป์เป็นตัวเงินสำหรับตราสารอิเล็กทรอนิกส์ อ.ส.9"
          />
        </>
      );
    } else {
      // console.log('d')
      // console.log('documentStatus =>',documentStatus)

      const isDocumentFinalized =
        documentStatus === "Y" || documentStatus === "R";

      if (isDocumentFinalized) {
        return null;
      } else if (documentStatus === "N" || documentStatus === "D") {
        return (
          <>
            {/* อัปเดตเอกสาร */}
            <button
              className={`
                btn border border-theme text-theme hover:bg-theme hover:text-white 
                ${viewport.isMobile ? "min-w-20 text-xs px-2 py-1" : "min-w-24"}
                ${docsStatus === "N" ? "" : "opacity-50 cursor-not-allowed"}
              `}
              disabled={docsStatus !== "N"}
              onClick={() => getContractStatusDetailData()}
            >
              {viewport.isMobile ? "อัปเดต" : "อัปเดตเอกสาร"}
            </button>
            {/* ส่งอนุมัติ */}
            <button
              disabled={docsStatus === "N"}
              className={`
                btn-theme
                ${viewport.isMobile ? "min-w-20 text-xs px-2 py-1" : "min-w-24"}
                ${
                  docsStatus === "N"
                    ? "cursor-not-allowed btn-disabled opacity-50"
                    : ""
                }
              `}
              onClick={sendMail}
            >
              {viewport.isMobile ? "ส่ง" : "ส่งอนุมัติ"}
            </button>
            <ErrorModal
              open={isErrorModalOpen}
              onClose={() => setIsErrorModalOpen(false)}
              titleName="ไม่สามารถทำรายการได้"
              message=""
            />
            <SuccessModal
              open={isSuccessModalOpen}
              titleName="บันทึกสำเร็จ"
              message="บันทึกฟอร์มเรียบร้อยแล้ว"
              onClose={() => {
                setIsSuccessModalOpen(false);
                router.push("/frontend");
              }}
              autoCloseDelay={2000}
            />
            <ProcessB2BModal
              open={isProcessingOpen}
              processType="processing"
              onClose={() => {
                setIsProcessingOpen(false);
              }}
              autoCloseDelay={2000}
            />
            <StatusB2BModal
              open={isStatusB2B}
              status={statusResult}
              onClose={() => {
                setIsStatusB2B(false);
                // router.push("/frontend");
              }}
              autoCloseDelay={2000}
            />
          </>
        );
      }

      // 🎯 NEW: ตรวจสอบเงื่อนไขการแสดงปุ่มตาม flow.status และ stepIndex
      const shouldShowButtons = shouldShowActionButtons();

      if (!shouldShowButtons) {
        return null; // ไม่แสดงปุ่มใดๆ
      }

      return (
        <>
          {/* <button
            disabled={!isPdfReady}
            className={`btn flex items-center gap-1 hover:opacity-60 ${
              !isPdfReady ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title={!isPdfReady ? "ไม่สามารถดูตัวอย่างได้ เนื่องจาก PDF ยังไม่พร้อม" : ""}
          >
            <p className="text-theme font-medium border-b border-theme">
              ดูตัวอย่าง
            </p>
          </button> */}
          <button
            disabled={!isPdfReady}
            onClick={handleReject}
            className={`
              btn border border-theme text-theme hover:bg-theme hover:text-white 
              ${viewport.isMobile ? "min-w-20 text-xs px-2 py-1" : "min-w-24"}
              ${!isPdfReady ? "opacity-50 cursor-not-allowed" : ""}
            `}
            title={
              !isPdfReady ? "ไม่สามารถปฏิเสธได้ เนื่องจาก PDF ยังไม่พร้อม" : ""
            }
          >
            ปฏิเสธ
          </button>
          <button
            disabled={isRequiredText || !isPdfReady}
            onClick={handleApprove}
            className={`
              btn-theme
              ${viewport.isMobile ? "min-w-20 text-xs px-2 py-1" : "min-w-24"}
              ${
                isRequiredText || !isPdfReady
                  ? "btn-disabled cursor-not-allowed opacity-50"
                  : ""
              }
            `}
            title={
              !isPdfReady
                ? currentUserAction === "signer"
                  ? "ไม่สามารถลงนามได้ เนื่องจาก PDF ยังไม่พร้อม"
                  : "ไม่สามารถอนุมัติได้ เนื่องจาก PDF ยังไม่พร้อม"
                : isRequiredText
                ? "กรุณากรอกข้อมูลให้ครบถ้วน"
                : ""
            }
          >
            {currentUserAction === "signer" ? "ลงนาม" : "อนุมัติ"}
          </button>
        </>
      );
    }
  };

  return (
    <div
      className={`
        z-[5] bg-white shadow-theme 
        flex flex-wrap justify-between items-center
        ${viewport.isMobile ? "p-2" : viewport.isTablet ? "p-3" : "p-4"}
        transition-all duration-300
      `}
    >
      {/* 🎯 RESPONSIVE: Back button - ซ่อนข้อความบน mobile */}
      {!isGuest ? (
        <Button
          onClick={() => {
           /*  if (selectedBusinessId && selectedBusinessId !== "ทั้งหมด") {
              router.push(`/document/statusContract`);
            } else {
              router.push("/frontend");
            } */
           const selectedBiz = localStorage.getItem("selectedBusiness");

            if (selectedBiz && selectedBiz !== "ทั้งหมด") {
            if (window.history.length > 1) {
            router.back();
            } else {
            router.push("/document/statusContract");
        }
          } else {
            router.back();
        }
          }}
          type="text"
          className={`flex items-center gap-2 pl-0 pr-1 ${
            viewport.isMobile ? "min-w-0" : ""
          }`}
          size={viewport.isMobile ? "small" : "middle"}
        >
          <ChevronLeft className={viewport.isMobile ? "w-4 h-4" : "w-5 h-5"} />
          {!viewport.isMobile && <p className="font-medium">ย้อนกลับ</p>}
        </Button>
      ) : (
        // Empty div to reserve space - responsive width
        <div className={viewport.isMobile ? "w-8" : "w-[120px]"} />
      )}

      {/* 🎯 RESPONSIVE: Middle content - ปรับตำแหน่งและขนาด */}
      <div
        className={`
        ${
          viewport.isDesktop
            ? "lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2"
            : ""
        }
        ${viewport.isMobile ? "flex-1 mx-2" : "relative"}
      `}
      >
        {renderMiddleContent()}
      </div>

      {/* 🎯 RESPONSIVE: Right buttons - ปรับ layout */}
      <div
        className={`
        flex items-center gap-2
        ${
          viewport.isMobile
            ? "justify-end"
            : "md:justify-end justify-center md:mt-0 mt-2"
        }
      `}
      >
        {renderRightButtons()}
      </div>

      {/* 🎯 Error Modal สำหรับ Certificate Authority */}
      <ErrorModal
        open={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        titleName="ไม่สามารถทำรายการได้"
        message="คุณไม่สามารถทำรายการได้ เนื่องจากไม่มี CA"
      />
    </div>
  );
};

export default StickyTopBar;
