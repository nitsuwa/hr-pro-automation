# HR PRO QA · User Manual

**What is this?** HR PRO is the system we test. Playwright runs browser checks. GitHub stores the tests so future QA employees can reuse and improve them.

**The learning path:** **Set up → Run → Verify → Add a test → Share it.** Start with one passing test rather than running everything.

| Resource | Why you would use it |
| --- | --- |
| [Official HTML Help Center](https://gleaming-muffin-23e8b0.netlify.app) | Public-facing beginner guide; open online, or open `docs/help/index.html` locally after cloning |
| [GitHub repository](../../README.md) | Actual scripts, changes, reported problems and results |

The Help Center is live at https://gleaming-muffin-23e8b0.netlify.app. The GitHub repository remains **private** and requires authorized access. The website describes how to use the QA system; the repository holds its source code.

## 1. First-time setup

Install **VS Code, Git and Node.js**, then get access to the GitHub repository and approved HR PRO test environment.

In VS Code choose **Terminal → New Terminal** and run:

```powershell
git clone https://github.com/nitsuwa/hr-pro-automation.git
cd hr-pro-automation
git switch main
git pull --ff-only origin main
npm ci
npx playwright install chromium
```

For an existing local clone, check `git status` first; if the working tree is clean, update with `git switch main`, `git fetch origin`, and `git merge --ff-only origin/main`.

**Check the test environment first:** `playwright.config.ts` defaults to the HR PRO prototype, while `E2E_BASE_URL` can change the target. Only run data-changing tests on an **approved non-production environment** with fictional records.

## 2. Run one test

Run `npm run test:ui:setup` in the VS Code terminal. In Playwright UI Mode, expand one test file → click **▶ Run** beside one test → review the **Actions**, preview and **Errors** tabs.

Green means the script's checks passed. Red means **investigate**—it could be incorrect test code, missing data, unclear requirements or an application defect.

Other commands: `npm run test:ui:smoke` (basic navigation), `npm run test:report` (latest available report).

## 3. Verify what really happened

A green check **does not prove every Excel requirement is complete**. Before marking PASS:

1. **Read the expected result** in the approved Excel scenario.
2. **Find `expect(...)`** in the test. Does it actually check that expected behavior?
3. **Inspect HR PRO** in the Actions/preview. For saved data, reopen or reload to check it stayed saved.
4. **Decide:** PASS (requirement checked), TEST ISSUE (wrong locator/data), APP DEFECT (approved rule violated), or PARTIAL/BLOCKED (not enough evidence).
5. **Record the result** in [Execution Log](../QA_EXECUTION_LOG.md): test ID, environment/date, expected versus actual, trace/screenshot, and issue link.

If duplicates are prohibited but two were saved, **keep the correct red assertion**. Do not change the expected count just to turn the test green. AI can suggest code, but a human must inspect and run it.

## 4. Add a new test

1. Pick **one** clear workbook scenario and confirm its expected outcome.
2. Try it manually in the approved HR PRO test environment.
3. Find a similar script in [Setup tests](../../tests/regression/setup/).
4. Reuse login helpers and page objects; create `tests/regression/setup/<feature>.spec.ts` or extend an existing file.
5. Include actions **and** `expect(...)` assertions. Run the test alone, verify the result, and record evidence.

Starter example (**navigation only, not full workbook coverage**):

```ts
import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';

test('QA-START | Settings available', async ({ page, loginAs }) => {
  await loginAs('systemAdmin');
  await page.goto('/settings');
  await expect(page.getByRole('button', {
    name: 'Organization Setup', exact: true
  })).toBeVisible();
});
```

A real test to study: `SET-LOANS-002` in `catalog-duplicates.spec.ts`. It checks that no duplicate Loan Source is saved, but the separate visible-message requirement is still not explicitly asserted.

## 5. Test a feature that isn't in Excel

**The old 59 workbook groups are not the limit.** For any brand-new HR PRO feature, start from a feature ticket, user story, or approved acceptance checklist.

1. **Ask the owner:** What should happen, who may use it, what should be rejected, and what fictional test data is allowed?
2. **Make a small plan:** Test a successful action, an invalid case, role permissions, and saved-result persistence where applicable. Give each case a clear ID such as `FEAT-SEARCH-001`.
3. **Inspect the app:** Try it manually in the authorized QA environment. Confirm actual labels, dialogs, and outcomes. Do not make up selectors.
4. **Write or ask AI for a draft:** Reuse the Playwright fixture and page objects. Require meaningful `expect(...)` assertions and clear notes about unknowns.
5. **Verify yourself:** Run in UI Mode, inspect the recorded actions and outcomes, reopen saved records, and classify PASS / TEST ISSUE / APP DEFECT / BLOCKED.
6. **Share it:** Record evidence and send a pull request for review. Group new tests by feature so the repository stays manageable.

**Good AI prompt to copy:**

> I need to test a new HR PRO feature, not listed in the old workbook. The approved requirement is [describe], with authorized role [role] and fictional test data [data]. First propose a short positive/negative/permission/persistence test plan. Then draft one small Playwright TypeScript test using our existing fixtures and page objects, based only on real UI evidence I provide. Mark assumptions and missing selectors clearly. Do not invent requirements or claim it passed; I will review and run it myself.

**Never send AI passwords, tokens, real employee records or confidential internal data.** If expected behavior is unclear, ask the feature owner before treating AI-generated checks as acceptance criteria.

## 6. Share a test through GitHub

**Branch** = your safe copy. **Commit** = save your changes. **Pull request (PR)** = ask the team to review before merging.

Start from an up-to-date `main` with a clean `git status`. Ask the maintainer which branch should receive your work. Then:

```powershell
git switch main
git fetch origin
git merge --ff-only origin/main
git switch -c qa/check-employee-search
# Edit and verify your own test, then:
git add tests/regression/setup/employee-search.spec.ts
git commit -m "test: cover employee search"
git push -u origin qa/check-employee-search
```

Replace the example file and branch names with your actual work. On GitHub, click **Compare & pull request**, choose the agreed target branch, explain what you tested, and ask for review. Never commit passwords, real employee data, or unrelated changes.

## 7. When you need help

| Problem | Next step |
| --- | --- |
| Button or field not found | Inspect the current page and actual label |
| Click blocked / timeout | Check for dialog, overlay, permissions or missing data |
| Test green but workbook still unclear | Mark partial and ask for expected outcome |
| Git refuses update | Check branch and `git status`; don't reset a teammate's changes |

**After the OJT:** run a known passing test, study one failing trace, pick an incomplete scenario from the [coverage tracker](../SETUP_CURRENT_COVERAGE_TRACKER.md), add a verified test, record evidence, and submit a PR.

**Reported combined Setup run (19 Oct 2026): 50 checks, 47 passed, 3 failed** (two confirmed duplicate-validation defects; one Leave Type uniqueness question). This is not certification of all 59 workbook groups.
