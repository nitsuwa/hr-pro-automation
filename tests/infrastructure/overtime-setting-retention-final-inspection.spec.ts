import {
  test,
  expect,
} from '../../playwright/fixtures/hrpro.fixture';

import { SettingsPage } from '../../playwright/pages/settings.page';

test(
  'TEMP | SET_112-116 | Verify OT decisions persist after switching approval workflow',
  async ({
    page,
    loginAs,
  }) => {
    test.setTimeout(
      180_000
    );

    /*
     * =====================================================
     * PRECONDITION
     * Create:
     * - Sep 16 = LILO-approved OT, keep payable
     * - Sep 17 = LILO-approved OT, then reject from payroll
     * =====================================================
     */

    await loginAs(
      'systemAdmin'
    );

    const settings =
      new SettingsPage(page);

    await settings.openGeneral();

    const liloApproved =
      page.getByRole(
        'checkbox',
        {
          name:
            /Overtime is approved in LILO before it reaches HR PRO/i,
        }
      );

    await expect(
      liloApproved
    ).toBeVisible();

    if (
      !(await liloApproved.isChecked())
    ) {
      await liloApproved.check();
    }

    await expect(
      liloApproved
    ).toBeChecked();

    await page.goto(
      '/timesheet',
      {
        waitUntil:
          'domcontentloaded',
      }
    );

    await page
      .getByRole(
        'button',
        {
          name:
            /Fetch\/Upload LILO DTR/i,
        }
      )
      .click();

    await page
      .getByRole(
        'button',
        {
          name:
            /Load sample LILO logs/i,
        }
      )
      .click();

    await page.waitForTimeout(
      250
    );

    await page.evaluate(() => {
      const logs =
        JSON.parse(
          localStorage.getItem(
            'hrpro:dtrLogs'
          ) ?? '{}'
        );

      if (!logs['E-0001']) {
        logs['E-0001'] = {};
      }

      logs['E-0001']['2026-09-16'] = {
        inMin: 480,
        outMin: 1140,
      };

      logs['E-0001']['2026-09-17'] = {
        inMin: 480,
        outMin: 1080,
      };

      localStorage.setItem(
        'hrpro:dtrLogs',
        JSON.stringify(logs)
      );

      localStorage.setItem(
        'hrpro:otApprovals',
        '{}'
      );

      localStorage.setItem(
        'hrpro:otDecisions',
        '{}'
      );
    });

    await page.keyboard.press(
      'Escape'
    );

    await page.reload({
      waitUntil:
        'domcontentloaded',
    });

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
        'SET112_116_OT_Retention'
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

    const reviewEmployeeRow =
      page
        .locator('tr')
        .filter({
          hasText:
            'Juan Dela Cruz',
        });

    await expect(
      reviewEmployeeRow
    ).toBeVisible();

    await reviewEmployeeRow.click();

    /*
     * Accept Sep 16 and Sep 17 as already approved in LILO.
     */

    const sep16Input =
      page
        .getByRole(
          'row',
          {
            name:
              /^Sep 16/,
          }
        )
        .locator(
          'input.ot-approve-input'
        );

    await expect(
      sep16Input
    ).toBeVisible();

    await sep16Input.fill(
      '2.00'
    );

    await page.keyboard.press(
      'Tab'
    );

    await page.waitForTimeout(
      150
    );

    const sep17Input =
      page
        .getByRole(
          'row',
          {
            name:
              /^Sep 17/,
          }
        )
        .locator(
          'input.ot-approve-input'
        );

    await expect(
      sep17Input
    ).toBeVisible();

    await sep17Input.fill(
      '1.00'
    );

    await page.keyboard.press(
      'Tab'
    );

    await page.waitForTimeout(
      250
    );

    /*
     * Reject Sep 17 as an authorized HR Officer.
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
      'hrOfficer'
    );

    await page.goto(
      '/time-attendance',
      {
        waitUntil:
          'domcontentloaded',
      }
    );

    const hrReviewRow =
      page
        .locator('tr')
        .filter({
          hasText:
            'Juan Dela Cruz',
        });

    await expect(
      hrReviewRow
    ).toBeVisible();

    await hrReviewRow.click();

    const hrSep17 =
      page.getByRole(
        'row',
        {
          name:
            /^Sep 17/,
        }
      );

    await expect(
      hrSep17
    ).toBeVisible();

    const disapprove =
      hrSep17.locator(
        'button[title*="disapprove this day"]'
      );

    await expect(
      disapprove
    ).toBeVisible();

    await disapprove.click();

    await page.waitForTimeout(
      250
    );

    const preChangeStorage =
      await page.evaluate(
        () => ({
          otDecisions:
            localStorage.getItem(
              'hrpro:otDecisions'
            ),

          approvalPolicy:
            localStorage.getItem(
              'hrpro:approvalPolicy'
            ),
        })
      );

    console.log(
      '\n============================================'
    );

    console.log(
      'PRECONDITION — EXISTING OT DECISIONS'
    );

    console.log(
      '============================================'
    );

    console.log(
      JSON.stringify(
        preChangeStorage,
        null,
        2
      )
    );

    /*
     * =====================================================
     * SET_112
     * Switch from LILO approval to HR PRO approval.
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
      'systemAdmin'
    );

    await settings.openGeneral();

    const liloApprovedAfterLogin =
      page.getByRole(
        'checkbox',
        {
          name:
            /Overtime is approved in LILO before it reaches HR PRO/i,
        }
      );

    await expect(
      liloApprovedAfterLogin
    ).toBeChecked();

    await liloApprovedAfterLogin.uncheck();

    await expect(
      liloApprovedAfterLogin
    ).not.toBeChecked();

    const afterChangeStorage =
      await page.evaluate(
        () => ({
          otDecisions:
            localStorage.getItem(
              'hrpro:otDecisions'
            ),

          approvalPolicy:
            localStorage.getItem(
              'hrpro:approvalPolicy'
            ),
        })
      );

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_112 — AFTER SWITCHING TO HR PRO APPROVAL'
    );

    console.log(
      '============================================'
    );

    console.log(
      JSON.stringify(
        afterChangeStorage,
        null,
        2
      )
    );

    /*
     * =====================================================
     * SET_113-114
     * Previously approved/rejected OT must keep its decision.
     * =====================================================
     */

    await page.goto(
      '/time-attendance',
      {
        waitUntil:
          'domcontentloaded',
      }
    );

    const rowAfterChange =
      page
        .locator('tr')
        .filter({
          hasText:
            'Juan Dela Cruz',
        });

    await expect(
      rowAfterChange
    ).toBeVisible();

    await rowAfterChange.click();

    const sep16After =
      page.getByRole(
        'row',
        {
          name:
            /^Sep 16/,
        }
      );

    const sep17After =
      page.getByRole(
        'row',
        {
          name:
            /^Sep 17/,
        }
      );

    await expect(
      sep16After
    ).toBeVisible();

    await expect(
      sep17After
    ).toBeVisible();

    const sep16Text =
      (
        await sep16After.innerText()
      )
        .replace(
          /\s+/g,
          ' '
        )
        .trim();

    const sep17Text =
      (
        await sep17After.innerText()
      )
        .replace(
          /\s+/g,
          ' '
        )
        .trim();

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_113-114 — OLD DECISIONS AFTER SETTING CHANGE'
    );

    console.log(
      '============================================'
    );

    console.log(
      '\nSEP 16 PREVIOUSLY APPROVED:'
    );

    console.log(
      sep16Text
    );

    console.log(
      '\nSEP 17 PREVIOUSLY REJECTED:'
    );

    console.log(
      sep17Text
    );

    console.log(
      '\nOT DECISIONS:'
    );

    console.log(
      await page.evaluate(
        () =>
          localStorage.getItem(
            'hrpro:otDecisions'
          )
      )
    );

    /*
     * =====================================================
     * SET_116
     * Add NEW overtime after the workflow change.
     * It must require approval inside HR PRO.
     * =====================================================
     */

    await page.evaluate(() => {
      const logs =
        JSON.parse(
          localStorage.getItem(
            'hrpro:dtrLogs'
          ) ?? '{}'
        );

      if (!logs['E-0001']) {
        logs['E-0001'] = {};
      }

      logs['E-0001']['2026-09-18'] = {
        inMin: 480,
        outMin: 1110,
      };

      localStorage.setItem(
        'hrpro:dtrLogs',
        JSON.stringify(logs)
      );
    });

    await page.reload({
      waitUntil:
        'domcontentloaded',
    });

    const approvalsButton =
      page.getByRole(
        'button',
        {
          name:
            'Approvals',
          exact:
            true,
        }
      );

    await expect(
      approvalsButton
    ).toBeVisible();

    await approvalsButton.click();

    await page
      .getByRole(
        'button',
        {
          name:
            'Overtime',
          exact:
            true,
        }
      )
      .click();

    const newSep18Row =
      page
        .getByRole(
          'row'
        )
        .filter({
          hasText:
            'Juan Dela Cruz',
        })
        .filter({
          hasText:
            'Sep 18',
        });

    await expect(
      newSep18Row
    ).toBeVisible();

    const newApprove =
      newSep18Row.getByRole(
        'button',
        {
          name:
            'Approve',
          exact:
            true,
        }
      );

    await expect(
      newApprove
    ).toBeVisible();

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_116 — NEW OT AFTER WORKFLOW CHANGE'
    );

    console.log(
      '============================================'
    );

    console.log(
      (
        await newSep18Row.innerText()
      )
        .replace(
          /\s+/g,
          ' '
        )
        .trim()
    );

    /*
     * =====================================================
     * SET_115
     * Process payroll.
     *
     * Expected:
     * - Sep 16 approved OT remains payable.
     * - Sep 17 rejected OT remains unpaid.
     * - Sep 18 newly received/pending OT remains unpaid.
     * =====================================================
     */

    await page
      .getByRole(
        'button',
        {
          name:
            'Time & Attendance',
          exact:
            true,
        }
      )
      .click();

    const submit =
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
      submit
    ).toBeVisible();

    await submit.click();

    const confirm =
      page.getByRole(
        'button',
        {
          name:
            'Submit',
          exact:
            true,
        }
      );

    await expect(
      confirm
    ).toBeVisible();

    await confirm.click();

    await page.waitForTimeout(
      250
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

    const payrollRow =
      page.getByRole(
        'button',
        {
          name:
            /Juan Dela Cruz/,
        }
      );

    await expect(
      payrollRow
    ).toBeVisible();

    await payrollRow.click();

    const payrollText =
      (
        await page
          .locator('body')
          .innerText()
      )
        .replace(
          /\s+/g,
          ' '
        )
        .trim();

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_115 — PAYROLL AFTER SETTING CHANGE'
    );

    console.log(
      '============================================'
    );

    console.log(
      payrollText.slice(
        0,
        12000
      )
    );

    console.log(
      '\n============================================\n'
    );

    /*
     * Inspection only.
     *
     * We will classify PASS/FAIL from the printed business
     * results instead of forcing brittle text assertions.
     */
  }
);
