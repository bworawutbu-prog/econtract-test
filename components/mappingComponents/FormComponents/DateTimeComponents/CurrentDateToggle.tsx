"use client";

import React from 'react';
import { useDateContext } from './DateContext';

interface CurrentDateToggleProps {
  onApplyCurrentDate: () => void;
}

const CurrentDateToggle: React.FC<CurrentDateToggleProps> = ({ onApplyCurrentDate }) => {
  const { dateState, updateDateState } = useDateContext();

  const handleToggleChange = (checked: boolean) => {
    // 🎯 FIXED: Only update if value actually changed
    if (checked !== dateState.useCurrentDate) {
      // Update useCurrentDate first
      updateDateState({ useCurrentDate: checked });
      
      if (checked) {
        // Apply current date immediately when checked
        setTimeout(() => onApplyCurrentDate(), 50);
      } else {
        // Clear values when unchecked to allow manual input
        updateDateState({ 
          days: '', 
          months: '', 
          years: '' 
        });
      }
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="nowDate"
          checked={dateState.useCurrentDate}
          onChange={(e) => handleToggleChange(e.target.checked)}
        />
        <label htmlFor="nowDate" className="text-sm font-medium">
          Use Current Date
        </label>
      </div>
    </div>
  );
};

export default CurrentDateToggle; 