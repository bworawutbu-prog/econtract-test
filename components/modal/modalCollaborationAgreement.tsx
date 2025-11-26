"use client";
import { Modal, Tag, Tooltip } from "antd";
import { X } from "lucide-react";
import TableComponent from "../ui/table";
import { useEffect, useRef, useState } from "react";

type ContractStatus = "S" | "P" | "R";

interface CollaborationAgreementData {
  id: number;
  number: string;
  document_name: string;
  status: ContractStatus;
}

interface CollaborationAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  co_contract_id: string;
}

const mockData: CollaborationAgreementData[] = [
  {
    id: 1,
    number: "12345",
    document_name: "เอกสาร A lorem9000000000000000000000aaaaaaaaaaa",
    status: "S",
  },
  { id: 2, number: "23234", document_name: "เอกสาร A", status: "P" },
  { id: 3, number: "56432", document_name: "เอกสาร A", status: "R" },
  { id: 4, number: "13453", document_name: "เอกสาร A", status: "R" },
  { id: 5, number: "56763", document_name: "เอกสาร A", status: "P" },
  { id: 6, number: "12345", document_name: "เอกสาร A", status: "R" },
  { id: 7, number: "12345", document_name: "เอกสาร A", status: "S" },
  { id: 8, number: "12345", document_name: "เอกสาร A", status: "S" },
  { id: 9, number: "12345", document_name: "เอกสาร A", status: "P" },
  { id: 10, number: "12345", document_name: "เอกสาร A", status: "R" },
];

const EllipsisWithTooltip = ({ text }: { text: string }) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    if (spanRef.current) {
      setIsTruncated(spanRef.current.scrollWidth > spanRef.current.clientWidth);
    }
  }, [text]);

  return (
    <Tooltip
      title={isTruncated ? text : ""}
      placement="topLeft"
      styles={{
        body: {
          width: "500px",
        },
      }}
    >
      <span
        ref={spanRef}
        className="inline-block max-w-[320px] overflow-hidden text-ellipsis whitespace-nowrap align-middle cursor-pointer"
      >
        {text}
      </span>
    </Tooltip>
  );
};

export default function CollaborationAgreementModal({
  isOpen,
  onClose,
  co_contract_id,
}: CollaborationAgreementModalProps) {
  const [isLoading, setLoading] = useState(false);
  const [items, setItems] = useState<CollaborationAgreementData[]>([]);

  const statusMap: Record<
    ContractStatus,
    { text: string; color: string; textColor: string }
  > = {
    S: { text: "ดำเนินการสำเร็จ", color: "#EAF8EF", textColor: "#00C45A" },
    P: { text: "รอดำเนินการ", color: "#FEF3D6", textColor: "#FDB131" },
    R: { text: "ปฏิเสธ", color: "#FFEEEE", textColor: "#FF5957" },
  };

  const contractColumns = [
    {
      title: "รายการที่",
      dataIndex: "id",
      key: "id",
      width: "6%",
      align: "center" as const,
      render: (_: string, __: CollaborationAgreementData, index: number) =>
        index + 1,
    },
    {
      title: "เลขที่",
      dataIndex: "number",
      key: "number",
      width: "10%",
    },
    {
      title: "ชื่อเอกสาร",
      dataIndex: "document_name",
      key: "document_name",
      width: "20%",
      render: (text: string) => {
        if (!text) return "-";
        return <EllipsisWithTooltip text={text} />;
      },
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      width: "20%",
      render: (value: ContractStatus) => {
        const { text, color, textColor } = statusMap[value];
        return (
          <Tag
            color={color}
            style={{
              color: textColor,
              borderRadius: "16px",
              padding: "4px 10px",
              fontWeight: 500,
              fontSize: "13px",
            }}
          >
            {text}
          </Tag>
        );
      },
    },
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setItems(mockData);
      setLoading(false);
    }, 1000);
  }, []);
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={
        <div className="text-center text-theme font-extrabold w-full text-lg">
          สัญญาที่ทำร่วมกัน
        </div>
      }
      centered
      closeIcon={
        <span className="hover:opacity-70 rounded-full cursor-pointer inline-flex items-center justify-center">
          <X size={20} />
        </span>
      }
      width={900}
      className="[&_.ant-modal-content]:rounded-[24px]"
      footer={[]}
    >
      <div className="max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <div className="flex-col mt-1 mb-5">
          <div className="mt-5">
            <TableComponent
              columns={contractColumns}
              dataSource={items?.map((item) => ({
                id: item?.id,
                key: item?.id,
                number: item?.number,
                document_name: item?.document_name,
                status: item?.status,
              }))}
              loading={isLoading}
              scrollX={0}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
