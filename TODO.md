# TODO: Fix Total Score and Percentage Display in Results

## Problem Analysis
The total score and percentage are not displaying correctly in the Results page at `/admin-dashboard/results`

### Root Causes Identified:
1. **Frontend field name mismatch**: The frontend is looking for wrong field names when extracting from the API response
2. **Data transformation issue**: The data might be coming as undefined or default values (0)

### Files to Modify:
1. `src/pages/Results/ResultList.js` - Fix the data extraction logic

### Fix Plan:
1. Fix the getNestedValue function to properly extract from PascalCase fields
2. Ensure TotalScoreObtained, MaximumTotalScore, and Percentage are correctly mapped
3. Add better debugging/logging to trace data flow

### Steps:
1. [x] Read and understand current ResultList.js implementation
2. [x] Fix the data extraction to use correct PascalCase field names from backend
3. [ ] Test the fix

## COMPLETED - Fix Applied

The frontend fix has been applied. The changes ensure:
- TotalScoreObtained is extracted from Summary object first (PascalCase)
- MaximumTotalScore is extracted from Summary object first (PascalCase)
- Percentage is extracted from Summary object first (PascalCase)
- Values are properly converted to Numbers using Number()

Changes made to ResultList.js:
```javascript
// Before (wrong):
const summary = rc.summary || rc.Summary || rc;

// After (fixed):
const summary = rc.Summary || rc.summary || rc;

// And field extraction now uses PascalCase directly:
const totalScore = Number(getNestedValue(summary, ['TotalScoreObtained']) || ...) || 0;
const maximumScore = Number(getNestedValue(summary, ['MaximumTotalScore']) || ...) || 0;
const percentage = Number(getNestedValue(summary, ['Percentage']) || ...) || 0;
```

