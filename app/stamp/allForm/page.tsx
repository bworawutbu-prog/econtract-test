"use client"

import { Button, Tooltip, Skeleton, Spin } from "antd";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import { CountTransactionStatus, listEStamp } from "@/store/types/estampTypes";
import { useEffect, useState, useCallback } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  CheckStatusTransactionEstamp,
  CountTransactionEstamp,
  ListEstampTransaction,
  SendEmailTransactionEstamp,
} from "@/store/estampStore/typeEstamp";
import FilterAll from "@/assets/webp/inbox/filter-all.webp";
import FilterWaiting from "@/assets/webp/inbox/filter-waiting.webp";
import FilterRejected from "@/assets/webp/inbox/filter-rejected.webp";
import FilterCompleted from "@/assets/webp/inbox/filter-completed.webp";
import SendMailIcon from "@/assets/webp/stamp/sendmail.webp";
import EyeIcon from "@/assets/webp/stamp/eye.webp";
import AllItem from "@/assets/webp/stamp/allitem.webp";
import Image, { StaticImageData } from "next/image";
import { SearchOutlined } from "@ant-design/icons";
import { RefreshCcw } from "lucide-react";
import { detectApiError } from "@/utils/errorHandler";

// ✅ Dynamic imports สำหรับ heavy components
const TableComponent = dynamic(
  () => import("@/components/ui/table"),
  {
    loading: () => <Skeleton active paragraph={{ rows: 5 }} />,
    ssr: false,
  }
);

const SearchInput = dynamic(
  () => import("@/components/ui/searchInput"),
  {
    loading: () => <Skeleton.Input active style={{ width: 280 }} />,
    ssr: true,
  }
);

const SuccessModal = dynamic(
  () => import("@/components/modal/modalSuccess").then(mod => ({ default: mod.SuccessModal })),
  {
    loading: () => <Spin />,
    ssr: false,
  }
);

const ErrorModal = dynamic(
  () => import("@/components/modal/modalError").then(mod => ({ default: mod.ErrorModal })),
  {
    loading: () => <Spin />,
    ssr: false,
  }
);

type FilterButtonProps = {
  type: string;
  label: string;
  count: number;
  icon?: StaticImageData;
  onClick: () => void;
  styles?: {
    container: string;
    text: string;
    count: string;
    icon?: string;
  };
};

// Initialize dayjs plugins once at module load
dayjs.extend(buddhistEra);
dayjs.locale("th");

export default function AllFormStampDuty() {
  dayjs.extend(buddhistEra);
  dayjs.locale("th");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [transEtamp, setTransEstamp] = useState<listEStamp[]>([]);
  const [dataStamp, setDataStamp] = useState<listEStamp[]>([]);
  const [totalTransCount, setTotalTransCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [countTransaction, setCountTransaction] =
    useState<CountTransactionStatus>({
      total: "0",
      pending: "0",
      complete: "0",
      failed: "0",
    });
  const [isOpenSuccessModal, setIsOpenSuccessModal] = useState(false);
  const [isOpenErrorModal, setIsOpenErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [paginateValue, setPaginateValue] = useState({
    search: "",
    page: 1,
    size: 10,
    status: "total",
  });

  const columns = [
    {
      title: "ลำดับ",
      dataIndex: "index",
      key: "index",
      width: 45,
      align: "center" as const,
      render: (text: string, record: any, index: number) =>
        (paginateValue.page - 1) * paginateValue.size + (index + 1),
    },
    {
      title: "เลขที่เอกสาร",
      // title: <div className="text-center">เลขที่เอกสาร</div>,
      dataIndex: "edocument_id",
      key: "edocument_id",
      width: 100,
      // align: 'center',
    },
    {
      title: "ชื่อเอกสาร",
      // title: <div className="text-center">ชื่อเอกสาร</div>,
      dataIndex: "name",
      key: "name",
      width: 180,
    },
    {
      // title: "วันที่ยื่นแบบตราสาร",
      title: <div className="text-center">วันที่ยื่นแบบตราสาร</div>,
      dataIndex: "creation_date",
      key: "creation_date",
      width: 80,
      align: "center" as const,
    },
    {
      // title: "วันที่สิ้นสุดชำระเงิน",
      title: <div className="text-center">วันที่สิ้นสุดชำระเงิน</div>,
      dataIndex: "expire_date",
      key: "expire_date",
      width: 100,
      align: "center" as const,
    },
    {
      title: <div className="text-center">สถานะ</div>,
      dataIndex: "status",
      key: "status",
      width: 100,
      align: "center" as const,
      render: (text: string, item: any) => {
        switch (text) {
          case "complete":
            return (
              <div className="gird grid-cols-12 justify-center items-center space-y-2">
                <span className="rounded-lg bg-[#eaf8ef] py-1 px-2 text-[#00C45A]">
                  ชำระเงินสำเร็จ
                </span>
                {checkStatusDocs(item._id)}
              </div>
            );
          case "pending":
            return (
              <div className="flex flex-col justify-center items-center space-y-2">
                <span className="rounded-lg bg-[#fff5e6] py-1 px-2 text-[#FDB131]">
                  รอชำระเงิน
                </span>
                {checkStatusDocs(item._id)}
              </div>
            );
          // return (
          //   <span className="rounded-lg bg-[#fff5e6] py-1 px-2 text-[#FDB131]">
          //     รอชำระเงิน
          //   </span>
          // );
          case "failed":
            return (
              <div className="flex flex-col justify-center items-center space-y-2">
                <span className="rounded-lg bg-[#fee8e7] py-1 px-2 text-[#F54233]">
                  ชำระไม่สำเร็จ
                </span>
                {checkStatusDocs(item._id)}
              </div>
            );
          // return (
          //   <span className="rounded-lg bg-[#fee8e7] py-1 px-2 text-[#F54233]">
          //     ชำระไม่สำเร็จ
          //   </span>
          // );
        }
      },
    },
    {
      title: <div className="text-center">จัดการ</div>,
      key: "action",
      width: 100,
      align: "center" as const,
      render: (item: listEStamp) => {
        return (
          //  ? `opacity-50 pointer-events-none cursor-not-allowed w-35`
          //         : "w-24"
          <div className="flex justify-center items-center space-x-2">
            <Tooltip title="รายละเอียด">
              <Button
                icon={<Image src={EyeIcon} alt="send" className="w-4 h-4" />}
                onClick={() => {
                  sessionStorage.setItem('estamp_prev_path', '/stamp/allForm');
                  router.push(`/stamp/payment?transaction_estamp_id=${item._id}`);
                }}
                className="!bg-transparent 
            !border-[#FAFAFA] 
            !text-black 
            hover:!bg-transparent 
            hover:!text-black 
            hover:!border-[#FAFAFA]
            !shadow-[0px_0px_1px_0px_#28293D0A]
            "
              />
            </Tooltip>
            <Tooltip title="ส่งอีเมล">
              <Button
                icon={
                  <Image src={SendMailIcon} alt="send" className="w-4 h-4" />
                }
                onClick={() => SendMail(item.transaction_id)}
                className={`!bg-transparent 
            !border-[#FAFAFA] 
            !text-black 
            hover:!bg-transparent 
            hover:!text-black 
            hover:!border-[#FAFAFA]
            !shadow-[0px_0px_1px_0px_#28293D0A]
            ${item.status !== "complete"
                    ? `opacity-50 pointer-events-none cursor-not-allowed`
                    : ""
                  }`}
              />
            </Tooltip>

            {/* <button className="bg-red-500 border border-gray-300">
            <Eye size={20}/>
            </button>
            <button className="bg-red-500 border border-gray-300">
            <Image width={20} height={20} src={SendMailIcon} alt={`Send Mail`} className="m-2" />
            </button> */}
            {/* <span className="text-[#0153BD] hover:underline hover:text-[#4696ff] cursor-pointer" onClick={() => router.push(`/stamp/payment?transaction_estamp_id=${item._id}`)}>รายละเอียด</span> */}
          </div>
        );
      },
    },
    // {
    //   title: "เพิ่มเติม",
    //   key: "option",
    //   // align: 'center' as const,
    //   render: (item: listEStamp) => {
    //     if (item.status === "complete") {
    //       return (
    //         <Tooltip title="ส่งอีเมลการยืนยันการชำระเงินไปยังผู้ใช้งานทุกลำดับ">
    //           <Button
    //             className="bg-[#0153BD] text-white"
    //             onClick={() => SendMail(item.transaction_id)}
    //           >
    //             ส่ง Email
    //           </Button>
    //         </Tooltip>
    //       );
    //     } else if (item.status === "pending") {
    //       return (
    //         <Button
    //         className="bg-[#0153BD] text-white"
    //         onClick={() => handleCheckStatus(item._id)}
    //         >
    //           ตรวจสอบสถานะ
    //         </Button>
    //       )
    //     }
    //   },
    // },
  ];

  const checkStatusDocs = (id: string) => {
    return (
      <Tooltip title="ตรวจสอบสถานะ">
        <div onClick={() => handleCheckStatus(id)} className="flex items-center space-x-1 text-[#0153BD] cursor-pointer ">
          <RefreshCcw size={12} />
          <span className="underline underline-offset-4">
            อัปเดตสถานะ
          </span>
        </div>
      </Tooltip>
    )
  }

  const styleFilterButton = (type: string) => {
    switch (type) {
      case "total":
        return {
          bgColor:
            paginateValue?.status === "total" || paginateValue.status === ""
              ? "bg-[#0153bd]"
              : "bg-[#cce2ff]",
          borderColor:
            paginateValue?.status === "total" || paginateValue.status === ""
              ? "border-[#0153bd]"
              : "border-[#cce2ff]",
          textColor:
            paginateValue?.status === "total" || paginateValue.status === ""
              ? "text-white"
              : "text-[#636363]",
        };
      case "pending":
        return {
          bgColor:
            paginateValue?.status === "pending"
              ? "bg-[#fc9240]"
              : "bg-[#FEF3D6]",
          borderColor:
            paginateValue.status === "pending"
              ? "border-[#fc9240]"
              : "border-[#FEF3D6]",
          textColor:
            paginateValue?.status === "pending"
              ? "text-white"
              : "text-[#636363]",
        };
      case "complete":
        return {
          bgColor:
            paginateValue?.status === "complete"
              ? "bg-[#00c45a]"
              : "bg-[#EAF8EF]",
          borderColor:
            paginateValue?.status === "complete"
              ? "border-[#00c45a]"
              : "border-[#EAF8EF]",
          textColor:
            paginateValue?.status === "complete"
              ? "text-white"
              : "text-[#636363]",
        };
      case "failed":
        return {
          bgColor:
            paginateValue?.status === "failed"
              ? "bg-[#ff4d4f]"
              : "bg-[#FEE8E7]",
          borderColor:
            paginateValue?.status === "failed"
              ? "border-[#ff4d4f]"
              : "border-[#FEE8E7]",
          textColor:
            paginateValue?.status === "failed"
              ? "text-white"
              : "text-[#636363]",
        };
    }
  };

  const iconBackground = (type: string) => {
    switch (type) {
      case "total":
        return paginateValue?.status === "total" || paginateValue?.status === ""
          ? "bg-[#0153bd]"
          : "bg-[#0153bd]";
      case "pending":
        return paginateValue?.status === "pending"
          ? "bg-[#fc9240]"
          : "bg-[#FDE5A9]";
      case "complete":
        return paginateValue?.status === "complete"
          ? "bg-[#00c45a]"
          : "bg-[#D5F5E4]";
      case "failed":
        return paginateValue?.status === "failed"
          ? "bg-[#ff4d4f]"
          : "bg-[#FCB9B6]";
      default:
        return "bg-gray-200";
    }
  };

  const textColor = (type: string) => {
    switch (type) {
      case "total":
        return paginateValue?.status === "total" || paginateValue?.status === ""
          ? "text-white"
          : "text-[#0153bd]";
      case "pending":
        return paginateValue?.status === "pending"
          ? "text-white"
          : "text-[#FDB131]";
      case "complete":
        return paginateValue?.status === "complete"
          ? "text-white"
          : "text-[#00C45A]";
      case "failed":
        return paginateValue?.status === "failed"
          ? "text-white"
          : "text-[#F54233]";
      default:
        return "bg-gray-200";
    }
  };

  const FilterButton = ({
    type,
    label,
    count,
    onClick,
    icon,
  }: FilterButtonProps) => {
    const style = styleFilterButton(type) || {
      bgColor: "",
      borderColor: "",
      textColor: "",
    };
    // const iconBG = iconBackground(type) || {
    //   bgColor: ""
    // };

    return (
      <button
        className={`w-full min-h-[75px] ${style.bgColor} ${style.borderColor} ${style.textColor} border-[1px] rounded-xl flex justify-center items-center`}
        onClick={onClick}
      >
        <div className="flex gap-2 items-center px-4 w-full">
          <div className={`rounded-full px-3 py-2 ${iconBackground(type)}`}>
            {icon && (
              <Image src={icon} alt={`Filter ${label}`} className="w-8 h-8" />
            )}
          </div>
          <div className="flex items-center justify-between min-w-[100px] w-full">
            <span className="text-sm font-semibold">{label}</span>
            <span className={`text-xl font-semibold ${textColor(type)}`}>
              {count}
            </span>
          </div>
        </div>
      </button>
    );
  };

  // ✅ ใช้ useCallback เพื่อ memoize functions
  const GetCountTransaction = useCallback(async () => {
    const res = await dispatch(CountTransactionEstamp() as any);
    setCountTransaction(res?.payload?.data || {});
  }, [dispatch]);

  const SendMail = async (transactionID: string) => {
    const res = await dispatch(
      SendEmailTransactionEstamp(transactionID) as any
    );
    if (res.payload) {
      setIsOpenSuccessModal(true);
      setSuccessMessage("ส่ง Email สำเร็จ");
    } else if (res.error) {
      setIsOpenErrorModal(true);
      setErrorMessage(
        res.error.message || "เกิดข้อผิดพลาด ไม่สามารถส่ง Email ได้"
      );
    }
  };

  const handleCheckStatus = async (transactionEstampID: string) => {
    setIsLoading(true);
    const res = await dispatch(
      CheckStatusTransactionEstamp(transactionEstampID ?? "") as any
    );
    if (res.payload) {
      setSuccessMessage("อัปเดตสถานะสำเร็จ");
      setIsOpenSuccessModal(true);
      setIsLoading(false);
    } else if (res.error) {
      setIsOpenErrorModal(true);
      setErrorMessage(
        res.error.message || "เกิดข้อผิดพลาด อัปเดตสถานะไม่สำเร็จ"
      );
      setIsLoading(false);
    }
  };

  // ✅ ใช้ useCallback เพื่อ memoize functions
  const getTransactionData = useCallback(async ({ search = '', page = 1, size = 10, status = '' }: { search: string, page: number, size: number, status: string }) => {
    try {
      const res = await dispatch(ListEstampTransaction({ search, page, size, status }) as any)
      setTransEstamp(res.payload.data)
      setTotalTransCount(Number(res.payload.total_data) || 0)
    } catch (error) {
      const apiError = detectApiError(error);
      console.log("apiError", apiError);
      if (apiError.errorType === 'network_error') {
        console.log('ทดสอบ')
        router.replace("/login");
      } else if (apiError.errorType === 'unauthorized') {
        router.replace("/login");
      } else {
        console.log("apiError", apiError);
        // router.replace("/login");
        console.log("error", error);
      }
    }
  }, [dispatch, router]);

  // ✅ เพิ่ม getTransactionData ใน dependencies
  useEffect(() => {
    getTransactionData(paginateValue);
  }, [paginateValue, getTransactionData]);

  useEffect(() => {
    const temp = (transEtamp ?? []).map((item: any, index: any) => ({
      ...item,
      key: item._id || index.toString(),
    }));
    setDataStamp(temp);
  }, [transEtamp]);

  // ✅ เพิ่ม GetCountTransaction ใน dependencies
  useEffect(() => {
    GetCountTransaction();
  }, [GetCountTransaction]);

  const handFilterClick = (type: string) => {
    if (type === "total") {
      setPaginateValue((prev) => ({ ...prev, page: 1, status: "" }));
    } else {
      setPaginateValue((prev) => ({ ...prev, page: 1, status: type }));
    }
  };

  const handleSearch = (value: string) => {
    const trimmedQuery = value.trim();
    setPaginateValue((prev) => ({
      ...prev,
      search: trimmedQuery,
      page: 1,
    }));
  };

  const filterOptions: {
    type: string;
    label: string;
    icon: StaticImageData;
    countKey: keyof CountTransactionStatus;
  }[] = [
      {
        type: "total",
        label: "ทั้งหมด",
        icon: FilterAll,
        countKey: "total",
      },
      {
        type: "pending",
        label: "รอชำระเงิน",
        icon: FilterWaiting,
        countKey: "pending",
      },
      {
        type: "complete",
        label: "ชำระเงินสำเร็จ",
        icon: FilterCompleted,
        countKey: "complete",
      },
      {
        type: "failed",
        label: "ชำระเงินไม่สำเร็จ",
        icon: FilterRejected,
        countKey: "failed",
      },
    ];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Image src={AllItem} alt="Edit" width={32} height={32} />
        <h1 className="text-[28px] font-extrabold">รายการทั้งหมด</h1>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 mb-6">
          {filterOptions?.map((option) => (
            <div key={option.type} className="w-full">
              <FilterButton
                type={option.type}
                label={option.label}
                count={Number(countTransaction?.[option.countKey] ?? 0)}
                icon={option.icon}
                onClick={() => handFilterClick(option.type)}
              />
            </div>
          ))}
        </div>
      </div>

      <section className="mt-6">
        <div className="flex justify-between">
          <SearchInput
            placeholder="ค้นหา"
            className="w-[280px]"
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            debounceMs={700}
            suffix={<SearchOutlined />}
          />
          {/* <div className="flex gap-2">
            <div className="flex gap-2 items-center">
              <Typography className="flex">วันที่ยื่นแบบตราสาร :</Typography>
              <AppDatePicker placeholder={"เลือกวันที่"} value={dayjs()} />
            </div>
            <div className="flex gap-2 items-center">
              <Typography>วันที่สิ้นสุดการชำระเงิน :</Typography>
              <AppDatePicker placeholder={"เลือกวันที่"} value={dayjs()} />
            </div>
          </div> */}
        </div>
        <div className="mt-4">
          <div className="mb-4">
            รายการเอกสารทั้งหมด {totalTransCount} รายการ
          </div>
          <TableComponent
            columns={columns}
            loading={isLoading}
            dataSource={dataStamp.map((item, index) => ({ ...item, key: item._id || index }))}
            pagination={{
              current: paginateValue.page,
              pageSize: paginateValue.size,
              total: totalTransCount,
              onChange: (page, pageSize) =>
                setPaginateValue((prev) => ({
                  ...prev,
                  page,
                  size: pageSize ?? prev.size,
                })),
            }}
          />
        </div>
      </section>
      <SuccessModal
        titleName="ดำเนินการสำเร็จ"
        message={successMessage}
        open={isOpenSuccessModal}
        onClose={() => {
          setIsOpenSuccessModal(false);
          GetCountTransaction();
          getTransactionData(paginateValue);
        }}
      />
      <ErrorModal
        titleName="ส่ง Email ไม่สำเร็จ"
        message={errorMessage}
        open={isOpenErrorModal}
        onClose={() => {
          setIsOpenErrorModal(false);
          GetCountTransaction();
          getTransactionData(paginateValue);
        }}
      />
    </div>
  );
}
