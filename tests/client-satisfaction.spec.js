import { test, expect } from '@playwright/test';

const OPTIONS = [
  { file: 'client-satisfaction-option1-scorecard.html', name: 'Scorecard' },
  { file: 'client-satisfaction-option2-risk.html', name: 'Risk' },
  { file: 'client-satisfaction-option3-timeline.html', name: 'Timeline' }
];

for (const option of OPTIONS) {
  test.describe(`Client Satisfaction - ${option.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/mockups/${option.file}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
    });

    test('Should render page', async ({ page }) => {
      const title = await page.title();
      expect(title.toLowerCase()).toContain('client');
    });

    test('Chart.js loaded', async ({ page }) => {
      const hasChart = await page.evaluate(() => typeof Chart !== 'undefined');
      expect(hasChart).toBeTruthy();
    });
  });
}
