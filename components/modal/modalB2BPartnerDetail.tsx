"use client";
import { Modal, Tag } from "antd";
import { EyeIcon, X } from "lucide-react";
import TableComponent from "../ui/table";
import { useEffect, useState } from "react";
import CAUnCheckIcon from "@/assets/webp/profile/ca_uncheck.webp";
import CACheckIcon from "@/assets/webp/profile/ca_check.webp";
import Image from "next/image";

interface PartnerData {
  id: number;
  thai_name: string;
  english_name: string;
  position: string;
  id_card: string;
  phone: string;
  email: string;
  ca_status: "Y" | "N";
}

interface ModalB2BPartnerDetailProps {
  isOpen: boolean;
  onClose: () => void;
  co_contract_id: string;
}

const mockData: PartnerData[] = [
  {
    id: 1,
    thai_name: "ปวร กีรติการดร",
    english_name: "Paworn Keeratiparadon",
    position: "Tester",
    id_card: "1234699010234",
    phone: "0912345678",
    email: "Paworn@one.th",
    ca_status: "Y",
  },
  {
    id: 2,
    thai_name: "ปวร กีรติการดร",
    english_name: "Paworn Keeratiparadon",
    position: "Tester",
    id_card: "1234699010234",
    phone: "0912345678",
    email: "Paworn@one.th",
    ca_status: "N",
  },
  {
    id: 3,
    thai_name: "ปวร กีรติการดร",
    english_name: "Paworn Keeratiparadon",
    position: "Tester",
    id_card: "1234699010234",
    phone: "0912345678",
    email: "Paworn@one.th",
    ca_status: "Y",
  },
  {
    id: 4,
    thai_name: "ปวร กีรติการดร",
    english_name: "Paworn Keeratiparadon",
    position: "Tester",
    id_card: "1234699010234",
    phone: "0912345678",
    email: "Paworn@one.th",
    ca_status: "N",
  },
  {
    id: 5,
    thai_name: "ปวร กีรติการดร",
    english_name: "Paworn Keeratiparadon",
    position: "Tester",
    id_card: "1234699010234",
    phone: "0912345678",
    email: "Paworn@one.th",
    ca_status: "Y",
  },
  {
    id: 6,
    thai_name: "ปวร กีรติการดร",
    english_name: "Paworn Keeratiparadon",
    position: "Tester",
    id_card: "1234699010234",
    phone: "0912345678",
    email: "Paworn@one.th",
    ca_status: "N",
  },
  {
    id: 7,
    thai_name: "ปวร กีรติการดร",
    english_name: "Paworn Keeratiparadon",
    position: "Tester",
    id_card: "1234699010234",
    phone: "0912345678",
    email: "Paworn@one.th",
    ca_status: "Y",
  },
  {
    id: 8,
    thai_name: "ปวร กีรติการดร",
    english_name: "Paworn Keeratiparadon",
    position: "Tester",
    id_card: "1234699010234",
    phone: "0912345678",
    email: "Paworn@one.th",
    ca_status: "N",
  },
  {
    id: 9,
    thai_name: "ปวร กีรติการดร",
    english_name: "Paworn Keeratiparadon",
    position: "Tester",
    id_card: "1234699010234",
    phone: "0912345678",
    email: "Paworn@one.th",
    ca_status: "Y",
  },
  {
    id: 10,
    thai_name: "ปวร กีรติการดร",
    english_name: "Paworn Keeratiparadon",
    position: "Tester",
    id_card: "1234699010234",
    phone: "0912345678",
    email: "Paworn@one.th",
    ca_status: "N",
  },
];

export default function B2BPartnerDetailModal({
  isOpen,
  onClose,
  co_contract_id,
}: ModalB2BPartnerDetailProps) {
  const [isLoading, setLoading] = useState(false);
  const [items, setItems] = useState<PartnerData[]>([]);

  const columns = [
    {
      title: <div className="text-center">ลําดับ</div>,
      dataIndex: "id",
      key: "id",
      width: "6%",
      align: "center" as const,
      render: (_: string, __: PartnerData, index: number) => index + 1,
    },
    {
      title: <div className="text-center">ชื่อ (ไทย)</div>,
      dataIndex: "thai_name",
      key: "thai_name",
      align: "center" as const,
    },
    {
      title: <div className="text-center">ชื่อ (อังกฤษ)</div>,
      dataIndex: "english_name",
      key: "english_name",
      align: "center" as const,
    },
    {
      title: <div className="text-center">ตําแหน่ง</div>,
      dataIndex: "position",
      key: "position",
      align: "center" as const,
    },
    {
      title: <div className="text-center">เลขบัตรประชาชน</div>,
      dataIndex: "id_card",
      key: "id_card",
      align: "center" as const,
    },
    {
      title: <div className="text-center">เบอร์โทรศัพท์</div>,
      dataIndex: "phone",
      key: "phone",
      align: "center" as const,
    },
    {
      title: <div className="text-center">อีเมล</div>,
      dataIndex: "email",
      key: "email",
      align: "center" as const,
    },
    {
      title: <div className="text-center">สถานะ CA เจ้าหน้าที่นิติบุคคล</div>,
      dataIndex: "ca_status",
      key: "ca_status",
      align: "center" as const,
      render: (value: "Y" | "N") => (
        <div className="flex items-center justify-center gap-2">
          {value === "Y" ? (
            <>
              <Image src={CACheckIcon} alt="CA Check" width={16} height={16} />
              <p className="font-medium text-theme m-0">พบ CA</p>
            </>
          ) : (
            <>
              <Image
                src={CAUnCheckIcon}
                alt="CA Uncheck"
                width={16}
                height={16}
              />
              <p className="font-normal text-[#C4C4C4] m-0">ไม่พบ CA</p>
            </>
          )}
        </div>
      ),
    },
    {
      title: <div className="text-center">จัดการ</div>,
      dataIndex: "manage",
      key: "manage",
      align: "center" as const,
      render: (_: string, record: PartnerData) => (
        <div className="flex items-center justify-center gap-2">
          <EyeIcon className="text-theme cursor-pointer" size={24} />
        </div>
      ),
    },
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setItems(mockData);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={
        <div className="text-center text-theme font-extrabold w-full text-lg">
          รายละเอียด
        </div>
      }
      centered
      closeIcon={
        <span className="hover:opacity-70 rounded-full cursor-pointer inline-flex items-center justify-center">
          <X size={20} />
        </span>
      }
      width={1400}
      className="[&_.ant-modal-content]:rounded-[24px]"
      footer={[]}
    >
      <div className="max-h-[450px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pt-3">
        <div className="flex-col mt-1 mb-5">
          <TableComponent
            columns={columns}
            dataSource={items?.map((item) => ({
              key: item.id,
              ...item,
            }))}
            loading={isLoading}
          />
        </div>
      </div>
    </Modal>
  );
}
