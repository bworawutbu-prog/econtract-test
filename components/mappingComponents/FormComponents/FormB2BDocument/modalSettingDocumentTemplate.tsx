"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Spin } from "antd";
import { FormB2B } from "./FormB2B";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { addSubmittedForm, setApprovers } from "@/store/documentStore/B2BForm";
import { DocsSetting, UserListData } from "@/store/types/contractB2BType";
import { useRouter } from "next/navigation";
import appEmitter from "@/store/libs/eventEmitter";
import { LoadingOutlined } from "@ant-design/icons";
import { enqueueSnackbar } from "notistack";
import dayjs from "dayjs";

interface SettingDocsTemplateProp {
  open: boolean;
  onClose: () => void;
  isSave: () => void;
  pdfUrl?: any;
  pdfPage: number;
  pdfName: string;
  docTypeId: string; // Document type ID for template mode
  workspaceId: string; // Workspace ID for template mode
}

interface Approver {
  approverType?: string; //external, internal
  attachment?: boolean;
  attachmentType?: any; // ไฟล์แนบ
  permissionType?: string; //signer, approver
  section?: string;
  userList?: any[];
}

export const SettingDocsTemplateModal: React.FC<SettingDocsTemplateProp> = ({
  open,
  onClose,
  isSave,
  pdfUrl = null,
  pdfPage = 0,
  pdfName = "",
  docTypeId = "",
  workspaceId = "",
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const B2BformData = useAppSelector((state) => state.contractB2BForm);
  const [form] = Form.useForm<DocsSetting>();
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(pdfUrl);
  const [currentPageCount, setCurrentPageCount] = useState<number>(pdfPage);
  const [confirmResetAllMapping, setConfirmResetAllMapping] = useState<boolean>(false);

  // 🎯 Template mode: Always set form as valid (no validation required)
  useEffect(() => {
    const handleFormUpdate = () => {
      // In template mode, form is always valid
      // No need to check validation
    };

    appEmitter.on("formB2BUpdated", handleFormUpdate);

    return () => {
      appEmitter.off("formB2BUpdated", handleFormUpdate);
    };
  }, []);

  // Set default values when opening modal in template mode
  useEffect(() => {
    if (open) {
      if (B2BformData?.forms) {
        const mappedApprovers = (
          B2BformData.forms.contractParty?.approvers || []
        ).map((approver: any, index: number) => ({
          ...approver,
          // 🎯 Ensure first approver has approverType: "internal" as default
          approverType: index === 0 ? (approver.approverType || "internal") : approver.approverType,
          userList: (approver?.userList ?? []).map(mapUserData),
        }));
        
        const defaultValues = {
          docsType: B2BformData?.forms.docsType || "B2B",
          docsTypeDetail: B2BformData?.forms.docsTypeDetail || {},
          contractParty: {
            ...B2BformData?.forms.contractParty,
            approvers: mappedApprovers,
          },
        };
        
        form.setFieldsValue(defaultValues);
      } else {
        // When opening modal without existing data, set default structure
        const currentValues = form.getFieldsValue();
        const currentApprovers = currentValues?.contractParty?.approvers || [];
        
        // Ensure first approver has approverType: "internal"
        if (currentApprovers.length > 0 && !currentApprovers[0]?.approverType) {
          form.setFieldsValue({
            contractParty: {
              ...currentValues?.contractParty,
              approvers: currentApprovers.map((approver: any, index: number) => ({
                ...approver,
                approverType: index === 0 ? "internal" : approver.approverType,
              })),
            },
          });
        } else if (currentApprovers.length === 0) {
          // If no approvers exist, set default structure
          form.setFieldsValue({
            contractParty: {
              ...currentValues?.contractParty,
              approvers: [
                {
                  approverType: "internal",
                  permissionType: undefined,
                  userList: [
                    {
                      fullName: "",
                      idCard: "",
                      email: "",
                      userName: "",
                      hasCa: false,
                      isInBusiness: false,
                      isSaved: true,
                    },
                  ],
                },
              ],
            },
          });
        }
      }
    }
  }, [B2BformData?.forms, open, form]);

  const mapUserData = (data: any): UserListData => {
    return {
      fullName: data.name || '',
      idCard: data.id_card || '',
      email: data.email || '',
      userName: data.email || '',
      hasCa: data.has_ca || false,
      isInBusiness: data.is_in_business || false,
      accountId: data.id || '',
      nationality: data.nationality || "thailand",
    };
  };

  const generateActualSection = (finalValues: DocsSetting) => {
    const approvers = finalValues.contractParty?.approvers || [];

    const actualApprovers = approvers?.map((approver, idx) => {
      // 🎯 FIXED: Map userList to consistent entity format for all approvers
      // Convert UserListData to entity format that matches FlowDataEntity structure
      const entities = (approver.userList ?? []).map((user: any) => ({
        id: user.accountId || user.id || "",
        name: user.fullName || user.name || "",
        id_card: user.idCard || user.id_card || "",
        email: user.email || "",
        has_ca: user.hasCa || user.has_ca || false,
        no_edit_mail: false,
        is_in_business: user.isInBusiness || user.is_in_business || false,
        nationality: user.nationality || "thailand",
      }));

      return {
        index: idx + 1,
        role: "Creator",
        permission: approver.permissionType || "approver",
        section: "มาตรา 26 และมาตรา 28",
        validateType: "",
        validateData: "",
        entityType: idx === 0 ? "sender" : "personal",
        entities: entities,
        selfieVideo: false,
        selfieMessage: "",
      };
    });

    return {
      approvers: actualApprovers,
      formId: "",
      typeCode: "1",
    };
  };

  const handleSubmit = async () => {
    setLoadingSubmit(true);
    setTimeout(async () => {
      try {
        // 🎯 Template mode: No validation required, just get values
        const values = form.getFieldsValue();

        isSave();

        // Reset mapping if confirmed
        if (confirmResetAllMapping) {
          appEmitter.emit("resetAllMapping");
        }

        const section = values.docsTypeDetail?.section || '';
        const updatedApprovers = (values.contractParty?.approvers || []).map(
          (approver: Approver, index: number) => ({
            ...approver,
            section,
            userList: (approver?.userList || []).map((user) => ({
              name: user.fullName || user.name || "",
              id_card: user.idCard || user.id_card || "",
              email: user.email || "",
              has_ca: user.hasCa ?? user.has_ca ?? false,
              is_in_business: user.isInBusiness ?? user.is_in_business ?? false,
              no_edit_mail: false,
              id: user.accountId || user.id || "",
              nationality: user.nationality || "thailand",
            })),
          })
        );

        const startDate = values.docsTypeDetail?.startDocsDate || '';
        const endDate = values.docsTypeDetail?.endDocsDate || '';

        const finalValues: DocsSetting = {
          ...values,
          docsTypeDetail: {
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

        await dispatch(setApprovers(tempMapData));
        await dispatch(addSubmittedForm(finalValues));
        
        // Use merged PDF URL if available, otherwise use original PDF
        const finalPdfUrl = currentPdfUrl || pdfUrl;
        const finalName = pdfName;
        const finalBase64Pdf = sessionStorage.getItem('originalPdf');
        let finalDocsType = '';
        if (B2BformData.forms?.docsType === "B2B") {
          finalDocsType = "b2b";
        } else {
          finalDocsType = "b2c";
        }
        
        let finalNameOriginalPdf = '';
        if (finalBase64Pdf == undefined || finalBase64Pdf == null) {
          sessionStorage.setItem('nameOriginalPdf', finalName);
        }
        finalNameOriginalPdf =
          finalName ??
          sessionStorage.getItem("nameOriginalPdf") ??
          "original.pdf";
        
        // 🎯 Build URL for creating new template (not viewing existing template)
        // Note: type=template should only come from handleViewTemplateFormDetails in folderWorkspace/page.tsx
        const baseParams = new URLSearchParams({
          pdfUrl: finalPdfUrl,
          title: finalNameOriginalPdf,
          docType: finalDocsType,
          type: "template", // Create new template, not view existing template
        });

        if (docTypeId) baseParams.append("docTypeId", docTypeId);
        if (workspaceId) baseParams.append("workspaceId", workspaceId);

        // 🎯 FIXED: Clear Next.js router cache by refreshing after navigation
        await router.push(`/backend/Mapping?${baseParams.toString()}`);
        router.refresh(); // 🎯 Force refresh to clear router cache
        onClose();
      } catch (error) {
        enqueueSnackbar(`เกิดข้อผิดพลาดในการบันทึกข้อมูล`, { variant: "error" });
        console.error("❌ Error saving template:", error);
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
            ตั้งค่าเอกสาร Template
          </div>
        }
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
                loadingSubmit
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
        <FormB2B 
          onConfirmResetAllMapping={() => setConfirmResetAllMapping(true)}
          open={open}
          pdfPage={currentPageCount || pdfPage} 
          pdfObject={currentPdfUrl || pdfUrl} 
          form={form}
          mode="template" // 🎯 Always template mode
          onPdfUpdate={(newPdfUrl: string, newPageCount: number) => {
            setCurrentPdfUrl(newPdfUrl);
            setCurrentPageCount(newPageCount);
          }}
        />
      </Modal>
    </>
  );
};

