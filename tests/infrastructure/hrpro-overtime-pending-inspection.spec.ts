import {
  test,
  expect,
} from '../../playwright/fixtures/hrpro.fixture';

import { SettingsPage } from '../../playwright/pages/settings.page';

test(
  'TEMP | SET_097-105 | Inspect overtime approval inside HR PRO',
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
     * SET_097-100
     * OVERTIME APPROVED IN HR PRO
     * =====================================================
     */

    await settings.openGeneral();

    const liloApprovedCheckbox =
      page.getByRole(
        'checkbox',
        {
          name:
            /Overtime is approved in LILO before it reaches HR PRO/i,
        }
      );

    await expect(
      liloApprovedCheckbox
    ).toBeVisible();

    if (
      await liloApprovedCheckbox
        .isChecked()
    ) {
      await liloApprovedCheckbox
        .uncheck();
    }

    await expect(
      liloApprovedCheckbox
    ).not.toBeChecked();

    const policy =
      await page.evaluate(
        () =>
          JSON.parse(
            localStorage.getItem(
              'hrpro:approvalPolicy'
            ) ?? '{}'
          )
      );

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_097-100 — HR PRO OVERTIME SETTING'
    );

    console.log(
      '============================================'
    );

    console.log(
      '\nOVERTIME APPROVED IN LILO:'
    );

    console.log(
      await liloApprovedCheckbox
        .isChecked()
    );

    console.log(
      '\nAPPROVAL POLICY:'
    );

    console.log(
      policy
    );

    /*
     * =====================================================
     * SET_101-102
     * CREATE OVERTIME FROM ATTENDANCE DATA
     * =====================================================
     *
     * We use HR PRO's built-in sample LILO data, then
     * alter one punch in localStorage so Juan Dela Cruz
     * clocks out at 7:00 PM instead of around 5:00 PM.
     *
     * This is test-fixture data only; app logic is not
     * bypassed. HR PRO still has to calculate and route
     * the overtime itself.
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
      300
    );

    await page.evaluate(() => {
      const raw =
        localStorage.getItem(
          'hrpro:dtrLogs'
        );

      const logs =
        raw
          ? JSON.parse(raw)
          : {};

      if (
        !logs['E-0001']
      ) {
        logs['E-0001'] =
          {};
      }

      logs['E-0001'][
        '2026-09-16'
      ] = {
        inMin:
          480,
        outMin:
          1140,
      };

      localStorage.setItem(
        'hrpro:dtrLogs',
        JSON.stringify(
          logs
        )
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

    /*
     * Set a payroll date + batch name.
     */

    const payrollDate =
      page.getByLabel(
        'Payroll date',
        {
          exact:
            true,
        }
      );

    await expect(
      payrollDate
    ).toBeVisible();

    await payrollDate.fill(
      '2026-10-05'
    );

    const batchName =
      page.getByLabel(
        /^Batch name/
      );

    await batchName.fill(
      'SET097_HRPRO_Overtime'
    );

    const search =
      page.getByLabel(
        'Search',
        {
          exact:
            true,
        }
      );

    await search.fill(
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

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_101-102 — TIMESHEET WITH OVERTIME'
    );

    console.log(
      '============================================'
    );

    console.log(
      '\nEMPLOYEE ROW:'
    );

    console.log(
      (
        await employeeRow.innerText()
      )
        .replace(
          /\s+/g,
          ' '
        )
        .trim()
    );

    const employeeCheckbox =
      employeeRow.locator(
        'input[type="checkbox"]'
      );

    await employeeCheckbox.check();

    await expect(
      employeeCheckbox
    ).toBeChecked();

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
     * REVIEW DETAILS
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

    console.log(
      '\nREVIEW EMPLOYEE ROW:'
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

    await reviewRow.click();

    await page.waitForTimeout(
      250
    );

    const reviewText =
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
      '\nREVIEW DETAILS:'
    );

    console.log(
      reviewText.slice(
        0,
        12000
      )
    );

    /*
     * =====================================================
     * SET_103-105
     * APPROVALS > OVERTIME
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

    const overtimeButton =
      page.getByRole(
        'button',
        {
          name:
            'Overtime',
          exact:
            true,
        }
      );

    await expect(
      overtimeButton
    ).toBeVisible();

    await overtimeButton.click();

    await page.waitForTimeout(
      250
    );

    const approvalSnapshot =
      await page.evaluate(() => {
        const clean = (
          value:
            string | null
        ) =>
          (
            value ?? ''
          )
            .replace(
              /\s+/g,
              ' '
            )
            .trim();

        return {
          buttons:
            Array.from(
              document.querySelectorAll(
                'button'
              )
            )
              .map(
                element => ({
                  text:
                    clean(
                      element.textContent
                    ),

                  disabled:
                    (
                      element as
                        HTMLButtonElement
                    ).disabled,
                })
              )
              .filter(
                item =>
                  item.text
              ),

          text:
            clean(
              document.body.innerText
            ).slice(
              0,
              12000
            ),
        };
      });

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_103-105 — APPROVALS > OVERTIME'
    );

    console.log(
      '============================================'
    );

    console.log(
      '\nBUTTONS:'
    );

    console.log(
      approvalSnapshot.buttons
    );

    console.log(
      '\nPAGE TEXT:'
    );

    console.log(
      approvalSnapshot.text
    );

    const approvalStorage =
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
      '\nAPPROVAL STORAGE:'
    );

    console.log(
      JSON.stringify(
        approvalStorage,
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
     * We are looking for:
     * - overtime calculated from the attendance record,
     * - pending/unapproved status in HR PRO,
     * - Approvals > Overtime showing the record,
     * - an Approve action being available.
     *
     * SET_106-108 will be tested after this output
     * confirms how the pending record is represented.
     */
  }
);
