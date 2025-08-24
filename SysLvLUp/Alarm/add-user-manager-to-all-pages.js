/**
 * Script to add user management scripts to all HTML pages
 * Run this script to ensure all pages use the centralized user management system
 */

const fs = require('fs');
const path = require('path');

// List of HTML files to update
const htmlFiles = [
  'index.html',
  'alarm.html', 
  'status.html',
  'daily_quest.html',
  'Initiation.html',
  'dental-study.html',
  'Penalty_Quest.html',
  'Quest_Info_Mental.html',
  'Quest_Info_Physical.html',
  'Quest_Info_Spiritual.html',
  'Quest_Rewards.html',
  'Rituaal.html'
];

// Scripts to add
const scriptsToAdd = [
  '<script src="js/auth-manager.js"></script>',
  '<script src="js/user-manager.js"></script>'
];

function addScriptsToFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if scripts are already present
    const hasAuthManager = content.includes('auth-manager.js');
    const hasUserManager = content.includes('user-manager.js');
    
    if (hasAuthManager && hasUserManager) {
      console.log(`Scripts already present in: ${filePath}`);
      return;
    }

    // Find the position to insert scripts (before other script tags)
    const scriptTagIndex = content.indexOf('<script src="');
    
    if (scriptTagIndex === -1) {
      console.log(`No script tags found in: ${filePath}`);
      return;
    }

    // Insert the scripts
    const beforeScripts = content.substring(0, scriptTagIndex);
    const afterScripts = content.substring(scriptTagIndex);
    
    const newContent = beforeScripts + 
                      scriptsToAdd.join('\n    ') + '\n    ' + 
                      afterScripts;

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);

  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

// Run the script for all HTML files
console.log('Adding user management scripts to all HTML pages...\n');

htmlFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  addScriptsToFile(filePath);
});

console.log('\nScript addition completed!');
