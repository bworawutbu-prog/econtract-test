#!/usr/bin/env node

/**
 * Production Readiness Checker
 * ตรวจสอบว่าโค้ดพร้อมสำหรับ production หรือยัง
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, checks) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    return { exists: false, issues: [`File not found: ${filePath}`] };
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  const issues = [];

  checks.forEach(({ name, pattern, message }) => {
    if (pattern.test(content)) {
      issues.push(`${name}: ${message}`);
    }
  });

  return { exists: true, issues };
}

function checkEnvironmentVariables() {
  const envFiles = ['.env.local', '.env.production', '.env'];
  const found = envFiles.filter(file => 
    fs.existsSync(path.join(process.cwd(), file))
  );

  if (found.length === 0) {
    return {
      passed: false,
      message: '⚠️  No .env files found. Make sure to set environment variables in production server.',
    };
  }

  return {
    passed: true,
    message: `✅ Found env files: ${found.join(', ')}`,
  };
}

function checkConsoleLogs() {
  const srcPath = path.join(process.cwd(), 'app');
  if (!fs.existsSync(srcPath)) {
    return { passed: true, count: 0 };
  }

  let consoleCount = 0;
  const files = getAllFiles(srcPath);

  files.forEach(file => {
    if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
      const content = fs.readFileSync(file, 'utf-8');
      const matches = content.match(/console\.(log|error|warn|debug)/g);
      if (matches) {
        consoleCount += matches.length;
      }
    }
  });

  return {
    passed: consoleCount < 50, // Allow some console logs for error handling
    count: consoleCount,
    message: consoleCount > 0 
      ? `⚠️  Found ${consoleCount} console.log/error statements. Consider removing them.`
      : '✅ No console statements found.',
  };
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('.next')) {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

function checkHydrationIssues() {
  const srcPath = path.join(process.cwd(), 'app');
  if (!fs.existsSync(srcPath)) {
    return { passed: true, issues: [] };
  }

  const issues = [];
  const files = getAllFiles(srcPath);

  files.forEach(file => {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Check for localStorage/sessionStorage without typeof window check
      if (content.includes('localStorage') || content.includes('sessionStorage')) {
        const hasWindowCheck = /typeof\s+window\s*!==\s*['"]undefined['"]/.test(content);
        const inUseEffect = /useEffect\s*\(/.test(content);
        
        if (!hasWindowCheck && !inUseEffect) {
          issues.push(`${file}: Uses localStorage/sessionStorage without window check or useEffect`);
        }
      }
    }
  });

  return {
    passed: issues.length === 0,
    issues,
    message: issues.length === 0
      ? '✅ No obvious hydration issues found.'
      : `⚠️  Found ${issues.length} potential hydration issues.`,
  };
}

function checkBuildOutput() {
  const nextPath = path.join(process.cwd(), '.next');
  return {
    passed: fs.existsSync(nextPath),
    message: fs.existsSync(nextPath)
      ? '✅ Build output (.next) exists.'
      : '❌ Build output not found. Run `npm run build` first.',
  };
}

// Main execution
log('\n🚀 Production Readiness Check\n', 'blue');
log('='.repeat(50), 'blue');

let allPassed = true;

// Check 1: Environment Variables
log('\n1. Checking Environment Variables...', 'yellow');
const envCheck = checkEnvironmentVariables();
log(envCheck.message, envCheck.passed ? 'green' : 'yellow');
if (!envCheck.passed) allPassed = false;

// Check 2: Console Logs
log('\n2. Checking Console Logs...', 'yellow');
const consoleCheck = checkConsoleLogs();
log(consoleCheck.message, consoleCheck.passed ? 'green' : 'yellow');
if (!consoleCheck.passed) allPassed = false;

// Check 3: Hydration Issues
log('\n3. Checking Hydration Issues...', 'yellow');
const hydrationCheck = checkHydrationIssues();
log(hydrationCheck.message, hydrationCheck.passed ? 'green' : 'yellow');
if (hydrationCheck.issues.length > 0) {
  hydrationCheck.issues.slice(0, 5).forEach(issue => {
    log(`   - ${issue}`, 'yellow');
  });
  if (hydrationCheck.issues.length > 5) {
    log(`   ... and ${hydrationCheck.issues.length - 5} more`, 'yellow');
  }
}
if (!hydrationCheck.passed) allPassed = false;

// Check 4: Build Output
log('\n4. Checking Build Output...', 'yellow');
const buildCheck = checkBuildOutput();
log(buildCheck.message, buildCheck.passed ? 'green' : 'red');
if (!buildCheck.passed) allPassed = false;

// Final Summary
log('\n' + '='.repeat(50), 'blue');
if (allPassed) {
  log('\n✅ All checks passed! Ready for production.', 'green');
  log('\n📝 Next steps:', 'blue');
  log('   1. Run: npm run build', 'blue');
  log('   2. Run: npm run start', 'blue');
  log('   3. Test all features on localhost:3000', 'blue');
  log('   4. Deploy to production server', 'blue');
} else {
  log('\n⚠️  Some issues found. Please fix them before deploying.', 'yellow');
  log('\n📝 Recommended actions:', 'blue');
  log('   1. Fix the issues listed above', 'blue');
  log('   2. Run: npm run build', 'blue');
  log('   3. Run: npm run start and test', 'blue');
  log('   4. Run this script again to verify', 'blue');
}
log('\n', 'reset');

process.exit(allPassed ? 0 : 1);

