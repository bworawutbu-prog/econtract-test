#!/usr/bin/env node

/**
 * Script to fix lodash imports for better tree-shaking
 * Usage: node scripts/fix-lodash-imports.js
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'components/mappingComponents/FormComponents/FormB2BDocument/FormB2B.tsx',
  'components/mappingComponents/FormComponents/StylePanel.tsx',
  'components/mappingComponents/FormComponents/FormB2BDocument/FormB2C.tsx',
  'app/stamp/form/type/[id]/page.tsx',
  'store/frontendStore/userProfile.ts',
];

const replacements = [
  {
    // debounce from lodash
    pattern: /import\s+{\s*debounce\s*}\s+from\s+['"]lodash['"]/g,
    replacement: "import debounce from 'lodash/debounce'",
  },
  {
    // divide from lodash
    pattern: /import\s+{\s*divide\s*}\s+from\s+['"]lodash['"]/g,
    replacement: "import divide from 'lodash/divide'",
  },
  {
    // List from lodash
    pattern: /import\s+{\s*List\s*}\s+from\s+['"]lodash['"]/g,
    replacement: "import List from 'lodash/List'",
  },
];

function fixFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    replacements.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🚀 Starting lodash import fixes...\n');
  
  let totalFixed = 0;
  
  filesToFix.forEach(file => {
    if (fixFile(file)) {
      totalFixed++;
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files fixed: ${totalFixed}`);
  console.log(`\n✅ Done!`);
}

if (require.main === module) {
  main();
}

module.exports = { fixFile };

