import { useState, useCallback } from 'react';
import { mergePdfFiles, mergePdfs } from '@/utils/pdfMerger';
import { message } from 'antd';

/**
 * Hook for managing PDF merging
 */
export function usePdfMerger() {
  const [merging, setMerging] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [mergedPdfBase64, setMergedPdfBase64] = useState<string | null>(null);
  const [mergedPageCount, setMergedPageCount] = useState<number>(0);
  const [error, setError] = useState<Error | null>(null);

  const mergePdfsWithExisting = useCallback(async (
    existingPdf: File | string,
    additionalFiles: File[]
  ) => {
    setMerging(true);
    setError(null);

    try {
      const result = await mergePdfs({
        firstPdf: existingPdf,
        additionalPdfs: additionalFiles,
      });

      setMergedPdfUrl(result.mergedPdfUrl);
      setMergedPdfBase64(result.mergedPdfBase64);
      setMergedPageCount(result.pageCount);

      message.success(`รวมไฟล์สำเร็จ! จำนวนหน้าทั้งหมด: ${result.pageCount} หน้า`);

      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      message.error('เกิดข้อผิดพลาดในการรวมไฟล์ PDF');
      throw error;
    } finally {
      setMerging(false);
    }
  }, []);

  const mergeMultiplePdfs = useCallback(async (files: File[]) => {
    setMerging(true);
    setError(null);

    try {
      const result = await mergePdfFiles(files);

      setMergedPdfUrl(result.mergedPdfUrl);
      setMergedPdfBase64(result.mergedPdfBase64);
      setMergedPageCount(result.pageCount);

      message.success(`รวมไฟล์สำเร็จ! จำนวนหน้าทั้งหมด: ${result.pageCount} หน้า`);

      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      message.error('เกิดข้อผิดพลาดในการรวมไฟล์ PDF');
      throw error;
    } finally {
      setMerging(false);
    }
  }, []);

  const clearMerged = useCallback(() => {
    if (mergedPdfUrl) {
      URL.revokeObjectURL(mergedPdfUrl);
    }
    setMergedPdfUrl(null);
    setMergedPdfBase64(null);
    setMergedPageCount(0);
    setError(null);
  }, [mergedPdfUrl]);

  return {
    merging,
    setMerging,
    mergedPdfUrl,
    mergedPdfBase64,
    mergedPageCount,
    error,
    mergePdfsWithExisting,
    mergeMultiplePdfs,
    clearMerged,
  };
}
