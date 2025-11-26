"use client"; 

import React, { useEffect } from "react";
import { Modal } from "antd";
import successIcon from "@/assets/image/modal/success.webp";
import Image from "next/image";
import { X } from "lucide-react";

interface SuccessModalProps {
  titleName?: string;
  modalIcon?: string;
  message?: string;
  open: boolean;
  onClose: () => void;
  autoCloseDelay?: number;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  titleName = "สำเร็จ",
  modalIcon = successIcon,
  message = "",
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

  return (
    <Modal
      title={
        <div className="text-center text-theme font-extrabold w-full text-lg">
          {titleName}
        </div>
      }
      centered
      open={open}
      onOk={onClose}
      onCancel={onClose}
      style={{ maxWidth: "400px" }}
      closeIcon={
        <span className="hover:opacity-70 rounded-full cursor-pointer inline-flex items-center justify-center">
          <X size={20} />
        </span>
      }
      className="[&_.ant-modal-content]:rounded-[24px]"
      modalRender={(node) => <div className="relative">{node}</div>}
      footer={[]}
    >
      <div className="mt-8 mb-8 text-center">
        {modalIcon && (
          <Image
            src={modalIcon}
            alt="Success Icon"
            className="mx-auto mb-6"
            width={100}
            height={100}
            priority
          />
        )}
        {message && <p>{message}</p>}
      </div>
    </Modal>
  );
};
