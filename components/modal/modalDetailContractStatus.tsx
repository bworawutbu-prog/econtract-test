
import { Modal } from "antd";
import { X } from "lucide-react";
import {
  BadgeCheck,Stamp
} from "lucide-react";
import {
  ContractData, OwnerContract,
  CoContract,
} from "@/store/types/contractStatusType";

interface detailContractStatusModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  data: ContractData | null;
}

export const DetailContractStatusModal: React.FC<detailContractStatusModalProps> = ({
  isOpen,
  onClose,
  title,
  data,
}) => {
  const checkStatusTransaction = (data: string) => {
    switch (data) {
      case "0":
        return (
          <span className="w-fit text-s font-bold text-[#FDB131] bg-[#FEF3D6] px-4 py-1 rounded-full">
            รอสร้าง Biz
          </span>
        );
      case "1":
        return (
          <span className="w-fit text-s font-bold text-[#00AAFF] bg-[#E6F7FF] px-4 py-1 rounded-full">
            Biz Level1
          </span>
        );
      case "2":
      // return (
      //   <span className="w-fit text-s font-bold text-[#367AF7] bg-[#E6EFFE] px-4 py-1 rounded-full">
      //     Biz Level2
      //   </span>
      // );
      case "3":
        return (
          <span className="w-fit text-s font-bold text-[#00C45A] bg-[#EAF8EF] px-4 py-1 rounded-full">
            Biz Level3
          </span>
        );
      default:
        return '-';
    }
  };

  const InBizBadge = ({ inBiz }: { inBiz?: boolean }) => {
    if (inBiz) {
      return (
        <span className="w-fit text-s font-bold text-[#00C45A] bg-[#EAF8EF] px-4 py-1 rounded-full">
          อยู่ใน Biz
        </span>
      );
    }
    return (
      <span className="w-fit text-s font-bold text-[#FDB131] bg-[#FEF3D6] px-4 py-1 rounded-full">
        ไม่อยู่ใน Biz
      </span>
    );
  };

  const PersonCABadge = ({ hasCA }: { hasCA?: boolean }) =>
    hasCA ? (
      <span className="flex items-center gap-2 text-[#0153BD]">
        <BadgeCheck className="w-5 h-5" /> พบ CA
      </span>
    ) : (
      <span className="flex items-center gap-2 text-[#C4C4C4]">
        <BadgeCheck className="w-5 h-5" /> ไม่พบ CA
      </span>
    );

  const BizStatus = ({ trustLevel }: { trustLevel?: string }) => (
    <>{checkStatusTransaction(trustLevel || "")}</>
  );

  const ContractSection = ({
    title,
    contract,
  }: {
    title: "ต้นสัญญา" | "คู่สัญญา";
    contract?: OwnerContract | CoContract;
  }) => {
    const biz = contract?.business;
    const participants = (contract && contract.participant_list) || [];
    const operator = contract && "operator" in contract ? contract.operator : null;

    return (
      <div className="mt-5">
        <span className="text-base font-[800] text-[#464646]">
          ติดตามสถานะ {biz?.name_on_document_th || "-"} ({title})
        </span>

        <div className="ml-2 mt-2 grid xxs:grid-cols-[auto,1fr] gap-x-4 gap-y-2 items-center">
          <span className="text-[#636363]">สถานะ Biz :</span>
          <BizStatus trustLevel={biz?.trust_level} />

          <span className="text-[#636363]">สถานะ CA :</span>
          {biz?.has_ca ? (
            <span className="flex items-center gap-2 text-[#0153BD]">
              <BadgeCheck className="w-5 h-5" /> พบ CA
            </span>
          ) : (
            <span className="flex items-center gap-2 text-[#C4C4C4]">
              <BadgeCheck className="w-5 h-5" /> ไม่พบ CA
            </span>
          )}
          <span className="text-[#636363]">ตราประทับองค์กร :</span>
          {biz?.has_seal ? (
            <span className="flex items-center gap-2 text-[#0153BD]">
              <Stamp className="w-5 h-5" /> พบตราประทับ
            </span>
          ) : (
            <span className="flex items-center gap-2 text-[#C4C4C4]">
              <Stamp className="w-5 h-5" /> ไม่พบตราประทับ
            </span>
          )}
        </div>

        {operator && (
          <div className="mt-5">
            <span className="block text-base font-[800] text-[#464646] mb-3">
              ติดตามการพิสูจน์และยืนยันตัวตน
            </span>
            <div className="ml-2">
              <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 items-center">
                <span className="text-[#636363]">ผู้ดำเนินการ :</span>
                <span className="text-[#464646]">{operator.name || "-"}</span>

                <span className="text-[#636363]">Email :</span>
                <span className="text-[#464646] break-all">{operator.email || "-"}</span>

              </div>
            </div>
          </div>
        )}

        <span className="mt-4 block text-base font-[800] text-[#464646]">
          ผู้ลงนาม ({title})
        </span>

        {participants.length > 0 ? (
          <div
            className="mt-3 space-y-4"
          >
            {participants?.map((p, idx) => (
              <div key={p.id || idx}>
                <p className="text-[#636363] font-medium mb-2 ml-2">
                  ผู้ลงนามลำดับที่ {idx + 1} :
                </p>

                <span className="block text-[#464646] font-medium mb-2 break-all ml-4">
                  {p.name}
                </span>

                <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 items-center ml-6">
                  <span className="text-[#636363]">Email :</span>
                  <span className="text-[#464646]">{p.email || "-"}</span>

                  <span className="text-[#636363]">สถานะ Biz :</span>
                  <InBizBadge inBiz={p.is_in_business} />

                  <span className="text-[#636363]">สถานะ CA :</span>
                  <PersonCABadge hasCA={p.has_ca} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="my-6 flex justify-center items-center text-[#858585] font-medium">
            ไม่มีผู้ลงนามในลำดับ
          </div>
        )}
      </div>
    );
  };


  return (
    <div>
      <Modal
        open={isOpen}
        onCancel={onClose}
        title={
          <div className="text-center text-theme font-extrabold w-full text-lg">
            {title}
          </div>
        }
        centered
        closeIcon={
          <span className="hover:opacity-70 rounded-full cursor-pointer inline-flex items-center justify-center">
            <X size={20} />
          </span>
        }
        width={420}
        className="[&_.ant-modal-content]:rounded-[24px]"
        footer={[]}

      >
        <div className="max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <div className="flex-col mt-1 mb-5">
            <div className="mt-5">
              <ContractSection title="ต้นสัญญา" contract={data?.owner_contract} />
              <ContractSection title="คู่สัญญา" contract={data?.co_contract} />
            </div>
          </div>
        </div>
      </Modal >
    </div >
  );
};
