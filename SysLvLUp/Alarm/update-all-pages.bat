@echo off
echo Adding user manager to all HTML pages...

REM Add user manager script to all HTML files
for %%f in (*.html) do (
    echo Processing %%f...
    powershell -Command "(Get-Content '%%f') -replace '</body>', '    <script src=\"js/user-manager.js\"></script>^r^n    <script>^r^n      document.addEventListener(''DOMContentLoaded'', function() {^r^n        if (window.userManager) {^r^n          console.log(''User manager initialized with userId:'', window.userManager.getUserId());^r^n          window.userManager.loadUserData().then(result => {^r^n            console.log(''Initial data load result:'', result);^r^n          }).catch(error => {^r^n            console.error(''Error loading initial data:'', error);^r^n          });^r^n        } else {^r^n          console.warn(''User manager not available'');^r^n        }^r^n      });^r^n    </script>^r^n    </body>' | Set-Content '%%f'"
)

echo Done! All HTML files have been updated with user manager initialization.
pause
