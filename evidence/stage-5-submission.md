# Stage 5 — Submission Package Evidence

**Project:** RescueRoute — Community Food Rescue & Volunteer Vehicle Dispatch Platform  
**Competition:** STEMergent Hacks 2026 (Devpost: `https://stemergent-hacks.devpost.com/`)  
**Submission Package Directory:** `submission/`  
**Date:** November 2026  

---

## 1. Submission Package Artifact Inventory

All files required for the Devpost submission are generated, verified, and organized in `submission/`:

| Artifact | File Path | Format / Dimensions | Description |
|---|---|---|---|
| **Submission Form Fields** | `submission/fields.md` | Markdown text | Field-by-field copy-paste values for Devpost. |
| **Submission Checklist** | `submission/checklist.md` | Markdown text | Human instructions and pre-submission checklist. |
| **Project Thumbnail** | `submission/assets/thumbnail.png` | PNG (1200 × 800, 3:2, 1.1 MB) | Custom visual thumbnail with brand mark and key features. |
| **Narrated Demo Video** | `submission/assets/demo.mp4` | MP4 (1080p, 30fps, 97.6s, 11.7 MB) | Full video with voiceover, subtitles, BGM, and live UI demo. |
| **Gallery Image 1** | `submission/assets/gallery/01-dispatch-radar.png` | PNG (1440 × 900, 161 KB) | Real-time Dispatch Board & Corridor Radar. |
| **Gallery Image 2** | `submission/assets/gallery/02-driver-manifest.png` | PNG (390 × 844, 73 KB) | Mobile 390px Driver Manifest with 1-tap GPS. |
| **Gallery Image 3** | `submission/assets/gallery/03-route-optimizer.png` | PNG (1440 × 900, 209 KB) | Multi-stop TSP vehicle routing modal with fuel savings. |
| **Gallery Image 4** | `submission/assets/gallery/04-tax-receipt.png` | PNG (1440 × 900, 246 KB) | Official IRS § 170(e)(3) 501(c)(3) tax receipt. |
| **Gallery Image 5** | `submission/assets/gallery/05-tax-ledger.png` | PNG (1440 × 900, 140 KB) | 501(c)(3) Audit & Impact Ledger with CSV export. |
| **Gallery Image 6** | `submission/assets/gallery/06-live-production.png` | PNG (1440 × 900, 161 KB) | Live production verification on Vercel. |

---

## 2. Public URLs Verification

Both primary project links were verified via automated HTTP requests and browser sessions:

| Target Resource | URL | Status Code | Verification Method |
|---|---|---|---|
| **Production Deployment** | [https://stemergent-hacks-2026.vercel.app](https://stemergent-hacks-2026.vercel.app) | **HTTP/2 200 OK** | Verified via Playwright headless Chromium and curl. |
| **Public GitHub Repository** | [https://github.com/Georgefifth/stemergent-rescueroute](https://github.com/Georgefifth/stemergent-rescueroute) | **HTTP/2 200 OK** | Verified clean repository, public access, zero secrets. |

---

## 3. Grounding & Claims Traceability

All metrics, capabilities, and claims in `submission/fields.md` are directly backed by verified evidence:

1. **USDA Cold-Chain Safety Rules:** Tested in `evidence/stage-3.5-validation/validation-report.md` (Cases `VAL-02`, `VAL-09`, `VAL-10`).
2. **Vehicle Payload & Capacity:** Tested in `evidence/stage-3.5-validation/validation-report.md` (Cases `VAL-04`, `VAL-05`, `VAL-06`, `VAL-14`).
3. **Feeding America & EPA Factors:** Tested in `evidence/stage-3.5-validation/validation-report.md` (Case `VAL-01`: 1.2 lbs = 1 meal, 2.5 lbs CO2e/lb).
4. **End-to-End Execution Speed:** Measured during Playwright QA in `evidence/stage-3-qa/report.md` (< 200ms route calculation, < 120s full flow).

---

## 4. Human Handoff Status

- [x] Submission package files (`fields.md`, `assets/`, `checklist.md`) are complete and self-contained.
- [x] Thumbnail meets 3:2 ratio and is under 5 MB.
- [x] All 6 gallery images are high resolution and have captions under 150 characters.
- [x] Demo video is 1080p MP4 with voiceover and subtitles, under 100 MB.
- [x] Paused for human action: The human will now perform the manual submission on Devpost using the prepared package.
