import { test, expect } from '@playwright/test';

const BYPASS_TOKEN = 'playwright_test_bypass_2024';
const BASE_URL = `/mockups/scenario-planning.html`;

test.describe('Scenario Planning - What-If Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500); // Allow baseline data to load
  });

  test('Should render page with correct title', async ({ page }) => {
    const title = await page.title();
    expect(title.toLowerCase()).toContain('scenario planning');

    const heading = await page.locator('h1').textContent();
    expect(heading).toContain('Scenario Planning');
  });

  test('Should load Chart.js library', async ({ page }) => {
    const hasChart = await page.evaluate(() => typeof Chart !== 'undefined');
    expect(hasChart).toBeTruthy();
  });

  test('Should display all 8 scenario tabs', async ({ page }) => {
    const tabs = await page.locator('.scenario-tab').count();
    expect(tabs).toBe(8);

    // Verify all tab names
    const tabTexts = await page.locator('.scenario-tab').allTextContents();
    expect(tabTexts.join(',')).toContain('Hiring Analysis');
    expect(tabTexts.join(',')).toContain('Rebalancing');
    expect(tabTexts.join(',')).toContain('Case Redistribution');
    expect(tabTexts.join(',')).toContain('On-Call Policy');
    expect(tabTexts.join(',')).toContain('Contract Profitability');
    expect(tabTexts.join(',')).toContain('Market Expansion');
    expect(tabTexts.join(',')).toContain('Provider Turnover');
    expect(tabTexts.join(',')).toContain('RCM Optimization');
  });

  test('Should have Hiring Analysis tab active by default', async ({ page }) => {
    const activeTab = await page.locator('.scenario-tab.active');
    const tabText = await activeTab.textContent();
    expect(tabText).toContain('Hiring Analysis');
  });

  test.describe('Hiring Analysis Scenario', () => {
    test('Should show hiring controls', async ({ page }) => {
      await expect(page.locator('#hiring-center')).toBeVisible();
      await expect(page.locator('#hiring-type')).toBeVisible();
      await expect(page.locator('#hiring-count')).toBeVisible();
      await expect(page.locator('#hiring-salary')).toBeVisible();
    });

    test('Should populate center dropdown from baseline data', async ({ page }) => {
      const options = await page.locator('#hiring-center option').count();
      expect(options).toBeGreaterThan(1); // Should have placeholder + centers
    });

    test('Should update display when center selected', async ({ page }) => {
      await page.selectOption('#hiring-center', { index: 1 });
      await page.selectOption('#hiring-type', 'MDA');
      await page.waitForTimeout(500);

      // Recommendation panel should update
      const recommendation = await page.locator('#recommendation-panel').textContent();
      expect(recommendation.length).toBeGreaterThan(0);
    });
  });

  test.describe('Contract Profitability Scenario (NEW)', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('[data-scenario="contractProfitability"]');
      await page.waitForTimeout(300);
    });

    test('Should switch to Contract Profitability tab', async ({ page }) => {
      const activeTab = await page.locator('.scenario-tab.active').textContent();
      expect(activeTab).toContain('Contract Profitability');
    });

    test('Should show profitability controls', async ({ page }) => {
      await expect(page.locator('#profitability-center')).toBeVisible();
      await expect(page.locator('#profitability-volume')).toBeVisible();
      await expect(page.locator('#profitability-collection')).toBeVisible();
      await expect(page.locator('#profitability-floor')).toBeVisible();
    });

    test('Should update volume change display', async ({ page }) => {
      await page.fill('#profitability-volume', '15');
      await page.waitForTimeout(100);
      const display = await page.locator('#profitability-volume-display').textContent();
      expect(display).toBe('15%');
    });

    test('Should calculate profitability when center selected', async ({ page }) => {
      await page.selectOption('#profitability-center', { index: 1 });
      await page.fill('#profitability-collection', '5');
      await page.waitForTimeout(500);

      // Should show recommendation
      const recommendation = await page.locator('#recommendation-panel').textContent();
      expect(recommendation.length).toBeGreaterThan(0);
    });

    test('Should render profitability charts', async ({ page }) => {
      await page.selectOption('#profitability-center', { index: 1 });
      await page.waitForTimeout(500);

      const chart1 = await page.locator('#overtime-comparison-chart');
      const chart2 = await page.locator('#cost-impact-chart');
      await expect(chart1).toBeVisible();
      await expect(chart2).toBeVisible();
    });
  });

  test.describe('Market Expansion Scenario (NEW)', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('[data-scenario="marketExpansion"]');
      await page.waitForTimeout(300);
    });

    test('Should switch to Market Expansion tab', async ({ page }) => {
      const activeTab = await page.locator('.scenario-tab.active').textContent();
      expect(activeTab).toContain('Market Expansion');
    });

    test('Should show expansion controls', async ({ page }) => {
      await expect(page.locator('#expansion-state')).toBeVisible();
      await expect(page.locator('#expansion-contracts')).toBeVisible();
      await expect(page.locator('#expansion-cases')).toBeVisible();
      await expect(page.locator('#expansion-timeline')).toBeVisible();
    });

    test('Should have all state options', async ({ page }) => {
      const stateOptions = await page.locator('#expansion-state option').allTextContents();
      expect(stateOptions.join(',')).toContain('Indiana');
      expect(stateOptions.join(',')).toContain('Michigan');
      expect(stateOptions.join(',')).toContain('Ohio');
      expect(stateOptions.join(',')).toContain('Illinois');
    });

    test('Should calculate market expansion scenario', async ({ page }) => {
      await page.selectOption('#expansion-state', 'Michigan');
      await page.fill('#expansion-contracts', '3');
      await page.fill('#expansion-cases', '30');
      await page.fill('#expansion-timeline', '12');
      await page.waitForTimeout(500);

      const recommendation = await page.locator('#recommendation-panel').textContent();
      expect(recommendation.length).toBeGreaterThan(0);
      expect(recommendation).toContain('Michigan');
    });

    test('Should render expansion charts', async ({ page }) => {
      await page.selectOption('#expansion-state', 'Illinois');
      await page.fill('#expansion-contracts', '5');
      await page.waitForTimeout(500);

      const chart1 = await page.locator('#overtime-comparison-chart');
      await expect(chart1).toBeVisible();
    });
  });

  test.describe('Provider Turnover Scenario (NEW)', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('[data-scenario="providerTurnover"]');
      await page.waitForTimeout(300);
    });

    test('Should switch to Provider Turnover tab', async ({ page }) => {
      const activeTab = await page.locator('.scenario-tab.active').textContent();
      expect(activeTab).toContain('Provider Turnover');
    });

    test('Should show turnover controls', async ({ page }) => {
      await expect(page.locator('#turnover-providers')).toBeVisible();
      await expect(page.locator('#turnover-timeline')).toBeVisible();
      await expect(page.locator('input[name="coverage-strategy"]').first()).toBeVisible();
    });

    test('Should populate provider list from baseline', async ({ page }) => {
      const providerOptions = await page.locator('#turnover-providers option').count();
      expect(providerOptions).toBeGreaterThan(5); // Should have multiple providers
    });

    test('Should show high-risk providers with warning', async ({ page }) => {
      const providers = await page.locator('#turnover-providers option').allTextContents();
      const hasHighRisk = providers.some(p => p.includes('⚠️'));
      expect(hasHighRisk).toBeTruthy();
    });

    test('Should calculate turnover impact', async ({ page }) => {
      // Select first provider
      await page.locator('#turnover-providers option').first().click();
      await page.fill('#turnover-timeline', '3');
      await page.waitForTimeout(500);

      const recommendation = await page.locator('#recommendation-panel').textContent();
      expect(recommendation.length).toBeGreaterThan(0);
    });

    test('Should have coverage strategy options', async ({ page }) => {
      const overtimeRadio = await page.locator('input[value="overtime"]');
      const prnRadio = await page.locator('input[value="prn"]');
      const reducedRadio = await page.locator('input[value="reduced"]');

      await expect(overtimeRadio).toBeVisible();
      await expect(prnRadio).toBeVisible();
      await expect(reducedRadio).toBeVisible();

      // Overtime should be checked by default
      await expect(overtimeRadio).toBeChecked();
    });
  });

  test.describe('RCM Optimization Scenario (NEW)', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('[data-scenario="rcmOptimization"]');
      await page.waitForTimeout(300);
    });

    test('Should switch to RCM Optimization tab', async ({ page }) => {
      const activeTab = await page.locator('.scenario-tab.active').textContent();
      expect(activeTab).toContain('RCM Optimization');
    });

    test('Should show RCM controls', async ({ page }) => {
      await expect(page.locator('#rcm-scope')).toBeVisible();
      await expect(page.locator('#rcm-denial')).toBeVisible();
      await expect(page.locator('#rcm-collection')).toBeVisible();
      await expect(page.locator('#rcm-investment')).toBeVisible();
    });

    test('Should have network-wide option as default', async ({ page }) => {
      const selectedOption = await page.locator('#rcm-scope option:checked').textContent();
      expect(selectedOption).toContain('Network-Wide');
    });

    test('Should calculate network-wide RCM optimization', async ({ page }) => {
      await page.selectOption('#rcm-scope', 'all');
      await page.fill('#rcm-denial', '25');
      await page.fill('#rcm-collection', '3');
      await page.fill('#rcm-investment', '150000');
      await page.waitForTimeout(500);

      const recommendation = await page.locator('#recommendation-panel').textContent();
      expect(recommendation.length).toBeGreaterThan(0);
    });

    test('Should render RCM charts', async ({ page }) => {
      await page.fill('#rcm-investment', '150000');
      await page.waitForTimeout(500);

      const chart1 = await page.locator('#overtime-comparison-chart');
      const chart2 = await page.locator('#cost-impact-chart');
      await expect(chart1).toBeVisible();
      await expect(chart2).toBeVisible();
    });

    test('Should update denial reduction display', async ({ page }) => {
      await page.fill('#rcm-denial', '30');
      await page.waitForTimeout(100);
      const display = await page.locator('#rcm-denial-display').textContent();
      expect(display).toBe('30%');
    });
  });

  test.describe('Interactive Features', () => {
    test('Should switch between scenarios smoothly', async ({ page }) => {
      // Start with hiring
      await expect(page.locator('[data-scenario="hiring"].scenario-panel')).toBeVisible();

      // Switch to contract profitability
      await page.click('[data-scenario="contractProfitability"]');
      await page.waitForTimeout(200);
      await expect(page.locator('[data-scenario="contractProfitability"].scenario-panel')).toBeVisible();

      // Switch to market expansion
      await page.click('[data-scenario="marketExpansion"]');
      await page.waitForTimeout(200);
      await expect(page.locator('[data-scenario="marketExpansion"].scenario-panel')).toBeVisible();
    });

    test('Should have reset button', async ({ page }) => {
      const resetBtn = await page.locator('#reset-btn');
      await expect(resetBtn).toBeVisible();
      await expect(resetBtn).toContainText('Reset');
    });

    test('Should have save scenario button', async ({ page }) => {
      const saveBtn = await page.locator('#save-scenario-btn');
      await expect(saveBtn).toBeVisible();
      await expect(saveBtn).toContainText('Save');
    });
  });

  test.describe('Summary Cards', () => {
    test('Should display all 4 summary cards', async ({ page }) => {
      const cards = await page.locator('.summary-card').count();
      expect(cards).toBe(4);
    });

    test('Should have correct card labels', async ({ page }) => {
      const cardLabels = await page.locator('.card-label').allTextContents();
      expect(cardLabels).toContain('Overtime Hours/Week');
      expect(cardLabels).toContain('Annual Net Impact');
      expect(cardLabels).toContain('Coverage Rate');
      expect(cardLabels).toContain('Provider Workload');
    });
  });

  test.describe('Charts', () => {
    test('Should have two chart containers', async ({ page }) => {
      const chart1 = await page.locator('#overtime-comparison-chart');
      const chart2 = await page.locator('#cost-impact-chart');

      await expect(chart1).toBeVisible();
      await expect(chart2).toBeVisible();
    });
  });

  test.describe('Recommendation Panel', () => {
    test('Should have recommendation panel', async ({ page }) => {
      const panel = await page.locator('#recommendation-panel');
      await expect(panel).toBeVisible();
    });

    test('Should show default message initially', async ({ page }) => {
      const recommendation = await page.locator('#recommendation-panel').textContent();
      expect(recommendation).toContain('Select a scenario');
    });
  });
});
