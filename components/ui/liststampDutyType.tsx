"use client";

import { listTypeStampDuty } from "@/store/types/estampTypes";
import { Divider, Typography } from "antd";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";

interface ListStampDutyTypeProps<B> {
  dataForm: listTypeStampDuty[];
  sortGroup?: string;
  total: number;
}

const ListStampDutyType = <B extends listTypeStampDuty>({
  dataForm = [],
  sortGroup = "",
  total = 0
}: ListStampDutyTypeProps<B>) => {
  const router = useRouter();

  return (
    <div className="flex-row mt-4">
      <div className="mb-4">รายการเอกสารทั้งหมด {total || 0} รายการ</div>
      <div>
        {dataForm?.map((item, index) => (
          <div
            key={index}
            className="flex border-[1px] border-[#F0F6FF] rounded-xl p-4 mb-4 gap-2 cursor-pointer"
            onClick={() => router.push(`/stamp/form/type/${item.id}?docType=${item.name}`)}
          >
            <FileText size={40} color="#FF4D4F" />
            {/* <div className="flex items-center font-bold ">{item.name}</div> */}
            <div className="flex-col w-full justify-between">
              <div className="font-bold w-full">{item.name}</div>
              <div className="flex justify-between gap-2 mt-2">
                {/* <div className="flex text-sm items-center gap-1">
                  <FileText size={16} color="#6b7280" />
                  <span className="text-gray-500">จำนวนเอกสาร :</span>
                  <span className="text-gray-500">
                    {item?.total_document || 0} ฉบับ
                  </span>
                </div> */}
                <div className="text-sm">
                  <span className="rounded-full bg-[#e5f6ff] py-1 px-2 text-[#00AAFF]">
                    รอยื่นแบบอากร
                  </span>{" "}
                  : {item?.transaction_count || 0} ฉบับ{" "}
                  {/* <Divider type="vertical" className="!ml-2 !mr-3" />
                  <span className="rounded-full bg-[#eaf8ef] py-1 px-2 text-[#00C45A]">
                    เสียอากรแล้ว
                  </span>{" "}
                  : {2} ฉบับ */}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListStampDutyType;
