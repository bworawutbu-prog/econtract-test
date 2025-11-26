"use client"; 

import React, { useEffect } from "react";
import { Modal } from "antd";
import successIcon from "@/assets/image/modal/success.webp";
import NoData from "@/assets/webp/inbox/no-data.webp";
import Image from "next/image";
import { X } from "lucide-react";

interface WarnningModalProps {
  open: boolean;
  onClose: () => void;
}

export const WarnningModal: React.FC<WarnningModalProps> = ({
  open,
  onClose,
}) => {

  return (
    <Modal
      title={
        <div className="text-center text-theme font-extrabold w-full text-lg">
          ข้อมูลไม่ครบถ้วน
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
            src={NoData}
            alt="Success Icon"
            className="mx-auto mb-6"
            width={100}
            height={100}
            priority
          />

        <p>ไม่พบข้อมูลคู่สัญญา</p>
      </div>
    </Modal>
  );
};
