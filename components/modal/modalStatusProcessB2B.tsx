"use client"; 

import React, { useEffect } from "react";
import { Modal } from "antd";
import ProcessingIcon from "@/assets/webp/processing.webp"
import FailedIcon from "@/assets/webp/rejectedIcon.webp"
import ApprovedIcon from "@/assets/webp/approveIcon.webp"
import Image from "next/image";
import { X } from "lucide-react";

interface StatusB2BModalProp {
  status: string;
  open: boolean;
  onClose: () => void;
  autoCloseDelay?: number;
}

export const StatusB2BModal: React.FC<StatusB2BModalProp> = ({
  status = '',
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
        <div className={`text-center ${status === 'approved' ? 'text-[#166534]' : 'text-[#e5484d]'} font-extrabold w-full text-lg`}>
          {status === "approved" ? "สำเร็จ":"ไม่สำเร็จ"}
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
            src={status === "approved" ? ApprovedIcon : FailedIcon}
            alt="B2B Status Icon"
            className="mx-auto mb-6"
            width={100}
            height={100}
            priority
          />

        {/* <p>สำเร็จ <br/> </p> */}
      </div>
    </Modal>
  );
};
