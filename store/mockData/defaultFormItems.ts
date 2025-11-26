"use client";

import { FormItem } from "@/store/types";
import { STYLE_CONSTANTS, getDefaultElementSize } from "@/components/mappingComponents/FormUtils/defaultStyle";

/**
 * Default form items for each PDF catalog
 * This provides a starting point for form layouts based on PDF ID
 */

// 🎯 CENTRALIZED: Create default style function with type-specific sizing
const createDefaultStyle = (elementType: string = 'text', overrides: Partial<FormItem["style"]> = {}) => {
  const defaultSize = getDefaultElementSize(elementType);
  return {
    fontFamily: STYLE_CONSTANTS.DEFAULT_FONT_FAMILY,
    fontSize: STYLE_CONSTANTS.DEFAULT_FONT_SIZE,
    fontWeight: STYLE_CONSTANTS.DEFAULT_FONT_WEIGHT,
    fontStyle: STYLE_CONSTANTS.DEFAULT_FONT_STYLE,
    textAlign: STYLE_CONSTANTS.DEFAULT_TEXT_ALIGN,
    color: STYLE_CONSTANTS.DEFAULT_COLOR,
    backgroundColor: STYLE_CONSTANTS.TRANSPARENT_BACKGROUND,
    width: defaultSize.width,
    height: defaultSize.height,
    ...overrides,
  };
};

export const defaultFormItems: Record<string, FormItem[]> = {
  "1": [
    // price-list - page 1
    {
      id: "text-input-1",
      type: "text",
      label: "รหัสสินค้า",
      position: { x: 20, y: 50 },
      pageNumber: 1,
      config: {
        required: false,
        maxLength: 100,
        placeholder: "กรุณากรอกรหัสสินค้า"
      },
      style: createDefaultStyle('text')
    },
    {
      id: "text-input-2",
      type: "text",
      label: "ชื่อสินค้า",
      position: { x: 250, y: 50 },
      pageNumber: 1,
      config: {
        required: true,
        maxLength: 200,
        placeholder: "กรุณากรอกชื่อสินค้า"
      },
      style: createDefaultStyle('text')
    },
    {
      id: "number-input-1",
      type: "number",
      label: "ราคา",
      position: { x: 20, y: 150 },
      pageNumber: 1,
      config: {
        required: true,
        min: 0,
        max: 1000000,
        placeholder: "ราคา (บาท)"
      },
      style: createDefaultStyle('text', { textAlign: "right" })
    },
    {
      id: "number-input-2",
      type: "number",
      label: "จำนวน",
      position: { x: 250, y: 150 },
      pageNumber: 1,
      config: {
        required: true,
        min: 1,
        max: 1000,
        placeholder: "จำนวน"
      },
      style: createDefaultStyle('text', { textAlign: "right" })
    },
    // price-list - page 2
    {
      id: "text-input-3",
      type: "text",
      label: "หมายเหตุ",
      position: { x: 20, y: 50 },
      pageNumber: 2,
      config: {
        required: false,
        maxLength: 500,
        placeholder: "หมายเหตุเพิ่มเติม"
      },
      style: createDefaultStyle('text')
    },
    {
      id: "date-input-1",
      type: "date",
      label: "วันที่",
      position: { x: 250, y: 50 },
      pageNumber: 2,
      config: {
        required: true,
        placeholder: "วว/ดด/ปปปป"
      },
      style: createDefaultStyle('date')
    },
  ],
  "2": [
    // ALL_NEW_CAMRY_2024 - page 1
    {
      id: "text-input-1",
      type: "text",
      label: "รุ่นรถ",
      position: { x: 20, y: 50 },
      pageNumber: 1,
      config: {
        required: true,
        maxLength: 100,
        placeholder: "กรุณาเลือกรุ่นรถ"
      },
      style: createDefaultStyle('text')
    },
    {
      id: "text-input-2",
      type: "text",
      label: "สี",
      position: { x: 250, y: 50 },
      pageNumber: 1,
      config: {
        required: true,
        maxLength: 100,
        placeholder: "กรุณาเลือกสี"
      },
      style: createDefaultStyle('text')
    },
    {
      id: "select-1",
      type: "select",
      label: "ขนาดเครื่องยนต์",
      position: { x: 20, y: 150 },
      pageNumber: 1,
      checkboxOptions: ["1.8 ลิตร", "2.0 ลิตร", "2.5 ลิตร", "2.5 HEV"],
      config: {
        required: true
      },
      style: createDefaultStyle('select')
    },
    {
      id: "checkbox-1",
      type: "checkbox",
      label: "อุปกรณ์เสริม",
      position: { x: 250, y: 150 },
      pageNumber: 1,
      checkboxOptions: ["เบาะหนัง", "จีพีเอส", "กล้องถอยหลัง", "ฟิล์มกรองแสง"],
      config: {
        required: false
      },
      style: createDefaultStyle('checkbox')
    },
  ],
  "3": [
    // ATTO3 - page 1
    {
      id: "text-input-1",
      type: "text",
      label: "ชื่อผู้ซื้อ",
      position: { x: 20, y: 50 },
      pageNumber: 1,
      config: {
        required: true,
        maxLength: 100,
        placeholder: "กรุณากรอกชื่อผู้ซื้อ"
      },
      style: createDefaultStyle('text')
    },
    {
      id: "text-input-2",
      type: "text",
      label: "เลขบัตรประชาชน",
      position: { x: 250, y: 50 },
      pageNumber: 1,
      config: {
        required: true,
        maxLength: 13,
        placeholder: "x-xxxx-xxxxx-xx-x"
      },
      style: createDefaultStyle('text')
    },
    {
      id: "select-1",
      type: "select",
      label: "แบตเตอรี่",
      position: { x: 20, y: 150 },
      pageNumber: 1,
      checkboxOptions: ["Standard Range", "Extended Range"],
      config: {
        required: true
      },
      style: createDefaultStyle('select')
    },
    {
      id: "signature-1",
      type: "signature",
      label: "ลายเซ็นผู้ซื้อ",
      position: { x: 250, y: 150 },
      pageNumber: 1,
      config: {
        required: true
      },
      style: createDefaultStyle('signature')
    },
  ],
  "4": [
    // HONDA_ACCORD_2024 - page 1
    {
      id: "text-input-1",
      type: "text",
      label: "ชื่อลูกค้า",
      position: { x: 20, y: 50 },
      pageNumber: 1,
      config: {
        required: true,
        maxLength: 100,
        placeholder: "กรุณากรอกชื่อลูกค้า"
      },
      style: createDefaultStyle('text')
    },
    {
      id: "text-input-2",
      type: "text",
      label: "เบอร์โทรศัพท์",
      position: { x: 250, y: 50 },
      pageNumber: 1,
      config: {
        required: true,
        maxLength: 10,
        placeholder: "08x-xxx-xxxx"
      },
      style: createDefaultStyle('text')
    },
    {
      id: "radio-1",
      type: "radio",
      label: "รุ่น Accord",
      position: { x: 20, y: 150 },
      pageNumber: 1,
      checkboxOptions: ["EL", "EL+", "Touring"],
      config: {
        required: true
      },
      style: createDefaultStyle('radio')
    },
    {
      id: "signature-1",
      type: "signature",
      label: "ลายเซ็นลูกค้า",
      position: { x: 250, y: 150 },
      pageNumber: 1,
      config: {
        required: true
      },
      style: createDefaultStyle('signature')
    },
  ],
  "5": [
    // SEALION6 - page 1
    {
      id: "text-input-1",
      type: "text",
      label: "ชื่อ-นามสกุล",
      position: { x: 20, y: 50 },
      pageNumber: 1,
      config: {
        required: true,
        maxLength: 100,
        placeholder: "กรุณากรอกชื่อ-นามสกุล"
      },
      style: createDefaultStyle('text')
    },
    {
      id: "text-input-2",
      type: "text",
      label: "อีเมล",
      position: { x: 250, y: 50 },
      pageNumber: 1,
      config: {
        required: true,
        maxLength: 100,
        placeholder: "example@email.com"
      },
      style: createDefaultStyle('text')
    },
    {
      id: "date-input-1",
      type: "date",
      label: "วันที่ส่งมอบ",
      position: { x: 20, y: 150 },
      pageNumber: 1,
      config: {
        required: true,
        placeholder: "วว/ดด/ปปปป"
      },
      style: createDefaultStyle('date')
    },
    {
      id: "signature-1",
      type: "signature",
      label: "ลายเซ็นลูกค้า",
      position: { x: 250, y: 150 },
      pageNumber: 1,
      config: {
        required: true
      },
      style: createDefaultStyle('signature')
    },
  ],
}; 