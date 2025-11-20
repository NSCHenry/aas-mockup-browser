/**
 * Authentication Bypass Test Suite
 * Tests the password bypass functionality for automated testing
 */

import { test, expect } from '@playwright/test';

const BYPASS_TOKEN = 'playwright_test_bypass_2024';

test.describe('Authentication Bypass Tests', () => {

  test('should bypass login and access browser directly', async ({ page }) => {
    // Navigate with bypass token
    await page.goto(`/browser.html?test_bypass=${BYPASS_TOKEN}`);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Should be on browser.html without redirect to index.html
    await expect(page).toHaveURL(/browser\.html/);

    // Should NOT see login form
    await expect(page.locator('#loginForm')).not.toBeVisible();

    // Should see navigation sidebar
    await expect(page.locator('#categoryNav')).toBeVisible();

    console.log('✓ Successfully bypassed authentication');
  });

  test('should have bypass token removed from URL', async ({ page }) => {
    // Navigate with bypass token
    await page.goto(`/browser.html?test_bypass=${BYPASS_TOKEN}`);

    await page.waitForLoadState('networkidle');

    // Wait a moment for URL cleanup
    await page.waitForTimeout(500);

    // URL should not contain the bypass token anymore
    const currentURL = page.url();
    expect(currentURL).not.toContain('test_bypass');

    console.log('✓ Bypass token removed from URL for security');
  });

  test('should navigate to scenario planning with bypass', async ({ page }) => {
    // Navigate with bypass token
    await page.goto(`/browser.html?test_bypass=${BYPASS_TOKEN}`);

    await page.waitForLoadState('networkidle');

    // Click scenario planning category
    await page.click('button[data-category-id="scenario-planning"]');

    // Wait for mockup to load
    await page.waitForTimeout(1000);

    // Verify iframe is visible
    await expect(page.locator('#mockupFrame')).toBeVisible();

    // Check breadcrumb shows scenario planning
    const breadcrumb = await page.locator('#currentCategory').textContent();
    expect(breadcrumb).toContain('Scenario Planning');

    console.log('✓ Successfully navigated to Scenario Planning');
  });

  test('should fail without correct bypass token', async ({ page }) => {
    // Try with wrong token
    await page.goto(`/browser.html?test_bypass=wrong_token`);

    await page.waitForLoadState('networkidle');

    // Should redirect to login page
    await expect(page).toHaveURL(/index\.html/);

    console.log('✓ Correctly blocks access with invalid token');
  });

  test('should work on index.html too', async ({ page }) => {
    // Navigate to index.html with bypass token
    await page.goto(`/index.html?test_bypass=${BYPASS_TOKEN}`);

    await page.waitForLoadState('networkidle');

    // Should auto-redirect to browser.html since authenticated
    await page.waitForURL(/browser\.html/);

    // Should see navigation
    await expect(page.locator('#categoryNav')).toBeVisible();

    console.log('✓ Bypass works on index.html with auto-redirect');
  });

  test('should load all 8 categories', async ({ page }) => {
    await page.goto(`/browser.html?test_bypass=${BYPASS_TOKEN}`);

    await page.waitForLoadState('networkidle');

    // Count category buttons
    const categories = await page.locator('.category-button').count();
    expect(categories).toBe(8); // 7 original + 1 scenario planning

    // Verify scenario planning is present
    const scenarioButton = await page.locator('button[data-category-id="scenario-planning"]');
    await expect(scenarioButton).toBeVisible();
    await expect(scenarioButton).toContainText('Scenario Planning');

    console.log('✓ All 8 categories visible including Scenario Planning');
  });

});
