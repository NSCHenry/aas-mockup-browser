import { test, expect } from '@playwright/test';

const OPTIONS = [
  { file: 'operations-option1-map.html', name: 'Map' },
  { file: 'operations-option2-status.html', name: 'Status' },
  { file: 'operations-option3-calendar.html', name: 'Calendar' }
];

for (const option of OPTIONS) {
  test.describe(`Operations - ${option.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/mockups/${option.file}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
    });

    test('Should render page', async ({ page }) => {
      const title = await page.title();
      expect(title.toLowerCase()).toContain('operations');
    });

    test('Chart.js loaded', async ({ page }) => {
      const hasChart = await page.evaluate(() => typeof Chart !== 'undefined');
      expect(hasChart).toBeTruthy();
    });
  });
}
