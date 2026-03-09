# RPA Traces Page - Manual Test Report

## Test Environment
- **URL**: http://localhost:3000/rpa-traces
- **Test Date**: 2026-03-06
- **Browser**: Chrome (recommended)
- **Required Login**: passwart@cfb-niehl.de / Demo2026!Pass

---

## Test Procedure

### Step 1: Login
1. Navigate to http://localhost:3000
2. If not logged in, use credentials:
   - Email: `passwart@cfb-niehl.de`
   - Password: `Demo2026!Pass`
3. Click "Anmelden" button

**Expected Result**: Successfully logged in and redirected to dashboard

---

### Step 2: Navigate to RPA Traces
1. Look for the sidebar on the left (on mobile, click the hamburger menu)
2. Find "RPA Traces" menu item with Bot icon
3. Click on "RPA Traces"

**Expected Result**:
- Sidebar shows "RPA Traces" menu item (only visible for PASSWART and SUPER_ADMIN roles)
- Clicking navigates to `/rpa-traces` page

---

### Step 3: Verify Page Header
**Expected Elements**:
- [ ] Header title: "RPA Visual Regression"
- [ ] Subtitle: "Screenshot-Vergleich von Bot-Ausführungen"
- [ ] Error count message: "1 Screenshot-Unterschied gefunden"

---

### Step 4: Verify Error Card - "Max Spieler"
**Expected Elements**:
- [ ] Player name: "Max Spieler" (clickable link)
- [ ] Badge with diff percentage: "Diff: 0.35%"
- [ ] Badge color: Red/destructive (since 0.35% > 0.2% threshold)
- [ ] Alert triangle icon in badge
- [ ] DFB-ID displayed
- [ ] Team name displayed (if available)
- [ ] Execution timestamp in format: "dd.MM.yyyy HH:mm"
- [ ] Execution ID (small monospace text)

---

### Step 5: Verify Error Message
**Expected Elements**:
- [ ] Red error message box (if error_message exists in database)
- [ ] Error text displayed in red box

---

### Step 6: Verify Image Comparison Slider
**Expected Elements**:
- [ ] Interactive comparison slider showing two images:
  - **Left side**: Baseline screenshot (expected)
  - **Right side**: Actual screenshot (current)
- [ ] Slider is draggable to compare images
- [ ] Images are displayed at 600px height
- [ ] Border around comparison area

**Visual Check**:
- Can you see differences between the two screenshots?
- Does the diff percentage (0.35%) make sense with what you see?

---

### Step 7: Verify Action Buttons
**Expected Elements**:
- [ ] Button 1: "Neue Baseline akzeptieren"
  - Has CheckCircle icon
  - Located on the left
  - Full width (flex-1)
- [ ] Button 2: "Bot erneut ausführen"
  - Has RefreshCw icon
  - Outlined variant
  - Located on the right
  - Full width (flex-1)

---

### Step 8: Test Button Interactions

#### Test "Neue Baseline akzeptieren"
1. Click "Neue Baseline akzeptieren" button
2. **Expected**:
   - Button text changes to "Wird akzeptiert..."
   - Button becomes disabled
   - Toast notification appears: "Baseline akzeptiert"
   - Card disappears (status updated to SUCCESS)
   - Header updates: "Keine Visual Regression Errors"
   - Success message: "Alle Bot-Ausführungen waren erfolgreich! 🎉"

#### Test "Bot erneut ausführen"
1. Click "Bot erneut ausführen" button
2. **Expected**:
   - Button text changes to "Startet..."
   - Button becomes disabled
   - Toast notification appears: "Bot wird erneut ausgeführt"
   - Registration status updated to READY_FOR_BOT

---

### Step 9: Check Console for Errors
1. Open browser DevTools (F12)
2. Go to Console tab
3. **Expected**: No JavaScript errors or warnings
4. Check Network tab for failed requests

---

### Step 10: Test Empty State
**If no visual regression errors exist:**
- [ ] Header: "RPA Visual Regression"
- [ ] Green CheckCircle icon (large, centered)
- [ ] Success title: "Keine Visual Regression Errors"
- [ ] Success message: "Alle Bot-Ausführungen waren erfolgreich! 🎉"

---

## Data Requirements

### Database State Needed
For this test to work, the database must have:

```sql
-- RPA Trace with VISUAL_REGRESSION_ERROR status
INSERT INTO rpa_traces (
  registration_id,
  execution_id,
  status,
  started_at,
  visual_diff_score,
  screenshot_baseline,
  screenshot_actual,
  error_message
) VALUES (
  '<registration-id-for-max-spieler>',
  'exec-123-456',
  'VISUAL_REGRESSION_ERROR',
  NOW(),
  0.0035,  -- 0.35%
  'baselines/max-spieler-baseline.png',
  'screenshots/max-spieler-actual.png',
  'DFBnet Formular hat sich geändert: Neues Feld "Datenschutz" wurde hinzugefügt'
);

-- Registration for Max Spieler
-- Must exist in registrations table with player_name = 'Max Spieler'
```

### Screenshot Files Required
The following files must exist in Supabase Storage:
- **Bucket**: `rpa-baselines`
  - File: `baselines/max-spieler-baseline.png`
- **Bucket**: `rpa-screenshots`
  - File: `screenshots/max-spieler-actual.png`

---

## Screenshot Checklist

**Please take screenshots of:**
1. Login page (if shown)
2. Dashboard with visible "RPA Traces" link in sidebar
3. RPA Traces page - Full page view
4. RPA Traces page - Card detail with comparison slider
5. Button hover states
6. Toast notifications (when clicking actions)
7. Empty state (if accessible)
8. Browser console (showing no errors)

---

## Known Issues / TODOs

From code analysis, these features are marked as TODO:
1. `acceptNewBaseline()` currently only updates status, doesn't copy files
2. `retryBotExecution()` doesn't trigger n8n webhook yet
3. Signed URLs are generated but need valid Supabase Storage setup

---

## Technical Notes

### Component Architecture
- **Client Component**: Uses `"use client"` directive
- **Data Fetching**: TanStack Query with 30s refetch interval
- **Server Actions**: All data operations via Server Actions (secure)
- **Auth**: Requires PASSWART or SUPER_ADMIN role
- **Comparison Slider**: Uses `react-compare-slider` library

### Performance
- Skeleton loading states during data fetch
- Optimistic UI updates with mutation states
- Auto-refresh every 30 seconds

### Accessibility
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus visible states
- Touch targets meet accessibility standards

---

## Test Result Summary

| Test Case | Status | Notes |
|-----------|--------|-------|
| Login | ⬜ | |
| Navigate to RPA Traces | ⬜ | |
| Page Header | ⬜ | |
| Error Card - Max Spieler | ⬜ | |
| Error Message Box | ⬜ | |
| Image Comparison Slider | ⬜ | |
| Action Buttons | ⬜ | |
| Accept Baseline Button | ⬜ | |
| Retry Bot Button | ⬜ | |
| Console Errors | ⬜ | |
| Empty State | ⬜ | |

**Legend**: ✅ Pass | ❌ Fail | ⬜ Not Tested | ⚠️ Partial

---

## Manual Testing Instructions

Since automated testing requires additional dependencies, please perform manual testing:

1. **Start the dev server** (if not already running):
   ```bash
   cd apps/frontend
   npm run dev
   ```

2. **Open browser**: Navigate to http://localhost:3000

3. **Follow steps 1-10** above and check off each item

4. **Take screenshots** as listed in the Screenshot Checklist

5. **Report back** with:
   - Which tests passed/failed
   - Screenshots (especially of the RPA Traces page)
   - Any console errors
   - Any unexpected behavior

---

## Quick Verification Commands

```bash
# Check if dev server is running
curl -s http://localhost:3000 | grep -i "doctype"

# Check if RPA traces endpoint exists (will show HTML or redirect)
curl -s http://localhost:3000/rpa-traces | grep -i "rpa"

# Check database for test data
# (Requires Supabase access - run in Supabase SQL Editor)
SELECT
  rt.id,
  rt.status,
  rt.visual_diff_score,
  r.player_name
FROM rpa_traces rt
JOIN registrations r ON r.id = rt.registration_id
WHERE rt.status = 'VISUAL_REGRESSION_ERROR'
ORDER BY rt.started_at DESC;
```

---

## Contact

If you encounter issues during testing, check:
1. **Auth**: User must have PASSWART or SUPER_ADMIN role
2. **Database**: Test data must exist (see Data Requirements section)
3. **Storage**: Screenshot files must exist in Supabase Storage
4. **Environment**: `.env.local` must have correct Supabase credentials
