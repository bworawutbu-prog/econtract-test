"use client";

import React, { createContext, useContext, useRef, useCallback, useState, useEffect } from 'react';

interface DateElementState {
  days: string;
  months: string;
  years: string;
  format: string;
  useCurrentDate: boolean;
}

interface DateProviderProps {
  children: React.ReactNode;
  initialState?: Partial<DateElementState>;
  onStateChange?: (state: DateElementState) => void;
}

interface DateContextType {
  dateState: DateElementState;
  updateDateState: (updates: Partial<DateElementState>) => void;
  focusedElement: string | null;
  setFocusedElement: (elementType: string | null) => void;
  registerElement: (elementType: string, elementId: string) => void;
  unregisterElement: (elementType: string) => void;
  getElementId: (elementType: string) => string | null;
  onElementValueChange: (elementType: string, value: string) => void;
}

const DateContext = createContext<DateContextType | null>(null);

export const useDateContext = () => {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error('useDateContext must be used within DateProvider');
  }
  return context;
};

export const DateProvider: React.FC<DateProviderProps> = ({
  children,
  initialState = {},
  onStateChange
}) => {
  const [dateState, setDateState] = useState<DateElementState>({
    days: '',
    months: '',
    years: '',
    format: 'EU',
    useCurrentDate: false,
    ...initialState
  });

  const [focusedElement, setFocusedElement] = useState<string | null>(null);
  const elementRefsRef = useRef<Map<string, string>>(new Map());
  const prevFormatRef = useRef<string>(dateState.format);

  const updateDateState = useCallback((updates: Partial<DateElementState>) => {
    setDateState(prev => {
      const newState = { ...prev, ...updates };
      return newState;
    });
  }, []); // 🎯 REMOVED: onStateChange dependency

  // 🎯 NEW: Separate useEffect for onStateChange callback to avoid infinite loops
  useEffect(() => {
    if (onStateChange) {
      // Only send essential date values to prevent unnecessary re-renders
      const essentialState = {
        days: dateState.days,
        months: dateState.months,
        years: dateState.years,
        format: dateState.format,
        useCurrentDate: dateState.useCurrentDate
      };
      onStateChange(essentialState);
    }
  }, [dateState.days, dateState.months, dateState.years, dateState.format, dateState.useCurrentDate, onStateChange]);

  // Handle format changes - reset values when format changes
  useEffect(() => {
    if (prevFormatRef.current !== dateState.format && prevFormatRef.current) {      
      // Reset date values when format changes (unless using current date)
      if (!dateState.useCurrentDate) {
        // 🎯 FIXED: Use setDateState directly instead of updateDateState to avoid infinite loop
        setDateState(prev => ({
          ...prev,
          days: '',
          months: '',
          years: ''
        }));
      }
    }
    prevFormatRef.current = dateState.format;
  }, [dateState.format, dateState.useCurrentDate]); // 🎯 REMOVED: updateDateState dependency

  const registerElement = useCallback((elementType: string, elementId: string) => {
    elementRefsRef.current.set(elementType, elementId);
  }, []);

  const unregisterElement = useCallback((elementType: string) => {
    elementRefsRef.current.delete(elementType);
  }, []);

  const getElementId = useCallback((elementType: string) => {
    return elementRefsRef.current.get(elementType) || null;
  }, []);

  const onElementValueChange = useCallback((elementType: string, value: string) => {
    updateDateState({ [elementType]: value });
  }, [updateDateState]);

  const contextValue: DateContextType = {
    dateState,
    updateDateState,
    focusedElement,
    setFocusedElement,
    registerElement,
    unregisterElement,
    getElementId,
    onElementValueChange
  };

  return (
    <DateContext.Provider value={contextValue}>
      {children}
    </DateContext.Provider>
  );
}; 