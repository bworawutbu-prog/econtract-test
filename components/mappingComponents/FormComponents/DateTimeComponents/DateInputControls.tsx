"use client";

import React from 'react';
import { Select } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { useDateContext } from './DateContext';
import { 
  getDateOptionsForFormat, 
  getPlaceholderForFormat, 
  getLabelForFormat 
} from './DateFormatUtils';
import { convertToThaiNumber, decodeHtmlEntities } from '../../FormUtils/defaultStyle';

const DateInputControls: React.FC = () => {
  const { dateState, updateDateState, setFocusedElement } = useDateContext();

  // Check if elements are available (for incomplete groups)
  const availableElements = (dateState as any).availableElements || { days: true, months: true, years: true };

  // Get options and labels based on current format
  const daysOptions = getDateOptionsForFormat(dateState.format, 'days');
  const monthsOptions = getDateOptionsForFormat(dateState.format, 'months');
  const yearsOptions = getDateOptionsForFormat(dateState.format, 'years');

  const daysPlaceholder = getPlaceholderForFormat(dateState.format, 'days');
  const monthsPlaceholder = getPlaceholderForFormat(dateState.format, 'months');
  const yearsPlaceholder = getPlaceholderForFormat(dateState.format, 'years');

  // Format display values for THBCnumber format
  const formatDisplayValue = (value: string, elementType: 'days' | 'months' | 'years'): string => {
    if (!value) return '';
    if (dateState.format === 'THBCnumber') {
      // Convert to Thai number and then decode HTML entities for display
      const thaiNumber = convertToThaiNumber(value);
      return decodeHtmlEntities(thaiNumber);
    }
    return value;
  };

  const formatSelectValue = (value: string): string => {
    if (!value) return '';
    if (dateState.format === 'THBCnumber') {
      // Convert to Thai number and then decode HTML entities for display
      const thaiNumber = convertToThaiNumber(value);
      return decodeHtmlEntities(thaiNumber);
    }
    return value;
  };

  return (
    <div className="mb-4">
      <div className="grid grid-cols-3 gap-2">
        {/* Days Input */}
        <div>
          <label className={`text-xs block mb-1 ${!availableElements.days ? 'text-gray-400' : 'text-gray-600'}`}>
            Days (DD)
          </label>
          <Select
            placeholder={availableElements.days ? daysPlaceholder : "Element deleted"}
            value={availableElements.days ? formatSelectValue(dateState.days) : ""}
            disabled={dateState.useCurrentDate || !availableElements.days}
            onChange={(value) => {
              // 🎯 FIXED: Only update if value actually changed and element is available
              if (availableElements.days && value !== dateState.days) {
                updateDateState({ days: value });
              }
            }}
            onFocus={() => availableElements.days && setFocusedElement('days')}
            onBlur={() => setFocusedElement(null)}
            suffixIcon={<CalendarOutlined />}
            className={`max-w-[90px] w-full ${!availableElements.days ? 'opacity-50' : ''}`}
            options={availableElements?.days ? daysOptions?.map(option => ({
              ...option,
              label: formatDisplayValue(option.label, 'days')
            })) : []}
          />
        </div>
        
        {/* Months Input */}
        <div>
          <label className={`text-xs block mb-1 ${!availableElements.months ? 'text-gray-400' : 'text-gray-600'}`}>
            Months (MM)
          </label>
          <Select
            placeholder={availableElements.months ? monthsPlaceholder : "Element deleted"}
            value={availableElements.months ? formatSelectValue(dateState.months) : ""}
            disabled={dateState.useCurrentDate || !availableElements.months}
            onChange={(value) => {
              // 🎯 FIXED: Only update if value actually changed and element is available
              if (availableElements.months && value !== dateState.months) {
                updateDateState({ months: value });
              }
            }}
            onFocus={() => availableElements.months && setFocusedElement('months')}
            onBlur={() => setFocusedElement(null)}
            suffixIcon={<CalendarOutlined />}
            className={`max-w-[90px] w-full ${!availableElements.months ? 'opacity-50' : ''}`}
            options={availableElements?.months ? monthsOptions?.map(option => ({
              ...option,
              label: formatDisplayValue(option.label, 'months')
            })) : []}
          />
        </div>
        
        {/* Years Input */}
        <div>
          <label className={`text-xs block mb-1 ${!availableElements.years ? 'text-gray-400' : 'text-gray-600'}`}>
            Years (YYYY)
          </label>
          <Select
            placeholder={availableElements.years ? yearsPlaceholder : "Element deleted"}
            value={availableElements.years ? formatSelectValue(dateState.years) : ""}
            disabled={dateState.useCurrentDate || !availableElements.years}
            onChange={(value) => {
              // 🎯 FIXED: Only update if value actually changed and element is available
              if (availableElements.years && value !== dateState.years) {
                updateDateState({ years: value });
              }
            }}
            onFocus={() => availableElements.years && setFocusedElement('years')}
            onBlur={() => setFocusedElement(null)}
            suffixIcon={<CalendarOutlined />}
            className={`max-w-[90px] w-full ${!availableElements.years ? 'opacity-50' : ''}`}
            options={availableElements?.years ? yearsOptions?.map(option => ({
              ...option,
              label: formatDisplayValue(option.label, 'years')
            })) : []}
          />
        </div>
      </div>
    </div>
  );
};

export default DateInputControls; 