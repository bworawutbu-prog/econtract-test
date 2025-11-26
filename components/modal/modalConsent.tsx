"use client"

import { Modal, Button } from "antd";
import Image from "next/image";

export const ModalConsent = ({ open, onClose }: { open: boolean, onClose: () => void }) => {
  return (
    <Modal 
      open={open} 
      onCancel={onClose}
    //   title="Consent Form"
      width={1000}
      style={{
        maxWidth: "1000px",
        width: "100%",
      }}
      styles={{
        body: {
          height: "500px",
          overflowY: "auto",
          padding: "16px",
        }
      }}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>
      ]}
    >
      <div className="w-full">
        <Image 
          src="/term_of_use/screencapture-one-th-privacy-policy-2025-09-27-14_38_04.webp" 
          alt="Consent Form" 
          width={1000} 
          height={940}
          className="w-full h-auto object-contain"
        />
      </div>
    </Modal>
  )
}