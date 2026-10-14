import {
  test,
  expect,
} from '../../playwright/fixtures/hrpro.fixture';

import { SettingsPage } from '../../playwright/pages/settings.page';

test(
  'TEMP | SET_125-135 | Verify existing payroll run keeps segregation-of-duties workflow',
  async ({
    page,
    loginAs,
  }) => {
    test.setTimeout(
      180_000
    );

    /*
     * =====================================================
     * SET_125-128
     * LOGIN + ENABLE PAYROLL SEGREGATION OF DUTIES
     * =====================================================
     */

    await loginAs(
      'systemAdmin'
    );

    const settings =
      new SettingsPage(page);

    await settings.openGeneral();

    const segregation =
      page.getByRole(
        'checkbox',
        {
          name:
            /Approval and release must be done by different people/i,
        }
      );

    await expect(
      segregation
    ).toBeVisible();

    if (
      !(await segregation.isChecked())
    ) {
      await segregation.check();
    }

    await expect(
      segregation
    ).toBeChecked();

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_125-128 — SEGREGATION OF DUTIES'
    );

    console.log(
      '============================================'
    );

    console.log(
      '\nENABLED:'
    );

    console.log(
      await segregation.isChecked()
    );

    /*
     * =====================================================
     * SET_129
     * CREATE + COMPUTE A PAYROLL RUN
     * =====================================================
     */

    await page.goto(
      '/timesheet',
      {
        waitUntil:
          'domcontentloaded',
      }
    );

    const fetchButton =
      page.getByRole(
        'button',
        {
          name:
            /Fetch\/Upload LILO DTR/i,
        }
      );

    if (
      await fetchButton.count()
    ) {
      await fetchButton.click();

      const sampleButton =
        page.getByRole(
          'button',
          {
            name:
              /Load sample LILO logs/i,
          }
        );

      if (
        await sampleButton.count()
      ) {
        await sampleButton.click();

        await page.waitForTimeout(
          200
        );
      }

      await page.keyboard.press(
        'Escape'
      );
    }

    await page
      .getByLabel(
        'Payroll date',
        {
          exact:
            true,
        }
      )
      .fill(
        '2026-10-05'
      );

    await page
      .getByLabel(
        /^Batch name/
      )
      .fill(
        'SET125_135_SOD'
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
        'Juan Dela Cruz'
      );

    const employeeRow =
      page
        .locator('tr')
        .filter({
          hasText:
            'Juan Dela Cruz',
        });

    await expect(
      employeeRow
    ).toBeVisible();

    await employeeRow
      .locator(
        'input[type="checkbox"]'
      )
      .check();

    await page
      .getByRole(
        'button',
        {
          name:
            'Review attendance →',
          exact:
            true,
        }
      )
      .click();

    await page
      .getByRole(
        'button',
        {
          name:
            'Submit to Review',
          exact:
            true,
        }
      )
      .click();

    const reviewRow =
      page
        .locator('tr')
        .filter({
          hasText:
            'Juan Dela Cruz',
        });

    await expect(
      reviewRow
    ).toBeVisible();

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_129 — PAYROLL RUN CREATED'
    );

    console.log(
      '============================================'
    );

    console.log(
      (
        await reviewRow.innerText()
      )
        .replace(
          /\s+/g,
          ' '
        )
        .trim()
    );

    /*
     * Submit Review -> Smart Pay.
     */

    const submitToSmartPay =
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
      submitToSmartPay
    ).toBeVisible();

    await submitToSmartPay.click();

    const confirmReview =
      page.getByRole(
        'button',
        {
          name:
            'Submit',
          exact:
            true,
        }
      );

    if (
      await confirmReview.count()
    ) {
      await confirmReview.click();
    }

    await page.waitForTimeout(
      200
    );

    if (
      !page.url().includes(
        '/payroll-value'
      )
    ) {
      const goPayroll =
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
        await goPayroll.count()
      ) {
        await goPayroll.click();
      } else {
        await page.goto(
          '/payroll-value',
          {
            waitUntil:
              'domcontentloaded',
          }
        );
      }
    }

    await page.waitForURL(
      /\/payroll-value/,
      {
        timeout:
          15_000,
      }
    );

    const smartPayRow =
      page.getByRole(
        'button',
        {
          name:
            /Juan Dela Cruz/,
        }
      );

    await expect(
      smartPayRow
    ).toBeVisible();

    await smartPayRow.click();

    console.log(
      '\nSMART PAY BEFORE APPROVAL:'
    );

    console.log(
      (
        await page
          .locator('body')
          .innerText()
      )
        .replace(
          /\s+/g,
          ' '
        )
        .trim()
        .slice(
          0,
          10000
        )
    );

    /*
     * =====================================================
     * SET_130
     * SUBMIT PAYROLL RUN FOR APPROVAL
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

    await page.waitForURL(
      /\/payroll-report/,
      {
        timeout:
          15_000,
      }
    );

    const submittedStorage =
      await page.evaluate(
        () => ({
          generated:
            localStorage.getItem(
              'hrpro:generated'
            ),

          runStages:
            localStorage.getItem(
              'hrpro:runStages'
            ),
        })
      );

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_130 — SUBMITTED FOR APPROVAL'
    );

    console.log(
      '============================================'
    );

    console.log(
      JSON.stringify(
        submittedStorage,
        null,
        2
      )
    );

    /*
     * =====================================================
     * SET_131-132
     * PAYROLL MANAGER APPROVES.
     * RUN SHOULD BE APPROVED BUT NOT RELEASED.
     * =====================================================
     */

    await page
      .getByRole(
        'button',
        {
          name:
            'Sign out',
          exact:
            true,
        }
      )
      .click();

    await loginAs(
      'payrollManager'
    );

    await page.goto(
      '/payroll-report',
      {
        waitUntil:
          'domcontentloaded',
      }
    );

    const approveByManager =
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
      approveByManager
    ).toBeVisible();

    await expect(
      approveByManager
    ).toBeEnabled();

    await approveByManager.click();

    const managerConfirm =
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
      managerConfirm
    ).toBeVisible();

    await managerConfirm.click();

    await page.waitForTimeout(
      250
    );

    const afterManager =
      await page.evaluate(
        () => {
          const raw =
            localStorage.getItem(
              'hrpro:generated'
            );

          return raw
            ? JSON.parse(raw)
            : null;
        }
      );

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_131-132 — AFTER PAYROLL MANAGER APPROVAL'
    );

    console.log(
      '============================================'
    );

    console.log(
      JSON.stringify(
        {
          stage:
            afterManager?.stage,

          workflow:
            afterManager?.workflow,

          releasedAt:
            afterManager?.releasedAt,
        },
        null,
        2
      )
    );

    /*
     * =====================================================
     * SET_133-134
     * DIFFERENT ADMIN RELEASES THE APPROVED RUN.
     * =====================================================
     */

    await page
      .getByRole(
        'button',
        {
          name:
            'Sign out',
          exact:
            true,
        }
      )
      .click();

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

    const approveByAdmin =
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
      approveByAdmin
    ).toBeVisible();

    await expect(
      approveByAdmin
    ).toBeEnabled();

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_133 — DIFFERENT ADMIN CAN ACCESS RUN'
    );

    console.log(
      '============================================'
    );

    console.log(
      (
        await page
          .locator('body')
          .innerText()
      )
        .replace(
          /\s+/g,
          ' '
        )
        .trim()
        .slice(
          0,
          8000
        )
    );

    await approveByAdmin.click();

    const adminConfirm =
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
      adminConfirm
    ).toBeVisible();

    await adminConfirm.click();

    await page.waitForTimeout(
      250
    );

    /*
     * =====================================================
     * SET_135
     * VERIFY APPROVER + RELEASER ARE DIFFERENT USERS.
     * =====================================================
     */

    const finalState =
      await page.evaluate(
        () => {
          const generatedRaw =
            localStorage.getItem(
              'hrpro:generated'
            );

          const historyRaw =
            localStorage.getItem(
              'hrpro:payrollHistory'
            );

          const stagesRaw =
            localStorage.getItem(
              'hrpro:runStages'
            );

          return {
            generated:
              generatedRaw
                ? JSON.parse(
                    generatedRaw
                  )
                : null,

            payrollHistory:
              historyRaw
                ? JSON.parse(
                    historyRaw
                  )
                : null,

            runStages:
              stagesRaw
                ? JSON.parse(
                    stagesRaw
                  )
                : null,
          };
        }
      );

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_134-135 — FINAL RELEASE + AUDIT TRAIL'
    );

    console.log(
      '============================================'
    );

    console.log(
      JSON.stringify(
        {
          stage:
            finalState
              .generated
              ?.stage,

          workflow:
            finalState
              .generated
              ?.workflow,

          releasedAt:
            finalState
              .generated
              ?.releasedAt,

          runStages:
            finalState
              .runStages,

          payrollHistory:
            finalState
              .payrollHistory,
        },
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
     * Excel expected result:
     * - Payroll Manager approves the run.
     * - Run is not released after that first approval.
     * - A different Admin performs final release.
     * - Approval/release history shows different users.
     */
  }
);
