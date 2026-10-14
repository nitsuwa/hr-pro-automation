import {
  test,
  expect,
} from '../../playwright/fixtures/hrpro.fixture';

import { SettingsPage } from '../../playwright/pages/settings.page';

test(
  'TEMP | SET_087 | Verify leave edit routes to approval instead of direct DTR edit',
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

    /*
     * =====================================================
     * ENABLE ALL SET_087 FILING / APPROVAL SETTINGS
     * =====================================================
     */

    await settings.openGeneral();

    const overtime =
      page.getByRole(
        'checkbox',
        {
          name:
            /Overtime — Outlier OT/i,
        }
      );

    const timekeepingAdjustments =
      page.getByRole(
        'checkbox',
        {
          name:
            /Timekeeping Adjustments — A missing-punch fix/i,
        }
      );

    const leave =
      page.getByRole(
        'checkbox',
        {
          name:
            /Leave — Reclassifying an absence as leave/i,
        }
      );

    if (
      !(await overtime.isChecked())
    ) {
      await overtime.check();
    }

    if (
      !(
        await timekeepingAdjustments
          .isChecked()
      )
    ) {
      await timekeepingAdjustments.check();
    }

    if (
      !(await leave.isChecked())
    ) {
      await leave.check();
    }

    await expect(
      leave
    ).toBeChecked();

    /*
     * =====================================================
     * CREATE A SIMPLE REVIEW BATCH
     * =====================================================
     */

    await page.goto(
      '/timesheet',
      {
        waitUntil:
          'domcontentloaded',
      }
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
        '2026-09-20'
      );

    await page
      .getByLabel(
        /^Batch name/
      )
      .fill(
        'SET087_Direct_Edit_Check'
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
     * OPEN JUAN'S DTR DETAILS
     * =====================================================
     */

    const reviewRow =
      page
        .locator('tr')
        .filter({
          hasText:
            'Juan Dela Cruz',
        });

    await expect(
      reviewRow
    ).toBeVisible({
      timeout:
        15_000,
    });

    await reviewRow.click();

    /*
     * =====================================================
     * FIND THE SEP 16 LEAVE / STATUS SELECT
     * =====================================================
     */

    const dateRow =
      page.getByRole(
        'row',
        {
          name:
            /^Sep 16 Wed/,
        }
      );

    await expect(
      dateRow
    ).toBeVisible();

    const statusSelect =
      dateRow.getByRole(
        'combobox'
      );

    await expect(
      statusSelect
    ).toBeVisible();

    const options =
      await statusSelect
        .locator('option')
        .allTextContents();

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_087 — DIRECT EDIT CHECK'
    );

    console.log(
      '============================================'
    );

    console.log(
      '\nSEP 16 STATUS OPTIONS:'
    );

    console.log(
      options
    );

    const beforeStorage =
      await page.evaluate(
        () => ({
          leaveRequests:
            localStorage.getItem(
              'hrpro:leaveRequests'
            ),

          leaveOverrides:
            localStorage.getItem(
              'hrpro:leaveOverrides'
            ),

          leaveTaken:
            localStorage.getItem(
              'hrpro:leaveTaken'
            ),
        })
      );

    console.log(
      '\nBEFORE SELECTING LEAVE:'
    );

    console.log(
      JSON.stringify(
        beforeStorage,
        null,
        2
      )
    );

    /*
     * Choose SIL leave from the visible DTR row.
     *
     * We are checking whether HR PRO:
     *
     * A) creates a filing / pending approval, or
     * B) directly changes the DTR immediately.
     */

    const silOption =
      options.find(
        option =>
          /SIL leave/i.test(
            option
          )
      );

    if (!silOption) {
      throw new Error(
        'Could not find SIL leave option on Sep 16 row.'
      );
    }

    await statusSelect.selectOption({
      label:
        silOption,
    });

    const filedDialog =
      page.getByRole(
        'alertdialog',
        {
          name:
            'Filed for approval',
        }
      );

    await expect(
      filedDialog
    ).toBeVisible();

    await filedDialog
      .getByRole(
        'button',
        {
          name:
            'OK',
          exact:
            true,
        }
      )
      .click();

    await expect(
      filedDialog
    ).toBeHidden();

    const afterStorage =
      await page.evaluate(
        () => ({
          leaveRequests:
            localStorage.getItem(
              'hrpro:leaveRequests'
            ),

          leaveOverrides:
            localStorage.getItem(
              'hrpro:leaveOverrides'
            ),

          leaveTaken:
            localStorage.getItem(
              'hrpro:leaveTaken'
            ),
        })
      );

    console.log(
      '\nAFTER SELECTING SIL LEAVE:'
    );

    console.log(
      JSON.stringify(
        afterStorage,
        null,
        2
      )
    );

    console.log(
      '\nSEP 16 ROW AFTER ACTION:'
    );

    console.log(
      (
        await dateRow.innerText()
      )
        .replace(
          /\s+/g,
          ' '
        )
        .trim()
    );

    /*
     * =====================================================
     * CHECK APPROVALS > LEAVE
     * =====================================================
     */

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

    const leaveTab =
      page.getByRole(
        'button',
        {
          name:
            'Leave',
          exact:
            true,
        }
      );

    await expect(
      leaveTab
    ).toBeVisible();

    await leaveTab.click();

    await page.waitForTimeout(
      300
    );

    const approvalsText =
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
      '\nAPPROVALS > LEAVE AFTER ACTION:'
    );

    console.log(
      approvalsText.slice(
        0,
        10000
      )
    );

    console.log(
      '\n============================================\n'
    );

    /*
     * Inspection only.
     *
     * PASS direction:
     * Selecting leave creates a filing / pending
     * approval and does NOT immediately apply it
     * to the DTR.
     *
     * FAIL direction:
     * Selecting leave immediately changes the DTR
     * without a leave filing / approval request.
     */
  }
);
