"use client";

import dynamic from "next/dynamic";
import { ChevronLeft } from "lucide-react";
import { ConfirmModal } from "@/components/modal/modalConfirm";
import { DetailStampModal } from "@/components/modal/modalDetailEstamp";
import { ErrorModal } from "@/components/modal/modalError";
import { SuccessModal } from "@/components/modal/modalSuccess";
import { ListEstampTransactionByID, SubmitTransactionEstamp } from "@/store/estampStore/typeEstamp";
import { useAppDispatch } from "@/store/hooks";
import { listEStamp } from "@/store/types/estampTypes";
import { Button } from "antd";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { detectApiError } from "@/utils/errorHandler";

// Lazy-load table and search input to keep /stamp/form/type chunk smaller
const PaymentTable = dynamic(() => import("@/components/ui/eStampTable"), {
  ssr: false,
  loading: () => (
    <div className="mt-4 rounded-xl bg-white p-4 shadow-theme">
      <div className="mb-4 h-6 w-40 animate-pulse rounded bg-gray-200" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-gray-100" />
        ))}
      </div>
    </div>
  ),
});

const SearchInput = dynamic(() => import("@/components/ui/searchInput"), {
  ssr: true,
  loading: () => (
    <div className="h-10 w-[280px] animate-pulse rounded-md bg-gray-200" />
  ),
});

// const mockData: listEStamp[] = [
//   {
//     "_id": "689dc013106609d7fa6dfc22",
//     "edocument_id": "DC-20258140000044",
//     "name": "ลักษณะตราสาร 1. เช่าที่ดิน โรงเรือน สิ่งปลูกสร้างอย่างอื่น หรือแพ",
//     "status": "new",
//     "transaction_id": "689dc013106609d7fa6dfc0b",
//     creation_date: "",
//     expired_date: ""
//   },
//   {
//     "_id": "689dc1f1106609d7fa6dfe8e",
//     "edocument_id": "DC-20258140000045",
//     "name": "ลักษณะตราสาร 1. เช่าที่ดิน โรงเรือน สิ่งปลูกสร้างอย่างอื่น หรือแพ",
//     "status": "new",
//     "transaction_id": "689dc1f1106609d7fa6dfe77",
//     creation_date: "",
//     expired_date: ""
//   },
//   {
//     "_id": "689de691106609d7fa6dffee",
//     "edocument_id": "DC-20258140000046",
//     "name": "ลักษณะตราสาร 1. เช่าที่ดิน โรงเรือน สิ่งปลูกสร้างอย่างอื่น หรือแพ",
//     "status": "new",
//     "transaction_id": "689de691106609d7fa6dffd7",
//     creation_date: "",
//     expired_date: ""
//   },
//   {
//     "_id": "689e00ec106609d7fa6e096e",
//     "edocument_id": "DC-20258140000047",
//     "name": "ลักษณะตราสาร 1. เช่าที่ดิน โรงเรือน สิ่งปลูกสร้างอย่างอื่น หรือแพ",
//     "status": "new",
//     "transaction_id": "689e00ec106609d7fa6e095f",
//     creation_date: "",
//     expired_date: ""
//   },
//   {
//     "_id": "689e105d106609d7fa6e1423",
//     "edocument_id": "DC-20258140000050",
//     "name": "ลักษณะตราสาร 1. เช่าที่ดิน โรงเรือน สิ่งปลูกสร้างอย่างอื่น หรือแพ",
//     "status": "new",
//     "transaction_id": "689e105d106609d7fa6e140c",
//     creation_date: "",
//     expired_date: ""
//   },
//   {
//     "_id": "689e13d2106609d7fa6e1611",
//     "edocument_id": "DC-20258140000052",
//     "name": "ลักษณะตราสาร 1. เช่าที่ดิน โรงเรือน สิ่งปลูกสร้างอย่างอื่น หรือแพ",
//     "status": "new",
//     "transaction_id": "689e13d2106609d7fa6e15fa",
//     creation_date: "",
//     expired_date: ""
//   },
//   {
//     "_id": "689e16bfb7f42738208f2f1e",
//     "edocument_id": "DC-20258140000053",
//     "name": "ลักษณะตราสาร 1. เช่าที่ดิน โรงเรือน สิ่งปลูกสร้างอย่างอื่น หรือแพ",
//     "status": "new",
//     "transaction_id": "689e16bcb7f42738208f2f09",
//     creation_date: "",
//     expired_date: ""
//   },
//   {
//     "_id": "689eea1b887e09577d77312f",
//     "edocument_id": "DC-20258150000011",
//     "name": "ลักษณะตราสาร 1. เช่าที่ดิน โรงเรือน สิ่งปลูกสร้างอย่างอื่น หรือแพ",
//     "status": "new",
//     "transaction_id": "689eea1b887e09577d773118",
//     creation_date: "",
//     expired_date: ""
//   },
//   {
//     "_id": "689eea5e887e09577d77320e",
//     "edocument_id": "DC-20258150000012",
//     "name": "ลักษณะตราสาร 1. เช่าที่ดิน โรงเรือน สิ่งปลูกสร้างอย่างอื่น หรือแพ",
//     "status": "new",
//     "transaction_id": "689eea5e887e09577d7731f7",
//     creation_date: "",
//     expired_date: ""
//   },
//   {
//     "_id": "689eec9a887e09577d77364b",
//     "edocument_id": "DC-20258150000013",
//     "name": "ลักษณะตราสาร 1. เช่าที่ดิน โรงเรือน สิ่งปลูกสร้างอย่างอื่น หรือแพ",
//     "status": "new",
//     "transaction_id": "689eec9a887e09577d773634",
//     creation_date: "",
//     expired_date: ""
//   },
//   {
//     "_id": "689ef05e887e09577d773c7e",
//     "edocument_id": "DC-20258150000015",
//     "name": "ลักษณะตราสาร 1. เช่าที่ดิน โรงเรือน สิ่งปลูกสร้างอย่างอื่น หรือแพ",
//     "status": "new",
//     "transaction_id": "689ef05e887e09577d773c67",
//     creation_date: "",
//     expired_date: ""
//   },
//   {
//     "_id": "68a187aa40914d427b9945a3",
//     "edocument_id": "DC-20258170000000",
//     "name": "ลักษณะตราสาร 1. เช่าที่ดิน โรงเรือน สิ่งปลูกสร้างอย่างอื่น หรือแพ",
//     "status": "new",
//     "transaction_id": "68a187a940914d427b99458c",
//     creation_date: "",
//     expired_date: ""
//   },
//   {
//     "_id": "68a18c3540914d427b994aa4",
//     "edocument_id": "DC-20258170000002",
//     "name": "ลักษณะตราสาร 1. เช่าที่ดิน โรงเรือน สิ่งปลูกสร้างอย่างอื่น หรือแพ",
//     "status": "new",
//     "transaction_id": "68a18c3540914d427b994a8d",
//     creation_date: "",
//     expired_date: ""
//   },
//   {
//     "_id": "68a18c8140914d427b994b73",
//     "edocument_id": "DC-20258170000003",
//     "name": "ลักษณะตราสาร 1. เช่าที่ดิน โรงเรือน สิ่งปลูกสร้างอย่างอื่น หรือแพ",
//     "status": "new",
//     "transaction_id": "68a18c8140914d427b994b5c",
//     creation_date: "",
//     expired_date: ""
//   },
//   {
//     "_id": "68a19098cdec96d61b95f6a2",
//     "edocument_id": "DC-20258170000004",
//     "name": "ลักษณะตราสาร 1. เช่าที่ดิน โรงเรือน สิ่งปลูกสร้างอย่างอื่น หรือแพ",
//     "status": "new",
//     "transaction_id": "68a19098cdec96d61b95f68b",
//     creation_date: "",
//     expired_date: ""
//   },
//   {
//     "_id": "68a19520cdec96d61b95fa0e",
//     "edocument_id": "DC-20258170000006",
//     "name": "ลักษณะตราสาร 1. เช่าที่ดิน โรงเรือน สิ่งปลูกสร้างอย่างอื่น หรือแพ",
//     "status": "new",
//     "transaction_id": "68a19520cdec96d61b95f9f7",
//     creation_date: "",
//     expired_date: ""
//   },
//   {
//     "_id": "68a196eecdec96d61b95fe51",
//     "edocument_id": "DC-20258170000007",
//     "name": "ลักษณะตราสาร 1. เช่าที่ดิน โรงเรือน สิ่งปลูกสร้างอย่างอื่น หรือแพ",
//     "status": "new",
//     "transaction_id": "68a196eecdec96d61b95fe3a",
//     creation_date: "",
//     expired_date: ""
//   },
//   {
//     "_id": "68a19bc0cdec96d61b96050b",
//     "edocument_id": "DC-20258170000008",
//     "name": "ลักษณะตราสาร 1. เช่าที่ดิน โรงเรือน สิ่งปลูกสร้างอย่างอื่น หรือแพ",
//     "status": "new",
//     "transaction_id": "68a19bc0cdec96d61b9604f4",
//     creation_date: "",
//     expired_date: ""
//   }
// ]


const FormList = () => {
  const dispatch = useAppDispatch()
  const router = useRouter();
  const { id } = useParams();
  const params = useSearchParams();
  const docType = params.get('docType');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [transEtamp, setTransEstamp] = useState<listEStamp[]>([]);
  const [totalTransCount, setTotalTransCount] = useState<number>(0);
  const [paginateValue, setPaginateValue] = useState({
    search: '',
    page: 1,
    size: 10
  })
  const [isOpenDetailModal, setIsOpenDetailModal] = useState(false)
  const [transaction, setTransaction] = useState<listEStamp>()
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')


  const columns = [
    {
      title: 'เลขที่สัญญา',
      dataIndex: 'edocument_id',
      key: 'edocument_id',
      sorter: (a: listEStamp, b: listEStamp) => a.edocument_id.localeCompare(b.edocument_id),
    }, {
      title: 'ชื่อเอกสาร',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => {
        switch (text) {
          case 'complete':
            return <span className="rounded-lg bg-[#eaf8ef] py-1 px-2 text-[#00C45A]">เสียอากรแล้ว</span>;
          case 'pending':
            return <span className="rounded-lg bg-[#fff5e6] py-1 px-2 text-[#FDB131]">รอเสียอากร</span>;
          case 'new':
            return <span className="rounded-lg bg-[#e5f6ff] py-1 px-2 text-[#00AAFF]">รอยื่นแบบอากร</span>;
        }
      }
    }, {
      title: 'จัดการ',
      key: 'action',
      render: (item: listEStamp) => <span onClick={() => {
        setTransaction(item)
        setIsOpenDetailModal(true)
      }}
        className="text-[#0153BD] hover:underline hover:text-[#4696ff] cursor-pointer">รายละเอียด</span>
    }
  ]

  const submitTransaction = async () => {
    setIsOpenConfirmModal(false);
    const res = await dispatch(
      SubmitTransactionEstamp(selectedRowKeys[0] as string) as any
    );
    if (res.payload) {
      setIsSuccessModalOpen(true);
    } else if (res.error) {
      setIsErrorModalOpen(true);
      setErrorMessage(
        res.error.message || "เกิดข้อผิดพลาด ไม่สามารถยื่นแบบได้"
      );
    }
  };

  const getEstampTypeDetail = useCallback(
    async ({
      id,
      search = "",
      page = 1,
      size = 10,
    }: {
      id: string;
      search: string;
      page: number;
      size: number;
    }) => {
      try {
        if (typeof id === "string") {
          const res = await dispatch(
            ListEstampTransactionByID({ id, search, page, size }) as any
          );
          const payload = res?.payload || {};
          setTransEstamp(payload.data ?? []);
          setTotalTransCount(Number(payload.total_data) || 0);
        }
      } catch (error) {
        const apiError = detectApiError(error);
        if (
          apiError.errorType === "unauthorized" ||
          apiError.errorType === "network_error"
        ) {
          router.replace("/login");
        } else {
          console.log("error", error);
        }
      }
    },
    [dispatch, router]
  );

  useEffect(() => {
    if (id) {
      getEstampTypeDetail({
        id: id as string,
        search: paginateValue.search,
        page: paginateValue.page,
        size: paginateValue.size,
      });
    }
  }, [id, paginateValue, getEstampTypeDetail]);

  return (
    <div>
      <button
        className="text-theme text-lg font-bold flex items-center gap-2 mb-6"
        onClick={() => router.back()}
      >
        <ChevronLeft size={24} /> ฟอร์มชำระอากรแสตมป์ {`(${docType})`}
      </button>
      <section className="bg-[#FAFAFA] rounded-xl p-4 shadow-theme mt-6 gap-3" >
        <div className="flex justify-end mb-2">
          <div className="flex-1">
            <span className="text-[16px]">รายการเอกสาร</span><span className="text-[#FDB131]"> {totalTransCount} รายการ</span>
          </div>
          <div className="w-[280px] mx-4">
            <SearchInput
              placeholder="ค้นหาเอกสาร"
              className="w-[280px]"
              onSearch={(value) => setPaginateValue((prev) => ({ ...prev, search: value, page: 1 }))}
              debounceMs={700}
            />
          </div>

          <Button onClick={() => setIsOpenConfirmModal(true)} className="bg-gradient-to-r from-[#0153BD] to-[#4CA8EE] text-white px-6 py-4" disabled={selectedRowKeys.length === 0}>
            {"ยื่นแบบ"}
          </Button>
        </div>
        <PaymentTable
          dataSource={transEtamp}
          columns={columns}
          selectableType="radio"
          rowKey="_id"
          selectedRowKeys={selectedRowKeys}
          onSelectionChange={(keys) => setSelectedRowKeys(keys)}
          pagination={{
            current: paginateValue.page || 1,
            pageSize: paginateValue.size || 10,
            total: totalTransCount || 0,
            showSizeChanger: true,
            // pageSizeOptions: [10, 20, 50, 100],
            onChange: (page, pageSize) =>
              setPaginateValue((prev) => ({
                ...prev,
                page,
                size: pageSize ?? prev.size,
              })),
          }}
        />
      </section>
      <DetailStampModal
        isOpen={isOpenDetailModal}
        onClose={() => setIsOpenDetailModal(false)}
        onConfirm={() => setIsOpenDetailModal(false)}
        title={"รายละเอียดเอกสาร"}
        transactionID={transaction?._id || ""}
      />
      <ConfirmModal
        open={isOpenConfirmModal}
        onCancel={() => setIsOpenConfirmModal(false)}
        onConfirm={() => submitTransaction()}
        message="คุณต้องการยืนยันการยื่นแบบเอกสารนี้ ใช่หรือไม่?"
        titleName="ยืนยันการยื่นแบบ"
      />
      <SuccessModal
        titleName="ยื่นแบบสำเร็จ"
        message="ยื่นแบบฟอร์มเรียบร้อยแล้ว"
        open={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          router.push(`/stamp/payment?transaction_estamp_id=${selectedRowKeys}`);
        }}
        autoCloseDelay={2000}
      />
      <ErrorModal
        open={isErrorModalOpen}
        titleName={'เกิดข้อผิดพลาด ไม่สามารถยื่นแบบได้'}
        message={errorMessage}
        onClose={() => {
          setIsErrorModalOpen(false);
        }}
      />
    </div>
  )
}

export default FormList;