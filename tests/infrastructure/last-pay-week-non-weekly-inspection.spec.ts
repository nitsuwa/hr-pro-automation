import {
  Page,
} from '@playwright/test';

import {
  test,
  expect,
} from '../../playwright/fixtures/hrpro.fixture';

import { SettingsPage } from '../../playwright/pages/settings.page';
import { EmployeesPage } from '../../playwright/pages/employees.page';

function moneyFromText(
  text: string,
  label: string
) {
  const escaped =
    label.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    );

  const match =
    text.match(
      new RegExp(
        `${escaped}\\s*₱-?([\\d,]+(?:\\.\\d{2})?)`,
        'i'
      )
    );

  if (!match) {
    throw new Error(
      `Could not find amount for "${label}".`
    );
  }

  return Number(
    match[1].replace(
      /,/g,
      ''
    )
  );
}

async function makeDateVisible(
  page: Page,
  dateName: string
) {
  const dateButton =
    page.getByRole(
      'button',
      {
        name:
          dateName,
        exact:
          true,
      }
    );

  for (
    let attempt = 0;
    attempt < 12;
    attempt++
  ) {
    if (
      await dateButton.count() >
        0
    ) {
      const first =
        dateButton.first();

      if (
        await first.isVisible()
      ) {
        return first;
      }
    }

    await page
      .getByRole(
        'button',
        {
          name:
            'Previous month',
          exact:
            true,
        }
      )
      .click();
  }

  throw new Error(
    `Could not display calendar date: ${dateName}`
  );
}

async function selectCutoff(
  page: Page
) {
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
      'February 15, 2026'
    );

  await expect(
    toButton
  ).toBeEnabled();

  await toButton.click();

  const selectDatesButton =
    page.getByRole(
      'button',
      {
        name:
          'Select dates',
        exact:
          true,
      }
    );

  await expect(
    selectDatesButton
  ).toBeVisible();

  await selectDatesButton.click();

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
        '2026-02-15',
    });
}

test(
  'TEMP | SET_082 | Inspect Semi-Monthly statutory contributions while Last Pay Week Only is selected',
  async ({
    page,
    loginAs,
  }) => {
    test.setTimeout(
      120_000
    );

    await loginAs(
      'systemAdmin'
    );

    const settings =
      new SettingsPage(page);

    const employees =
      new EmployeesPage(page);

    /*
     * =====================================================
     * SET WEEKLY CONTRIBUTION SETTING
     * =====================================================
     *
     * SET_082 says a Semi-Monthly / Monthly
     * employee should follow its normal rules
     * and should not be changed by this setting.
     */

    await settings.openGeneral();

    await settings
      .selectContributionTiming(
        'last-pay-week'
      );

    const policy =
      await page.evaluate(
        () =>
          JSON.parse(
            localStorage.getItem(
              'hrpro:contributionPolicy'
            ) ?? '{}'
          )
      );

    expect(
      policy.timing
    ).toBe('DESIGNATED');

    /*
     * =====================================================
     * CREATE CONTROLLED SEMI-MONTHLY EMPLOYEE
     * =====================================================
     */

    await settings.employeeIdMode
      .selectOption('auto');

    await employees.open();

    await employees.openEnrollment();

    const employeeName =
      'PW Last Pay Week Only Semi Monthly Employee';

    const monthlySalary =
      22000;

    await employees.fullNameInput.fill(
      employeeName
    );

    await employees.monthlyRateInput.fill(
      String(
        monthlySalary
      )
    );

    await page
      .getByLabel(
        /^Pay Schedule/
      )
      .selectOption(
        'Semi-Monthly'
      );

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

    const savedEmployee =
      await employees.getEmployeeByName(
        employeeName
      );

    console.log(
      '\n========== CONTROLLED SEMI-MONTHLY EMPLOYEE =========='
    );

    console.log(
      JSON.stringify(
        savedEmployee,
        null,
        2
      )
    );

    /*
     * =====================================================
     * PROCESS FIRST SEMI-MONTHLY CUTOFF
     * =====================================================
     */

    await page.goto(
      '/timesheet',
      {
        waitUntil:
          'domcontentloaded',
      }
    );

    await selectCutoff(
      page
    );

    await page
      .getByLabel(
        'Payroll date',
        {
          exact:
            true,
        }
      )
      .fill(
        '2026-02-20'
      );

    await page
      .getByLabel(
        /^Batch name/
      )
      .fill(
        'PWLP_2026_02_SemiMonthly_1'
      );

    await page
      .getByLabel(
        'Search',
        {
          exact:
            true,
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

    const checkbox =
      employeeRow.locator(
        'input[type="checkbox"]'
      );

    await checkbox.check();

    await expect(
      checkbox
    ).toBeChecked();

    /*
     * Timesheet → Review
     */

    const reviewButton =
      page.getByRole(
        'button',
        {
          name:
            'Review attendance →',
          exact:
            true,
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
          exact:
            true,
        }
      );

    await expect(
      submitToReview
    ).toBeVisible();

    await submitToReview.click();

    /*
     * Review → Smart Pay
     */

    const submitPayroll =
      page.getByRole(
        'button',
        {
          name:
            'Submit for payroll value check →',
          exact:
            true,
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
          exact:
            true,
        }
      )
    ).toBeVisible();

    await page
      .getByRole(
        'button',
        {
          name:
            'Submit',
          exact:
            true,
        }
      )
      .click();

    await page.waitForTimeout(
      300
    );

    const smartPayHeading =
      page.getByRole(
        'heading',
        {
          name:
            'Smart Pay',
          exact:
            true,
        }
      );

    const smartPayAlreadyOpen =
      await smartPayHeading
        .isVisible()
        .catch(
          () => false
        );

    if (
      !smartPayAlreadyOpen
    ) {
      const goToPayrollValue =
        page.getByRole(
          'button',
          {
            name:
              'Go to Payroll Value →',
            exact:
              true,
          }
        );

      if (
        await goToPayrollValue.count() >
          0
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
     * READ SEMI-MONTHLY CONTRIBUTIONS
     * =====================================================
     */

    const smartPayRow =
      page
        .locator('tr')
        .filter({
          hasText:
            employeeName,
        });

    await expect(
      smartPayRow
    ).toBeVisible();

    console.log(
      '\nEMPLOYEE ROW BEFORE EXPANDING:'
    );

    console.log(
      (
        await smartPayRow
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

    await page.waitForTimeout(
      200
    );

    const bodyText =
      await page
        .locator('body')
        .innerText();

    const sss =
      moneyFromText(
        bodyText,
        'SSS (EE share)'
      );

    const philHealth =
      moneyFromText(
        bodyText,
        'PhilHealth (EE share)'
      );

    const pagIbig =
      moneyFromText(
        bodyText,
        'Pag-IBIG (EE share)'
      );

    /*
     * Read the current prototype government
     * table and calculate the monthly values.
     */

    const govTables =
      await page.evaluate(
        () =>
          JSON.parse(
            localStorage.getItem(
              'hrpro:govTables'
            ) ?? '{}'
          )
      );

    const sssBase =
      Math.min(
        Math.max(
          monthlySalary,
          govTables.sss.mscFloor
        ),
        govTables.sss.mscCeiling
      );

    const expectedMonthlySSS =
      sssBase *
      govTables.sss.eeRate;

    const philHealthBase =
      Math.min(
        Math.max(
          monthlySalary,
          govTables.philhealth.floor
        ),
        govTables.philhealth.ceiling
      );

    const expectedMonthlyPhilHealth =
      (
        philHealthBase *
        govTables.philhealth.rate
      ) / 2;

    const pagIbigRate =
      monthlySalary <=
      govTables.pagibig.lowThreshold
        ? govTables.pagibig.lowRate
        : govTables.pagibig.highRate;

    const expectedMonthlyPagIbig =
      Math.min(
        monthlySalary,
        govTables.pagibig.cap
      ) *
      pagIbigRate;

    /*
     * Reference for a normal two-cutoff
     * Semi-Monthly split.
     *
     * This is inspection only — we are not
     * adding permanent assertions yet.
     */

    const expectedSemiMonthly = {
      sss:
        Number(
          (
            expectedMonthlySSS /
            2
          ).toFixed(
            2
          )
        ),

      philHealth:
        Number(
          (
            expectedMonthlyPhilHealth /
            2
          ).toFixed(
            2
          )
        ),

      pagIbig:
        Number(
          (
            expectedMonthlyPagIbig /
            2
          ).toFixed(
            2
          )
        ),
    };

    const actual = {
      sss,
      philHealth,
      pagIbig,
    };

    console.log(
      '\n\n============================================'
    );

    console.log(
      'SET_082 — LAST PAY WEEK NON-WEEKLY INSPECTION'
    );

    console.log(
      '============================================'
    );

    console.log(
      '\nPAY SCHEDULE:'
    );

    console.log(
      savedEmployee?.paySchedule
    );

    console.log(
      '\nWEEKLY CONTRIBUTION SETTING:'
    );

    console.log(
      policy
    );

    console.log(
      '\nCUTOFF:'
    );

    console.log(
      '2026-02-01 → 2026-02-15'
    );

    console.log(
      '\nACTUAL CONTRIBUTIONS:'
    );

    console.log(
      actual
    );

    console.log(
      '\nREFERENCE SEMI-MONTHLY CONTRIBUTIONS:'
    );

    console.log(
      expectedSemiMonthly
    );

    console.log(
      '\nDIFFERENCE:'
    );

    console.log({
      sss:
        Number(
          (
            actual.sss -
            expectedSemiMonthly.sss
          ).toFixed(
            2
          )
        ),

      philHealth:
        Number(
          (
            actual.philHealth -
            expectedSemiMonthly.philHealth
          ).toFixed(
            2
          )
        ),

      pagIbig:
        Number(
          (
            actual.pagIbig -
            expectedSemiMonthly.pagIbig
          ).toFixed(
            2
          )
        ),
    });

    console.log(
      '\nPOLICY / GOV TABLE STORAGE:'
    );

    console.log(
      JSON.stringify(
        {
          contributionPolicy:
            policy,
          govTables,
        },
        null,
        2
      )
    );

    console.log(
      '\n============================================\n'
    );

    /*
     * IMPORTANT:
     *
     * SET_082 expected result:
     * Semi-Monthly / Monthly employees should
     * follow their normal contribution rules
     * and should not be affected by the weekly
     * statutory contribution setting.
     *
     * We inspect first, then decide PASS/FAIL
     * from the actual HR PRO output.
     */
  }
);
