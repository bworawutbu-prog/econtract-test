"use client";

import React, { useEffect, useState, memo, Children, useMemo } from "react";
import { Modal, Form, Spin, Upload, Button as AntButton, Space, List, Collapse } from "antd";
import { UploadOutlined, DeleteOutlined, FileOutlined } from "@ant-design/icons";
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
import { ChevronDown } from "lucide-react";

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

export const SettingDocsModalUseDocument: React.FC<SettingDocsProp> = ({
  open,
  onClose,
  isSave,
  pdfUrl = null,
  pdfPage = 0,
  pdfName = "",
  from = "",
  mode = "useDocument", // 🎯 NEW: Default to document mode
  docTypeId = "", // 🎯 NEW: Document type ID for template mode
  workspaceId = "", // 🎯 NEW: Workspace ID for template mode
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const B2BformData = useAppSelector((state) => state.contractB2BForm);
  const [form] = Form.useForm<DocsSetting>();
  const [isExternal, setIsExternal] = useState<boolean>(false);
  // const docsTypeDetail = Form.useWatch("docsTypeDetail", form);
  // const contractParty = Form.useWatch("contractParty", form);
  // const [resultData, setResultData] = useState<any>();
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  const [isValidForm, setIsValidForm] = useState<boolean>(false);
  const [openModalWarnning, setOpenModalWarnning] = useState<boolean>(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(pdfUrl);
  const [currentPageCount, setCurrentPageCount] = useState<number>(pdfPage);
  // const [confirmResetAllMapping, setConfirmResetAllMapping] = useState<boolean>(false);
  // 🎯 NEW: State for multiple PDF files in template mode
  const [uploadedPdfFiles, setUploadedPdfFiles] = useState<File[]>([]);
  const [isMergingPdfs, setIsMergingPdfs] = useState<boolean>(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [mergedPdfPageCount, setMergedPdfPageCount] = useState<number>(0);
  const [activeKeys, setActiveKeys] = useState<string[]>(['template']);

  useEffect(() => {
    // console.log("📦 Current Store Data:", B2BformData);
  }, [B2BformData]);

  useEffect(() => {
    const handleFormUpdate = (payload?: { isValid: boolean }) => {
      if (!payload) return;
      // 🎯 In template mode, always set form as valid (no validation required)
      if (mode === "template") {
        setIsValidForm(true);
      } else {
        // console.log("Form valid?", payload.isValid);
        setIsValidForm(payload.isValid);
      }
    };

    appEmitter.on("formB2BUpdated", handleFormUpdate);

    return () => {
      appEmitter.off("formB2BUpdated", handleFormUpdate);
    };
  }, [mode]);

  // 🎯 Set form as valid when opening modal in template mode
  useEffect(() => {
    // console.log('Setting Use =>',open ,' ' ,mode)
    if (open && mode === "template") {
      setIsValidForm(true);
    }
  }, [open, mode]);

  // 🎯 Check if this is template mode from URL
  const searchParams = useSearchParams();
  // const isTemplateMode = searchParams.get("type") === "template";
  const templateDocType = searchParams.get("docType") || ""; // "b2b" or "b2c"

  // Set default values when B2BformData has existing form data
  useEffect(() => {
    const currPath = pathname.split("/").filter(Boolean);
    if ((currPath[0] === "document") && open) {
      // 🎯 Template mode: Load data from Redux store (set by handleViewTemplateFormDetails)
      if (mode === "template" && B2BformData?.forms && open) {
        
        const mappedApprovers = (
          B2BformData.forms.contractParty?.approvers || []
        ).map((approver: any, index: number) => ({
          ...approver,
          // 🎯 Ensure first approver has approverType: "internal" as default
          approverType: index === 0 ? (approver.approverType || "internal") : approver.approverType,
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
    } else if (currPath[0] === "backend" && mode === "template" && open) {
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
        ).map((approver: any, index: number) => ({
          ...approver,
          // 🎯 Ensure first approver has approverType: "internal" as default
          approverType: index === 0 ? (approver.approverType || "internal") : approver.approverType,
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
      } else if (open && mode === "template") {
        // 🎯 When opening modal in template mode without existing data, set default values
        // This ensures approverType: "internal" is set for the first approver
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
  }, [B2BformData?.forms, open, form, templateDocType, pathname, mode]);

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
            // id: user.accountId || "",
            // name: user.fullName || "",
            // id_card: user.idCard || "",
            // email: user.email || "",
            // has_ca: user.hasCa || false,
            // no_edit_mail: false,
            // is_in_business: user.isInBusiness || false,
            id: user.id || "",
            name: user.name || "",
            id_card: user.id_card || "",
            email: user.email || "",
            has_ca: user.has_ca || false,
            no_edit_mail: false,
            is_in_business: user.is_in_business || false,
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

  // 🎯 NEW: Handle PDF file upload
  const handlePdfFileUpload = (file: File) => {
    // ตรวจสอบว่าเป็นไฟล์ PDF
    if (file.type !== 'application/pdf') {
      enqueueSnackbar('กรุณาเลือกไฟล์ PDF เท่านั้น', {
        variant: 'error',
        autoHideDuration: 3000
      });
      return false;
    }

    // ตรวจสอบขนาดไฟล์ (ไม่เกิน 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      enqueueSnackbar('ไฟล์ PDF มีขนาดใหญ่เกิน 10MB', {
        variant: 'error',
        autoHideDuration: 3000
      });
      return false;
    }

    // เพิ่มไฟล์เข้า list
    setUploadedPdfFiles(prev => [...prev, file]);
    enqueueSnackbar(`เพิ่มไฟล์ ${file.name} สำเร็จ`, {
      variant: 'success',
      autoHideDuration: 2000
    });

    return false; // Prevent auto upload
  };

  // 🎯 NEW: Remove PDF file from list
  const handleRemovePdfFile = (fileToRemove: File) => {
    setUploadedPdfFiles(prev => prev.filter(file => file !== fileToRemove));
    enqueueSnackbar('ลบไฟล์สำเร็จ', {
      variant: 'info',
      autoHideDuration: 2000
    });
  };

  // 🎯 NEW: Merge multiple PDFs into one
  const mergePdfFiles = async (files: File[]): Promise<{ url: string, pageCount: number }> => {
    try {
      const PDFDocument = (await import('pdf-lib')).PDFDocument;

      // Create a new PDF document
      const mergedPdf = await PDFDocument.create();
      let totalPages = 0;

      // Load and merge each PDF
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
          totalPages++;
        });
      }

      // Save the merged PDF
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(mergedPdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      return { url, pageCount: totalPages };
    } catch (error) {
      console.error('Error merging PDFs:', error);
      throw error;
    }
  };

  // 🎯 NEW: Handle submit with PDF merging for template mode
  const handleSubmit = async () => {
    setLoadingSubmit(true);

    setTimeout(async () => {
      try {
        // 🎯 Skip validation in template mode
        let values;
        if (mode === "template") {
          values = form.getFieldsValue();
        } else {
          values = await form.validateFields();
          const validateExternal = await checkValidateExternalForm(
            values.contractParty.approvers
          );
          if (!validateExternal) {
            setLoadingSubmit(false);
            return;
          }
          const result = await checkUserList();
          if (result.length > 0) {
            enqueueSnackbar(
              `ต้องมีผู้ลงนามอย่างน้อย 1 คน สำหรับผู้อนุมัติลำดับที่ 2 เป็นต้นไป`,
              { variant: "warning",autoHideDuration: 3000 }
            );
            setLoadingSubmit(false);
            return;
          }
        }
        

        // 🎯 NEW: Merge PDFs if in template mode and files are uploaded
        let finalPdfUrl = currentPdfUrl || pdfUrl;
        let finalPageCount = currentPageCount || pdfPage;

        if (mode === "template" && uploadedPdfFiles.length > 0) {
          setIsMergingPdfs(true);
          enqueueSnackbar('กำลังรวมไฟล์ PDF...', {
            variant: 'info',
            autoHideDuration: 2000
          });

          try {
            const { url, pageCount } = await mergePdfFiles(uploadedPdfFiles);
            finalPdfUrl = url;
            finalPageCount = pageCount;
            setMergedPdfUrl(url);
            setMergedPdfPageCount(pageCount);

            enqueueSnackbar('รวมไฟล์ PDF สำเร็จ', {
              variant: 'success',
              autoHideDuration: 2000
            });
          } catch (error) {
            enqueueSnackbar('เกิดข้อผิดพลาดในการรวมไฟล์ PDF', {
              variant: 'error',
              autoHideDuration: 3000
            });
            setLoadingSubmit(false);
            setIsMergingPdfs(false);
            return;
          } finally {
            setIsMergingPdfs(false);
          }
        }

        isSave();

        // Reset mapping if confirmed
        // if (confirmResetAllMapping) {
        //   appEmitter.emit("resetAllMapping");
        // }

        // ...existing code for preparing form data...
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

        // console.log('valueeeee =>',values)
        const finalValues: DocsSetting = {
          ...values,
          docsTypeDetail: {
            ...values.docsTypeDetail,
            startDocsDate: dayjs.isDayjs(startDate) ? startDate.format("YYYY-MM-DD") : startDate ?? '',
            endDocsDate: dayjs.isDayjs(endDate) ? endDate.format("YYYY-MM-DD") : endDate ?? '',
          },
          contractParty: {
            ...values.contractParty,
            approvers: updatedApprovers,
          },
        };

        console.log('finalValues =>',finalValues)

        const actualSection = generateActualSection(finalValues);
        console.log('actualSection =>',actualSection)
        appEmitter.emit("userSetting", actualSection);

        const tempMapData = (values.contractParty?.approvers || []).map(
          (approver: any, index: number) => ({
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
          })
        );
        console.log('tempMapData =>',tempMapData)
        

        await dispatch(setApprovers(tempMapData));
        await dispatch(addSubmittedForm(finalValues));

        // Prepare final data
        const finalName = pdfName;
        const finalBase64Pdf = sessionStorage.getItem('originalPdf');
        let finalDocsType = B2BformData.forms?.docsType === "B2B" ? "b2b" : "b2c";

        let finalNameOriginalPdf = '';
        if (finalBase64Pdf == undefined || finalBase64Pdf == null) {
          sessionStorage.setItem('nameOriginalPdf', finalName);
        }
        finalNameOriginalPdf = finalName ?? sessionStorage.getItem("nameOriginalPdf") ?? "original.pdf";


        // Build URL based on mode
        const baseParams = new URLSearchParams({
          pdfUrl: finalPdfUrl,
          title: finalNameOriginalPdf,
          docType: finalDocsType,
          type: "useDocument",
        });

        // console.log("modeee =>",mode)
        // console.log('workspaceId =>',workspaceId)
        // console.log('docTypeId =>',docTypeId)
        if (mode === "template") {
          baseParams.append("type", "template");
          if (docTypeId) baseParams.append("docTypeId", docTypeId);
          if (workspaceId) baseParams.append("workspaceId", workspaceId);
        }else if(mode === "document"){

            const templateFormDataStr = sessionStorage.getItem("templateFormData") ?? "{}";
            const convertData = JSON.parse(templateFormDataStr) ;
            const formId = convertData.formId ?? null;
            const formIdConverted = formId.replace("template-", "");
            // console.log('formIdConverted =>',formIdConverted)
            // console.log("convertData =>",convertData)
            formIdConverted && baseParams.append("formId", formIdConverted);
          if (docTypeId){
            // console.log("docTypeId =>", docTypeId);
            // console.log("before append =>", baseParams.toString());
            
            baseParams.append("docTypeId", docTypeId);
            
            // console.log("after append =>", baseParams.toString());
            // console.log("entries =>", [...baseParams.entries()]);

          } 
          baseParams.append("pageCount", finalPageCount.toString());
          // console.log([...baseParams.entries()]);
        } else {
          baseParams.append("pageCount", finalPageCount.toString());
        }

        // 🎯 FIXED: Clear Next.js router cache by refreshing after navigation
        await router.push(`/backend/Mapping?${baseParams.toString()}`);
        router.refresh(); // 🎯 Force refresh to clear router cache
        onClose();

      } catch (error) {
        enqueueSnackbar(`กรุณากรอกข้อมูลให้ครบถ้วน`, { variant: "warning" });
        console.error("❌ Validation failed:", error);
      } finally {
        setLoadingSubmit(false);
      }
    }, 1000);
  };

  const DefineDocsType = () => [
    {
      key: "template",
      label: (
        <div className="flex gap-2">
          <h3 className="font-black text-[#333333]">รวมไฟล์เอกสาร</h3>
        </div>
      ),
      children: (
        <>
          <div>
            <span className="font-[600] text-[16px] text-[#333] mb-3 block">
              อัปโหลดไฟล์ PDF
            </span>
            
            {/* 🎯 Upload Section */}
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 mb-4">
              <Upload.Dragger
                accept="application/pdf"
                beforeUpload={handlePdfFileUpload}
                showUploadList={false}
                multiple
                className="bg-white"
              >
                <p className="ant-upload-drag-icon">
                  <FileOutlined style={{ fontSize: '48px', color: '#0153BD' }} />
                </p>
                <p className="ant-upload-text text-gray-700 font-semibold">
                  คลิกหรือลากไฟล์ PDF มาวางที่นี่
                </p>
                <p className="ant-upload-hint text-gray-500">
                  รองรับไฟล์ PDF เท่านั้น (ไม่เกิน 10MB ต่อไฟล์)
                </p>
              </Upload.Dragger>
            </div>

            {/* 🎯 Uploaded Files List */}
            {uploadedPdfFiles.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-700">
                    ไฟล์ที่เลือก ({uploadedPdfFiles.length} ไฟล์)
                  </span>
                  <AntButton
                    size="small"
                    danger
                    onClick={() => {
                      setUploadedPdfFiles([]);
                      enqueueSnackbar('ลบไฟล์ทั้งหมดสำเร็จ', { 
                        variant: 'info',
                        autoHideDuration: 2000 
                      });
                    }}
                  >
                    ลบทั้งหมด
                  </AntButton>
                </div>

                <List
                  size="small"
                  bordered
                  dataSource={uploadedPdfFiles}
                  className="bg-white"
                  renderItem={(file, index) => (
                    <List.Item
                      className="hover:bg-gray-50 transition-colors"
                      actions={[
                        <AntButton
                          key="delete"
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemovePdfFile(file)}
                        >
                          ลบ
                        </AntButton>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <div className="bg-blue-100 p-2 rounded">
                            <FileOutlined style={{ fontSize: '24px', color: '#0153BD' }} />
                          </div>
                        }
                        title={
                          <span className="text-sm font-medium text-gray-800">
                            {index + 1}. {file.name}
                          </span>
                        }
                        description={
                          <Space size="small" className="text-xs text-gray-500">
                            <span>ขนาด: {(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            <span>•</span>
                            <span>ประเภท: PDF</span>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />

                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Space align="start" size="small">
                    <FileOutlined className="text-blue-600 mt-1" />
                    <div className="text-xs text-blue-700">
                      <strong>หมายเหตุ:</strong> ไฟล์ทั้งหมดจะถูกรวมเป็นเอกสารเดียวตามลำดับที่เลือก เมื่อคุณกดปุ่ม "ยืนยัน"
                    </div>
                  </Space>
                </div>
              </div>
            )}

            {/* 🎯 Empty State */}
            {uploadedPdfFiles.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                ยังไม่มีไฟล์ที่เลือก
              </div>
            )}
          </div>
        </>
      )
    }
  ]

  // 🎯 Cleanup merged PDF URL on unmount
  useEffect(() => {
    return () => {
      if (mergedPdfUrl && mergedPdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(mergedPdfUrl);
      }
    };
  }, [mergedPdfUrl]);

  return (
    <>
      <Modal
        title={
          <div className="text-center text-[#0153BD] text-lg font-semibold">
            ตั้งค่าเอกสารการใช้งาน Use Document
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
              className={`btn-theme ${loadingSubmit || !isValidForm || isMergingPdfs
                ? `opacity-50 pointer-events-none cursor-not-allowed w-35`
                : "w-24"
                }`}
              disabled={loadingSubmit || !isValidForm || isMergingPdfs}
            >
              {loadingSubmit || isMergingPdfs ? (
                <span className="flex items-center justify-center space-x-2">
                  <Spin
                    className="text-white"
                    indicator={<LoadingOutlined spin />}
                    size="small"
                  />
                  <span>{isMergingPdfs ? 'กำลังรวมไฟล์...' : 'กำลังยืนยัน'}</span>
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
        <div className="[&_.ant-collapse-content]:border-t-0">
          {/* 🎯 Show Collapse only in template mode */}
          {/* {isTemplateMode && (
            <Collapse
              className="bg-[#F0F6FF] border-[#F0F6FF] my-4"
              activeKey={activeKeys}
              onChange={(keys) => setActiveKeys(keys as string[])}
              expandIconPosition="end"
              expandIcon={({ isActive }) => (
                <ChevronDown
                  className="bg-theme rounded-full p-1"
                  size={28}
                  color="white"
                  style={{ transform: `rotate(${isActive ? 180 : 0}deg)` }}
                />
              )}
              items={DefineDocsType()}
            />
          )} */}
        </div>
        {/* Existing Form Content */}
        {(() => {
          // const docsType = isTemplateMode
          //   ? (templateDocType === "b2b" ? "B2B" : templateDocType === "b2c" ? "B2C" : B2BformData.forms?.docsType || "B2B")
          //   : (B2BformData.forms?.docsType || "B2B");
          
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
                // onConfirmResetAllMapping={() => setConfirmResetAllMapping(true)}
                open={open}
                pdfPage={currentPageCount || pdfPage} 
                pdfObject={currentPdfUrl || pdfUrl} 
                form={form}
                mode={"document"} // 🎯 Pass mode to FormB2B
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