"use client";

import React, { useEffect, useState } from "react";
import { Modal, Button, Flex, Spin } from "antd";
import { DownloadOutlined, LoadingOutlined } from "@ant-design/icons";
// import Image from "next/image";

interface QrcodeModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl?: string;
  transactionId?: string;
  qrError: boolean;
}

// export const ErrorModal: React.FC<ErrorModalProps> = ({
export const QrCodeModal: React.FC<QrcodeModalProps> = ({
  open,
  onClose,
  imageUrl = "",
  transactionId = "",
  qrError = false,
}) => {

  const handleDownload = () => {
    if (!imageUrl) return;

    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `qrcode-${transactionId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <Modal open={open} onCancel={onClose} footer={[]} maskClosable={false}>
      <div className="flex flex-col justify-center items-center">
        <span className="text-xl font-[800] text-[#0153BD]">
          ชำระด้วย PromptPay (QR Code)
        </span>
        {qrError ? (
          handleError()
        ) : imageUrl ? (
          <img
            className="my-2"
            src={imageUrl}
            alt="QR Code for payment"
            width={180}
            height={38}
          />
        ) : (
          handleLoading()
        )}

        <div className="flex justify-center text-center text-[16px] font-[400] text-[#464646]">
          ใช้ Mobile Banking ของธนาคารใดก็ได้ <br />
          ในการสแกนชำระเงินค่าอากร
        </div>
        <button onClick={handleDownload} className="btn-theme mt-2">
          <DownloadOutlined /> บันทึก Qrcode
        </button>
      </div>
    </Modal>
  );
};
