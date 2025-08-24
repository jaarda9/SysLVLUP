const fs = require('fs');
const path = require('path');

/**
 * Verification script to ensure all hardcoded userIds are removed
 */

// Files to check for hardcoded userIds
const filesToCheck = [
    // Core files
    'js/user-manager.js',
    'js/auth-manager.js',
    'js/sync.js',
    'js/multi-device-setup.js',
    'js/init-user-manager.js',
    
    // Game files
    'js/alarm.js',
    'js/login.js',
    'js/daily_quest.js',
    'js/dental-study.js',
    'js/Initiation.js',
    'js/Penalty_Quest.js',
    'js/Quest_Info_Mental.js',
    'js/Quest_Info_Physical.js',
    'js/Quest_Info_Spiritual.js',
    'js/Quest_Rewards.js',
    'js/Rituaal.js',
    
    // HTML files
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

// Patterns to check for
const patternsToCheck = [
    'single_user_12345',
    'single_user',
    '12345',
    'hardcoded',
    'fixed user'
];

// Function to check a single file
function checkFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            return { exists: false, issues: [] };
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const issues = [];

        patternsToCheck.forEach(pattern => {
            const matches = content.match(new RegExp(pattern, 'gi'));
            if (matches) {
                issues.push({
                    pattern: pattern,
                    count: matches.length,
                    lines: content.split('\n')
                        .map((line, index) => ({ line: line.trim(), number: index + 1 }))
                        .filter(({ line }) => line.toLowerCase().includes(pattern.toLowerCase()))
                        .map(({ line, number }) => `Line ${number}: ${line}`)
                        .slice(0, 3) // Show first 3 matches
                });
            }
        });

        return { exists: true, issues };
    } catch (error) {
        return { exists: false, error: error.message };
    }
}

// Function to check all files
function verifyCleanup() {
    console.log('🔍 Verifying cleanup of hardcoded userIds...\n');
    
    let totalFiles = 0;
    let filesWithIssues = 0;
    let totalIssues = 0;

    filesToCheck.forEach(file => {
        totalFiles++;
        const result = checkFile(file);
        
        if (!result.exists) {
            console.log(`❌ File not found: ${file}`);
            return;
        }

        if (result.error) {
            console.log(`❌ Error reading ${file}: ${result.error}`);
            return;
        }

        if (result.issues.length > 0) {
            filesWithIssues++;
            console.log(`⚠️  Issues found in: ${file}`);
            result.issues.forEach(issue => {
                totalIssues += issue.count;
                console.log(`   - Pattern "${issue.pattern}": ${issue.count} occurrences`);
                issue.lines.forEach(line => {
                    console.log(`     ${line}`);
                });
            });
            console.log('');
        } else {
            console.log(`✅ Clean: ${file}`);
        }
    });

    console.log('\n📊 Summary:');
    console.log(`Total files checked: ${totalFiles}`);
    console.log(`Files with issues: ${filesWithIssues}`);
    console.log(`Total issues found: ${totalIssues}`);

    if (filesWithIssues === 0) {
        console.log('\n🎉 SUCCESS: All hardcoded userIds have been removed!');
        console.log('✅ The codebase is clean and ready for deployment.');
    } else {
        console.log('\n⚠️  WARNING: Some hardcoded userIds still exist.');
        console.log('Please review the issues above and fix them.');
    }

    return { totalFiles, filesWithIssues, totalIssues };
}

// Function to check for proper userId generation
function verifyUserIdGeneration() {
    console.log('\n🔍 Verifying userId generation patterns...\n');
    
    const userIdPatterns = [
        'Date.now()',
        'Math.random()',
        'localStorage.getItem',
        'user_',
        'getOrCreateUserId'
    ];

    const coreFiles = [
        'js/user-manager.js',
        'js/sync.js',
        'js/init-user-manager.js'
    ];

    let allGood = true;

    coreFiles.forEach(file => {
        const result = checkFile(file);
        if (!result.exists) {
            console.log(`❌ Core file missing: ${file}`);
            allGood = false;
            return;
        }

        const content = fs.readFileSync(file, 'utf8');
        const missingPatterns = [];

        userIdPatterns.forEach(pattern => {
            if (!content.includes(pattern)) {
                missingPatterns.push(pattern);
            }
        });

        if (missingPatterns.length > 0) {
            console.log(`⚠️  Missing patterns in ${file}:`);
            missingPatterns.forEach(pattern => {
                console.log(`   - ${pattern}`);
            });
            allGood = false;
        } else {
            console.log(`✅ Proper userId generation in: ${file}`);
        }
    });

    if (allGood) {
        console.log('\n🎉 SUCCESS: Proper userId generation is implemented!');
    } else {
        console.log('\n⚠️  WARNING: Some userId generation patterns are missing.');
    }

    return allGood;
}

// Run verification
if (require.main === module) {
    const cleanupResult = verifyCleanup();
    const generationResult = verifyUserIdGeneration();
    
    if (cleanupResult.filesWithIssues === 0 && generationResult) {
        console.log('\n🚀 READY FOR DEPLOYMENT!');
        console.log('All issues have been resolved and the system is ready.');
    } else {
        console.log('\n⚠️  Please fix the remaining issues before deployment.');
    }
}

module.exports = {
    verifyCleanup,
    verifyUserIdGeneration,
    checkFile
};
