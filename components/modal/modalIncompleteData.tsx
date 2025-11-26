"use client"

import React, { useState } from "react";
import { Modal, Button } from "antd";
import incompletedataIcon from "@/assets/image/modal/modalIncompleteData.webp";
import Image from "next/image";
import { X } from "lucide-react";

interface IncompleteDataModalProps {
    titleName?: string;
    modalIcon?: string;
    message?: string;
    open: boolean;
    onClose: () => void;
    closeButtonText?: string;
}

export const IncompleteDataModal: React.FC<IncompleteDataModalProps> = ({
    titleName,
    modalIcon = incompletedataIcon,
    message = "ไม่พบข้อมูลคู่สัญญา\nกรุณาตรวจสอบข้อมูลของคุณอีกครั้ง",
    open,
    onClose,
    closeButtonText = "ตกลง",
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
            style={{ maxWidth: "400px", maxHeight:"401px" }}
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
                        <button className="btn-theme w-24"
                            onClick={onClose} >
                            {closeButtonText}
                        </button>
                    </div>
                </div>
            }
        >
            <div className="mt-8 mb-20 text-center">
                {modalIcon && (
                    <Image
                        src={modalIcon || incompletedataIcon}
                        alt="DeleteDocType Icon"
                        className="mx-auto mb-6"
                        width={140}
                        height={140}
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
