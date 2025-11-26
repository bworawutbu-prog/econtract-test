"use client"; 

import React, { useEffect } from "react";
import { Modal } from "antd";
import successIcon from "@/assets/image/modal/success.webp";
import ProcessingIcon from "@/assets/webp/processing.webp"

import Image from "next/image";
import { X } from "lucide-react";

interface ProcessB2BModalProps {
  processType: string;
  open: boolean;
  onClose: () => void;
  autoCloseDelay?: number;
}

{/* <SuccessModal
open={isSuccessModalOpen}
titleName="บันทึกสำเร็จ"
message="บันทึกฟอร์มเรียบร้อยแล้ว"
onClose={() => {
  setIsSuccessModalOpen(false);
  router.push("/frontend");
}}
autoCloseDelay={2000}
/> */}

export const ProcessB2BModal: React.FC<ProcessB2BModalProps> = ({
  processType='',
  open,
  onClose,
  autoCloseDelay = 2000,
}) => {
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (open) {
      timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [open, onClose, autoCloseDelay]);

  const handleCheckIcon = () => {
    if (processType.toLowerCase() === "processing") {
      return ProcessingIcon; //successIcon
    } else if (processType.toLowerCase() === "success") {
      return "";
    }
    return "";
  };

  return (
    <Modal
      title={
        <div className="text-center text-theme font-extrabold w-full text-lg">
          ระบบกำลังตรวจสอบ
        </div>
      }
      centered
      open={open}
      onOk={onClose}
      onCancel={onClose}
      style={{ maxWidth: "400px" }}
      closeIcon={
        <span onClick={onClose} className="hover:opacity-70 rounded-full cursor-pointer inline-flex items-center justify-center">
          <X size={20} />
        </span>
      }
      className="[&_.ant-modal-content]:rounded-[24px]"
      modalRender={(node) => <div className="relative">{node}</div>}
      footer={[]}
    >
      <div className="mt-8 mb-8 text-center">

          <Image
            src={handleCheckIcon()}
            alt="Success Icon"
            className="mx-auto mb-6"
            width={100}
            height={100}
            priority
          />

        <p>ระบบกำลังตรวจสอบ <br/> การอัปเดตเอกสารการติดตามสถานะคู่สัญญานี้</p>
      </div>
    </Modal>
  );
};
