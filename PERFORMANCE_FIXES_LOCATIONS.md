# 📍 ตำแหน่งที่ต้องแก้ไข Performance Issues

## 🔴 1. Console.log/warn/info (Priority: HIGH)

### components/mappingComponents/FormUtils/dimensionUtils.ts
- **บรรทัด 229**: `console.warn(\`Element with id ${elementId} not found\`);`
- **บรรทัด 236**: `console.warn('PDF pages container not found');`
- **บรรทัด 243**: `console.warn('No PDF pages found');`
- **บรรทัด 291**: `console.warn('Could not determine page for element');`
- **บรรทัด 343**: `console.warn('PDF.js library not loaded');`
- **บรรทัด 409**: `console.warn(\`PDF page container not found for element ${id}\`);`
- **บรรทัด 422**: `console.warn(\`Element with id ${id} not found in DOM yet...\`);`
- **บรรทัด 527**: `console.warn("⚠️ Issues found:", issues);`
- **บรรทัด 550**: `console.warn("⚠️ Significant differences detected (>0.01)");`
- **บรรทัด 613**: `console.warn("Missing elements for dimension calculation");`
- **บรรทัด 664**: `console.warn(\`Cannot find page element for page ${pageNumber}\`);`
- **บรรทัด 672**: `console.warn(\`Cannot find PDF page element for page ${pageNumber}\`);`
- **บรรทัด 702**: `console.warn(\`Cannot find page element for page ${pageNumber}\`);`
- **บรรทัด 710**: `console.warn(\`Cannot find PDF page element for page ${pageNumber}\`);`
- **บรรทัด 935**: `console.warn("No PDF element provided for dimension calculation");`

### components/mappingComponents/FormComponents/FormCanvas.stable.tsx
- **บรรทัด 444**: `// console.log('actorId', actorId, step_index, id)` (commented แต่ควรลบ)
- **บรรทัด 788-791**: `console.warn(\`[FormCanvas] Error calculating coordinates...\`);`
- **บรรทัด 1019**: `console.log('isGuest =>',isGuest)`
- **บรรทัด 1023**: `// console.log('fetch signature data')` (commented แต่ควรลบ)
- **บรรทัด 1097**: `console.log('fetch stamp data 222222222')`

### components/mappingComponents/FormComponents/FormB2BDocument/FormB2B.tsx
- **บรรทัด 205**: `// console.log('currentPath =>',currentPath)` (commented - ลบ)
- **บรรทัด 235**: `// console.log("currpath => ");` (commented - ลบ)
- **บรรทัด 263-264**: `// console.log("isAddUserList =>", ...)` (commented - ลบ)
- **บรรทัด 339**: `// console.log('payment =>',payment)` (commented - ลบ)
- **บรรทัด 353-355**: `// console.log('checkValidateFormB2B => ')` (commented - ลบ)
- **บรรทัด 419**: `// console.log('userProfile ==>',userProfile)` (commented - ลบ)
- **บรรทัด 426**: `// console.log('autdData =>',authData)` (commented - ลบ)
- **บรรทัด 466**: `// console.log('currentValuesAfter => ',currentValuesAfter)` (commented - ลบ)
- **บรรทัด 491**: `// console.log("form =>", form.getFieldsValue());` (commented - ลบ)
- **บรรทัด 530**: `// console.log('get user data =>',data)` (commented - ลบ)
- **บรรทัด 535**: `// console.log("res =>", response);` (commented - ลบ)
- **บรรทัด 538**: `console.log('🎯[FormB2B] Error B2BSearchByEmailOrName')` ⚠️ **ต้องแก้ไข**
- **บรรทัด 711-718**: `// console.log(...)` (commented - ลบ)
- **บรรทัด 749**: `// console.log(\`selected ${value}\`);` (commented - ลบ)
- **บรรทัด 759-762**: `// console.log(...)` (commented - ลบ)
- **บรรทัด 802**: `// console.log('query =>',query)` (commented - ลบ)
- **บรรทัด 829-832**: `// console.log(...)` (commented - ลบ)

---

## 🟡 2. Lodash Imports (Priority: HIGH)

### components/mappingComponents/FormComponents/FormB2BDocument/FormB2B.tsx
- **บรรทัด 37**: `import { debounce } from "lodash";`
  - **แก้เป็น**: `import debounce from "lodash/debounce";`

### components/mappingComponents/FormComponents/StylePanel.tsx
- **บรรทัด 5**: `import { debounce } from "lodash";`
  - **แก้เป็น**: `import debounce from "lodash/debounce";`

### components/mappingComponents/FormComponents/FormB2BDocument/FormB2C.tsx
- **บรรทัด 30**: `import { debounce } from "lodash";`
  - **แก้เป็น**: `import debounce from "lodash/debounce";`

### store/frontendStore/userProfile.ts
- **บรรทัด 9**: `import { divide } from "lodash";`
  - **แก้เป็น**: `import divide from "lodash/divide";`

### app/stamp/form/type/[id]/page.tsx
- **บรรทัด 15**: `import List from "lodash/List";` (หรือ `import { List } from "lodash";`)
  - **แก้เป็น**: **ลบ import ออก** - `List` ไม่ได้ถูกใช้ในไฟล์ และ lodash ไม่มี function `List`
  - **สถานะ**: ✅ แก้ไขแล้ว - ลบ unused import ออกแล้ว

---

## 🟠 3. DOM Queries ที่ต้อง Optimize (Priority: MEDIUM)

### components/mappingComponents/FormUtils/dimensionUtils.ts

#### calculatePdfCoordinatesOld (บรรทัด 166-214)
- **บรรทัด 170**: `document.querySelector(".react-pdf__Document")`
- **บรรทัด 175**: `document.getElementById(id)`

#### calculatePdfCoordinatesForMultiPage (บรรทัด 220-323)
- **บรรทัด 227**: `document.getElementById(elementId)` ⚠️ **เรียกบ่อยมาก**
- **บรรทัด 234**: `document.querySelector('.react-pdf__Document')` ⚠️ **เรียกบ่อยมาก**
- **บรรทัด 241**: `document.querySelectorAll('.react-pdf__Page')` ⚠️ **เรียกบ่อยมาก**

**วิธีแก้ไข:**
```typescript
// ใช้ ref หรือ memoize
const pdfContainerRef = useRef<HTMLElement | null>(null);
const pdfPagesRef = useRef<NodeListOf<Element> | null>(null);

useEffect(() => {
  pdfContainerRef.current = document.querySelector('.react-pdf__Document');
  pdfPagesRef.current = document.querySelectorAll('.react-pdf__Page');
}, []);
```

#### calculatePdfCoordinates (บรรทัด 397-475)
- **บรรทัด 406**: `document.querySelector(".react-pdf__Document")`
- **บรรทัด 418**: `document.getElementById(id)`

#### debugPdfCoordinates (บรรทัด 480-526)
- **บรรทัด 487**: `document.querySelector('.react-pdf__Page')`
- **บรรทัด 488**: `document.getElementById(id)`

#### calculateCenterPositionForPage (บรรทัด 624-655)
- **บรรทัด 661**: `document.querySelector(\`[data-page-number="${pageNumber}"]\`)`
- **บรรทัด 637**: `currentPageElement.querySelector('.react-pdf__Page')`

#### calculateAbsoluteCenterPositionForPage (บรรทัด 661-693)
- **บรรทัด 699**: `document.querySelector(\`[data-page-number="${pageNumber}"]\`)`
- **บรรทัด 675**: `currentPageElement.querySelector('.react-pdf__Page')`

### components/mappingComponents/PDFViewer.tsx
- **บรรทัด 54**: `document.querySelector(".react-pdf__Page")`

### components/mappingComponents/FormUtils/pdfFormManager.ts
- **บรรทัด 271**: `document.querySelector(".react-pdf__Document")`
- **บรรทัด 272**: `document.querySelector(".react-pdf__Page")`

### components/mappingComponents/FormUtils/pdfStampUtils.ts
- **บรรทัด 817**: `document.getElementById(\`checkbox-${item.index}\`)`
- **บรรทัด 838**: `document.getElementById(\`radio-${item.index}\`)`

### components/ui/textEditor.tsx
- **บรรทัด 19**: `document.querySelectorAll(".ql-toolbar")`
- **บรรทัด 40**: `document.getElementsByClassName("ql-attachment")`

---

## 🔵 4. Large Components ที่ต้องแยก (Priority: MEDIUM)

### components/mappingComponents/PDFTemplate.tsx
- **ขนาด**: 1984 lines
- **ควรแยกเป็น**:
  - `PDFTemplate.tsx` (main component)
  - `PDFTemplateHeader.tsx`
  - `PDFTemplateSidebar.tsx`
  - `PDFTemplateCanvas.tsx`
  - `PDFTemplateModals.tsx`

### components/mappingComponents/FormComponents/FormElementConfig.tsx
- **ขนาด**: 3150 lines ⚠️ **ใหญ่มาก**
- **ควรแยกเป็น**:
  - `FormElementConfig.tsx` (main)
  - `FormElementConfigText.tsx`
  - `FormElementConfigCheckbox.tsx`
  - `FormElementConfigRadio.tsx`
  - `FormElementConfigDate.tsx`
  - `FormElementConfigSignature.tsx`
  - `FormElementConfigMoreFile.tsx`

### components/mappingComponents/FormComponents/FormB2BDocument/FormB2B.tsx
- **ขนาด**: 2061 lines
- **ควรแยกเป็น**:
  - `FormB2B.tsx` (main)
  - `FormB2BHeader.tsx`
  - `FormB2BApprovers.tsx`
  - `FormB2BContractParty.tsx`
  - `FormB2BValidation.tsx`

---

## 🟣 5. useEffect ที่อาจมีปัญหา (Priority: MEDIUM)

### components/mappingComponents/FormComponents/FormElementConfig.tsx
- **บรรทัด 280-399**: useEffect ที่มี dependencies หลายตัว อาจทำให้ re-render บ่อย
- **บรรทัด 415-447**: useEffect สำหรับ moreFileConfigs initialization

### components/mappingComponents/SettingDocument.tsx
- **บรรทัด 263-272**: useEffect ที่อาจทำให้ infinite loop
- **บรรทัด 275-290**: useEffect สำหรับ form data initialization
- **บรรทัด 293-316**: useEffect สำหรับ initial data sending
- **บรรทัด 319-334**: useEffect ที่ใช้ setTimeout เพื่อหลีกเลี่ยง infinite loop

### components/layout/Header.tsx
- **บรรทัด 315-327**: useEffect สำหรับ user profile (อาจ fetch ซ้ำ)
- **บรรทัด 330-332**: useEffect ที่ไม่มี dependencies
- **บรรทัด 334-336**: useEffect สำหรับ disableCreateDoc
- **บรรทัด 338-342**: useEffect สำหรับ localStorage
- **บรรทัด 344-346**: useEffect สำหรับ business selection
- **บรรทัด 349-352**: useEffect สำหรับ display name
- **บรรทัด 354-356**: useEffect สำหรับ guest display name
- **บรรทัด 358-360**: useEffect สำหรับ reset display name
- **บรรทัด 362-366**: useEffect สำหรับ error modal

---

## 🟢 6. Missing Memoization (Priority: LOW)

### components/mappingComponents/FormComponents/FormCanvas.stable.tsx
- **บรรทัด 1138-1184**: `memoizedSignatureCanvas` - ใช้ useMemo แล้ว ✅
- **บรรทัด 1199-1253**: `consolidatedStyles` - ใช้ useMemo แล้ว ✅
- **ควรเพิ่ม**: React.memo() สำหรับ DroppedElement component

### components/mappingComponents/FormUtils/elementDndUtils.tsx
- **บรรทัด 175-695**: `handleElementClick` - ใช้ useCallback แล้ว ✅
- **บรรทัด 697-895**: `handleDragEnd` - ใช้ useCallback แล้ว ✅
- **ควรตรวจสอบ**: dependencies ของ useCallback ว่าครบหรือไม่

---

## 📋 สรุปลำดับการแก้ไข

### Phase 1: Quick Wins (ทำก่อน)
1. ✅ **Console.log** - ใช้ script `npm run perf:remove-logs`
2. ✅ **Lodash imports** - ใช้ script `npm run perf:fix-lodash` หรือแก้ด้วยมือตามรายการด้านบน

### Phase 2: Medium Priority
3. ✅ **DOM Queries** - แก้ไขตามไฟล์และบรรทัดที่ระบุ
4. ✅ **useEffect issues** - ตรวจสอบและแก้ไข dependencies

### Phase 3: Long-term
5. ✅ **Large Components** - แยก components ตามที่ระบุ
6. ✅ **Memoization** - เพิ่ม React.memo, useMemo, useCallback

---

## 🛠️ วิธีใช้ Scripts

```bash
# ลบ console.log ทั้งหมด
npm run perf:remove-logs

# แก้ไข lodash imports
npm run perf:fix-lodash

# วิเคราะห์ bundle size
npm run perf:analyze
```

---

## ⚠️ หมายเหตุ

- **Console.log ที่ commented** - ควรลบทิ้งเพื่อลด bundle size
- **DOM Queries ใน dimensionUtils.ts** - เรียกบ่อยมากระหว่าง drag ควร optimize มากที่สุด
- **Large Components** - ควรแยกทีละส่วนและ test หลังแยก

