/**
 * Reset PDF Merge Utility
 * ใช้สำหรับ reset ข้อมูล PDF merge เมื่อ upload ไฟล์ใหม่
 */

const MERGE_HISTORY_KEY = 'pdfMergeHistory';
const PDF_STORAGE_KEY = 'storedPdfs';

/**
 * Reset ข้อมูล PDF merge ทั้งหมด
 */
export function resetPdfMerge(): void {
  try {
    // Clear merge history
    sessionStorage.removeItem(MERGE_HISTORY_KEY);
    
    // Clear stored PDFs
    sessionStorage.removeItem(PDF_STORAGE_KEY);
    
    console.log('✅ PDF merge data reset');
  } catch (error) {
    console.error('Error resetting PDF merge:', error);
  }
}

/**
 * ตรวจสอบว่ามี merge data หรือไม่
 */
export function hasMergeData(): boolean {
  try {
    const history = sessionStorage.getItem(MERGE_HISTORY_KEY);
    const pdfs = sessionStorage.getItem(PDF_STORAGE_KEY);
    
    return !!(history || pdfs);
  } catch (error) {
    return false;
  }
}

/**
 * Get merge summary
 */
export function getMergeSummary(): {
  hasMergedPdf: boolean;
  mergeCount: number;
  totalPages: number;
} | null {
  try {
    const history = sessionStorage.getItem(MERGE_HISTORY_KEY);
    
    if (!history) {
      return null;
    }

    const parsed = JSON.parse(history);
    
    return {
      hasMergedPdf: parsed.history?.length > 0,
      mergeCount: parsed.history?.length || 0,
      totalPages: parsed.currentPageCount || 0,
    };
  } catch (error) {
    return null;
  }
}
