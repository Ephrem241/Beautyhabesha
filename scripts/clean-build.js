#!/usr/bin/env node

/**
 * Clean build artifacts and rebuild
 * 
 * This script:
 * 1. Removes .next directory
 * 2. Removes node_modules/.cache
 * 3. Regenerates Prisma client
 * 4. Runs a fresh build
 * 
 * Usage:
 *   node scripts/clean-build.js
 *   npm run clean-build
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');

function removeDir(dirPath) {
  const fullPath = path.join(rootDir, dirPath);
  if (fs.existsSync(fullPath)) {
    console.log(`🗑️  Removing ${dirPath}...`);
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`✅ Removed ${dirPath}`);
  } else {
    console.log(`⏭️  ${dirPath} doesn't exist, skipping...`);
  }
}

function runCommand(command, description) {
  console.log(`\n🔧 ${description}...`);
  try {
    execSync(command, { 
      cwd: rootDir, 
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' }
    });
    console.log(`✅ ${description} complete`);
  } catch (error) {
    console.error(`❌ ${description} failed`);
    process.exit(1);
  }
}

console.log('🧹 Starting clean build process...\n');

// Step 1: Remove build artifacts
removeDir('.next');
removeDir('node_modules/.cache');

// Step 2: Regenerate Prisma client
runCommand('npx prisma generate', 'Regenerating Prisma client');

// Step 3: Run build
runCommand('npm run build', 'Building application');

console.log('\n🎉 Clean build complete!\n');
console.log('Next steps:');
console.log('  1. Run: npm run start');
console.log('  2. Visit: http://localhost:3000');
console.log('  3. Verify all pages load correctly\n');

