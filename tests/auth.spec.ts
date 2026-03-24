import { test, expect } from '@playwright/test';

test.describe('Dota 2 Draft Plans E2E', () => {

  test('should allow user to register, login, and create a draft plan', async ({ page }) => {
    // 1. Visit the app
    await page.goto('/');

    // 2. We should be redirected to /login
    await expect(page).toHaveURL(/.*login/);

    // 3. Register a new user
    // Generate a run-specific username to avoid collisions on re-runs
    const username = `playwright_${Date.now()}`;
    const password = 'testpassword';

    // Click 'Register' toggle
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page.getByRole('heading', { name: 'Register New Account' })).toBeVisible();

    // Fill form
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill(password);
    
    // Listen for dialog if it appears
    page.once('dialog', dialog => dialog.accept());
    
    // Submit
    await page.getByRole('button', { name: 'Create Account' }).click();

    // 4. Assuming it toggled back to Login automatically (based on Login.tsx logic)
    await expect(page.getByRole('heading', { name: 'Login to Draft Plans' })).toBeVisible();

    // Fill Login
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // 5. Should be redirected to Draft Plans List
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Your Draft Plans' })).toBeVisible();

    // 6. Create a Draft Plan
    await page.getByRole('button', { name: 'Create Draft Plan' }).click();
    await expect(page.getByRole('heading', { name: 'Create New Draft Plan' })).toBeVisible();

    const planName = 'My Awesome TI Draft';
    await page.getByLabel('Plan Name').fill(planName);
    await page.getByLabel('Description (Optional)').fill('Test drafted by Playwright');
    await page.getByRole('button', { name: 'Save Plan' }).click();

    // 7. Should be redirected to Draft Plan Detail page
    await expect(page).toHaveURL(/.*draft\/\d+/);
    await expect(page.getByRole('heading', { name: planName })).toBeVisible();

    // 8. Open Hero Browser and ban a hero
    await page.getByRole('button', { name: 'Add Hero' }).first().click(); // Add Hero to Ban List
    await expect(page.getByRole('heading', { name: 'Hero Browser' })).toBeVisible();
    
    // Search hero
    await page.getByPlaceholder('Search heroes...').fill('Anti-Mage');
    // Click Select 
    await page.getByRole('button', { name: 'Select' }).first().click();

    // It should appear in the Ban List
    await expect(page.getByText('Anti-Mage')).toBeVisible();

    // 9. Check Draft Summary
    await page.getByRole('button', { name: 'View Summary' }).click();
    await expect(page.getByRole('heading', { name: 'Draft Summary' })).toBeVisible();
    await expect(page.getByText('Banned Heroes (1)')).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();

    // 10. Logout
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/.*login/);
  });
});
