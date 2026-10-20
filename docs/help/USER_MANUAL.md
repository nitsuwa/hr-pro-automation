# HR PRO QA · Simple User Manual

*A beginner-friendly guide to running tests, checking results, and continuing the project.*

## 1. Understand the three parts

**HR PRO** is the application being tested. **Playwright** is the tool that opens a browser, performs actions, and checks expected results. **GitHub** stores the test scripts so the next QA employee can use and improve them.

- **HTML Help Center:** Visual instructions with screenshots; open [`index.html`](index.html) locally in Chrome/Edge after downloading the repository. Keep the `assets` folder with it.
- **Word file:** An offline/printable copy in the handoff ZIP.
- **This GitHub repository:** The actual tests, record of changes, results and reported problems. It is private; request access first.

**Main workflow:** Read a requirement → inspect HR PRO → write a test → run it → check the real result → share the change.

## 2. Set up on your computer

**Before starting:** Have Visual Studio Code, Node.js, Git, approved HR PRO test access, and private GitHub repository access.

Open **Visual Studio Code → Terminal → New Terminal** and run:

```powershell
git clone https://github.com/nitsuwa/hr-pro-automation.git
cd hr-pro-automation
git fetch origin
git switch --track origin/qa/setup-handoff-2026-10-19
npm ci
npx playwright install chromium
```

If you already have that branch locally, run `git switch qa/setup-handoff-2026-10-19` instead of the `--track` command.

**Important:** Ask which test environment is approved. Check `playwright.config.ts` and `E2E_BASE_URL` before running anything. The default URL is the HR PRO prototype. Some tests save, change or remove data, so **never use real employee information or an unapproved production environment**.

## 3. Run an existing test

1. In the terminal, enter `npm run test:ui:setup`.
2. In the Playwright window, expand a file in the left panel.
3. Choose **one** test and click **▶ Run**.
4. After it finishes, select the test and inspect **Actions**, the screen preview, and **Errors** (if any).

**Green = the script's assertions passed. Red = investigate.** It does not automatically mean HR PRO is broken.

Other useful commands: `npm run test:ui:smoke` (basic checks), `npm run test:setup` (Setup tests without UI Mode), `npm run test:report` (latest available HTML report).

## 4. Check if the test really passed

A test is only useful if it checks the **right result**. A green check alone is not proof that the full Excel requirement is complete.

1. **Expected:** What does the approved Excel scenario say should happen?
2. **Script:** Find `expect(...)` in the code. Does it check that result, or merely that a button can be clicked?
3. **Actual:** Look at Playwright's Actions and screen preview. If a record was saved or changed, reopen/reload the page and check that it stayed correct.
4. **Decision:** Mark **PASS** when the needed outcome is verified; **TEST ISSUE** when a locator or setup is wrong; **APP DEFECT** when HR PRO violates an accepted requirement; **PARTIAL/BLOCKED** when evidence or requirements are missing.
5. **Evidence:** Record the test ID, date, environment, expected/actual results, screenshots or trace, and issue link in [QA Execution Log](../QA_EXECUTION_LOG.md).

**Example:** For duplicate Job Positions, a rule may say only one matching record is allowed. If the application saves two, a test expecting `toHaveCount(1)` should stay **red**. Changing it to `toHaveCount(2)` would hide the problem.

**AI can suggest code, but a human must check the requirement, inspect the app, and run the test.**

## 5. Create your first test

1. Pick **one** approved workbook scenario with clear expected behavior.
2. Try its steps manually in the approved HR PRO environment. Notice the actual buttons, fields, and confirmation messages.
3. Look for a similar test inside [`tests/regression/setup/`](../../tests/regression/setup/) so you can reuse working login and navigation patterns.
4. If needed, create a file named `<feature>.spec.ts` in that folder. Reuse helpers from `playwright/pages/` and `playwright/fixtures/`.
5. Add assertions for the outcome, not only clicks. Run that test alone in UI Mode, check its result, and record evidence.

**Tiny training example** (checks navigation only, not a complete workbook scenario):

```ts
import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';

test('QA-START | Organization Setup is available', async ({ page, loginAs }) => {
  await loginAs('systemAdmin');
  await page.goto('/settings');
  await expect(page.getByRole('button', {
    name: 'Organization Setup', exact: true,
  })).toBeVisible();
});
```

**A real example to study:** `tests/regression/setup/catalog-duplicates.spec.ts` → `SET-LOANS-002`. It verifies that a second duplicate Loan Source was not saved. The workbook also asks for a visible error message; that extra behavior is **not yet asserted**, so do not claim full coverage.

## 6. Share a test through GitHub

**GitHub words made simple:** A *branch* is your safe copy of the code. A *commit* is a saved set of changes. A *pull request (PR)* asks another team member to review before merging.

After the maintainer confirms the destination branch:

1. Start from an updated, clean QA branch (`git status` should show no uncommitted work).
2. Create **your own branch**: `git switch -c qa/my-test-change` (use a descriptive, unique name).
3. Edit the test and run it. **Do not commit passwords, real employee data, or unnecessary screenshots.**
4. Review files with `git status` and `git diff`, then save your changes:
   ```powershell
   git add tests/regression/setup/<feature>.spec.ts
   git commit -m "test: cover <scenario ID>"
   git push -u origin qa/my-test-change
   ```
5. On GitHub, select **Compare & pull request**. Choose the **QA branch or other branch agreed by your team** as the target. Explain what changed, which test you ran, the outcome, and any limitations.
6. Ask a reviewer to approve and merge. Then update the execution log and coverage records as needed.

If you do not have push permission, ask the maintainer for the approved contribution process. Never reset or overwrite someone else's changes to make Git work.

## 7. If something goes wrong

| What you see | What to check |
| --- | --- |
| Element not found | Wrong page, changed button/field name, missing dialog |
| Test times out | Disabled button, overlay, missing prerequisite data |
| Green but workbook still incomplete | Test assertions cover only part of the requirement |
| Test fails with unexpected saved data | Recheck the actual HR PRO behavior and approved rule |
| Git refuses your update | Check branch and `git status`; ask before overwriting files |

To get changes when your branch is clean, use `git fetch origin` followed by `git merge --ff-only origin/qa/setup-handoff-2026-10-19` from the matching QA branch.

## 8. What happens after handoff?

The next QA maintainer should: **run a known passing example; inspect one known failure; select a missing or partial requirement; extend a script; verify it; document it; submit it for review.**

Keep the everyday manual short. Detailed test mapping belongs in the [coverage tracker](../SETUP_CURRENT_COVERAGE_TRACKER.md); execution evidence belongs in the [log](../QA_EXECUTION_LOG.md); reproducible product problems belong in [GitHub Issues](https://github.com/nitsuwa/hr-pro-automation/issues).

**Last reported full Setup run (19 October 2026): 50 checks executed, 47 passed, 3 failed** (two confirmed duplicate-validation defects; one Leave Type uniqueness question). That is the result of implemented checks—not proof that all 59 workbook groups are complete. HR GO remains future work.
