"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
  memo,
  Suspense,
} from "react";
import dynamic from "next/dynamic";

import { Select, Modal, Progress, Skeleton } from "antd";
import Image, { StaticImageData } from "next/image";
import { ArrowDown, ArrowUp, UploadIcon } from "lucide-react";
import HeaderTitleLogo from "@/assets/webp/inbox/frontend-inbox-1.webp";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getTransactionsData,
  checkExpireToken,
} from "@/store/frontendStore/transactionAPI";
import type { listTransactionSchema } from "@/store/types/mappingTypes";
import { useSnackbar, closeSnackbar } from "notistack";
import { useRouter } from "next/navigation";
import FilterAll from "@/assets/webp/inbox/filter-all.webp";
import FilterWaiting from "@/assets/webp/inbox/filter-waiting.webp";
import FilterProcessing from "@/assets/webp/inbox/filter-processing.webp";
import FilterRejected from "@/assets/webp/inbox/filter-rejected.webp";
import FilterCanceled from "@/assets/webp/inbox/filter-canceled.webp";
import FilterCompleted from "@/assets/webp/inbox/filter-completed.webp";
import { useLayoutContext } from "@/components/layout/frontendLayout";
import appEmitter from "../../store/libs/eventEmitter";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { AnyAction } from "redux";
import { RootState } from "@/store";
import { getCookie } from "cookies-next/client";
import { clearAllUserSession } from "@/store/utils/localStorage";
import { getTokenLogin } from "@/store/token";
import { detectApiError } from "@/utils/errorHandler";

// ✅ ใช้ next/dynamic แทน React.lazy สำหรับ Next.js App Router
const ListCardComponent = dynamic(
  () => import("@/components/ui/listCardItem"),
  {
    loading: () => <Skeleton active />,
    ssr: false, // Disable SSR ถ้า component ใช้ browser APIs
  }
);

const SearchInput = dynamic(
  () => import("@/components/ui/searchInput"),
  {
    loading: () => <Skeleton.Input active />,
    ssr: true, // Enable SSR สำหรับ search input
  }
);

function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  return isMounted;
}

interface TransactionStatusCounts {
  W: number;
  N: number;
  R: number;
  C: number;
  Y: number;
  ALL: number;
}

type FilterType =
  | "all"
  | "รอดำเนินการ"
  | "กำลังดำเนินการ"
  | "ปฏิเสธ"
  | "ยกเลิก"
  | "เสร็จสิ้น";

type FilterOption = {
  type: FilterType;
  label: string;
  icon: StaticImageData;
  countKey: keyof StatusCountsType;
};

type StatusCountsType = {
  all: number;
  รอดำเนินการ: number;
  กำลังดำเนินการ: number;
  ปฏิเสธ: number;
  ยกเลิก: number;
  เสร็จสิ้น: number;
};

type FilterButtonProps = {
  type: FilterType;
  label: string;
  count: number;
  icon: StaticImageData;
  onClick: () => void;
  styles: {
    container: string;
    text: string;
    count: string;
    icon?: string;
  };
};

const FilterButton = memo(
  ({ label, count, icon, onClick, styles }: FilterButtonProps) => (
    <button
      className={`${styles.container} w-full min-h-[75px]`}
      onClick={onClick}
    >
      <div className={`rounded-full p-2 ${styles.icon}`}>
        <Image src={icon} alt={`Filter ${label}`} className="w-8 h-8" />
      </div>
      <div className="block text-left min-w-[100px]">
        <h1 className={`text-sm font-semibold ${styles.text}`}>{label}</h1>
        <p className={`text-xl font-semibold ${styles.count}`}>{count}</p>
      </div>
    </button>
  )
);

interface ListenerCallPaginationProps {
  onPageChange: (page: number, pageSize?: number) => void;
}

const ListenerCallPagination: React.FC<ListenerCallPaginationProps> = memo(
  ({ onPageChange }) => {
    useEffect(() => {
      const handleCustomEvent = (payload?: {
        page: number;
        pageSize?: number;
      }) => {
        if (payload && typeof payload.page === "number") {
          onPageChange(payload.page, payload.pageSize);
        }
      };
      appEmitter.on("myCustomEvent", handleCustomEvent);
      return () => {
        appEmitter.off("myCustomEvent", handleCustomEvent);
      };
    }, [onPageChange]);

    return null;
  }
);

const GalleryPageWithFilters = memo(() => {
  const isMounted = useIsMounted();
  const dispatch = useAppDispatch() as ThunkDispatch<
    RootState,
    unknown,
    AnyAction
  >;
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { enqueueSnackbar } = useSnackbar();

  const [pageCallApi, setPageCallApi] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [items, setItems] = useState<listTransactionSchema[]>([]);
  const [statusCount, setStatusCount] = useState<TransactionStatusCounts[]>([
    {
      ALL: 0,
      W: 0,
      N: 0,
      R: 0,
      C: 0,
      Y: 0,
    },
  ]);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sortField, setSortField] = useState<
    "createdAt" | "status" | "typeCode" | "document_id"
  >("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const { disableCreateDoc: layoutDisableCreateDoc } = useLayoutContext();

  // แปลง filter type เป็น status code
  const getStatusCode = (filter: FilterType): string => {
    const statusMap: Record<FilterType, string> = {
      all: "",
      รอดำเนินการ: "W",
      กำลังดำเนินการ: "N",
      ปฏิเสธ: "R",
      ยกเลิก: "C",
      เสร็จสิ้น: "Y",
    };
    return statusMap[filter];
  };

  const filterOptions: FilterOption[] = useMemo(
    () => [
      {
        type: "all",
        label: "ทั้งหมด",
        icon: FilterAll,
        countKey: "all",
      },
      {
        type: "รอดำเนินการ",
        label: "รอดำเนินการ",
        icon: FilterWaiting,
        countKey: "รอดำเนินการ",
      },
      {
        type: "กำลังดำเนินการ",
        label: "กำลังดำเนินการ",
        icon: FilterProcessing,
        countKey: "กำลังดำเนินการ",
      },
      {
        type: "ปฏิเสธ",
        label: "ปฏิเสธ",
        icon: FilterRejected,
        countKey: "ปฏิเสธ",
      },
      {
        type: "ยกเลิก",
        label: "ยกเลิก",
        icon: FilterCanceled,
        countKey: "ยกเลิก",
      },
      {
        type: "เสร็จสิ้น",
        label: "เสร็จสิ้น",
        icon: FilterCompleted,
        countKey: "เสร็จสิ้น",
      },
    ],
    []
  );

  const statusCounts = useMemo<StatusCountsType>(() => {
    if (!statusCount[0]) {
      return {
        all: 0,
        รอดำเนินการ: 0,
        กำลังดำเนินการ: 0,
        ปฏิเสธ: 0,
        ยกเลิก: 0,
        เสร็จสิ้น: 0,
      };
    }

    return {
      all: statusCount[0].ALL || 0,
      รอดำเนินการ: statusCount[0].W || 0,
      กำลังดำเนินการ: statusCount[0].N || 0,
      ปฏิเสธ: statusCount[0].R || 0,
      ยกเลิก: statusCount[0].C || 0,
      เสร็จสิ้น: statusCount[0].Y || 0,
    };
  }, [statusCount]);

  const loadTransactions = useCallback(
    async (
      page: number = 1,
      limit: number = 10,
      status: string = "",
      search: string = ""
    ) => {
      setIsLoading(true);
      try {
        const result = await dispatch(
          getTransactionsData({
            page,
            limit,
            status,
            search,
            businessId: "",
            isBusiness: false,
          })
        );

        if (result.payload) {
          const {
            data = [],
            transactionStatus = [],
            totalData = 0,
          } = result.payload as {
            data?: any[];
            transactionStatus?: TransactionStatusCounts[];
            totalData?: number;
          };

          const dataToSet =
            result.payload && Array.isArray(data) && data.length > 0
              ? data.map((item: any, i: number) => ({
                  key: i + 1,
                  document_id: item.document_id,
                  path_pdf: item.path_pdf,
                  pdf_name: item.pdf_name,
                  startEnabled: item.start_enabled,
                  status: item.status,
                  updated_at: item.updated_at,
                  updated_by: item.updated_by,
                  workflow_id: item.workflow_id,
                  created_at: item.created_at,
                  created_by: item.created_by,
                  id: item._id,
                }))
              : [];

          setTotalItems(result.payload.totalData || 0);

          setItems(dataToSet as unknown as listTransactionSchema[]);
          console.log("dataToSet :>> ", dataToSet);

          if (Array.isArray(transactionStatus)) {
            setStatusCount(transactionStatus);
          }

          if (typeof totalData === "number") {
            setTotalPage(totalData);
          }
        }
      } catch (error) {
        enqueueSnackbar(`Error processing transaction data: ${error}`, {
          variant: "error",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, enqueueSnackbar]
  );

  const handleSearch = useCallback(
    async (value: string) => {
      const trimmedQuery = value.trim();

      if (!trimmedQuery) {
        const statusCode = getStatusCode(activeFilter);
        loadTransactions(1, 10, statusCode, "");
        setPageCallApi(1);
        return;
      }

      const statusCode = getStatusCode(activeFilter);
      loadTransactions(1, 10, statusCode, trimmedQuery);
      setPageCallApi(1);
    },
    [activeFilter, loadTransactions]
  );

  const handleFilterChange = useCallback(
    async (filterType: FilterType) => {
      setActiveFilter(filterType);
      setPageCallApi(1);

      const statusCode = getStatusCode(filterType);
      const searchValue = searchQuery.trim() || "";

      loadTransactions(1, 10, statusCode, searchValue);
    },
    [searchQuery, loadTransactions]
  );

  const handlePageChange = useCallback(
    (page: number, newPageSize?: number) => {
      setPageCallApi(page);

      if (newPageSize && newPageSize !== pageSize) {
        setPageSize(newPageSize);
      }

      const statusCode = getStatusCode(activeFilter);
      const searchValue = searchQuery.trim() || "";

      loadTransactions(page, newPageSize || pageSize, statusCode, searchValue);
    },
    [activeFilter, searchQuery, pageSize, loadTransactions]
  );

  // ✅ เพิ่ม loadTransactions และ router ใน dependencies
  useEffect(() => {
    if (!isMounted) return;

    const initializeApp = async () => {
      try {
        const token = getTokenLogin();
        if (!token) {
          console.error("No authentication token found");
          return;
        }

        loadTransactions(1, 10, "", "");
      } catch (error) {
        const apiError = detectApiError(error);
        if (apiError.errorType === 'network_error') {
          router.replace("/login");
        } else if (apiError.errorType === 'unauthorized') {
          router.replace("/login");
        } else {
          console.log("error", error);
        }
      }
    };

    initializeApp();
  }, [isMounted, loadTransactions, router]);

  const getSortIcon = useCallback(() => {
    return sortDirection === "asc" ? (
      <ArrowUp size={14} />
    ) : (
      <ArrowDown size={14} />
    );
  }, [sortDirection]);

  const getFilterStyle = useCallback(
    (filterType: FilterType) => {
      const isActive = activeFilter === filterType;

      switch (filterType) {
        case "all":
          return {
            container: `p-3 flex justify-start items-center gap-3 rounded-lg ${isActive ? "bg-theme" : "!bg-[#4E73F80A]"
              }`,
            icon: isActive ? "" : "!bg-[#CCE2FF]",
            text: isActive ? "text-white" : "text-gray-600",
            count: isActive ? "text-white" : "text-theme",
          };
        case "รอดำเนินการ":
          return {
            container: `p-3 flex justify-start items-center gap-3 rounded-lg ${isActive ? "bg-[#FC9240]" : "bg-[#FFF4EB]"
              }`,
            icon: isActive ? "" : "!bg-[#FEE2CD]",
            text: isActive ? "text-white" : "text-[#636363]",
            count: isActive ? "text-white" : "text-[#FC9240]",
          };
        case "กำลังดำเนินการ":
          return {
            container: `p-3 flex justify-start items-center gap-3 rounded-lg ${isActive ? "bg-[#00AAFF]" : "bg-[#E6F7FF]"
              }`,
            icon: isActive ? "" : "!bg-[#CCEEFF]",
            text: isActive ? "text-white" : "text-[#636363]",
            count: isActive ? "text-white" : "text-[#00AAFF]",
          };
        case "ปฏิเสธ":
          return {
            container: `p-3 flex justify-start items-center gap-3 rounded-lg ${isActive ? "bg-[#FF4D4F]" : "bg-[#FFF1F0]"
              }`,
            icon: isActive ? "" : "!bg-[#FFCCC7]",
            text: isActive ? "text-white" : "text-[#636363]",
            count: isActive ? "text-white" : "text-[#FF4D4F]",
          };
        case "ยกเลิก":
          return {
            container: `p-3 flex justify-start items-center gap-3 rounded-lg ${isActive ? "bg-[#7033FF]" : "bg-[#F0EAFF]"
              }`,
            icon: isActive ? "" : "!bg-[#DBCCFF]",
            text: isActive ? "text-white" : "text-[#636363]",
            count: isActive ? "text-white" : "text-[#7033FF]",
          };
        case "เสร็จสิ้น":
          return {
            container: `p-3 flex justify-start items-center gap-3 rounded-lg ${isActive ? "bg-[#00C45A]" : "bg-[#EAF8EF]"
              }`,
            icon: isActive ? "" : "!bg-[#D9F7BE]",
            text: isActive ? "text-white" : "text-[#636363]",
            count: isActive ? "text-white" : "text-[#00C45A]",
          };
        default:
          return {
            container:
              "p-3 flex justify-start items-center gap-3 bg-gray-100 rounded-lg",
            text: "text-gray-600",
            count: "text-gray-600",
          };
      }
    },
    [activeFilter]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      if (value === sortField) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortDirection(value === "createdAt" ? "desc" : "asc");
      }
    },
    [sortField]
  );

  const handleUploadClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = (e.target.files && e.target.files[0]) || null;
    if (!file) return;

    const maxSizeInBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      enqueueSnackbar(`ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 10MB)`, {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      // "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      // "application/vnd.ms-excel",
      // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      // "image/jpeg",
      // "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      enqueueSnackbar(`รูปแบบไฟล์ไม่รองรับ`, {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadMessage(`กำลังอัปโหลด ${file.name}...`);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUploadMessage("กำลังตรวจสอบไฟล์...");
      setUploadProgress(30);

      await new Promise((resolve) => setTimeout(resolve, 800));
      setUploadMessage("กำลังประมวลผลเอกสาร...");
      setUploadProgress(60);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUploadMessage("กำลังสร้าง URL...");
      setUploadProgress(90);

      const fileURL = URL.createObjectURL(file);

      setUploadProgress(100);
      setUploadMessage("เสร็จสิ้น!");

      await new Promise((resolve) => setTimeout(resolve, 500));

      enqueueSnackbar(`อัปโหลด ${file.name} เสร็จสิ้น`, {
        variant: "success",
        autoHideDuration: 3000,
      });

      router.push(
        `/backend/Mapping?pdfUrl=${encodeURIComponent(
          fileURL
        )}&title=${encodeURIComponent(file.name)}`
      );
    } catch (error) {
      enqueueSnackbar("อัปโหลดล้มเหลว โปรดลองอีกครั้ง", {
        variant: "error",
        autoHideDuration: 3000,
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadMessage("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <div className="flex w-full justify-between items-center">
        <div className="w-full">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Image
                src={HeaderTitleLogo}
                height={32}
                width={32}
                alt="Title Logo"
                className="w-8 h-8"
                priority
              />
              <h1 className="text-3xl font-extrabold">สถานะของสัญญา</h1>
            </div>
          </div>

          <div className="w-full">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
              {filterOptions?.map((option) => (
                <div key={option.type} className="w-full">
                  <FilterButton
                    type={option.type}
                    label={option.label}
                    count={statusCounts[option.countKey]}
                    icon={option.icon}
                    onClick={() => handleFilterChange(option.type)}
                    styles={getFilterStyle(option.type)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-4">
        <div>
          {!isLoading && (
            <h6 className="text-base font-medium">
              เอกสารทั้งหมด{" "}
              <span className="text-theme">{totalPage}</span>{" "}
              รายการ
            </h6>
          )}
        </div>
        <div>
          <Suspense
            fallback={
              <div className="w-72 min-w-full h-10 bg-gray-200 rounded-md animate-pulse"></div>
            }
          >
            <SearchInput
              placeholder="ค้นหาเอกสาร"
              className="w-72 min-w-full"
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              debounceMs={700}
            />
          </Suspense>
        </div>
        {/* <div className="flex items-center gap-2">
           <div>
            <label htmlFor="sortBy">เรียงตาม : </label>
            <Select
              id="sortBy"
              className="w-48"
              value={sortField}
              suffixIcon={getSortIcon()}
              options={[
                { label: "วันที่อัปเดตล่าสุด", value: "createdAt" },
                { label: "ใช้งานล่าสุด", value: "document_id" },
                { label: "ใช้งานบ่อยที่สุด", value: "typeCode" },
                { label: "รายการโปรด", value: "status" },
              ]}
              onChange={(value) => handleSortChange(value)}
            />
          </div>
          <div>
            <button
              className={`${
                layoutDisableCreateDoc ? "hidden" : "flex"
              } btn-theme items-center gap-2`}
              onClick={handleUploadClick}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  กำลังอัปโหลด...
                </>
              ) : (
                <>
                  <UploadIcon size={16} />
                  สร้างเอกสาร
                </>
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.doc,.docx"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div> 
        </div> */}
      </div>

      <Modal
        title="กำลังอัปโหลดไฟล์"
        open={uploading}
        closable={false}
        footer={[]}
        centered
        width={400}
        className="upload-progress-modal"
      >
        <div className="text-center py-6">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <div className="w-20 h-20 rounded-full border-4 border-gray-200"></div>
              <div
                className="w-20 h-20 rounded-full border-4 border-blue-500 border-t-transparent animate-spin absolute top-0 left-0"
                style={{
                  transform: `rotate(${uploadProgress * 3.6}deg)`,
                  transition: "transform 0.3s ease-in-out",
                }}
              ></div>
            </div>
            <div className="text-2xl font-bold text-gray-700 mb-2">
              {uploadProgress}%
            </div>
            <div className="text-sm text-gray-500 mb-4">
              {uploadMessage || "กำลังประมวลผล..."}
            </div>
          </div>

          <Progress
            percent={uploadProgress}
            strokeColor={{
              "0%": "#108ee9",
              "100%": "#87d068",
            }}
            trailColor="#f0f0f0"
            strokeWidth={8}
            showInfo={false}
            className="mb-4"
          />

          <div className="text-xs text-gray-400">
            กรุณารอสักครู่ กำลังประมวลผลไฟล์ของคุณ...
          </div>
        </div>
      </Modal>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-gray-500 ml-2">กำลังโหลดรายการเอกสาร...</span>
        </div>
      ) : (
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="text-gray-500 ml-2">กำลังโหลด...</span>
            </div>
          }
        >
          <ListCardComponent
            searchTerm={searchQuery}
            sortGroup={sortDirection}
            dataForm={items}
            totalPage={totalPage}
            totalItems={totalItems}
            currentPage={pageCallApi}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            showSizeChanger={false}
          />
        </Suspense>
      )}
      <ListenerCallPagination onPageChange={handlePageChange} />
    </>
  );
});

export default GalleryPageWithFilters;
