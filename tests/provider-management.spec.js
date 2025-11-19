import { test, expect } from '@playwright/test';

const OPTIONS = [
  { file: 'provider-management-option1-cards.html', name: 'Cards' },
  { file: 'provider-management-option2-analytics.html', name: 'Analytics' },
  { file: 'provider-management-option3-recruitment.html', name: 'Recruitment' }
];

for (const option of OPTIONS) {
  test.describe(`Provider Management - ${option.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/mockups/${option.file}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
    });

    test('Should render page', async ({ page }) => {
      const title = await page.title();
      expect(title.toLowerCase()).toContain('provider');
    });

    test('Chart.js loaded', async ({ page }) => {
      const hasChart = await page.evaluate(() => typeof Chart !== 'undefined');
      expect(hasChart).toBeTruthy();
    });
  });
}
