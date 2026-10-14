import {
  Page,
} from '@playwright/test';

import {
  test,
  expect,
} from '../../playwright/fixtures/hrpro.fixture';

import { SettingsPage } from '../../playwright/pages/settings.page';
import { EmployeesPage } from '../../playwright/pages/employees.page';

type LoginAs = (
  account:
    | 'systemAdmin'
    | 'admin'
) => Promise<void>;

type WeekInput = {
  number: number;
  fromName: string;
  toName: string;
  from: string;
  to: string;
  payDate: string;
  batchName: string;
};

type WeekResult = {
  week: number;
  cutoff: string;
  sss: number;
  philHealth: number;
  pagIbig: number;
};

/*
 * =====================================================
 * MONEY PARSER
 * =====================================================
 */

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

/*
 * =====================================================
 * CALENDAR HELPER
 * =====================================================
 */

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

    const previousMonth =
      page.getByRole(
        'button',
        {
          name:
            'Previous month',
          exact:
            true,
        }
      );

    await expect(
      previousMonth
    ).toBeVisible();

    await previousMonth.click();
  }

  throw new Error(
    `Could not display calendar date: ${dateName}`
  );
}

/*
 * =====================================================
 * SELECT CUTOFF
 * =====================================================
 */

async function selectCutoff(
  page: Page,
  week: WeekInput
) {
  const fromButton =
    await makeDateVisible(
      page,
      week.fromName
    );

  await expect(
    fromButton
  ).toBeEnabled({
    timeout:
      15_000,
  });

  await fromButton.click();

  const toButton =
    await makeDateVisible(
      page,
      week.toName
    );

  await expect(
    toButton
  ).toBeEnabled({
    timeout:
      15_000,
  });

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
        week.from,

      to:
        week.to,
    });
}

/*
 * =====================================================
 * APPROVE + RELEASE ONE WEEK
 * =====================================================
 */

async function approveAndRelease(
  page: Page,
  loginAs: LoginAs,
  week: WeekInput
) {
  /*
   * Smart Pay → Payroll Register
   */
  const submitForApproval =
    page.getByRole(
      'button',
      {
        name:
          'Submit for approval →',
        exact:
          true,
      }
    );

  await expect(
    submitForApproval
  ).toBeVisible();

  await submitForApproval.click();

  /*
   * =====================================================
   * FIRST APPROVAL — SYSTEM ADMIN
   * =====================================================
   */

  const firstApproveButton =
    page.getByRole(
      'button',
      {
        name:
          'Approve payroll →',
        exact:
          true,
      }
    );

  await expect(
    firstApproveButton
  ).toBeVisible({
    timeout:
      15_000,
  });

  await expect(
    firstApproveButton
  ).toBeEnabled();

  await firstApproveButton.click();

  await expect(
    page.getByRole(
      'heading',
      {
        name:
          'Approve this payroll?',
        exact:
          true,
      }
    )
  ).toBeVisible();

  const firstConfirmButton =
    page.getByRole(
      'button',
      {
        name:
          'Approve payroll',
        exact:
          true,
      }
    );

  await expect(
    firstConfirmButton
  ).toBeVisible();

  await firstConfirmButton.click();

  await expect
    .poll(async () => {
      return await page.evaluate(
        () => {
          const raw =
            localStorage.getItem(
              'hrpro:generated'
            );

          if (!raw) {
            return null;
          }

          const generated =
            JSON.parse(raw);

          return {
            currentStepIndex:
              generated
                .workflow
                ?.currentStepIndex,

            status:
              generated
                .workflow
                ?.status,

            historyLength:
              generated
                .workflow
                ?.history
                ?.length,
          };
        }
      );
    })
    .toEqual({
      currentStepIndex:
        1,

      status:
        'In Progress',

      historyLength:
        1,
    });

  console.log(
    `WEEK ${week.number} FIRST APPROVAL: COMPLETE`
  );

  /*
   * =====================================================
   * SWITCH TO ADMIN FOR FINAL RELEASE
   * =====================================================
   */

  const signOutButton =
    page.getByRole(
      'button',
      {
        name:
          'Sign out',
        exact:
          true,
      }
    );

  await expect(
    signOutButton
  ).toBeVisible();

  await signOutButton.click();

  await loginAs(
    'admin'
  );

  await page.goto(
    '/payroll-report',
    {
      waitUntil:
        'domcontentloaded',
    }
  );

  /*
   * =====================================================
   * FINAL APPROVAL
   * =====================================================
   */

  const finalApproveButton =
    page.getByRole(
      'button',
      {
        name:
          'Approve payroll →',
        exact:
          true,
      }
    );

  await expect(
    finalApproveButton
  ).toBeVisible({
    timeout:
      15_000,
  });

  await expect(
    finalApproveButton
  ).toBeEnabled();

  await finalApproveButton.click();

  await expect(
    page.getByRole(
      'heading',
      {
        name:
          'Approve this payroll?',
        exact:
          true,
      }
    )
  ).toBeVisible();

  const finalConfirmButton =
    page.getByRole(
      'button',
      {
        name:
          'Approve payroll',
        exact:
          true,
      }
    );

  await expect(
    finalConfirmButton
  ).toBeVisible();

  await finalConfirmButton.click();

  /*
   * =====================================================
   * VERIFY RELEASED
   * =====================================================
   */

  const cutoffKey =
    `${week.from}_${week.to}`;

  await expect
    .poll(async () => {
      return await page.evaluate(
        ({
          cutoffKey,
        }) => {
          const rawStages =
            localStorage.getItem(
              'hrpro:runStages'
            );

          const rawGenerated =
            localStorage.getItem(
              'hrpro:generated'
            );

          const rawHistory =
            localStorage.getItem(
              'hrpro:payrollHistory'
            );

          const stages =
            rawStages
              ? JSON.parse(
                  rawStages
                )
              : {};

          const generated =
            rawGenerated
              ? JSON.parse(
                  rawGenerated
                )
              : null;

          const history =
            rawHistory
              ? JSON.parse(
                  rawHistory
                )
              : [];

          return {
            stage:
              stages[
                cutoffKey
              ],

            generatedStage:
              generated
                ?.stage,

            workflowStatus:
              generated
                ?.workflow
                ?.status,

            approvalCount:
              generated
                ?.workflow
                ?.history
                ?.length,

            inHistory:
              history.some(
                (
                  item: any
                ) =>
                  item.cutoffKey ===
                  cutoffKey
              ),
          };
        },
        {
          cutoffKey,
        }
      );
    })
    .toEqual({
      stage:
        'Released',

      generatedStage:
        'Released',

      workflowStatus:
        'Approved',

      approvalCount:
        2,

      inHistory:
        true,
    });

  console.log(
    `WEEK ${week.number} FINAL APPROVAL: RELEASED`
  );

  /*
   * Return to System Admin
   * for next payroll week.
   */
  const adminSignOut =
    page.getByRole(
      'button',
      {
        name:
          'Sign out',
        exact:
          true,
      }
    );

  await expect(
    adminSignOut
  ).toBeVisible();

  await adminSignOut.click();

  await loginAs(
    'systemAdmin'
  );
}

/*
 * =====================================================
 * PROCESS ONE WEEK
 * =====================================================
 */

async function processWeek(
  page: Page,
  loginAs: LoginAs,
  employeeName: string,
  week: WeekInput
): Promise<WeekResult> {
  /*
   * =====================================================
   * TIMESHEET
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
    page,
    week
  );

  console.log(
    `\n========== WEEK ${week.number} CUTOFF ==========`
  );

  console.log(
    `${week.from} → ${week.to}`
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
      week.payDate
    );

  await page
    .getByLabel(
      /^Batch name/
    )
    .fill(
      week.batchName
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
   * =====================================================
   * TIMESHEET → REVIEW
   * =====================================================
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
   * =====================================================
   * REVIEW → SMART PAY
   * =====================================================
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

  /*
   * Support current + older prototype
   * navigation behavior.
   */
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
   * READ CONTRIBUTIONS
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

  console.log(
    `\n========== WEEK ${week.number} CONTRIBUTIONS ==========`
  );

  console.log({
    sss,
    philHealth,
    pagIbig,
  });

  /*
   * Finish and release this week
   * before starting the next one.
   */
  await approveAndRelease(
    page,
    loginAs,
    week
  );

  return {
    week:
      week.number,

    cutoff:
      `${week.from} → ${week.to}`,

    sss,

    philHealth,

    pagIbig,
  };
}

/*
 * =====================================================
 * TEST
 * =====================================================
 */

test(
  'TEMP | SET_039-040 | Inspect Every Pay Week across a five-pay-week month',
  async ({
    page,
    loginAs,
  }) => {
    test.setTimeout(
      300_000
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
     * CONFIGURE EVERY PAY WEEK
     * =====================================================
     */

    await settings.openGeneral();

    await settings
      .selectContributionTiming(
        'every-pay-week'
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
    ).toBe('SPLIT');

    console.log(
      '\n========== CONTRIBUTION POLICY =========='
    );

    console.log(
      policy
    );

    /*
     * =====================================================
     * CREATE CONTROLLED WEEKLY EMPLOYEE
     * =====================================================
     */

    await settings.employeeIdMode
      .selectOption('auto');

    await employees.open();

    await employees.openEnrollment();

    const employeeName =
      'PW Five Week Employee';

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
        'Weekly'
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
      '2026-03-01'
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
      '\n========== CONTROLLED EMPLOYEE =========='
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
     * SET_039
     * PROCESS FIVE PAY WEEKS
     * =====================================================
     */

    const weeks:
      WeekInput[] = [
      {
        number:
          1,

        fromName:
          'March 1, 2026',

        toName:
          'March 7, 2026',

        from:
          '2026-03-01',

        to:
          '2026-03-07',

        payDate:
          '2026-03-13',

        batchName:
          'PW_2026_03_Week1',
      },

      {
        number:
          2,

        fromName:
          'March 8, 2026',

        toName:
          'March 14, 2026',

        from:
          '2026-03-08',

        to:
          '2026-03-14',

        payDate:
          '2026-03-20',

        batchName:
          'PW_2026_03_Week2',
      },

      {
        number:
          3,

        fromName:
          'March 15, 2026',

        toName:
          'March 21, 2026',

        from:
          '2026-03-15',

        to:
          '2026-03-21',

        payDate:
          '2026-03-27',

        batchName:
          'PW_2026_03_Week3',
      },

      {
        number:
          4,

        fromName:
          'March 22, 2026',

        toName:
          'March 28, 2026',

        from:
          '2026-03-22',

        to:
          '2026-03-28',

        payDate:
          '2026-04-03',

        batchName:
          'PW_2026_03_Week4',
      },

      {
        number:
          5,

        fromName:
          'March 29, 2026',

        toName:
          'April 4, 2026',

        from:
          '2026-03-29',

        to:
          '2026-04-04',

        payDate:
          '2026-04-10',

        batchName:
          'PW_2026_03_Week5',
      },
    ];

    const results:
      WeekResult[] = [];

    for (
      const week of weeks
    ) {
      const result =
        await processWeek(
          page,
          loginAs,
          employeeName,
          week
        );

      results.push(
        result
      );
    }

    /*
     * =====================================================
     * SET_040
     * TOTAL FIVE-WEEK CONTRIBUTIONS
     * =====================================================
     */

    const totalSSS =
      results.reduce(
        (
          total,
          result
        ) =>
          total +
          result.sss,
        0
      );

    const totalPhilHealth =
      results.reduce(
        (
          total,
          result
        ) =>
          total +
          result.philHealth,
        0
      );

    const totalPagIbig =
      results.reduce(
        (
          total,
          result
        ) =>
          total +
          result.pagIbig,
        0
      );

    /*
     * Same controlled employee:
     * ₱22,000 monthly salary.
     */

    const expectedMonthly = {
      sss:
        1100,

      philHealth:
        550,

      pagIbig:
        200,
    };

    /*
     * SET_039 expectation:
     *
     * Five pay weeks means the full
     * monthly amount should be divided
     * evenly by 5.
     */

    const expectedEachWeek = {
      sss:
        expectedMonthly.sss /
        5,

      philHealth:
        expectedMonthly.philHealth /
        5,

      pagIbig:
        expectedMonthly.pagIbig /
        5,
    };

    const actualMonthly = {
      sss:
        Number(
          totalSSS.toFixed(
            2
          )
        ),

      philHealth:
        Number(
          totalPhilHealth.toFixed(
            2
          )
        ),

      pagIbig:
        Number(
          totalPagIbig.toFixed(
            2
          )
        ),
    };

    /*
     * =====================================================
     * FINAL INSPECTION OUTPUT
     * =====================================================
     */

    console.log(
      '\n\n============================================'
    );

    console.log(
      'SET_039-040 — FIVE-PAY-WEEK MONTH RESULT'
    );

    console.log(
      '============================================'
    );

    console.log(
      '\nACTUAL WEEKLY RESULTS:'
    );

    console.log(
      JSON.stringify(
        results,
        null,
        2
      )
    );

    console.log(
      '\nEXPECTED EACH WEEK:'
    );

    console.log(
      expectedEachWeek
    );

    console.log(
      '\nACTUAL MONTHLY TOTALS:'
    );

    console.log(
      actualMonthly
    );

    console.log(
      '\nEXPECTED MONTHLY TOTALS:'
    );

    console.log(
      expectedMonthly
    );

    console.log(
      '\nDIFFERENCE:'
    );

    console.log({
      sss:
        Number(
          (
            actualMonthly.sss -
            expectedMonthly.sss
          ).toFixed(
            2
          )
        ),

      philHealth:
        Number(
          (
            actualMonthly
              .philHealth -
            expectedMonthly
              .philHealth
          ).toFixed(
            2
          )
        ),

      pagIbig:
        Number(
          (
            actualMonthly.pagIbig -
            expectedMonthly.pagIbig
          ).toFixed(
            2
          )
        ),
    });

    console.log(
      '\n============================================\n'
    );

    /*
     * IMPORTANT:
     *
     * Still inspection only.
     *
     * Do not add final PASS/FAIL assertions
     * until we see HR PRO's actual five-week
     * calculation.
     */
  }
);