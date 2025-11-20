import { test, expect } from '@playwright/test';

test('Click through tabs and check what happens to cards', async ({ page }) => {
  await page.goto('http://localhost:8000/mockups/scenario-planning.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('\n=== INITIAL STATE (Hiring tab) ===');
  let labels = await page.locator('.card-label').allTextContents();
  console.log('Card labels:', labels);

  // Click Contract Profitability
  console.log('\n=== Clicking Contract Profitability tab ===');
  await page.click('[data-scenario="contractProfitability"]');
  await page.waitForTimeout(500);

  labels = await page.locator('.card-label').allTextContents();
  console.log('Card labels:', labels);

  const values = await page.locator('.after-value').allTextContents();
  console.log('Card values:', values);

  // Click Market Expansion
  console.log('\n=== Clicking Market Expansion tab ===');
  await page.click('[data-scenario="marketExpansion"]');
  await page.waitForTimeout(500);

  labels = await page.locator('.card-label').allTextContents();
  console.log('Card labels:', labels);

  const values2 = await page.locator('.after-value').allTextContents();
  console.log('Card values:', values2);

  // Click Provider Turnover
  console.log('\n=== Clicking Provider Turnover tab ===');
  await page.click('[data-scenario="providerTurnover"]');
  await page.waitForTimeout(500);

  labels = await page.locator('.card-label').allTextContents();
  console.log('Card labels:', labels);

  const values3 = await page.locator('.after-value').allTextContents();
  console.log('Card values:', values3);

  // Click RCM Optimization
  console.log('\n=== Clicking RCM Optimization tab ===');
  await page.click('[data-scenario="rcmOptimization"]');
  await page.waitForTimeout(500);

  labels = await page.locator('.card-label').allTextContents();
  console.log('Card labels:', labels);

  const values4 = await page.locator('.after-value').allTextContents();
  console.log('Card values:', values4);

  // Check console for errors
  const messages = [];
  page.on('console', msg => messages.push(msg.text()));

  await page.waitForTimeout(1000);

  if (messages.length > 0) {
    console.log('\n=== BROWSER CONSOLE MESSAGES ===');
    messages.forEach(msg => console.log(msg));
  }
});
