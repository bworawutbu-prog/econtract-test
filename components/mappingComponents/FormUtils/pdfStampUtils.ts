/**
 * PDF Stamp Utilities
 * ฟังก์ชันสำหรับการ stamp ข้อความและลายเซ็นบน PDF
 */
"use client";

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { STYLE_CONSTANTS } from './defaultStyle';
import { enqueueSnackbar } from 'notistack';

/**
 * Helper function to safely decode base64 data, handling data URL prefixes
 */
function safeBase64Decode(base64String: string): Uint8Array {
  try {
    // Remove data URL prefix if present
    const base64Data = base64String.replace(
      /^data:image\/(png|jpeg|jpg);base64,/,
      ""
    );
    
    // Validate base64 string
    if (!base64Data || typeof base64Data !== 'string') {
      throw new Error('Invalid base64 string');
    }
    
    // Decode base64
    const binaryString = atob(base64Data);
    return Uint8Array.from(binaryString, c => c.charCodeAt(0));
  } catch (error) {
    console.error('Error decoding base64:', error);
    throw new Error(`Failed to decode base64 data: ${error}`);
  }
}

// =============== INTERFACES ===============

export interface StampTextOptions {
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: { r: number; g: number; b: number };
  fontFamily?: string;
  maxWidth?: number;
  rotation?: number;
  ratio?: number;
  max_characters?: number;
  font_weight?: string;
  font_style?: string;
  text_align?: string;
  text_decoration?: string;
  justify_content?: string;
  underline?: boolean;
  fill?: string;
  background_color?: string;
  border_color?: string;
  border_width?: number;
  border_style?: string;
  border_radius?: number;
  padding?: number;
  margin?: number;
}

export interface StampSignatureOptions {
  signatureImageBase64: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
}

export interface StampItem {
  type: 'text' | 'signature' | 'checkbox' | 'radio' | 'days' | 'months' | 'years';
  pageNumber: number;
  llx: number;
  lly: number;
  urx: number;
  ury: number;
  textOptions?: StampTextOptions;
  signatureOptions?: StampSignatureOptions;
  checkboxOptions?: {
    items: { label: string; checked: boolean }[];
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
  radioOptions?: {
    items: { label: string; checked: boolean }[];
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
  date_group_header?: string;
  date_group_format?: string;
  date_group_timestamp?: string;
  date_group_index?: number;
  date_group_size?: number;
  is_complete_group?: boolean;
}

// =============== CORE STAMP FUNCTIONS ===============

/**
 * แปลง PDF coordinates (0-1) เป็น absolute coordinates
 */
function convertPdfCoordinatesToAbsolute(
  coordinates: { llx: number; lly: number; urx: number; ury: number },
  pageWidth: number,
  pageHeight: number
): { x: number; y: number; width: number; height: number } {
  return {
    x: coordinates.llx * pageWidth,
    y: coordinates.lly * pageHeight,
    width: (coordinates.urx - coordinates.llx) * pageWidth,
    height: (coordinates.ury - coordinates.lly) * pageHeight
  };
}

/**
 * Stamp ข้อความลงบน PDF page
 */
async function stampTextOnPage(
  page: any,
  textOptions: StampTextOptions,
  pdfDoc: PDFDocument
): Promise<void> {
  try {
    const {
      text,
      x,
      y,
      fontSize = 12,
      color = { r: 0, g: 0, b: 0 },
      maxWidth,
      rotation = 0,
      ratio = 1,
      max_characters,
      font_weight,
      font_style,
      text_align,
      text_decoration,
      justify_content,
      underline,
      fill,
      background_color,
      border_color,
      border_width,
      border_style,
      border_radius,
      padding,
      margin
    } = textOptions;

    // จำกัดจำนวนตัวอักษรถ้ามี max_characters
    let displayText = text;
    if (max_characters && text.length > max_characters) {
      displayText = text.substring(0, max_characters) + '...';
    }

    // ✅ ตรวจสอบภาษาไทยอย่างแม่นยำ
    const hasThaiText = /[\u0E00-\u0E7F]/.test(displayText);
    
    // ✅ ถ้าเป็นภาษาไทย ใช้ Canvas rendering เลย (ไม่วาด background ซ้ำ)
    if (hasThaiText) {
      await stampTextAsImage(page, textOptions, x, y, fontSize, color, pdfDoc);
      return;
    }

    // เลือก font ที่รองรับ Unicode (Thai) และ font style สำหรับภาษาอังกฤษ
    let font;
    try {
      // ภาษาอังกฤษ - ใช้ Helvetica family
      if (font_weight === 'bold' || font_style === 'bold') {
        font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      } else if (font_style === 'italic') {
        font = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
      } else if (font_weight === 'bold' && font_style === 'italic') {
        font = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);
      } else {
        font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      }
    } catch (fontError) {
      console.warn('⚠️ Font embedding failed, using Canvas rendering');
      await stampTextAsImage(page, textOptions, x, y, fontSize, color, pdfDoc);
      return;
    }

    // คำนวณขนาดข้อความ (ถ้า font รองรับ) และใช้ ratio
    const scaledFontSize = fontSize * ratio;
    let actualWidth = (maxWidth || 200) * ratio; // default width with ratio
    let actualHeight = scaledFontSize * 1; // default height with ratio
    let textWidth = 0;
    let textHeight = scaledFontSize;
    
    try {
      textWidth = font.widthOfTextAtSize(displayText, scaledFontSize);
      if (isNaN(textWidth) || textWidth <= 0) {
        throw new Error('Invalid text width');
      }
      // ใช้ width ที่กำหนดมา หรือ textWidth ที่คำนวณได้
      if (!maxWidth) {
        actualWidth = textWidth;
      }
    } catch (widthError) {
      console.warn('⚠️ Cannot calculate text width, using Canvas rendering');
      await stampTextAsImage(page, textOptions, x, y, scaledFontSize, color, pdfDoc);
      return;
    }

    // คำนวณ padding และ margin
    const paddingValue = padding || 0;
    const marginValue = margin || 0;

    // วาด background color ถ้ามี
    if (background_color) {
      // const bgColorWithOpacity = parseColorWithOpacity(background_color);
      // page.drawRectangle({
      //   x: x - paddingValue - marginValue,
      //   y: y - paddingValue - marginValue,
      //   width: actualWidth + (paddingValue * 2) + (marginValue * 2),
      //   height: actualHeight + (paddingValue * 2) + (marginValue * 2),
      //   color: rgb(bgColorWithOpacity.r, bgColorWithOpacity.g, bgColorWithOpacity.b),
      //   opacity: bgColorWithOpacity.opacity
      // });
    }

    // วาด border ถ้ามี และ border_color ไม่ใช่ "none"
    if (border_color && border_color !== 'none' && border_width && border_width > 0) {
      const borderColorWithOpacity = parseColorWithOpacity(border_color);
      page.drawRectangle({
        x: x - paddingValue - marginValue,
        y: y - paddingValue - marginValue,
        width: actualWidth + (paddingValue * 2) + (marginValue * 2),
        height: actualHeight + (paddingValue * 2) + (marginValue * 2),
        borderColor: rgb(borderColorWithOpacity.r, borderColorWithOpacity.g, borderColorWithOpacity.b),
        borderWidth: border_width,
        borderOpacity: borderColorWithOpacity.opacity
      });
    }

    // คำนวณตำแหน่ง text alignment
    let textX = x + paddingValue + marginValue;
    if (text_align === 'center') {
      textX = x + (actualWidth / 2) - (textWidth / 2) + paddingValue + marginValue;
    } else if (text_align === 'right') {
      textX = x + actualWidth - textWidth + paddingValue + marginValue;
    }

    // ใช้ fill color ถ้ามี หรือใช้ color default
    let textColor = color;
    if (fill) {
      textColor = parseColorToRgb(fill);
    }

    // วาดข้อความ
    try {
      const drawTextOptions: any = {
        x: textX,
        y: y + paddingValue + marginValue,
        size: scaledFontSize,
        font,
        color: rgb(textColor.r, textColor.g, textColor.b),
        maxWidth: actualWidth
      };
      
      // เพิ่ม rotation ถ้ามีค่าและไม่ใช่ 0
      if (rotation && rotation !== 0) {
        drawTextOptions.rotate = {
          type: 'degrees',
          angle: rotation
        };
      }
      
      page.drawText(displayText, drawTextOptions);

      // วาด underline ถ้ามี
      if (underline || text_decoration === 'underline') {
        page.drawLine({
          start: { x: textX, y: y + paddingValue + marginValue - 2 },
          end: { x: textX + textWidth, y: y + paddingValue + marginValue - 2 },
          thickness: 1,
          color: rgb(textColor.r, textColor.g, textColor.b)
        });
      }

    } catch (drawError) {
      console.warn('⚠️ Text drawing failed, using Canvas rendering');
      await stampTextAsImage(page, textOptions, textX, y + paddingValue + marginValue, scaledFontSize, textColor, pdfDoc);
    }
  } catch (error) {
    console.error('❌ Error stamping text:', error);
    // ถ้าทุกอย่างล้มเหลว ให้ลองสร้างเป็นภาพ
    try {
      await stampTextAsImage(page, textOptions, textOptions.x, textOptions.y, (textOptions.fontSize || 12) * (textOptions.ratio || 1), textOptions.color || { r: 0, g: 0, b: 0 }, pdfDoc);
    } catch (imageError) {
      console.error('❌ Failed to render text as image:', imageError);
      throw error;
    }
  }
}

/**
 * สร้างข้อความเป็นภาพแล้ว stamp ลงใน PDF (สำหรับกรณีที่ font ไม่รองรับ)
 */
async function stampTextAsImage(
  page: any,
  textOptions: StampTextOptions,
  x: number,
  y: number,
  fontSize: number,
  color: { r: number; g: number; b: number },
  pdfDoc: PDFDocument
): Promise<void> {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot create canvas context');

    // จำกัดจำนวนตัวอักษรถ้ามี max_characters
    let displayText = textOptions.text;
    if (textOptions.max_characters && textOptions.text.length > textOptions.max_characters) {
      displayText = textOptions.text.substring(0, textOptions.max_characters) + '...';
    }

    // ✅ ตรวจสอบภาษาไทยครั้งเดียว
    const hasThaiText = /[\u0E00-\u0E7F]/.test(displayText);

    // คำนวณ padding และ ratio
    const paddingValue = textOptions.padding || 0;
    const marginValue = textOptions.margin || 0;
    const ratio = textOptions.ratio || 1;

    // ตั้งค่า canvas size
    const scale = 2; // สำหรับความคมชัด
    const canvasWidth = ((textOptions.maxWidth || 200) * ratio) + (paddingValue * 2);
    
    // ✅ ปรับปรุง: คำนวณ height ที่เหมาะกับภาษาไทย และใช้ ratio
    const lineHeightMultiplier = hasThaiText ? 1.8 : 1.5; // ภาษาไทยต้องการ line height มากกว่า
    const canvasHeight = (fontSize * ratio * lineHeightMultiplier) + (paddingValue * 2);
    
    canvas.width = canvasWidth * scale;
    canvas.height = canvasHeight * scale;
    
    ctx.scale(scale, scale);

    // วาด background color ถ้ามี
        // if (textOptions.background_color) {
        //   const bgColorWithOpacity = parseColorWithOpacity(textOptions.background_color);
        //   ctx.globalAlpha = bgColorWithOpacity.opacity;
        //   ctx.fillStyle = `rgb(${Math.round(bgColorWithOpacity.r * 255)}, ${Math.round(bgColorWithOpacity.g * 255)}, ${Math.round(bgColorWithOpacity.b * 255)})`;
        //   ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        //   ctx.globalAlpha = 1; // reset alpha
        // }

    // วาด border ถ้ามี
    if (textOptions.border_color && textOptions.border_color !== 'none' && textOptions.border_width && textOptions.border_width > 0) {
      const borderColorWithOpacity = parseColorWithOpacity(textOptions.border_color);
      ctx.globalAlpha = borderColorWithOpacity.opacity;
      ctx.strokeStyle = `rgb(${Math.round(borderColorWithOpacity.r * 255)}, ${Math.round(borderColorWithOpacity.g * 255)}, ${Math.round(borderColorWithOpacity.b * 255)})`;
      ctx.lineWidth = textOptions.border_width;
      ctx.strokeRect(textOptions.border_width / 2, textOptions.border_width / 2, 
                    canvasWidth - textOptions.border_width, canvasHeight - textOptions.border_width);
      ctx.globalAlpha = 1; // reset alpha
    }

    // ตั้งค่า font
    let fontStyle = '';
    if (textOptions.font_style === 'italic') fontStyle += 'italic ';
    if (textOptions.font_weight === 'bold') fontStyle += 'bold ';
    
    // ✅ ปรับปรุง: ใช้ font family ที่รองรับภาษาไทยดีขึ้น
    let fontFamily;
    if (hasThaiText) {
      // สำหรับภาษาไทย ใช้ font ที่รองรับภาษาไทยดี
      fontFamily = textOptions.fontFamily || '"Sarabun", "Sukhumvit Set", "Angsana New", "TH SarabunPSK", "Tahoma", sans-serif';
    } else {
      // สำหรับภาษาอังกฤษ
      fontFamily = textOptions.fontFamily || STYLE_CONSTANTS.DEFAULT_FONT_FAMILY;
    }
    
    const scaledFontSize = fontSize * ratio;
    ctx.font = `${fontStyle}${scaledFontSize}px ${fontFamily}`;
    
    // ตั้งค่า text color
    let textColor = color;
    let textOpacity = 1;
    if (textOptions.fill) {
      const fillColorWithOpacity = parseColorWithOpacity(textOptions.fill);
      textColor = { r: fillColorWithOpacity.r, g: fillColorWithOpacity.g, b: fillColorWithOpacity.b };
      textOpacity = fillColorWithOpacity.opacity;
    }
    
    ctx.globalAlpha = textOpacity;
    ctx.fillStyle = `rgb(${Math.round(textColor.r * 255)}, ${Math.round(textColor.g * 255)}, ${Math.round(textColor.b * 255)})`;
    
    // ตั้งค่า text alignment
    ctx.textAlign = (textOptions.text_align as CanvasTextAlign) || 'left';
    ctx.textBaseline = 'top';
    
    // คำนวณตำแหน่ง text
    let textX = paddingValue;
    const textY = paddingValue;
    
    if (textOptions.text_align === 'center') {
      textX = canvasWidth / 2;
    } else if (textOptions.text_align === 'right') {
      textX = canvasWidth - paddingValue;
    }
    
    // วาดข้อความ
    ctx.fillText(displayText, textX, textY);
    
    // วาด underline ถ้ามี
    if (textOptions.underline || textOptions.text_decoration === 'underline') {
      const textWidth = ctx.measureText(displayText).width;
      let underlineX = textX;
      
      if (textOptions.text_align === 'center') {
        underlineX = textX - (textWidth / 2);
      } else if (textOptions.text_align === 'right') {
        underlineX = textX - textWidth;
      }
      
      ctx.beginPath();
      ctx.moveTo(underlineX, textY + scaledFontSize + 2);
      ctx.lineTo(underlineX + textWidth, textY + scaledFontSize + 2);
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1; // reset alpha

    // แปลงเป็น PNG
    const dataUrl = canvas.toDataURL('image/png');
    const base64Data = dataUrl.split(',')[1];
    const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Embed และวาดภาพ
    const image = await pdfDoc.embedPng(imageBytes);
    page.drawImage(image, {
      x,
      y,
      width: canvasWidth,
      height: canvasHeight
    });
    
  } catch (error) {
    console.log(`❌ Error stamping text as image: ${error}`);
    throw error;
  }
}

/**
 * Stamp ลายเซ็นลงบน PDF page
 */
async function stampSignatureOnPage(
  page: any,
  signatureOptions: StampSignatureOptions,
  pdfDoc: PDFDocument
): Promise<void> {
  try {
    const {
      signatureImageBase64,
      x,
      y,
      width = 100,
      height = 50,
      rotation = 0
    } = signatureOptions;

    // แปลง base64 เป็น image
    const imageBytes = safeBase64Decode(signatureImageBase64);
    
    // ตรวจสอบประเภทของ image และ embed
    let image;
    if (signatureImageBase64.startsWith('/9j/') || signatureImageBase64.includes('jpeg')) {
      image = await pdfDoc.embedJpg(imageBytes);
    } else {
      image = await pdfDoc.embedPng(imageBytes);
    }

    // วาดลายเซ็น
    const drawOptions: any = {
      x,
      y,
      width,
      height
    };
    
    // เพิ่ม rotation ถ้ามีค่าและไม่ใช่ 0
    if (rotation && rotation !== 0) {
      drawOptions.rotate = {
        type: 'degrees',
        angle: rotation
      };
    }
    
    page.drawImage(image, drawOptions);

  } catch (error) {
    console.log(`❌ Error stamping signature: ${error}`);
    throw error;
  }
}

// Draw checkbox image (pre-rendered) or vector group if items provided
async function stampCheckboxOnPage(
  page: any,
  options: {
    checkboxImageBase64?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    ratio?: number;
    llx?: number;
    lly?: number;
    urx?: number;
    ury?: number;
    pageWidth?: number;
    pageHeight?: number;
  },
  pdfDoc: PDFDocument
): Promise<void> {
  try {
    const {
      checkboxImageBase64,
      x = 0,
      y = 0,
      width = 20,
      height = 20,
      llx = 0,
      lly = 0,
      urx = 1,
      ury = 1,
      ratio = 1,
      pageWidth = 595,
      pageHeight = 842
    } = options;

    if (!checkboxImageBase64) {
      console.warn('⚠️ No checkbox image provided');
      return;
    }

    // แปลง base64 เป็น image
    const imageBytes = safeBase64Decode(checkboxImageBase64);
    
    // ตรวจสอบประเภทของ image และ embed
    let image;
    if (checkboxImageBase64.startsWith('/9j/') || checkboxImageBase64.includes('jpeg')) {
      image = await pdfDoc.embedJpg(imageBytes);
    } else {
      image = await pdfDoc.embedPng(imageBytes);
    }

    // คำนวณตำแหน่งและขนาดที่ถูกต้อง
    // ใช้ width และ height ที่ได้รับมา แทนการคำนวณจาก coordinates
    const finalWidth = width * ratio;
    const finalHeight = height * ratio;
    
    // คำนวณตำแหน่ง X จาก llx (left position)
    const page_x = llx * pageWidth;
    
    // คำนวณตำแหน่ง Y จาก ury (top position) - PDF มี origin ที่ bottom-left
    const page_y = pageHeight - (ury * pageHeight);
    
    // วาด checkbox
    page.drawImage(image, {
      x: page_x,
      y: page_y,
      width: finalWidth,
      height: finalHeight
    });

  } catch (error) {
    console.log(`❌ Error stamping checkbox: ${error}`);
    throw error;
  }
}

async function stampRadioOnPage(
  page: any,
  options: {
    radioImageBase64?: string;
    x?: number;
    y?: number; // ระยะจาก top ของหน้ากระดาษ
    width?: number;
    height?: number; // จะถูก override เพื่อรักษาอัตราส่วน
    ratio?: number;
    llx?: number;
    lly?: number;
    urx?: number;
    ury?: number;
    pageWidth?: number;
    pageHeight?: number;
  },
  pdfDoc: PDFDocument
): Promise<void> {
  try {
    const {
      radioImageBase64,
      x = 0,
      y = 0,
      width = 20,
      height = 20,
      ratio = 1,
      llx = 0,
      lly = 0,
      urx = 1,
      ury = 1,
      pageWidth = 595,
      pageHeight = 842
    } = options;

    if (!radioImageBase64) {
      console.warn('⚠️ No radio image provided');
      return;
    }

    // แปลง base64 เป็น image
    const imageBytes = safeBase64Decode(radioImageBase64);
    
    // ตรวจสอบประเภทของ image และ embed
    let image;
    if (radioImageBase64.startsWith('/9j/') || radioImageBase64.includes('jpeg')) {
      image = await pdfDoc.embedJpg(imageBytes);
    } else {
      image = await pdfDoc.embedPng(imageBytes);
    }

    // คำนวณตำแหน่งและขนาดที่ถูกต้อง
    // ใช้ width และ height ที่ได้รับมา แทนการคำนวณจาก coordinates
    const finalWidth = width * ratio;
    const finalHeight = height * ratio;
    
    // คำนวณตำแหน่ง X จาก llx (left position)
    const page_x = llx * pageWidth;
    
    // คำนวณตำแหน่ง Y จาก ury (top position) - PDF มี origin ที่ bottom-left
    const page_y = pageHeight - (ury * pageHeight);

    // วาด radio button
    page.drawImage(image, {
      x: page_x,
      y: page_y,
      width: finalWidth,
      height: finalHeight
    });

  } catch (error) {
    console.log(`❌ Error stamping radio button: ${error}`);
    throw error;
  }
}



/**
 * Stamp หลาย items บน PDF
 */
export async function stampItemsOnPdf(
  pdfBytes: Uint8Array,
  stampItems: any
): Promise<Uint8Array> {
  try {
    // โหลด PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    // จัดกลุ่ม stamp items ตาม page number
    const itemsByPage = new Map<number, any[]>();
    stampItems.mappingText.forEach((item: any) => {
      const pageNum = item.pageNumber - 1; // แปลงเป็น 0-based index
      if (!itemsByPage.has(pageNum)) {
        itemsByPage.set(pageNum, []);
      }
      itemsByPage.get(pageNum)!.push(item);
    });
    stampItems.mappingSignature.forEach((item: any) => {
      const pageNum = item.pageNumber - 1; // แปลงเป็น 0-based index
      if (!itemsByPage.has(pageNum)) {
        itemsByPage.set(pageNum, []);
      }
      itemsByPage.get(pageNum)!.push(item);
    });
    // Include checkbox items if provided
    if (Array.isArray(stampItems.mappingCheckbox)) {
      stampItems.mappingCheckbox.forEach((item: any) => {
        const pageNum = (item.pageNumber || 1) - 1;
        if (!itemsByPage.has(pageNum)) {
          itemsByPage.set(pageNum, []);
        }
        itemsByPage.get(pageNum)!.push(item);
      });
    }
    
    // Include radio items if provided
    if (Array.isArray(stampItems.mappingRadio)) {
      stampItems.mappingRadio.forEach((item: any) => {
        const pageNum = (item.pageNumber || 1) - 1;
        if (!itemsByPage.has(pageNum)) {
          itemsByPage.set(pageNum, []);
        }
        itemsByPage.get(pageNum)!.push(item);
      });
    }

    // 🎯 FIXED: Include date items if provided - handle nested structure
    if (Array.isArray(stampItems.mappingDate)) {
      stampItems.mappingDate.forEach((dateGroup: any) => {
        if (Array.isArray(dateGroup.date_elements)) {
          dateGroup.date_elements.forEach((dateElement: any) => {
            const pageNum = (dateElement.pageNumber || 1) - 1;
            if (!itemsByPage.has(pageNum)) {
              itemsByPage.set(pageNum, []);
            }
            // 🎯 FIXED: Add date group metadata to each date element
            const dateElementWithGroup = {
              ...dateElement,
              date_group_header: dateGroup.header,
              date_group_format: dateGroup.format,
              date_group_timestamp: dateGroup.date_group_timestamp,
              date_group_index: dateGroup.date_group_index,
              date_group_size: dateGroup.date_group_size,
              is_complete_group: dateGroup.is_complete_group
            };
            itemsByPage.get(pageNum)!.push(dateElementWithGroup);
          });
        }
      });
    }

    // Stamp แต่ละ page
    for (const [pageIndex, items] of Array.from(itemsByPage.entries())) {
      if (pageIndex >= pages.length) {
        console.warn(`⚠️ Page ${pageIndex + 1} not found in PDF, skipping items`);
        continue;
      }

      const page = pages[pageIndex];
      const { width: pageWidth, height: pageHeight } = page.getSize();
      
      // Stamp แต่ละ item ในหน้านี้
      for (const item of items) {        
        // 🎯 FIXED: ปรับการคำนวณ X, Y coordinate ให้เหมาะสมกับ multi-page view
        const x = parseInt(item.scale_X.toString()) || 0;
        const baseY = parseInt(item.scale_Y.toString()) || 0;
        
        // กำหนดขนาด default ตามประเภทของ element
        let defaultWidth, defaultHeight;
        if (item.type === 'checkbox' || item.type === 'radio') {
          defaultWidth = 20;
          defaultHeight = 20;
        } else if (item.type === 'signature') {
          defaultWidth = 200;
          defaultHeight = 50;
        } else {
          defaultWidth = 200;
          defaultHeight = 24;
        }
        
        const elementHeight = parseInt(item.height) || defaultHeight;
        const y = pageHeight - (baseY + elementHeight); // ปรับ offset ตามขนาดของ element
        const width = parseInt(item.width) || defaultWidth;
        const height = parseInt(item.height) || defaultHeight;
        // ตรวจสอบประเภทของ item และสร้าง options
        if (item.type === "text") {
          // นี่คือ text item
          await stampTextOnPage(
            page,
            {
              text: item.value || item.text || '',
              x: x,
              y: y,
              fontSize: parseInt(item.font_size) || 12,
              color: parseColorToRgb(item.fill || '#000000'),
              maxWidth: parseInt(item.width) || 200,
              max_characters: parseInt(item.max_characters) || 0,
              fontFamily: item.font_family,
              font_weight: item.font_weight,
              font_style: item.font_style,
              text_align: item.text_align,
              text_decoration: item.text_decoration,
              justify_content: item.justify_content,
              underline: item.underline === 'true' || item.underline === true,
              fill: item.fill,
              background_color: item.background_color,
              border_color: item.border_color,
              border_width: parseInt(item.border_width) || 0,
              border_style: item.border_style,
              border_radius: parseInt(item.border_radius) || 0,
              padding: parseInt(item.padding) || 0,
              margin: parseInt(item.margin) || 0
            },
            pdfDoc
          );
        } else if (item.type === "signature") {
          // นี่คือ signature item
          await stampSignatureOnPage(
            page,
            {
              signatureImageBase64: item.image_base64 || item.signatureImageBase64,
              x: x,
              y: y,
              width: width,
              height: height
            },
            pdfDoc
          );
        } else if (item.type === "checkbox") {
          const Ract = document.getElementById(`checkbox-${item.index}`)
          const rect = Ract?.getBoundingClientRect()  
          await stampCheckboxOnPage(
            page,
            {
              llx: item.llx,
              lly: item.lly,
              urx: item.urx,
              ury: item.ury,
              checkboxImageBase64: item.image_base64 || item.checkboxImageBase64,
              x,
              y,
              width,
              height:rect?.height,
              pageWidth,
              pageHeight,
              ratio: item.ratio || 1, // เพิ่ม ratio parameter
            },
            pdfDoc
          );
        } else if (item.type === "radio") {
          const Ract = document.getElementById(`radio-${item.index}`)
          const rect = Ract?.getBoundingClientRect()  
          await stampRadioOnPage(
            page,
            {
              radioImageBase64: item.image_base64 || item.radioImageBase64,
              x,
              y,
              width,
              height:rect?.height,
              llx: item.llx,
              lly: item.lly,
              urx: item.urx,
              ury: item.ury,
              pageWidth,
              pageHeight,
              ratio: item.ratio || 1, // เพิ่ม ratio parameter
            },
            pdfDoc
          );
        } else if (item.type === "days" || item.type === "months" || item.type === "years") {
          // 🎯 FIXED: Handle date elements with proper value processing
          let displayValue = item.value || item.text || '';
          
          // 🎯 NEW: Process date value based on date type and format
          if (item.value && item.date_group_format) {
            try {
              // Parse the date value and format it according to the group format
              const dateValue = new Date(item.value);
              if (!isNaN(dateValue.getTime())) {
                switch (item.date_group_format) {
                  case 'THBC':
                  case 'THsBC':
                    // Thai Buddhist Calendar format
                    if (item.type === 'days') {
                      displayValue = dateValue.getDate().toString();
                    } else if (item.type === 'months') {
                      displayValue = (dateValue.getMonth() + 1).toString();
                    } else if (item.type === 'years') {
                      displayValue = (dateValue.getFullYear() + 543).toString(); // Convert to Buddhist Era
                    }
                    break;
                  case 'EU':
                  case 'EUs':
                    // European format
                    if (item.type === 'days') {
                      displayValue = dateValue.getDate().toString();
                    } else if (item.type === 'months') {
                      displayValue = (dateValue.getMonth() + 1).toString();
                    } else if (item.type === 'years') {
                      displayValue = dateValue.getFullYear().toString();
                    }
                    break;
                  case 'US':
                  case 'USs':
                    // US format
                    if (item.type === 'days') {
                      displayValue = dateValue.getDate().toString();
                    } else if (item.type === 'months') {
                      displayValue = (dateValue.getMonth() + 1).toString();
                    } else if (item.type === 'years') {
                      displayValue = dateValue.getFullYear().toString();
                    }
                    break;
                  default:
                    // Default to original value
                    displayValue = item.value;
                }
              }
            } catch (error) {
              console.warn('⚠️ Error processing date value:', error);
              displayValue = item.value || item.text || '';
            }
          }

          // 🎯 FIXED: Use stampTextOnPage for better date handling
          await stampTextOnPage(
            page,
            {
              text: displayValue,
              x: x,
              y: y,
              fontSize: parseInt(item.font_size) || 12,
              color: parseColorToRgb(item.fill || '#000000'),
              maxWidth: parseInt(item.width) || 200,
              max_characters: parseInt(item.max_characters) || 0,
              fontFamily: item.font_family,
              font_weight: item.font_weight,
              font_style: item.font_style,
              text_align: item.text_align,
              text_decoration: item.text_decoration,
              justify_content: item.justify_content,
              underline: item.underline === 'true' || item.underline === true,
              fill: item.fill,
              background_color: item.background_color,
              border_color: item.border_color,
              border_width: parseInt(item.border_width) || 0,
              border_style: item.border_style,
              border_radius: parseInt(item.border_radius) || 0,
              padding: parseInt(item.padding) || 0,
              margin: parseInt(item.margin) || 0
            },
            pdfDoc
          );
        }
      }
    }

    // บันทึก PDF
    const stampedPdfBytes = await pdfDoc.save();
    return stampedPdfBytes;
  } catch (error) {
    console.error('❌ Error in PDF stamping process:', error);
    throw error;
  }
}

/**
 * สร้าง stamp items จาก form data
 */
export function createStampItemsFromFormData(
  mappingSignature: any[],
  mappingText: any[],
  mappingDate?: any[] // 🎯 NEW: เพิ่ม mappingDate parameter
): StampItem[] {
  const stampItems: StampItem[] = [];

  // เพิ่ม signature items
  mappingSignature.forEach(sig => {
    if (sig.value) { // มีลายเซ็น
      stampItems.push({
        type: 'signature',
        pageNumber: sig.pageNumber || 1,
          llx: parseFloat(sig.llx),
          lly: parseFloat(sig.lly),
          urx: parseFloat(sig.urx),
          ury: parseFloat(sig.ury),
        signatureOptions: {
          signatureImageBase64: sig.value,
          x: 0, // จะถูกคำนวณใหม่ใน stampItemsOnPdf
          y: 0,
          width: parseInt(sig.width) || 100,
          height: parseInt(sig.height) || 50
        }
      });
    }
  });

  // เพิ่ม text items
  mappingText.forEach(text => {
    if (text.value) { // มีข้อความ
      stampItems.push({
        type: 'text',
        pageNumber: text.pageNumber || 1,
          llx: parseFloat(text.llx),
          lly: parseFloat(text.lly),
          urx: parseFloat(text.urx),
          ury: parseFloat(text.ury),
        textOptions: {
          text: text.value,
          x: 0, // จะถูกคำนวณใหม่ใน stampItemsOnPdf
          y: 0,
          fontSize: parseInt(text.font_size) || 12,
          color: parseColorToRgb(text.fill || '#000000'),
          maxWidth: parseInt(text.width) || 200,
          max_characters: parseInt(text.max_characters) || 0,
          fontFamily: text.font_family,
          font_weight: text.font_weight,
          font_style: text.font_style,
          text_align: text.text_align,
          text_decoration: text.text_decoration,
          justify_content: text.justify_content,
          underline: text.underline === 'true' || text.underline === true,
          fill: text.fill,
          background_color: text.background_color,
          border_color: text.border_color,
          border_width: parseInt(text.border_width) || 0,
          border_style: text.border_style,
          border_radius: parseInt(text.border_radius) || 0,
          padding: parseInt(text.padding) || 0,
          margin: parseInt(text.margin) || 0
        }
      });
    }
  });

  // 🎯 FIXED: เพิ่ม date items - handle nested structure properly
  if (mappingDate && Array.isArray(mappingDate)) {
    mappingDate.forEach((dateGroup: any) => {
      if (Array.isArray(dateGroup.date_elements)) {
        dateGroup.date_elements.forEach((dateElement: any) => {
          // 🎯 FIXED: Include date elements even if value is empty (for stamping)
          stampItems.push({
            type: dateElement.date_type as 'days' | 'months' | 'years',
            pageNumber: dateElement.pageNumber || 1,
            llx: parseFloat(dateElement.llx || "0"),
            lly: parseFloat(dateElement.lly || "0"),
            urx: parseFloat(dateElement.urx || "0"),
            ury: parseFloat(dateElement.ury || "0"),
            // 🎯 NEW: Add date group metadata
            date_group_header: dateGroup.header,
            date_group_format: dateGroup.format,
            date_group_timestamp: dateGroup.date_group_timestamp,
            date_group_index: dateGroup.date_group_index,
            date_group_size: dateGroup.date_group_size,
            is_complete_group: dateGroup.is_complete_group,
            textOptions: {
              text: dateElement.value || dateElement.text || '',
              x: 0, // จะถูกคำนวณใหม่ใน stampItemsOnPdf
              y: 0,
              fontSize: parseInt(dateElement.font_size) || 12,
              color: parseColorToRgb(dateElement.fill || '#000000'),
              maxWidth: parseInt(dateElement.width) || 200,
              max_characters: parseInt(dateElement.max_characters) || 0,
              fontFamily: dateElement.font_family,
              font_weight: dateElement.font_weight,
              font_style: dateElement.font_style,
              text_align: dateElement.text_align,
              text_decoration: dateElement.text_decoration,
              justify_content: dateElement.justify_content,
              underline: dateElement.underline === 'true' || dateElement.underline === true,
              fill: dateElement.fill,
              background_color: dateElement.background_color,
              border_color: dateElement.border_color,
              border_width: parseInt(dateElement.border_width) || 0,
              border_style: dateElement.border_style,
              border_radius: parseInt(dateElement.border_radius) || 0,
              padding: parseInt(dateElement.padding) || 0,
              margin: parseInt(dateElement.margin) || 0
            }
          });
        });
      }
    });
  }

  return stampItems;
}

/**
 * แปลง hex color เป็น RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0, g: 0, b: 0 };
}

/**
 * แปลง color string (hex, rgb, rgba) เป็น RGB object พร้อม opacity
 */
function parseColorWithOpacity(colorString: string): { r: number; g: number; b: number; opacity: number } {
  if (!colorString) return { r: 0, g: 0, b: 0, opacity: 1 };
  
  // ลบช่องว่างออก
  const cleanColor = colorString.trim();
  
  // ตรวจสอบ rgba format
  const rgbaMatch = cleanColor.match(/rgba?\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),?\s*(\d*(?:\.\d+)?)\)/);
  if (rgbaMatch) {
    return {
      r: parseFloat(rgbaMatch[1]) / 255,
      g: parseFloat(rgbaMatch[2]) / 255,
      b: parseFloat(rgbaMatch[3]) / 255,
      opacity: rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1
    };
  }
  
  // ตรวจสอบ hex format
  if (cleanColor.startsWith('#') || /^[0-9a-fA-F]{6}$/.test(cleanColor)) {
    const hexColor = hexToRgb(cleanColor);
    return {
      r: hexColor.r,
      g: hexColor.g,
      b: hexColor.b,
      opacity: 1
    };
  }
  
  // ถ้าไม่ตรงรูปแบบไหน ให้ return สีดำ
  console.warn(`⚠️ Unable to parse color: ${colorString}, using black`);
  return { r: 0, g: 0, b: 0, opacity: 1 };
}

/**
 * แปลง color string (hex, rgb, rgba) เป็น RGB object (เก็บไว้เพื่อ backward compatibility)
 */
function parseColorToRgb(colorString: string): { r: number; g: number; b: number } {
  const colorWithOpacity = parseColorWithOpacity(colorString);
  return {
    r: colorWithOpacity.r,
    g: colorWithOpacity.g,
    b: colorWithOpacity.b
  };
}

/**
 * ดาวน์โหลด PDF ที่ stamp แล้ว
 */
export function downloadStampedPdf(pdfBytes: Uint8Array, filename: string = 'stamped-document.pdf'): void {
  const blob =  new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" })
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * แสดง PDF ที่ stamp แล้วในหน้าต่างใหม่
 */
export function previewStampedPdf(pdfBytes: Uint8Array): void {
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" })
  const url = URL.createObjectURL(blob);
  
  window.open(url, '_blank');
} 