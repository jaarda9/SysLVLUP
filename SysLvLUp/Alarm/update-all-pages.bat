@echo off
echo Adding user management scripts to all HTML pages...
echo.

REM This batch file helps ensure all HTML pages use the centralized user management system
REM You need to manually add the following scripts to each HTML file:

REM Add these lines before other script tags:
REM     <script src="js/auth-manager.js"></script>
REM     <script src="js/user-manager.js"></script>

echo The following HTML files should include user management scripts:
echo.
echo index.html
echo alarm.html
echo status.html
echo daily_quest.html
echo Initiation.html
echo dental-study.html
echo Penalty_Quest.html
echo Quest_Info_Mental.html
echo Quest_Info_Physical.html
echo Quest_Info_Spiritual.html
echo Quest_Rewards.html
echo Rituaal.html
echo.
echo Please check each file and ensure these scripts are added:
echo     <script src="js/auth-manager.js"></script>
echo     <script src="js/user-manager.js"></script>
echo.
echo They should be placed before other script tags in the file.
echo.
pause
