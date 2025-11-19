import { test, expect } from '@playwright/test';

const OPTIONS = [
  { file: 'revenue-cycle-option1-process.html', name: 'Process' },
  { file: 'revenue-cycle-option2-metrics.html', name: 'Metrics' },
  { file: 'revenue-cycle-option3-comparison.html', name: 'Comparison' }
];

for (const option of OPTIONS) {
  test.describe(`Revenue Cycle - ${option.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/mockups/${option.file}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
    });

    test('Should render page', async ({ page }) => {
      const title = await page.title();
      expect(title.toLowerCase()).toContain('revenue');
    });

    test('Chart.js loaded', async ({ page }) => {
      const hasChart = await page.evaluate(() => typeof Chart !== 'undefined');
      expect(hasChart).toBeTruthy();
    });
  });
}
