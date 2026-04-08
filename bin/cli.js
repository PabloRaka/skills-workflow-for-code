#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const command = args[0];

if (command === 'init') {
  const sourceBase = path.join(__dirname, '..');
  const targetBase = process.cwd();
  
  const foldersToCopy = ['.agents', 'workflows'];
  
  console.log('\x1b[36m%s\x1b[0m', '🤖 Initializing Agent System...');

  foldersToCopy.forEach(folder => {
    const source = path.join(sourceBase, folder);
    const target = path.join(targetBase, folder);

    if (fs.existsSync(source)) {
      copyRecursiveSync(source, target);
      console.log(`✅ Copied ${folder} to project root.`);
    } else {
      console.warn(`⚠️ Warning: Source folder ${folder} not found in package.`);
    }
  });

  console.log('\n\x1b[32m%s\x1b[0m', '🚀 Done! Your project is now equipped with Enterprise-Grade AI Agents.');
  console.log('Reference /workflow in your AI assistant to get started.\n');
} else {
  console.log('Usage: npx ag-skill init');
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    // Only copy file if it doesn't exist or we want to overwrite
    fs.copyFileSync(src, dest);
  }
}
