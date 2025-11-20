# Testing Guide

## Authentication Bypass for Automated Tests

The mockup browser includes a test bypass mechanism for automated testing with tools like Playwright, Cypress, or Selenium.

### How to Bypass Authentication

Add the `test_bypass` query parameter to any URL:

```
https://nschenry.github.io/aas-mockup-browser/browser.html?test_bypass=playwright_test_bypass_2024
```

Or for local testing:
```
http://localhost:8000/browser.html?test_bypass=playwright_test_bypass_2024
```

### Playwright Example

```javascript
import { test, expect } from '@playwright/test';

test('should bypass authentication and access mockup browser', async ({ page }) => {
  // Navigate with bypass token
  await page.goto('https://nschenry.github.io/aas-mockup-browser/browser.html?test_bypass=playwright_test_bypass_2024');

  // Should be on browser page without password prompt
  await expect(page).toHaveURL(/browser\.html/);

  // Verify navigation is visible
  await expect(page.locator('#categoryNav')).toBeVisible();
});

test('should navigate to scenario planning', async ({ page }) => {
  await page.goto('https://nschenry.github.io/aas-mockup-browser/browser.html?test_bypass=playwright_test_bypass_2024');

  // Click scenario planning category
  await page.click('button[data-category-id="scenario-planning"]');

  // Verify mockup loads
  await expect(page.frameLocator('#mockupFrame').locator('h1')).toContainText('Scenario Planning');
});
```

### Cypress Example

```javascript
describe('AAS Mockup Browser', () => {
  beforeEach(() => {
    cy.visit('https://nschenry.github.io/aas-mockup-browser/browser.html?test_bypass=playwright_test_bypass_2024');
  });

  it('should bypass authentication', () => {
    cy.url().should('include', 'browser.html');
    cy.get('#categoryNav').should('be.visible');
  });

  it('should load scenario planning mockup', () => {
    cy.get('[data-category-id="scenario-planning"]').click();
    cy.get('#mockupFrame').should('be.visible');
  });
});
```

### Security Note

The bypass token is:
- Only for testing purposes
- Creates a standard 24-hour session
- Automatically removed from URL after session creation
- Should be kept private in your test configuration

### Changing the Bypass Token

To change the bypass token, edit `assets/js/auth.js`:

```javascript
const AUTH_CONFIG = {
    PASSWORD: 'aas2024',
    SESSION_KEY: 'aas_mockup_session',
    SESSION_DURATION: 24 * 60 * 60 * 1000,
    TEST_BYPASS_TOKEN: 'your_custom_token_here' // Change this
};
```

## Running Tests Locally

1. Start a local web server:
   ```bash
   python3 -m http.server 8000
   ```

2. Run your tests against `http://localhost:8000`

3. Use the bypass token as shown in the examples above
