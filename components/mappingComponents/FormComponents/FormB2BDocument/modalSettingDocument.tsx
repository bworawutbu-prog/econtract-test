"use client";

import React, { useEffect, useState, memo } from "react";
import { Modal, Form, Spin } from "antd";
// import { FormB2B } from "../mappingComponents/FormComponents/FormB2B";
import { FormB2B } from "./FormB2B";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { addSubmittedForm, setApprovers } from "@/store/documentStore/B2BForm";
import { DocsSetting, UserListData } from "@/store/types/contractB2BType";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import appEmitter from "@/store/libs/eventEmitter";
import { LoadingOutlined } from "@ant-design/icons";
import { enqueueSnackbar } from "notistack";
import { WarnningModal } from "@/components/modal/modalWarning";
import { FormB2C } from "./FormB2C";
import dayjs from "dayjs";

interface SettingDocsProp {
  open: boolean;
  onClose: () => void;
  isSave: () => void;
  pdfUrl?: any;
  pdfPage: number;
  pdfName: string;
  from?: string;
  mode?: "template" | "document"; // 🎯 NEW: Specify if this is for template or document
  docTypeId?: string; // 🎯 NEW: Document type ID for template mode
  workspaceId?: string; // 🎯 NEW: Workspace ID for template mode
}

interface Approver {
  approverType?: string; //external, internal
  attachment?: boolean;
  attachmentType?: any; // ไฟล์แนบ
  permissionType?: string; //signer, approver
  section?: string;
  userList?: any[];
}

export const SettingDocsModal: React.FC<SettingDocsProp> = ({
  open,
  onClose,
  isSave,
  pdfUrl = null,
  pdfPage = 0,
  pdfName = "",
  from = "",
  mode = "document", // 🎯 NEW: Default to document mode
  docTypeId = "", // 🎯 NEW: Document type ID for template mode
  workspaceId = "", // 🎯 NEW: Workspace ID for template mode
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const B2BformData = useAppSelector((state) => state.contractB2BForm);
  const [form] = Form.useForm<DocsSetting>();
  // const docsTypeDetail = Form.useWatch("docsTypeDetail", form);
  // const contractParty = Form.useWatch("contractParty", form);
  // const [resultData, setResultData] = useState<any>();
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  const [isValidForm, setIsValidForm] = useState<boolean>(false);
  const [openModalWarnning, setOpenModalWarnning] = useState<boolean>(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(pdfUrl);
  const [currentPageCount, setCurrentPageCount] = useState<number>(pdfPage);
  const [confirmResetAllMapping, setConfirmResetAllMapping] = useState<boolean>(false);
  useEffect(() => {
    // console.log("📦 Current Store Data:", B2BformData);
  }, [B2BformData]);

  useEffect(() => {
    const handleFormUpdate = (payload?: { isValid: boolean }) => {
      if (!payload) return;
      // console.log("Form valid?", payload.isValid);
      setIsValidForm(payload.isValid);
    };

    appEmitter.on("formB2BUpdated", handleFormUpdate);

    return () => {
      appEmitter.off("formB2BUpdated", handleFormUpdate);
    };
  }, []);

  // 🎯 Check if this is template mode from URL
  const searchParams = useSearchParams();
  const isTemplateMode = searchParams.get("type") === "template";
  const templateDocType = searchParams.get("docType") || ""; // "b2b" or "b2c"

  // Set default values when B2BformData has existing form data
  useEffect(() => {
    const currPath = pathname.split("/").filter(Boolean);
    if ((currPath[0] === "document") && open) {
      // 🎯 Template mode: Load data from Redux store (set by handleViewTemplateFormDetails)
      if (isTemplateMode && B2BformData?.forms && open) {
        const mappedApprovers = (
          B2BformData.forms.contractParty?.approvers || []
        ).map((approver: any) => ({
          ...approver,
          userList: (approver?.userList ?? []).map(mapUserData),
        }));
        
        const defaultValues = {
          docsType: B2BformData?.forms.docsType || (templateDocType === "b2b" ? "B2B" : "B2C"),
          docsTypeDetail: B2BformData?.forms.docsTypeDetail || {},
          contractParty: {
            ...B2BformData?.forms.contractParty,
            approvers: mappedApprovers,
          },
        };
        
        form.setFieldsValue(defaultValues);
      } else {
        form.resetFields(); // reset ตอนเปิด (non-template mode)
      }
    } else if (currPath[0] === "backend" && isTemplateMode && open) {
      if (B2BformData?.forms && open) {
        const mappedApprovers = (
          B2BformData.forms.contractParty?.approvers || []
        ).map((approver: any) => ({
          ...approver,
          userList: (approver?.userList ?? []).map(mapUserData),
        }));
        
        const defaultValues = {
          docsType: B2BformData?.forms.docsType || (templateDocType === "b2b" ? "B2B" : "B2C"),
          docsTypeDetail: B2BformData?.forms.docsTypeDetail || {},
          contractParty: {
            ...B2BformData?.forms.contractParty,
            approvers: mappedApprovers,
          },
        };
        
        form.setFieldsValue(defaultValues);
      }
    } else {
      if (B2BformData?.forms && open) {
        // console.log(
        //   "🔄 Setting default values from B2BformData:",
        //   B2BformData.forms
        // );
        // console.log(
        //   "🔄 Setting default values from B2BformData:",
        //   B2BformData.forms
        // );
        // console.log("form party =>", B2BformData.forms.contractParty);
        const mappedApprovers = (
          B2BformData.forms.contractParty?.approvers || []
        ).map((approver: any) => ({
          ...approver,
          userList: (approver?.userList ?? []).map(mapUserData),
        }));
        // console.log("mapped => ", mappedApprovers);
        const defaultValues = {
          docsType: B2BformData?.forms.docsType || "B2B",
          docsTypeDetail: B2BformData?.forms.docsTypeDetail || {},
          contractParty: {
            ...B2BformData?.forms.contractParty,
            approvers: mappedApprovers,
          },
        };
        // console.log("final ===>", defaultValues);
        // form.setFieldsValue(B2BformData.forms);
        form.setFieldsValue(defaultValues);
      }
    }
  }, [B2BformData?.forms, open, form, isTemplateMode, templateDocType, pathname]);

  const mapUserData = (data: any): UserListData => {
    return {
      fullName: data.name || '',
      idCard: data.id_card || '',
      email: data.email || '',
      userName: data.email || '', // ถ้าจะใช้ email เป็น userName
      hasCa: data.has_ca || false,
      isInBusiness: data.is_in_business || false,
      accountId: data.id || '',
      nationality: data.nationality || "thailand",
    };
  };

  const generateActualSection = (finalValues: DocsSetting) => {
    const approvers = finalValues.contractParty?.approvers || [];
    // console.log("approvers data =>", approvers);

    const actualApprovers = approvers?.map((approver, idx) => ({
      index: idx + 1,
      role: "Creator",
      permission: approver.permissionType || "approver",
      section: "มาตรา 26 และมาตรา 28",
      validateType: "",
      validateData: "",
      entityType: idx === 0 ? "sender" : "personal",
      entities:
        idx === 0
          ? approver.userList || [] // ลำดับแรกใช้เดิม
          : (approver.userList ?? []).map((user: any) => ({
              id: user.accountId || "",
              name: user.fullName || "",
              id_card: user.idCard || "",
              email: user.email || "",
              has_ca: user.hasCa || false,
              no_edit_mail: false,
              is_in_business: user.isInBusiness || false,
            })),
      selfieVideo: false,
      selfieMessage: "",
    }));
    // setResultData(actualApprovers);
    return {
      approvers: actualApprovers,
      formId: "",
      typeCode: "1",
    };
  };

  // const validateUserListData = async (form: any) => {
  //   const approvers = form.getFieldValue(["contractParty", "approvers"]) || [];

  //   const fieldsToValidate: any[] = [];
  //   approvers.forEach((approver: any, approverIndex: number) => {
  //     approver.userList.forEach((user: any, userIndex: number) => {
  //       fieldsToValidate.push([
  //         "contractParty",
  //         "approvers",
  //         approverIndex,
  //         "userList",
  //         userIndex,
  //         "fullName",
  //       ]);
  //       fieldsToValidate.push([
  //         "contractParty",
  //         "approvers",
  //         approverIndex,
  //         "userList",
  //         userIndex,
  //         "idCard",
  //       ]);
  //     });
  //   });

  //   await form.validateFields(fieldsToValidate);
  // };

  const checkUserList = () => {
    const approvers = form.getFieldValue(["contractParty", "approvers"]) || [];
    const newList: any = [];
    approvers.forEach((d: any, i: number) => {
      if (d.userList.length === 0) {
        newList.push(i + 1);
      }
    });
    return newList;
  };

  const checkValidateExternalForm = (approver: any) => {
    const validate = approver?.some((d: any) => d.approverType === "external");
    if (!validate) {
      setOpenModalWarnning(true);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    // checkUserList();
    setLoadingSubmit(true);
    setTimeout(async () => {
      try {
        const values = await form.validateFields()
        const validateExternal = await checkValidateExternalForm(
          values.contractParty.approvers
        );
        if (!validateExternal) {
          return;
        }
        const result = await checkUserList();
        if (result.length > 0) {
          enqueueSnackbar(
            `ต้องมีผู้ลงนามอย่างน้อย 1 คน สำหรับผู้อนุมัติลำดับที่ 2 เป็นต้นไป`,
            { variant: "warning",autoHideDuration: 3000 }
          );
          return;
        }

        isSave();

        //reset  mapping ทั้งหมด (คงเฉพาะ stamp/eseal)
        if (confirmResetAllMapping) {
          appEmitter.emit("resetAllMapping");
        }

        const section = values.docsTypeDetail?.section || '';
        // const operator = values.contractParty?.operator;
        const updatedApprovers = (values.contractParty?.approvers || []).map(
          (approver: Approver, index: number) => ({
            ...approver,
            section,
            userList: (approver?.userList || []).map((user) => ({
              name: user.fullName || user.name || "",
              id_card: user.idCard || user.id_card || "",
              email: user.email || "",
              // userName: user.userName || "",
              has_ca: user.hasCa ?? user.has_ca ?? false,
              is_in_business: user.isInBusiness ?? user.is_in_business ?? false,
              no_edit_mail: false, // กำหนดให้ index > 0 ไม่แก้ไขเมล
              id: user.accountId || user.id || "",
              nationality: user.nationality || "thailand",
            })),
          })
        );
        console.log("updatedApprovers =>", updatedApprovers);
        const startDate = values.docsTypeDetail?.startDocsDate || '';
        const endDate = values.docsTypeDetail?.endDocsDate || '';

        // const finalValues: DocsSetting = {
        //   ...values,
        //   contractParty: {
        //     ...values.contractParty,
        //     approvers: updatedApprovers,
        //   },
        // };
        const finalValues: DocsSetting = {
          ...values,
          docsTypeDetail:{
            ...values.docsTypeDetail,
            startDocsDate: dayjs.isDayjs(startDate) ? startDate.format("YYYY-MM-DD") : startDate ?? '',
            endDocsDate: dayjs.isDayjs(endDate)
          ? endDate.format("YYYY-MM-DD")
          : endDate ?? '',
          },
          contractParty: {
            ...values.contractParty,
            approvers: updatedApprovers,
          },
        };
        const actualSection = generateActualSection(finalValues);

        appEmitter.emit("userSetting", actualSection);

        const tempMapData = (values.contractParty?.approvers || []).map(
          (approver: any, index: number) => {
            return {
              index: index,
              role: approver.permissionType,
              permission: approver.permissionType,
              section: section,
              validateKey: "",
              validateType: "",
              validateData: "",
              entityType: index == 0 ? "sender" : "personal",
              entities: approver.userList,
              selfieVideo: false,
              selfieMessage: "",
            };
          }
        );
        // console.log("tempData =>", tempMapData);
        console.log("finalValues =>", finalValues);
        // dispatch(setApprovers(tempMapData));
        await dispatch(setApprovers(tempMapData));
        await dispatch(addSubmittedForm(finalValues));
        
        // ใช้ merged PDF URL ถ้ามี ไม่งั้นใช้ original PDF
        const finalPdfUrl = currentPdfUrl || pdfUrl;
        const finalPageCount = currentPageCount || pdfPage;
        const finalName = pdfName;
        const finalBase64Pdf = sessionStorage.getItem('originalPdf')
        let finalDocsType = '';
        if (B2BformData.forms?.docsType === "B2B") {
          finalDocsType = "b2b";
        } else {
          finalDocsType = "b2c";
        }
        let finalNameOriginalPdf = ''
        if (finalBase64Pdf == undefined || finalBase64Pdf == null) {
          sessionStorage.setItem('nameOriginalPdf', finalName)
        }
        finalNameOriginalPdf =
          finalName ??
          sessionStorage.getItem("nameOriginalPdf") ??
          "original.pdf";
        
        // 🎯 NEW: Build URL based on mode (template or document)
        const baseParams = new URLSearchParams({
          pdfUrl: finalPdfUrl,
          title: finalNameOriginalPdf,
          docType: finalDocsType,
          type: "create",
        });

        // Add mode-specific parameters
        if (mode === "template") {
          baseParams.append("type", "template"); // 🎯 Template mode flag
          if (docTypeId) baseParams.append("docTypeId", docTypeId);
          if (workspaceId) baseParams.append("workspaceId", workspaceId);
        } else {
          baseParams.append("pageCount", finalPageCount.toString());
        }

        // 🎯 FIXED: Clear Next.js router cache by refreshing after navigation
        await router.push(`/backend/Mapping?${baseParams.toString()}`);
        router.refresh(); // 🎯 Force refresh to clear router cache
        
        // if (from === "mapping") {
        //   onClose();
        //   console.log('a')
        // } else {
        //   router.push(
        //     `/backend/Mapping?pdfUrl=${encodeURIComponent(
        //       pdfUrl
        //     )}&title=${encodeURIComponent(pdfName)}&docType=b2b`
        //   );
        //         // setLoadingSubmit(false); // ปิด loading หลังทำงานเสร็จ

        // }
        onClose();
      } catch (error) {
        enqueueSnackbar(`กรุณากรอกข้อมูลให้ครบถ้วน`, { variant: "warning" });
        console.error("❌ Validation failed:", error);
        setLoadingSubmit(false);
      } finally {
        setLoadingSubmit(false);
      }
    }, 1000);
  };

  return (
    <>
      <Modal
        title={
          <div className="text-center text-[#0153BD] text-lg font-semibold">
            ตั้งค่าเอกสาร
          </div>
        }
        // afterOpenChange={(visible) => {
        //   if (!visible) {
        //     form.resetFields(); // reset ตอนปิด
        //   }
        // }}
        open={open}
        onCancel={onClose}
        footer={[
          <div key="footer-buttons" className="flex justify-center w-full space-x-4">
            <button
              onClick={onClose}
              className="w-24 text-theme btn py-4 hover:bg-[#E6E6E6]"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSubmit}
              className={`btn-theme ${
                loadingSubmit || !isValidForm
                  ? `opacity-50 pointer-events-none cursor-not-allowed w-35`
                  : "w-24"
              }`}
            >
              {loadingSubmit ? (
                <span className="flex items-center justify-center space-x-2">
                  <Spin
                    className="text-white"
                    indicator={<LoadingOutlined spin />}
                    size="small"
                  />
                  <span>กำลังยืนยัน</span>
                </span>
              ) : (
                "ยืนยัน"
              )}
            </button>
          </div>,
        ]}
        maskClosable={false}
        width={900}
        styles={{
          body: { maxHeight: "80vh", overflowY: "auto" },
          footer: {
            boxShadow: "0 -4px 8px -2px rgba(78, 115, 248, 0.04)",
          },
        }}
      >
        {/* 🎯 Show FormB2B or FormB2C based on contract.type from template or B2BformData */}
        {(() => {
          // Determine which form to show
          const docsType = isTemplateMode 
            ? (templateDocType === "b2b" ? "B2B" : templateDocType === "b2c" ? "B2C" : B2BformData.forms?.docsType || "B2B")
            : (B2BformData.forms?.docsType || "B2B");
          
          // if (docsType === "B2B") {
          //   return (
          //     <FormB2B 
          //       open={open}
          //       pdfPage={currentPageCount || pdfPage} 
          //       pdfObject={currentPdfUrl || pdfUrl} 
          //       form={form}
          //       onPdfUpdate={(newPdfUrl: string, newPageCount: number) => {
          //         setCurrentPdfUrl(newPdfUrl);
          //         setCurrentPageCount(newPageCount);
          //       }}
          //     />
          //   );
          // } else {
          //   return (
          //     <FormB2C
          //       open={open}
          //       pdfPage={currentPageCount || pdfPage}
          //       pdfObject={currentPdfUrl || pdfUrl}
          //       form={form}
          //       onPdfUpdate={(newPdfUrl: string, newPageCount: number) => {
          //         setCurrentPdfUrl(newPdfUrl);
          //         setCurrentPageCount(newPageCount);
          //       }}
          //     />
          //   );
          // }
             return (
              <FormB2B 
                onConfirmResetAllMapping={() => setConfirmResetAllMapping(true)}
                open={open}
                pdfPage={currentPageCount || pdfPage} 
                pdfObject={currentPdfUrl || pdfUrl} 
                form={form}
                onPdfUpdate={(newPdfUrl: string, newPageCount: number) => {
                  setCurrentPdfUrl(newPdfUrl);
                  setCurrentPageCount(newPageCount);
                }}
              />
            );
        })()}
      </Modal>
      <WarnningModal
        open={openModalWarnning}
        onClose={() => {
          setOpenModalWarnning(false);
        }}
      />
    </>
  );
};