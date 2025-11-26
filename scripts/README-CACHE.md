# 🧹 Cache Management Guide

คู่มือการจัดการ Cache ในโปรเจค e-contract-v4

## 📋 Cache ที่มีในโปรเจค

### Next.js Cache:
- `.next/` - Build output และ cache
- `.next/cache/` - Next.js internal cache
- `.turbo/` - Turborepo cache (ถ้าใช้)
- `.swc/` - SWC compiler cache

### Build Artifacts:
- `out/` - Static export output
- `dist/` - Distribution folder
- `build/` - Build directory
- `tsconfig.tsbuildinfo` - TypeScript build info

### npm/yarn Cache:
- `node_modules/.cache/` - npm cache ใน node_modules
- `.npm-cache/` - npm cache directory
- `.cache/` - General cache directory

### Test Coverage:
- `coverage/` - Test coverage reports
- `.nyc_output/` - NYC test coverage

### Log Files:
- `*.log` - Log files
- `npm-debug.log*` - npm debug logs
- `yarn-debug.log*` - yarn debug logs

---

## 🚀 วิธีลบ Cache

### 1. ลบ Cache พื้นฐาน (แนะนำ)
```bash
npm run clean
# หรือ
node scripts/clean-cache.js
```

**ลบ:**
- `.next/`
- `.turbo/`
- `.swc/`
- `out/`
- `dist/`
- `node_modules/.cache/`
- `tsconfig.tsbuildinfo`

### 2. ลบ Cache ทั้งหมด (Aggressive)
```bash
npm run clean:all
# หรือ
node scripts/remove-all-cache.js
```

**ลบ:**
- Cache ทั้งหมดจากวิธีที่ 1
- `.npm-cache/`
- `.cache/`
- `build/`
- `coverage/`
- `.nyc_output/`
- Log files ทั้งหมด
- npm cache (global)

### 3. ลบ Cache แล้ว Build ใหม่
```bash
npm run clean:build
# ลบ cache แล้ว build ทันที
```

### 4. ลบ Cache แล้ว Start Dev Server
```bash
npm run clean:dev
# ลบ cache แล้ว start dev server
```

---

## ⚙️ การ Disable Cache ใน Next.js

### Option 1: ใช้ Environment Variable
```bash
# Disable cache สำหรับ development
NEXT_DISABLE_CACHE=1 npm run dev

# หรือสร้างไฟล์ .env.local
echo "NEXT_DISABLE_CACHE=1" >> .env.local
```

### Option 2: แก้ไข next.config.ts
เพิ่มใน `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  // Disable cache in development
  ...(process.env.NODE_ENV === 'development' && {
    // Disable static optimization
    output: 'standalone',
  }),
  
  // หรือ disable specific caches
  experimental: {
    // Disable SWC cache
    // swcFileReading: false,
  },
};
```

### Option 3: ใช้ Script สำหรับ Development
สร้างไฟล์ `.env.local`:
```env
# Disable Next.js cache
NEXT_DISABLE_CACHE=1
```

---

## 🔧 การตั้งค่าให้ไม่เก็บ Cache

### 1. เพิ่มใน `.gitignore`
ตรวจสอบว่า `.gitignore` มี cache directories อยู่แล้ว:
```
.next/
.turbo/
.swc/
out/
dist/
node_modules/.cache/
tsconfig.tsbuildinfo
```

### 2. สร้าง `.npmrc` (Optional)
สร้างไฟล์ `.npmrc` ใน root:
```
cache=false
# หรือ
cache-max=0
```

### 3. ใช้ Git Hooks (Optional)
สร้าง `.git/hooks/post-checkout`:
```bash
#!/bin/sh
# ลบ cache ทุกครั้งที่ checkout branch
npm run clean
```

---

## 📊 ตรวจสอบ Cache Size

### ใช้ Script
```bash
node scripts/remove-all-cache.js
# Script จะแสดงขนาดของ cache ที่ลบ
```

### ใช้ Command Line
```bash
# macOS/Linux
du -sh .next .turbo .swc node_modules/.cache 2>/dev/null

# Windows
dir /s .next .turbo .swc
```

---

## ⚠️ หมายเหตุ

1. **การลบ Cache จะทำให้ Build ช้าลง** - Next.js ใช้ cache เพื่อเพิ่มความเร็วในการ build
2. **Production Build** - ไม่ควร disable cache ใน production
3. **Development Only** - ควร disable cache เฉพาะตอน development เมื่อมีปัญหา
4. **npm cache** - การลบ npm cache อาจต้อง reinstall dependencies

---

## 🐛 Troubleshooting

### ปัญหา: Cache ไม่ถูกลบ
```bash
# ลบด้วย force
rm -rf .next .turbo .swc
# หรือ
npm run clean:all
```

### ปัญหา: Build ยังใช้ cache เก่า
```bash
# ลบ cache แล้ว build ใหม่
npm run clean:build
```

### ปัญหา: Dev server ยังใช้ cache
```bash
# ลบ cache แล้ว start ใหม่
npm run clean:dev
```

---

## 📝 Best Practices

1. **Development**: ใช้ `npm run clean:dev` เมื่อมีปัญหา cache
2. **Before Commit**: ใช้ `npm run clean` เพื่อลบ cache ก่อน commit
3. **CI/CD**: ใช้ `npm run clean:build` ใน CI/CD pipeline
4. **Production**: ไม่ควร disable cache ใน production

