// Executive Overview Test Suite
import { test, expect } from '@playwright/test';

const OPTIONS = [
  { file: 'executive-overview-option1-grid.html', name: 'Grid Layout' },
  { file: 'executive-overview-option2-dashboard.html', name: 'Dashboard Layout' },
  { file: 'executive-overview-option3-executive.html', name: 'Executive Layout' }
];

for (const option of OPTIONS) {
  test.describe(`Executive Overview - ${option.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/mockups/${option.file}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
    });

    test('Should render page without errors', async ({ page }) => {
      const title = await page.title();
      expect(title).toContain('AAS');
    });

    test('Should load Chart.js library', async ({ page }) => {
      const hasChart = await page.evaluate(() => typeof Chart !== 'undefined');
      expect(hasChart).toBeTruthy();
    });

    test('Should render all required KPI tiles', async ({ page }) => {
      const tiles = await page.locator('.tile').count();
      // Executive Layout uses a different structure with hero metrics + collapsible sections
      const minTiles = option.name === 'Executive Layout' ? 4 : 6;
      expect(tiles).toBeGreaterThanOrEqual(minTiles);
    });

    test('All canvas elements should have dimensions', async ({ page }) => {
      const canvases = await page.locator('canvas').all();
      expect(canvases.length).toBeGreaterThan(0);

      for (const canvas of canvases) {
        const bbox = await canvas.boundingBox();
        expect(bbox).toBeTruthy();
        expect(bbox.width).toBeGreaterThan(0);
        expect(bbox.height).toBeGreaterThan(0);
      }
    });

    test('Should not have console errors', async ({ page }) => {
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await page.reload();
      await page.waitForTimeout(2000);
      expect(errors.length).toBe(0);
    });

    test('Charts should render with data', async ({ page }) => {
      const hasChartContent = await page.evaluate(() => {
        const canvases = document.querySelectorAll('canvas');
        for (const canvas of canvases) {
          const ctx = canvas.getContext('2d');
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          for (let i = 3; i < imageData.data.length; i += 4) {
            if (imageData.data[i] !== 0) return true;
          }
        }
        return false;
      });

      expect(hasChartContent).toBeTruthy();
    });
  });
}
