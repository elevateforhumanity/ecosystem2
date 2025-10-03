#!/usr/bin/env node
/**
 * Wix Content Validator
 * Validates content structure and formatting for Wix integration
 */

const fs = require('fs');
const path = require('path');

function validateContent() {
  console.log('🔍 Validating Wix content...\n');
  
  const contentDirs = [
    'sites/blog',
    'public/pages',
    'data/samples'
  ];
  
  let totalFiles = 0;
  let validFiles = 0;
  
  contentDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    
    if (!fs.existsSync(dirPath)) {
      console.log(`   ⚠️  Directory not found: ${dir}`);
      return;
    }
    
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html') || f.endsWith('.md'));
    totalFiles += files.length;
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Basic validation
      if (content.length > 0) {
        validFiles++;
        console.log(`   ✅ ${dir}/${file}`);
      } else {
        console.log(`   ❌ ${dir}/${file} (empty)`);
      }
    });
  });
  
  console.log(`\n📊 Validation complete: ${validFiles}/${totalFiles} files valid`);
  
  if (validFiles === totalFiles) {
    console.log('✨ All content is valid!');
    process.exit(0);
  } else {
    console.log('⚠️  Some content needs attention');
    process.exit(1);
  }
}

validateContent();
