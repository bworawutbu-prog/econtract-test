"use client";

import React from "react";
import { ConfigProvider, DatePicker as AntDatePicker } from "antd";
import thTH from "antd/locale/th_TH";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import type { Dayjs } from "dayjs";
import "dayjs/locale/th";

// Enable Buddhist Era and enforce Thai locale globally for dayjs
dayjs.extend(buddhistEra);
dayjs.locale("th");

const { RangePicker } = AntDatePicker;



export interface AppDatePickerProps {
  mode?: "single" | "range";
  value?: Dayjs | [Dayjs, Dayjs];
  defaultValue?: Dayjs | [Dayjs, Dayjs];
  onChange?: (
    value: Dayjs | [Dayjs, Dayjs],
    formatted: string | string[]
  ) => void;
  format?: string;
  placeholder?: string | [string, string];
  allowClear?: boolean;
  disabledDate?: (current: Dayjs) => boolean;
  size?: "small" | "middle" | "large";
  className?: string;
  style?: React.CSSProperties;
}

const AppDatePicker: React.FC<AppDatePickerProps> = ({
  mode = "single",
  value,
  defaultValue,
  onChange,
  format = "DD/MM/BBBB",
  placeholder,
  allowClear = true,
  disabledDate,
  size = "middle",
  className,
  style,
}) => {
  
  
  if (mode === "range") {
    return (
      <ConfigProvider locale={thTH}>
        <RangePicker
          value={(value as [Dayjs, Dayjs]) || undefined}
          defaultValue={(defaultValue as [Dayjs, Dayjs]) || undefined}
          onChange={(dates, dateStrings) => {
            onChange?.(dates as [Dayjs, Dayjs], dateStrings as [string, string]);
          }}
          format={format}
          placeholder={(placeholder as [string, string]) || ["เริ่มวันที่", "ถึงวันที่"]}
          allowClear={allowClear}
          disabledDate={disabledDate}
          size={size}
          className={className}
          style={style}
        />
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider locale={thTH}>
      <AntDatePicker
        value={(value as Dayjs) || undefined}
        defaultValue={undefined}
        onChange={(date, dateString) => {
          onChange?.(date, dateString);
        }}
        format={format}
        placeholder={(placeholder as string) || "เลือกวันที่"}
        allowClear={allowClear}
        disabledDate={disabledDate}
        size={size}
        className={className}
        style={style}
      />
    </ConfigProvider>
  );
};

export default AppDatePicker;
