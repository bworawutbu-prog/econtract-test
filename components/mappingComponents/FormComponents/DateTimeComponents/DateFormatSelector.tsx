"use client";

import React from 'react';
import { Select } from 'antd';
import { ChevronDown } from 'lucide-react';
import { useDateContext } from './DateContext';
import { convertToThaiNumber, decodeHtmlEntities } from '../../FormUtils/defaultStyle';

const DateFormatSelector: React.FC = () => {
  const { dateState, updateDateState } = useDateContext();

  return (
    <Select
      value={dateState.format}
      className="w-full"
      onChange={(value) => {
        // 🎯 FIXED: Only update if format actually changed
        if (value !== dateState.format) {
          updateDateState({ format: value });
        }
      }}
      suffixIcon={<ChevronDown />}
      options={[
        { value: "EU", label: "DD/MM/YYYY(EU)" },
        { value: "US", label: "MM/DD/YYYY(US)" },
        { value: "EUs", label: "DD/MM/YY(EU)" },
        { value: "THsBC", label: "1 ม.ค. 2025" },
        { value: "THsBB", label: "1 ม.ค. 2068" },
        { value: "THBC", label: "1 มกราคม 2025" },
        { value: "THBCnumber", label: decodeHtmlEntities(convertToThaiNumber("1")) + " มกราคม " + decodeHtmlEntities(convertToThaiNumber("2568")) },
        { value: "THBB", label: "1 มกราคม 2568" },
      ]}
    />
  );
};

export default DateFormatSelector; 