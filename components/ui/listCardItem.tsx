"use client"; // ระบุว่าเป็น Client Component สำหรับ Next.js App Router

import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Spin,
  Alert,
  Typography,
  Tag,
  Pagination,
  Dropdown,
  Button,
} from "antd";
import {
  Search,
  ArrowDown,
  ArrowUp,
  Heart,
  Calendar,
  UserRound,
  EllipsisVertical,
  Info,
  File,
  Lock,
  Trash,
  Edit,
} from "lucide-react";
import type { MenuProps, PaginationProps } from "antd";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import Image from "next/image";
// 🔥 เพิ่ม imports ที่จำเป็น
import { useDispatch } from "react-redux";
import { getTemplateFormById } from "@/store/backendStore/templateAPI"; // ปรับ path ตามโครงสร้างของคุณ
import {
  addSubmittedForm,
  setApprovers,
  setDocsType
} from "@/store/documentStore/B2BForm"; // ปรับ path และชื่อ slice ตามโครงสร้างของคุณ

const { Meta } = Card;
const { Title, Text } = Typography;
import type {
  listTransactionSchema,
  listTransactionResponse,
} from "@/store/types/mappingTypes";
import type { DocumentTypeOption } from "@/store/types/estampTypes";

interface DropdownAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

interface ListCardComponentProps<B> {
  apiEndpoint?: string;
  searchTerm?: string;
  dataForm: listTransactionSchema[];
  sortGroup?: string;
  initialPageSize?: number;
  pageSize?: number;
  totalPage?: number;
  totalItems?: number;
  currentPage?: number;
  onPageChange?: (page: number, pageSize?: number) => void;
  getDropdownItems?: (item: listTransactionSchema) => DropdownAction[];
  showSizeChanger?: boolean;
  documentTypeOptions?: DocumentTypeOption[];
  showExtendedInfo?: boolean;
}

const ListCardComponent = <B extends listTransactionResponse>({
  apiEndpoint = "",
  dataForm = [],
  searchTerm = "",
  sortGroup = "",
  initialPageSize = 10,
  pageSize: externalPageSize,
  totalPage = 1,
  totalItems,
  currentPage: externalCurrentPage,
  getDropdownItems,
  onPageChange,
  showSizeChanger = false,
  documentTypeOptions = [],
  showExtendedInfo = false,
}: ListCardComponentProps<B>) => {
  const [images, setImages] = useState<listTransactionSchema[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [internalCurrentPage, setInternalCurrentPage] = useState<number>(1);
  const [internalPageSize, setInternalPageSize] =
    useState<number>(initialPageSize);
  const [totalFilteredItems, setTotalFilteredItems] = useState<number>(0);
  const [displayedItems, setDisplayedItems] = useState<listTransactionSchema[]>(
    []
  );
  const router = useRouter();
  // 🔥 เพิ่ม dispatch และ state สำหรับ viewingFormId
  const dispatch = useDispatch();
  const [viewingFormId, setViewingFormId] = useState<string>("");

  // ใช้ external values ถ้ามี ไม่งั้นใช้ internal
  const effectiveCurrentPage = externalCurrentPage || internalCurrentPage;
  const effectivePageSize = externalPageSize || internalPageSize;

  useEffect(() => {
    if (externalCurrentPage) {
      setInternalCurrentPage(externalCurrentPage);
    }
  }, [externalCurrentPage]);

  useEffect(() => {
    if (externalPageSize) {
      setInternalPageSize(externalPageSize);
    }
  }, [externalPageSize]);

  useEffect(() => {
    const fetchAndFilterImages = async () => {
      setLoading(true);
      setError("");
      try {
        let filteredImages: listTransactionSchema[] = [...dataForm];

        // Filter by search term
        if (searchTerm) {
          filteredImages = filteredImages.filter(
            (image) =>
              image.pdf_name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              image.created_by
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              image.document_id
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())
          );
        }

        // 🎯 FIXED: ถ้ามี totalItems จาก API ให้ใช้ค่านั้น (server-side pagination)
        // ถ้าไม่มี ให้ใช้ filtered length (client-side pagination)
        const total = totalItems || filteredImages.length;
        setTotalFilteredItems(total);

        console.log('🔍 ListCardComponent Debug:', {
          dataFormLength: dataForm.length,
          filteredLength: filteredImages.length,
          totalItems,
          total,
          searchTerm
        });

        // 🎯 CRITICAL: ถ้ามี totalItems จาก parent แสดงว่าเป็น server-side pagination
        // ไม่ต้องทำ client-side pagination เพิ่ม
        if (totalItems && totalItems > 0) {
          // Server-side pagination - แสดงข้อมูลที่ส่งมาทั้งหมด
          setDisplayedItems(filteredImages as unknown as listTransactionSchema[]);
        } else {
          // Client-side pagination - แบ่งข้อมูลเอง
          const startIndex = (effectiveCurrentPage - 1) * effectivePageSize;
          const endIndex = startIndex + effectivePageSize;
          const paginatedItems = filteredImages.slice(startIndex, endIndex);
          setDisplayedItems(paginatedItems as unknown as listTransactionSchema[]);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
        }
        enqueueSnackbar(`Error processing images: ${err}`, {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterImages();
  }, [
    dataForm,
    searchTerm,
    effectiveCurrentPage,
    effectivePageSize,
    totalItems, // 🎯 เพิ่ม dependency
    enqueueSnackbar
  ]);

  const handlePageChange: PaginationProps["onChange"] = (
    page: number,
    newPageSize?: number
  ) => {
    if (onPageChange) {
      // ถ้ามี onPageChange ให้ parent จัดการทั้งหมด
      onPageChange(page, newPageSize);
    } else {
      // ถ้าไม่มี ใช้ internal state
      setInternalCurrentPage(page);
      if (newPageSize) {
        setInternalPageSize(newPageSize);
      }
    }
  };

  const renderFormattedDate = (dateValue: any = "") => {
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      try {
        return dateValue.toLocaleDateString("th-TH", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
        });
      } catch (e) {
        console.error("Error formatting date:", dateValue, e);
        return "รูปแบบวันที่ผิดพลาด";
      }
    } else if (typeof dateValue === "string") {
      try {
        const parsedDate = new Date(dateValue);
        if (!isNaN(parsedDate.getTime())) {
          // return parsedDate.toLocaleDateString('th-TH', {
          //   year: 'numeric',
          //   month: 'long',
          //   day: 'numeric',
          //   weekday: 'long',
          // });
          return parsedDate.toLocaleDateString("th-TH");
        } else {
          return "วันที่ไม่ถูกต้อง (สตริง)";
        }
      } catch (e) {
        console.error("Error parsing date string:", dateValue, e);
        return "ข้อผิดพลาดในการแปลงวันที่";
      }
    }
    return "ไม่มีข้อมูลวันที่";
  };

  const customNamePdf = (namePdf: string) => {
    const [name, dot] = namePdf?.split(".pdf");
    return name;
  };

  const getDocumentTypeLabel = (documentType?: string): string => {
    if (!documentType || documentTypeOptions.length === 0) return "-";
    const found = documentTypeOptions.find((opt) => opt.value === documentType);
    return found ? found.label : "-";
  };

  // 🔥 เพิ่มฟังก์ชัน handleViewTemplateFormDetails
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
        const convertBase64ToUrl = (base64String: string): string | null => {
          try {
            if (!base64String || typeof base64String !== "string") {
              return null;
            }

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

        const mappingData = {
          mapping_text: (formData.mapping && formData.mapping.text) || [],
          mapping_signature: (formData.mapping && formData.mapping.signature) || [],
          mapping_date_time: (formData.mapping && formData.mapping.date_time) || [],
          mapping_radiobox: (formData.mapping && formData.mapping.radiobox) || [],
          mapping_checkbox: (formData.mapping && formData.mapping.checkbox) || [],
          mapping_doc_no: (formData.mapping && formData.mapping.doc_no) || [],
          mapping_more_file: (formData.mapping && formData.mapping.more_file) || [],
          mapping_stamp: (formData.mapping && formData.mapping.stamp) || [],
        };

        sessionStorage.setItem("templateFormData", JSON.stringify({
          formId: 'template-' + formId,
          mapping: mappingData,
          flow_data: formData.flow_data || [],
          contract: formData.contract,
          estamp: formData.estamp,
          co_contract: formData.co_contract,
        }));

        const approvers = (formData.flow_data || []).map((flow: any, index: number) => ({
          approverType: flow.co_contract || "internal",
          permissionType: flow.action === "signer" ? "Signer" : "Approver",
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
            paymentChannel: (() => {
              const channel = (formData.estamp && formData.estamp.chanel) || "";
              if (channel === "internal") return "ในระบบ";
              if (channel === "external") return "นอกระบบ";
              if (channel === "non_payment") return "ไม่ชำระอากรแสตมป์";
              return channel;
            })(),
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

        dispatch(addSubmittedForm(docsSetting));
        dispatch(setApprovers(approvers));
        dispatch(setDocsType(contractType === "b2b" ? "B2B" : "B2C"));
        const queryParams = new URLSearchParams({
          pdfUrl: pdfUrl,
          title: pdfName,
          type: "useDocument",
          formId: formId,
          docType: contractType,
        });

        if (formData.contract && formData.contract.document_type_id) {
          queryParams.append("docTypeId", formData.contract.document_type_id);
        }

        // 🎯 FIXED: Clear Next.js router cache by refreshing after navigation
        if (typeof window !== 'undefined') {
          sessionStorage.setItem("typeForm", "useDocument");
        } 
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

  const handleViewDetails = (id?: string, templateFormId?: string) => {
    // 🔥 แก้ไข: เรียกใช้ handleViewTemplateFormDetails แทนการ router.push โดยตรง
    // console.log('templateFormId =>',templateFormId)
    // console.log('templateFormId.trim() =>',templateFormId.trim())
    if (templateFormId && templateFormId.trim() !== "") {
      handleViewTemplateFormDetails(templateFormId);
    }
    else if (id) {
      router.push(`/frontend/Mapping?documentId=${id}`);
    }
    else {
      enqueueSnackbar("ไม่พบข้อมูลเอกสาร", {
        variant: "error",
        autoHideDuration: 3000
      });
    }
  };

  const checkStatusTransaction = (data: string) => {
    switch (data) {
      case "D":
        return (
          <span className="text-xs text-[#FDB131] bg-[#FEF3D6] px-4 py-1 rounded-full">
            บันทึกร่าง
          </span>
        );
      case "Y":
        return (
          <span className="text-xs text-[#00C45A] bg-[#EAF8EF] px-4 py-1 rounded-full">
            เสร็จสิ้น
          </span>
        );
      case "W":
        return (
          <span className="text-xs text-[#FC9240] bg-[#FFF4EB] px-4 py-1 rounded-full">
            รอดำเนินการ
          </span>
        );
      case "N":
        return (
          <span className="text-xs text-[#00AAFF] bg-[#E6F7FF] px-4 py-1 rounded-full">
            กำลังดำเนินการ
          </span>
        );
      case "R":
        return (
          <span className="text-xs text-[#FF4D4F] bg-[#FFF1F0] px-4 py-1 rounded-full">
            ปฏิเสธ
          </span>
        );
      case "C":
        return (
          <span className="text-xs text-[#7033FF] bg-[#F0EAFF] px-4 py-1 rounded-full">
            ยกเลิก
          </span>
        );
    }
  };

  const renderContent = () => {
    if (error) {
      return <div className="text-red-500">{error}</div>;
    }

    if (displayedItems.length === 0 && !loading) {
      return (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Title level={4}>ไม่พบข้อมูล</Title>
          <Text type="secondary">
            ไม่พบข้อมูลที่ตรงกับเกณฑ์การค้นหาของคุณ หรือยังไม่มีข้อมูลในระบบ
          </Text>
        </div>
      );
    }

    const defaultDropdownItems = (
      image: listTransactionSchema
    ): MenuProps["items"] => [
        {
          key: "1",
          label: "ใช้งานฟอร์มนี้",
          icon: <Info size={16} className="text-theme" />,
          // ✅ ส่งทั้ง id และ template_form_id
          onClick: () => handleViewDetails(image.id, image.template_form_id),
        },
        // {
        //   key: "2",
        //   label: "แก้ไขชื่อ",
        //   icon: <Edit size={16} className="text-theme" />,
        //   // onClick: () => handleRename(image.key),
        // },
        // {
        //   key: "3",
        //   label: "ลบทั้งหมด",
        //   icon: <Trash size={16} className="text-red-500" />,
        //   // onClick: () => handleDelete(image.key),
        // },
        // {
        //   key: "4",
        //   label: "สิทธิ์การเข้าถึง",
        //   icon: <Lock size={16} className="text-theme" />,
        //   // onClick: () => handleAccessRights(image.key),
        // },
      ];

    return (
      <>
        {displayedItems?.map((image, index) => (
          <div
            key={index}
            className="flex border-[1px] border-[#F0F6FF] rounded-xl p-4 mb-4 gap-2 cursor-pointer"
            onClick={(e) => {
              // ถ้า click มาจากภายใน ant-dropdown ให้ไม่เรียก
              const target = e.target as HTMLElement | null;
              if (target?.closest?.(".ant-dropdown, .ant-menu, button[title='จัดการ']")) {
                return;
              }
              handleViewDetails(image.id, image.template_form_id);
            }}
          >
            {image.status === "D" && (
              <Image
                src="/assets/webp/inbox/filter-draft.webp"
                alt="Draft"
                width={40}
                height={40}
                className="self-center"
                style={{ height: '40px', objectFit: 'contain' }}
              />
            )}
            {image.status === "W" && (
              <Image
                src="/assets/webp/inbox/filter-waiting.webp"
                alt="Waiting"
                width={40}
                height={40}
                className="self-center"
                style={{ height: '40px', objectFit: 'contain' }}
              />
            )}
            {image.status === "N" && (
              <Image
                src="/assets/webp/inbox/filter-processing.webp"
                alt="Processing"
                width={40}
                height={40}
                className="self-center"
                style={{ height: '40px', objectFit: 'contain' }}
              />
            )}
            {image.status === "R" && (
              <Image
                src="/assets/webp/inbox/filter-rejected.webp"
                alt="Rejected"
                width={40}
                height={40}
                className="self-center"
                style={{ height: '40px', objectFit: 'contain' }}
              />
            )}
            {image.status === "C" && (
              <Image
                src="/assets/webp/inbox/filter-canceled.webp"
                alt="Canceled"
                width={40}
                height={40}
                className="self-center"
                style={{ height: '40px', objectFit: 'contain' }}
              />
            )}
            {image.status === "Y" && (
              <Image
                src="/assets/webp/inbox/filter-completed.webp"
                alt="Completed"
                width={40}
                height={40}
                className="self-center"
                style={{ height: '40px', objectFit: 'contain' }}
              />
            )}
            <div className="flex-col w-full justify-between">
              <div className="w-full flex flex-1 flex-col justify-center gap-2">
                <div className="flex justify-between items-center flex-row gap-2">
                  <div className="flex flex-row gap-2 items-center">
                    <strong>
                      {typeof image.pdf_name === "string" && image.pdf_name
                        ? customNamePdf(image.pdf_name)
                        : "-"}
                    </strong>
                    {image.template_form_version && (
                      <div className="px-4 py-1 bg-blue-50 text-blue-600 rounded-full  font-semibold">
                        {image.template_form_version}
                      </div>
                    )}
                    {/* <span className="text-xs text-gray-500 bg-[#F0F6FF] px-4 py-1 rounded-full">
                      1.0
                    </span> */}
                    {/* {image.status === "D" && (
                      <span className="text-xs text-[#ffffff] bg-[#FDB131] px-4 py-1 rounded-full">
                        บันทึกร่าง
                      </span>
                    )} */}
                  </div>

                  <div className="flex flex-row gap-2 items-center">
                    {checkStatusTransaction(image?.status || "")}
                    {/* <Heart
                      className="cursor-pointer"
                      color={true ? "#F54233" : "#D1D5DB"}
                      fill={true ? "#F54233" : "none"}
                      size={20}
                    /> */}
                    <Dropdown
                      menu={{
                        items: (getDropdownItems
                          ? getDropdownItems(image)
                          : defaultDropdownItems(image)) as MenuProps["items"],
                      }}
                      trigger={["click"]}
                      placement="bottomRight"
                      overlayClassName="min-w-[180px]"
                    >
                      <Button
                        type="text"
                        title="จัดการ"
                        className="border border-[#FAFAFA] hover:border-theme rounded-xl p-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                      >
                        <EllipsisVertical size={18} color="#0153BD" />
                      </Button>
                    </Dropdown>
                  </div>
                </div>
                {showExtendedInfo ? (
                  <>
                    <div className="grid grid-cols-auto md:grid-cols-3 grid-cols-1 gap-2 rounded-lg mb-2">
                      <div className="column-content flex items-center space-x-2">
                        <File className="column-content" size={15} />
                        <span>เลขที่เอกสาร : {image.document_id || "-"}</span>
                      </div>
                      <div className="column-content flex items-center space-x-2">
                        <File className="column-content" size={15} />
                        <span>เลขที่เอกสาร ERP : {image.erp_document_id || "-"}</span>
                      </div>
                      <div className="column-content flex items-center space-x-2">
                        <FileText className="column-content" size={15} />
                        <span>ประเภทเอกสาร : {getDocumentTypeLabel(image.document_type)}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-auto md:grid-cols-3 grid-cols-1 gap-2 rounded-lg">
                      <div className="column-content flex items-center space-x-2">
                        <UserRound className="column-content" size={15} />
                        <span>สร้างโดย : {image.created_by || "-"}</span>
                      </div>
                      <div className="column-content flex items-center space-x-2">
                        <Calendar className="column-content" size={15} />
                        <span>
                          วันที่สร้าง : {renderFormattedDate(image.created_at)}
                        </span>
                      </div>
                      <div className="column-content flex items-center space-x-2">
                        <Calendar className="column-content" size={15} />
                        <span>
                          วันที่หมดอายุ : {renderFormattedDate(image.end_enabled)}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-auto md:grid-cols-3 grid-cols-1 gap-2 rounded-lg">
                    <div className="column-content flex items-center space-x-2">
                      <File className="column-content" size={15} />
                      <span>เลขที่เอกสาร : {image.document_id}</span>
                    </div>
                    <div className="column-content flex items-center space-x-2">
                      <UserRound className="column-content" size={15} />
                      <span>สร้างโดย : {image.created_by}</span>
                    </div>
                    <div className="column-content flex items-center space-x-2">
                      <Calendar className="column-content" size={15} />
                      <span>
                        วันที่ : {renderFormattedDate(image.created_at)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {totalFilteredItems > 0 && (
          <div className="grid justify-items-stretch">
            <div className="justify-self-end">
              <Pagination
                current={effectiveCurrentPage}           // ✅ หน้าปัจจุบัน
                pageSize={effectivePageSize}             // ✅ จำนวนรายการต่อหน้า
                total={totalFilteredItems}               // ✅ จำนวนทั้งหมด
                showTotal={(total: number, range: [number, number]) =>
                  `${range[0]}-${range[1]} จาก ${total} รายการ`
                }
                onChange={(page: number, pageSize: number) => { // ✅ CRITICAL: ต้องรับ 2 parameters

                  if (onPageChange) {
                    onPageChange(page, pageSize); // ส่งไปให้ parent
                  } else {
                    // ถ้าไม่มี onPageChange ให้จัดการเอง
                    setInternalCurrentPage(page);
                    setInternalPageSize(pageSize);
                  }
                }}
                showSizeChanger={showSizeChanger}        // ⚪ แสดงตัวเลือกเปลี่ยน pageSize
                // pageSizeOptions={[10, 20, 50, 100]}      // ⚪ ตัวเลือก pageSize
                onShowSizeChange={(current: number, size: number) => { // ⚪ Handler เมื่อเปลี่ยน pageSize
                  if (onPageChange) {
                    onPageChange(1, size); // Reset ไปหน้า 1
                  } else {
                    setInternalCurrentPage(1);
                    setInternalPageSize(size);
                  }
                }}
                disabled={loading}                       // ⚪ ปิดการใช้งานขณะ loading
                hideOnSinglePage={false}                 // ⚪ แสดง pagination แม้มี 1 หน้า
              />
            </div>

          </div>
        )}
      </>
    );
  };

  return (
    <Spin spinning={loading} size="large">
      <div
        style={{ background: "#ffffff", minHeight: loading ? "80vh" : "auto" }}
      >
        {renderContent()}
      </div>
    </Spin>
  );
};

export default ListCardComponent;
