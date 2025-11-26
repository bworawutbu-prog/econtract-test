"use client";

import React, { useState, useRef, useEffect } from "react";
import { Tag, Modal, Radio, Spin, Tabs } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { Plus, CircleCheck } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import UploadLogo from "@/assets/webp/document/cloud.webp";
import PDFLogo from "@/assets/webp/document/pdf.webp";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { resetB2BForm, setDocsType } from "@/store/documentStore/B2BForm";
import { useAppDispatch } from "@/store";
import {
  setMainDocumentInStorage,
  addAttachedDocuments,
  clearAttachedDocuments,
  removeAttachedDocument,
  resetAllDocuments,
} from "@/store/slices/documentStorageSlice";
import { DetailStampModal } from "@/components/modal/modalTypeDocNo";
import { resetPdfMerge } from "@/utils/resetPdfMerge";
import { LoadingWrapper } from "@/components/loadingSkeleton";

// Lazy-load heavy modal/mapping components to reduce initial bundle size
const SettingDocsModal = dynamic(
  () =>
    import(
      "@/components/mappingComponents/FormComponents/FormB2BDocument/modalSettingDocument"
    ).then((mod) => mod.SettingDocsModal),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#F6F8FA] animate-pulse">
      {/* Header */}
      <div className="sticky top-0 left-0 right-0 z-20 bg-white p-4 shadow-theme">
        <div className="flex justify-between items-center">
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Form Fields */}
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-10 w-full bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <div className="h-10 w-24 bg-gray-200 rounded"></div>
            <div className="h-10 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
    ),
  }
);

export default function UploadPdf() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [objectPdf, setObjPdf] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [openModalUploadPdf, setOpenModalUploadPdf] = useState<boolean>(false);
  const [isOpenSettingDocs, setIsOpenSettingDocs] = useState<boolean>(false);
  const [isbizTypeSelected, setIsBizTypeSelected] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [PDFPage, setPDFPage] = useState<number>(0);
  const [selectedValue, setSelectedValue] = useState<string>("B2B");
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isOpenDetailStamp, setIsOpenDetailStamp] = useState<boolean>(false);
  const [isSavingData, setIsSavingData] = useState<boolean>(false);
  
  // States for multiple files upload (Tab 2)
  const [files, setFiles] = useState<File[]>([]);
  const [dragActiveMultiple, setDragActiveMultiple] = useState(false);
  const [uploadingMultiple, setUploadingMultiple] = useState(false);
  const fileInputRefMultiple = useRef<HTMLInputElement>(null);
  
  // 🎯 NEW: States for main document and attached documents
  const [mainDocument, setMainDocument] = useState<File | null>(null);
  const [mainDocumentPdfUrl, setMainDocumentPdfUrl] = useState<string | null>(null); // 🎯 NEW: Store PDF URL for main document
  const [attachedDocuments, setAttachedDocuments] = useState<File[]>([]);
  const [dragActiveMain, setDragActiveMain] = useState(false);
  const [dragActiveAttached, setDragActiveAttached] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingAttached, setUploadingAttached] = useState(false);
  const fileInputRefMain = useRef<HTMLInputElement>(null);
  const fileInputRefAttached = useRef<HTMLInputElement>(null);

  // useEffect(() => {
  //   console.log("file useEffect =>", file);
  // }, [file]);

  // useEffect(() => {
  //   // console.log('isSavingData changed:', isSavingData);
  // }, [isSavingData]); // ✅ ทำงานทุกครั้งที่ isSavingData เปลี่ยนแปล

  // useEffect(() => {
  //   // เปิด modal หลังเข้ามาหน้านี้
  //   setIsBizTypeSelected(true);
  // }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem("templateFormData");
      sessionStorage.setItem("typeForm", "create");
    }
  }, []);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    // setSelectedValue(null);

    const droppedFile = e.dataTransfer.files[0];

    if (!droppedFile) return;

    if (droppedFile && droppedFile.type === "application/pdf") {
      // Reset merge PDF data เมื่อ upload ไฟล์ใหม่
      resetPdfMerge();

      // Lazy-load pdf-lib only when needed
      const { PDFDocument } = await import("pdf-lib");
      const arrayBuffer = await droppedFile.arrayBuffer(); // อ่านไฟล์เป็น ArrayBuffer
      const pdfDoc = await PDFDocument.load(arrayBuffer); // โหลด PDF
      const pageCount = pdfDoc.getPageCount(); // นับจำนวนหน้า
      // console.log("จำนวนหน้า PDF:", pageCount);
      setPDFPage(pageCount);
      setIsDisabled(true);
      setFile(droppedFile);
      const fileURL = URL.createObjectURL(droppedFile);
      setUploading(false);
      setObjPdf(fileURL);
      setTimeout(() => {
        setOpenModalUploadPdf(true);
        setIsDisabled(false);
      }, 500);

      // router.push(
      //   `/backend/Mapping?pdfUrl=${encodeURIComponent(
      //     fileURL
      //   )}&title=${encodeURIComponent(droppedFile.name)}`
      // );

      //   const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
      //   if (droppedFile.size > maxSizeInBytes) {
      //     enqueueSnackbar(`ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 10MB)`, {
      //       variant: "error",
      //       autoHideDuration: 3000,
      //     });
      //     return;
      //   }
      //   next logic
    } else {
      return;
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // setSelectedValue(null);
    const selectedFile = (e.target.files && e.target.files[0]) || null;
    if (selectedFile && selectedFile.type === "application/pdf") {
      // Reset merge PDF data เมื่อ upload ไฟล์ใหม่
      resetPdfMerge();

      // Lazy-load pdf-lib only when needed
      const { PDFDocument } = await import("pdf-lib");
      const arrayBuffer = await selectedFile.arrayBuffer(); // อ่านไฟล์เป็น ArrayBuffer
      const pdfDoc = await PDFDocument.load(arrayBuffer); // โหลด PDF
      const pageCount = pdfDoc.getPageCount();
      setPDFPage(pageCount);
      setUploading(true);
      setFile(selectedFile);
      const fileURL = URL.createObjectURL(selectedFile);
      setOpenModalUploadPdf(true);
      setUploading(false);
      setObjPdf(fileURL);
      // router.push(
      //   `/backend/Mapping?pdfUrl=${encodeURIComponent(
      //     fileURL
      //   )}&title=${encodeURIComponent(selectedFile.name)}`
      // );
    } else {
      return;
    }
    e.target.value = "";
  };

  const handleCloseModalUplaodPDF = () => {
    setOpenModalUploadPdf(false);
    setIsDisabled(false);
    setUploading(false);
    setFile(null);
    // Reset merge data เมื่อยกเลิก
    resetPdfMerge();
    // 🎯 NEW: Clear Redux documents when canceling
    dispatch(resetAllDocuments());
  };

  // Handlers for multiple files upload (Tab 2)
  const handleDropMultiple = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActiveMultiple(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === "application/pdf"
    );

    if (droppedFiles.length === 0) return;

    // Reset merge PDF data เมื่อ upload ไฟล์ใหม่
    resetPdfMerge();

    setUploadingMultiple(true);
    setFiles((prev) => [...prev, ...droppedFiles]);
    setUploadingMultiple(false);
  };

  const handleUploadMultiple = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter(
      (f) => f.type === "application/pdf"
    );

    if (selectedFiles.length === 0) {
      e.target.value = "";
      return;
    }

    // Reset merge PDF data เมื่อ upload ไฟล์ใหม่
    resetPdfMerge();

    setUploadingMultiple(true);
    setFiles((prev) => [...prev, ...selectedFiles]);
    setUploadingMultiple(false);
    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAllFiles = () => {
    setFiles([]);
    resetPdfMerge();
  };

  // 🎯 NEW: Handler for main document upload (store in state and Redux, don't redirect)
  const handleMainDocumentUpload = async (selectedFile: File) => {
    if (!selectedFile || selectedFile.type !== "application/pdf") return;

    resetPdfMerge();

    // Lazy-load pdf-lib only when needed
    const { PDFDocument } = await import("pdf-lib");
    const arrayBuffer = await selectedFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    
    setMainDocument(selectedFile);
    const fileURL = URL.createObjectURL(selectedFile);
    setMainDocumentPdfUrl(fileURL);
    setPDFPage(pageCount);
    
    // 🎯 NEW: Store main document in Redux
    const mainDocAction = setMainDocumentInStorage({
      url: fileURL,
      name: selectedFile.name,
      size: selectedFile.size,
    });
    dispatch(mainDocAction);
  };

  const handleMainDocumentDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActiveMain(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setUploadingMain(true);
      await handleMainDocumentUpload(droppedFile);
      setUploadingMain(false);
    }
  };

  const handleMainDocumentSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = (e.target.files && e.target.files[0]) || null;
    if (selectedFile && selectedFile.type === "application/pdf") {
      setUploadingMain(true);
      await handleMainDocumentUpload(selectedFile);
      setUploadingMain(false);
    }
    e.target.value = "";
  };

  // 🎯 NEW: Handler for attached documents upload (store in state and Redux)
  const handleAttachedDocumentDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActiveAttached(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === "application/pdf"
    );
    if (droppedFiles.length === 0) return;

    setUploadingAttached(true);
    const newAttachedDocs = [...attachedDocuments, ...droppedFiles];
    setAttachedDocuments(newAttachedDocs);

    // 🎯 NEW: Store in Redux instead of sessionStorage
    const attachedDocsData = droppedFiles.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));
    dispatch(addAttachedDocuments(attachedDocsData));
    setUploadingAttached(false);
  };

  const handleAttachedDocumentSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter(
      (f) => f.type === "application/pdf"
    );
    if (selectedFiles.length === 0) {
      e.target.value = "";
      return;
    }

    setUploadingAttached(true);
    const newAttachedDocs = [...attachedDocuments, ...selectedFiles];
    setAttachedDocuments(newAttachedDocs);

    // 🎯 NEW: Store in Redux instead of sessionStorage
    const attachedDocsData = selectedFiles.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));
    dispatch(addAttachedDocuments(attachedDocsData));
    setUploadingAttached(false);
    e.target.value = "";
  };

  const handleRemoveAttachedDocument = (index: number) => {
    const newAttachedDocs = attachedDocuments.filter((_, i) => i !== index);
    setAttachedDocuments(newAttachedDocs);

    // 🎯 NEW: Remove from Redux
    dispatch(removeAttachedDocument(index));
  };

  const handleClearAttachedDocuments = () => {
    setAttachedDocuments([]);
    // 🎯 NEW: Clear from Redux
    dispatch(clearAttachedDocuments());
  };

  // 🎯 NEW: Handler for confirm button in "อัปโหลดเอกสารชุด" tab
  const handleConfirmMultipleDocuments = () => {
    if (!mainDocument) {
      enqueueSnackbar("กรุณาอัปโหลดเอกสารหลัก", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    // 🎯 Documents are already stored in Redux from handleMainDocumentUpload and handleAttachedDocumentSelect/Drop
    // No need to store again here

    // Set main document to file state and open modal (same flow as tab 1)
    setFile(mainDocument);
    setObjPdf(mainDocumentPdfUrl);
    setOpenModalUploadPdf(true);
  };

  const closeModalSelectTypeContract = () => {
    setIsBizTypeSelected(false);
    setFile(null);
  };
  const docTypeStampModal = () => {
    if (selectedValue) {
      dispatch(setDocsType(selectedValue));
    }
    setIsOpenDetailStamp(true);
  };
  const checkBizType = () => {
    // if(selectedValue === "B2B"){
    setIsOpenSettingDocs(true);
    setIsOpenDetailStamp(false);
    setOpenModalUploadPdf(false);
    setIsBizTypeSelected(false);
    // }else if(selectedValue === "B2C"){
    //   file &&            router.push(
    //     `/backend/Mapping?pdfUrl=${encodeURIComponent(
    //       objectPdf
    //     )}&title=${encodeURIComponent(file.name)}`
    //   );
    //   setIsBizTypeSelected(false);
    // }else{
    //   //
    // }
  };

  const rederOptionBizType = () => {
    return (
      <>
        <Modal
          title={
            <span className=" flex justify-center text-xl font-[800] text-[#0153BD]">
              เลือกรูปแบบเอกสาร
            </span>
          }
          // open={true}
          open={isbizTypeSelected}
          width={400}
          centered
          onCancel={closeModalSelectTypeContract}
          footer={[]}
          maskClosable={false}
          styles={{
            content: { borderRadius: "24px" }, // ใช้ inline style
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
                // dispatch(resetB2BForm());
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
              <button onClick={docTypeStampModal} className={"btn-theme w-24"}>
                ยืนยัน
              </button>
            </div>
          </div>
        </Modal>
      </>
    );
  };

  const renderOpenModalUploadPdf = () => {
    return (
      <>
        <Modal
          title={
            <span className=" flex justify-center text-xl font-[800] text-[#0153BD]">
              อัปโหลด PDF
            </span>
          }
          centered
          open={openModalUploadPdf}
          onCancel={handleCloseModalUplaodPDF}
          footer={[]}
          maskClosable={false}
          styles={{
            content: { borderRadius: "24px" }, // ใช้ inline style
          }}
        >
          <div className="flex justify-between items-center my-[24px] border-[1px] p-[16px] border-[#E6E6E6] bg-[#FAFCFF] rounded-xl">
            <div className="flex items-center space-x-2 ">
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
          {/* <div>
            <div>รูปแบบเอกสาร</div>
          <Radio.Group
          value={selectedValue}
          onChange={(e) => setSelectedValue(e.target.value)}
          >
                                  <Radio value="B2C">B2C</Radio>
                                  <Radio value="B2B">B2B</Radio>
                                </Radio.Group>
          </div> */}
          <div className="flex justify-center w-full my-[16px] space-x-4">
            <button
              onClick={handleCloseModalUplaodPDF}
              className="w-24 text-theme btn py-4 hover:bg-[#E6E6E6]"
            >
              ยกเลิก
            </button>
            <button
              onClick={() => {
                // setIsOpenSettingDocs(true);
                dispatch(resetB2BForm());
                setIsBizTypeSelected(true);
                setOpenModalUploadPdf(false);
                setUploading(false);
                setIsDisabled(false);
              }}
              className={"btn-theme w-24"}
            >
              ยืนยัน
            </button>
          </div>
        </Modal>
      </>
    );
  };

  return (
    <>
      <div className="space-y-4"> 
        <div className="">
          <h1 className="text-xl font-extrabold text-theme">
            สร้างเอกสาร
            <span className="text-[16px] text-[#989898] font-medium ml-1">
              (เลือกไฟล์ที่ใช้สำหรับการอนุมัติเอกสาร)
            </span>
          </h1>
        </div>
        <div className="bg-[#FAFAFA] rounded-2xl p-4 relative">
          {isDisabled && (
            <div
              className={`absolute inset-0 flex justify-center items-center bg-white ${
                isSavingData ? "bg-opacity-90" : "bg-opacity-70"
              } rounded-2xl z-10`}
            >
              <div className="flex flex-col items-center">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="text-gray-700 mt-3"></span>
                </div>
              </div>
            </div>
          )}
          {!isDisabled && isSavingData && (
            <div
              className={`absolute inset-0 flex justify-center items-center bg-white ${
                isSavingData ? "bg-opacity-90" : "bg-opacity-70"
              } rounded-2xl z-10`}
            >
              <div className="flex flex-col items-center">
                <div className="flex flex-col items-center">
                  <Spin
                    indicator={
                      <LoadingOutlined style={{ fontSize: 48 }} spin />
                    }
                  />
                  <span className="text-gray-700 mt-3 text-lg font-bold">
                    กำลังบันทึกข้อมูล...
                  </span>
                </div>
              </div>
            </div>
          )}
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: "1",
                label: "อัปโหลดเอกสารทั่วไป",
                children: (
                  <>
                    <div className="">
                      <span className="font-semibold text-base pr-2">เอกสาร</span>
                      <Tag
                        bordered={false}
                        style={{
                          backgroundColor: "white",
                        }}
                      >
                        <span className="text-[#FDB131] text-base font-semibold">
                          {file ? "1" : "0"} รายการ
                        </span>
                      </Tag>
                    </div>
                    <div
                      className={`h-[781px] flex flex-col justify-center items-center bg-white rounded-2xl mt-4 space-y-2 transition-shadow ${
                        dragActive ? "shadow-[0_0_20px_rgba(59,130,246,0.6)]" : "shadow"
                      } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setDragActive(false);
                      }}
                      onDrop={handleDrop}
                    >
                      <Image src={UploadLogo} height={80} width={80} alt="upload Logo" />
                      <span className="text-lg font-bold">อัปโหลดไฟล์ PDF</span>
                      <span className="font-[400] text-[#464646]">
                        ลากและวางไฟล์ของคุณที่นี่หรือ จากเลือกไฟล์อุปกรณ์ของคุณ
                      </span>

                      <label
                        className={`btn-theme flex items-center ${
                          uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                        }`}
                      >
                        {uploading ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            กำลังอัปโหลด...
                          </>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Plus size={16} />
                            <span>เลือกไฟล์</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="application/pdf"
                          style={{ display: "none" }}
                          onChange={handleUpload}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  </>
                ),
              },
              // {
              //   key: "2",
              //   label: "อัปโหลดเอกสารชุด",
              //   children: (
              //     <>
              //        <div className="space-y-6">
              //          {/* 🎯 ปุ่มที่ 1: เอกสารหลัก */}
              //          <div>
              //            <div className="mb-4">
              //              <span className="font-semibold text-base pr-2">เอกสารหลัก</span>
              //              {mainDocument && (
              //                <Tag
              //                  bordered={false}
              //                  style={{
              //                    backgroundColor: "white",
              //                  }}
              //                >
              //                  <span className="text-[#30AB4E] text-base font-semibold">
              //                    อัปโหลดแล้ว
              //                  </span>
              //                </Tag>
              //              )}
              //            </div>
              //            <div className="space-y-4">
              //              <div>
              //                <label className="block text-sm font-medium text-gray-700 mb-2">
              //                  เลือกไฟล์เอกสารหลัก
              //                </label>
              //                <input
              //                  ref={fileInputRefMain}
              //                  type="file"
              //                  accept="application/pdf"
              //                  onChange={handleMainDocumentSelect}
              //                  disabled={uploadingMain}
              //                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              //                    uploadingMain ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              //                  }`}
              //                />
              //                {uploadingMain && (
              //                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              //                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              //                    <span>กำลังอัปโหลด...</span>
              //                  </div>
              //                )}
              //              </div>
              //              {mainDocument && (
              //                <div className="border-[1px] p-[16px] border-[#E6E6E6] bg-[#FAFCFF] rounded-xl">
              //                  <div className="flex items-center space-x-2">
              //                    <Image
              //                      src={PDFLogo}
              //                      height={40}
              //                      width={40}
              //                      alt="Pdf Logo"
              //                    />
              //                    <div className="flex flex-col space-y-1 flex-1">
              //                      <span className="text-sm font-[500] text-[#333333]">
              //                        {mainDocument.name}
              //                      </span>
              //                      <span className="text-xs font-[500] text-[#989898]">
              //                        {(mainDocument.size / 1048576).toFixed(2)} MB
              //                      </span>
              //                    </div>
              //                    <CircleCheck className="text-[#30AB4E]" />
              //                  </div>
              //                </div>
              //              )}
              //            </div>
              //          </div>

              //          {/* 🎯 ปุ่มที่ 2: เอกสารแนบ */}
              //          <div>
              //            <div className="flex justify-between items-center mb-4">
              //              <div className="">
              //                <span className="font-semibold text-base pr-2">เอกสารแนบ</span>
              //                <Tag
              //                  bordered={false}
              //                  style={{
              //                    backgroundColor: "white",
              //                  }}
              //                >
              //                  <span className="text-[#FDB131] text-base font-semibold">
              //                    {attachedDocuments.length} รายการ
              //                  </span>
              //                </Tag>
              //              </div>
              //              {attachedDocuments.length > 0 && (
              //                <button
              //                  onClick={handleClearAttachedDocuments}
              //                  className="text-red-500 hover:text-red-700 text-sm font-medium"
              //                >
              //                  ลบทั้งหมด
              //                </button>
              //              )}
              //            </div>
              //            <div className="space-y-4">
              //              <div>
              //                <label className="block text-sm font-medium text-gray-700 mb-2">
              //                  เลือกไฟล์เอกสารแนบ (สามารถเลือกหลายไฟล์ได้)
              //                </label>
              //                <input
              //                  ref={fileInputRefAttached}
              //                  type="file"
              //                  accept="application/pdf"
              //                  multiple
              //                  onChange={handleAttachedDocumentSelect}
              //                  disabled={uploadingAttached}
              //                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              //                    uploadingAttached ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              //                  }`}
              //                />
              //                {uploadingAttached && (
              //                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              //                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              //                    <span>กำลังอัปโหลด...</span>
              //                  </div>
              //                )}
              //              </div>
              //              {attachedDocuments.length > 0 && (
              //                <div className="space-y-2 max-h-[300px] overflow-y-auto">
              //                  {attachedDocuments.map((f, index) => (
              //                    <div
              //                      key={index}
              //                      className="flex justify-between items-center border-[1px] p-[16px] border-[#E6E6E6] bg-[#FAFCFF] rounded-xl"
              //                    >
              //                      <div className="flex items-center space-x-2 flex-1">
              //                        <Image
              //                          src={PDFLogo}
              //                          height={40}
              //                          width={40}
              //                          alt="Pdf Logo"
              //                        />
              //                        <div className="flex flex-col space-y-1 flex-1">
              //                          <span className="text-sm font-[500] text-[#333333]">
              //                            {f.name}
              //                          </span>
              //                          <span className="text-xs font-[500] text-[#989898]">
              //                            {(f.size / 1048576).toFixed(2)} MB
              //                          </span>
              //                        </div>
              //                      </div>
              //                      <button
              //                        onClick={() => handleRemoveAttachedDocument(index)}
              //                        className="text-red-500 hover:text-red-700 ml-4"
              //                      >
              //                        ลบ
              //                      </button>
              //                    </div>
              //                  ))}
              //                </div>
              //              )}
              //            </div>
              //          </div>

              //          {/* 🎯 ปุ่มยืนยัน */}
              //          <div className="flex justify-center w-full pt-4">
              //            <button
              //              onClick={handleConfirmMultipleDocuments}
              //              disabled={!mainDocument}
              //              className={`btn-theme w-32 ${
              //                !mainDocument ? "opacity-50 cursor-not-allowed" : ""
              //              }`}
              //            >
              //              ยืนยัน
              //            </button>
              //          </div>
              //        </div>
              //     </>
              //   ),
              // },
            ]}
          />
        </div>
      </div>
      {/* reload ทั้งหน้า */}
      {/* {isSavingData && (
      <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-80 z-[9999]">
        <div className="flex flex-col items-center">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
          <span className="text-gray-700 mt-3 text-lg font-bold">กำลังบันทึกข้อมูล...</span>
        </div>
      </div>
    )} */}
      {renderOpenModalUploadPdf()}
      {rederOptionBizType()}
      <SettingDocsModal
        open={isOpenSettingDocs}
        // open={true}
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
      {/* <div className="flex justify-center h-full items-center w-full z-10 fixed bg-[rgba(255, 255, 255, 0.7);]"> */}
      {/* <div className="fixed inset-0 flex justify-center items-center z-[9999] bg-[rgba(255, 255, 255, 0.7);]">
    <Spin indicator={<LoadingOutlined spin />} size="small" />
    <Spin indicator={<LoadingOutlined spin />} />
    <Spin indicator={<LoadingOutlined spin />} size="large" />
    <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
  </div> */}
      <DetailStampModal
        isOpen={isOpenDetailStamp}
        onClose={() => {
          setIsOpenDetailStamp(false);
          setFile(null);
        }}
        onConfirm={() => {
          setIsOpenDetailStamp(false);
          checkBizType();
        }}
        title="ประเภทเอกสาร"
      />
    </>
  );
}
