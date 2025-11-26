"use client";
import { Button, Modal } from "antd";
import { X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import cancelPartnerContractIcon from "@/assets/image/modal/cancel-partner-contract.webp";

interface CancelB2BPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  co_contract_id: string;
}

export default function CancelB2BPartnerModal({
  isOpen,
  onClose,
  co_contract_id,
}: CancelB2BPartnerModalProps) {
  const [isLoading, setLoading] = useState(false);

  const handleConfirm = () => {};

  const handleCancel = () => {
    onClose();
  };
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={
        <div className="text-center text-theme font-extrabold w-full text-lg">
          ยกเลิกคู่สัญญา
        </div>
      }
      centered
      closeIcon={
        <span className="hover:opacity-70 rounded-full cursor-pointer inline-flex items-center justify-center">
          <X size={20} />
        </span>
      }
      width={400}
      className="[&_.ant-modal-content]:rounded-[24px]"
      footer={
        <div className="absolute bottom-0 left-0 right-0 bg-white shadow-[0px_-4px_8px_-2px_rgba(78,115,248,0.04)] py-4 rounded-b-[24px]">
          <div className="flex w-full justify-center items-center gap-6">
            <Button
              type="text"
              className="w-24 text-theme btn py-4"
              onClick={handleCancel}
            >
              ยกเลิก
            </Button>
            <button className="btn-theme w-24" onClick={handleConfirm}>
              ตกลง
            </button>
          </div>
        </div>
      }
    >
      <div className="max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <div className="flex-col mt-1 mb-5">
          <div className="mt-5 mb-[2.5rem]">
            <div className="flex flex-col justify-center items-center">
              <Image
                src={cancelPartnerContractIcon}
                alt="Cancel Partner Contract Icon"
                className="mx-auto mb-6"
                width={171.9}
                height={185.2}
                priority
              />
              <p className="text-center text-[#464646] font-[400] w-full text-[16px]">
                คุณต้องการดำเนินการยกเลิกเป็นคู่สัญญากับบริษัทนี้ ใช่หรือไม่?
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
