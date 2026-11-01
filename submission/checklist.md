# Devpost Submission Checklist & Human Instructions

**Competition:** STEMergent Hacks 2026  
**Devpost Submission URL:** [https://stemergent-hacks.devpost.com/](https://stemergent-hacks.devpost.com/)  
**Submission Deadline:** November 15, 2026 @ 9:30 PM CST  
**Selected Pathway:** Hackathon Pathway  

---

## 1. Human Action Required (You Submit on Devpost)

Per `AGENTS.md` rules, AI agents cannot log in, input account passwords, or click final Submit on competition platforms. You as the human will copy the pre-packaged fields and upload the generated assets.

---

## 2. Step-by-Step Submission Instructions

### Step 1: Open Devpost & Start Project
1. Log into your Devpost account at [https://stemergent-hacks.devpost.com/](https://stemergent-hacks.devpost.com/).
2. Click **"Join hackathon"** (if not already joined) and click **"Create a project"** or **"Manage project"**.

### Step 2: Fill Project Overview & Media
1. **Project Name:** Copy `RescueRoute` from `submission/fields.md`.
2. **Elevator Pitch:** Copy the one-liner tagline from `submission/fields.md`.
3. **Thumbnail:** Upload `submission/assets/thumbnail.png` (1200×800 PNG, 1.1 MB).
4. **Pathway:** Select **Hackathon Pathway**.
5. **Team Members:** Confirm your Devpost username is listed.

### Step 3: Paste Project Story ("About the Project")
1. In the **"About the Project"** Markdown editor, copy and paste the entire Markdown block from `submission/fields.md` (from `## Inspiration` through `## What's next for RescueRoute`).
2. Verify that headers render properly as `##` and bullet points are formatted cleanly.

### Step 4: Add "Built With" Tags
Add the following tags (separated by commas or pressing Enter):  
`react`, `typescript`, `vite`, `tailwindcss`, `playwright`, `logistics`, `food-rescue`, `social-good`, `routing-optimization`, `cold-chain`, `web-crypto-api`, `leaflet`, `accessibility`, `mobile-friendly`, `vercel`

### Step 5: "Try It Out" Links
1. **Live Demo URL:** `https://stemergent-hacks-2026.vercel.app`
2. **GitHub Repository URL:** `https://github.com/Georgefifth/stemergent-rescueroute`

### Step 6: Upload Image Gallery & Captions
Upload the 6 images from `submission/assets/gallery/` and copy their exact captions from `submission/fields.md`:
- [ ] `01-dispatch-radar.png` → Real-time Dispatch Board & Corridor Radar tracking perishable countdowns, vehicle capacity requirements, and donor hubs.
- [ ] `02-driver-manifest.png` → Mobile 390px Driver Manifest with 1-tap Google Maps turn-by-turn navigation and USDA cold-chain temperature verification.
- [ ] `03-route-optimizer.png` → Multi-stop TSP vehicle routing modal sequencing donor pickups by cold-chain urgency, calculating gas savings and carbon reduction.
- [ ] `04-tax-receipt.png` → Official IRS § 170(e)(3) 501(c)(3) tax receipt with donor/pantry EIN, verified scale weight, and tamper-evident SHA-256 hash.
- [ ] `05-tax-ledger.png` → 501(c)(3) Audit & Impact Ledger tracking total food rescued, equivalent meals provided, and CSV audit export.
- [ ] `06-live-production.png` → Live production deployment verified on Vercel Edge Network with zero errors across desktop and mobile devices.

### Step 7: Upload Demo Video
1. Video file is located at `submission/assets/demo.mp4` (1080p, 97.6s, 11.7 MB).
2. Upload this video to YouTube (set to Public or Unlisted) OR upload directly to the Devpost video input if file upload is supported.
3. Paste the public video URL into the Devpost **"Video Demo URL"** field.

### Step 8: Final Review & Submit
1. Review all fields against the verification checklist below.
2. Click **"Save and preview"** to verify visual presentation.
3. Click **"Submit project"** before the announced deadline.

---

## 3. Pre-Submission Quality Checklist

- [x] **Live Deployed Site Accessible:** `https://stemergent-hacks-2026.vercel.app` (HTTP/2 200 OK verified).
- [x] **GitHub Repository Clean & Public:** `https://github.com/Georgefifth/stemergent-rescueroute` (Zero secrets, zero `.env`, clean commit history).
- [x] **Real-World Validation (Stage 3.5):** 20/20 benchmark cases verified against USDA/FDA rules (Verdict: PASS).
- [x] **Playwright QA (Stage 3):** 14/14 automated scenarios passed across desktop and mobile viewports.
- [x] **Demo Video (Stage 4):** 1080p MP4 with voiceover, subtitles, BGM, and frame verification (`submission/assets/demo.mp4`).
- [x] **Thumbnail:** Custom 3:2 PNG generated (`submission/assets/thumbnail.png`).
- [x] **Gallery Images:** 6 high-res screenshots with concise captions under 150 characters each.
- [x] **Markdown Compatibility:** Standard Markdown headers (`##`), zero unclosed tags, and no LaTeX formula dependencies.
