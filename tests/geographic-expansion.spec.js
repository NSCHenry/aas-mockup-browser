import { test, expect } from '@playwright/test';

test.describe('Geographic Expansion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mockups/geographic-expansion.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  });

  test('Should render page', async ({ page }) => {
    const title = await page.title();
    expect(title.toLowerCase()).toContain('geographic');
  });

  test('Chart.js loaded', async ({ page }) => {
    const hasChart = await page.evaluate(() => typeof Chart !== 'undefined');
    expect(hasChart).toBeTruthy();
  });

  test('Canvas elements exist', async ({ page }) => {
    const canvases = await page.locator('canvas').all();
    expect(canvases.length).toBeGreaterThan(0);
  });

  test('Has metric bar', async ({ page }) => {
    const metricBar = await page.locator('.metric-bar');
    expect(await metricBar.count()).toBeGreaterThan(0);
  });

  test('Has market entry cards', async ({ page }) => {
    const marketCards = await page.locator('.market-card');
    expect(await marketCards.count()).toBeGreaterThan(0);
  });

  test('Has reimbursement table', async ({ page }) => {
    const table = await page.locator('.reimbursement-table');
    expect(await table.count()).toBeGreaterThan(0);
  });
});
