#!/usr/bin/env node

/**
 * Script to update Supabase client imports across the codebase
 * This script updates all imports from the old pattern to the new singleton pattern
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all files that import supabase
const files = execSync('grep -l "import.*supabase" --include="*.ts" --include="*.tsx" src/hooks/', { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean);

console.log(`Found ${files.length} files with potential Supabase client imports`);

// Process each file
let updatedFiles = 0;

files.forEach(filePath => {
  try {
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if this file imports the old supabase client
    if (content.includes("import { supabase }") || 
        content.includes("import {supabase}") ||
        content.includes("import {  supabase")) {
      
      // Replace the import statement - handle various import patterns
      let updatedContent = content
        .replace(/import\s*{\s*supabase\s*}\s*from\s*["'](.+?)\/client["']/g, 'import { supabaseClient } from "$1/client"')
        .replace(/import\s*{\s*supabase\s*}\s*from\s*["'](.+?)\/supabase["']/g, 'import { supabaseClient } from "$1/supabase/client"')
        .replace(/import\s*{\s*supabase\s*}\s*from\s*["']@\/integration\/supabase["']/g, 'import { supabaseClient } from "@/integration/supabase/client"');
      
      // Replace all instances of supabase with supabaseClient
      // This regex ensures we only replace standalone 'supabase' variables, not parts of other words
      const finalContent = updatedContent.replace(/\bsupabase\b(?!\s*=|\s*from|\s*as|\s*import)/g, 'supabaseClient');
      
      // Write the updated content back to the file
      if (content !== finalContent) {
        fs.writeFileSync(filePath, finalContent, 'utf8');
        updatedFiles++;
        console.log(`Updated: ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
});

console.log(`\nSuccessfully updated ${updatedFiles} files`);
console.log('Remember to test the application to ensure all functionality works correctly');
