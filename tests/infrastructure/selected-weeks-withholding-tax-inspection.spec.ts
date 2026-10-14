import {
  Page,
} from '@playwright/test';

import {
  test,
  expect,
} from '../../playwright/fixtures/hrpro.fixture';

import { SettingsPage } from '../../playwright/pages/settings.page';
import { EmployeesPage } from '../../playwright/pages/employees.page';

async function makeDateVisible(
  page: Page,
  dateName: string
) {
  const dateButton =
    page.getByRole(
      'button',
      {
        name: dateName,
        exact: true,
      }
    );

  for (
    let attempt = 0;
    attempt < 12;
    attempt++
  ) {
    if (
      await dateButton.count() > 0 &&
      await dateButton.first().isVisible()
    ) {
      return dateButton.first();
    }

    await page
      .getByRole(
        'button',
        {
          name: 'Previous month',
          exact: true,
        }
      )
      .click();
  }

  throw new Error(
    `Could not display calendar date: ${dateName}`
  );
}

test(
  'TEMP | SET_068 | Inspect weekly withholding tax under selected pay weeks',
  async ({
    page,
    loginAs,
  }) => {
    test.setTimeout(90_000);

    /*
     * =====================================================
     * SET_068
     * Verify withholding tax computation while the
     * Only on Chosen Pay Weeks setting is selected.
     *
     * Inspection goal:
     * Confirm the Weekly employee still receives a
     * weekly withholding-tax computation while
     * only Weeks 2 and 4 are selected for statutory deductions.
     * =====================================================
     */

    await loginAs('systemAdmin');

    const settings =
      new SettingsPage(page);

    const employees =
      new EmployeesPage(page);

    /*
     * =====================================================
     * CONFIGURE SELECTED PAY WEEKS
     * =====================================================
     */

    await settings.openGeneral();

    await settings
      .selectContributionTiming(
        'selected-weeks'
      );

    await settings
      .setContributionWeeks([
        2,
        4,
      ]);

    const policy =
      await page.evaluate(() =>
        JSON.parse(
          localStorage.getItem(
            'hrpro:contributionPolicy'
          ) ?? '{}'
        )
      );

    expect(
      policy.timing
    ).toBe('SELECTED_WEEKS');

    expect(
      policy.weeks
    ).toEqual([
      2,
      4,
    ]);

    await settings.employeeIdMode
      .selectOption('auto');

    /*
     * =====================================================
     * CREATE A HIGHER-SALARY WEEKLY EMPLOYEE
     * =====================================================
     *
     * We use PHP 100,000 monthly salary so the weekly
     * withholding tax should be non-zero and easier to
     * inspect than our previous PHP 22,000 employee.
     */

    await employees.open();
    await employees.openEnrollment();

    const employeeName =
      'PW Selected Weeks Tax Employee';

    await employees.fullNameInput.fill(
      employeeName
    );

    await employees.monthlyRateInput.fill(
      '100000'
    );

    await page
      .getByLabel(/^Pay Schedule/)
      .selectOption('Weekly');

    const noAbsenceDeduction =
      page.getByRole(
        'checkbox',
        {
          name:
            /No absence deductions/i,
        }
      );

    await noAbsenceDeduction.check();

    await expect(
      noAbsenceDeduction
    ).toBeChecked();

    await employees.hireDateInput.fill(
      '2026-02-01'
    );

    await employees.enrollButton.click();

    await expect
      .poll(async () => {
        return (
          await employees
            .getEmployeeByName(
              employeeName
            )
        ) !== null;
      })
      .toBe(true);

    const employee =
      await employees.getEmployeeByName(
        employeeName
      );

    console.log(
      '\n========== CONTROLLED TAX EMPLOYEE =========='
    );

    console.log(
      JSON.stringify(
        employee,
        null,
        2
      )
    );

    /*
     * =====================================================
     * PROCESS ONE WEEKLY PAYROLL
     * FEBRUARY 1-7, 2026
     * =====================================================
     */

    await page.goto(
      '/timesheet',
      {
        waitUntil:
          'domcontentloaded',
      }
    );

    const fromButton =
      await makeDateVisible(
        page,
        'February 1, 2026'
      );

    await expect(
      fromButton
    ).toBeEnabled();

    await fromButton.click();

    const toButton =
      await makeDateVisible(
        page,
        'February 7, 2026'
      );

    await expect(
      toButton
    ).toBeEnabled();

    await toButton.click();

    await page
      .getByRole(
        'button',
        {
          name:
            'Select dates',
          exact: true,
        }
      )
      .click();

    await expect
      .poll(async () => {
        return await page.evaluate(
          () => {
            const raw =
              localStorage.getItem(
                'hrpro:cutoff'
              );

            if (!raw) {
              return null;
            }

            const cutoff =
              JSON.parse(raw);

            return {
              from:
                cutoff.from,
              to:
                cutoff.to,
            };
          }
        );
      })
      .toEqual({
        from:
          '2026-02-01',
        to:
          '2026-02-07',
      });

    await page
      .getByLabel(
        'Payroll date',
        {
          exact: true,
        }
      )
      .fill(
        '2026-02-13'
      );

    await page
      .getByLabel(
        /^Batch name/
      )
      .fill(
        'PWF4_2026_02_TAX_WEEK1'
      );

    await page
      .getByLabel(
        'Search',
        {
          exact: true,
        }
      )
      .fill(
        employeeName
      );

    const employeeRow =
      page
        .locator('tr')
        .filter({
          hasText:
            employeeName,
        });

    await expect(
      employeeRow
    ).toBeVisible();

    const employeeCheckbox =
      employeeRow.locator(
        'input[type="checkbox"]'
      );

    await employeeCheckbox.check();

    await expect(
      employeeCheckbox
    ).toBeChecked();

    /*
     * =====================================================
     * REVIEW
     * =====================================================
     */

    const reviewButton =
      page.getByRole(
        'button',
        {
          name:
            'Review attendance →',
          exact: true,
        }
      );

    await expect(
      reviewButton
    ).toBeEnabled();

    await reviewButton.click();

    const submitToReview =
      page.getByRole(
        'button',
        {
          name:
            'Submit to Review',
          exact: true,
        }
      );

    await expect(
      submitToReview
    ).toBeVisible();

    await submitToReview.click();

    /*
     * =====================================================
     * REVIEW -> SMART PAY
     * =====================================================
     */

    const submitPayroll =
      page.getByRole(
        'button',
        {
          name:
            'Submit for payroll value check →',
          exact: true,
        }
      );

    await expect(
      submitPayroll
    ).toBeVisible();

    await submitPayroll.click();

    await expect(
      page.getByRole(
        'heading',
        {
          name:
            'Submit for payroll value check?',
          exact: true,
        }
      )
    ).toBeVisible();

    await page
      .getByRole(
        'button',
        {
          name:
            'Submit',
          exact: true,
        }
      )
      .click();

    await page.waitForTimeout(300);

    const smartPayHeading =
      page.getByRole(
        'heading',
        {
          name:
            'Smart Pay',
          exact: true,
        }
      );

    const smartPayAlreadyOpen =
      await smartPayHeading
        .isVisible()
        .catch(() => false);

    if (!smartPayAlreadyOpen) {
      const goToPayrollValue =
        page.getByRole(
          'button',
          {
            name:
              'Go to Payroll Value →',
            exact: true,
          }
        );

      if (
        await goToPayrollValue.count() > 0
      ) {
        await goToPayrollValue.click();
      }
    }

    await expect(
      smartPayHeading
    ).toBeVisible({
      timeout:
        15_000,
    });

    /*
     * =====================================================
     * EXPAND EMPLOYEE COMPUTATION
     * =====================================================
     */

    const smartPayEmployeeRow =
      page
        .locator('tr')
        .filter({
          hasText:
            employeeName,
        });

    await expect(
      smartPayEmployeeRow
    ).toBeVisible();

    console.log(
      '\nEMPLOYEE ROW BEFORE EXPANDING:'
    );

    console.log(
      (
        await smartPayEmployeeRow
          .first()
          .innerText()
      )
        .replace(
          /\s+/g,
          ' '
        )
        .trim()
    );

    const expandButton =
      page.getByRole(
        'button',
        {
          name:
            new RegExp(
              employeeName,
              'i'
            ),
        }
      );

    await expect(
      expandButton
    ).toBeVisible();

    await expandButton.click();

    await page.waitForTimeout(300);

    /*
     * =====================================================
     * SET_054 INSPECTION OUTPUT
     * =====================================================
     */

    const bodyText =
      await page
        .locator('body')
        .innerText();

    const relevantLines =
      bodyText
        .split('\n')
        .map(
          (line) =>
            line.trim()
        )
        .filter(
          (line) =>
            /Basic salary|Taxable compensation|statutory|withholding|SSS|PhilHealth|Pag-IBIG|Total deductions|NET PAY/i
              .test(line)
        );

    const taxRelatedRows =
      await page
        .locator('tr')
        .filter({
          hasText:
            /Withholding|W\/TAX|Taxable|SSS|PhilHealth|Pag-IBIG/i,
        })
        .allInnerTexts();

    const taxStorage =
      await page.evaluate(() => {
        const keys = [
          'hrpro:cutoff',
          'hrpro:contributionPolicy',
          'hrpro:govTables',
          'hrpro:payrollHistory',
        ];

        const result:
          Record<
            string,
            string | null
          > = {};

        for (
          const key of keys
        ) {
          result[key] =
            localStorage.getItem(
              key
            );
        }

        return result;
      });

    console.log(
      '\n\n============================================'
    );

    console.log(
      'SET_068 — SELECTED PAY WEEKS WITHHOLDING TAX INSPECTION'
    );

    console.log(
      '============================================'
    );

    console.log(
      '\nPAYROLL WEEK:'
    );

    console.log(
      '2026-02-01 → 2026-02-07'
    );

    console.log(
      '\nMONTHLY SALARY:'
    );

    console.log(
      'PHP 100,000'
    );

    console.log(
      '\nRELEVANT COMPUTATION LINES:'
    );

    console.log(
      JSON.stringify(
        relevantLines,
        null,
        2
      )
    );

    console.log(
      '\nTAX / CONTRIBUTION ROWS:'
    );

    console.log(
      JSON.stringify(
        taxRelatedRows.map(
          (text) =>
            text
              .replace(
                /\s+/g,
                ' '
              )
              .trim()
        ),
        null,
        2
      )
    );

    console.log(
      '\nBIR / POLICY STORAGE:'
    );

    console.log(
      JSON.stringify(
        taxStorage,
        null,
        2
      )
    );

    console.log(
      '\n============================================\n'
    );

    /*
     * Inspection only.
     *
     * We are deliberately NOT adding the final
     * SET_068 pass/fail assertion until we see
     * the exact withholding value and the tax
     * table data HR PRO is using for a Weekly run.
     */
  }
);
