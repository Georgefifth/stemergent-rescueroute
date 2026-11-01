# Stage 3 QA — Scenario Inventory

**Target Product:** RescueRoute (Community Food Rescue & Vehicle Dispatch Console)  
**Test Matrix:** Deployed Site (`https://stemergent-hacks-2026.vercel.app`) & Local Build (`http://127.0.0.1:5188`)  
**Viewports:** Desktop (1440 × 900) & Mobile (390 × 844)  

---

### Scenario Matrix & Prioritization

| ID | Title | Priority | Flow Scope | Key Assertion |
|---|---|---|---|---|
| `smoke` | Landing Page & Layout Integrity | **P0** | Initial visit, title, navigation, no horizontal overflow. | `overflow <= 1px`, `document.title` valid, metrics rendered. |
| `core-claim-deliver` | End-to-End Volunteer Rescue Run | **P0** | Claim pending run -> Launch Driver Manifest -> Temp Check -> Deliver to Pantry. | Status advances `pending -> claimed -> picked_up -> completed`; poundage verified. |
| `state-persistence` | LocalStorage State Survival on Reload | **P0** | Complete run -> Reload page -> Inspect Ledger & Metrics. | Rescued poundage and completed record survive browser reload. |
| `route-optimizer` | Multi-Stop TSP Vehicle Routing | **P0** | Select 2+ runs -> Open Optimizer -> Calculate route -> Dispatch to Driver. | Sequence calculated, miles/fuel savings shown, runs assigned to selected driver. |
| `donation-form-validation`| New Surplus Alert & Error Recovery | **P1** | Open modal -> Submit empty -> Assert validation -> Submit valid alert. | Inline error shown on empty submit; valid alert prepended to board with ticking timer. |
| `tax-receipt-audit` | IRS § 170(e)(3) Certificate & Esc Dismiss | **P1** | Open Tax Receipt -> Inspect legal wording & SHA-256 hash -> Press Esc. | Certificate displays donor, pantry EIN, and tamper-evident hash; closes on Esc. |
| `filter-and-empty-state` | Filter Toggles & Filter-Zero Recovery | **P1** | Apply narrow filters -> Verify matching -> Assert empty state -> Reset. | Filter-zero state displays recovery action; reset restores full run list. |
