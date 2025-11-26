/**
 * PDF Storage Utility
 * จัดการการเก็บและโหลด PDF จาก sessionStorage
 */

export interface StoredPdf {
  base64: string;
  pageCount: number;
  fileName: string;
  timestamp: number;
}

const PDF_STORAGE_KEY = 'storedPdfs';
const MAX_STORAGE_SIZE = 10 * 1024 * 1024; // 10MB (sessionStorage มี limit ~5-10MB)

/**
 * แปลง Blob เป็น base64
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * แปลง base64 กลับเป็น Blob
 */
function base64ToBlob(base64: string): Blob {
  const byteString = atob(base64.split(',')[1]);
  const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type: mimeString });
}

/**
 * บันทึก PDF ลง sessionStorage
 */
export async function storePdf(
  key: string,
  blob: Blob,
  pageCount: number,
  fileName: string = 'merged.pdf'
): Promise<boolean> {
  try {
    const base64 = await blobToBase64(blob);
    
    // ตรวจสอบขนาด
    if (base64.length > MAX_STORAGE_SIZE) {
      console.warn('PDF file too large for sessionStorage');
      return false;
    }

    const storedPdf: StoredPdf = {
      base64,
      pageCount,
      fileName,
      timestamp: Date.now(),
    };

    const allStoredPdfs = getAllStoredPdfs();
    allStoredPdfs[key] = storedPdf;
    
    sessionStorage.setItem(PDF_STORAGE_KEY, JSON.stringify(allStoredPdfs));
    
    console.log(`✅ Stored PDF: ${fileName} (${(base64.length / 1024).toFixed(2)} KB)`);
    return true;
  } catch (error) {
    console.error('Error storing PDF:', error);
    return false;
  }
}

/**
 * โหลด PDF จาก sessionStorage
 */
export function loadPdf(key: string): { blob: Blob; url: string; pageCount: number } | null {
  try {
    const allStoredPdfs = getAllStoredPdfs();
    const storedPdf = allStoredPdfs[key];
    
    if (!storedPdf) {
      return null;
    }

    const blob = base64ToBlob(storedPdf.base64);
    const url = URL.createObjectURL(blob);

    console.log(`✅ Loaded PDF: ${storedPdf.fileName} (${storedPdf.pageCount} pages)`);

    return {
      blob,
      url,
      pageCount: storedPdf.pageCount,
    };
  } catch (error) {
    console.error('Error loading PDF:', error);
    return null;
  }
}

/**
 * ลบ PDF จาก sessionStorage
 */
export function removePdf(key: string): void {
  try {
    const allStoredPdfs = getAllStoredPdfs();
    delete allStoredPdfs[key];
    
    sessionStorage.setItem(PDF_STORAGE_KEY, JSON.stringify(allStoredPdfs));
    console.log(`✅ Removed PDF: ${key}`);
  } catch (error) {
    console.error('Error removing PDF:', error);
  }
}

/**
 * ลบ PDF ทั้งหมด
 */
export function clearAllPdfs(): void {
  sessionStorage.removeItem(PDF_STORAGE_KEY);
  console.log('✅ Cleared all stored PDFs');
}

/**
 * ดึง PDF ทั้งหมดที่เก็บไว้
 */
function getAllStoredPdfs(): Record<string, StoredPdf> {
  try {
    const stored = sessionStorage.getItem(PDF_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading stored PDFs:', error);
    return {};
  }
}

/**
 * ตรวจสอบว่า PDF ถูกเก็บไว้หรือไม่
 */
export function hasPdf(key: string): boolean {
  const allStoredPdfs = getAllStoredPdfs();
  return key in allStoredPdfs;
}

/**
 * ดูขนาดที่ใช้ใน sessionStorage
 */
export function getStorageSize(): { used: number; total: number; percentage: number } {
  try {
    let totalSize = 0;
    
    for (const key in sessionStorage) {
      if (sessionStorage.hasOwnProperty(key)) {
        totalSize += sessionStorage[key].length + key.length;
      }
    }
    
    const totalLimit = MAX_STORAGE_SIZE;
    const percentage = (totalSize / totalLimit) * 100;
    
    return {
      used: totalSize,
      total: totalLimit,
      percentage,
    };
  } catch (error) {
    console.error('Error calculating storage size:', error);
    return { used: 0, total: MAX_STORAGE_SIZE, percentage: 0 };
  }
}
