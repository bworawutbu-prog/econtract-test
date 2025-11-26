"use client";

import dynamic from "next/dynamic";
import dayjs from "dayjs";
import { ArrowDown, ArrowUp, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import {
  memo,
  Suspense,
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import { DatePicker, Select, Modal } from "antd";
import HeaderTitleLogo from "@/assets/webp/inbox/frontend-inbox-1.webp";
import Image, { StaticImageData } from "next/image";
import FilterAll from "@/assets/webp/inbox/filter-all.webp";
import FilterWaiting from "@/assets/webp/inbox/filter-waiting.webp";
import FilterProcessing from "@/assets/webp/inbox/filter-processing.webp";
import FilterCompleted from "@/assets/webp/inbox/filter-completed.webp";
import { useAppDispatch } from "@/store";
import { listTransactionSchema } from "@/store/types/mappingTypes";
import {
  mockReportDocTransactions,
  mockReportDocStatusCounts,
  ContractStatusCounts,
} from "@/store/mockData/mockReportDoc";
import {
  DocumentTypeOption,
  getEstampDetails,
} from "@/store/types/estampTypes";
import { PDFDocument } from "pdf-lib";
import { resetPdfMerge } from "@/utils/resetPdfMerge";
import { CircleCheck } from "lucide-react";
import PDFLogo from "@/assets/webp/document/pdf.webp";
import { SettingDocsModal } from "@/components/mappingComponents/FormComponents/FormB2BDocument/modalSettingDocument";
import { setDocsType } from "@/store/documentStore/B2BForm";

const ListCardComponent = dynamic(
  () => import("@/components/ui/listCardItem"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#F6F8FA] animate-pulse">
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
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-10 w-full bg-gray-200 rounded"></div>
                </div>
              ))}
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

type FilterType =
  | "all"
  | "หมดอายุภายใน 30 วัน"
  | "หมดอายุภายใน 60 วัน"
  | "หมดอายุภายใน 90 วัน";

type FilterOption = {
  type: FilterType;
  label: string;
  icon: StaticImageData;
  countKey: keyof StatusCountsType;
};

type StatusCountsType = {
  all: number;
  "หมดอายุภายใน 30 วัน": number;
  "หมดอายุภายใน 60 วัน": number;
  "หมดอายุภายใน 90 วัน": number;
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

const transformApiDataToOptions = (apiData: any[]): DocumentTypeOption[] => {
  if (!Array.isArray(apiData)) return [];
  return apiData.map((item) => ({
    key: item._id || item.key || "",
    value: item._id || item.value || "",
    label: item.name || item.label || "",
  }));
};

function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  return isMounted;
}

export default function ReportDocPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const isMounted = useIsMounted();
  const [totalPage, setTotalPage] = useState<number>(10);
  const [pageCallApi, setPageCallApi] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [items, setItems] = useState<listTransactionSchema[]>(mockReportDocTransactions);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [sortField, setSortField] = useState<
    "createdAt" | "status" | "typeCode" | "document_id"
  >("createdAt");
  const [statusCount, setStatusCount] = useState<ContractStatusCounts>(
    mockReportDocStatusCounts
  );
  const [selectedDocType, setSelectedDocType] = useState<string>("");
  const [startCreatedDate, setStartCreatedDate] = useState<string>("");
  const [endExpiryDate, setEndExpiryDate] = useState<string>("");
  const [documentTypeOptions, setDocumentTypeOptions] = useState<
    DocumentTypeOption[]
  >([]);
  const DATE_FORMAT = "YYYY-MM-DD";

  // PDF Upload States
  const [file, setFile] = useState<File | null>(null);
  const [objectPdf, setObjPdf] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [openModalUploadPdf, setOpenModalUploadPdf] = useState<boolean>(false);
  const [isOpenSettingDocs, setIsOpenSettingDocs] = useState<boolean>(false);
  const [PDFPage, setPDFPage] = useState<number>(0);
  const [selectedValue, setSelectedValue] = useState<string>("B2B");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const response = await dispatch(getEstampDetails() as any);
        const apiData = Array.isArray(response?.payload)
          ? response.payload
          : response?.payload?.data || [];
        const transformed = transformApiDataToOptions(apiData);
        if (transformed.length > 0) {
          setDocumentTypeOptions(transformed);
        }
      } catch (error) {
        console.error("Failed to fetch document types:", error);
      }
    };

    fetchDocumentTypes();
  }, [dispatch]);

  const getExpirationDays = (filter: FilterType): number | null => {
    const expirationMap: Record<FilterType, number | null> = {
      all: null,
      "หมดอายุภายใน 30 วัน": 30,
      "หมดอายุภายใน 60 วัน": 60,
      "หมดอายุภายใน 90 วัน": 90,
    };
    return expirationMap[filter];
  };

  const documentTypes = useMemo(() => {
    return [
      { value: "", label: "ทั้งหมด" },
      ...documentTypeOptions.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    ];
  }, [documentTypeOptions]);

  const filterOptions: FilterOption[] = useMemo(
    () => [
      {
        type: "all",
        label: "ทั้งหมด",
        icon: FilterAll,
        countKey: "all",
      },
      {
        type: "หมดอายุภายใน 30 วัน",
        label: "หมดอายุภายใน 30 วัน",
        icon: FilterWaiting,
        countKey: "หมดอายุภายใน 30 วัน",
      },
      {
        type: "หมดอายุภายใน 60 วัน",
        label: "หมดอายุภายใน 60 วัน",
        icon: FilterProcessing,
        countKey: "หมดอายุภายใน 60 วัน",
      },
      {
        type: "หมดอายุภายใน 90 วัน",
        label: "หมดอายุภายใน 90 วัน",
        icon: FilterCompleted,
        countKey: "หมดอายุภายใน 90 วัน",
      },
    ],
    []
  );

  const statusCounts = useMemo<StatusCountsType>(() => {
    return {
      all: statusCount.ALL || 0,
      "หมดอายุภายใน 30 วัน": statusCount.EXPIRES_30 || 0,
      "หมดอายุภายใน 60 วัน": statusCount.EXPIRES_60 || 0,
      "หมดอายุภายใน 90 วัน": statusCount.EXPIRES_90 || 0,
    };
  }, [statusCount]);

  const filterAndSearchTransactions = useCallback(
    (
      transactions: listTransactionSchema[],
      expirationDays: number | null,
      search: string,
      docTypeValue: string,
      startDate: string,
      endDate: string
    ): listTransactionSchema[] => {
      let filtered = [...transactions];

      if (expirationDays !== null) {
        const now = new Date();
        const expirationDate = new Date();
        expirationDate.setDate(now.getDate() + expirationDays);

        filtered = filtered.filter((item) => {
          if (!item.end_enabled) return false;
          const itemEndDate = new Date(item.end_enabled);
          return itemEndDate <= expirationDate && itemEndDate >= now;
        });
      }

      if (docTypeValue) {
        filtered = filtered.filter(
          (item) => item.document_type === docTypeValue
        );
      }

      if (startDate) {
        const start = new Date(startDate);
        filtered = filtered.filter((item) => {
          if (!item.created_at) return false;
          return new Date(item.created_at) >= start;
        });
      }

      if (endDate) {
        const end = new Date(endDate);
        filtered = filtered.filter((item) => {
          if (!item.end_enabled) return false;
          return new Date(item.end_enabled) <= end;
        });
      }

      if (search.trim()) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.pdf_name?.toLowerCase().includes(searchLower) ||
            item.document_id?.toLowerCase().includes(searchLower) ||
            item.created_by?.toLowerCase().includes(searchLower)
        );
      }

      return filtered;
    },
    []
  );

  const loadTransactions = useCallback(
    (
      page: number = 1,
      limit: number = 10,
      expirationDays: number | null = null,
      search: string = "",
      docTypeValue: string = "",
      startDate: string = "",
      endDate: string = ""
    ) => {
      setIsLoading(true);
      try {
        // Simulate API delay
        setTimeout(() => {
          const filtered = filterAndSearchTransactions(
            mockReportDocTransactions,
            expirationDays,
            search,
            docTypeValue,
            startDate,
            endDate
          );

          // Client-side pagination
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedItems = filtered.slice(startIndex, endIndex);

          setItems(paginatedItems);
          setTotalPage(filtered.length);
          setIsLoading(false);
        }, 300);
      } catch (error) {
        enqueueSnackbar(`Error processing transaction data: ${error}`, {
          variant: "error",
        });
        setIsLoading(false);
      }
    },
    [filterAndSearchTransactions, enqueueSnackbar]
  );

  useEffect(() => {
    loadTransactions(1, 10, null, "", "", "", "");
  }, []);

  const handleSearch = useCallback(
    (value: string) => {
      const trimmedQuery = value.trim();
      setSearchQuery(trimmedQuery);

      const expirationDays = getExpirationDays(activeFilter);
      loadTransactions(
        1,
        pageSize,
        expirationDays,
        trimmedQuery,
        selectedDocType,
        startCreatedDate,
        endExpiryDate
      );
      setPageCallApi(1);
    },
    [
      activeFilter,
      loadTransactions,
      pageSize,
      selectedDocType,
      startCreatedDate,
      endExpiryDate,
    ]
  );

  const handleFilterChange = useCallback(
    (filterType: FilterType) => {
      setActiveFilter(filterType);
      setPageCallApi(1);

      const expirationDays = getExpirationDays(filterType);
      const searchValue = searchQuery.trim() || "";

      loadTransactions(
        1,
        pageSize,
        expirationDays,
        searchValue,
        selectedDocType,
        startCreatedDate,
        endExpiryDate
      );
    },
    [
      searchQuery,
      loadTransactions,
      pageSize,
      selectedDocType,
      startCreatedDate,
      endExpiryDate,
    ]
  );

  const handlePageChange = useCallback(
    (page: number, newPageSize?: number) => {
      setPageCallApi(page);

      if (newPageSize && newPageSize !== pageSize) {
        setPageSize(newPageSize);
      }

      const expirationDays = getExpirationDays(activeFilter);
      const searchValue = searchQuery.trim() || "";

      loadTransactions(
        page,
        newPageSize || pageSize,
        expirationDays,
        searchValue,
        selectedDocType,
        startCreatedDate,
        endExpiryDate
      );
    },
    [
      activeFilter,
      searchQuery,
      loadTransactions,
      pageSize,
      selectedDocType,
      startCreatedDate,
      endExpiryDate,
    ]
  );

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
        case "หมดอายุภายใน 30 วัน":
          return {
            container: `p-3 flex justify-start items-center gap-3 rounded-lg ${
              isActive ? "bg-[#FF4D4F]" : "bg-[#FFF1F0]"
            }`,
            icon: isActive ? "" : "!bg-[#FFCCC7]",
            text: isActive ? "text-white" : "text-[#636363]",
            count: isActive ? "text-white" : "text-[#FF4D4F]",
          };
        case "หมดอายุภายใน 60 วัน":
          return {
            container: `p-3 flex justify-start items-center gap-3 rounded-lg ${
              isActive ? "bg-[#FC9240]" : "bg-[#FFF4EB]"
            }`,
            icon: isActive ? "" : "!bg-[#FEE2CD]",
            text: isActive ? "text-white" : "text-[#636363]",
            count: isActive ? "text-white" : "text-[#FC9240]",
          };
        case "หมดอายุภายใน 90 วัน":
          return {
            container: `p-3 flex justify-start items-center gap-3 rounded-lg ${
              isActive ? "bg-[#00AAFF]" : "bg-[#E6F7FF]"
            }`,
            icon: isActive ? "" : "!bg-[#CCEEFF]",
            text: isActive ? "text-white" : "text-[#636363]",
            count: isActive ? "text-white" : "text-[#00AAFF]",
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

  const handleDocTypeChange = useCallback(
    (value: string | null) => {
      const nextValue = value || "";
      setSelectedDocType(nextValue);
      setPageCallApi(1);
      const expirationDays = getExpirationDays(activeFilter);
      loadTransactions(
        1,
        pageSize,
        expirationDays,
        searchQuery,
        nextValue,
        startCreatedDate,
        endExpiryDate
      );
    },
    [
      activeFilter,
      endExpiryDate,
      loadTransactions,
      pageSize,
      searchQuery,
      startCreatedDate,
    ]
  );

  const handleStartDateChange = useCallback(
    (value: string) => {
      setStartCreatedDate(value);
      setPageCallApi(1);
      const expirationDays = getExpirationDays(activeFilter);
      loadTransactions(
        1,
        pageSize,
        expirationDays,
        searchQuery,
        selectedDocType,
        value,
        endExpiryDate
      );
    },
    [
      activeFilter,
      endExpiryDate,
      loadTransactions,
      pageSize,
      searchQuery,
      selectedDocType,
    ]
  );

  const handleEndDateChange = useCallback(
    (value: string) => {
      setEndExpiryDate(value);
      setPageCallApi(1);
      const expirationDays = getExpirationDays(activeFilter);
      loadTransactions(
        1,
        pageSize,
        expirationDays,
        searchQuery,
        selectedDocType,
        startCreatedDate,
        value
      );
    },
    [
      activeFilter,
      loadTransactions,
      pageSize,
      searchQuery,
      selectedDocType,
      startCreatedDate,
    ]
  );

  // PDF Upload Functions
  const handleUploadClick = useCallback(() => {
    // Trigger file input
    fileInputRef.current?.click();
  }, []);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile && selectedFile.type === "application/pdf") {
        resetPdfMerge();

        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();
        setPDFPage(pageCount);
        setUploading(true);
        setFile(selectedFile);
        const fileURL = URL.createObjectURL(selectedFile);

        setSelectedValue("B2B");
        setOpenModalUploadPdf(true);
        setUploading(false);
        setObjPdf(fileURL);
      }
      if (e.target) {
        e.target.value = "";
      }
    },
    []
  );

  const handleCloseModalUploadPDF = useCallback(() => {
    setOpenModalUploadPdf(false);
    setUploading(false);
    setFile(null);
    resetPdfMerge();
  }, []);

  const handleConfirmUpload = useCallback(() => {
    // Set default B2B type
    dispatch(setDocsType(selectedValue));

    // Proceed directly to Setting Docs Modal (skip B2B/B2C selection modal)
    setIsOpenSettingDocs(true);
    setOpenModalUploadPdf(false);
    setUploading(false);
  }, [selectedValue, dispatch]);

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
              <h1 className="text-3xl font-extrabold">Report</h1>
            </div>
            <button className="btn-theme">Export File</button>
          </div>
          <div className="w-full">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 mb-6">
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
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
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
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col min-w-[220px]">
            {/* <label className="text-sm text-gray-500 mb-1">ประเภทเอกสาร</label> */}
            <Select
              value={selectedDocType}
              onChange={handleDocTypeChange}
              suffixIcon={<ChevronDown size={20} />}
              options={documentTypes}
              placeholder="เลือกประเภทเอกสาร"
              className="w-full"
              allowClear
              size="large"
            />
          </div>
          <div className="flex flex-col gap-2 min-w-[220px]">
            {/* <label className="text-sm text-gray-500">วันที่สร้าง (เริ่มต้น)</label> */}
            <DatePicker
              value={
                startCreatedDate ? dayjs(startCreatedDate, DATE_FORMAT) : null
              }
              onChange={(date) => {
                const dateString = date ? date.format(DATE_FORMAT) : "";
                handleStartDateChange(dateString);
              }}
              className="w-full"
              format={DATE_FORMAT}
              placeholder="เลือกวันที่เริ่มต้น"
              size="large"
            />
          </div>
          <div className="flex flex-col gap-2 min-w-[220px]">
            {/* <label className="text-sm text-gray-500">วันที่หมดอายุ (สิ้นสุด)</label> */}
            <DatePicker
              value={
                endExpiryDate ? dayjs(endExpiryDate, DATE_FORMAT) : null
              }
              onChange={(date) => {
                const dateString = date ? date.format(DATE_FORMAT) : "";
                handleEndDateChange(dateString);
              }}
              className="w-full"
              format={DATE_FORMAT}
              placeholder="เลือกวันที่สิ้นสุด"
              size="large"
            />
          </div>
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
            currentPage={pageCallApi}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            showSizeChanger={true}
            documentTypeOptions={documentTypeOptions}
            showExtendedInfo={true}
            getDropdownItems={(item) => [
              {
                key: "1",
                label: "อัปโหลดเอกสาร",
                onClick: () => {
                  handleUploadClick();
                },
              },
            ]}
          />
        </Suspense>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        onChange={handleUpload}
        disabled={uploading}
      />

      {/* Modal อัปโหลด PDF */}
      <Modal
        title={
          <span className="flex justify-center text-xl font-[800] text-[#0153BD]">
            อัปโหลด PDF
          </span>
        }
        centered
        open={openModalUploadPdf}
        onCancel={handleCloseModalUploadPDF}
        footer={[]}
        maskClosable={false}
        styles={{
          content: { borderRadius: "24px" },
        }}
      >
        <div className="flex justify-between items-center my-[24px] border-[1px] p-[16px] border-[#E6E6E6] bg-[#FAFCFF] rounded-xl">
          <div className="flex items-center space-x-2">
            <Image src={PDFLogo} height={40} width={40} alt="Pdf Logo" />
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-[500] text-[#333333]">
                {file?.name}
              </span>
              <span className="text-xs font-[500] text-[#989898]">
                {file?.size ? (file.size / 1048576).toFixed(2) : "0"} MB
              </span>
            </div>
          </div>
        <div>
            <CircleCheck className="text-[#30AB4E]" />
          </div>
        </div>

        <div className="flex justify-center w-full my-[16px] space-x-4">
          <button
            onClick={handleCloseModalUploadPDF}
            className="w-24 text-theme btn py-4 hover:bg-[#E6E6E6]"
          >
            ยกเลิก
          </button>
          <button onClick={handleConfirmUpload} className="btn-theme w-24">
            ยืนยัน
          </button>
        </div>
      </Modal>

      {/* Setting Docs Modal */}
      <SettingDocsModal
        open={isOpenSettingDocs}
        pdfName={file ? file.name : ""}
        pdfUrl={objectPdf}
        pdfPage={PDFPage}
        onClose={() => {
          setIsOpenSettingDocs(false);
          handleCloseModalUploadPDF();
        }}
        isSave={() => {
          setIsOpenSettingDocs(false);
          handleCloseModalUploadPDF();
        }}
        mode="document"
      />
    </>
  );
}
