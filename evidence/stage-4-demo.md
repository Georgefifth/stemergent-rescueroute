# Stage 4 — Demo Video & Presentation Artifacts

**Product:** RescueRoute — Community Food Rescue & Volunteer Vehicle Dispatch Platform  
**Video File:** `evidence/stage-4-demo/demo.mp4`  
**Video Spec:** 1920 × 1080 (1080p), 30 fps, H.264 video, AAC audio with sidechain BGM & UI Foley  
**Duration:** 97.6 seconds  
**File Size:** 11.7 MB  
**Date:** November 2026  

---

## 1. Narrative Arc & Scene Breakdown

The demo video follows the **Clinical / Operational Proof** narrative arc, combining high-impact problem definition with real software execution and verified benchmark metrics:

| Scene # | Scene ID | Mode / Preset | Visual Focus | Voiceover Hook | Duration |
|---|---|---|---|---|---|
| **01** | `01-title-hook` | Card (`swiss`, `hero`) | Architectural Swiss grid, product identity & track badges | "Across America, forty percent of food is wasted while families face hunger..." | 11.0s |
| **02** | `02-problem-comparison` | Card (`swiss`, `compare`) | Side-by-side matrix: Status Quo (manual chaos) vs. RescueRoute Dispatch | "Traditional pantries coordinate through chaotic text messages, and food spoils..." | 14.2s |
| **03** | `03-live-dispatch-console` | Live App (`session: app`) | Real-time Corridor Radar, countdown timers, vehicle matching | "On the Dispatch Board, countdown timers monitor the two-hour safety window..." | 12.9s |
| **04** | `04-live-driver-manifest` | Live App (`session: app`) | Mobile Driver View, 1-tap Google Maps GPS, USDA temp check (144°F) | "In the car, the volunteer gets turn-by-turn navigation in one tap..." | 15.3s |
| **05** | `05-live-tax-receipt` | Live App (`session: app`) | Official IRS § 170(e)(3) Certificate with SHA-256 seal | "Upon arrival, the pantry signs off... RescueRoute instantly mints a tamper-evident SHA-256 receipt..." | 17.6s |
| **06** | `06-live-route-optimizer` | Live App (`session: app`) | Multi-stop TSP vehicle routing, fuel & carbon savings | "For multi-donor runs, our TSP route optimizer sequences pickups by cold-chain urgency..." | 12.1s |
| **07** | `07-impact-metrics` | Card (`swiss`, `metrics`) | 100% USDA compliance, Feeding America meal metrics, EPA carbon factors | "With verified benchmark accuracy, Feeding America meal metrics, and zero-install volunteer access..." | 13.0s |

---

## 2. Visual Quality & Frame QA Inspection

Frame QA samples were extracted at intervals across the video to verify layout diversity, subtitle readability, and absence of video clipping:

1. **`frame-2.png` (Title Hook):** Clean Swiss typography (`Space Grotesk` + `JetBrains Mono`), high-contrast title, subtitle clearly legible.
2. **`frame-12.png` / `frame-24.png` (Comparison Matrix):** Clear red/green status markers contrasting manual spreadsheets against RescueRoute's automated radar.
3. **`frame-45.png` (Live Driver Manifest):** Floating macOS container framing, active cursor movement, mobile navigation button highlighted, bottom caption zone unblocked.
4. **`frame-65.png` (Verified 501(c)(3) Receipt):** High-density printable certificate modal displaying donor/pantry EIN, verified weight (85 lbs), and SHA-256 cryptographic seal.
5. **`frame-85.png` (Benchmark Metrics Close):** Giant metric figures (`100%`, `1.2 lbs / meal`, `2.5 lbs CO2e`) grounded in Stage 3.5 validation evidence.

---

## 3. Audio & Subtitle Synchronization

- **Voiceover Engine:** Microsoft Azure Speech (`en-GB-RyanNeural`) synthesized via `edge-tts`.
- **Background Music:** Synthesized `crisp-minimal` ambient soundtrack matched to Swiss architectural theme with automatic `sidechaincompress` voiceover ducking.
- **Subtitles:** ASS subtitle stream with burned-in contrast styling; key terms (`'RescueRoute'`, `'dispatch console'`, `'vehicle route optimization'`, `'safe temperature'`, `'SHA-256'`, `'IRS Section 170(e)(3)'`) highlighted in accent orange.
