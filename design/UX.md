# UX Contract — RescueRoute (Community Food Rescue & Vehicle Dispatch)

> Acceptance contract for RescueRoute frontend. All implementations, states, and responsive views must adhere strictly to this document.

## 1. Product

- **One-liner:** Lightweight, zero-install community food rescue and volunteer vehicle dispatch console with real-time perishable cold-chain countdowns and multi-stop route optimization.
- **Primary user:** Community food pantry coordinators and volunteer drivers using personal vehicles ("cars") to transport surplus perishable food from commercial donors (supermarkets, dining halls, bakeries) to local pantries.
- **Job to be done:** When a donor has 20–200 lbs of surplus perishables that will spoil in 2 hours, dispatch a nearby volunteer vehicle, optimize the multi-stop pickup-to-pantry run, guide the driver via turn-by-turn navigation, and log verified poundage for 501(c)(3) tax records.
- **Core success action:** A volunteer driver claims an urgent surplus food run, optimizes the pickup route, confirms pickup with temperature check, and completes delivery with a signed digital receipt.
- **What the user should never have to guess:**
  1. How many minutes remain before the food violates safety/temperature codes.
  2. Whether the surplus will fit into their vehicle ("car" type: compact sedan, hatchback, SUV/van).
  3. The exact street address and contact phone at both the pickup loading dock and the recipient pantry.
  4. Whether a run has already been claimed by another driver.

---

## 2. Core Flow

| # | Step | User Action | System Feedback | Next Step Obvious? |
|---|---|---|---|---|
| 1 | **Discover & Filter** | Coordinator or volunteer lands on Dispatch Board; filters by urgency, vehicle type, or distance. | Live list updates instantly; countdown timers tick down in real-time; map markers highlight donor and pantry hubs. | Yes: prominent "Claim Run" or "New Rescue Run" button. |
| 2 | **Route Optimization** | Coordinator/driver selects pending stops and clicks "Optimize Route". | Heuristic TSP algorithm sequences stops in order of perishable urgency and minimal travel distance, updating the visual route timeline. | Yes: "Assign to Driver" or "Launch Driver Manifest". |
| 3 | **Driver Manifest & Navigation** | Volunteer opens Driver View on mobile (or desktop emulator). | Clean mobile card shows Stop 1 (Pickup), cargo type/weight, loading dock notes, and 1-tap "Open in Google Maps". | Yes: big green button "Confirm Pickup & Check Temperature". |
| 4 | **Delivery & Tax Receipt** | Driver arrives at Pantry, logs actual received weight (lbs), and clicks "Complete Rescue". | Immediate success confirmation; 501(c)(3) tax receipt and environmental impact tally (meals saved, CO2e averted) generated with printable PDF download. | Yes: "Back to Dispatch Board" or "Print Receipt". |

**Target:** ≤ 4 steps and ≤ 2 minutes from viewing a surplus alert to dispatching an optimized route.

---

## 3. Pages / Views

RescueRoute operates as an integrated, responsive single-page dispatch console with dedicated mode switches:

| Page / Mode | Purpose | Primary Action | Secondary Actions |
|---|---|---|---|
| **Dispatch Console (Overview)** | Monitor active surplus donations, cold-chain countdowns, pantry stock levels, and fleet drivers. | Create New Surplus Alert | Filter by vehicle type, toggle map view, batch route optimization. |
| **Route Planner & Sequence View** | Arrange multi-donor pickups into single volunteer vehicle runs based on trunk capacity. | Optimize Route Sequence (TSP) | Reorder stops manually, assign volunteer vehicle, calculate fuel savings. |
| **Volunteer Driver Manifest (Mobile 390px)** | Distraction-free driver interface for in-transit execution with 1-tap GPS navigation. | Confirm Stop (Pickup / Drop-off) | Call donor coordinator, log temperature check, report capacity issue. |
| **Tax Receipt & Impact Dashboard** | Audit-ready 501(c)(3) donation records, volunteer hours, and hunger relief metrics. | Download / Print Tax Receipt | Export CSV ledger, filter by date range, share community impact card. |

*Rule:* One primary action per view. Secondary actions are visually subordinate with outline or ghost styling.

---

## 4. Required States

For every view and interactive component:

- [x] **Empty / First Visit:** Shows helpful empty state explanation with a 1-click "Load Community Demo Data" button (pre-populating realistic grocery donors, student pantries, and active driver runs).
- [x] **Loading:** Skeleton loading and spinner states for route calculation and data fetching; no frozen or unresponsive UI.
- [x] **Success:** Immediate visual feedback with animated checkmark banners and confirmed poundage totals.
- [x] **Error:** Clear descriptive error banner (e.g. "Pickup window has expired" or "Vehicle capacity exceeded") with immediate recovery action button ("Adjust Stops" or "Reset Filters").
- [x] **Invalid Input:** Inline red warning labels under form fields with exact validation rules (e.g. "Weight must be greater than 0 lbs", "Valid contact phone required").
- [x] **No Permission / Filter Zero:** "No runs match your vehicle filter (Compact Sedan)" with 1-click button to reset filter.
- [x] **Mobile 390px Layout:** Fluid layout without horizontal scroll; sticky bottom action bar for drivers; thumb-friendly tap targets ≥ 48px.

---

## 5. Design Tokens

- **Font Family:**
  - UI Text: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`
  - Monospace Data / Timers / Quantities: `"JetBrains Mono", "SF Mono", Consolas, monospace`
- **Spacing Scale:**
  - `space-1`: 4px, `space-2`: 8px, `space-3`: 12px, `space-4`: 16px, `space-6`: 24px, `space-8`: 32px
- **Colors:**
  - Canvas Background: `#F8FAFC` (Slate 50)
  - Surface Card: `#FFFFFF` (White)
  - High-Contrast Text: `#0F172A` (Slate 900)
  - Secondary / Muted Text: `#475569` (Slate 600)
  - Brand Primary / Safe Window: `#15803D` (Emerald 700) with `#DCFCE7` (Emerald 100)
  - Urgency Warning (< 90 min): `#D97706` (Amber 600) with `#FEF3C7` (Amber 100)
  - Critical / Expiring (< 30 min): `#DC2626` (Red 600) with `#FEE2E2` (Red 100)
  - Border Lines: `#CBD5E1` (Slate 300) and `#E2E8F0` (Slate 200)
- **Radius & Borders:**
  - Standard Card Radius: `8px` (`rounded-lg`)
  - Button Radius: `6px` (`rounded-md`)
  - Border: Crisp `1px solid #E2E8F0`, zero heavy blurry shadows.
- **Touch Target:** Minimum `48px` height for all mobile buttons, inputs, and tab triggers.
- **Icon Style:** Clean SVG vector line icons, 2px stroke width, consistent 20px / 24px bounding boxes. No emojis used as functional icons.

---

## 6. References

| Reference | What to Borrow | What NOT to Copy |
|---|---|---|
| **Routific Dispatch Console** | Split-pane architecture: left-hand order queue with status chips + right-hand sequence map. | Proprietary commercial branding, paywalled fleet tracking. |
| **Bringfood Open-Source** | Volunteer stop status flow (`Pending -> In Transit -> Completed`) and recipient drop-off notes. | Outbound-only model; dated form styling; lack of donor intake and perishable timers. |
| **Feeding America Meal Metric Standards** | Mathematical formula: 1.2 lbs of food = 1 meal; 2.5 kg CO2e averted per kg of food saved. | Complex enterprise ERP data models. |

---

## 7. Mobile Layout (390px Viewport)

- **Layout Structure:** Single vertical column with collapsible summary drawer.
- **Primary Driver Action:** Always anchored in a high-contrast sticky bottom action bar (e.g. "Navigate to Trader Joe's (Stop 1/3)" or "Confirm 45 lbs Collected").
- **What is Collapsed:** Map view collapses to an expandable modal/sheet; secondary metadata (donor business registration ID) collapses behind "Details" accordion.
- **Keyboard Behavior:** Auto-scrolls active input above the keyboard with `scroll-into-view-if-needed`.

---

## 8. Visual Direction

- **Three Adjectives:** Operational, High-Contrast, Mission-Critical.
- **Product Archetype:** **Dispatch Console & Field Logistics Terminal**.
- **Palette Rationale:** Grounded in community food rescue and commercial food safety standards. Emerald Green (`#15803D`) represents sustainability and completed rescues; Industrial Slate (`#0F172A`) ensures daylight outdoor legibility for drivers; Signal Amber (`#D97706`) and Hazard Red (`#DC2626`) warn against food temperature violations.
- **Type Pairing:** System UI Sans for fast reading + Monospace for addresses, weights, timers, and route stops.
- **Density:** High density on desktop dispatch console (coordinators manage 10+ runs at a glance); high thumb-friendly clarity on mobile driver view.
- **Signature Element:** **The Cold-Chain Urgency Radar & Corridor Sequence Ticker** — a high-contrast timeline showing real-time perishable countdown bars, temperature compliance badges, and vehicle capacity meter (`[Sedan: 65% Full]`).
- **Motion Rules:** Functional state transitions only (150ms ease-out for modals, smooth badge pulse for critical runs). Zero decorative loops or parallax.
- **Rejected Clichés:** Purple/blue gradients, dark glassmorphism, floating blur cards, generic KPI blocks without actions, emoji icons, abstract decorative 3D blobs.

**Generic Test Pass Criterion:** If the header and cards are viewed out of context, the user immediately identifies this as an emergency food recovery and vehicle routing system, not a generic SaaS dashboard.

---

## 9. UX Acceptance Criteria

- [ ] A first-time user can explain the product's purpose within 5 seconds of viewing the console.
- [ ] A volunteer can claim a run, view turn-by-turn navigation, and complete a delivery without reading a user manual.
- [ ] Perishable food countdown timers update dynamically every second and change color as deadlines approach.
- [ ] Multi-stop route optimization runs in < 200ms and visualizes the sequential route stops clearly.
- [ ] Responsive design functions seamlessly at 390px (mobile driver), 768px (tablet), and 1440px (desktop dispatch).
- [ ] 501(c)(3) tax receipt and impact certificate generate cleanly with verifiable poundage and environmental savings.
- [ ] All 6 states (Empty, Loading, Success, Error, Invalid Input, Filter-Zero) are fully implemented and verifiable.
