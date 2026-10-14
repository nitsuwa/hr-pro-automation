import {
  test,
} from '../../playwright/fixtures/hrpro.fixture';

test(
  'TEMP | Inspect Timesheet cutoff calendar behavior',
  async ({
    page,
    loginAs,
  }) => {
    await loginAs('systemAdmin');

    await page.goto('/timesheet', {
      waitUntil: 'domcontentloaded',
    });

    const readCutoff =
      async () => {
        return await page.evaluate(() => {
          const raw =
            localStorage.getItem(
              'hrpro:cutoff'
            );

          return raw
            ? JSON.parse(raw)
            : null;
        });
      };

    const inspectDateButton =
      async (
        dateName: string
      ) => {
        const button =
          page.getByRole(
            'button',
            {
              name: dateName,
              exact: true,
            }
          );

        return {
          ariaPressed:
            await button.getAttribute(
              'aria-pressed'
            ),

          ariaSelected:
            await button.getAttribute(
              'aria-selected'
            ),

          disabled:
            await button.isDisabled(),

          className:
            await button.getAttribute(
              'class'
            ),
        };
      };

    console.log(
      '\n========== INITIAL CUTOFF =========='
    );

    console.log(
      await readCutoff()
    );

    /*
     * Click September 1 only.
     */
    const september1 =
      page.getByRole(
        'button',
        {
          name:
            'September 1, 2026',
          exact: true,
        }
      );

    await september1.click();

    await page.waitForTimeout(
      300
    );

    console.log(
      '\n========== AFTER CLICKING SEPTEMBER 1 =========='
    );

    console.log(
      'CUTOFF:',
      await readCutoff()
    );

    console.log(
      'SEPTEMBER 1 BUTTON:',
      await inspectDateButton(
        'September 1, 2026'
      )
    );

    /*
     * Inspect buttons after selecting Sep 1.
     * We want to see if Apply / Confirm /
     * Select / Use buttons appear.
     */
    const buttonsAfterFirstClick =
      await page
        .locator(
          'button:visible'
        )
        .evaluateAll(
          (elements) =>
            elements
              .map(
                (element) => ({
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

                  ariaLabel:
                    element.getAttribute(
                      'aria-label'
                    ),

                  title:
                    element.getAttribute(
                      'title'
                    ),

                  disabled:
                    (
                      element as HTMLButtonElement
                    ).disabled,
                })
              )
              .filter(
                (button) =>
                  /select|selected|apply|confirm|use|save|cut.?off/i
                    .test(
                      `${button.text} ${button.ariaLabel ?? ''} ${button.title ?? ''}`
                    )
              )
        );

    console.log(
      '\nRELEVANT BUTTONS AFTER SEPTEMBER 1:'
    );

    console.log(
      JSON.stringify(
        buttonsAfterFirstClick,
        null,
        2
      )
    );

    /*
     * Now click September 7.
     */
    const september7 =
      page.getByRole(
        'button',
        {
          name:
            'September 7, 2026',
          exact: true,
        }
      );

    await september7.click();

    await page.waitForTimeout(
      300
    );

    console.log(
      '\n========== AFTER CLICKING SEPTEMBER 7 =========='
    );

    console.log(
      'CUTOFF:',
      await readCutoff()
    );

    console.log(
      'SEPTEMBER 1 BUTTON:',
      await inspectDateButton(
        'September 1, 2026'
      )
    );

    console.log(
      'SEPTEMBER 7 BUTTON:',
      await inspectDateButton(
        'September 7, 2026'
      )
    );

    const buttonsAfterSecondClick =
      await page
        .locator(
          'button:visible'
        )
        .evaluateAll(
          (elements) =>
            elements
              .map(
                (element) => ({
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

                  ariaLabel:
                    element.getAttribute(
                      'aria-label'
                    ),

                  title:
                    element.getAttribute(
                      'title'
                    ),

                  disabled:
                    (
                      element as HTMLButtonElement
                    ).disabled,
                })
              )
              .filter(
                (button) =>
                  /select|selected|apply|confirm|use|save|cut.?off/i
                    .test(
                      `${button.text} ${button.ariaLabel ?? ''} ${button.title ?? ''}`
                    )
              )
        );

    console.log(
      '\nRELEVANT BUTTONS AFTER SEPTEMBER 7:'
    );

    console.log(
      JSON.stringify(
        buttonsAfterSecondClick,
        null,
        2
      )
    );

    console.log(
      '\n========== CURRENT TIMESHEET TEXT =========='
    );

    const mainText =
      await page
        .locator('main')
        .innerText();

    console.log(
      mainText
        .replace(
          /\n{3,}/g,
          '\n\n'
        )
        .slice(
          0,
          6000
        )
    );
  }
);