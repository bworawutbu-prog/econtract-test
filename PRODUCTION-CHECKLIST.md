# 🚀 Production Deployment Checklist

## ✅ ก่อน Deploy ต้องทำทุกครั้ง!

### 1. **Local Production Test** (สำคัญที่สุด!)

```bash
# หยุด dev server
# Ctrl+C หรือ kill process

# Build production
npm run build

# ตรวจสอบ build logs
# - ดูว่ามี error หรือ warning ไหม
# - ตรวจสอบว่าหน้าไหนเป็น Static/Dynamic

# รัน production mode
npm run start

# เปิด localhost:3000 และทดสอบ:
# ✅ Login/Logout
# ✅ หน้าเว็บหลักๆ ทุกหน้า
# ✅ API calls ทำงานถูกต้อง
# ✅ ไม่มี console errors
# ✅ ไม่มี hydration warnings
```

### 2. **Environment Variables** 🔐

ตรวจสอบว่าตั้งค่า Environment Variables ใน Production Server แล้ว:

#### Required Variables:
```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_WORKSPACE_ID=003
NEXT_PUBLIC_TAX_ID=your-tax-id
NODE_ENV=production
```

#### วิธีตรวจสอบ:
```bash
# ใน production server
echo $NEXT_PUBLIC_API_URL
echo $NODE_ENV
```

⚠️ **สำคัญ**: Environment Variables ที่ขึ้นต้นด้วย `NEXT_PUBLIC_` จะถูก bundle เข้าไปใน client-side code! อย่าใส่ secrets ในตัวแปรเหล่านี้!

### 3. **ตรวจสอบ Console Logs** 🧹

ก่อน deploy ให้ลบหรือ comment `console.log` และ `console.error` ที่ไม่จำเป็น:

```bash
# ใช้ script ที่มีอยู่แล้ว
npm run ec:rm-logs
```

### 4. **ตรวจสอบ Hydration Issues** ⚠️

ปัญหาที่พบบ่อย:
- ❌ ใช้ `sessionStorage`/`localStorage` ใน component render (นอก useEffect)
- ❌ Server และ Client render ผลลัพธ์ไม่ตรงกัน
- ❌ ใช้ `window` object โดยไม่เช็ค `typeof window !== 'undefined'`

**วิธีแก้**: ใช้ `useEffect` สำหรับ browser-only code

### 5. **ตรวจสอบ Cache Configuration** 💾

ใน Production, Next.js จะ cache ข้อมูลอย่างหนัก:

#### Data Cache (fetch)
- Default: Cache ตลอดกาล (Infinite)
- แก้ไขด้วย: `revalidate` option

```typescript
// ตัวอย่าง: ต้องการ refresh ทุก 60 วินาที
fetch(url, { next: { revalidate: 60 } })
```

#### Router Cache
- จำหน้าเว็บที่เคยเข้าดูไว้
- อาจทำให้เห็นข้อมูลเก่า
- แก้ไขด้วย: `router.refresh()` หรือ `revalidatePath()`

### 6. **ตรวจสอบ Error Handling** 🛡️

Production จะไม่แสดง error details แบบ dev mode:

- ✅ ตรวจสอบว่ามี error boundary
- ✅ ตรวจสอบว่ามี fallback UI สำหรับ error states
- ✅ ตรวจสอบว่ามี proper error logging

### 7. **ตรวจสอบ Performance** ⚡

```bash
# วิเคราะห์ bundle size
npm run ec:analyze

# ตรวจสอบ:
# - Bundle size ไม่ใหญ่เกินไป
# - Code splitting ทำงานถูกต้อง
# - Images ถูก optimize แล้ว
```

### 8. **ตรวจสอบ Security** 🔒

- ✅ HTTPS enabled
- ✅ Secure cookies (production mode)
- ✅ ไม่มี secrets ใน client-side code
- ✅ CORS configured correctly

### 9. **ตรวจสอบ Docker (ถ้าใช้)** 🐳

```bash
# Build Docker image
docker build -t e-contract-v4 .

# Test Docker image locally
docker run -p 3000:3000 e-contract-v4

# ตรวจสอบ environment variables ใน Docker
docker exec <container-id> env | grep NEXT_PUBLIC
```

### 10. **Final Checks** ✅

- [ ] Build สำเร็จไม่มี error
- [ ] `npm run start` ทำงานได้
- [ ] ทุกหน้าเว็บโหลดได้
- [ ] API calls ทำงานถูกต้อง
- [ ] ไม่มี console errors
- [ ] Environment variables ตั้งค่าแล้ว
- [ ] Cache ทำงานถูกต้อง
- [ ] Error handling ครบถ้วน

---

## 🐛 Troubleshooting Production Issues

### ปัญหา: ข้อมูลเก่าค้าง (Stale Data)

**สาเหตุ**: Next.js cache ข้อมูลไว้

**แก้ไข**:
```typescript
// ใช้ revalidate ใน fetch
fetch(url, { next: { revalidate: 60 } })

// หรือใช้ dynamic rendering
export const dynamic = 'force-dynamic'
```

### ปัญหา: Environment Variables ไม่ทำงาน

**สาเหตุ**: ไม่ได้ตั้งค่าใน production server

**แก้ไข**:
1. ตรวจสอบว่า set ใน server environment
2. Restart application หลังจาก set
3. ตรวจสอบว่าใช้ `NEXT_PUBLIC_` prefix สำหรับ client-side vars

### ปัญหา: Hydration Mismatch

**สาเหตุ**: Server และ Client render ไม่ตรงกัน

**แก้ไข**:
```typescript
// ❌ ผิด
const value = localStorage.getItem('key')

// ✅ ถูก
const [value, setValue] = useState(null)
useEffect(() => {
  setValue(localStorage.getItem('key'))
}, [])
```

### ปัญหา: หน้าเว็บแสดง 404/500

**สาเหตุ**: Build ไม่สำเร็จหรือ routing ผิด

**แก้ไข**:
1. ตรวจสอบ build logs
2. ตรวจสอบ routing configuration
3. ตรวจสอบว่า static files ถูก serve ถูกต้อง

---

## 📝 Notes

- **Development Mode** (`npm run dev`): ใช้สำหรับเขียนโค้ดเท่านั้น
- **Production Mode** (`npm run start`): ใช้สำหรับทดสอบก่อน deploy จริง
- **Always test with `npm run build && npm run start`** ก่อน deploy!

