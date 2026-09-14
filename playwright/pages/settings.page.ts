import {
  expect,
  Locator,
  Page,
} from '@playwright/test';

export class SettingsPage {
  readonly page: Page;

  readonly organizationSetupButton: Locator;
  readonly generalButton: Locator;

  // Employee ID
  readonly employeeIdMode: Locator;
  readonly employeeIdPrefix: Locator;
  readonly employeeIdSeparator: Locator;
  readonly employeeIdYear: Locator;
  readonly employeeIdNumberLength: Locator;
  readonly employeeIdIncludeMonth: Locator;

  // Shift
  readonly companyDefaultShift: Locator;

  // Grace period
  readonly gracePeriodMinutes: Locator;
  readonly pooledGraceMode: Locator;
  readonly perDayGraceMode: Locator;

  constructor(page: Page) {
    this.page = page;

    this.organizationSetupButton =
      page.getByRole('button', {
        name: 'Organization Setup',
        exact: true,
      });

    this.generalButton =
      page.getByRole('button', {
        name: 'General',
        exact: true,
      });

    this.employeeIdMode =
      page.getByLabel(/How IDs are issued/i);

    this.employeeIdPrefix =
      page.getByLabel('Prefix', {
        exact: true,
      });

    this.employeeIdSeparator =
      page.getByLabel(/Separator/i);

    this.employeeIdYear =
      page.getByLabel(/Include year/i);

    this.employeeIdNumberLength =
      page.getByLabel(/Number length/i);

    this.employeeIdIncludeMonth =
      page.getByLabel('Include month', {
        exact: true,
      });

    this.companyDefaultShift =
      page.getByLabel(/Company default shift/i);

    /*
    * HR PRO currently does not associate these controls
    * with their visible labels through for/id attributes.
    *
    * Use their actual HTML roles/names instead.
    */
    this.gracePeriodMinutes =
      page.getByRole('spinbutton');

    this.pooledGraceMode =
      page.locator(
        'input[type="radio"][name="graceMode"]'
      ).nth(0);

    this.perDayGraceMode =
      page.locator(
        'input[type="radio"][name="graceMode"]'
      ).nth(1);
  }

  async openGeneral() {
    await this.page.goto('/settings', {
      waitUntil: 'domcontentloaded',
    });

    await expect(
      this.organizationSetupButton
    ).toBeVisible();

    await this.organizationSetupButton.click();

    await expect(
      this.generalButton
    ).toBeVisible();

    await this.generalButton.click();
  }
}