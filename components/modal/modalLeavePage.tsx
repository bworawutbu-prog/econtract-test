"use client"

import React, { useState } from "react";
import { Modal, Button } from "antd";
import leavepageIcon from "@/assets/image/modal/modalLeavePage.webp";
import Image from "next/image";
import { X } from "lucide-react";

interface LeavePageModalProps {
    titleName?: string;
    modalIcon?: string;
    message?: string;
    open: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
    cancelButtonText?: string;
    confirmButtonText?: string;
}

export const SendEmailModal: React.FC<LeavePageModalProps> = ({
    titleName,
    modalIcon = leavepageIcon,
    message = "หากคุณออกจากหน้านี้ ข้อมูลที่กำลังดำเนินการอยู่\nจะไม่ถูกบันทึก ต้องการออกจากหน้านี้หรือไม่?",
    open,
    onConfirm,
    onCancel,
    cancelButtonText = "ยกเลิก",
    confirmButtonText = "ตกลง",
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
            style={{ maxWidth: "400px", maxHeight:"337.38px" }}
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
                        <Button type="text" className="w-24 text-theme btn py-4" onClick={onCancel}>
                            {cancelButtonText}
                        </Button>
                        <button className="btn-theme w-24"
                            onClick={onConfirm} >
                            {confirmButtonText}
                        </button>
                    </div>
                </div>
            }
        >
            <div className="mt-8 mb-20 text-center">
                {modalIcon && (
                    <Image
                        src={modalIcon || leavepageIcon}
                        alt="LeavePage Icon"
                        className="mx-auto mb-6"
                        width={197.82}
                        height={126.38}
                        priority
                    />
                )}
                {message && <p className="whitespace-pre-line">
                    {message}
                </p>}
            </div>
        </Modal>
    );
};
