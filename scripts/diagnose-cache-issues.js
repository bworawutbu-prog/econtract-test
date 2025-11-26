#!/usr/bin/env node

/**
 * Script to diagnose why code updates are not reflected in dev/build
 * Usage: node scripts/diagnose-cache-issues.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  return fs.existsSync(path.resolve(process.cwd(), filePath));
}

function readFileContent(filePath) {
  try {
    return fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8');
  } catch (err) {
    return null;
  }
}

function getDirectorySize(dirPath) {
  let size = 0;
  try {
    if (!fs.existsSync(dirPath)) return 0;
    const stats = fs.statSync(dirPath);
    if (stats.isFile()) return stats.size;
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      try {
        const fileStats = fs.statSync(filePath);
        if (fileStats.isDirectory()) {
          size += getDirectorySize(filePath);
        } else {
          size += fileStats.size;
        }
      } catch (err) {
        // Skip
      }
    }
  } catch (err) {
    // Ignore
  }
  return size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

console.log('\n' + '='.repeat(70));
log('🔍 DIAGNOSING CODE UPDATE ISSUES', 'cyan');
log('='.repeat(70) + '\n', 'cyan');

const issues = [];
const recommendations = [];

// 1. Check Next.js cache
log('1️⃣  Checking Next.js Cache...', 'blue');
const nextDir = path.resolve(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  const size = getDirectorySize(nextDir);
  log(`   ⚠️  .next/ directory exists (${formatBytes(size)})`, 'yellow');
  issues.push('Next.js cache (.next/) exists and may contain stale files');
  recommendations.push('Run: npm run c-all to remove all cache');
} else {
  log(`   ✅ .next/ directory not found`, 'green');
}

// 2. Check TypeScript incremental compilation
log('\n2️⃣  Checking TypeScript Configuration...', 'blue');
const tsconfigPath = path.resolve(process.cwd(), 'tsconfig.json');
if (checkFileExists('tsconfig.json')) {
  const tsconfigContent = readFileContent('tsconfig.json');
  if (tsconfigContent && tsconfigContent.includes('"incremental": true')) {
    log(`   ⚠️  TypeScript incremental compilation is enabled`, 'yellow');
    issues.push('TypeScript incremental compilation may use stale cache');
    recommendations.push('Consider disabling incremental in tsconfig.json or delete tsconfig.tsbuildinfo');
  } else {
    log(`   ✅ TypeScript incremental compilation is disabled`, 'green');
  }
  
  if (checkFileExists('tsconfig.tsbuildinfo')) {
    log(`   ⚠️  tsconfig.tsbuildinfo exists`, 'yellow');
    issues.push('TypeScript build info file exists');
    recommendations.push('Delete tsconfig.tsbuildinfo file');
  }
} else {
  log(`   ⚠️  tsconfig.json not found`, 'yellow');
}

// 3. Check Webpack cache
log('\n3️⃣  Checking Webpack/Next.js Cache Configuration...', 'blue');
const nextConfigPath = path.resolve(process.cwd(), 'next.config.ts');
if (checkFileExists('next.config.ts')) {
  const nextConfigContent = readFileContent('next.config.ts');
  if (nextConfigContent) {
    // Check for cache-related settings
    if (nextConfigContent.includes('cache') || nextConfigContent.includes('Cache')) {
      log(`   ⚠️  next.config.ts contains cache-related settings`, 'yellow');
      issues.push('next.config.ts may have cache configurations');
    }
    
    // Check for HMR configuration
    if (nextConfigContent.includes('webSocketTransport') || nextConfigContent.includes('HMR')) {
      log(`   ℹ️  HMR configuration found in next.config.ts`, 'reset');
    } else {
      log(`   ⚠️  No explicit HMR configuration found`, 'yellow');
      recommendations.push('Consider adding HMR configuration to next.config.ts');
    }
  }
} else {
  log(`   ⚠️  next.config.ts not found`, 'yellow');
}

// 4. Check for service workers
log('\n4️⃣  Checking for Service Workers...', 'blue');
const serviceWorkerFiles = [
  'public/sw.js',
  'public/service-worker.js',
  'public/workbox-*.js',
];
let foundSW = false;
for (const swFile of serviceWorkerFiles) {
  if (swFile.includes('*')) {
    // Check for any workbox files
    try {
      const publicDir = path.resolve(process.cwd(), 'public');
      if (fs.existsSync(publicDir)) {
        const files = fs.readdirSync(publicDir);
        if (files.some(f => f.includes('workbox') || f.includes('service-worker'))) {
          foundSW = true;
          log(`   ⚠️  Service worker files found in public/`, 'yellow');
          issues.push('Service workers may cache old code');
          recommendations.push('Unregister service workers in browser DevTools > Application > Service Workers');
          break;
        }
      }
    } catch (err) {
      // Ignore
    }
  } else if (checkFileExists(swFile)) {
    foundSW = true;
    log(`   ⚠️  ${swFile} exists`, 'yellow');
    issues.push(`Service worker file found: ${swFile}`);
    recommendations.push('Unregister service workers in browser');
    break;
  }
}
if (!foundSW) {
  log(`   ✅ No service workers found`, 'green');
}

// 5. Check browser cache headers
log('\n5️⃣  Checking Cache Headers Configuration...', 'blue');
if (checkFileExists('next.config.ts')) {
  const nextConfigContent = readFileContent('next.config.ts');
  if (nextConfigContent && nextConfigContent.includes('Cache-Control')) {
    const cacheControlMatch = nextConfigContent.match(/Cache-Control['"]?\s*:\s*['"]([^'"]+)['"]/);
    if (cacheControlMatch) {
      const cacheControl = cacheControlMatch[1];
      if (cacheControl.includes('max-age') && !cacheControl.includes('no-cache')) {
        log(`   ⚠️  Cache-Control headers found: ${cacheControl}`, 'yellow');
        issues.push('Cache-Control headers may cause browser to cache files');
        recommendations.push('Consider adding no-cache for development or using cache busting');
      }
    }
  }
}

// 6. Check for dynamic imports that might be cached
log('\n6️⃣  Checking for Dynamic Imports...', 'blue');
const componentsDir = path.resolve(process.cwd(), 'components');
if (fs.existsSync(componentsDir)) {
  try {
    const files = fs.readdirSync(componentsDir, { recursive: true });
    const dynamicImportFiles = files.filter(f => 
      f.endsWith('.tsx') || f.endsWith('.ts')
    ).slice(0, 5); // Check first 5 files
    
    let foundDynamic = false;
    for (const file of dynamicImportFiles) {
      const filePath = path.join(componentsDir, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.includes('dynamic(') || content.includes('next/dynamic')) {
          foundDynamic = true;
          break;
        }
      } catch (err) {
        // Skip
      }
    }
    
    if (foundDynamic) {
      log(`   ℹ️  Dynamic imports found (may have cache issues)`, 'reset');
      recommendations.push('Dynamic imports may be cached - ensure they have proper cache busting');
    } else {
      log(`   ✅ No dynamic imports detected in sample files`, 'green');
    }
  } catch (err) {
    log(`   ⚠️  Could not check components directory`, 'yellow');
  }
}

// 7. Check node_modules cache
log('\n7️⃣  Checking node_modules Cache...', 'blue');
const nodeModulesCache = path.resolve(process.cwd(), 'node_modules', '.cache');
if (fs.existsSync(nodeModulesCache)) {
  const size = getDirectorySize(nodeModulesCache);
  log(`   ⚠️  node_modules/.cache exists (${formatBytes(size)})`, 'yellow');
  issues.push('node_modules/.cache may contain stale cache');
  recommendations.push('Delete node_modules/.cache directory');
} else {
  log(`   ✅ node_modules/.cache not found`, 'green');
}

// 8. Check for .swc cache
log('\n8️⃣  Checking SWC Cache...', 'blue');
const swcCache = path.resolve(process.cwd(), '.swc');
if (fs.existsSync(swcCache)) {
  const size = getDirectorySize(swcCache);
  log(`   ⚠️  .swc cache exists (${formatBytes(size)})`, 'yellow');
  issues.push('SWC compiler cache exists');
  recommendations.push('Delete .swc directory');
} else {
  log(`   ✅ .swc cache not found`, 'green');
}

// 9. Check package.json scripts
log('\n9️⃣  Checking npm Scripts...', 'blue');
if (checkFileExists('package.json')) {
  const packageContent = readFileContent('package.json');
  if (packageContent) {
    const packageJson = JSON.parse(packageContent);
    const scripts = packageJson.scripts || {};
    
    if (scripts.dev && !scripts.dev.includes('--turbo')) {
      log(`   ℹ️  dev script: ${scripts.dev}`, 'reset');
    }
    
    if (scripts.build) {
      log(`   ℹ️  build script: ${scripts.build}`, 'reset');
    }
    
    if (!scripts.dev || scripts.dev === 'next dev') {
      log(`   ⚠️  Consider using: next dev --turbo for faster updates`, 'yellow');
      recommendations.push('Try: npm run dev -- --turbo for better HMR');
    }
  }
}

// Summary
console.log('\n' + '='.repeat(70));
log('📊 DIAGNOSIS SUMMARY', 'cyan');
log('='.repeat(70) + '\n', 'cyan');

if (issues.length === 0) {
  log('✅ No obvious cache issues found!', 'green');
  log('\n💡 If code still not updating, try:', 'cyan');
  log('   1. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)', 'cyan');
  log('   2. Clear browser cache completely', 'cyan');
  log('   3. Check browser DevTools > Network > Disable cache', 'cyan');
  log('   4. Restart dev server: npm run c-dev', 'cyan');
} else {
  log(`⚠️  Found ${issues.length} potential issue(s):\n`, 'yellow');
  issues.forEach((issue, index) => {
    log(`   ${index + 1}. ${issue}`, 'yellow');
  });
  
  log(`\n💡 Recommendations:\n`, 'cyan');
  recommendations.forEach((rec, index) => {
    log(`   ${index + 1}. ${rec}`, 'cyan');
  });
}

log('\n🔧 Quick Fix Commands:', 'magenta');
log('   npm run c-all          # Remove all cache', 'magenta');
log('   npm run c-dev          # Remove cache and start dev', 'magenta');
log('   npm run c-cb:build     # Remove cache and build', 'magenta');
log('');

