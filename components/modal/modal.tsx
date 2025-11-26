"use client";

import React, { useState, ReactNode } from "react";
import { Flex, Modal, Button } from "antd";
import { ConfirmModal } from "./modalConfirm";
import { SuccessModal } from "./modalSuccess";
import { ErrorModal } from "./modalError";
import { PasswordMissingModal } from "./modalPasswordMissing";
import { X } from "lucide-react";
import signdel from "@/assets/webp/delSign.webp";
import router from "next/router";

interface ModalComponentProps {
  btnName?: ReactNode;
  titleName?: string;
  btnConfirm?: string;
  children?: ReactNode;
  onConfirm: () => Promise<boolean>;
  isDisabled?: boolean;
  triggerBtnClassName?: string;
  cancelBtnClassName?: string;
  confirmBtnClassName?: string;
  modalClassName?: string;
  modalWidth?: string | number;
  open?: boolean;
  onClose?: () => void;
  modalType?: "rename" | "delete" | "create" | "default" | "addBusiness" | "createB2B" | "invite";
  confirmMessage?: string;
  isLoading?: boolean;
  errorMessage?: string;
  onAfterClose?: () => void;
  onErrorClose?: () => void; // 🎯 NEW: Callback เมื่อปิด error modal
}

const ModalComponent: React.FC<ModalComponentProps> = ({
  btnName,
  titleName,
  btnConfirm = "บันทึก",
  children,
  onConfirm,
  isDisabled = false,
  triggerBtnClassName = "btn-theme",
  cancelBtnClassName = "w-24 text-theme",
  confirmBtnClassName = "w-24",
  modalClassName = "max-w-[600px]",
  modalWidth,
  open,
  onClose,
  modalType = "default",
  confirmMessage,
  isLoading,
  errorMessage,
  onAfterClose,
  onErrorClose, // 🎯 NEW: Callback เมื่อปิด error modal
}) => {
  const [isInternalOpen, setInternalOpen] = useState(false);
  const isMainOpen = open !== undefined && open !== null ? open : isInternalOpen;
  const handleClose = onClose || (() => setInternalOpen(false));
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [isSuccessOpen, setSuccessOpen] = useState(false);
  const [isErrorOpen, setErrorOpen] = useState(false);
  const [isPasswordMissingOpen, setPasswordMissingOpen] = useState(false);

  // 🎯 Generate unique ID for this modal instance
  const modalId = React.useId().replace(/:/g, '-');

  const handleMainOk = async () => {
    if (modalType === "create") {
      // For create modals, use the 2-step flow like other modals
      handleClose();
      setConfirmOpen(true);
    } else {
      // For other modals, use the original 2-step flow
      handleClose();
      setConfirmOpen(true);
    }
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    try {
      const result = await onConfirm();
      if (result) {
        setSuccessOpen(true);
      } else {
        setErrorOpen(true);
      }
    } catch (error) {
      setErrorOpen(true);
    }
  };

  const getConfirmMessage = () => {
    if (confirmMessage) return confirmMessage;

    switch (modalType) {
      case "rename":
        return "คุณต้องการบันทึกการแก้ไขชื่อหรือไม่";
      case "addBusiness":
        return "คุณต้องการเพิ่ม Business หรือไม่";
      case "delete":
        return "คุณต้องการลบรายการนี้หรือไม่";
      case "create":
        return "คุณต้องการบันทึกการสร้างรายการหรือไม่";
      case "createB2B":
        return "คุณต้องการบันทึกข้อมูลคู่สัญญาหรือไม่?";
      case "invite":
        return "คุณต้องการส่งเชิญอีเมลการลงทะเบียนหรือไม่?";
      default:
        return "คุณต้องการบันทึกข้อมูลหรือไม่";
    }
  };

  const getConfirmLabel = () => {
    switch (modalType) {
      case "delete":
        return "ยืนยันการลบ";
      case "createB2B":
        return "บันทึก";
      case "invite":
        return "ส่งเชิญลงทะเบียน";
      default:
        return "ยืนยัน";
    }
  };

  const handleErrorClose = () => {
    setErrorOpen(false);
    
    // 🎯 เรียก callback เพื่อเคลียร์ข้อมูล
    if (onErrorClose) {
      onErrorClose();
    }
  };

  return (
    <Flex vertical gap="middle" align="flex-start">
      {(open === undefined || open === null) && (
        <button
          className={triggerBtnClassName}
          onClick={() => setInternalOpen(true)}
        >
          {btnName}
        </button>
      )}

      <Modal
        title={
          <div className="text-center text-theme font-extrabold w-full text-base sm:text-lg px-2">
            {titleName}
          </div>
        }
        centered
        open={isMainOpen}
        onOk={handleMainOk}
        onCancel={handleClose}
        afterClose={onAfterClose}
        style={{
          maxWidth: modalClassName || "600px",
          // 🎯 MOBILE RESPONSIVE: Remove fixed minWidth, use responsive approach
          minWidth: "min(400px, 90vw)" // Will be 90vw on screens smaller than 444px
        }}
        confirmLoading={isLoading}
        closeIcon={
          <span className="hover:opacity-70 rounded-full cursor-pointer inline-flex items-center justify-center">
            <X size={20} />
          </span>
        }
        className="[&_.ant-modal-content]:rounded-[24px] [&_.ant-modal-wrap]:!p-4 sm:[&_.ant-modal-wrap]:!p-8"
        wrapClassName={modalWidth ? `modal-custom-width-${modalId}` : ""}
        modalRender={(node) => (
          <div className="relative">
            {modalWidth && (
              <style>
                {`
                  .modal-custom-width-${modalId} .ant-modal {
                    width: min(${typeof modalWidth === 'number' ? `${modalWidth}px` : modalWidth}, ${modalClassName || "95vw"}) !important;
                  }
                `}
              </style>
            )}
            {node}
          </div>
        )}
        footer={
          <div className="absolute bottom-0 left-0 right-0 bg-white shadow-[0px_-4px_8px_-2px_rgba(78,115,248,0.04)] py-3 sm:py-4 rounded-b-[24px]">
            <div className="flex w-full justify-center items-center gap-3 sm:gap-6 px-2 sm:px-0">
              <Button
                type="text"
                className={`${cancelBtnClassName} btn py-2 sm:py-2 min-w-20 sm:min-w-24`}
                onClick={handleClose}
              >
                ยกเลิก
              </Button>
              <button
                className={`${isDisabled ? "btn bg-gray-300 text-white" : "btn-theme"
                  } ${confirmBtnClassName} min-w-20 sm:min-w-24 py-2 sm:py-2`}
                onClick={handleMainOk}
                disabled={isDisabled}
              >
                {btnConfirm}
              </button>
            </div>
          </div>
        }
      >
        <div className="items-center mt-4 sm:mt-8 mb-16 sm:mb-20 space-y-4">
          {modalType === "delete" && (
            <div className="flex justify-center items-center">
              <img
                src={signdel.src}
                alt="ลบลายเซ็น"
                className="w-24 h-24 md:w-48 md:h-48 object-contain"
              />
            </div>
          )}

          <div className="mt-4 sm:mt-8 mb-16 sm:mb-20">{children}</div>
        </div>
      </Modal>

      <ConfirmModal
        titleName={getConfirmLabel()}
        message={getConfirmMessage()}
        open={isConfirmOpen}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
      {/* <PasswordMissingModal
        titleName="ยืนยัน"
        open={isPasswordMissingOpen}
        onConfirm={() => {
          router.push("https://one.th/register")
        }}
        onCancel={() => {
          setPasswordMissingOpen(false)
        }}
      /> */}
      <SuccessModal
        titleName="สำเร็จ"
        open={isSuccessOpen}
        onClose={() => setSuccessOpen(false)}
      />

      <ErrorModal
        titleName="บันทึกไม่สำเร็จ"
        message={errorMessage || "ไม่สามารถบันทึกข้อมูลได้ เนื่องจากมีในระบบแล้วกรุณาตรวจสอบอีกครั้ง เพื่อดำเนินการต่อ"}
        open={isErrorOpen}
        onClose={handleErrorClose}
      />
    </Flex>
  );
};

export default ModalComponent;
