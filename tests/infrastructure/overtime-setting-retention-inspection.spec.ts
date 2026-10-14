import {
  test,
  expect,
} from '../../playwright/fixtures/hrpro.fixture';

import { SettingsPage } from '../../playwright/pages/settings.page';

test(
  'TEMP | SET_109-116 | Verify existing OT decisions survive approval-workflow change',
  async ({
    page,
    loginAs,
  }) => {
    test.setTimeout(
      150_000
    );

    await loginAs(
      'systemAdmin'
    );

    const settings =
      new SettingsPage(page);

    /*
     * =====================================================
     * SET_109
     * ENABLE "OVERTIME IS APPROVED IN LILO"
     * =====================================================
     */

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

    /*
     * =====================================================
     * CREATE CONTROLLED OT PUNCHES
     *
     * Sep 16 = 2.00 hrs OT
     * Sep 17 = 1.00 hr OT
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

    await expect(
      fetchButton
    ).toBeVisible();

    await fetchButton.click();

    const sampleButton =
      page.getByRole(
        'button',
        {
          name:
            /Load sample LILO logs/i,
        }
      );

    await expect(
      sampleButton
    ).toBeVisible();

    await sampleButton.click();

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
        'SET109_116_OT_Retention'
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

    await reviewRow.click();

    /*
     * =====================================================
     * SET_110
     * REPRESENT OT THAT WAS ALREADY APPROVED IN LILO
     *
     * In LILO-preapproved mode the Review table exposes
     * .ot-approve-input beside detected overtime.
     * Entering the approved hours is the prototype's UI
     * for accepting the hours already authorized in LILO.
     * =====================================================
     */

    const sep16Row =
      page.getByRole(
        'row',
        {
          name:
            /^Sep 16/,
        }
      );

    const sep17Row =
      page.getByRole(
        'row',
        {
          name:
            /^Sep 17/,
        }
      );

    await expect(
      sep16Row
    ).toBeVisible();

    await expect(
      sep17Row
    ).toBeVisible();

    const sep16ApprovedHours =
      sep16Row.locator(
        'input.ot-approve-input'
      );

    const sep17ApprovedHours =
      sep17Row.locator(
        'input.ot-approve-input'
      );

    await expect(
      sep16ApprovedHours
    ).toBeVisible();

    await expect(
      sep17ApprovedHours
    ).toBeVisible();

    await sep16ApprovedHours.fill(
      '2.00'
    );

    /*
     * Filling the approved-hours input causes the row to
     * re-render, so do NOT press Tab through the old locator.
     * Use the page keyboard instead; this safely blurs the
     * currently focused control even after React replaces it.
     */
    await page.keyboard.press(
      'Tab'
    );

    await page.waitForTimeout(
      150
    );

    const sep17ApprovedHoursFresh =
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
      sep17ApprovedHoursFresh
    ).toBeVisible();

    await sep17ApprovedHoursFresh.fill(
      '1.00'
    );

    await page.keyboard.press(
      'Tab'
    );

    await page.waitForTimeout(
      250
    );

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_110 — LILO-APPROVED OT ACCEPTED'
    );

    console.log(
      '============================================'
    );

    console.log(
      '\nSEP 16 ROW:'
    );

    console.log(
      (
        await sep16Row.innerText()
      )
        .replace(
          /\s+/g,
          ' '
        )
        .trim()
    );

    console.log(
      '\nSEP 17 ROW:'
    );

    console.log(
      (
        await sep17Row.innerText()
      )
        .replace(
          /\s+/g,
          ' '
        )
        .trim()
    );

    console.log(
      '\nOT APPROVAL STORAGE:'
    );

    console.log(
      await page.evaluate(
        () =>
          localStorage.getItem(
            'hrpro:otApprovals'
          )
      )
    );

    /*
     * =====================================================
     * SET_111
     * REJECT THE SECOND PREVIOUSLY-AUTHORIZED OT RECORD
     * =====================================================
     */

    await page
      .getByRole(
        'button',
        {
          name:
            'Approvals',
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
            'Overtime',
          exact:
            true,
        }
      )
      .click();

    const approvedSep17Row =
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
            'Sep 17',
        });

    await expect(
      approvedSep17Row
    ).toBeVisible();

    console.log(
      '\nAPPROVAL ROW BEFORE REJECT:'
    );

    console.log(
      (
        await approvedSep17Row.innerText()
      )
        .replace(
          /\s+/g,
          ' '
        )
        .trim()
    );

    const reject =
      approvedSep17Row.getByRole(
        'button',
        {
          name:
            'Reject',
          exact:
            true,
        }
      );

    await expect(
      reject
    ).toBeVisible();

    await reject.click();

    await page.waitForTimeout(
      250
    );

    const beforeSettingChange =
      await page.evaluate(
        () => ({
          approvalPolicy:
            localStorage.getItem(
              'hrpro:approvalPolicy'
            ),

          otApprovals:
            localStorage.getItem(
              'hrpro:otApprovals'
            ),
        })
      );

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_111 — AFTER REJECTING SEP 17'
    );

    console.log(
      '============================================'
    );

    console.log(
      JSON.stringify(
        beforeSettingChange,
        null,
        2
      )
    );

    /*
     * =====================================================
     * SET_112
     * CHANGE SETTING TO "APPROVED IN HR PRO"
     * =====================================================
     */

    await settings.openGeneral();

    const settingAfterNav =
      page.getByRole(
        'checkbox',
        {
          name:
            /Overtime is approved in LILO before it reaches HR PRO/i,
        }
      );

    await expect(
      settingAfterNav
    ).toBeChecked();

    await settingAfterNav.uncheck();

    await expect(
      settingAfterNav
    ).not.toBeChecked();

    const afterSettingChange =
      await page.evaluate(
        () => ({
          approvalPolicy:
            localStorage.getItem(
              'hrpro:approvalPolicy'
            ),

          otApprovals:
            localStorage.getItem(
              'hrpro:otApprovals'
            ),
        })
      );

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_112-114 — STORED DECISIONS AFTER SETTING CHANGE'
    );

    console.log(
      '============================================'
    );

    console.log(
      JSON.stringify(
        afterSettingChange,
        null,
        2
      )
    );

    /*
     * =====================================================
     * SET_116
     * ADD NEW OT AFTER THE SETTING CHANGE.
     * It should now require HR PRO approval.
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

      // New OT after switching to HR PRO approval:
      // 8:00 AM -> 6:30 PM = 1.50 hrs detected OT.
      logs['E-0001']['2026-09-18'] = {
        inMin: 480,
        outMin: 1110,
      };

      localStorage.setItem(
        'hrpro:dtrLogs',
        JSON.stringify(logs)
      );
    });

    await page.goto(
      '/time-attendance',
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
            'Approvals',
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
      '\nNEW SEP 18 OT ROW:'
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
     * SET_113-115
     * PROCESS PAYROLL AFTER SETTING CHANGE.
     *
     * Sep 16 should remain approved/paid.
     * Sep 17 should remain rejected/unpaid.
     * Sep 18 is new/pending and should also remain unpaid.
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

    const reviewRowAfterChange =
      page
        .locator('tr')
        .filter({
          hasText:
            'Juan Dela Cruz',
        });

    await expect(
      reviewRowAfterChange
    ).toBeVisible();

    console.log(
      '\nREVIEW ROW AFTER SETTING CHANGE:'
    );

    console.log(
      (
        await reviewRowAfterChange.innerText()
      )
        .replace(
          /\s+/g,
          ' '
        )
        .trim()
    );

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
      'SET_113-115 — PAYROLL AFTER SETTING CHANGE'
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
      '\nFINAL OT APPROVAL STORAGE:'
    );

    console.log(
      await page.evaluate(
        () =>
          localStorage.getItem(
            'hrpro:otApprovals'
          )
      )
    );

    console.log(
      '\n============================================\n'
    );

    /*
     * Inspection only.
     *
     * Expected Excel behavior:
     * - Sep 16: previously approved remains approved/payable.
     * - Sep 17: previously rejected remains rejected/unpaid.
     * - New Sep 18 OT after the setting change requires
     *   approval inside HR PRO.
     */
  }
);
