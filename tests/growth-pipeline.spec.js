import { test, expect } from '@playwright/test';

const OPTIONS = [
  { file: 'growth-pipeline-option1-funnel.html', name: 'Funnel' },
  { file: 'growth-pipeline-option2-timeline.html', name: 'Timeline' },
  { file: 'growth-pipeline-option3-crm.html', name: 'CRM' }
];

for (const option of OPTIONS) {
  test.describe(`Growth Pipeline - ${option.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/mockups/${option.file}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
    });

    test('Should render page', async ({ page }) => {
      const title = await page.title();
      expect(title.toLowerCase()).toContain('growth');
    });

    test('Chart.js loaded', async ({ page }) => {
      const hasChart = await page.evaluate(() => typeof Chart !== 'undefined');
      expect(hasChart).toBeTruthy();
    });

    test('Canvas elements exist', async ({ page }) => {
      const canvases = await page.locator('canvas').all();
      expect(canvases.length).toBeGreaterThan(0);
    });
  });
}
