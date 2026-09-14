import { Page, Locator } from '@playwright/test';

export class NavigationPage {
  readonly page: Page;

  readonly home: Locator;
  readonly timesheet: Locator;
  readonly review: Locator;
  readonly smartPay: Locator;
  readonly disburse: Locator;
  readonly employees: Locator;
  readonly analytics: Locator;
  readonly loans: Locator;
  readonly portal: Locator;
  readonly manual: Locator;
  readonly settings: Locator;

  constructor(page: Page) {
    this.page = page;

    this.home = page.getByRole('link', {
      name: 'Home',
      exact: true,
    });

    this.timesheet = page.getByRole('link', {
      name: 'Timesheet',
      exact: true,
    });

    this.review = page.getByRole('link', {
      name: 'Review',
      exact: true,
    });

    this.smartPay = page.getByRole('link', {
      name: 'Smart Pay',
      exact: true,
    });

    this.disburse = page.getByRole('link', {
      name: 'Disburse',
      exact: true,
    });

    this.employees = page.getByRole('link', {
      name: 'Employees',
      exact: true,
    });

    this.analytics = page.getByRole('link', {
      name: 'Analytics',
      exact: true,
    });

    this.loans = page.getByRole('link', {
      name: 'Loans',
      exact: true,
    });

    this.portal = page.getByRole('link', {
      name: 'Portal',
      exact: true,
    });

    this.manual = page.getByRole('link', {
      name: 'Manual',
      exact: true,
    });

    this.settings = page.getByRole('link', {
      name: 'Settings',
      exact: true,
    });
  }
}