# 📊 รายงานการวิเคราะห์ Cache ในโปรเจค e-contract-v4

## 🔍 สรุปผลการตรวจสอบ

### ไฟล์ที่ใช้ sessionStorage/localStorage: **59 ไฟล์**
### ไฟล์ที่ใช้ cache-related code: **10 ไฟล์**
### ไฟล์ที่ใช้ redux-persist: **5 ไฟล์**
### ไฟล์ที่ใช้ getItem/setItem/removeItem/clear: **99 ไฟล์ (525 matches)**

---

## 📁 หมวดหมู่ไฟล์ที่มีการเก็บ Cache

### 1. **Redux Persist (Persistent State Management)**

#### `store/index.ts`
- **สถานะ**: ⚠️ ใช้ redux-persist เก็บ state ใน localStorage
- **รายละเอียด**:
  - `auth` - เก็บ authentication tokens, user data
  - `ui` - เก็บ sidebar state, dark mode
  - `formElementConfig` - เก็บ form element configurations
  - `userProfile` - เก็บ user profile data
- **ผลกระทบ**: State จะถูกเก็บใน localStorage และ persist ระหว่าง sessions

#### `store/frontendStore/index.ts`
- **สถานะ**: ⚠️ ใช้ redux-persist

#### `components/layout/layoutProvider.tsx`
- **สถานะ**: ⚠️ ใช้ redux-persist

---

### 2. **LocalStorage Utilities**

#### `store/utils/localStorage.ts` ⚠️ **ไฟล์หลัก**
- **สถานะ**: 🔴 ไฟล์หลักสำหรับจัดการ localStorage/sessionStorage
- **รายละเอียด**:
  - เก็บ authentication tokens (accessToken, refreshToken)
  - เก็บ user data
  - เก็บ certificate authority data
  - เก็บ UI settings
  - เก็บ development/cache data
- **Keys ที่เก็บ**:
  - `accessToken`, `refreshToken`, `token`
  - `user`, `validateData`
  - `persist:auth`, `persist:ui`
  - `certificateAuthority`
  - `ally-supports-cache`, `nuxt-devtools-frame-state`

---

### 3. **SessionStorage (Template/Form Data)**

#### `app/backend/Mapping/page.tsx` ✅ **แก้ไขแล้ว**
- **สถานะ**: ✅ แก้ไขแล้ว - ใช้ useState + useEffect แทนการอ่านใน component body
- **รายละเอียด**: เก็บ template form data

#### `components/ui/listCardItemUseTemplate.tsx`
- **สถานะ**: ⚠️ ใช้ sessionStorage เก็บ templateFormData
- **รายละเอียด**: 
  ```typescript
  sessionStorage.setItem("templateFormData", JSON.stringify({...}))
  ```

#### `components/mappingComponents/PDFTemplate.tsx`
- **สถานะ**: ⚠️ ใช้ sessionStorage หลายจุด
- **รายละเอียด**: เก็บ template form data, mapping data

#### `components/mappingComponents/FormComponents/FormB2BDocument/modalSettingDocumentUse.tsx`
- **สถานะ**: ⚠️ ใช้ sessionStorage

#### `components/mappingComponents/FormComponents/FormB2BDocument/modalSettingDocument.tsx`
- **สถานะ**: ⚠️ ใช้ sessionStorage

#### `components/mappingComponents/FormComponents/FormB2BDocument/modalSettingDocumentTemplate.tsx`
- **สถานะ**: ⚠️ ใช้ sessionStorage

---

### 4. **PDF Storage**

#### `utils/pdfStorage.ts`
- **สถานะ**: ⚠️ ใช้ localStorage เก็บ PDF blobs
- **รายละเอียด**: 
  - `storePdf()` - เก็บ PDF ใน localStorage
  - `loadPdf()` - โหลด PDF จาก localStorage

#### `utils/resetPdfMerge.ts`
- **สถานะ**: ⚠️ ใช้ localStorage

---

### 5. **Authentication & Token Storage**

#### `store/token.ts`
- **สถานะ**: ⚠️ ใช้ localStorage/sessionStorage เก็บ tokens

#### `store/slices/authSlice.ts`
- **สถานะ**: ⚠️ ใช้ redux-persist เก็บ auth state

#### `store/utils/useTokenExpiration.ts`
- **สถานะ**: ⚠️ ใช้ localStorage

#### `store/utils/authUtils.ts`
- **สถานะ**: ⚠️ ใช้ localStorage

---

### 6. **Transaction & Form Data**

#### `store/frontendStore/transactionAPI.ts`
- **สถานะ**: ⚠️ ใช้ localStorage/sessionStorage (21 matches)

#### `store/backendStore/templateAPI.ts`
- **สถานะ**: ⚠️ ใช้ sessionStorage (11 matches)

#### `store/backendStore/MappingBackend.ts`
- **สถานะ**: ⚠️ ใช้ sessionStorage

#### `components/mappingComponents/FormUtils/apiUtils.ts`
- **สถานะ**: ⚠️ ใช้ sessionStorage (7 matches)

---

### 7. **UI State & Settings**

#### `store/slices/uiSlice.ts`
- **สถานะ**: ⚠️ ใช้ redux-persist เก็บ UI state

#### `store/menu/NavLinks.ts`
- **สถานะ**: ⚠️ ใช้ localStorage (18 matches)

#### `components/layout/Header.tsx`
- **สถานะ**: ⚠️ ใช้ localStorage (15 matches)

---

### 8. **Next.js Cache Configuration**

#### `next.config.ts`
- **สถานะ**: ✅ แก้ไขแล้ว - disable cache ใน development
- **รายละเอียด**:
  - Cache-Control headers
  - Webpack cache (disabled in dev)

#### `tsconfig.json`
- **สถานะ**: ✅ แก้ไขแล้ว - disable incremental compilation

---

## 🎯 ไฟล์ที่ควรแก้ไข (Priority)

### 🔴 **Critical (ควรแก้ไขทันที)**

1. **`store/utils/localStorage.ts`**
   - ไฟล์หลักสำหรับจัดการ localStorage
   - เก็บ authentication tokens, user data
   - **แนะนำ**: ใช้ cookies แทน localStorage สำหรับ sensitive data

2. **`store/index.ts`**
   - ใช้ redux-persist เก็บ state
   - **แนะนำ**: ตรวจสอบว่าจำเป็นต้อง persist หรือไม่

3. **`utils/pdfStorage.ts`**
   - เก็บ PDF blobs ใน localStorage
   - **แนะนำ**: ใช้ IndexedDB หรือ server-side storage แทน

### 🟡 **Medium Priority**

4. **`components/ui/listCardItemUseTemplate.tsx`**
   - เก็บ templateFormData ใน sessionStorage
   - **แนะนำ**: ใช้ URL parameters หรือ state management แทน

5. **`components/mappingComponents/PDFTemplate.tsx`**
   - ใช้ sessionStorage หลายจุด
   - **แนะนำ**: ลดการใช้ sessionStorage

6. **`store/frontendStore/transactionAPI.ts`**
   - ใช้ localStorage/sessionStorage (21 matches)
   - **แนะนำ**: ตรวจสอบและลดการใช้

### 🟢 **Low Priority**

7. **`store/menu/NavLinks.ts`** - ใช้ localStorage (18 matches)
8. **`components/layout/Header.tsx`** - ใช้ localStorage (15 matches)
9. **`app/login/page.tsx`** - ใช้ localStorage (38 matches)
10. **`app/one-platform/page.tsx`** - ใช้ localStorage (8 matches)

---

## 📋 แนวทางแก้ไข

### 1. **Disable Redux Persist (ถ้าไม่ต้องการ)**

แก้ไข `store/index.ts`:
```typescript
// แทนที่
auth: persistReducer(authPersistConfig, authReducer),

// ด้วย
auth: authReducer,
```

### 2. **ใช้ Cookies แทน LocalStorage สำหรับ Sensitive Data**

แก้ไข `store/utils/localStorage.ts`:
```typescript
// ใช้ cookies-next แทน localStorage สำหรับ tokens
import { setCookie, getCookie, deleteCookie } from 'cookies-next';
```

### 3. **ใช้ URL Parameters แทน SessionStorage**

แก้ไข `components/ui/listCardItemUseTemplate.tsx`:
```typescript
// แทนที่ sessionStorage
// ใช้ URL parameters หรือ Redux state แทน
```

### 4. **ใช้ IndexedDB สำหรับ Large Data (PDFs)**

แก้ไข `utils/pdfStorage.ts`:
```typescript
// ใช้ IndexedDB แทน localStorage สำหรับ PDF blobs
```

### 5. **Clear Cache on Development**

เพิ่มใน `next.config.ts`:
```typescript
// Already done - cache disabled in development
```

---

## 🔧 Scripts สำหรับ Clear Cache

### ใช้ Scripts ที่มีอยู่แล้ว:

```bash
# ลบ cache ทั้งหมด
npm run c-all

# ลบ cache แล้ว start dev
npm run c-dev

# ตรวจสอบปัญหา cache
npm run diagnose
```

---

## 📊 สรุปสถิติ

| ประเภท | จำนวนไฟล์ | จำนวน Matches |
|--------|-----------|---------------|
| sessionStorage/localStorage | 59 | ~200+ |
| redux-persist | 5 | ~10 |
| cache-related | 10 | ~20 |
| getItem/setItem/removeItem | 99 | 525 |

---

## ✅ ไฟล์ที่แก้ไขแล้ว

1. ✅ `app/backend/Mapping/page.tsx` - ใช้ useState + useEffect แทนการอ่านใน component body
2. ✅ `next.config.ts` - disable cache ใน development
3. ✅ `tsconfig.json` - disable incremental compilation

---

## 🎯 คำแนะนำ

### สำหรับ Development:
- ✅ ใช้ `npm run c-dev` เพื่อลบ cache ก่อน start dev
- ✅ ใช้ `npm run diagnose` เพื่อตรวจสอบปัญหา cache
- ✅ Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)

### สำหรับ Production:
- ⚠️ ตรวจสอบว่าจำเป็นต้องใช้ cache หรือไม่
- ⚠️ ใช้ cookies สำหรับ sensitive data แทน localStorage
- ⚠️ ใช้ server-side storage สำหรับ large data (PDFs)

---

## 📝 หมายเหตุ

- **Redux Persist**: เก็บ state ใน localStorage - ควรตรวจสอบว่าจำเป็นหรือไม่
- **SessionStorage**: ใช้เก็บ temporary data - ควรใช้ URL parameters หรือ state management แทน
- **LocalStorage**: ใช้เก็บ user preferences - OK แต่ไม่ควรเก็บ sensitive data

---

*รายงานนี้สร้างเมื่อ: ${new Date().toISOString()}*


