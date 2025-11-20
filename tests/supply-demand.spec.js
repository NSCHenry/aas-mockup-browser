const { test, expect } = require('@playwright/test');

test.describe('Supply & Demand - Geographic Analysis', () => {
  test('should load and display geographic supply demand dashboard', async ({ page }) => {
    await page.goto('http://localhost:8004/mockups/growth-pipeline-option5-supply-demand-geo.html');
    await expect(page.locator('h1')).toContainText('Provider Supply & Demand - Geographic Analysis');
  });

  test('should display key metrics', async ({ page }) => {
    await page.goto('http://localhost:8004/mockups/growth-pipeline-option5-supply-demand-geo.html');
    await expect(page.locator('.metric-label')).toContainText(['Total Active Providers', 'ASCs Served']);
  });

  test('should render regional cards', async ({ page }) => {
    await page.goto('http://localhost:8004/mockups/growth-pipeline-option5-supply-demand-geo.html');
    await expect(page.locator('.region-card')).toHaveCount(3);
  });

  test('should render provider density chart', async ({ page }) => {
    await page.goto('http://localhost:8004/mockups/growth-pipeline-option5-supply-demand-geo.html');
    await expect(page.locator('#density-chart')).toBeVisible();
  });

  test('should show target expansion markets', async ({ page }) => {
    await page.goto('http://localhost:8004/mockups/growth-pipeline-option5-supply-demand-geo.html');
    await expect(page.getByText('Target Expansion Markets')).toBeVisible();
  });

  test('should display underutilized provider markets chart', async ({ page }) => {
    await page.goto('http://localhost:8004/mockups/growth-pipeline-option5-supply-demand-geo.html');
    await expect(page.locator('#utilization-chart')).toBeVisible();
  });
});

test.describe('Supply & Demand - Provider Analysis', () => {
  test('should load and display provider type analysis dashboard', async ({ page }) => {
    await page.goto('http://localhost:8004/mockups/growth-pipeline-option6-supply-demand-providers.html');
    await expect(page.locator('h1')).toContainText('Provider Supply & Demand - Provider Type Analysis');
  });

  test('should display provider type metrics', async ({ page }) => {
    await page.goto('http://localhost:8004/mockups/growth-pipeline-option6-supply-demand-providers.html');
    await expect(page.locator('.metric-label')).toContainText(['Total Providers', 'CRNAs', 'Anesthesiologists']);
  });

  test('should display CRNA and MD breakdown cards', async ({ page }) => {
    await page.goto('http://localhost:8004/mockups/growth-pipeline-option6-supply-demand-providers.html');
    await expect(page.locator('.split-card')).toHaveCount(2);
  });

  test('should show Indiana CRNA underutilization insight', async ({ page }) => {
    await page.goto('http://localhost:8004/mockups/growth-pipeline-option6-supply-demand-providers.html');
    await expect(page.locator('.insight-title')).toContainText('Indiana CRNA Underutilization');
  });

  test('should display specialty coverage grid', async ({ page }) => {
    await page.goto('http://localhost:8004/mockups/growth-pipeline-option6-supply-demand-providers.html');
    await expect(page.locator('.specialty-card')).toHaveCount(9);
  });

  test('should render provider utilization chart', async ({ page }) => {
    await page.goto('http://localhost:8004/mockups/growth-pipeline-option6-supply-demand-providers.html');
    await expect(page.locator('#utilization-chart')).toBeVisible();
  });
});

test.describe('Supply & Demand - Market Competition', () => {
  test('should load and display market competition dashboard', async ({ page }) => {
    await page.goto('http://localhost:8004/mockups/growth-pipeline-option7-supply-demand-competition.html');
    await expect(page.locator('h1')).toContainText('Market Competition & Opportunities');
  });

  test('should display competitive metrics', async ({ page }) => {
    await page.goto('http://localhost:8004/mockups/growth-pipeline-option7-supply-demand-competition.html');
    await expect(page.locator('.metric-label')).toContainText(['Competitive Markets', 'AAS Market Share', 'Competitor ASC Groups']);
  });

  test('should display target market cards', async ({ page }) => {
    await page.goto('http://localhost:8004/mockups/growth-pipeline-option7-supply-demand-competition.html');
    await expect(page.locator('.market-card')).toHaveCount(6);
  });

  test('should show competitor financial health indicators', async ({ page }) => {
    await page.goto('http://localhost:8004/mockups/growth-pipeline-option7-supply-demand-competition.html');
    await expect(page.getByText('Competitor Financial Health Indicators')).toBeVisible();
  });

  test('should display compensation analysis', async ({ page }) => {
    await page.goto('http://localhost:8004/mockups/growth-pipeline-option7-supply-demand-competition.html');
    await expect(page.locator('.comp-card')).toHaveCount(4);
  });

  test('should render market share chart', async ({ page }) => {
    await page.goto('http://localhost:8004/mockups/growth-pipeline-option7-supply-demand-competition.html');
    await expect(page.locator('#market-share')).toBeVisible();
  });

  test('should show strategic recommendations', async ({ page }) => {
    await page.goto('http://localhost:8004/mockups/growth-pipeline-option7-supply-demand-competition.html');
    await expect(page.getByText('Strategic Recommendations - Market Entry Prioritization')).toBeVisible();
  });
});
