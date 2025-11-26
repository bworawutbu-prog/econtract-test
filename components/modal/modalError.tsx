"use client";

import React from "react";
import { Modal } from "antd";
import errorIcon from "@/assets/image/modal/error.webp";
import Image from "next/image";
import { X } from "lucide-react";

interface ErrorModalProps {
  titleName?: string;
  modalIcon?: string;
  message?: string;
  open: boolean;
  onClose: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  titleName = "มีบางอย่างผิดพลาด",
  modalIcon = errorIcon,
  message = "กรุณาลองใหม่อีกครั้งภายหลัง",
  open,
  onClose,
}) => {
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
      footer={
        <div className="absolute bottom-0 left-0 right-0 bg-white shadow-[0px_-4px_8px_-2px_rgba(78,115,248,0.04)] py-4 rounded-b-[24px]">
          <div className="flex w-full justify-center items-center gap-6">
            <button className="btn-theme w-24" onClick={onClose}>
              ตกลง
            </button>
          </div>
        </div>
      }
    >
      <div className="mt-8 mb-20 text-center">
        {modalIcon && (
          <Image
            src={modalIcon}
            alt="Error Icon"
            className="mx-auto mb-6"
            width={200}
            height={200}
            priority
          />
        )}
        {message && <p>{message}</p>}
      </div>
    </Modal>
  );
};
