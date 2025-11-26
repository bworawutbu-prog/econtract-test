# 📊 Performance Analysis Report - e-contract-v4

> 📍 **ดูตำแหน่งที่ต้องแก้ไขแบบละเอียด**: [PERFORMANCE_FIXES_LOCATIONS.md](./PERFORMANCE_FIXES_LOCATIONS.md)

## 🔴 ปัญหาหลักที่พบ (Critical Issues)

### 1. **Console.log จำนวนมาก (256 matches ใน 34 files)**
**ผลกระทบ:** ทำให้ production ช้า, เพิ่ม bundle size, เปิดเผยข้อมูล sensitive

**ไฟล์ที่มีปัญหา:**
- `components/mappingComponents/FormUtils/dimensionUtils.ts` (21 matches)
- `components/mappingComponents/PDFTemplate.tsx` (17 matches)
- `components/mappingComponents/FormComponents/FormB2BDocument/FormB2B.tsx` (45 matches)
- `components/layout/Header.tsx` (15 matches)
- และอีก 30+ ไฟล์

**วิธีแก้ไข:**
```typescript
// ❌ ผิด
console.log('debug data', data);

// ✅ ถูก
if (process.env.NODE_ENV === 'development') {
  console.log('debug data', data);
}

// หรือใช้ utility function
const debugLog = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};
```

---

### 2. **Lodash Import ทั้งตัว (Tree-shaking ไม่ทำงาน)**
**ผลกระทบ:** เพิ่ม bundle size ~70KB+ โดยไม่จำเป็น

**ไฟล์ที่มีปัญหา:**
- `components/mappingComponents/FormComponents/FormB2BDocument/FormB2B.tsx`
- `components/mappingComponents/FormComponents/StylePanel.tsx`
- `components/mappingComponents/FormComponents/FormB2BDocument/FormB2C.tsx`
- `app/stamp/form/type/[id]/page.tsx`

**วิธีแก้ไข:**
```typescript
// ❌ ผิด
import { debounce } from "lodash";

// ✅ ถูก
import debounce from "lodash/debounce";
// หรือ
import { debounce } from "lodash-es";
```

---

### 3. **DOM Queries จำนวนมาก (21 matches)**
**ผลกระทบ:** ทำให้ render ช้า, blocking main thread

**ไฟล์ที่มีปัญหา:**
- `components/mappingComponents/FormUtils/dimensionUtils.ts` (12 matches)
- `components/mappingComponents/PDFViewer.tsx`
- `components/mappingComponents/FormUtils/pdfStampUtils.ts`

**วิธีแก้ไข:**
```typescript
// ❌ ผิด - query ทุกครั้งที่ render
const element = document.getElementById(id);

// ✅ ถูก - ใช้ ref หรือ memoize
const elementRef = useRef<HTMLElement | null>(null);
useEffect(() => {
  elementRef.current = document.getElementById(id);
}, [id]);

// หรือใช้ useMemo
const element = useMemo(() => {
  return document.getElementById(id);
}, [id]);
```

---

### 4. **Components ขนาดใหญ่ (Large Components)**
**ผลกระทบ:** Bundle size ใหญ่, initial load ช้า, re-render ช้า

**ไฟล์ที่มีปัญหา:**
- `components/mappingComponents/PDFTemplate.tsx` (1984 lines)
- `components/mappingComponents/FormComponents/FormElementConfig.tsx` (3150 lines)
- `components/mappingComponents/FormComponents/FormB2BDocument/FormB2B.tsx` (2061 lines)

**วิธีแก้ไข:**
- แยก components ออกเป็น smaller components
- ใช้ React.memo() สำหรับ components ที่ไม่ต้อง re-render บ่อย
- ใช้ dynamic import สำหรับ components ที่ไม่จำเป็นต้องโหลดทันที

---

### 5. **Heavy Libraries ไม่ได้ Code Split**
**ผลกระทบ:** Initial bundle size ใหญ่, โหลดช้า

**Libraries ที่หนัก:**
- `react-pdf` (~500KB)
- `fabric` (~200KB)
- `jspdf` (~150KB)
- `pdf-lib` (~100KB)

**วิธีแก้ไข:**
```typescript
// ❌ ผิด - import ทันที
import { Document, Page } from "react-pdf";

// ✅ ถูก - dynamic import
const PDFViewer = dynamic(
  () => import("@/components/mappingComponents/PDFViewer"),
  {
    loading: () => <Skeleton active />,
    ssr: false,
  }
);
```

---

### 6. **useEffect ที่อาจทำให้ Infinite Loop**
**ผลกระทบ:** Re-render วนลูป, CPU usage สูง

**ไฟล์ที่มีปัญหา:**
- `components/mappingComponents/FormComponents/FormElementConfig.tsx`
- `components/mappingComponents/SettingDocument.tsx`
- `components/layout/Header.tsx`

**วิธีแก้ไข:**
```typescript
// ❌ ผิด - dependency ที่เปลี่ยนทุกครั้ง
useEffect(() => {
  onFormDataChange(formData);
}, [formData, onFormDataChange]); // onFormDataChange เปลี่ยนทุก render

// ✅ ถูก - ใช้ useCallback หรือ ref
const formDataRef = useRef(formData);
formDataRef.current = formData;

useEffect(() => {
  onFormDataChange(formDataRef.current);
}, [formData]); // เอา callback ออก
```

---

### 7. **Missing Memoization**
**ผลกระทบ:** Re-render โดยไม่จำเป็น, performance ต่ำ

**วิธีแก้ไข:**
```typescript
// ✅ ใช้ useMemo สำหรับ expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// ✅ ใช้ useCallback สำหรับ functions ที่ส่งเป็น props
const handleClick = useCallback(() => {
  // ...
}, [dependencies]);

// ✅ ใช้ React.memo สำหรับ components
const MyComponent = React.memo(({ prop1, prop2 }) => {
  // ...
});
```

---

### 8. **Images ไม่ได้ Optimize**
**ผลกระทบ:** โหลดช้า, ใช้ bandwidth มาก

**วิธีแก้ไข:**
```typescript
// ❌ ผิด
<img src="/image.jpg" />

// ✅ ถูก - ใช้ Next.js Image
import Image from "next/image";
<Image src="/image.jpg" width={500} height={300} alt="description" />
```

---

## 🟡 ปัญหารอง (Medium Priority)

### 9. **Redux State Management ไม่ได้ Optimize**
- ใช้ `useSelector` โดยไม่ memoize
- State updates ที่ไม่จำเป็น

**วิธีแก้ไข:**
```typescript
// ❌ ผิด
const data = useSelector(state => state.data.items);

// ✅ ถูก - ใช้ shallowEqual
import { shallowEqual } from 'react-redux';
const data = useSelector(state => state.data.items, shallowEqual);
```

---

### 10. **Missing Suspense Boundaries**
**ผลกระทบ:** User experience ไม่ดี, loading state ไม่ชัดเจน

**วิธีแก้ไข:**
```typescript
<Suspense fallback={<Skeleton active />}>
  <HeavyComponent />
</Suspense>
```

---

## 🟢 ปัญหาน้อย (Low Priority)

### 11. **CSS-in-JS Performance**
- `styled-components` อาจทำให้ช้าในบางกรณี
- ใช้ Tailwind CSS แทนถ้าเป็นไปได้

---

## 📋 Action Plan (ลำดับความสำคัญ)

### Phase 1: Quick Wins (1-2 วัน)
1. ✅ ลบ console.log ทั้งหมด (ใช้ script หรือ find/replace)
2. ✅ แก้ไข lodash imports
3. ✅ เพิ่ม dynamic import สำหรับ heavy components

### Phase 2: Medium Priority (3-5 วัน)
4. ✅ แก้ไข DOM queries ให้ใช้ ref/memoize
5. ✅ แยก large components
6. ✅ แก้ไข useEffect infinite loops

### Phase 3: Long-term (1-2 สัปดาห์)
7. ✅ เพิ่ม memoization ทั้งหมด
8. ✅ Optimize Redux selectors
9. ✅ เพิ่ม Suspense boundaries
10. ✅ Code split heavy libraries

---

## 🛠️ Tools สำหรับตรวจสอบ

1. **Bundle Analyzer:**
```bash
ANALYZE=true npm run build
```

2. **Lighthouse:**
```bash
npm install -g lighthouse
lighthouse http://localhost:3000
```

3. **React DevTools Profiler:**
- ใช้ Profiler tab ใน React DevTools

4. **Next.js Bundle Analyzer:**
```bash
npm install @next/bundle-analyzer
```

---

## 📊 Metrics ที่ควรติดตาม

1. **First Contentful Paint (FCP)** - ควร < 1.8s
2. **Largest Contentful Paint (LCP)** - ควร < 2.5s
3. **Time to Interactive (TTI)** - ควร < 3.8s
4. **Total Blocking Time (TBT)** - ควร < 200ms
5. **Cumulative Layout Shift (CLS)** - ควร < 0.1
6. **Bundle Size** - ควร < 244KB per chunk

---

## 📝 Notes

- ทุกการแก้ไขควรทำทีละส่วนและ test หลังแก้ไข
- ใช้ Git branches สำหรับแต่ละ phase
- Monitor performance metrics หลัง deploy

