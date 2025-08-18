#!/usr/bin/env node

/**
 * Script to update Supabase client imports across the codebase
 * This script updates all imports from the old pattern to the new singleton pattern
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const srcDir = path.resolve(__dirname, '../src');
const fileExtensions = ['ts', 'tsx'];
const backupDir = path.resolve(__dirname, '../.supabase-update-backups');

// Create backup directory if it doesn't exist
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Get all files that import supabase
console.log('Finding files with Supabase imports...');
const files = execSync(`find ${srcDir} -type f \\( -name "*.ts" -o -name "*.tsx" \\) -exec grep -l "import.*supabase" {} \\;`, { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean);

console.log(`Found ${files.length} files with potential Supabase client imports`);

// Process each file
let updatedFiles = 0;
let skippedFiles = 0;
let errorFiles = 0;

files.forEach(filePath => {
  try {
    // Skip files that already use the singleton pattern
    if (filePath.includes('client.ts') || filePath.includes('index.ts')) {
      console.log(`Skipping core file: ${filePath}`);
      skippedFiles++;
      return;
    }

    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Create backup of the original file
    const relativePath = path.relative(srcDir, filePath);
    const backupPath = path.join(backupDir, relativePath);
    const backupDirPath = path.dirname(backupPath);
    
    if (!fs.existsSync(backupDirPath)) {
      fs.mkdirSync(backupDirPath, { recursive: true });
    }
    
    fs.writeFileSync(backupPath, content, 'utf8');
    
    // Check if this file imports the old supabase client
    if (content.includes("import { supabase }") || 
        content.includes("import {supabase}") ||
        content.includes("import { createClient }") ||
        content.includes("import {  supabase")) {
      
      // Replace the import statement - handle various import patterns
      let updatedContent = content
        .replace(/import\s*{\s*supabase\s*}\s*from\s*["'](.+?)\/client["']/g, 'import { supabaseClient } from "$1/client"')
        .replace(/import\s*{\s*supabase\s*}\s*from\s*["'](.+?)\/supabase["']/g, 'import { supabaseClient } from "$1/supabase/client"')
        .replace(/import\s*{\s*supabase\s*}\s*from\s*["']@\/integration\/supabase["']/g, 'import { supabaseClient } from "@/integration/supabase/client"')
        .replace(/import\s*{\s*createClient\s*}\s*from\s*["']@supabase\/supabase-js["']/g, 'import { supabaseClient } from "@/integration/supabase/client"');
      
      // Replace all instances of supabase with supabaseClient
      // This regex ensures we only replace standalone 'supabase' variables, not parts of other words
      const finalContent = updatedContent.replace(/\bsupabase\b(?!\s*=|\s*from|\s*as|\s*import)/g, 'supabaseClient');
      
      // Write the updated content back to the file
      if (content !== finalContent) {
        fs.writeFileSync(filePath, finalContent, 'utf8');
        updatedFiles++;
        console.log(`Updated: ${filePath}`);
      } else {
        skippedFiles++;
        console.log(`No changes needed: ${filePath}`);
      }
    } else {
      skippedFiles++;
      console.log(`No import pattern match: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    errorFiles++;
  }
});

console.log(`\nSummary:`);
console.log(`- Successfully updated: ${updatedFiles} files`);
console.log(`- Skipped: ${skippedFiles} files`);
console.log(`- Errors: ${errorFiles} files`);
console.log(`\nBackups saved to: ${backupDir}`);
console.log('Remember to test the application to ensure all functionality works correctly');
