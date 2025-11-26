/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button, Dropdown, Switch, Input } from "antd";
import {
  EllipsisVertical,
  Info,
  Edit,
  Trash,
  Upload as UploadIcon,
} from "lucide-react";
import TableComponent from "@/components/ui/table";
import type { TableColumnsType } from "antd";
import { PDFDataType, mockPDFData } from "@/store/mockData/mockPDFData";
import { useSnackbar } from "notistack";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import type { MenuProps } from "antd";
import ModalComponent from "@/components/modal/modal";
import Image from "next/image";
import UploadFile from "@assets/webp/upload-file.webp";
import pdfIcon from "@assets/webp/pdf.webp";

export default function PDFWorkspace() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Get parameters from URL
  const groupName = searchParams.get("groupName") || "ไม่มีชื่อกลุ่ม";
  const workspaceName =
    searchParams.get("workspaceName") || "ไม่มีชื่อ Workspace";
  const folderId = searchParams.get("folderId") || "";
  const workspaceId = pathname.split("/").pop() || "";
  // States for modal and selected PDF
  const [selectedPDF, setSelectedPDF] = useState<PDFDataType | null>(null);
  const [newPDFName, setNewPDFName] = useState("");
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Add new state for tracking the active record
  const [activeRecordId, setActiveRecordId] = useState<string | null>(() => {
    // Initialize with the key of the currently active record, if any
    const activeRecord = mockPDFData.find((record) => record.isActive);
    return activeRecord?.key || null;
  });

  // Add state for managing PDF data
  const [pdfFiles, setPdfFiles] = useState<PDFDataType[]>(mockPDFData);

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      try {
        // Your data fetching logic
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // File upload handler
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      enqueueSnackbar("กรุณาอัปโหลดไฟล์ PDF เท่านั้น", { variant: "error" });
      return;
    }

    setUploading(true);
    try {
      // Create object URL for the uploaded file
      const fileUrl = URL.createObjectURL(file);

      // Create new PDF entry
      const newPdf: PDFDataType = {
        key: String(pdfFiles.length + 1),
        fileName: file.name,
        lastUpdated: new Date().toISOString(),
        effectiveDate: "-",
        isActive: false,
        url: fileUrl,
        status: "inactive",
        type: "draft",
        documentDetails: {
          documentNumber: "",
          typeCode: "",
          documentStatus: "Draft",
          documentDate: new Date().toISOString().split("T")[0],
          documentOwner: "",
          company: "",
          documentTitle: "",
          documentDescription: "",
          documentVersion: "1.0",
          documentId: "",
          version: "1.0",
          status: "draft",
        },
        additionalInfo: {
          description: "",
          remarks: "",
          tags: [],
          relatedDocuments: [],
          documentId: "",
          version: "1.0",
          status: "draft",
        },
        approvers: [],
      };

      setPdfFiles((prev) => [newPdf, ...prev]);
      enqueueSnackbar("อัปโหลดไฟล์สำเร็จ", { variant: "success" });
      // 🎯 FIXED: Clear Next.js router cache by refreshing after navigation
      router.push(`/backend/Mapping?pdfUrl=${encodeURIComponent(newPdf.url)}&title=${encodeURIComponent(newPdf.fileName)}&type=draft&workspaceId=${workspaceId}&folderId=${folderId}`);
      router.refresh(); // 🎯 Force refresh to clear router cache
    } catch (error) {
      enqueueSnackbar(`ไม่สามารถอัปโหลดไฟล์ได้ ${error}`, { variant: "error" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handlers
  const handleViewDetails = (record: PDFDataType) => {
    const queryParams = new URLSearchParams({
      pdfUrl: record.url,
      title: record.fileName,
      documentId: record.key,
    }).toString();

    // 🎯 FIXED: Clear Next.js router cache by refreshing after navigation
    router.push(`/backend/Mapping?${queryParams}`);
    router.refresh(); // 🎯 Force refresh to clear router cache
  };

  const handleRename = async (pdfId: string) => {
    const pdf = mockPDFData.find((p) => p.key === pdfId);
    if (pdf) {
      setSelectedPDF(pdf);
      setNewPDFName(pdf.fileName);
      setIsRenameModalOpen(true);
    }
  };

  const handleRenameConfirm = async (): Promise<boolean> => {
    setActionLoading("rename");
    try {
      if (!newPDFName.trim()) {
        enqueueSnackbar("กรุณากรอกชื่อเอกสาร", {
          variant: "error",
          autoHideDuration: 3000,
        });
        return false;
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsRenameModalOpen(false);
      enqueueSnackbar("แก้ไขชื่อเอกสารสำเร็จ", {
        variant: "success",
        autoHideDuration: 3000,
      });
      return true;
    } catch (error) {
      enqueueSnackbar(`Error renaming PDF: ${error}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (key: string) => {
    try {
      const pdf = mockPDFData.find((p) => p.key === key);
      if (!pdf) {
        enqueueSnackbar("ไม่พบข้อมูลเอกสาร", {
          variant: "warning",
          autoHideDuration: 3000,
        });
        // throw new Error("ไม่พบข้อมูลเอกสาร");
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      enqueueSnackbar("ลบรายการสำเร็จ", {
        variant: "success",
        autoHideDuration: 3000,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "ไม่สามารถลบรายการได้";
      enqueueSnackbar(errorMessage, {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  const handleToggleActive = async (record: PDFDataType) => {
    // Prevent toggling if the record is a draft
    if (record.type === "draft") {
      enqueueSnackbar("ไม่สามารถเปิดใช้งานเอกสารแบบร่างได้", {
        variant: "warning",
        autoHideDuration: 3000,
      });
      return;
    }

    try {
      setLoading(true);

      if (record.key === activeRecordId) {
        setPdfFiles((currentData) =>
          currentData?.map((item) => ({
            ...item,
            isActive: false,
            status: "inactive",
            effectiveDate: item.key === record.key ? "-" : item.effectiveDate,
          }))
        );
        setActiveRecordId(null);
        enqueueSnackbar("ปิดการใช้งานเอกสารสำเร็จ", {
          variant: "success",
          autoHideDuration: 3000,
        });
        return;
      }

      const currentDate = new Date().toISOString();

      setPdfFiles((currentData) =>
        currentData?.map((item) => ({
          ...item,
          isActive: item.key === record.key,
          status: item.key === record.key ? "active" : "inactive",
          effectiveDate:
            item.key === record.key
              ? currentDate
              : item.key === activeRecordId
              ? "-"
              : item.effectiveDate,
        }))
      );

      setActiveRecordId(record.key);
      enqueueSnackbar("เปิดการใช้งานเอกสารสำเร็จ", {
        variant: "success",
        autoHideDuration: 3000,
      });
    } catch (error) {
      enqueueSnackbar(`ไม่สามารถเปลี่ยนสถานะการใช้งานได้ : ${error}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getDropdownItems = (record: PDFDataType): MenuProps["items"] => [
    {
      key: "1",
      label: "รายละเอียด",
      icon: <Info size={16} className="text-theme" />,
      onClick: () => handleViewDetails(record),
    },
    {
      key: "2",
      label: "แก้ไขชื่อ",
      icon: <Edit size={16} className="text-theme" />,
      onClick: () => handleRename(record.key),
    },
    {
      key: "3",
      label: "ลบทั้งหมด",
      icon: <Trash size={16} className="text-red-500" />,
      onClick: () => handleDelete(record.key),
    },
  ];

  const columns: TableColumnsType<PDFDataType> = [
    {
      title: "ลำดับ",
      dataIndex: "index",
      width: "10%",
      render: (text: any, record: any, index: number) => {
        const currentPage = Math.floor(index / 10) + 1;
        const actualIndex = index + 1;
        return <span>{actualIndex}</span>;
      },
    },
    {
      title: "ชื่อเอกสาร",
      dataIndex: "fileName",
      sorter: (a, b) => a.fileName.localeCompare(b.fileName),
      width: "25%",
      render: (text, record) => (
        <div className="block">
          <div className="flex items-start gap-2">
            <Image
              src={pdfIcon}
              alt="PDF Icon"
              width={24}
              height={24}
              className="lg:block hidden"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{text}</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs mt-[2px] ${
                    record.type === "approved"
                      ? "text-[#FDB131]"
                      : "text-[#0153BD] py-[2px] px-2 bg-[#F0F6FF] rounded-full border border-[#E5F0FF]"
                  }`}
                >
                  {record.type === "approved" ? "" : "แบบร่าง"}
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "วันที่อัปเดตล่าสุด",
      dataIndex: "lastUpdated",
      sorter: (a, b) =>
        new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime(),
      width: "20%",
      render: (date: string) => {
        const d = new Date(date);
        return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${d.getFullYear()} ${d
          .getHours()
          .toString()
          .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d
          .getSeconds()
          .toString()
          .padStart(2, "0")}`;
      },
    },
    {
      title: "วันที่มีผลบังคับใช้",
      dataIndex: "effectiveDate",
      sorter: (a, b) => {
        if (a.effectiveDate === "-") return 1;
        if (b.effectiveDate === "-") return -1;
        return (
          new Date(a.effectiveDate).getTime() -
          new Date(b.effectiveDate).getTime()
        );
      },
      width: "20%",
      render: (date: string) => {
        if (date === "-") return "-";
        const d = new Date(date);
        return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${d.getFullYear()} ${d
          .getHours()
          .toString()
          .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d
          .getSeconds()
          .toString()
          .padStart(2, "0")}`;
      },
    },
    {
      title: "เปิดใช้งาน",
      dataIndex: "isActive",
      width: "15%",
      render: (_, record) => (
        <Switch
          checked={record.key === activeRecordId}
          onChange={() => handleToggleActive(record)}
          disabled={record.type === "draft"}
          className={`${
            record.key === activeRecordId ? "!bg-[#30AB4E]" : "!bg-[#DADFEA]"
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
          ${record.type === "draft" ? "opacity-50 cursor-not-allowed" : ""}`}
        />
      ),
    },
    {
      title: "จัดการ",
      key: "action",
      width: "10%",
      render: (_, record) => (
        <Dropdown
          menu={{ items: getDropdownItems(record) }}
          trigger={["click"]}
          placement="bottomRight"
          overlayClassName="min-w-[180px]"
        >
          <Button
            type="text"
            className="border border-[#FAFAFA] hover:border-theme rounded-xl p-2"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <EllipsisVertical size={18} color="#0153BD" />
          </Button>
        </Dropdown>
      ),
    },
  ];

  const breadcrumbItems = [
    {
      label: "หน้าหลัก",
      onClick: () => router.push("/backend"),
    },
    {
      label: "ดูข้อมูล",
      onClick: () => router.back(),
    },
    {
      // label: workspaceName,
      label: "รายละเอียด",
    },
  ];

  return (
    <>
      <h1 className="text-xl font-extrabold text-theme mb-3">{groupName}</h1>

      <Breadcrumb items={breadcrumbItems} />

      <section className="bg-[#FAFAFA] rounded-xl p-4 shadow-[0px_-0px_24px_#e2e9f1] mt-6">
        <div className="mb-3 flex flex-wrap gap-2 justify-between items-center">
          <div className="flex items-center gap-2">
            <p>{workspaceName}</p>
            <p className="text-[#FDB131] px-2 bg-white rounded-full border font-medium text-sm">
              {`${pdfFiles.length} รายการ`}
            </p>
          </div>
          {pdfFiles.length > 0 && (
            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf"
                onChange={handleUpload}
                className="hidden"
              />
              <button
                className="btn-theme flex items-center gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <UploadIcon size={16} />
                {uploading ? "Uploading..." : "อัปโหลดไฟล์ PDF"}
              </button>
            </div>
          )}
        </div>

        {pdfFiles.length > 0 ? (
          <TableComponent
            columns={columns}
            dataSource={pdfFiles}
            loading={loading || uploading}
          />
        ) : (
          <div className="min-h-[64vh] flex justify-center items-center bg-white rounded-xl p-4 shadow-theme">
            <div className="flex flex-col items-center gap-3">
              <Image
                src={UploadFile}
                alt="Upload File"
                width={100}
                height={100}
              />
              <p className="text-gray-500">
                ยังไม่มีเอกสาร กรุณากดปุ่มอัปโหลดไฟล์ PDF เพื่อดำเนินการต่อ
              </p>
              <button
                className="btn-theme flex items-center gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <UploadIcon size={16} className="text-white" />
                อัปโหลดไฟล์ PDF
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf"
                onChange={handleUpload}
                className="hidden"
              />
            </div>
          </div>
        )}
      </section>

      <ModalComponent
        titleName="แก้ไขชื่อเอกสาร"
        btnConfirm="บันทึก"
        onConfirm={handleRenameConfirm}
        isDisabled={!newPDFName.trim()}
        open={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        modalType="rename"
      >
        <div className="space-y-2">
          <label className="text-sm text-gray-600">ชื่อเอกสารใหม่</label>
          <Input
            placeholder="กรุณากรอกชื่อเอกสาร"
            value={newPDFName}
            onChange={(e) => setNewPDFName(e.target.value)}
            maxLength={50}
          />
        </div>
      </ModalComponent>
    </>
  );
}
