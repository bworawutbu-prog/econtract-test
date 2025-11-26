"use client";

import React, { useState } from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';

export interface PaymentTableProps {
  dataSource: any[];
  columns?: TableProps<any>["columns"];
  pagination?: TableProps<any>["pagination"];
  /** Enable row selection. Use 'radio' for single-select or 'checkbox' for multi-select. */
  selectableType?: 'radio' | 'checkbox';
  /** Controlled selected row keys. If provided, component becomes controlled. */
  selectedRowKeys?: React.Key[];
  /** Notify when selection changes. */
  onSelectionChange?: (selectedRowKeys: React.Key[], selectedRows: any[]) => void;
  /** Key to use for rows. Defaults to 'id'. */
  rowKey?: string | ((record: any) => React.Key);
}

const PaymentTable: React.FC<PaymentTableProps> = ({
  dataSource = [],
  columns,
  pagination,
  selectableType,
  selectedRowKeys: controlledSelectedRowKeys,
  onSelectionChange,
  rowKey = 'id',
}) => {
  const [uncontrolledSelectedRowKeys, setUncontrolledSelectedRowKeys] = useState<React.Key[]>([]);
  const isControlled = Array.isArray(controlledSelectedRowKeys);
  const selectedRowKeys = isControlled ? (controlledSelectedRowKeys as React.Key[]) : uncontrolledSelectedRowKeys;

  const handleSelectionChange = (keys: React.Key[], rows: any[]) => {
    if (!isControlled) {
      setUncontrolledSelectedRowKeys(keys);
    }
    onSelectionChange?.(keys, rows);
  };

  const rowSelection = selectableType
    ? {
        type: selectableType,
        selectedRowKeys,
        onChange: handleSelectionChange,
      } as TableProps<any>["rowSelection"]
    : undefined;

  return (
    <Table
      rowKey={rowKey as any}
      dataSource={dataSource}
      columns={columns}
      pagination={pagination}
      rowSelection={rowSelection}
    />
  );
};

export default PaymentTable;