import {
  test,
} from '../../playwright/fixtures/hrpro.fixture';

test(
  'TEMP | Inspect current Timesheet controls',
  async ({
    page,
    loginAs,
  }) => {
    await loginAs('systemAdmin');

    await page.goto('/timesheet', {
      waitUntil: 'domcontentloaded',
    });

    console.log(
      '\n========== TIMESHEET CONTROL INSPECTION =========='
    );

    console.log(
      '\nCURRENT URL:'
    );

    console.log(
      page.url()
    );

    /*
     * Inspect every visible input.
     */
    const inputs =
      await page
        .locator('input:visible')
        .evaluateAll(
          (elements) =>
            elements.map(
              (element) => {
                const input =
                  element as HTMLInputElement;

                const labels =
                  input.labels
                    ? Array.from(
                        input.labels
                      ).map(
                        (label) =>
                          (
                            label.textContent ??
                            ''
                          )
                            .replace(
                              /\s+/g,
                              ' '
                            )
                            .trim()
                      )
                    : [];

                return {
                  type:
                    input.type,

                  name:
                    input.name,

                  id:
                    input.id,

                  value:
                    input.value,

                  placeholder:
                    input.placeholder,

                  ariaLabel:
                    input.getAttribute(
                      'aria-label'
                    ),

                  labels,
                };
              }
            )
        );

    console.log(
      '\nVISIBLE INPUTS:'
    );

    console.log(
      JSON.stringify(
        inputs,
        null,
        2
      )
    );

    /*
     * Inspect visible select/dropdown controls.
     */
    const selects =
      await page
        .locator('select:visible')
        .evaluateAll(
          (elements) =>
            elements.map(
              (element) => {
                const select =
                  element as HTMLSelectElement;

                const labels =
                  select.labels
                    ? Array.from(
                        select.labels
                      ).map(
                        (label) =>
                          (
                            label.textContent ??
                            ''
                          )
                            .replace(
                              /\s+/g,
                              ' '
                            )
                            .trim()
                      )
                    : [];

                return {
                  name:
                    select.name,

                  id:
                    select.id,

                  value:
                    select.value,

                  ariaLabel:
                    select.getAttribute(
                      'aria-label'
                    ),

                  labels,
                };
              }
            )
        );

    console.log(
      '\nVISIBLE SELECTS:'
    );

    console.log(
      JSON.stringify(
        selects,
        null,
        2
      )
    );

    /*
     * Inspect visible buttons.
     */
    const buttons =
      await page
        .locator('button:visible')
        .evaluateAll(
          (elements) =>
            elements.map(
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
              }))
        );

    console.log(
      '\nVISIBLE BUTTONS:'
    );

    console.log(
      JSON.stringify(
        buttons,
        null,
        2
      )
    );

    /*
     * Print useful Timesheet text too.
     */
    const pageText =
      await page
        .locator('main')
        .innerText();

    console.log(
      '\nTIMESHEET PAGE TEXT:'
    );

    console.log(
      pageText
        .replace(
          /\n{3,}/g,
          '\n\n'
        )
        .slice(
          0,
          10000
        )
    );

    console.log(
      '\n===============================================\n'
    );
  }
);