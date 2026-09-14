import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly signInHeading: Locator;
  readonly demoAccountSelect: Locator;
  readonly signInButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.signInHeading =
      page.getByRole('heading', {
        name: 'Sign in',
      });

    this.demoAccountSelect =
      page.getByRole('combobox');

    this.signInButton =
      page.getByRole('button', {
        name: 'Sign in',
      });
  }

  async goto() {
    await this.page.goto('/', {
      waitUntil: 'domcontentloaded',
    });
  }

  async selectDemoAccount(accountLabel: string) {
    await this.demoAccountSelect.selectOption({
      label: accountLabel,
    });
  }

  async signIn() {
    await this.signInButton.click();
  }

  async loginAsDemo(accountLabel: string) {
    await this.goto();
    await this.selectDemoAccount(accountLabel);
    await this.signIn();

    /*
     * Generic login-success check.
     *
     * Different roles have different permissions,
     * so we shouldn't check for "Employees" here.
     */
    await expect(this.signInHeading).toBeHidden({
      timeout: 15_000,
    });
  }
}