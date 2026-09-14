import {
  test,
  expect,
} from '../../playwright/fixtures/hrpro.fixture';

import { NavigationPage } from '../../playwright/pages/navigation.page';

test.describe('HR PRO System Admin Navigation', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('systemAdmin');
  });

  const modules = [
    {
      id: 'SMOKE-009',
      name: 'Timesheet',
      property: 'timesheet',
      url: /\/timesheet$/,
    },
    {
      id: 'SMOKE-010',
      name: 'Review',
      property: 'review',
      url: /\/time-attendance$/,
    },
    {
      id: 'SMOKE-011',
      name: 'Smart Pay',
      property: 'smartPay',
      url: /\/payroll-value$/,
    },
    {
      id: 'SMOKE-012',
      name: 'Disburse',
      property: 'disburse',
      url: /\/payroll-disbursement$/,
    },
    {
      id: 'SMOKE-013',
      name: 'Employees',
      property: 'employees',
      url: /\/employees$/,
    },
    {
      id: 'SMOKE-014',
      name: 'Analytics',
      property: 'analytics',
      url: /\/reports$/,
    },
    {
      id: 'SMOKE-015',
      name: 'Loans',
      property: 'loans',
      url: /\/loans$/,
    },
    {
      id: 'SMOKE-016',
      name: 'Portal',
      property: 'portal',
      url: /\/self-service$/,
    },
    {
      id: 'SMOKE-017',
      name: 'Manual',
      property: 'manual',
      url: /\/user-manual$/,
    },
    {
      id: 'SMOKE-018',
      name: 'Settings',
      property: 'settings',
      url: /\/settings$/,
    },
  ] as const;

  for (const module of modules) {
    test(
      `${module.id} | ${module.name} opens successfully`,
      async ({ page }) => {
        const navigation = new NavigationPage(page);

        await navigation[module.property].click();

        await expect(page).toHaveURL(module.url);
      }
    );
  }

  test(
    'SMOKE-019 | Home navigation returns to dashboard',
    async ({ page }) => {
      const navigation = new NavigationPage(page);

      await navigation.employees.click();

      await expect(page).toHaveURL(/\/employees$/);

      await navigation.home.click();

      await expect(page).toHaveURL(/\/$/);
    }
  );
});