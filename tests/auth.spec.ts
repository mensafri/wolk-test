import { test, expect } from '@playwright/test';

test.describe('Dota 2 Draft Plans E2E', () => {

  test('should allow user to register, login, and create a draft plan', async ({ page }) => {
    // 1. Visit the app
    await page.goto('/');

    // 2. We should be redirected to /login
    await expect(page).toHaveURL(/.*login/);

    // 3. Register a new user
    const username = `playwright_${Date.now()}`;
    const password = 'testpassword';

    // Click 'Register' toggle
    await page.getByRole('button', { name: 'Create an account', exact: true }).click();
    await expect(page.getByText('Create an account', { exact: true }).first()).toBeVisible();

    // Fill form
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill(password);
    
    // Listen for dialog if it appears
    page.once('dialog', dialog => dialog.accept());
    
    // Submit
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click();

    // 4. Assuming it toggled back to Login automatically
    await expect(page.getByText('Sign in', { exact: true }).first()).toBeVisible();

    // Fill Login
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    // 5. Should be redirected to Draft Plans List
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Your Draft Plans' })).toBeVisible();

    // 6. Create a Draft Plan directly from the panel
    const planName = 'My Awesome TI Draft';
    await page.getByLabel('Plan Name').fill(planName);
    await page.getByLabel('Description (Optional)').fill('Test drafted by Playwright');
    await page.getByRole('button', { name: 'Save Plan' }).click();

    // 7. Click on the newly created Draft Plan card to enter detail view
    await page.getByText(planName).click();
    await expect(page).toHaveURL(/.*draft\/\d+/);
    await expect(page.getByRole('heading', { name: planName })).toBeVisible();

    // 8. Open Hero Browser and ban a hero
    await page.getByRole('button', { name: 'Add Ban' }).click();
    await expect(page.getByRole('heading', { name: 'Declare Ban Target' })).toBeVisible();
    
    // Search hero
    await page.getByPlaceholder('Search heroes by name or role...').fill('Anti-Mage');
    // Click Select 
    await page.getByRole('button', { name: 'SELECT' }).first().click();

    // Wait for modal to hide
    await expect(page.getByRole('heading', { name: 'Declare Ban Target' })).toBeHidden();

    // It should appear in the Ban List
    await expect(page.getByRole('heading', { name: 'Anti-Mage', exact: true })).toBeVisible();

    // 9. Check Draft Summary
    await page.getByRole('button', { name: 'Draft Summary' }).click();
    await expect(page.getByRole('heading', { name: 'Draft Strategy Summary' })).toBeVisible();
    await expect(page.getByText('Target Bans').first()).toBeVisible();

    // 10. Logout
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page).toHaveURL(/.*login/);
  });
});
