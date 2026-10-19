# HR PRO QA Automation — Team Handoff & Live Demonstration

**Working branch:** `qa/setup-handoff-2026-10-19`  
**Repository:** https://github.com/nitsuwa/hr-pro-automation  
**Application under test:** https://hrproprototype.netlify.app  
**Framework:** Playwright + TypeScript  
**Last updated:** 19 October 2026

> Purpose: enable the next QA maintainer to install, execute, understand, and extend the tests **without the OJT developers being present**. This is a reproducible testing framework, **not** a claim that all 59 Excel Setup scenarios or the separate HR GO workflow have been automated.

## 1. What is automated?

The `tests/regression/setup/` folder contains Setup-oriented regression tests with assertions. The framework uses:

| Component | Location | Purpose |
| --- | --- | --- |
| Playwright test runner | `playwright.config.ts` | Base URL, Chromium, timeouts, traces, reports |
| Regression scripts | `tests/regression/setup/` | Repeatable assertions of expected HR PRO behavior |
| Reusable page objects | `playwright/pages/` | Screens and controls shared across tests |
| Login fixture | `playwright/fixtures/hrpro.fixture.ts` | Consistent demo-account sign-in via `loginAs()` |
| Demo accounts | `playwright/data/demo-accounts.ts` | Non-production demo role definitions |
| Inspection scripts | `tests/infrastructure/` | UI discovery aids; **not acceptance tests** |
| Run evidence | `docs/QA_EXECUTION_LOG.md` | What was executed, passed, failed, or blocked |
| Workbook audit | `docs/SETUP_FULL_WORKBOOK_AUDIT.md` | Known scenario mappings and missing coverage |

**As of the latest QA operator report:** 44 distinct regression checks were observed passing **across separate focused UI Mode runs**. Two reproducible negative checks still fail on the prototype: duplicate Job Positions (SET_195, [issue #2](https://github.com/nitsuwa/hr-pro-automation/issues/2)) and duplicate Work Locations (SET_211, [issue #3](https://github.com/nitsuwa/hr-pro-automation/issues/3)). These are not the same as 44 of 59 Excel groups fully accepted. A combined end-to-end Setup suite has **not yet** been established as passing; do not invent a suite pass rate.

## 2. Install on a new Windows computer

Required: Git, Node.js, access to the GitHub repository, and a connection to the approved **prototype/test** environment.

1. Open PowerShell (or the VS Code Terminal).
2. Clone and open the project:

```powershell
git clone https://github.com/nitsuwa/hr-pro-automation.git
cd hr-pro-automation
git fetch origin
git switch --track origin/qa/setup-handoff-2026-10-19
```

If the local QA branch already exists, use `git switch qa/setup-handoff-2026-10-19` instead. **Do not overwrite local edits**; first check `git status`.

3. Install packages and browser:

```powershell
npm ci
npx playwright install chromium
```

4. Check files: `package.json`, `playwright.config.ts`, `tests/regression/setup/`, `playwright/pages/`.

**Important:** Do not run destructive Setup tests against a live company or production dataset. The default app URL is a prototype, but `E2E_ENV` alone is not a security barrier; always confirm the actual URL and approved environment. Many scripts create QA data, and some modify shared Settings. Browser contexts isolate storage sessions but **do not guarantee rollback of shared server-side records**.

## 3. Everyday workflow: use Playwright UI Mode

```powershell
npm run test:ui:setup
```

Playwright opens a test tree. Expand a file, select a specific test, and click the **triangle Run icon**. The interface shows each step, the browser preview, the failing assertion (if any), and the source line.

Other commands:

```powershell
npm run test:ui:smoke
npm run test:ui
npm run test:setup
npm run test:report
```

- `test:ui:setup`: Setup tests in visual interactive UI Mode — **recommended for demonstration**.
- `test:ui:smoke`: quick login/navigation demonstration.
- `test:ui`: the broader tree, which includes exploratory scripts. Avoid using its overall count as an acceptance metric.
- `test:setup`: command-line execution, useful for recorded baseline runs; can include known defects.
- `test:report`: opens the most recent generated HTML report when present.

To run a **single test** from PowerShell without UI Mode:

```powershell
npx playwright test tests/regression/setup/catalog-duplicates.spec.ts --grep "SET-JOBPOS-002" --project=chromium
```

The duplicate check above is intentionally expected to **fail** on the current prototype until the product is fixed.

## 4. How to update the QA branch safely

In VS Code, close the UI runner before pulling changes:

```powershell
git branch --show-current
git status
git fetch origin
git merge --ff-only origin/qa/setup-handoff-2026-10-19
```

Expected branch: `qa/setup-handoff-2026-10-19`. If `git status` shows uncommitted changes, **stop and inspect before updating**. Avoid `reset --hard`, force-push, and deleting files. If `git pull --ff-only` says “Cannot fast-forward to multiple branches,” use the explicit `git fetch` + `git merge --ff-only origin/<branch>` shown above.

## 5. How to convert an Excel Setup scenario into a Playwright test

The **Setup workbook** has 59 scenario groups spanning `SET_001`–`SET_278`. The group (for example `SET_170`) is the unit of coverage; rows under a group may describe multiple steps and expected results.

1. Pick an **uncovered group** and read its exact steps, prerequisites, and expected outcome.
2. Confirm the UI controls in the prototype. Prefer `getByRole`, `getByLabel`, and `getByPlaceholder`, rather than brittle CSS or hard-coded dates.
3. Create `tests/regression/setup/<feature>.spec.ts` or extend the appropriate file. Use the `hrpro.fixture.ts` fixture and existing page objects.
4. Arrange unique, fictional QA data, not real employees.
5. Act through the actual workflow. Verify **saved business state after reopening/reloading**, not merely a click or toast.
6. Where practical, clean up only the QA record the test created. Never delete a company default or seeded employee.
7. Run only this test in UI Mode, investigate failures, and record the result in `docs/QA_EXECUTION_LOG.md`.
8. Update the workbook mapping, identifying whether the scenario is **full**, **partial**, **blocked**, or **not implemented**.

Example test skeleton (illustrative; do not count as executed coverage):

```ts
import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';

test('SET-EXAMPLE | example persistence check', async ({ page, loginAs }) => {
  await loginAs('systemAdmin');
  await page.goto('/settings');

  // Arrange unique QA-only test data, navigate to the correct Setup section,
  // and interact using actual accessible roles/labels.

  // await page.getByRole('button', { name: 'Save Changes' }).click();
  // await page.reload();
  // await expect(page.getByRole('...')).toHaveText(expected);
});
```

The example is intentionally incomplete; **replace placeholders with actual inspected controls** and test the intended workbook result.

### HR GO: how the next team can add their own process

Do **not** interpret HR GO as already automated. The maintainer can apply the same method: collect HR GO's verified workflow, assign scenario IDs, add a dedicated folder (e.g. `tests/regression/hr-go/`), create a page object, implement business assertions, and run it in UI Mode. Separate HR GO smoke and regression tests from the HR PRO Setup workbook so coverage numbers remain accurate.

## 6. How to tell an application bug from a broken test

A failure is **not automatically a product defect**.

| What happened | Likely class | Next action |
| --- | --- | --- |
| Locator cannot find an on-screen button due to spacing or renamed text | Test automation | Inspect Playwright accessibility snapshot; correct the locator |
| Test uses a hardcoded previous date not shown in the UI | Test data/assumption | Select an actual row/date; keep business expectation |
| UI saved two matching records when only one is allowed | Potential/confirmed product bug | Reproduce using a fresh QA name; retain failing assertion |
| Session, network, or environment cannot load | Environment/blocked | Capture URL, access, trace and rerun when resolved |
| Feature missing or Excel instructions contradictory | Requirement ambiguity | Mark partial/blocked, seek product-owner clarification |

**Known defects (retain their failing assertions):**
- [Issue #2 — duplicate Job Positions](https://github.com/nitsuwa/hr-pro-automation/issues/2) (`SET_195`).
- [Issue #3 — duplicate Work Locations](https://github.com/nitsuwa/hr-pro-automation/issues/3) (`SET_211`).

Record a failure's test ID, expected/actual, reproduction steps, environment, screenshot/trace, and whether it is a **test issue**, **application defect**, or **blocked**.

## 7. Suggested 10–15 minute handoff presentation

| Timing | What to show | Suggested explanation |
| --- | --- | --- |
| 0–2 min | Repository and folder structure | “This is an extendable Playwright framework, not just a collection of screenshots.” |
| 2–4 min | How to install and open UI Mode | “QA staff can run a selected case without memorizing CLI options.” |
| 4–7 min | One proven passing Setup test | “The script asserts the saved outcome after reopening.” |
| 7–9 min | One of the existing duplicate defect tests | “A red test can be valuable evidence, not necessarily a broken automation.” |
| 9–12 min | Existing test source + how to add a new scenario | “Reuse the login fixture and page objects, map the Excel expected result, then run.” |
| 12–15 min | Known gaps and the run evidence log | “This is what is verified, partial, blocked and still needs work.” |

**Before demonstrating**, run selected tests once on the authorized prototype and ensure test data and login work. Avoid promising a live run will be green; the two duplicate-defect cases should still fail until fixed. Use `SET-LOANS-EDIT` or `SET-LOCATION-EDIT` for a passing demonstration, and `SET-JOBPOS-002` to illustrate defect detection. Each run creates QA test data; use approved environments only.

## 8. What remains and how the next team continues

The workbook includes business outcomes beyond Setup field persistence, including statutory contribution arithmetic, overtime, LILO external evidence, filing approvals, and payroll segregation of duties. Many of these still have exploratory scripts or partial tests only. The Leave/Holiday wording and some other workbook rows contain copied instructions; do not “fix” expected results silently.

Before release of the handoff:
- Reconcile every one of the **59 groups** to executable coverage and actual expected results.
- Run the Setup suite as one controlled baseline and log the **real** pass/fail/skipped counts.
- Review shared-state interactions and restore mutable Settings where possible.
- Export available Playwright report/trace evidence and attach it to a dated execution log.
- Confirm open defects and known limitations with the team lead.

The primary promise of this handoff is **repeatable test authoring and execution**. New QA staff can add HR PRO or HR GO scenarios by following these steps without having to rebuild the framework.

---
**Ownership after OJT:** repository maintainers / QA team. Update this guide when scripts, branch names, prerequisites, or demo flows change.
