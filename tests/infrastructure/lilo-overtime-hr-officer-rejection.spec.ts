import {
  test,
  expect,
} from '../../playwright/fixtures/hrpro.fixture';

import { SettingsPage } from '../../playwright/pages/settings.page';

test(
  'TEMP | SET_111 | Verify HR Officer can reject LILO-approved overtime',
  async ({
    page,
    loginAs,
  }) => {
    test.setTimeout(
      150_000
    );

    /*
     * =====================================================
     * SYSTEM ADMIN — SET UP LILO-APPROVED OVERTIME
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
        'SET111_HR_Officer_Reject'
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
     * Accept both detected OT records as hours already
     * approved in LILO.
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

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_111 — BEFORE ROLE SWITCH'
    );

    console.log(
      '============================================'
    );

    console.log(
      '\nSEP 17:'
    );

    console.log(
      (
        await page
          .getByRole(
            'row',
            {
              name:
                /^Sep 17/,
            }
          )
          .innerText()
      )
        .replace(
          /\s+/g,
          ' '
        )
        .trim()
    );

    /*
     * =====================================================
     * SWITCH TO HR OFFICER
     * =====================================================
     *
     * The UI tooltip says an approved OT assigned to
     * Pedro Reyes can be disapproved by the assigned
     * approver OR an HR Officer.
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

    /*
     * First try the documented LILO-preapproved path:
     * Approvals > Overtime should expose rejection.
     */

    const approvals =
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
      approvals
    ).toBeVisible();

    await approvals.click();

    const overtime =
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
      overtime
    ).toBeVisible();

    await overtime.click();

    await page.waitForTimeout(
      200
    );

    const approvalPageText =
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
      'HR OFFICER — APPROVALS > OVERTIME'
    );

    console.log(
      '============================================'
    );

    console.log(
      approvalPageText.slice(
        0,
        12000
      )
    );

    const sep17ApprovalRow =
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

    let rejected =
      false;

    if (
      await sep17ApprovalRow.count()
    ) {
      console.log(
        '\nSEP 17 APPROVAL ROW:'
      );

      console.log(
        (
          await sep17ApprovalRow.innerText()
        )
          .replace(
            /\s+/g,
            ' '
          )
          .trim()
      );

      const reject =
        sep17ApprovalRow
          .getByRole(
            'button'
          )
          .filter({
            hasText:
              /Reject|Disapprove/i,
          })
          .first();

      if (
        await reject.count()
      ) {
        await reject.click();

        rejected =
          true;
      }
    }

    /*
     * Fallback:
     * if the action is not in the Approvals inbox,
     * inspect the daily row while logged in as HR Officer.
     */

    if (
      !rejected
    ) {
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

      const controls =
        await hrSep17
          .locator(
            'button, input, select'
          )
          .evaluateAll(
            elements =>
              elements.map(
                element => ({
                  tag:
                    element.tagName,

                  text:
                    (
                      element.textContent ??
                      ''
                    )
                      .replace(
                        /\s+/g,
                        ' '
                      )
                      .trim(),

                  title:
                    element.getAttribute(
                      'title'
                    ),

                  ariaLabel:
                    element.getAttribute(
                      'aria-label'
                    ),

                  className:
                    element.getAttribute(
                      'class'
                    ),
                })
              )
          );

      console.log(
        '\nHR OFFICER — SEP 17 DAILY ROW:'
      );

      console.log(
        (
          await hrSep17.innerText()
        )
          .replace(
            /\s+/g,
            ' '
          )
          .trim()
      );

      console.log(
        '\nROW CONTROLS:'
      );

      console.log(
        JSON.stringify(
          controls,
          null,
          2
        )
      );

      /*
       * In the daily DTR row, the authorized rejection
       * control is an icon button whose visible text is
       * like "1.00 ✕". Its title explains the action:
       * "Approved in LILO — click ✕ to disapprove this day".
       */
      const reject =
        hrSep17
          .locator(
            'button.ot-day-btn'
          )
          .filter({
            has:
              page.locator(
                '[title*="disapprove this day"]'
              ),
          });

      const rejectByTitle =
        hrSep17.locator(
          'button[title*="disapprove this day"]'
        );

      if (
        await rejectByTitle.count()
      ) {
        await rejectByTitle.click();

        rejected =
          true;
      } else if (
        await reject.count()
      ) {
        await reject.click();

        rejected =
          true;
      }

      await page.waitForTimeout(
        250
      );

      console.log(
        '\nSEP 17 AFTER DISAPPROVE ACTION:'
      );

      console.log(
        (
          await hrSep17.innerText()
        )
          .replace(
            /\s+/g,
            ' '
          )
          .trim()
      );
    }

    await page.waitForTimeout(
      250
    );

    const storage =
      await page.evaluate(
        () => ({
          otApprovals:
            localStorage.getItem(
              'hrpro:otApprovals'
            ),

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
      'SET_111 — AFTER HR OFFICER ACTION'
    );

    console.log(
      '============================================'
    );

    console.log(
      '\nREJECTION ACTION FOUND:'
    );

    console.log(
      rejected
    );

    console.log(
      '\nSTORAGE:'
    );

    console.log(
      JSON.stringify(
        storage,
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
     * If REJECTION ACTION FOUND = true and the row/storage
     * reflects the rejected decision, SET_111 can be closed.
     */
  }
);
