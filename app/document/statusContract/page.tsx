"use client";

import dynamic from "next/dynamic";
import { RootState, useAppDispatch, useAppSelector } from "@/store";
import { getTransactionsData } from "@/store/frontendStore/transactionAPI";
import appEmitter from "@/store/libs/eventEmitter";
import { listTransactionSchema } from "@/store/types/mappingTypes";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { closeSnackbar, useSnackbar } from "notistack";
import {
  memo,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { AnyAction } from "redux";
import HeaderTitleLogo from "@/assets/webp/inbox/frontend-inbox-1.webp";
import Image, { StaticImageData } from "next/image";
import FilterAll from "@/assets/webp/inbox/filter-all.webp";
import FilterWaiting from "@/assets/webp/inbox/filter-waiting.webp";
import FilterProcessing from "@/assets/webp/inbox/filter-processing.webp";
import FilterRejected from "@/assets/webp/inbox/filter-rejected.webp";
import FilterCanceled from "@/assets/webp/inbox/filter-canceled.webp";
import FilterCompleted from "@/assets/webp/inbox/filter-completed.webp";
import FilterDraft from "@/assets/webp/inbox/filter-draft.webp";
import { DetailContractStatusModal } from "@/components/modal/modalDetailContractStatus";
import { getContractStatusDetail } from "@/store/backendStore/documentAPI";
import { ContractData } from "@/store/types/contractStatusType";
import { getTokenLogin } from "@/store/token";


const ListCardComponent = dynamic(
  () => import("@/components/ui/listCardItem"),
  {
    ssr: false,
    loading: () => (
      // <div className="flex h-40 items-center justify-center">
      //   <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500" />
      //   <span className="ml-2 text-gray-500">กำลังโหลดรายการเอกสาร...</span>
      // </div>
      <div className="min-h-screen bg-[#F6F8FA] animate-pulse">
      {/* Header */}
      <div className="sticky top-0 left-0 right-0 z-20 bg-white p-4 shadow-theme">
        <div className="flex justify-between items-center">
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Form Fields */}
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-10 w-full bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <div className="h-10 w-24 bg-gray-200 rounded"></div>
            <div className="h-10 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
    ),
  }
);

const SearchInput = dynamic(
  () => import("@/components/ui/searchInput"),
  {
    ssr: true,
    loading: () => (
      <div className="h-10 w-72 min-w-full animate-pulse rounded-md bg-gray-200" />
    ),
  }
);

interface ContractStatusCounts {
  ALL: number;
  D: number;
  W: number;
  N: number;
  R: number;
  C: number;
  Y: number;
}

type FilterType =
  | "all"
  | "บันทึกร่าง"
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
  บันทึกร่าง: number;
  รอดำเนินการ: number;
  กำลังดำเนินการ: number;
  ปฏิเสธ: number;
  ยกเลิก: number;
  เสร็จสิ้น: number;
};

interface ListenerCallPaginationProps {
  onPageChange: (page: number, pageSize?: number) => void;
}

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
      <div className={`rounded-full p-1 ${styles.icon}`}>
        <Image src={icon} alt={`Filter ${label}`} className="w-100% h-auto" />
      </div>
      <div className="block text-left min-w-[100px]">
        <h1 className={`text-sm font-semibold ${styles.text}`}>{label}</h1>
        <p className={`text-xl font-semibold ${styles.count}`}>{count}</p>
      </div>
    </button>
  )
);

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

function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  return isMounted;
}

export default function Page() {
  const dispatch = useAppDispatch() as ThunkDispatch<
    RootState,
    unknown,
    AnyAction
  >;
  const isMounted = useIsMounted();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { enqueueSnackbar } = useSnackbar();
  const [totalPage, setTotalPage] = useState<number>(0);
  const { selectedBusinessId } = useAppSelector((state) => state.business);
  const [pageCallApi, setPageCallApi] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [items, setItems] = useState<listTransactionSchema[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isOpenDetailModal, setIsOpenDetailModal] = useState(false);
  const [contractStatusDetail, setContractStatusDetail] =
    useState<ContractData | null>(null);
  const [sortField, setSortField] = useState<
    "createdAt" | "status" | "typeCode" | "document_id"
  >("createdAt");
  const [uploading, setUploading] = useState(false);
  const [statusCount, setStatusCount] = useState<ContractStatusCounts[]>([
    {
      ALL: 0,
      W: 0,
      N: 0,
      R: 0,
      C: 0,
      D: 0,
      Y: 0,
    },
  ]);

  const getStatusCode = (filter: FilterType): string => {
    const statusMap: Record<FilterType, string> = {
      all: "",
      บันทึกร่าง: "D",
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
        type: "บันทึกร่าง",
        label: "บันทึกร่าง",
        icon: FilterDraft,
        countKey: "บันทึกร่าง",
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
        บันทึกร่าง: 0,
        รอดำเนินการ: 0,
        กำลังดำเนินการ: 0,
        ปฏิเสธ: 0,
        ยกเลิก: 0,
        เสร็จสิ้น: 0,
      };
    }

    return {
      all: statusCount[0].ALL || 0,
      บันทึกร่าง: statusCount[0].D || 0,
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
        // console.log('aong loadTransactions selectedBusinessId =>',selectedBusinessId);
        // ใช้ selectedBusinessId จาก Redux state หรือ fallback
        const businessId = selectedBusinessId;
        if (!businessId) {
          console.warn('selectedBusinessId is null, skipping API call');
          setIsLoading(false);
          return;
        }
        
        const result = await dispatch(
          getTransactionsData({
            page,
            limit,
            status,
            search,
            businessId: businessId,
            isBusiness: true,
          })
        );

        if (result.payload) {
          const {
            data = [],
            transactionStatus = [],
            totalData = 0,
          } = result.payload as {
            data?: any[];
            transactionStatus?: ContractStatusCounts[];
            totalData?: number;
          };

          const dataToSet =
            Array.isArray(data) && data.length > 0
              ? data?.map((item: any, i: number) => ({
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
    [dispatch, enqueueSnackbar, selectedBusinessId]
  );

  useEffect(() => {
    // console.log('aong selectedBusinessId =>',selectedBusinessId);
    if (selectedBusinessId) {
      loadTransactions(1, 10, "", "");
    }
  }, [selectedBusinessId, loadTransactions]);

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
    [activeFilter, searchQuery, loadTransactions]
  );

  useEffect(() => {
    if (!isMounted) return;

    const initializeApp = async () => {
      try {
        const token = getTokenLogin();
        if (!token) {
          enqueueSnackbar(`❌ Error checking token expiration`, {
            variant: "error",
            autoHideDuration: 2000,
          });
          console.error("No authentication token found");
          localStorage.clear();
          sessionStorage.clear();
          router.replace("/login");
          return;
        }

        // If there is no selected business yet, avoid showing an infinite spinner
        if (!selectedBusinessId) {
          setIsLoading(false);
        }
      } catch (error) {
        enqueueSnackbar(`❌ Error during initialization: ${error}`, {
          variant: "error",
        });
        router.replace("/login");
      }
    };

    initializeApp();
  }, [isMounted, enqueueSnackbar, router, selectedBusinessId]);

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
            container: `p-3 flex justify-start items-center gap-3 rounded-lg ${
              isActive ? "bg-theme" : "!bg-[#4E73F80A]"
            }`,
            icon: isActive ? "" : "!bg-[#CCE2FF]",
            text: isActive ? "text-white" : "text-gray-600",
            count: isActive ? "text-white" : "text-theme",
          };
        case "บันทึกร่าง":
          return {
            container: `p-3 flex justify-start items-center gap-3 rounded-lg ${
              isActive ? "bg-[#FDB131]" : "bg-[#FEF3D6]"
            }`,
            icon: isActive ? "" : "!bg-[#FDE5A9]",
            text: isActive ? "text-white" : "text-[#636363]",
            count: isActive ? "text-white" : "text-[#FDB131]",
          };
        case "รอดำเนินการ":
          return {
            container: `p-3 flex justify-start items-center gap-3 rounded-lg ${
              isActive ? "bg-[#FC9240]" : "bg-[#FFF4EB]"
            }`,
            icon: isActive ? "" : "!bg-[#FEE2CD]",
            text: isActive ? "text-white" : "text-[#636363]",
            count: isActive ? "text-white" : "text-[#FC9240]",
          };
        case "กำลังดำเนินการ":
          return {
            container: `p-3 flex justify-start items-center gap-3 rounded-lg ${
              isActive ? "bg-[#00AAFF]" : "bg-[#E6F7FF]"
            }`,
            icon: isActive ? "" : "!bg-[#CCEEFF]",
            text: isActive ? "text-white" : "text-[#636363]",
            count: isActive ? "text-white" : "text-[#00AAFF]",
          };
        case "ปฏิเสธ":
          return {
            container: `p-3 flex justify-start items-center gap-3 rounded-lg ${
              isActive ? "bg-[#FF4D4F]" : "bg-[#FFF1F0]"
            }`,
            icon: isActive ? "" : "!bg-[#FFCCC7]",
            text: isActive ? "text-white" : "text-[#636363]",
            count: isActive ? "text-white" : "text-[#FF4D4F]",
          };
        case "ยกเลิก":
          return {
            container: `p-3 flex justify-start items-center gap-3 rounded-lg ${
              isActive ? "bg-[#7033FF]" : "bg-[#F0EAFF]"
            }`,
            icon: isActive ? "" : "!bg-[#DBCCFF]",
            text: isActive ? "text-white" : "text-[#636363]",
            count: isActive ? "text-white" : "text-[#7033FF]",
          };
        case "เสร็จสิ้น":
          return {
            container: `p-3 flex justify-start items-center gap-3 rounded-lg ${
              isActive ? "bg-[#00C45A]" : "bg-[#EAF8EF]"
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

    const allowedTypes = ["application/pdf", "application/msword"];

    if (!allowedTypes.includes(file.type)) {
      enqueueSnackbar(`รูปแบบไฟล์ไม่รองรับ`, {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    try {
      setUploading(true);

      const notificationId = enqueueSnackbar(`กำลังอัปโหลด ${file.name}...`, {
        variant: "info",
        persist: true,
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const fileURL = URL.createObjectURL(file);

      closeSnackbar(notificationId);

      enqueueSnackbar(`อัปโหลด ${file.name} เสร็จสิ้น`, {
        variant: "success",
        autoHideDuration: 3000,
      });
    } catch (error) {
      enqueueSnackbar("อัปโหลดล้มเหลว โปรดลองอีกครั้ง", {
        variant: "error",
        autoHideDuration: 3000,
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getContractStatusDetailData = async (id: string) => {
    if (id) {
      const response = await dispatch(getContractStatusDetail({ id }) as any);

      if (response.payload && response.payload.data) {
        setContractStatusDetail(response.payload.data);
        setIsOpenDetailModal(true);
      } else {
        enqueueSnackbar(`Failed to fetch contract status details`, {
          variant: "error",
          autoHideDuration: 3000,
        });
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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3 mb-6">
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
        <div className="flex items-center gap-2">
          {/* <div>
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
          </div> */}
          {/* <div>
            <button
              className={`${false ? "hidden" : "flex"
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
                <>สร้างเอกสาร</>
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.doc,.docx"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div> */}
        </div>
      </div>
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
            getDropdownItems={(item) => [
              {
                key: "1",
                label: "รายละเอียด",
                onClick: () => {
                  router.push(`/frontend/Mapping?documentId=${item.id}`);
                },
              },
              {
                key: "2",
                label: "สถานะคู่สัญญา",
                onClick: () => getContractStatusDetailData(item.id),
              },
            ]}
          />
        </Suspense>
      )}
      <ListenerCallPagination onPageChange={setPageCallApi} />
      <DetailContractStatusModal
        isOpen={isOpenDetailModal}
        onClose={() => setIsOpenDetailModal(false)}
        title={"สถานะคู่สัญญา"}
        data={contractStatusDetail}
      />
    </>
  );
}
