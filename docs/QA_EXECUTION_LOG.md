# QA Execution Evidence Log

This file distinguishes scripts that exist from scripts that have been executed and verified.

## 2026-10-19 — First local Playwright UI Mode run

- **Operator**: OJT QA tester using VS Code / Windows PowerShell
- **Repository**: `nitsuwa/hr-pro-automation`
- **Target**: HR PRO browser app configured by local Playwright settings
- **Suite**: `tests/regression/setup/`, before adding the new `filing-approvals.spec.ts` candidate
- **Result**: **11 passed / 0 failed**, across **3 test files**
- **Evidence**: User-provided Playwright UI Mode screenshot in the project conversation
- **Smoke suite**: User separately reported all tests passed; counts and screenshot not independently reviewed
- **Meaning**: Existing tests' assertions passed at that run. **Not** evidence that all Excel expected outcomes or all 59 scenario groups are covered.

## Pending re-test

- `tests/regression/setup/filing-approvals.spec.ts` was added after this successful run.
- Status: **NOT RUN / NOT VERIFIED**; verify with UI Mode.
- Checks: policy setting persistence + leave approval request instead of direct DTR override.
- Overtime and timekeeping approval flow remain out of scope for this one file.

## Evidence rules

Record every full or focused run here with its date, scenario ID, pass/fail/blocked classification and short defect reproduction steps. Do not count an inspection script that prints console logs without business assertions as a passing regression case.

## 2026-10-19 — Filing & Approvals first run

- **SET-FILING-001**: PASS (checkbox configuration persists).
- **SET-FILING-002**: FAIL — automation fixture/date assumption; selector looked for `Sep 16 Wed`, while the Review screen displayed `Oct 16–31`. The test stopped before the leave submission, so this is **not evidence of an HR PRO functional defect**.
- Evidence: UI Mode screenshot and Playwright accessibility snapshot supplied by tester.
- Fix prepared on QA branch: select an actual editable absence row from the displayed DTR.
- **Retest needed**: run only `SET-FILING-002` after fetching QA branch updates. Examine any subsequent failure independently.

## 2026-10-19 — Filing & Approvals corrected re-run

- **SET-FILING-001**: PASS (3.3s, screenshot).
- **SET-FILING-002**: PASS (5.4s, screenshot) after changing the date locator to use an available editable attendance row.
- Scope note: 2/2 in this *focused run*; the original 11/11 Setup run was separate. End-to-end overtime and timekeeping approval workflows are still incomplete.
- Classification of original SET-FILING-002 failure: test automation hardcoded-date assumption; not a confirmed product defect.

## 2026-10-19 — Catalog and Company Profile focused run

- **SET-LOANS-001**: PASS (3.5s, screenshot).
- **SET-JOBPOS-001**: PASS (4.1s, screenshot).
- **SET-LOCATION-001**: PASS (3.6s, screenshot).
- **SET-COMPANY-001**: PASS (9.5s, screenshot; separate listed green result).
- UI screenshot shows 3/3 (catalog suite selected) and separately green Company profile test.
- Running totals *across separate focused runs*: initial 11 + filing approvals 2 + catalog/company 4 = **17 distinct tests observed passing**. This is **not** an assertion that all 17 passed simultaneously in one full run, nor that 17 complete Excel scenarios are covered.
- Remaining scope: loan duplicate/edit/remove; position/location duplicate/edit/remove; Company profile other required fields/logo; all other missing test groups.

## 2026-10-19 — Department and employee enrollment

- **SET-DEPT-001 (SET_177–181)**: PASS (Playwright UI Mode green check, screenshot provided).
- **SET-ENROLL-001 (SET_263–265)**: PASS (4.9s, UI Mode screenshot).
- **Running observed distinct-pass count: 19 across focused runs**, not one full suite execution.
- Follow-up: capture more detailed modal forms; `setup-dialog-inventory.json` was shared and validated by the user.

## 2026-10-19 — Holiday/Leave/Allowance and employee-user first runs

- **SET-LEAVE-001 / SET_222–226**: **PASS**, UI screenshot (4.8s).
- **SET-HOLIDAY-001 / SET_214–218**: **FAIL (automation)** — `getByLabel('Type')` could not find an existing `combobox "Type"` on the Add Holiday form. Corrected to `getByRole('combobox', { name: 'Type', exact: true })`.
- **SET-ALLOW-001 / SET_244–249**: **FAIL (automation)** — `getByLabel('Tax treatment')` could not find an existing `combobox "Tax treatment"`. Corrected to the appropriate role selector.
- **SET-USER-001 / SET_271–274**: **FAIL (automation)** — the script called `EmployeesPage.openEnrollment()` while still on Settings; the `+ Enroll Employee` button was not present. Corrected to navigate through `EmployeesPage.open()` first.
- **Retest needed** for all three corrected tests; these failures did not reach the business assertions, so none establishes a confirmed HR PRO product defect.
- Across focused runs, the observed distinct passing test count is now **20**, including the new leave creation PASS; the other three do not count yet.
