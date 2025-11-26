"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useEffect } from "react";
import { Table, Spin } from "antd";
import Image from "next/image";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import DocsICon from "@/assets/webp/stamp/docs.webp"
import dayjs from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");

interface TableComponentProps<T> {
  columns: TableColumnsType<T>;
  dataSource: T[];
  setCount?: (count: number) => void;
  loading?: boolean;
  rowSelection?: boolean;
  onRowSelect?: (selectedRows: T[]) => void;
  pagination?: {
    current?: number;
    pageSize?: number;
    total?: number;
    showSizeChanger?: boolean;
    onChange?: (page: number, pageSize: number) => void;
  };
  scrollX?: number;
}

const TableComponent = <T extends { key: React.Key }>({
  columns,
  dataSource,
  setCount,
  loading: externalLoading = false,
  rowSelection = false,
  onRowSelect,
  pagination = {
    pageSize: 10,
    current: 1,
    showSizeChanger: false,
  },
  scrollX: scrollX = 1000,
}: TableComponentProps<T>) => {
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(pagination.current || 1);
  const [pageSizeState, setPageSizeState] = useState(pagination.pageSize || 10);
  const showSizeChanger = pagination.showSizeChanger === true;

  useEffect(() => {
    setCurrentPage(pagination.current || 1);
  }, [pagination.current]);
  useEffect(() => {
    setPageSizeState(pagination.pageSize || 10);
  }, [pagination.pageSize]);

  useEffect(() => {

    setInternalLoading(false)

  }, [dataSource]);

  const handleRowSelection = useCallback(
    (selectedRowKeys: React.Key[], rows: T[]) => {
      setSelectedRows(rows);
      onRowSelect?.(rows);
    },
    [onRowSelect]
  );

  useEffect(() => {
    if (setCount) {
      setCount(dataSource.length);
    }
  }, [dataSource, setCount]);

  // const handlePageChange = (page: number, pageSize: number) => {
  //   console.log('setCurrentPage :>> ',page );
  //   setCurrentPage(page);
  //   pagination.onChange?.(page, pageSize);
  // };

  const handlePageChange = (page: number, nextSize: number) => {
    const sizeChanged = nextSize !== pageSizeState;
    if (sizeChanged) {
      setCurrentPage(1);
      setPageSizeState(nextSize);
      pagination.onChange?.(1, nextSize);
    } else {
      setCurrentPage(page);
      pagination.onChange?.(page, nextSize);
    }
  };

  const paginationConfig: TablePaginationConfig = {
    ...pagination,
    current: currentPage,
    pageSize: pagination.pageSize || 10,
    className: "custom-pagination-table",
    showSizeChanger,
    showQuickJumper: false,
    // pageSizeOptions: [10, 20, 50, 100],
    onShowSizeChange: (_curr, size) => handlePageChange(1, size),
    itemRender: (
      page: number,
      type: string,
      originalElement: React.ReactNode
    ) => {
      if (type === "page") {
        return <div className="pagination-item">{originalElement}</div>;
      }
      // if (type === "prev") {
      //   return (
      //     <div className="pagination-nav pagination-prev">
      //       <span>←</span>
      //     </div>
      //   );
      // }
      // if (type === "next") {
      //   return (
      //     <div className="pagination-nav pagination-next">
      //       <span>→</span>
      //     </div>
      //   );
      // }
      return originalElement;
    },
    onChange: handlePageChange,
  };

  return (
    <Spin spinning={internalLoading || externalLoading}>
      {/* <div className="w-full overflow-auto bg-white"> */}
      <div className="w-full bg-white">
        <Table
          columns={columns?.map((col) => {
            if ("dataIndex" in col && col.dataIndex === "index") {
              return {
                ...col,
                render: (_: any, __: any, index: number) => {
                  const actualIndex =
                    (currentPage - 1) * (pagination.pageSize || 10) + index + 1;
                  return <span>{actualIndex}</span>;
                },
              };
            }
            if ("dataIndex" in col && col.dataIndex === "creation_date") {
              return {
                ...col,
                render: (text: string) => (
                  <span className="">
                    {dayjs(text).locale("th").format("DD/MM/BBBB")}
                  </span>
                ),
              };
            }
            if ("dataIndex" in col && col.dataIndex === "expire_date") {
              return {
                ...col,
                render: (text: string) => (
                  <span className="">
                    {dayjs(text).locale("th").format("DD/MM/BBBB")}
                  </span>
                ),
              };
            }
            if ("dataIndex" in col && col.dataIndex === "name") {
              return {
                ...col,
                render: (text: string) => <span className="">{text}</span>,
              };
            }
            if ("dataIndex" in col && col.dataIndex === "edocument_id") {
              return {
                ...col,
                render: (text: string) => (
                  <div className="flex items-center space-x-2">
                    <Image src={DocsICon} alt="docs-icon" className="w-4 h-4" />
                    <span className="">{text}</span>
                  </div>
                ),
              };
            }
            return col;
          })}
          dataSource={dataSource}
          sortDirections={["ascend", "descend"]}
          showSorterTooltip={true}
          pagination={paginationConfig}
          rowSelection={
            rowSelection
              ? {
                  type: "checkbox",
                  onChange: handleRowSelection,
                  selectedRowKeys: (selectedRows || []).map((row) => row.key),
                }
              : undefined
          }
          components={{
            header: {
              cell: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
                <th
                  {...props}
                  style={{
                    backgroundColor: "#4E73F80A",
                    color: "#0153BD",
                    padding: "12px",
                    // textAlign: "center",
                  }}
                />
              ),
            },
          }}
          onRow={(record) => ({})}
          scroll={{ x: scrollX }}
        />
      </div>
    </Spin>
  );
};

export default TableComponent;
