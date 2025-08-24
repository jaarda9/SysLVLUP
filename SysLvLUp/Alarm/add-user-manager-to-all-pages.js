const fs = require('fs');
const path = require('path');

/**
 * Script to add user manager initialization to all HTML pages
 * This ensures consistent userId generation and data loading across all pages
 */

// List of HTML files that need user manager initialization
const htmlFiles = [
    'index.html',
    'alarm.html',
    'status.html',
    'daily_quest.html',
    'dental-study.html',
    'Initiation.html',
    'Penalty_Quest.html',
    'Quest_Info_Mental.html',
    'Quest_Info_Physical.html',
    'Quest_Info_Spiritual.html',
    'Quest_Rewards.html',
    'Rituaal.html'
];

// Template for user manager initialization script
const userManagerScript = `
    <!-- User Manager Initialization -->
    <script src="js/user-manager.js"></script>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        // Ensure user manager is loaded
        if (window.userManager) {
          console.log('User manager initialized with userId:', window.userManager.getUserId());
          
          // Load user data immediately
          window.userManager.loadUserData().then(result => {
            console.log('Initial data load result:', result);
          }).catch(error => {
            console.error('Error loading initial data:', error);
          });
        } else {
          console.warn('User manager not available');
        }
      });
    </script>
`;

// Function to add user manager to a single HTML file
function addUserManagerToFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`File not found: ${filePath}`);
            return false;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if user manager is already present
        if (content.includes('user-manager.js')) {
            console.log(`User manager already present in: ${filePath}`);
            return true;
        }

        // Find the position to insert scripts (before closing body tag)
        const bodyCloseIndex = content.lastIndexOf('</body>');
        
        if (bodyCloseIndex === -1) {
            console.log(`No </body> tag found in: ${filePath}`);
            return false;
        }

        // Insert the user manager script before </body>
        const beforeBodyClose = content.substring(0, bodyCloseIndex);
        const afterBodyClose = content.substring(bodyCloseIndex);
        
        const newContent = beforeBodyClose + userManagerScript + afterBodyClose;

        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated: ${filePath}`);
        return true;

    } catch (error) {
        console.error(`Error updating ${filePath}:`, error.message);
        return false;
    }
}

// Function to process all HTML files
function processAllHtmlFiles() {
    console.log('Adding user manager to all HTML pages...\n');
    
    let successCount = 0;
    let totalCount = 0;

    htmlFiles.forEach(file => {
        totalCount++;
        const filePath = path.join(__dirname, file);
        if (addUserManagerToFile(filePath)) {
            successCount++;
        }
    });

    console.log(`\nProcessing completed!`);
    console.log(`Successfully updated: ${successCount}/${totalCount} files`);
    
    if (successCount === totalCount) {
        console.log('✅ All HTML files have been updated with user manager initialization.');
    } else {
        console.log('⚠️  Some files could not be updated. Check the logs above.');
    }
}

// Run the script
if (require.main === module) {
    processAllHtmlFiles();
}

module.exports = {
    addUserManagerToFile,
    processAllHtmlFiles,
    userManagerScript
};
