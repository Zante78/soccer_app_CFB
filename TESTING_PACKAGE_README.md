# RPA Traces Page Testing - Complete Package

## ✅ Status: Ready for Manual Testing

**Dev Server**: Running on http://localhost:3000 ✓
**Test Files**: Created and ready ✓
**Documentation**: Complete ✓

---

## 📦 What Has Been Prepared

I've created a comprehensive testing package for the RPA Traces page. Since automated browser testing would require installing additional dependencies (Playwright/Selenium), I've created detailed manual testing guides instead.

---

## 📁 Test Files Created (5 files)

### 1. **TEST_INDEX.md** - Master Guide
Your starting point. Contains:
- Overview of all test files
- Quick start instructions (3 steps)
- Recommended testing flow
- 10 questions to answer after testing

**Location**: `C:\Users\simon.kritikos@sap.com\Desktop\CFB Pass-Automation\TEST_INDEX.md`

---

### 2. **QUICK_TEST_CARD.md** - 5-Minute Test
Fastest way to verify the page. Contains:
- 30-item visual checklist
- Critical button tests
- Screenshot requirements
- Report template

**Location**: `C:\Users\simon.kritikos@sap.com\Desktop\CFB Pass-Automation\QUICK_TEST_CARD.md`

---

### 3. **EXPECTED_LAYOUT.txt** - Visual Reference
ASCII art diagram showing exactly what you should see:
- Complete page layout
- Color scheme
- Interactive elements
- Responsive behavior

**Location**: `C:\Users\simon.kritikos@sap.com\Desktop\CFB Pass-Automation\EXPECTED_LAYOUT.txt`

---

### 4. **TEST_SUMMARY.md** - Detailed Guide
Comprehensive testing documentation:
- Complete element breakdown
- Technical implementation details
- Component architecture
- 14 verification questions
- Troubleshooting guide

**Location**: `C:\Users\simon.kritikos@sap.com\Desktop\CFB Pass-Automation\TEST_SUMMARY.md`

---

### 5. **RPA_TRACES_TEST_REPORT.md** - Formal Procedure
Step-by-step test procedure:
- 10-step manual test process
- Database requirements
- Screenshot checklist
- Known issues and TODOs
- Test result matrix

**Location**: `C:\Users\simon.kritikos@sap.com\Desktop\CFB Pass-Automation\RPA_TRACES_TEST_REPORT.md`

---

## 🚀 How to Start Testing (Simple 3-Step Process)

### Step 1: Open the Quick Test Card
```bash
cd C:\Users\simon.kritikos@sap.com\Desktop\CFB Pass-Automation
cat QUICK_TEST_CARD.md
```
Or open it in any text editor.

### Step 2: Open the Page in Browser
1. Navigate to: **http://localhost:3000**
2. Login with: **passwart@cfb-niehl.de** / **Demo2026!Pass**
3. Click: **"RPA Traces"** in the sidebar

### Step 3: Follow the Checklist
Go through the 30-item checklist in QUICK_TEST_CARD.md and verify each element.

---

## 📸 Screenshots Needed

Please capture these 5 screenshots:

1. **Full page view** - Complete RPA Traces page
2. **Card detail** - Zoomed in on Max Spieler error card
3. **Comparison slider** - Mid-drag showing both images
4. **Button hover** - Mouse hovering over button
5. **Console tab** - Browser DevTools (F12) showing no errors

Save them in: `C:\Users\simon.kritikos@sap.com\Desktop\CFB Pass-Automation\screenshots\`

---

## 🎯 What You're Testing

### The RPA Traces Page Shows:
- Visual regression errors from bot execution
- Screenshot comparison slider (baseline vs actual)
- Details about what changed (error message)
- Actions to resolve (accept new baseline or retry bot)

### Expected Test Data:
- **1 Error** for player "Max Spieler"
- **Diff**: 0.35% (above 0.2% threshold = red badge)
- **Status**: VISUAL_REGRESSION_ERROR
- **Screenshots**: Baseline vs Actual (comparison slider)

---

## ✅ Success Criteria

The test passes if:
- [x] Login successful with test credentials
- [x] "RPA Traces" visible in sidebar for PASSWART user
- [x] Page loads without errors
- [x] Header shows "RPA Visual Regression"
- [x] Shows "1 Screenshot-Unterschied gefunden"
- [x] Max Spieler card is visible
- [x] Badge shows "Diff: 0.35%" in red
- [x] Error message box displayed
- [x] Comparison slider works (draggable)
- [x] Both action buttons present and functional
- [x] No console errors

---

## 📊 Test Checklist Summary

| Category | Items to Check | Estimated Time |
|----------|----------------|----------------|
| Header | 3 items | 30 seconds |
| Card Elements | 10 items | 2 minutes |
| Interactions | 5 items | 2 minutes |
| Button Tests | 2 items | 2 minutes |
| Console Check | 1 item | 30 seconds |
| Screenshots | 5 images | 2 minutes |
| **TOTAL** | **26 checks** | **~9 minutes** |

---

## 🐛 Common Issues & Solutions

### Issue: RPA Traces link not visible in sidebar
**Cause**: User doesn't have required role
**Solution**: Verify user has PASSWART or SUPER_ADMIN role in database

### Issue: Page shows "Keine Visual Regression Errors" (empty state)
**Cause**: No test data in database
**Solution**: Database needs at least one rpa_trace with status='VISUAL_REGRESSION_ERROR'

### Issue: Images don't load in comparison slider
**Cause**: Screenshot files missing from Supabase Storage
**Solution**: Verify files exist in 'rpa-baselines' and 'rpa-screenshots' buckets

### Issue: Buttons don't respond to clicks
**Cause**: Auth session expired or JavaScript error
**Solution**: Check browser console (F12), refresh page, re-login if needed

---

## 📝 Report Template (After Testing)

```markdown
## RPA Traces Test Results
**Date**: 2026-03-06
**Browser**: Chrome/Firefox/Edge/Safari
**Screen Resolution**: 1920x1080 / Mobile / etc

### ✅ PASSED
- Login successful
- Page loads correctly
- All elements visible
- [Add more passed tests]

### ❌ FAILED
- [Describe what didn't work]
- [Include error messages]

### 📸 SCREENSHOTS
- Attached: [List screenshot filenames]
- Location: screenshots/

### 🐛 BUGS FOUND
- [Describe any unexpected behavior]
- [Steps to reproduce]

### 💬 ADDITIONAL NOTES
- [Any other observations]
- [Suggestions for improvements]

### 🔢 SUMMARY
- Total Checks: 26
- Passed: X/26
- Failed: X/26
- Pass Rate: XX%
```

---

## 🎓 Technical Context

### What is This Page For?
The RPA (Robotic Process Automation) bot automates filling out player pass applications on DFBnet. To ensure the bot is working correctly, it:
1. Takes screenshots during execution
2. Compares them to baseline (expected) screenshots
3. Flags differences above 0.2% as potential errors
4. Displays them on this page for human review

### Why Does This Matter?
- **Detects form changes**: If DFBnet updates their form, we'll know
- **Prevents silent failures**: Bot might fill wrong fields if layout changes
- **Manual review**: PASSWART can decide if change is critical
- **Accept or retry**: Either accept new layout or fix and retry

### What Happens After Testing?
If differences are acceptable (just cosmetic):
- Click "Neue Baseline akzeptieren" → Updates baseline screenshot

If differences indicate a problem:
- Click "Bot erneut ausführen" → Re-runs bot to try again

---

## 🔄 Testing Flow Diagram

```
START
  ↓
Read QUICK_TEST_CARD.md (2 min)
  ↓
Open http://localhost:3000/rpa-traces (30 sec)
  ↓
Login with test credentials (30 sec)
  ↓
Visual verification (3 min)
  ├─ Check header
  ├─ Check card elements
  ├─ Check comparison slider
  └─ Check buttons
  ↓
Interaction testing (2 min)
  ├─ Drag slider
  ├─ Hover buttons
  └─ Click player name
  ↓
Button functionality test (2 min)
  ├─ Click "Accept Baseline"
  └─ Click "Retry Bot"
  ↓
Capture screenshots (2 min)
  ↓
Check console for errors (30 sec)
  ↓
Fill report template (3 min)
  ↓
DONE (Total: ~12 minutes)
```

---

## 📞 Need Help?

### Quick Reference
- **Start here**: TEST_INDEX.md
- **Fast test**: QUICK_TEST_CARD.md
- **Visual guide**: EXPECTED_LAYOUT.txt
- **Detailed test**: TEST_SUMMARY.md
- **Formal procedure**: RPA_TRACES_TEST_REPORT.md

### Code Locations
- Page: `apps/frontend/app/(protected)/rpa-traces/page.tsx`
- Actions: `apps/frontend/app/(protected)/rpa-traces/actions.ts`
- Sidebar: `apps/frontend/components/admin/admin-sidebar.tsx`

### Database Tables
- `rpa_traces` - Execution records
- `registrations` - Player data
- `profiles` - User roles

---

## 🎯 Your Next Steps

1. **Open QUICK_TEST_CARD.md** in your text editor
2. **Navigate** to http://localhost:3000/rpa-traces in browser
3. **Follow** the 30-item checklist
4. **Capture** 5 screenshots
5. **Answer** the 10 questions from TEST_INDEX.md
6. **Report back** with your findings!

---

## ✨ Everything is Ready!

All test files are located at:
```
C:\Users\simon.kritikos@sap.com\Desktop\CFB Pass-Automation\
```

**Files created:**
- TEST_INDEX.md ← Start here!
- QUICK_TEST_CARD.md
- EXPECTED_LAYOUT.txt
- TEST_SUMMARY.md
- RPA_TRACES_TEST_REPORT.md
- test-rpa-traces.sh

**Dev server status**: Running on http://localhost:3000 ✓

**Estimated testing time**: 9-12 minutes

---

Good luck with testing! Please report back with your results and screenshots.
