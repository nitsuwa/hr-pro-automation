# HR PRO QA Automation — User Manual

**Purpose:** Help a new QA employee install the Playwright framework, run tests, verify results independently, add new scripts, and maintain the repository.

**Read it in the browser:** [HTML Help Center](index.html) — download the HTML and open it in Chrome/Edge (GitHub does not render the HTML as a website).  
**Offline copy:** `HR_PRO_QA_Automation_Manual.docx` — supplied in the team handoff package.  
**Source of truth:** [GitHub repository](../../README.md) — actual tests, configuration, issues, run history, and scenario gaps.

> The HTML Help Center is the interactive learning experience. The Word file is an editable offline/printable version. GitHub contains the working system and its current evidence. These are **three connected ways to use one project**, not three different instructions.

## 1. Install the project

**You need:** Git, Node.js, Visual Studio Code, private repository access, and an approved *non-production* HR PRO test environment.

In Visual Studio Code select **Terminal → New Terminal**, then run:

```powershell
git clone https://github.com/nitsuwa/hr-pro-automation.git
cd hr-pro-automation
git fetch origin
git switch --track origin/qa/setup-handoff-2026-10-19
npm ci
npx playwright install chromium
```

Already have the branch? Use `git switch qa/setup-handoff-2026-10-19` instead of `--track`.

**Safety check:** Read `playwright.config.ts`. It currently defaults to `https://hrproprototype.netlify.app`, but `E2E_BASE_URL` can override it. Do not assume `E2E_ENV=staging` guarantees a safe target. Get approval for the actual test URL and use only fictional QA data. Some tests create, modify or delete persistent records.

## 2. Run a test

Run:

```powershell
npm run test:ui:setup
```

In Playwright UI Mode: expand a file → select **one** test → click **▶ Run** → inspect **Actions**, **Preview**, **Errors**, and the timeline.

| Command | Purpose |
|---|---|
| `npm run test:ui:smoke` | Open basic navigation/smoke tests |
| `npm run test:setup` | Run Setup regression checks from the terminal |
| `npm run test:report` | Open the latest available HTML report |
| `npx playwright test --grep "SET-LOANS-002" --project=chromium` | Run one named test in the terminal |

The HTML Help Center includes an annotated Playwright UI Mode guide. A **green** check means that the implemented assertions passed—not necessarily that every related Excel requirement was covered.

## 3. How to verify the result *without trusting AI*

1. **Read the expected result** from the approved workbook or requirement. Specify what the application should save, reject, display or calculate.
2. **Read the script's assertions.** Find `expect(...)` and ask whether it checks the **actual business outcome**, not just a button click.
3. **Inspect the real app** via Playwright Actions, preview, and (for failures) retained trace/screenshot/video. After changing records, revisit or reload the page to verify persistence.
4. **Classify the outcome:** PASS = accepted requirement genuinely checked; AUTOMATION ISSUE = locator/data/setup failure; APPLICATION DEFECT = accepted rule violated; BLOCKED/PARTIAL = evidence or requirements missing.
5. **Document the evidence** in `docs/QA_EXECUTION_LOG.md`: test ID, date, approved environment, expected versus actual, supporting trace/screenshots and issue link.

**Example:** A successful `Save` click is not proof that data persisted. A script that reopens the page and asserts `toHaveCount(1)` for a uniquely named record provides much stronger evidence.

**Never change correct assertions to make a test look green.** If the application violates a confirmed duplicate-prevention rule, keep the failing assertion and file an issue.

## 4. Create or extend a test

1. Choose one scenario ID; identify prerequisites and expected business behavior. Ask for clarification if the Excel steps conflict.
2. Try the scenario **manually in the approved QA environment**. Inspect the actual accessible labels, dialogs, roles, and saved outcome.
3. Reuse a matching script from `tests/regression/setup/`, shared fixtures from `playwright/fixtures/`, and page objects in `playwright/pages/`.
4. Create `tests/regression/setup/<feature>.spec.ts` or extend an existing file. Add **actions and assertions**, not just clicks.
5. Run the new test alone in UI Mode; check its assertion and persisted outcome. Record the result.

Starter illustration:

```ts
import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';

test('QA-START | Organization Setup visible', async ({ page, loginAs }) => {
  await loginAs('systemAdmin');
  await page.goto('/settings');
  await expect(page.getByRole('button', {
    name: 'Organization Setup', exact: true
  })).toBeVisible();
});
```

This teaches the syntax; it does **not** prove a full workbook scenario. For a real example, inspect `SET-LOANS-002` in `tests/regression/setup/catalog-duplicates.spec.ts`. It verifies a duplicate Loan Source was not saved. The workbook also asks for a visible error message; **that separate result is not yet asserted**, so the requirement remains partially verified.

## 5. How to use AI responsibly

AI can draft scripts, explain failures, suggest reusable code, and help write documentation. **AI cannot certify that a scenario passed.** Before accepting any generated script:

- Check requirements and preconditions against the approved Excel scenario.
- Confirm the proposed selectors and UI flow against the *real application*.
- Inspect assertions for the intended saved/rejected/calculated outcome.
- Reject guessed labels, arbitrary timeouts, forced clicks, blanket skips, and weakened expectations intended to make a test pass.
- Run the test yourself, review Playwright evidence, and record actual results.

Useful request to an AI assistant:

> “Using this specific Excel scenario and the real current UI, propose the smallest Playwright test using our existing fixtures/page objects. Separate verified observations from assumptions. Include meaningful assertions. Do not claim the code passed; I will run and validate it.”

## 6. Troubleshoot failures

| Symptom | Check first |
|---|---|
| Locator not found | Correct page, role and accessible name; unexpected dialog or changed UI |
| Element click times out | Overlay, modal confirmation, disabled element or incomplete prerequisite |
| Saved result not found | Test-data scope, persistence, timing, and actual workflow |
| Wrong duplicate count | Inspect if the app genuinely accepted duplicates; preserve correct negative assertion |
| Report unavailable | Run a Playwright terminal test, then `npm run test:report` |

Do not rerun data-mutating suites repeatedly without checking persistent QA data and cleanup permissions.

## 7. Update and maintain the project

Close UI Mode, confirm the current branch and working tree, then update:

```powershell
git branch --show-current
git status
git fetch origin
git merge --ff-only origin/qa/setup-handoff-2026-10-19
```

If there are uncommitted changes, do not reset or overwrite them to force a merge. Ask the maintainer for the proper review workflow.

| Path | Purpose |
|---|---|
| `tests/regression/setup/` | Permanent Setup regression tests |
| `tests/infrastructure/` | Investigation scripts; not automatically acceptance tests |
| `playwright/pages/` | Reusable page objects |
| `playwright/fixtures/` | Shared login/test setup |
| `playwright.config.ts` | Base URL, browser, traces and reports |
| [QA Execution Log](../QA_EXECUTION_LOG.md) | Historical run evidence |
| [Coverage Tracker](../SETUP_CURRENT_COVERAGE_TRACKER.md) | Incomplete scenario details, separated from this beginner guide |
| [GitHub Issues](https://github.com/nitsuwa/hr-pro-automation/issues) | Confirmed defects and questions |

## 8. Current verification snapshot

**19 October 2026, operator-reported combined Chromium Setup run:** **50 automated checks executed, 47 passed, 3 failed**. Two failures are confirmed duplicate-validation application defects (Job Positions and Work Locations); the duplicate Leave Type label result needs a uniqueness decision. These are results of **implemented checks**, not proof that all 59 original Excel scenario groups are fully accepted.

HR GO tests have not been completed. The Playwright framework can be extended after its requirements and test data are confirmed.

## 9. Handoff checklist

- [ ] Repository and approved QA environment access granted
- [ ] New QA member can run one known passing test and inspect one failing trace
- [ ] New QA member can explain which requirement an assertion verifies
- [ ] New QA member can create one test with meaningful assertions, not only clicks
- [ ] New QA member knows where to file evidence, bugs and incomplete acceptance work

**Help center:** [index.html](index.html). For the complete offline Word manual and accompanying screenshots, use the delivered handoff ZIP.
