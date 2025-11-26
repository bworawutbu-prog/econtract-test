/**
 * Dimension Utilities for Form Elements
 * ฟังก์ชันสำหรับการคำนวณตำแหน่งและขนาดของ form elements
 */
"use client";

import { CSSProperties } from "react";

// =============== INTERFACES ===============

export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface PdfDimensions extends Dimensions {
  scale?: number;
}

export interface ElementDimensions {
  width: number;
  height: number;
  formHandleWidth?: number;
  formHandleHeight?: number;
}

export interface BoundingRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface ScaleInfo {
  scale: number;
  parentScale: number;
}

export interface PositionConstraints {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface ElementTypeConfig {
  width: number;
  height: number;
  defaultPosition?: Position;
}

// =============== CONSTANTS ===============

// 🎯 CENTRALIZED: Import and use getDefaultElementSize instead of hardcoded values
import { getDefaultElementSize } from "./defaultStyle";

// 🎯 DYNAMIC: Generate ELEMENT_TYPE_CONFIGS from defaultStyle.ts automatically
const generateElementTypeConfigs = (): Record<string, ElementTypeConfig> => {
  const types = [
    "text",
    "name",
    "textarea",
    "checkbox",
    "radio",
    "select",
    "signature",
    "date",
  ];
  const configs: Record<string, ElementTypeConfig> = {};

  types.forEach((type) => {
    const defaultSize = getDefaultElementSize(type);
    configs[type] = {
      width: defaultSize.width,
      height: defaultSize.height,
      defaultPosition: { x: 50, y: 50 },
    };
  });

  // Add default fallback
  const defaultSize = getDefaultElementSize("default");
  configs.default = {
    width: defaultSize.width,
    height: defaultSize.height,
    defaultPosition: { x: 50, y: 50 },
  };

  return configs;
};

// 🎯 CENTRALIZED: Single source of truth from defaultStyle.ts
export const ELEMENT_TYPE_CONFIGS: Record<string, ElementTypeConfig> =
  generateElementTypeConfigs();

export const FORM_HANDLE_CONFIG = {
  width: 70,
  height: 30,
  spacing: 2,
};

// =============== CORE POSITION CALCULATIONS ===============
const stringBefore = (string: string, item: string) => {
  const strbefore = string.split(item)[0];
  return strbefore;
};

const getPercent = (data: number, min: number, max: number) => {
  const itemlength = (max - min).toFixed(7);
  const itemdata = (data - min).toFixed(7);
  const itemresult = (
    (parseFloat(itemdata) * 100) /
    parseFloat(itemlength)
  ).toFixed(7);
  return itemresult;
};
const getPercentAll = (
  mindata: number,
  maxdata: number,
  min: number,
  max: number
) => {
  const itemlength = (max - min).toFixed(7);
  const itemdata = (maxdata - mindata).toFixed(7);
  const itemresult = (
    (parseFloat(itemdata) * 100) /
    parseFloat(itemlength)
  ).toFixed(7);
  return itemresult;
};
const getSignResultMulti = (
  xMinSign: number,
  xMaxSign: string,
  xMin: number,
  xMax: number,
  yMinSign: string,
  yMaxSign: number,
  yMin: number,
  yMax: number
) => {
  const lly = parseFloat(getPercent(yMaxSign, yMin, yMax)).toFixed(7);
  const sign_llx = parseFloat(getPercent(xMinSign, xMin, xMax)).toFixed(7);
  const sign_lly = (100 - parseFloat(lly)).toFixed(7);
  const sign_urx = parseFloat(
    getPercentAll(xMinSign, parseFloat(xMaxSign), xMin, xMax)
  ).toFixed(7);
  const sign_ury = parseFloat(
    getPercentAll(parseFloat(yMinSign), yMaxSign, yMin, yMax)
  ).toFixed(7);
  const _llx = (parseFloat(sign_llx) * 0.01).toFixed(7);
  const _lly = (parseFloat(sign_lly) * 0.01).toFixed(7);
  const _urx = (parseFloat(sign_urx) * 0.01).toFixed(7);
  const _ury = (parseFloat(sign_ury) * 0.01).toFixed(7);
  return {
    llx: _llx,
    lly: _lly,
    urx: _urx,
    ury: _ury,
  };
};
// คำนวณ llx lly urx ury จาก position และ pdfDimensions (ฟังก์ชันเก่า - มีปัญหา)
export const calculatePdfCoordinatesOld = (
  id: string
): { llx: number; lly: number; urx: number; ury: number } | null => {
  // Get PDF page dimensions and position
  const pdfPageContainer = document.querySelector(".react-pdf__Document");
  if (!pdfPageContainer) {
    console.error(`PDF page container not found`);
    return null;
  }
  let pdfPageElement = document.getElementById(id);
  if (!pdfPageElement) {
    console.error(`PDF page element with id ${id} not found`);
    return null;
  }
  const pdfPageContainerRect = pdfPageContainer.getBoundingClientRect();
  const xMin = pdfPageContainerRect.left;
  const yMin = pdfPageContainerRect.top;
  const xMax = pdfPageContainerRect.width;
  const yMax = pdfPageContainerRect.height;
  const boxRect = pdfPageElement.getBoundingClientRect();
  const boxLeft = boxRect.left;
  const boxTop = boxRect.top;
  const boxRight = boxRect.right;
  const boxBottom = boxRect.bottom;

  // Get signature element dimensions and position
  const xMinSign = boxLeft;
  const xMaxSign = stringBefore(boxRight.toString(), ".");
  const yMinSign = stringBefore(boxTop.toString(), ".");
  const yMaxSign = boxBottom;
  const signResult = getSignResultMulti(
    xMinSign,
    xMaxSign,
    xMin,
    xMax,
    yMinSign,
    yMaxSign,
    yMin,
    yMax
  );

  // Convert to PDF coordinates (origin at bottom-left)
  return {
    llx: parseFloat(Math.abs(1 - parseFloat(signResult.llx)).toFixed(7)),
    lly: parseFloat(Math.abs(parseFloat(signResult.lly)).toFixed(7)),
    urx: parseFloat(Math.abs(parseFloat(signResult.urx)).toFixed(7)),
    ury: parseFloat(Math.abs(parseFloat(signResult.ury)).toFixed(7)),
  };
};

/**
 * คำนวณ PDF coordinates แบบ Normalized สำหรับ Multi-page PDF (ใหม่)
 * ใช้แนวทางเดียวกับตัวอย่างที่มี scroll view และคำนวณตามหน้าที่ถูกต้อง
 */
export const calculatePdfCoordinatesForMultiPage = (
  elementId: string,
  allPagesDimensions?: Array<{width: number, height: number}>,
  scale: number = 1,
  currentPageNumber: number = 1
): { llx: number; lly: number; urx: number; ury: number; pageNumber: number } | null => {
  // หา element ที่ต้องการคำนวณ
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with id ${elementId} not found`);
    return null;
  }

  // หา PDF pages container
  const pagesContainerRef = document.querySelector('.react-pdf__Document');
  if (!pagesContainerRef) {
    console.warn('PDF pages container not found');
    return null;
  }

  // หา PDF pages
  const pdfPages = document.querySelectorAll('.react-pdf__Page');
  if (pdfPages.length === 0) {
    console.warn('No PDF pages found');
    return null;
  }

  // คำนวณตำแหน่งจริงของ element
  const elementRect = element.getBoundingClientRect();
  const containerRect = pagesContainerRef.getBoundingClientRect();
  
  // 🎯 FIXED: คำนวณ scroll offset อย่างถูกต้อง
  const scrollTop = pagesContainerRef.scrollTop || 0;
  const scrollLeft = pagesContainerRef.scrollLeft || 0;
  
  // 1. หาตำแหน่งจริงของคอนเทนเนอร์และกล่องบนหน้าจอ
  // 🎯 FIXED: สูตรที่ถูกต้อง = elementRect.top - containerRect.top + scrollTop
  const containerTop = containerRect.top;
  const boxTop = elementRect.top - containerTop + scrollTop;
  const boxLeft = elementRect.left - containerRect.left + scrollLeft;
  
  let pageNumber = -1;
  let pageDim = null;
  let cumulativeHeight = 0;

  // 2. วนลูปเพื่อหาว่ากล่องอยู่บนหน้าไหน
  for(let i = 0; i < pdfPages.length; i++) {
    const page = pdfPages[i];
    const pageRect = page.getBoundingClientRect();
    const pageHeight = pageRect.height;
    
    // ตรวจสอบว่าตำแหน่งด้านบนของกล่องอยู่ในช่วงความสูงของหน้านี้หรือไม่
    if (boxTop < cumulativeHeight + pageHeight) {
      pageNumber = i + 1;
      
      // ใช้ขนาดจริงจาก PDF.js หรือจาก allPagesDimensions
      if (allPagesDimensions && allPagesDimensions[i]) {
        pageDim = allPagesDimensions[i];
      } else {
        // Fallback: ใช้ขนาดจาก DOM แต่ปรับด้วย scale
        pageDim = {
          width: pageRect.width / scale,
          height: pageRect.height / scale
        };
      }
      break;
    }
    cumulativeHeight += pageHeight;
  }

  if (pageNumber === -1 || !pageDim) {
    console.warn('Could not determine page for element');
    return null;
  }

  // 3. คำนวณพิกัดสัมพัทธ์ภายในหน้า PDF ที่ถูกต้อง
  // relativeY: ตำแหน่ง Y ของกล่องเทียบกับขอบบนสุดของหน้า PDF
  const relativeY = (boxTop - cumulativeHeight) / scale;
  // relativeX: ตำแหน่ง X ของกล่องเทียบกับขอบซ้ายสุดของหน้า PDF
  const relativeX = boxLeft / scale;
  
  // ขนาดของ element
  const elementWidth = elementRect.width / scale;
  const elementHeight = elementRect.height / scale;
  
  // 4. คำนวณพิกัดจริง (PDF Coordinates)
  const pdfCoords = {
    llx: relativeX,
    lly: pageDim.height - (relativeY + elementHeight),
    urx:  elementWidth,
    ury: elementHeight,
  };
  // 5. คำนวณพิกัด Normalized (0-1) สำหรับระบบ CA
  const normalized = {
    llx: Math.max(0, Math.min(1, pdfCoords.llx / pageDim.width)),
    lly: Math.max(0, Math.min(1, pdfCoords.lly / pageDim.height)),
    urx: Math.max(0, Math.min(1, pdfCoords.urx / pageDim.width)),
    ury: Math.max(0, Math.min(1, pdfCoords.ury / pageDim.height)),
    pageNumber: currentPageNumber//pageNumber
  };

  return {
    llx: parseFloat(normalized.llx.toFixed(5)),
    lly: parseFloat(normalized.lly.toFixed(5)),
    urx: parseFloat(normalized.urx.toFixed(5)),
    ury: parseFloat(normalized.ury.toFixed(5)),
    pageNumber: currentPageNumber //pageNumber
  };
};

/**
 * ดึงข้อมูลขนาดหน้า PDF จริงจาก PDF.js
 * ใช้สำหรับการคำนวณพิกัดที่แม่นยำกว่า
 */
export const getPdfPageDimensionsFromPdfJs = async (
  pdfFile: any,
  scale: number = 1.5
): Promise<Array<{width: number, height: number}> | null> => {
  try {
    // หาก pdfFile เป็น URL
    if (typeof pdfFile === 'string') {
      const pdfjs = (window as any).pdfjsLib;
      if (!pdfjs) {
        console.warn('PDF.js library not loaded');
        return null;
      }
      
      const loadingTask = pdfjs.getDocument(pdfFile);
      const pdf = await loadingTask.promise;
      
      const pages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 });
        pages.push({
          width: viewport.width,
          height: viewport.height
        });
      }
      return pages;
    }
    
    // หาก pdfFile เป็น PDF document object
    if (pdfFile && typeof pdfFile.getPage === 'function') {
      const pages = [];
      for (let i = 1; i <= pdfFile.numPages; i++) {
        const page = await pdfFile.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 });
        pages.push({
          width: viewport.width,
          height: viewport.height
        });
      }
      return pages;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting PDF page dimensions:', error);
    return null;
  }
};

/**
 * ฟังก์ชันผสม: คำนวณพิกัดโดยใช้ข้อมูลจาก PDF.js ถ้ามี
 */
export const calculatePdfCoordinatesWithPdfJsData = async (
  elementId: string,
  pdfFile?: any,
  scale: number = 1
): Promise<{ llx: number; lly: number; urx: number; ury: number; pageNumber: number } | null> => {
  // ลองดึงข้อมูลขนาดจาก PDF.js
  const pdfPageDimensions = await getPdfPageDimensionsFromPdfJs(pdfFile, scale);
  
  // ใช้ฟังก์ชันหลักในการคำนวณ
  return calculatePdfCoordinatesForMultiPage(elementId, pdfPageDimensions || [{ width: 0, height: 0 }], scale);
};

/**
 * คำนวณ PDF coordinates ที่ถูกต้อง (ฟังก์ชันเดิม - เก็บไว้เพื่อ backward compatibility)
 * แก้ไขปัญหาค่า llx เกิน 1 และการคำนวณที่ผิดพลาด
 */
export const calculatePdfCoordinates = (
  id: string
): { llx: number; lly: number; urx: number; ury: number } | null => {
  // หา PDF page container
  const pdfPageContainer = document.querySelector(".react-pdf__Document");
  // const pdfPageContainer2 = document.querySelector('.pdf-form-area');
  if (!pdfPageContainer) {
    console.warn(`PDF page container not found for element ${id}`);
    return null;
  }
  // if (!pdfPageContainer2) {
  //   console.error(`PDF page container not found`);
  //   return null;
  // }

  // หา element ที่ต้องการคำนวณ
  const element = document.getElementById(id);
  if (!element) {
    // 🎯 FIXED: Use console.warn instead of console.error to prevent error modal
    // This is expected when elements are being created but not yet mounted
    console.warn(`Element with id ${id} not found in DOM yet - this is normal during element creation`);
    return null;
  }

  // ได้ขนาดและตำแหน่งของ PDF container
  const pdfRect = pdfPageContainer.getBoundingClientRect();
  // const pdfRect2 = pdfPageContainer2?.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  // // คำนวณตำแหน่งสัมพัทธ์ของ element เทียบกับ PDF container
  // const relativeLeft2 = elementRect.left - pdfRect2.left;
  // // แปลงเป็นค่า percentage (0-1) เทียบกับขนาด PDF
  // const leftPercent2 = relativeLeft2 / pdfRect2.width;

  // คำนวณตำแหน่งสัมพัทธ์ของ element เทียบกับ PDF container
  const relativeLeft = elementRect.left - pdfRect.left;
  const relativeTop = elementRect.top - pdfRect.top;
  const relativeRight = relativeLeft + elementRect.width;
  const relativeBottom = relativeTop + elementRect.height;

  // แปลงเป็นค่า percentage (0-1) เทียบกับขนาด PDF
  const leftPercent = relativeLeft / pdfRect.width;
  const topPercent = relativeTop / pdfRect.height;
  const rightPercent = relativeRight / pdfRect.width;
  const bottomPercent = relativeBottom / pdfRect.height;
  const signBox = getSignResultMulti(
    elementRect.left,
    stringBefore(elementRect.right.toString(), "."),
    pdfRect.left,
    pdfRect.width,
    stringBefore(elementRect.top.toString(), "."),
    elementRect.bottom,
    pdfRect.top,
    pdfRect.height
  );
  // แปลงเป็น PDF coordinates (origin ที่ bottom-left)
  // PDF coordinate system: (0,0) อยู่ที่มุมซ้ายล่าง
  const llx = Math.max(0, Math.min(1, leftPercent));
  const lly = Math.max(0, Math.min(1, 1 - bottomPercent)); // flip Y axis
  const urx = Math.max(0, Math.min(1, rightPercent));
  const ury = Math.max(0, Math.min(1, 1 - topPercent)); // flip Y axis
  // const result = {
  //   llx: parseFloat((llx * 0.01).toFixed(5)),
  //   lly: parseFloat(lly.toFixed(5)),
  //   // urx: parseFloat(urx.toFixed(3)),
  //   // ury: parseFloat(ury.toFixed(3))
  //   // llx: parseFloat(parseFloat(signBox.llx).toFixed(3)),
  //   // lly: parseFloat(parseFloat(signBox.lly).toFixed(3)),
  //   urx: parseFloat(parseFloat(signBox.urx).toFixed(5)),
  //   ury: parseFloat(parseFloat(signBox.ury).toFixed(5)),
  // };

  const result = {
    llx: parseFloat(llx.toFixed(5)),
    lly: parseFloat(lly.toFixed(5)),
    urx: parseFloat(urx.toFixed(5)),
    ury: parseFloat(ury.toFixed(5)),  
  }
  return result;
};

/**
 * ฟังก์ชันสำหรับทดสอบและ debug การคำนวณ PDF coordinates
 */
export const debugPdfCoordinates = (id: string): void => {
  
  const pdfPageContainer = document.querySelector('.react-pdf__Page');
  const element = document.getElementById(id);

  if (!pdfPageContainer || !element) {
    console.error("❌ PDF container or element not found");
    return;
  }

  const pdfRect = pdfPageContainer.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  // คำนวณตำแหน่งสัมพัทธ์
  const relativeLeft = elementRect.left - pdfRect.left;
  const relativeTop = elementRect.top - pdfRect.top;
  const relativeRight = relativeLeft + elementRect.width;
  const relativeBottom = relativeTop + elementRect.height;

  // คำนวณ percentage
  const leftPercent = relativeLeft / pdfRect.width;
  const topPercent = relativeTop / pdfRect.height;
  const rightPercent = relativeRight / pdfRect.width;
  const bottomPercent = relativeBottom / pdfRect.height;

  // คำนวณ PDF coordinates
  const llx = Math.max(0, Math.min(1, leftPercent));
  const lly = Math.max(0, Math.min(1, 1 - bottomPercent));
  const urx = Math.max(0, Math.min(1, rightPercent));
  const ury = Math.max(0, Math.min(1, 1 - topPercent));


  // ตรวจสอบค่าที่ผิดปกติ
  const issues = [];
  if (llx < 0 || llx > 1) issues.push(`llx out of range: ${llx}`);
  if (lly < 0 || lly > 1) issues.push(`lly out of range: ${lly}`);
  if (urx < 0 || urx > 1) issues.push(`urx out of range: ${urx}`);
  if (ury < 0 || ury > 1) issues.push(`ury out of range: ${ury}`);
  if (llx >= urx) issues.push(`llx >= urx: ${llx} >= ${urx}`);
  if (lly >= ury) issues.push(`lly >= ury: ${lly} >= ${ury}`);

  if (issues.length > 0) {
    console.warn("⚠️ Issues found:", issues);
  } else {
    
  }
};

/**
 * ฟังก์ชันสำหรับเปรียบเทียบผลลัพธ์ระหว่างฟังก์ชันเก่าและใหม่
 */
export const comparePdfCoordinatesMethods = (id: string): void => {
  
  const oldResult = calculatePdfCoordinatesOld(id);
  const newResult = calculatePdfCoordinates(id);

  if (oldResult && newResult) {
    const differences = {
      llx: Math.abs(oldResult.llx - newResult.llx),
      lly: Math.abs(oldResult.lly - newResult.lly),
      urx: Math.abs(oldResult.urx - newResult.urx),
      ury: Math.abs(oldResult.ury - newResult.ury),
    };
    const maxDiff = Math.max(...Object.values(differences));
    if (maxDiff > 0.01) {
      console.warn("⚠️ Significant differences detected (>0.01)");
    } else {
      
    }
  }
};


/**
 * คำนวณตำแหน่งจากเมาส์เหตุการณ์
 * 🎯 FIXED: เพิ่มการคำนวณ scrollTop/scrollLeft เพื่อแก้ปัญหา "เด้ง" เมื่อ scroll
 */
export function calculatePositionFromMouseEvent(
  event: MouseEvent,
  containerElement: Element,
  scale: number = 1
): Position {
  const containerRect = containerElement.getBoundingClientRect();
  
  // 🎯 FIXED: หา scroll offset จาก container หรือ parent ที่ scroll ได้
  let scrollTop = 0;
  let scrollLeft = 0;
  
  // ตรวจสอบว่า container เอง scroll ได้หรือไม่
  if (containerElement instanceof HTMLElement) {
    scrollTop = containerElement.scrollTop || 0;
    scrollLeft = containerElement.scrollLeft || 0;
  }
  
  // ถ้า container ไม่ scroll ได้ ให้หา parent ที่ scroll ได้
  if (scrollTop === 0 && scrollLeft === 0) {
    let parent = containerElement.parentElement;
    while (parent) {
      const style = window.getComputedStyle(parent);
      if (style.overflow === 'auto' || style.overflow === 'scroll' || 
          style.overflowY === 'auto' || style.overflowY === 'scroll') {
        scrollTop = parent.scrollTop || 0;
        scrollLeft = parent.scrollLeft || 0;
        break;
      }
      parent = parent.parentElement;
    }
  }

  // 🎯 FIXED: สูตรที่ถูกต้อง = event.clientY - container.top + scrollTop
  const posX = (event.clientX - containerRect.left + scrollLeft) / scale;
  const posY = (event.clientY - containerRect.top + scrollTop) / scale;

  return {
    x: posX,
    y: posY,
  };
}

/**
 * คำนวณ dimensions ของ PDF จาก element พร้อมคำนึงถึง padding
 */
export function calculatePdfDimensionsWithPadding(
  pdfElement: Element | null,
  containerElement: Element | null,
  scale: number = 1
): PdfDimensions & { paddingTop: number; paddingLeft: number } {
  if (!pdfElement || !containerElement) {
    console.warn("Missing elements for dimension calculation");
    return {
      width: 0,
      height: 0,
      scale,
      paddingTop: 0,
      paddingLeft: 0,
    };
  }

  // Get document element if pdfElement is a page
  const documentElement =
    pdfElement.closest(".react-pdf__Document") || pdfElement;
  const rect = documentElement.getBoundingClientRect();
  const containerRect = containerElement.getBoundingClientRect();

  // คำนวณค่า padding จากตำแหน่งของ element
  const paddingTop = (rect.top - containerRect.top) / scale;
  const paddingLeft = (rect.left - containerRect.left) / scale;

  return {
    width: rect.width / scale,
    height: rect.height / scale,
    scale,
    paddingTop,
    paddingLeft,
  };
}

/**
 * คำนวณตำแหน่งกึ่งกลางของ container
 */
export function calculateCenterPosition(dimensions: Dimensions): Position {
  return {
    x: dimensions.width / 2,
    y: dimensions.height / 2,
  };
}

/**
 * 🎯 NEW: คำนวณตำแหน่งกึ่งกลางของหน้าปัจจุบันใน multi-page view
 * แก้ไขให้ใช้ coordinate system ที่สอดคล้องกับ PDF stamping (relative to current page)
 */
export function calculateCenterPositionForPage(
  pageNumber: number,
  scale: number = 1
): Position | null {
  // หาหน้า PDF ปัจจุบันโดยใช้ data-page-number
  const currentPageElement = document.querySelector(`[data-page-number="${pageNumber}"]`);
  
  if (!currentPageElement) {
    console.warn(`Cannot find page element for page ${pageNumber}`);
    return null;
  }
  
  // หา PDF Page element ภายในหน้าปัจจุบัน
  const pdfPageElement = currentPageElement.querySelector('.react-pdf__Page');
  
  if (!pdfPageElement) {
    console.warn(`Cannot find PDF page element for page ${pageNumber}`);
    return null;
  }
  
  const pageRect = pdfPageElement.getBoundingClientRect();
  
  // คำนวณตำแหน่งกึ่งกลางของหน้าปัจจุบัน relative to PDF page 
  // ใช้ coordinate system เดียวกับระบบเดิม เพื่อให้สอดคล้องกับ PDF stamping
  const centerX = pageRect.width / (2 * scale);
  const centerY = pageRect.height / (2 * scale);
  
  return {
    x: centerX,
    y: centerY,
  };
}

/**
 * 🎯 NEW: คำนวณตำแหน่งกึ่งกลางของหน้าปัจจุบันแบบ absolute position
 * แก้ไขให้ใช้ coordinate system ที่สอดคล้องกับ PDF stamping (relative to current page)
 */
export function calculateAbsoluteCenterPositionForPage(
  pageNumber: number,
  scale: number = 1,
  pdfFormAreaRef?: HTMLDivElement | null
): Position | null {
  // หาหน้า PDF ปัจจุบันโดยใช้ data-page-number
  const currentPageElement = document.querySelector(`[data-page-number="${pageNumber}"]`);
  
  if (!currentPageElement) {
    console.warn(`Cannot find page element for page ${pageNumber}`);
    return null;
  }
  
  // หา PDF Page element ภายในหน้าปัจจุบัน
  const pdfPageElement = currentPageElement.querySelector('.react-pdf__Page');
  
  if (!pdfPageElement) {
    console.warn(`Cannot find PDF page element for page ${pageNumber}`);
    return null;
  }
  
  const pageRect = pdfPageElement.getBoundingClientRect();
  
  // คำนวณตำแหน่งกึ่งกลางของหน้าปัจจุบัน relative to PDF page
  // ใช้ coordinate system เดียวกับระบบเดิม เพื่อให้สอดคล้องกับ PDF stamping
  const centerX = pageRect.width / (2 * scale);
  const centerY = pageRect.height / (2 * scale);
  
  return {
    x: centerX,
    y: centerY,
  };
}

/**
 * คำนวณตำแหน่งจากเมาส์เหตุการณ์โดยคำนึงถึง padding
 */
export function calculatePositionFromMouseEventWithPadding(
  event: MouseEvent,
  containerElement: Element,
  pdfContainerElement: Element,
  scale: number = 1
): Position {
  const containerRect = containerElement.getBoundingClientRect();
  const pdfContainerRect = pdfContainerElement.getBoundingClientRect();

  // คำนวณ padding
  const paddingTop = pdfContainerRect.top - containerRect.top;
  const paddingLeft = pdfContainerRect.left - containerRect.left;
  
  // คำนวณตำแหน่งโดยหักค่า padding
  const posX = event.clientX - containerRect.left - paddingLeft;
  const posY = event.clientY - containerRect.top - paddingTop;

  return {
    x: posX / scale,
    y: posY / scale,
  };
}

/**
 * 🎯 NEW: คำนวณตำแหน่งจากเมาส์เหตุการณ์สำหรับ multi-page view
 * คำนวณตำแหน่ง relative to PDF page โดยตรงแทนที่จะใช้ padding calculation
 * 🎯 FIXED: เพิ่มการคำนวณ scrollTop/scrollLeft เพื่อแก้ปัญหา "เด้ง" เมื่อ scroll
 */
export function calculatePositionFromMouseEventForPage(
  event: MouseEvent,
  pdfPageElement: Element,
  scale: number = 1
): Position {
  const pageRect = pdfPageElement.getBoundingClientRect();
  
  // 🎯 FIXED: หา scrollable container (อาจเป็น .react-pdf__Document หรือ parent)
  let scrollableContainer: HTMLElement | null = pdfPageElement.closest('.react-pdf__Document') as HTMLElement;
  
  // ถ้าไม่เจอ ให้หา parent ที่มี overflow: auto/scroll
  if (!scrollableContainer) {
    let parent = pdfPageElement.parentElement;
    while (parent) {
      const style = window.getComputedStyle(parent);
      if (style.overflow === 'auto' || style.overflow === 'scroll' || 
          style.overflowY === 'auto' || style.overflowY === 'scroll') {
        scrollableContainer = parent as HTMLElement;
        break;
      }
      parent = parent.parentElement;
    }
  }
  
  // คำนวณ scroll offset
  const scrollTop = scrollableContainer ? scrollableContainer.scrollTop : 0;
  const scrollLeft = scrollableContainer ? scrollableContainer.scrollLeft : 0;
  
  // 🎯 FIXED: สูตรที่ถูกต้องสำหรับตำแหน่ง relative to PDF page content
  // event.clientY - pageRect.top = ตำแหน่ง relative to page ที่มองเห็น
  // + scrollTop = ตำแหน่ง relative to page content ทั้งหมด (รวมส่วนที่ scroll ไปแล้ว)
  // สูตร: Y = (event.clientY - pageRect.top + scrollTop) / scale
  const posX = (event.clientX - pageRect.left + scrollLeft) / scale;
  const posY = (event.clientY - pageRect.top + scrollTop) / scale;

  return {
    x: posX,
    y: posY,
  };
}

/**
 * ปรับตำแหน่งเมื่อมีการ drag
 */
export function calculateDragPosition(
  currentPosition: Position,
  dragDelta: Position,
  scale: number = 1
): Position {
  return {
    x: currentPosition.x + dragDelta.x / scale,
    y: currentPosition.y + dragDelta.y / scale,
  };
}

// =============== POSITION CONSTRAINTS ===============

/**
 * คำนวณข้อจำกัดตำแหน่งสำหรับ element
 * ใช้วิธีการเรียบง่ายตาม MappingTest approach
 */
export function calculatePositionConstraints(
  pdfDimensions: PdfDimensions,
  elementType: string,
  parentScale: number = 1
): PositionConstraints {
  const elementConfig =
    ELEMENT_TYPE_CONFIGS[elementType] || ELEMENT_TYPE_CONFIGS.default;

  // ปรับ element size ตาม scale เพื่อให้การคำนวณ constraint ถูกต้อง
  const elementWidth = elementConfig.width / parentScale;
  const elementHeight = elementConfig.height / parentScale;
  const formHandleHeight = FORM_HANDLE_CONFIG.height / parentScale;
  const formHandleSpacing = FORM_HANDLE_CONFIG.spacing / parentScale;

  // ใช้ PDF dimensions โดยตรงโดยไม่คำนวณ padding ใด ๆ
  const pdfWidth = pdfDimensions.width;
  const pdfHeight = pdfDimensions.height;

  // คำนวณตำแหน่งสูงสุดโดยหักพื้นที่สำหรับ element และ form handle ที่ปรับ scale แล้ว
  const maxX = Math.max(0, pdfWidth - elementWidth);
  const maxY = Math.max(0, pdfHeight - (elementHeight + formHandleHeight + formHandleSpacing));
  
  return {
    minX: 0,
    maxX,
    minY: 0,
    maxY,
  };
}

/**
 * ปรับตำแหน่งให้อยู่ในขอบเขตที่กำหนด
 */
export function constrainPosition(
  position: Position,
  constraints: PositionConstraints
): Position {
  return {
    x: Math.max(constraints.minX, Math.min(position.x, constraints.maxX)),
    y: Math.max(constraints.minY, Math.min(position.y, constraints.maxY)),
  };
}

/**
 * ปรับตำแหน่งตาม PDF dimensions และ element type
 * ใช้วิธีการเรียบง่ายโดยไม่คำนวณ padding ซึ่งอาจทำให้เกิดข้อผิดพลาด
 * ตอนนี้ปิดการจำกัดขอบเขตเพื่อให้ form elements เคลื่อนที่ได้อย่างอิสระ
 */
export function adjustPositionForPdf(
  position: Position,
  pdfDimensions: PdfDimensions | null,
  elementType: string,
  parentScale: number = 1,
  allowUnrestricted: boolean = true
): Position {
  if (!position) {
    return { x: 0, y: 0 };
  }

  // ถ้า allowUnrestricted = true จะไม่จำกัดขอบเขต
  if (allowUnrestricted) {
    return position;
  }

  // โค้ดเดิมสำหรับจำกัดขอบเขต (ไว้สำหรับกรณีที่ต้องการใช้งาน)
  if (!pdfDimensions) {
    return position;
  }

  const constraints = calculatePositionConstraints(
    pdfDimensions,
    elementType,
    parentScale
  );
  const adjustedPosition = constrainPosition(position, constraints);
  return adjustedPosition;
}

// =============== SCALE CALCULATIONS ===============

/**
 * คำนวณตำแหน่งที่ปรับ scale แล้ว
 */
export function calculateScaledPosition(
  position: Position,
  scale: number
): Position {
  return {
    x: position.x * scale,
    y: position.y * scale,
  };
}

/**
 * คำนวณตำแหน่งที่ยกเลิก scale
 */
export function calculateUnscaledPosition(
  position: Position,
  scale: number
): Position {
  return {
    x: position.x / scale,
    y: position.y / scale,
  };
}

// =============== PDF CONTAINER CALCULATIONS ===============

/**
 * คำนวณ dimensions ของ PDF จาก element
 */
export function calculatePdfDimensionsFromElement(
  pdfElement: Element | null,
  scale: number = 1
): PdfDimensions {
  if (!pdfElement) {
    console.warn("No PDF element provided for dimension calculation");
    return {
      width: 0,
      height: 0,
      scale,
    };
  }

  // Get document element if pdfElement is a page
  const documentElement =
    pdfElement.closest(".react-pdf__Document") || pdfElement;

  const rect = documentElement.getBoundingClientRect();
  return {
    width: rect.width / scale,
    height: rect.height / scale,
    scale,
  };
}

// ฟังก์ชันนี้ถูกลบออกเพื่อป้องกันความผิดพลาดจาก padding calculation
// ใช้ calculatePdfDimensionsFromElement แทน

// ฟังก์ชันนี้ถูกลบออกเพื่อป้องกันความผิดพลาดจาก padding calculation
// ใช้ calculatePositionFromMouseEvent แทน

/**
 * คำนวณตำแหน่งและขนาดของ PDF container
 */
export function calculatePdfContainerLayout(
  pdfDimensions: Dimensions,
  containerDimensions: Dimensions,
  scale: number = 1
): BoundingRect {
  const scaledWidth = pdfDimensions.width * scale;
  const scaledHeight = pdfDimensions.height * scale;

  // คำนวณตำแหน่งให้ PDF อยู่กึ่งกลาง
  const left = Math.max(0, (containerDimensions.width - scaledWidth) / 2);

  return {
    width: scaledWidth,
    height: scaledHeight,
    top: 0,
    left,
  };
}

// =============== CSS STYLE GENERATION ===============

/**
 * สร้าง CSS styles สำหรับ positioned element
 */
export function generatePositionStyles(
  position: Position,
  scale: number = 1,
  options: {
    isDragging?: boolean;
    isSelected?: boolean;
    zIndex?: number;
    transform?: string;
    opacity?: number;
  } = {}
): CSSProperties {
  const {
    isDragging = false,
    isSelected = false,
    zIndex,
    transform,
    opacity,
  } = options;

  return {
    position: isDragging ? "fixed" : "absolute",
    top: position.y * scale,
    left: position.x * scale,
    zIndex: zIndex ?? (isDragging ? 9999 : isSelected ? 30 : 20),
    transform,
    opacity: opacity ?? (isDragging ? 0.6 : 1),
    transition: isDragging ? "none" : "transform 0.2s ease",
  };
}

/**
 * สร้าง transform string สำหรับ CSS
 */
export function generateTransformString(
  translateX: number = 0,
  translateY: number = 0,
  scale: number = 1,
  rotate: number = 0
): string {
  const transforms = [];

  if (translateX !== 0 || translateY !== 0) {
    transforms.push(`translate3d(${translateX}px, ${translateY}px, 0)`);
  }

  if (scale !== 1) {
    transforms.push(`scale(${scale})`);
  }

  if (rotate !== 0) {
    transforms.push(`rotate(${rotate}deg)`);
  }

  return transforms.join(" ");
}

// =============== ELEMENT UTILITIES ===============

/**
 * รับ dimensions ของ element ตาม type
 */
export function getElementDimensions(elementType: string): ElementDimensions {
  const config =
    ELEMENT_TYPE_CONFIGS[elementType] || ELEMENT_TYPE_CONFIGS.default;

  return {
    width: config.width,
    height: config.height,
    formHandleWidth: FORM_HANDLE_CONFIG.width,
    formHandleHeight: FORM_HANDLE_CONFIG.height,
  };
}

/**
 * คำนวณพื้นที่ทั้งหมดที่ element ใช้ (รวม form handle)
 */
export function calculateElementBounds(
  position: Position,
  elementType: string,
  includeFormHandle: boolean = true
): BoundingRect {
  const dimensions = getElementDimensions(elementType);

  return {
    left: position.x,
    top:
      position.y -
      (includeFormHandle
        ? dimensions.formHandleHeight! + FORM_HANDLE_CONFIG.spacing
        : 0),
    width: dimensions.width,
    height:
      dimensions.height +
      (includeFormHandle
        ? dimensions.formHandleHeight! + FORM_HANDLE_CONFIG.spacing
        : 0),
  };
}

// =============== COLLISION DETECTION ===============

/**
 * ตรวจสอบว่า element สองอันซ้อนกันหรือไม่
 */
export function detectElementCollision(
  element1: { position: Position; type: string },
  element2: { position: Position; type: string }
): boolean {
  const bounds1 = calculateElementBounds(element1.position, element1.type);
  const bounds2 = calculateElementBounds(element2.position, element2.type);

  return !(
    bounds1.left + bounds1.width < bounds2.left ||
    bounds2.left + bounds2.width < bounds1.left ||
    bounds1.top + bounds1.height < bounds2.top ||
    bounds2.top + bounds2.height < bounds1.top
  );
}

/**
 * หาตำแหน่งที่ไม่ซ้อนกันสำหรับ element ใหม่
 */
export function findNonCollidingPosition(
  desiredPosition: Position,
  elementType: string,
  existingElements: Array<{ position: Position; type: string }>,
  pdfDimensions: PdfDimensions,
  maxAttempts: number = 10
): Position {
  let position = { ...desiredPosition };
  let attempts = 0;

  while (attempts < maxAttempts) {
    const hasCollision = existingElements.some((existing) =>
      detectElementCollision({ position, type: elementType }, existing)
    );

    if (!hasCollision) {
      break;
    }

    // ลองขยับตำแหน่งเล็กน้อย
    // position.x += 20;
    if (
      position.x >
      pdfDimensions.width - getElementDimensions(elementType).width
    ) {
      position.x = desiredPosition.x;
      // position.y += 20;
    }

    attempts++;
  }

  return adjustPositionForPdf(position, pdfDimensions, elementType);
}

// =============== RESPONSIVE UTILITIES ===============

/**
 * ปรับ scale ตามขนาดหน้าจอ
 */
export function calculateResponsiveScale(
  baseScale: number,
  windowWidth: number,
  breakpoints: { mobile: number; tablet: number; desktop: number } = {
    mobile: 768,
    tablet: 1024,
    desktop: 1920,
  }
): number {
  if (windowWidth < breakpoints.mobile) {
    return baseScale * 0.8;
  } else if (windowWidth < breakpoints.tablet) {
    return baseScale * 0.9;
  } else if (windowWidth > breakpoints.desktop) {
    return baseScale * 1.1;
  }

  return baseScale;
}

/**
 * คำนวณ font size ที่ปรับตาม scale
 */
export function calculateScaledFontSize(
  baseFontSize: number,
  scale: number,
  minFontSize: number = 10,
  maxFontSize: number = 32
): number {
  const scaledSize = baseFontSize * scale;
  return Math.max(minFontSize, Math.min(scaledSize, maxFontSize));
}

// =============== VALIDATION UTILITIES ===============

/**
 * ตรวจสอบว่าตำแหน่งอยู่ในขอบเขตที่ถูกต้อง
 */
export function isValidPosition(
  position: Position,
  pdfDimensions: PdfDimensions,
  elementType: string
): boolean {
  const constraints = calculatePositionConstraints(pdfDimensions, elementType);

  return (
    position.x >= constraints.minX &&
    position.x <= constraints.maxX &&
    position.y >= constraints.minY &&
    position.y <= constraints.maxY
  );
}

/**
 * แปลงตำแหน่งเป็น percentage สำหรับ responsive design
 */
export function positionToPercentage(
  position: Position,
  containerDimensions: Dimensions
): Position {
  return {
    x: (position.x / containerDimensions.width) * 100,
    y: (position.y / containerDimensions.height) * 100,
  };
}

/**
 * แปลง percentage กลับเป็นตำแหน่ง pixel
 */
export function percentageToPosition(
  percentage: Position,
  containerDimensions: Dimensions
): Position {
  return {
    x: (percentage.x / 100) * containerDimensions.width,
    y: (percentage.y / 100) * containerDimensions.height,
  };
}

// =============== DEBUGGING UTILITIES ===============

/**
 * สร้างข้อมูล debug สำหรับตำแหน่ง
 */
export function createPositionDebugInfo(
  position: Position,
  elementType: string,
  pdfDimensions?: PdfDimensions,
  scale?: number
) {
  const dimensions = getElementDimensions(elementType);
  const bounds = calculateElementBounds(position, elementType);

  return {
    position,
    elementType,
    dimensions,
    bounds,
    pdfDimensions,
    scale,
    scaledPosition: scale ? calculateScaledPosition(position, scale) : null,
    isValid: pdfDimensions
      ? isValidPosition(position, pdfDimensions, elementType)
      : null,
    timestamp: new Date().toISOString(),
  };
}
