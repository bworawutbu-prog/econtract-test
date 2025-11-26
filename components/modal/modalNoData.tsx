"use client"

import React from "react";
import { Modal } from "antd";
import nodataIcon from "@/assets/image/modal/modalNoData.webp";
import Image from "next/image";
import { X } from "lucide-react";

interface NoDataModalProps {
    titleName?: string;
    modalIcon?: string;
    message?: string;
    open: boolean;
    onClose: () => void;
    closeButtonText?: string;
}

export const NoDataModal: React.FC<NoDataModalProps> = ({
    titleName,
    modalIcon = nodataIcon,
    message = "กรอกข้อมูลไม่ครบถ้วน\nกรุณาตรวจสอบข้อมูลของคุณอีกครั้ง",
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
            style={{ maxWidth: "400px", maxHeight: "391px" }}
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
                        src={modalIcon || nodataIcon}
                        alt="NoData Icon"
                        className="mx-auto mb-6"
                        width={130}
                        height={130}
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
