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

console.log('User manager initialization script template created.');
console.log('Add this script to all HTML files before the closing </body> tag:');
console.log(userManagerScript);
