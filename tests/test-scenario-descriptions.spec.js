import { test, expect } from '@playwright/test';

test('Scenario descriptions update when clicking tabs', async ({ page }) => {
  await page.goto('http://localhost:8000/mockups/scenario-planning.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('\n=== TESTING SCENARIO DESCRIPTIONS ===\n');

  // 1. Hiring Analysis (default)
  let title = await page.locator('#scenario-title').textContent();
  let text = await page.locator('#scenario-text').textContent();
  console.log('1. Hiring Analysis');
  console.log('   Title:', title);
  console.log('   Text:', text.substring(0, 60) + '...');
  expect(title).toBe('Hiring Analysis');
  expect(text).toContain('overtime costs');

  // 2. Contract Profitability
  await page.click('[data-scenario="contractProfitability"]');
  await page.waitForTimeout(300);
  title = await page.locator('#scenario-title').textContent();
  text = await page.locator('#scenario-text').textContent();
  console.log('\n2. Contract Profitability');
  console.log('   Title:', title);
  console.log('   Text:', text.substring(0, 60) + '...');
  expect(title).toBe('Contract Profitability');
  expect(text).toContain('revenue');

  // 3. Market Expansion
  await page.click('[data-scenario="marketExpansion"]');
  await page.waitForTimeout(300);
  title = await page.locator('#scenario-title').textContent();
  text = await page.locator('#scenario-text').textContent();
  console.log('\n3. Market Expansion');
  console.log('   Title:', title);
  console.log('   Text:', text.substring(0, 60) + '...');
  expect(title).toBe('Market Expansion');
  expect(text).toContain('startup costs');

  // 4. Provider Turnover
  await page.click('[data-scenario="providerTurnover"]');
  await page.waitForTimeout(300);
  title = await page.locator('#scenario-title').textContent();
  text = await page.locator('#scenario-text').textContent();
  console.log('\n4. Provider Turnover');
  console.log('   Title:', title);
  console.log('   Text:', text.substring(0, 60) + '...');
  expect(title).toBe('Provider Turnover');
  expect(text).toContain('recruitment');

  // 5. RCM Optimization
  await page.click('[data-scenario="rcmOptimization"]');
  await page.waitForTimeout(300);
  title = await page.locator('#scenario-title').textContent();
  text = await page.locator('#scenario-text').textContent();
  console.log('\n5. RCM Optimization');
  console.log('   Title:', title);
  console.log('   Text:', text.substring(0, 60) + '...');
  expect(title).toBe('RCM Optimization');
  expect(text).toContain('revenue cycle');

  console.log('\n✅ All scenario descriptions update correctly!\n');
});
