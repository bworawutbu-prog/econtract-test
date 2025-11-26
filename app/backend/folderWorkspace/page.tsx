/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import {
  WorkspaceDataType,
  workspaceData,
  AccessRights,
  mockWorkspaceData,
} from "@/store/mockData/mockWorkSpace";
import React, { useState, useEffect } from "react";
import { Button, Dropdown, Input, Modal, Radio, Tag, Spin, Select, Switch } from "antd";
import {
  EllipsisVertical,
  Folder,
  Info,
  Edit,
  Trash,
  FolderPlus,
  FilePlus,
  Lock,
  Plus,
  CircleCheck,
} from "lucide-react";
import TableComponent from "@/components/ui/table";
import SearchInput from "@/components/ui/searchInput";
import type { TableColumnsType } from "antd";
import { useSnackbar } from "notistack";
import { useSearchParams, useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import type { MenuProps } from "antd";
import ModalComponent from "@/components/modal/modal";
import { useAppSelector } from "@/store/hooks";
import { AuthState } from "@/store/slices/authSlice";
import { RootState, useAppDispatch } from "@/store";
import { mockCompany } from "@/store/mockData/mockCompany";
import CreateWorkspaceModal from "@/app/backend/folderWorkspace/CreateWorkspaceModal";
import AccessRightsModal from "@/app/backend/folderWorkspace/AccessRightsModal";
import { SuccessModal } from "@/components/modal/modalSuccess";
// import 

import {
  getAllWorkspace,
  createWorkspace as createWorkspaceThunk,
  deleteWorkspace,
  updateWorkspace,
  getWorkspaceById,
} from "@/store/backendStore/workspaceAPI";
import { getDocumentTypes, } from "@/store/backendStore/groupAPI";
import { updateStatusTemplate, deleteTemplateFromId } from "@/store/backendStore/templateAPI";
import { DocumentTypeResponseType } from "@/store/types/groupType";
import { getTemplateForms, getTemplateFormById, TemplateFormItem } from "@/store/backendStore/templateAPI";
import {
  Workspace,
  WorkspaceCreateType,
  WorkspaceResponseType,
} from "@/store/types/workSpace";
import { ConvertDateTime } from "@/store/utils/convertDateTime";
import Image from "next/image";
import PDFLogo from "@/assets/webp/document/pdf.webp";
import { PDFDocument } from "pdf-lib";
import { resetPdfMerge } from "@/utils/resetPdfMerge";
import { setDocsType, addSubmittedForm, setApprovers } from "@/store/documentStore/B2BForm";
import { SettingDocsModal } from "@/components/mappingComponents/FormComponents/FormB2BDocument/modalSettingDocument";
import { LoadingOutlined } from "@ant-design/icons";
import { setSelectedBusiness } from "@/store/slices/businessSlice";
import { setTypeDocNo } from "@/store/slices/mappingSlice";
import { mockDocumentTemplate, DocumentTemplateType } from "@/store/mockData/mockDocumentTemplate";
import { ConfirmModal } from "@/components/modal/modalConfirm";
import { CantDeleteModal } from "@/components/modal/modalCantDelete"

// import Img_password_confrim from "@/assets/webp/img_password_confrim.webp"
import Img_Confrim_Delete_Template from "@/assets/webp/template/Docs1.webp"
import Img_Open_template from "@/assets/webp/template/template_on.webp"
import Img_Close_template from "@/assets/webp/template/templaet_off.webp"
import Img_Cant_Delete from "@/assets/webp/template/CantDelete.webp"


export default function WorkSpace() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const groupId = searchParams.get("groupId");
  const groupNameFromQuery = searchParams.get("groupName");
  const [groupName, setGroupName] = useState<string>(
    groupNameFromQuery ? decodeURIComponent(groupNameFromQuery) : "ไม่มีชื่อกลุ่ม"
  );
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<WorkspaceResponseType | null>(null);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string>("");
  const [nameError, setNameError] = useState<string>("");

  // state สำหรับ modal สิทธิ์การเข้าถึง
  const [isAccessRightsModalOpen, setIsAccessRightsModalOpen] = useState(false);

  // 🎯 State สำหรับการอัปโหลดไฟล์ PDF
  const [file, setFile] = useState<File | null>(null);
  const [objectPdf, setObjPdf] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [openModalUploadPdf, setOpenModalUploadPdf] = useState<boolean>(false);
  const [isOpenSettingDocs, setIsOpenSettingDocs] = useState<boolean>(false);
  const [isbizTypeSelected, setIsBizTypeSelected] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [PDFPage, setPDFPage] = useState<number>(0);
  const [selectedValue, setSelectedValue] = useState<string>("B2B");
  const [isSavingData, setIsSavingData] = useState<boolean>(false);
  const [selectedWorkspaceForUpload, setSelectedWorkspaceForUpload] = useState<string>("");
  const [isOpenSelectWorkspace, setIsOpenSelectWorkspace] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingFormId, setViewingFormId] = useState<string>("");
  
  // 🎯 State for template forms from API
  const templateId = searchParams.get("_id");
  const [templateForms, setTemplateForms] = useState<TemplateFormItem[]>([]);
  const [templateFormsLoading, setTemplateFormsLoading] = useState<boolean>(false);
  const [templateFormsTotal, setTemplateFormsTotal] = useState<number>(0);
  const [templateFormsCount, setTemplateFormsCount] = useState<number>(0);
  const [prevTemplateId, setPrevTemplateId] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isConfirmOpenTemplate, setIsConfirmOpenTemplate] = useState<boolean>(false);
  const [deletedId, setDeletedId] = useState<string>("");
  const [openTemplateId, setOpenTemplateId] = useState<string>("");
  const [templateStatus, setTemplateStatus] = useState<boolean>(false);
  const [isCantDelete, setIsCantDelete] = useState<boolean>(false);
  const [successModalVisible, setSuccessModalVisible] = useState<boolean>(false);

  // const [accessRightsData, setAccessRightsData] = useState<{
  //   workspaceId: React.Key;
  //   workspaceName: string;
  //   accessType: string;
  //   accessRights: AccessRights;
  // } | null>(null);

  // กำหนด workspacesState เพื่อป้องกันชื่อซ้ำกับ imported workspaceData
  const [workspacesState, setWorkspacesState] = useState<
    WorkspaceResponseType[]
  >([]);

  const { user } = useAppSelector(
    (state: RootState) => state.auth as unknown as AuthState
  );

  // Store selected departments for department selector
  const [selectorSelectedDepts, setSelectorSelectedDepts] = useState<{
    [company: string]: string[];
  }>({});

  // 🎯 ฟังก์ชันสำหรับการอัปโหลดไฟล์ PDF
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = (e.target.files && e.target.files[0]) || null;
    if (selectedFile && selectedFile.type === "application/pdf") {
      // ตรวจสอบว่ามี workspace หรือไม่
      if (workspacesState.length === 0) {
        enqueueSnackbar("ไม่พบประเภทเอกสาร กรุณาสร้างประเภทเอกสารก่อน", {
          variant: "warning",
          autoHideDuration: 3000,
        });
        return;
      }

      // Reset merge PDF data เมื่อ upload ไฟล์ใหม่
      resetPdfMerge();

      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      setPDFPage(pageCount);
      setUploading(true);
      setFile(selectedFile);
      const fileURL = URL.createObjectURL(selectedFile);
      
      // ถ้ามี workspace เดียว ใช้เลย ไม่ต้องเลือก
      if (workspacesState.length === 1) {
        setSelectedWorkspaceForUpload(workspacesState[0]._id);
      }
      
      // Reset selectedValue to default B2B
      setSelectedValue("B2B");
      
      setOpenModalUploadPdf(true);
      setUploading(false);
      setObjPdf(fileURL);
    } else {
      return;
    }
    e.target.value = "";
  };

  const handleCloseModalUploadPDF = () => {
    setOpenModalUploadPdf(false);
    setIsDisabled(false);
    setUploading(false);
    setFile(null);
    setSelectedWorkspaceForUpload("");
    resetPdfMerge();
  };

  const closeModalSelectTypeContract = () => {
    setIsBizTypeSelected(false);
    setFile(null);
  };

  const checkBizType = async () => {
    // ตรวจสอบว่าเลือก workspace แล้วหรือยัง
    if (!selectedWorkspaceForUpload) {
      enqueueSnackbar("กรุณาเลือกประเภทเอกสาร", {
        variant: "warning",
        autoHideDuration: 3000,
      });
      return;
    }

    // ตรวจสอบว่าเลือก B2B/B2C แล้วหรือยัง
    if (!selectedValue) {
      enqueueSnackbar("กรุณาเลือกรูปแบบเอกสาร (B2B หรือ B2C)", {
        variant: "warning",
        autoHideDuration: 3000,
      });
      return;
    }

    // 🎯 Dispatch setDocsType ก่อนเปิด SettingDocsModal เหมือนกับ uploadPdf/page.tsx
    dispatch(setDocsType(selectedValue));

    // หา workspace ที่เลือก
    const selectedWS = workspacesState.find(ws => ws._id === selectedWorkspaceForUpload);
    
    if (!selectedWS) {
      enqueueSnackbar("ไม่พบข้อมูลประเภทเอกสารที่เลือก", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    // ดึงข้อมูล workspace แบบเต็มเพื่อเอา business_id
    try {
      const wsResponse = await dispatch(getWorkspaceById(selectedWorkspaceForUpload) as any);
      const workspaceDetail = wsResponse.payload.data as Workspace;
      
      if (workspaceDetail && workspaceDetail.business_id) {
        // Set business_id ใน Redux state
        dispatch(setSelectedBusiness({
          businessId: workspaceDetail.business_id,
          businessName: selectedWS.name
        }));

        // Set document type ถ้ามี (อาจจะเก็บใน workspace metadata)
        // dispatch(setTypeDocNo(workspaceDetail.document_type_id));
        
        setIsOpenSettingDocs(true);
        setIsBizTypeSelected(false);
        setOpenModalUploadPdf(false);
        setUploading(false);
        setIsDisabled(false);
      } else {
        enqueueSnackbar("ไม่พบข้อมูล Business ID ของประเภทเอกสารนี้", {
          variant: "error",
          autoHideDuration: 3000,
        });
      }
    } catch (error) {
      enqueueSnackbar(`เกิดข้อผิดพลาดในการโหลดข้อมูล: ${error}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  // 🎯 Fetch groupName from API using getDocumentTypes (like getGroupList in /backend/page.tsx)
  const fetchGroupName = async () => {
    if (!groupId) return;

    try {
      const response = await dispatch(getDocumentTypes({}) as any);
      if (response.payload) {
        const data = response.payload.data || response.payload;
        if (Array.isArray(data)) {
          const documentType = data.find(
            (item: DocumentTypeResponseType) => item._id === groupId
          );
          if (documentType && documentType.name) {
            setGroupName(documentType.name);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching group name:", error);
      // Keep the groupName from query parameter if API fails
    }
  };

  // 🎯 Fetch template forms from API getTemplateForms
  const fetchTemplateForms = async (templateIdParam: string) => {
    if (!templateIdParam) {
      setTemplateForms([]);
      setTemplateFormsTotal(0);
      setTemplateFormsCount(0);
      return;
    }

    setTemplateFormsLoading(true);
    try {
      const response = await dispatch(getTemplateForms(templateIdParam) as any);
      
      if (response.payload && response.payload.status) {
        const forms = response.payload.data || [];
        const total = response.payload.total || 0;
        const count = response.payload.count || 0;
        
        setTemplateForms(forms);
        setTemplateFormsTotal(total);
        setTemplateFormsCount(count);
      } else {
        enqueueSnackbar(
          (response.payload && response.payload.message) || "ไม่สามารถดึงข้อมูลฟอร์มได้",
          {
            variant: "error",
            autoHideDuration: 3000,
          }
        );
        setTemplateForms([]);
        setTemplateFormsTotal(0);
        setTemplateFormsCount(0);
      }
    } catch (error) {
      console.error("Error fetching template forms:", error);
      enqueueSnackbar("เกิดข้อผิดพลาดในการดึงข้อมูลฟอร์ม", {
        variant: "error",
        autoHideDuration: 3000,
      });
      setTemplateForms([]);
      setTemplateFormsTotal(0);
      setTemplateFormsCount(0);
    } finally {
      setTemplateFormsLoading(false);
    }
  };

  const fetchData = async () => {
    if (groupId) {
      setLoading(true);
      try {
        const response = await dispatch(getAllWorkspace(groupId) as any);
        setWorkspacesState(response.payload.data);
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error && err.message;
        enqueueSnackbar(`เกิดข้อผิดพลาดในการโหลดข้อมูล: ${errorMessage}`, {
          variant: "error",
          autoHideDuration: 3000,
        });
        setLoading(false);
      }
    }
  };

  const CreateWorkspaceAPI = async (workspace: WorkspaceCreateType) => {
    try {
      const response = await dispatch(createWorkspaceThunk(workspace) as any);
      return response;
    } catch (err) {
      enqueueSnackbar(`Error in createWorkspace: ${err}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
      return false;
    }
  };

  const UpdateWorkspaceAPI = async (workspace: Workspace) => {
    try {
      const response = await dispatch(updateWorkspace(workspace) as any);
      return response;
    } catch (err) {
      enqueueSnackbar(`Error in updateWorkspace: ${err}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
      return false;
    }
  };

  const handleConfirmDelete = async () => {
    try{
      // isModalOpen
      // setIsModalOpen(true);
      const result = dispatch(deleteTemplateFromId(deletedId) as any).unwrap();
      if(result){
        setIsModalOpen(false);
        setSuccessModalVisible(true);
        templateId && fetchTemplateForms(templateId);
      }
    }catch(err){
      setIsModalOpen(false);
      console.log('deleteTemplateById Error',err)
    }
  }

  const handleConfirmOpenTemplate = async () => {
      try{
        const result = await dispatch(updateStatusTemplate({formId:openTemplateId,status:templateStatus}) as any).unwrap();
        if(result){
          templateId && fetchTemplateForms(templateId);
          setIsConfirmOpenTemplate(false);
          setSuccessModalVisible(true);
        }

      }catch(err){
        console.log('updateTemplate Error',err)
        setIsConfirmOpenTemplate(false);

      }

  }

  const handleCloseModalCantDelete = async () => {
    setIsCantDelete(false);
  }

  const handleCancelOpenTemplate = () => {
    setIsConfirmOpenTemplate(false);
  }

  const handleCancelDeleteTemplate = () =>{
    setIsModalOpen(false);
  }

    //deleteTemplate
  const deleteTemplateById =  (id:string, isEnable:boolean) => {
    if(!isEnable){
      setDeletedId(id);
      setIsModalOpen(true);
    }else{
      setIsCantDelete(true);
    }

  }

  const updateTemplateById = async (id:string, status:boolean) => {
  // const [openTemplateId, setOpenTemplateId] = useState<string>("");
  // const [templateStatus, setTemplateStatus] = useState<boolean>(false);
  setOpenTemplateId(id);
  setTemplateStatus(status);
  setIsConfirmOpenTemplate(true);
  }

  // 🎯 Effect to detect templateId changes and fetch template forms
  useEffect(() => {
    if (templateId && templateId !== prevTemplateId) {
      setPrevTemplateId(templateId);
      fetchTemplateForms(templateId);
    } else if (!templateId) {
      // Reset if no templateId
      setTemplateForms([]);
      setTemplateFormsTotal(0);
      setTemplateFormsCount(0);
      setPrevTemplateId("");
    }
  }, [templateId, prevTemplateId]);

  useEffect(() => {
    setLoading(false);
    fetchGroupName(); // Fetch groupName from API first (like getGroupList in /backend/page.tsx)
    fetchData();
  }, [groupId, enqueueSnackbar]);

  const handleViewDetails = (record: WorkspaceResponseType) => {
    const queryParams = new URLSearchParams({
      groupName: groupName,
      workspaceName: record.name,
      // formCount: record.formCount.toString()
    }).toString();

    router.push(`/backend/folderWorkspace/${record._id}?${queryParams}`);
  };

  // เปลี่ยนชื่อ Workspace
  const handleRename = async (workspaceId: React.Key) => {
    const workspace = workspacesState.find((w) => w._id === workspaceId);
    if (workspace) {
      setSelectedWorkspace(workspace);
      setNewWorkspaceName(workspace.name);
      setNameError("");
      setIsRenameModalOpen(true);
    }
  };

  const handleRenameConfirm = async (): Promise<boolean> => {
    setActionLoading("rename");
    try {
      if (!newWorkspaceName.trim()) {
        enqueueSnackbar("กรุณากรอกชื่อ Workspace", {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }

      const res = await dispatch(
        getWorkspaceById((selectedWorkspace && selectedWorkspace._id) || "") as any
      );
      const workspace: Workspace = res.payload.data;
      if (!workspace) {
        enqueueSnackbar("ไม่พบข้อมูล Workspace", {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }
      const workspaceUpdate: Workspace = {
        _id: workspace._id,
        new_name: newWorkspaceName,
        old_name: workspace.name,
        business_id: workspace.business_id,
        group_id: workspace.group_id,
        permission: workspace.permission,
      };
      // Simulate API call
      const response = await UpdateWorkspaceAPI(workspaceUpdate);
      if (response.payload && response.payload.status) {
        fetchData();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    } finally {
      setIsRenameModalOpen(false);
      setActionLoading("");
    }
  };

  const handleDelete = async (key: React.Key) => {
    try {
      const workspace = workspacesState.find((w) => w._id === key);
      if (!workspace) {
        enqueueSnackbar("ไม่พบข้อมูล Workspace", {
          variant: "error",
          autoHideDuration: 3000,
        });
        // throw new Error("ไม่พบข้อมูล Workspace");
      }
      // Simulate API call
      const response = await dispatch(deleteWorkspace(key as string) as any);
      if (response.payload && response.payload.status) {
        fetchData();
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  };

  const handleAccessRights = (key: React.Key) => {
    try {
      const workspace = workspacesState.find((ws) => ws._id === key);
      if (!workspace) {
        enqueueSnackbar("ไม่พบข้อมูล Workspace", {
          variant: "error",
          autoHideDuration: 3000,
        });
        return;
      }

      // const accessData = {
      //   workspaceId: workspace._id,
      //   workspaceName: workspace.name,
      //   accessType: workspace.access,
      //   accessRights: workspace.accessRights,
      // };

      setSelectedWorkspace(workspace);
      setIsAccessRightsModalOpen(true);
    } catch (error) {
      enqueueSnackbar(`เกิดข้อผิดพลาดในการจัดการสิทธิ์การเข้าถึง: ${error}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  const getDropdownItems = (
    record: WorkspaceResponseType
  ): MenuProps["items"] => [
    {
      key: "detail",
      label: "รายละเอียด",
      icon: <Info size={16} className="text-theme" />,
      onClick: () => handleViewDetails(record),
    },
    {
      key: "createFolder",
      label: "สร้างโฟลเดอร์",
      icon: <FolderPlus size={16} className="text-theme" />,
    },
    {
      key: "createForm",
      label: "สร้างชุดเอกสาร",
      icon: <FilePlus size={16} className="text-theme" />,
    },
    {
      key: "rename",
      label: "แก้ไขชื่อ",
      icon: <Edit size={16} className="text-theme" />,
      onClick: () => handleRename(record._id),
    },
    {
      key: "delete",
      label: "ลบทั้งหมด",
      icon: <Trash size={16} className="text-red-500" />,
      onClick: () => handleDelete(record._id),
    },
    {
      key: "accessRights",
      label: "สิทธิ์การเข้าถึง",
      icon: <Lock size={16} className="text-theme" />,
      onClick: () => handleAccessRights(record._id),
    },
  ];

  // 🎯 Filter template forms data based on search query
  // If no search query, return all data from API (no filtering)
  const filteredTemplateForms = React.useMemo(() => {
    if (!searchQuery.trim()) {
      // No search query - return all data from API
      return templateForms;
    }
    
    const searchLower = searchQuery.toLowerCase();
    return templateForms.filter((item) => {
      // Check both document_no and name (handle undefined/null cases)
      const matchesDocumentNo = item.document_no 
        ? item.document_no.toLowerCase().includes(searchLower)
        : false;
      const matchesName = item.name 
        ? item.name.toLowerCase().includes(searchLower)
        : false;
      return matchesDocumentNo || matchesName;
    });
  }, [templateForms, searchQuery]);

  const columns: TableColumnsType<any> = [
    {
      title: "ลำดับ",
      key: "index",
      width: "10%",
      render: (text: string, record: TemplateFormItem, index?: number) => {
        const actualIndex = (index || 0) + 1;
        return <span>{actualIndex}</span>;
      },
    },
    {
      title: "เลขที่เอกสาร",
      key: "document_no",
      dataIndex: "document_no",
      sorter: (a: TemplateFormItem, b: TemplateFormItem) =>
        (a.document_no || "").localeCompare(b.document_no || ""),
      width: "20%",
      render: (text: string) => text || "-",
    },
    {
      title: "ชื่อเอกสาร",
      key: "name",
      dataIndex: "name",
      sorter: (a: TemplateFormItem, b: TemplateFormItem) =>
        (a.name || "").localeCompare(b.name || ""),
      width: "30%",
    },
    {
      title: "เวอร์ชัน",
      key: "version",
      dataIndex: "version",
      width: "10%",
      render: (text: string) => text || "1",
    },
    {
      title: "เปิดใช้งาน",
      key: "is_enable",
      dataIndex: "is_enable",
      width: "15%",
      render: (isEnable: boolean, record: TemplateFormItem) => (
        <Switch
          checked={isEnable !== undefined && isEnable !== null ? isEnable : true}
          onChange={(checked) => {
            updateTemplateById(record.id, checked)
          }}
        />
      ),
    },
    {
      title: "จัดการ",
      key: "action",
      width: "15%",
      render: (_, record: TemplateFormItem) => (
        <div className="flex gap-2">
          <Button
            type="text"
            title="ดูรายละเอียด"
            onClick={() => handleViewTemplateFormDetails(record.id)}
            disabled={viewingFormId === record.id}
            className="border border-[#FAFAFA] rounded-xl p-2"
          >
            {viewingFormId === record.id ? (
              <LoadingOutlined spin />
            ) : (
              <Info size={18} color="#0153BD" />
            )}
          </Button>
          <Button
            type="text"
            title="ลบรายการนี้"
            onClick={() => {
              deleteTemplateById(record.id, record.is_enable);
            }}
            className="border border-[#FAFAFA] rounded-xl p-2"
          >
            <Trash size={18} color="#0153BD" />
          </Button>
        </div>
      ),
    },
  ];

  const breadcrumbItems = [
    {
      label: "หน้าหลัก",
      onClick: () => router.back(),
    },
    {
      label: "ดูข้อมูล",
    },
  ];

  // ตรวจสอบว่าชื่อ Workspace มีอยู่ในระบบแล้วหรือยัง
  const checkWorkspaceNameExists = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return false;

    return workspacesState.some(
      (workspace) => workspace.name.toLowerCase() === trimmedName.toLowerCase()
    );
  };

  const handleWorkspaceNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newName = e.target.value;
    setNewWorkspaceName(newName);

    // เคลียร์ error ถ้าชื่อว่าง
    if (!newName.trim()) {
      setNameError("");
      return;
    }

    // เมื่อเปลี่ยนชื่อ จะไม่แสดง error ถ้าชื่อนี้เป็นชื่อที่ใช้อยู่แล้ว
    if (isRenameModalOpen && selectedWorkspace && selectedWorkspace.name === newName) {
      setNameError("");
      return;
    }

    // เช็คว่าชื่อมีอยู่ในระบบแล้วหรือยัง
    if (checkWorkspaceNameExists(newName)) {
      setNameError("ชื่อ Workspace นี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น");
    } else {
      setNameError("");
    }
  };

  const handleCreateWorkspaceSuccess = async (
    payload: WorkspaceCreateType
  ): Promise<boolean> => {
    const response = await CreateWorkspaceAPI(payload);
    if (response.payload && response.payload.status) {
      fetchData();
      return true;
    } else {
      return false;
    }
  };

  // ฟังก์ชันสำหรับการอัปเดตสิทธิ์การเข้าถึง
  // 🎯 Handler for viewing template form details
  const handleViewTemplateFormDetails = async (formId: string) => {
    if (!formId) {
      enqueueSnackbar("ไม่พบ ID ของฟอร์ม", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    setViewingFormId(formId);
    try {
      const response = await dispatch(getTemplateFormById(formId) as any);
      
      if (response.payload && response.payload.status && response.payload.data) {
        const formData = response.payload.data;
        
        // Convert base64 PDF to blob URL
        const convertBase64ToUrl = (base64String: string): string | null => {
          try {
            if (!base64String || typeof base64String !== "string") {
              return null;
            }

            // Remove data URL prefix if present
            const base64Data = base64String.includes(",") 
              ? base64String.split(",")[1] 
              : base64String;
            
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "application/pdf" });
            return URL.createObjectURL(blob);
          } catch (error) {
            console.error("Error converting base64 to URL:", error);
            return null;
          }
        };

        const pdfBase64 = (formData.file && formData.file.pdf_base64) || "";
        const pdfUrl = pdfBase64 ? convertBase64ToUrl(pdfBase64) : "";
        const pdfName = (formData.file && formData.file.pdf_name) || "template.pdf";

        if (!pdfUrl) {
          enqueueSnackbar("ไม่สามารถแปลงไฟล์ PDF ได้", {
            variant: "error",
            autoHideDuration: 3000,
          });
          setViewingFormId("");
          return;
        }

        // Convert mapping data to formItems format
        // Store mapping data in sessionStorage to pass to Mapping page
        const mappingData = {
          mapping_text: (formData.mapping && formData.mapping.text) || [],
          mapping_signature: (formData.mapping && formData.mapping.signature) || [],
          mapping_date_time: (formData.mapping && formData.mapping.date_time) || [],
          mapping_radiobox: (formData.mapping && formData.mapping.radiobox) || [],
          mapping_checkbox: (formData.mapping && formData.mapping.checkbox) || [],
          mapping_doc_no: (formData.mapping && formData.mapping.doc_no) || [],
          mapping_more_file: (formData.mapping && formData.mapping.more_file) || [],
          mapping_eseal: (formData.mapping && formData.mapping.eseal) || [],
        };

        // Store form data in sessionStorage for Mapping page to use
        sessionStorage.setItem("templateFormData", JSON.stringify({
          formId,
          mapping: mappingData,
          flow_data: formData.flow_data || [],
          contract: formData.contract,
          estamp: formData.estamp,
          co_contract: formData.co_contract,
        }));

        // 🎯 Convert flow_data to approvers format for Redux store
        const approvers = (formData.flow_data || []).map((flow: any, index: number) => ({
          approverType: flow.co_contract || "internal", // "internal" or "external"
          permissionType: flow.action === "signer" ? "Signer" : "Approver", // "Signer" or "Approver"
          section: flow.section === "9" ? "มาตรา 9" : "มาตรา 26 และมาตรา 28",
          userList: (flow.entity || []).map((entity: any) => ({
            fullName: entity.name || "",
            idCard: entity.id_card || "",
            email: entity.email || "",
            userName: entity.email || "",
            hasCa: false,
            isInBusiness: entity.is_in_business || false,
            accountId: entity.id || "",
            nationality: entity.nationality || "thailand",
          })),
        }));

        // 🎯 Convert template form data to DocsSetting format for Redux store
        const contractType = (formData.contract && formData.contract.type) || "b2b";
        const section = (formData.contract && formData.contract.section) || "9";
        const sectionText = section === "9" ? "มาตรา 9" : "มาตรา 26 และมาตรา 28";
        
        const docsSetting = {
          docsType: contractType === "b2b" ? "B2B" : "B2C",
          docsTypeDetail: {
            section: sectionText,
            stampDutyPlayer: (formData.estamp && formData.estamp.payer) ? {
              fullName: (formData.estamp.payer.name) || "",
              email: (formData.estamp.payer.email) || "",
              idCard: "",
            } : { fullName: "", email: "", idCard: "" },
            stampDutyBizPayer: (formData.estamp && formData.estamp.payer && formData.estamp.payer.type) || "",
            paymentChannel: (formData.estamp && formData.estamp.chanel) || "",
            startDocsDate: (formData.contract && formData.contract.expiry && formData.contract.expiry.start_date) || "",
            endDocsDate: (formData.contract && formData.contract.expiry && formData.contract.expiry.end_date) || "",
          },
          contractParty: {
            approvers: approvers,
            taxId: (formData.co_contract && formData.co_contract.tax_id) || "",
            operator: (formData.co_contract && formData.co_contract.operator) ? {
              name: (formData.co_contract.operator.name) || "",
              idCard: "",
              email: formData.co_contract.operator.email || "",
              userName: formData.co_contract.operator.email || "",
              hasCa: false,
              isInBusiness: false,
            } : {
              name: "",
              idCard: "",
              email: "",
              userName: "",
              hasCa: false,
              isInBusiness: false,
            },
          },
        };

        // 🎯 Store in Redux for modalSettingDocument to use
        dispatch(addSubmittedForm(docsSetting));
        dispatch(setApprovers(approvers));
        dispatch(setDocsType(contractType === "b2b" ? "B2B" : "B2C"));

        // Navigate to Mapping page with PDF URL
        const queryParams = new URLSearchParams({
          pdfUrl: pdfUrl,
          title: pdfName,
          type: "template",
          formId: formId,
          docType: contractType, // "b2b" or "b2c"
        });

        // Add docTypeId if available
        if (formData.contract && formData.contract.document_type_id) {
          queryParams.append("docTypeId", formData.contract.document_type_id);
        }

        // 🎯 FIXED: Clear Next.js router cache by refreshing after navigation
        router.push(`/backend/Mapping?${queryParams.toString()}`);
        router.refresh(); // 🎯 Force refresh to clear router cache
      } else {
        enqueueSnackbar(
          (response.payload && response.payload.message) || "ไม่สามารถดึงข้อมูลฟอร์มได้",
          {
            variant: "error",
            autoHideDuration: 3000,
          }
        );
      }
    } catch (error) {
      console.error("Error fetching template form:", error);
      enqueueSnackbar("เกิดข้อผิดพลาดในการดึงข้อมูลฟอร์ม", {
        variant: "error",
        autoHideDuration: 3000,
      });
    } finally {
      setViewingFormId("");
    }
  };

  const handleUpdateAccessRights = async (
    workspaceId: React.Key,
    accessRights: AccessRights
  ) => {
    if (accessRights.users === "all") {
      enqueueSnackbar("กรุณาเลือกผู้ใช้งาน", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }
    const workspace = await dispatch(
      getWorkspaceById(workspaceId as string) as any
    );
    if (!workspace) {
      enqueueSnackbar("ไม่พบข้อมูล Workspace", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }
    const workspaceUpdate: Workspace = {
      _id: workspace._id,
      group_id: workspace.group_id,
      business_id: workspace.business_id,
      permission: ((accessRights.users) || []).map((item, index) => ({
        index: index + 1,
        email: item.email,
        account_id: item.email,
      })),
    };
    const response = await UpdateWorkspaceAPI(workspaceUpdate);
    if (response) {
      fetchData();
    }

    // ปิด modal
    setIsAccessRightsModalOpen(false);
    enqueueSnackbar("บันทึกการเปลี่ยนแปลงสิทธิ์การเข้าถึงสำเร็จ", {
      variant: "success",
      autoHideDuration: 3000,
    });
  };

  return (
    <>
      <h1 className="text-xl font-extrabold text-theme mb-3">ประเภท : {groupName}</h1>

      <Breadcrumb items={breadcrumbItems} />

      <section className="bg-[#FAFAFA] rounded-xl p-4 shadow-[0px_-0px_24px_#e2e9f1] mt-6">
        <div className="mb-3 flex flex-wrap gap-2 justify-between items-center">
          <div className="flex items-center gap-2">
            <p>ประเภทเอกสาร</p>
            <p className="text-[#FDB131] px-2 bg-white rounded-full border font-medium text-sm">{`${filteredTemplateForms.length} รายการ`}</p>
          </div>
          <div className="flex gap-2">
            <SearchInput
              placeholder="ค้นหา"
              className="w-72 min-w-full"
              value={searchQuery}
              onChange={setSearchQuery}
              debounceMs={700}
            />
          </div>
        </div>

        <TableComponent
          columns={columns as any}
          dataSource={React.useMemo(() => {
            const mappedData = filteredTemplateForms.map((template, index) => ({
              ...template,
              key: template.id || `template-${index}`,
            }));
            return mappedData;
          }, [filteredTemplateForms])}
          loading={loading || templateFormsLoading}
        />
      </section>

      <ModalComponent
        titleName="แก้ไขชื่อ Workspace"
        btnConfirm="บันทึก"
        onConfirm={handleRenameConfirm}
        isDisabled={!newWorkspaceName.trim() || !!nameError}
        open={isRenameModalOpen}
        onClose={() => {
          setIsRenameModalOpen(false);
          setNameError("");
          setNewWorkspaceName("");
        }}
        modalType="rename"
        isLoading={actionLoading === "rename"}
        onErrorClose={() => {
          // 🎯 เคลียร์ข้อมูลเมื่อเกิด error
          setNewWorkspaceName("");
          setNameError("");
          setIsRenameModalOpen(false);
        }}
      >
        <div className="space-y-2">
          <label className="text-sm text-gray-600">ชื่อ Workspace ใหม่</label>
          <Input
            placeholder="กรุณากรอกชื่อ Workspace"
            value={newWorkspaceName}
            onChange={handleWorkspaceNameChange}
            status={nameError ? "error" : ""}
            maxLength={50}
          />
          {nameError && (
            <div className="text-red-500 text-sm mt-1">{nameError}</div>
          )}
        </div>
      </ModalComponent>

      {/* Access Rights Modal */}
      <AccessRightsModal
        open={isAccessRightsModalOpen}
        group_id={groupId || ""}
        onClose={() => setIsAccessRightsModalOpen(false)}
        workspaceData={selectedWorkspace}
        onUpdateAccessRights={handleUpdateAccessRights}
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
        footer={null}
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
                {file && file.name ? file.name : ""}
              </span>
              <span className="text-xs font-[500] text-[#989898]">
                {file && file.size ? (file.size / 1048576).toFixed(2) : "0"} MB
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
              options={workspacesState.map(ws => ({
                value: ws._id,
                label: ws.name
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
              <span className="text-theme font-semibold">{groupName}</span>
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
              if (!selectedWorkspaceForUpload) {
                enqueueSnackbar("กรุณาเลือกประเภทเอกสาร", {
                  variant: "warning",
                  autoHideDuration: 3000,
                });
                return;
              }
              setIsBizTypeSelected(true);
              setOpenModalUploadPdf(false);
              setUploading(false);
              setIsDisabled(false);
            }}
            className={`btn-theme w-24 ${
              !selectedWorkspaceForUpload && workspacesState.length > 1
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
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
        footer={null}
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

      {/* 🎯 Setting Docs Modal */}
      <SettingDocsModal
        open={isOpenSettingDocs}
        pdfName={file ? file.name : ""}
        pdfUrl={objectPdf}
        pdfPage={PDFPage}
        onClose={() => {
          setIsOpenSettingDocs(false);
        }}
        isSave={() => {
          setIsOpenSettingDocs(false);
          setIsSavingData(true);
        }}
      />

      {/* modal confirm delete template*/}
      <ConfirmModal
        open={isModalOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDeleteTemplate}
        titleName="ลบเอกสาร"
        message="คุณต้องการลบเอกสารนี้ หรือไม่?"
        modalIcon={Img_Confrim_Delete_Template.src}
      />

      {/* open and close template */}
      <ConfirmModal
        open={isConfirmOpenTemplate}
        onConfirm={handleConfirmOpenTemplate}
        onCancel={handleCancelOpenTemplate}
        titleName={templateStatus ? 'เปิดใช้งาน':'ปิดใช้งาน'}
        message={templateStatus ? "คุณต้องการเปิดใช้งานเอกสารนี้ หรือไม่?":"คุณต้องการปิดใช้งานเอกสารนี้ หรือไม่?"}
        modalIcon={templateStatus ? Img_Open_template.src : Img_Close_template.src} //Img_Close_template
      />

      {/* cant delete template */}
      <CantDeleteModal
        open={isCantDelete}
        onConfirm={handleCloseModalCantDelete}
        onCancel={handleCloseModalCantDelete}
        titleName={'ไม่สามารถลบได้'}
        message={"เอกสารที่เปิดใช้งานไม่สามารถลบเอกสารได้"}
        modalIcon={Img_Cant_Delete.src}
      />

      {/* Open Success Modal */}
      <SuccessModal
        titleName="สำเร็จ"
        message=""
        open={successModalVisible}
        onClose={() => {
          setSuccessModalVisible(false);
        }}
      />
    </>
  );
}
