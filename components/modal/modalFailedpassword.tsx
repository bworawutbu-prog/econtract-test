"use client"; 

import { Modal } from "antd";
import Image, { StaticImageData } from "next/image";
import type { FC } from "react";
import { X } from "lucide-react";
import img_failedModal from "@/assets/webp/img_failedModal.webp";

interface ModalFailedProps {
  open: boolean;
  onClose: () => void;
  header?: string;
  message?: string;
  imgSrc?: StaticImageData | string;
  buttonText?: string;
  onConfirm?: () => void;
}

export const ModalFailed: FC<ModalFailedProps> = ({
  open,
  onClose,
  header = "[Debug] Header Text",
  message = "[Debug] Text message",
  imgSrc = img_failedModal,
  buttonText = "ตกลง",
  onConfirm,
}) => {
  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    else onClose();
  };

  return (
    <Modal
      title={
        <div className="text-center text-theme font-extrabold w-full text-lg">
          {header}
        </div>
      }
      centered
      open={open}
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
            <button className="btn-theme w-24" onClick={handleConfirm}>
              {buttonText}
            </button>
          </div>
        </div>
      }
    >
      <div className="mt-8 mb-20 text-center">
        <Image
          src={imgSrc}
          alt="Failed Icon"
          className="mx-auto mb-6"
          width={200}
          height={200}
          priority
        />
        <p className="whitespace-pre-line">{message}</p>
      </div>
    </Modal>
  );
};

export default ModalFailed;
