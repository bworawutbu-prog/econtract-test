#!/usr/bin/env node

/**
 * Script to remove ALL cache and build artifacts from Next.js project
 * This is a more aggressive cleanup than clean-cache.js
 * Usage: node scripts/remove-all-cache.js
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
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 🎯 ALL cache directories and files to remove
const directoriesToRemove = [
  '.next',
  '.turbo',
  '.swc',
  'out',
  'dist',
  'build',
  'coverage',
  '.nyc_output',
  '.npm-cache',
  '.cache',
  'node_modules/.cache',
  '.vscode/.next', // VSCode Next.js extension cache
];

const filesToRemove = [
  'tsconfig.tsbuildinfo',
  '*.log',
  'npm-debug.log*',
  'yarn-debug.log*',
  'yarn-error.log*',
  '.DS_Store',
];

const globPatternsToRemove = [
  '**/.next',
  '**/.turbo',
  '**/.swc',
  '**/node_modules/.cache',
  '**/tsconfig.tsbuildinfo',
  '**/*.log',
];

let totalSize = 0;
let removedCount = 0;
let errorCount = 0;

function getDirectorySize(dirPath) {
  let size = 0;
  try {
    if (!fs.existsSync(dirPath)) return 0;
    const stats = fs.statSync(dirPath);
    if (stats.isFile()) {
      return stats.size;
    }
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
        // Skip files that can't be accessed
      }
    }
  } catch (err) {
    // Ignore errors
  }
  return size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function removePath(targetPath) {
  const fullPath = path.resolve(process.cwd(), targetPath);
  
  if (!fs.existsSync(fullPath)) {
    return { success: false, size: 0, message: 'Not found' };
  }

  try {
    const stats = fs.statSync(fullPath);
    let size = 0;
    
    if (stats.isDirectory()) {
      size = getDirectorySize(fullPath);
      fs.rmSync(fullPath, { recursive: true, force: true });
      return { success: true, size, message: 'Directory removed' };
    } else if (stats.isFile()) {
      size = stats.size;
      fs.unlinkSync(fullPath);
      return { success: true, size, message: 'File removed' };
    }
  } catch (err) {
    return { success: false, size: 0, message: err.message };
  }
  
  return { success: false, size: 0, message: 'Unknown error' };
}

function removeGlobPattern(pattern) {
  try {
    // Use find command on Unix-like systems
    if (process.platform !== 'win32') {
      execSync(`find . -name "${pattern}" -type f -delete 2>/dev/null || true`, { cwd: process.cwd() });
      execSync(`find . -name "${pattern}" -type d -exec rm -rf {} + 2>/dev/null || true`, { cwd: process.cwd() });
    }
  } catch (err) {
    // Ignore errors
  }
}

console.log('\n' + '='.repeat(60));
log('🧹 REMOVING ALL CACHE AND BUILD ARTIFACTS', 'cyan');
log('='.repeat(60) + '\n', 'cyan');

// Step 1: Remove directories
log('📁 Removing cache directories...', 'blue');
for (const dir of directoriesToRemove) {
  const result = removePath(dir);
  if (result.success) {
    log(`   ✅ ${dir} (${formatBytes(result.size)})`, 'green');
    totalSize += result.size;
    removedCount++;
  } else if (result.message !== 'Not found') {
    log(`   ⚠️  ${dir}: ${result.message}`, 'yellow');
    errorCount++;
  } else {
    log(`   ℹ️  ${dir}: Not found (skipping)`, 'reset');
  }
}

// Step 2: Remove files
log('\n📄 Removing cache files...', 'blue');
for (const file of filesToRemove) {
  // Handle glob patterns
  if (file.includes('*')) {
    try {
      const glob = require('glob');
      const files = glob.sync(file, { cwd: process.cwd(), absolute: true });
      for (const filePath of files) {
        const result = removePath(filePath);
        if (result.success) {
          log(`   ✅ ${path.relative(process.cwd(), filePath)} (${formatBytes(result.size)})`, 'green');
          totalSize += result.size;
          removedCount++;
        }
      }
    } catch (err) {
      // Fallback: try to remove using shell
      removeGlobPattern(file);
    }
  } else {
    const result = removePath(file);
    if (result.success) {
      log(`   ✅ ${file} (${formatBytes(result.size)})`, 'green');
      totalSize += result.size;
      removedCount++;
    } else if (result.message !== 'Not found') {
      log(`   ⚠️  ${file}: ${result.message}`, 'yellow');
      errorCount++;
    }
  }
}

// Step 3: Clear npm cache (optional, but thorough)
log('\n📦 Clearing npm cache...', 'blue');
try {
  execSync('npm cache clean --force', { stdio: 'ignore' });
  log('   ✅ npm cache cleared', 'green');
} catch (err) {
  log('   ⚠️  Could not clear npm cache (may require sudo)', 'yellow');
}

// Step 4: Clear Next.js cache
log('\n🔄 Clearing Next.js specific caches...', 'blue');
try {
  // Remove .next/cache if it exists separately
  const nextCachePath = path.join(process.cwd(), '.next', 'cache');
  if (fs.existsSync(nextCachePath)) {
    const result = removePath(nextCachePath);
    if (result.success) {
      log(`   ✅ .next/cache (${formatBytes(result.size)})`, 'green');
      totalSize += result.size;
    }
  }
} catch (err) {
  // Ignore
}

// Summary
console.log('\n' + '='.repeat(60));
log('✨ CLEANUP COMPLETE!', 'green');
log('='.repeat(60), 'green');
log(`\n📊 Summary:`, 'cyan');
log(`   ✅ Removed: ${removedCount} item(s)`, 'green');
if (errorCount > 0) {
  log(`   ⚠️  Errors: ${errorCount} item(s)`, 'yellow');
}
log(`   💾 Freed: ${formatBytes(totalSize)} of disk space`, 'green');
log(`\n💡 Tip: Run 'npm run dev' to start fresh development server`, 'cyan');
log(`   Or run 'npm run build' to create a new production build\n`, 'cyan');

