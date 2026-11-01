import { chromium } from 'playwright';

async function capture() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // 1. Desktop Dispatch Console
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:5188/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'evidence/stage-2-build/frontend/desktop-1440px-dispatch.png' });
  console.log('Captured desktop-1440px-dispatch.png');

  // 2. Mobile 390px Dispatch View
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:5188/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'evidence/stage-2-build/frontend/mobile-390px-dispatch.png' });
  console.log('Captured mobile-390px-dispatch.png');

  // 3. Mobile 390px Driver Manifest View
  // Click "Driver" tab
  const driverTab = page.getByRole('button', { name: 'Driver', exact: true });
  await driverTab.click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'evidence/stage-2-build/frontend/mobile-390px-driver.png' });
  console.log('Captured mobile-390px-driver.png');

  // 4. Desktop Route Optimizer Modal
  await page.setViewportSize({ width: 1440, height: 900 });
  // Switch back to dispatch
  await page.getByRole('button', { name: 'Dispatch', exact: true }).click();
  await page.waitForTimeout(300);

  // Click "+ Route Optimizer" on first card and second card
  const routeButtons = page.locator('button:has-text("+ Route Optimizer")');
  if (await routeButtons.count() > 0) {
    await routeButtons.nth(0).click();
    if (await routeButtons.count() > 1) {
      await routeButtons.nth(1).click();
    }
  }

  // Click "Launch Route Optimizer"
  const launchBtn = page.locator('button:has-text("Launch Route Optimizer")');
  await launchBtn.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'evidence/stage-2-build/frontend/desktop-1440px-route-optimizer.png' });
  console.log('Captured desktop-1440px-route-optimizer.png');

  // Close optimizer
  const cancelBtn = page.locator('button:has-text("Cancel")');
  if (await cancelBtn.isVisible()) {
    await cancelBtn.click();
  }

  // 5. Desktop 501(c)(3) Tax Receipt Modal
  const taxReceiptBtn = page.locator('button:has-text("Tax Receipt")').first();
  if (await taxReceiptBtn.isVisible()) {
    await taxReceiptBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'evidence/stage-2-build/frontend/desktop-1440px-tax-receipt.png' });
    console.log('Captured desktop-1440px-tax-receipt.png');
    // Close modal
    await page.keyboard.press('Escape');
  }

  // 6. Desktop 501(c)(3) Ledger Tab
  await page.getByRole('button', { name: '501(c)(3)', exact: true }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'evidence/stage-2-build/frontend/desktop-1440px-ledger.png' });
  console.log('Captured desktop-1440px-ledger.png');

  await browser.close();
  console.log('All frontend acceptance screenshots captured successfully.');
}

capture().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
