import {
  test as base,
  expect,
  Page,
} from '@playwright/test';

import { LoginPage } from '../pages/login.page';

import {
  DEMO_ACCOUNTS,
  DemoAccountKey,
} from '../data/demo-accounts';

type HRProFixtures = {
  loginAs: (role: DemoAccountKey) => Promise<Page>;
};

export const test = base.extend<HRProFixtures>({
  loginAs: async ({ page }, use) => {
    await use(async (role: DemoAccountKey) => {
      const loginPage = new LoginPage(page);

      await loginPage.loginAsDemo(
        DEMO_ACCOUNTS[role].label
      );

      return page;
    });
  },
});

export { expect };