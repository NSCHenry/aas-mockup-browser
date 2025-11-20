import { test, expect } from '@playwright/test';

test.describe('End-to-End Scenario Testing', () => {

  test('Contract Profitability: Complete user flow', async ({ page }) => {
    await page.goto('/mockups/scenario-planning.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click Contract Profitability tab
    await page.click('[data-scenario="contractProfitability"]');
    await page.waitForTimeout(300);

    // Verify correct panel is visible
    const panel = page.locator('[data-scenario="contractProfitability"].scenario-panel');
    await expect(panel).toBeVisible();

    // Select IU Health 1
    await page.selectOption('#profitability-center', 'iu-health-1');
    await page.waitForTimeout(500);

    // Adjust volume slider to +10%
    await page.fill('#profitability-volume', '10');
    await page.waitForTimeout(500);

    // Verify summary cards updated
    const card1Label = await page.locator('.summary-card').nth(0).locator('.card-label').textContent();
    const card2Label = await page.locator('.summary-card').nth(1).locator('.card-label').textContent();

    expect(card1Label).toBe('Monthly Revenue');
    expect(card2Label).toBe('Monthly Margin');

    // Verify values are populated (not zero or default)
    const card1Value = await page.locator('.summary-card').nth(0).locator('.after-value').textContent();
    expect(card1Value).not.toBe('0');
    expect(card1Value).not.toBe('127.5'); // Not the old OT hours value

    // Verify charts rendered
    await expect(page.locator('#overtime-comparison-chart')).toBeVisible();
    await expect(page.locator('#cost-impact-chart')).toBeVisible();

    // Verify recommendation updated
    const recommendation = await page.locator('#recommendation-panel').textContent();
    expect(recommendation.length).toBeGreaterThan(50);

    console.log('✓ Contract Profitability flow complete');
  });

  test('Market Expansion: Complete user flow', async ({ page }) => {
    await page.goto('/mockups/scenario-planning.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click Market Expansion tab
    await page.click('[data-scenario="marketExpansion"]');
    await page.waitForTimeout(300);

    // Fill in all inputs
    await page.selectOption('#expansion-state', 'Illinois');
    await page.fill('#expansion-contracts', '5');
    await page.fill('#expansion-cases', '35');
    await page.fill('#expansion-timeline', '18');
    await page.waitForTimeout(1000);

    // Verify summary cards
    const labels = await page.locator('.card-label').allTextContents();
    expect(labels[0]).toBe('Total Investment');
    expect(labels[1]).toBe('Break-Even');
    expect(labels[2]).toBe('Year 1 Revenue');
    expect(labels[3]).toBe('3-Year ROI');

    // Verify investment value is correct (around $120K base)
    const investmentValue = await page.locator('.summary-card').nth(0).locator('.after-value').textContent();
    expect(investmentValue).toContain('$');
    expect(investmentValue).not.toBe('$0');

    // Verify recommendation mentions the state
    const recommendation = await page.locator('#recommendation-panel').textContent();
    expect(recommendation).toContain('Illinois');

    console.log('✓ Market Expansion flow complete');
  });

  test('Provider Turnover: Complete user flow', async ({ page }) => {
    await page.goto('/mockups/scenario-planning.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click Provider Turnover tab
    await page.click('[data-scenario="providerTurnover"]');
    await page.waitForTimeout(300);

    // Select multiple providers (simulate turnover)
    const firstProvider = page.locator('#turnover-providers option').first();
    await firstProvider.click({ modifiers: ['Control'] });

    const secondProvider = page.locator('#turnover-providers option').nth(1);
    await secondProvider.click({ modifiers: ['Control'] });

    await page.waitForTimeout(500);

    // Set timeline
    await page.fill('#turnover-timeline', '4');
    await page.waitForTimeout(500);

    // Select PRN coverage strategy
    await page.click('input[value="prn"]');
    await page.waitForTimeout(500);

    // Verify summary cards
    const labels = await page.locator('.card-label').allTextContents();
    expect(labels[0]).toBe('Total Cost');
    expect(labels[1]).toBe('Recruitment');
    expect(labels[2]).toBe('Temp Coverage');
    expect(labels[3]).toBe('Time to Stabilize');

    // Verify costs are calculated
    const totalCost = await page.locator('.summary-card').nth(0).locator('.after-value').textContent();
    expect(totalCost).toContain('$');
    expect(totalCost).not.toBe('$0');

    console.log('✓ Provider Turnover flow complete');
  });

  test('RCM Optimization: Complete user flow', async ({ page }) => {
    await page.goto('/mockups/scenario-planning.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click RCM Optimization tab
    await page.click('[data-scenario="rcmOptimization"]');
    await page.waitForTimeout(300);

    // Network-wide analysis
    await page.selectOption('#rcm-scope', 'all');

    // Set improvement parameters
    await page.fill('#rcm-denial', '30');
    await page.fill('#rcm-collection', '5');
    await page.fill('#rcm-investment', '200000');
    await page.waitForTimeout(1000);

    // Verify summary cards
    const labels = await page.locator('.card-label').allTextContents();
    expect(labels[0]).toBe('Additional Revenue');
    expect(labels[1]).toBe('Annual ROI');
    expect(labels[2]).toBe('Payback Period');
    expect(labels[3]).toBe('Contracts Improved');

    // Verify revenue increase is calculated
    const additionalRevenue = await page.locator('.summary-card').nth(0).locator('.after-value').textContent();
    expect(additionalRevenue).toContain('$');
    expect(additionalRevenue).not.toBe('$0');

    // Verify ROI is shown as percentage
    const roi = await page.locator('.summary-card').nth(1).locator('.after-value').textContent();
    expect(roi).toMatch(/\d+/);

    console.log('✓ RCM Optimization flow complete');
  });

  test('Switching between scenarios updates cards correctly', async ({ page }) => {
    await page.goto('/mockups/scenario-planning.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Start with Contract Profitability
    await page.click('[data-scenario="contractProfitability"]');
    await page.selectOption('#profitability-center', { index: 1 });
    await page.waitForTimeout(500);

    let labels = await page.locator('.card-label').allTextContents();
    expect(labels[0]).toBe('Monthly Revenue');

    // Switch to Market Expansion
    await page.click('[data-scenario="marketExpansion"]');
    await page.selectOption('#expansion-state', 'Michigan');
    await page.fill('#expansion-contracts', '3');
    await page.fill('#expansion-cases', '30');
    await page.waitForTimeout(500);

    labels = await page.locator('.card-label').allTextContents();
    expect(labels[0]).toBe('Total Investment');
    expect(labels[1]).toBe('Break-Even');

    // Switch to Provider Turnover
    await page.click('[data-scenario="providerTurnover"]');
    await page.locator('#turnover-providers option').first().click();
    await page.waitForTimeout(500);

    labels = await page.locator('.card-label').allTextContents();
    expect(labels[0]).toBe('Total Cost');
    expect(labels[2]).toBe('Temp Coverage');

    // Switch to RCM Optimization
    await page.click('[data-scenario="rcmOptimization"]');
    await page.fill('#rcm-investment', '150000');
    await page.waitForTimeout(500);

    labels = await page.locator('.card-label').allTextContents();
    expect(labels[0]).toBe('Additional Revenue');
    expect(labels[1]).toBe('Annual ROI');

    console.log('✓ Switching between scenarios works correctly');
  });
});
