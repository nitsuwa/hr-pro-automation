import {
  expect,
  Locator,
  Page,
} from '@playwright/test';

type MinimalEmployeeData = {
  name: string;
  monthlyRate?: string;
  hireDate?: string;
  employeeId?: string;
};

export class EmployeesPage {
  readonly page: Page;

  readonly enrollEmployeeButton: Locator;
  readonly employeeIdInput: Locator;
  readonly fullNameInput: Locator;
  readonly monthlyRateInput: Locator;
  readonly hireDateInput: Locator;
  readonly enrollButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.enrollEmployeeButton =
      page.getByRole('button', {
        name: '+ Enroll Employee',
        exact: true,
      });

    /*
     * HR PRO displays:
     *   Employee ID
     * in Auto mode, and
     *   Employee ID*
     * in Manual mode.
     */
    this.employeeIdInput =
      page.getByLabel(/^Employee ID\*?$/);

    this.fullNameInput =
      page.getByLabel('Full Name*', {
        exact: true,
      });

    this.monthlyRateInput =
      page.getByLabel('Monthly Rate*', {
        exact: true,
      });

    this.hireDateInput =
      page.getByLabel('Date of Hiring*', {
        exact: true,
      });

    this.enrollButton =
      page.getByRole('button', {
        name: 'Enroll',
        exact: true,
      });

    this.cancelButton =
      page.getByRole('button', {
        name: 'Cancel',
        exact: true,
      });
  }

  async open() {
    await this.page.goto('/employees', {
      waitUntil: 'domcontentloaded',
    });

    await expect(
      this.enrollEmployeeButton
    ).toBeVisible();
  }

  async openEnrollment() {
    await this.enrollEmployeeButton.click();

    await expect(
      this.fullNameInput
    ).toBeVisible();
  }

  async enrollMinimalEmployee(
    data: MinimalEmployeeData
  ) {
    await this.open();

    await this.openEnrollment();

    if (data.employeeId) {
      await this.employeeIdInput.fill(
        data.employeeId
      );
    }

    await this.fullNameInput.fill(
      data.name
    );

    await this.monthlyRateInput.fill(
      data.monthlyRate ?? '22000'
    );

    await this.hireDateInput.fill(
      data.hireDate ?? '2026-09-01'
    );

    await this.enrollButton.click();

    await expect(
      this.page.getByText(data.name, {
        exact: true,
      })
    ).toBeVisible();
  }

  async getEmployeeByName(
    employeeName: string
  ) {
    return await this.page.evaluate(
      (name) => {
        const raw =
          localStorage.getItem(
            'hrpro:employees'
          );

        if (!raw) {
          return null;
        }

        const employees =
          JSON.parse(raw);

        return (
          employees.find(
            (employee: {
              name?: string;
            }) =>
              employee.name === name
          ) ?? null
        );
      },
      employeeName
    );
  }
}