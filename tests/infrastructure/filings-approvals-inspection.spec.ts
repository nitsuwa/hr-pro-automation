import {
  test,
  expect,
} from '../../playwright/fixtures/hrpro.fixture';

import { SettingsPage } from '../../playwright/pages/settings.page';

test(
  'TEMP | SET_083-087 | Inspect Filings & approvals workflow settings',
  async ({
    page,
    loginAs,
  }) => {
    test.setTimeout(
      90_000
    );

    /*
     * =====================================================
     * SET_083
     * LOGIN WITH ORGANIZATIONAL SETUP ACCESS
     * =====================================================
     */

    await loginAs(
      'systemAdmin'
    );

    const settings =
      new SettingsPage(page);

    /*
     * =====================================================
     * SET_084-086
     * ORGANIZATIONAL SETUP → GENERAL →
     * FILING & APPROVALS
     * =====================================================
     */

    await settings.openGeneral();

    await expect(
      page.getByRole(
        'heading',
        {
          name:
            'Filings & approvals',
          exact:
            true,
        }
      )
    ).toBeVisible();

    /*
     * =====================================================
     * SET_087
     * REQUIRE FILING + APPROVAL FOR:
     *
     * - Overtime
     * - Timekeeping Adjustments
     * - Leave
     *
     * Excel expectation:
     * these should use filing/approval workflows
     * instead of allowing direct manual DTR editing.
     * =====================================================
     */

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

    await expect(
      overtime
    ).toBeVisible();

    await expect(
      timekeepingAdjustments
    ).toBeVisible();

    await expect(
      leave
    ).toBeVisible();

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
      overtime
    ).toBeChecked();

    await expect(
      timekeepingAdjustments
    ).toBeChecked();

    await expect(
      leave
    ).toBeChecked();

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_083-087 — FILINGS & APPROVALS INSPECTION'
    );

    console.log(
      '============================================'
    );

    console.log(
      '\nSETTING STATES:'
    );

    console.log({
      overtime:
        await overtime.isChecked(),

      timekeepingAdjustments:
        await timekeepingAdjustments
          .isChecked(),

      leave:
        await leave.isChecked(),
    });

    /*
     * Inspect storage only to discover
     * how HR PRO records these settings.
     *
     * We are NOT adding a persistence
     * requirement that does not exist
     * in the Excel.
     */

    const relevantStorage =
      await page.evaluate(() => {
        const result:
          Record<
            string,
            string | null
          > = {};

        for (
          let i = 0;
          i < localStorage.length;
          i++
        ) {
          const key =
            localStorage.key(i);

          if (!key) {
            continue;
          }

          if (
            /fil|approv|overtime|leave|timekeep/i
              .test(key)
          ) {
            result[key] =
              localStorage.getItem(
                key
              );
          }
        }

        return result;
      });

    console.log(
      '\nRELEVANT STORAGE:'
    );

    console.log(
      JSON.stringify(
        relevantStorage,
        null,
        2
      )
    );

    /*
     * =====================================================
     * INSPECT REVIEW / APPROVALS AREA
     * =====================================================
     *
     * We now inspect the actual Review page so
     * we can see how the enabled settings change
     * the available workflow.
     */

    await page.goto(
      '/time-attendance',
      {
        waitUntil:
          'domcontentloaded',
      }
    );

    const reviewInspection =
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
          headings:
            Array.from(
              document.querySelectorAll(
                'h1, h2, h3'
              )
            )
              .map(
                element =>
                  clean(
                    element.textContent
                  )
              )
              .filter(
                Boolean
              ),

          buttons:
            Array.from(
              document.querySelectorAll(
                'button'
              )
            )
              .map(
                element =>
                  clean(
                    element.textContent
                  )
              )
              .filter(
                Boolean
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
      '\nREVIEW HEADINGS:'
    );

    console.log(
      reviewInspection.headings
    );

    console.log(
      '\nREVIEW BUTTONS:'
    );

    console.log(
      reviewInspection.buttons
    );

    console.log(
      '\nREVIEW PAGE TEXT:'
    );

    console.log(
      reviewInspection.text
    );

    console.log(
      '\n============================================\n'
    );

    /*
     * Inspection only.
     *
     * The three settings being checked is proven.
     * The next step is to use this output to verify
     * whether the app truly routes Overtime,
     * Timekeeping Adjustments and Leave through
     * approval workflows instead of direct DTR edits.
     */
  }
);
