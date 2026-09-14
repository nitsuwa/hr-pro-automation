import { test, expect } from '@playwright/test';
import { LoginPage } from '../../playwright/pages/login.page';

test.describe('HR PRO Login', () => {
  test('SMOKE-001 | HR PRO login page loads', async ({ page }) => {
    await page.goto('/', {
      waitUntil: 'domcontentloaded',
    });

    await expect(
      page.getByRole('heading', { name: 'Sign in' })
    ).toBeVisible();

    await expect(
      page.getByText('Try a demo account')
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Sign in' })
    ).toBeVisible();
  });

  test('SMOKE-002 | Demo account roles are available', async ({ page }) => {
    await page.goto('/', {
      waitUntil: 'domcontentloaded',
    });

    const roleSelector = page.getByRole('combobox');

    await expect(roleSelector).toBeVisible();

    await roleSelector.selectOption({
      label: 'System Admin (admin@filmetrics.local)',
    });

    await expect(roleSelector).toHaveValue(/.+/);
  });

  test('SMOKE-003 | System Admin can sign in', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.loginAsDemo(
      'System Admin (admin@filmetrics.local)'
    );

    await expect(
      page.getByText('Employees', {
        exact: true,
      }).first()
    ).toBeVisible({
      timeout: 15_000,
    });
  });
  
});