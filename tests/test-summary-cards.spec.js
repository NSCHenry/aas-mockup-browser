import { test, expect } from '@playwright/test';

test.describe('Summary Cards Debug', () => {
  test('Check Contract Profitability summary cards', async ({ page }) => {
    await page.goto('/mockups/scenario-planning.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Switch to Contract Profitability
    await page.click('[data-scenario="contractProfitability"]');
    await page.waitForTimeout(500);

    // Select a center to trigger calculation
    await page.selectOption('#profitability-center', { index: 1 });
    await page.waitForTimeout(1000);

    // Check what the cards actually say
    const card1Label = await page.locator('.summary-card').nth(0).locator('.card-label').textContent();
    const card2Label = await page.locator('.summary-card').nth(1).locator('.card-label').textContent();
    const card3Label = await page.locator('.summary-card').nth(2).locator('.card-label').textContent();
    const card4Label = await page.locator('.summary-card').nth(3).locator('.card-label').textContent();

    console.log('\n=== CONTRACT PROFITABILITY CARD LABELS ===');
    console.log('Card 1:', card1Label);
    console.log('Card 2:', card2Label);
    console.log('Card 3:', card3Label);
    console.log('Card 4:', card4Label);

    const card1Value = await page.locator('.summary-card').nth(0).locator('.after-value').textContent();
    const card2Value = await page.locator('.summary-card').nth(1).locator('.after-value').textContent();
    const card3Value = await page.locator('.summary-card').nth(2).locator('.after-value').textContent();
    const card4Value = await page.locator('.summary-card').nth(3).locator('.after-value').textContent();

    console.log('\n=== VALUES ===');
    console.log('Card 1 Value:', card1Value);
    console.log('Card 2 Value:', card2Value);
    console.log('Card 3 Value:', card3Value);
    console.log('Card 4 Value:', card4Value);

    // Check for errors in console
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));

    // Wait a bit to collect logs
    await page.waitForTimeout(1000);

    if (logs.length > 0) {
      console.log('\n=== CONSOLE LOGS ===');
      logs.forEach(log => console.log(log));
    }
  });

  test('Check Market Expansion summary cards', async ({ page }) => {
    await page.goto('/mockups/scenario-planning.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Switch to Market Expansion
    await page.click('[data-scenario="marketExpansion"]');
    await page.waitForTimeout(500);

    // Fill in required fields
    await page.selectOption('#expansion-state', 'Michigan');
    await page.fill('#expansion-contracts', '3');
    await page.fill('#expansion-cases', '30');
    await page.waitForTimeout(1000);

    const card1Label = await page.locator('.summary-card').nth(0).locator('.card-label').textContent();
    const card2Label = await page.locator('.summary-card').nth(1).locator('.card-label').textContent();
    const card3Label = await page.locator('.summary-card').nth(2).locator('.card-label').textContent();
    const card4Label = await page.locator('.summary-card').nth(3).locator('.card-label').textContent();

    console.log('\n=== MARKET EXPANSION CARD LABELS ===');
    console.log('Card 1:', card1Label);
    console.log('Card 2:', card2Label);
    console.log('Card 3:', card3Label);
    console.log('Card 4:', card4Label);
  });

  test('Check Provider Turnover summary cards', async ({ page }) => {
    await page.goto('/mockups/scenario-planning.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Switch to Provider Turnover
    await page.click('[data-scenario="providerTurnover"]');
    await page.waitForTimeout(500);

    // Select a provider
    await page.locator('#turnover-providers option').first().click();
    await page.waitForTimeout(1000);

    const card1Label = await page.locator('.summary-card').nth(0).locator('.card-label').textContent();
    const card2Label = await page.locator('.summary-card').nth(1).locator('.card-label').textContent();
    const card3Label = await page.locator('.summary-card').nth(2).locator('.card-label').textContent();
    const card4Label = await page.locator('.summary-card').nth(3).locator('.card-label').textContent();

    console.log('\n=== PROVIDER TURNOVER CARD LABELS ===');
    console.log('Card 1:', card1Label);
    console.log('Card 2:', card2Label);
    console.log('Card 3:', card3Label);
    console.log('Card 4:', card4Label);
  });

  test('Check RCM Optimization summary cards', async ({ page }) => {
    await page.goto('/mockups/scenario-planning.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Switch to RCM Optimization
    await page.click('[data-scenario="rcmOptimization"]');
    await page.waitForTimeout(500);

    // Fill in investment (required field)
    await page.fill('#rcm-investment', '150000');
    await page.waitForTimeout(1000);

    const card1Label = await page.locator('.summary-card').nth(0).locator('.card-label').textContent();
    const card2Label = await page.locator('.summary-card').nth(1).locator('.card-label').textContent();
    const card3Label = await page.locator('.summary-card').nth(2).locator('.card-label').textContent();
    const card4Label = await page.locator('.summary-card').nth(3).locator('.card-label').textContent();

    console.log('\n=== RCM OPTIMIZATION CARD LABELS ===');
    console.log('Card 1:', card1Label);
    console.log('Card 2:', card2Label);
    console.log('Card 3:', card3Label);
    console.log('Card 4:', card4Label);
  });
});
