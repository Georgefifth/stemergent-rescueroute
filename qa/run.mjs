// Playwright QA Runner for RescueRoute
// Tests both deployed site and local build

import { chromium, firefox } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:5188';
const OUT = process.env.QA_OUT ?? 'evidence/stage-3-qa';
const BROWSER = process.env.BROWSER === 'firefox' ? 'firefox' : 'chromium';
const HEADED = process.env.HEADED === '1';

const SHOTS = path.join(OUT, 'screens');
fs.mkdirSync(SHOTS, { recursive: true });

const VIEWPORTS = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  { name: 'mobile', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function expectVisible(page, selector, timeout = 10000) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: 'visible', timeout });
  return locator;
}

async function expectText(page, text, timeout = 10000) {
  const locator = page.getByText(text).first();
  await locator.waitFor({ state: 'visible', timeout });
  return locator;
}

function collectIssues(page) {
  const issues = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') issues.push({ kind: 'console', text: msg.text() });
  });
  page.on('pageerror', (err) => {
    issues.push({ kind: 'pageerror', text: err.message });
  });
  page.on('requestfailed', (req) => {
    const reason = req.failure()?.errorText ?? 'request failed';
    if (!reason.includes('ERR_ABORTED')) {
      issues.push({ kind: 'requestfailed', text: `${reason} ${req.url()}` });
    }
  });
  page.on('response', (res) => {
    const status = res.status();
    if (status >= 500) issues.push({ kind: 'http', text: `${status} ${res.url()}` });
    else if (status >= 400) {
      issues.push({ kind: 'http', level: 'warn', text: `${status} ${res.url()}` });
    }
  });
  return issues;
}

const scenarios = [
  {
    id: 'smoke',
    title: 'Landing page renders and is usable',
    async run(page, ctx) {
      await page.goto('/', { waitUntil: 'networkidle' });
      await ctx.expectVisible('header');

      const title = await page.title();
      ctx.assert(title.includes('RescueRoute'), `unexpected title: ${title}`);

      // Check horizontal overflow
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      ctx.assert(overflow <= 1, `horizontal overflow: ${overflow}px`);

      // Verify metrics ribbon rendered
      await ctx.expectText('FOOD RESCUED');
      await ctx.expectText('MEALS PROVIDED');

      await ctx.shot('landing');
    },
  },
  {
    id: 'core-claim-deliver',
    title: 'End-to-End Volunteer Rescue Run Claim, Temp Check & Delivery',
    async run(page, ctx) {
      await page.goto('/', { waitUntil: 'networkidle' });

      // 1. Reset demo data to ensure clean state
      const resetBtn = page.getByRole('button', { name: /reset demo data/i });
      if (await resetBtn.isVisible()) {
        await resetBtn.click();
        await page.waitForTimeout(200);
      }

      // 2. Find and claim the first pending run (RR-2026-101)
      const claimButton = page.locator('button:has-text("Claim Run")').first();
      await claimButton.waitFor({ state: 'visible', timeout: 5000 });
      await claimButton.click();
      await ctx.shot('claimed-navigated');

      // 3. Confirm transition to Driver Manifest tab
      await ctx.expectText('PHASE 1 / 2: DONOR PICKUP');
      await ctx.expectText('Cold-Chain Temperature Verification');

      // 4. Fill temperature check (°F) and submit pickup
      const tempInput = page.locator('input[type="number"][step="0.5"]').first();
      await tempInput.fill('145'); // Hot food safety
      const confirmPickupBtn = page.getByRole('button', { name: /confirm food collected/i });
      await confirmPickupBtn.click();
      await ctx.shot('pickup-confirmed');

      // 5. Confirm transition to Phase 2: Deliver to Pantry
      await ctx.expectText('PHASE 2 / 2: EN ROUTE TO PANTRY');
      await ctx.expectText('Delivery Sign-Off & 501(c)(3) Receipt Log');

      // 6. Complete delivery
      const completeDeliveryBtn = page.getByRole('button', { name: /complete rescue run/i });
      await completeDeliveryBtn.click();
      await ctx.shot('delivery-completed-modal');

      // 7. Verify 501(c)(3) tax receipt modal popped up
      await ctx.expectText('IRS § 170(e)(3) CERTIFIED');
      await ctx.expectText('TAMPER-EVIDENT VERIFIED');

      // 8. Close receipt modal
      await page.keyboard.press('Escape');
    },
  },
  {
    id: 'state-persistence',
    title: 'State survives page reload and updates ledger',
    async run(page, ctx) {
      await page.goto('/', { waitUntil: 'networkidle' });

      // Click 501(c)(3) Ledger tab
      const ledgerTab = page.getByRole('button', { name: '501(c)(3)', exact: true });
      await ledgerTab.click();
      await ctx.expectText('501(c)(3) Tax Compliance & Impact Ledger');

      // Reload page to verify persistence
      await page.reload({ waitUntil: 'networkidle' });
      await ctx.expectVisible('header');

      // Switch to ledger again
      await page.getByRole('button', { name: '501(c)(3)', exact: true }).click();
      await ctx.expectText('Export CSV Audit Ledger');
      await ctx.shot('ledger-persisted');
    },
  },
  {
    id: 'route-optimizer',
    title: 'Multi-Stop TSP Vehicle Routing Optimization',
    async run(page, ctx) {
      await page.goto('/', { waitUntil: 'networkidle' });

      // Reset data to guarantee fresh open runs
      const resetBtn = page.getByRole('button', { name: /reset demo data/i });
      if (await resetBtn.isVisible()) {
        await resetBtn.click();
        await page.waitForTimeout(300);
      }

      // Ensure we are on dispatch tab
      await page.getByRole('button', { name: 'Dispatch', exact: true }).click();
      await page.waitForTimeout(200);

      // Click "+ Route Optimizer" on two open runs
      const routeBtns = page.locator('button:has-text("+ Route Optimizer"):visible');
      const count = await routeBtns.count();
      ctx.assert(count >= 2, `expected at least 2 open runs, found ${count}`);

      await routeBtns.nth(0).click();
      await routeBtns.nth(1).click();

      // Launch optimizer
      const launchBtn = page.locator('button:has-text("Launch Route Optimizer"):visible');
      await launchBtn.click();

      await ctx.expectText('Multi-Stop Vehicle Route Optimizer');
      await ctx.expectText('Gas Saved');
      await ctx.expectText('Optimized Itinerary Sequence');
      await ctx.shot('route-optimizer-modal');

      // Dispatch route to selected driver
      const dispatchBtn = page.locator('button:has-text("Dispatch Optimized Route"):visible');
      await dispatchBtn.click();

      // Verify automated switch to Driver Manifest with multiple assigned runs
      await ctx.expectText('PHASE 1 / 2: DONOR PICKUP');
      await ctx.shot('route-dispatched-driver-manifest');
    },
  },
  {
    id: 'donation-form-validation',
    title: 'New Surplus Alert Form Validation & Submission',
    async run(page, ctx) {
      await page.goto('/', { waitUntil: 'networkidle' });

      // Open New Donation Alert Modal (target visible button across mobile/desktop)
      const openModalBtn = page.locator('button:has-text("Alert"):visible').first();
      await openModalBtn.click();
      await ctx.expectText('Log Urgent Food Surplus Alert');

      // 1. Submit empty form to trigger validation error
      const submitBtn = page.getByRole('button', { name: /publish surplus alert/i });
      await submitBtn.click();

      // Verify validation error is displayed
      await ctx.expectText('Title or food item description is required');
      await ctx.shot('form-validation-error');

      // 2. Fill valid fields
      const titleInput = page.locator('input[placeholder*="e.g. 50 Fresh Prepared"]');
      await titleInput.fill('QA Fresh Catering Sandwiches');

      const weightInput = page.locator('input[type="number"][value="60"]');
      await weightInput.fill('75');

      await submitBtn.click();

      // Verify toast feedback and card creation on board
      await ctx.expectText('QA Fresh Catering Sandwiches');
      await ctx.shot('new-donation-created');
    },
  },
  {
    id: 'tax-receipt-audit',
    title: 'Tax Receipt Modal & Keyboard Dismiss',
    async run(page, ctx) {
      await page.goto('/', { waitUntil: 'networkidle' });

      // Click on "501(c)(3)" tab to find verified completed runs
      await page.getByRole('button', { name: '501(c)(3)', exact: true }).click();

      const viewReceiptBtn = page.locator('button:has-text("View Receipt")').first();
      await viewReceiptBtn.waitFor({ state: 'visible', timeout: 5000 });
      await viewReceiptBtn.click();

      await ctx.expectText('Official 501(c)(3) Food Rescue Tax Receipt');
      await ctx.expectText('IRS § 170(e)(3) CERTIFIED');
      await ctx.shot('tax-receipt-open');

      // Test Escape key dismissal (WCAG 2.1 compliance)
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      // Verify modal is closed
      const modal = page.locator('div:has-text("Official 501(c)(3) Food Rescue Tax Receipt")');
      ctx.assert((await modal.count()) === 0, 'modal did not close on Escape');
    },
  },
  {
    id: 'filter-and-empty-state',
    title: 'Filter Toggles and Filter-Zero Recovery State',
    async run(page, ctx) {
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Dispatch', exact: true }).click();

      // Select strict vehicle filter
      const vehicleSelect = page.locator('select').nth(1);
      await vehicleSelect.selectOption('truck_insulated');
      await page.waitForTimeout(200);

      // Select critical urgency
      const urgencySelect = page.locator('select').nth(2);
      await urgencySelect.selectOption('critical');
      await page.waitForTimeout(200);

      // Check if filter-zero empty state appears
      const emptyBanner = page.locator('h3:has-text("No rescue runs match current filters")');
      if (await emptyBanner.isVisible()) {
        await ctx.shot('filter-zero-state');
        // Click recovery button
        const clearBtn = page.getByRole('button', { name: /clear all filters/i });
        await clearBtn.click();
        await page.waitForTimeout(200);
      }

      // Verify all runs restored
      await ctx.expectText('FOOD RESCUED');
      await ctx.shot('filters-restored');
    },
  },
];

async function main() {
  const browserType = BROWSER === 'firefox' ? firefox : chromium;
  const browser = await browserType.launch({ headless: !HEADED });
  const startedAt = new Date().toISOString();
  const results = [];

  console.log(`Starting RescueRoute Playwright QA on ${BASE} using ${BROWSER}...`);

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      baseURL: BASE,
      viewport: vp.viewport,
      deviceScaleFactor: vp.deviceScaleFactor,
    });

    for (const scenario of scenarios) {
      const page = await context.newPage();
      const issues = collectIssues(page);
      const screenshots = [];
      const started = Date.now();
      let status = 'pass';
      let error = null;

      const ctx = {
        assert,
        expectVisible: (selector, timeout) => expectVisible(page, selector, timeout),
        expectText: (text, timeout) => expectText(page, text, timeout),
        shot: async (name, opts = {}) => {
          const file = path.join(SHOTS, `${scenario.id}-${name}-${vp.name}.png`);
          await page.screenshot({ path: file, fullPage: opts.fullPage ?? true });
          screenshots.push(file);
          return file;
        },
      };

      try {
        await scenario.run(page, ctx);
      } catch (err) {
        status = 'fail';
        error = err.message;
      } finally {
        await page.close().catch(() => {});
      }

      const errors = issues.filter((i) => (i.level ?? 'error') === 'error');
      const warnings = issues.filter((i) => i.level === 'warn');
      if (status === 'pass' && errors.length > 0) {
        status = 'fail';
        error = errors.map((i) => `${i.kind}: ${i.text}`).join(' | ');
      }

      results.push({
        viewport: vp.name,
        id: scenario.id,
        title: scenario.title,
        status,
        ms: Date.now() - started,
        error,
        errors,
        warnings,
        screenshots,
      });

      console.log(
        `${status === 'pass' ? '✓' : '✗'} [${vp.name}] ${scenario.id}` +
          (error ? ` — ${error}` : '')
      );
    }

    await context.close();
  }

  await browser.close();

  const summary = {
    total: results.length,
    pass: results.filter((r) => r.status === 'pass').length,
    fail: results.filter((r) => r.status === 'fail').length,
  };
  const finishedAt = new Date().toISOString();
  const report = {
    base: BASE,
    browser: BROWSER,
    headed: HEADED,
    startedAt,
    finishedAt,
    summary,
    results,
  };

  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(report, null, 2));

  const warnings = results.flatMap((r) =>
    r.warnings.map((w) => `- [${r.viewport}] ${r.id}: ${w.kind} — ${w.text}`)
  );
  const md = [
    `# QA Test Report — RescueRoute Platform`,
    '',
    `- **Target Base URL:** ${BASE}`,
    `- **Browser Engine:** ${BROWSER} (${HEADED ? 'headed' : 'headless'})`,
    `- **Execution Time:** ${startedAt} -> ${finishedAt}`,
    `- **Summary:** ${summary.total} scenarios executed — **${summary.pass} PASSED**, **${summary.fail} FAILED**`,
    '',
    '| Viewport | Scenario ID | Scenario Title | Status | Duration (ms) | Detail |',
    '|---|---|---|---|---|---|',
    ...results.map(
      (r) =>
        `| ${r.viewport} | \`${r.id}\` | ${r.title} | **${r.status.toUpperCase()}** | ${r.ms}ms | ${(
          r.error ?? 'OK'
        ).replace(/\|/g, '\\|')} |`
    ),
    '',
    ...(warnings.length ? ['## Warnings', '', ...warnings, ''] : []),
    '## Captured Evidence Screenshots',
    '',
    ...results.flatMap((r) => r.screenshots.map((s) => `- \`${s}\``)),
    '',
  ];
  fs.writeFileSync(path.join(OUT, 'report.md'), md.join('\n'));

  console.log(`\n${summary.pass}/${summary.total} passed — report written to ${OUT}/report.md`);
  if (summary.fail > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
