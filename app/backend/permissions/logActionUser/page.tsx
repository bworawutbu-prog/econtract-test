"use client";

import AppDatePicker from "@/components/ui/datePicker";
import SearchInput from "@/components/ui/searchInput";
import TableComponent from "@/components/ui/table";
import { LogActionUser } from "@/store/types/user";
import { Tooltip, Typography } from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { RootState, useAppDispatch } from "@/store";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { getLogActionUsers } from "@/store/backendStore/logActionUserAPI";
import Image from "next/image";
import FileDocUsageIcon from "@/assets/webp/file-doc-usage.webp";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const EllipsisWithTooltip = ({ text }: { text: string }) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    if (spanRef.current) {
      setIsTruncated(spanRef.current.scrollWidth > spanRef.current.clientWidth);
    }
  }, [text]);

  return (
    <Tooltip
      title={isTruncated ? text : undefined}
      placement="topLeft"
      styles={{
        body: {
          width: "500px",
        },
      }}
    >
      <span
        ref={spanRef}
        className="inline-block max-w-[500px] overflow-hidden text-ellipsis whitespace-nowrap align-middle cursor-pointer"
      >
        {text}
      </span>
    </Tooltip>
  );
};

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateSelected, setDateSelected] = useState<dayjs.Dayjs | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<LogActionUser[]>([]);
  const [paginateValue, setPaginateValue] = useState({
    search: "",
    page: 1,
    size: 10,
    status: "total",
  });
  const dispatch = useAppDispatch() as ThunkDispatch<
    RootState,
    unknown,
    AnyAction
  >;

  useEffect(() => {
    // Ensure consistent initial render between SSR and client hydration
    setIsClient(true);
  }, []);

  const fetchData = () => {
    if (isLoading) return;
    setIsLoading(true);
    dispatch(
      getLogActionUsers({
        search: paginateValue.search,
        page: paginateValue.page,
        size: paginateValue.size,
        date: dateSelected ? dateSelected.format("YYYY-MM-DD") : undefined,
      })
    ).then((res: any) => {
      if (res.payload && res.payload.success !== false) {
        setItems(res.payload.data ?? []);
        setTotal(res.payload.total ?? 0);
      } else {
        setItems([]);
        setTotal(0);
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, [paginateValue, dateSelected]);

  const handleSearch = useCallback(
    (value: string) => {
      const trimmedQuery = value.trim();
      setSearchQuery(trimmedQuery);
      setPaginateValue({
        ...paginateValue,
        search: trimmedQuery,
        page: 1,
      });
    },
    [paginateValue]
  );

  const handleDateChange = useCallback(
    (date: dayjs.Dayjs | null) => {
      setDateSelected(date);
      setPaginateValue({
        ...paginateValue,
        page: 1,
      });
    },
    [paginateValue]
  );

  const columns = [
    {
      title: "ลำดับ",
      dataIndex: "index",
      key: "index",
      render: (text: string, record: any, index: number) =>
        (paginateValue.page - 1) * paginateValue.size + (index + 1),
    },
    {
      title: "ผู้ดำเนินการ",
      dataIndex: "created_by",
      key: "created_by",
    },
    {
      title: "วันที่ดำเนินการ",
      dataIndex: "created_at",
      key: "created_at",
      render: (text: string) => {
        return text
          ? dayjs.utc(text).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm")
          : "-";
      },
    },
    {
      title: "ประเภท",
      dataIndex: "action",
      key: "action",
    },
    {
      title: "รายละเอียด",
      dataIndex: "detail",
      key: "detail",
      width: 500,
      render: (text: string) => {
        if (!text) return "-";
        return <EllipsisWithTooltip text={text} />;
      },
    },
  ];

  return (
    <>
      <div className="flex items-center gap-2 mb-5">
        <Image src={FileDocUsageIcon} alt="Peron Icon" width={32} height={32} />
        <span className="text-[28px] font-bold">ข้อมูลการใช้งาน</span>
      </div>
      <section className="mt-6">
        <div className="flex justify-between">
          <SearchInput
            placeholder="ค้นหาเอกสาร"
            className="w-[280px]"
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            debounceMs={700}
          />
          <div className="flex gap-2 items-center">
            <Typography className="flex">วันที่ดำเนินการ :</Typography>
            <AppDatePicker
              placeholder={"เลือกวันที่"}
              value={
                dateSelected ? dateSelected : isClient ? dayjs() : undefined
              }
              onChange={(date: dayjs.Dayjs | [dayjs.Dayjs, dayjs.Dayjs] | "") =>
                handleDateChange(date && dayjs.isDayjs(date) ? date : dayjs())
              }
              allowClear={false}
            />
          </div>
        </div>
      </section>
      <section className="bg-[#FAFAFA] rounded-xl p-4 shadow-theme mt-6">
        <div className="mb-4 font-bold text-md">
          รายการข้อมูลผู้ใช้งานทั้งหมด{" "}
          <span className="font-medium text-[#FDB131] pl-5">
            {total} รายการ
          </span>
        </div>
        <TableComponent
          key={`${paginateValue.search}-${dateSelected}`}
          columns={columns}
          loading={isLoading}
          dataSource={items?.map((item) => ({
            ...item,
            key: item.id,
          }))}
          pagination={{
            current: paginateValue.page,
            pageSize: paginateValue.size,
            total: total,
            onChange: (page, pageSize) =>
              setPaginateValue((prev) => ({
                ...prev,
                page,
                size: pageSize ?? prev.size,
              })),
          }}
        />
      </section>
    </>
  );
}
