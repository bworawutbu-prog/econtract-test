"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  memo,
  Suspense,
} from "react";
import dynamic from "next/dynamic";

import { Pagination, Select, Skeleton, Space } from "antd";
import Image from "next/image";
import HeaderTitleLogo from "@/assets/webp/inbox/frontend-inbox-1.webp";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getTemplates,
  getTransactionsData,
} from "@/store/frontendStore/transactionAPI";
import type { listTransactionSchema } from "@/store/types/mappingTypes";
import { useSnackbar } from "notistack";
import { useRouter } from "next/navigation";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { AnyAction } from "redux";
import { RootState } from "@/store";
import { getTokenLogin } from "@/store/token";
import { detectApiError } from "@/utils/errorHandler";
import iconsSearch from "@/assets/webp/icons_search_outline.webp";
import { ChevronDown } from "lucide-react";


// ✅ ใช้ next/dynamic แทน React.lazy สำหรับ Next.js App Router
const ListCardComponent = dynamic(
  () => import("@/components/ui/listCardItem"),
  {
    loading: () => <Skeleton active />,
    ssr: false,
  }
);

const SearchInput = dynamic(
  () => import("@/components/ui/searchInput"),
  {
    loading: () => <Skeleton.Input active />,
    ssr: true,
  }
);

function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem("templateFormData");
      sessionStorage.setItem("typeForm", "useDocument");
    }
    return () => setIsMounted(false);
  }, []);
  return isMounted;
}

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
      // appEmitter.on("myCustomEvent", handleCustomEvent);
      return () => {
        // appEmitter.off("myCustomEvent", handleCustomEvent);
      };
    }, [onPageChange]);

    return null;
  }
);

const AllDocPage = memo(() => {
  const isMounted = useIsMounted();
  const dispatch = useAppDispatch() as ThunkDispatch<
    RootState,
    unknown,
    AnyAction
  >;
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { selectedBusinessId } = useAppSelector((state) => state.business);
  const [documents, setDocuments] = useState([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [pageCallApi, setPageCallApi] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [items, setItems] = useState<listTransactionSchema[]>([]);
  const [totalPage, setTotalPage] = useState<number>(0); // ชื่อเป็น totalPage แต่จริงๆ เก็บ totalItems
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [sortType, setSortType] = useState<"updated" | "lastUsed" | "mostUsed">("updated");
  const sortOptions = [
    { label: "วันที่ล่าสุด", value: "date_desc" },
    { label: "วันที่เก่าสุด", value: "date_asc" },
    { label: "ชื่อเอกสาร A-Z", value: "name_asc" },
    { label: "ชื่อเอกสาร Z-A", value: "name_desc" },
  ];

  const loadTransactions = useCallback(
    async (
      page: number = 1,
      limit: number = 10,
      search: string = "",
      sortType: "updated" | "lastUsed" | "mostUsed" = "updated"
    ) => {
      setIsLoading(true);
      try {
        if (!selectedBusinessId) {
          setItems([]);
          setTotalItems(0);
          setIsLoading(false);
          return;
        }

        console.log('🎯 loadTransactions called:', { page, limit, search, sortType });

        const result = await dispatch(
          getTemplates({
            page,
            limit,
            status: "",
            search,
            businessId: selectedBusinessId,
            isBusiness: false,
          })
        );

        if (result.payload) {
          const { data = [], total = 0 } = result.payload as { data: any[]; total: number }; // 🎯 ใช้ total แทน totalData

          console.log('🎯 API Response:', { 
            dataLength: data.length, 
            total,
            page 
          });

          const dataToSet =
            Array.isArray(data) && data.length > 0
              ? data
                .map((item: any, i: number) => ({
                  key: i + 1,
                  id: item.id,
                  document_id: item.document_no,
                  pdf_name: item.name ?? null,
                  startEnabled: item.start_enabled ?? null,
                  status: item.status ?? null,
                  updated_at: item.updated_at ?? null,
                  updated_by: item.updated_by ?? null,
                  workflow_id: item.workflow_id ?? null,
                  created_at: item.created_at,
                  created_by: item.created_by,
                  template_form_id: item.template_form?.id ?? null,
                  template_form_version: item.template_form?.version ?? null,
                  usage_count: item.usage_count ?? 0,
                  last_used_at: item.last_used_at ?? null,
                }))
                .sort((a, b) => {
                  switch (sortType) {
                    case "updated":
                      return new Date(b.updated_at || b.created_at || 0).getTime() -
                        new Date(a.updated_at || a.created_at || 0).getTime();
                    case "lastUsed":
                      return new Date(b.last_used_at || 0).getTime() -
                        new Date(a.last_used_at || 0).getTime();
                    case "mostUsed":
                      return (b.usage_count || 0) - (a.usage_count || 0);
                    default:
                      return 0;
                  }
                })
              : [];

          setItems(dataToSet as any);
          setTotalItems(total); // 🎯 FIXED: ใช้ total จาก API
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

  const handleSearch = useCallback(
    async (value: string) => {
      const trimmedQuery = value.trim();

      if (!trimmedQuery) {
        loadTransactions(1, pageSize, "", sortType);
        setPageCallApi(1);
        return;
      }

      loadTransactions(1, pageSize, trimmedQuery, sortType);
      setPageCallApi(1);
    },
    [loadTransactions, pageSize, sortType]
  );

  const handlePageChange = useCallback(
    (page: number, newPageSize?: number) => {
      console.log('🎯 handlePageChange:', { page, newPageSize, currentPageSize: pageSize });
      
      const effectivePageSize = newPageSize || pageSize;
      
      // 🎯 FIXED: อัปเดต state
      setPageCallApi(page);
      if (newPageSize && newPageSize !== pageSize) {
        setPageSize(newPageSize);
      }
      
      // 🎯 CRITICAL: เรียก API เพื่อ fetch ข้อมูลหน้าใหม่
      loadTransactions(page, effectivePageSize, searchQuery, sortType);
    },
    [searchQuery, pageSize, sortType, loadTransactions]
  );

  // ✅ Initial load
  useEffect(() => {
    if (!isMounted) return;

    const initializeApp = async () => {
      try {
        const token = getTokenLogin();
        if (!token) {
          console.error("No authentication token found");
          return;
        }

        setItems([]);
        setPageCallApi(1);
        setTotalItems(0); // 🎯 FIXED
        loadTransactions(1, pageSize, "", sortType);
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
  }, [selectedBusinessId, isMounted, pageSize, loadTransactions, router, sortType]);

  const [sortValue, setSortValue] = useState("date_desc");

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
              <h1 className="text-3xl font-extrabold">รายการประเภทเอกสาร</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-4">
        <div>
          <SearchInput
            placeholder="ค้นหาเอกสาร"
            className="w-72 min-w-full mb-4"
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            debounceMs={700}
            suffix={
              <img
                src={iconsSearch.src}
                alt="search"
                style={{ width: 18, height: 18 }}
              />
            }
          />
          <div>
            {!isLoading && (
              <h6>
                เอกสารทั้งหมด <span className="text-theme font-semibold">{totalItems}</span> รายการ
              </h6>
            )}
          </div>
        </div>

        {/* <div className="mb-4 flex items-center gap-2">
          <label htmlFor="sortType" className="font-medium">
            เรียงตาม:
          </label>
          <Select
            id="sortType"
            value={sortType}
            suffixIcon={<ChevronDown size={20} />}
            onChange={(value: "updated" | "lastUsed" | "mostUsed") => setSortType(value)}
            className="rounded-xl w-60"
          >
            <Select.Option value="updated">วันที่อัปเดตล่าสุด</Select.Option>
            <Select.Option value="lastUsed">ใช้งานล่าสุด</Select.Option>
            <Select.Option value="mostUsed">ใช้งานบ่อยที่สุด</Select.Option>
          </Select>
        </div> */}

      </div >

      {
        isLoading ? (
          <div className="flex justify-center items-center h-40" >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-gray-500 ml-2">กำลังโหลดรายการเอกสาร...</span>
          </div >
        ) : (
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="text-gray-500 ml-2">กำลังโหลด...</span>
              </div>
            }
          >
            <div className="flex flex-col">
              <ListCardComponent
                dataForm={items}
                totalItems={totalItems}
                currentPage={pageCallApi}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          </Suspense>
        )}
      {/* <ListenerCallPagination onPageChange={handlePageChange} /> */}
    </>
  );
});

AllDocPage.displayName = 'AllDocPage';

export default AllDocPage;