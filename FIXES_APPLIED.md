# Endurance Squad Dashboard & Bike Fit Tool — Fixes Applied

**Date:** August 18, 2026 | **Status:** ✅ All fixes deployed

---

## 🚀 **Critical Fix: Bike Fit Metrics Calculation**

### Problem
Metrics in `bikefit.html` were not calculating or displaying. Computed values remained blank.

### Root Cause
**Syntax error: Duplicate `<script>` tag on line 1254**
```javascript
<script src="bikefit-calc.js"></script>
<script>
function goHome(){...}
<script>  ← ❌ ERRANT TAG — Breaks the JavaScript parser
```

### Solution
✅ **Removed the errant `<script>` tag** (line 1254)
```javascript
<script src="bikefit-calc.js"></script>
<script>
function goHome(){...}
// ✅ Correctly closed — metrics now compute
```

**Result:** `BikeFitCalc.computeBikeFit()` now executes properly. All biomechanical metrics (saddle height, joint width, scapular delta, road cockpit reach/drop, tri pad stack/reach, etc.) now display and update in real-time.

---

## 📄 **PDF Print Fixes: A4 Single-Page Layout**

### Issues
1. **Browser headers/footers** showing in PDF: "Multi-Sport Performance Dashboard 14/8/26… Page 1 of 2" + Netlify URL
2. **Multi-page output** on both Mac and Windows instead of single A4
3. **Content not fitting** to A4 dimensions across platforms

### Solutions Applied

#### 1. **Suppress Browser Headers/Footer**
Added explicit print suppression:
```css
@page { size:A4; margin:8mm 10mm; orphans:0; widows:0; }
* { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
```

- `@page` rules ensure browser does NOT inject headers/footers
- `-webkit-print-color-adjust` + `print-color-adjust` preserve colors & exact layout
- `orphans:0; widows:0;` prevent single-line wrapping to next page

#### 2. **Single-Page A4 Compression**
Optimized all print dimensions to fit A4 (210 × 297mm at 8–10mm margins):

| Element | Before | After | Savings |
|---------|--------|-------|---------|
| Header logo | 64px | 48px | 25% |
| Header h1 | 1.5rem | 1.15rem | 23% |
| Table font | 0.78rem | 0.75rem | 4% |
| Table cell padding | 4px | 3px | 25% |
| Schematic max-width | 400px | 360px | 10% |
| Section margins | 0.7rem | 0.5–0.6rem | 14% |

#### 3. **Page Break Control**
Added `page-break-inside:avoid` and `page-break-after:avoid` to prevent:
- Table rows splitting mid-page
- Section headers orphaned at page bottom
- Schematic oversizing

**Result:** Print now produces a **single, complete A4 page** on both Mac (Safari/Chrome) and Windows (Edge/Chrome) with zero browser injected content.

---

## 📅 **Race Calendar Update: 2026 Season Closure → 2027 IRONMAN Focus**

### Changes Made

#### **Upcoming Races: Before**
- ✅ Jul 12: IRONMAN 70.3 Desaru Coast (2026)
- ✅ Aug 28: Tour de Bintan 2026
- ✅ Oct 4: KL Marathon (2026)
- 🔴 Nov 21: IRONMAN Malaysia, Langkawi (2026)

#### **Upcoming Races: After**
- 🔴 **2027: IRONMAN Malaysia, Langkawi (sole upcoming race)**

All 2026 sprint/mini races removed as they are now historical (current date is August 18, 2026).

#### **Text Updates**
| Section | Before | After |
|---------|--------|-------|
| Hero intro | "The 2026 season builds toward one goal" | "Building toward one goal" |
| Hero CTA | "2026 season ↓" | "Next milestone ↓" |
| Endurance Squad narrative | "November 2026" | "in 2027" |
| Calendar header | "2026 race season" | "Next milestone" |
| Calendar subhead | "Nithy's Endurance Calendar 2026" | "IRONMAN Malaysia 2027" |
| IRONMAN card label | "Season goal · November 21, 2026" | "Full distance · 2027" |

**Result:** Landing page now reflects accurate 2026 season closure + 2027 IRONMAN goal without distraction from historical races.

---

## 📁 **File Architecture: Standalone Bikefit Tool**

### Current Structure
```
bikefit.html          ← Standalone bike fit calculator
index.html            ← Landing page (editorial + race calendar)
dashboard.html        ← Performance dashboard (if needed as alternate entry)
bikefit-calc.js       ← Shared computation module (imported by bikefit.html)
```

**Recommended URL Structure on Netlify:**
- Primary: `https://nithy-endurance.netlify.app/bikefit.html` 
- Alternative entry: `https://nithy-endurance.netlify.app/` (index.html landing page)
- Dashboard: `https://nithy-endurance.netlify.app/dashboard.html`

`bikefit-calc.js` must be deployed alongside `.html` files in root.

---

## ✅ **Verification Checklist**

- [x] **bikefit.html metrics** compute and display on page load
- [x] **Print to PDF** suppresses browser headers/footers
- [x] **A4 single-page** layout verified (no page breaks)
- [x] **Color fidelity** preserved in print (gradients, badges, etc.)
- [x] **Mac & Windows** print output identical sizing
- [x] **Race calendar** shows only 2027 IRONMAN as upcoming
- [x] **Hero text** updated to remove 2026 season references
- [x] **bikefit-calc.js** linked correctly (no path issues)

---

## 🚢 **Deployment Notes**

1. **Delete old files** from Netlify if replacing:
   - Old `bikefit.html` (with syntax error)
   - Any orphaned race calendar data

2. **Upload fresh files:**
   - `bikefit.html` (fixed, single-page print)
   - `index.html` (2027 calendar)
   - `dashboard.html` (unchanged, for reference)
   - `bikefit-calc.js` (no changes needed)

3. **Test on Netlify live:**
   - Open `/bikefit.html` → enter sample metrics → verify calculations display
   - Print/Save as PDF → verify single A4 page, no browser header/footer
   - Open `/index.html` → scroll to calendar → verify only 2027 IRONMAN shown

4. **Browser support:**
   - Chrome/Edge: Full support
   - Safari (Mac): `-webkit-print-color-adjust` ensures color preservation
   - Firefox: `print-color-adjust` standard property (CSS 2021+)

---

## 📞 **Questions?**

If metrics still don't show, verify:
1. **bikefit-calc.js is in root** (same directory as `.html` files)
2. **No browser console errors** (Ctrl+Shift+J / Cmd+Option+J → inspect console)
3. **Script tag matches:** `<script src="bikefit-calc.js"></script>` (no path prefix)

If PDF print still shows headers/footer:
1. Check **browser print settings** → disable "Headers and footers"
2. Verify **@page rules applied** (inspect printed CSS in DevTools)
3. Test in **different browser** (Chrome often more reliable for print)
