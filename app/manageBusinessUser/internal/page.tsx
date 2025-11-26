"use client";

import dynamic from "next/dynamic";
import { Tag, Button } from "antd";
import { useEffect, useState } from "react";
import HeaderTitleLogo from "@/assets/webp/manageBusinessUser/internalUser.webp";
import Image from "next/image";
import { BusinessInternalUserContact } from "@/store/types/businessInternalUserType";
import { getListBusinessUserInternal } from "@/store/backendStore/manageBuinessUserAPI";
import { enqueueSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import SearchBusiness from "@/assets/webp/search-business.webp";
import {
    BadgeCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { RootState } from "@/store";
import { getRedirectBusiness } from "@/store/manageBizUserStore/api";
import { detectApiError } from "@/utils/errorHandler";

// Dynamic import for heavy table component to reduce initial bundle size
const TableComponent = dynamic(() => import("@/components/ui/table"), {
  ssr: false,
  loading: () => (
    // <div className="flex min-h-[300px] items-center justify-center rounded-xl bg-white shadow-md">
    //   <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500" />
    //   <span className="ml-2 text-gray-500">กำลังโหลดตารางผู้ใช้งาน...</span>
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
});

export default function Page() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [internalUserList, setInternalUserList] = useState<BusinessInternalUserContact[]>([]);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const { selectedBusinessId } = useSelector((state: RootState) => state.business);
    const filteredItems = internalUserList.filter((item) => {
        return item.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    });
    const dash = (v?: string) => v?.trim() || "-";

    useEffect(() => {
        getGroupList(page, pageSize);
    }, [page, pageSize, selectedBusinessId]);

    const getGroupList = async (p = page, ps = pageSize) => {
        if (loading) return;
        // ถ้ายังไม่มี business ที่เลือก ไม่ต้องเรียก API เพื่อลดโหลด
        if (!selectedBusinessId) {
            setInternalUserList([]);
            setTotalCount(0);
            return;
        }
        setLoading(true);
        try {
            const businessId = selectedBusinessId || ""; // Default fallback
            const response = await dispatch(
                getListBusinessUserInternal({ page: p, size: ps, businessId }) as any
            )
            if (response.payload.data.response && response.payload.data.response.length > 0) {
                setTotalCount(response.payload.data.total)
                const list = (response.payload.data.response || []).map((item: BusinessInternalUserContact, idx: number) => ({
                    ...item,
                    full_name: item.full_name ?? `${item.first_name_th} ${item.last_name_th}`,
                    key: idx + 1,
                }));
                setLoading(false);
                setInternalUserList(list);
            }
        } catch (error: any) {
            // enqueueSnackbar(`Failed to get group list: ${error}`, {
            //     variant: "error",
            //     autoHideDuration: 3000,
            // });
            const apiError = detectApiError(error);
            if (apiError.errorType === 'network_error') {
                router.replace("/login");
            } else if (apiError.errorType === 'unauthorized') {
                router.replace("/login");
            } else {
                console.log("error", error);
            }
            setLoading(false);
        }
    };

    const getURLRedirectBiz = async () => {
        const response = await dispatch(getRedirectBusiness() as any).unwrap()
        window.location.href = response.data.url;
        if (response) {
            window.location.href = response.data.url;
          } else {
            enqueueSnackbar(
              "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
              {
                variant: "warning",
                autoHideDuration: 3000,
              }
            );
          }
    }

    const columns = [
        {
            title: "ลำดับ",
            dataIndex: "key",
            key: "key",
            width: "10%",
            render: (text: string, record: any, index: number) =>
                (page - 1) * pageSize + (index + 1),

        },
        {
            title: "ชื่อ-นามสกุล",
            key: "fullName",
            dataIndex: "fullName",
            width: "20%",
            render: dash
        },
        // {
        //     title: "ตำแหน่ง",
        //     key: "roleList",
        //     dataIndex: "roleList",
        //     width: "18%",
        //     render: (roles?: string[]) =>
        //         roles?.length ? (
        //             <Space size={4} wrap>
        //                 {roles.map((r) => (
        //                     <Tag bordered={false}
        //                         style={{
        //                             borderRadius: 26,
        //                             backgroundColor: "#F0F0F0",
        //                             color: "#858585",
        //                             fontSize: 15,
        //                             padding: "4px 10px",
        //                         }} key={r}>{r}</Tag>
        //                 ))}
        //             </Space>
        //         ) : (
        //             "-"
        //         ),
        // },
        {
            title: <div style={{ textAlign: "center" }}>เลขบัตรประจำตัวประชาชน</div>,
            key: "idCard",
            dataIndex: "idCard",
            width: "16%",
            align: "center" as const,
            render: dash
        },
        {
            title: "อีเมล",
            key: "email",
            dataIndex: "email",
            width: "17%",
            render: dash
        },
        {
            title: <div style={{ textAlign: "center" }}>สถานะ CA (เจ้าหน้าที่นิติบุคคล)</div>,
            key: "caStatus",
            dataIndex: "caStatus",
            width: 180,
            align: "center" as const,
            onCell: () => ({ style: { minWidth: 140 } }),
            render: (value: boolean) =>
                value ? (
                    <span className="flex items-center justify-center  gap-2 text-[#0153BD]">
                        <BadgeCheck className="w-5 h-5" />
                        พบ CA
                    </span>
                ) : (
                    <span className="flex items-center justify-center  gap-2 text-[#C4C4C4]">
                        <BadgeCheck className="w-5 h-5" />
                        ไม่พบ CA
                    </span>
                ),
        },
    ];

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Image
                        src={HeaderTitleLogo}
                        height={0}
                        width={0}
                        alt="Title Logo"
                        className="w-8 h-8"
                    />
                    <h1 className="text-3xl font-extrabold">ผู้ใช้งานภายใน</h1>
                </div>
                {/* <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                    <div>
                        <SearchInput
                            placeholder="ค้นหา"
                            className="w-72 min-w-full"
                            value={searchQuery}
                            onChange={setSearchQuery}
                            debounceMs={700}
                        />
                    </div>
                </div> */}
            </div>
            <div className="bg-[#FAFAFA] rounded-2xl p-5 relative"
            >
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <span className="font-semibold text-base pr-2">ผู้ใช้งานภายในทั้งหมด</span>
                        <Tag
                            bordered={false}
                            style={{
                                backgroundColor: "white",
                                borderRadius: "99px",
                                boxShadow: "0px 0px 2px 0px #FDB1311F",
                            }}
                        >
                            <span className="text-[#FDB131] text-base font-semibold">
                                {totalCount} รายการ
                            </span>
                        </Tag>
                    </div>
                    <div>
                        <Button
                            onClick={()=>{getURLRedirectBiz()}}
                            className="bg-gradient-to-r from-[#0153BD] to-[#4CA8EE] text-white px-6 py-4"
                        >
                            จัดการองค์กร
                        </Button>
                    </div>
                </div>
                {filteredItems.length == 0 && searchQuery ? (
                    <div className="min-h-[calc(100vh-15rem)] flex justify-center items-center bg-white rounded-xl" style={{
                        boxShadow: "0px 0px 4px 0px #60617029, 0px 0px 1px 0px #28293D0A",
                    }}>
                        <div className="flex flex-col justify-center items-center gap-2">
                            <Image src={SearchBusiness} alt="Search Business" width={100} height={100} />
                            <span>ไม่พบผลลัพธ์</span>
                            <span>ผลการค้นหา <strong>"{searchQuery}"</strong> ไม่มีในระบบ</span>
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                }}
                                className="mt-3 text-theme underline hover:text-[#0153BD] transition bg-transparent border-none p-0"
                            >
                                กลับไปค่าเริ่มต้น
                            </button>
                        </div>
                    </div>
                ) : (
                    <TableComponent
                        columns={columns}
                        dataSource={filteredItems?.map((item) => ({
                            ...item,
                            key: item.id,
                            fullName: item.full_name,
                            // roleList: item.role_list,
                            idCard: item.id_card,
                            email: item.email,
                            caStatus: item.has_ca,
                        }))}
                        loading={loading}
                        pagination={{
                            current: page,
                            pageSize: pageSize,
                            total: totalCount,
                            showSizeChanger: false,
                            onChange: (p, ps) => {
                                if (ps !== pageSize) {
                                    setPage(1);
                                    setPageSize(ps);
                                } else {
                                    setPage(p);
                                }
                            },

                        }}
                    />
                )}
            </div>
        </>
    );
}