"use client";

import React, { useState, useRef, useEffect } from "react";
import type { DataType } from "@/store/mockData/mockGroupManagement";
import {
  ChevronRight,
  Pencil,
  Check,
  X,
  Trash,
  CircleCheck,
  Upload,
  EyeIcon,
} from "lucide-react";
import {
  Collapse,
  Input,
  TableColumnsType,
  Button,
  Modal,
  Radio,
  Select,
  Spin,
  Pagination,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import TableComponent from "./table";
import Image from "next/image";
import Link from "next/link";
import {
  BusinessContactType,
  GroupResponseType,
  DocumentTypeResponseType,
  TemplateItemType,
} from "@/store/types/groupType";
import {
  deleteDocumentType,
  getTemplatesByDocumentTypeId,
} from "@/store/backendStore/groupAPI";
import { ConvertDateTime } from "@/store/utils/convertDateTime";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  mockDocumentTemplate,
  DocumentTemplateType,
} from "@/store/mockData/mockDocumentTemplate";
import {
  getAllWorkspace,
  getWorkspaceById,
} from "@/store/backendStore/workspaceAPI";
// getTemplateForms will be called in folderWorkspace/page.tsx instead
import { Workspace, WorkspaceResponseType } from "@/store/types/workSpace";
import { setDocsType,resetB2BForm } from "@/store/documentStore/B2BForm";
import { setSelectedBusiness } from "@/store/slices/businessSlice";
import { resetPdfMerge } from "@/utils/resetPdfMerge";
import { PDFDocument } from "pdf-lib";
import { SettingDocsTemplateModal } from "@/components/mappingComponents/FormComponents/FormB2BDocument/modalSettingDocumentTemplate";
import { useSnackbar } from "notistack";
import PDFLogo from "@/assets/webp/document/pdf.webp";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/modal/modalConfirm";
import { SuccessModal } from "@/components/modal/modalSuccess";
import { ErrorModal } from "@/components/modal/modalError";


type CollapseItemType = GroupResponseType | DocumentTypeResponseType;

interface CollapseComponentProps {
  items: CollapseItemType[];
  onUpdateGroup: (
    id: string,
    oldName: string,
    newName: string,
    businessContact: BusinessContactType[]
  ) => void;
  onDeleteGroup: (id: string) => void;
  // Pagination props
  total?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number, pageSize?: number) => void;
  showSizeChanger?: boolean;
}

const CollapseComponent: React.FC<CollapseComponentProps> = ({
  items,
  onUpdateGroup,
  onDeleteGroup,
  total = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  showSizeChanger = false,
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  // State for editing
  const [editingKey, setEditingKey] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteType, setDeleteType] = useState<"group" | "business">("group");
  const [groupId, setGroupId] = useState<string>("");
  const [selectedKey, setSelectedKey] = useState<React.Key>("");

  // State for Success/Error modals
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // State for PDF upload flow
  const [file, setFile] = useState<File | null>(null);
  const [objectPdf, setObjPdf] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [openModalUploadPdf, setOpenModalUploadPdf] = useState<boolean>(false);
  const [isOpenSettingDocs, setIsOpenSettingDocs] = useState<boolean>(false);
  const [isbizTypeSelected, setIsBizTypeSelected] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [PDFPage, setPDFPage] = useState<number>(0);
  const [selectedValue, setSelectedValue] = useState<string>("B2B");
  const [selectedWorkspaceForUpload, setSelectedWorkspaceForUpload] = useState<
    string
  >("");
  const [workspacesState, setWorkspacesState] = useState<
    WorkspaceResponseType[]
  >([]);
  const [currentDocumentTypeId, setCurrentDocumentTypeId] = useState<
    string
  >("");
  const [currentDocumentTypeName, setCurrentDocumentTypeName] =
    useState<string>("");
  const [isSavingData, setIsSavingData] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Note: Loading state for template forms is handled in folderWorkspace/page.tsx

  // 🎯 State for template pagination per document type
  const [templateData, setTemplateData] = useState<
    Record<
      string,
      {
        templates: DocumentTemplateType[];
        total: number;
        page: number;
        limit: number;
        loading: boolean;
      }
    >
  >({});

  // 🎯 Fetch templates for a specific document type
  const fetchTemplatesForDocType = async (
    documentTypeId: string,
    page: number = 1,
    limit: number = 10
  ) => {
    try {
      // Set loading state
      setTemplateData((prev) => ({
        ...prev,
        [documentTypeId]: {
          ...prev[documentTypeId],
          loading: true,
        },
      }));

      const response = await dispatch(
        getTemplatesByDocumentTypeId({
          documentTypeId,
          params: { page, limit },
        }) as any
      );

      if (response.payload && response.payload.data) {
        const templates: TemplateItemType[] = response.payload.data;
        const total = response.payload.total || templates.length;

        // Transform API data to DocumentTemplateType format
        const transformedTemplates: DocumentTemplateType[] = templates.map(
          (template, index) => ({
            key: template.id || `${index + 1}`,
            documentNo: template.document_no || "-",
            documentName: template.name || "-",
            createDate: template.created_at
              ? ConvertDateTime(template.created_at)
              : "-",
            editDate: template.updated_at
              ? ConvertDateTime(template.updated_at)
              : "-",
            groupId: documentTypeId,
          })
        );

        setTemplateData((prev) => ({
          ...prev,
          [documentTypeId]: {
            templates: transformedTemplates,
            total,
            page,
            limit,
            loading: false,
          },
        }));
      } else {
        // No data, set empty state
        setTemplateData((prev) => ({
          ...prev,
          [documentTypeId]: {
            templates: [],
            total: 0,
            page,
            limit,
            loading: false,
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      setTemplateData((prev) => ({
        ...prev,
        [documentTypeId]: {
          templates: [],
          total: 0,
          page,
          limit,
          loading: false,
        },
      }));
    }
  };

  // 🎯 Handle pagination change for a specific table
  const handleTemplatePaginationChange = (
    documentTypeId: string,
    page: number,
    pageSize: number
  ) => {
    fetchTemplatesForDocType(documentTypeId, page, pageSize);
  };

  // 🎯 Handle Collapse onChange - เรียก API เฉพาะเมื่อ panel ถูก expand
  const handleCollapseChange = (activeKeys: string | string[]) => {
    const keys = Array.isArray(activeKeys) ? activeKeys : [activeKeys];

    // สำหรับแต่ละ key ที่ถูก expand
    keys.forEach((key) => {
      // หา item ที่ตรงกับ key
      const item = items.find((item) => item._id === key);

      if (item && item._id) {
        // เรียก API เฉพาะเมื่อยังไม่มีข้อมูล หรือข้อมูลว่าง
        const existingData = templateData[item._id];
        if (!existingData || existingData.templates.length === 0) {
          fetchTemplatesForDocType(item._id);
        }
      }
    });
  };

  const startEditing = (key: string, currentLabel: string) => {
    setEditingKey(key);
    setInputValue(currentLabel.replace("กลุ่ม : ", "")); // Remove prefix
  };

  const saveLabel = (key: string) => {
    if (inputValue.trim()) {
      const item = items.find((item) => item?._id === key);
      if (!item) return;
      const businessContact =
        "business_contact" in item ? item.business_contact || [] : [];
      onUpdateGroup(key, item?.name || "", inputValue, businessContact);
    }
    setEditingKey("");
  };

  const panelStyle: React.CSSProperties = {
    marginBottom: 24,
    background: "#FAFAFA",
    borderRadius: "12px",
    border: "none",
  };

  const handleDelete = (
    key: React.Key,
    type: "group" | "business",
    groupId?: string
  ) => {
    // 🎯 key is item._id from groupList (DocumentTypeResponseType._id from getDocumentTypes API)
    
    // ตรวจสอบว่าเป็นการลบ group และมี business contact หรือ template หรือไม่
    if (type === "group") {
      const item = items.find((item) => item._id === key);
      
      if (item) {
        const businessContact =
          "business_contact" in item ? item.business_contact || [] : [];
        const templateCount = item.template_count ?? 0;
        
        // ตรวจสอบว่ามี business contact หรือไม่
        if (businessContact.length > 0) {
          setErrorMessage(
            `ไม่สามารถลบประเภทเอกสารนี้ได้ เนื่องจากมีคู่สัญญา ${businessContact.length} รายการ กรุณาลบคู่สัญญาทั้งหมดก่อนดำเนินการลบ`
          );
          setErrorModalVisible(true);
          return;
        }
        
        // ตรวจสอบว่ามี template หรือไม่
        if (templateCount > 0) {
          setErrorMessage(
            `ไม่สามารถลบประเภทเอกสารนี้ได้ เนื่องจากมีเอกสาร ${templateCount} รายการ กรุณาลบเอกสารทั้งหมดก่อนดำเนินการลบ`
          );
          setErrorModalVisible(true);
          return;
        }
      }
    }
    
    setDeleteType(type);
    setSelectedKey(key);
    setDeleteModalVisible(true);
    if (type === "business" && groupId) {
      setGroupId(groupId);
    }
  };

  // 🎯 confirmDelete - เรียกโดยตรงจาก ConfirmModal
  const confirmDelete = async (): Promise<void> => {
    if (!selectedKey) {
      setErrorMessage("ไม่พบข้อมูลที่ต้องการลบ");
      setErrorModalVisible(true);
      setDeleteModalVisible(false);
      return;
    }

    if (deleteType === "group") {
      // 🎯 Use deleteDocumentType API with _id from groupList (DocumentTypeResponseType._id)
      // selectedKey is item._id from getDocumentTypes API response
      const documentTypeId = selectedKey.toString();
      try {
        const response = await dispatch(
          deleteDocumentType(documentTypeId) as any
        );

        // Check if request was rejected (error case)
        if (response.type?.endsWith("/rejected")) {
          const errorMsg =
            response.payload?.message || "ไม่สามารถลบประเภทเอกสารได้";
          setErrorMessage(errorMsg);
          setErrorModalVisible(true);
          setDeleteModalVisible(false);
          return;
        }

        // Check response payload structure
        const payload = response.payload;

        // If payload has status field, check it
        if (payload && typeof payload === "object") {
          // If status is explicitly false or a number (error status code), it's an error
          if (
            payload.status === false ||
            (typeof payload.status === "number" && payload.status >= 400)
          ) {
            const errorMsg = payload.message || "ไม่สามารถลบประเภทเอกสารได้";
            setErrorMessage(errorMsg);
            setErrorModalVisible(true);
            setDeleteModalVisible(false);
            return;
          }

          // If status is true or undefined (but payload exists), consider it success
          if (payload.status === true || (payload.status !== false && payload.status !== null)) {
            // Remove template data from state
            setTemplateData((prev) => {
              const newData = { ...prev };
              delete newData[documentTypeId];
              return newData;
            });

            // Call onDeleteGroup callback for parent component to refresh list
            onDeleteGroup(selectedKey.toString());

            // Close confirm modal and show success modal
            setDeleteModalVisible(false);
            setSelectedKey("");
            setSuccessModalVisible(true);
            return;
          }
        }

        // If payload exists but no status field, assume success (some APIs don't return status)
        if (payload) {
          // Remove template data from state
          setTemplateData((prev) => {
            const newData = { ...prev };
            delete newData[documentTypeId];
            return newData;
          });

          // Call onDeleteGroup callback for parent component to refresh list
          onDeleteGroup(selectedKey.toString());

          // Close confirm modal and show success modal
          setDeleteModalVisible(false);
          setSelectedKey("");
          setSuccessModalVisible(true);
          return;
        }

        // Unexpected response structure
        setErrorMessage(
          "ไม่สามารถลบประเภทเอกสารได้ เนื่องจากข้อมูลตอบกลับไม่ถูกต้อง"
        );
        setErrorModalVisible(true);
        setDeleteModalVisible(false);
      } catch (error) {
        console.error("Error deleting document type:", error);
        setErrorMessage("เกิดข้อผิดพลาดในการลบประเภทเอกสาร");
        setErrorModalVisible(true);
        setDeleteModalVisible(false);
      }
    } else {
      // Delete business contact
      const group = items.find((item) => item._id === groupId) as
        | GroupResponseType
        | undefined;
      if (group && "business_contact" in group && group.business_contact) {
        const businessContact = group.business_contact.filter(
          (item) => item.index !== Number(selectedKey) - 1
        );
        // adjust the index of the business contact
        const adjustedBusinessContact = businessContact.map((item, index) => ({
          ...item,
          index: index,
        }));
        try {
          onUpdateGroup(
            groupId,
            group.name || "",
            group.name || "",
            adjustedBusinessContact
          );
          // Close confirm modal and show success modal
          setDeleteModalVisible(false);
          setSelectedKey("");
          setSuccessModalVisible(true);
        } catch (error) {
          console.error("Error updating group:", error);
          setErrorMessage("ไม่สามารถลบข้อมูลได้");
          setErrorModalVisible(true);
          setDeleteModalVisible(false);
        }
      } else {
        setErrorMessage("ไม่พบข้อมูลที่ต้องการลบ");
        setErrorModalVisible(true);
        setDeleteModalVisible(false);
      }
    }
  };

  // PDF Upload Functions
  const handleUploadClick = async (
    documentTypeId: string,
    documentTypeName: string
  ) => {
    setCurrentDocumentTypeId(documentTypeId);
    setCurrentDocumentTypeName(documentTypeName);
    dispatch(resetB2BForm())
    // Fetch workspaces for this document type
    try {
      const response = await dispatch(getAllWorkspace(documentTypeId) as any);
      if (response.payload && response.payload.data) {
        setWorkspacesState(response.payload.data);
        // Auto-select if only one workspace
        if (response.payload.data.length === 1) {
          setSelectedWorkspaceForUpload(response.payload.data[0]._id);
        }
        // If no workspaces, still allow upload for demo purposes
        // setWorkspacesState will be empty array, which is fine
      }
    } catch (error) {
      // Ignore error for demo purposes - allow upload to proceed
      setWorkspacesState([]);
    }

    // Trigger file input
    fileInputRef.current?.click();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      // Allow upload even if no workspaces for demo purposes
      // Workspace selection will be handled in the modal

      resetPdfMerge();

      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      setPDFPage(pageCount);
      setUploading(true);
      setFile(selectedFile);
      const fileURL = URL.createObjectURL(selectedFile);

      if (workspacesState.length === 1) {
        setSelectedWorkspaceForUpload(workspacesState[0]._id);
      }

      setSelectedValue("B2B");
      setOpenModalUploadPdf(true);
      setUploading(false);
      setObjPdf(fileURL);
    }
    if (e.target) {
      e.target.value = "";
    }
  };

  const handleCloseModalUploadPDF = () => {
    setOpenModalUploadPdf(false);
    setIsDisabled(false);
    setUploading(false);
    setFile(null);
    setSelectedWorkspaceForUpload("");
    setWorkspacesState([]);
    resetPdfMerge();
  };

  const closeModalSelectTypeContract = () => {
    setIsBizTypeSelected(false);
    setFile(null);
  };

  const checkBizType = async () => {
    if (!selectedValue) {
      enqueueSnackbar("กรุณาเลือกรูปแบบเอกสาร (B2B หรือ B2C)", {
        variant: "warning",
        autoHideDuration: 3000,
      });
      return;
    }

    dispatch(setDocsType(selectedValue));

    // For demo purposes: allow proceeding even without workspace
    // Workspace and business_id will be handled from getEstampDetails in page.tsx
    if (selectedWorkspaceForUpload) {
      const selectedWS = workspacesState.find(
        (ws) => ws._id === selectedWorkspaceForUpload
      );

      if (selectedWS) {
        try {
          const wsResponse = await dispatch(
            getWorkspaceById(selectedWorkspaceForUpload) as any
          );
          const workspaceDetail = wsResponse.payload.data as Workspace;

          if (workspaceDetail && workspaceDetail.business_id) {
            dispatch(
              setSelectedBusiness({
                businessId: workspaceDetail.business_id,
                businessName: selectedWS.name,
              })
            );
          }
        } catch (error) {
          // Ignore error for demo purposes
          console.error("Error fetching workspace:", error);
        }
      }
    }

    // Proceed to Setting Docs Modal regardless of workspace status
    setIsOpenSettingDocs(true);
    setIsBizTypeSelected(false);
    setOpenModalUploadPdf(false);
    setUploading(false);
    setIsDisabled(false);
  };

  // 🎯 Handler for navigating to folderWorkspace (API will be called in folderWorkspace/page.tsx)
  const handleGetTemplateForms = (
    templateId: string,
    documentTypeId: string,
    documentTypeName: string
  ) => {
    // Navigate to folderWorkspace with query parameters (similar to Link)
    // API getTemplateForms() will be called in folderWorkspace/page.tsx when templateId is detected
    const queryParams = new URLSearchParams({
      groupId: documentTypeId,
      groupName: encodeURIComponent(documentTypeName),
      _id: templateId, // Send template ID (_id) to the page
    }).toString();

    router.push(`/backend/folderWorkspace?${queryParams}`);
  };

  const columns: TableColumnsType<DocumentTemplateType> = [
    {
      title: "ลำดับ",
      dataIndex: "key",
      sorter: (a, b) => Number(a.key) - Number(b.key),
      render: (text: string, record: DocumentTemplateType, index?: number) => {
        const actualIndex = (index || 0) + 1;
        return <span>{actualIndex}</span>;
      },
    },
    {
      title: "เลขที่เอกสาร",
      dataIndex: "documentNo",
      sorter: (a, b) => a.documentNo.localeCompare(b.documentNo),
    },
    {
      title: "ชื่อเอกสาร",
      dataIndex: "documentName",
      sorter: (a, b) => a.documentName.localeCompare(b.documentName),
    },
    {
      title: "วันที่สร้าง",
      dataIndex: "createDate",
      sorter: (a, b) =>
        new Date(a.createDate).getTime() - new Date(b.createDate).getTime(),
    },
    {
      title: "วันที่แก้ไข",
      dataIndex: "editDate",
      sorter: (a, b) =>
        new Date(a.editDate).getTime() - new Date(b.editDate).getTime(),
    },
    {
      title: "จัดการ",
      render: (_, record) => {
        const currentItem = items.find((item) => item._id === record.groupId);
        const templateId = record.key?.toString() || "";
        const documentTypeId = record.groupId || "";
        const documentTypeName = currentItem?.name || "";

        return (
          <div className="flex gap-2">
            {/* <Link
              href={`/backend/folderWorkspace?groupId=${
                record.groupId || ""
              }&groupName=${encodeURIComponent(currentItem?.name || "")}`}
              className="text-theme cursor-pointer"
            >
              <EyeIcon size={16} color="#0153BD" />
            </Link> */}
            <Button
              type="text"
              title="ดูฟอร์ม"
              onClick={() =>
                handleGetTemplateForms(
                  templateId,
                  documentTypeId,
                  documentTypeName
                )
              }
              disabled={!templateId}
              className="border border-[#FAFAFA] rounded-xl p-2"
            >
              <EyeIcon size={16} color="#0153BD" />
            </Button>
            {/* <Button
              type="text"
              title="ลบรายการนี้"
              onClick={() =>
                handleDelete(record.key, "business", record.groupId)
              }
              className="border border-[#FAFAFA] rounded-xl p-2"
            >
              <Trash size={18} color="#0153BD" />
            </Button> */}
          </div>
        );
      },
    },
  ];

  return (
    <>
      {/* 🎯 Confirm Delete Modal - เรียก confirmDelete โดยตรง */}
      <ConfirmModal
        titleName="ยืนยันการลบ"
        message="คุณต้องการลบรายการนี้ใช่หรือไม่?"
        open={deleteModalVisible}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedKey("");
        }}
      />

      {/* 🎯 Success Modal */}
      <SuccessModal
        titleName="สำเร็จ"
        message="ลบประเภทเอกสารสำเร็จ"
        open={successModalVisible}
        onClose={() => {
          setSuccessModalVisible(false);
        }}
      />

      {/* 🎯 Error Modal */}
      <ErrorModal
        titleName="บันทึกไม่สำเร็จ"
        message={
          errorMessage ||
          "ไม่สามารถลบประเภทเอกสารได้ เนื่องจากมีในระบบแล้วกรุณาตรวจสอบอีกครั้ง เพื่อดำเนินการต่อ"
        }
        open={errorModalVisible}
        onClose={() => {
          setErrorModalVisible(false);
        }}
      />

      <Collapse
        accordion
        bordered={false}
        expandIcon={({ isActive }) => (
          <ChevronRight
            className="bg-theme rounded-full p-1"
            size={28}
            color="white"
            style={{
              transform: `rotate(${isActive ? 90 : 0}deg)`,
            }}
          />
        )}
        onChange={handleCollapseChange}
        style={{ background: "transparent" }}
        items={items?.map((item) => {
          const businessContact =
            "business_contact" in item ? item.business_contact || [] : [];
          const isDocumentType = "form_estamp" in item;
          const formEstampName =
            isDocumentType && item.form_estamp ? item.form_estamp.name : "";
          const itemCount = item.template_count ?? 0;
          // 🎯 Get template data for this document type
          const docTypeData = templateData[item._id] || {
            templates: [],
            total: 0,
            page: 1,
            limit: 10,
            loading: false,
          };

          return {
            key: item._id,
            label: (
              <div className="flex justify-between items-center flex-wrap gap-3">
                {editingKey === item?._id ? (
                  <div className="flex items-center flex-wrap gap-3">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onPressEnter={() => saveLabel(item?._id)}
                      autoFocus
                      size="small"
                      className="lg:w-40 w-auto flex-1"
                    />
                    <button
                      onClick={() => saveLabel(item?._id)}
                      className="bg-green-600 hover:bg-green-500 transition-all p-1 rounded"
                    >
                      <Check color="white" size={12} />
                    </button>
                    <button
                      onClick={() => setEditingKey("")}
                      className="bg-red-600 hover:bg-red-500 transition-all p-1 rounded"
                    >
                      <X color="white" size={12} />
                    </button>
                    {businessContact.length > 0 && (
                      <div className="flex items-center gap-2 lg:hidden">
                        <p className="text-[#FDB131] px-2 bg-white rounded-full border font-medium text-sm">{`${businessContact.length} รายการ`}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <p>
                        <span className="text-theme font-bold">
                          {item?.name}
                        </span>
                        {formEstampName && (
                          <span className="text-gray-600">
                            {" "}
                            ({formEstampName})
                          </span>
                        )}

                        <span className="rounded-lg bg-[#FFFFFF] ml-[8px] py-1 px-2 text-[#FDB131] shadow-[0px_0px_2px_0px_rgba(253,177,49,0.12)]">
                          {itemCount} รายการ
                        </span>
                      </p>
                      {/* <button
                        onClick={() => startEditing(item?._id, item?.name)}
                        className="p-1 rounded border"
                      >
                        <Pencil size={16} />
                      </button> */}
                    </div>
                    {businessContact.length > 0 && (
                      <div className="flex items-center gap-2 lg:hidden">
                        <p className="text-[#FDB131] px-2 bg-white rounded-full border font-medium text-sm">{`${businessContact.length} รายการ`}</p>
                      </div>
                    )}
                  </div>
                )}
                <div className="lg:flex hidden gap-4">
                  <button
                    className="text-theme border-b border-theme font-medium"
                    onClick={() => {
                      if (item) {
                        handleUploadClick(item._id, item.name);
                      }
                    }}
                  >
                    อัปโหลด PDF
                  </button>
                  <button
                    className="text-theme border-b border-theme font-medium"
                    onClick={() => {
                      // 🎯 item._id is from groupList (DocumentTypeResponseType._id from getDocumentTypes API)
                      if (item?._id) {
                        handleDelete(item._id, "group");
                      }
                    }}
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ),
            children: (
              <div>
                <TableComponent
                  columns={columns}
                  dataSource={docTypeData.templates}
                  loading={docTypeData.loading}
                  pagination={{
                    current: docTypeData.page,
                    pageSize: docTypeData.limit,
                    total: docTypeData.total,
                    showSizeChanger: true,
                    onChange: (page, pageSize) => {
                      handleTemplatePaginationChange(item._id, page, pageSize);
                    },
                  }}
                />
              </div>
            ),
            style: panelStyle,
          };
        })}
      />

      {/* 🎯 Pagination Component */}
      {total > 0 && onPageChange && (
        <div className="grid justify-items-stretch mt-6">
          <div className="justify-self-end">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={total}
              onChange={onPageChange}
              // showSizeChanger={showSizeChanger}
              // pageSizeOptions={["10", "20", "50", "100"]}
              showTotal={(total: number, range: [number, number]) =>
                `${range[0]}-${range[1]} จาก ${total} รายการ`
              }
            />
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        onChange={handleUpload}
        disabled={uploading}
      />

      {/* 🎯 Modal อัปโหลด PDF */}
      <Modal
        title={
          <span className="flex justify-center text-xl font-[800] text-[#0153BD]">
            อัปโหลด PDF
          </span>
        }
        centered
        open={openModalUploadPdf}
        onCancel={handleCloseModalUploadPDF}
        footer={[]}
        maskClosable={false}
        styles={{
          content: { borderRadius: "24px" },
        }}
      >
        <div className="flex justify-between items-center my-[24px] border-[1px] p-[16px] border-[#E6E6E6] bg-[#FAFCFF] rounded-xl">
          <div className="flex items-center space-x-2">
            <Image src={PDFLogo} height={40} width={40} alt="Pdf Logo" />
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-[500] text-[#333333]">
                {file?.name}
              </span>
              <span className="text-xs font-[500] text-[#989898]">
                {file?.size ? (file.size / 1048576).toFixed(2) : "0"} MB
              </span>
            </div>
          </div>
          <div>
            <CircleCheck className="text-[#30AB4E]" />
          </div>
        </div>

        {/* 🎯 Dropdown เลือกประเภทเอกสาร (Workspace) */}
        {workspacesState.length > 1 && (
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">
              เลือกประเภทเอกสาร <span className="text-red-500">*</span>
            </label>
            <Select
              placeholder="เลือกประเภทเอกสาร"
              value={selectedWorkspaceForUpload}
              onChange={(value) => setSelectedWorkspaceForUpload(value)}
              className="w-full"
              size="large"
              status={!selectedWorkspaceForUpload ? "warning" : ""}
              options={workspacesState.map((ws) => ({
                value: ws._id,
                label: ws.name,
              }))}
            />
            {!selectedWorkspaceForUpload && (
              <p className="text-xs text-orange-500 mt-1">
                กรุณาเลือกประเภทเอกสารก่อนดำเนินการต่อ
              </p>
            )}
          </div>
        )}

        {/* แสดงประเภทเอกสารที่เลือกอัตโนมัติ ถ้ามีแค่ 1 */}
        {workspacesState.length === 1 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              <span className="font-medium">ประเภทเอกสาร:</span>{" "}
              <span className="text-theme font-semibold">
                {currentDocumentTypeName}
              </span>
            </p>
          </div>
        )}

        <div className="flex justify-center w-full my-[16px] space-x-4">
          <button
            onClick={handleCloseModalUploadPDF}
            className="w-24 text-theme btn py-4 hover:bg-[#E6E6E6]"
          >
            ยกเลิก
          </button>
          <button
            onClick={() => {
              // Allow proceeding even without workspace for demo purposes
              // Workspace will be handled from getEstampDetails in page.tsx
              setIsBizTypeSelected(true);
              setOpenModalUploadPdf(false);
              setUploading(false);
              setIsDisabled(false);
            }}
            className="btn-theme w-24"
          >
            ยืนยัน
          </button>
        </div>
      </Modal>

      {/* 🎯 Modal เลือกรูปแบบเอกสาร (B2B/B2C) */}
      <Modal
        title={
          <span className="flex justify-center text-xl font-[800] text-[#0153BD]">
            เลือกรูปแบบเอกสาร
          </span>
        }
        open={isbizTypeSelected}
        width={400}
        centered
        onCancel={closeModalSelectTypeContract}
        footer={[]}
        maskClosable={false}
        styles={{
          content: { borderRadius: "24px" },
        }}
      >
        <div className="flex flex-col justify-center items-center">
          <Radio.Group
            className="my-4"
            style={{ display: "flex" }}
            value={selectedValue}
            onChange={(e) => {
              setSelectedValue(e.target.value);
              dispatch(setDocsType(e.target.value));
            }}
          >
            <Radio value="B2C" style={{ marginRight: "60px" }}>
              B2C
            </Radio>
            <Radio value="B2B" style={{ marginLeft: "10px" }}>
              B2B
            </Radio>
          </Radio.Group>
          <div className="flex justify-center w-full my-[16px] space-x-4">
            <button
              onClick={closeModalSelectTypeContract}
              className="w-24 text-theme btn py-4 hover:bg-[#E6E6E6]"
            >
              ยกเลิก
            </button>
            <button onClick={checkBizType} className="btn-theme w-24">
              ยืนยัน
            </button>
          </div>
        </div>
      </Modal>

      {/* 🎯 Loading Overlay */}
      {isSavingData && (
        <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-90 z-[9999]">
          <div className="flex flex-col items-center">
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            />
            <span className="text-gray-700 mt-3 text-lg font-bold">
              กำลังบันทึกข้อมูล...
            </span>
          </div>
        </div>
      )}

      {/* 🎯 Setting Docs Template Modal */}
      <SettingDocsTemplateModal
        open={isOpenSettingDocs}
        pdfName={file ? file.name : ""}
        pdfUrl={objectPdf}
        pdfPage={PDFPage}
        docTypeId={currentDocumentTypeId || ""}
        workspaceId={selectedWorkspaceForUpload || ""}
        onClose={() => {
          setIsOpenSettingDocs(false);
          handleCloseModalUploadPDF();
        }}
        isSave={() => {
          // Clean up states - navigation will be handled by SettingDocsTemplateModal
          setIsOpenSettingDocs(false);
          handleCloseModalUploadPDF();
        }}
      />
    </>
  );
};

export default CollapseComponent;
