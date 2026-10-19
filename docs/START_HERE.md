# HR PRO QA — Start Here

A short user guide for **running and extending the Playwright automation project**.

> For the full branded, offline help-center website and the four-page Word manual, use the files supplied at handoff. This page remains a simple, readable GitHub reference.

## 1. Install (Windows / VS Code)

You need **Git, Node.js, Visual Studio Code, repository access**, and an approved HR PRO *test* environment.

Open **Terminal → New Terminal**, then run:

```powershell
git clone https://github.com/nitsuwa/hr-pro-automation.git
cd hr-pro-automation
git fetch origin
git switch --track origin/qa/setup-handoff-2026-10-19
npm ci
npx playwright install chromium
```

If the QA branch already exists locally, use `git switch qa/setup-handoff-2026-10-19` instead of `--track`.

**Safety:** Setup tests can create, edit or delete records. Confirm the actual configured URL and run only with approved fictional QA data, never real employee/payroll data.

## 2. Run tests in Playwright UI Mode

```powershell
npm run test:ui:setup
```

Expand a test file in the left pane, select **one** test, and click **▶ Run**. Use **Actions**, browser preview, and **Errors** to inspect the result.

Other useful commands:

| Command | Purpose |
| --- | --- |
| `npm run test:ui:smoke` | Visual login/navigation checks |
| `npm run test:setup` | Setup regression suite in terminal |
| `npm run test:report` | Most recent Playwright HTML report |
| `npx playwright test --grep "SET-LOANS-002" --project=chromium` | One specific named scenario |

**Green** means that check passed. **Red** needs investigation and does not automatically mean an application bug.

## 3. If a test fails

1. Read the failing assertion, especially **Expected** and **Received**.
2. Inspect the trace/preview: did a locator change, was data missing, or did HR PRO save the wrong result?
3. Fix only incorrect automation/data assumptions. If actual behavior violates an accepted requirement, preserve the failing assertion and report the defect.
4. Record the test ID and evidence in [QA Execution Log](QA_EXECUTION_LOG.md).

## 4. Add a test

1. Pick one requirement from the Excel workbook. Identify the **expected result**, not only the click steps.
2. Inspect the real UI in the approved test environment.
3. Reuse an existing script in `tests/regression/setup/`, a page object from `playwright/pages/`, and the shared fixture `playwright/fixtures/hrpro.fixture.ts`.
4. Write browser actions **and** `expect(...)` assertions. For saved data, verify persistence after reopening.
5. Run only that new scenario in UI Mode and record its result.

Example of a **training-only navigation test**:

```ts
import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';

test('QA-START | Settings is available to Admin', async ({ page, loginAs }) => {
  await loginAs('systemAdmin');
  await page.goto('/settings');
  await expect(page.getByRole('button', { name: 'Organization Setup' })).toBeVisible();
});
```

This example is not itself full Excel acceptance coverage.

## 5. Keep your copy current

Close Playwright UI Mode, review any local edits, then update your QA branch:

```powershell
git status
git fetch origin
git merge --ff-only origin/qa/setup-handoff-2026-10-19
```

Do not force-reset uncommitted work. Ask the repository maintainer about review/merge permissions.

## 6. Where to find things

| Path | Use |
| --- | --- |
| `tests/regression/setup/` | Permanent Setup tests |
| `tests/smoke/` | Basic login/navigation |
| `tests/infrastructure/` | Inspection probes, **not** acceptance tests |
| `playwright/pages/` | Reusable screen actions |
| `playwright/fixtures/` | Shared login/setup |
| `playwright.config.ts` | URL, Chromium, reports, traces |

**Latest verified combined Setup run (19 Oct 2026): 50 checks executed, 47 passed, 3 failed.** Two failures are confirmed duplicate-validation defects (GitHub Issues #2 and #3); the Leave Type label issue (#4) is pending a requirement decision. This is **not** the percentage of original Excel scenarios fully covered.

Detailed scenario mapping remains in [Coverage Tracker](SETUP_CURRENT_COVERAGE_TRACKER.md), **not this everyday user guide**.
