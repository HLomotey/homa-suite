const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const copyFileAsync = promisify(fs.copyFile);

// Configuration
const rootDir = path.resolve(__dirname, '../src');
const backupDir = path.resolve(__dirname, '../supabase-import-backups');
const dryRun = false; // Set to true to only log changes without modifying files

// Create backup directory if it doesn't exist
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Patterns to replace
const importPatterns = [
  {
    find: /import\s+{\s*supabase\s*}\s+from\s+['"]@\/integration\/supabase(?:\/client)?['"];?/g,
    replace: 'import { supabaseClient } from "@/integration/supabase/client";'
  },
  {
    find: /import\s+{\s*supabase\s*}\s+from\s+['"]@\/integration\/supabase['"];?/g,
    replace: 'import { supabaseClient } from "@/integration/supabase/client";'
  }
];

// Variable usage patterns
const usagePatterns = [
  {
    find: /\bsupabase\./g,
    replace: 'supabaseClient.'
  }
];

// Files to skip (core files or already updated files)
const skipFiles = [
  'client.ts',
  'index.ts',
  'supabaseClient.ts'
];

// Function to check if a file should be skipped
function shouldSkipFile(filePath) {
  return skipFiles.some(skipFile => filePath.includes(skipFile));
}

// Function to create a backup of a file
async function backupFile(filePath) {
  const relativePath = path.relative(path.resolve(__dirname, '..'), filePath);
  const backupPath = path.join(backupDir, relativePath);
  
  // Create directory structure if it doesn't exist
  const backupDirPath = path.dirname(backupPath);
  if (!fs.existsSync(backupDirPath)) {
    fs.mkdirSync(backupDirPath, { recursive: true });
  }
  
  await copyFileAsync(filePath, backupPath);
  console.log(`Backed up: ${filePath} -> ${backupPath}`);
  return backupPath;
}

// Function to process a file
async function processFile(filePath) {
  try {
    if (shouldSkipFile(filePath)) {
      console.log(`Skipping: ${filePath}`);
      return false;
    }

    const content = await readFileAsync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;

    // Check for import patterns
    for (const pattern of importPatterns) {
      if (pattern.find.test(newContent)) {
        newContent = newContent.replace(pattern.find, pattern.replace);
        hasChanges = true;
      }
    }

    // Only check for usage patterns if we found an import to replace
    if (hasChanges) {
      for (const pattern of usagePatterns) {
        newContent = newContent.replace(pattern.find, pattern.replace);
      }

      if (!dryRun) {
        await backupFile(filePath);
        await writeFileAsync(filePath, newContent, 'utf8');
        console.log(`Updated: ${filePath}`);
      } else {
        console.log(`Would update: ${filePath}`);
      }
    }

    return hasChanges;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Function to walk through directories recursively
async function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let updatedFiles = 0;

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        updatedFiles += await walkDir(fullPath);
      }
    } else if (
      entry.isFile() && 
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js'))
    ) {
      const updated = await processFile(fullPath);
      if (updated) updatedFiles++;
    }
  }

  return updatedFiles;
}

// Main function
async function main() {
  console.log(`Starting Supabase import update script (${dryRun ? 'DRY RUN' : 'LIVE RUN'})`);
  console.log(`Root directory: ${rootDir}`);
  console.log(`Backup directory: ${backupDir}`);
  
  const startTime = Date.now();
  const updatedFiles = await walkDir(rootDir);
  const endTime = Date.now();
  
  console.log(`\nCompleted in ${(endTime - startTime) / 1000} seconds`);
  console.log(`Updated ${updatedFiles} files`);
}

main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
