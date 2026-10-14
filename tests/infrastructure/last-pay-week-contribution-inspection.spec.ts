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

function moneyFromText(
  text: string,
  label: string,
  allowMissingAsZero = false
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
    if (
      allowMissingAsZero
    ) {
      return 0;
    }

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

async function approveAndRelease(
  page: Page,
  loginAs: LoginAs,
  week: WeekInput
) {
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
   * First approval:
   * System Admin.
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

  await page
    .getByRole(
      'button',
      {
        name:
          'Approve payroll',
        exact:
          true,
      }
    )
    .click();

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
   * Final approval:
   * separate Admin account.
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

  await page
    .getByRole(
      'button',
      {
        name:
          'Approve payroll',
        exact:
          true,
      }
    )
    .click();

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
   * for the next week.
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

async function processWeek(
  page: Page,
  loginAs: LoginAs,
  employeeName: string,
  week: WeekInput
): Promise<WeekResult> {
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

  /*
   * Week 5 is expected to carry no statutory
   * contribution. If HR PRO hides zero-value
   * contribution lines completely, treat that
   * as zero rather than an automation failure.
   */
  const allowMissingAsZero =
    [1, 2, 3, 4].includes(
      week.number
    );

  const sss =
    moneyFromText(
      bodyText,
      'SSS (EE share)',
      allowMissingAsZero
    );

  const philHealth =
    moneyFromText(
      bodyText,
      'PhilHealth (EE share)',
      allowMissingAsZero
    );

  const pagIbig =
    moneyFromText(
      bodyText,
      'Pag-IBIG (EE share)',
      allowMissingAsZero
    );

  console.log(
    `\n========== WEEK ${week.number} CONTRIBUTIONS ==========`
  );

  console.log({
    sss,
    philHealth,
    pagIbig,
  });

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

test(
  'TEMP | SET_070-080 | Inspect Last Pay Week contribution distribution',
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
     * SET_070-073
     * LAST PAY WEEK OF THE MONTH ONLY
     * =====================================================
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
    ).toBe(
      'DESIGNATED'
    );

    console.log(
      '\n========== CONTRIBUTION POLICY =========='
    );

    console.log(
      policy
    );

    /*
     * =====================================================
     * SET_074
     * CONTROLLED WEEKLY EMPLOYEE
     * =====================================================
     */

    await settings.employeeIdMode
      .selectOption('auto');

    await employees.open();

    await employees.openEnrollment();

    const employeeName =
      'PW Last Pay Week Employee';

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
     * SET_075-079
     * PROCESS WEEKS 1–5
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
          'PWLP_2026_03_Week1',
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
          'PWLP_2026_03_Week2',
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
          'PWLP_2026_03_Week3',
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
          'PWLP_2026_03_Week4',
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
          'PWLP_2026_03_Week5',
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
     * SET_080
     * VERIFY MONTHLY TOTAL
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

    const expectedMonthly = {
      sss:
        1100,
      philHealth:
        550,
      pagIbig:
        200,
    };

    const expectedEarlyWeeks = {
      sss:
        0,
      philHealth:
        0,
      pagIbig:
        0,
    };

    const expectedLastWeek = {
      sss:
        1100,
      philHealth:
        550,
      pagIbig:
        200,
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

    console.log(
      '\n\n============================================'
    );

    console.log(
      'SET_070-080 — LAST PAY WEEK RESULT'
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
      '\nEXPECTED WEEKS 1–4:'
    );

    console.log(
      expectedEarlyWeeks
    );

    console.log(
      '\nEXPECTED LAST WEEK (WEEK 5):'
    );

    console.log(
      expectedLastWeek
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
      '\nMONTHLY DIFFERENCE:'
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
     * Inspection only.
     *
     * We intentionally do not make the final
     * Excel PASS/FAIL assertion until we see
     * the actual HR PRO values for all 5 weeks.
     *
     * Expected behavior for this 5-pay-week month:
     * Weeks 1–4 = zero statutory contribution.
     * Week 5 = the full applicable monthly amount.
     *
     * Note: the Excel wording around SET_077–078
     * is inconsistent, but SET_079 explicitly says
     * that in a five-week month the full monthly
     * contribution is deducted in Week 5.
     *
     * SET_081 (withholding tax) and SET_082
     * (Semi-Monthly / Monthly unaffected)
     * will be checked after this contribution
     * distribution run.
     */
  }
);
