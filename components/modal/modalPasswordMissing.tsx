"use client"

import React from "react";
import { Modal, Button } from "antd";
import passwordMissing from "@/assets/image/modal/passwordMissing.webp";
import notAccount from "@/assets/image/modal/notAccount.webp";
import Image from "next/image";
import { X } from "lucide-react";

interface PasswordMissingModalProps {
  titleName?: string;
  modalIcon?: string;
  message?: string;
  type?: string;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PasswordMissingModal: React.FC<PasswordMissingModalProps> = ({
  titleName,
  message = "คุณแน่ใจหรือไม่ที่จะทำรายการนี้?",
  type,
  open,
  modalIcon = type === 'missing' ? notAccount : passwordMissing,
  onConfirm = () => {},
  onCancel = () => {},
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
      onOk={onConfirm}
      onCancel={onCancel}
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
            {/* <Button type="text" className="w-24 text-theme btn py-4" onClick={onCancel}>
              ยกเลิก
            </Button> */}
             {type === 'missing' && <button className="btn-theme w-24" onClick={onCancel}>
             ตกลง
            </button>}
            {(type === 'notAccount' || type === 'notBusiness') && <button className="btn-theme w-24" onClick={onConfirm}>
            ลงทะเบียน
            </button>}
          </div>
        </div>
      }
    >
      <div className="mt-8 mb-20 text-center">
        {modalIcon && (
          <Image
            src={type === 'notAccount' ? modalIcon || notAccount : modalIcon || passwordMissing}
            alt="Confirm Icon"
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
