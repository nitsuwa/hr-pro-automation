import { test } from '@playwright/test';

import { LoginPage } from '../../playwright/pages/login.page';
import { DEMO_ACCOUNTS } from '../../playwright/data/demo-accounts';

const roleTests = [
  {
    id: 'SMOKE-004',
    account: DEMO_ACCOUNTS.admin,
  },
  {
    id: 'SMOKE-005',
    account: DEMO_ACCOUNTS.payrollManager,
  },
  {
    id: 'SMOKE-006',
    account: DEMO_ACCOUNTS.hrOfficer,
  },
  {
    id: 'SMOKE-007',
    account: DEMO_ACCOUNTS.supervisor,
  },
  {
    id: 'SMOKE-008',
    account: DEMO_ACCOUNTS.employee,
  },
];

test.describe('HR PRO Demo Account Login', () => {
  for (const roleTest of roleTests) {
    test(
      `${roleTest.id} | ${roleTest.account.name} can sign in`,
      async ({ page }) => {
        const loginPage = new LoginPage(page);

        await loginPage.loginAsDemo(
          roleTest.account.label
        );
      }
    );
  }
});