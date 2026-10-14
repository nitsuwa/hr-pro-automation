import {
  test,
  expect,
} from '../../playwright/fixtures/hrpro.fixture';

import { SettingsPage } from '../../playwright/pages/settings.page';

test(
  'TEMP | SET_106-108 | Verify unapproved OT is unpaid, then approved OT is paid',
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
     * SETUP — OVERTIME IS APPROVED INSIDE HR PRO
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

    /*
     * =====================================================
     * CREATE CONTROLLED OVERTIME
     * Juan Dela Cruz — Sep 16 — 8:00 AM to 7:00 PM
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
        'SET106_108_OT_Payroll'
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

    const timesheetRow =
      page
        .locator('tr')
        .filter({
          hasText:
            'Juan Dela Cruz',
        });

    await expect(
      timesheetRow
    ).toBeVisible();

    await timesheetRow
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

    /*
     * =====================================================
     * SET_106
     * PROCESS PAYROLL WITHOUT APPROVING OT
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
    ).toBeVisible();

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_106 — BEFORE OT APPROVAL'
    );

    console.log(
      '============================================'
    );

    console.log(
      '\nREVIEW ROW:'
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

    await page
      .getByRole(
        'button',
        {
          name:
            'Submit for payroll value check →',
          exact:
            true,
        }
      )
      .click();

    const submitModalButton =
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
      submitModalButton
    ).toBeVisible();

    await submitModalButton.click();

    /*
     * After confirming submission, HR PRO may either:
     * 1) stay on Review and show "Go to Payroll Value →", or
     * 2) navigate directly to Smart Pay.
     *
     * Support both flows so this is not a locator-only failure.
     */

    await page.waitForTimeout(
      250
    );

    console.log(
      '\nURL AFTER REVIEW SUBMIT:'
    );

    console.log(
      page.url()
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

    const smartPayRowButton =
      page.getByRole(
        'button',
        {
          name:
            /Juan Dela Cruz/,
        }
      );

    await expect(
      smartPayRowButton
    ).toBeVisible();

    await smartPayRowButton.click();

    const beforeApprovalText =
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
      '\nSMART PAY BEFORE OT APPROVAL:'
    );

    console.log(
      beforeApprovalText.slice(
        0,
        12000
      )
    );

    /*
     * =====================================================
     * SET_107
     * APPROVE THE SEP 16 OT RECORD
     * =====================================================
     */

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

    const otRow =
      page.getByRole(
        'row',
        {
          name:
            /Juan Dela Cruz Sep 16 2\.00 Approve Reject/i,
        }
      );

    await expect(
      otRow
    ).toBeVisible();

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_107 — APPROVING OT'
    );

    console.log(
      '============================================'
    );

    console.log(
      '\nPENDING OT ROW:'
    );

    console.log(
      (
        await otRow.innerText()
      )
        .replace(
          /\s+/g,
          ' '
        )
        .trim()
    );

    await otRow
      .getByRole(
        'button',
        {
          name:
            'Approve',
          exact:
            true,
        }
      )
      .click();

    await page.waitForTimeout(
      250
    );

    const approvalStorage =
      await page.evaluate(
        () =>
          localStorage.getItem(
            'hrpro:otApprovals'
          )
      );

    console.log(
      '\nOT APPROVAL STORAGE AFTER APPROVE:'
    );

    console.log(
      approvalStorage
    );

    /*
     * =====================================================
     * SET_108
     * REPROCESS / REGENERATE PAYROLL
     * =====================================================
     *
     * First check whether Smart Pay recomputes immediately
     * from the newly approved OT.
     */

    await page.goto(
      '/payroll-value',
      {
        waitUntil:
          'domcontentloaded',
      }
    );

    const smartPayRowAfter =
      page.getByRole(
        'button',
        {
          name:
            /Juan Dela Cruz/,
        }
      );

    await expect(
      smartPayRowAfter
    ).toBeVisible();

    await smartPayRowAfter.click();

    let afterApprovalText =
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
      'SET_108 — SMART PAY AFTER OT APPROVAL'
    );

    console.log(
      '============================================'
    );

    console.log(
      '\nSMART PAY AFTER APPROVAL:'
    );

    console.log(
      afterApprovalText.slice(
        0,
        12000
      )
    );

    /*
     * If the payroll page still looks stale, use the UI's
     * Recall to Review path and submit it again.
     */

    const hasPaidOvertime =
      /Overtime/i.test(
        afterApprovalText
      ) &&
      !/UNFILED OVERTIME — DETECTED, NOT PAID/i.test(
        afterApprovalText
      );

    if (
      !hasPaidOvertime
    ) {
      const recall =
        page.getByRole(
          'button',
          {
            name:
              '← Recall to Review',
            exact:
              true,
          }
        );

      if (
        await recall.count()
      ) {
        await recall.click();

        await page.waitForTimeout(
          150
        );

        const dialog =
          page.getByRole(
            'dialog'
          );

        if (
          await dialog.count()
        ) {
          const dialogButtons =
            await dialog
              .getByRole(
                'button'
              )
              .allTextContents();

          console.log(
            '\nRECALL DIALOG BUTTONS:'
          );

          console.log(
            dialogButtons
          );

          const confirmRecall =
            dialog
              .getByRole(
                'button'
              )
              .filter({
                hasText:
                  /Recall|Return|Confirm|Yes/i,
              })
              .first();

          if (
            await confirmRecall.count()
          ) {
            await confirmRecall.click();
          }
        }

        await page.goto(
          '/time-attendance',
          {
            waitUntil:
              'domcontentloaded',
          }
        );

        const submitAgain =
          page.getByRole(
            'button',
            {
              name:
                'Submit for payroll value check →',
              exact:
                true,
            }
          );

        if (
          await submitAgain.count()
        ) {
          await submitAgain.click();

          const confirmSubmit =
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
            await confirmSubmit.count()
          ) {
            await confirmSubmit.click();
          }
        }

        await page.goto(
          '/payroll-value',
          {
            waitUntil:
              'domcontentloaded',
          }
        );

        const rowAfterRecall =
          page.getByRole(
            'button',
            {
              name:
                /Juan Dela Cruz/,
            }
          );

        if (
          await rowAfterRecall.count()
        ) {
          await rowAfterRecall.click();
        }

        afterApprovalText =
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
          '\nSMART PAY AFTER RECALL + REPROCESS:'
        );

        console.log(
          afterApprovalText.slice(
            0,
            12000
          )
        );
      }
    }

    console.log(
      '\n============================================\n'
    );

    /*
     * Inspection only.
     *
     * SET_106 expected:
     * unapproved OT is recorded but not paid.
     *
     * SET_107 expected:
     * OT approval succeeds.
     *
     * SET_108 expected:
     * approved OT appears in payroll and is paid.
     */
  }
);
