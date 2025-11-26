import React, { useEffect } from "react";
import { Modal, Flex, Spin } from "antd";
import { DownloadOutlined, LoadingOutlined } from "@ant-design/icons";
import { PDFDocument } from "pdf-lib";

interface PayinSlipModalProps {
  open: boolean;
  onClose: () => void;
  pdfUrl?: string;
  transactionId?: string;
  slipError: boolean;
}

export const PayinSlipModal: React.FC<PayinSlipModalProps> = ({
  open,
  onClose,
  pdfUrl = "",
  transactionId,
  slipError = false,
}) => {
  // ฟังก์ชันแปลง image เป็น PDF
  const handleDownloadPdf = () => {
    if (!pdfUrl) return;

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `Payin-${transactionId}.pdf`; // ชื่อไฟล์ตอน download
    document.body.appendChild(link);
    link.click();
    link.remove();

    // ถ้าเป็น Blob URL → revoke หลัง download
    if (pdfUrl.startsWith("blob:")) {
      URL.revokeObjectURL(pdfUrl);
    }
  };

  const handleLoading = () => {
    return (
      <Flex className="my-4" align="center" gap="middle">
        <Spin indicator={<LoadingOutlined spin />} />
        <p>กำลังโหลดข้อมูล...</p>
      </Flex>
    );
  };

  const handleError = () => {
    return (
      <Flex className="my-4" align="center" gap="middle">
        <span className="text-xl text-[#FF4D4F]">ไม่พบข้อมูล</span>
      </Flex>
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={[]}
      maskClosable={false}
      width={800}
    >
      <div className="flex flex-col justify-center items-center m-4">
        {slipError ? (
          handleError()
        ) : pdfUrl ? (
          <iframe
            src={pdfUrl}
            width="100%"
            height="750px"
            style={{ border: "none" }}
          />
        ) : (
          handleLoading()
        )}
        <button onClick={handleDownloadPdf} className="btn-theme mt-2">
          <DownloadOutlined /> บันทึก Payin Slip (PDF)
        </button>
      </div>
    </Modal>
  );
};
