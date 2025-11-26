#!/usr/bin/env node

/**
 * Script to remove console.log statements from production code
 * Usage: node scripts/remove-console-logs.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const directories = [
  'components',
  'app',
  'store',
  'utils',
];

const fileExtensions = ['.ts', '.tsx', '.js', '.jsx'];

function shouldProcessFile(filePath) {
  return fileExtensions.some(ext => filePath.endsWith(ext));
}

function removeConsoleLogs(content) {
  // Remove console.log, console.warn, console.error, console.info
  // But keep console.error in error boundaries and critical error handling
  
  // Pattern 1: Simple console.log/warn/info
  content = content.replace(/console\.(log|warn|info)\s*\([^)]*\)\s*;?/g, '');
  
  // Pattern 2: Multi-line console.log
  content = content.replace(/console\.(log|warn|info)\s*\([\s\S]*?\)\s*;?/g, '');
  
  // Pattern 3: console.log with template literals
  content = content.replace(/console\.(log|warn|info)\s*\(`[\s\S]*?`\)\s*;?/g, '');
  
  // Keep console.error for error handling (but can be removed if needed)
  // Uncomment below to remove console.error as well
  // content = content.replace(/console\.error\s*\([^)]*\)\s*;?/g, '');
  
  return content;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    const newContent = removeConsoleLogs(content);
    
    if (originalContent !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Processed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function walkDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, .git
      if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
        walkDirectory(filePath, fileList);
      }
    } else if (shouldProcessFile(filePath)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function main() {
  console.log('🚀 Starting console.log removal...\n');
  
  let totalProcessed = 0;
  let totalRemoved = 0;
  
  directories.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    
    if (!fs.existsSync(dirPath)) {
      console.log(`⚠️  Directory not found: ${dirPath}`);
      return;
    }
    
    const files = walkDirectory(dirPath);
    
    files.forEach(file => {
      totalProcessed++;
      if (processFile(file)) {
        totalRemoved++;
      }
    });
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total files processed: ${totalProcessed}`);
  console.log(`   Files modified: ${totalRemoved}`);
  console.log(`\n✅ Done!`);
}

if (require.main === module) {
  main();
}

module.exports = { removeConsoleLogs, processFile };

