"use client";

import { convertToThaiNumber, decodeHtmlEntities } from "../../FormUtils/defaultStyle";

// Utility functions สำหรับจัดการ Date Format

export const getThaiMonthNames = () => [
  { short: 'ม.ค.', full: 'มกราคม' },
  { short: 'ก.พ.', full: 'กุมภาพันธ์' },
  { short: 'มี.ค.', full: 'มีนาคม' },
  { short: 'เม.ย.', full: 'เมษายน' },
  { short: 'พ.ค.', full: 'พฤษภาคม' },
  { short: 'มิ.ย.', full: 'มิถุนายน' },
  { short: 'ก.ค.', full: 'กรกฎาคม' },
  { short: 'ส.ค.', full: 'สิงหาคม' },
  { short: 'ก.ย.', full: 'กันยายน' },
  { short: 'ต.ค.', full: 'ตุลาคม' },
  { short: 'พ.ย.', full: 'พฤศจิกายน' },
  { short: 'ธ.ค.', full: 'ธันวาคม' }
];

export const convertToThaiNumbers = (num: string): string => {
  // Use the centralized function from defaultStyle.ts
  const thaiNumber = convertToThaiNumber(num);
  return decodeHtmlEntities(thaiNumber);
};

export const getDateOptionsForFormat = (format: string, type: 'days' | 'months' | 'years') => {
  const thaiMonths = getThaiMonthNames();
  const currentYear = new Date().getFullYear();
  
  switch (type) {
    case 'days':
      if (['THsBC', 'THsBB', 'THBC', 'THBB'].includes(format)) {
        // Thai formats - days without leading zero (1-31)
        return Array.from({ length: 31 }, (_, i) => ({
          value: String(i + 1),
          label: format === 'THBCnumber' ? convertToThaiNumbers(String(i + 1)) : String(i + 1)
        }));
      } else {
        // Western formats - days with leading zero (01-31)
        return Array.from({ length: 31 }, (_, i) => ({
          value: String(i + 1).padStart(2, '0'),
          label: String(i + 1).padStart(2, '0')
        }));
      }
      
    case 'months':
      if (format === 'THsBC' || format === 'THsBB') {
        // Thai short months (ม.ค., ก.พ., etc.)
        return thaiMonths.map((month, i) => ({
          value: month.short,
          label: month.short
        }));
      } else if (format === 'THBC' || format === 'THBB') {
        // Thai full months (มกราคม, กุมภาพันธ์, etc.)
        return thaiMonths.map((month, i) => ({
          value: month.full,
          label: month.full
        }));
      } else if (format === 'THBCnumber') {
        // Thai full months with Thai numerals
        return thaiMonths.map((month, i) => ({
          value: month.full,
          label: month.full
        }));
      } else {
        // Western formats - numeric months (01-12)
        return Array.from({ length: 12 }, (_, i) => ({
          value: String(i + 1).padStart(2, '0'),
          label: String(i + 1).padStart(2, '0')
        }));
      }
      
    case 'years':
      const startYear = currentYear - 25;
      const endYear = currentYear + 25;
      
      if (['THsBB', 'THBCnumber', 'THBB'].includes(format)) {
        // Buddhist Era (พ.ศ.) - add 543 years
        return Array.from({ length: 51 }, (_, i) => {
          const year = String(startYear + i + 543);
          return {
            value: year,
            label: format === 'THBCnumber' ? convertToThaiNumbers(year) : year
          };
        });
      } else if (format === 'EUs') {
        // Short year format (YY)
        return Array.from({ length: 51 }, (_, i) => {
          const year = String(startYear + i).slice(-2);
          return {
            value: year,
            label: year
          };
        });
      } else {
        // Western formats - Christian Era (YYYY)
        return Array.from({ length: 51 }, (_, i) => {
          const year = String(startYear + i);
          return {
            value: year,
            label: year
          };
        });
      }
      
    default:
      return [];
  }
};

export const getPlaceholderForFormat = (format: string, type: 'days' | 'months' | 'years') => {
  switch (type) {
    case 'days':
      return ['THsBC', 'THsBB', 'THBC', 'THBB', 'THBCnumber'].includes(format) ? 'D' : 'DD';
    case 'months':
      if (format === 'THsBC' || format === 'THsBB') return 'ม.ค.';
      if (format === 'THBC' || format === 'THBB' || format === 'THBCnumber') return 'มกราคม';
      return 'MM';
    case 'years':
      if (['THBB', 'THBCnumber', 'THBB'].includes(format)) return 'พ.ศ.';
      if (format === 'EUs') return 'YY';
      return 'YYYY';
    default:
      return '';
  }
};

export const getLabelForFormat = (format: string, type: 'days' | 'months' | 'years') => {
  switch (type) {
    case 'days':
      return ['THsBC', 'THsBB', 'THBC', 'THBB', 'THBCnumber'].includes(format) ? 'Days (D)' : 'Days (DD)';
    case 'months':
      if (format === 'THsBC' || format === 'THsBB') return 'Months (ม.ค.)';
      if (format === 'THBC' || format === 'THBB' || format === 'THBCnumber') return 'Months (มกราคม)';
      return 'Months (MM)';
    case 'years':
      if (['THsBB', 'THBCnumber', 'THBB'].includes(format)) return 'Years (พ.ศ.)';
      if (format === 'EUs') return 'Years (YY)';
      return 'Years (YYYY)';
    default:
      return '';
  }
}; 