"use client";
import React from "react";
import { Modal, Button } from "antd";
import restoredocIcon from "@/assets/image/modal/modalRestoreDoc.webp";
import Image from "next/image";
import { X } from "lucide-react";

interface RestoreDocModalProps {
    titleName?: string;
    modalIcon?: string;
    message?: string;
    open: boolean;
    onConfirm: (reason?: string) => void;
    onCancel: () => void;
    showReasonInput?: boolean;
    onReasonChange?: (value: string) => void;
}

export const RestoreModal: React.FC<RestoreDocModalProps> = ({
    titleName,
    modalIcon = restoredocIcon,
    message = "หากคุณต้องการเรียกคืนเอกสารนี้?\nกรุณาระบุเหตุผล",
    open,
    onConfirm,
    onCancel,
    showReasonInput = true,
    onReasonChange,
}) => {
    const [reason, setReason] = React.useState("");

    React.useEffect(() => {
        if (!open) setReason("");
    }, [open]);

    return (
        <Modal
            title={
                <div className="text-center text-theme font-extrabold w-full text-lg">
                    {titleName}
                </div>
            }
            centered
            open={open}
            onOk={() => onConfirm(reason)}
            onCancel={onCancel}
            style={{ maxWidth: "424px", maxHeight:"513px" }}
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
                        <Button
                            type="text"
                            className="w-24 text-theme btn py-4"
                            onClick={onCancel}
                        >
                            ยกเลิก
                        </Button>
                        <button
                            className={`w-24 py-4 rounded-full ${reason.trim()
                                    ? "btn-theme"
                                    : "bg-gray-200 text-white cursor-not-allowed"
                                }`}
                            onClick={() => onConfirm(reason)}
                            disabled={!reason.trim()}
                        >
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
                        alt="RestoreDoc Icon"
                        className="mx-auto mb-6"
                        width={120}
                        height={120}
                        priority
                    />
                )}
                {message && <p className="whitespace-pre-line">
                    {message}
                </p>}

                {showReasonInput && (
                    <div className="text-left mt-6">
                        <label className="block text-sm font-bold mb-2">เหตุผล</label>
                        <textarea
                            className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="รายละเอียด"
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                onReasonChange?.(e.target.value);
                            }}
                            rows={4}
                        />
                    </div>
                )}
            </div>
        </Modal>
    );
};
