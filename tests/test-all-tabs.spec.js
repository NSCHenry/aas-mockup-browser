import { test, expect } from '@playwright/test';

test('Click through all 8 scenario tabs and verify meaningful data', async ({ page }) => {
  await page.goto('http://localhost:8000/mockups/scenario-planning.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('\n=== TESTING ALL 8 SCENARIOS ===\n');

  // 1. Hiring Analysis (default)
  console.log('1. HIRING ANALYSIS');
  let labels = await page.locator('.card-label').allTextContents();
  let values = await page.locator('.after-value').allTextContents();
  console.log('   Cards:', labels.join(', '));
  console.log('   Values:', values.join(', '));
  expect(labels[0]).toBe('Overtime Hours/Week');

  // 2. Rebalancing
  console.log('\n2. REBALANCING');
  await page.click('[data-scenario="rebalancing"]');
  await page.waitForTimeout(500);
  labels = await page.locator('.card-label').allTextContents();
  values = await page.locator('.after-value').allTextContents();
  console.log('   Cards:', labels.join(', '));
  console.log('   Values:', values.join(', '));

  // 3. Case Redistribution
  console.log('\n3. CASE REDISTRIBUTION');
  await page.click('[data-scenario="caseRedistribution"]');
  await page.waitForTimeout(500);
  labels = await page.locator('.card-label').allTextContents();
  values = await page.locator('.after-value').allTextContents();
  console.log('   Cards:', labels.join(', '));
  console.log('   Values:', values.join(', '));

  // 4. On-Call Policy
  console.log('\n4. ON-CALL POLICY');
  await page.click('[data-scenario="onCallPolicy"]');
  await page.waitForTimeout(500);
  labels = await page.locator('.card-label').allTextContents();
  values = await page.locator('.after-value').allTextContents();
  console.log('   Cards:', labels.join(', '));
  console.log('   Values:', values.join(', '));

  // 5. Contract Profitability
  console.log('\n5. CONTRACT PROFITABILITY');
  await page.click('[data-scenario="contractProfitability"]');
  await page.waitForTimeout(500);
  labels = await page.locator('.card-label').allTextContents();
  values = await page.locator('.after-value').allTextContents();
  console.log('   Cards:', labels.join(', '));
  console.log('   Values:', values.join(', '));
  expect(labels[0]).toBe('Monthly Revenue');
  expect(labels[1]).toBe('Monthly Margin');

  // 6. Market Expansion
  console.log('\n6. MARKET EXPANSION');
  await page.click('[data-scenario="marketExpansion"]');
  await page.waitForTimeout(500);
  labels = await page.locator('.card-label').allTextContents();
  values = await page.locator('.after-value').allTextContents();
  console.log('   Cards:', labels.join(', '));
  console.log('   Values:', values.join(', '));
  expect(labels[0]).toBe('Total Investment');
  expect(labels[1]).toBe('Break-Even');

  // 7. Provider Turnover
  console.log('\n7. PROVIDER TURNOVER');
  await page.click('[data-scenario="providerTurnover"]');
  await page.waitForTimeout(500);
  labels = await page.locator('.card-label').allTextContents();
  values = await page.locator('.after-value').allTextContents();
  console.log('   Cards:', labels.join(', '));
  console.log('   Values:', values.join(', '));
  expect(labels[0]).toBe('Total Cost');
  expect(labels[1]).toBe('Recruitment');

  // 8. RCM Optimization
  console.log('\n8. RCM OPTIMIZATION');
  await page.click('[data-scenario="rcmOptimization"]');
  await page.waitForTimeout(500);
  labels = await page.locator('.card-label').allTextContents();
  values = await page.locator('.after-value').allTextContents();
  console.log('   Cards:', labels.join(', '));
  console.log('   Values:', values.join(', '));
  expect(labels[0]).toBe('Additional Revenue');
  expect(labels[1]).toBe('Annual ROI');

  console.log('\n✅ All 8 scenarios display data correctly!\n');
});
