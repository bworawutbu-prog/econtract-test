'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Input } from 'antd';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  value?: string;
  defaultValue?: string;
  onSearch?: (value: string) => void;
  onChange?: (value: string) => void;
  debounceMs?: number;
  showClearButton?: boolean;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
  allowClear?: boolean;
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
  onPressEnter?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "ค้นหา",
  className = "w-72 min-w-full",
  value: externalValue,
  defaultValue = "",
  onSearch,
  onChange,
  debounceMs = 700,
  showClearButton = true,
  disabled = false,
  size = 'middle',
  allowClear = false,
  suffix,
  prefix,
  onPressEnter,
  onKeyDown,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Use external value if provided, otherwise use internal state
  const isControlled = externalValue !== undefined;
  const currentValue = isControlled ? externalValue : internalValue;

  // Debounced search function
  const debouncedSearch = useCallback((searchValue: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchValue);
      }
    }, debounceMs);

    debounceTimerRef.current = timer;
  }, [debounceMs, onSearch]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Update internal state if not controlled
    if (!isControlled) {
      setInternalValue(newValue);
    }

    // Call external onChange if provided
    if (onChange) {
      onChange(newValue);
    }

    // Trigger debounced search
    if (onSearch) {
      debouncedSearch(newValue);
    }
  };

  // Handle key down events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Call external onKeyDown if provided
    // if (onKeyDown) {
    //   onKeyDown(e);
    // }

    // Handle Enter key
    if (e.key === 'Enter' && onPressEnter) {
      onPressEnter();
    }

    // Handle Enter key for search
    if (e.key === 'Enter' && onSearch) {
      onSearch(currentValue);
    }
  };

  // Handle clear button click
  const handleClear = () => {
    const newValue = "";

    // Update internal state if not controlled
    if (!isControlled) {
      setInternalValue(newValue);
    }

    // Call external onChange if provided
    if (onChange) {
      onChange(newValue);
    }

    // Trigger search immediately when clearing
    if (onSearch) {
      onSearch(newValue);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Custom suffix with clear button
  const customSuffix = useMemo(() => {
    if (showClearButton) {
      return (
        <span className="inline-flex items-center">
          {suffix}
          {currentValue ? (
            <button
              onClick={handleClear}
              className="hover:bg-gray-100 rounded-full p-1 transition-colors"
              type="button"
            >
              <X style={{ color: "rgba(0,0,0,.45)" }} size={16} />
            </button>
          ) : <></>}
        </span>
      );
    }
    return suffix;
  }, [showClearButton, suffix, currentValue]);

  return (
    <Input
      placeholder={placeholder}
      className={className}
      value={currentValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPressEnter={onPressEnter}
      suffix={customSuffix}
      prefix={prefix}
      disabled={disabled}
      size={size}
      allowClear={allowClear}
    />
  );
};

export default SearchInput; 