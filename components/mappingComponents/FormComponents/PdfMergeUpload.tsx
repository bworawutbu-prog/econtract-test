"use client";

import React, { useState, useEffect } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined, DeleteOutlined, FileOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { usePdfMerger } from '@/hooks/usePdfMerger';
import { storePdf, loadPdf, clearAllPdfs } from '@/utils/pdfStorage';

interface PdfMergeUploadProps {
  existingPdf?: string; // PDF ที่ upload มาจากหน้า uploadPdf
  onMergeComplete?: (mergedPdfUrl: string, pageCount: number) => void;
  onPdfUpdate?: (newPdfUrl: string, newPageCount: number) => void; // Callback สำหรับ update PDF display
}

const MERGE_HISTORY_KEY = 'pdfMergeHistory';

export const PdfMergeUpload: React.FC<PdfMergeUploadProps> = ({
  existingPdf,
  onMergeComplete,
  onPdfUpdate,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [currentPdf, setCurrentPdf] = useState<string | undefined>(existingPdf);
  const [mergeHistory, setMergeHistory] = useState<Array<{url: string, pageCount: number, files: string[], base64_pdf: string}>>([]);
  const { 
    merging,
    setMerging,
    mergedPdfUrl, 
    mergedPageCount, 
    mergePdfsWithExisting,
    clearMerged 
  } = usePdfMerger();

  // โหลด merge history และ PDF จาก sessionStorage เมื่อ component mount
  useEffect(() => {
    const savedHistory = sessionStorage.getItem(MERGE_HISTORY_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setMergeHistory(parsed.history || []);
        
        // โหลด current PDF จาก storage
        const storedPdf = loadPdf('currentMergedPdf');
        if (storedPdf) {
          setCurrentPdf(storedPdf.url);
          
          // อัพเดท PDF display
          if (onPdfUpdate) {
            onPdfUpdate(storedPdf.url, storedPdf.pageCount);
          }
        } else if (parsed.currentPdf && parsed.currentPdf !== existingPdf) {
          // Fallback: ใช้ URL ที่บันทึกไว้
          setCurrentPdf(parsed.currentPdf);
          if (onPdfUpdate && parsed.currentPageCount) {
            onPdfUpdate(parsed.currentPdf, parsed.currentPageCount);
          }
        }
      } catch (error) {
        console.error('Error loading merge history:', error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // เรียกแค่ครั้งเดียวเมื่อ mount

  // บันทึก merge history ลง sessionStorage ทุกครั้งที่เปลี่ยนแปลง
  useEffect(() => {
    if (mergeHistory.length > 0) {
      sessionStorage.setItem(MERGE_HISTORY_KEY, JSON.stringify({
        history: mergeHistory,
        currentPdf: currentPdf,
        currentPageCount: mergedPageCount,
      }));
    }
  }, [mergeHistory, currentPdf, mergedPageCount]);

  // ฟังก์ชันสำหรับนับจำนวนหน้าจาก base64
  const getPageCountFromBase64 = async (base64String: string): Promise<number> => {
    try {
      // ลบ prefix "data:application/pdf;base64," ถ้ามี
      const base64Data = base64String.includes('base64,') 
        ? base64String.split('base64,')[1] 
        : base64String;
      
      // แปลง base64 เป็น Uint8Array
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // โหลด PDF ด้วย pdf-lib
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.load(bytes);
      const pageCount = pdfDoc.getPageCount();
      console.log('pageCount', pdfDoc);
      return pageCount;
    } catch (error) {
      console.error('Error getting page count from base64:', error);
      return 0;
    }
  };

  // ฟังก์ชันสำหรับ get name, pageCount, originalPdfUrl จาก base64
  const getPdfInfoFromBase64 = async (base64String: string, fileName: string = 'document.pdf') => {
    try {
      // นับจำนวนหน้า
      const pageCount = await getPageCountFromBase64(base64String);
      
      // แปลง base64 เป็น blob
      const base64Data = base64String.includes('base64,') 
        ? base64String.split('base64,')[1] 
        : base64String;
      
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const originalPdfUrl = URL.createObjectURL(blob);
      
      return {
        name: fileName,
        pageCount: pageCount,
        originalPdfUrl: originalPdfUrl,
      };
    } catch (error) {
      console.error('Error getting PDF info from base64:', error);
      return {
        name: fileName,
        pageCount: 0,
        originalPdfUrl: '',
      };
    }
  };

  // ฟังก์ชันสำหรับแปลง File เป็น object ที่มี base64, files, pageCount, url
  const convertFilesToBase64 = async (files: File[]) => {
    const results = [];
    
    for (const file of files) {
      try {
        // แปลง File เป็น base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        // สร้าง URL สำหรับ File
        const url = URL.createObjectURL(file);
        
        // นับจำนวนหน้า
        const countpage = await getPageCountFromBase64(base64);
        
        // สร้าง object
        results.push({
          base64: base64,
          files: [file.name],
          pageCount: countpage,
          url: url,
        });
      } catch (error) {
        console.error(`Error converting file ${file.name} to base64:`, error);
      }
    }
    
    return results;
  };

  const handleFileChange = (info: any) => {
    let newFileList = [...info.fileList];
    
    // จำกัดเฉพาะไฟล์ PDF
    newFileList = newFileList.filter(file => {
      if (file.type !== 'application/pdf') {
        message.error(`${file.name} ไม่ใช่ไฟล์ PDF`);
        return false;
      }
      return true;
    });
      console.log('TEST CCCC', newFileList)
    setFileList(newFileList);
  };
const handelEditMergPdf = async () => {
  const mergedPdf = sessionStorage.getItem('mergedPdf');
  if (mergedPdf) {
    const mergedPdfData = JSON.parse(mergedPdf);
    setMergeHistory(mergedPdfData);
  }
}
  const handleMergePdfs = async () => {
    const basePdf = mergedPdfUrl || currentPdf; // ใช้ PDF ที่ merge ล่าสุด หรือ original
    
    if (!basePdf && fileList.length === 0) {
      message.warning('กรุณาอัปโหลดไฟล์ PDF อย่างน้อย 1 ไฟล์');
      return;
    }

    if (fileList.length === 0) {
      message.warning('กรุณาอัปโหลดไฟล์ PDF เพิ่มเติม');
      return;
    }

    try {
      // เตรียมไฟล์สำหรับ merge
      const additionalFiles: File[] = [];
       
      // เพิ่มไฟล์ที่ upload เพิ่มเติม
      for (const uploadFile of fileList) {
        console.log('AAA', fileList)
        if (uploadFile.originFileObj) {
          additionalFiles.push(uploadFile.originFileObj as File);
        }
      }
      
      // Merge PDFs (base PDF จะเป็นหน้าแรก)
      if (basePdf) {
        let base64Pdf = '';
        let originalPdfUrl = '';
        try {
          const response = await fetch(basePdf);
          const blob = await response.blob();
          originalPdfUrl = response.url;
          console.log('blob', blob);
          console.log('response', response);
          // แปลง blob เป็น base64
          const reader = new FileReader();
          base64Pdf = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              const base64 = reader.result as string;
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error('Error converting PDF to base64 in useEffect:', error);
        }
        
        // บันทึก original PDF ถ้ายังไม่มี
        const originalPdf = sessionStorage.getItem('originalPdf');
        if (originalPdf == undefined || originalPdf == null) {
          // นับจำนวนหน้าจาก base64
          const pageCount = await getPageCountFromBase64(base64Pdf);
          const originalPdfs: any = {
            url: originalPdfUrl,
            pageCount: pageCount,
            files: ['original.pdf'],
            base64_pdf: base64Pdf,
          }
          sessionStorage.setItem('originalPdfs', JSON.stringify(originalPdfs));
        }
        
        // แปลง additionalFiles เป็น base64 พร้อม name, pageCount, url
        const additionalFilesData = await convertFilesToBase64(fileList.map(f => f.originFileObj as File));
        console.log('additionalFilesData:', additionalFilesData);
        setMergeHistory(prev => [...prev, ...additionalFilesData.map(f => ({
          url: f.url,
          pageCount: f.pageCount,
          files: f.files,
          base64_pdf: f.base64,
        }))])
        // บันทึก additionalFiles data ลง sessionStorage
        // sessionStorage.setItem('additionalPdfs', JSON.stringify(additionalFilesData));
        
        console.log('basePdf', basePdf);
        console.log('additionalFiles', additionalFiles);
        const result = await mergePdfsWithExisting(basePdf, additionalFiles);

        // บันทึก PDF ลง storage
        const stored = await storePdf(
          'currentMergedPdf',
          result.mergedPdf,
          result.pageCount,
          'merged.pdf'
        );

        if (!stored) {
          console.warn('PDF too large for storage, using URL only');
        }

        // บันทึก merge history
        // const fileNames = fileList.map(f => f.name);
        // setMergeHistory(prev => [...prev, {
        //   url: result.mergedPdfUrl,
        //   pageCount: result.pageCount,
        //   files: fileNames,
        // }]);

        // อัพเดท current PDF เป็น merged PDF ใหม่
        setCurrentPdf(result.mergedPdfUrl);
        
        // Clear file list สำหรับ merge ครั้งต่อไป
        setFileList([]);

        // Callback to parent for form data
        if (onMergeComplete) {
          onMergeComplete(result.mergedPdfUrl, result.pageCount);
        }

        // Callback to parent for PDF display update
        if (onPdfUpdate) {
          onPdfUpdate(result.mergedPdfUrl, result.pageCount);
        }
      }
    } catch (error) {
      console.error('Error merging PDFs:', error);
    }
  };

  const handleRemoveFile = (file: UploadFile) => {
    const newFileList = fileList.filter(f => f.uid !== file.uid);
    setFileList(newFileList);
  };

  const handleRemoveMergeHistory = async (indexToRemove: number) => {
    try {
      // ลบ history ที่เลือก
      const newHistory = mergeHistory.filter((_, i) => i !== indexToRemove);
      setMergeHistory(newHistory);

      // ถ้าลบ history ทั้งหมด ให้ reset กลับไปเป็น original PDF
      if (newHistory.length === 0) {
        handleClearMerged();
        return;
      }

      // Rebuild PDF จาก history ที่เหลือ
      await rebuildPdfFromHistory(newHistory);
      
      // บันทึกลง sessionStorage
      sessionStorage.setItem(MERGE_HISTORY_KEY, JSON.stringify({
        history: newHistory,
        currentPdf: newHistory[newHistory.length - 1]?.url,
        currentPageCount: newHistory[newHistory.length - 1]?.pageCount,
      }));
      await handelEditMergPdf();
    } catch (error) {
      console.error('Error removing merge history:', error);
      message.error('เกิดข้อผิดพลาดในการลบไฟล์');
    }
  };

  const rebuildPdfFromHistory = async (history: typeof mergeHistory) => {
    if (!existingPdf) return;

    try {
      setMerging(true);

      // เริ่มจาก original PDF
      let currentBase = existingPdf;
      
      // Rebuild โดยการ merge ตาม history ที่เหลือ
      for (const historyItem of history) {
        // ใช้ URL ที่บันทึกไว้ใน history
        currentBase = historyItem.url;
      }

      // ใช้ history item สุดท้าย
      const lastHistory = history[history.length - 1];
      
      setCurrentPdf(lastHistory.url);

      // Update parent
      if (onPdfUpdate) {
        onPdfUpdate(lastHistory.url, lastHistory.pageCount);
      }
      
      if (onMergeComplete) {
        onMergeComplete(lastHistory.url, lastHistory.pageCount);
      }

      message.success('ลบไฟล์สำเร็จ!');
    } catch (error) {
      console.error('Error rebuilding PDF:', error);
      message.error('เกิดข้อผิดพลาดในการสร้าง PDF ใหม่');
    } finally {
      setMerging(false);
    }
  };

  const handleClearMerged = () => {
    clearMerged();
    setFileList([]);
    setMergeHistory([]);
    setCurrentPdf(existingPdf); // Reset กลับเป็น PDF เดิม
    
    // Clear sessionStorage
    sessionStorage.removeItem(MERGE_HISTORY_KEY);
    clearAllPdfs(); // Clear PDF storage
    
    // Reset PDF display ใน parent
    if (onPdfUpdate && existingPdf) {
      resetToOriginalPdf();
    }
  };

  const resetToOriginalPdf = async () => {
    if (existingPdf && onPdfUpdate) {
      try {
        const response = await fetch(existingPdf);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const { PDFDocument } = await import('pdf-lib');
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();
        
        onPdfUpdate(existingPdf, pageCount);
      } catch (error) {
        console.error('Error resetting to original PDF:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* แสดงข้อมูล Current PDF */}
      {/* {currentPdf && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileOutlined className="text-blue-600" />
            <span className="font-medium text-blue-900">
              {mergedPdfUrl ? 'ไฟล์ PDF ที่รวมแล้ว (จะเป็นหน้าแรก)' : 'ไฟล์ PDF หลัก (จะเป็นหน้าแรก)'}
            </span>
          </div>
          <div className="text-sm text-blue-700">
            {mergedPdfUrl ? `รวมไฟล์แล้ว - จำนวน ${mergedPageCount} หน้า` : 'ไฟล์จากหน้า Upload PDF'}
          </div>
        </div>
      )} */}

      {/* Upload Additional PDFs - แสดงเสมอเพื่อให้ merge ได้หลายครั้ง */}
      <Upload
        multiple
        accept="application/pdf"
        fileList={fileList}
        onChange={handleFileChange}
        beforeUpload={() => false} // ป้องกันการ upload อัตโนมัติ
        onRemove={handleRemoveFile}
      >
        <Button icon={<UploadOutlined />}>
          {mergedPdfUrl ? 'เพิ่มไฟล์ PDF อีก' : 'เลือกไฟล์ PDF เพิ่มเติม'}
        </Button>
      </Upload>

      {fileList.length > 0 && (
        <div className="mt-4">
          <Button
            type="primary"
            onClick={handleMergePdfs}
            loading={merging}
            block
          >
            {merging ? 'กำลังรวมไฟล์...' : mergedPdfUrl ? 'รวมไฟล์อีกครั้ง' : 'รวมไฟล์ PDF'}
          </Button>
        </div>
      )}

      {/* แสดง Merge History */}
      {mergeHistory.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-[4fr_auto] text-sm font-medium text-gray-700">ประวัติการรวมไฟล์:</div>
          {mergeHistory.map((history, index) => (
            <div key={index} className=" bg-gray-50 border border-gray-200 rounded-lg p-3 md-">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    ครั้งที่ {index + 1}: {history.pageCount} หน้า
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    ไฟล์ที่เพิ่ม: {history.files.join(', ')}
                  </div>
                </div>
                <Button 
                  size="small" 
                  danger
                  type="text"
                  onClick={() => handleRemoveMergeHistory(index)}
                  icon={<DeleteOutlined />}
                >
                  ลบ
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* แสดงผลลัพธ์หลัง merge */}
      {/* {mergedPdfUrl && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircleOutlined className="text-green-600 text-xl" />
              <span className="font-medium text-green-900">รวมไฟล์สำเร็จ!</span>
            </div>
            <Button 
              size="small" 
              danger 
              onClick={handleClearMerged}
              icon={<DeleteOutlined />}
            >
              รีเซ็ตทั้งหมด
            </Button>
          </div>
          <div className="text-sm text-green-700 space-y-1">
            <div>จำนวนหน้าทั้งหมด: {mergedPageCount} หน้า</div>
            <div>รวมไฟล์ไปแล้ว: {mergeHistory.length} ครั้ง</div>
            <a 
              href={mergedPdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline block"
            >
              ดูตัวอย่าง PDF ที่รวมแล้ว
            </a>
          </div>
        </div>
      )} */}
    </div>
  );
};
