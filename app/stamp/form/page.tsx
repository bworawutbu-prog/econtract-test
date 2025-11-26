"use client";

import { Pagination } from "antd";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { listTypeStampDuty } from "@/store/types/estampTypes";
import { useEffect, useState, useCallback } from "react";
import { useAppDispatch } from "@/store/hooks";
import { ListEstampType } from "@/store/estampStore/typeEstamp";
import StampFilingIcon from "@/assets/webp/stamp/stamp_tax_filing.webp";
import Image from "next/image";
import { detectApiError } from "@/utils/errorHandler";

// Lazy-load heavy UI components to keep initial /stamp/form chunk smaller
const ListStampDutyType = dynamic(
  () => import("@/components/ui/liststampDutyType"),
  {
    ssr: false,
    loading: () => (
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-white shadow-theme animate-pulse"
          />
        ))}
      </div>
    ),
  }
);

const SearchInput = dynamic(() => import("@/components/ui/searchInput"), {
  ssr: true,
  loading: () => (
    <div className="h-10 w-72 min-w-full animate-pulse rounded-md bg-gray-200" />
  ),
});

export default function FromStampDuty() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [typeEstamp, setTypeEstamp] = useState<listTypeStampDuty[]>([]);
  const [totalTypeCount, setTotalTypeCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [total, setTotal] = useState<number>(0);
  const [paginateValue, setPaginateValue] = useState({
    search: "",
    page: 1,
    size: 10,
  });

  const getTypesEstamp = useCallback(
    async ({
      search = "",
      page = 1,
      size = 10,
    }: {
      search: string;
      page: number;
      size: number;
    }) => {
      try {
        const res = await dispatch(ListEstampType({ search, page, size }) as any);
        const payload = res?.payload || {};
        setTypeEstamp(payload.data ?? []);
        setTotalTypeCount(Number(payload.total_data) || 0);
        setTotal(Number(payload.total_transaction) || 0);
      } catch (error) {
        const apiError = detectApiError(error);
        if (apiError.errorType === "network_error") {
          router.replace("/login");
        } else if (apiError.errorType === "unauthorized") {
          router.replace("/login");
        } else {
          console.log("apiError", apiError);
          console.log("error", error);
        }
      }
    },
    [dispatch, router]
  );

  // ✅ เพิ่ม getTypesEstamp ใน dependencies
  useEffect(() => {
    getTypesEstamp(paginateValue);
    //  }, [paginateValue.search, paginateValue.page, paginateValue.size]);
  }, [paginateValue, getTypesEstamp]);

  const handleSearch = (value: string) => {
    const trimmedQuery = value.trim();
    setPaginateValue((prev) => ({
      ...prev,
      search: trimmedQuery,
      page: 1
    }));
  };

  const breadcrumbItems = [
    {
      label: "หน้าหลัก",
      onClick: () => router.back(),
    },
    {
      label: "ฟอร์มชำระอากรแสตมป์",
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold mb-3 flex items-center gap-2 w-full">
        <Image src={StampFilingIcon} alt="Stamp Filing" className="w-6 h-6" />
        ฟอร์มชำระอากรแสตมป์
      </h1>

      {/* <Breadcrumb items={breadcrumbItems}/> */}

      <section className="stamp-filing-lists mt-6 gap-3">
        <div className="w-[280px]">
          <SearchInput
            placeholder="ค้นหาเอกสาร"
            className="w-72 min-w-full"
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            debounceMs={700}
          />
        </div>
        <ListStampDutyType dataForm={typeEstamp} total={total} />
        <div className="mt-4 flex justify-end">
          <Pagination
            current={paginateValue.page}
            pageSize={paginateValue.size}
            total={totalTypeCount}
            showSizeChanger={false}
            showTotal={(total: number, range: [number, number]) =>
              `${range[0]}-${range[1]} จาก ${total} รายการ`
            }
            // pageSizeOptions={[10, 20, 50, 100]}
            onChange={(page, pageSize) =>
              setPaginateValue((prev) => ({
                ...prev,
                page,
                size: pageSize ?? prev.size,
              }))
            }
          />
        </div>
      </section>
    </div>
  );
}
