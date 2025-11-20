import { test, expect } from '@playwright/test';

const PATIENT_SATISFACTION_DASHBOARDS = [
  { file: 'patient-satisfaction-option1-scorecard.html', name: 'Patient Satisfaction - Scorecard', keyword: 'patient' },
  { file: 'patient-satisfaction-option2-by-location.html', name: 'Patient Satisfaction - By Location', keyword: 'location' },
  { file: 'patient-satisfaction-option3-quality.html', name: 'Patient Satisfaction - Quality Metrics', keyword: 'quality' }
];

for (const dashboard of PATIENT_SATISFACTION_DASHBOARDS) {
  test.describe(`Patient Satisfaction - ${dashboard.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/mockups/${dashboard.file}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
    });

    test('Should render page', async ({ page }) => {
      const title = await page.title();
      expect(title.toLowerCase()).toContain(dashboard.keyword);
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

    test('Has metrics displayed', async ({ page }) => {
      const metrics = await page.locator('.metric');
      expect(await metrics.count()).toBeGreaterThan(0);
    });

    test('Has tile sections', async ({ page }) => {
      const tiles = await page.locator('.tile');
      expect(await tiles.count()).toBeGreaterThan(0);
    });
  });
}
