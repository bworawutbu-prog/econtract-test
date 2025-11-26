import { PDFDocument } from 'pdf-lib';

/**
 * PDF Merger Utility
 * รวมไฟล์ PDF หลายไฟล์เป็นไฟล์เดียว
 */

export interface MergePdfOptions {
  firstPdf: File | string; // ไฟล์ที่ upload มาก่อน (จะเป็นหน้าแรก)
  additionalPdfs: (File | string)[]; // ไฟล์เพิ่มเติม
}

/**
 * แปลง File หรือ URL เป็น ArrayBuffer
 */
async function loadPdfAsArrayBuffer(source: File | string): Promise<ArrayBuffer> {
  if (source instanceof File) {
    return await source.arrayBuffer();
  } else {
    // ถ้าเป็น URL หรือ base64
    if (source.startsWith('data:')) {
      // Base64
      const base64 = source.split(',')[1];
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    } else {
      // URL
      const response = await fetch(source);
      return await response.arrayBuffer();
    }
  }
}

/**
 * รวมไฟล์ PDF หลายไฟล์เป็นไฟล์เดียว
 */
export async function mergePdfs(options: MergePdfOptions): Promise<{
  mergedPdf: Blob;
  mergedPdfUrl: string;
  mergedPdfBase64: string;
  pageCount: number;
}> {
  try {
    // สร้าง PDF document ใหม่
    const mergedPdf = await PDFDocument.create();

    // โหลดไฟล์แรก (จะเป็นหน้าแรก)
    const firstPdfBytes = await loadPdfAsArrayBuffer(options.firstPdf);
    const firstPdfDoc = await PDFDocument.load(firstPdfBytes);
    
    // คัดลอกทุกหน้าจากไฟล์แรก
    const firstPages = await mergedPdf.copyPages(
      firstPdfDoc,
      firstPdfDoc.getPageIndices()
    );
    firstPages.forEach(page => mergedPdf.addPage(page));

    console.log(`✅ Added first PDF: ${firstPdfDoc.getPageCount()} pages`);

    // โหลดและรวมไฟล์เพิ่มเติม
    for (let i = 0; i < options.additionalPdfs.length; i++) {
      const additionalPdfBytes = await loadPdfAsArrayBuffer(options.additionalPdfs[i]);
      const additionalPdfDoc = await PDFDocument.load(additionalPdfBytes);
      
      const additionalPages = await mergedPdf.copyPages(
        additionalPdfDoc,
        additionalPdfDoc.getPageIndices()
      );
      additionalPages.forEach(page => mergedPdf.addPage(page));

      console.log(`✅ Added PDF ${i + 1}: ${additionalPdfDoc.getPageCount()} pages`);
    }

    // บันทึก merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    const mergedPdfBytesBuffer = new Uint8Array(mergedPdfBytes);
    const mergedPdfBlob = new Blob([mergedPdfBytesBuffer], { type: 'application/pdf' });
    const mergedPdfUrl = URL.createObjectURL(mergedPdfBlob);

    // แปลงเป็น base64
    const mergedPdfBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(mergedPdfBlob);
    });

    const totalPages = mergedPdf.getPageCount();
    console.log(`✅ Merged PDF created: ${totalPages} total pages`);

    return {
      mergedPdf: mergedPdfBlob,
      mergedPdfUrl,
      mergedPdfBase64,
      pageCount: totalPages,
    };
  } catch (error) {
    console.error('❌ Error merging PDFs:', error);
    throw error;
  }
}

/**
 * รวม PDF จาก File objects
 */
export async function mergePdfFiles(files: File[]): Promise<{
  mergedPdf: Blob;
  mergedPdfUrl: string;
  mergedPdfBase64: string;
  pageCount: number;
}> {
  if (files.length === 0) {
    throw new Error('No files provided for merging');
  }

  if (files.length === 1) {
    // ถ้ามีไฟล์เดียว ไม่ต้อง merge
    const singleFile = files[0];
    const url = URL.createObjectURL(singleFile);
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(singleFile);
    });

    const arrayBuffer = await singleFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    return {
      mergedPdf: singleFile,
      mergedPdfUrl: url,
      mergedPdfBase64: base64,
      pageCount: pdfDoc.getPageCount(),
    };
  }

  const [firstFile, ...restFiles] = files;
  
  return mergePdfs({
    firstPdf: firstFile,
    additionalPdfs: restFiles,
  });
}

/**
 * รวม PDF จาก URLs
 */
export async function mergePdfUrls(urls: string[]): Promise<{
  mergedPdf: Blob;
  mergedPdfUrl: string;
  mergedPdfBase64: string;
  pageCount: number;
}> {
  if (urls.length === 0) {
    throw new Error('No URLs provided for merging');
  }

  const [firstUrl, ...restUrls] = urls;
  
  return mergePdfs({
    firstPdf: firstUrl,
    additionalPdfs: restUrls,
  });
}

/**
 * เพิ่มหน้าว่างใน PDF
 */
export async function addBlankPages(
  pdfSource: File | string,
  numberOfPages: number,
  position: 'before' | 'after' = 'after'
): Promise<{
  mergedPdf: Blob;
  mergedPdfUrl: string;
  mergedPdfBase64: string;
  pageCount: number;
}> {
  const pdfBytes = await loadPdfAsArrayBuffer(pdfSource);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  // เพิ่มหน้าว่าง
  for (let i = 0; i < numberOfPages; i++) {
    const blankPage = pdfDoc.addPage();
    
    if (position === 'before') {
      // ย้ายหน้าว่างไปด้านหน้า
      const pages = pdfDoc.getPages();
      pdfDoc.removePage(pages.length - 1);
      pdfDoc.insertPage(i, blankPage);
    }
  }

  const mergedPdfBytes = await pdfDoc.save();
  const mergedPdfBytesBuffer = new Uint8Array(mergedPdfBytes);
  const mergedPdfBlob = new Blob([mergedPdfBytesBuffer], { type: 'application/pdf' });
  const mergedPdfUrl = URL.createObjectURL(mergedPdfBlob);

  const mergedPdfBase64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(mergedPdfBlob);
  });

  return {
    mergedPdf: mergedPdfBlob,
    mergedPdfUrl,
    mergedPdfBase64,
    pageCount: pdfDoc.getPageCount(),
  };
}
