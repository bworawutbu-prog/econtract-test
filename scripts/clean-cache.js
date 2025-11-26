#!/usr/bin/env node

/**
 * Script to clean Next.js cache and build artifacts
 * Usage: node scripts/clean-cache.js
 */

const fs = require('fs');
const path = require('path');

const directoriesToRemove = [
  '.next',
  '.turbo',
  '.swc',
  'out',
  'dist',
  'node_modules/.cache',
  '.npm-cache', // 🎯 NEW: npm cache directory
  '.cache', // 🎯 NEW: General cache directory
  'build', // 🎯 NEW: Build directory
  'coverage', // 🎯 NEW: Test coverage
  '.nyc_output', // 🎯 NEW: NYC test coverage
];

const filesToRemove = [
  'tsconfig.tsbuildinfo',
  '*.log', // 🎯 NEW: Log files
  'npm-debug.log*', // 🎯 NEW: npm debug logs
  'yarn-debug.log*', // 🎯 NEW: yarn debug logs
  'yarn-error.log*', // 🎯 NEW: yarn error logs
];

console.log('🧹 Cleaning cache and build artifacts...\n');

let totalSize = 0;
let removedCount = 0;

function getDirectorySize(dirPath) {
  let size = 0;
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        size += getDirectorySize(filePath);
      } else {
        size += stats.size;
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
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function removeDirectory(dirPath) {
  const fullPath = path.resolve(process.cwd(), dirPath);
  
  if (!fs.existsSync(fullPath)) {
    return false;
  }

  try {
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      const size = getDirectorySize(fullPath);
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`✅ Removed: ${dirPath} (${formatBytes(size)})`);
      totalSize += size;
      removedCount++;
      return true;
    } else if (stats.isFile()) {
      const size = stats.size;
      fs.unlinkSync(fullPath);
      console.log(`✅ Removed: ${dirPath} (${formatBytes(size)})`);
      totalSize += size;
      removedCount++;
      return true;
    }
  } catch (err) {
    console.error(`❌ Error removing ${dirPath}:`, err.message);
    return false;
  }
  
  return false;
}

// Remove directories
for (const dir of directoriesToRemove) {
  removeDirectory(dir);
}

// Remove files
for (const file of filesToRemove) {
  removeDirectory(file);
}

console.log(`\n✨ Cleanup complete!`);
console.log(`   Removed ${removedCount} item(s)`);
console.log(`   Freed ${formatBytes(totalSize)} of disk space\n`);

