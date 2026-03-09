# RPA Traces Page - Quick Test Card

## 🚀 Quick Start
```bash
URL: http://localhost:3000/rpa-traces
Login: passwart@cfb-niehl.de / Demo2026!Pass
```

## ✅ Visual Checklist (30 seconds)

### Header (3 items)
- [ ] "RPA Visual Regression" title visible
- [ ] "1 Screenshot-Unterschied gefunden" shown
- [ ] Clean, professional layout

### Max Spieler Card (10 items)
- [ ] Player name "Max Spieler" visible and clickable
- [ ] Red badge with "Diff: 0.35%"
- [ ] Alert triangle icon (⚠️) in badge
- [ ] DFB-ID displayed
- [ ] Team name displayed
- [ ] Timestamp in German format (dd.MM.yyyy HH:mm)
- [ ] Execution ID visible (small, monospace)
- [ ] Red error message box present
- [ ] Comparison slider with 2 images visible
- [ ] Slider is draggable left/right

### Action Buttons (2 items)
- [ ] "Neue Baseline akzeptieren" button (blue, left)
- [ ] "Bot erneut ausführen" button (outlined, right)

### Interactions (5 items)
- [ ] Player name link works (hover = blue)
- [ ] Buttons show hover effect
- [ ] Comparison slider drags smoothly
- [ ] Both images load properly
- [ ] No console errors (F12 → Console tab)

## 🎯 Critical Test (Click buttons)

### Test 1: Accept Baseline
1. Click "Neue Baseline akzeptieren"
2. **Expect**:
   - Button → "Wird akzeptiert..."
   - Toast: "Baseline akzeptiert"
   - Card disappears
   - Success message appears

### Test 2: Retry Bot
1. Refresh page (to get card back)
2. Click "Bot erneut ausführen"
3. **Expect**:
   - Button → "Startet..."
   - Toast: "Bot wird erneut ausgeführt"

## 📸 Screenshots Needed
1. Full page view
2. Card detail (zoomed in)
3. Comparison slider (mid-drag)
4. Button hover state
5. Console tab (showing no errors)

## 🐛 Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Link not in sidebar | Wrong role | Check user is PASSWART/SUPER_ADMIN |
| Empty state shown | No test data | Check database has VISUAL_REGRESSION_ERROR trace |
| Images don't load | Storage issue | Check Supabase Storage files exist |
| Buttons don't work | Auth expired | Refresh page, re-login |

## 📝 Report Template

```
TEST RESULTS - RPA Traces Page
Date: [DATE]
Browser: [Chrome/Firefox/Edge]

✅ PASSED:
- [List what worked]

❌ FAILED:
- [List what didn't work]

SCREENSHOTS:
- [Attach or link to screenshots]

CONSOLE ERRORS:
- [Copy/paste any errors]

NOTES:
- [Any additional observations]
```

## 📞 Questions? Check:
- Detailed test: `RPA_TRACES_TEST_REPORT.md`
- Test summary: `TEST_SUMMARY.md`
- Expected layout: `EXPECTED_LAYOUT.txt`

---

**⏱️ Time to test: ~5 minutes**
**🎯 Goal: Verify all 30 checklist items**
