# RPA Traces Testing - Complete Guide

## 📋 Test Resources Overview

I've created a comprehensive test suite for the RPA Traces page at `http://localhost:3000/rpa-traces`. Here's your complete testing package:

---

## 📁 Test Files Created

### 1. **QUICK_TEST_CARD.md** ⚡ [START HERE]
**Purpose**: 5-minute quick test checklist
**Use when**: You want to do a fast visual verification
**Contains**:
- 30-item visual checklist
- Critical button tests
- Quick troubleshooting guide
- Report template

**File**: `C:\Users\simon.kritikos@sap.com\Desktop\CFB Pass-Automation\QUICK_TEST_CARD.md`

---

### 2. **EXPECTED_LAYOUT.txt** 🎨
**Purpose**: Visual diagram of expected page layout
**Use when**: You want to understand what the page should look like
**Contains**:
- ASCII art layout diagram
- Color scheme reference
- Interactive elements guide
- Responsive behavior notes

**File**: `C:\Users\simon.kritikos@sap.com\Desktop\CFB Pass-Automation\EXPECTED_LAYOUT.txt`

---

### 3. **TEST_SUMMARY.md** 📊
**Purpose**: Comprehensive test guide with detailed expectations
**Use when**: You need in-depth testing instructions
**Contains**:
- Complete page element breakdown
- Technical implementation details
- Data flow explanation
- 14 verification questions
- Troubleshooting section

**File**: `C:\Users\simon.kritikos@sap.com\Desktop\CFB Pass-Automation\TEST_SUMMARY.md`

---

### 4. **RPA_TRACES_TEST_REPORT.md** 📝
**Purpose**: Formal test procedure document
**Use when**: You need step-by-step testing procedures
**Contains**:
- 10-step manual test procedure
- Database requirements
- Screenshot checklist
- Known issues/TODOs
- Test result matrix

**File**: `C:\Users\simon.kritikos@sap.com\Desktop\CFB Pass-Automation\RPA_TRACES_TEST_REPORT.md`

---

### 5. **test-rpa-traces.sh** 🔧
**Purpose**: Shell script for manual testing setup
**Use when**: You want guided terminal-based testing
**Contains**:
- Server check
- Manual testing instructions
- Screenshot guidance
- Interactive checklist

**File**: `C:\Users\simon.kritikos@sap.com\Desktop\CFB Pass-Automation\test-rpa-traces.sh`

---

## 🚀 Quick Start (3 Steps)

### Step 1: Ensure Server is Running
The dev server should already be running. If not:
```bash
cd C:\Users\simon.kritikos@sap.com\Desktop\CFB Pass-Automation\apps\frontend
npm run dev
```

### Step 2: Open Quick Test Card
```bash
# Open in your text editor or read directly
cat QUICK_TEST_CARD.md
```

### Step 3: Test the Page
1. Open browser: http://localhost:3000
2. Login: passwart@cfb-niehl.de / Demo2026!Pass
3. Click "RPA Traces" in sidebar
4. Follow the 30-item checklist

---

## 🎯 What to Test

### Essential Tests (5 minutes)
✅ Visual verification of all elements
✅ Comparison slider works
✅ Buttons are present
✅ No console errors
✅ Screenshot of the page

### Full Tests (15 minutes)
✅ All essential tests
✅ Button interactions (click and verify)
✅ Link navigation (player name click)
✅ Multiple screenshots
✅ Detailed error reporting

---

## 📸 Required Screenshots

Please capture:
1. **Full page view** - Shows entire RPA Traces page
2. **Card detail** - Zoomed in on Max Spieler card
3. **Comparison slider** - Mid-drag to show both images
4. **Button hover** - Mouse over button showing hover state
5. **Console tab** - Browser DevTools showing no errors

Save to: `C:\Users\simon.kritikos@sap.com\Desktop\CFB Pass-Automation\screenshots\`

---

## 🔍 What You Should See

### Expected State: 1 Visual Regression Error

```
Header:
  "RPA Visual Regression"
  "1 Screenshot-Unterschied gefunden"

Card:
  Player: "Max Spieler" (clickable)
  Badge: "🔺 Diff: 0.35%" (red)
  Error Message: Present (red box)
  Comparison Slider: 2 images, draggable
  Buttons: "Neue Baseline akzeptieren" | "Bot erneut ausführen"
```

---

## 📊 Test Checklist Summary

| Category | Items | Time |
|----------|-------|------|
| Visual Elements | 17 items | 2 min |
| Interactions | 8 items | 2 min |
| Button Tests | 5 items | 1 min |
| Console Check | 1 item | 30 sec |
| **TOTAL** | **31 items** | **~5 min** |

---

## 🐛 Troubleshooting

### Issue: Can't see "RPA Traces" in sidebar
**Solution**: User must have PASSWART or SUPER_ADMIN role

### Issue: Page shows "Keine Visual Regression Errors"
**Solution**: Database needs test data with status VISUAL_REGRESSION_ERROR

### Issue: Images don't load
**Solution**: Screenshot files must exist in Supabase Storage buckets

### Issue: Buttons don't respond
**Solution**: Check browser console for errors, might need to refresh

---

## 📞 Support Files Reference

### Code Locations
- **Page Component**: `apps/frontend/app/(protected)/rpa-traces/page.tsx`
- **Server Actions**: `apps/frontend/app/(protected)/rpa-traces/actions.ts`
- **Sidebar Menu**: `apps/frontend/components/admin/admin-sidebar.tsx`

### Database Tables
- `rpa_traces` - Contains execution traces
- `registrations` - Contains player data
- `profiles` - Contains user roles

### Storage Buckets
- `rpa-baselines` - Baseline screenshots
- `rpa-screenshots` - Actual screenshots

---

## 📝 Report Template

After testing, please provide:

```markdown
## RPA Traces Test Results
**Date**: 2026-03-06
**Tester**: [Your Name]
**Browser**: [Chrome/Firefox/etc]

### ✅ PASSED
- [List successful tests]

### ❌ FAILED
- [List failed tests]

### 📸 SCREENSHOTS
- [Attach or link]

### 🐛 ISSUES FOUND
- [Describe any problems]

### 💬 NOTES
- [Additional observations]
```

---

## 🎓 Understanding the Page

### What is Visual Regression Testing?
The RPA bot takes screenshots of the DFBnet form during automation. These screenshots are compared to baseline images to detect:
- Form layout changes
- New fields added
- Element position shifts
- CSS changes

### Why 0.35% Diff?
- **Threshold**: 0.2% (anything above is flagged)
- **Max Spieler**: 0.35% diff (flagged as error)
- **Calculation**: Percentage of pixels that differ between baseline and actual

### What Happens When You Click Buttons?

**"Neue Baseline akzeptieren":**
- Accepts the new screenshot as the correct baseline
- Updates trace status to SUCCESS
- Next time bot runs, it will compare against this new baseline

**"Bot erneut ausführen":**
- Re-queues the registration for bot processing
- Changes registration status to READY_FOR_BOT
- Bot will attempt to process again (possibly fixing the issue)

---

## 🔄 Recommended Testing Flow

```
1. READ: QUICK_TEST_CARD.md (2 min)
   ↓
2. OPEN: http://localhost:3000/rpa-traces
   ↓
3. VERIFY: 30-item checklist (3 min)
   ↓
4. CAPTURE: 5 screenshots (2 min)
   ↓
5. TEST: Button interactions (2 min)
   ↓
6. REPORT: Fill out template (3 min)
   ↓
7. DONE: Total ~12 minutes
```

---

## 📚 Additional Resources

### For Quick Testing:
→ **QUICK_TEST_CARD.md**

### For Visual Reference:
→ **EXPECTED_LAYOUT.txt**

### For Detailed Testing:
→ **TEST_SUMMARY.md**

### For Formal Procedure:
→ **RPA_TRACES_TEST_REPORT.md**

---

## ✨ Ready to Test!

**Your next steps:**
1. Open **QUICK_TEST_CARD.md** (fastest option)
2. Navigate to http://localhost:3000/rpa-traces
3. Follow the checklist
4. Take screenshots
5. Report back with your findings!

---

## 🙋 Questions to Answer After Testing

Please answer these after testing:

1. Can you see the RPA Traces link in the sidebar? **(Y/N)**
2. Does the page load without errors? **(Y/N)**
3. Is "1 Screenshot-Unterschied gefunden" displayed? **(Y/N)**
4. Is Max Spieler's card visible? **(Y/N)**
5. Does the diff badge show "0.35%"? **(Y/N)**
6. Is the comparison slider draggable? **(Y/N)**
7. Are both action buttons visible and functional? **(Y/N)**
8. Are there any console errors? **(Y/N)**
9. Overall, does the page match the expected layout? **(Y/N)**
10. Any bugs or unexpected behavior? **(Describe)**

---

**Good luck with testing! 🚀**

All test files are located at:
`C:\Users\simon.kritikos@sap.com\Desktop\CFB Pass-Automation\`
