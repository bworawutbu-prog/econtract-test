/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Date Time Utilities
 * 
 * This utility provides functions to format dates and times for display.
 */
"use client"

import { enqueueSnackbar } from "notistack";

/**
 * Format date value to Thai locale string
 * 
 * @param dateValue - Date value to format (can be string, Date, or any)
 * @returns Formatted date string in Thai locale
 */
export function renderFormattedDate(dateValue: any = ""): string {
  const date = dateValue.split(".")[0];
  if (date instanceof Date && !isNaN(date.getTime())) {
    // It's a valid Date object
    try {
      return date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch (e) {
      enqueueSnackbar(`🎯 [dateTimeUtils] Error formatting date: ${date} ${e}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
      return "รูปแบบวันที่ผิดพลาด"; // Error in formatting
    }
  } else if (typeof date === "string") {
    // If it's still a string, try to parse it (as a fallback)
    try {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        // return parsedDate.toLocaleDateString('th-TH', {
        //   year: 'numeric',
        //   month: 'long',
        //   day: 'numeric',
        //   weekday: 'long',
        // });
        return parsedDate.toLocaleDateString("th-TH");
      } else {
        return "-"; // Invalid date string
      }
    } catch (e) {
      enqueueSnackbar(`🎯 [dateTimeUtils] Error parsing date string: ${date} ${e}`, {
        variant: "error",
        autoHideDuration: 3000,
      });
      return "ข้อผิดพลาดในการแปลงวันที่";
    }
  }
  return "ไม่มีข้อมูลวันที่"; // Fallback for null, undefined, or other invalid types
}

/**
 * Format date value to extract time portion
 * 
 * @param dateValue - Date value to format (can be string, Date, or any)
 * @returns Time string in HH:MM:SS format
 */
export const renderFormattedTime = (dateValue: string | Date | null | undefined): string => {
  if (!dateValue) {
    return "00:00:00";
  }

  try {
    let date: Date;
    
    if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'string') {
      if (dateValue.includes('T') || dateValue.includes('-')) {
        date = new Date(dateValue);
      } else {
        const today = new Date();
        const [hours, minutes, seconds] = dateValue.split(':').map(Number);
        date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours || 0, minutes || 0, seconds || 0);
      }
    } else {
      console.warn(`[dateTimeUtils] Invalid date value: ${dateValue}`);
      return "00:00:00";
    }
    if (isNaN(date.getTime())) {
      console.warn(`[dateTimeUtils] Invalid date object: ${dateValue}`);
      return "00:00:00";
    }

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}:${seconds}`;
    
    return timeStr;
  } catch (e) {
    console.error(`[dateTimeUtils] Error formatting date: ${dateValue}`, e);
    return "00:00:00";
  }
};


/**
 * Get current Thai formatted date and time
 * 
 * @returns Object with formatted date and time
 */
export function getCurrentThaiDateTime(): { date: string; time: string } {
  const now = new Date();
  return {
    date: renderFormattedDate(now.toISOString()),
    time: renderFormattedTime(now.toISOString()),
  };
}

/**
 * Parse and format date string to Thai locale
 * 
 * @param dateString - Date string to parse and format
 * @param includeTime - Whether to include time in the output
 * @returns Formatted date string
 */
export function parseAndFormatDate(
  dateString: string,
  includeTime: boolean = false
): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "วันที่ไม่ถูกต้อง";
    }

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    };

    if (includeTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
      options.second = "2-digit";
      options.hour12 = false;
    }

    return date.toLocaleDateString("th-TH", options);
  } catch (error) {
    enqueueSnackbar(`🎯 [dateTimeUtils] Error parsing date: ${error}`, {
      variant: "error",
      autoHideDuration: 3000,
    });
    return "ข้อผิดพลาดในการแปลงวันที่";
  }
}