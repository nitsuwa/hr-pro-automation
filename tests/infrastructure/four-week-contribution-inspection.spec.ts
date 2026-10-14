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

  /*
   * Test normally opens around September 2026.
   * February 2026 is earlier.
   *
   * Move backward until the requested
   * date is visible.
   */
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

  /*
   * Important:
   *
   * If the previous payroll is still
   * active, HR PRO disables the next
   * available dates.
   *
   * This gives us a clear failure instead
   * of waiting for Playwright to click
   * a disabled button for several minutes.
   */
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

  /*
   * Confirm HR PRO really committed
   * the selected cutoff.
   */
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
 * FIRST + FINAL APPROVAL
 * =====================================================
 */

async function approveAndRelease(
  page: Page,
  loginAs: LoginAs,
  week: WeekInput
) {
  /*
   * =====================================================
   * SMART PAY → PAYROLL REGISTER
   * =====================================================
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
   * FIRST APPROVAL
   * SYSTEM ADMIN
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

  /*
   * Confirm step 1 was recorded.
   */
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
    `\nWEEK ${week.number} FIRST APPROVAL: COMPLETE`
  );

  /*
   * =====================================================
   * SWITCH TO ADMIN
   * =====================================================
   *
   * Current HR PRO role-based flow:
   *
   * Step 1:
   * Payroll Manager / System Admin
   *
   * Step 2:
   * Admin / System Admin
   *
   * The same person cannot perform
   * both steps.
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

  /*
   * Return to the payroll register
   * as the separate final approver.
   */
  await page.goto(
    '/payroll-report',
    {
      waitUntil:
        'domcontentloaded',
    }
  );

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
   * CONFIRM PAYROLL IS RELEASED
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
   * =====================================================
   * RETURN TO SYSTEM ADMIN FOR NEXT WEEK
   * =====================================================
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
 * PROCESS ONE PAY WEEK
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
   * STAGE 1 — TIMESHEET
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

  /*
   * Select only the controlled employee.
   */
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

  /*
   * Current prototype normally moves
   * directly to Smart Pay.
   *
   * Older prototype behavior left the
   * user in Review with a button.
   *
   * Support both.
   */
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
   * =====================================================
   * FINISH THIS WEEK COMPLETELY
   * =====================================================
   *
   * This was missing from the old test.
   *
   * A week must be Released before HR PRO
   * allows us to start the next payroll.
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
  'TEMP | SET_037-038 | Inspect Every Pay Week across a true four-pay-week month',
  async ({
    page,
    loginAs,
  }) => {
    test.setTimeout(
      240_000
    );

    /*
     * =====================================================
     * LOGIN
     * =====================================================
     */

    await loginAs(
      'systemAdmin'
    );

    const settings =
      new SettingsPage(page);

    const employees =
      new EmployeesPage(page);

    /*
     * =====================================================
     * SET_032-035
     * EVERY PAY WEEK
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
     * SET_036
     * CREATE WEEKLY EMPLOYEE
     * =====================================================
     *
     * February 2026 is deliberately used.
     *
     * It contains exactly four full weekly
     * periods:
     *
     * Week 1: Feb 1–7
     * Week 2: Feb 8–14
     * Week 3: Feb 15–21
     * Week 4: Feb 22–28
     */

    await settings.employeeIdMode
      .selectOption('auto');

    await employees.open();

    await employees.openEnrollment();

    const employeeName =
      'PW Four Week Employee';

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

    /*
     * We are testing contribution
     * distribution here, not attendance
     * deductions.
     */
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
     * SET_037
     * PROCESS A 4-PAY-WEEK MONTH
     * =====================================================
     */

    const weeks:
      WeekInput[] = [
      {
        number:
          1,

        fromName:
          'February 1, 2026',

        toName:
          'February 7, 2026',

        from:
          '2026-02-01',

        to:
          '2026-02-07',

        payDate:
          '2026-02-13',

        batchName:
          'PW_2026_02_Week1',
      },

      {
        number:
          2,

        fromName:
          'February 8, 2026',

        toName:
          'February 14, 2026',

        from:
          '2026-02-08',

        to:
          '2026-02-14',

        payDate:
          '2026-02-20',

        batchName:
          'PW_2026_02_Week2',
      },

      {
        number:
          3,

        fromName:
          'February 15, 2026',

        toName:
          'February 21, 2026',

        from:
          '2026-02-15',

        to:
          '2026-02-21',

        payDate:
          '2026-02-27',

        batchName:
          'PW_2026_02_Week3',
      },

      {
        number:
          4,

        fromName:
          'February 22, 2026',

        toName:
          'February 28, 2026',

        from:
          '2026-02-22',

        to:
          '2026-02-28',

        payDate:
          '2026-03-06',

        batchName:
          'PW_2026_02_Week4',
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
     * SET_038
     * MONTHLY TOTALS
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
     * Current prototype contribution tables
     * for a ₱22,000 monthly salary.
     *
     * SSS:
     * ₱22,000 × 5%
     * = ₱1,100
     *
     * PhilHealth:
     * ₱22,000 × 5% ÷ 2 employee share
     * = ₱550
     *
     * Pag-IBIG:
     * contribution base capped at ₱10,000
     * × 2%
     * = ₱200
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
     * Excel expectation:
     *
     * In a 4-pay-week month,
     * monthly contributions should be
     * divided evenly across the 4 weeks.
     */

    const expectedEachWeek = {
      sss:
        expectedMonthly.sss /
        4,

      philHealth:
        expectedMonthly.philHealth /
        4,

      pagIbig:
        expectedMonthly.pagIbig /
        4,
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
     * RESULTS
     * =====================================================
     */

    console.log(
      '\n\n============================================'
    );

    console.log(
      'SET_037-038 — FOUR-PAY-WEEK MONTH RESULT'
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
     * =====================================================
     * IMPORTANT
     * =====================================================
     *
     * DO NOT add the final Excel assertions yet.
     *
     * This is still the inspection run.
     *
     * We first need to see the actual Week 1,
     * Week 2, Week 3 and Week 4 values produced
     * by HR PRO.
     *
     * After this output is confirmed, we will
     * determine whether:
     *
     * 1. HR PRO satisfies SET_037-038, or
     * 2. HR PRO has a reproducible QA issue.
     */
  }
);