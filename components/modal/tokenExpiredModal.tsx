"use client";

import React from "react";
import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

interface TokenExpiredModalProps {
  open: boolean;
  onConfirm: () => void;
}

export const TokenExpiredModal: React.FC<TokenExpiredModalProps> = ({
  open,
  onConfirm,
}) => {
  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-red-600">
          <ExclamationCircleOutlined />
          <span>เซสชันหมดอายุ</span>
        </div>
      }
      open={open}
      onOk={onConfirm}
      onCancel={onConfirm} // ไม่ว่าจะกด OK หรือ Cancel ก็ redirect
      okText="เข้าสู่ระบบใหม่"
      cancelText="ปิด"
      centered
      closable={false} // ไม่ให้ปิดด้วย X
      maskClosable={false} // ไม่ให้ปิดด้วยการคลิกนอก modal
      className="[&_.ant-modal-content]:rounded-[24px]"
    >
      <div className="py-4">
        <p className="text-gray-700 mb-2">
          เซสชันของคุณหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่อีกครั้ง
        </p>
        <p className="text-sm text-gray-500">
          เพื่อความปลอดภัย ระบบจะนำคุณไปยังหน้าเข้าสู่ระบบ
        </p>
      </div>
    </Modal>
  );
}; 