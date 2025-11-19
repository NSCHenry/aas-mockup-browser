import { test, expect } from '@playwright/test';

const OPTIONS = [
  { file: 'financial-deepdive-option1-charts-left.html', name: 'Charts Left' },
  { file: 'financial-deepdive-option2-full-width.html', name: 'Full Width' },
  { file: 'financial-deepdive-option3-tabbed.html', name: 'Tabbed' }
];

for (const option of OPTIONS) {
  test.describe(`Financial Deep Dive - ${option.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/mockups/${option.file}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
    });

    test('Should render page', async ({ page }) => {
      const title = await page.title();
      expect(title).toContain('Financial');
    });

    test('Chart.js loaded', async ({ page }) => {
      const hasChart = await page.evaluate(() => typeof Chart !== 'undefined');
      expect(hasChart).toBeTruthy();
    });

    test('Canvas elements exist', async ({ page }) => {
      const canvases = await page.locator('canvas').all();
      expect(canvases.length).toBeGreaterThan(0);
    });

    test('No console errors', async ({ page }) => {
      const errors = [];
      page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
      await page.reload();
      await page.waitForTimeout(2000);
      expect(errors.length).toBe(0);
    });
  });
}
