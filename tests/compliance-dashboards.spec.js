import { test, expect } from '@playwright/test';

const COMPLIANCE_DASHBOARDS = [
  { file: 'compliance-credentialing.html', name: 'Provider Credentialing & Licensing', keyword: 'credentialing' },
  { file: 'compliance-billing-coding.html', name: 'Billing & Coding Compliance', keyword: 'billing' },
  { file: 'compliance-contract-risk.html', name: 'Contract & Regulatory Risk', keyword: 'contract' },
  { file: 'compliance-phi-security.html', name: 'PHI Security & Access Control', keyword: 'phi security' },
  { file: 'compliance-vendor-baa.html', name: 'Business Associate & Vendor Compliance', keyword: 'vendor' },
  { file: 'compliance-phi-training.html', name: 'PHI Incident Response & Training', keyword: 'training' }
];

for (const dashboard of COMPLIANCE_DASHBOARDS) {
  test.describe(`Compliance - ${dashboard.name}`, () => {
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
