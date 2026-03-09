# RPA Traces Page - Test Summary

## Page Overview
The RPA Traces page displays visual regression errors from the RPA bot execution. When the bot takes screenshots and compares them to baseline images, any differences above 0.2% are flagged as visual regression errors.

## Expected Test Data
According to your requirements, there should be:
- **1 Visual Regression Error** for "Max Spieler"
- **Diff percentage**: 0.35%
- **Status**: VISUAL_REGRESSION_ERROR

## Page URL
```
http://localhost:3000/rpa-traces
```

## Access Requirements
- **Role Required**: PASSWART or SUPER_ADMIN
- **Test Credentials**: passwart@cfb-niehl.de / Demo2026!Pass

---

## Expected Page Elements

### 1. Header Section
```
┌─────────────────────────────────────────┐
│ RPA Visual Regression                   │
│ 1 Screenshot-Unterschied gefunden       │
└─────────────────────────────────────────┘
```

### 2. Error Card Structure
```
┌───────────────────────────────────────────────────────────────┐
│ Max Spieler                      [🔺 Diff: 0.35%]             │
│ DFB-ID: <id> | Team: <team> | Ausgeführt: 06.03.2026 HH:mm   │
│                                     Execution ID: exec-xxx     │
├───────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ [Error Message Box - Red Background]                    │  │
│ │ DFBnet Formular hat sich geändert: ...                  │  │
│ └─────────────────────────────────────────────────────────┘  │
├───────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐  │
│ │                                                          │  │
│ │   [Interactive Comparison Slider]                       │  │
│ │   Baseline ◄──────|──────► Actual                      │  │
│ │                                                          │  │
│ └─────────────────────────────────────────────────────────┘  │
├───────────────────────────────────────────────────────────────┤
│ [✓ Neue Baseline akzeptieren] [↻ Bot erneut ausführen]      │
└───────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### Header
- **Title**: "RPA Visual Regression"
- **Subtitle**: "1 Screenshot-Unterschied gefunden"
  - Text dynamically changes based on count
  - Singular: "1 Screenshot-Unterschied"
  - Plural: "2 Screenshot-Unterschiede"

### Player Card
**Header Row:**
- Player name (clickable → `/registrations/{id}`)
- Badge with diff percentage
- Badge color: RED (destructive) if diff > 0.2%
- Icon: AlertTriangle (⚠️) if high diff, CheckCircle (✓) if low

**Info Row:**
- DFB-ID
- Team name (if exists)
- Execution timestamp (German format: dd.MM.yyyy HH:mm)
- Execution ID (monospace font)

**Error Message:**
- Only shown if `error_message` exists
- Red background box
- Contains description of what changed

**Image Comparison:**
- Interactive slider from `react-compare-slider`
- Left: Baseline screenshot
- Right: Actual screenshot
- Draggable divider
- Height: 600px
- Shows actual visual differences

**Action Buttons:**
1. **"Neue Baseline akzeptieren"**
   - Accepts current screenshot as new baseline
   - Updates trace status to SUCCESS
   - Shows toast: "Baseline akzeptiert"
   - Card disappears after success

2. **"Bot erneut ausführen"**
   - Re-queues registration for bot execution
   - Updates registration status to READY_FOR_BOT
   - Shows toast: "Bot wird erneut ausgeführt"

---

## Technical Implementation Details

### Data Flow
```
1. Client → Server Action: getRPATraces()
2. Server → Supabase: Query rpa_traces WHERE status = 'VISUAL_REGRESSION_ERROR'
3. Server → Supabase Storage: Generate signed URLs for screenshots
4. Server → Client: Return traces with URLs
5. Client → UI: Render comparison sliders
```

### Query Details
```typescript
// Fetches from Supabase
.from("rpa_traces")
.select(`
  id,
  registration_id,
  execution_id,
  status,
  started_at,
  completed_at,
  error_message,
  visual_diff_score,
  screenshot_baseline,
  screenshot_actual,
  registrations!inner(
    player_name,
    player_dfb_id,
    status,
    teams(name)
  )
`)
.eq("status", "VISUAL_REGRESSION_ERROR")
.order("started_at", { ascending: false })
```

### Security
- All actions require PASSWART or SUPER_ADMIN role
- Uses `requireRole()` guard in Server Actions
- Signed URLs for screenshot access (expiring)
- No direct database access from client

### Performance
- Auto-refresh every 30 seconds (`refetchInterval: 30000`)
- Skeleton loading states
- Optimistic UI updates with mutation states
- Signed URLs are cached by Supabase

---

## Testing Checklist

### Visual Elements
- [ ] Header title visible
- [ ] Error count message correct
- [ ] Player name displayed
- [ ] Diff percentage badge visible
- [ ] Badge color is red (destructive)
- [ ] Alert triangle icon in badge
- [ ] DFB-ID shown
- [ ] Team name shown (if exists)
- [ ] Timestamp in German format
- [ ] Execution ID visible
- [ ] Error message box displayed
- [ ] Comparison slider renders
- [ ] Both screenshots visible
- [ ] Slider is draggable
- [ ] Both action buttons visible

### Interactions
- [ ] Player name links to registration detail
- [ ] "Neue Baseline akzeptieren" button clickable
- [ ] Button shows loading state when clicked
- [ ] Toast notification appears
- [ ] Card disappears after accepting
- [ ] "Bot erneut ausführen" button clickable
- [ ] Button shows loading state when clicked
- [ ] Toast notification appears

### Accessibility
- [ ] Page is keyboard navigable
- [ ] Focus states visible
- [ ] ARIA labels present
- [ ] Screen reader compatible
- [ ] Touch targets >= 44px

### Performance
- [ ] Page loads in < 2 seconds
- [ ] Images load smoothly
- [ ] No layout shift
- [ ] Smooth transitions
- [ ] No console errors

---

## Manual Testing Script

### Step-by-Step Testing

**1. Login**
```
URL: http://localhost:3000
Email: passwart@cfb-niehl.de
Password: Demo2026!Pass
Click: "Anmelden"
```

**2. Navigate to RPA Traces**
```
Click: "RPA Traces" in sidebar (Bot icon)
Wait: Page loads
```

**3. Visual Inspection**
```
Verify: Header shows "RPA Visual Regression"
Verify: Subtitle shows "1 Screenshot-Unterschied gefunden"
Verify: One error card visible
Verify: Player name is "Max Spieler"
Verify: Badge shows "Diff: 0.35%"
Verify: Badge is red color
Verify: Error message box present
Verify: Comparison slider visible with 2 images
```

**4. Interaction Test**
```
Try: Drag the comparison slider left/right
Verify: Slider moves smoothly
Verify: Can see both baseline and actual screenshots
Try: Click player name
Verify: Navigates to registration detail page
```

**5. Button Test**
```
Hover: Over "Neue Baseline akzeptieren"
Verify: Hover effect visible
Click: "Neue Baseline akzeptieren"
Verify: Button text changes to "Wird akzeptiert..."
Verify: Toast appears "Baseline akzeptiert"
Verify: Card disappears
Verify: Page shows success state
```

**6. Console Check**
```
Open: Browser DevTools (F12)
Tab: Console
Verify: No errors (red messages)
Tab: Network
Verify: All requests successful (green 200s)
```

---

## Expected Database State

For this test to work, you need:

### 1. User Account
```sql
-- profiles table
email: passwart@cfb-niehl.de
role: PASSWART
```

### 2. Registration
```sql
-- registrations table
player_name: Max Spieler
player_dfb_id: <any-id>
status: BOT_ERROR or VISUAL_REGRESSION_ERROR
team_id: <valid-team-id>
```

### 3. RPA Trace
```sql
-- rpa_traces table
registration_id: <max-spieler-registration-id>
execution_id: <any-unique-id>
status: VISUAL_REGRESSION_ERROR
visual_diff_score: 0.0035 (represents 0.35%)
screenshot_baseline: 'baselines/max-spieler.png'
screenshot_actual: 'screenshots/max-spieler-actual.png'
error_message: 'DFBnet Formular hat sich geändert: Neues Feld hinzugefügt'
started_at: <recent-timestamp>
```

### 4. Storage Files
```
Bucket: rpa-baselines
File: baselines/max-spieler.png

Bucket: rpa-screenshots
File: screenshots/max-spieler-actual.png
```

---

## Troubleshooting

### Issue: "RPA Traces" not visible in sidebar
**Cause**: User role is not PASSWART or SUPER_ADMIN
**Solution**: Check user profile role in database

### Issue: Page shows "Keine Visual Regression Errors"
**Cause**: No traces with status VISUAL_REGRESSION_ERROR
**Solution**: Check database for test data

### Issue: Images not loading
**Cause**: Signed URLs failed or files don't exist in Storage
**Solution**: Verify files exist in Supabase Storage buckets

### Issue: Buttons don't work
**Cause**: Auth session expired or network error
**Solution**: Refresh page, check browser console for errors

---

## Success Criteria

✅ **Test passes if:**
1. Login successful with test credentials
2. "RPA Traces" visible in sidebar for PASSWART user
3. Page loads without errors
4. Shows exactly 1 error card for "Max Spieler"
5. Badge shows "Diff: 0.35%" in red
6. Error message box visible
7. Comparison slider works and shows 2 different screenshots
8. Both action buttons are present and functional
9. No console errors
10. Toast notifications appear on button clicks

❌ **Test fails if:**
- Can't login
- Sidebar doesn't show "RPA Traces"
- Page shows empty state when data exists
- Images fail to load
- Buttons don't respond
- Console shows errors
- Toast notifications don't appear

---

## Next Steps After Testing

1. **Take screenshots** of the page
2. **Report findings**:
   - What works correctly?
   - What doesn't match expectations?
   - Any visual issues?
   - Any console errors?

3. **If test passes**, document:
   - Screenshot of successful state
   - Confirmation that all elements are visible

4. **If test fails**, document:
   - What specifically failed?
   - Screenshot of the issue
   - Console error messages
   - Network tab showing failed requests

---

## File Locations

- **Page Component**: `apps/frontend/app/(protected)/rpa-traces/page.tsx`
- **Server Actions**: `apps/frontend/app/(protected)/rpa-traces/actions.ts`
- **Sidebar**: `apps/frontend/components/admin/admin-sidebar.tsx`
- **Test Report**: `RPA_TRACES_TEST_REPORT.md`

---

## Questions to Answer After Testing

1. **Can you see the RPA Traces link in the sidebar?** (Y/N)
2. **Does clicking it navigate to /rpa-traces?** (Y/N)
3. **Is the header "RPA Visual Regression" visible?** (Y/N)
4. **Does it show "1 Screenshot-Unterschied gefunden"?** (Y/N)
5. **Is Max Spieler's card visible?** (Y/N)
6. **Does the badge show "Diff: 0.35%"?** (Y/N)
7. **Is the badge red/destructive color?** (Y/N)
8. **Is the error message box visible?** (Y/N)
9. **Does the comparison slider work?** (Y/N)
10. **Can you drag the slider left/right?** (Y/N)
11. **Are both action buttons visible?** (Y/N)
12. **Do buttons respond on hover?** (Y/N)
13. **Any console errors?** (Y/N - if yes, list them)
14. **Overall, does the page look complete and functional?** (Y/N)

---

**Ready to test! Please follow the manual testing script and report back with answers to the questions above.**
